"use client";

import { useState } from "react";
import Link from "next/link";
import { Alert } from "@/design-system/components/alert";
import { Card } from "@/design-system/components/card";
import { MetricCard } from "@/design-system/components/metric-card";
import { StatusBadge } from "@/design-system/components/status-badge";
import { extractFields } from "@/lib/escaneo/extract";
import { validateFields } from "@/lib/escaneo/validate";
import { getBenchmark } from "@/lib/escaneo/demo";
import type { CleanFields, Field, ValidationResult } from "@/lib/escaneo/types";

const BENCH = getBenchmark();

const pct = (v: number) => `${(v * 100).toFixed(0)}%`;

const FIELDS: Field[] = ["reference", "amount", "currency", "date", "account"];

const FIELD_LABEL: Record<Field, string> = {
  reference: "Referencia",
  amount: "Importe",
  currency: "Moneda",
  date: "Fecha",
  account: "Cuenta",
};

const INPUT_CLASS =
  "rounded-[var(--radius-md)] border border-[var(--border)] bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/60";

const VALID_DOC = `reference REF-202442
amount 1234.56
currency USD
date 2024-03-15
account 400000123457`;

type Result = { fields: CleanFields; verdict: ValidationResult };

export default function AppPage() {
  const [ocrText, setOcrText] = useState(VALID_DOC);
  const [result, setResult] = useState<Result | null>(null);

  function run() {
    const fields = extractFields(ocrText);
    const verdict = validateFields(fields);
    setResult({ fields, verdict });
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b border-[var(--border)] bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors duration-200"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
              </svg>
              Inicio
            </Link>
            <div className="h-4 w-px bg-[var(--border)]" aria-hidden="true" />
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                <svg className="h-4 w-4 text-foreground" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
                </svg>
              </div>
              <div>
                <h1 className="text-sm font-semibold text-foreground leading-tight">Escaneo</h1>
                <p className="text-xs text-muted-foreground">Procesador multi-modal</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge tone="info" dot className="px-3 py-1">
              Demo mode
            </StatusBadge>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-10">
        {/* ── SUMMARY BAR ─────────────────────── */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <MetricCard
            label="Accuracy cruda"
            value={pct(BENCH.rawAccuracy)}
            hint={`${BENCH.correctFields}/${BENCH.totalFields} campos`}
            tone="warning"
          />
          <MetricCard
            label="Errores cazados"
            value={`${BENCH.caught}/${BENCH.corruptFields}`}
            hint="recall de validación"
            tone="success"
          />
          <MetricCard
            label="Falsos positivos"
            value={BENCH.falsePositives}
            hint="campos limpios marcados"
            tone="info"
          />
          <MetricCard
            label="Accuracy efectiva"
            value={pct(BENCH.effectiveAccuracy)}
            hint="tras validación"
            tone="success"
          />
        </div>

        {/* ── OCR PLAYGROUND ──────────────────── */}
        <section>
          <h2 className="text-lg font-semibold tracking-tight text-foreground mb-1">Procesador en vivo</h2>
          <p className="text-sm text-muted-foreground mb-5">
            Pega un documento (un campo por línea: <code className="font-mono text-xs">reference</code>,{" "}
            <code className="font-mono text-xs">amount</code>, <code className="font-mono text-xs">currency</code>,{" "}
            <code className="font-mono text-xs">date</code>, <code className="font-mono text-xs">account</code>).
            El extractor lee los campos y la validación cruzada (checksums + calendario) marca lo
            corrupto. Pista: cambia un dígito por una letra — p. ej. <code className="font-mono text-xs">amount 1234.S6</code> — para
            ver al validador cazarlo.
          </p>

          <Card className="p-5">
            <textarea
              value={ocrText}
              onChange={(e) => setOcrText(e.target.value)}
              rows={6}
              className={`${INPUT_CLASS} w-full font-mono`}
            />
            <button
              onClick={run}
              className="mt-4 w-full rounded-[var(--radius-md)] bg-accent px-4 py-2.5 text-sm font-medium text-[#ffffff] hover:bg-accent/90 transition-colors"
            >
              Procesar documento
            </button>
          </Card>

          {result && (
            <Card className="mt-4 p-5">
              <div className="flex items-center gap-3 mb-4">
                {result.verdict.ok ? (
                  <StatusBadge tone="success" dot>válido</StatusBadge>
                ) : (
                  <StatusBadge tone="danger" dot>rechazado</StatusBadge>
                )}
                <span className="text-sm text-muted-foreground">
                  {result.verdict.ok
                    ? "Todos los campos pasan la validación cruzada."
                    : `${result.verdict.violations.length} violación${result.verdict.violations.length === 1 ? "" : "es"}.`}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                {FIELDS.map((f) => {
                  const violated = result.verdict.violations.filter((v) => v.field === f);
                  return (
                    <div
                      key={f}
                      className="rounded-[var(--radius-md)] bg-muted/40 px-3 py-2.5"
                    >
                      <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                        {FIELD_LABEL[f]}
                      </p>
                      <p
                        className={`mt-0.5 font-mono text-sm ${
                          violated.length > 0 ? "text-danger font-semibold" : "text-foreground"
                        }`}
                      >
                        {result.fields[f] || "—"}
                      </p>
                      {violated.map((v) => (
                        <p key={v.reason} className="mt-0.5 font-mono text-[10px] text-danger">
                          {v.reason}
                        </p>
                      ))}
                    </div>
                  );
                })}
              </div>

              {result.verdict.violations.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {result.verdict.violations.map((v) => (
                    <span
                      key={`${v.field}:${v.reason}`}
                      className="rounded-full border border-danger/25 bg-danger/10 px-2.5 py-0.5 font-mono text-xs text-danger"
                    >
                      {v.field}: {v.reason}
                    </span>
                  ))}
                </div>
              )}
            </Card>
          )}
        </section>

        {/* ── NOTE ────────────────────────────── */}
        <section>
          <Alert tone="info" title="Validación cruzada = checksums, no solo formato">
            Un formato regex caza un dígito convertido en letra, pero no un dígito cambiado por
            otro. Por eso el account lleva checksum Luhn y el reference un check digit: una
            corrupción que conserve el formato rompe el checksum. Esa es la capa que separa
            &quot;lo detecté porque se ve raro&quot; de &quot;lo detecté porque no cuadra&quot;.
          </Alert>
        </section>

        <footer className="pt-8 border-t border-[var(--border)] flex items-center justify-between text-xs text-muted-foreground">
          <span>Escaneo · Procesador multi-modal · Demo mode</span>
          <a href="https://github.com/mdeasis27/escaneo" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors font-mono">GitHub</a>
        </footer>
      </div>
    </div>
  );
}
