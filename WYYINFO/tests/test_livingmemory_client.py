"""Transport and ownership checks without a real AstrBot server."""

from __future__ import annotations

import copy
import io
import json
import threading
import unittest
import urllib.error
import urllib.parse
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from unittest.mock import patch

from yiyi_sync.client import ClientError, LivingMemoryClient


MARKER = "[WYY_DOUYIN:" + "a" * 64 + "]"
TOKEN = "private-test-token"
PASSWORD = "private-test-password"


def record():
    return {
        "content": "外部视频资料，未经独立核实。\n" + MARKER + "\n主题：厨房里的科学。",
        "session_id": "test:FriendMessage:owner",
        "persona_id": "test-persona",
        "importance": 0.5,
        "metadata": {
            "adapter_id": "test",
            "source_event_id": "douyin:123",
            "source_url": "https://www.douyin.com/video/123",
        },
    }


def ok(data):
    return {"status": "ok", "data": data}


def imported(**changes):
    result = {
        "dry_run": False,
        "total": 1,
        "imported_count": 1,
        "skipped_duplicate_count": 0,
        "failed_count": 0,
        "imported_ids": [41],
        "remapped_session_count": 0,
        "errors": [],
    }
    result.update(changes)
    return result


def preview(**changes):
    result = {
        "dry_run": True,
        "total": 1,
        "valid_count": 1,
        "invalid_count": 0,
        "duplicate_count": 0,
        "summary_required_count": 0,
        "planned_import_count": 1,
        "remapped_session_count": 0,
        "errors": [],
    }
    result.update(changes)
    return result


def detail(memory_id=41, source=None):
    source = source or record()
    metadata = copy.deepcopy(source["metadata"])
    metadata.update(session_id=source["session_id"], persona_id=source["persona_id"])
    return {
        "memory_id": memory_id,
        "text": source["content"],
        "metadata": metadata,
        "session_id": source["session_id"],
        "persona_id": source["persona_id"],
    }


class Response(io.BytesIO):
    def __init__(self, payload):
        super().__init__(payload if isinstance(payload, bytes) else json.dumps(payload).encode())

    def getcode(self):
        return 200


class ScriptedOpener:
    def __init__(self, responses):
        self.responses = list(responses)
        self.requests = []

    def open(self, request, timeout):
        self.requests.append(request)
        if not self.responses:
            raise AssertionError("Unexpected HTTP request")
        value = self.responses.pop(0)
        if isinstance(value, Exception):
            raise value
        return Response(value)


