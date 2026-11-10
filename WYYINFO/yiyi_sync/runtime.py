"""Single-run locking and a short-lived SSH tunnel owned by the synchronizer."""

from contextlib import contextmanager
import os
import json
from pathlib import Path
import re
import socket
import subprocess
import time


class AlreadyRunning(RuntimeError):
    """Another synchronization process owns the same local outbox."""


def ssh_session_token(settings):
    """Issue a five-minute admin JWT inside an already-authorized SSH account.

    This is an administrative integration, not an official token CLI. The
    signing key stays on the server. The returned JWT has dashboard privileges
    and is held only in the current process, never in configuration or logs.
    """
    ssh = settings["ssh"]
    root = ssh.get("astrbot_root", "/opt/AstrBot")
    if (
        not isinstance(root, str)
        or not re.fullmatch(r"/[A-Za-z0-9_./-]+", root)
        or ".." in root.split("/")
    ):
        raise ValueError("Invalid AstrBot server path")
    key = Path(os.path.expandvars(ssh["key_path"])).expanduser().resolve()
    host, user = ssh["host"], ssh["user"]
    if any(
        not isinstance(v, str) or not re.fullmatch(r"[A-Za-z0-9_.:-]+", v) or v.startswith("-")
        for v in (host, user)
    ):
        raise ValueError("Invalid SSH host or user")
    script = """import json,time
from pathlib import Path
import jwt
root=Path(ROOT_LITERAL)
d=json.loads((root/'data/cmd_config.json').read_text(encoding='utf-8-sig'))['dashboard']
if d.get('password_change_required') or d.get('totp',{}).get('enable'):
 raise RuntimeError('Interactive dashboard authentication is required')
if not d.get('username') or not d.get('jwt_secret'):
 raise RuntimeError('Dashboard configuration is incomplete')
token=jwt.encode({'username':d['username'],'exp':int(time.time())+300,'auth_source':'ssh-owner-sync'},d['jwt_secret'],algorithm='HS256')
print(json.dumps({'token':token}))
""".replace("ROOT_LITERAL", repr(root))
    try:
        result = subprocess.run(
            [
                "ssh",
                "-T",
                "-i",
                str(key),
                "-o",
                "BatchMode=yes",
                "-o",
                "ConnectTimeout=10",
                "-o",
                "StrictHostKeyChecking=yes",
                f"{user}@{host}",
                root.rstrip("/") + "/.venv/bin/python",
                "-",
            ],
            input=script,
            capture_output=True,
            text=True,
            encoding="utf-8",
            timeout=20,
            creationflags=getattr(subprocess, "CREATE_NO_WINDOW", 0),
        )
        if result.returncode != 0:
            raise OSError("Server-side session creation failed")
        token = json.loads(result.stdout)["token"]
        if not isinstance(token, str) or len(token.split(".")) != 3:
            raise ValueError("Invalid server session response")
        return token
    except (OSError, ValueError, KeyError, subprocess.SubprocessError):
        raise OSError("Unable to create a short-lived SSH admin session") from None


@contextmanager
def single_run(path):
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("a+b") as handle:
        handle.seek(0, 2)
        if handle.tell() == 0:
            handle.write(b"0")
            handle.flush()
        handle.seek(0)
        try:
            if os.name == "nt":
                import msvcrt

                msvcrt.locking(handle.fileno(), msvcrt.LK_NBLCK, 1)
            else:
                import fcntl

                fcntl.flock(handle.fileno(), fcntl.LOCK_EX | fcntl.LOCK_NB)
        except OSError:
            raise AlreadyRunning("Another sync is running") from None
        try:
            yield
        finally:
            handle.seek(0)
            if os.name == "nt":
                msvcrt.locking(handle.fileno(), msvcrt.LK_UNLCK, 1)
            else:
                fcntl.flock(handle.fileno(), fcntl.LOCK_UN)


@contextmanager
def api_tunnel(settings):
    """Use an existing base URL or open one isolated SSH forward for this run."""
    if not settings.get("ssh"):
        yield settings["destination"]["base_url"]
        return
    ssh = settings["ssh"]
    host, user = ssh["host"], ssh["user"]
    if any(
        not isinstance(v, str)
        or not v
        or v.startswith("-")
        or any(c.isspace() or c in "@/\\" for c in v)
        for v in (host, user)
    ):
        raise ValueError("Invalid SSH host or user")
    key = Path(os.path.expandvars(ssh["key_path"])).expanduser().resolve()
    if not key.is_file():
        raise ValueError("The configured SSH key file does not exist")
    port = ssh.get("remote_port", 6185)
    if type(port) is not int or not 1 <= port <= 65535:
        raise ValueError("Invalid remote API port")
    with socket.socket() as reservation:
        reservation.bind(("127.0.0.1", 0))
        local_port = reservation.getsockname()[1]
    arguments = [
        "ssh",
        "-N",
        "-T",
        "-i",
        str(key),
        "-o",
        "BatchMode=yes",
        "-o",
        "StrictHostKeyChecking=yes",
        "-o",
        "ExitOnForwardFailure=yes",
        "-o",
        "ConnectTimeout=10",
        "-o",
        "ServerAliveInterval=15",
        "-o",
        "ServerAliveCountMax=2",
        "-L",
        f"127.0.0.1:{local_port}:127.0.0.1:{port}",
        f"{user}@{host}",
    ]
    process = subprocess.Popen(
        arguments,
        stdin=subprocess.DEVNULL,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
        creationflags=getattr(subprocess, "CREATE_NO_WINDOW", 0),
    )
    try:
        deadline = time.monotonic() + 20
        while True:
            if process.poll() is not None:
                raise OSError("SSH tunnel failed; check the existing key and known host")
            try:
                with socket.create_connection(("127.0.0.1", local_port), timeout=0.5):
                    break
            except OSError:
                if time.monotonic() >= deadline:
                    raise OSError("SSH tunnel startup timed out") from None
                time.sleep(0.1)
        yield f"http://127.0.0.1:{local_port}"
    finally:
        if process.poll() is None:
            process.terminate()
        try:
            process.wait(timeout=5)
        except subprocess.TimeoutExpired:
            process.kill()
            process.wait(timeout=5)
