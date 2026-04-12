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

# PriceSuggestionTool
replace_in_file('components/pages/PriceSuggestionTool.tsx', 'from "../types.ts"', 'from "@/types"')
replace_in_file('components/pages/PriceSuggestionTool.tsx', 'from "./ui.tsx"', 'from "@/components/pages/ui"')

# RoomCard
replace_in_file('components/pages/RoomCard.tsx', "from '../types'", "from '@/types'")

# Modals
replace_in_file('components/booking/BookingRequestModal.tsx', "from '../common/Modal'", "from '@/components/common/Modal'")
replace_in_file('components/payment/PaymentModal.tsx', "from '../common/Modal'", "from '@/components/common/Modal'")

# geminiService
replace_in_file('services/geminiService.ts', 'import.meta.env.VITE_OPENROUTER_API_KEY', 'process.env.NEXT_PUBLIC_OPENROUTER_API_KEY')

# RootLayoutContent
regex_replace('components/RootLayoutContent.tsx', r'import \{ ToastProvider, useToast \} from "@/components/ToastProvider";\n', '')
replace_in_file('components/RootLayoutContent.tsx', 'import { User, Role } from "@/types";', 'import { User } from "@/types";')
regex_replace('components/RootLayoutContent.tsx', r'const pathname = usePathname\(\);\n', '')
replace_in_file('components/RootLayoutContent.tsx', 'user={currentUser}', 'user={currentUser as any}')

# animated-loading-skeleton
replace_in_file('components/ui/animated-loading-skeleton.tsx', "import { Shield } from 'lucide-react'", "")
replace_in_file('components/ui/animated-loading-skeleton.tsx', "variants={glowVariants}", "variants={glowVariants as any}")

# Toast
replace_in_file('components/ui/Toast.tsx', "import React, { useState, useEffect } from 'react';", "import React, { useEffect } from 'react';")

# layout/index.ts
replace_in_file('components/layout/index.ts', "export { Header } from './Header'", "export { TopNav as Header } from './Header'")

