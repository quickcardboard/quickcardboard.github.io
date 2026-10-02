#!/usr/bin/env python3
"""Bundle index.html + css/ + js/ into one self-contained file (for phones / sharing).
Usage: python3 tools/build.py   ->  dist/time-tactics-single.html
Script order is taken from the <script src> tags in index.html."""
import re,os
root=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
rd=lambda p:open(os.path.join(root,p),encoding='utf8').read()
h=rd('index.html')
h=re.sub(r'<link rel="stylesheet" href="([^"]+)">',lambda m:'<style>\n'+rd(m.group(1))+'\n</style>',h)
def js(m):
    s=rd(m.group(1));assert '</script' not in s;return '<script>\n'+s+'\n</script>'
h=re.sub(r'<script src="([^"]+)"></script>',js,h)
os.makedirs(os.path.join(root,'dist'),exist_ok=True)
out=os.path.join(root,'dist','time-tactics-single.html');open(out,'w',encoding='utf8').write(h);print('wrote',out,len(h),'bytes')
