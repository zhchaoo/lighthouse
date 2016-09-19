#!/usr/bin/env bash

# run from /lighthouse-extension
#     ./devtools/build-for-devtools.sh

gulp devtools

cd devtools

cp dist/devtools-lighthouse-runner.js dist/lighthouse-lib.js

#### IGNORE sourcemap for now.
# extract sourcemap into seperate file for speed
# cat dist/devtools-lighthouse-runner.js | exorcist dist/lighthouse-lib.js.map > dist/lighthouse-lib.js

# copy over to real devtools
cp -v dist/lighthouse-lib.js* $HOME/chromium/src/third_party/WebKit/Source/devtools/front_end/audits/

echo "done!"
