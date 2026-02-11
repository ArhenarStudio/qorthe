#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# DAVIDSONS DESIGN — Strip Layer: Figma Make → Next.js Clean
# Limpia exports de Figma Make usando component-manifest.json
# y token-map.json para producir archivos listos para migración.
#
# Uso: bash scripts/strip-figma.sh V6
# Resultado: staging/ con archivos limpios
# ═══════════════════════════════════════════════════════════════

export PATH="/usr/local/bin:/opt/homebrew/bin:$PATH"
set -e

VERSION="${1:-V6}"
PROJECT="$HOME/Documents/davidsons-design"
FIGMA_BASE="$HOME/Documents/DavidSons Design - Figma/DSD $VERSION"
FIGMA_EXPORTS="$FIGMA_BASE/exports"
FIGMA_COMPONENTS="$FIGMA_BASE/src/app/components"
FIGMA_MODULES="$FIGMA_BASE/src/app/modules"
FIGMA_PAGES="$FIGMA_BASE/src/app/pages"
STAGING="$PROJECT/staging"
MANIFEST="$PROJECT/component-manifest.json"
TOKEN_MAP="$PROJECT/token-map.json"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOG="$PROJECT/src/figma-versions/migration-logs/strip-${VERSION}-${TIMESTAMP}.log"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# ─── Validations ───
echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo -e "${BLUE}  STRIP LAYER — DSD ${VERSION}${NC}"
echo -e "${BLUE}═══════════════════════════════════════${NC}"

if [ ! -d "$FIGMA_BASE" ]; then
  echo -e "${RED}ERROR: No encontré $FIGMA_BASE${NC}"
  exit 1
fi
if [ ! -f "$MANIFEST" ]; then
  echo -e "${RED}ERROR: No encontré component-manifest.json${NC}"
  exit 1
fi
if [ ! -f "$TOKEN_MAP" ]; then
  echo -e "${RED}ERROR: No encontré token-map.json${NC}"
  exit 1
fi

# ─── Clean staging ───
rm -rf "$STAGING"
mkdir -p "$STAGING"
mkdir -p "$(dirname "$LOG")"
echo "Strip Layer — DSD ${VERSION} — $(date)" > "$LOG"
echo "" >> "$LOG"

PROCESSED=0
SKIPPED=0
ERRORS=0

