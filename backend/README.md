# PharmaQA Backend — FastAPI + LangGraph + Groq

## Setup

```bash
cd backend
pip install -r requirements.txt
export GROQ_API_KEY="your-groq-api-key"
uvicorn main:app --reload --port 8000
```

## Without a Groq API Key

If `GROQ_API_KEY` is not set, the backend automatically falls back to a rule-based
parser that uses regex and keyword matching to extract complaint fields. This lets
you run and test the full UI without any API key.

## Endpoints

- `GET /api/health` — health check, reports whether running in mock or groq mode
- `POST /api/parse-complaint` — accepts `{"text": "..."}` and returns structured JSON

## Architecture

The backend uses **LangGraph** to build a single-node graph:
1. **Entry** → `parse` node
2. **parse node** → calls Groq `gemma2-9b-it` (or rule-based fallback) to extract structured complaint data
3. **END** → returns validated JSON

The parsed output is validated against allowed enum values for `complaint_type`,
`severity`, and `priority`, and dates are normalized to `YYYY-MM-DD`.
