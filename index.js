﻿/**
 * gulp-html-dependencies
 * Copyright(c) 2016 Sébastien Demanou
 * MIT Licensed
 */

'use strict';

/**
 * Module dependencies.
 * @private
 */

var es = require('event-stream')
  , gutil = require('gulp-util')
  , mkdirp = require("mkdirp")
  , path = require('path')
  , fs = require('fs')
  , url = require('url');

const PLUGIN_NAME = 'gulp-html-dependencies';
const REGEX = /("|')([\.\/\\]*((bower_components|node_modules)\/([a-z0-9\.+@~$!;:\/\\{}()\[\]|=&*£%§_-]+(\.[a-z0-9]+)?)))['"]/gi;

module.exports = (options) => {
    options = options || {};
    
    if (typeof options.prefix == 'undefined') {
        options.prefix = '';
    }
    
    if (options.prefix.length > 1) {
        if (options.prefix[options.prefix.length - 1] != '/') {
            options.prefix += '/';
        }
    }
    
    return es.map((file, done) => {
        let dest = options.dest || path.dirname(file.path);
        
        dest = path.join(dest, options.prefix);
        
        file.contents = new Buffer(file.contents.toString().replace(REGEX, (matches, quote, uri, pathname, engine, filename) => {
            const ext = path.extname(filename);
            
            if (!ext) {
                uri += '.js';
            }
            
            const f = options.flat && ext ? path.basename(filename) : filename;
            const dest_file_prefix = ext ? dest : path.join(dest, engine);
            const dest_file = path.join(dest_file_prefix, f + (!ext ? '.js' : ''));
            const url_file = url.resolve(options.prefix, f);
            
            try {
                mkdirp.sync(path.dirname(dest_file));
                fs.createReadStream(path.resolve(path.dirname(file.path), uri))
                    .pipe(fs.createWriteStream(dest_file));
            } catch(err) {
                return done(new gutil.PluginError(PLUGIN_NAME, err));
            }
            
            return quote + url_file + quote;
        }));
        
        done(null, file);
    });
};
