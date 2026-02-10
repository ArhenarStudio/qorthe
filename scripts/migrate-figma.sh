#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# DAVIDSONS DESIGN — Pre-Migración Figma → Next.js  
# Genera inventario y estado actual antes de ejecutar Cursor
# Uso: bash scripts/migrate-figma.sh V4
# ═══════════════════════════════════════════════════════════════

export PATH="/usr/local/bin:/opt/homebrew/bin:$PATH"
set -e

VERSION="${1:-V4}"
FIGMA_BASE="$HOME/Documents/DavidSons Design - Figma/DSD $VERSION"
PROJECT="$HOME/Documents/davidsons-design"
EXPORTS="$FIGMA_BASE/exports"
FIGMA_SRC="$FIGMA_BASE/src/app"

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo -e "${BLUE}  PRE-MIGRACIÓN DSD ${VERSION}${NC}"
echo -e "${BLUE}═══════════════════════════════════════${NC}"

if [ ! -d "$FIGMA_BASE" ]; then
  echo -e "${RED}ERROR: $FIGMA_BASE no existe${NC}"
  exit 1
fi

echo -e "\n${YELLOW}Inventario V4:${NC}"
EXPORTS_N=$(find "$EXPORTS" -name "*.tsx" 2>/dev/null | wc -l | tr -d ' ')
COMPONENTS_N=$(find "$FIGMA_SRC/components" -maxdepth 1 -name "*.tsx" 2>/dev/null | wc -l | tr -d ' ')
MODULES_N=$(find "$FIGMA_SRC/modules" -name "*.tsx" 2>/dev/null | wc -l | tr -d ' ')
PAGES_N=$(find "$FIGMA_SRC/pages" -name "*.tsx" 2>/dev/null | wc -l | tr -d ' ')
echo -e "  Exports (Next.js listos): ${GREEN}$EXPORTS_N${NC}"
echo -e "  Componentes (Vite): ${GREEN}$COMPONENTS_N${NC}"
echo -e "  Módulos: ${GREEN}$MODULES_N${NC}"
echo -e "  Páginas: ${GREEN}$PAGES_N${NC}"

echo -e "\n${YELLOW}Estado producción:${NC}"
cd "$PROJECT"
TS_CHECK=$(npx tsc --noEmit 2>&1)
if [ $? -eq 0 ]; then
  echo -e "  TypeScript: ${GREEN}✅ OK${NC}"
else
  echo -e "  TypeScript: ${RED}❌ Errores${NC}"
  echo "$TS_CHECK" | head -5
fi

echo -e "\n${YELLOW}Header actual — secciones del menú:${NC}"
H="src/modules/header/components/Header.tsx"
grep -q "appointment" "$H" && echo -e "  ${GREEN}✅ Servicios y Recursos${NC}" || echo -e "  ${RED}❌ Servicios y Recursos${NC}"
grep -q "financing-calculator\|Calculadora" "$H" && echo -e "  ${GREEN}✅ Herramientas${NC}" || echo -e "  ${RED}❌ Herramientas${NC}"
grep -q "toggleWhatsApp\|whatsappButton" "$H" && echo -e "  ${GREEN}✅ Configuración 4 toggles${NC}" || echo -e "  ${RED}❌ Configuración 4 toggles${NC}"
grep -q "/privacy\|Privacidad" "$H" && echo -e "  ${GREEN}✅ Legal${NC}" || echo -e "  ${RED}❌ Legal${NC}"

echo -e "\n${GREEN}Listo para migración. Ejecuta Cursor con el prompt de V4.${NC}"
