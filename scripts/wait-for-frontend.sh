#!/bin/bash

set -e

echo "Waiting for frontend @ $FRONTEND_URL..."

# Keep trying until curl succeeds with a 200-399 HTTP code
until curl -s -o /dev/null -w "%{http_code}" "$FRONTEND_URL" | grep -qE '2[0-9]{2}|3[0-9]{2}'; do
  echo "Frontend not ready yet @ $FRONTEND_URL..."
  sleep 2
done

echo "Frontend is up!"
exec "$@"
