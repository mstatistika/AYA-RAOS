from pathlib import Path
import subprocess

SITE = Path("css/site.css")
EXPECTED_BLOB = "f833e9912ad992f23f36e45e42e80ef60ad6b79c"


def git_blob(path: Path) -> str:
    return subprocess.check_output(["git", "hash-object", str(path)], text=True).strip()


def replace_once(text: str, old: str, new: str, label: str) -> str:
    count = text.count(old)
    if count != 1:
        raise SystemExit(f"{label}: expected 1 exact match, found {count}")
    return text.replace(old, new, 1)


before = SITE.read_text(encoding="utf-8")
actual_blob = git_blob(SITE)
if actual_blob != EXPECTED_BLOB:
    raise SystemExit(f"site.css blob mismatch: expected {EXPECTED_BLOB}, found {actual_blob}")

start_marker = "/* Information — icon-rich wizard, restrained decoration */"
end_marker = "/* Pasokan Usaha — B2B vNext APPROVED 2026-08-20 */"
if before.count(start_marker) != 1 or before.count(end_marker) != 1:
    raise SystemExit("Information/Pasokan marker invariant failed")

start = before.index(start_marker)
end = before.index(end_marker)
if start >= end:
    raise SystemExit("Information block ordering invariant failed")

after = before[:start] + before[end:]

compact_desktop = """  .information-hero{min-height:116px;padding-block:10px}.information-hero h1{font-size:36px}.information-section{padding-top:8px}.info-viewport{min-height:440px;padding:17px}.info-viewport h2{font-size:29px}.info-steps li{min-height:115px;padding:7px}.step-icon{width:36px;height:36px}.step-icon svg{width:20px;height:20px}\n\n"""
after = replace_once(after, compact_desktop, "", "compact desktop Information rules")

after = replace_once(
    after,
    ".information-layout{width:min(calc(100% - 34px),1000px)}",
    "",
    "compact tablet Information layout",
)

after = replace_once(
    after,
    ".page-intro-grid,.information-hero .container{grid-template-columns:1fr;gap:12px}",
    ".page-intro-grid{grid-template-columns:1fr;gap:12px}",
    "shared mobile page-intro selector",
)

after = replace_once(
    after,
    ".information-layout{width:min(calc(100% - 28px),720px);grid-template-columns:1fr}.information-nav{position:relative;top:auto}.information-nav nav{grid-template-columns:1fr 1fr}.info-viewport{min-height:0}.info-steps{grid-template-columns:1fr}.faq-list{grid-template-columns:1fr}",
    "",
    "legacy mobile Information rules",
)

after = replace_once(
    after,
    ".form-grid,.definition-pair,.information-nav nav{grid-template-columns:1fr}",
    ".form-grid{grid-template-columns:1fr}",
    "520px shared form selector",
)

for forbidden in (
    "information-hero",
    "information-section",
    "information-layout",
    "information-nav",
    "info-viewport",
    "info-steps",
    "step-icon",
    "definition-pair",
    "check-list",
    "faq-list",
    "info-support",
):
    if forbidden in after:
        raise SystemExit(f"legacy Information selector still present in site.css: {forbidden}")

if end_marker not in after:
    raise SystemExit("Pasokan marker was lost")
if "body[data-page=\"business\"]" not in after:
    raise SystemExit("Business protected block invariant failed")
if "body[data-page=\"cart\"]" not in after:
    raise SystemExit("Cart protected block invariant failed")
if "body[data-page=\"home\"]" not in after:
    raise SystemExit("Homepage protected block invariant failed")

SITE.write_text(after, encoding="utf-8")
print("Information CSS extraction: PASS")
print(f"site.css bytes: {len(before.encode('utf-8'))} -> {len(after.encode('utf-8'))}")
