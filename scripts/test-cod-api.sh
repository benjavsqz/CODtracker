#!/bin/bash
# Valida que la API de COD responde antes de construir la lógica real.
#
# Pasos:
#   1. Ir a callofduty.com e iniciar sesión
#   2. DevTools → Application → Cookies → copiar ACT_SSO_COOKIE
#   3. Exportar las variables y correr este script:
#      ACT_SSO_COOKIE="xxx" GAMERTAG="TuTag%231234" bash scripts/test-cod-api.sh
#
# Nota: el # del gamertag se encodea como %23

GAMERTAG="${GAMERTAG:-TuTag%231234}"
ACT_COOKIE="${ACT_SSO_COOKIE:-pegar_cookie_aqui}"
PLATFORM="${PLATFORM:-psn}"

HEADERS=(
  -H "Cookie: ACT_SSO_COOKIE=${ACT_COOKIE}"
  -H "x-requested-with: XMLHttpRequest"
  -H "Referer: https://www.callofduty.com"
  -H "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
)

echo "=== Stats del jugador ==="
curl -s "${HEADERS[@]}" \
  "https://my.callofduty.com/api/papi-client/stats/cod/v1/title/mw2/platform/${PLATFORM}/gamer/${GAMERTAG}/profile/type/wz" \
  | python3 -m json.tool 2>/dev/null | head -60

echo ""
echo "=== Últimas partidas ==="
curl -s "${HEADERS[@]}" \
  "https://my.callofduty.com/api/papi-client/crm/cod/v2/title/mw2/platform/${PLATFORM}/gamer/${GAMERTAG}/matches/wz/start/0/end/0/details" \
  | python3 -m json.tool 2>/dev/null | head -60
