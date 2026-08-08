#!/usr/bin/env python3
from pathlib import Path
from html.parser import HTMLParser
import argparse, hashlib, re, subprocess, sys

PROTECTED={
 'js/supabase-client.js':'aa66a63842b80d612d50b79d892b4b014efc7ae125fb640083329e4e55a9be9e',
 'js/testimonial-wizard.js':'6816e038468e97840dc37a69610e3f8340a31d33dd034ee5bdaaa86838f93e59',
 'js/order-api.js':'d862e767ab231bff76e3e6b610f7a8e234005477ce38dae56d552f6892c133bf',
 'js/cart-page.js':'18fb808a6ef37eebf3911413e37a6c145ac7686f48e8aca8bdb91fe2381e754d',
 'js/business-inquiry.js':'2bcffd8e74a761b732ec39cf603ad4f26643fecb4cefa4a7178bb0f4f180e086',
 'supabase/migrations/20260806153000_aya_phase2_order_foundation.sql':'e02d96171e1feb4020d986fff171b054c8fc4b0da357ed61c977324620672514',
}

def sha(path): return hashlib.sha256(Path(path).read_bytes()).hexdigest()

class Parser(HTMLParser):
    def __init__(self):
        super().__init__(); self.refs=[]; self.ids=[]
    def handle_starttag(self,tag,attrs):
        a=dict(attrs)
        if a.get('id'): self.ids.append(a['id'])
        for key in ('src','href'):
            if a.get(key): self.refs.append(a[key])

