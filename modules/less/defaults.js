/*!
* swde
* Copyright(c) 2017-2020 Carlos Ascari Gutierrez Hermosillo
* MIT License
*/

const LessPluginAutoPrefix = require('less-plugin-autoprefix');

module.exports = {
  noFile: false,
  path: 'less',
  srcPath: 'less',
  distPath: 'css',
  index: 'index.less',
  exposeHtml: true,
  exposeHtmlLocaleName: 'css',
  filename: 'bundle.css',
  stubContent: `
    // Stub index.less

    * { background: #009688; }
  `.trim().replace(/^ +/m, ''),
  options: {
    paths: [],
    plugins: [
      new LessPluginAutoPrefix({ browsers: ['last 4 versions'] })
    ],
    // sourceMap: {sourceMapFileInline: true}
  }
};