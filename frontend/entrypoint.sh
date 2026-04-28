#!/bin/sh

# Uso este script para poder setear la ip de forma dinamica desde docker
cat <<EOF > /config_data/config.js
export const CONFIG = {
  WS_URL: "ws://${HOST:-localhost}:${PORT:-8080}/ws"
};
EOF

exec "$@"