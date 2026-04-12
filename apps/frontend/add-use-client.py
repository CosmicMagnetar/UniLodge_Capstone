import os
import re

def process_file(filepath):
    if filepath.endswith('.tsx') or filepath.endswith('.ts'):
        with open(filepath, 'r') as f:
            content = f.read()

        changed = False

        if not content.startswith('"use client"') and not content.startswith("'use client'"):
            content = '"use client";\n' + content
            changed = True

        replacements = [
            (r"from\s+['\"](?:\.\.\/)+types(?:\.ts)?['\"]", "from '@/types'"),
            (r"from\s+['\"]\.\/types(?:\.ts)?['\"]", "from '@/types'"),
            (r"from\s+['\"](?:\.\.\/)+services\/", "from '@/services/"),
            (r"from\s+['\"]\.\/services\/", "from '@/services/"),
            (r"from\s+['\"](?:\.\.\/)+components\/", "from '@/components/"),
            (r"from\s+['\"]\.\/components\/", "from '@/components/"),
            (r"from\s+['\"]\.\.\/pages\/", "from '@/components/layout/"),
            (r"from\s+['\"].*ThemeContext(?:\.tsx)?['\"]", "from '@/contexts/ThemeContext'"),
            (r"from\s+['\"].*useToast(?:\.ts)?['\"]", "from '@/hooks/useToast'"),
            (r"from\s+['\"].*ToastProvider(?:\.tsx)?['\"]", "from '@/components/ToastProvider'")
        ]

        for pattern, replacement in replacements:
            new_content = re.sub(pattern, replacement, content)
            if new_content != content:
                content = new_content
                changed = True

        if changed:
            with open(filepath, 'w') as f:
                f.write(content)

def process_dir(directory):
    if not os.path.exists(directory):
        return
    for root, dirs, files in os.walk(directory):
        for file in files:
            process_file(os.path.join(root, file))

process_dir('app')
process_dir('components')
process_dir('hooks')
process_dir('contexts')
print("Finished adding 'use client' and fixing imports!")
