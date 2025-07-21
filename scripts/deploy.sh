#!/bin/bash
set -e

echo "Starting staging services..."
docker compose --profile staging up -d

echo "Waiting for certbot container to finish..."

# Name of your certbot container (adjust if needed)
CERTBOT_CONTAINER="test_server-certbot-setup-1"

timeout=120
interval=5
elapsed=0

while true; do
  status=$(docker inspect --format='{{.State.Status}}' "$CERTBOT_CONTAINER" 2>/dev/null || echo "not_found")

  if [ "$status" = "exited" ]; then
    exit_code=$(docker inspect --format='{{.State.ExitCode}}' "$CERTBOT_CONTAINER")
    if [ "$exit_code" -eq 0 ]; then
      echo "Certbot container finished successfully."
      break
    else
      echo "Certbot container exited with error code $exit_code."
      exit 1
    fi
  fi

  if [ "$elapsed" -ge "$timeout" ]; then
    echo "Timeout waiting for certbot container to finish."
    exit 1
  fi

  echo "Certbot container status: $status. Waiting... ($elapsed/$timeout seconds elapsed)"
  sleep $interval
  elapsed=$((elapsed + interval))
done

echo "Checking if certificate file exists..."

if docker run --rm -v test_server_certbot-etc:/data busybox sh -c '[ -f /data/live/midassystems.ca/fullchain.pem ]'; then
  echo "Certificate found!"
else
  echo "Certificate not found!"
  exit 1
fi

echo "Stopping staging services..."
docker compose --profile staging stop

echo "Starting production services..."
docker compose --profile prod up -d

echo "Deployment complete."
