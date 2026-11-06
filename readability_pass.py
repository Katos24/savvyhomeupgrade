#!/usr/bin/env python3
"""
Lead2Project readability pass: run from the root of your project.

  python3 readability_pass.py            # dry run: shows what would change, changes nothing
  python3 readability_pass.py --write    # applies the changes

What it changes (only inside className strings):
  1. Headlines in the heading font that are ALL CAPS -> sentence case, with real line height.
     Small labels with wide letter-spacing (tracking-[0.1em] etc.) keep their caps on purpose.
  2. Faint text gets more contrast (light gray a step darker, dim white a step brighter).
  3. Old warm beige colors -> clean slate.

It never touches logic, text content, emails, or files listed in SKIP.
Run it on a git branch, then check `git diff` before committing.
"""
import re
import sys
import pathlib

ROOTS = ['app', 'components']
SKIP_DIRS = {'node_modules', '.next', 'emails'}
SKIP_FILES = {
    # already updated by hand, or not worth touching
    'NewHero.tsx', 'Nav.tsx', 'FormAndDashboardSection.tsx', 'QuoteSection.tsx', 'QuoteBuilderDemo.tsx',
    'PaymentsReviewsSection.tsx', 'InvoiceShowcaseSection.tsx', 'FeaturesSection.tsx', 'Pricing.tsx',
    'FAQSection.tsx', 'FinalCTA.tsx', 'Footer.tsx', 'HowItWorksTour.tsx', 'marketingUI.tsx', 'marketingTheme.tsx',
    'CompanyDashboardClient.tsx', 'LeadsClient.tsx', 'CardsView.tsx', 'AdStudio.tsx',
    'ImportSection.tsx', 'ProfitSection.tsx',  # no longer used
}
# app/signup/page.tsx and app/login/page.tsx were also updated by hand
SKIP_PATHS = {'app/signup/page.tsx', 'app/login/page.tsx', 'app/page.tsx', 'app/layout.tsx'}

DISPLAY = 'font-[family-name:var(--font-display)]'

COLOR_MAP = {
    # warm beige grays -> slate (a step darker where it's text)
    '#faf9f5': ('bg', 'slate-50'), '#F4EFE6': ('bg', 'slate-50'), '#f4efe6': ('bg', 'slate-50'),
    '#FBF8F2': ('bg', 'slate-50'), '#fbf8f2': ('bg', 'slate-50'),
    '#f5f1e8': ('bg', 'slate-100'), '#f0ece1': ('bg', 'slate-100'), '#e7e2d8': ('bg', 'slate-200'),
    '#a8a29e': ('text', 'slate-500'), '#78716c': ('text', 'slate-600'), '#57534e': ('text', 'slate-700'),
    '#292524': ('text', 'slate-800'), '#1c1917': ('text', 'slate-900'),
}
TEXT_BUMP = {
    'text-white/40': 'text-white/60', 'text-white/50': 'text-white/70', 'text-white/55': 'text-white/75',
    'text-white/60': 'text-white/80', 'text-white/70': 'text-white/85',
    'text-[#3a3f45]': 'text-[#2a2f35]', 'text-[#5a6067]': 'text-[#3f454c]', 'text-[#5a6068]': 'text-[#3f454c]',
}
BIG_SIZES = {
    'lg:text-[92px]': 'lg:text-[64px]', 'lg:text-[88px]': 'lg:text-[64px]', 'lg:text-[84px]': 'lg:text-[64px]',
    'xl:text-[88px]': 'xl:text-[68px]', 'lg:text-[80px]': 'lg:text-[60px]', 'lg:text-8xl': 'lg:text-6xl',
    'sm:text-8xl': 'sm:text-6xl', 'text-8xl': 'text-6xl', 'sm:text-7xl': 'sm:text-6xl', 'lg:text-7xl': 'lg:text-6xl',
}
TOKEN = re.compile(r'^((?:[a-z0-9-]+:)*)(text|bg|border|ring|from|to|via|divide|placeholder)-\[(#[0-9a-fA-F]{6})\](/\d+)?$')


