from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from server.config import ensure_upload_dir
from server.routers import audit, health

# ---------------------------------------------------------------------------
# App factory
# ---------------------------------------------------------------------------
app = FastAPI(
    title="UI/UX AI Auditor API",
    description="Upload a UI screenshot and receive an AI-powered audit report.",
    version="1.0.0",
)

# CORS — allow all origins during development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Restrict in production
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(audit.router)
app.include_router(health.router)

# Ensure upload directory exists on startup
ensure_upload_dir()
