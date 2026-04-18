# SonarQube Local Run and Operations Guide

This document summarizes how to run the SonarQube stack under `common-archetecture/TOOL/SonarQube`, generate reports, and operate it locally.

This setup is treated as an independent support tool and is not part of the standard startup flow for the main foundation modules.

## 1. Purpose

The purpose of this setup is to provide the following in a local environment.

- Run SonarQube itself
- Run PostgreSQL for SonarQube
- Provide an HTML report generation API powered by `SonarHtmlExport.py`

Expected use cases:

- View SonarQube analysis results in the UI
- Export HTML reports for already analyzed projects
- Perform local verification and supplemental quality checks

Out of scope:

- Integration into the standard startup flow of the foundation modules
- Integration into the normal `docker/stack.sh` development workflow

## 2. Configuration Overview

This setup uses the following three services.

| Service | Role | Notes |
|---|---|---|
| `sonarqube` | SonarQube server | `http://localhost:9000` |
| `db` | PostgreSQL for SonarQube | Stores SonarQube persistent data |
| `sonar-report-api` | HTML report generation API | Executes `SonarHtmlExport.py` over HTTP |

Connection flow:

- `sonarqube` connects to `db` to store metadata
- `sonar-report-api` connects to `sonarqube` to fetch analysis data
- `sonar-report-api` saves generated HTML into a local directory

## 3. Directory Structure

```text
common-archetecture/TOOL/SonarQube/
├── docker-compose.yml
├── README.md
├── README_en.md
└── SonarQubeScriptContainer/
    ├── Dockerfile
    ├── report_api.py
    ├── SonarHtmlExport.py
    └── requirements.txt
```

Main files:

- `docker-compose.yml`: startup definition for the whole SonarQube stack
- `SonarQubeScriptContainer/Dockerfile`: container definition for the report API
- `SonarQubeScriptContainer/report_api.py`: FastAPI-based report API
- `SonarQubeScriptContainer/SonarHtmlExport.py`: HTML report export script

Notes:

- `sonar-report-api` saves HTML files into `/reports`
- compose mounts `./SonarQubeScriptContainer/generated-reports:/reports`
- `generated-reports/` may be created automatically on first successful use

## 4. Prerequisites

| Item | Required | Notes |
|---|---|---|
| Docker Engine | Required | Must already be running |
| Docker Compose V2 | Required | `docker compose` must be available |
| Open port `9000` | Required | For the SonarQube UI |
| Open port `8080` | Optional | Default report API port, can be changed |
| SonarQube token | Conditionally required | Required for report API or direct script usage |

Notes:

- `SONAR_TOKEN` is not required if you only want to access the SonarQube UI
- `SONAR_TOKEN` is required if you want to start and use `sonar-report-api`
- HTML report generation requires the target project to already have analysis data in SonarQube

## 5. Notes About Configuration Files

The current layout has been consolidated under `common-archetecture/TOOL/SonarQube/`, but `docker-compose.yml` and `SonarQubeScriptContainer/Dockerfile` still contain references to `SonarQubeDev/...`.

Affected areas:

- `build.dockerfile` in `docker-compose.yml`
- `COPY` paths in `SonarQubeScriptContainer/Dockerfile`

Because of that, the file references may not match the rearranged directory layout exactly.

This document describes the current intended structure, but before running the stack you should confirm that the compose and Dockerfile paths are aligned with the actual directory layout.

## 6. Environment Variables

The main environment variables used by `sonar-report-api` are as follows.

| Variable | Required | Default | Purpose |
|---|---|---|---|
| `SONAR_TOKEN` | Required | none | Token used to access the SonarQube API |
| `SONAR_HOST_URL` | Optional | `http://sonarqube:9000` | SonarQube URL as seen from the report API container |
| `REPORT_API_KEY` | Optional | empty | Shared key used to protect the API |
| `REPORT_API_PORT` | Optional | `8080` | Host-side published port |
| `REPORT_TIMEOUT` | Optional | `20` | API timeout used during report generation |
| `REPORT_MAX_ISSUES` | Optional | `0` | Default maximum number of issues, `0` means all |
| `SONAR_EXPORT_SCRIPT_PATH` | Fixed in compose | `/app/SonarHtmlExport.py` | Script path inside the container |
| `REPORT_OUTPUT_DIR` | Fixed in compose | `/reports` | HTML output directory |