# ─── Helper: apply token replacements ───
apply_tokens() {
  local file="$1"
  
  # Background tokens
  sed -i '' 's/bg-white/bg-background/g' "$file"
  sed -i '' 's/bg-\[#faf8f5\]/bg-background/g' "$file"
  sed -i '' 's/bg-\[#FAF8F5\]/bg-background/g' "$file"
  sed -i '' 's/bg-\[#0a0806\]/bg-background/g' "$file"
  sed -i '' 's/bg-\[#1a1a1a\]/bg-background/g' "$file"
  sed -i '' 's/bg-\[#1a1512\]/bg-background/g' "$file"
  sed -i '' 's/bg-\[#f5f0e8\]/bg-cream/g' "$file"
  sed -i '' 's/bg-\[#f5f1eb\]/bg-cream/g' "$file"
  sed -i '' 's/bg-\[#e8e2d8\]/bg-sand-50/g' "$file"
  sed -i '' 's/bg-\[#d4c4b0\]/bg-sand/g' "$file"
  sed -i '' 's/bg-\[#d4c5b0\]/bg-sand/g' "$file"
  sed -i '' 's/bg-\[#8b7355\]/bg-accent/g' "$file"
  sed -i '' 's/bg-\[#8b6f47\]/bg-accent/g' "$file"
  sed -i '' 's/bg-\[#6d5838\]/bg-walnut-600/g' "$file"
  sed -i '' 's/bg-\[#6d5638\]/bg-walnut-600/g' "$file"
  sed -i '' 's/bg-\[#6b5e4f\]/bg-taupe/g' "$file"
  sed -i '' 's/bg-\[#2d2419\]/bg-muted/g' "$file"
  sed -i '' 's/bg-\[#3d2f23\]/bg-border/g' "$file"
  sed -i '' 's/bg-\[#4d3f33\]/bg-muted/g' "$file"
  sed -i '' 's/bg-gray-100/bg-muted/g' "$file"
  sed -i '' 's/bg-gray-300/bg-switch-background/g' "$file"
  
  # Text tokens
  sed -i '' 's/text-\[#f5f0e8\]/text-foreground/g' "$file"
  sed -i '' 's/text-\[#faf8f5\]/text-foreground/g' "$file"
  sed -i '' 's/text-\[#1a1a1a\]/text-foreground/g' "$file"
  sed -i '' 's/text-\[#b8a99a\]/text-muted-foreground/g' "$file"
  sed -i '' 's/text-\[#8b7355\]/text-accent/g' "$file"
  sed -i '' 's/text-\[#8b6f47\]/text-accent/g' "$file"
  sed -i '' 's/text-\[#6b5e4f\]/text-taupe/g' "$file"
  sed -i '' 's/text-\[#3d2f23\]/text-border/g' "$file"
  sed -i '' 's/text-gray-500/text-muted-foreground/g' "$file"
  sed -i '' 's/text-gray-900/text-foreground/g' "$file"
  
  # Border tokens
  sed -i '' 's/border-\[#3d2f23\]/border-border/g' "$file"
  sed -i '' 's/border-\[#8b6f47\]/border-accent/g' "$file"
  sed -i '' 's/border-\[#8b7355\]/border-accent/g' "$file"
  sed -i '' 's/border-\[#4a3a2a\]/border-border/g' "$file"
  sed -i '' 's/border-gray-200/border-border/g' "$file"
  
  # Hover tokens
  sed -i '' 's/hover:bg-\[#2d2419\]/hover:bg-muted/g' "$file"
  sed -i '' 's/hover:bg-\[#6d5838\]/hover:bg-walnut-600/g' "$file"
  sed -i '' 's/hover:bg-gray-100/hover:bg-muted/g' "$file"
  sed -i '' 's/hover:text-\[#8b6f47\]/hover:text-accent/g' "$file"
  sed -i '' 's/hover:text-\[#8b7355\]/hover:text-accent/g' "$file"
  
  # Opacity variants
  sed -i '' 's/bg-\[#0a0806\]\/95/bg-background\/95/g' "$file"
  sed -i '' 's/bg-\[#0a0806\]\/80/bg-background\/80/g' "$file"
  sed -i '' 's/bg-\[#0a0806\]\/90/bg-background\/90/g' "$file"
  sed -i '' 's/bg-white\/95/bg-background\/95/g' "$file"
  sed -i '' 's/bg-white\/80/bg-background\/80/g' "$file"
}

# ─── Helper: strip Vite patterns ───
strip_vite() {
  local file="$1"
  
  # Add "use client" if not present
  if ! head -1 "$file" | grep -q '"use client"'; then
    sed -i '' '1s/^/"use client";\n\n/' "$file"
  fi
  
  # Remove Header/Footer imports
  sed -i '' '/import.*{.*Header.*}.*from/d' "$file"
  sed -i '' '/import.*{.*Footer.*}.*from/d' "$file"
  sed -i '' '/import.*{.*useNavigate.*}.*from.*react-router/d' "$file"
  sed -i '' "/import.*from 'react-router'/d" "$file"
  sed -i '' "/import.*from 'react-router-dom'/d" "$file"
  
  # Remove mock data blocks (simple single-line ones)
  sed -i '' '/^const mockUser/d' "$file"
  sed -i '' '/^const mockOrders/d' "$file"
  sed -i '' '/^const mockAddresses/d' "$file"
  sed -i '' '/^const mockProducts/d' "$file"
  sed -i '' '/^const mockCart/d' "$file"
  
  # Remove Header/Footer JSX renders (single-line)
  sed -i '' '/<Header[[:space:]].*\/>/d' "$file"
  sed -i '' '/<Header\/>/d' "$file"
  sed -i '' '/<Header>/d' "$file"
  sed -i '' '/<\/Header>/d' "$file"
  sed -i '' '/<Footer[[:space:]].*\/>/d' "$file"
  sed -i '' '/<Footer\/>/d' "$file"
  sed -i '' '/<Footer>/d' "$file"
  sed -i '' '/<\/Footer>/d' "$file"
}

