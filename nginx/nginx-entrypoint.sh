#!/bin/sh
set -e

envsubst </etc/nginx/templates/nginx.conf.template > \
  /etc/nginx/conf.d/default.conf # && nginx -s reload

# Execute the CMD from Dockerfile (start nginx)
exec "$@"
