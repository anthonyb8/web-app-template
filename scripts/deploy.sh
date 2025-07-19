#!/bin/bash

docker compose --profile staging up -d

echo "Waiting for certbot to issue certificates..."

# Poll cert file existence every 5 seconds, timeout after 2 minutes
timeout=120
interval=5
elapsed=0

while [ ! -f "./certbot-etc/live/midassystems.ca/fullchain.pem" ]; do
  if [ $elapsed -ge $timeout ]; then
    echo "Timeout waiting for certificates!"
    exit 1
  fi
  echo "Waiting for certificate... ($elapsed/$timeout seconds elapsed)"
  sleep $interval
  elapsed=$((elapsed + interval))
done

echo "Certificates found! Proceeding..."

docker compose --profile staging down
docker compose --profile prod up -d
