// lib/escaneo/validate.ts
// Cross-field validation of the extracted fields. Checksums (Luhn, check digit)
// and calendar/allowlist checks catch OCR corruption that a format check alone
// would miss. Mirrors backend/src/escaneo/validate.py.

import type { CleanFields, FieldViolation, ValidationResult } from "./types";

const CURRENCIES = new Set(["USD", "EUR", "MXN"]);

export function luhnValid(s: string): boolean {
  let total = 0;
  let i = 0;
  for (let idx = s.length - 1; idx >= 0; idx--) {
    let d = s.charCodeAt(idx) - 48;
    if (i % 2 === 1) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    total += d;
    i++;
  }
  return total % 10 === 0;
}

function isLeap(y: number): boolean {
  return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
}

export function validDate(s: string): boolean {
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return false;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  if (mo < 1 || mo > 12) return false;
  const dim = [31, isLeap(y) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return d >= 1 && d <= dim[mo - 1];
}

/** Checks switch on in this order as `level` rises from 0 (none) to 5 (all, the default). */
export const CHECKS = ["format", "allowlist", "calendar", "check-digit", "luhn"] as const;

export function validateFields(f: CleanFields, level: number = CHECKS.length): ValidationResult {
  const on = (check: (typeof CHECKS)[number]) => CHECKS.indexOf(check) < level;
  const violations: FieldViolation[] = [];

  if (on("format") && !/^REF-\d{6}$/.test(f.reference)) {
    violations.push({ field: "reference", reason: "format" });
  } else if (on("check-digit") && /^REF-\d{6}$/.test(f.reference)) {
    const digits = f.reference.slice(4);
    const sum = [...digits.slice(0, 5)].reduce((a, c) => a + Number(c), 0);
    if (sum % 10 !== Number(digits[5])) {
      violations.push({ field: "reference", reason: "check-digit" });
    }
  }

  if (on("format") && !/^\d+\.\d{2}$/.test(f.amount)) {
    violations.push({ field: "amount", reason: "format" });
  }

  if (on("allowlist") && !CURRENCIES.has(f.currency)) {
    violations.push({ field: "currency", reason: "allowlist" });
  }

  if (on("calendar") && !validDate(f.date)) {
    violations.push({ field: "date", reason: "invalid" });
  }

  if (on("format") && !/^\d{12}$/.test(f.account)) {
    violations.push({ field: "account", reason: "format" });
  } else if (on("luhn") && /^\d{12}$/.test(f.account) && !luhnValid(f.account)) {
    violations.push({ field: "account", reason: "checksum" });
  }

  return { ok: violations.length === 0, violations };
}
