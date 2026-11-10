from contextlib import contextmanager
from pathlib import Path
import json
import sqlite3
import tempfile
import unittest
from unittest.mock import MagicMock, patch

from yiyi_sync.__main__ import main, run
from yiyi_sync.client import ClientError
from yiyi_sync.outbox import Outbox
from yiyi_sync.runtime import AlreadyRunning, single_run


@contextmanager
def tunnel(_settings):
    yield "http://127.0.0.1:12345"


class SyncRunnerTests(unittest.TestCase):
    def setUp(self):
        self.directory = tempfile.TemporaryDirectory()
        self.addCleanup(self.directory.cleanup)
        self.settings = {
            "source": {"persona_state": "unused"},
            "state_db": Path(self.directory.name) / "outbox.sqlite3",
            "destination": {
                "base_url": "http://127.0.0.1:12345",
                "username": "test",
                "session_id": "fixed",
                "persona_id": "default",
                "adapter_id": "qq",
            },
        }
        self.records = [
            {
                "source_id": "dsh-douyin:video:123",
                "content": "外部观察样例",
                "metadata": {
                    "source_url": "https://www.douyin.com/video/123",
                    "source_kind": "video_observation",
                },
            }
        ]
        self.client = MagicMock()
        self.client.readiness.return_value = {"ready": True}
        self.client.find_record.return_value = None
        self.client.import_record.return_value = {"imported_ids": [7]}
        self.client.verify_record.return_value = True
        for target, value in [
            ("collect_records", lambda *args: self.records),
            ("api_tunnel", tunnel),
            ("password_from", lambda _: "not-a-real-password"),
            ("LivingMemoryClient", lambda *args, **kwargs: self.client),
        ]:
            patcher = patch("yiyi_sync.__main__." + target, value)
            patcher.start()
            self.addCleanup(patcher.stop)

    def test_ack_only_after_verification_and_no_repeated_network_write(self):
        result = run(self.settings, "sync")
        self.assertEqual(result["verified_this_run"], 1)
        self.assertEqual(result["synced"], 1)
        self.client.reset_mock()
        result = run(self.settings, "sync")
        self.assertEqual(result["verified_this_run"], 0)
        self.client.login.assert_not_called()

    def test_timed_out_write_reconciles_without_reimport(self):
        self.client.find_record.side_effect = [None, 7]
        self.client.import_record.side_effect = [{}, ClientError("timeout")]
        result = run(self.settings, "sync")
        self.assertEqual(result["synced"], 1)
        self.assertEqual(self.client.import_record.call_count, 2)  # dry run + one write

    def test_failed_verification_stays_pending(self):
        self.client.verify_record.return_value = False
        result = run(self.settings, "sync")
        self.assertEqual(result["status"], "partial")
        self.assertEqual(result["pending"], 1)
        self.assertEqual(result["synced"], 0)

    def test_mismatched_receipt_stops_further_batch_writes(self):
        self.records.append({**self.records[0], "source_id": "dsh-douyin:video:456"})
        self.client.verify_record.return_value = False
        result = run(self.settings, "sync")
        self.assertEqual(result["pending"], 2)
        self.assertEqual(result["failed"], 1)
        self.assertEqual(self.client.import_record.call_count, 2)  # first dry run + write

    def test_unready_engine_blocks_writes(self):
        self.client.readiness.return_value = {"ready": False}
        with self.assertRaises(ClientError):
            run(self.settings, "sync")
        self.client.import_record.assert_not_called()
        self.assertEqual(Outbox(self.settings["state_db"]).summary()["pending"], 1)

    def test_destination_change_cannot_reuse_ack(self):
        run(self.settings, "sync")
        self.settings["destination"]["base_url"] = "http://127.0.0.1:54321"
        with self.assertRaises(ValueError):
            run(self.settings, "sync")

    def test_plan_has_no_database_or_network_side_effects(self):
        result = run(self.settings, "plan")
        self.assertFalse(result["writes_performed"])
        self.assertFalse(self.settings["state_db"].exists())
        self.client.login.assert_not_called()

    def test_single_run_lock_is_exclusive_and_released(self):
        path = Path(self.directory.name) / "lock"
        with single_run(path):
            with self.assertRaises(AlreadyRunning):
                with single_run(path):
                    self.fail("second lock should not succeed")
        with single_run(path):
            pass

    def test_database_failure_replaces_stale_success_report_without_error_details(self):
        config = Path(self.directory.name) / "config.json"
        report = Path(self.directory.name) / "report.json"
        settings = {**self.settings, "state_db": str(self.settings["state_db"])}
        config.write_text(json.dumps(settings), encoding="utf-8")
        report.write_text('{"status":"ok"}', encoding="utf-8")
        with (
            patch("sys.argv", ["sync", "--config", str(config), "--report", str(report), "sync"]),
            patch("yiyi_sync.__main__.run", side_effect=sqlite3.OperationalError("private detail")),
            patch("builtins.print"),
        ):
            self.assertEqual(main(), 1)
        data = json.loads(report.read_text(encoding="utf-8"))
        self.assertEqual(data["status"], "error")
        self.assertEqual(data["error_type"], "OperationalError")
        self.assertNotIn("private detail", report.read_text(encoding="utf-8"))

    def test_overlapping_run_preserves_the_existing_report(self):
        config = Path(self.directory.name) / "config.json"
        report = Path(self.directory.name) / "report.json"
        settings = {**self.settings, "state_db": str(self.settings["state_db"])}
        config.write_text(json.dumps(settings), encoding="utf-8")
        original = '{"status":"ok","verified_this_run":1}'
        report.write_text(original, encoding="utf-8")
        with (
            patch("sys.argv", ["sync", "--config", str(config), "--report", str(report), "sync"]),
            patch("yiyi_sync.__main__.run", side_effect=AlreadyRunning()),
            patch("builtins.print"),
        ):
            self.assertEqual(main(), 0)
        self.assertEqual(report.read_text(encoding="utf-8"), original)


if __name__ == "__main__":
    unittest.main()
