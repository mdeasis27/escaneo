// lib/escaneo/types.ts
// Core data shapes for the multi-modal processor demo. Plain JSON-serializable
// shapes mirrored one-to-one in backend/src/escaneo/types.py.

export const FIELDS = ["reference", "amount", "currency", "date", "account"] as const;
export type Field = (typeof FIELDS)[number];

export interface CleanFields {
  reference: string;
  amount: string;
  currency: string;
  date: string;
  account: string;
}

export interface Document {
  id: string;
  ocrText: string;
  clean: CleanFields;
}

export interface FieldViolation {
  field: string;
  reason: string;
}

export interface ValidationResult {
  ok: boolean;
  violations: FieldViolation[];
}

export interface BenchmarkResult {
  totalFields: number;
  corruptFields: number;
  correctFields: number;
  rawAccuracy: number;
  caught: number;
  falsePositives: number;
  recall: number;
  effectiveAccuracy: number;
  n: number;
}
