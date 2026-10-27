"""Vercel-compatible FastAPI entrypoint for the MovieBox API."""

from importlib.util import module_from_spec, spec_from_file_location
from pathlib import Path
import sys

from fastapi import FastAPI


_api_dir = Path(__file__).parent / "artifacts" / "api-server"
if str(_api_dir) not in sys.path:
    sys.path.insert(0, str(_api_dir))

_spec = spec_from_file_location("moviebox_api_server", _api_dir / "moviebox_api_server.py")
if _spec is None or _spec.loader is None:
    raise ImportError("Unable to load the MovieBox API module")

_module = module_from_spec(_spec)
sys.modules[_spec.name] = _module
_spec.loader.exec_module(_module)

# Expose the real FastAPI application directly. Vercel maps this file to the
# /api function prefix, so adding another /api mount would require /api/api/*
# and makes the documented /api/search and /api/stream routes unreachable.
app = _module.app


@app.get("/healthz")
async def healthz():
    return {"status": "ok"}
