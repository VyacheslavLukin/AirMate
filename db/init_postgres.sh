#!/usr/bin/env bash
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" <<-EOSQL
    CREATE DATABASE openaq_data;
    GRANT ALL PRIVILEGES ON DATABASE openaq_data TO airmate;
EOSQL