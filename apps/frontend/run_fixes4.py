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
replace_in_file('app/page.tsx', '''import { 
  ChevronRight, CheckCircle, ArrowRight
} from 'lucide-react';''', '''import { 
  ChevronRight, CheckCircle, ArrowRight,
  ArrowLeft, PlusIcon, ShieldCheck, BedDouble, Utensils, 
  Shield, Globe, Smartphone, Send, Facebook, Twitter, Instagram, Linkedin,
  Star, GraduationCap, Map, Quote, Layout, Zap, Users
} from 'lucide-react';''')

# layout/index.ts
replace_in_file('components/layout/index.ts', "export { AppProvider } from './AppProvider'", "")

# AiAgentChat unused ChatSession
replace_in_file('components/pages/AiAgentChat.tsx', 'import { ChatSession } from "@google/generative-ai";', '')

# index.ts types
replace_in_file('types/index.ts', "[x: string]: string | Room | undefined;", "[x: string]: any;")

# Footer
replace_in_file('components/common/Footer.tsx', "Send, Facebook, Twitter, Instagram, Linkedin, Building2", "Send, Facebook, Twitter, Instagram, Linkedin")

# Header
replace_in_file('components/layout/Header.tsx', "Shield, Search, Heart, Home, Menu, X", "Search, Heart, Home, Menu, X")
regex_replace('components/layout/Header.tsx', r'onClick=\{\(e\) => \{', 'onClick={() => {')

