#!/bin/sh
set -e
echo "Template before substitution:"
cat /etc/nginx/templates/nginx.conf.template
echo "Environment variables:"
env | grep DOMAIN
envsubst </etc/nginx/templates/nginx.conf.template > /etc/nginx/conf.d/default.conf
echo "Config after substitution:"
cat /etc/nginx/conf.d/default.conf

exec "$@"

