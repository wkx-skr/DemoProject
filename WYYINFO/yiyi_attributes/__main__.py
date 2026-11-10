"""Inspect dynamic attributes and ingest explicitly supplied learning events."""

import argparse
import json
from pathlib import Path
import sqlite3

from .panel import write_panel
from .store import AttributeStore


def main():
    parser = argparse.ArgumentParser(description="一一可扩展属性库：记录来源、标签与变化")
    parser.add_argument("--db", type=Path, required=True)
    parser.add_argument("--persona", default="default")
    sub = parser.add_subparsers(dest="command", required=True)
    sub.add_parser("list")
    history = sub.add_parser("history")
    history.add_argument("attribute_id")
    observe = sub.add_parser("observe")
    observe.add_argument("--events", type=Path, required=True)
    panel = sub.add_parser("panel")
    panel.add_argument("--out", type=Path, required=True)
    args = parser.parse_args()
    try:
        store = AttributeStore(args.db, persona_id=args.persona)
        if args.command == "list":
            result = store.list_attributes()
        elif args.command == "history":
            result = store.history(args.attribute_id)
        elif args.command == "observe":
            with args.events.open("rb") as handle:
                raw = handle.read(10 * 1024 * 1024 + 1)
            if len(raw) > 10 * 1024 * 1024:
                raise ValueError("Event input exceeds the size limit")
            events = json.loads(raw.decode("utf-8-sig"))
            result = {"observations_changed": store.observe(events)}
        else:
            write_panel(args.out, store.list_attributes())
            result = {"panel": str(args.out.resolve())}
        print(json.dumps(result, ensure_ascii=False, indent=2))
        return 0
    except (ValueError, OSError, KeyError, TypeError, sqlite3.Error) as exc:
        # Do not echo source contents, local secrets or database contents on error.
        print(json.dumps({"status": "error", "error_type": type(exc).__name__}))
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
