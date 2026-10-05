import { describe, expect, it } from "vitest";
import { runExperience } from "./adapter";

describe("scan experience", () => {
  it("flags a controlled OCR corruption without claiming it was corrected", async () => {
    const result = await runExperience({ ocrText: "reference REF-123455\namount 15.00\ncurrency USD\ndate 2026-01-01\naccount 49927398716", corruptField: "amount" });
    expect(result.result.ok).toBe(false);
    expect(result.result.corrected).toBe(false);
    expect(result.result.violations.some((entry) => entry.field === "amount")).toBe(true);
  });
});
