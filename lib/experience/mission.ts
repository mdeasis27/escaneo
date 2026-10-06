import documentsRaw from "@/lib/escaneo/data/documents.json";
import { documentOutcomes } from "@/lib/escaneo/benchmark";
import { CHECKS } from "@/lib/escaneo/validate";
import type { Document } from "@/lib/escaneo/types";

export type ReceiptStatus = "served" | "rerouted" | "lost";
export type CheckedReceipt = { id: string; status: ReceiptStatus };
export type MissionInput = { level: number };
export type MissionResult = { items: CheckedReceipt[]; slipped: number; comparison: { mine: number; all: number } };
type Event = { id: string; step: number; kind: string; messageKey: string; timestampMs: number; evidenceIds?: string[] };

const STEP = 4;
const DOCS = documentsRaw.documents as Document[];

/** The 12 receipts through the first `level` checks: accepted clean, held, or a broken one accepted. A clean receipt held counts as held. */
export function checkReceipts(level: number): CheckedReceipt[] {
  return documentOutcomes(DOCS, level).map(o => ({ id: o.id, status: o.status === "served" ? "served" : o.status === "lost" ? "lost" : "rerouted" }));
}

const slippedIn = (items: CheckedReceipt[]) => items.filter(i => i.status === "lost").length;

export async function runMission(input: MissionInput, signal: AbortSignal, onEvent: (e: Event) => void): Promise<{ input: MissionInput; result: MissionResult; trace: Event[]; executionMs: number; mode: "local" }> {
  const startedAt = performance.now();
  const items = checkReceipts(input.level);
  const trace: Event[] = [];
  for (let i = 0; i < items.length; i += STEP) {
    if (signal.aborted) throw new DOMException("Aborted", "AbortError");
    const event: Event = { id: `batch-${i / STEP + 1}`, step: i / STEP + 1, kind: "validation", messageKey: `batch.${i / STEP + 1}`, timestampMs: performance.now() - startedAt, evidenceIds: items.slice(i, i + STEP).map(r => r.id) };
    trace.push(event);
    onEvent(event);
  }
  if (signal.aborted) throw new DOMException("Aborted", "AbortError");
  const slipped = slippedIn(items);
  return { input, result: { items, slipped, comparison: { mine: slipped, all: slippedIn(checkReceipts(CHECKS.length)) } }, trace, executionMs: performance.now() - startedAt, mode: "local" };
}
