"""Keep desktop credentials bound to the current Windows account with DPAPI."""

import base64
import ctypes
import os
from ctypes import wintypes


class _Blob(ctypes.Structure):
    _fields_ = [("size", wintypes.DWORD), ("data", ctypes.POINTER(ctypes.c_ubyte))]


def _transform(value: bytes, *, decrypt: bool) -> bytes:
    if os.name != "nt":
        raise OSError("DPAPI credentials require the original Windows account")
    crypt = ctypes.WinDLL("crypt32", use_last_error=True)
    kernel = ctypes.WinDLL("kernel32", use_last_error=True)
    function = crypt.CryptUnprotectData if decrypt else crypt.CryptProtectData
    function.argtypes = [
        ctypes.POINTER(_Blob),
        ctypes.c_void_p,
        ctypes.c_void_p,
        ctypes.c_void_p,
        ctypes.c_void_p,
        wintypes.DWORD,
        ctypes.POINTER(_Blob),
    ]
    function.restype = wintypes.BOOL
    kernel.LocalFree.argtypes = [ctypes.c_void_p]
    kernel.LocalFree.restype = ctypes.c_void_p
    buffer = ctypes.create_string_buffer(value)
    source = _Blob(len(value), ctypes.cast(buffer, ctypes.POINTER(ctypes.c_ubyte)))
    result = _Blob()
    if not function(ctypes.byref(source), None, None, None, None, 1, ctypes.byref(result)):
        raise OSError("Unable to access account-protected credentials")
    try:
        return ctypes.string_at(result.data, result.size)
    finally:
        kernel.LocalFree(result.data)


def protect(password: str) -> str:
    return base64.b64encode(_transform(password.encode("utf-8"), decrypt=False)).decode("ascii")


def password_from(settings: dict) -> str:
    if settings.get("password_dpapi"):
        raw = base64.b64decode(settings["password_dpapi"], validate=True)
        return _transform(raw, decrypt=True).decode("utf-8")
    name = settings.get("password_env")
    if not isinstance(name, str) or not name or not os.environ.get(name):
        raise ValueError("Configure password_dpapi or a nonempty password_env")
    return os.environ[name]
