#!/bin/bash
set -e

# Set to true to use staging environment (for testing)
USE_STAGING=true

echo "### Starting nginx for challenge..."
docker compose up -d nginx-prod

echo "### Requesting Let's Encrypt certificate (if not already issued)..."

CERTBOT_CMD="certonly --webroot -w /var/www/certbot \
  --email anthonybaxter819@gmail.com \
  -d midassystems.ca -d www.midassystems.ca \
  --agree-tos --no-eff-email"

if [ "$USE_STAGING" = true ]; then
  CERTBOT_CMD="--staging $CERTBOT_CMD"
fi

docker compose run --rm certbot $CERTBOT_CMD || echo "Certbot run exited with error, continuing..."

echo "### Reloading nginx with new certificates..."
docker compose exec nginx-prod nginx -s reload

echo "### Starting full production stack..."
docker compose up --profile prod -d

echo "### Deployment complete!"
