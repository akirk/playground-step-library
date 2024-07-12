cd `dirname $0`
pushd ../felixarntz-mu-plugins/
rm -f ../felixarntz-mu-plugins-shared.zip
zip ../felixarntz-mu-plugins-shared.zip felixarntz-mu-plugins/shared/*
popd
node convert-felixarntz-mu-plugins.js
node update-load-steps.js
