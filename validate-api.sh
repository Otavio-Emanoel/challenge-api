#!/usr/bin/env bash
set -e

# ===============================================================
#         ⚡ EVENTPULSE - VALIDADOR DE API BACKEND ⚡
# ===============================================================

if ! command -v node &> /dev/null; then
    echo "[ERRO] Node.js não foi encontrado no sistema."
    echo "Instale o Node.js para executar o validador."
    exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
node "$SCRIPT_DIR/scripts/validate-api.mjs" "$@"
