/*!
* swde
* Copyright(c) 2017-2020 Carlos Ascari Gutierrez Hermosillo
* MIT License
*/

const ncp = require('ncp');
const Module = require('../../module.js');
const utils = require('../../utils');
const defaults = require('./defaults');

const { ensureDir, exists, isDir, pjoin, ls } = utils;

/**
* Video Processor, currently only copies over files
* @class Video
*/
class Video extends Module {
  
  /**
  * @contrutor
  * @param {Object} options
  */
  constructor(options) {
    super('video', options, defaults, ['path']);
  }

  /**
  * Start processing
  */
  start(src, dist, env, vars) {
    const options = this.options;
    const inDevelopment = env === 'development';
    const inProduction = env === 'production';

    // Resolve paths
    const srcPath = pjoin(src, options.srcPath);
    const distPath = pjoin(dist, options.distPath);

    if (inDevelopment) ensureDir(srcPath);
    ensureDir(distPath);

    if (!(exists(srcPath) && isDir(srcPath))) Promise.reject(new Error('src folder does not exist'));
    if (!ls(srcPath).length) return Promise.resolve();
    
    return new Promise((ok, no) => {
      ncp(srcPath, distPath, (error) => {
        if (error) return no(error);
        ok();
      });
    });
  }
}

module.exports = Video;