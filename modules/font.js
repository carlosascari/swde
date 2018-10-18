/*!
* swde
* Copyright(c) 2017-2018 Carlos Ascari Gutierrez Hermosillo
* MIT License
*/

const Fontmin = require('fontmin');
const Module = require('../module.js');
const utils = require('../utils');

const { isObject, pjoin, presolve } = utils;

/**
* Font Processor takes ttf fonts and creates
* woff, woff2, eot, & svg fonts, with css for each font.
* @todo: More control over creation
* @class Font
*/
class Font extends Module {
  
  /**
  * @contrutor
  * @param {Object} options
  */
  constructor(options) {
    super('font', options, ['path']);
  }

  /**
  * Start processing
  */
  start(src, dist, env, vars) {
    const options = this.options;

    // Resolve paths
    const srcPath = presolve(src, options.srcPath);
    const distPath = pjoin(dist, options.distPath);

    const fontmin = new Fontmin()
    .src(`${ srcPath }/*.ttf`)
    .dest(distPath);

    return new Promise((ok, no) => {
      fontmin.run(function (error, files) {
        if (error) return no(error);
        ok()
      });
    });
  }
}

module.exports = Font;