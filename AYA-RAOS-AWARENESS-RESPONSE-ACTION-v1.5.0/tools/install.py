#!/usr/bin/env python3
from pathlib import Path
import argparse, hashlib, json, shutil, subprocess, sys, time

PACKAGE = 'AYA-RAOS-AWARENESS-RESPONSE-ACTION-v1.5.0'
ALLOWED_PREFIXES = ('feature/', 'preview/')
BACKUP_PREFIX = '.aya-raos-backup-awareness-v150-'


def run(cmd, cwd, check=True):
    return subprocess.run(cmd, cwd=cwd, text=True, capture_output=True, check=check)


def sha(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()


def status_paths(repo):
    tracked = set()
    untracked = set()
    for args in (['git', 'diff', '--name-only'], ['git', 'diff', '--cached', '--name-only']):
        r = run(args, repo, check=False)
        if r.returncode == 0:
            tracked.update(x.strip() for x in r.stdout.splitlines() if x.strip())
    r = run(['git', 'ls-files', '--others', '--exclude-standard'], repo, check=False)
    if r.returncode == 0:
        untracked.update(x.strip() for x in r.stdout.splitlines() if x.strip())
    return tracked, untracked


def main():
    ap = argparse.ArgumentParser(description='Install AYA RAOS Awareness → Response → Action v1.5.0 for preview only.')
    ap.add_argument('--repo', default='.', help='Path to AYA-RAOS repository root')
    args = ap.parse_args()

    repo = Path(args.repo).resolve()
    pkg = Path(__file__).resolve().parents[1]
    payload = pkg / 'payload'
    manifest_path = pkg / 'MANIFEST.json'

    if not (repo / '.git').exists():
        print('ERROR: .git tidak ditemukan. Jalankan installer dari repository AYA-RAOS.')
        return 2
    if not manifest_path.exists() or not payload.exists():
        print('ERROR: struktur package tidak lengkap.')
        return 2

    manifest = json.loads(manifest_path.read_text(encoding='utf-8'))
    if manifest.get('package') != PACKAGE:
        print('ERROR: package manifest tidak sesuai.')
        return 2

    branch = run(['git', 'branch', '--show-current'], repo, check=False).stdout.strip()
    if not branch or branch in {'main', 'master'} or not branch.startswith(ALLOWED_PREFIXES):
        print(f'ERROR: installer hanya boleh di feature/* atau preview/*, bukan {branch or "detached HEAD"}.')
        return 3

    # Protect integrations before touching any source.
    for rel, expected in manifest.get('protected_files', {}).items():
        p = repo / rel
        if not p.exists():
            print('ERROR: protected file tidak ditemukan:', rel)
            return 4
        actual = sha(p)
        if actual != expected:
            print('ERROR: protected/integration file berubah:', rel)
            print('Expected:', expected)
            print('Actual  :', actual)
            print('Installer berhenti agar kontrak order/testimonial tidak tertimpa atau disamarkan.')
            return 4

    items = manifest.get('payload_files', [])
    payload_paths = {item['path'] for item in items}

    # Refuse unrelated tracked changes. Existing v1.4 package changes on payload paths are allowed.
    tracked_dirty, untracked = status_paths(repo)
    unrelated_tracked = sorted(p for p in tracked_dirty if p not in payload_paths)
    if unrelated_tracked:
        print('ERROR: ada tracked changes di luar scope package:')
        for p in unrelated_tracked:
            print(' -', p)
        print('Commit/stash/rollback perubahan tersebut sebelum instalasi.')
        return 5

    # Validate package checksums and preimages. We support main v1.3, v1.4.0, v1.4.1, or already-final payload.
    states_seen = set()
    already_final = 0
    for item in items:
        rel = item['path']
        src = payload / rel
        target = repo / rel
        expected_payload = item['sha256']
        if not src.exists() or sha(src) != expected_payload:
            print('ERROR: payload checksum gagal:', rel)
            return 6

        allowed = {x['sha256']: x['baseline'] for x in item.get('allowed_existing', [])}
        if target.exists():
            current = sha(target)
            if current == expected_payload:
                already_final += 1
                continue
            if current not in allowed:
                print('ERROR: preimage mismatch:', rel)
                print('Actual:', current)
                print('File bukan baseline main-v1.3/v1.4.0/v1.4.1 yang dikenali dan bukan final v1.5.0.')
                print('Installer berhenti agar perubahan manual tidak tertimpa.')
                return 7
            states_seen.add(allowed[current])
        else:
            missing_allowed = set(item.get('allowed_missing_baselines', []))
            if not missing_allowed:
                print('ERROR: target wajib tidak ditemukan:', rel)
                return 7
            states_seen.update(missing_allowed)

    # Backup all payload targets before copy, including marker for files that did not exist.
    stamp = time.strftime('%Y%m%d-%H%M%S')
    backup = repo / f'{BACKUP_PREFIX}{stamp}'
    backup.mkdir(parents=True, exist_ok=False)
    rollback_items = []
    for item in items:
        rel = Path(item['path'])
        target = repo / rel
        existed = target.exists()
        rollback_items.append({'path': rel.as_posix(), 'existed': existed, 'sha256_before': sha(target) if existed else None})
        if existed:
            dst = backup / rel
            dst.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(target, dst)

    rollback_manifest = {
        'package': PACKAGE,
        'created_at': stamp,
        'branch': branch,
        'source_baseline_main': manifest.get('source_baseline_main'),
        'files': rollback_items,
        'protected_files': manifest.get('protected_files', {}),
    }
    (backup / 'rollback-manifest.json').write_text(json.dumps(rollback_manifest, indent=2) + '\n', encoding='utf-8')

    # Install final source of truth.
    for item in items:
        rel = Path(item['path'])
        src = payload / rel
        dst = repo / rel
        dst.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(src, dst)

    # Validate source after copy.
    v = run([sys.executable, str(pkg / 'tools' / 'validate.py'), '--repo', str(repo)], repo, check=False)
    print(v.stdout, end='')
    if v.stderr.strip():
        print(v.stderr, file=sys.stderr)
    if v.returncode:
        print('\nERROR: validation gagal.')
        print('Rollback tersedia di:', backup)
        print(f'python3 "{pkg / "tools" / "rollback.py"}" --repo "{repo}" --backup "{backup}"')
        return 8

    diff = run(['git', 'diff', '--check'], repo, check=False)
    if diff.returncode:
        print('ERROR: git diff --check gagal.')
        print(diff.stdout)
        return 9

    # Re-check protected files after install.
    for rel, expected in manifest.get('protected_files', {}).items():
        if sha(repo / rel) != expected:
            print('ERROR: protected hash berubah setelah instalasi:', rel)
            return 10

    print('\nINSTALL COMPLETE — PREVIEW ONLY')
    print('Package :', PACKAGE)
    print('Branch  :', branch)
    print('Backup  :', backup)
    if states_seen:
        print('Input   :', ', '.join(sorted(states_seen)), '(compatible preimages detected)')
    if already_final:
        print('Note    :', already_final, 'payload file(s) sudah final sebelum copy.')
    if untracked:
        relevant_untracked = [p for p in sorted(untracked) if not p.startswith(BACKUP_PREFIX) and PACKAGE not in p]
        if relevant_untracked:
            print('WARN    : untracked files lain tidak disentuh:', ', '.join(relevant_untracked[:8]) + (' ...' if len(relevant_untracked) > 8 else ''))
    print('Preview : python3 -m http.server 4173')
    print('QA      : 1366x768 · 1440x900 · 1024x768 · 390x844')
    print('Gate    : Awareness → Response → Action, 3 line pages, Catalog, Product Detail, Cart, Business, Testimonial/Share.')
    print('DB      : migration normalisasi nama Snacks hanya disalin sebagai source; TIDAK dieksekusi.')
    print('Jangan commit/push/merge sebelum browser preview disetujui.')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
