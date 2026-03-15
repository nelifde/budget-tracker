#!/bin/bash
# Create budget_tracker database using Postgres.app (no need for createdb on PATH)
PSQL="/Applications/Postgres.app/Contents/Versions/latest/bin/psql"
$PSQL -d postgres -c "CREATE DATABASE budget_tracker;" 2>/dev/null && echo "Database budget_tracker created." || echo "Database may already exist or Postgres may not be running. Try: $PSQL -d postgres -c \"CREATE DATABASE budget_tracker;\""
