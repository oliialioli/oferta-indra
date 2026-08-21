#!/usr/bin/env bash
# Runs the full multi-offer generator locally, no Azure account needed:
# Azurite (storage emulator) + the Functions API + the Vite frontend +
# the SWA CLI (adds the fake-login screen for /interno). Ctrl+C stops
# everything.
#
# Usage: ./scripts/demo.sh   (run from the repo root)

set -e
cd "$(dirname "$0")/.."

PIDS=()
cleanup() {
  echo ""
  echo "Deteniendo procesos…"
  for pid in "${PIDS[@]}"; do
    kill "$pid" 2>/dev/null || true
  done
}
trap cleanup EXIT INT TERM

mkdir -p /tmp/oferta-indra-demo/azurite

echo "-> Arrancando Azurite (almacenamiento local)…"
npx --yes azurite --silent --skipApiVersionCheck --location /tmp/oferta-indra-demo/azurite > /tmp/oferta-indra-demo/azurite.log 2>&1 &
PIDS+=($!)
sleep 3

echo "-> Arrancando la API (Azure Functions)…"
(cd api && npx --yes azure-functions-core-tools@4 start --port 7071 > /tmp/oferta-indra-demo/func.log 2>&1) &
PIDS+=($!)
sleep 8

echo "-> Arrancando el frontend (Vite)…"
npx --yes vite --port 5173 > /tmp/oferta-indra-demo/vite.log 2>&1 &
PIDS+=($!)
sleep 3

echo "-> Arrancando el emulador de Azure Static Web Apps (login + routing)…"
echo ""
echo "======================================================================"
echo " Listo. Abre esto en tu navegador:"
echo ""
echo "   http://localhost:4280/interno   <- generador de ofertas (uso interno)"
echo "   http://localhost:4280/oferta/<slug>   <- una oferta publicada"
echo ""
echo " La primera vez que abras /interno te pedirá iniciar sesión: es una"
echo " pantalla de prueba (no es una cuenta real) — pon cualquier nombre de"
echo " usuario y pulsa Login. En producción esto será el login real de"
echo " Microsoft 365 de Indra."
echo "======================================================================"
echo ""

npx --yes @azure/static-web-apps-cli start http://localhost:5173 --api-devserver-url http://localhost:7071 --port 4280
