#!/usr/bin/env bash
# ============================================================================
# UniLodge-V2 Security Audit & Credential Purge Script
# Run from monorepo root: bash scripts/security-audit.sh
# ============================================================================
set -euo pipefail

RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color
BOLD='\033[1m'

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
FOUND_ISSUES=0

echo -e "${BOLD}${CYAN}══════════════════════════════════════════════════════════════${NC}"
echo -e "${BOLD}${CYAN}  UniLodge-V2 Security Audit — Credential Scan${NC}"
echo -e "${BOLD}${CYAN}══════════════════════════════════════════════════════════════${NC}"
echo ""

# ── 1. Scan for hardcoded secrets ──────────────────────────────────────────
echo -e "${BOLD}[1/5] Scanning for hardcoded secrets...${NC}"

SECRET_PATTERNS=(
  "sk-or-v1-"
  "mongodb+srv://"
  "your-secret-key-change-in-production"
  "your-refresh-secret-change-in-production"
  "OPENROUTER_API_KEY=sk-"
  "dfSxYc8idKaxOvFn"
)

for pattern in "${SECRET_PATTERNS[@]}"; do
  MATCHES=$(grep -rl --include="*.ts" --include="*.tsx" --include="*.js" \
    --include="*.json" --include="*.env*" --include="*.sql" \
    --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=dist \
    "$pattern" "$REPO_ROOT" 2>/dev/null || true)

  if [ -n "$MATCHES" ]; then
    echo -e "  ${RED}✗ FOUND${NC} pattern '${pattern:0:30}...' in:"
    echo "$MATCHES" | while read -r f; do
      echo -e "    ${YELLOW}→ ${f#$REPO_ROOT/}${NC}"
    done
    FOUND_ISSUES=$((FOUND_ISSUES + 1))
  else
    echo -e "  ${GREEN}✓${NC} Pattern '${pattern:0:30}...' not found in source files"
  fi
done

echo ""

# ── 2. Check for committed .env files ──────────────────────────────────────
echo -e "${BOLD}[2/5] Checking for committed .env files...${NC}"

ENV_FILES=$(find "$REPO_ROOT" -name ".env" -o -name ".env.local" -o -name ".env.production" \
  | grep -v node_modules | grep -v .git || true)

if [ -n "$ENV_FILES" ]; then
  echo -e "  ${RED}✗ FOUND committed .env files:${NC}"
  echo "$ENV_FILES" | while read -r f; do
    echo -e "    ${YELLOW}→ ${f#$REPO_ROOT/}${NC}"
  done
  FOUND_ISSUES=$((FOUND_ISSUES + 1))
else
  echo -e "  ${GREEN}✓ No .env files found outside .gitignore${NC}"
fi

echo ""

# ── 3. Verify .gitignore coverage ──────────────────────────────────────────
echo -e "${BOLD}[3/5] Verifying .gitignore coverage...${NC}"

GITIGNORE="$REPO_ROOT/.gitignore"
REQUIRED_PATTERNS=(".env" ".env.local" ".env.production" ".env.*.local" "*.pem")

for pat in "${REQUIRED_PATTERNS[@]}"; do
  if grep -qF "$pat" "$GITIGNORE" 2>/dev/null; then
    echo -e "  ${GREEN}✓${NC} '$pat' is in .gitignore"
  else
    echo -e "  ${RED}✗ MISSING${NC} '$pat' not in .gitignore"
    FOUND_ISSUES=$((FOUND_ISSUES + 1))
  fi
done

echo ""

# ── 4. Check for NEXT_PUBLIC_ keys that should not be public ───────────────
echo -e "${BOLD}[4/5] Scanning for sensitive NEXT_PUBLIC_ env vars...${NC}"

DANGEROUS_PUBLIC=$(grep -r "NEXT_PUBLIC_OPENROUTER\|NEXT_PUBLIC_.*SECRET\|NEXT_PUBLIC_.*KEY.*=sk-" \
  --include="*.env*" --include="*.ts" --include="*.tsx" \
  --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=dist \
  "$REPO_ROOT" 2>/dev/null || true)

