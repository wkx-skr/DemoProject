"""Persist candidate tags and source revisions without changing core identity.

Labels are open-ended; categories describe how a label may be interpreted.
Observations and proposed self-assessments never become verified capabilities
merely because they appear repeatedly. No model, network or source DB is used.
"""

from __future__ import annotations

from contextlib import contextmanager
from datetime import datetime, timezone
import hashlib
import ipaddress
import json
import math
from pathlib import Path
import re
import sqlite3
import unicodedata
from urllib.parse import urlsplit, urlunsplit


SCHEMA_VERSION = 1
APPLICATION_ID = 0x57595941
KINDS = frozenset({"interest", "knowledge_topic", "skill", "question"})
STANCES = frozenset({"like", "dislike", "neutral"})
SOURCE_TYPES = frozenset({"douyin", "web", "task"})
EVENT_FIELDS = frozenset(
    {"kind", "label", "source_id", "evidence_key", "source_url", "observed_at",
     "summary", "stance", "source_type", "assessment"}
)


def _now():
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


def _canonical(value):
    try:
        text = json.dumps(
            value, sort_keys=True, ensure_ascii=False, separators=(",", ":"), allow_nan=False
        )
        text.encode("utf-8")
        return text
    except (ValueError, TypeError, UnicodeError, RecursionError):
        raise ValueError("Attribute input must be finite UTF-8 JSON") from None


def _text(value, name, maximum):
    if not isinstance(value, str) or "\x00" in value:
        raise ValueError(f"Invalid {name}")
    value = value.strip()
    if not 1 <= len(value) <= maximum:
        raise ValueError(f"Invalid {name} length")
    try:
        value.encode("utf-8")
    except UnicodeError:
        raise ValueError(f"Invalid {name} encoding") from None
    return value


def _choice(value, choices, name):
    if not isinstance(value, str) or value not in choices:
        raise ValueError(f"Invalid {name}")
    return value


def _source_url(value):
    value = _text(value, "source_url", 2048)
    if any(c.isspace() or ord(c) < 32 for c in value) or "\\" in value:
        raise ValueError("Invalid source URL")
    try:
        parsed = urlsplit(value)
        if (
            parsed.scheme not in {"https", "http"}
            or not parsed.hostname
            or parsed.username is not None
            or parsed.password is not None
            or "%" in parsed.hostname
        ):
            raise ValueError("Invalid source URL")
        if ":" in parsed.hostname:
            host = "[" + str(ipaddress.IPv6Address(parsed.hostname)) + "]"
        else:
            host = parsed.hostname.encode("idna").decode("ascii").lower()
            if not re.fullmatch(r"[a-z0-9_.-]+", host):
                raise ValueError("Invalid source URL")
        port = parsed.port
        if port is not None and not 1 <= port <= 65535:
            raise ValueError("Invalid source URL")
        default_port = 443 if parsed.scheme == "https" else 80
        authority = host + (f":{port}" if port and port != default_port else "")
        return urlunsplit((parsed.scheme, authority, parsed.path or "/", parsed.query, parsed.fragment))
    except (ValueError, UnicodeError):
        raise ValueError("Source URLs must be HTTP(S) without credentials") from None


def _assessment(value):
    if value is None:
        return None
    if not isinstance(value, dict) or set(value) != {"value", "scale_min", "scale_max", "method"}:
        raise ValueError("Invalid proposed assessment")
    numbers = [value[key] for key in ("value", "scale_min", "scale_max")]
    try:
        finite = all(type(number) in (int, float) and math.isfinite(number) for number in numbers)
    except OverflowError:
        finite = False
    if not finite:
        raise ValueError("Proposed assessment numbers must be finite")
    score, minimum, maximum = numbers
    if not minimum < maximum or not minimum <= score <= maximum:
        raise ValueError("Proposed assessment is outside its declared scale")
    return {**value, "method": _text(value["method"], "assessment method", 200)}


