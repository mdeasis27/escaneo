"use client";
import type { CSSProperties } from "react";
import type { PlaybackFrame } from "@/design-system/demo/playback";
import type { TraceEvent } from "@/design-system/demo/types";
import { StoryStage } from "@/design-system/demo/decision-lab";
import { OutcomeTape, useReducedMotion } from "@/design-system/demo/project-story";
import { tapeCounts } from "@/design-system/demo/outcome-tape";
import { CHECKS } from "@/lib/escaneo/validate";
import type { CheckedReceipt, ReceiptStatus } from "./mission";
import { misreadParts, receiptCells, revealedReceipts } from "./scene-state";
import { STORY } from "./story";

// Portrait viewBox so the text stays legible at 390px; a receipt is drawn at 0,0 (150x58) and placed with a transform.
const W = 320, H = 440, BIN_Y = 266, BATCH = 4;
const BIN_X: Record<Exclude<ReceiptStatus, "lost">, number> = { rerouted: 6, served: 164 };
const LAMP = "translate(85px, 112px) scale(1)";
const pile = (k: number) => `translate(${8 + k * 1.5}px, ${48 + k * 3}px) scale(0.5)`;
const slot = (x: number, k: number) => `translate(${x + 6 + (k % 3) * 48}px, ${BIN_Y + 42 + Math.floor(k / 3) * 21}px) scale(0.3)`;
const LANDED: Record<ReceiptStatus, string> = { served: "fill-success", rerouted: "fill-info", lost: "fill-danger" };

