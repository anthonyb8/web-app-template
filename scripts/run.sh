#!/bin/bash

ARG1=$1
ARG2=$2
ARG3=$3

usage() {
  echo "usage: [ dev | playwright | test <type> ]"
  echo "  test types: unit, integration, e2e "
  exit 1
}

test_usage() {
  echo "usage: [ test <type> <target> ]"
  echo "  types: unit, integration "
  echo "  targets: backend, frontend "
  exit 1
}

check_docker() {
  if ! command -v docker >/dev/null 2>&1; then
    echo "Docker not installed."
    exit 1
  fi

  if ! docker compose version >/dev/null 2>&1; then
    echo "Docker Compose not available."
    exit 1
  fi
}

dev() {
  check_docker
  docker compose -f compose.dev.yml --profile dev up --build --watch
}

unittest_frontend() {
  check_docker
  docker compose -f compose.test.yml --profile test_frontend_unit_watch up --build --watch
}

unittest_backend() {
  check_docker
  docker compose -f compose.test.yml --profile test_backend_unit_watch up --build --watch
}

integration_frontend() {
  check_docker
  docker compose -f compose.test.yml --profile test_frontend_integration_watch up --build --watch
}

integration_backend() {
  check_docker
  docker compose -f compose.test.yml --profile test_backend_integration_watch up --build --watch
}

e2e_test() {
  check_docker
  docker compose -f compose.staging.yml --profile test_e2e_watch up --build --watch
}

playwright() {
  if cd frontend; then
    if npx playwright --version >/dev/null 2>&1; then
      export VITE_API_BASE_URL="http://localhost:8000"
      export FRONTEND_URL="http://localhost:5173"
      npx playwright test --ui
    else
      echo "playwright not available."
    fi
  fi
}
if [ -z "$ARG1" ]; then
  usage
fi

case $ARG1 in
dev)
  echo "Running in dev mode..."
  dev
  ;;
playwright)
  echo "Running playwright in ui mode..."
  playwright
  ;;
test)
  if [ -z "$ARG2" ]; then
    echo "Error: test type required"
    usage
  fi

  case $ARG2 in
  unit)
    if [ -z "$ARG3" ]; then
      echo "Error: test [unit] requires target."
      test_usage
    fi
    case $ARG3 in
    frontend)
      echo "Running frontend unit tests..."
      unittest_frontend
      ;;
    backend)
      echo "Running backend unit tests..."
      unittest_backend
      ;;
    *)
      echo "Invalid target: $ARG3"
      test_usage
      ;;
    esac
    ;;
  integration)
    if [ -z "$ARG3" ]; then
      echo "Error: test [integration] requires target."
      usage
    fi
    case $ARG3 in
    frontend)
      echo "Running frontend integration tests..."
      integration_frontend
      ;;
    backend)
      echo "Running backend integration tests..."
      integration_backend
      ;;
    *)
      echo "Invalid target: $ARG3"
      test_usage
      ;;
    esac
    ;;
  e2e)
    echo "Running e2e tests..."
    e2e_test
    ;;
  *)
    echo "Invalid test type: $ARG2"
    usage
    ;;
  esac
  ;;
*)
  usage
  ;;
esac
