import type { TapeStatus } from "@/design-system/demo/outcome-tape";
import type { PlaybackFrame } from "@/design-system/demo/playback";
import type { TraceEvent } from "@/design-system/demo/types";
import type { ReceiptStatus } from "./mission";

export function receiptCells(items: readonly { status: ReceiptStatus }[], revealed: number): TapeStatus[] {
  return items.map((c, i) => (i >= revealed ? "pending" : c.status));
}

export function revealedReceipts(frame: { visible: number; total: number; complete: boolean }, n: number, reducedMotion: boolean): number {
  if (reducedMotion || frame.complete || frame.total === 0) return n;
  return Math.ceil((n * frame.visible) / frame.total);
}

export const COMPLETE_FRAME: PlaybackFrame<TraceEvent> = { visible: 0, total: 0, event: undefined, complete: true };

/** Splits what the scanner read into [before, misread, after] against the clean value. */
export function misreadParts(read: string, clean: string): [string, string, string] {
  let p = 0;
  while (p < read.length && p < clean.length && read[p] === clean[p]) p++;
  let q = 0;
  while (q < read.length - p && q < clean.length - p && read[read.length - 1 - q] === clean[clean.length - 1 - q]) q++;
  return [read.slice(0, p), read.slice(p, read.length - q), read.slice(read.length - q)];
}
