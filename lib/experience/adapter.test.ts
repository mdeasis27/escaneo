import { describe, expect, it } from "vitest";
import { runExperience } from "./adapter";

describe("scan experience", () => {
  it("flags a controlled OCR corruption without claiming it was corrected", async () => {
    const result = await runExperience({ ocrText: "reference REF-123455\namount 15.00\ncurrency USD\ndate 2026-01-01\naccount 400000123457", corruptField: "amount" });
    expect(result.result.violations.map((entry) => entry.field)).toEqual(["amount"]);
    expect(result.result.ok).toBe(false);
    expect(result.result.corrected).toBe(false);
  });

  it("accepts the untouched sample receipt", async () => {
    const result = await runExperience({ ocrText: "reference REF-123455\namount 15.00\ncurrency USD\ndate 2026-01-01\naccount 400000123457", corruptField: "none" });
    expect(result.result.ok).toBe(true);
  });
});
