"""Exercise adapter behavior without importing or installing AstrBot.

The stubs model only the public interfaces the adapter consumes. They do not
claim to validate AstrBot's dispatcher, decorators, or a live model provider.
Every imported test package and AstrBot stub is removed by patch.dict cleanup.
"""

import importlib.util
import json
from pathlib import Path
import sqlite3
import sys
import tempfile
from types import ModuleType, SimpleNamespace
import unittest
from unittest.mock import Mock, patch


ROOT = Path(__file__).resolve().parents[1]


class StubTextPart:
    def __init__(self, *, text):
        self.text = text
        self._no_save = False

    def mark_as_temp(self):
        self._no_save = True
        return self


class StubRequest:
    def __init__(self, system_prompt="HOST SYSTEM", extra_parts=None):
        self.system_prompt = system_prompt
        self.extra_user_content_parts = list(extra_parts or [])


class StubEvent:
    def __init__(
        self,
        message="你好",
        *,
        origin="qq-one:FriendMessage:user-1",
        sender="user-1",
        private=True,
        message_id="message-1",
    ):
        self.message_str = message
        self.unified_msg_origin = origin
        self.sender = sender
        self.private = private
        self.message_obj = SimpleNamespace(message_id=message_id)
        self.stopped = False

    def get_sender_id(self):
        return self.sender

    def is_private_chat(self):
        return self.private

    def stop_event(self):
        self.stopped = True

    def plain_result(self, text):
        return text


class StubStar:
    def __init__(self, context):
        self.context = context


def _decorator(*_args, **_kwargs):
    return lambda handler: handler


def _astrbot_stubs(directory):
    names = (
        "astrbot",
        "astrbot.api",
        "astrbot.api.event",
        "astrbot.api.provider",
        "astrbot.api.star",
        "astrbot.core",
        "astrbot.core.agent",
        "astrbot.core.agent.message",
        "astrbot.core.utils",
        "astrbot.core.utils.astrbot_path",
    )
    modules = {name: ModuleType(name) for name in names}
    for name, module in modules.items():
        module.__path__ = []
        if "." in name:
            parent, child = name.rsplit(".", 1)
            setattr(modules[parent], child, module)
    modules["astrbot.api"].AstrBotConfig = dict
    modules["astrbot.api"].logger = Mock()
    modules["astrbot.api.event"].AstrMessageEvent = StubEvent
    modules["astrbot.api.event"].filter = SimpleNamespace(
        command=_decorator, on_llm_request=_decorator
    )
    modules["astrbot.api.provider"].ProviderRequest = StubRequest
    modules["astrbot.api.star"].Context = object
    modules["astrbot.api.star"].Star = StubStar
    modules["astrbot.core.agent.message"].TextPart = StubTextPart
    modules["astrbot.core.utils.astrbot_path"].get_astrbot_data_path = lambda: directory
    return modules


