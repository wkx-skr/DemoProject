"""Offline tooling: no model keys or AstrBot installation required."""

import argparse
import json
from pathlib import Path

from .character import DEFAULT_CHARACTER, dynamic_context, load_character, stage_for, system_prompt
from .store import Store


def main():
    parser = argparse.ArgumentParser(description="王一一：角色档案、记忆与成长本地工具")
    parser.add_argument("--character", type=Path, default=DEFAULT_CHARACTER)
    parser.add_argument("--db", type=Path, default=Path("runtime/yiyi.sqlite3"))
    parser.add_argument("--scope", default="local-demo")
    sub = parser.add_subparsers(dest="command", required=True)
    sub.add_parser("validate", help="校验角色档案")
    persona = sub.add_parser("persona", help="生成可粘贴至 AstrBot 的静态人格")
    persona.add_argument("--title", default="你")
    persona.add_argument("--out", type=Path)
    sub.add_parser("status")
    sub.add_parser("context", help="预览本轮资料，不调用模型")
    sub.add_parser("memories")
    remember = sub.add_parser("remember")
    remember.add_argument("text")
    remember.add_argument("--kind", choices=["fact", "preference", "episode"], default="fact")
    forget = sub.add_parser("forget")
    forget.add_argument("id", type=int)
    activity = sub.add_parser("activity")
    activity.add_argument("name")
    activity.add_argument(
        "--event-id", required=True, help="同一活动重试时保持相同 ID，防止重复计分"
    )
    args = parser.parse_args()
    try:
        profile = load_character(args.character)
        if args.command == "validate":
            result = {"valid": True, "character": profile["display_name"]}
        elif args.command == "persona":
            prompt = system_prompt(profile, args.title)
            if args.out:
                args.out.parent.mkdir(parents=True, exist_ok=True)
                args.out.write_text(prompt, encoding="utf-8")
                result = {"output": str(args.out.resolve())}
            else:
                print(prompt)
                return
        else:
            store = Store(args.db)
            if args.command == "status":
                result = store.status(args.scope)
                result["stage"] = stage_for(profile, result["xp"])["name"]
            elif args.command == "context":
                print(
                    dynamic_context(
                        profile, store.status(args.scope), store.list_memories(args.scope, limit=8)
                    )
                )
                return
            elif args.command == "remember":
                result = {"id": store.add_memory(args.scope, args.text, args.kind)}
            elif args.command == "memories":
                result = store.list_memories(args.scope)
            elif args.command == "forget":
                result = {"deleted": store.forget_memory(args.scope, args.id)}
            elif args.command == "activity":
                growth = profile["growth"]
                if args.name not in growth["activity_points"]:
                    raise ValueError("可用活动: " + ", ".join(growth["activity_points"]))
                result = store.record_activity(
                    args.scope,
                    args.name,
                    args.event_id,
                    points=growth["activity_points"][args.name],
                    daily_cap=growth["daily_xp_cap"],
                )
        print(json.dumps(result, ensure_ascii=False, indent=2))
    except (ValueError, KeyError, OSError) as exc:
        parser.exit(2, f"错误: {exc}\n")


if __name__ == "__main__":
    main()
