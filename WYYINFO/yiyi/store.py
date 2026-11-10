"""SQLite persistence for explicit memories and completed growth activities.

No chat messages are collected automatically. Callers must authorize the scope
and activity before invoking this module. Each call opens and closes its own
connection; writes use an immediate transaction to serialize competing updates.
"""

from __future__ import annotations

from contextlib import contextmanager
from datetime import date, datetime, timedelta, timezone
from pathlib import Path
import sqlite3
from typing import Iterator


SCHEMA_VERSION = 1
CHINA_TZ = timezone(timedelta(hours=8))
MEMORY_KINDS = frozenset({"fact", "preference", "episode"})


def _today() -> str:
    return datetime.now(CHINA_TZ).date().isoformat()


def _timestamp() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


def _text(value: str, name: str, maximum: int) -> str:
    if not isinstance(value, str):
        raise ValueError(f"{name} must be a string")
    value = value.strip()
    if not 1 <= len(value) <= maximum or "\x00" in value:
        raise ValueError(f"{name} must contain 1..{maximum} characters and no NUL")
    return value


def _integer(value: int, name: str, minimum: int, maximum: int) -> int:
    if type(value) is not int or not minimum <= value <= maximum:
        raise ValueError(f"{name} must be an integer in {minimum}..{maximum}")
    return value


def _day(value: str | None) -> str:
    if value is None:
        return _today()
    if not isinstance(value, str):
        raise ValueError("day must be an ISO date (YYYY-MM-DD)")
    try:
        parsed = date.fromisoformat(value)
    except ValueError as exc:
        raise ValueError("day must be an ISO date (YYYY-MM-DD)") from exc
    if parsed.isoformat() != value:
        raise ValueError("day must be an ISO date (YYYY-MM-DD)")
    return value


