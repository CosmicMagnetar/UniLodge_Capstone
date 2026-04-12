import re

with open('app/page.tsx', 'r') as f: content = f.read()
with open('app/page.tsx', 'w') as f: f.write(content.replace("import { useRouter } from 'next/navigation';", ""))

with open('components/layout/Header.tsx', 'r') as f: content = f.read()

# find all `onClick={(e) => {` and replace with `onClick={() => {`
content = content.replace("onClick={(e) => {", "onClick={() => {")
# but if the next line has `e.preventDefault()`, we must keep `e`
content = re.sub(r'onClick=\{\(\)\s*=>\s*\{\s+e\.preventDefault\(\)', r'onClick={(e) => {\n                    e.preventDefault()', content)
with open('components/layout/Header.tsx', 'w') as f: f.write(content)