Operational rules:

- Keep `SONAR_TOKEN` server-side only and do not expose it to clients
- If the API is exposed beyond localhost, set `REPORT_API_KEY`
- If the API is shared externally, run it behind internal-only access, VPN, or a protected reverse proxy

## 7. Startup Procedure

### 7.1 Move to the working directory

```bash
cd common-archetecture/TOOL/SonarQube
```

### 7.2 Set required environment variables

If you want to start the report API as well:

```bash
export SONAR_TOKEN=<YOUR_SONAR_TOKEN>
export REPORT_API_KEY=<OPTIONAL_SHARED_KEY>
export REPORT_API_PORT=8080
```

Notes:

- `REPORT_API_KEY` is optional
- If `SONAR_HOST_URL` is omitted, the compose service name `sonarqube` is used through `http://sonarqube:9000`

### 7.3 Start the stack

```bash
docker compose up -d
```

If you want to follow logs directly:

```bash
docker compose up
```

### 7.4 Verify startup

```bash
docker compose ps
```

Expected result:

- `sonarqube-dev` is running
- `sonarqube-dev-db` is running
- `sonar-report-api` is running

Notes:

- SonarQube may take time to become ready, especially on first startup
- `db` typically stabilizes first, and then `sonarqube` becomes available afterward

## 8. Usage

### 8.1 Using the SonarQube UI

Access URL:

- SonarQube UI: `http://localhost:9000`

What to check:

- The SonarQube login screen is displayed
- The target project key exists
- The target project already has analysis results

Notes:

- The report API and direct export script depend on existing analysis results

### 8.2 Using the report API

Endpoints:

- `GET /health`
- `POST /generate`

Health check:

```bash
curl http://localhost:8080/health
```

Expected response:

```json
{"status":"ok"}
```

Example that returns HTML directly:

```bash
curl -X POST http://localhost:8080/generate \
  -H "Content-Type: application/json" \
  -H "X-API-Key: <OPTIONAL_SHARED_KEY>" \
  -d '{
    "project": "kyotsukiban-frontend",
    "branch": "main",
    "jp": true,
    "max_issues": 200
  }'
```

Example that returns JSON with the saved path:

```bash
curl -X POST http://localhost:8080/generate \
  -H "Content-Type: application/json" \
  -H "X-API-Key: <OPTIONAL_SHARED_KEY>" \
  -d '{
    "project": "kyotsukiban-frontend",
    "branch": "main",
    "download": true
  }'
```

Notes:

- If `REPORT_API_KEY` is not set, the `X-API-Key` header is not required
- If `download: true` is used, the API returns JSON instead of the HTML content

### 8.3 Using `SonarHtmlExport.py` directly

You can also run the script directly without using `sonar-report-api`.

Requirements:

- Python 3.x
- `requests` installed
- Access to the target SonarQube server
- A valid token and project key

Required arguments:

- `--project`
- `--token`

Main optional arguments:

- `--host`
- `--branch`
- `--output`
- `--timeout`
- `--max-issues`
- `--insecure`

Example:

```bash
python SonarQubeScriptContainer/SonarHtmlExport.py \
  --host http://localhost:9000 \
  --project BizFlow-BE \
  --token <YOUR_TOKEN> \
  --output sonar-report-BE.html
```

If TLS verification must be disabled in a self-signed environment:

```bash
python SonarQubeScriptContainer/SonarHtmlExport.py \
  --host https://localhost:9000 \
  --project BizFlow-BE \
  --token <YOUR_TOKEN> \
  --output sonar-report-BE.html \
  --insecure
```

## 9. Request Parameters

The `POST /generate` request body supports the following fields.

