import os

import uvicorn
from fastapi import FastAPI

from moviebox_api_server import app as imported_api


app = FastAPI(title="MovieBox API")


@app.get("/api/healthz")
async def managed_health():
    return {"status": "ok"}


app.mount("/api", imported_api)


if __name__ == "__main__":
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=int(os.environ.get("PORT", "8080")),
        proxy_headers=True,
        forwarded_allow_ips="*",
    )
