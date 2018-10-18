/*!
* swde
* Copyright(c) 2017-2018 Carlos Ascari Gutierrez Hermosillo
* MIT License
*/

const fs = require('fs-extra');
const mustache = require('mustache');
const path = require('path');
const util = require('util');

const ensureDir = (path) => fs.ensureDirSync(path);
const exists = (filepath) => fs.existsSync(filepath);
const isDir = (path) => fs.statSync(path).isDirectory();
const isFile = (path) => fs.statSync(path).isFile();
const ls = (path, recursive) => recursive ? lsRecursive(path) : fs.readdirSync(path);
const mkdir = (filepath) => fs.mkdirSync(filepath);
const pjoin = function() { return path.join.apply(path, arguments) };
const presolve = function() { return path.resolve.apply(path, arguments) };
const read =  filepath => fs.readFileSync(filepath, 'utf8');
const render = (template, options, partials) => mustache.render(template, options, partials);
const write = (filepath, content) => fs.outputFileSync(filepath, content);
const existsDir = (path) => exists(path) && isDir(path);
const existsFile = (path) => exists(path) && isFile(path);
const basename = (filename) => path.basename(filename);
const lsRecursive = (targetPath) => {
  var list = [], files = fs.readdirSync(targetPath), stats;
  files.forEach(function (file) {
    stats = fs.lstatSync(path.join(targetPath, file));
    if(stats.isDirectory()) {
      list = list.concat(lsRecursive(path.join(targetPath, file)));
    } else {
      list.push(path.join(targetPath, file));
    }
  });
  return list;
}

module.exports = Object.assign(
  util,
  {
    basename,
    ensureDir,
    exists,
    existsDir,
    existsFile,
    isDir,
    isFile,
    ls,
    lsRecursive,
    mkdir,
    pjoin,
    presolve,
    read,
    render,
    write,
  }
);