export function EscaneoStoryScene({ frame, result, level, locale }: { frame: PlaybackFrame<TraceEvent>; result: { items: CheckedReceipt[] }; level: number; locale: "en" | "es" }) {
  const copy = STORY[locale].scene;
  const reduced = useReducedMotion();
  const items = result.items;
  const revealed = revealedReceipts(frame, items.length, reduced);
  const cells = receiptCells(items, revealed);
  const c = tapeCounts(cells);
  const final = tapeCounts(receiptCells(items, items.length));
  const batchStart = reduced ? items.length : revealed - BATCH;
  const binCount = { served: 0, rerouted: 0 };
  const placed = items.map((r, i) => {
    const bin = r.status === "rerouted" ? "rerouted" : "served";
    return { r, i, to: slot(BIN_X[bin], binCount[bin]++) };
  });
  const checkName = (check: (typeof CHECKS)[number]) => copy.checks[CHECKS.indexOf(check)];
  const misreads = items.slice(0, revealed).filter(r => r.read !== r.clean);

  return <StoryStage locale={locale} title={copy.title} caption={copy.caption} step={frame.visible} total={frame.total}>
    <svg role="img" aria-label={copy.summary(level, final.served, final.rerouted, final.lost)} viewBox={`0 0 ${W} ${H}`} className="mx-auto block h-auto w-full max-w-[420px]" data-escaneo-scene>
      <defs>
        <radialGradient id="escaneo-glow" cx="50%" cy="0%" r="100%">
          <stop offset="0%" stopColor="var(--warning)" stopOpacity=".55" />
          <stop offset="100%" stopColor="var(--warning)" stopOpacity="0" />
        </radialGradient>
      </defs>
      <text x="8" y="22" className="fill-foreground text-[13px] font-semibold">{copy.bins.pile.name}</text>
      <text x="8" y="37" className="fill-muted-foreground text-[10px]">{copy.bins.pile.sub}</text>
      <text x="160" y="14" textAnchor="middle" className="fill-muted-foreground text-[10px]">{copy.lamp}</text>
      <polygon key={`cone-${frame.visible}`} points="148,44 172,44 244,196 76,196" fill="url(#escaneo-glow)" opacity=".3" className={!reduced && revealed > 0 && batchStart < items.length ? "escaneo-lamp" : undefined} />
      <rect x="138" y="22" width="44" height="20" rx="6" className="fill-muted-foreground" />
      <circle cx="160" cy="44" r="6" fill="var(--warning)" />

      <text x="160" y="214" textAnchor="middle" className="fill-foreground text-[11px]">{copy.checking(level)}</text>
      {CHECKS.map((check, k) => {
        const on = k < level;
        const x = k < 3 ? 8 + k * 103 : 60 + (k - 3) * 103;
        const y = k < 3 ? 222 : 244;
        return <g key={check} data-check={check} data-on={on}>
          <rect x={x} y={y} width="98" height="18" rx="9" strokeWidth="1.5" strokeDasharray={on ? undefined : "3 3"} className={on ? "fill-success/10 stroke-success" : "fill-none stroke-border"} />
          <text x={x + 49} y={y + 13} textAnchor="middle" className={`text-[10px] ${on ? "fill-foreground" : "fill-muted-foreground"}`}>{on ? "✓ " : "– "}{copy.checks[k]}</text>
        </g>;
      })}

      {(["rerouted", "served"] as const).map(bin => <g key={bin}>
        <rect x={BIN_X[bin]} y={BIN_Y} width="150" height="170" rx="8" strokeWidth="1.5" strokeDasharray={bin === "rerouted" ? "5 4" : undefined} className={bin === "rerouted" ? "fill-none stroke-info" : "fill-surface stroke-border"} />
        <text x={BIN_X[bin] + 8} y={BIN_Y + 18} className="fill-foreground text-[13px] font-semibold">{bin === "rerouted" ? copy.bins.held.name : copy.bins.till.name}</text>
        <text x={BIN_X[bin] + 8} y={BIN_Y + 32} className="fill-muted-foreground text-[10px]">{bin === "rerouted" ? copy.bins.held.sub : copy.bins.till.sub}</text>
      </g>)}

      {/* Last receipt drawn first so the first one sits on top of the pile. */}
      {[...placed].reverse().map(({ r, i, to }) => {
        const shown = i < revealed;
        const moving = shown && i >= batchStart;
        const [before, bad, after] = misreadParts(r.read, r.clean);
        const style = { transform: shown ? to : pile(i), "--pile": pile(i), "--lamp": LAMP, "--slot": to, animationDelay: `${(i % BATCH) * 160}ms` } as CSSProperties;
        return <g key={r.id} data-receipt={r.id} data-status={shown ? r.status : "pending"} style={style} className={moving ? "escaneo-pass" : undefined}>
          <g className={moving ? "escaneo-full" : undefined} opacity={shown && !moving ? 0 : 1}>
            <rect width="150" height="58" rx="6" strokeWidth="1.5" className="fill-background stroke-border" />
            <text x="8" y="17" className="fill-muted-foreground font-mono text-[10px]">{copy.receipt} {r.id.slice(1)}</text>
            <text x="8" y="41" className="fill-foreground font-mono text-[12px] font-semibold">{copy.fields[r.field]} {before}<tspan className={r.status === "rerouted" ? "fill-danger underline" : undefined}>{bad}</tspan>{after}</text>
          </g>
          <g className={moving ? "escaneo-landed" : undefined} opacity={shown ? 1 : 0}>
            <rect width="150" height="58" rx="10" className={LANDED[r.status]} />
            <text x="75" y="42" textAnchor="middle" className="fill-white font-mono text-[34px] font-bold">{r.status === "lost" ? "× " : ""}{r.id.slice(1)}</text>
          </g>
        </g>;
      })}
    </svg>

    {misreads.length > 0 ? <div className="mt-4">
      <p className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">{copy.misreadsLabel}</p>
      <ul className="mt-2 space-y-1 font-mono text-xs" data-misreads>
        {misreads.map(r => {
          const [before, bad, after] = misreadParts(r.read, r.clean);
          return <li key={r.id} className="flex flex-wrap gap-x-2">
            <span className="text-muted-foreground">{r.id.slice(1)}</span>
            <span>{copy.fields[r.field]} {before}<span className="text-danger underline">{bad}</span>{after}</span>
            <span className={r.status === "lost" ? "text-danger" : "text-info"}>{r.status === "lost" ? `× ${copy.slipped}` : r.caughtBy ? copy.heldBy(checkName(r.caughtBy)) : ""}</span>
          </li>;
        })}
      </ul>
    </div> : null}

    <div className="mt-6">
      <OutcomeTape cells={cells} labels={copy.tape} ariaLabel={copy.tapeLabel} columns={6} />
      <p aria-live="polite" className="mt-4 font-mono text-2xl font-semibold tracking-tight">{copy.slippedOf(c.lost)}</p>
    </div>
  </StoryStage>;
}
