import { NextResponse } from "next/server";
import { getSql } from "@/lib/db/client";

export async function GET() {
  try {
    const db = getSql();
    const rows = await db`SELECT id, valid, violations, created_at FROM escaneo.documents ORDER BY id DESC LIMIT 20`;
    return NextResponse.json({ documents: rows });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error leyendo historial" },
      { status: 500 },
    );
  }
}
