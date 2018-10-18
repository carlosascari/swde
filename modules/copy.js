/*!
* swde
* Copyright(c) 2017-2018 Carlos Ascari Gutierrez Hermosillo
* MIT License
*/

const ncp = require('ncp');
const Module = require('../module.js');
const utils = require('../utils');

const { pjoin, presolve } = utils;

/**
* Copy files and folders
* @class Copy
*/
class Copy extends Module {
  
  /**
  * @contrutor
  * @param {Object} options
  */
  constructor(options) {
    super('copy', options);
  }

  /**
  * Start processing
  */
  start(src, dist, env, vars) {
    const options = this.options;

    // Resolve paths
    const srcPath = presolve(src, options.srcPath);
    const distPath = pjoin(dist, options.distPath);

    return new Promise((ok, no) => {
      ncp(srcPath, distPath, (error) => {
        if (error) return no(error)
        ok()
      });
    });
  }
}

module.exports = Copy;