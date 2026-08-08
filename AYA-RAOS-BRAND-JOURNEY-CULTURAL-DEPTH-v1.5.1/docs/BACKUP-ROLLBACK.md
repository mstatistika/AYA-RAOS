# Backup & Rollback

The installer does not modify `main`/`master` and creates a local backup before copying any payload source.

Backup naming:

`.aya-raos-backup-brand-v151-YYYYMMDD-HHMMSS`

The backup contains:

- every pre-existing payload target;
- a `rollback-manifest.json` recording whether each file existed and its pre-install SHA-256;
- source baseline identity;
- protected-file hashes.

Rollback command:

```bash
python3 AYA-RAOS-BRAND-JOURNEY-CULTURAL-DEPTH-v1.5.1/tools/rollback.py \
  --repo . \
  --backup .aya-raos-backup-brand-v151-YYYYMMDD-HHMMSS
```

The rollback tool restores previous files and removes payload files that did not exist before installation.
