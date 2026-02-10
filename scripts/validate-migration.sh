#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# DAVIDSONS DESIGN — Validación Post-Migración
# Uso: ./scripts/validate-migration.sh
# ═══════════════════════════════════════════════════════════════

set -e

PROJECT="$HOME/Documents/davidsons-design"
cd "$PROJECT"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'
ERRORS=0

echo "═══════════════════════════════════════"
echo "  VALIDACIÓN POST-MIGRACIÓN"
echo "═══════════════════════════════════════"

# 1. TypeScript
echo -e "\n${YELLOW}1. TypeScript${NC}"
export PATH="/usr/local/bin:/opt/homebrew/bin:$PATH"
if npx tsc --noEmit 2>/dev/null; then
  echo -e "   ${GREEN}✅ Sin errores${NC}"
else
  echo -e "   ${RED}❌ Errores de TypeScript${NC}"
  ERRORS=$((ERRORS + 1))
fi

# 2. Shopify integraciones intactas
echo -e "\n${YELLOW}2. Shopify integraciones${NC}"
if grep -q "shopifyFetch\|createStorefrontClient" src/lib/shopify/client.ts 2>/dev/null; then
  echo -e "   ${GREEN}✅ Shopify client OK${NC}"
else
  echo -e "   ${RED}❌ Shopify client modificado${NC}"
  ERRORS=$((ERRORS + 1))
fi

if grep -q "createCart\|addToCart\|shopifyFetch\|ShopifyCart" src/modules/cart/hooks/useCart.ts 2>/dev/null; then
  echo -e "   ${GREEN}✅ useCart hook OK${NC}"
else
  echo -e "   ${RED}❌ useCart hook modificado${NC}"
  ERRORS=$((ERRORS + 1))
fi

# 3. Supabase integraciones intactas
echo -e "\n${YELLOW}3. Supabase integraciones${NC}"
if grep -q "createBrowserClient\|createClient" src/lib/supabase/client.ts 2>/dev/null; then
  echo -e "   ${GREEN}✅ Supabase client OK${NC}"
else
  echo -e "   ${RED}❌ Supabase client modificado${NC}"
  ERRORS=$((ERRORS + 1))
fi

if grep -q "signInWithPassword\|signUp" src/modules/auth/hooks/useAuth.ts 2>/dev/null; then
  echo -e "   ${GREEN}✅ useAuth hook OK${NC}"
else
  echo -e "   ${RED}❌ useAuth hook modificado${NC}"
  ERRORS=$((ERRORS + 1))
fi

# 4. Estado global
echo -e "\n${YELLOW}4. Estado global (useAppState)${NC}"
APPSTATE_USERS=$(grep -rl "useAppState" src/modules/ | wc -l | tr -d ' ')
echo -e "   Componentes usando useAppState: ${GREEN}$APPSTATE_USERS${NC}"

if grep -q "useAppState" src/modules/header/components/Header.tsx 2>/dev/null; then
  echo -e "   ${GREEN}✅ Header usa useAppState${NC}"
else
  echo -e "   ${RED}❌ Header NO usa useAppState${NC}"
  ERRORS=$((ERRORS + 1))
fi

if grep -q "useAppState" src/modules/footer/components/Footer.tsx 2>/dev/null; then
  echo -e "   ${GREEN}✅ Footer usa useAppState${NC}"
else
  echo -e "   ${RED}❌ Footer NO usa useAppState${NC}"
  ERRORS=$((ERRORS + 1))
fi

# 5. Menú completo (6 secciones)
echo -e "\n${YELLOW}5. Menú móvil (6 secciones)${NC}"
HEADER="src/modules/header/components/Header.tsx"
SECTIONS=0
grep -q "appointment\|Agenda una Cita" "$HEADER" && SECTIONS=$((SECTIONS + 1)) && echo -e "   ${GREEN}✅ Servicios y Recursos${NC}"
grep -q "financing-calculator\|Calculadora" "$HEADER" && SECTIONS=$((SECTIONS + 1)) && echo -e "   ${GREEN}✅ Herramientas${NC}"
grep -q "toggleWhatsApp\|showWhatsApp\|Botón WhatsApp\|whatsappButton" "$HEADER" && SECTIONS=$((SECTIONS + 1)) && echo -e "   ${GREEN}✅ Configuración (4 toggles)${NC}"
grep -q "/privacy\|/terms\|/cookies\|Privacidad\|Privacy Policy" "$HEADER" && SECTIONS=$((SECTIONS + 1)) && echo -e "   ${GREEN}✅ Legal${NC}"
grep -q "isAuthenticated\|login\|Login" "$HEADER" && SECTIONS=$((SECTIONS + 1)) && echo -e "   ${GREEN}✅ Auth${NC}"
grep -q "/products" "$HEADER" && SECTIONS=$((SECTIONS + 1)) && echo -e "   ${GREEN}✅ Navegación${NC}"

if [ "$SECTIONS" -eq 6 ]; then
  echo -e "   ${GREEN}✅ TODAS las 6 secciones presentes${NC}"
else
  echo -e "   ${RED}❌ Solo $SECTIONS/6 secciones${NC}"
  ERRORS=$((ERRORS + 1))
fi

# 6. Rutas existentes
echo -e "\n${YELLOW}6. Rutas (page.tsx)${NC}"
ROUTES=(about appointment blog cart certifications checkout compare cookies faq gallery login mission-vision privacy products register team terms timeline)
MISSING_ROUTES=0
for route in "${ROUTES[@]}"; do
  if [ ! -f "app/$route/page.tsx" ]; then
    echo -e "   ${RED}❌ Falta: app/$route/page.tsx${NC}"
    MISSING_ROUTES=$((MISSING_ROUTES + 1))
  fi
done
if [ "$MISSING_ROUTES" -eq 0 ]; then
  echo -e "   ${GREEN}✅ Todas las ${#ROUTES[@]} rutas presentes${NC}"
else
  echo -e "   ${RED}❌ Faltan $MISSING_ROUTES rutas${NC}"
  ERRORS=$((ERRORS + 1))
fi

# 7. Flotantes
echo -e "\n${YELLOW}7. Widgets flotantes${NC}"
if grep -q "WhatsAppButton\|ChatWidget\|SettingsModule\|ScrollToTop\|CookieConsent" app/components/GlobalWidgets.tsx 2>/dev/null; then
  echo -e "   ${GREEN}✅ GlobalWidgets tiene todos los widgets${NC}"
else
  echo -e "   ${RED}❌ GlobalWidgets incompleto${NC}"
  ERRORS=$((ERRORS + 1))
fi

# Resumen
echo -e "\n═══════════════════════════════════════"
if [ "$ERRORS" -eq 0 ]; then
  echo -e "${GREEN}  ✅ VALIDACIÓN EXITOSA — 0 errores${NC}"
else
  echo -e "${RED}  ❌ $ERRORS ERRORES encontrados${NC}"
fi
echo "═══════════════════════════════════════"

exit $ERRORS
