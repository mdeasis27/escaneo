import json
from pathlib import Path

import pytest

from escaneo.benchmark import benchmark
from escaneo.extract import extract_fields
from escaneo.validate import luhn_valid, valid_date, validate_fields

FIXTURES = Path(__file__).parent / "fixtures"
# One fixture shared with vitest: lib/escaneo/benchmark.test.ts reads the same file.
SHARED_FIXTURE = Path(__file__).resolve().parents[2] / "lib" / "escaneo" / "fixtures" / "benchmark.json"


def _load(name: str):
    path = SHARED_FIXTURE if name == "benchmark.json" else FIXTURES / name
    return json.loads(path.read_text(encoding="utf-8"))


def _docs():
    return _load("documents.json")["documents"]


def test_extract_fields_parses_lines():
    f = extract_fields("reference REF-202442\namount 1234.56\ncurrency USD\ndate 2024-03-15\naccount 400000123457")
    assert f["reference"] == "REF-202442"
    assert f["amount"] == "1234.56"
    assert f["currency"] == "USD"
    assert f["date"] == "2024-03-15"
    assert f["account"] == "400000123457"


def test_validation_flags_ocr_corruption():
    bad = validate_fields({
        "reference": "REF-202509", "amount": "1234.S6", "currency": "USD",
        "date": "2024-03-21", "account": "400000123515",
    })
    assert [v["field"] for v in bad["violations"]] == ["amount"]


def test_luhn_and_date():
    assert luhn_valid("400000123457")
    assert not luhn_valid("400000123458")
    assert valid_date("2024-02-29")
    assert not valid_date("2023-02-29")
    assert not valid_date("2024-06-31")


def test_benchmark_matches_fixture():
    fixture = _load("benchmark.json")
    result = benchmark(_docs())

    assert result["n"] == fixture["n"]
    assert result["totalFields"] == fixture["totalFields"]
    assert result["corruptFields"] == fixture["corruptFields"]
    assert result["correctFields"] == fixture["correctFields"]
    assert result["rawAccuracy"] == pytest.approx(fixture["rawAccuracy"], abs=1e-10)
    assert result["caught"] == fixture["caught"]
    assert result["falsePositives"] == fixture["falsePositives"]
    assert result["recall"] == pytest.approx(fixture["recall"], abs=1e-10)
    assert result["effectiveAccuracy"] == pytest.approx(fixture["effectiveAccuracy"], abs=1e-10)


def test_validation_flags_exactly_the_corrupt_documents():
    corrupt_ids = [d["id"] for d in _docs() if not validate_fields(extract_fields(d["ocrText"]))["ok"]]
    assert corrupt_ids == ["d07", "d08", "d09", "d10", "d11", "d12"]


def test_check_levels_match_the_shared_fixture():
    from escaneo.benchmark import document_outcomes
    from escaneo.validate import validate_fields

    fixture = _load("benchmark.json")
    docs = _load("documents.json")["documents"]
    for level in range(6):
        statuses = [o["status"] for o in document_outcomes(docs, level)]
        assert statuses == fixture["outcomesByLevel"][str(level)]
    assert validate_fields({"reference": "x", "amount": "x", "currency": "x", "date": "x", "account": "x"}, 0)["ok"]


def test_outcomes_name_the_misread_field_and_the_check_that_caught_it():
    from escaneo.benchmark import document_outcomes

    fixture = _load("benchmark.json")
    for level in range(6):
        outcomes = document_outcomes(_docs(), level)
        assert [o["misread"] for o in outcomes] == [fixture["misreads"].get(o["id"]) for o in outcomes]
        assert [o["caughtBy"] for o in outcomes] == fixture["caughtByLevel"][str(level)]


def test_validate_fields_treats_none_level_as_all_checks():
    import json
    from pathlib import Path
    from escaneo.extract import extract_fields
    from escaneo.validate import validate_fields

    docs = json.loads((Path(__file__).parent / "fixtures" / "documents.json").read_text())
    for d in docs["documents"] if isinstance(docs, dict) else docs:
        fields = extract_fields(d["ocrText"] if "ocrText" in d else d["ocr_text"])
        assert validate_fields(fields, None) == validate_fields(fields)
