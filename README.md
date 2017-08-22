# [swde]()

> Static Web Development Eviroment

*swde* will scaffold an enviroment for developing static web pages.

- Mustache is used to render HTML
- LESS is used to render CSS
- Rollup + Buble is used to render es6 to es5 JavasSript
- i18n Support
    + exposed in clientside via a `i18n` global object.
    + exposed in mustache via locals/vars.
- Src folder is scaffolded during development it will create the following:
```
  src/
    font/
    html/
      (will stub missing pages defined in `options.pages`)
    i18n/
      en.js
    img/
    js/
      index.less
    less/
      index.less
    svg/
    video/
```

## Install

`npm i @ascari/swde --save`

## Usage

```
const swde = require('swde');

swde({
  src: './src',
  dist: './dist',
  html: {
    pages: {
      index: { // index.html
        path: 'home.html',
        vars: {
          pageName: 'Home'
        },
        elements: {
          header: 'elements/header.html'
        }
      }
    },
  }
})
.then(() => {
  console.log('Build done.');
})
.catch((error) => console.log(error));
```

## options

### DEFAULT OPTIONS

```
const swdeDefaultOptions = {
  dist: './dist',
  env: process.env.NODE_ENV || 'development',
  font: {
    path: 'font'
  },
  html: {
    path: 'html',
    beautifyOptions: {
      indent_size: 2,
      preserve_newlines: false
    },
    minifyOptions: {
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
  i18n: {
    path: 'i18n',
    exposeJs: true,
    defaultLocale: 'en',
  },
  img: {
    path: 'img'
  },
  js: {
    path: 'js',
    index: 'index.js',
    filename: 'bundle.js',
    libs: [],
    paths: [],
    uglifyOptions: {
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
    path: 'less',
    index: 'index.less',
    filename: 'bundle.css',
    plugins: [
      new (require('less-plugin-autoprefix'))({
        browsers: ['last 4 versions']
      })
    ],
  },
  src: './src',
  svg: {
    path: 'svg'
  },
  video: {
    path: 'video'
  },
};
```

## License

MIT