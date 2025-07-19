#!/bin/bash
set -e

echo "### Starting nginx for challenge..."
docker-compose up -d nginx-prod

echo "### Requesting Let's Encrypt certificate (if not already issued)..."
docker-compose run --rm certbot \
  certonly --webroot -w /var/www/certbot \
  --email anthonybacter819@gmail.com \
  -d midassystems.ca -d www.midasystems.ca \
  --agree-tos \
  --no-eff-email || echo "Certbot run exited with error, continuing..."

echo "### Reloading nginx with new certificates..."
docker-compose exec nginx-prod nginx -s reload

echo "### Starting full production stack..."
docker-compose up --profile prod -d

echo "### Deployment complete!"
