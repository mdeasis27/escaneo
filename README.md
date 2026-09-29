# Escaneo

**Multi-modal processor** — a simulated OCR layer with deterministic errors, schema field
extraction, and cross-validation (checksums) that catches OCR corruption before it flows
downstream.

> **Result:** raw extraction is **90%** field-accurate (54/60) because the OCR layer injects 6
> errors. Cross-validation flags **6/6** corrupt fields (**100% recall, 0 false positives**) —
> checksums catch a digit that *looks* fine but breaks the math — lifting effective accuracy to
> **100%**.

---

## Result

| Metric | Value |
|---|---|
| Fields (12 docs × 5) | 60 |
| Raw field accuracy | **90%** (54 / 60) |
| Injected OCR errors | 6 |
| Validation recall | **100%** (6 / 6) |
| False positives | **0** |
| Effective accuracy (post-validation) | **100%** |

The six corrupt fields are one each of the four "letter-for-digit" confusions (amount `5`→`S`,
account `3`→`I`, reference `5`→`S`, amount `0`→`O`) plus two that keep the format but break the
semantics: an impossible date (`2024-13-23`) and a checksum failure.

---

## Architecture

```
lib/escaneo/                # canonical core (TypeScript, tested)
  extract.ts                #   parse field lines from the OCR text layer
  validate.ts               #   format + checksum + calendar cross-validation
  benchmark.ts              #   raw accuracy · recall · false positives
  demo.ts                   #   wires documents into every number
  data/                     #   documents.json (clean + OCR text with errors)
  fixtures/                 #   benchmark.json (pinned metrics)
backend/                    # same math in Python + pytest (authoritative)
  src/escaneo/              #   extract.py · validate.py · benchmark.py
  tests/                    #   pinned to tests/fixtures/{documents,benchmark}.json
app/                        # Next.js landing + demo dashboard (Vercel, demo mode)
```

The OCR layer is the committed `ocrText` (a text layer with deterministic, injected errors); the
extractor and validator are the real, shared logic. Checksums (Luhn on `account`, check digit on
`reference`) are the cross-validation that catches a corruption which preserves the format —
a regex alone would miss it.

## Design decisions & tradeoffs

1. **Cross-validation means checksums, not just regex.** A format check catches `5`→`S`; a Luhn
   checksum catches a digit swapped for another digit. The demo includes both kinds of error to
   make the distinction visible.
2. **The OCR is a committed text layer, not a real image→text model.** A real OCR engine is a
   non-deterministic dependency; the demo pins the errors so the *validation* is the star.
   Production swaps a real OCR behind the same `ocrText` contract.
3. **Errors are per-field, not per-document.** A single corrupt field doesn't invalidate the
   whole document — the validator flags the field, so downstream can route for manual review
   instead of discarding the entire scan.

## What did not work

- **Format-preserving corruption is the hard case.** A `5`→`S` is easy; a `1`→`7` in a free-text
  field with no checksum is undetectable without a cross-field constraint. The demo's `account`
  and `reference` carry checksums precisely to catch that class, and documents it as the boundary.
- **The synthetic OCR errors are single-character confusions.** Real OCR also drops characters,
  merges words, and mis-segments lines; the demo isolates the *validation* layer rather than the
  full noise model.

## Run it

```bash
# frontend demo + TS tests
pnpm install && pnpm dev      # http://localhost:3000
pnpm test                     # 11 vitest tests

# backend (authoritative math) — Python 3.12+
cd backend && uv sync --extra dev && uv run pytest   # 5 tests, pinned fixtures
```

## Stack

Next.js 16 · TypeScript · Vitest · Tailwind v4 · Python 3.13 · pytest
