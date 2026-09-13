"""
Pharmaceutical QA Complaint Intake — FastAPI + LangGraph + Groq backend.

Run:
  cd backend && pip install -r requirements.txt
  export GROQ_API_KEY="your-key"
  uvicorn main:app --reload --port 8000
"""

import json
import os
import re
from typing import TypedDict, Optional, Any

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# ---------------------------------------------------------------------------
# LangGraph + Groq
# ---------------------------------------------------------------------------
from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage, SystemMessage
from langgraph.graph import StateGraph, END

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------
GROQ_API_KEY = "gsk_usVd5gZLDGAvOV1l9akiWGdyb3FYgvfffq7XlTByMVzBsnxe5DH9e"
GROQ_MODEL = "gemma2-9b-it"

# If no key is set we fall back to a rule-based parser so the app still works.
USE_MOCK = not GROQ_API_KEY

app = FastAPI(title="PharmaQA AI Complaint Intake")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Request / response models
# ---------------------------------------------------------------------------
class ParseRequest(BaseModel):
    text: str


class ParsedComplaint(BaseModel):
    customer_name: Optional[str] = None
    product_name: Optional[str] = None
    batch_lot_number: Optional[str] = None
    manufacturing_date: Optional[str] = None
    expiry_date: Optional[str] = None
    quantity_affected: Optional[int] = None
    complaint_type: Optional[str] = None
    description: Optional[str] = None
    severity: Optional[str] = None
    priority: Optional[str] = None


# ---------------------------------------------------------------------------
# LangGraph state
# ---------------------------------------------------------------------------
class GraphState(TypedDict):
    text: str
    parsed: dict[str, Any]
    error: Optional[str]


# ---------------------------------------------------------------------------
# LLM parsing node
# ---------------------------------------------------------------------------
SYSTEM_PROMPT = """You are a pharmaceutical quality assurance assistant.
Your job is to extract structured complaint information from raw complaint text
and return it as a JSON object with these exact keys:

{
  "customer_name": string or null,
  "product_name": string or null,
  "batch_lot_number": string or null,
  "manufacturing_date": "YYYY-MM-DD" or null,
  "expiry_date": "YYYY-MM-DD" or null,
  "quantity_affected": integer or null,
  "complaint_type": one of ["Product Quality", "Packaging", "Labeling", "Efficacy", "Adverse Event", "Other"] or null,
  "description": string or null,
  "severity": one of ["Critical", "Major", "Minor"] or null,
  "priority": one of ["Urgent", "High", "Medium", "Low"] or null
}

Rules:
- Return ONLY the JSON object, no markdown, no explanation.
- Use null for any field you cannot confidently extract.
- Infer complaint_type, severity, and priority from the description when not explicit.
- Dates must be in YYYY-MM-DD format.
- quantity_affected must be a plain integer (no units)."""

VALID_TYPES = {"Product Quality", "Packaging", "Labeling", "Efficacy", "Adverse Event", "Other"}
VALID_SEVERITIES = {"Critical", "Major", "Minor"}
VALID_PRIORITIES = {"Urgent", "High", "Medium", "Low"}


def _validate_enum(value: Any, valid: set[str]) -> Optional[str]:
    if not value or not isinstance(value, str):
        return None
    for v in valid:
        if v.lower() == value.strip().lower():
            return v
    for v in valid:
        if v.lower() in value.strip().lower() or value.strip().lower() in v.lower():
            return v
    return None


def _validate_date(value: Any) -> Optional[str]:
    if not value or not isinstance(value, str):
        return None
    # Try common date formats
    for fmt in ("%Y-%m-%d", "%d/%m/%Y", "%m/%d/%Y", "%d-%m-%Y", "%B %d, %Y", "%b %d, %Y"):
        try:
            from datetime import datetime
            return datetime.strptime(value.strip(), fmt).strftime("%Y-%m-%d")
        except (ValueError, TypeError):
            continue
    return None


def _clean_parsed(raw: dict) -> dict:
    """Validate and clean the parsed dict."""
    cleaned: dict[str, Any] = {}
    cleaned["customer_name"] = raw.get("customer_name") if isinstance(raw.get("customer_name"), str) else None
    cleaned["product_name"] = raw.get("product_name") if isinstance(raw.get("product_name"), str) else None
    cleaned["batch_lot_number"] = raw.get("batch_lot_number") if isinstance(raw.get("batch_lot_number"), str) else None
    cleaned["manufacturing_date"] = _validate_date(raw.get("manufacturing_date"))
    cleaned["expiry_date"] = _validate_date(raw.get("expiry_date"))

    qty = raw.get("quantity_affected")
    if isinstance(qty, int):
        cleaned["quantity_affected"] = qty
    elif isinstance(qty, str) and qty.isdigit():
        cleaned["quantity_affected"] = int(qty)
    else:
        cleaned["quantity_affected"] = None

    cleaned["complaint_type"] = _validate_enum(raw.get("complaint_type"), VALID_TYPES)
    cleaned["severity"] = _validate_enum(raw.get("severity"), VALID_SEVERITIES)
    cleaned["priority"] = _validate_enum(raw.get("priority"), VALID_PRIORITIES)
    cleaned["description"] = raw.get("description") if isinstance(raw.get("description"), str) else None
    return cleaned


def _extract_json(text: str) -> dict:
    """Best-effort JSON extraction from LLM output."""
    # Strip markdown code fences
    text = text.strip()
    if text.startswith("```"):
        text = re.sub(r"^```(?:json)?\s*", "", text)
        text = re.sub(r"\s*```$", "", text)
    # Find first { and last }
    start = text.find("{")
    end = text.rfind("}")
    if start != -1 and end != -1 and end > start:
        text = text[start : end + 1]
    return json.loads(text)


