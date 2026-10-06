import { describe, expect, it } from "vitest";
import { STORY } from "./story";
import { lintStory, storyStrings as strings } from "@/design-system/demo/copy-lint";

describe("Escaneo story copy", () => {
  it("has the same shape in English and Spanish", () => {
    const keys = (o: unknown): string[] => o && typeof o === "object" && !Array.isArray(o) ? Object.entries(o).filter(([k]) => k !== "before" && k !== "after").flatMap(([k, v]) => [k, ...keys(v).map(x => `${k}.${x}`)]) : [];
    expect(keys(STORY.es)).toEqual(keys(STORY.en));
    expect(STORY.es.analogy.dictionary).toHaveLength(STORY.en.analogy.dictionary.length);
  });

  it("has no empty strings except the owner-supplied why note", () => {
    for (const locale of ["en", "es"] as const) {
      const { why, ...rest } = STORY[locale];
      expect(why.title.trim()).not.toBe("");
      for (const s of strings(rest)) expect(s.trim(), `${locale}: empty string`).not.toBe("");
    }
  });

  it("avoids AI-sounding patterns and brand names", () => {
    for (const locale of ["en", "es"] as const) expect(lintStory(STORY[locale]), locale).toEqual([]);
  });

  it("states the comparison truthfully at a gap, one, a tie, zero and the reverse case", () => {
    expect(STORY.es.compare.sentence(1, 0)).toBe("Con tus revisiones se aceptó 1 recibo con error. Con las cinco, ninguno.");
    expect(STORY.en.compare.sentence(6, 0)).toBe("With your checks, 6 receipts with errors were accepted. With all five, none.");
    expect(STORY.en.compare.sentence(0, 0)).toBe("Both caught every receipt with an error.");
    expect(STORY.es.compare.sentence(2, 2)).toContain("dejaron pasar 2 recibos");
    expect(STORY.en.compare.sentence(0, 1)).toContain("fewer checks did better");
  });

  it("asks the bet about the checks the visitor chose and lists five checks", () => {
    expect(STORY.en.tryIt.question(2)).toContain("with 2 checks");
    expect(STORY.es.tryIt.question(1)).toContain("con 1 revisión");
    expect(STORY.en.tryIt.checks).toHaveLength(5);
    expect([0, 1, 3].map(STORY.es.compare.verdict)).toEqual(["No se coló ningún recibo con error", "Se coló 1 recibo con error", "Se colaron 3 recibos con error"]);
  });
});
