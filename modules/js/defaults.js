/*!
* swde
* Copyright(c) 2017-2020 Carlos Ascari Gutierrez Hermosillo
* MIT License
*/

module.exports = {
  path: 'js',
  noBuble: false,
  noFile: false,
  exposeHtml: true,
  exposeHtmlLocaleName: 'js',
  index: 'index.js',
  filename: 'bundle.js',
  libs: [],
  include: [],
  stubContent: `console.log('Stub index.js');`,
  minify: { // UglifyJs options
    sequences: true,
    properties: true,
    dead_code: true,
    drop_debugger: true,
    unsafe: false,
    conditionals: true,
    comparisons: true,
    evaluate: true,
    booleans: true,
    loops: true,
    unused: true,
    hoist_funs: true,
    hoist_vars: false,
    if_return: true,
    join_vars: true,
    cascade: true,
    side_effects: true,
    warnings: true,
    global_defs: {}
  },
};