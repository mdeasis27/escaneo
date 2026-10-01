"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Alert } from "@/design-system/components/alert";
import { Card } from "@/design-system/components/card";
import { StatusBadge } from "@/design-system/components/status-badge";
import type { Field, FieldViolation } from "@/lib/escaneo/types";

interface ProcessResult {
  fields?: Record<Field, string>;
  ok?: boolean;
  violations?: FieldViolation[];
  error?: string;
}

interface HistoryItem {
  id: number;
  valid: boolean;
  violations: string;
  created_at: string;
}

const FIELDS: Field[] = ["reference", "amount", "currency", "date", "account"];

const FIELD_LABEL: Record<Field, string> = {
  reference: "Referencia",
  amount: "Importe",
  currency: "Moneda",
  date: "Fecha",
  account: "Cuenta",
};

const VALID_DOC = `reference REF-202442
amount 1234.56
currency USD
date 2024-03-15
account 400000123457`;

function parseViolations(raw: string): FieldViolation[] {
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default function AppPage() {
  const [ocrText, setOcrText] = useState(VALID_DOC);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ProcessResult | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  async function run() {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ocrText }),
      });
      const data = await res.json();
      setResult(data);
      if (res.ok) loadHistory();
    } catch (err) {
      setResult({ error: err instanceof Error ? err.message : "Error de red" });
    } finally {
      setLoading(false);
    }
  }

  async function loadHistory() {
    try {
      const res = await fetch("/api/history");
      if (res.ok) {
        const data = await res.json();
        setHistory(data.documents ?? []);
      }
    } catch {
      /* history is best-effort */
    }
  }

  useEffect(() => {
    loadHistory();
  }, []);

  const violations = result?.violations ?? [];
  const fields = result?.fields;

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
            <StatusBadge tone="success" dot className="px-3 py-1">
              Postgres en vivo
            </StatusBadge>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        <div className="max-w-3xl">
          <h2 className="text-xl font-semibold tracking-tight text-foreground">Procesa un documento OCR en vivo</h2>
          <p className="text-sm text-muted-foreground mt-2">
            Pega un documento (un campo por línea). El extractor lee los campos y la validación
            cruzada (checksums + calendario) marca lo corrupto. Cada documento procesado se{" "}
            <strong>persiste en Postgres</strong>. Pista: cambia un dígito por una letra — p. ej.{" "}
            <code className="font-mono text-xs">amount 1234.S6</code> — para ver al validador cazarlo.
          </p>
        </div>

        <Card className="p-5">
          <textarea
            value={ocrText}
            onChange={(e) => setOcrText(e.target.value)}
            rows={6}
            className="w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-background px-3 py-2 text-sm font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-ring/60"
          />
          <button
            onClick={run}
            disabled={loading}
            className="mt-4 w-full rounded-[var(--radius-md)] bg-accent px-4 py-2.5 text-sm font-medium text-[#ffffff] hover:bg-accent/90 transition-colors disabled:opacity-50"
          >
            {loading ? "Procesando…" : "Procesar documento"}
          </button>
        </Card>

        {result && (
          <div className="space-y-4">
            {result.error && (
              <Alert tone="danger" title="No se pudo procesar">{result.error}</Alert>
            )}

            {!result.error && fields && (
              <Card className="p-5">
                <div className="flex items-center gap-3 mb-4">
                  {result.ok ? (
                    <StatusBadge tone="success" dot>válido</StatusBadge>
                  ) : (
                    <StatusBadge tone="danger" dot>rechazado</StatusBadge>
                  )}
                  <span className="text-sm text-muted-foreground">
                    {result.ok
                      ? "Todos los campos pasan la validación cruzada."
                      : `${violations.length} violación${violations.length === 1 ? "" : "es"}.`}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                  {FIELDS.map((f) => {
                    const violated = violations.filter((v) => v.field === f);
                    return (
                      <div key={f} className="rounded-[var(--radius-md)] bg-muted/40 px-3 py-2.5">
                        <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                          {FIELD_LABEL[f]}
                        </p>
                        <p
                          className={`mt-0.5 font-mono text-sm ${
                            violated.length > 0 ? "text-danger font-semibold" : "text-foreground"
                          }`}
                        >
                          {fields[f] || "—"}
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

                {violations.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {violations.map((v) => (
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
          </div>
        )}

        {history.length > 0 && (
          <section>
            <h3 className="text-sm font-semibold text-foreground mb-3">Historial de documentos (persistido en Postgres)</h3>
            <div className="overflow-x-auto rounded-[var(--radius-md)] shadow-[var(--shadow-card)] bg-card">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] bg-[var(--gray-50)]">
                    <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Estado</th>
                    <th scope="col" className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Violaciones</th>
                    <th scope="col" className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Fecha</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {history.map((h) => {
                    const count = parseViolations(h.violations).length;
                    return (
                      <tr key={h.id}>
                        <td className="px-4 py-2.5">
                          <StatusBadge tone={h.valid ? "success" : "danger"} dot>
                            {h.valid ? "válido" : "rechazado"}
                          </StatusBadge>
                        </td>
                        <td className="px-4 py-2.5 text-right tabular-nums text-foreground">{count}</td>
                        <td className="px-4 py-2.5 text-right text-xs text-muted-foreground">
                          {new Date(h.created_at).toLocaleString("es-ES")}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
