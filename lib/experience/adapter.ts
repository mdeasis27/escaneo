import { extractFields } from "../escaneo/extract";
import { validateFields } from "../escaneo/validate";
import type { Field } from "../escaneo/types";

export type ExperienceInput = { ocrText: string; corruptField: Field | "none" };
export type TraceEvent = { id: string; step: number; kind: "extract" | "validate"; messageKey: string; timestampMs: number };
function corrupt(text: string, field: ExperienceInput["corruptField"]): string { return field === "none" ? text : text.replace(new RegExp(`^${field}\\s+.+$`, "m"), `${field} corrupted`); }
export async function runExperience(input: ExperienceInput, signal: AbortSignal = new AbortController().signal, onEvent: (event: TraceEvent) => void = () => undefined) {
  if (!input.ocrText.trim()) throw new Error("OCR text is required."); if (signal.aborted) throw new DOMException("Aborted", "AbortError");
  const start = performance.now(); const raw = corrupt(input.ocrText, input.corruptField); const fields = extractFields(raw); const validation = validateFields(fields); const trace: TraceEvent[]=[{ id: "extract", step: 1, kind: "extract", messageKey: "ocr.extracted", timestampMs: 0 }, { id: "validate", step: 2, kind: "validate", messageKey: "fields.validated", timestampMs: performance.now()-start }]; if(signal.aborted) throw new DOMException("Aborted","AbortError");trace.forEach(onEvent);
  return { input, result: { raw, fields, ...validation, corrected: false }, trace, executionMs: performance.now() - start, mode: "local" as const };
}
