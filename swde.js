const fs = require('fs-extra');
const htmlBeautify = require('js-beautify').html;
const htmlMinify = require('html-minifier').minify;
const mustache = require('mustache');
const lessc = require('less');
const LessPluginAutoPrefix = require('less-plugin-autoprefix');
const ncp = require('ncp');
const path = require('path');
const rollup = require('rollup').rollup;
const rollupPluginBuble = require('rollup-plugin-buble');
const rollupPluginIncludePaths = require('rollup-plugin-includepaths');
const rollupPluginUglify = require('rollup-plugin-uglify');

const { assign, keys } = Object;
const ensureDir = (path) => fs.ensureDirSync(path);
const exists = (filepath) => fs.existsSync(filepath);
const isDir = (path) => fs.statSync(path).isDirectory();
const isFile = (path) => fs.statSync(path).isFile();
const ls = (path) => fs.readdirSync(path);
const mkdir = (filepath) => fs.mkdirSync(filepath);
const pjoin = function() { return path.join.apply(path, arguments) };
const read =  filepath => fs.readFileSync(filepath, 'utf8');
const render = (template, options, partials) => mustache.render(template, options, partials); // tags = ['{{', '}}'] 
const write = (filepath, content) => fs.outputFileSync(filepath, content);
const existsDir = (path) => exists(path) && isDir(path);
const existsFile = (path) => exists(path) && isFile(path);
const basename = (filename) => path.basename(filename);

const DEFAULT_SRC_PATH = path.resolve('./src');

const DEFAULT_DIST_PATH = path.resolve('./dist');

const DEFAULT_LAYOUT_HTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset='utf-8'>
  <title>{{ pageName}}</title>
  <link rel="stylesheet" type="text/css" href="css/bundle.css">
</head>
<body>
  {{> content}} 
  <script type="text/javascript" src="js/bundle.js"></script>
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

/**
* Sanity check for options object. Sets defaults.
* @param {Object} options
* @return {Object} An object with all options set.
*/
const parseOptions = (options) => {
  let { dist=DEFAULT_DIST_PATH, src=DEFAULT_SRC_PATH } = options;
  const {
    env=(process.env.NODE_ENV || 'development'),
    font=DEFAULT_FONT,
    html=DEFAULT_HTML,
    i18n=DEFAULT_I18N,
    img=DEFAULT_IMG,
    js=DEFAULT_JS,
    less=DEFAULT_LESS,
    svg=DEFAULT_SVG,
    video=DEFAULT_VIDEO,
  } = options;
  const fontEnabled = font;
  const htmlEnabled = html !== false;
  const i18nEnabled = i18n;
  const imgEnabled = img;
  const jsEnabled = js;
  const lessEnabled = less;
  const svgEnabled = svg;
  const videoEnabled = video;

  src = path.resolve(src);
  dist = path.resolve(dist);

  if (fontEnabled) {
    if (!font.path) font.path = DEFAULT_FONT.path;
  }

  if (htmlEnabled) {
    if (!html.path) html.path = DEFAULT_HTML.path;
    if (!html.minifyOptions) html.minifyOptions = DEFAULT_HTML.minifyOptions;
    if (!html.beautifyOptions) html.beautifyOptions = DEFAULT_HTML.beautifyOptions;
    if (!html.pages) html.pages = DEFAULT_HTML.pages;
    if (!html.mustache) html.mustache = DEFAULT_HTML.mustache;
  }

  if (i18nEnabled) {
    if (!i18n.path) i18n.path = DEFAULT_I18N.path;
    if (!i18n.exposeJs) i18n.exposeJs = DEFAULT_I18N.exposeJs;
    if (!i18n.defaultLocale) i18n.defaultLocale = DEFAULT_I18N.defaultLocale;
  }

  if (imgEnabled) {
    if (!img.path) img.path = DEFAULT_IMG.path;
  }

  if (jsEnabled) {
    if (!js.path) js.path = DEFAULT_JS.path;
    if (!js.index) js.index = DEFAULT_JS.index;
    if (!js.filename) js.filename = DEFAULT_JS.filename;
    if (!js.paths) js.paths = DEFAULT_JS.paths;
    if (!js.libs) js.libs = DEFAULT_JS.libs;
    if (!js.uglifyOptions) js.uglifyOptions = DEFAULT_JS.uglifyOptions;
  }

  if (lessEnabled) {
    if (!less.path) less.path = DEFAULT_LESS.path;
    if (!less.index) less.index = DEFAULT_LESS.index;
    if (less.compress === undefined) less.compress = env === 'production';
    if (!less.filename) less.filename = DEFAULT_LESS.filename;
    if (!less.options) less.options = DEFAULT_LESS.options;
    if (!less.paths) less.paths = [ pjoin(src, less.path) ];
  }

  if (svgEnabled) {
    if (!svg.path) svg.path = DEFAULT_SVG.path;
  }

  if (videoEnabled) {
    if (!video.path) video.path = DEFAULT_VIDEO.path;
  }

  return { dist, env, font, html, i18n, img, js, less, src, svg, video };
}

