#!/usr/bin/bash

# make sure most updated worker.js code is in package directory
rm package/fractals.js package/math.js
echo "module.declare(['./math.js'], function(require, exports, modules) {" >> package/fractals.js
tail -n +2 worker.js | head -n -12 >> package/fractals.js
echo -e "exports.mandelbrot=mandelbrot;\nexports.buddhabrot=buddhabrot;\nexports.newton=newton;\n})" >> package/fractals.js

echo "module.declare([], function(require, exports, modules) {" >> package/math.js
cat math.js >> package/math.js
echo -e "\n})" >> package/math.js

# update version number of package
cd package
node updateVersion.js

# deploy to dcp
node_modules/dcp-util/bin/publish package package.dcp