import os
import re

def replace_in_file(filepath, old, new):
    if not os.path.exists(filepath): return
    with open(filepath, 'r') as f: content = f.read()
    with open(filepath, 'w') as f: f.write(content.replace(old, new))

def regex_replace(filepath, pattern, replacement):
    if not os.path.exists(filepath): return
    with open(filepath, 'r') as f: content = f.read()
    with open(filepath, 'w') as f: f.write(re.sub(pattern, replacement, content))

# page.tsx unused
replace_in_file('app/page.tsx', '''Star, GraduationCap, Map, Quote, Layout, Zap, Users''', 'Map')
regex_replace('app/page.tsx', r'const router = useRouter\(\);\n', '')

# Header e issue
replace_in_file('components/layout/Header.tsx', "onClick={() => {", "onClick={(e) => {")

