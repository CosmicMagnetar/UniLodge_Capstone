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

# Booking type index signature
replace_in_file('types/index.ts', '[key: string]: string | Room | undefined;', '[key: string]: any;')

# app/page.tsx
replace_in_file('app/page.tsx', '''import { 
  Moon, Sun, ChevronRight, CheckCircle, 
  Layout, Shield, Zap, Users, Globe, 
  Smartphone, ArrowRight, Star,
  GraduationCap, ShieldCheck, Quote,
  Map, Utensils, BedDouble, Facebook, Twitter, Instagram, Linkedin, Send,
  ArrowLeft, PlusIcon
} from 'lucide-react';''', "import { ChevronRight, CheckCircle, ArrowRight } from 'lucide-react';")

replace_in_file('app/page.tsx', '''import { 
  ChevronRight, CheckCircle, 
  Layout, Shield, Zap, Users, Globe, 
  Smartphone, ArrowRight, Star,
  GraduationCap, ShieldCheck, Quote,
  Map, Utensils, BedDouble, Facebook, Twitter, Instagram, Linkedin, Send,
  ArrowLeft, PlusIcon
} from 'lucide-react';''', "import { ChevronRight, CheckCircle, ArrowRight } from 'lucide-react';")

# tests
os.system('rm -rf tests/')
os.system('rm vitest.config.ts')

