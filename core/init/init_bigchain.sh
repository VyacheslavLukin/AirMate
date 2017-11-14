#!/usr/bin/env bash
groupadd -r --gid 999 mongodb && useradd -r --uid 999 -g mongodb mongodb
bigchaindb  -y configure mongodb
bigchaindb start