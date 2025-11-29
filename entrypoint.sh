#!/bin/sh
set -e

echo "--- Starting Entrypoint Script ---"

# Check if we are using SQLite or Postgres based on env var
if [ "$DB_CLIENT" = "sqlite" ]; then
    echo "--- Using SQLite Database ---"
    # Ensure the database file exists in the persistent volume
    if [ ! -f "$DB_FILE" ]; then
        echo "Creating empty SQLite file at $DB_FILE"
        touch "$DB_FILE"
    fi
else
    echo "--- Using PostgreSQL Database ---"
fi

echo "--- Running Database Migrations ---"
# We use 'npm run migrate:latest' which uses knex and ts-node.
# This ensures the schema is up to date before the server starts.
npm run migrate:latest

echo "--- Starting Express Server ---"
# Run the built JavaScript application
exec node dist/index.js