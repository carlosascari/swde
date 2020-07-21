# [swde-html]()

> Documentation for HTML module

# Options

## Default Options

```
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
```


