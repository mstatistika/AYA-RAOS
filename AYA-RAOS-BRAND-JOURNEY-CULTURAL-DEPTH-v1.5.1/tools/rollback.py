#!/usr/bin/env python3
from pathlib import Path
import argparse, hashlib, json, shutil, subprocess


def sha(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()


def main():
    ap = argparse.ArgumentParser(description='Rollback AYA RAOS v1.5.1 preview package.')
    ap.add_argument('--repo', default='.')
    ap.add_argument('--backup', required=True)
    args = ap.parse_args()

    repo = Path(args.repo).resolve()
    backup = Path(args.backup).resolve()
    mf = backup / 'rollback-manifest.json'

    if not (repo / '.git').exists():
        print('ERROR: repository .git tidak ditemukan.')
        return 2
    if not mf.exists():
        print('ERROR: rollback-manifest.json tidak ditemukan di backup.')
        return 2

    data = json.loads(mf.read_text(encoding='utf-8'))
    if data.get('package') != 'AYA-RAOS-BRAND-JOURNEY-CULTURAL-DEPTH-v1.5.1':
        print('ERROR: backup bukan milik package v1.5.1 ini.')
        return 2

    branch = subprocess.run(['git', 'branch', '--show-current'], cwd=repo, text=True, capture_output=True).stdout.strip()
    if branch in {'main', 'master'}:
        print('ERROR: rollback package preview tidak boleh dijalankan di main/master.')
        return 3

    for item in data['files']:
        rel = Path(item['path'])
        target = repo / rel
        src = backup / rel
        if item['existed']:
            if not src.exists():
                print('ERROR: backup file hilang:', rel)
                return 4
            expected = item.get('sha256_before')
            if expected and sha(src) != expected:
                print('ERROR: backup checksum berubah:', rel)
                return 4
            target.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(src, target)
        elif target.exists():
            target.unlink()
            # Remove empty parent dirs created by the package, but never climb above repo.
            parent = target.parent
            while parent != repo and parent.exists():
                try:
                    parent.rmdir()
                except OSError:
                    break
                parent = parent.parent

    for rel, expected in data.get('protected_files', {}).items():
        p = repo / rel
        if not p.exists() or sha(p) != expected:
            print('ERROR: protected file tidak sesuai setelah rollback:', rel)
            return 5

    diff = subprocess.run(['git', 'diff', '--check'], cwd=repo, text=True, capture_output=True)
    if diff.returncode:
        print('ERROR: git diff --check gagal setelah rollback.')
        print(diff.stdout)
        return 6

    print('ROLLBACK COMPLETE')
    print('Branch :', branch or '(detached)')
    print('Backup :', backup)
    print('Repository kembali ke state sebelum installer v1.5.1 menyentuh payload files.')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
