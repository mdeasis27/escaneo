"""Benchmark — mirrors lib/escaneo/benchmark.py."""

from __future__ import annotations

from .extract import extract_fields
from .validate import validate_fields

FIELDS = ["reference", "amount", "currency", "date", "account"]


def _rate(a: int, b: int) -> float:
    return 0.0 if b == 0 else a / b


def benchmark(documents: list[dict]) -> dict:
    total_fields = 0
    correct_fields = 0
    corrupt_fields = 0
    caught = 0
    false_positives = 0

    for doc in documents:
        extracted = extract_fields(doc["ocrText"])
        verdict = validate_fields(extracted)
        flagged = {v["field"] for v in verdict["violations"]}

        for field in FIELDS:
            total_fields += 1
            corrupt = extracted[field] != doc["clean"][field]
            if corrupt:
                corrupt_fields += 1
                if field in flagged:
                    caught += 1
            else:
                correct_fields += 1
                if field in flagged:
                    false_positives += 1

    return {
        "totalFields": total_fields,
        "corruptFields": corrupt_fields,
        "correctFields": correct_fields,
        "rawAccuracy": _rate(correct_fields, total_fields),
        "caught": caught,
        "falsePositives": false_positives,
        "recall": _rate(caught, corrupt_fields),
        "effectiveAccuracy": _rate(correct_fields + caught, total_fields),
        "n": len(documents),
    }


def document_outcomes(documents: list[dict], level: int | None = None) -> list[dict]:
    """Per receipt at a check level: served, held, lost (broken but accepted) or false-hold."""
    out = []
    for doc in documents:
        extracted = extract_fields(doc["ocrText"])
        broken = any(extracted[field] != doc["clean"][field] for field in FIELDS)
        verdict = validate_fields(extracted) if level is None else validate_fields(extracted, level)
        held = not verdict["ok"]
        status = ("held" if held else "lost") if broken else ("false-hold" if held else "served")
        out.append({"id": doc["id"], "status": status})
    return out
