#!/usr/bin/env python3
"""Atualiza a lista de arquivos (FILES) e a VERSION do service worker.

Rode depois de alterar qualquer arquivo do app:
    python3 tools/build-sw.py

Cada arquivo leva os 12 primeiros caracteres do SHA-1 do conteúdo; o service
worker usa isso para baixar só o que mudou. A VERSION muda sempre que a lista muda.
"""
import hashlib
import json
import pathlib
import re

APP = pathlib.Path(__file__).resolve().parent.parent / 'knight-app'
SKIP = {'sw.js', '_headers', 'LEIA-ME.txt'}


def sha(p):
    return hashlib.sha1(p.read_bytes()).hexdigest()[:12]


files = sorted(
    p.relative_to(APP).as_posix()
    for p in APP.rglob('*')
    if p.is_file() and p.name not in SKIP and not p.name.startswith('.')
)
entries = [['./', sha(APP / 'index.html')]] + [[f, sha(APP / f)] for f in files]
files_json = json.dumps(entries, separators=(',', ':'))
version = hashlib.sha1(files_json.encode()).hexdigest()[:10]

sw = APP / 'sw.js'
src = sw.read_text()
src, n1 = re.subn(r"^const VERSION = '[^']*';", f"const VERSION = '{version}';", src, flags=re.M)
src, n2 = re.subn(r'^const FILES = .*;$', lambda _: f'const FILES = {files_json};', src, flags=re.M)
assert n1 == 1 and n2 == 1, 'não achei VERSION/FILES no sw.js'
sw.write_text(src)
print(f'sw.js: versão {version}, {len(entries)} arquivos')
