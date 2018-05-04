#!/usr/bin/env bash
chmod 0600 ./configs/.pgpass
# rebuild docker images every time; things would be cached usually and, moreover, will be rebuilt on demand
docker build --tag "airmate_db:latest" -f Dockerfile_postgres .
