#!/usr/bin/env bash
set -e

cd /var/www/html

# ---------------------------------------------------------------------------
# 1. Environment file + application key (compose starts with an empty APP_KEY)
# ---------------------------------------------------------------------------
if [ ! -f .env ]; then
    cp .env.example .env
fi

if [ -z "${APP_KEY:-}" ] && ! grep -q '^APP_KEY=base64:' .env; then
    php artisan key:generate --force --no-interaction
fi

# ---------------------------------------------------------------------------
# 2. Database
# ---------------------------------------------------------------------------
if [ "$DB_CONNECTION" = "mysql" ]; then
    echo "Waiting for MySQL at ${DB_HOST}:${DB_PORT} ..."
    until php -r "try { new PDO('mysql:host='.getenv('DB_HOST').';port='.getenv('DB_PORT').';dbname='.getenv('DB_DATABASE'), getenv('DB_USERNAME'), getenv('DB_PASSWORD')); exit(0); } catch (Throwable \$e) { exit(1); }"; do
        sleep 2
    done
else
    mkdir -p database
    touch "${DB_DATABASE:-/var/www/html/database/database.sqlite}"
fi

if [ "${RUN_MIGRATIONS:-true}" = "true" ]; then
    php artisan migrate --force --no-interaction
fi

# Seed the demo workspace once (the storage volume keeps the marker file).
if [ "${RUN_SEED:-true}" = "true" ] && [ ! -f storage/.seeded ]; then
    php artisan db:seed --force --no-interaction && touch storage/.seeded
fi

# ---------------------------------------------------------------------------
# 3. Caches + web server
# ---------------------------------------------------------------------------
php artisan config:cache || true
php artisan route:cache || true
php artisan view:cache || true

chown -R www-data:www-data storage bootstrap/cache database

php-fpm -D
nginx -g "daemon off;"
