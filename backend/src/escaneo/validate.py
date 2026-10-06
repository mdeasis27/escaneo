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


CHECKS = ["format", "allowlist", "calendar", "check-digit", "luhn"]


def validate_fields(f: dict, level: int | None = None) -> dict:
    """Checks switch on in CHECKS order as level rises from 0 (none) to 5 (all, the default)."""
    if level is None:
        level = len(CHECKS)

    def on(check: str) -> bool:
        return CHECKS.index(check) < level

    violations: list[dict] = []
    ref_ok = re.fullmatch(r"REF-\d{6}", f["reference"]) is not None

    if on("format") and not ref_ok:
        violations.append({"field": "reference", "reason": "format"})
    elif on("check-digit") and ref_ok:
        digits = f["reference"][4:]
        if sum(int(d) for d in digits[:5]) % 10 != int(digits[5]):
            violations.append({"field": "reference", "reason": "check-digit"})

    if on("format") and not re.fullmatch(r"\d+\.\d{2}", f["amount"]):
        violations.append({"field": "amount", "reason": "format"})

    if on("allowlist") and f["currency"] not in CURRENCIES:
        violations.append({"field": "currency", "reason": "allowlist"})

    if on("calendar") and not valid_date(f["date"]):
        violations.append({"field": "date", "reason": "invalid"})

    account_ok = re.fullmatch(r"\d{12}", f["account"]) is not None
    if on("format") and not account_ok:
        violations.append({"field": "account", "reason": "format"})
    elif on("luhn") and account_ok and not luhn_valid(f["account"]):
        violations.append({"field": "account", "reason": "checksum"})

    return {"ok": len(violations) == 0, "violations": violations}
