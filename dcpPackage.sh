#!/usr/bin/bash

# make sure most updated worker.js code is in package directory
tail -n +2 worker.js | head -n -12 >> package/fractals.js

# update version number of package
cd package
node updateVersion.js

# deploy to dcp
node_modules/dcp-util/bin/publish package package.dcp