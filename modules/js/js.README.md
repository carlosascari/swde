# [swde-js]()

> Documentation for JavaScript module

# Options

## Default Options

```
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
```

## Usage

### **path**
*String*

The `path` property specifies where the source files for the current project can be found, as well as where the distributable/output files can be found relative to the global **src** & **dist** properties, respectively.

You can include the `distPath` & `srcPath` properties in case the source and output paths differ. Another way of looking at it, is that the `path` property sets `srcPath` & `distPath` to the same value, however you can use them individually instead.

*For example:* If you specify `distPath` to be `..`, which specifies the parent directory. Source files will be searched in `[WORKING SOURCE DIR]/js/` and output files will be placed in the `[WORKING SOURCE DIR]/`

Defaults to: **js**


### **noBuble**
*Boolean*

The `noBuble` property determines whether or not to use Buble to transcompile js code from es6 to es5.

Defaults to: **false**

### **libs**
*Array\<String\>*

The `libs` option is used to specify javascript files that will not be processed, however they will be concated at the beggining of the bundle that is created.

This is intended to be used to include files like a minified jQuery that does not require processing, but should be included within the JavaScript bundle that is created.

All paths are relative to the `path` or `srcPath` options.

Defaults to: **[ ]** *(Empty Array)*