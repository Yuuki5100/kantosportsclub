FROM python:3.12-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    REPORT_OUTPUT_DIR=/reports \
    SONAR_EXPORT_SCRIPT_PATH=/app/SonarHtmlExport.py

COPY SonarQubeScriptContainer/requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r /app/requirements.txt

COPY SonarQubeScriptContainer/report_api.py /app/report_api.py
COPY SonarQubeScriptContainer/SonarHtmlExport.py /app/SonarHtmlExport.py
COPY SonarQubeScriptContainer/templates /app/templates

RUN mkdir -p /reports

EXPOSE 8080

CMD ["uvicorn", "report_api:app", "--host", "0.0.0.0", "--port", "8080"]
