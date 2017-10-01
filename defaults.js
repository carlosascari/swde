/*!
* swde
* Copyright(c) 2017 Carlos Ascari Gutierrez Hermosillo
* MIT License
*/

const LessPluginAutoPrefix = require('less-plugin-autoprefix');
const path = require('path');

const DEFAULT_SRC_PATH = path.resolve('./src');

const DEFAULT_DIST_PATH = path.resolve('./dist');

const DEFAULT_LAYOUT_HTML = `
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
`.trim();

const DEFAULT_HTML_MINIFY_OPTIONS = {
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
};

const DEFAULT_UGLIFY_JS_OPTIONS = {
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
};

const DEFAULT_FONT = {
  path: 'font'
};

const DEFAULT_HTML = {
  path: 'html',
  mustache: {
    tags: [ '{{', '}}' ]
  },
  beautifyOptions: {
    indent_size: 2,
    preserve_newlines: false
  },
  minifyOptions: DEFAULT_HTML_MINIFY_OPTIONS,
};

const DEFAULT_I18N = {
  path: 'i18n',
  exposeJs: true,
  defaultLocale: 'en',
};

const DEFAULT_IMG = {
  path: 'img'
};

const DEFAULT_JS = {
  path: 'js',
  index: 'index.js',
  filename: 'bundle.js',
  libs: [],
  paths: [],
  uglifyOptions: DEFAULT_UGLIFY_JS_OPTIONS,
};

const DEFAULT_LESS = {
  path: 'less',
  index: 'index.less',
  filename: 'bundle.css',
  options: {
    paths: [],
    plugins: [
      new LessPluginAutoPrefix({
        browsers: ['last 4 versions']
      })
    ],
    // sourceMap: {sourceMapFileInline: true}
  }
};

const DEFAULT_SVG = {
  path: 'svg'
};

const DEFAULT_VIDEO = {
  path: 'video'
};

module.exports = {
  DEFAULT_SRC_PATH,
  DEFAULT_DIST_PATH,
  DEFAULT_LAYOUT_HTML,
  DEFAULT_HTML_MINIFY_OPTIONS,
  DEFAULT_UGLIFY_JS_OPTIONS,
  DEFAULT_FONT,
  DEFAULT_HTML,
  DEFAULT_I18N,
  DEFAULT_IMG,
  DEFAULT_JS,
  DEFAULT_LESS,
  DEFAULT_SVG,
  DEFAULT_VIDEO,
};