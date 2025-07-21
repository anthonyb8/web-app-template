#!/bin/bash

install_ssl_config_files() {
  CONF_DIR="/etc/letsencrypt"
  OPTIONS_FILE="$CONF_DIR/options-ssl-nginx.conf"
  DH_FILE="$CONF_DIR/ssl-dhparams.pem"

  # Check if files exist
  if [[ ! -f "$OPTIONS_FILE" || ! -f "$DH_FILE" ]]; then
    echo "Installing missing recommended Certbot SSL config files..."

    apk add --no-cached curl

    # Download directly inside container
    curl -sSfL https://raw.githubusercontent.com/certbot/certbot/master/certbot-nginx/certbot_nginx/_internal/tls_configs/options-ssl-nginx.conf -o "$OPTIONS_FILE"
    curl -sSfL https://raw.githubusercontent.com/certbot/certbot/master/certbot/certbot/ssl-dhparams.pem -o "$DH_FILE"

    echo "SSL config files installed."
  else
    echo "Recommended Certbot SSL config files already present."
  fi
}

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

# Before renewing certificates
install_ssl_config_files

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
