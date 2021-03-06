/*!
* swde
* Copyright(c) 2017-2020 Carlos Ascari Gutierrez Hermosillo
* MIT License
*/

const async = require('async');
const utils = require('./utils');

const { assign, keys } = Object;
const { ensureDir, exists, isDir, presolve, flatten } = utils;

/**
* Order in which modules are executed. This allows
* js & css to be inlined in a html page, since the
* html module is processed last and has access to
* the files via the `variables` global variable.
*/
const ORDERED_MODULES = [
  'i18n',
  'img', 'font', 'svg', 
  'video', 'audio', 
  'less', 'js',
  'html', 
  'copy', 'move', 'delete',
];

/**
* Create distributable files. If in a development enviroment, it will
* also create stub folders and files in the source `src` folder.
* @param {Object|Array<Object>} build options or array of build options to execute in series 
* @return {Promise}
*/
function Swde(options) {
  if (arguments.length > 1 || Array.isArray(options)) {
    return Promise.all(
      flatten(Array.prototype.slice.call(arguments))
      .map(opts => Swde(opts))
    );
  }

  // Global scoped variables (shared by modules)
  const variables = {};

  // Resolve working directories
  const src = presolve(options.src || 'src');
  const dist = presolve(options.dist || 'dist');

  // Determine build enviroment
  const env = options.env || 'development';
  const inDevelopment = env === 'development';

  // Ensure `src` folder exists
  if (!exists(src) || !isDir(src)) {
    if (inDevelopment) {
      ensureDir(src);
    } else {
      throw new Error(`swde: Source folder does not exist: "${ src }"`);
    }
  }

  // Ensure `dist` folder exists
  if (!exists(dist) || !isDir(dist)) {
    if (inDevelopment) {
      ensureDir(dist);
    } else {
      throw new Error(`swde: Source folder does not exist: "${ dist }"`);
    }
  }

  // Load prcoessing modules
  const modules = {};
  Object.keys(options)
  .filter(key => options[key] && typeof options[key] === 'object')
  .forEach(key => {
    try {
      modules[key] = new (require(`./modules/${ key }`))(options[key]);
    } catch(e) {
      console.log(e);
    }
  });

  // Build
  return new Promise((ok, no) => {
    async.series(
      ORDERED_MODULES
      .filter(ns => options[ns])
      .map(ns => function(next) {
        // Run module
        modules[ns]
        .start(src, dist, env, variables)
        .then(() => next())
        .catch((e) => {
          console.log(e);
          next(e);
        });
      }),
      errors => {
        if (errors) {
          console.log(errors);
          return no(errors);
          ok();
        } else {
          ok();
        }
      }
    );
  })
}

module.exports = Swde;