#!/bin/sh
set -e

# Substitute environment variables in the template to create actual config
envsubst "$NGINX_SERVER_NAME $SSL_CERT $SSL_CERT_KEY" \
  </etc/nginx/templates/nginx.conf.template \
  >/etc/nginx/conf.d/default.conf

# Execute the CMD from Dockerfile (start nginx)
exec "$@"