# ---------------------------------------------------------------------------
# LangGraph nodes
# ---------------------------------------------------------------------------
def llm_parse_node(state: GraphState) -> GraphState:
    """Parse complaint text using Groq + gemma2-9b-it."""
    try:
        llm = ChatGroq(
            model_name=GROQ_MODEL,
            temperature=0,
            groq_api_key=GROQ_API_KEY,
        )
        messages = [
            SystemMessage(content=SYSTEM_PROMPT),
            HumanMessage(content=f"Extract complaint fields from this text:\n\n{state['text']}"),
        ]
        response = llm.invoke(messages)
        raw = _extract_json(response.content)
        return {"text": state["text"], "parsed": _clean_parsed(raw), "error": None}
    except Exception as exc:
        return {"text": state["text"], "parsed": {}, "error": str(exc)}


def mock_parse_node(state: GraphState) -> GraphState:
    """Rule-based fallback parser when no Groq API key is set."""
    text = state["text"]
    parsed: dict[str, Any] = {}

    # Customer name
    m = re.search(r"(?:customer|client|hospital|clinic|pharmacy|from)\s*[:\-]\s*(.+)", text, re.I)
    if m:
        parsed["customer_name"] = m.group(1).strip().split("\n")[0].strip()

    # Product name
    m = re.search(r"(?:product|drug|medicine|item)\s*[:\-]\s*(.+)", text, re.I)
    if m:
        parsed["product_name"] = m.group(1).strip().split("\n")[0].strip()

    # Batch/lot
    m = re.search(r"(?:batch|lot)\s*(?:no\.?|number)?\s*[:\-]\s*([A-Z0-9\-]+)", text, re.I)
    if m:
        parsed["batch_lot_number"] = m.group(1).strip()

    # Manufacturing date
    m = re.search(r"(?:mfg|mfg\.?\s*date|manufacturing|manufactured)\s*[:\-]\s*(\d{4}-\d{2}-\d{2}|\d{2}/\d{2}/\d{4}|\d{2}-\d{2}-\d{4})", text, re.I)
    if m:
        parsed["manufacturing_date"] = _validate_date(m.group(1))

    # Expiry date
    m = re.search(r"(?:exp|exp\.?\s*date|expiry|expiration|expires?)\s*[:\-]\s*(\d{4}-\d{2}-\d{2}|\d{2}/\d{2}/\d{4}|\d{2}-\d{2}-\d{4})", text, re.I)
    if m:
        parsed["expiry_date"] = _validate_date(m.group(1))

    # Quantity affected
    m = re.search(r"(?:quantity|qty|amount|units?)\s*(?:affected)?\s*[:\-]\s*(\d+)", text, re.I)
    if m:
        parsed["quantity_affected"] = int(m.group(1))

    # Complaint type — keyword matching
    text_lower = text.lower()
    type_keywords = {
        "Product Quality": ["discolor", "crumbl", "dissolve", "contaminat", "defect", "odor", "smell", "quality"],
        "Packaging": ["packag", "box", "seal", "blister", "wrap", "broken", "damaged"],
        "Labeling": ["label", "mislabeled", "wrong label", "labeling"],
        "Efficacy": ["ineffective", "no effect", "not working", "efficacy", "potency"],
        "Adverse Event": ["adverse", "side effect", "reaction", "rash", "allergic", "hospitaliz", "patient harm"],
    }
    for ctype, keywords in type_keywords.items():
        if any(kw in text_lower for kw in keywords):
            parsed["complaint_type"] = ctype
            break
    if "complaint_type" not in parsed:
        parsed["complaint_type"] = "Other"

    # Severity inference
    if any(w in text_lower for w in ["critical", "life-threatening", "death", "severe", "patient harm", "adverse"]):
        parsed["severity"] = "Critical"
    elif any(w in text_lower for w in ["major", "significant", "serious", "damaged", "broken"]):
        parsed["severity"] = "Major"
    else:
        parsed["severity"] = "Minor"

    # Priority inference
    if parsed["severity"] == "Critical":
        parsed["priority"] = "Urgent"
    elif parsed["severity"] == "Major":
        parsed["priority"] = "High"
    else:
        parsed["priority"] = "Medium"

    # Description — use the full text if nothing specific
    parsed["description"] = text.strip()[:500]

    return {"text": state["text"], "parsed": parsed, "error": None}


# ---------------------------------------------------------------------------
# Build the LangGraph
# ---------------------------------------------------------------------------
def build_graph():
    workflow = StateGraph(GraphState)
    workflow.add_node("parse", llm_parse_node if not USE_MOCK else mock_parse_node)
    workflow.set_entry_point("parse")
    workflow.add_edge("parse", END)
    return workflow.compile()


graph = build_graph()


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------
@app.get("/api/health")
async def health():
    return {"status": "ok", "mode": "mock" if USE_MOCK else "groq", "model": GROQ_MODEL}


@app.post("/api/parse-complaint")
async def parse_complaint(req: ParseRequest):
    if not req.text.strip():
        raise HTTPException(status_code=400, detail="No complaint text provided")

    try:
        result = graph.invoke({"text": req.text, "parsed": {}, "error": None})
        parsed = result.get("parsed", {})
        error = result.get("error")

        # If LLM failed and we're in Groq mode, fall back to rule-based
        if error and not USE_MOCK:
            fallback = mock_parse_node({"text": req.text, "parsed": {}, "error": None})
            return {
                "parsed": fallback["parsed"],
                "source": "fallback",
                "warning": f"LLM parse failed, used rule-based fallback. Error: {error}",
            }

        return {"parsed": parsed, "source": "mock" if USE_MOCK else "groq", "warning": error}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Parse failed: {exc}")
