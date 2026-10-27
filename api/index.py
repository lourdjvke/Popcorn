"""Vercel serverless entrypoint for the MovieBox FastAPI application."""

from importlib.util import module_from_spec, spec_from_file_location
from pathlib import Path
import sys


_api_dir = Path(__file__).resolve().parents[1] / "artifacts" / "api-server"
_api_file = _api_dir / "moviebox_api_server.py"

if str(_api_dir) not in sys.path:
    sys.path.insert(0, str(_api_dir))

_spec = spec_from_file_location("moviebox_api_server", _api_file)
if _spec is None or _spec.loader is None:
    raise ImportError(f"Unable to load FastAPI application from {_api_file}")

_module = module_from_spec(_spec)
sys.modules[_spec.name] = _module
_spec.loader.exec_module(_module)

app = _module.app
