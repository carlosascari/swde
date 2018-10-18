/*!
* swde
* Copyright(c) 2017-2018 Carlos Ascari Gutierrez Hermosillo
* MIT License
*/

const defaults = require('./defaults');

const { defineProperty } = Object;

class Module {
  constructor(namespace, options=defaults[namespace], requiredOptions=[]) {
    if (!namespace || !defaults[namespace] ) throw new Error('A valid module namespace is required');
    if (options === true) options = defaults[namespace];
    defineProperty(this, 'ns', { get: () => namespace });
    defineProperty(this, 'options', { get: () => options });
    requiredOptions
    .forEach(ropt => options[ropt] = options[ropt] != undefined ? options[ropt] : defaults[namespace][ropt]);
    if (!options.srcPath) options.srcPath = defaults[namespace].srcPath || options.path;
    if (!options.distPath) options.distPath = defaults[namespace].distPath || options.path;
  }

  start(src, dist, env) { throw new Error('Must implement `start` method') }
}

module.exports = Module;