class AdapterTests(unittest.IsolatedAsyncioTestCase):
    def setUp(self):
        directory = tempfile.TemporaryDirectory()
        self.addCleanup(directory.cleanup)
        self.modules = _astrbot_stubs(directory.name)
        module_patch = patch.dict(sys.modules, self.modules)
        module_patch.start()
        self.addCleanup(module_patch.stop)
        spec = importlib.util.spec_from_file_location(
            "_wyy_test_adapter", ROOT / "main.py", submodule_search_locations=[str(ROOT)]
        )
        self.adapter = importlib.util.module_from_spec(spec)
        sys.modules[spec.name] = self.adapter
        spec.loader.exec_module(self.adapter)
        self.event = StubEvent()
        self.scope = self.adapter.scope_key(
            self.event.unified_msg_origin, self.event.get_sender_id()
        )
        self.config = {
            "enabled": True,
            "allowed_scopes": [self.scope],
            "memory_enabled": True,
            "guardian_title": "你",
        }
        self.plugin = self.adapter.WangYiyiPlugin(object(), self.config)

    async def _command(self, handler, event):
        results = [result async for result in handler(event)]
        self.assertTrue(event.stopped)
        self.assertEqual(len(results), 1)
        return results[0]

    @staticmethod
    def _data(request):
        return json.loads(request.extra_user_content_parts[-1].text.splitlines()[1])

    async def test_hooks_and_commands_reject_unapproved_private_sessions(self):
        event = StubEvent("/yiyi_remember 不该保存", sender="other")
        scope = self.adapter.scope_key(event.unified_msg_origin, event.sender)
        with patch.object(self.plugin, "store") as store:
            request = StubRequest()
            await self.plugin.inject_character(event, request)
            self.assertEqual(request.system_prompt, "HOST SYSTEM")
            self.assertEqual(request.extra_user_content_parts, [])
            for handler in (
                self.plugin.remember,
                self.plugin.show_memories,
                self.plugin.forget,
                self.plugin.activity,
                self.plugin.show_status,
            ):
                await self._command(handler, event)
            self.assertEqual(store.mock_calls, [])
        self.assertEqual(self.plugin.store.list_memories(scope), [])

    async def test_group_is_rejected_even_if_its_scope_is_allowlisted(self):
        event = StubEvent("/yiyi_remember 群聊内容", private=False)
        with patch.object(self.plugin, "store") as store:
            request = StubRequest()
            await self.plugin.inject_character(event, request)
            await self._command(self.plugin.remember, event)
            await self._command(self.plugin.show_scope, event)
            self.assertEqual(request.extra_user_content_parts, [])
            self.assertEqual(request.system_prompt, "HOST SYSTEM")
            self.assertEqual(store.mock_calls, [])

    async def test_disabled_missing_identity_and_bad_allowlist_fail_closed(self):
        cases = (
            ({"enabled": False}, StubEvent()),
            ({"allowed_scopes": []}, StubEvent()),
            ({"allowed_scopes": self.scope}, StubEvent()),
            ({"allowed_scopes": None}, StubEvent()),
            ({}, StubEvent(sender="")),
            ({}, StubEvent(origin="")),
        )
        for overrides, event in cases:
            with self.subTest(overrides=overrides, sender=event.sender):
                original = self.config.copy()
                self.config.update(overrides)
                try:
                    with patch.object(self.plugin, "store") as store:
                        request = StubRequest()
                        await self.plugin.inject_character(event, request)
                        await self._command(self.plugin.remember, event)
                        self.assertEqual(request.system_prompt, "HOST SYSTEM")
                        self.assertEqual(request.extra_user_content_parts, [])
                        self.assertEqual(store.mock_calls, [])
                finally:
                    self.config.clear()
                    self.config.update(original)

    async def test_same_sender_in_different_origins_has_separate_data(self):
        other = StubEvent(origin="qq-two:FriendMessage:user-1")
        other_scope = self.adapter.scope_key(other.unified_msg_origin, other.sender)
        self.assertNotEqual(self.scope, other_scope)
        self.config["allowed_scopes"].append(other_scope)
        memory_id = self.plugin.store.add_memory(self.scope, "第一会话的秘密")
        self.plugin.store.record_activity(self.scope, "read", "completed")
        request = StubRequest()
        await self.plugin.inject_character(other, request)
        self.assertEqual(self._data(request)["memories"], [])
        self.assertEqual(self._data(request)["xp"], 0)
        other.message_str = f"/yiyi_forget {memory_id}"
        await self._command(self.plugin.forget, other)
        self.assertEqual(self.plugin.store.list_memories(self.scope)[0]["id"], memory_id)

    async def test_prompt_preserved_injection_idempotent_and_dynamic_is_temporary(self):
        host_part = StubTextPart(text="Host attachment")
        request = StubRequest(extra_parts=[host_part])
        await self.plugin.inject_character(self.event, request)
        await self.plugin.inject_character(self.event, request)
        self.assertTrue(request.system_prompt.startswith("HOST SYSTEM\n\n"))
        self.assertEqual(request.system_prompt.count(self.adapter.MARKER), 1)
        self.assertEqual(len(request.extra_user_content_parts), 2)
        self.assertIs(request.extra_user_content_parts[0], host_part)
        self.assertFalse(host_part._no_save)
        self.assertTrue(request.extra_user_content_parts[1]._no_save)
        self.assertEqual(self.plugin.store.list_memories(self.scope), [])
        self.assertEqual(self.plugin.store.status(self.scope)["xp"], 0)

    async def test_each_new_request_reads_fresh_context_after_forgetting(self):
        memory_id = self.plugin.store.add_memory(self.scope, "原来的偏好")
        first = StubRequest()
        await self.plugin.inject_character(self.event, first)
        self.assertEqual(self._data(first)["memories"][0]["text"], "原来的偏好")
        self.plugin.store.forget_memory(self.scope, memory_id)
        self.plugin.store.add_memory(self.scope, "更新后的偏好")
        second = StubRequest()
        await self.plugin.inject_character(self.event, second)
        self.assertEqual(self._data(second)["memories"][0]["text"], "更新后的偏好")
        self.assertNotIn("原来的偏好", second.extra_user_content_parts[0].text)
        self.assertEqual(first.system_prompt, second.system_prompt)
        self.assertTrue(first.extra_user_content_parts[0]._no_save)
        self.assertTrue(second.extra_user_content_parts[0]._no_save)

    async def test_disabled_memory_blocks_commands_and_injection_but_allows_growth(self):
        memory_id = self.plugin.store.add_memory(self.scope, "不应注入的记忆")
        self.config["memory_enabled"] = False
        commands = (
            (self.plugin.remember, "/yiyi_remember 新的记忆"),
            (self.plugin.show_memories, "/yiyi_memories"),
            (self.plugin.forget, f"/yiyi_forget {memory_id}"),
        )
        with (
            patch.object(self.plugin.store, "add_memory") as add_memory,
            patch.object(self.plugin.store, "list_memories") as list_memories,
            patch.object(self.plugin.store, "forget_memory") as forget_memory,
        ):
            for handler, message in commands:
                await self._command(handler, StubEvent(message))
            await self._command(self.plugin.activity, StubEvent("/yiyi_activity read"))
            request = StubRequest()
            await self.plugin.inject_character(self.event, request)
            add_memory.assert_not_called()
            list_memories.assert_not_called()
            forget_memory.assert_not_called()
        self.assertEqual(self._data(request)["memories"], [])
        self.assertEqual(self._data(request)["xp"], 3)
        self.assertEqual(self.plugin.store.list_memories(self.scope)[0]["id"], memory_id)

    async def test_remember_preserves_chinese_spaces_and_can_be_deleted(self):
        text = "我喜欢阅读 科幻故事，也喜欢 Python 和  两个空格"
        await self._command(self.plugin.remember, StubEvent("/yiyi_remember " + text))
        memories = self.plugin.store.list_memories(self.scope)
        self.assertEqual(len(memories), 1)
        self.assertEqual(memories[0]["text"], text)
        await self._command(self.plugin.forget, StubEvent(f"/yiyi_forget {memories[0]['id']}"))
        self.assertEqual(self.plugin.store.list_memories(self.scope), [])

    async def test_duplicate_activity_message_id_awards_once(self):
        event = StubEvent("/yiyi_activity read", message_id="stable-platform-id")
        await self._command(self.plugin.activity, event)
        await self._command(self.plugin.activity, event)
        self.assertEqual(self.plugin.store.status(self.scope)["xp"], 3)

    async def test_activity_without_id_or_with_unknown_activity_does_not_award(self):
        for message_id in ("", None, "   "):
            await self._command(
                self.plugin.activity, StubEvent("/yiyi_activity read", message_id=message_id)
            )
        await self._command(self.plugin.activity, StubEvent("/yiyi_activity invent 100"))
        self.assertEqual(self.plugin.store.status(self.scope)["xp"], 0)

    async def test_store_failure_uses_temporary_fallback_and_never_claims_saved(self):
        with patch.object(self.plugin, "_snapshot", side_effect=sqlite3.OperationalError):
            request = StubRequest()
            await self.plugin.inject_character(self.event, request)
        self.assertTrue(request.extra_user_content_parts[0]._no_save)
        self.assertIn("不可用", request.extra_user_content_parts[0].text)
        self.assertIn(self.adapter.MARKER, request.system_prompt)
        with patch.object(self.plugin.store, "add_memory", side_effect=sqlite3.OperationalError):
            result = await self._command(
                self.plugin.remember, StubEvent("/yiyi_remember 失败的内容")
            )
        self.assertIn("未能完成", result)
        self.assertNotIn("已记住", result)


if __name__ == "__main__":
    unittest.main()
