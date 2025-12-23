#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"/..

echo "Installing workspace dependencies..."
npm install

echo "Generating Prisma client..."
npm run prisma:generate -w api

echo "Starting infrastructure stack..."
docker compose -f infra/docker-compose.yml up --build -d

echo "API available at http://localhost:3000 and Postgres at localhost:5432"
