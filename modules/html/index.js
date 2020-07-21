/*!
* swde
* Copyright(c) 2017-2020 Carlos Ascari Gutierrez Hermosillo
* MIT License
*/

const htmlBeautify = require('js-beautify').html;
const htmlMinify = require('html-minifier').minify;
const mustache = require('mustache');
const Module = require('../../module.js');
const utils = require('../../utils');
const defaults = require('./defaults');

const { assign, keys } = Object;
const {
  ensureDir, exists, existsFile, 
  isDir, isObject, pjoin, presolve, 
  read, render, write
} = utils;

// Backup default mustache tags
const originalMustacheTags = mustache.tags.slice();

// Stub html when auto-creating html page
const stubHtml = read(presolve(__dirname, 'stub.html'));

/**
* HTML Processor. Build, Minify & Beutify, plus audit
* @class Html
*/
class Html extends Module {
  
  /**
  * @contrutor
  * @param {Object} options
  */
  constructor(options) {
    super('html', options, defaults, ['path', 'mustache', 'beautify']);

    // Assert `defaultExtension` namespace as a valid String
    if (!options.defaultExtension) options.defaultExtension = defaults.defaultExtension;

    // Apply defaults to required options
    if (!options.output) options.output = false;

    // Assert `mustache` namespace as a Object
    if (!isObject(options.mustache)) options.mustache = defaults.mustache;

    // Test if beutification is enabled
    if (options.beautify) {
      // Assert `beautify` namespace as a Object
      if (!isObject(options.beautify)) options.beautify = defaults.beautify;
    }

    // Assert default layout
    if (!options.layout) options.layout = false;

    // Test if minification is enabled
    if (options.minify) {
      // Assert `minify` namespace as a Object
      if (!isObject(options.minify)) options.minify = defaults.minify;
    }

    // Verify `output` namespace, file options
    if (isObject(options.output)) {
      if (!keys(options.output).length) {
        options.output = false;
      } else {

        // Determine default layout if any
        // options.defaultLayout = options.layout ? pjoin(options.srcPath, options.layout): null;

        keys(options.output).forEach(pageName => {
          const page = options.output[pageName];
          if (!page.path && !page.srcPath) {
            // console.warn(`'swde-html: output[${pageName}] is missing path && srcPath, using ${pageName}.${options.defaultExtension} as srcPath`)
            page.srcPath = `${pageName}.${options.defaultExtension}`;
          }
          if (!page.path && !page.distPath) {
            // console.warn(`'swde-html: output[${pageName}] is missing path && distPath, using ${pageName}.${options.defaultExtension} as distPath`)
            page.distPath = `${pageName}.${options.defaultExtension}`;
          }
          // if (!page.path) throw new Error(`Invalid option: path no defined for "output.${ pageName }" option.`)
          if (!page.srcPath) page.srcPath = page.path;
          if (!page.distPath) page.distPath = page.path;
          page.layout;
          page.elements;
          page.vars;
        });
      }
    }
  }

