/*!
* swde
* Copyright(c) 2017-2020 Carlos Ascari Gutierrez Hermosillo
* MIT License
*/

const rollup = require('rollup').rollup;
const rollupPluginBuble = require('rollup-plugin-buble');
const rollupPluginIncludePaths = require('rollup-plugin-includepaths');
const rollupPluginUglify = require('rollup-plugin-uglify');
const Module = require('../../module.js');
const utils = require('../../utils');
const defaults = require('./defaults');

const { assign, keys } = Object;
const {
  ensureDir, exists, existsFile, 
  isDir, isFile, isObject, pjoin, presolve, 
  read, render, write
} = utils;

/**
* Js Processor. 
* Build, Minify & Beautify
* @class Js
*/
class Js extends Module {
  
  /**
  * @contrutor
  * @param {Object} options
  */
  constructor(options) {
    super('js', options, defaults, [
      'path', 'index', 'filename', 
      'include', 'stubContent',
      'noFile', 'noBuble', 'libs',
      'minify', 'exposeHtml', 'exposeHtmlLocaleName',
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
    const srcJsPath = pjoin(src, options.srcPath);
    const srcJsIndexPath = pjoin(srcJsPath, options.index);
    const distJsPath = pjoin(dist, options.distPath);
    const distJsFilePath = pjoin(distJsPath, options.filename);

    // Ensure index file exists
    if (inDevelopment) {
      ensureDir(srcJsPath);
      if (!exists(srcJsIndexPath)) {
        write(srcJsIndexPath, options.stubContent);
      }
    }

    if (!(exists(srcJsPath) && isDir(srcJsPath))) return Prmosise.reject(new Error('src js folder is missing'));
    if (!(exists(srcJsIndexPath) && isFile(srcJsIndexPath))) Prmosise.reject(new Error('js index is missing'));
    if (!options.noFile) ensureDir(distJsPath);

    // Include paths for import & export
    const includePaths = options.include.map(path => pjoin(srcJsPath, path));
    includePaths.unshift(srcJsPath);

    // Libs & locales
    const jsBanner = [];
    options.libs
    .map(path => {
      try {
        const libCode = read(pjoin(srcJsPath, path))
        jsBanner.push(libCode)
      } catch(e) {
        if (e.code == 'ENOENT') {
          console.warn(`swde-js: Missing libs file: ${ path }`);
        } else {
          throw e;
        }        
      }
    })
    .forEach(libJs => jsBanner.push(libJs));

    // i18n Locales object
    if (vars.js && vars.js.i18n) {
      // console.log('>>>', vars.js.i18n)
      const i18nCode = `const ${ vars.js.i18n.name } = ${ JSON.stringify(vars.js.i18n.store) };`;
      jsBanner.unshift(i18nCode);
    }

    // Plugins for rollup
    const activeRollupPlugins = [];
    activeRollupPlugins.push(
      rollupPluginIncludePaths({
        include: {},
        paths: includePaths,
        extensions: ['.js']
      })
    );

    // Convert to ES2015 with buble
    if (!options.noBuble) {
      activeRollupPlugins.push(
        rollupPluginBuble()
      );
    }

    // Minify during production env
    if (inProduction) {
      activeRollupPlugins.push(
        rollupPluginUglify(options.minify)
      );
    }

    if (options.rawJsOnly) {
      if (options.noFile) {
        if (!vars.html) vars.html = {};
        vars.html.js = { code: read(srcJsIndexPath) }
      } else {
        write(distJsFilePath, read(srcJsIndexPath));
        vars.html.js = {
          code: read(srcJsIndexPath),
          filename: pjoin(options.distPath, options.filename)
        }
      }
      return Promise.resolve();
    }

    // Build
    return new Promise((ok, no) => {
      rollup({
        input: srcJsIndexPath,
        // sourceMap: env === 'development',
        plugins: activeRollupPlugins
      })
      .then(bundle => {
        if (!options.noFile) {
          bundle.write({
            file: distJsFilePath,
            format: 'es',
            banner: jsBanner.join('\n'),
          }); 
        }

        if (options.exposeHtml || options.noFile) {
          bundle.generate({ format: 'es' })
          .then(({ code, map }) => {
            if (!vars.html) vars.html = {};
            vars.html.js = {
              code, 
              // name: options.exposeHtmlLocaleName, // @DEPRECATED
              filename: pjoin(options.distPath, options.filename)
            }
            ok();
          })
          .catch(no);          
        } else {
          ok();
        }
      })
      .catch(no);
    });
  }
}

module.exports = Js;