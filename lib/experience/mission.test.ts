import { expect, it } from "vitest";
import { checkReceipts, runMission } from "./mission";

const count = (level: number) => {
  const items = checkReceipts(level);
  return { served: items.filter(i => i.status === "served").length, rerouted: items.filter(i => i.status === "rerouted").length, lost: items.filter(i => i.status === "lost").length };
};

it("with 2 checks, 5 of the 6 broken receipts are held and the impossible date slips through", () => {
  expect(count(2)).toEqual({ served: 6, rerouted: 5, lost: 1 });
  expect(checkReceipts(2).filter(i => i.status === "lost").map(i => i.id)).toEqual(["d09"]);
});

it("sweep: both bet answers are reachable on the slider, and the default says no", () => {
  const answers = new Set<boolean>();
  for (let level = 0; level <= 5; level++) answers.add(count(level).lost === 0);
  expect([...answers].sort()).toEqual([false, true]);
  expect(count(2).lost === 0).toBe(false);
  expect(count(3).lost).toBe(0);
});

it("runs the mission against all five checks, reveals in groups and stops when cancelled", async () => {
  const ids: string[] = [];
  const run = await runMission({ level: 2 }, new AbortController().signal, e => ids.push(e.id));
  expect(run.result.items).toHaveLength(12);
  expect(run.result.comparison).toEqual({ mine: 1, all: 0 });
  expect(ids).toEqual(run.trace.map(e => e.id));
  expect(ids).toHaveLength(3);
  const c = new AbortController(); c.abort();
  await expect(runMission({ level: 2 }, c.signal, () => {})).rejects.toThrow();
});
