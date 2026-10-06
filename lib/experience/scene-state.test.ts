import { expect, it } from "vitest";
import { tapeCounts } from "@/design-system/demo/outcome-tape";
import { misreadParts, receiptCells, revealedReceipts } from "./scene-state";
import { runMission } from "./mission";

it("hides the receipts not revealed yet", () => {
  expect(receiptCells([{ status: "served" }, { status: "lost" }], 1)).toEqual(["served", "pending"]);
});

it("final tape counts equal the mission totals", async () => {
  const { result } = await runMission({ level: 2 }, new AbortController().signal, () => {});
  expect(tapeCounts(receiptCells(result.items, result.items.length))).toEqual({ served: 6, rerouted: 5, lost: result.slipped, pending: 0 });
});

it("reveals in proportion to playback, all of it when complete or under reduced motion", () => {
  expect(revealedReceipts({ visible: 1, total: 3, complete: false }, 12, false)).toBe(4);
  expect(revealedReceipts({ visible: 4, total: 4, complete: true }, 12, false)).toBe(12);
  expect(revealedReceipts({ visible: 1, total: 4, complete: false }, 12, true)).toBe(12);
  expect(revealedReceipts({ visible: 0, total: 0, complete: false }, 12, false)).toBe(12);
});

it("marks only the characters the scanner misread", () => {
  expect(misreadParts("1234.S6", "1234.56")).toEqual(["1234.", "S", "6"]);
  expect(misreadParts("2024-13-23", "2024-03-23")).toEqual(["2024-", "1", "3-23"]);
  expect(misreadParts("40000012352I", "400000123523")).toEqual(["40000012352", "I", ""]);
  expect(misreadParts("89.99", "89.99")).toEqual(["89.99", "", ""]);
});
