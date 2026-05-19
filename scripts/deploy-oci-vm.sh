#!/usr/bin/env bash

set -Eeuo pipefail

APP_DIR="${APP_DIR:-/opt/oracle-architecture-arena/app}"
BRANCH="${BRANCH:-codex/deployment-hardening}"
SERVICE_NAME="${SERVICE_NAME:-oracle-architecture-arena}"
PORT="${PORT:-3000}"
HEALTH_URL="${HEALTH_URL:-http://127.0.0.1:${PORT}/api/health/database}"
SKIP_GIT_PULL="${SKIP_GIT_PULL:-0}"

cd "$APP_DIR"

if [[ ! -f ".env.production" ]]; then
  echo "Missing .env.production in $APP_DIR" >&2
  exit 1
fi

if [[ ! -f "package-lock.json" ]]; then
  echo "Missing package-lock.json in $APP_DIR; npm ci requires it." >&2
  exit 1
fi

if [[ "$SKIP_GIT_PULL" != "1" ]]; then
  git fetch origin "$BRANCH"
  git checkout "$BRANCH"
  git pull --ff-only origin "$BRANCH"
fi

npm ci
npm run build

mkdir -p .next/standalone/.next
rm -rf .next/standalone/.next/static
cp -R .next/static .next/standalone/.next/static

if [[ -d public ]]; then
  rm -rf .next/standalone/public
  cp -R public .next/standalone/public
fi

if [[ -d node_modules/oracledb/build/Release ]]; then
  mkdir -p .next/standalone/node_modules/oracledb/build
  rm -rf .next/standalone/node_modules/oracledb/build/Release
  cp -R node_modules/oracledb/build/Release .next/standalone/node_modules/oracledb/build/
else
  echo "Missing node_modules/oracledb/build/Release; Thick mode may fail with NJS-045." >&2
fi

sudo systemctl daemon-reload
sudo systemctl restart "$SERVICE_NAME"
sudo systemctl status "$SERVICE_NAME" --no-pager -l

curl -fsS --max-time 30 "$HEALTH_URL"
echo