  /**
  * Start processing
  * @param {String} src
  * @param {String} dist
  * @param {String} [env]
  * @param {Object} [vars]
  * @return {Promise}
  */
  start(src, dist, env, vars) {
    const options = this.options;
    const inDevelopment = env === 'development';
    const inProduction = env === 'production';
    const { output } = options;
    
    // 1. Assert `output` option is valid
    if (!output) {
      return Promise.reject(new Error('Invalid option: "output" is empty.'));
    }

    // 2. Set mustache tags globaly
    if (options.mustache.tags) mustache.tags = options.mustache.tags;

    // 3. Resolve paths
    const srcPath = pjoin(src, options.srcPath);
    const distPath = pjoin(dist, options.distPath);

    // 4. In development, ensure `src` folder exists
    if (inDevelopment) ensureDir(srcPath);

    // 4b. Assert `src` folder exists
    if (!(exists(srcPath) && isDir(srcPath))) {
      return Promise.reject(new Error('Invalid option: "srcPath" does not exist or is not a folder.'));
    }

    // 5. Resolve default layout path
    const defaultLayoutPath = options.layout ? pjoin(srcPath, options.layout) : '';

    // 6. Get output keys
    const outputKeys = keys(output);

    // 7. Process output
    return Promise.all(
      outputKeys.map(outputKey => {
        return new Promise((ok, no) => {
          const out = output[outputKey];
          const outputSrcPath = presolve(srcPath, out.srcPath);
          const outputDistPath = pjoin(dist, out.distPath); // @todo: use presolve or pjoin..

          // 8. In development, ensure source file exists
          if (inDevelopment) {
            if (!existsFile(outputSrcPath)) {
              // write(outputSrcPath, `<h1>Stub ${ outputKey }.html</h1>`);
              write(outputSrcPath, stubHtml);
            }
          }

          // 8b. Assert source file exists
          if (!existsFile(outputSrcPath)) {
            no(new Error(`Invalid option: "${ outputKey }" could not be compiled: "${outputSrcPath}" was not found.`));
          }

          if (out.layout !== undefined) {
            if (!out.layout) {
              // ?????????????
            }
          } else {
            out.layout = options.layout;
          }

          // 9 Ensure out layout file exists, if set
          if (inDevelopment && out.layout) {
            const layoutPath = pjoin(srcPath, out.layout);
            if (!existsFile(layoutPath)) {
              // const scaffStubLayout = render(defaults.stubLayoutContent, {
              //   cssFilename: vars.html.less.filename,
              //   jsFilename: vars.html.js.filename,
              // }, { content: '{{! content}}' });
              // write(layoutPath, scaffStubLayout);
              write(layoutPath, defaults.stubLayoutContent);
            }
          }

          // 10. Determine layout html
          let layoutHtml = '';
          let noLayoutHtml = '';
          const usingLayout = (out.layout || options.layout);

          if (usingLayout) {
            if (out.layout) {
              layoutHtml = read(pjoin(srcPath, out.layout));
            } else if (options.layout) {
              layoutHtml = read(defaultLayoutPath);
            } else {
              layoutHtml = defaults.stubLayoutContent;
            }
          } else {
            // noLayoutHtml = 'NO LAYOUT HTML'//BUG??:: read(pjoin(srcPath, out.path));
            noLayoutHtml = read(pjoin(srcPath, out.path || out.srcPath));
          }

          // 11. Local view variables that will be exposed in out file
          vars.html = vars.html || {}; // @bugfix
          const _vars = Object.assign({}, vars.html, options.vars || {}, out.vars, {
            cssFilename: (vars.html.less) ? vars.html.less.filename : '',
            jsFilename: (vars.html.js) ? vars.html.js.filename: '',
          });

          // 12. Partial elements to load @todo: change content key to var
          const _elements = assign({}, options.elements || {}, out.elements, usingLayout ? { content: out.srcPath } : {});

          // 13. Load partial elements
          keys(_elements).map(elementKey => {
            const elementPath = pjoin(srcPath, _elements[elementKey]);
            try {
              _elements[elementKey] = read(elementPath);
            } catch(e) {
              if (e.code === 'ENOENT') {
                console.log('swde-html: Partial element not found: `%s` -> %s.', elementKey, elementPath)
              } else {
                no(e);
              }
            }
          });

          if (vars.html.svg) {
            assign(_elements, vars.html.svg);
          }

          // !4. Compile html
          const compiledHtml = render((usingLayout ? layoutHtml : noLayoutHtml), _vars, _elements);
          const beutifiedHtml = htmlBeautify(compiledHtml,  options.beautify);
          const minifiedHtml = htmlMinify(compiledHtml, options.minify || defaults.minify);

          // !5. Resolve output file formatting
          if (options.beautify) {
            write(outputDistPath, beutifiedHtml);
          } else if (options.minify) {
            write(outputDistPath, minifiedHtml);
          } else { // auto
            if (inDevelopment) {
              write(outputDistPath, beutifiedHtml);
            } else if (inProduction) {
              write(outputDistPath, minifiedHtml);
            } else {
              write(outputDistPath, compiledHtml);
            }
          }

          // Done
          ok();
        });
      })
    );
  }
}

module.exports = Html;
