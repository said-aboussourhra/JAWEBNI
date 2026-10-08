#!/usr/bin/env bash
# Boots JAWEBNI (WebAssembly PHP + Laravel) and serves it on 0.0.0.0:8000.
set -e
export NODE_EXTRA_CA_CERTS=/etc/ssl/certs/ca-certificates.crt
cd /home/user/JAWEBNI
bash sandbox-tools/bootstrap.sh
exec node sandbox-tools/server.mjs