class LivingMemoryClientTests(unittest.TestCase):
    def make_client(self, responses=(), *, authenticated=True, **options):
        opener = ScriptedOpener(responses)
        configuration = {
            "base_url": "http://127.0.0.1:6186",
            "username": "test-user",
            "password": PASSWORD,
            "session_id": "test:FriendMessage:owner",
            "persona_id": "test-persona",
            "adapter_id": "test",
        }
        configuration.update(options)
        with patch("yiyi_sync.client.urllib.request.build_opener", return_value=opener):
            client = LivingMemoryClient(**configuration)
        if authenticated:
            client._token = TOKEN
        return client, opener

    def http_error(self, code):
        return urllib.error.HTTPError(
            "http://127.0.0.1/private",
            code,
            TOKEN + PASSWORD,
            {},
            io.BytesIO((TOKEN + PASSWORD).encode()),
        )

    def assert_sanitized(self, callback):
        with self.assertRaises(ClientError) as raised:
            callback()
        self.assertNotIn(TOKEN, str(raised.exception))
        self.assertNotIn(PASSWORD, str(raised.exception))

    def test_only_loopback_http_or_https_origins_are_accepted(self):
        for url in (
            "http://127.0.0.1:6186/",
            "http://localhost",
            "http://[::1]:6186",
            "https://example.test",
        ):
            with self.subTest(url=url):
                client, _ = self.make_client(base_url=url)
                self.assertFalse(client.base_url.endswith("/"))
        for url in (
            "http://example.test",
            "http://127.0.0.2",
            "http://localhost.example.test",
            "https://user:secret@example.test",
            "https://@example.test",
            "https://example.test?token=secret",
            "https://example.test?",
            "https://example.test#fragment",
            "https://example.test/api",
            "https://example.test:invalid",
            "ftp://localhost",
            "https://",
            "http://127.0.0.1\n.example.test",
            "https://example.test\\@localhost",
        ):
            with self.subTest(url=url), self.assertRaises(ClientError):
                self.make_client(base_url=url)

    def test_login_and_readiness_use_fixed_adapter_and_bearer(self):
        client, opener = self.make_client(
            [
                ok({"token": TOKEN}),
                ok({"ready": True, "state": "ready"}),
            ],
            authenticated=False,
        )
        self.assertIsNone(client.login())
        self.assertTrue(client.readiness()["ready"])
        login, request = opener.requests
        self.assertEqual(urllib.parse.urlsplit(login.full_url).path, "/api/auth/login")
        self.assertEqual(json.loads(login.data), {"username": "test-user", "password": PASSWORD})
        self.assertIsNone(login.get_header("Authorization"))
        self.assertEqual(request.get_header("Authorization"), "Bearer " + TOKEN)
        for entry in opener.requests:
            self.assertEqual(
                urllib.parse.parse_qs(urllib.parse.urlsplit(entry.full_url).query),
                {"adapter_id": ["test"]},
            )

    def test_401_logs_in_once_then_retries(self):
        client, opener = self.make_client(
            [
                self.http_error(401),
                ok({"token": "replacement"}),
                ok({"ready": True}),
            ]
        )
        self.assertTrue(client.readiness()["ready"])
        self.assertEqual(len(opener.requests), 3)
        self.assertEqual(opener.requests[-1].get_header("Authorization"), "Bearer replacement")

    def test_repeated_401_stops_without_authentication_loop(self):
        client, opener = self.make_client(
            [
                self.http_error(401),
                ok({"token": TOKEN}),
                self.http_error(401),
            ]
        )
        self.assert_sanitized(client.readiness)
        self.assertEqual(len(opener.requests), 3)

    def test_login_failure_does_not_retry_or_leak_server_body(self):
        client, opener = self.make_client([self.http_error(401)], authenticated=False)
        self.assert_sanitized(client.readiness)
        self.assertEqual(len(opener.requests), 1)

    def test_explicit_token_supplier_accepts_empty_password_without_login_request(self):
        calls = []

        def supply():
            calls.append(True)
            return TOKEN

        client, opener = self.make_client(
            [ok({"ready": True})],
            authenticated=False,
            username="",
            password="",
            token_supplier=supply,
        )
        self.assertTrue(client.readiness()["ready"])
        self.assertEqual(len(calls), 1)
        self.assertEqual(len(opener.requests), 1)
        path = urllib.parse.urlsplit(opener.requests[0].full_url).path
        self.assertTrue(path.endswith("/readiness"))
        self.assertEqual(opener.requests[0].get_header("Authorization"), "Bearer " + TOKEN)

    def test_supplier_401_refreshes_once_without_password_fallback(self):
        issued = iter([TOKEN, "replacement"])
        calls = []

        def supply():
            calls.append(True)
            return next(issued)

        client, opener = self.make_client(
            [self.http_error(401), ok({"ready": True})],
            authenticated=False,
            username="",
            password="",
            token_supplier=supply,
        )
        self.assertTrue(client.readiness()["ready"])
        self.assertEqual(len(calls), 2)
        self.assertEqual(len(opener.requests), 2)
        self.assertEqual(opener.requests[-1].get_header("Authorization"), "Bearer replacement")

    def test_supplier_exception_is_sanitized_and_never_falls_back(self):
        def supply():
            raise RuntimeError(TOKEN + PASSWORD)

        client, opener = self.make_client(
            authenticated=False,
            username="",
            password="",
            token_supplier=supply,
        )
        self.assert_sanitized(client.readiness)
        self.assertEqual(opener.requests, [])
        self.assertIsNone(client._token)

    def test_supplier_return_value_is_validated_without_exposing_it(self):
        for value in (None, "", " ", TOKEN + "\n" + PASSWORD, 42):
            with self.subTest(value_type=type(value).__name__):
                client, opener = self.make_client(
                    authenticated=False,
                    username="",
                    password="",
                    token_supplier=lambda: value,
                )
                self.assert_sanitized(client.readiness)
                self.assertEqual(opener.requests, [])

    def test_supplier_is_explicit_and_must_be_callable(self):
        for options in (
            {"username": "", "password": ""},
            {"token_supplier": "not-callable"},
        ):
            with self.subTest(options=options), self.assertRaises(ClientError):
                self.make_client(**options)

    def test_transport_and_http_failures_never_retry_write(self):
        for failure in (
            TimeoutError(TOKEN + PASSWORD),
            urllib.error.URLError(TOKEN + PASSWORD),
            self.http_error(503),
        ):
            with self.subTest(failure=type(failure).__name__):
                client, opener = self.make_client([failure])
                self.assert_sanitized(lambda: client.import_record(record()))
                self.assertEqual(len(opener.requests), 1)

    def test_error_envelopes_and_invalid_json_do_not_leak(self):
        for response in (
            {"status": "error", "message": TOKEN + PASSWORD, "data": {}},
            {"status": "ok", "data": TOKEN + PASSWORD},
            (TOKEN + PASSWORD).encode(),
            [],
        ):
            with self.subTest(response_type=type(response).__name__):
                client, _ = self.make_client([response])
                self.assert_sanitized(client.readiness)

    def test_import_fixes_owner_without_mutating_input(self):
        source = record()
        original = copy.deepcopy(source)
        client, opener = self.make_client([ok(imported())])
        self.assertEqual(client.import_record(source)["imported_ids"], [41])
        payload = json.loads(opener.requests[0].data)
        self.assertIs(payload["dry_run"], False)
        self.assertEqual(payload["duplicate_strategy"], "skip")
        self.assertEqual(payload["format"], "json")
        sent = json.loads(payload["content"])[0]
        self.assertEqual(sent["session_id"], client.session_id)
        self.assertEqual(sent["persona_id"], client.persona_id)
        self.assertEqual(sent["metadata"]["adapter_id"], client.adapter_id)
        self.assertEqual(sent["metadata"]["session_id"], client.session_id)
        self.assertEqual(source, original)

    def test_scope_spoofing_is_rejected_before_any_request(self):
        for container in ("top", "metadata"):
            for key in ("session_id", "session", "persona_id", "persona", "adapter_id"):
                with self.subTest(container=container, key=key):
                    source = record()
                    target = source if container == "top" else source["metadata"]
                    target[key] = "somebody-else"
                    client, opener = self.make_client()
                    with self.assertRaises(ClientError):
                        client.import_record(source)
                    self.assertEqual(opener.requests, [])

    def test_dry_run_requires_boolean_and_valid_single_record_preview(self):
        client, opener = self.make_client([ok(preview())])
        self.assertTrue(client.import_record(record(), dry_run=True)["dry_run"])
        self.assertIs(json.loads(opener.requests[0].data)["dry_run"], True)
        for value in ("false", 0, 1, None):
            with self.subTest(value=value):
                client, opener = self.make_client()
                with self.assertRaises(ClientError):
                    client.import_record(record(), dry_run=value)
                self.assertEqual(opener.requests, [])

    def test_partial_remapped_or_inconsistent_import_is_rejected(self):
        cases = (
            imported(failed_count=1),
            imported(errors=[{"error": TOKEN + PASSWORD}]),
            imported(remapped_session_count=1),
            imported(total=2),
            imported(imported_ids=[]),
            imported(imported_count=0),
            imported(imported_ids=[True]),
            imported(dry_run="false"),
            imported(failed_count=False),
        )
        for response in cases:
            with self.subTest(response=response):
                client, _ = self.make_client([ok(response)])
                self.assert_sanitized(lambda: client.import_record(record()))

    def test_invalid_summary_or_remapped_preview_is_rejected(self):
        cases = (
            preview(invalid_count=1),
            preview(summary_required_count=1),
            preview(remapped_session_count=1),
            preview(valid_count=0),
            preview(duplicate_count=2),
            preview(planned_import_count=0),
            preview(errors=[{"error": TOKEN + PASSWORD}]),
        )
        for response in cases:
            with self.subTest(response=response):
                client, _ = self.make_client([ok(response)])
                self.assert_sanitized(lambda: client.import_record(record(), dry_run=True))

    def test_duplicate_skip_is_returned_for_caller_reconciliation(self):
        client, _ = self.make_client(
            [
                ok(imported(imported_count=0, imported_ids=[], skipped_duplicate_count=1)),
            ]
        )
        self.assertEqual(client.import_record(record())["skipped_duplicate_count"], 1)

    def test_find_checks_each_detail_and_paginates(self):
        wrong = detail(42)
        wrong["metadata"]["source_event_id"] = "another-event"
        correct = detail()
        correct["text"] = "  " + correct["text"].replace("\n", "   ") + " \n"
        client, opener = self.make_client(
            [
                ok({"items": [{"id": 42}], "page": 1, "has_more": True}),
                ok(wrong),
                ok({"items": [{"id": 41}], "page": 2, "has_more": False}),
                ok(correct),
            ]
        )
        self.assertEqual(client.find_record(record()), 41)
        first = urllib.parse.parse_qs(urllib.parse.urlsplit(opener.requests[0].full_url).query)
        self.assertEqual(first["keyword"], [MARKER])
        self.assertEqual(first["session_id"], [client.session_id])
        self.assertEqual(first["adapter_id"], [client.adapter_id])
        self.assertEqual(len(opener.requests), 4)

    def test_empty_listing_returns_none(self):
        client, _ = self.make_client([ok({"items": [], "page": 1, "has_more": False})])
        self.assertIsNone(client.find_record(record()))

    def test_malformed_or_unbounded_listing_fails_closed(self):
        cases = (
            {"items": [], "page": 1, "has_more": True},
            {"items": [{"id": True}], "page": 1, "has_more": False},
            {"items": [], "page": 2, "has_more": False},
            {"items": [], "page": 1, "has_more": "false"},
        )
        for response in cases:
            with self.subTest(response=response):
                client, _ = self.make_client([ok(response)])
                with self.assertRaises(ClientError):
                    client.find_record(record())

    def test_repeated_ids_do_not_prevent_bounded_reconciliation(self):
        mismatched = detail(42)
        mismatched["metadata"]["source_url"] = "https://example.test/other"
        client, opener = self.make_client(
            [
                ok({"items": [{"id": 42}], "page": 1, "has_more": True}),
                ok(mismatched),
                ok({"items": [{"id": 42}], "page": 2, "has_more": True}),
            ]
        )
        client._MAX_PAGES = 2
        with self.assertRaises(ClientError):
            client.find_record(record())
        self.assertEqual(len(opener.requests), 3)

    def test_readiness_false_is_distinct_from_invalid_envelope(self):
        client, _ = self.make_client([ok({"ready": False, "state": "in_progress"})])
        self.assertIs(client.readiness()["ready"], False)
        client, _ = self.make_client([ok({"ready": "false"})])
        with self.assertRaises(ClientError):
            client.readiness()

    def test_detail_must_match_body_owner_and_source(self):
        changes = (
            ("text", "changed text"),
            ("memory_id", 42),
            ("session_id", "other"),
            ("persona_id", "other"),
            ("metadata.session_id", "other"),
            ("metadata.persona_id", "other"),
            ("metadata.adapter_id", "other"),
            ("metadata.source_event_id", "other"),
            ("metadata.source_url", "other"),
        )
        for key, value in changes:
            with self.subTest(key=key):
                response = detail()
                if key.startswith("metadata."):
                    response["metadata"][key.split(".")[1]] = value
                else:
                    response[key] = value
                client, _ = self.make_client([ok(response)])
                self.assertFalse(client.verify_record(41, record()))

    def test_missing_or_ambiguous_provenance_cannot_be_acknowledged(self):
        for key in ("source_event_id", "source_url"):
            source = record()
            del source["metadata"][key]
            client, opener = self.make_client()
            with self.assertRaises(ClientError):
                client.find_record(source)
            self.assertEqual(opener.requests, [])
        for content in ("no marker", MARKER + MARKER):
            source = record()
            source["content"] = content
            client, _ = self.make_client()
            with self.assertRaises(ClientError):
                client.find_record(source)

    def test_real_cross_origin_redirect_is_rejected_before_token_leak(self):
        received = []

        class Sink(BaseHTTPRequestHandler):
            def do_GET(self):
                received.append(dict(self.headers))
                self.send_response(200)
                self.end_headers()

            def log_message(self, *args):
                pass

        sink = ThreadingHTTPServer(("127.0.0.1", 0), Sink)
        redirect_url = "http://127.0.0.1:" + str(sink.server_port) + "/capture"

        class Redirect(BaseHTTPRequestHandler):
            def do_GET(self):
                self.send_response(302)
                self.send_header("Location", redirect_url)
                self.end_headers()

            def log_message(self, *args):
                pass

        origin = ThreadingHTTPServer(("127.0.0.1", 0), Redirect)
        threads = [
            threading.Thread(target=server.serve_forever, daemon=True) for server in (sink, origin)
        ]
        for thread in threads:
            thread.start()
        try:
            client = LivingMemoryClient(
                "http://127.0.0.1:" + str(origin.server_port),
                "test-user",
                PASSWORD,
                session_id="test:FriendMessage:owner",
                persona_id="test-persona",
                adapter_id="test",
            )
            client._token = TOKEN
            self.assert_sanitized(client.readiness)
            self.assertEqual(received, [])
        finally:
            for server in (sink, origin):
                server.shutdown()
                server.server_close()
            for thread in threads:
                thread.join(timeout=2)


if __name__ == "__main__":
    unittest.main()
