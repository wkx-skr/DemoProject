"""AstrBot adapter. Models, transport and conversation history stay with the host."""

import asyncio
import sqlite3
from pathlib import Path

from astrbot.api import AstrBotConfig, logger
from astrbot.api.event import AstrMessageEvent, filter
from astrbot.api.provider import ProviderRequest
from astrbot.api.star import Context, Star
from astrbot.core.agent.message import TextPart
from astrbot.core.utils.astrbot_path import get_astrbot_data_path

from .yiyi.character import dynamic_context, load_character, scope_key, stage_for, system_prompt
from .yiyi.store import Store

MARKER = "[WYY_CHARACTER_V1]"


class WangYiyiPlugin(Star):
    def __init__(self, context: Context, config: AstrBotConfig):
        super().__init__(context)
        self.config = config
        self.profile = load_character()
        self.persona = (
            MARKER + "\n" + system_prompt(self.profile, config.get("guardian_title", "你"))
        )
        self.store = Store(
            Path(get_astrbot_data_path()) / "plugin_data" / "astrbot_plugin_wyy" / "yiyi.sqlite3"
        )

    def _scope(self, event):
        # Restrict both hooks and commands, including when a group has its own session.
        if not event.is_private_chat():
            return None
        try:
            return scope_key(event.unified_msg_origin, event.get_sender_id())
        except ValueError:
            return None

    def _allowed_scope(self, event):
        scope = self._scope(event)
        allowed = self.config.get("allowed_scopes", [])
        if (
            self.config.get("enabled", True)
            and isinstance(allowed, list)
            and scope
            and scope in allowed
        ):
            return scope
        return None

    @staticmethod
    def _argument(event):
        parts = event.message_str.split(maxsplit=1)
        return parts[1].strip() if len(parts) == 2 else ""

    def _snapshot(self, scope):
        memories = (
            self.store.list_memories(scope, limit=8)
            if self.config.get("memory_enabled", True)
            else []
        )
        return dynamic_context(self.profile, self.store.status(scope), memories)

    @filter.on_llm_request()
    async def inject_character(self, event: AstrMessageEvent, req: ProviderRequest):
        scope = self._allowed_scope(event)
        if not scope or MARKER in (req.system_prompt or ""):
            return
        try:
            context = await asyncio.to_thread(self._snapshot, scope)
        except (sqlite3.Error, OSError, ValueError):
            logger.warning("WYY: 本轮记忆读取失败，已跳过动态资料；请检查插件数据目录。")
            context = "一一的长期记录本轮不可用；不能据此编造共同经历。"
        req.system_prompt = (req.system_prompt or "") + "\n\n" + self.persona
        req.extra_user_content_parts.append(TextPart(text=context).mark_as_temp())

    @filter.command("yiyi_here")
    async def show_scope(self, event: AstrMessageEvent):
        """显示当前私聊标识，供你在插件配置中启用。"""
        event.stop_event()
        scope = self._scope(event)
        if scope:
            yield event.plain_result(
                "把下面的完整标识加入插件 allowed_scopes 后保存并重载：\n" + scope
            )
        else:
            yield event.plain_result("请在身份可识别的私聊中使用。")

    async def _run(self, event, action):
        scope = self._allowed_scope(event)
        if not scope:
            return "此私聊尚未启用一一。先发送 /yiyi_here，并在插件配置中添加标识。"
        argument = self._argument(event)
        if action in ("remember", "memories", "forget") and not self.config.get(
            "memory_enabled", True
        ):
            return "本插件的显式记忆已关闭；请使用你已配置的记忆插件管理记录。"
        try:
            if action == "status":
                state = await asyncio.to_thread(self.store.status, scope)
                stage = stage_for(self.profile, state["xp"])["name"]
                return (
                    f"一一 · {stage}\n共同积累：{state['xp']} 点；"
                    f"今日：{state['daily_xp']}/{self.profile['growth']['daily_xp_cap']} 点。"
                )
            if action == "remember":
                memory_id = await asyncio.to_thread(self.store.add_memory, scope, argument)
                return (
                    f"已记住，编号 {memory_id}。可用 /yiyi_forget {memory_id} 删除本插件中的记录。"
                )
            if action == "memories":
                memories = await asyncio.to_thread(self.store.list_memories, scope)
                return (
                    "最近登记的记忆：\n" + "\n".join(f"{m['id']}. {m['text']}" for m in memories)
                    if memories
                    else "还没有登记长期记忆。用 /yiyi_remember 内容 记下一件事。"
                )
            if action == "forget":
                deleted = await asyncio.to_thread(self.store.forget_memory, scope, int(argument))
                return (
                    "已删除本插件中的这条记录。AstrBot 聊天历史及其他插件的副本需分别管理。"
                    if deleted
                    else "当前会话没有这条记忆。"
                )
            if action == "activity":
                growth = self.profile["growth"]
                if argument not in growth["activity_points"]:
                    return "登记已完成的共同活动：/yiyi_activity " + "|".join(
                        growth["activity_points"]
                    )
                message_id = str(event.message_obj.message_id or "").strip()
                if not message_id:
                    return "平台未提供消息编号，本次未计分；请检查平台适配器。"
                state = await asyncio.to_thread(
                    self.store.record_activity,
                    scope,
                    argument,
                    message_id,
                    points=growth["activity_points"][argument],
                    daily_cap=growth["daily_xp_cap"],
                )
                if state["duplicate"]:
                    return "这次活动已经登记过了。"
                return f"已登记这次共同活动，积累 {state['awarded']} 点；总计 {state['xp']} 点。"
        except (ValueError, TypeError):
            return "参数不正确。记忆需为 1–500 字；删除时填数字编号；活动填 read、draw、share 或 reflect。"
        except (sqlite3.Error, OSError):
            logger.warning("WYY: 记录操作失败，请检查插件数据目录；没有回报操作成功。")
            return "这次记录操作未能完成，请稍后重试或检查插件日志。"
        return "未知操作。"

    @filter.command("yiyi_status")
    async def show_status(self, event: AstrMessageEvent):
        event.stop_event()
        yield event.plain_result(await self._run(event, "status"))

    @filter.command("yiyi_remember")
    async def remember(self, event: AstrMessageEvent):
        event.stop_event()
        yield event.plain_result(await self._run(event, "remember"))

    @filter.command("yiyi_memories")
    async def show_memories(self, event: AstrMessageEvent):
        event.stop_event()
        yield event.plain_result(await self._run(event, "memories"))

    @filter.command("yiyi_forget")
    async def forget(self, event: AstrMessageEvent):
        event.stop_event()
        yield event.plain_result(await self._run(event, "forget"))

    @filter.command("yiyi_activity")
    async def activity(self, event: AstrMessageEvent):
        event.stop_event()
        yield event.plain_result(await self._run(event, "activity"))
