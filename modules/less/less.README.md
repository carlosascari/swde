# [swde-less]()

> Documentation for LESS module

# Options

## Default Options

```
  less: {
    path: 'less',
    distPath: 'css',
    noFile: false,
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
```