# ─── Helper: get figma action from manifest ───
get_action() {
  local filename="$1"
  # Use python for reliable JSON parsing
  python3 -c "
import json, sys
with open('$MANIFEST') as f:
    m = json.load(f)
comp = m.get('components', {}).get('$filename', {})
print(comp.get('figmaAction', 'UNKNOWN'))
" 2>/dev/null || echo "UNKNOWN"
}

get_destination() {
  local filename="$1"
  python3 -c "
import json
with open('$MANIFEST') as f:
    m = json.load(f)
comp = m.get('components', {}).get('$filename', {})
print(comp.get('destination', 'UNKNOWN'))
" 2>/dev/null || echo "UNKNOWN"
}

is_skip_file() {
  local filename="$1"
  python3 -c "
import json
with open('$MANIFEST') as f:
    m = json.load(f)
skips = m.get('skipFiles', {}).get('files', [])
print('SKIP' if '$filename' in skips else 'OK')
" 2>/dev/null || echo "OK"
}

# ═══════════════════════════════════════
# PHASE 1: Process pre-converted exports
# ═══════════════════════════════════════
echo -e "\n${YELLOW}FASE 1: Exports pre-convertidos (Next.js)${NC}"

if [ -d "$FIGMA_EXPORTS" ]; then
  find "$FIGMA_EXPORTS" -name "*.tsx" | while read filepath; do
    filename=$(basename "$filepath")
    action=$(get_action "$filename")
    dest=$(get_destination "$filename")
    
    if [ "$action" = "SKIP" ] || [ "$action" = "UNKNOWN" ]; then
      echo -e "  ${YELLOW}⏭ $filename (skip)${NC}"
      continue
    fi
    
    mkdir -p "$STAGING/exports"
    cp "$filepath" "$STAGING/exports/$filename"
    apply_tokens "$STAGING/exports/$filename"
    
    echo -e "  ${GREEN}✅ $filename → staging/exports/ [tokens applied]${NC}"
    echo "EXPORT: $filename → $dest (action: $action)" >> "$LOG"
    PROCESSED=$((PROCESSED + 1))
  done
fi

# ═══════════════════════════════════════
# PHASE 2: Process Vite components
# ═══════════════════════════════════════
echo -e "\n${YELLOW}FASE 2: Componentes Vite (requieren conversión)${NC}"

