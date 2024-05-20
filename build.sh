#!/bin/bash

mkdir -p dest

build(){
    echo -n "Building..."
    rm -fr dest/*

    minify --type html home.html > dest/home.min.html
    minify --type html redirect.html > dest/redirect.min.html
    minify --type css style.css > dest/style.min.css
    minify --type js script.js > dest/script.min.js

    if [ "$1" != 1 ]; then
        STYLE_HASH=$(md5sum dest/style.min.css | head -c 8)
        SCRIPT_HASH=$(md5sum dest/script.min.js | head -c 8)
        sed -i "s/STYLE_HASH/$STYLE_HASH/g" dest/*
        sed -i "s/SCRIPT_HASH/$SCRIPT_HASH/g" dest/*
    else
        # for loval development; copy to where chrome can use for content override
        cd dest/
        mkdir -p locaite.net/ cool-project.locaite.net/
        cp style.min.css locaite.net/style.min.css?v=STYLE_HASH
        cp script.min.js locaite.net/script.min.js?v=SCRIPT_HASH
        cp home.min.html locaite.net/index.html
        cp redirect.min.html cool-project.locaite.net/settings
        cd ../
    fi

    echo " done"
}

if [ "$1" == "watch" ]; then
    build 1
    while inotifywait -e close_write *.html *.js *.css; do
        build 1
    done
else
    build
fi
