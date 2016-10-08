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
const REGEX = /(href|src)=("|')(.*((bower_components|node_modules)\/([a-z0-9\.+@~$!;:\/\\{}()\[\]|=&*£%§-]+\.[\w\d]+)))("|')/gi;

module.exports = (options) => {
    options = options || {};
    
    options.prefix = options.prefix || '/';
    
    return es.map((file, done) => {
        let dest = options.dest || path.dirname(file.path);
        
        dest = path.join(dest, options.prefix);
        
        file.contents = new Buffer(file.contents.toString().replace(REGEX, (match, attr, quote, uri, pathname, engine, filename) => {
            const f = options.flat ? path.basename(filename) : filename;
            const dest_file = path.join(dest, f);
            const url_file = url.resolve(options.prefix, f);
            
            try {
                mkdirp.sync(path.dirname(dest_file));
                fs.createReadStream(path.resolve(path.dirname(file.path), uri))
                    .pipe(fs.createWriteStream(dest_file));
            } catch(err) {
                return done(new gutil.PluginError(PLUGIN_NAME, err));
            }
            
            return attr + '=' + quote + url_file + quote;
        }));
        
        done(null, file);
    });
};
