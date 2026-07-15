#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
VENV_PATH="$ROOT_DIR/venv/bin/activate"
BACKEND_DIR="$ROOT_DIR/backend"
ML_DIR="$ROOT_DIR/ml"
FRONTEND_DIR="$ROOT_DIR/frontend"

BACKEND_PID=""
ML_PID=""

cleanup() {
  echo
  echo "Stopping RESCUE_DRONE services..."

  if [[ -n "${ML_PID}" ]] && kill -0 "${ML_PID}" 2>/dev/null; then
    kill "${ML_PID}" 2>/dev/null || true
    wait "${ML_PID}" 2>/dev/null || true
    echo "ML detector stopped."
  fi

  if [[ -n "${BACKEND_PID}" ]] && kill -0 "${BACKEND_PID}" 2>/dev/null; then
    kill "${BACKEND_PID}" 2>/dev/null || true
    wait "${BACKEND_PID}" 2>/dev/null || true
    echo "Backend stopped."
  fi

  echo "Cleanup complete."
}

trap cleanup EXIT INT TERM

if [[ ! -f "$VENV_PATH" ]]; then
  echo "Error: Python virtual environment not found at $VENV_PATH"
  echo "Create it first, for example:"
  echo "  python3 -m venv venv"
  exit 1
fi

if [[ ! -d "$BACKEND_DIR" || ! -d "$ML_DIR" || ! -d "$FRONTEND_DIR" ]]; then
  echo "Error: Expected backend/, ml/, and frontend/ directories in $ROOT_DIR"
  exit 1
fi

echo "Activating virtual environment..."
# shellcheck disable=SC1091
source "$VENV_PATH"

echo "Starting backend..."
(
  cd "$BACKEND_DIR"
  exec uvicorn main:app --reload
) &
BACKEND_PID=$!

echo "Backend URL: http://127.0.0.1:8000"
sleep 2

echo "Starting ML detector..."
(
  cd "$ML_DIR"
  exec python3 detector.py
) &
ML_PID=$!

sleep 2

echo "Starting frontend..."
echo "Frontend URL: http://localhost:5173"
echo "Press CTRL+C to stop all services."

cd "$FRONTEND_DIR"
npm run dev
