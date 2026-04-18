#!/usr/bin/env python3
from __future__ import annotations

import os
import secrets
import subprocess
import sys
import tempfile
from datetime import datetime
from pathlib import Path
from typing import Optional

from fastapi import FastAPI, Form, Header, HTTPException, Request
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel, Field


BASE_DIR = Path(__file__).resolve().parent
TEMPLATES = Jinja2Templates(directory=str(BASE_DIR / "templates"))
SCRIPT_PATH = Path(os.getenv("SONAR_EXPORT_SCRIPT_PATH", "/app/SonarHtmlExport.py")).resolve()
REPORTS_DIR = Path(os.getenv("REPORT_OUTPUT_DIR", str(BASE_DIR / "generated-reports"))).resolve()
SONAR_HOST_URL = os.getenv("SONAR_HOST_URL", "http://localhost:9000")
SONAR_TOKEN = os.getenv("SONAR_TOKEN", "")
API_KEY = os.getenv("REPORT_API_KEY", "")
DEFAULT_TIMEOUT = os.getenv("REPORT_TIMEOUT", "20")
DEFAULT_MAX_ISSUES = os.getenv("REPORT_MAX_ISSUES", "0")


class ReportRequest(BaseModel):
    project: str = Field(..., min_length=1, description="SonarQube project key")
    branch: Optional[str] = Field(default=None, description="Optional branch name")
    jp: bool = Field(default=False, description="Render labels in Japanese")
    max_issues: int = Field(default=0, ge=0, description="Maximum issues to include, 0 means all")
    insecure: bool = Field(default=False, description="Disable TLS verification for SonarQube access")
    download: bool = Field(default=False, description="Return JSON with a saved report path instead of HTML")


def require_api_key(x_api_key: Optional[str]) -> None:
    if API_KEY and not secrets.compare_digest(x_api_key or "", API_KEY):
        raise HTTPException(status_code=401, detail="Unauthorized")


def sanitize_name(value: str) -> str:
    return "".join(ch if ch.isalnum() or ch in ("-", "_", ".") else "_" for ch in value)


def is_checked(value: Optional[str]) -> bool:
    if value is None:
        return False
    return value.lower() in {"1", "true", "on", "yes"}


def run_report(request: ReportRequest) -> tuple[str, Path]:
    if not SONAR_TOKEN:
        raise HTTPException(status_code=500, detail="SONAR_TOKEN is not configured on the server")
    if not SCRIPT_PATH.exists():
        raise HTTPException(status_code=500, detail=f"Script not found: {SCRIPT_PATH}")

    REPORTS_DIR.mkdir(parents=True, exist_ok=True)
    timestamp = datetime.utcnow().strftime("%Y%m%dT%H%M%SZ")
    branch_part = sanitize_name(request.branch) if request.branch else "main"
    file_name = f"{sanitize_name(request.project)}-{branch_part}-{timestamp}.html"
    final_path = REPORTS_DIR / file_name

    with tempfile.TemporaryDirectory(prefix="sonar-report-") as temp_dir:
        temp_path = Path(temp_dir) / "report.html"
        cmd = [
            sys.executable,
            str(SCRIPT_PATH),
            "--host",
            SONAR_HOST_URL,
            "--project",
            request.project,
            "--token",
            SONAR_TOKEN,
            "--output",
            str(temp_path),
            "--timeout",
            DEFAULT_TIMEOUT,
            "--max-issues",
            str(request.max_issues if request.max_issues is not None else DEFAULT_MAX_ISSUES),
        ]

        if request.branch:
            cmd.extend(["--branch", request.branch])
        if request.jp:
            cmd.append("--jp")
        if request.insecure:
            cmd.append("--insecure")

        result = subprocess.run(cmd, capture_output=True, text=True, check=False)
        if result.returncode != 0:
            detail = (result.stderr or result.stdout or "Report generation failed").strip()
            raise HTTPException(status_code=502, detail=detail)

        html_content = temp_path.read_text(encoding="utf-8")
        final_path.write_text(html_content, encoding="utf-8")
        return html_content, final_path


app = FastAPI(title="SonarQube HTML Report API", version="1.0.0")


@app.get("/", response_class=HTMLResponse)
def report_form(request: Request, error: str = ""):
    return TEMPLATES.TemplateResponse(
        request,
        "index.html",
        {
            "error": error,
            "defaults": {
                "project": "",
                "branch": "",
                "jp": False,
                "max_issues": "0",
                "insecure": False,
                "download": False,
                "api_key": "",
            },
        },
    )


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/generate-form", response_class=HTMLResponse)
def generate_report_form(
    request: Request,
    project: str = Form(...),
    branch: str = Form(""),
    jp: Optional[str] = Form(default=None),
    max_issues: int = Form(0),
    insecure: Optional[str] = Form(default=None),
    download: Optional[str] = Form(default=None),
    api_key: str = Form(default=""),
):
    defaults = {
        "project": project,
        "branch": branch,
        "jp": is_checked(jp),
        "max_issues": str(max_issues),
        "insecure": is_checked(insecure),
        "download": is_checked(download),
        "api_key": api_key,
    }

    if not project.strip():
        return TEMPLATES.TemplateResponse(
            request,
            "index.html",
            {"error": "Project key is required.", "defaults": defaults},
            status_code=400,
        )

    try:
        require_api_key(api_key)
        payload = ReportRequest(
            project=project.strip(),
            branch=branch.strip() or None,
            jp=defaults["jp"],
            max_issues=max_issues,
            insecure=defaults["insecure"],
            download=defaults["download"],
        )
        html_content, saved_path = run_report(payload)
    except HTTPException as exc:
        return TEMPLATES.TemplateResponse(
            request,
            "index.html",
            {
                "error": str(exc.detail),
                "defaults": defaults,
            },
            status_code=exc.status_code,
        )

    if payload.download:
        return HTMLResponse(
            content=(
                "<!doctype html>"
                "<html><head><meta charset='utf-8'><title>Report Generated</title></head>"
                "<body style='font-family: Arial, sans-serif; margin: 2rem;'>"
                "<h1>Report generated</h1>"
                f"<p>Project: <strong>{payload.project}</strong></p>"
                f"<p>Branch: <strong>{payload.branch or 'main'}</strong></p>"
                f"<p>Saved at: <code>{saved_path}</code></p>"
                "<p><a href='/'>Generate another report</a></p>"
                "</body></html>"
            )
        )

    return HTMLResponse(content=html_content)


@app.post("/generate", response_model=None)
def generate_report(payload: ReportRequest, x_api_key: Optional[str] = Header(default=None)):
    require_api_key(x_api_key)
    html_content, saved_path = run_report(payload)
    if payload.download:
        return JSONResponse(
            {
                "status": "ok",
                "project": payload.project,
                "branch": payload.branch or "main",
                "saved_report": str(saved_path),
            }
        )
    return HTMLResponse(content=html_content)
