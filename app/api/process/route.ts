import { NextResponse } from "next/server";
import { getSql } from "@/lib/db/client";
import { extractFields } from "@/lib/escaneo/extract";
import { validateFields } from "@/lib/escaneo/validate";

export async function POST(request: Request) {
  let ocrText: string;
  try {
    const body = await request.json();
    ocrText = typeof body.ocrText === "string" ? body.ocrText : "";
  } catch {
    return NextResponse.json({ error: "Cuerpo JSON inválido" }, { status: 400 });
  }

  if (!ocrText.trim()) {
    return NextResponse.json({ error: "Pega un documento OCR" }, { status: 400 });
  }

  const fields = extractFields(ocrText);
  const verdict = validateFields(fields);

  try {
    const db = getSql();
    const violations = JSON.stringify(verdict.violations);
    await db`INSERT INTO escaneo.documents (ocr_text, valid, violations) VALUES (${ocrText}, ${verdict.ok}, ${violations})`;
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error guardando en Postgres" },
      { status: 500 },
    );
  }

  return NextResponse.json({ fields, ok: verdict.ok, violations: verdict.violations });
}
