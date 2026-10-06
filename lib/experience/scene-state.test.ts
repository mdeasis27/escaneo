import { expect, it } from "vitest";
import { tapeCounts } from "@/design-system/demo/outcome-tape";
import { receiptCells, revealedReceipts } from "./scene-state";
import { runMission } from "./mission";

it("hides the receipts not revealed yet", () => {
  expect(receiptCells([{ id: "a", status: "served" }, { id: "b", status: "lost" }], 1)).toEqual(["served", "pending"]);
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
