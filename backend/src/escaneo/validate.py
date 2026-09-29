"""Validation — mirrors lib/escaneo/validate.py."""

from __future__ import annotations

import re

CURRENCIES = {"USD", "EUR", "MXN"}


def luhn_valid(s: str) -> bool:
    total = 0
    for i, ch in enumerate(reversed(s)):
        d = int(ch)
        if i % 2 == 1:
            d *= 2
            if d > 9:
                d -= 9
        total += d
    return total % 10 == 0


def _is_leap(y: int) -> bool:
    return (y % 4 == 0 and y % 100 != 0) or y % 400 == 0


def valid_date(s: str) -> bool:
    m = re.fullmatch(r"(\d{4})-(\d{2})-(\d{2})", s)
    if not m:
        return False
    y, mo, d = int(m.group(1)), int(m.group(2)), int(m.group(3))
    if mo < 1 or mo > 12:
        return False
    dim = [31, 29 if _is_leap(y) else 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
    return 1 <= d <= dim[mo - 1]


def validate_fields(f: dict) -> dict:
    violations: list[dict] = []

    if not re.fullmatch(r"REF-\d{6}", f["reference"]):
        violations.append({"field": "reference", "reason": "format"})
    else:
        digits = f["reference"][4:]
        if sum(int(d) for d in digits[:5]) % 10 != int(digits[5]):
            violations.append({"field": "reference", "reason": "check-digit"})

    if not re.fullmatch(r"\d+\.\d{2}", f["amount"]):
        violations.append({"field": "amount", "reason": "format"})

    if f["currency"] not in CURRENCIES:
        violations.append({"field": "currency", "reason": "allowlist"})

    if not valid_date(f["date"]):
        violations.append({"field": "date", "reason": "invalid"})

    if not re.fullmatch(r"\d{12}", f["account"]):
        violations.append({"field": "account", "reason": "format"})
    elif not luhn_valid(f["account"]):
        violations.append({"field": "account", "reason": "checksum"})

    return {"ok": len(violations) == 0, "violations": violations}
