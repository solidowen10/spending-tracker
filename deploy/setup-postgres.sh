#!/usr/bin/env bash
# Sets up a local Postgres instance + database + user for the spending tracker.
# Run this once on the Lightsail box. Safe to re-run (skips if already installed).
#
# Usage: sudo bash setup-postgres.sh

set -euo pipefail

DB_NAME="spending_tracker"
DB_USER="spending_tracker"

if ! command -v psql &> /dev/null; then
  echo "Installing PostgreSQL..."
  apt-get update
  apt-get install -y postgresql postgresql-contrib
else
  echo "PostgreSQL already installed, skipping install."
fi

systemctl enable postgresql
systemctl start postgresql

echo ""
echo "Enter a password for the new '${DB_USER}' database user:"
read -rs DB_PASSWORD
echo ""

sudo -u postgres psql <<SQL
DO \$\$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = '${DB_USER}') THEN
    CREATE ROLE ${DB_USER} WITH LOGIN PASSWORD '${DB_PASSWORD}';
  END IF;
END
\$\$;

SELECT 'CREATE DATABASE ${DB_NAME} OWNER ${DB_USER}'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '${DB_NAME}')\gexec
SQL

echo ""
echo "✅ Postgres is ready."
echo ""
echo "Add this to your .env file:"
echo "DATABASE_URL=postgresql://${DB_USER}:${DB_PASSWORD}@localhost:5432/${DB_NAME}"
echo "DATABASE_SSL=false"
