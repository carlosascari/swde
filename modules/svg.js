/*!
* swde
* Copyright(c) 2017-2018 Carlos Ascari Gutierrez Hermosillo
* MIT License
*/

const ncp = require('ncp');
const utils = require('../utils');
const defaults = require('../defaults');
const SvgO = require('svgo');
const Module = require('../module.js');

const { assign, keys } = Object;
const {
  ensureDir, exists, existsFile, 
  isDir, isObject, pjoin, presolve, 
  read, render, write, ls
} = utils;

/**
* Svg Processor. Build, Minify & Beutify, translate, plus audit
* @class Svg
*/
class Svg extends Module {
  
  /**
  * @contrutor
  * @param {Object} options
  */
  constructor(options) {
    super('svg', options, ['path']);

    const plugins = []
    Object.keys(defaults.svg.minify)
    .forEach(x => plugins.push(defaults.svg.minify[x]))
    this.svgo = new SvgO({ plugins });
  }

  /**
  * Start processing
  */
  start(src, dist, env) {
    const options = this.options;
    const inDevelopment = env === 'development';
    const inProduction = env === 'production';

    // Resolve paths
    const srcPath = pjoin(src, options.srcPath || options.path);
    const distPath = pjoin(dist, options.distPath || options.path);

    if (inDevelopment) ensureDir(srcPath);
    ensureDir(distPath);

    // if (!(exists(srcPath) && isDir(srcPath))) return next();
    // if (!ls(srcPath).length) return next();
    
    return new Promise((ok, no) => {
      Promise.all(
        ls(srcPath)
        .filter(x => x.indexOf('.svg') != -1)
        .map(x => [x, read(pjoin(srcPath, x))])
        .map(x => {
          return new Promise((ok, no) => {
            this.svgo.optimize(x[1])
            .then((result) => {
              write(pjoin(distPath, x[0]), result.data)
              ok();
            })
            .catch(no)
          });
        })
      )
      .then((result) => ok())
      .catch(no);
    });
  }
}

module.exports = Svg;