"use client";

import Link from "next/link";
import { Alert } from "@/design-system/components/alert";
import { Card } from "@/design-system/components/card";
import { MetricCard } from "@/design-system/components/metric-card";
import { StatusBadge } from "@/design-system/components/status-badge";
import { getBenchmark, getCaughtExample, getDocumentRows } from "@/lib/escaneo/demo";

const BENCH = getBenchmark();
const ROWS = getDocumentRows();
const CAUGHT = getCaughtExample();

function pct(v: number) {
  return `${(v * 100).toFixed(0)}%`;
}

export default function AppPage() {
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

        {/* ── WORKED EXAMPLE ──────────────────── */}
        <section>
          <h2 className="text-lg font-semibold tracking-tight text-foreground mb-1">Error de OCR cazado por la validación</h2>
          <p className="text-sm text-muted-foreground mb-5">
            El OCR leyó <code className="font-mono text-xs">5</code> como
            <code className="font-mono text-xs"> S</code> en el importe. El extractor lo trae tal cual;
            la validación de formato lo rechaza antes de que el dato corrupto llegue río abajo.
          </p>
          <Card className="p-5">
            <p className="text-sm font-semibold text-foreground mb-3">Documento {CAUGHT.id} · campo amount</p>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="font-mono text-sm text-foreground">OCR: {CAUGHT.ocr}</span>
              <span className="text-muted-foreground">→</span>
              <span className="font-mono text-sm text-success">limpio: {CAUGHT.clean}</span>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge tone="danger">rechazado</StatusBadge>
              <span className="font-mono text-xs text-danger">{CAUGHT.reason}</span>
            </div>
          </Card>
        </section>

        {/* ── DOCUMENTS ───────────────────────── */}
        <section>
          <h2 className="text-lg font-semibold tracking-tight text-foreground mb-1">Documentos escaneados</h2>
          <p className="text-sm text-muted-foreground mb-5">
            {ROWS.length} documentos, 5 campos cada uno. Seis documentos llevan un error de OCR
            inyectado (dígito↔letra, fecha imposible); la validación cruzada los marca todos.
          </p>
          <div className="overflow-x-auto rounded-[var(--radius-md)] shadow-[var(--shadow-card)] bg-card">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--gray-50)]">
                  <th scope="col" className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Doc</th>
                  <th scope="col" className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">reference</th>
                  <th scope="col" className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">amount</th>
                  <th scope="col" className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">currency</th>
                  <th scope="col" className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">date</th>
                  <th scope="col" className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">account</th>
                  <th scope="col" className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {ROWS.map((r) => {
                  const cell = (field: keyof typeof r.extracted) => {
                    const value = r.extracted[field] as string;
                    const corrupt = value !== (r.clean[field] as string);
                    return corrupt ? (
                      <span className="text-danger font-semibold">{value}</span>
                    ) : (
                      <span className="text-muted-foreground">{value}</span>
                    );
                  };
                  return (
                    <tr key={r.id}>
                      <td className="px-5 py-3 font-mono text-xs text-muted-foreground">{r.id}</td>
                      <td className="px-3 py-3 font-mono text-xs">{cell("reference")}</td>
                      <td className="px-3 py-3 font-mono text-xs">{cell("amount")}</td>
                      <td className="px-3 py-3 font-mono text-xs">{cell("currency")}</td>
                      <td className="px-3 py-3 font-mono text-xs">{cell("date")}</td>
                      <td className="px-3 py-3 font-mono text-xs">{cell("account")}</td>
                      <td className="px-4 py-3 text-right">
                        {r.ok ? (
                          <StatusBadge tone="success">ok</StatusBadge>
                        ) : (
                          <div className="flex flex-col items-end gap-1">
                            <StatusBadge tone="danger">rechazado</StatusBadge>
                            {r.violations.map((v) => (
                              <span key={v.field} className="font-mono text-[10px] text-danger">
                                {v.field}: {v.reason}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
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
