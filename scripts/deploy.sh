#!/bin/bash

docker compose --profile staging up -d

echo "Waiting for certbot to issue certificates..."

timeout=120
interval=5
elapsed=0

while true; do
  # Run a Docker container to check if cert file exists inside the volume
  if docker run --rm -v test_server_certbot-etc:/data busybox sh -c '[ -f /data/live/midassystems.ca/fullchain.pem ]'; then
    echo "Certificate found!"
    break
  fi

  if [ $elapsed -ge $timeout ]; then
    echo "Timeout waiting for certificates!"
    exit 1
  fi

  echo "Waiting for certificate... ($elapsed/$timeout seconds elapsed)"
  sleep $interval
  elapsed=$((elapsed + interval))
done

echo "Certificates found! Proceeding..."

docker compose --profile staging stop
docker compose --profile prod up -d