if [ -n "$DANGEROUS_PUBLIC" ]; then
  echo -e "  ${RED}✗ FOUND sensitive keys exposed via NEXT_PUBLIC_:${NC}"
  echo "$DANGEROUS_PUBLIC" | while read -r line; do
    echo -e "    ${YELLOW}→ $line${NC}"
  done
  FOUND_ISSUES=$((FOUND_ISSUES + 1))
else
  echo -e "  ${GREEN}✓ No sensitive NEXT_PUBLIC_ variables found${NC}"
fi

echo ""

# ── 5. Generate root .env template ─────────────────────────────────────────
echo -e "${BOLD}[5/5] Generating root .env.template...${NC}"

ROOT_ENV_TEMPLATE="$REPO_ROOT/.env.template"
cat > "$ROOT_ENV_TEMPLATE" << 'ENVTEMPLATE'
# ============================================================================
# UniLodge-V2 — Root Environment Variables
# Copy this file to .env and fill in your values.
# NEVER commit .env files to version control.
# ============================================================================

# ── MongoDB ─────────────────────────────────────────────────────────────────
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/<db>?appName=<app>

# ── JWT Authentication ──────────────────────────────────────────────────────
# Generate with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_SECRET=
REFRESH_SECRET=

# ── Backend Server ──────────────────────────────────────────────────────────
PORT=3001
NODE_ENV=development
SEED_DATABASE=false

# ── OpenRouter AI ───────────────────────────────────────────────────────────
OPENROUTER_API_KEY=
OPENROUTER_MODEL=google/gemma-4-31b-it:free
OPENROUTER_TEMPERATURE=0.7

# ── AI Engine ───────────────────────────────────────────────────────────────
AI_ENGINE_PORT=3002
AI_RATE_LIMIT_PER_MINUTE=10
AI_RATE_LIMIT_PER_HOUR=100
AI_DAILY_LIMIT=50

# ── RAG Configuration ──────────────────────────────────────────────────────
RAG_ENABLED=true
RAG_TOP_K=20

# ── Pinecone (optional — falls back to in-memory in dev) ────────────────────
# PINECONE_API_KEY=
# PINECONE_INDEX=

# ── Frontend (Vercel) ──────────────────────────────────────────────────────
NEXT_PUBLIC_API_URL=http://localhost:3001/api

# ── Supabase (not active — reserved for future migration) ───────────────────
# NEXT_PUBLIC_SUPABASE_URL=
# NEXT_PUBLIC_SUPABASE_ANON_KEY=
ENVTEMPLATE

echo -e "  ${GREEN}✓ Generated ${ROOT_ENV_TEMPLATE#$REPO_ROOT/}${NC}"

echo ""
echo -e "${BOLD}${CYAN}══════════════════════════════════════════════════════════════${NC}"
if [ $FOUND_ISSUES -gt 0 ]; then
  echo -e "${RED}  ✗ ${FOUND_ISSUES} issue(s) found. Remediation required.${NC}"
  echo ""
  echo -e "${BOLD}  Recommended actions:${NC}"
  echo -e "  1. Rotate ALL leaked credentials immediately"
  echo -e "  2. Run: ${CYAN}git filter-repo --invert-paths --path apps/backend/.env --path apps/ai-engine/.env --path apps/frontend/.env.local${NC}"
  echo -e "  3. Add entries to .gitignore (see below)"
  echo -e "  4. Remove NEXT_PUBLIC_OPENROUTER_API_KEY from frontend"
  echo -e "  5. Copy .env.template to .env and fill with new credentials"
else
  echo -e "${GREEN}  ✓ No issues found. Environment is clean.${NC}"
fi
echo -e "${BOLD}${CYAN}══════════════════════════════════════════════════════════════${NC}"
