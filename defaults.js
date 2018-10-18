/*!
* swde
* Copyright(c) 2017-2018 Carlos Ascari Gutierrez Hermosillo
* MIT License
*/

const LessPluginAutoPrefix = require('less-plugin-autoprefix');

module.exports = {
  js: {
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
  },
  less: {
    noFile: false,
    path: 'less',
    distPath: 'css',
    index: 'index.less',
    exposeHtml: true,
    exposeHtmlLocaleName: 'css',
    filename: 'bundle.css',
    stubContent: `
      // Stub index.less

      * { background: #009688; }
    `.trim(),
    options: {
      paths: [],
      plugins: [
        new LessPluginAutoPrefix({ browsers: ['last 4 versions'] })
      ],
      // sourceMap: {sourceMapFileInline: true}
    }
  },
  html: {
    path: 'html',
    mustache: {
      tags: [ '{{', '}}' ]
    },
    stubLayoutContent: `
      <!DOCTYPE html>
      <html lang='en'>
      <head>
        <meta charset='utf-8'>
        <meta name='viewport' content='width=device-width, minimum-scale=1, initial-scale=1, user-scalable=yes'>
        <title>{{ pageName }}</title>
        <link rel='stylesheet' type='text/css' href='css/bundle.css'>
      </head>
      <body>
        {{> content}} 
        <script type='text/javascript' src='js/bundle.js'></script>
      </body>
      </html>
    `.trim(),
    beautify: {
      indent_size: 2,
      indent_char: " ",
      preserve_newlines: true,
      end_with_newline: true,
      wrap_line_length: 0,
    },
    minify: {
      collapseBooleanAttributes: true,
      collapseWhitespace: true,
      conservativeCollapse: false,
      decodeEntities: true,
      html5: true,
      removeComments: true,
      removeEmptyAttributes: true,
      removeOptionalTags: true,
      removeRedundantAttributes: true,
      sortAttributes: true,
      sortClassName: true,
    },
  },
  img: {
    path: 'img',
    exposeHtml: true,
    exposeHtmlLocaleName: 'img',
  },
  front: {
    path: 'font',
    exposeHtml: true,
    exposeHtmlLocaleName: 'font',
  },
  video: {
    path: 'video'
  },
  svg: {
    path: 'svg',
    exposeHtml: true,
    exposeHtmlLocaleName: 'svg',
    minify: {
      removeAttrs: {attrs: '(x-stroke|x-fill)'},
      cleanupAttrs: true,
      removeDoctype: true,
      removeXMLProcInst: true,
      removeComments: true,
      removeMetadata: true,
      removeTitle: true,
      removeDesc: true,
      removeUselessDefs: true,
      removeEditorsNSData: true,
      removeEmptyAttrs: true,
      removeHiddenElems: true,
      removeEmptyText: true,
      removeEmptyContainers: true,
      removeViewBox: false,
      cleanupEnableBackground: true,
      convertStyleToAttrs: true,
      convertColors: true,
      convertPathData: true,
      convertTransform: true,
      removeUnknownsAndDefaults: true,
      removeNonInheritableGroupAttrs: true,
      removeUselessStrokeAndFill: true,
      removeUnusedNS: true,
      cleanupIDs: true,
      cleanupNumericValues: true,
      moveElemsAttrsToGroup: true,
      moveGroupAttrsToElems: true,
      collapseGroups: true,
      removeRasterImages: false,
      mergePaths: true,
      convertShapeToPath: true,
      sortAttrs: true,
      removeDimensions: true,
    }
  },
  i18n: {
    path: 'i18n',
    exposeJs: true,
    exposeHtml: true,
    exposeHtmlLocaleName: 'i18n',
    exposeJsGlobalVarName: 'i18n',
    defaultLocale: 'en',
  },
  copy: {
    path: '.',
    recursive: true
  },
};