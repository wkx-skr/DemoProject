from contextlib import contextmanager
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import MagicMock, patch

from yiyi_attributes.panel import render_panel
from yiyi_attributes.store import AttributeStore
from yiyi_sync.__main__ import run
from yiyi_sync.outbox import _freeze


@contextmanager
def tunnel(_settings):
    yield "http://127.0.0.1:12345"


class AttributeIntegrationTests(unittest.TestCase):
    def setUp(self):
        self.directory = tempfile.TemporaryDirectory()
        self.addCleanup(self.directory.cleanup)
        root = Path(self.directory.name)
        self.settings = {
            "source": {"persona_state": str(root / "unused.json")},
            "state_db": root / "outbox.sqlite3",
            "attributes": {
                "enabled": True,
                "state_db": root / "attributes.sqlite3",
                "panel_path": root / "panel.html",
            },
            "destination": {
                "base_url": "http://127.0.0.1:12345",
                "username": "test",
                "session_id": "livingmemory:global",
                "persona_id": "default",
                "adapter_id": "qq",
            },
        }
        self.record = {
            "source_id": "dsh-douyin:reflection:test-topic",
            "content": '候选感想："想学习构图的方法"',
            "metadata": {
                "source_url": "https://www.douyin.com/video/123",
                "video_id": "123",
                "source_kind": "douyin_candidate_reflection",
                "observed_at": 1800000000000,
                "topic": "摄影构图",
                "interest_signal": "like",
            },
        }
        self.client = MagicMock()
        self.client.readiness.return_value = {"ready": True}
        self.client.find_record.return_value = None
        self.client.verify_record.return_value = True
        self.next_id = 10

        def import_record(_record, dry_run=False):
            if dry_run:
                return {}
            self.next_id += 1
            return {"imported_ids": [self.next_id]}

        self.client.import_record.side_effect = import_record
        for target, value in [
            ("collect_records", lambda *args: [self.record]),
            ("api_tunnel", tunnel),
            ("password_from", lambda _: "example"),
            ("LivingMemoryClient", lambda *args, **kwargs: self.client),
        ]:
            patcher = patch("yiyi_sync.__main__." + target, value)
            patcher.start()
            self.addCleanup(patcher.stop)

    def test_new_topic_creates_tag_panel_and_verified_cloud_record_once(self):
        result = run(self.settings, "sync")
        self.assertEqual(result["source_records"], 1)
        self.assertEqual(result["attribute_count"], 1)
        self.assertEqual(result["synced"], 2)
        html = self.settings["attributes"]["panel_path"].read_text(encoding="utf-8")
        self.assertIn("摄影构图", html)
        self.client.reset_mock()
        second = run(self.settings, "sync")
        self.assertEqual(second["attribute_observations_changed"], 0)
        self.assertEqual(second["enqueued"], 0)
        self.client.login.assert_not_called()

    def test_source_annotations_do_not_reimport_existing_reflections(self):
        original = json.loads(json.dumps(self.record))
        del original["metadata"]["topic"]
        del original["metadata"]["interest_signal"]
        self.assertEqual(_freeze(original), _freeze(self.record))

    def test_plan_does_not_create_attribute_state_or_panel(self):
        result = run(self.settings, "plan")
        self.assertFalse(result["writes_performed"])
        self.assertFalse(self.settings["attributes"]["state_db"].exists())
        self.assertFalse(self.settings["attributes"]["panel_path"].exists())

    def test_panel_write_failure_is_reported_without_blocking_memory_imports(self):
        with patch("yiyi_attributes.panel.write_panel", side_effect=OSError("private detail")):
            result = run(self.settings, "sync")
        self.assertEqual(result["status"], "partial")
        self.assertEqual(result["synced"], 2)
        self.assertEqual(result["panel_status"], "error")
        self.assertEqual(result["panel_error_type"], "OSError")
        self.assertNotIn("private detail", json.dumps(result))

    def test_attribute_database_cannot_be_the_sync_queue(self):
        self.settings["attributes"]["state_db"] = self.settings["state_db"]
        with self.assertRaises(ValueError):
            run(self.settings, "sync")
        self.client.login.assert_not_called()

    def test_panel_escapes_external_labels_summaries_and_assessments(self):
        store = AttributeStore(self.settings["attributes"]["state_db"])
        store.observe([{
            "kind": "skill", "label": "<script>alert(1)</script>",
            "source_id": "web:example", "evidence_key": "web:example",
            "source_url": "https://example.com/lesson", "observed_at": 1800000000000,
            "summary": '<img src=x onerror="alert(1)">', "source_type": "web",
            "assessment": {"value": 10, "scale_min": 0, "scale_max": 100,
                           "method": "<script>unsafe</script>"},
        }])
        output = render_panel(store.list_attributes())
        self.assertNotIn("<script>", output)
        self.assertNotIn("<img ", output)
        self.assertIn("&lt;script&gt;", output)
        self.assertIn("未经能力验证", output)


if __name__ == "__main__":
    unittest.main()
