#!/usr/bin/env bash
set -euo pipefail

# One-click deploy for EC2 + PM2 (non-git remote directory).
# Usage:
#   ./deploy.sh
# Optional overrides:
#   SSH_KEY_PATH=... SSH_USER=ubuntu SSH_HOST=1.2.3.4 REMOTE_APP_DIR=/var/www/good-together ./deploy.sh

SSH_KEY_PATH="${SSH_KEY_PATH:-/Users/barrywang/project/good-together-website/goodtogether-website-20260413.pem}"
SSH_USER="${SSH_USER:-ubuntu}"
SSH_HOST="${SSH_HOST:-3.0.46.141}"
REMOTE_APP_DIR="${REMOTE_APP_DIR:-/var/www/good-together}"
PM2_APP_NAME="${PM2_APP_NAME:-gt-site}"
APP_PORT="${APP_PORT:-3000}"

if [[ ! -f "$SSH_KEY_PATH" ]]; then
  echo "SSH key not found: $SSH_KEY_PATH" >&2
  exit 1
fi

if ! command -v rsync >/dev/null 2>&1; then
  echo "rsync is required but not installed." >&2
  exit 1
fi

if ! command -v ssh >/dev/null 2>&1; then
  echo "ssh is required but not installed." >&2
  exit 1
fi

echo "[1/3] Sync project files to remote..."
rsync -az --delete \
  --exclude ".git/" \
  --exclude ".next/" \
  --exclude "node_modules/" \
  --exclude ".env.local" \
  --exclude ".env.production" \
  --exclude "data/" \
  --exclude "*.pem" \
  -e "ssh -i \"$SSH_KEY_PATH\"" \
  "./" "${SSH_USER}@${SSH_HOST}:${REMOTE_APP_DIR}/"

echo "[2/3] Build and restart app on remote..."
ssh -i "$SSH_KEY_PATH" "${SSH_USER}@${SSH_HOST}" "
  set -euo pipefail
  cd \"$REMOTE_APP_DIR\"
  npm ci
  npm run build
  mkdir -p .next/standalone/.next
  rm -rf .next/standalone/.next/static .next/standalone/public
  cp -r .next/static .next/standalone/.next/static
  cp -r public .next/standalone/public
  if [[ -f .env.production ]]; then
    set -a
    # shellcheck disable=SC1091
    source .env.production
    set +a
  fi
  if pm2 describe \"$PM2_APP_NAME\" >/dev/null 2>&1; then
    pm2 restart \"$PM2_APP_NAME\" --update-env
  else
    pm2 start \"npm run start -- -p $APP_PORT\" --name \"$PM2_APP_NAME\" --update-env
  fi
  pm2 save
  if [[ -f .env.production ]]; then
    CRON_MARKER=\"# aitgp-hourly-prices\"
    CRON_CMD=\"0 * * * * cd $REMOTE_APP_DIR && set -a && source .env.production && set +a && /usr/bin/node scripts/aitgp-fetch-prices.mjs >> /var/log/aitgp-cron.log 2>&1\"
    (crontab -l 2>/dev/null | grep -Fv \"\$CRON_MARKER\"; echo \"\$CRON_MARKER\"; echo \"\$CRON_CMD\") | crontab -
    if [[ -n \"\${AITGP_CRON_SECRET:-}\" ]]; then
      sleep 3
      /usr/bin/node scripts/aitgp-fetch-prices.mjs || true
    else
      echo \"WARN: AITGP_CRON_SECRET not set; skipped initial AITGP price fetch\"
    fi
  fi
"

echo "[3/3] Verify PM2 status..."
ssh -i "$SSH_KEY_PATH" "${SSH_USER}@${SSH_HOST}" "pm2 status \"$PM2_APP_NAME\""

echo "Deploy completed."
