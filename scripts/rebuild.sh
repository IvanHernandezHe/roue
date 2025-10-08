#!/usr/bin/env bash
set -euo pipefail

# Rebuilds Roue project end-to-end: clean, build frontend, build backend, compose up
# Usage: ./scripts/rebuild.sh [--no-docker] [--no-frontend]

NO_DOCKER=false
NO_FRONT=false
for arg in "$@"; do
  case "$arg" in
    --no-docker) NO_DOCKER=true ;;
    --no-frontend) NO_FRONT=true ;;
  esac
done

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

echo "[1/5] Cleaning bin/obj and API wwwroot..."
find src tests -type d \( -name bin -o -name obj \) -prune -exec rm -rf {} + || true
rm -rf src/Roue.API/wwwroot/* || true

echo "[2/5] Frontend decoupled. Docker will handle it via profile."

echo "[3/5] Restoring and building backend (.NET) Release..."
if command -v dotnet >/dev/null 2>&1; then
dotnet restore Roue.sln
dotnet build Roue.sln -c Release --no-restore
else
  echo "dotnet SDK not found. Skipping backend compile."
fi

if [ "$NO_DOCKER" = false ]; then
  # Use dev profile when frontend is desired
  PROFILES=""
  if [ "$NO_FRONT" = false ]; then
    PROFILES="--profile dev"
    echo "[4/5] Rebuilding Docker images (including web:dev) without cache..."
  else
    echo "[4/5] Rebuilding Docker images (backend only) without cache..."
  fi

  docker compose -f docker-compose.cosmos.yml down -v || true
  docker compose -f docker-compose.cosmos.yml $PROFILES build --no-cache

  echo "[5/5] Starting services..."
  docker compose -f docker-compose.cosmos.yml $PROFILES up -d
  echo "Done. Services running. Use: docker compose -f docker-compose.cosmos.yml ps"
else
  echo "[4/5] Skipping Docker per flag."
fi

echo "Rebuild finished."