| Field | Required | Description |
|---|---|---|
| `project` | Required | SonarQube project key |
| `branch` | Optional | Target branch name |
| `jp` | Optional | Use Japanese labels when `true` |
| `max_issues` | Optional | Maximum number of issues to include |
| `insecure` | Optional | Disable TLS verification |
| `download` | Optional | Return JSON with saved path when `true` |

Notes:

- `project` is mandatory
- If `branch` is omitted, the API uses a `main`-equivalent display fallback
- `max_issues=0` means include all issues

## 10. Outputs

HTML reports generated by the report API are saved through the compose volume mount here:

```text
common-archetecture/TOOL/SonarQube/SonarQubeScriptContainer/generated-reports/
```

Filename pattern:

```text
<project>-<branch>-<timestamp>.html
```

Example:

```text
kyotsukiban-frontend-main-20260416T103000Z.html
```

When files are saved:

- After a successful `POST /generate`
- In both direct HTML response mode and `download: true` mode

## 11. Stop, Restart, and Reset

Stop:

```bash
docker compose down
```

Restart:

```bash
docker compose restart
```

Reset including volumes:

```bash
docker compose down -v
```

Warning:

- `down -v` removes persistent SonarQube and PostgreSQL data
- After that, SonarQube returns to a fresh state and may require reconfiguration or re-analysis

## 12. Operational Notes

- This setup is an independent tool and should be handled separately from the main project development flow
- Keep `SONAR_TOKEN` on the server side only
- If exposed externally, do not rely only on `REPORT_API_KEY`; restrict the exposure path itself
- HTML reports depend on existing analysis data in SonarQube and cannot be generated meaningfully for unanalyzed projects
- The report API is a wrapper around `SonarHtmlExport.py`; the real source of data is the SonarQube API

## 13. Troubleshooting

### 13.1 Startup fails with `SONAR_TOKEN must be set`

Cause:

- `SONAR_TOKEN` required by `sonar-report-api` is not set

Action:

```bash
export SONAR_TOKEN=<YOUR_SONAR_TOKEN>
docker compose up -d
```

### 13.2 `port is already allocated`

Cause:

- Port `9000` or `8080` is already being used by another process

Action:

- Stop the conflicting process
- Or change `REPORT_API_PORT`

Example:

```bash
export REPORT_API_PORT=18080
docker compose up -d
```

### 13.3 Cannot access the SonarQube UI

Possible causes:

- SonarQube is still starting
- `db` is not stable yet
- The container is restarting repeatedly

Checks:

```bash
docker compose ps
docker compose logs sonarqube
docker compose logs db
```

### 13.4 Report generation fails

Possible causes:

- Invalid token
- Project key does not exist
- SonarQube server is unreachable
- The target project has no analysis data

What to check:

- Value of `SONAR_TOKEN`
- The `project` name being sent
- `SONAR_HOST_URL`
- Whether the target project is visible in the SonarQube UI

### 13.5 Build or copy path mismatch after directory rearrangement

Cause:

- compose or Dockerfile still contains the old `SonarQubeDev/...` path

Check:

- `docker-compose.yml`
- `SonarQubeScriptContainer/Dockerfile`

Action:

- Update the references so they match the current `common-archetecture/TOOL/SonarQube/` layout

### 13.6 `SonarHtmlExport.py` fails when run directly

Possible causes:

- `requests` is not installed
- `--project` or `--token` was not provided
- The output path is not writable
- The SonarQube server cannot be reached

What to check:

- Python 3.x is available through `python`
- `pip install requests` has been run
- The target project key already has analysis results
- The specified output path is writable

## 14. Reference Files

- compose definition: [docker-compose.yml](./docker-compose.yml)
- report API: [SonarQubeScriptContainer/report_api.py](./SonarQubeScriptContainer/report_api.py)
- HTML export script: [SonarQubeScriptContainer/SonarHtmlExport.py](./SonarQubeScriptContainer/SonarHtmlExport.py)
- report API image definition: [SonarQubeScriptContainer/Dockerfile](./SonarQubeScriptContainer/Dockerfile)
