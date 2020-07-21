/*!
* swde
* Copyright(c) 2017-2020 Carlos Ascari Gutierrez Hermosillo
* MIT License
*/

module.exports = {
  path: 'svg',
  exposeHtml: true,
  exposeHtmlLocaleName: 'svg',
  minify: {
    removeAttrs: {attrs: '(x-stroke|x-fill)'},
    cleanupAttrs: true,
    removeDoctype: true,
    removeXMLProcInst: true,
    removeComments: true,
    removeMetadata: true,
    removeTitle: true,
    removeDesc: true,
    removeUselessDefs: true,
    removeEditorsNSData: true,
    removeEmptyAttrs: true,
    removeHiddenElems: true,
    removeEmptyText: true,
    removeEmptyContainers: true,
    removeViewBox: false,
    cleanupEnableBackground: true,
    convertStyleToAttrs: true,
    convertColors: true,
    convertPathData: true,
    convertTransform: true,
    removeUnknownsAndDefaults: true,
    removeNonInheritableGroupAttrs: true,
    removeUselessStrokeAndFill: true,
    removeUnusedNS: true,
    cleanupIDs: true,
    cleanupNumericValues: true,
    moveElemsAttrsToGroup: true,
    moveGroupAttrsToElems: true,
    collapseGroups: true,
    removeRasterImages: false,
    mergePaths: true,
    convertShapeToPath: true,
    sortAttrs: true,
    removeDimensions: true,
  }
};