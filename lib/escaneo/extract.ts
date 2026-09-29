// lib/escaneo/extract.ts
// Deterministic field extraction from the OCR text layer. The "OCR" is the
// committed ocrText with simulated errors; this parses each field line. Mirrors
// backend/src/escaneo/extract.py.

import type { CleanFields } from "./types";

export function extractFields(ocrText: string): CleanFields {
  const get = (key: string): string => {
    const m = ocrText.match(new RegExp(`^${key}\\s+(.+)$`, "m"));
    return m ? m[1].trim() : "";
  };
  return {
    reference: get("reference"),
    amount: get("amount"),
    currency: get("currency"),
    date: get("date"),
    account: get("account"),
  };
}