class Store:
    """File-backed store. ``:memory:`` is unsupported across separate connections.

    ``scope`` is an opaque caller-generated session/user key (1..512 characters).
    Memory text is trimmed and limited to 500 characters. Daily experience is
    tracked against each activity's date, so out-of-order events cannot reset it.
    """

    def __init__(self, db_path: str | Path):
        if str(db_path) == ":memory:":
            raise ValueError("Use a filesystem path; in-memory databases are unsupported")
        self.db_path = Path(db_path)
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        self._initialize()

    @contextmanager
    def _connection(self) -> Iterator[sqlite3.Connection]:
        connection = sqlite3.connect(self.db_path, timeout=30, isolation_level=None)
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

    def _initialize(self) -> None:
        with self._write() as connection:
            version = connection.execute("PRAGMA user_version").fetchone()[0]
            if version not in (0, SCHEMA_VERSION):
                raise ValueError(
                    f"Unsupported database schema version {version}; expected {SCHEMA_VERSION}"
                )
            if version == SCHEMA_VERSION:
                return
            tables = connection.execute(
                "SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%'"
            ).fetchall()
            if tables:
                raise ValueError("Refusing to initialize an existing unversioned database")
            connection.execute(
                "CREATE TABLE memories ("
                "id INTEGER PRIMARY KEY AUTOINCREMENT, scope TEXT NOT NULL, "
                "kind TEXT NOT NULL, text TEXT NOT NULL, created_at TEXT NOT NULL, "
                "UNIQUE(scope, kind, text))"
            )
            connection.execute(
                "CREATE TABLE profiles (scope TEXT PRIMARY KEY, "
                "xp INTEGER NOT NULL DEFAULT 0 CHECK(xp >= 0))"
            )
            connection.execute(
                "CREATE TABLE activities (scope TEXT NOT NULL, event_id TEXT NOT NULL, "
                "activity TEXT NOT NULL, day TEXT NOT NULL, "
                "awarded INTEGER NOT NULL CHECK(awarded >= 0), created_at TEXT NOT NULL, "
                "PRIMARY KEY(scope, event_id))"
            )
            connection.execute("CREATE INDEX activity_day ON activities(scope, day)")
            connection.execute(f"PRAGMA user_version = {SCHEMA_VERSION}")

    @staticmethod
    def _status(connection: sqlite3.Connection, scope: str, day: str) -> dict:
        # One SELECT gives a consistent read even when another caller is writing.
        row = connection.execute(
            "SELECT COALESCE((SELECT xp FROM profiles WHERE scope = ?), 0) AS xp, "
            "(SELECT MAX(day) FROM activities WHERE scope = ?) AS last_activity_day, "
            "COALESCE((SELECT SUM(awarded) FROM activities WHERE scope = ? AND day = ?), "
            "0) AS daily_xp",
            (scope, scope, scope, day),
        ).fetchone()
        return dict(row)

    def status(self, scope: str) -> dict:
        """Return total XP and today's XP in UTC+8; absent scopes start at zero."""
        scope = _text(scope, "scope", 512)
        with self._connection() as connection:
            return self._status(connection, scope, _today())

    def add_memory(self, scope: str, text: str, kind: str = "fact") -> int:
        """Save an explicit fact, preference, or episode, returning a stable ID."""
        scope = _text(scope, "scope", 512)
        text = _text(text, "text", 500)
        if not isinstance(kind, str) or kind not in MEMORY_KINDS:
            raise ValueError("kind must be fact, preference, or episode")
        with self._write() as connection:
            connection.execute(
                "INSERT INTO memories(scope, kind, text, created_at) VALUES (?, ?, ?, ?) "
                "ON CONFLICT(scope, kind, text) DO NOTHING",
                (scope, kind, text, _timestamp()),
            )
            row = connection.execute(
                "SELECT id FROM memories WHERE scope = ? AND kind = ? AND text = ?",
                (scope, kind, text),
            ).fetchone()
            return row["id"]

    def list_memories(self, scope: str, limit: int = 20) -> list[dict]:
        """Return newest explicit memories first, excluding other scopes."""
        scope = _text(scope, "scope", 512)
        limit = _integer(limit, "limit", 1, 50)
        with self._connection() as connection:
            rows = connection.execute(
                "SELECT id, kind, text, created_at FROM memories "
                "WHERE scope = ? ORDER BY id DESC LIMIT ?",
                (scope, limit),
            ).fetchall()
            return [dict(row) for row in rows]

    def forget_memory(self, scope: str, id: int) -> bool:
        """Delete only a memory owned by this scope; return whether it existed."""
        scope = _text(scope, "scope", 512)
        id = _integer(id, "id", 1, 2**63 - 1)
        with self._write() as connection:
            cursor = connection.execute(
                "DELETE FROM memories WHERE scope = ? AND id = ?", (scope, id)
            )
            return cursor.rowcount == 1

    def record_activity(
        self,
        scope: str,
        activity: str,
        event_id: str,
        *,
        day: str | None = None,
        points: int = 3,
        daily_cap: int = 12,
    ) -> dict:
        """Record a completed, caller-authorized activity exactly once per scope.

        ``activity`` is a caller-whitelisted identifier. ``event_id`` must be a
        stable platform message/event ID, not a random ID per delivery retry.
        Returns XP, daily XP for ``day``, awarded points, and a duplicate flag.
        Dates default to UTC+8. Replays never award additional experience.
        """
        scope = _text(scope, "scope", 512)
        activity = _text(activity, "activity", 64)
        event_id = _text(event_id, "event_id", 256)
        day = _day(day)
        points = _integer(points, "points", 0, 2**31 - 1)
        daily_cap = _integer(daily_cap, "daily_cap", 0, 2**31 - 1)
        with self._write() as connection:
            existing = connection.execute(
                "SELECT 1 FROM activities WHERE scope = ? AND event_id = ?",
                (scope, event_id),
            ).fetchone()
            state = self._status(connection, scope, day)
            if existing:
                return {**state, "awarded": 0, "duplicate": True}
            awarded = min(points, max(0, daily_cap - state["daily_xp"]))
            connection.execute(
                "INSERT INTO activities(scope, event_id, activity, day, awarded, created_at) "
                "VALUES (?, ?, ?, ?, ?, ?)",
                (scope, event_id, activity, day, awarded, _timestamp()),
            )
            connection.execute(
                "INSERT INTO profiles(scope, xp) VALUES (?, ?) "
                "ON CONFLICT(scope) DO UPDATE SET xp = xp + excluded.xp",
                (scope, awarded),
            )
            return {
                **self._status(connection, scope, day),
                "awarded": awarded,
                "duplicate": False,
            }
