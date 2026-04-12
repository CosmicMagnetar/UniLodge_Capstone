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

# page.tsx icons
replace_in_file('app/page.tsx', "import { ChevronRight, CheckCircle, ArrowRight } from 'lucide-react';", '''import { 
  ChevronRight, CheckCircle, ArrowRight,
  ArrowLeft, PlusIcon, ShieldCheck, BedDouble, Utensils, 
  Shield, Globe, Smartphone, Send, Facebook, Twitter, Instagram, Linkedin,
  Star, GraduationCap, Map, Quote, Layout, Zap, Users
} from 'lucide-react';''')

# page.tsx useEffect
replace_in_file('app/page.tsx', '''  useEffect(() => {
    if (autoplay) {
      const interval = setInterval(handleNext, 5000);
      return () => clearInterval(interval);
    }
  }, [autoplay, handleNext]);''', '''  useEffect(() => {
    if (autoplay) {
      const interval = setInterval(handleNext, 5000);
      return () => clearInterval(interval);
    }
    return undefined;
  }, [autoplay, handleNext]);''')

# page.tsx unused onNavigate
regex_replace('app/page.tsx', r'const onNavigate = \(page: string\) => \{\n[^\}]+\n\s*\};\n', '')

# RootLayoutContent unused
replace_in_file('components/RootLayoutContent.tsx', "import { useRouter, usePathname } from 'next/navigation';", "import { useRouter } from 'next/navigation';")

# AiAgentChat type
replace_in_file('components/pages/AiAgentChat.tsx', "const [chat, setChat] = useState<ChatSession | null>(null);", "const [chat, setChat] = useState<any>(null);")

# layout/index.ts
replace_in_file('components/layout/index.ts', "export { TopNav as Header } from './Header'", "export { default as Header } from './Header'")

