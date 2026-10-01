// scripts/seed.mjs
// Creates the escaneo schema + tables and seeds realistic data.
// Run: node scripts/seed.mjs  (requires DATABASE_URL in env or .env.local)

import { readFileSync } from "node:fs";
import { neon } from "@neondatabase/serverless";

function loadEnv() {
  try {
    const raw = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
    for (const line of raw.split("\n")) {
      const m = line.trim().match(/^([A-Z0-9_]+)=(.*)$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
    }
  } catch {
    /* no .env.local */
  }
}

loadEnv();

const sql = neon(process.env.DATABASE_URL);

const DOCUMENTS = [
  ["reference REF-202442\namount 1234.56\ncurrency USD\ndate 2024-03-15\naccount 400000123457", true, "[]"],
  ["reference REF-20244Z\namount 1234.56\ncurrency USD\ndate 2024-03-15\naccount 400000123457", false, "[{\"field\":\"reference\",\"reason\":\"format\"}]"],
  ["reference REF-202442\namount 1234.56\ncurrency USD\ndate 2024-03-15\naccount 400000123450", false, "[{\"field\":\"account\",\"reason\":\"checksum\"}]"],
  ["reference REF-999999\namount 75.00\ncurrency MXN\ndate 2024-05-20\naccount 400000111111", true, "[]"],
];

async function main() {
  await sql`CREATE SCHEMA IF NOT EXISTS escaneo`;
  await sql`DROP TABLE IF EXISTS escaneo.documents`;

  await sql`
    CREATE TABLE escaneo.documents (
      id serial PRIMARY KEY,
      ocr_text text NOT NULL,
      valid boolean NOT NULL,
      violations text NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now()
    )`;

  for (const [ocrText, valid, violations] of DOCUMENTS) {
    await sql`INSERT INTO escaneo.documents (ocr_text, valid, violations) VALUES (${ocrText}, ${valid}, ${violations})`;
  }

  const [{ d }] = await sql`SELECT count(*)::int AS d FROM escaneo.documents`;
  console.log(`Seeded escaneo schema: ${d} documents`);
}

main().catch((e) => {
  console.error("Seed failed:", e.message);
  process.exit(1);
});