def map_color(t: str) -> str:
    m = TOKEN.match(t)
    if not m:
        return t
    prefix, kind, hexv, alpha = m.group(1), m.group(2), m.group(3), m.group(4) or ''
    hit = COLOR_MAP.get(hexv) or COLOR_MAP.get(hexv.lower())
    if not hit:
        return t
    return f'{prefix}{kind}-{hit[1]}{alpha}'


def fix_classes(cls: str, display_names: set) -> str:
    toks = cls.split(' ')
    has_display = DISPLAY in toks or any(f'${{{n}}}' in cls for n in display_names)
    wide_label = any(t.startswith('tracking-[0.') for t in toks)
    out = []
    for t in toks:
        if not t:
            out.append(t)
            continue
        if has_display and not wide_label:
            if t in ('uppercase', 'tracking-wider', 'tracking-wide', 'tracking-widest'):
                continue
            if re.fullmatch(r'leading-\[0\.\d+\]', t) or t == 'leading-none':
                t = 'leading-[1.1]'
            t = BIG_SIZES.get(t, t)
        t = TEXT_BUMP.get(t, t)
        t = map_color(t)
        out.append(t)
    return ' '.join(out)


CLASS_TOKEN = re.compile(r'^[A-Za-z0-9:\[\]#/._%()-]+$')


def process(src: str) -> str:
    # names of constants that hold the heading-font class, e.g. const D = 'font-[family-name:var(--font-display)]'
    display_names = set(re.findall(r"const\s+(\w+)\s*=\s*['\"`]" + re.escape(DISPLAY) + r"['\"`]", src))

    src = re.sub(r'className="([^"]*)"', lambda m: 'className="' + fix_classes(m.group(1), display_names) + '"', src)

    def tpl(m):
        body = m.group(1)
        parts = re.split(r'(\$\{[^}]*\})', body)
        has_d = any(p in {f'${{{n}}}' for n in display_names} for p in parts)
        fixed = []
        for p in parts:
            if p.startswith('${'):
                fixed.append(p)
            else:
                fixed.append(fix_classes((DISPLAY + ' ' + p) if has_d else p, display_names).replace(DISPLAY + ' ', '', 1) if has_d else fix_classes(p, display_names))
        return 'className={`' + ''.join(fixed) + '`}'

    src = re.sub(r'className=\{`([^`]*)`\}', tpl, src)

    # string literals used inside class expressions: 'text-white/60 hover:text-white'
    def lit(m):
        body = m.group(1)
        toks = [t for t in body.split(' ') if t]
        if not toks or not all(CLASS_TOKEN.match(t) for t in toks):
            return m.group(0)
        if not any(t.startswith(('text-', 'bg-', 'border-', 'uppercase', 'tracking-', 'leading-')) for t in toks):
            return m.group(0)
        return "'" + fix_classes(body, display_names) + "'"

    src = re.sub(r"'([^'\n]{1,300})'", lit, src)
    return src


def main():
    write = '--write' in sys.argv
    changed = []
    for root in ROOTS:
        base = pathlib.Path(root)
        if not base.exists():
            continue
        for f in base.rglob('*.tsx'):
            if any(part in SKIP_DIRS for part in f.parts):
                continue
            if f.name in SKIP_FILES or f.as_posix() in SKIP_PATHS:
                continue
            old = f.read_text(encoding='utf-8')
            new = process(old)
            if new != old:
                n = sum(1 for a, b in zip(old.splitlines(), new.splitlines()) if a != b)
                changed.append((f.as_posix(), n))
                if write:
                    f.write_text(new, encoding='utf-8')
    for path, n in sorted(changed):
        print(f'{n:4d} lines  {path}')
    print(f'\n{len(changed)} files {"updated" if write else "would change (dry run, nothing written)"}.')
    if not write:
        print('Run again with --write to apply.')


if __name__ == '__main__':
    main()
