#!/bin/zsh
# Rebundles the engine after editing src/engine.js. Run npm i once first.
cd "${0:A:h}"; npx esbuild src/entry.js --bundle --format=iife --global-name=PK --minify --target=chrome110 --outfile=dist/engine.js --log-level=warning
