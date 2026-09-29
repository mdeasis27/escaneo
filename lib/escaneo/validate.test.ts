import { describe, expect, it } from "vitest";

import { extractFields } from "./extract";
import { luhnValid, validDate, validateFields } from "./validate";

describe("extractFields", () => {
  it("parses every field line", () => {
    const f = extractFields("reference REF-202442\namount 1234.56\ncurrency USD\ndate 2024-03-15\naccount 400000123457");
    expect(f).toEqual({
      reference: "REF-202442",
      amount: "1234.56",
      currency: "USD",
      date: "2024-03-15",
      account: "400000123457",
    });
  });
});

describe("validateFields — checksums catch OCR corruption", () => {
  it("accepts clean fields", () => {
    const v = validateFields({
      reference: "REF-202442",
      amount: "1234.56",
      currency: "USD",
      date: "2024-03-15",
      account: "400000123457",
    });
    expect(v.ok).toBe(true);
  });

  it("flags a corrupted amount", () => {
    const v = validateFields({
      reference: "REF-202509",
      amount: "1234.S6",
      currency: "USD",
      date: "2024-03-21",
      account: "400000123515",
    });
    expect(v.violations).toEqual([{ field: "amount", reason: "format" }]);
  });

  it("flags a corrupted account via format", () => {
    const v = validateFields({
      reference: "REF-202510",
      amount: "76.50",
      currency: "EUR",
      date: "2024-03-22",
      account: "40000012352I",
    });
    expect(v.violations).toEqual([{ field: "account", reason: "format" }]);
  });

  it("flags an impossible date", () => {
    const v = validateFields({
      reference: "REF-202521",
      amount: "2200.00",
      currency: "USD",
      date: "2024-13-23",
      account: "400000123531",
    });
    expect(v.violations).toEqual([{ field: "date", reason: "invalid" }]);
  });

  it("flags a corrupted reference", () => {
    const v = validateFields({
      reference: "REF-20253S",
      amount: "555.55",
      currency: "MXN",
      date: "2024-03-24",
      account: "400000123549",
    });
    expect(v.violations).toEqual([{ field: "reference", reason: "format" }]);
  });
});

describe("luhnValid", () => {
  it("accepts valid accounts and rejects corruption", () => {
    expect(luhnValid("400000123457")).toBe(true);
    expect(luhnValid("400000123458")).toBe(false);
  });
});

describe("validDate", () => {
  it("rejects impossible calendar dates", () => {
    expect(validDate("2024-02-29")).toBe(true);
    expect(validDate("2023-02-29")).toBe(false);
    expect(validDate("2024-06-31")).toBe(false);
    expect(validDate("2024-00-10")).toBe(false);
  });
});