def _prepare(event):
    if not isinstance(event, dict) or set(event) - EVENT_FIELDS:
        raise ValueError("Unsupported attribute event fields")
    kind = _choice(event.get("kind"), KINDS, "attribute kind")
    label = " ".join(unicodedata.normalize("NFKC", _text(event.get("label"), "label", 80)).split())
    label = _text(label, "normalized label", 80)
    normalized_label = label.casefold()
    attribute_id = hashlib.sha256(_canonical([kind, normalized_label]).encode()).hexdigest()
    observed_at = event.get("observed_at")
    if type(observed_at) is not int or not 0 <= observed_at <= 32_503_680_000_000:
        raise ValueError("observed_at must be a valid millisecond timestamp")
    prepared = {
        "kind": kind,
        "label": label,
        "source_id": _text(event.get("source_id"), "source_id", 512),
        "evidence_key": _text(event.get("evidence_key"), "evidence_key", 512),
        "source_url": _source_url(event.get("source_url")),
        "observed_at": observed_at,
        "summary": _text(event.get("summary"), "summary", 1600),
        "stance": _choice(event.get("stance", "neutral"), STANCES, "stance"),
        "source_type": _choice(event.get("source_type"), SOURCE_TYPES, "source_type"),
        "assessment": _assessment(event.get("assessment")),
    }
    version = hashlib.sha256(
        _canonical({**prepared, "label": normalized_label}).encode()
    ).hexdigest()
    return {"id": attribute_id, "normalized_label": normalized_label,
            "version": version, "event": prepared}


