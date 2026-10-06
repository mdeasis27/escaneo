// lib/escaneo/benchmark.ts
// Raw field accuracy vs validation recall / false-positive rate. The story:
// extraction alone ships corrupt fields (OCR errors); validation flags them so
// they never reach downstream. Mirrors backend/src/escaneo/benchmark.py.

import { extractFields } from "./extract";
import { FIELDS, type BenchmarkResult, type Document } from "./types";
import { validateFields } from "./validate";

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

/** Per receipt at a given check level: clean and accepted, broken and held, broken and accepted, or clean but held. */
export function documentOutcomes(documents: readonly Document[], level?: number): { id: string; status: DocumentStatus }[] {
  return documents.map((doc) => {
    const extracted = extractFields(doc.ocrText);
    const broken = FIELDS.some((field) => extracted[field] !== doc.clean[field]);
    const held = !validateFields(extracted, level).ok;
    return { id: doc.id, status: broken ? (held ? "held" : "lost") : held ? "false-hold" : "served" };
  });
}
