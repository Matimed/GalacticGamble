#!/bin/sh

# Uso este script para poder setear la ip de forma dinamica desde docker
cat <<EOF > /config_data/config.js
export const CONFIG = {
  WS_HOST: "${WS_HOST:-localhost}",
  WS_PORT: "${WS_PORT:-8080}"
};
EOF

exec "$@"