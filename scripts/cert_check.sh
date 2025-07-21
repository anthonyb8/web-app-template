#!/bin/bash

update_certificate_staging() {
  certbot certificate
  certonly --staging --webroot -w /var/www/certbot \
    --email anthonybaxter819@gmail.com \
    -d midassystems.ca -d www.midassystems.ca \
    --agree-tos --no-eff-email \
    --force-renewal
  certbot certificate
}

update_certificate() {
  certbot certificate
  certonly --webroot -w /var/www/certbot \
    --email anthonybaxter819@gmail.com \
    -d midassystems.ca -d www.midassystems.ca \
    --agree-tos --no-eff-email \
    --force-renewal
  certbot certificate
}

NUM_DAYS=$(certbot certificates 2>/dev/null | grep -A7 "Certificate Name: midassystems.ca" | grep "Expiry Date" | sed -n 's/.*(\(.*\)).*/\1/p' | awk '{print $2}')

if [[ "$NUM_DAYS" =~ ^[0-9]+$ ]]; then
  # It's a number — do numeric comparison
  if [ "$NUM_DAYS" -le 14 ]; then
    echo "Need to renew certificate"
    update_certificate
  else
    echo "Certificate is valid, not renewing ($NUM_DAYS days left)"
  fi
else
  # Not a number — probably a test cert or error
  echo "Test certificate"
  update_certificate
fi
