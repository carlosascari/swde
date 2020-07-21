/*!
* swde
* Copyright(c) 2017-2020 Carlos Ascari Gutierrez Hermosillo
* MIT License
*/

module.exports = {
  path: 'html',
  mustache: {
    tags: [ '{{', '}}' ]
  },
  layout: undefined,
  defaultExtension: 'html',
  stubLayoutContent: `
    <!DOCTYPE html>
    <html lang='en'>
    <head>
      <title>{{ pageName }}</title>
      <meta charset='utf-8'>
      <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
      <link rel='icon' href='favicon.ico'>
      <link rel='stylesheet' type='text/css' href='{{{ cssFilename }}}'>
    </head>
    <body>
      {{> content}} 
      <script type='text/javascript' src='{{{ jsFilename }}}'></script>
    </body>
    </html>
  `.trim().replace(/^ {6}/mg, ''),
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
};