/**
* Create distributable files. If in a development enviroment, it will
* also create stub folders and files in the source (src) folder.
* @param {Object} options
* @return {Promise}
*/
function StaticWebDevEnv(options) {
  options = parseOptions(options);
  const { dist, env, font, html, i18n, img, js, less, src, svg, video } = options;
  const promises = [];
  const inProduction = env === 'production';
  const inDevelopment = env === 'development';
  let localesInit = '';
  let localesObject = null;

  if (!exists(src) || !isDir(src)) {
    if (env === 'development') {
      ensureDir(src);
    } else {
      throw new Error(`Source folder does not exist: "${ src }"`);
    }
  }

  if (font.path) {
    const fontPath = pjoin(src, font.path);
    if (inDevelopment) ensureDir(fontPath);
    if (existsDir(fontPath)) {
      if (ls(fontPath).length) {
        const distFontPath = pjoin(dist, font.path);
        ensureDir(distFontPath);
        promises.push(new Promise((ok, no) => {
          ncp(fontPath, distFontPath, (error) => {
            if (error) return no(error);
            ok();
          });
        }));
      }
    } 
  }

  if (i18n.path) {
    const i18nPath = pjoin(src, i18n.path);
    if (inDevelopment) {
      ensureDir(i18nPath);
      const defaultLocaleFilename = pjoin(i18nPath, `${i18n.defaultLocale}.js`);
      if (!existsFile(defaultLocaleFilename)) {
        write(defaultLocaleFilename, `module.exports = {\n\n};`);
      }
    }
    if (exists(i18nPath) && isDir(i18nPath)) {
      const i18nFiles = ls(i18nPath)
                       .map((path) => pjoin(i18nPath, path))
                       .filter(path => isFile(path));
      const i18nLocaleFilenames = i18nFiles.map(path => basename(path))
      localesObject = { default: js.defaultLocale };
      i18nLocaleFilenames.forEach(localeFilename => {
        const locale = localeFilename.replace('.js', '')
        localesObject[locale] = require(pjoin(i18nPath, localeFilename));
      });
      if (js.exposeJs) {
        const json = JSON.stringify(localesObject);
        localesInit = `var i18n = ${ json }; var s = i18n[i18n.default];`;
      }
    }
  }
  
  if (html.path) {
    if (html.mustache && html.mustache.tags) mustache.tags = html.mustache.tags;
    const htmlPath = pjoin(src, html.path);
    if (inDevelopment) ensureDir(htmlPath);
    if (exists(htmlPath) && isDir(htmlPath)) {
      if (html.pages) {
        const pagesKeys = keys(html.pages);
        if (pagesKeys.length) {
          promises.push(new Promise((ok, no) => {
            try {
              pagesKeys.forEach(pageName => {
                const page = html.pages[pageName];
                const pageSrcPath = path.resolve(htmlPath, page.path);
                const pageDistPath = pjoin(dist, `${pageName}.html`);

                if (inDevelopment) {
                  const layoutPath = pjoin(htmlPath, page.layout);
                  if (page.layout && !existsFile(layoutPath)) {
                    write(layoutPath, DEFAULT_LAYOUT_HTML);
                  }
                }

                const layoutHtml = page.layout ? read(pjoin(htmlPath, page.layout)) : DEFAULT_LAYOUT_HTML;
                const _vars = Object.assign(
                  {}, 
                  page.vars, 
                  localesObject ? localesObject[localesObject.default] : {}
                );

                if (!existsFile(pageSrcPath)) {
                  if (inDevelopment) {
                    write(pageSrcPath, `<h1>Stub ${pageName}.html</h1>`);
                  } else {
                    console.warn(`page: "${pageName}" could not be compiled: "${pageSrcPath}" was not found.`);
                    return;
                  }
                }

                const _elements = Object.assign(
                  {},
                  page.elements,
                  { content: page.path }
                );

                Object.keys(_elements).map(key => {
                  const elmPath = pjoin(htmlPath, _elements[key]);
                  _elements[key] = read(elmPath);
                });

                const compiledHtml = render(layoutHtml, _vars, _elements);
                const minifiedHtml = htmlMinify(
                  inProduction ? compiledHtml : htmlBeautify(compiledHtml, html.beautifyOptions),
                  inProduction ? html.minifyOptions : null
                );
                write(pageDistPath, minifiedHtml);
              });
              ok();
            } catch(e) {
              no(e);
            }
          }));
        }
      }
    }
  }

  if (img.path) {
    const imgPath = pjoin(src, img.path);
    if (inDevelopment) ensureDir(imgPath);
    if (exists(imgPath) && isDir(imgPath)) {
      if (ls(imgPath).length) {
        const distImgPath = pjoin(dist, img.path);
        ensureDir(distImgPath);
        promises.push(new Promise((ok, no) => {
          ncp(imgPath, distImgPath, (error) => {
            if (error) return no(error);
            ok();
          });
        }));
      }
    } 
  }

  if (js.path) {
    const jsPath = pjoin(src, js.path);
    const jsIndexPath = pjoin(jsPath, js.index);
    if (inDevelopment) {
      ensureDir(jsPath);
      if (!exists(jsIndexPath) || !isFile(jsIndexPath)) {
        write(jsIndexPath, `console.log('Stub index.js')`);
      }
    }
    const distJsPath = pjoin(dist, 'js');
    ensureDir(distJsPath);
    const distJsFilePath = pjoin(distJsPath, js.filename);
    if (exists(jsPath) && isDir(jsPath)) {
      if (exists(jsIndexPath) && isFile(jsIndexPath)) {
        const _paths = js.paths.map(path => pjoin(jsPath, path));
        _paths.unshift(jsPath);
        const _banner = [ localesInit ];
        js.libs
        .map(path => {
          const libPath = pjoin(jsPath, path);
          return read(libPath);
        })
        .forEach(libJs => _banner.push(libJs));

        promises.push(new Promise((ok, no) => {
          rollup({
            input: jsIndexPath,
            // sourceMap: env === 'development',
            plugins: [
              rollupPluginIncludePaths({
                include: {},
                paths: _paths,
                extensions: ['.js']
              }),
              rollupPluginBuble(),
              (inProduction && rollupPluginUglify(js.uglifyOptions))
            ]
          })
          .then((bundle) => {
            bundle.write({
              file: distJsFilePath,
              format: 'es',
              banner: _banner.join('\n'),
            });
            ok();
          })
          .catch(no);
        }));
      } else {
        console.warn('Could not compile js, index.js not found.');
      }
    }
  }

  if (less.path) {
    const lessPath = pjoin(src, less.path);
    const lessIndexPath = pjoin(lessPath, less.index);
    if (inDevelopment) {
      ensureDir(lessPath);
      if (!exists(lessIndexPath) || !isFile(lessIndexPath)) {
        write(lessIndexPath, `// Stub index.less\n\n* {background: #009688;}`);
      }
    }
    if (exists(lessPath) && isDir(lessPath)) {
      if (exists(lessIndexPath) && isFile(lessIndexPath)) {
        const lessIndexContent = read(lessIndexPath);
        const _options = Object.assign(
          {},
          less.options,
          { paths: [ lessPath ] }
        );
        less.options.paths.forEach(path => _options.paths.push(path));
        promises.push(new Promise((ok, no) => {
          lessc.render(lessIndexContent, _options, (error, output) => {
            if (error) return no(error);
            const distCssPath = pjoin(dist, 'css');
            ensureDir(distCssPath);
            write(pjoin(distCssPath, less.filename), output.css);
            ok();
          })
        }));
      }
    }
  }

  if (svg.path) {
    const svgPath = pjoin(src, svg.path);
    if (inDevelopment) ensureDir(svgPath);
    if (exists(svgPath) && isDir(svgPath)) {
      if (ls(svgPath).length) {
        const distSvgPath = pjoin(dist, svg.path);
        ensureDir(distSvgPath);
        promises.push(new Promise((ok, no) => {
          ncp(svgPath, distSvgPath, (error) => {
            if (error) return no(error);
            ok();
          });
        }));
      }
    } 
  }

  if (video.path) {
    const videoPath = pjoin(src, video.path);
    if (inDevelopment) ensureDir(videoPath);
    if (exists(videoPath) && isDir(videoPath)) {
      if (ls(videoPath).length) {
        const distVideoPath = pjoin(dist, video.path);
        ensureDir(distVideoPath);
        promises.push(new Promise((ok, no) => {
          ncp(videoPath, distVideoPath, (error) => {
            if (error) return no(error);
            ok();
          });
        }));
      }
    } 
  }

  return Promise.all(promises);
}

module.exports = StaticWebDevEnv;