/*!
* swde
* Copyright(c) 2017-2020 Carlos Ascari Gutierrez Hermosillo
* MIT License
*/

module.exports = {};

[
  'i18n',
  'img', 'font', 'svg', 
  'video', 'audio', 
  'less', 'js',
  'html', 
  'copy', 'move', 'delete',
]
.forEach(ns => {
  module.exports[ns] = require(`./${ ns }`);
});
