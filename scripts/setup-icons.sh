#!/bin/bash
# Copy icon from artifact dir to public/icons
SRC="$1"
DST_DIR="/Users/sotoon/jaliz/public/icons"

cp "$SRC" "$DST_DIR/icon-512x512.png"
sips -z 192 192 "$DST_DIR/icon-512x512.png" --out "$DST_DIR/icon-192x192.png"
cp "$DST_DIR/icon-512x512.png" "$DST_DIR/icon-maskable-512x512.png"
cp "$DST_DIR/icon-192x192.png" "$DST_DIR/icon-maskable-192x192.png"
echo "All icons generated:"
ls -la "$DST_DIR"
