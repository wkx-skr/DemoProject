"""Preview, synchronize and inspect the DSH-to-LivingMemory outbox."""

import argparse
from collections import Counter
from datetime import datetime, timezone
import json
import os
from pathlib import Path
import sqlite3
import tempfile

from .client import ClientError, LivingMemoryClient
from .credentials import password_from
from .outbox import Outbox
from .runtime import AlreadyRunning, api_tunnel, single_run, ssh_session_token
from .source import collect_records


def _path(value, parent):
    path = Path(os.path.expandvars(value)).expanduser()
    return path.resolve() if path.is_absolute() else (parent / path).resolve()


def run(settings, command, limit=20):
    destination = settings["destination"]
    binding = {k: destination[k] for k in ("session_id", "persona_id", "adapter_id")}
    if command == "status":
        return {"status": "ok", **Outbox(settings["state_db"]).summary()}
    if command == "plan":
        records = collect_records(
            settings["source"]["persona_state"], settings["source"].get("shared_db")
        )
        return {
            "status": "preview",
            "source_records": len(records),
            "source_kinds": dict(Counter(r["metadata"]["source_kind"] for r in records)),
            "target_session": binding["session_id"],
            "target_persona": binding["persona_id"],
            "writes_performed": False,
        }
    with single_run(str(settings["state_db"]) + ".lock"):
        records = collect_records(
            settings["source"]["persona_state"], settings["source"].get("shared_db")
        )
        box = Outbox(settings["state_db"])
        target = settings.get("ssh") or {"base_url": destination["base_url"]}
        target_identity = {k: v for k, v in target.items() if k != "key_path"}
        added = box.enqueue(records, {**binding, "target": target_identity})
        pending = box.pending(limit=limit)
        completed = 0
        errors = 0
        if pending:
            with api_tunnel(settings) as base_url:
                ssh_auth = destination.get("auth_mode") == "ssh-admin-session"
                client = LivingMemoryClient(
                    base_url,
                    "" if ssh_auth else destination["username"],
                    "" if ssh_auth else password_from(destination),
                    **binding,
                    timeout=settings.get("timeout", 60),
                    token_supplier=(lambda: ssh_session_token(settings)) if ssh_auth else None,
                )
                client.login()
                if client.readiness().get("ready") is not True:
                    raise ClientError("The LivingMemory engine is not ready")
                for item in pending:
                    record = item["payload"]
                    try:
                        memory_id = client.find_record(record)
                        if memory_id is None:
                            client.import_record(record, dry_run=True)
                            result = client.import_record(record, dry_run=False)
                            ids = result.get("imported_ids", [])
                            memory_id = ids[0] if len(ids) == 1 else client.find_record(record)
                        if memory_id is None or not client.verify_record(memory_id, record):
                            box.mark_failed(item["id"], "verification_failed")
                            errors += 1
                            # A mismatched receipt may indicate an API contract change.
                            break
                        box.mark_synced(item["id"], memory_id)
                        completed += 1
                    except ClientError:
                        # A timed-out write may have succeeded: reconcile before retrying.
                        try:
                            memory_id = client.find_record(record)
                            if memory_id is not None:
                                box.mark_synced(item["id"], memory_id)
                                completed += 1
                                continue
                        except ClientError:
                            pass
                        box.mark_failed(item["id"], "api_error")
                        errors += 1
                        if errors >= 3:
                            break
        return {
            "status": "ok" if errors == 0 else "partial",
            "source_records": len(records),
            "enqueued": added,
            "verified_this_run": completed,
            "errors_this_run": errors,
            **box.summary(),
        }


def main():
    parser = argparse.ArgumentParser(description="DSH 抖音观察 → LivingMemory 同步")
    parser.add_argument("--config", type=Path, required=True)
    parser.add_argument("--limit", type=int, default=20)
    parser.add_argument("--report", type=Path)
    parser.add_argument("command", choices=["plan", "sync", "status"])
    args = parser.parse_args()
    if not 1 <= args.limit <= 100:
        parser.error("--limit 必须为 1..100")
    try:
        settings = json.loads(args.config.read_text(encoding="utf-8-sig"))
        parent = args.config.resolve().parent
        settings["state_db"] = _path(settings["state_db"], parent)
        for name in ("persona_state", "shared_db"):
            if settings["source"].get(name):
                settings["source"][name] = _path(settings["source"][name], parent)
        if settings.get("ssh"):
            settings["ssh"]["key_path"] = str(_path(settings["ssh"]["key_path"], parent))
        result = run(settings, args.command, args.limit)
    except AlreadyRunning:
        result = {"status": "already_running"}
    except (ClientError, ValueError, OSError, KeyError, TypeError, sqlite3.Error) as exc:
        # Never print configuration, credentials, source text, or HTTP response bodies.
        result = {"status": "error", "error_type": type(exc).__name__}
        if isinstance(exc, ClientError):
            result["http_status"] = exc.status_code
    result["checked_at"] = datetime.now(timezone.utc).isoformat(timespec="seconds")
    output = json.dumps(result, ensure_ascii=False, indent=2)
    if args.report and result["status"] != "already_running":
        args.report.parent.mkdir(parents=True, exist_ok=True)
        # Separate temporary files keep overlapping reporters from colliding.
        temporary = None
        try:
            with tempfile.NamedTemporaryFile(
                mode="w", encoding="utf-8", dir=args.report.parent,
                prefix=args.report.name + ".", suffix=".tmp", delete=False,
            ) as handle:
                temporary = Path(handle.name)
                handle.write(output)
            temporary.replace(args.report)
        finally:
            if temporary is not None:
                temporary.unlink(missing_ok=True)
    print(output)
    return 1 if result["status"] in {"error", "partial"} else 0


if __name__ == "__main__":
    raise SystemExit(main())
