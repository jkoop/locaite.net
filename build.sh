#!/bin/bash

mkdir -p dest

build(){
    echo -n "Building..."

    minify --type html index.html > dest/index.min.html
    minify --type css style.css > dest/style.min.css
    minify --type js script.js > dest/script.min.js

    STYLE_HASH=$(md5sum dest/style.min.css | head -c 8)
    SCRIPT_HASH=$(md5sum dest/script.min.js | head -c 8)
    sed -i "s/STYLE_HASH/$STYLE_HASH/g" dest/*
    sed -i "s/SCRIPT_HASH/$SCRIPT_HASH/g" dest/*

    echo " done"
}

if [ "$1" == "watch" ]; then
    build
    while inotifywait -e close_write index.html script.js style.css; do
        build
    done
else
    build
fi
