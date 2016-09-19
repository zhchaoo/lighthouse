#!/usr/bin/env bash

# run from /lighthouse-extension
#     ./devtools/build-for-devtools.sh

browserify \
  --debug \
  --transform brfs \
  --ignore npmlog \
  --ignore chrome-remote-interface \
  --ignore chrome-devtools-frontend \
  --exclude /Users/paulirish/code/lighthouse/lighthouse-core/lib/web-inspector-impl.js \
  devtools/devtools-lighthouse-runner.js \
  > lighthouse-lib.js


cp lighthouse-lib.js /Users/paulirish/chromium/src/third_party/WebKit/Source/devtools/front_end/audits/
rm lighthouse-lib.js
