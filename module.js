/*!
* swde
* Copyright(c) 2017-2020 Carlos Ascari Gutierrez Hermosillo
* MIT License
*/

const { defineProperty } = Object;

class Module {
  constructor(namespace, options, defaults={}, requiredOptions=[]) {
    if (!namespace || !defaults ) throw new Error('A valid module namespace is required');
    if (options === true) options = defaults;
    defineProperty(this, 'ns', { get: () => namespace });
    defineProperty(this, 'options', { get: () => options });
    requiredOptions
    .forEach(ropt => options[ropt] = options[ropt] != undefined ? options[ropt] : defaults[ropt]);
    if (!options.srcPath) options.srcPath = defaults.srcPath || options.path;
    if (!options.distPath) options.distPath = defaults.distPath || options.path;
  }

  start(src, dist, env) {
    throw new Error('Must implement `start` method');
  }
}

module.exports = Module;