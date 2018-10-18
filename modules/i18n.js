/*!
* swde
* Copyright(c) 2017-2018 Carlos Ascari Gutierrez Hermosillo
* MIT License
*/

const Module = require('../module.js');
const utils = require('../utils');
const defaults = require('../defaults');

const { assign, keys } = Object;
const {
  ensureDir, exists, existsFile, 
  isDir, isObject, pjoin, presolve, 
  read, render, write, ls, basename
} = utils;

/**
* I18n Processor. Build, Minify & Beutify, translate, plus audit
* @class I18n
*/
class I18n extends Module {
  
  /**
  * @contrutor
  * @param {Object} options
  */
  constructor(options) {
    super('i18n', options, ['path', 'defaultLocale', 'exposeJsGlobalVarName']);
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

    const defaultLocalePath = pjoin(srcPath, `${ options.defaultLocale }.json`);

    if (inDevelopment) {
      if (!existsFile(defaultLocalePath)) {
        write(defaultLocalePath, JSON.stringify({ stub: 'stub' }, null, 4)); 
      }
    }

    if (inDevelopment) ensureDir(srcPath);
    ensureDir(distPath);

    const i18nStore = {};

    ls(srcPath)
    .map(fname => `${ srcPath }/${ fname }`)
    .map(x => [basename(x).split('.')[0], read(x)])
    .forEach(x => i18nStore[x[0]] = JSON.parse(x[1]))

    i18nStore.default = options.defaultLocale;

    if (!vars.html) vars.html = {};
    vars.html.i18n = {
      store: i18nStore,
      name: options.exposeHtmlGlobalVarName
    }
    if (!vars.js) vars.js = {};
    vars.js.i18n = {
      store: i18nStore,
      name: options.exposeJsGlobalVarName
    };

    return Promise.resolve();
  }
}

module.exports = I18n;