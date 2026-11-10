"""Durable, single-destination queue for external observation imports.

Payloads are frozen on enqueue. Database writes are transactional; a caller must
also hold its process lock across the network send/verify/ack sequence. The queue
does not make network requests and never reads a LivingMemory/source database.
"""

from __future__ import annotations

from contextlib import contextmanager
from datetime import datetime, timezone
import hashlib
import json
from pathlib import Path
import re
import sqlite3
from typing import Iterator


SCHEMA_VERSION = 1
SOURCE_METADATA = frozenset(
    {"source_url", "video_id", "evidence_id", "observed_at", "source_kind", "verification"}
)
ERROR_CODES = frozenset(
    {
        "sync_failed",
        "api_error",
        "client_error",
        "auth_failed",
        "network_error",
        "validation_failed",
        "verification_failed",
        "import_failed",
        "reconciliation_failed",
        "unexpected_error",
    }
)
MARKER = re.compile(r"\[WYY_DOUYIN:[0-9a-f]{64}\]")


def _now() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


def _canonical(value) -> str:
    try:
        text = json.dumps(
            value, ensure_ascii=False, sort_keys=True, separators=(",", ":"), allow_nan=False
        )
        text.encode("utf-8")
        return text
    except (TypeError, ValueError, UnicodeError, RecursionError) as exc:
        raise ValueError("Outbox input must be finite UTF-8 JSON") from exc


def _string(value, label: str, maximum: int, *, exact: bool = True) -> str:
    if (
        not isinstance(value, str)
        or not value.strip()
        or len(value) > maximum
        or "\x00" in value
        or (exact and value != value.strip())
    ):
        raise ValueError(f"Invalid {label}")
    return value


def _id(value, label: str = "outbox id") -> int:
    if type(value) is not int or not 1 <= value <= 2**63 - 1:
        raise ValueError(f"Invalid {label}")
    return value


def _binding(binding: dict) -> str:
    if not isinstance(binding, dict) or not all(
        key in binding for key in ("session_id", "persona_id", "adapter_id")
    ):
        raise ValueError("A fixed session, persona and adapter binding is required")
    for key in ("session_id", "adapter_id"):
        _string(binding[key], key, 1024)
    if binding["persona_id"] is not None:
        _string(binding["persona_id"], "persona_id", 1024)
    encoded = _canonical(binding)
    if len(encoded) > 8192:
        raise ValueError("Outbox binding is too large")
    return encoded


def _freeze(record: dict) -> dict:
    if not isinstance(record, dict) or not isinstance(record.get("metadata"), dict):
        raise ValueError("Each source record must contain metadata")
    source_id = _string(record.get("source_id"), "source_id", 512)
    content = _string(record.get("content"), "content", 16000, exact=False)
    if MARKER.search(content):
        raise ValueError("Source content must not contain a bridge marker")
    # The source reader owns these six provenance fields. Never forward scope,
    # authorization, system-prompt, tool, or other arbitrary metadata fields.
    metadata = {key: value for key, value in record["metadata"].items() if key in SOURCE_METADATA}
    _string(metadata.get("source_url"), "source_url", 2048)
    for key, value in metadata.items():
        if key == "observed_at":
            if type(value) is not int or value < 0:
                raise ValueError("observed_at must be a nonnegative source timestamp")
        else:
            _string(value, key, 2048)
    canonical = _canonical({"source_id": source_id, "content": content, "metadata": metadata})
    version = hashlib.sha256(canonical.encode("utf-8")).hexdigest()
    return {
        "source_id": source_id,
        "version": version,
        "content": content + f"\n[WYY_DOUYIN:{version}]",
        "metadata": {
            **metadata,
            "source_event_id": source_id,
            "source_version": version,
            "bridge": "wyy_douyin_sync",
        },
    }


def _safe_error(value) -> str:
    # Never persist arbitrary exception messages, server response bodies, or
    # credentials, even when they happen to look like an alphanumeric code.
    if isinstance(value, str) and (
        value in ERROR_CODES or re.fullmatch(r"http_[1-5][0-9]{2}", value)
    ):
        return value
    return "sync_failed"


