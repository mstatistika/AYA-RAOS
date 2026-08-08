#!/usr/bin/env python3
from pathlib import Path
import argparse, hashlib, json, shutil, subprocess, sys, time

PACKAGE='AYA-RAOS-BRAND-ECOSYSTEM-HUB-v1.4.1'
ALLOWED_PREFIXES=('feature/','preview/')

def run(cmd,cwd,check=True):
    return subprocess.run(cmd,cwd=cwd,text=True,capture_output=True,check=check)

def sha(p):
    return hashlib.sha256(Path(p).read_bytes()).hexdigest()

def main():
    ap=argparse.ArgumentParser(); ap.add_argument('--repo',default='.'); args=ap.parse_args()
    repo=Path(args.repo).resolve(); pkg=Path(__file__).resolve().parents[1]; payload=pkg/'payload'; manifest=json.loads((pkg/'MANIFEST.json').read_text())
    if not (repo/'.git').exists(): print('ERROR: repo .git tidak ditemukan.'); return 2
    branch=run(['git','branch','--show-current'],repo).stdout.strip()
    if branch in {'main','master'} or not branch.startswith(ALLOWED_PREFIXES):
        print(f'ERROR: installer hanya boleh dijalankan di feature/* atau preview/*, bukan {branch or "detached HEAD"}.'); return 3

    # Package integrity and exact v1.4.0 preimage check for every file this refinement will overwrite.
    for item in manifest['payloadFiles']:
        src=payload/item['path']; target=repo/item['path']
        if not src.exists() or sha(src)!=item['sha256']:
            print('ERROR: payload checksum gagal:',item['path']); return 4
        if not target.exists():
            print('ERROR: target v1.4.0 tidak ditemukan:',item['path']); return 5
        current=sha(target)
        if current!=item['preimageSha256']:
            print('ERROR: preimage mismatch:',item['path'])
            print('Expected v1.4.0:',item['preimageSha256']); print('Actual         :',current)
            print('Installer berhenti agar perubahan manual tidak tertimpa.'); return 6

    # Preserve protected system and package-relevant files via backup.
    stamp=time.strftime('%Y%m%d-%H%M%S'); backup=repo/f'.aya-raos-backup-ecosystem-v141-{stamp}'; backup.mkdir(parents=True)
    rollback=[]
    for item in manifest['payloadFiles']:
        rel=Path(item['path']); target=repo/rel
        rollback.append({'path':rel.as_posix(),'existed':target.exists()})
        dst=backup/rel; dst.parent.mkdir(parents=True,exist_ok=True); shutil.copy2(target,dst)
    (backup/'rollback-manifest.json').write_text(json.dumps({'package':PACKAGE,'files':rollback},indent=2)+'\n')

    for item in manifest['payloadFiles']:
        rel=Path(item['path']); src=payload/rel; dst=repo/rel; dst.parent.mkdir(parents=True,exist_ok=True); shutil.copy2(src,dst)

    v=run([sys.executable,str(pkg/'tools/validate.py'),'--repo',str(repo)],repo,check=False)
    print(v.stdout,end='')
    if v.returncode:
        print('ERROR: validation gagal. Jalankan rollback menggunakan backup:',backup)
        return 7

    diff=run(['git','diff','--check'],repo,check=False)
    if diff.returncode:
        print('ERROR: git diff --check gagal.'); print(diff.stdout); return 8

    print('\nINSTALL COMPLETE — PREVIEW ONLY')
    print('Branch :',branch)
    print('Backup :',backup)
    print('Preview: gunakan port preview Codespaces yang aktif; jangan jalankan server kedua pada port yang sama.')
    print('Target QA: 1366x768, 1440x900, 1024x768, 390x844.')
    print('Jangan commit/push sebelum visual preview disetujui.')
    return 0

if __name__=='__main__': raise SystemExit(main())
