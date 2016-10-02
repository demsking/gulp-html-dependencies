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
  , fs = require('fs');

const PLUGIN_NAME = 'gulp-html-dependencies';
const REGEX = /(href|src)=("|')(.*((bower_components|node_modules)\/([a-z0-9\.+@~$!;:\/\\{}()\[\]|=&*£%§-]+\.[\w\d]+)))("|')/gi;

module.exports = (options) => {
    options = options || {};
    
    options.prefix = options.prefix || '/';
    
    return es.map((file, done) => {
        let dest = options.dest || path.dirname(file.path);
        
        dest = path.join(dest, options.prefix);
        
        file.contents = new Buffer(file.contents.toString().replace(REGEX, (match, attr, quote, url, pathname, engine, filename) => {
            const dest_file = path.join(dest, options.flat ? path.basename(filename) : filename);
            
            try {
                mkdirp.sync(path.dirname(dest_file));
                fs.createReadStream(path.resolve(path.dirname(file.path), url))
                    .pipe(fs.createWriteStream(dest_file));
            } catch(err) {
                return done(new gutil.PluginError(PLUGIN_NAME, err));
            }
            
            return attr + '=' + quote + path.join(options.prefix, filename) + quote;
        }));
        
        done(null, file);
    });
};