class Outbox:
    """A file-backed queue permanently bound by its first enqueue operation.

    Enqueuing an already known source/version is a no-op, including historical
    superseded versions. A new version supersedes older unsent versions while
    retaining previously synced records and their acknowledgements.
    """

    def __init__(self, path: str | Path):
        if str(path) == ":memory:":
            raise ValueError("Outbox requires a persistent filesystem path")
        self.path = Path(path)
        self.path.parent.mkdir(parents=True, exist_ok=True)
        with self._write() as connection:
            version = connection.execute("PRAGMA user_version").fetchone()[0]
            if version not in (0, SCHEMA_VERSION):
                raise ValueError("Unsupported outbox database schema version")
            if version == SCHEMA_VERSION:
                return
            if connection.execute(
                "SELECT 1 FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"
            ).fetchone():
                raise ValueError("Refusing to initialize an existing unversioned database")
            connection.execute(
                "CREATE TABLE outbox_config (key TEXT PRIMARY KEY, value TEXT NOT NULL)"
            )
            connection.execute(
                "CREATE TABLE outbox (id INTEGER PRIMARY KEY AUTOINCREMENT, "
                "source_id TEXT NOT NULL, version TEXT NOT NULL, payload TEXT NOT NULL, "
                "status TEXT NOT NULL CHECK(status IN ('pending','synced','superseded')), "
                "memory_id INTEGER UNIQUE, attempts INTEGER NOT NULL DEFAULT 0, "
                "error_code TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL, "
                "UNIQUE(source_id,version))"
            )
            connection.execute("CREATE INDEX outbox_status ON outbox(status,id)")
            connection.execute(f"PRAGMA user_version={SCHEMA_VERSION}")

    @contextmanager
    def _connection(self) -> Iterator[sqlite3.Connection]:
        connection = sqlite3.connect(self.path, timeout=30, isolation_level=None)
        connection.row_factory = sqlite3.Row
        try:
            yield connection
        finally:
            connection.close()

    @contextmanager
    def _write(self) -> Iterator[sqlite3.Connection]:
        with self._connection() as connection:
            connection.execute("BEGIN IMMEDIATE")
            try:
                yield connection
                connection.commit()
            except BaseException:
                connection.rollback()
                raise

    def enqueue(self, records: list[dict], binding: dict) -> int:
        """Validate and atomically freeze a source snapshot; return inserted count.

        Binding comparison includes all supplied binding keys. Put the target
        server identity here too if the same session IDs exist on multiple hosts.
        Never put passwords or bearer tokens in a binding.
        """
        encoded_binding = _binding(binding)
        if not isinstance(records, list) or len(records) > 10000:
            raise ValueError("records must be a list of at most 10000 items")
        prepared = {}
        for record in records:
            payload = _freeze(record)
            source_id = payload["source_id"]
            if source_id in prepared and prepared[source_id] != payload:
                raise ValueError("A source snapshot contains conflicting versions")
            prepared[source_id] = payload
        with self._write() as connection:
            stored = connection.execute(
                "SELECT value FROM outbox_config WHERE key='binding'"
            ).fetchone()
            if stored is not None and stored["value"] != encoded_binding:
                raise ValueError("Outbox is already bound to a different destination")
            if stored is None:
                connection.execute(
                    "INSERT INTO outbox_config VALUES ('binding',?)", (encoded_binding,)
                )
            inserted = 0
            for payload in prepared.values():
                source_id, version = payload["source_id"], payload["version"]
                if connection.execute(
                    "SELECT 1 FROM outbox WHERE source_id=? AND version=?", (source_id, version)
                ).fetchone():
                    continue
                now = _now()
                connection.execute(
                    "UPDATE outbox SET status='superseded',updated_at=? "
                    "WHERE source_id=? AND status='pending'",
                    (now, source_id),
                )
                connection.execute(
                    "INSERT INTO outbox(source_id,version,payload,status,created_at,updated_at) "
                    "VALUES (?,?,?,'pending',?,?)",
                    (source_id, version, _canonical(payload), now, now),
                )
                inserted += 1
            return inserted

    def pending(self, limit: int = 20) -> list[dict]:
        """Read frozen payloads, prioritizing items with fewer failed attempts.

        Failed items remain pending but move behind less-tried items so a small
        group of permanently invalid records cannot block the rest of a batch.
        """
        if type(limit) is not int or not 1 <= limit <= 10000:
            raise ValueError("limit must be an integer from 1 to 10000")
        with self._connection() as connection:
            rows = connection.execute(
                "SELECT id,source_id,version,payload,status,attempts,error_code,created_at,updated_at "
                "FROM outbox WHERE status='pending' ORDER BY attempts,id LIMIT ?",
                (limit,),
            ).fetchall()
            return [{**dict(row), "payload": json.loads(row["payload"])} for row in rows]

    def mark_synced(self, id: int, memory_id: int) -> None:
        """Acknowledge only after remote verification; identical acks are safe."""
        id, memory_id = _id(id), _id(memory_id, "memory id")
        with self._write() as connection:
            row = connection.execute(
                "SELECT status,memory_id FROM outbox WHERE id=?", (id,)
            ).fetchone()
            if row is None:
                raise ValueError("Unknown outbox item")
            if row["status"] == "synced" and row["memory_id"] == memory_id:
                return
            if row["status"] != "pending":
                raise ValueError("Cannot change an acknowledged or superseded item")
            if connection.execute(
                "SELECT 1 FROM outbox WHERE memory_id=?", (memory_id,)
            ).fetchone():
                raise ValueError("Remote memory is already acknowledged by another item")
            connection.execute(
                "UPDATE outbox SET status='synced',memory_id=?,error_code=NULL,updated_at=? "
                "WHERE id=?",
                (memory_id, _now(), id),
            )

    def mark_failed(self, id: int, error_code: str) -> None:
        """Keep a failed item pending, recording only an allowlisted error code."""
        id = _id(id)
        code = _safe_error(error_code)
        with self._write() as connection:
            cursor = connection.execute(
                "UPDATE outbox SET attempts=attempts+1,error_code=?,updated_at=? "
                "WHERE id=? AND status='pending'",
                (code, _now(), id),
            )
            if cursor.rowcount != 1:
                raise ValueError("Only an existing pending item can be marked failed")

    def summary(self) -> dict:
        """Return total/pending/synced/superseded and failed-pending counts."""
        with self._connection() as connection:
            row = connection.execute(
                "SELECT COUNT(*) AS total, "
                "COALESCE(SUM(status='pending'),0) AS pending, "
                "COALESCE(SUM(status='synced'),0) AS synced, "
                "COALESCE(SUM(status='superseded'),0) AS superseded, "
                "COALESCE(SUM(status='pending' AND error_code IS NOT NULL),0) AS failed FROM outbox"
            ).fetchone()
            return dict(row)
