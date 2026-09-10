#!/usr/bin/env bash
set -e

# Wait for the database to be reachable (MySQL only).
if [ "$DB_CONNECTION" = "mysql" ]; then
  echo "Waiting for MySQL at ${DB_HOST}:${DB_PORT} ..."
  until php -r "try { new PDO('mysql:host='.getenv('DB_HOST').';port='.getenv('DB_PORT').';dbname='.getenv('DB_DATABASE'), getenv('DB_USERNAME'), getenv('DB_PASSWORD')); exit(0); } catch (Throwable \$e) { exit(1); }"; do
    sleep 2
  done
fi

if [ "${RUN_MIGRATIONS:-true}" = "true" ]; then
  php artisan migrate --force || echo "Migrations skipped."
fi

php artisan config:cache || true
php artisan route:cache || true
php artisan view:cache || true

# Start PHP-FPM and Nginx together.
php-fpm -D
nginx -g "daemon off;"
