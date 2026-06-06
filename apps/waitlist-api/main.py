"""Cluely OS Waitlist API — stores signups in a local SQLite database."""

import os
import re
import sqlite3
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, EmailStr, field_validator

DB_PATH = os.environ.get("DB_PATH", "/data/waitlist.db")


def get_db() -> sqlite3.Connection:
    Path(DB_PATH).parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA foreign_keys=ON")
    return conn


def init_db() -> None:
    conn = get_db()
    conn.execute("""
        CREATE TABLE IF NOT EXISTS waitlist (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            referrer TEXT,
            created_at TEXT NOT NULL DEFAULT (datetime('now'))
        )
    """)
    conn.commit()
    conn.close()


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(
    title="Cluely OS Waitlist API",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

EMAIL_RE = re.compile(r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$")


class WaitlistSignup(BaseModel):
    name: str
    email: str
    referrer: str | None = None

    @field_validator("email")
    @classmethod
    def validate_email(cls, v: str) -> str:
        v = v.strip().lower()
        if not EMAIL_RE.match(v):
            raise ValueError("Invalid email address")
        return v

    @field_validator("name")
    @classmethod
    def validate_name(cls, v: str) -> str:
        v = v.strip()
        if len(v) < 1 or len(v) > 200:
            raise ValueError("Name must be between 1 and 200 characters")
        return v


class WaitlistResponse(BaseModel):
    message: str
    position: int


class StatsResponse(BaseModel):
    total_signups: int


@app.post("/api/waitlist", response_model=WaitlistResponse)
async def join_waitlist(signup: WaitlistSignup):
    conn = get_db()
    try:
        existing = conn.execute(
            "SELECT id FROM waitlist WHERE email = ?", (signup.email,)
        ).fetchone()
        if existing:
            position = conn.execute(
                "SELECT COUNT(*) as cnt FROM waitlist WHERE id <= ?",
                (existing["id"],),
            ).fetchone()["cnt"]
            return WaitlistResponse(
                message="You're already on the waitlist! We'll notify you when Cluely OS launches.",
                position=position,
            )

        cursor = conn.execute(
            "INSERT INTO waitlist (name, email, referrer, created_at) VALUES (?, ?, ?, ?)",
            (signup.name, signup.email, signup.referrer, datetime.now(timezone.utc).isoformat()),
        )
        conn.commit()
        position = cursor.lastrowid or 1
        return WaitlistResponse(
            message="You're on the list! We'll notify you when Cluely OS launches.",
            position=position,
        )
    except sqlite3.IntegrityError:
        raise HTTPException(status_code=409, detail="Email already registered")
    finally:
        conn.close()


@app.get("/api/waitlist/stats", response_model=StatsResponse)
async def waitlist_stats():
    conn = get_db()
    try:
        row = conn.execute("SELECT COUNT(*) as cnt FROM waitlist").fetchone()
        return StatsResponse(total_signups=row["cnt"])
    finally:
        conn.close()


@app.get("/api/health")
async def health():
    return {"status": "ok", "service": "cluely-os-waitlist"}


# Serve the landing page static files
landing_dir = Path(__file__).parent.parent / "landing"
if landing_dir.exists():
    app.mount("/", StaticFiles(directory=str(landing_dir), html=True), name="static")
