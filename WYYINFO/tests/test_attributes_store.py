"""Candidate attributes retain independent evidence without inflating skills."""

from concurrent.futures import ThreadPoolExecutor
from contextlib import closing
from copy import deepcopy
from pathlib import Path
import sqlite3
import tempfile
import unittest

from yiyi_attributes import AttributeStore
from yiyi_attributes.store import APPLICATION_ID


class AttributeStoreTests(unittest.TestCase):
    def setUp(self):
        directory = tempfile.TemporaryDirectory()
        self.addCleanup(directory.cleanup)
        self.path = Path(directory.name) / "attributes.sqlite3"
        self.store = AttributeStore(self.path)
        self.event = {
            "kind": "interest",
            "label": "摄影构图",
            "source_id": "dsh-douyin:reflection:example",
            "evidence_key": "douyin:video:123",
            "source_url": "https://www.douyin.com/video/123",
            "observed_at": 1700000000000,
            "summary": "画面用前景树枝引导视线，想再比较其他构图。",
            "stance": "like",
            "source_type": "douyin",
        }

    def test_new_labels_require_no_schema_change_and_remain_candidates(self):
        other = {**self.event, "label": "苔藓微缩景观", "kind": "knowledge_topic"}
        self.assertEqual(self.store.observe([self.event, other]), 2)
        tags = self.store.list_attributes()
        self.assertEqual({tag["label"] for tag in tags}, {"摄影构图", "苔藓微缩景观"})
        self.assertTrue(all(tag["status"] == "candidate" for tag in tags))
        self.assertTrue(all(tag["assessment"] is None for tag in tags))
        with closing(sqlite3.connect(self.path)) as db:
            self.assertEqual(db.execute("PRAGMA user_version").fetchone()[0], 1)

    def test_repeat_is_idempotent_across_restart(self):
        self.assertEqual(self.store.observe([self.event, self.event]), 1)
        tag = self.store.list_attributes()[0]
        self.assertEqual(AttributeStore(self.path).observe([deepcopy(self.event)]), 0)
        self.assertEqual(tag["evidence_count"], 1)
        self.assertEqual(tag["like_count"], 1)
        self.assertEqual(len(self.store.history(tag["id"])), 1)

    def test_same_video_revision_updates_stance_without_inflating_evidence(self):
        self.store.observe([self.event])
        newer = {**self.event, "observed_at": self.event["observed_at"] + 1,
                 "stance": "dislike", "summary": "复看后觉得遮挡主体过多。"}
        self.assertEqual(self.store.observe([newer]), 1)
        tag = self.store.list_attributes()[0]
        self.assertEqual(tag["evidence_count"], 1)
        self.assertEqual((tag["like_count"], tag["dislike_count"]), (0, 1))
        history = self.store.history(tag["id"])
        self.assertEqual(len(history), 2)
        self.assertNotEqual(history[0]["version"], history[1]["version"])
        self.assertEqual(history[0]["payload"]["summary"], self.event["summary"])

    def test_independent_sources_accumulate_and_conflicting_opinions_remain_visible(self):
        web = {**self.event, "source_id": "web:article:1", "evidence_key": "web:article:1",
               "source_type": "web", "source_url": "https://example.com/composition",
               "stance": "neutral", "observed_at": self.event["observed_at"] + 10}
        self.assertEqual(self.store.observe([self.event, web]), 2)
        tag = self.store.list_attributes()[0]
        self.assertEqual(tag["evidence_count"], 2)
        self.assertEqual(tag["source_types"], ["douyin", "web"])
        self.assertEqual((tag["like_count"], tag["neutral_count"]), (1, 1))
        self.assertEqual(len(tag["source_urls"]), 2)
        self.assertNotIn("confidence", tag)
        self.assertNotIn("skill_score", tag)

    def test_older_unseen_and_known_versions_cannot_rollback_current(self):
        self.store.observe([self.event])
        newer = {**self.event, "observed_at": self.event["observed_at"] + 10, "summary": "新总结"}
        self.store.observe([newer])
        unknown_old = {**self.event, "observed_at": self.event["observed_at"] - 1,
                       "summary": "迟到的旧总结"}
        self.assertEqual(self.store.observe([unknown_old, self.event]), 0)
        tag = self.store.list_attributes()[0]
        self.assertEqual(tag["latest_summary"], "新总结")
        self.assertEqual(len(self.store.history(tag["id"])), 2)

    def test_same_time_conflict_rolls_back_whole_batch(self):
        self.store.observe([self.event])
        conflict = {**self.event, "summary": "同一时间存在另一份解释"}
        unrelated = {**self.event, "kind": "question", "label": "光圈为什么改变景深",
                     "observed_at": self.event["observed_at"] - 1}
        with self.assertRaisesRegex(ValueError, "same source time"):
            self.store.observe([unrelated, conflict])
        self.assertEqual(len(self.store.list_attributes()), 1)
        self.assertEqual(len(self.store.history(self.store.list_attributes()[0]["id"])), 1)

    def test_normalization_merges_case_width_and_whitespace(self):
        first = {**self.event, "label": " ＡＩ　 Art "}
        second = {**self.event, "label": "ai art"}
        self.assertEqual(self.store.observe([first]), 1)
        self.assertEqual(self.store.observe([second]), 0)
        tag = self.store.list_attributes()[0]
        self.assertEqual(tag["label"], "AI Art")
        third = {**second, "evidence_key": "douyin:video:456", "source_id": "second"}
        self.assertEqual(self.store.observe([third]), 1)
        self.assertEqual(len(self.store.list_attributes()), 1)

    def test_category_is_part_of_identity(self):
        self.store.observe([self.event, {**self.event, "kind": "skill"}])
        tags = self.store.list_attributes()
        self.assertEqual(len({tag["id"] for tag in tags}), 2)
        self.assertEqual({tag["kind"] for tag in tags}, {"interest", "skill"})

    def test_assessment_is_an_unverified_proposal_with_an_explicit_scale(self):
        assessment = {"value": 60, "scale_min": 0, "scale_max": 100, "method": "模型自评"}
        event = {**self.event, "kind": "skill", "assessment": assessment}
        self.store.observe([event])
        tag = self.store.list_attributes()[0]
        self.assertEqual(tag["assessment"], assessment)
        self.assertEqual(tag["assessment_basis"], "unverified_proposal")
        self.assertEqual(tag["status"], "candidate")
        self.store.observe([{**event, "observed_at": event["observed_at"] + 1, "assessment": None}])
        self.assertIsNone(self.store.list_attributes()[0]["assessment"])

    def test_invalid_assessments_do_not_write_partial_results(self):
        good = {"value": 60, "scale_min": 0, "scale_max": 100, "method": "draft"}
        for assessment in (
            {**good, "value": True}, {**good, "value": float("nan")},
            {**good, "scale_max": float("inf")}, {**good, "value": 101},
            {**good, "scale_min": 100}, {**good, "value": 10**1000},
            {**good, "verified": True}, {**good, "method": ""},
            {**good, "method": "x" * 201},
        ):
            with self.subTest(assessment=assessment), self.assertRaises(ValueError):
                self.store.observe([self.event, {**self.event, "assessment": assessment}])
        self.assertEqual(self.store.list_attributes(), [])

    def test_fixed_persona_binding_cannot_be_reused(self):
        self.store.observe([self.event])
        with self.assertRaisesRegex(ValueError, "different persona"):
            AttributeStore(self.path, persona_id="another-persona")
        self.assertEqual(AttributeStore(self.path).list_attributes()[0]["evidence_count"], 1)

    def test_foreign_and_future_databases_are_not_modified(self):
        foreign = self.path.parent / "source.sqlite3"
        with closing(sqlite3.connect(foreign)) as db:
            db.execute("CREATE TABLE source_data(value TEXT)")
            db.execute("INSERT INTO source_data VALUES ('preserve')")
            db.execute("PRAGMA user_version=1")
            db.commit()
        before = foreign.read_bytes()
        with self.assertRaises(ValueError):
            AttributeStore(foreign)
        self.assertEqual(foreign.read_bytes(), before)
        with closing(sqlite3.connect(self.path)) as db:
            db.execute("PRAGMA user_version=2")
            db.commit()
        with self.assertRaises(ValueError):
            AttributeStore(self.path)
        with closing(sqlite3.connect(self.path)) as db:
            self.assertEqual(db.execute("PRAGMA user_version").fetchone()[0], 2)
            self.assertEqual(db.execute("PRAGMA application_id").fetchone()[0], APPLICATION_ID)

    def test_source_url_validation_and_canonicalization(self):
        for url in ("javascript:alert(1)", "file:///secret", "https://u:p@example.com/a",
                    "https://example.com:99999/a", "https://example.com/a b",
                    "https://example.com\\a", "https:///missing", "https://%65xample.com/a"):
            with self.subTest(url=url), self.assertRaises(ValueError):
                self.store.observe([{**self.event, "source_url": url}])
        self.store.observe([{**self.event, "source_url": "HTTPS://EXAMPLE.COM:443"}])
        self.assertEqual(self.store.list_attributes()[0]["source_urls"], ["https://example.com/"])

    def test_invalid_types_and_extra_fields_cannot_modify_identity_or_scope(self):
        for changes in ({"kind": "identity"}, {"kind": []}, {"label": ""},
                        {"label": "x" * 81}, {"observed_at": True},
                        {"observed_at": -1}, {"summary": ""}, {"source_type": "chat"},
                        {"persona_id": "attacker"}, {"xp": 1000}, {"label": "\ud800"}):
            with self.subTest(changes=changes), self.assertRaises(ValueError):
                self.store.observe([self.event, {**self.event, **changes}])
        self.assertEqual(self.store.list_attributes(), [])

    def test_input_and_returned_values_do_not_alias_persisted_payload(self):
        event = deepcopy(self.event)
        self.store.observe([event])
        tag = self.store.list_attributes()[0]
        event["summary"] = "Caller mutation"
        history = self.store.history(tag["id"])
        history[0]["payload"]["summary"] = "Returned object mutation"
        self.assertEqual(self.store.list_attributes()[0]["latest_summary"], self.event["summary"])
        self.assertEqual(self.store.history(tag["id"])[0]["payload"]["summary"], self.event["summary"])

    def test_batch_order_has_same_current_state_for_different_source_times(self):
        newer = {**self.event, "summary": "更新", "observed_at": self.event["observed_at"] + 1}
        other = AttributeStore(self.path.parent / "other.sqlite3")
        self.store.observe([self.event, newer])
        other.observe([newer, self.event])
        self.assertEqual(self.store.list_attributes(), other.list_attributes())

    def test_concurrent_observations_do_not_duplicate(self):
        def observe(_):
            return AttributeStore(self.path).observe([self.event])
        with ThreadPoolExecutor(max_workers=5) as pool:
            self.assertEqual(sum(pool.map(observe, range(10))), 1)
        tag = self.store.list_attributes()[0]
        self.assertEqual(tag["evidence_count"], 1)
        self.assertEqual(len(self.store.history(tag["id"])), 1)

    def test_empty_and_unknown_history(self):
        self.assertEqual(self.store.observe([]), 0)
        self.assertEqual(self.store.history("0" * 64), [])
        with self.assertRaises(ValueError):
            self.store.history("not-an-id")
        with self.assertRaises(ValueError):
            AttributeStore(":memory:")


if __name__ == "__main__":
    unittest.main()
