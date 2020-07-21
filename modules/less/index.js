/*!
* swde
* Copyright(c) 2017-2020 Carlos Ascari Gutierrez Hermosillo
* MIT License
*/

const lessc = require('less');
const Module = require('../../module.js');
const utils = require('../../utils');
const defaults = require('./defaults');

const { assign, keys } = Object;
const {
  ensureDir, exists, existsFile, 
  isDir, isObject, pjoin, presolve, 
  read, render, write, isFile
} = utils;

/**
* Less Processor. Build, Minify & Beutify, autoprefix, plus audit
* @class Less
*/
class Less extends Module {
  
  /**
  * @contrutor
  * @param {Object} options
  */
  constructor(options) {
    super('less', options, defaults, [
      'path', 'index', 'filename', 
      'distPath', 'options', 'stubContent',
      'exposeHtml', 'exposeHtmlLocaleName'
    ]);
  }

  /**
  * Start processing
  */
  start(src, dist, env, vars) {
    const options = this.options;
    const inDevelopment = env === 'development';
    const inProduction = env === 'production';

    // Resolve paths
    const srcLessPath = pjoin(src, options.srcPath);
    const srcLessIndexPath = pjoin(srcLessPath, options.index);
    const distCssPath = pjoin(dist, options.distPath);
    const distCssFilePath = pjoin(distCssPath, options.filename);

    // Ensure less index file exists in development enviroments. Create stub
    if (inDevelopment) {
      ensureDir(srcLessPath);
      if (!exists(srcLessIndexPath) || !isFile(srcLessIndexPath)) {
        write(srcLessIndexPath, options.stubContent);
      }
    }

    if (!(exists(srcLessPath) && isDir(srcLessPath))) return Promise.reject(new Error('less src folder is missing'));
    if (!(exists(srcLessIndexPath) && isFile(srcLessIndexPath))) return Promise.reject(new Error('less index is missing'));
    
    // Index file content
    const lessIndexContent = read(srcLessIndexPath);

    // Less Paths/Includes
    const lessOptions = assign({}, options.options, { paths: [ srcLessPath ] });
    options.options.paths.forEach(path => lessOptions.paths.push(path));
    
    // Build
    return new Promise((ok, no) => {
      lessc.render(lessIndexContent, lessOptions, (error, output) => {
        if (error) return no(error);
        if (!options.noFile) {
          ensureDir(distCssPath);
          write(distCssFilePath, output.css);
        } 

        if (options.exposeHtml || options.noFile) {
          if (!vars.html) vars.html = {};
          vars.html.less = {
            code: output.css, 
            // name: options.exposeHtmlLocaleName // @DEPRECATED
            filename: pjoin(options.distPath, options.filename)
          }
        }

        ok();
      });
    })
  }
}

module.exports = Less;