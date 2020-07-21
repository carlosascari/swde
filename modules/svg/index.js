/*!
* swde
* Copyright(c) 2017-2020 Carlos Ascari Gutierrez Hermosillo
* MIT License
*/

const SvgO = require('svgo');
const ncp = require('ncp');
const Module = require('../../module.js');
const utils = require('../../utils');
const defaults = require('./defaults');

const { assign, keys } = Object;
const {
  ensureDir, exists, existsFile, 
  isDir, isObject, pjoin, presolve, 
  read, render, write, ls, basename
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
    super('svg', options, defaults, ['path']);

    const plugins = []
    Object.keys(defaults.minify)
    .forEach(x => plugins.push(defaults.minify[x]))
    this.svgo = new SvgO({ plugins });
  }

  /**
  * Start processing
  */
  start(src, dist, env, vars) {
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
      if (!vars.html) vars.html = {};
      vars.html.svg = {};
      Promise.all(
        ls(srcPath)
        .filter(x => x.indexOf('.svg') != -1)
        .map(x => [x, read(pjoin(srcPath, x))])
        .map(x => {
          return new Promise((ok, no) => {
            vars.html.svg['svg-'+x[0].split('.')[0]] = x[1];
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