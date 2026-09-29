import { describe, expect, it } from "vitest";

import documentsRaw from "./data/documents.json";
import fixture from "./fixtures/benchmark.json";
import { benchmark } from "./benchmark";
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
