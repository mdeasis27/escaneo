import { describe, expect, it } from "vitest";

import documentsRaw from "./data/documents.json";
import fixture from "./fixtures/benchmark.json";
import { benchmark, documentOutcomes } from "./benchmark";
import { extractFields } from "./extract";
import { validateFields } from "./validate";
import type { Document } from "./types";

const DOCUMENTS = documentsRaw.documents as Document[];

describe("pinned fixture: benchmark", () => {
  it("reproduces raw accuracy, recall and false positives", () => {
    const result = benchmark(DOCUMENTS);

    expect(result.n).toBe(fixture.n);
    expect(result.totalFields).toBe(fixture.totalFields);
    expect(result.corruptFields).toBe(fixture.corruptFields);
    expect(result.correctFields).toBe(fixture.correctFields);
    expect(result.rawAccuracy).toBeCloseTo(fixture.rawAccuracy, 10);
    expect(result.caught).toBe(fixture.caught);
    expect(result.falsePositives).toBe(fixture.falsePositives);
    expect(result.recall).toBeCloseTo(fixture.recall, 10);
    expect(result.effectiveAccuracy).toBeCloseTo(fixture.effectiveAccuracy, 10);
  });
});

describe("validation catches every injected OCR error", () => {
  it("flags exactly the corrupt fields", () => {
    const corruptIds = DOCUMENTS.filter((d) => {
      const extracted = extractFields(d.ocrText);
      const verdict = validateFields(extracted);
      return verdict.violations.length > 0;
    }).map((d) => d.id);

    expect(corruptIds).toEqual(["d07", "d08", "d09", "d10", "d11", "d12"]);
  });

  it("never flags a clean document", () => {
    const cleanIds = DOCUMENTS.filter((d) => d.id.startsWith("d0") && d.id <= "d06").map((d) => d.id);
    for (const id of cleanIds) {
      const doc = DOCUMENTS.find((d) => d.id === id)!;
      expect(validateFields(extractFields(doc.ocrText)).ok).toBe(true);
    }
  });
});

describe("checks switched on in order: format, allowlist, calendar, check-digit, Luhn", () => {
  const docs = DOCUMENTS;
  const statuses = (level: number) => documentOutcomes(docs, level).map((o) => o.status);

  it("level 0 checks nothing and all 6 broken receipts slip through", () => {
    expect(validateFields({ reference: "x", amount: "x", currency: "x", date: "x", account: "x" }, 0).ok).toBe(true);
    expect(statuses(0).filter((s) => s === "lost")).toHaveLength(6);
  });

  it("level 2 misses the impossible date; level 3 holds all 6", () => {
    expect(documentOutcomes(docs, 2).filter((o) => o.status === "lost").map((o) => o.id)).toEqual(["d09"]);
    expect(statuses(3).filter((s) => s === "held")).toHaveLength(6);
    expect(statuses(5)).toEqual(statuses(3));
  });

  it("the default level 5 equals the full validation, with no clean receipt held", () => {
    for (const d of docs) expect(validateFields(extractFields(d.ocrText), 5)).toEqual(validateFields(extractFields(d.ocrText)));
    expect(statuses(5).filter((s) => s === "false-hold")).toHaveLength(0);
  });

  it("matches the per-level outcomes pinned in the shared fixture", () => {
    for (let level = 0; level <= 5; level++) expect(statuses(level)).toEqual((fixture as unknown as { outcomesByLevel: Record<string, string[]> }).outcomesByLevel[String(level)]);
  });
});
