"use client";
import type { PlaybackFrame } from "@/design-system/demo/playback";
import type { TraceEvent } from "@/design-system/demo/types";
import { StoryStage } from "@/design-system/demo/decision-lab";
import { OutcomeTape, useReducedMotion } from "@/design-system/demo/project-story";
import { tapeCounts } from "@/design-system/demo/outcome-tape";
import { FlowDiagram, type FlowTone } from "@/design-system/demo/flow-diagram";
import type { MissionResult } from "./mission";
import { receiptCells, revealedReceipts } from "./scene-state";
import { STORY } from "./story";

const POS = { receipts: { x: 10, y: 95 }, cashier: { x: 230, y: 95 }, accepted: { x: 470, y: 20 }, held: { x: 470, y: 170 } } as const;

export function EscaneoStoryScene({ frame, result, locale }: { frame: PlaybackFrame<TraceEvent>; result: MissionResult; locale: "en" | "es" }) {
  const copy = STORY[locale].scene;
  const reduced = useReducedMotion();
  const cells = receiptCells(result.items, revealedReceipts(frame, result.items.length, reduced));
  const c = tapeCounts(cells);
  const tone: Record<keyof typeof POS, FlowTone> = {
    receipts: "idle",
    cashier: "active",
    accepted: c.lost > 0 ? "danger" : c.served > 0 ? "success" : "idle",
    held: c.rerouted > 0 ? "success" : "idle",
  };
  const nodes = (Object.keys(POS) as (keyof typeof POS)[]).map(id => ({ id, ...POS[id], ...copy.nodes[id], tone: tone[id] }));
  return <StoryStage locale={locale} title={copy.title} caption={copy.caption} step={frame.visible} total={frame.total}>
    <FlowDiagram nodes={nodes} width={640} height={260} ariaLabel={copy.slippedOf(c.lost)} statusLabels={copy.statusLabels} edges={[
      { from: "receipts", to: "cashier" },
      { from: "cashier", to: "accepted", tone: c.lost > 0 ? "danger" : c.served > 0 ? "success" : "idle" },
      { from: "cashier", to: "held", tone: c.rerouted > 0 ? "success" : "idle" },
    ]} />
    <div className="mt-6">
      <OutcomeTape cells={cells} labels={copy.tape} ariaLabel={copy.tapeLabel} columns={6} />
      <p className="mt-4 font-mono text-2xl font-semibold tracking-tight">{copy.slippedOf(c.lost)}</p>
    </div>
  </StoryStage>;
}
