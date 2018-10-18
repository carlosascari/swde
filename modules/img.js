/*!
* swde
* Copyright(c) 2017-2018 Carlos Ascari Gutierrez Hermosillo
* MIT License
*/

const imagemin = require('imagemin');
const imageminJpegtran = require('imagemin-jpegtran');
const imageminPngcrush = require('imagemin-pngcrush');
const Module = require('../module.js');
const utils = require('../utils');

const { assign, keys } = Object;
const { pjoin, presolve } = utils;

/**
* Img Processor. Build, Minify & Beutify, translate, plus audit
* @class Img
*/
class Img extends Module {
  
  /**
  * @contrutor
  * @param {Object} options
  */
  constructor(options) {
    super('img', options, ['path']);
  }

  /**
  * Start processing
  */
  start(src, dist, env, vars) {
    const options = this.options;
    const inDevelopment = env === 'development';
    const inProduction = env === 'production';

    // Resolve paths
    const srcPath = presolve(src, options.srcPath);
    const distPath = pjoin(dist, options.distPath);

    return new Promise((ok, no) => {
      imagemin([`${ srcPath }/*.{jpg,png}`], distPath, {
        plugins: [
          imageminJpegtran(),
          imageminPngcrush()
        ]
      })
      .then(files => ok())
      .catch(no)
    });
  }
}

module.exports = Img;