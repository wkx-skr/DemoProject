import copy
import json
import tempfile
import unittest
from pathlib import Path

from yiyi.character import dynamic_context, load_character, scope_key, stage_for, system_prompt


class CharacterTests(unittest.TestCase):
    def test_configured_title_replaces_defaults_without_mutating_profile(self):
        profile = load_character()
        original = copy.deepcopy(profile)
        prompt = system_prompt(profile, "爸爸")
        rendered = json.loads(prompt.split("\n角色档案：\n", 1)[1])
        self.assertEqual(rendered["speech"]["address_user"], "爸爸")
        self.assertTrue(rendered["speech"]["address_user_confirmed"])
        self.assertEqual(rendered["relationship"]["default_address"], "爸爸")
        self.assertNotIn("对用户的专属称呼", rendered["identity"]["provenance"]["unknown"])
        self.assertEqual(profile, original)

    def test_scope_encodes_boundaries_and_platforms(self):
        self.assertNotEqual(scope_key("ab", "c"), scope_key("a", "bc"))
        self.assertNotEqual(scope_key("qq:private:1", "1"), scope_key("tg:private:1", "1"))
        with self.assertRaises(ValueError):
            scope_key("", "1")

    def test_stage_thresholds_and_bounded_dynamic_context(self):
        profile = load_character()
        self.assertEqual(stage_for(profile, 29)["id"], "meet")
        self.assertEqual(stage_for(profile, 30)["id"], "familiar")
        memories = [{"id": i, "kind": "fact", "text": "字" * 800} for i in range(12)]
        result = dynamic_context(profile, {"xp": 180}, memories)
        data = json.loads(result.split("\n")[1])
        self.assertEqual(len(data["memories"]), 8)
        self.assertTrue(all(len(m["text"]) == 500 for m in data["memories"]))
        self.assertEqual(data["stage"], "自主探索")
        self.assertTrue(data["stage_guidance"])

    def test_reject_invalid_growth_configuration(self):
        profile = load_character()
        profile["growth"]["stages"][1]["min_xp"] = 0
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "invalid.json"
            path.write_text(json.dumps(profile), encoding="utf-8")
            with self.assertRaises(ValueError):
                load_character(path)


if __name__ == "__main__":
    unittest.main()