class AttributeStore:
    """One persona's candidate tags, independent evidence and append-only history.

    ``observe`` returns the number of accepted evidence revisions, not the
    number of tags or newly demonstrated skills. Equal-time conflicting events
    are rejected atomically instead of selecting an arbitrary interpretation.
    Older events never replace the current revision of an evidence item.
    """

    def __init__(self, path: str | Path, persona_id: str = "default"):
        if str(path) == ":memory:":
            raise ValueError("AttributeStore requires a persistent filesystem path")
        self.path = Path(path)
        self.persona_id = _text(persona_id, "persona_id", 512)
        self.path.parent.mkdir(parents=True, exist_ok=True)
        with self._write() as connection:
            version = connection.execute("PRAGMA user_version").fetchone()[0]
            application = connection.execute("PRAGMA application_id").fetchone()[0]
            if version == SCHEMA_VERSION and application == APPLICATION_ID:
                self._binding(connection)
                return
            tables = connection.execute(
                "SELECT 1 FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"
            ).fetchone()
            if version or application or tables:
                raise ValueError("Refusing to use a source, foreign or unsupported database")
            connection.execute("CREATE TABLE attribute_config (key TEXT PRIMARY KEY, value TEXT NOT NULL)")
            connection.execute(
                "INSERT INTO attribute_config VALUES ('persona_id',?)", (self.persona_id,)
            )
            connection.execute(
                "CREATE TABLE attributes (id TEXT PRIMARY KEY, kind TEXT NOT NULL, "
                "label TEXT NOT NULL, normalized_label TEXT NOT NULL, "
                "status TEXT NOT NULL CHECK(status='candidate'), created_at TEXT NOT NULL, "
                "UNIQUE(kind,normalized_label))"
            )
            connection.execute(
                "CREATE TABLE attribute_evidence (attribute_id TEXT NOT NULL REFERENCES attributes(id), "
                "evidence_key TEXT NOT NULL, version TEXT NOT NULL, observed_at INTEGER NOT NULL, "
                "payload TEXT NOT NULL, PRIMARY KEY(attribute_id,evidence_key))"
            )
            connection.execute(
                "CREATE TABLE attribute_history (id INTEGER PRIMARY KEY AUTOINCREMENT, "
                "attribute_id TEXT NOT NULL REFERENCES attributes(id), evidence_key TEXT NOT NULL, "
                "version TEXT NOT NULL, observed_at INTEGER NOT NULL, payload TEXT NOT NULL, "
                "recorded_at TEXT NOT NULL, UNIQUE(attribute_id,evidence_key,version))"
            )
            connection.execute(f"PRAGMA application_id={APPLICATION_ID}")
            connection.execute(f"PRAGMA user_version={SCHEMA_VERSION}")

    @contextmanager
    def _connection(self):
        connection = sqlite3.connect(self.path, timeout=30, isolation_level=None)
        connection.row_factory = sqlite3.Row
        connection.execute("PRAGMA foreign_keys=ON")
        try:
            yield connection
        finally:
            connection.close()

    @contextmanager
    def _write(self):
        with self._connection() as connection:
            connection.execute("BEGIN IMMEDIATE")
            try:
                yield connection
                connection.commit()
            except BaseException:
                connection.rollback()
                raise

    def _binding(self, connection):
        row = connection.execute(
            "SELECT value FROM attribute_config WHERE key='persona_id'"
        ).fetchone()
        if row is None or row["value"] != self.persona_id:
            raise ValueError("Attribute database is bound to a different persona")

    def observe(self, events: list[dict]) -> int:
        """Validate and atomically accept current source evidence revisions."""
        if not isinstance(events, list) or len(events) > 10000:
            raise ValueError("events must be a list containing at most 10000 items")
        prepared = [_prepare(event) for event in events]
        prepared.sort(key=lambda item: (item["event"]["observed_at"], item["id"], item["version"]))
        with self._write() as connection:
            self._binding(connection)
            accepted = 0
            for item in prepared:
                event = item["event"]
                key = (item["id"], event["evidence_key"])
                if connection.execute(
                    "SELECT 1 FROM attribute_history WHERE attribute_id=? AND evidence_key=? "
                    "AND version=?", (*key, item["version"])
                ).fetchone():
                    continue
                previous = connection.execute(
                    "SELECT version,observed_at FROM attribute_evidence "
                    "WHERE attribute_id=? AND evidence_key=?", key
                ).fetchone()
                if previous is not None:
                    if event["observed_at"] < previous["observed_at"]:
                        continue
                    if event["observed_at"] == previous["observed_at"]:
                        raise ValueError("Conflicting attribute evidence at the same source time")
                now = _now()
                connection.execute(
                    "INSERT OR IGNORE INTO attributes VALUES (?,?,?,?,'candidate',?)",
                    (item["id"], event["kind"], event["label"], item["normalized_label"], now),
                )
                payload = _canonical(event)
                values = (*key, item["version"], event["observed_at"], payload)
                connection.execute(
                    "INSERT INTO attribute_history "
                    "(attribute_id,evidence_key,version,observed_at,payload,recorded_at) "
                    "VALUES (?,?,?,?,?,?)", (*values, now),
                )
                connection.execute(
                    "INSERT INTO attribute_evidence VALUES (?,?,?,?,?) "
                    "ON CONFLICT(attribute_id,evidence_key) DO UPDATE SET "
                    "version=excluded.version,observed_at=excluded.observed_at,payload=excluded.payload",
                    values,
                )
                accepted += 1
            return accepted

    def list_attributes(self) -> list[dict]:
        """Return candidate tags with counts, provenance and unverified assessments."""
        with self._connection() as connection:
            connection.execute("BEGIN")
            self._binding(connection)
            tags = connection.execute("SELECT * FROM attributes ORDER BY kind,normalized_label").fetchall()
            rows = connection.execute(
                "SELECT attribute_id,evidence_key,payload FROM attribute_evidence "
                "ORDER BY observed_at DESC,evidence_key,version"
            ).fetchall()
        evidence = {}
        for row in rows:
            evidence.setdefault(row["attribute_id"], []).append(json.loads(row["payload"]))
        result = []
        for tag in tags:
            items = evidence.get(tag["id"], [])
            latest = items[0] if items else None
            result.append({
                "id": tag["id"], "kind": tag["kind"], "label": tag["label"],
                "status": tag["status"], "evidence_count": len(items),
                "source_types": sorted({item["source_type"] for item in items}),
                "like_count": sum(item["stance"] == "like" for item in items),
                "dislike_count": sum(item["stance"] == "dislike" for item in items),
                "neutral_count": sum(item["stance"] == "neutral" for item in items),
                "last_observed_at": latest["observed_at"] if latest else None,
                "latest_summary": latest["summary"] if latest else None,
                "assessment": latest["assessment"] if latest else None,
                "assessment_basis": "unverified_proposal" if latest and latest["assessment"] else None,
                "source_urls": sorted({item["source_url"] for item in items}),
            })
        return result

    def history(self, attribute_id: str) -> list[dict]:
        """Return accepted revisions in source-time order, retaining provenance."""
        if not isinstance(attribute_id, str) or not re.fullmatch(r"[0-9a-f]{64}", attribute_id):
            raise ValueError("Invalid attribute ID")
        with self._connection() as connection:
            self._binding(connection)
            rows = connection.execute(
                "SELECT id,attribute_id,evidence_key,version,observed_at,payload,recorded_at "
                "FROM attribute_history WHERE attribute_id=? ORDER BY observed_at,id", (attribute_id,)
            ).fetchall()
        return [{**dict(row), "payload": json.loads(row["payload"])} for row in rows]
