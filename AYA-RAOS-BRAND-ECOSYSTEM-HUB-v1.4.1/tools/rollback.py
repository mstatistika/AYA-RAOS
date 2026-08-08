#!/usr/bin/env python3
from pathlib import Path
import argparse,json,shutil

def main():
    ap=argparse.ArgumentParser(); ap.add_argument('--repo',default='.'); ap.add_argument('--backup',required=True); a=ap.parse_args()
    repo=Path(a.repo).resolve(); backup=Path(a.backup).resolve(); mf=backup/'rollback-manifest.json'
    if not mf.exists(): print('ERROR: rollback manifest tidak ditemukan'); return 2
    data=json.loads(mf.read_text())
    for item in data['files']:
        rel=Path(item['path']); target=repo/rel; src=backup/rel
        if item['existed']:
            if not src.exists(): print('ERROR: backup file hilang',rel); return 3
            target.parent.mkdir(parents=True,exist_ok=True); shutil.copy2(src,target)
        elif target.exists(): target.unlink()
    print('ROLLBACK COMPLETE')
    return 0

if __name__=='__main__': raise SystemExit(main())
