// lib/escaneo/demo.ts
// Wires committed documents (clean + OCR text with simulated errors) into every
// number the dashboard displays. Extraction and validation are deterministic and
// shared with the Python backend.

import documentsRaw from "./data/documents.json";
import { benchmark } from "./benchmark";
import { extractFields } from "./extract";
import { validateFields } from "./validate";
import type { BenchmarkResult, Document } from "./types";

const DOCUMENTS = documentsRaw.documents as Document[];

let memoBenchmark: BenchmarkResult | null = null;

export function getBenchmark(): BenchmarkResult {
  if (!memoBenchmark) {
    memoBenchmark = benchmark(DOCUMENTS);
  }
  return memoBenchmark;
}

export function getDocuments(): Document[] {
  return DOCUMENTS;
}

export function getDocumentRows() {
  return DOCUMENTS.map((doc) => {
    const extracted = extractFields(doc.ocrText);
    const verdict = validateFields(extracted);
    return {
      id: doc.id,
      extracted,
      clean: doc.clean,
      ok: verdict.ok,
      violations: verdict.violations,
    };
  });
}

export function getCaughtExample() {
  const doc = DOCUMENTS.find((d) => d.id === "d07")!;
  const extracted = extractFields(doc.ocrText);
  const verdict = validateFields(extracted);
  return {
    id: doc.id,
    field: "amount",
    ocr: extracted.amount,
    clean: doc.clean.amount,
    reason: verdict.violations.find((v) => v.field === "amount")?.reason ?? "",
  };
}
