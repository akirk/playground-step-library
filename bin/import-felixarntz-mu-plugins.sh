cd `dirname $0`
pushd ../felixarntz-mu-plugins/felixarntz-mu-plugins/shared
zip ../../../felixarntz-mu-plugins-shared.zip *
popd
node convert-felixarntz-mu-plugins.js
node update-load-steps.js
