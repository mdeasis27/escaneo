// lib/escaneo/benchmark.ts
// Raw field accuracy vs validation recall / false-positive rate. The story:
// extraction alone ships corrupt fields (OCR errors); validation flags them so
// they never reach downstream. Mirrors backend/src/escaneo/benchmark.py.

import { extractFields } from "./extract";
import { FIELDS, type BenchmarkResult, type Document, type Field } from "./types";
import { CHECKS, validateFields } from "./validate";

type Check = (typeof CHECKS)[number];

function rate(a: number, b: number): number {
  return b === 0 ? 0 : a / b;
}

export function benchmark(documents: readonly Document[]): BenchmarkResult {
  let totalFields = 0;
  let correctFields = 0;
  let corruptFields = 0;
  let caught = 0;
  let falsePositives = 0;

  for (const doc of documents) {
    const extracted = extractFields(doc.ocrText);
    const verdict = validateFields(extracted);
    const flagged = new Set(verdict.violations.map((v) => v.field));

    for (const field of FIELDS) {
      totalFields++;
      const corrupt = extracted[field] !== doc.clean[field];
      if (corrupt) {
        corruptFields++;
        if (flagged.has(field)) caught++;
      } else {
        correctFields++;
        if (flagged.has(field)) falsePositives++;
      }
    }
  }

  return {
    totalFields,
    corruptFields,
    correctFields,
    rawAccuracy: rate(correctFields, totalFields),
    caught,
    falsePositives,
    recall: rate(caught, corruptFields),
    effectiveAccuracy: rate(correctFields + caught, totalFields),
    n: documents.length,
  };
}

export type DocumentStatus = "served" | "held" | "lost" | "false-hold";
export type Misread = { field: Field; read: string; clean: string };
export type DocumentOutcome = { id: string; status: DocumentStatus; misread: Misread | null; caughtBy: Check | null };

/** Per receipt at a given check level: clean and accepted, broken and held, broken and accepted, or clean but held.
 *  Also the first misread field and the first check (in CHECKS order) that holds the receipt. */
export function documentOutcomes(documents: readonly Document[], level: number = CHECKS.length): DocumentOutcome[] {
  return documents.map((doc) => {
    const extracted = extractFields(doc.ocrText);
    const field = FIELDS.find((f) => extracted[f] !== doc.clean[f]);
    const held = !validateFields(extracted, level).ok;
    let caughtBy: Check | null = null;
    for (let l = 1; l <= level && held && !caughtBy; l++) if (!validateFields(extracted, l).ok) caughtBy = CHECKS[l - 1];
    return {
      id: doc.id,
      status: field ? (held ? "held" : "lost") : held ? "false-hold" : "served",
      misread: field ? { field, read: extracted[field], clean: doc.clean[field] } : null,
      caughtBy,
    };
  });
}
