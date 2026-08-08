#!/usr/bin/env python3
from pathlib import Path
import argparse, hashlib, json, shutil, subprocess, sys, time
BASELINE='0893aeaacc874694a3a24b4eb292d4e887f4ac5c'
PACKAGE='AYA-RAOS-BRAND-ECOSYSTEM-HUB-v1.4.0'

def run(cmd,cwd,check=True): return subprocess.run(cmd,cwd=cwd,text=True,capture_output=True,check=check)
def sha(p): return hashlib.sha256(Path(p).read_bytes()).hexdigest()

def main():
    ap=argparse.ArgumentParser(); ap.add_argument('--repo',default='.'); args=ap.parse_args()
    repo=Path(args.repo).resolve(); pkg=Path(__file__).resolve().parents[1]; payload=pkg/'payload'; manifest=json.loads((pkg/'MANIFEST.json').read_text())
    if not (repo/'.git').exists(): print('ERROR: repo .git tidak ditemukan.'); return 2
    branch=run(['git','branch','--show-current'],repo).stdout.strip()
    if branch in {'main','master'}: print(f'ERROR: installer menolak branch {branch}. Buat preview/feature branch dari main terlebih dahulu.'); return 3
    head=run(['git','rev-parse','HEAD'],repo).stdout.strip()
    if head!=BASELINE: print('ERROR: baseline mismatch.'); print('Expected:',BASELINE); print('Actual  :',head); return 4
    dirty=run(['git','status','--porcelain','--untracked-files=no'],repo).stdout.strip()
    if dirty: print('ERROR: tracked working tree harus bersih sebelum install.'); print(dirty); return 5
    # payload integrity
    for item in manifest['payloadFiles']:
        p=payload/item['path']
        if not p.exists() or sha(p)!=item['sha256']: print('ERROR: payload checksum gagal:',item['path']); return 6
    stamp=time.strftime('%Y%m%d-%H%M%S'); backup=repo/f'.aya-raos-backup-ecosystem-v140-{stamp}'; backup.mkdir(parents=True)
    rollback=[]
    for item in manifest['payloadFiles']:
        rel=Path(item['path']); target=repo/rel; existed=target.exists(); rollback.append({'path':rel.as_posix(),'existed':existed})
        if existed:
            dst=backup/rel; dst.parent.mkdir(parents=True,exist_ok=True); shutil.copy2(target,dst)
    (backup/'rollback-manifest.json').write_text(json.dumps({'package':PACKAGE,'baseline':BASELINE,'files':rollback},indent=2)+'\n')
    for item in manifest['payloadFiles']:
        rel=Path(item['path']); src=payload/rel; dst=repo/rel; dst.parent.mkdir(parents=True,exist_ok=True); shutil.copy2(src,dst)
    v=run([sys.executable,str(pkg/'tools/validate.py'),'--repo',str(repo)],repo,check=False)
    print(v.stdout,end='')
    if v.returncode:
        print('ERROR: validation gagal. Jalankan rollback menggunakan backup:',backup)
        return 7
    print('\nINSTALL COMPLETE — PREVIEW ONLY')
    print('Branch :',branch)
    print('Backup :',backup)
    print('Preview: python3 -m http.server 4173')
    print('Jangan commit/push sebelum visual preview disetujui.')
    return 0
if __name__=='__main__': raise SystemExit(main())
