"""Extraction — mirrors lib/escaneo/extract.py."""

from __future__ import annotations

import re


def extract_fields(ocr_text: str) -> dict:
    def get(key: str) -> str:
        m = re.search(rf"^{key}\s+(.+)$", ocr_text, re.MULTILINE)
        return m.group(1).strip() if m else ""

    return {
        "reference": get("reference"),
        "amount": get("amount"),
        "currency": get("currency"),
        "date": get("date"),
        "account": get("account"),
    }
