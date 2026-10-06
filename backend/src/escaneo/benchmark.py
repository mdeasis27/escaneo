"""Benchmark — mirrors lib/escaneo/benchmark.py."""

from __future__ import annotations

from .extract import extract_fields
from .validate import CHECKS, validate_fields

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
    """Per receipt at a check level: served, held, lost (broken but accepted) or false-hold,
    plus the first misread field and the first check (in CHECKS order) that holds the receipt."""
    if level is None:
        level = len(CHECKS)
    out = []
    for doc in documents:
        extracted = extract_fields(doc["ocrText"])
        field = next((f for f in FIELDS if extracted[f] != doc["clean"][f]), None)
        held = not validate_fields(extracted, level)["ok"]
        caught_by = next((CHECKS[l - 1] for l in range(1, level + 1) if not validate_fields(extracted, l)["ok"]), None) if held else None
        status = ("held" if held else "lost") if field else ("false-hold" if held else "served")
        misread = {"field": field, "read": extracted[field], "clean": doc["clean"][field]} if field else None
        out.append({"id": doc["id"], "status": status, "misread": misread, "caughtBy": caught_by})
    return out
