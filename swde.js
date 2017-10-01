/*!
* swde
* Copyright(c) 2017 Carlos Ascari Gutierrez Hermosillo
* MIT License
*/

const async = require('async');
const fs = require('fs-extra');
const htmlBeautify = require('js-beautify').html;
const htmlMinify = require('html-minifier').minify;
const mustache = require('mustache');
const lessc = require('less');
const ncp = require('ncp');
const path = require('path');
const rollup = require('rollup').rollup;
const rollupPluginBuble = require('rollup-plugin-buble');
const rollupPluginIncludePaths = require('rollup-plugin-includepaths');
const rollupPluginUglify = require('rollup-plugin-uglify');
const imagemin = require('imagemin');
const imageminJpegtran = require('imagemin-jpegtran');
const imageminPngcrush = require('imagemin-pngcrush');
const utils = require('./utils');
const defaults = require('./defaults');

const { assign, keys } = Object;
const {
  basename,
  ensureDir,
  exists,
  existsDir,
  existsFile,
  isDir,
  isFile,
  isObject,
  ls,
  mkdir,
  pjoin,
  read,
  render,
  write,
} = utils;
const {
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
} = defaults;

/**
* Sanity check for options object. Sets defaults.
* @param {Object} options
* @return {Object} An object with all options set.
*/
const parseOptions = (options) => {
  let { dist=DEFAULT_DIST_PATH, src=DEFAULT_SRC_PATH } = options;
  const {
  env=(process.env.NODE_ENV || 'development'),
  font=false,
  html=false,
  i18n=false,
  img=false,
  js=false,
  less=false,
  svg=false,
  video=false,
  } = options;

  const fontEnabled  = !!font;
  const htmlEnabled  = !!html;
  const i18nEnabled  = !!i18n;
  const imgEnabled   = !!img;
  const jsEnabled    = !!js;
  const lessEnabled  = !!less;
  const svgEnabled   = !!svg;
  const videoEnabled = !!video;

  src = path.resolve(src);
  dist = path.resolve(dist);

  if (fontEnabled) {
    if (!isObject(font)) font = DEFAULT_FONT;
    if (!font.path) font.path = DEFAULT_FONT.path;
  }

  if (htmlEnabled) {
    if (!isObject(html)) html = DEFAULT_HTML;
    if (!html.path) html.path = DEFAULT_HTML.path;
    if (!html.minifyOptions) html.minifyOptions = DEFAULT_HTML.minifyOptions;
    if (!html.beautifyOptions) html.beautifyOptions = DEFAULT_HTML.beautifyOptions;
    if (!html.pages) html.pages = DEFAULT_HTML.pages;
    if (!html.mustache) html.mustache = DEFAULT_HTML.mustache;
  }

  if (i18nEnabled) {
    if (!isObject(i18n)) i18n = DEFAULT_I18N;
    if (!i18n.path) i18n.path = DEFAULT_I18N.path;
    if (!i18n.exposeJs) i18n.exposeJs = DEFAULT_I18N.exposeJs;
    if (!i18n.defaultLocale) i18n.defaultLocale = DEFAULT_I18N.defaultLocale;
  }

  if (imgEnabled) {
    if (!isObject(img)) img = DEFAULT_IMG;
    if (!img.path) img.path = DEFAULT_IMG.path;
  }

  if (jsEnabled) {
    if (!isObject(js)) js = DEFAULT_JS;
    if (!js.path) js.path = DEFAULT_JS.path;
    if (!js.index) js.index = DEFAULT_JS.index;
    if (!js.filename) js.filename = DEFAULT_JS.filename;
    if (!js.paths) js.paths = DEFAULT_JS.paths;
    if (!js.libs) js.libs = DEFAULT_JS.libs;
    if (!js.uglifyOptions) js.uglifyOptions = DEFAULT_JS.uglifyOptions;
  }

  if (lessEnabled) {
    if (!isObject(less)) less = DEFAULT_LESS;
    if (!less.path) less.path = DEFAULT_LESS.path;
    if (!less.index) less.index = DEFAULT_LESS.index;
    if (less.compress === undefined) less.compress = env === 'production';
    if (!less.filename) less.filename = DEFAULT_LESS.filename;
    if (!less.options) less.options = DEFAULT_LESS.options;
    if (!less.paths) less.paths = [ pjoin(src, less.path) ];
  }

  if (svgEnabled) {
    if (!isObject(svg)) svg = DEFAULT_SVG;
    if (!svg.path) svg.path = DEFAULT_SVG.path;
  }

  if (videoEnabled) {
    if (!isObject(video)) video = DEFAULT_VIDEO;
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
  const inProduction = env === 'production';
  const inDevelopment = env === 'development';
  const vars = {}; // for html
  const locales = {}; // for i18n

  if (!exists(src) || !isDir(src)) {
    if (env === 'development') {
      ensureDir(src);
    } else {
      throw new Error(`Source folder does not exist: "${ src }"`);
    }
  }

  // Build

  return new Promise((ok, no) => {
    async.series(
      [
        // font
        (next) => {
          if (!font) return next();
          const srcFontPath = pjoin(src, font.path);
          const distFontPath = pjoin(dist, font.path);
          if (inDevelopment) ensureDir(srcFontPath);
          if (!existsDir(srcFontPath)) return next();
          if (!ls(srcFontPath).length) return next();
          ensureDir(distFontPath);
          ncp(srcFontPath, distFontPath, next);
        },
        // i18n
        (next) => {
          if (!i18n) return next();
          const srcI18nPath = pjoin(src, i18n.path);
          if (inDevelopment) {
            ensureDir(srcI18nPath);
            const defaultLocaleFilename = pjoin(srcI18nPath, `${ i18n.defaultLocale }.js`);
            if (!existsFile(defaultLocaleFilename)) write(defaultLocaleFilename, `module.exports = {\n\n};`);
          }
          if (!(exists(srcI18nPath) && isDir(srcI18nPath))) return next();
          const i18nFiles = ls(srcI18nPath).map((path) => pjoin(srcI18nPath, path)).filter(path => isFile(path));
          const i18nLocaleFilenames = i18nFiles.map(path => basename(path))
          locales.object = { default: js.defaultLocale };
          i18nLocaleFilenames.forEach(localeFilename => {
            locales.object[localeFilename.replace('.js', '')] = require(pjoin(srcI18nPath, localeFilename));
          });

          vars.BUNDLE_I18N_JSON = JSON.stringify(locales.object, null, inDevelopment ? 4 : 0);

          if (js.exposeJs) {
            locales.init = `var i18n = (${ vars.BUNDLE_I18N_JSON }); var s = i18n[i18n.default];`;
          }
          next();
        },
        // img
        (next) => {
          if (!img) return next();
          const srcImgPath = pjoin(src, img.srcPath || img.path);
          const distImgPath = pjoin(dist, img.distPath || img.path);
          if (inDevelopment) ensureDir(srcImgPath);
          if (!(exists(srcImgPath) && isDir(srcImgPath))) return next();
          if (!ls(srcImgPath).length) return next();          
          ensureDir(distImgPath);
          ncp(srcImgPath, distImgPath, (error) => {
            if (error) return next(error);
            if (!img.minify) return next();
            const extensions = ['jpg', 'png'];
            const uniques = {};
            const dirs = ls(distImgPath, true).map(path.dirname).filter(p => uniques[p] ? 0 : (uniques[p] = 1));
            async.eachSeries(
              dirs,
              (dir, next) => {
              imagemin([`${dir}/*.{${ extensions }}`], dir, {
                plugins: [ imageminJpegtran(), imageminPngcrush({reduce: true}) ]
              })
              .then(files => next())
              .catch(next);
              },
              next
            );
          });
        },
        // svg
        (next) => {
          if (!svg) return next();
          const srcSvgPath = pjoin(src, svg.path);
          const distSvgPath = pjoin(dist, svg.path);
          if (inDevelopment) ensureDir(srcSvgPath);
          if (!(exists(srcSvgPath) && isDir(srcSvgPath))) return next();
          if (!ls(srcSvgPath).length) return next();
          ensureDir(distSvgPath);
          ncp(srcSvgPath, distSvgPath, next);
        },
        // js
        (next) => {
          if (!js) return next();
          const srcJsPath = pjoin(src, js.path);
          const srcJsIndexPath = pjoin(srcJsPath, js.index);
          const distJsPath = pjoin(dist, 'js');
          const distJsFilePath = pjoin(distJsPath, js.filename);
          if (inDevelopment) {
            ensureDir(srcJsPath);
            if (!exists(srcJsIndexPath) || !isFile(srcJsIndexPath)) {
              write(srcJsIndexPath, `console.log('Stub index.js')`);
            }
          }
          if (!(exists(srcJsPath) && isDir(srcJsPath))) return next();
          if (!(exists(srcJsIndexPath) && isFile(srcJsIndexPath))) return next(new Error('Could not compile js, index.js was not found'));
          if (!js.noFile) ensureDir(distJsPath);
          const includePaths = js.paths.map(path => pjoin(srcJsPath, path));
          includePaths.unshift(srcJsPath);
          const jsBanner = [];
          if (locales.init) jsBanner.push(locales.init);
          js.libs
          .map(path => read(pjoin(srcJsPath, path)))
          .forEach(libJs => jsBanner.push(libJs));

          // Plugins for rollup
          const activeRollupPlugins = [];

          activeRollupPlugins.push(
            rollupPluginIncludePaths({
              include: {},
              paths: includePaths,
              extensions: ['.js']
            })
          );

          if (!js.noBuble) {
            activeRollupPlugins.push(
              rollupPluginBuble()
            );
          }

          if (inProduction) {
            activeRollupPlugins.push(
              rollupPluginUglify(js.uglifyOptions)
            );
          }

          rollup({
          input: srcJsIndexPath,
          // sourceMap: env === 'development',
          plugins: activeRollupPlugins
          })
          .then((bundle) => {
          if (!js.noFile) {
            bundle.write({
              file: distJsFilePath,
              format: 'es',
              banner: jsBanner.join('\n'),
            });
          }
          bundle.generate({
            format: 'es'
          })
          .then(({ code, map }) => {
            vars.BUNDLE_JS_CODE = code;
            vars.BUNDLE_JS_PATH = `js/${ js.filename }`;
            next();
          })
          .catch(next);
          })
          .catch(next);
        },
        // less
        (next) => {
          if (!less) return next();
          const srcLessPath = pjoin(src, less.path);
          const srcLessIndexPath = pjoin(srcLessPath, less.index);
          const distCssPath = pjoin(dist, 'css');
          const distCssFilePath = pjoin(distCssPath, less.filename);
          if (inDevelopment) {
            ensureDir(srcLessPath);
            if (!exists(srcLessIndexPath) || !isFile(srcLessIndexPath)) {
              write(srcLessIndexPath, `// Stub index.less\n\n* {background: #009688;}`);
            }
          }
          if (!(exists(srcLessPath) && isDir(srcLessPath))) return next();
          if (!(exists(srcLessIndexPath) && isFile(srcLessIndexPath))) return next();
          const lessIndexContent = read(srcLessIndexPath);
          const lessOptions = Object.assign({}, less.options, { paths: [ srcLessPath ] });
          less.options.paths.forEach(path => lessOptions.paths.push(path));
          lessc.render(lessIndexContent, lessOptions, (error, output) => {
          if (error) return no(error);
          if (!less.noFile) {
            ensureDir(distCssPath);
            write(distCssFilePath, output.css);
          }
          vars.BUNDLE_CSS_CODE = output.css;
          vars.BUNDLE_CSS_PATH = `css/${ less.filename }`;
          next();
          });
        },
        // video
        (next) => {
          if (!video) return next();
          const srcVideoPath = pjoin(src, video.path);
          const distVideoPath = pjoin(dist, video.path);
          if (inDevelopment) ensureDir(srcVideoPath);
          if (!(exists(srcVideoPath) && isDir(srcVideoPath))) return next();
          if (!ls(srcVideoPath).length) return next();
          ensureDir(distVideoPath);
          ncp(srcVideoPath, distVideoPath, next);
        },
        // html
        (next) => {
          if (!html) return next();
          if (html.mustache && html.mustache.tags) mustache.tags = html.mustache.tags;
          const srcHtmlPath = pjoin(src, html.path);
          if (inDevelopment) ensureDir(srcHtmlPath);
          if (!(exists(srcHtmlPath) && isDir(srcHtmlPath))) return next();
          if (!html.pages) return next();
          const pagesKeys = keys(html.pages);
          if (!pagesKeys.length) return next();
          try {
          pagesKeys.forEach(pageName => {
            const page = html.pages[pageName];
            const pageSrcPath = path.resolve(srcHtmlPath, page.path);
            const pageDistPath = pjoin(dist, `${pageName}.html`);
            if (inDevelopment) {
              const layoutPath = pjoin(srcHtmlPath, page.layout);
              if (page.layout && !existsFile(layoutPath)) {
                write(layoutPath, DEFAULT_LAYOUT_HTML);
              }
            }
            const layoutHtml = page.layout ? read(pjoin(srcHtmlPath, page.layout)) : DEFAULT_LAYOUT_HTML;
            const _vars = Object.assign(
              {},
              vars,
              page.vars, 
              locales.object ? locales.object[locales.object.default] : {}
            );

            if (!existsFile(pageSrcPath)) {
              if (inDevelopment) {
                write(pageSrcPath, `<h1>Stub ${pageName}.html</h1>`);
              } else {
                console.warn(`page: "${pageName}" could not be compiled: "${pageSrcPath}" was not found.`);
                return 
              }
            }

            const _elements = Object.assign({}, page.elements, { content: page.path });

            Object.keys(_elements).map(key => {
              const elmPath = pjoin(srcHtmlPath, _elements[key]);
              _elements[key] = read(elmPath);
            });

            const compiledHtml = render(layoutHtml, _vars, _elements);
            const minifiedHtml = htmlMinify(
              inProduction ? compiledHtml : htmlBeautify(compiledHtml),
              inProduction ? html.minifyOptions : null
            );
            const opts = {
              doctype: 'html5',
              hideComments: false, //  multi word options can use a hyphen or "camel case" 
              indent: true
            }
            write(pageDistPath, minifiedHtml);
            next();
          });
          } catch(e) {
          next(e);
          }            
        },
      ],
      (error) => {
        if (error) return no(error);
        ok();
      }
    );
  });
}

module.exports = StaticWebDevEnv;