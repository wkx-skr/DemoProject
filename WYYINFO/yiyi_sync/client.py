"""Restricted HTTP access to LivingMemory's existing Page API."""

from __future__ import annotations

import http.client
import json
import re
import urllib.error
import urllib.parse
import urllib.request
from collections.abc import Callable
from typing import Any


class ClientError(RuntimeError):
    """A sanitized transport, authentication, or API validation failure."""

    def __init__(self, message: str, *, status_code: int | None = None) -> None:
        super().__init__(message)
        self.status_code = status_code


class _RejectRedirects(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        raise ClientError("HTTP redirects are not allowed.") from None


class LivingMemoryClient:
    """Use a fixed owner and explicit provenance for every imported record."""

    _PAGE = "/api/plug/astrbot_plugin_livingmemory/page"
    _MARKER = re.compile(r"\[WYY_DOUYIN:[0-9a-f]{64}\]")
    _MAX_RESPONSE_BYTES = 8 * 1024 * 1024
    _MAX_PAGES = 1000

    def __init__(
        self,
        base_url: str,
        username: str,
        password: str,
        *,
        session_id: str,
        persona_id: str | None,
        adapter_id: str,
        timeout: float = 30,
        token_supplier: Callable[[], str] | None = None,
    ) -> None:
        self.base_url = self._validate_base_url(base_url)
        if token_supplier is not None and not callable(token_supplier):
            raise ClientError("The session token supplier must be callable.")
        if not isinstance(username, str) or (token_supplier is None and not username.strip()):
            raise ClientError("A dashboard username is required.")
        if not isinstance(password, str) or (token_supplier is None and not password):
            raise ClientError("A dashboard password is required.")
        for value in (session_id, adapter_id):
            if not isinstance(value, str) or not value.strip() or value != value.strip():
                raise ClientError("A fixed session and adapter are required.")
        if persona_id is not None and (
            not isinstance(persona_id, str)
            or not persona_id.strip()
            or persona_id != persona_id.strip()
        ):
            raise ClientError("The fixed persona must be a nonempty string or null.")
        if isinstance(timeout, bool) or not isinstance(timeout, (float, int)):
            raise ClientError("The request timeout must be positive and finite.")
        if not 0 < timeout < float("inf"):
            raise ClientError("The request timeout must be positive and finite.")
        self.session_id = session_id
        self.persona_id = persona_id
        self.adapter_id = adapter_id
        self.timeout = timeout
        self._username = username
        self._password = password
        self._token_supplier = token_supplier
        self._token: str | None = None
        # Local tunnel requests must not inherit a system HTTP proxy.
        self._opener = urllib.request.build_opener(
            urllib.request.ProxyHandler({}), _RejectRedirects()
        )

    @staticmethod
    def _validate_base_url(value: str) -> str:
        if not isinstance(value, str) or not value or any(c.isspace() for c in value):
            raise ClientError("The API base URL is invalid.")
        if any(c in value for c in "\\?#") or any(ord(c) < 32 for c in value):
            raise ClientError("The API base URL is invalid.")
        try:
            parsed = urllib.parse.urlsplit(value)
            hostname = parsed.hostname
            port = parsed.port
        except ValueError:
            raise ClientError("The API base URL is invalid.") from None
        if (
            not hostname
            or parsed.username is not None
            or parsed.password is not None
            or parsed.query
            or parsed.fragment
            or parsed.path not in ("", "/")
            or (port is not None and port < 1)
        ):
            raise ClientError("The API base URL must be an origin without credentials.")
        if parsed.scheme != "https" and not (
            parsed.scheme == "http" and hostname in {"127.0.0.1", "localhost", "::1"}
        ):
            raise ClientError("Use HTTPS or an HTTP loopback SSH tunnel.")
        return urllib.parse.urlunsplit((parsed.scheme, parsed.netloc, "", "", ""))

    def login(self) -> None:
        """Authenticate without returning credentials or the resulting bearer token."""
        self._token = None
        if self._token_supplier is not None:
            try:
                token = self._token_supplier()
            except Exception:
                raise ClientError("The session token could not be obtained.") from None
        else:
            data = self._request_once(
                "POST",
                "/api/auth/login",
                payload={
                    "username": self._username,
                    "password": self._password,
                },
                authenticated=False,
            )
            token = data.get("token")
        if not isinstance(token, str) or not token or any(c.isspace() for c in token):
            raise ClientError("Authentication returned an invalid token.")
        self._token = token

    def _request_once(
        self,
        method: str,
        path: str,
        *,
        payload: dict[str, Any] | None = None,
        query: dict[str, Any] | None = None,
        authenticated: bool = True,
    ) -> dict[str, Any]:
        parameters = dict(query or {})
        parameters["adapter_id"] = self.adapter_id
        url = self.base_url + path + "?" + urllib.parse.urlencode(parameters)
        headers = {"Accept": "application/json"}
        if authenticated:
            if not self._token:
                raise ClientError("Authentication is required.")
            headers["Authorization"] = "Bearer " + self._token
        try:
            body = (
                None
                if payload is None
                else json.dumps(payload, ensure_ascii=False, allow_nan=False).encode("utf-8")
            )
        except (TypeError, ValueError, RecursionError):
            raise ClientError("The request is not valid JSON.") from None
        if body is not None:
            headers["Content-Type"] = "application/json"
        request = urllib.request.Request(url, data=body, headers=headers, method=method)
        try:
            with self._opener.open(request, timeout=self.timeout) as response:
                status_code = response.getcode()
                if not 200 <= status_code < 300:
                    raise ClientError("The API returned an HTTP error.", status_code=status_code)
                raw = response.read(self._MAX_RESPONSE_BYTES + 1)
        except urllib.error.HTTPError as exc:
            code = exc.code
            exc.close()
            raise ClientError("The API returned an HTTP error.", status_code=code) from None
        except (urllib.error.URLError, OSError, http.client.HTTPException, ValueError):
            # Neither URL errors nor server error bodies are safe diagnostics.
            raise ClientError("The API request could not be completed.") from None
        if len(raw) > self._MAX_RESPONSE_BYTES:
            raise ClientError("The API response is too large.")
        try:
            result = json.loads(raw)
        except (ValueError, UnicodeError, RecursionError):
            raise ClientError("The API response is not valid JSON.") from None
        if not isinstance(result, dict) or result.get("status") != "ok":
            raise ClientError("The API reported an unsuccessful operation.")
        data = result.get("data")
        if not isinstance(data, dict):
            raise ClientError("The API returned an invalid data object.")
        return data

    def _request(self, method: str, path: str, **kwargs: Any) -> dict[str, Any]:
        if not self._token:
            self.login()
        try:
            return self._request_once(method, path, **kwargs)
        except ClientError as exc:
            if exc.status_code != 401:
                raise
        # A rejected authentication request has not reached the plugin handler.
        # Timeouts and all other failures are deliberately never retried here.
        self.login()
        return self._request_once(method, path, **kwargs)

    def readiness(self) -> dict[str, Any]:
        data = self._request("GET", self._PAGE + "/readiness")
        if type(data.get("ready")) is not bool:
            raise ClientError("The API returned an invalid readiness result.")
        return data

    def _prepare_record(self, record: dict[str, Any]) -> tuple[dict[str, Any], str]:
        if not isinstance(record, dict) or not isinstance(record.get("metadata"), dict):
            raise ClientError("The memory record must include metadata.")
        content = record.get("content")
        if not isinstance(content, str) or not content.strip():
            raise ClientError("The memory record must include a stable text body.")
        markers = self._MARKER.findall(content)
        if len(markers) != 1:
            raise ClientError("The memory record must have exactly one source marker.")
        metadata = record["metadata"]
        for key in ("source_event_id", "source_url"):
            value = metadata.get(key)
            if not isinstance(value, str) or not value.strip() or value != value.strip():
                raise ClientError("The memory record must include stable source identifiers.")
        fixed = {
            "session_id": self.session_id,
            "session": self.session_id,
            "persona_id": self.persona_id,
            "persona": self.persona_id,
            "adapter_id": self.adapter_id,
        }
        for source in (record, metadata):
            if any(key in source and source[key] != value for key, value in fixed.items()):
                raise ClientError("The memory record conflicts with its fixed owner.")
        outgoing = {
            key: record[key]
            for key in (
                "content",
                "importance",
                "topics",
                "key_facts",
                "participants",
                "memory_type",
                "status",
            )
            if key in record
        }
        outgoing.update(session_id=self.session_id, persona_id=self.persona_id)
        outgoing["metadata"] = dict(metadata)
        outgoing["metadata"].update(
            session_id=self.session_id, persona_id=self.persona_id, adapter_id=self.adapter_id
        )
        try:
            outgoing = json.loads(json.dumps(outgoing, ensure_ascii=False, allow_nan=False))
        except (TypeError, ValueError, RecursionError):
            raise ClientError("The memory record is not valid JSON.") from None
        return outgoing, markers[0]

    @staticmethod
    def _count(data: dict[str, Any], name: str) -> int:
        value = data.get(name)
        if type(value) is not int or value < 0:
            raise ClientError("The API returned invalid import counts.")
        return value

    def import_record(self, record: dict[str, Any], dry_run: bool = False) -> dict[str, Any]:
        if type(dry_run) is not bool:
            raise ClientError("dry_run must be a JSON boolean.")
        prepared, _ = self._prepare_record(record)
        data = self._request(
            "POST",
            self._PAGE + "/memories/import",
            payload={
                "format": "json",
                "content": json.dumps([prepared], ensure_ascii=False),
                "dry_run": dry_run,
                "duplicate_strategy": "skip",
            },
        )
        if data.get("dry_run") is not dry_run or data.get("errors") != []:
            raise ClientError("The memory import returned errors or an invalid result.")
        if self._count(data, "remapped_session_count") != 0:
            raise ClientError("The memory import changed the requested session.")
        if self._count(data, "total") != 1:
            raise ClientError("The memory import returned an unexpected record count.")
        if dry_run:
            if (
                self._count(data, "invalid_count") != 0
                or self._count(data, "summary_required_count") != 0
                or self._count(data, "valid_count") != 1
            ):
                raise ClientError("The memory import preview rejected the fixed record.")
            duplicate = self._count(data, "duplicate_count")
            if duplicate > 1 or self._count(data, "planned_import_count") != 1 - duplicate:
                raise ClientError("The memory import preview returned inconsistent counts.")
        else:
            imported = self._count(data, "imported_count")
            skipped = self._count(data, "skipped_duplicate_count")
            ids = data.get("imported_ids")
            if (
                self._count(data, "failed_count") != 0
                or imported + skipped != 1
                or not isinstance(ids, list)
                or len(ids) != imported
                or any(type(value) is not int or value <= 0 for value in ids)
            ):
                raise ClientError("The memory import did not complete consistently.")
        return data

    @staticmethod
    def _normalize_content(value: str) -> str:
        return " ".join(value.split())

    def verify_record(self, memory_id: int, record: dict[str, Any]) -> bool:
        prepared, _ = self._prepare_record(record)
        if type(memory_id) is not int or memory_id <= 0:
            raise ClientError("A positive integer memory ID is required.")
        data = self._request(
            "GET",
            self._PAGE + "/memories/detail",
            query={
                "memory_id": memory_id,
            },
        )
        metadata = data.get("metadata")
        if (
            type(data.get("memory_id")) is not int
            or data["memory_id"] != memory_id
            or not isinstance(data.get("text"), str)
            or not isinstance(metadata, dict)
            or "session_id" not in data
            or "persona_id" not in data
            or data.get("session_id") != self.session_id
            or data.get("persona_id") != self.persona_id
        ):
            return False
        expected = prepared["metadata"]
        if any(
            key not in metadata or metadata[key] != expected[key]
            for key in ("session_id", "persona_id", "adapter_id", "source_event_id", "source_url")
        ):
            return False
        return self._normalize_content(data["text"]) == self._normalize_content(prepared["content"])

    def find_record(self, record: dict[str, Any]) -> int | None:
        prepared, marker = self._prepare_record(record)
        seen: set[int] = set()
        for page in range(1, self._MAX_PAGES + 1):
            data = self._request(
                "GET",
                self._PAGE + "/memories",
                query={
                    "session_id": self.session_id,
                    "keyword": marker,
                    "status": "all",
                    "page": page,
                    "page_size": 100,
                    "sort": "id_desc",
                },
            )
            items = data.get("items")
            if (
                not isinstance(items, list)
                or type(data.get("has_more")) is not bool
                or type(data.get("page")) is not int
                or data["page"] != page
            ):
                raise ClientError("The API returned an invalid memory listing.")
            for item in items:
                memory_id = item.get("id") if isinstance(item, dict) else None
                if type(memory_id) is not int or memory_id <= 0:
                    raise ClientError("The API returned an invalid memory ID.")
                if memory_id not in seen:
                    seen.add(memory_id)
                    if self.verify_record(memory_id, prepared):
                        return memory_id
            if not data["has_more"]:
                return None
            if not items:
                raise ClientError("The API returned an inconsistent memory listing.")
        raise ClientError("The memory listing exceeded the reconciliation limit.")
