#!/usr/bin/env python3
from pathlib import Path
from html.parser import HTMLParser
import argparse, re, hashlib, subprocess, sys

EXPECTED_PROTECTED={
 'js/supabase-client.js':'aa66a63842b80d612d50b79d892b4b014efc7ae125fb640083329e4e55a9be9e',
 'js/testimonial-wizard.js':'6816e038468e97840dc37a69610e3f8340a31d33dd034ee5bdaaa86838f93e59',
 'js/order-api.js':'d862e767ab231bff76e3e6b610f7a8e234005477ce38dae56d552f6892c133bf',
 'js/cart-page.js':'18fb808a6ef37eebf3911413e37a6c145ac7686f48e8aca8bdb91fe2381e754d',
 'js/business-inquiry.js':'2bcffd8e74a761b732ec39cf603ad4f26643fecb4cefa4a7178bb0f4f180e086',
 'supabase/migrations/20260806153000_aya_phase2_order_foundation.sql':'e02d96171e1feb4020d986fff171b054c8fc4b0da357ed61c977324620672514',
}

def sha(p): return hashlib.sha256(Path(p).read_bytes()).hexdigest()
class Parser(HTMLParser):
    def __init__(self): super().__init__(); self.refs=[]; self.ids=[]
    def handle_starttag(self,tag,attrs):
        a=dict(attrs)
        if 'id' in a: self.ids.append(a['id'])
        for k in ('src','href'):
            if a.get(k): self.refs.append(a[k])

def main():
    ap=argparse.ArgumentParser(); ap.add_argument('--repo',default='.'); args=ap.parse_args()
    root=Path(args.repo).resolve(); errors=[]; warnings=[]
    def ok(c,m):
        if not c: errors.append(m)
    required=['index.html','spice.html','farm.html','snacks.html','products.html','product.html','cart.html','business.html','testimonials.html','share.html','information.html','404.html','css/site.css','css/share.css','js/line-page.js','js/data.js','js/config.js','js/order-api.js','docs/AYA-RAOS-BRAND-ECOSYSTEM-HUB-v1.0.md','supabase/migrations/20260808061500_aya_snacks_line_name_normalization.sql']
    for f in required: ok((root/f).exists(),f'missing {f}')
    for hp in root.glob('*.html'):
        s=hp.read_text(errors='ignore'); ok('noindex' in s,f'{hp.name}: noindex missing')
        p=Parser(); p.feed(s); ok(len(p.ids)==len(set(p.ids)),f'{hp.name}: duplicate id')
        for v in p.refs:
            if v.startswith(('http:','https:','mailto:','tel:','#','javascript:')): continue
            target=v.split('?',1)[0].split('#',1)[0]
            if target and not target.endswith('/'): ok((root/target).exists(),f'{hp.name}: missing local ref {v}')
    index=(root/'index.html').read_text(); ok('AYA RAOS adalah rumah besar kuliner' in index,'homepage master-brand definition missing'); ok('id="lini-aya"' in index,'line gateway missing')
    for f,key in [('spice.html','spice'),('farm.html','farm'),('snacks.html','snack')]:
        s=(root/f).read_text(); ok(f'data-line-key="{key}"' in s,f'{f}: line key missing'); ok('Rumah Besar AYA' in s,f'{f}: master hub return missing'); ok('data-line-product-grid' in s,f'{f}: product region missing')
    site=(root/'css/site.css').read_text(); ok('!important' not in site,'site.css contains !important'); ok('--line-spice:#8a171a' in site,'Spice Red token missing'); ok('--line-farm:#486342' in site,'Farm Green token missing'); ok('--line-snack:#c87932' in site,'Warm Amber token missing'); ok('grid-template-columns:minmax(0,1fr) 258px' in site,'catalog filter is not right-side desktop'); ok('@keyframes ayaTickerVertical' in site,'testimonial ticker fix missing'); ok('variant-option input:focus-visible+span' in site,'variant focus fix missing')
    sharecss=(root/'css/share.css').read_text(); ok('--aya-header-height' not in sharecss,'stale share header token'); ok('--header-h' in sharecss,'shared header token missing from share')
    config=(root/'js/config.js').read_text(); ok('whatsappNumber: "628562646444"' in config,'WhatsApp changed'); ok('orderPersistence: true' in config,'order persistence changed'); ok('businessSupply: Object.freeze({ enabled: true, persistence: true })' in config,'B2B persistence changed'); ok('shipping: Object.freeze({ enabled: false' in config,'shipping gate changed'); ok('payment: Object.freeze({ enabled: false' in config,'payment gate changed')
    data=(root/'js/data.js').read_text(); ok(data.count('"line": "AYA Snacks & Drinks"')>=5,'Snacks & Drinks name not normalized')
    prices=[('Original',40000),('Cumi/Pete',50000),('Jengkol',55000),('Teri Nasi',60000),('300 g',105000),('Paket 4 pcs',50000),('Satuan 1 pcs',15000),('Kulit 500 g',30000),('Ceker 500 g',30000),('10 pcs + chili oil',40000),('250 ml',15000)]
    for n,p in prices: ok(re.search(r'"name":\s*"'+re.escape(n)+r'"\s*,\s*"price":\s*'+str(p),data) is not None,f'approved price missing {n}={p}')
    info=(root/'information.html').read_text(); ok('Konfirmasi digital aktif setelah Package 2' not in info,'stale Package 2 copy'); ok('Belum pada Package 1' not in info,'stale Package 1 copy'); ok('setelah sistem persistence aktif' not in info,'stale persistence copy')
    share=(root/'share.html').read_text();
    for token in ['testimonialWizardForm','data-testimonial-wizard','testimonialName','testimonialMessage','testimonialMediaFile','data-wizard-submit']: ok(token in share,f'share contract missing {token}')
    for rel,h in EXPECTED_PROTECTED.items(): ok((root/rel).exists() and sha(root/rel)==h,f'protected/integration hash changed: {rel}')
    for js in (root/'js').glob('*.js'):
        r=subprocess.run(['node','--check',str(js)],capture_output=True,text=True)
        if r.returncode: errors.append(f'{js.name}: node --check failed')
    if (root/'.git').exists():
        r=subprocess.run(['git','diff','--check'],cwd=root,capture_output=True,text=True)
        if r.returncode: errors.append('git diff --check failed: '+r.stdout.strip())
    print('AYA RAOS Brand Ecosystem Hub v1.4 validator')
    print(f'PASS checks: {"NO" if errors else "YES"}')
    print('Errors:',len(errors)); [print('ERROR:',e) for e in errors]
    print('Warnings:',len(warnings)); [print('WARN:',w) for w in warnings]
    return 1 if errors else 0
if __name__=='__main__': raise SystemExit(main())
