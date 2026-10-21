#!/usr/bin/env python3
"""Düğün38'i Render'a API ile kurar.
Gerekli: RENDER_API_KEY (Render → Account Settings → API Keys → Create).
Çalıştır:  RENDER_API_KEY=rnd_xxx python3 scripts/deploy-render.py
"""
import json
import os
import sys
import urllib.request
import urllib.error

API = "https://api.render.com/v1"
REPO = "https://github.com/Rasyodata/dugun38"
REGION = os.environ.get("RENDER_REGION", "frankfurt")
PLAN = os.environ.get("RENDER_PLAN", "free")

key = os.environ.get("RENDER_API_KEY")
if not key:
    sys.exit("RENDER_API_KEY gerekli. Render → Account Settings → API Keys → Create.")

HDR = {"Authorization": f"Bearer {key}", "Accept": "application/json", "Content-Type": "application/json"}


def call(method, path, body=None):
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(API + path, data=data, headers=HDR, method=method)
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            return r.status, json.loads(r.read() or "null")
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read() or "null")


print("→ Hesap (owner) bulunuyor…")
st, owners = call("GET", "/owners?limit=1")
if st != 200 or not owners:
    sys.exit(f"Owner alınamadı (HTTP {st}). API anahtarı geçersiz olabilir: {owners}")
owner_id = owners[0]["owner"]["id"]
print(f"  ownerId={owner_id}")

body = {
    "type": "web_service",
    "name": "dugun38",
    "ownerId": owner_id,
    "repo": REPO,
    "branch": "main",
    "autoDeploy": "yes",
    "serviceDetails": {
        "runtime": "image",
        "region": REGION,
        "plan": PLAN,
        "envSpecificDetails": {"dockerfilePath": "./Dockerfile", "dockerContext": "."},
        "healthCheckPath": "/",
    },
    "envVars": [
        {"key": "NODE_ENV", "value": "production"},
        {"key": "SEED_ON_BOOT", "value": "1"},
        {"key": "ALLOW_DEMO_LOGIN", "value": "1"},
    ],
}

print("→ Web servisi oluşturuluyor (Docker)…")
st, resp = call("POST", "/services", body)
svc = (resp or {}).get("service") if isinstance(resp, dict) else None
if svc and svc.get("id"):
    url = (svc.get("serviceDetails") or {}).get("url") or "(build sonrası atanır)"
    print(f"  ✓ servis oluşturuldu: {svc['id']}")
    print(f"  Adres: {url}")
    print(f"  Panel: {svc.get('dashboardUrl','')}")
    print("→ Build başladı. İlk yayın ~5-8 dk.")
else:
    print(f"  HATA (HTTP {st}): {json.dumps(resp, ensure_ascii=False)[:600]}")
    sys.exit(2)
