#!/bin/bash
set -e

# Wait for MySQL to be available
until mysqladmin ping -h"$MYSQL_HOST" -P"$MYSQL_PORT" --silent; do
  echo "Waiting for MySQL at $MYSQL_HOST:$MYSQL_PORT..."
  sleep 2
done

echo "MySQL is up. Starting backend..."
exec "$@"
