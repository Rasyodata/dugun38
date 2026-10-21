#!/usr/bin/env bash
# Düğün38'i Render'a API ile kurar. Çalışması için SADECE bir Render API anahtarı gerekir:
#   export RENDER_API_KEY=rnd_xxxxxxxx   (Render → Account Settings → API Keys → Create)
# Sonra: bash scripts/deploy-render.sh
set -euo pipefail

: "${RENDER_API_KEY:?RENDER_API_KEY gerekli. Render → Account Settings → API Keys'ten alın.}"
API="https://api.render.com/v1"
AUTH=(-H "Authorization: Bearer $RENDER_API_KEY" -H "Accept: application/json" -H "Content-Type: application/json")
REPO="https://github.com/Rasyodata/dugun38"
REGION="${RENDER_REGION:-frankfurt}"
PLAN="${RENDER_PLAN:-free}"

echo "→ Owner (hesap) bulunuyor..."
OWNER_ID=$(curl -s "${AUTH[@]}" "$API/owners?limit=1" | python3 -c "import sys,json;d=json.load(sys.stdin);print(d[0]['owner']['id'] if d else '')")
[ -n "$OWNER_ID" ] || { echo "Owner alınamadı — API anahtarı geçersiz olabilir."; exit 1; }
echo "  ownerId=$OWNER_ID"

echo "→ Web servisi oluşturuluyor (Docker)..."
BODY=$(cat <<JSON
{
  "type": "web_service",
  "name": "dugun38",
  "ownerId": "$OWNER_ID",
  "repo": "$REPO",
  "branch": "main",
  "autoDeploy": "yes",
  "rootDir": "",
  "serviceDetails": {
    "runtime": "image",
    "region": "$REGION",
    "plan": "$PLAN",
    "envSpecificDetails": { "dockerfilePath": "./Dockerfile", "dockerContext": "." },
    "healthCheckPath": "/"
  },
  "envVars": [
    { "key": "NODE_ENV", "value": "production" },
    { "key": "SEED_ON_BOOT", "value": "1" },
    { "key": "ALLOW_DEMO_LOGIN", "value": "1" }
  ]
}
JSON
)
RESP=$(curl -s "${AUTH[@]}" -X POST "$API/services" -d "$BODY")
echo "$RESP" | python3 -c "
import sys,json
d=json.load(sys.stdin)
svc=d.get('service') or d
if svc.get('id'):
    print('  ✓ servis oluşturuldu:', svc['id'])
    print('  URL:', svc.get('serviceDetails',{}).get('url') or svc.get('dashboardUrl') or '(build sonrası atanır)')
    print('  Panel:', svc.get('dashboardUrl',''))
else:
    print('  HATA:', json.dumps(d, ensure_ascii=False)[:500])
    sys.exit(2)
"
echo "→ Build başladı. İlk yayın ~5-8 dk. Render panelinden izleyebilirsiniz."
