#!/bin/bash

256bit_base64encoded() {
  openssl rand -base64 32
}

256bit_base64encoded_urlsafe() {
  256bit_base64encoded | tr -d '=' | tr '+/' '-_'
}

if command -v openssl &>/dev/null; then
  echo "JWT_ACCESS_SECRET=$(256bit_base64encoded_urlsafe)"
  echo "JWT_REFRESH_SECRET=$(256bit_base64encoded_urlsafe)"
  echo "MFA_ENCRYPTION_KEY=$(256bit_base64encoded)"
else
  echo "openssl not found."
  exit 1
fi
