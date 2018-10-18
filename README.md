# [swde]()

> Static Web Development Eviroment

*swde* will scaffold a flexible enviroment for developing static web pages or components.

- Mustache is used to render HTML
- LESS is used to render CSS
- Rollup + Buble is used to render es6 to es5 JavaScript
- i18n Support
    + exposed in clientside via a `i18n` global object.
    + exposed in mustache via locals/vars.
- Minifies html, js, css, svg, png, jpg & fonts
- Only scaffolds in development enviroments, only minifies in production enviroments

Used to create:
  
  - Static web pages
  - Web components *(custom, riotjs, etc)*
  - Libraries
  - Cordova applications *(before using device plugins)*

## Install

`npm i @ascari/swde --save`

## Usage

Create a `build.js` file

```
const swde = require('swde');

swde({
  src: './src',
  dist: './dist',
  html: {
    output: {
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
.then(() => console.log('Build done.'))
.catch(error => console.log(error));
```

**Pro-trip**

Use [nodemon]() on build.js to trigger a rebuild when changing files. 
Use [http-server]() or similar in the `dist` folder to see the result.
Use a live-reload tool to detect file changes and refresh the page.





# Swde Configuration

swde comes as a single function that takes either a configuration object or an array of configuration objects to process async in series.

```
const swde = require('swde');
const config = { ... };
swde(config)
.then(() => console.log("Done!"))
.catch(error => console.log("Error:", error));
```

> The Configuration Object requires two path properties and at least 1 module property to be set in order to execute.

```
const config = {
  src: 'path/to/source/folder',
  dist: 'path/to/output/folder',
  <some module>: { module options... }
};
swde(config)
.then(() => console.log("Done!"))
.catch(error => console.log("Error:", error));
```

### **src**
The `src` property specifies where the source files for the current project can be found.
It is determined as the root *Working Source Directory*, and all modules process source files relative to this path.

Defaults to: **./src**

### **dist**
The `dist` property specifies where the output files for the current project can be found.
It is determined as the *Working Dist Directory*, and all modules place their output relative to this path.

Defaults to: **./dist**

#### Modules

Modules are the backbone of swde and are chosen by including their name or namespace in the Configuration Object.

Currently there are 12 modules:

  - i18n    - Locales Module, exposes data in js and html modules.
  - js      - Transcompiles between es5 and es6, Minifies JavaScript
  - less    - Autoprifixes; better than plain css
  - img     - Optimizes & Copies &/or exposes in html module as data-uri
  - font    - Optimizes font, scaffolds web fonts & css. *WIP*
  - svg     - Optimizes & Copies &/or exposes in html module
  - video   - Copies *WIP*
  - audio   - Copies *WIP*
  - html    - Uses Mustache template engine, Minifies Html, beutifies during dev
  - copy    - General-purpose file/folder copying
  - move    - General-purpose file/folder moving
  - delete  - General-purpose file/folder removal

```
const config = {
  src: 'path/to/source/folder',
  dist: 'path/to/output/folder',
  js: {
    path: 'js',
    distPath: '.',
    ...
  }
};
swde(config)
.then(() => console.log("Done!"))
.catch(error => console.log("Error:", error));
```

All module properties must have a `Object` value or a `Boolean` **true** in order to activate the module. Each module has its own set of options or configuration, however, currently all modules have at least a `path` property that defines a working path relative to the `src` & `dist` paths, in order to work with source and output files respectively. 

The `path` property defines the folder paths for both the Working Source Directory and Working Dist Directory destinations. In order to specify different paths, you can use the `srcPath` and `distPath` properties to further specify the paths the module will work with.

In the example shown above, The source folder for javascript files will be: `<src>/js/` and the output location will be `<dist>/`.




# Modules

### Js

The `js` module places your JavaScript files under one house.

- A single root javascript file is chosen as index.
- `import` & `export` are used
- Uses rollup js bundler, transcompiles between es5 & es6 with buble
- Automatically uses minifiers during production enviroments
- Scaffolds source folders & files when missing, during development enviroments
- Creates a single bundle file or exposes code in global `variables` object, where it is used in the `html` module to allow you to inline the output in a html file that is created.

#### Namespace Options & defaults

```
swde({
  js: {
    path: 'js',
    index: 'index.js',
    filename: 'bundle.js',
    libs: [],
    include: [],
    uglifyOptions: { ... },
  }
})
```

**path** *String*
The `js` module option requires a working `path` relative to the `src` & `dist` options. By default the path is set to **"js"**, so, the working paths are:

  - `<src>/js/`  For source JavaScript files
  - `<dist>/js/` For output files

If you want to specify a different `dist` path from a `src` path, you can use the `distPath` & `srcPath` options, respectively.

```
swde({
  js: {
    path: 'js',
    distPath: '.'
    ...
  }
})
```
The working paths for the previous example where `distPath` is specified is:

  - `<src>/js/`  For source JavaScript files
  - `<dist>/`    For output files


**filename** *String*
The `filename` module option is required when the `noFile` option is false. This specifies what the filename of the compiled JavaScript will be. By default the name of the file is **"bundle.js"**

The `dist` options, as well as the `js.path` or `js.distPath` options determine the overall path of the JavaScript bundle that is created. *filepath is:*`<dist>/<js.distPath>/<js.filename>`

**libs** *Array<String>*
The `libs` module option is used to specify javascript files that will not be processed, however they will be concated at the beggining of the bundle that is created.
Used to include files like a minified jquery that does not require processing, but should be included within the JavaScript bundle that is created.
All paths are relative to the `src` or `srcPath` module options.

**include** *Array<String>*
The `include` module option is used to specify other paths to search for JavaScript files for when using the `import` keyword in your project.
**PATHS ARE NOT RELATIVE MUST BE FULL PATH**

**uglifyOptions** *Object*
Options fed directly to UglifyJs the minifier used by swde.

...

# Examples

## A Complex JavaScript-only library or application

```
require('swde')({
  src: './src',
  dist: '.',
  env: 'production',
  js: {
    path: '.',
    filename: 'complex.min.js',
    include: [
      '/path/to/third-party/libs',
      '/path/to/custom/libs'
    ]
  }
})
.then(() => console.log('Done!'))
.catch(e => console.log(e))
```

This example takes multiple javascript files from various locations to build a single minified javascript file.

- Source files are found in `./src`
- Index file is found as `./src/index.js`
- Destination is set to root directory `./complex.min.js`

The project folder will loook like the following after a build:

```
  ./src/index.js
       /other.js
       /other-file.js
  ./complex.min.js
  ./build.js
```

## A Custom component

```
require('swde')({
  src: './src',
  dist: './dist',
  env: 'production',
  js: {
    path: 'js',
    filename: 'component.min.js',
  },
  less: {
    path: 'less',
    filename: 'component.min.css',
  },
  html: {
    path: 'html',
    distPath: '.',
    output: {
      component: {
        path: 'index.html',
        vars: {
          name: 'ComponentName'
        },
        elements: {
          button: 'elements/button.html',
          textbox: 'elements/textbox.html',
        }
      },
      index: {
        path: 'example.html'
      },
    }
  }
})
.then(() => console.log('Done!'))
.catch(e => console.log(e))
```

This example takes js, less and html files and outputs a component in html, javascript and css, as well as a example page. This project will allow you to create your own re-usable components.

The project folder will loook like the following after a build:

```
  ./src
      /js
          /index.js
      /less
          /index.less
      /html
          /index.html
          /example.html
  ./dist
      /index.html
      /component.html
      /component.min.js
      /component.min.css
  ./build.js
```

## License

MIT