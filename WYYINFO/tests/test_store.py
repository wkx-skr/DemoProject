"""Persistence, isolation, and concurrency tests with real temporary databases."""

from concurrent.futures import ThreadPoolExecutor
from contextlib import closing
from pathlib import Path
import sqlite3
import tempfile
import unittest
from unittest.mock import patch

from yiyi.store import Store


class StoreTests(unittest.TestCase):
    def setUp(self):
        self.directory = tempfile.TemporaryDirectory()
        self.addCleanup(self.directory.cleanup)
        self.path = Path(self.directory.name) / "nested" / "yiyi.sqlite3"
        self.store = Store(self.path)

    def test_memories_persist_deduplicate_and_isolate_scopes(self):
        memory_id = self.store.add_memory("alice", "喜欢画画", "preference")
        self.assertEqual(memory_id, self.store.add_memory("alice", " 喜欢画画 ", "preference"))
        reopened = Store(self.path)
        self.assertEqual(reopened.list_memories("alice")[0]["text"], "喜欢画画")
        self.assertEqual(reopened.list_memories("bob"), [])
        self.assertFalse(reopened.forget_memory("bob", memory_id))
        self.assertTrue(reopened.forget_memory("alice", memory_id))
        self.assertFalse(reopened.forget_memory("alice", memory_id))
        self.assertEqual(reopened.list_memories("alice"), [])

    def test_distinct_memory_kinds_and_order(self):
        first = self.store.add_memory("alice", "月亮", "fact")
        second = self.store.add_memory("alice", "月亮", "episode")
        self.assertNotEqual(first, second)
        self.assertEqual(self.store.list_memories("alice", 1)[0]["id"], second)

    def test_sql_text_is_stored_as_data(self):
        scope = "scope'); DROP TABLE memories; --"
        value = "好奇心 ' \\ \n </system> DROP TABLE profiles; --"
        self.store.add_memory(scope, value)
        self.assertEqual(self.store.list_memories(scope)[0]["text"], value)
        self.assertEqual(self.store.status("other")["xp"], 0)

    def test_growth_persists_and_event_ids_are_isolated(self):
        day = "2026-11-10"
        first = self.store.record_activity("alice", "read", "msg1", day=day)
        self.assertEqual(first["xp"], 3)
        self.assertEqual(first["awarded"], 3)
        duplicate = Store(self.path).record_activity("alice", "read", "msg1", day=day)
        self.assertTrue(duplicate["duplicate"])
        self.assertEqual(duplicate["awarded"], 0)
        self.assertEqual(duplicate["xp"], 3)
        other = self.store.record_activity("bob", "read", "msg1", day=day)
        self.assertFalse(other["duplicate"])
        self.assertEqual(other["xp"], 3)

    def test_partial_award_cap_cross_day_and_out_of_order_day(self):
        day = "2026-11-10"
        self.store.record_activity("alice", "read", "1", day=day, points=10)
        capped = self.store.record_activity("alice", "reflect", "2", day=day, points=4)
        self.assertEqual(capped["awarded"], 2)
        self.assertEqual(capped["daily_xp"], 12)
        next_day = self.store.record_activity("alice", "read", "3", day="2026-11-11")
        self.assertEqual(next_day["daily_xp"], 3)
        self.assertEqual(next_day["xp"], 15)
        old_day = self.store.record_activity("alice", "read", "4", day=day)
        self.assertEqual(old_day["awarded"], 0)
        self.assertEqual(old_day["last_activity_day"], "2026-11-11")
        with patch("yiyi.store._today", return_value="2026-11-12"):
            status = self.store.status("alice")
            self.assertEqual(status["daily_xp"], 0)
            self.assertEqual(status["xp"], 15)

    def test_default_day_uses_china_date_helper(self):
        with patch("yiyi.store._today", return_value="2026-11-10"):
            result = self.store.record_activity("alice", "read", "1")
            self.assertEqual(result["last_activity_day"], "2026-11-10")
            self.assertEqual(self.store.status("alice")["daily_xp"], 3)

    def test_concurrent_unique_events_never_exceed_daily_cap(self):
        def write(index):
            return self.store.record_activity(
                "alice", "read", f"msg-{index}", day="2026-11-10", points=5
            )

        with ThreadPoolExecutor(max_workers=8) as executor:
            results = list(executor.map(write, range(24)))
        self.assertEqual(sum(item["awarded"] for item in results), 12)
        self.assertEqual(self.store.status("alice")["xp"], 12)

    def test_concurrent_duplicate_events_award_once(self):
        def write(_):
            return self.store.record_activity("alice", "read", "same-message")

        with ThreadPoolExecutor(max_workers=8) as executor:
            results = list(executor.map(write, range(24)))
        self.assertEqual(sum(item["awarded"] for item in results), 3)
        self.assertEqual(sum(not item["duplicate"] for item in results), 1)

    def test_replay_on_new_day_and_higher_cap_does_not_award_again(self):
        self.store.record_activity("alice", "read", "same", day="2026-11-10", daily_cap=0)
        replay = self.store.record_activity("alice", "read", "same", day="2026-11-11")
        self.assertEqual(replay["awarded"], 0)
        self.assertTrue(replay["duplicate"])
        self.assertEqual(replay["xp"], 0)

    def test_invalid_inputs_fail_before_mutation(self):
        for scope in ("", "   ", None, "x" * 513, "a\x00b"):
            with self.subTest(scope=scope), self.assertRaises(ValueError):
                self.store.status(scope)
        for value in ("", "  ", "x" * 501, None):
            with self.subTest(text=value), self.assertRaises(ValueError):
                self.store.add_memory("alice", value)
        for kind in ("unknown", None, []):
            with self.subTest(kind=kind), self.assertRaises(ValueError):
                self.store.add_memory("alice", "hello", kind)
        for limit in (0, 51, -1, True, "1"):
            with self.subTest(limit=limit), self.assertRaises(ValueError):
                self.store.list_memories("alice", limit)
        for memory_id in (0, -1, True, "1"):
            with self.subTest(id=memory_id), self.assertRaises(ValueError):
                self.store.forget_memory("alice", memory_id)
        for option in (
            {"points": -1},
            {"points": True},
            {"daily_cap": -1},
            {"day": "2026-02-30"},
            {"day": "20261110"},
            {"day": 1},
        ):
            with self.subTest(option=option), self.assertRaises(ValueError):
                self.store.record_activity("alice", "read", "event", **option)
        for activity, event_id in (("", "event"), ("read", ""), ("x" * 65, "event")):
            with self.subTest(activity=activity), self.assertRaises(ValueError):
                self.store.record_activity("alice", activity, event_id)
        self.assertEqual(self.store.status("alice")["xp"], 0)
        self.assertEqual(self.store.list_memories("alice"), [])

    def test_future_version_preserves_existing_data(self):
        self.store.add_memory("alice", "keep me")
        with closing(sqlite3.connect(self.path, isolation_level=None)) as connection:
            connection.execute("PRAGMA user_version = 99")
        with self.assertRaisesRegex(ValueError, "version 99"):
            Store(self.path)
        with closing(sqlite3.connect(self.path, isolation_level=None)) as connection:
            self.assertEqual(connection.execute("PRAGMA user_version").fetchone()[0], 99)
            self.assertEqual(
                connection.execute("SELECT text FROM memories").fetchone()[0], "keep me"
            )

    def test_unversioned_database_is_not_claimed(self):
        path = Path(self.directory.name) / "unrelated.sqlite3"
        with closing(sqlite3.connect(path, isolation_level=None)) as connection:
            connection.execute("CREATE TABLE unrelated (value TEXT)")
            connection.execute("INSERT INTO unrelated VALUES ('keep')")
        with self.assertRaisesRegex(ValueError, "unversioned"):
            Store(path)
        with closing(sqlite3.connect(path, isolation_level=None)) as connection:
            self.assertEqual(
                connection.execute("SELECT value FROM unrelated").fetchone()[0], "keep"
            )

    def test_in_memory_database_is_rejected(self):
        with self.assertRaises(ValueError):
            Store(":memory:")


if __name__ == "__main__":
    unittest.main()