if [ -d "$FIGMA_COMPONENTS" ]; then
  for filepath in "$FIGMA_COMPONENTS"/*.tsx; do
    [ -f "$filepath" ] || continue
    filename=$(basename "$filepath")
    
    # Skip UI components subfolder
    [ "$filename" = "ui" ] && continue
    
    # Check skip list
    skip=$(is_skip_file "$filename")
    if [ "$skip" = "SKIP" ]; then
      echo -e "  ${YELLOW}⏭ $filename (skip list)${NC}"
      echo "SKIP: $filename (in skip list)" >> "$LOG"
      SKIPPED=$((SKIPPED + 1))
      continue
    fi
    
    action=$(get_action "$filename")
    dest=$(get_destination "$filename")
    
    if [ "$action" = "SKIP" ]; then
      echo -e "  ${YELLOW}⏭ $filename (action=SKIP)${NC}"
      SKIPPED=$((SKIPPED + 1))
      continue
    fi
    
    if [ "$action" = "DESIGN_ONLY" ]; then
      # Protected: copy but mark as design-only
      mkdir -p "$STAGING/design-only"
      cp "$filepath" "$STAGING/design-only/$filename"
      apply_tokens "$STAGING/design-only/$filename"
      echo -e "  ${CYAN}🛡 $filename → staging/design-only/ [PROTECTED]${NC}"
      echo "DESIGN_ONLY: $filename → $dest" >> "$LOG"
    elif [ "$action" = "STRIP_AND_REPLACE" ] || [ "$action" = "UNKNOWN" ]; then
      mkdir -p "$STAGING/converted"
      cp "$filepath" "$STAGING/converted/$filename"
      strip_vite "$STAGING/converted/$filename"
      apply_tokens "$STAGING/converted/$filename"
      echo -e "  ${GREEN}✅ $filename → staging/converted/ [stripped + tokens]${NC}"
      echo "CONVERTED: $filename → $dest" >> "$LOG"
    elif [ "$action" = "REPLACE_DESIGN_ONLY" ]; then
      mkdir -p "$STAGING/layout-global"
      cp "$filepath" "$STAGING/layout-global/$filename"
      apply_tokens "$STAGING/layout-global/$filename"
      echo -e "  ${BLUE}🏗 $filename → staging/layout-global/  [GLOBAL]${NC}"
      echo "LAYOUT_GLOBAL: $filename → $dest" >> "$LOG"
    fi
    
    PROCESSED=$((PROCESSED + 1))
  done
fi

# ═══════════════════════════════════════
# PHASE 3: Process modules
# ═══════════════════════════════════════
echo -e "\n${YELLOW}FASE 3: Módulos${NC}"

if [ -d "$FIGMA_MODULES" ]; then
  find "$FIGMA_MODULES" -name "*.tsx" | while read filepath; do
    filename=$(basename "$filepath")
    action=$(get_action "$filename")
    
    if [ "$action" = "SKIP" ] || [ "$action" = "UNKNOWN" ]; then
      echo -e "  ${YELLOW}⏭ $filename${NC}"
      continue
    fi
    
    mkdir -p "$STAGING/converted"
    cp "$filepath" "$STAGING/converted/$filename"
    strip_vite "$STAGING/converted/$filename"
    apply_tokens "$STAGING/converted/$filename"
    echo -e "  ${GREEN}✅ $filename → staging/converted/${NC}"
    echo "MODULE: $filename" >> "$LOG"
    PROCESSED=$((PROCESSED + 1))
  done
fi

# ═══════════════════════════════════════
# PHASE 4: Process pages
# ═══════════════════════════════════════
echo -e "\n${YELLOW}FASE 4: Páginas${NC}"

if [ -d "$FIGMA_PAGES" ]; then
  for filepath in "$FIGMA_PAGES"/*.tsx; do
    [ -f "$filepath" ] || continue
    filename=$(basename "$filepath")
    
    skip=$(is_skip_file "$filename")
    if [ "$skip" = "SKIP" ]; then
      echo -e "  ${YELLOW}⏭ $filename${NC}"
      SKIPPED=$((SKIPPED + 1))
      continue
    fi
    
    mkdir -p "$STAGING/converted"
    cp "$filepath" "$STAGING/converted/$filename"
    strip_vite "$STAGING/converted/$filename"
    apply_tokens "$STAGING/converted/$filename"
    echo -e "  ${GREEN}✅ $filename → staging/converted/${NC}"
    echo "PAGE: $filename" >> "$LOG"
    PROCESSED=$((PROCESSED + 1))
  done
fi

# ═══════════════════════════════════════
# PHASE 5: Generate staging summary
# ═══════════════════════════════════════
echo -e "\n${YELLOW}FASE 5: Resumen${NC}"

SUMMARY="$STAGING/STAGING_SUMMARY.md"
cat > "$SUMMARY" << EOF
# Staging — DSD ${VERSION} — $(date)

## Archivos listos para migración

### exports/ (pre-convertidos a Next.js, copiar directo)
$(ls "$STAGING/exports/" 2>/dev/null | sed 's/^/- /' || echo "- (ninguno)")

### converted/ (Vite stripped + tokens, revisar contexto)
$(ls "$STAGING/converted/" 2>/dev/null | sed 's/^/- /' || echo "- (ninguno)")

### design-only/ (PROTEGIDOS: solo tomar CSS/layout, NO lógica)
$(ls "$STAGING/design-only/" 2>/dev/null | sed 's/^/- /' || echo "- (ninguno)")

### layout-global/ (Header/Footer: verificar secciones completas)
$(ls "$STAGING/layout-global/" 2>/dev/null | sed 's/^/- /' || echo "- (ninguno)")

## Estadísticas
- Procesados: ${PROCESSED}
- Saltados: ${SKIPPED}

## Siguiente paso
Revisa los archivos en staging/ y luego ejecuta Cursor con el prompt de migración.
EOF

echo -e "\n${GREEN}═══════════════════════════════════════${NC}"
echo -e "${GREEN}  STRIP COMPLETO${NC}"
echo -e "${GREEN}  Procesados: $PROCESSED${NC}"
echo -e "${GREEN}  Saltados: $SKIPPED${NC}"
echo -e "${GREEN}  Staging: $STAGING${NC}"
echo -e "${GREEN}  Log: $LOG${NC}"
echo -e "${GREEN}═══════════════════════════════════════${NC}"