def main():
    ap=argparse.ArgumentParser(); ap.add_argument('--repo',default='.'); args=ap.parse_args()
    root=Path(args.repo).resolve(); errors=[]; warnings=[]
    def ok(cond,msg):
        if not cond: errors.append(msg)

    required=['index.html','spice.html','farm.html','snacks.html','products.html','product.html','cart.html','business.html','testimonials.html','share.html','information.html','404.html','css/site.css','css/share.css','js/line-page.js','js/data.js','js/config.js','js/order-api.js','js/product.js','js/catalog.js','docs/AYA-RAOS-BRAND-ECOSYSTEM-HUB-v1.0.md','docs/AYA-RAOS-WEBSITE-MASTER-BLUEPRINT-v1.5.md','docs/AYA-RAOS-DECISION-LOG-v1.5.md']
    for f in required: ok((root/f).exists(),f'missing {f}')

    for hp in root.glob('*.html'):
        s=hp.read_text(errors='ignore'); ok('noindex' in s.lower(),f'{hp.name}: noindex missing')
        p=Parser(); p.feed(s); ok(len(p.ids)==len(set(p.ids)),f'{hp.name}: duplicate id')
        for v in p.refs:
            if v.startswith(('http:','https:','mailto:','tel:','#','javascript:','data:')): continue
            target=v.split('?',1)[0].split('#',1)[0]
            if target and not target.endswith('/'): ok((root/target).exists(),f'{hp.name}: missing local ref {v}')

    index=(root/'index.html').read_text()
    order=['awareness-hero','id="kenapa-raos"','class="why-lines"','id="lini-aya"','class="line-detail-section"','class="response-gateway"','class="hero-product-feature"','class="home-testimonials"','class="action-close"']
    pos=[index.find(x) for x in order]; ok(all(x>=0 for x in pos),'homepage journey section missing'); ok(pos==sorted(pos),'homepage order is not Awareness → Response → Action')
    hs=index.find('<section class="home-hero'); he=index.find('</section>',hs); hero=index[hs:he]
    ok('AYA RAOS' in hero and 'Ada Rasa' in hero,'master identity missing from hero')
    ok('spice.html' not in hero and 'farm.html' not in hero and 'snacks.html' not in hero,'hero still behaves as three-line selector')
    ok('Sambal AYA' not in hero,'hero still behaves as product-first')
    for token in ['KENAPA TIGA LINI?','TIGA LINI AYA','KENALI LININYA','SEKARANG, PILIH KEBUTUHAN ANDA','HERO PRODUCT SAAT INI','BUKTI &amp; ADVOCACY']:
        ok(token in index,f'homepage narrative stage missing: {token}')
    for line in ['AYA Spice Haven','AYA Farm','AYA Snacks &amp; Drinks']: ok(line in index,f'homepage line missing: {line}')
    for public_color in ('Spice Red','Farm Green','Warm Amber','SPICE RED','FARM GREEN','WARM AMBER'): ok(public_color not in index,f'homepage exposes internal color label: {public_color}')

    for f,key in [('spice.html','spice'),('farm.html','farm'),('snacks.html','snack')]:
        s=(root/f).read_text(); ok(f'data-line-key="{key}"' in s,f'{f}: line key missing'); ok('data-qr-entry-context' in s,f'{f}: QR entry hook missing'); ok('index.html#kenapa-raos' in s,f'{f}: master-awareness route missing'); ok('data-line-sibling-nav' in s,f'{f}: sibling navigation missing')

    site=(root/'css/site.css').read_text(); ok('!important' not in site,'site.css contains !important'); ok('100svh' not in site,'site.css contains 100svh'); ok('--line-spice:#8a171a' in site,'Spice token missing'); ok('--line-farm:#486342' in site,'Farm token missing'); ok('--line-snack:#c87932' in site,'Snacks token missing'); ok('.awareness-hero-grid' in site and '.response-gateway' in site and '.action-close' in site,'journey CSS missing')
    for dead in ['.ecosystem-visual-shell','.ecosystem-mini-nav','.hero-product-summary','.ecosystem-final-cta','.line-card-grid','.brand-story']: ok(dead not in site,f'dead v1.4 homepage selector remains: {dead}')
    ok('grid-template-columns:minmax(0,1fr) 258px' in site,'catalog filter is not right-side desktop'); ok('@keyframes ayaTickerVertical' in site,'testimonial ticker missing'); ok('variant-option input:focus-visible+span' in site,'variant focus-visible missing')

    sharecss=(root/'css/share.css').read_text(); ok('--aya-header-height' not in sharecss,'stale share header token'); ok('--header-h' in sharecss,'share header token missing')
    config=(root/'js/config.js').read_text()
    for token in ['whatsappNumber: "628562646444"','orderPersistence: true','businessSupply: Object.freeze({ enabled: true, persistence: true })','shipping: Object.freeze({ enabled: false','payment: Object.freeze({ enabled: false','environment: "staging"']: ok(token in config,f'config invariant missing: {token}')

    data=(root/'js/data.js').read_text(); ok('AYA Snack & Drinks' not in data,'old Snacks line name remains'); ok(data.count('"line": "AYA Snacks & Drinks"')>=5,'normalized Snacks data missing')
    prices=[('Original',40000),('Cumi/Pete',50000),('Jengkol',55000),('Teri Nasi',60000),('300 g',105000),('Paket 4 pcs',50000),('Satuan 1 pcs',15000),('Kulit 500 g',30000),('Ceker 500 g',30000),('10 pcs + chili oil',40000),('250 ml',15000)]
    for n,pv in prices: ok(re.search(r'"name":\s*"'+re.escape(n)+r'"\s*,\s*"price":\s*'+str(pv),data) is not None,f'approved price signature missing {n}={pv}')

    products=(root/'products.html').read_text(); ok('AYA Snack &amp; Drinks' not in products,'catalog old line label remains'); ok('AYA Snacks &amp; Drinks' in products,'catalog normalized line label missing')
    linejs=(root/'js/line-page.js').read_text(); ok('/^qr-[a-z0-9-]+$/i.test(source)' in linejs,'QR detection missing'); ok('data-qr-entry-context' in linejs,'QR context render missing'); ok('url.searchParams.set("src", source)' in linejs,'QR source propagation missing')
    productjs=(root/'js/product.js').read_text(); ok('data-breadcrumb-line' in productjs and 'product-ecosystem-context' in productjs,'product owning-line context missing')

    share=(root/'share.html').read_text()
    for token in ['testimonialWizardForm','data-testimonial-wizard','testimonialName','testimonialMessage','testimonialMediaFile','data-wizard-submit']: ok(token in share,f'share contract missing {token}')
    for rel,h in PROTECTED.items(): ok((root/rel).exists() and sha(root/rel)==h,f'protected/integration hash changed: {rel}')

    for js in (root/'js').glob('*.js'):
        r=subprocess.run(['node','--check',str(js)],capture_output=True,text=True)
        if r.returncode: errors.append(f'{js.name}: node --check failed')
    if (root/'.git').exists():
        r=subprocess.run(['git','diff','--check'],cwd=root,capture_output=True,text=True)
        if r.returncode: errors.append('git diff --check failed: '+r.stdout.strip())

    robots=(root/'robots.txt').read_text(); vercel=(root/'vercel.json').read_text(); ok('Disallow: /' in robots,'robots staging block changed'); ok('noindex, nofollow, noarchive' in vercel,'Vercel noindex header changed')
    rootlog=(root/'DECISION_LOG.md').read_text(); canon=(root/'docs/AYA-RAOS-DECISION-LOG-v1.5.md').read_text(); bp=(root/'docs/AYA-RAOS-WEBSITE-MASTER-BLUEPRINT-v1.5.md').read_text(); ok('DL-001 through DL-608' in rootlog,'root decision coverage stale'); ok('supersedes DL-596' in canon,'DL-596 superseding decision missing'); ok('Awareness → Response → Action' in bp,'blueprint journey missing')

    print('AYA RAOS Awareness → Response → Action v1.5.0 validator')
    print(f'PASS checks: {"NO" if errors else "YES"}')
    print('Errors:',len(errors)); [print('ERROR:',e) for e in errors]
    print('Warnings:',len(warnings)); [print('WARN:',w) for w in warnings]
    return 1 if errors else 0
if __name__=='__main__': raise SystemExit(main())
