# Installer QA — v1.4.1

Installer simulation result: **PASS**.

Verified:

- refuses `main` / `master`;
- requires `feature/*` or `preview/*`;
- verifies every targeted file against exact v1.4.0 preimage SHA-256;
- verifies package payload SHA-256;
- creates backup + rollback manifest;
- installs refinement payload;
- runs v1.4.1 validator successfully;
- `git diff --check` passes;
- rollback restores all targeted v1.4.0 preimages exactly.
