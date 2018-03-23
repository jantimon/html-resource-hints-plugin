/* eslint-env jasmine */
var fs = require('fs');
var path = require('path');
var MemoryFileSystem = require('memory-fs');
var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var HtmlResourceHintPlugin = require('../');

var OUTPUT_DIR = path.join(__dirname, '../dist');

describe('HtmlResourceHintPlugin', function () {
  it('adds prefetch tags by default', function (done) {
    var expected = fs.readFileSync(path.resolve(__dirname, 'fixtures/expected.html')).toString();
    var compiler = webpack({
      entry: {
        main: path.join(__dirname, 'fixtures', 'entry.js')
      },
      output: {
        path: OUTPUT_DIR,
        filename: '[name].js'
      },
      plugins: [
        new HtmlWebpackPlugin(),
        new HtmlResourceHintPlugin()
      ]
    }, function (err, result) {
      expect(err).toBeFalsy();
      expect(JSON.stringify(result.compilation.errors)).toBe('[]');
      var html = result.compilation.assets['index.html'].source();
      expect(html).toBe(expected);
      done();
    });
    compiler.outputFileSystem = new MemoryFileSystem();
  });
});

describe('HtmlResourceHintPlugin', function () {
  it('adds prefetch tags', function (done) {
    var expected = fs.readFileSync(path.resolve(__dirname, 'fixtures/expected.html')).toString();
    var compiler = webpack({
      entry: {
        main: path.join(__dirname, 'fixtures', 'entry.js')
      },
      output: {
        path: OUTPUT_DIR,
        filename: '[name].js'
      },
      plugins: [
        new HtmlWebpackPlugin({
          prefetch: '*.js',
          preload: '*.js'
        }),
        new HtmlResourceHintPlugin()
      ]
    }, function (err, result) {
      expect(err).toBeFalsy();
      expect(JSON.stringify(result.compilation.errors)).toBe('[]');
      var html = result.compilation.assets['index.html'].source();
      expect(html).toBe(expected);
      done();
    });
    compiler.outputFileSystem = new MemoryFileSystem();
  });
});

describe('HtmlResourceHintPlugin', function () {
  it('adds no file which do not match the filter', function (done) {
    var compiler = webpack({
      entry: {
        main: path.join(__dirname, 'fixtures', 'entry.js')
      },
      output: {
        path: OUTPUT_DIR,
        filename: '[name].js'
      },
      plugins: [
        new HtmlWebpackPlugin({
          prefetch: '*.json',
          preload: false
        }),
        new HtmlResourceHintPlugin()
      ]
    }, function (err, result) {
      expect(err).toBeFalsy();
      expect(JSON.stringify(result.compilation.errors)).toBe('[]');
      var html = result.compilation.assets['index.html'].source();
      expect(html.indexOf('rel="prefetch"') === -1).toBe(true);
      expect(html.indexOf('rel="preload"') === -1).toBe(true);
      done();
    });
    compiler.outputFileSystem = new MemoryFileSystem();
  });
});

describe('HtmlResourceHintPlugin', function () {
  it('allows to add fixed prefetch url', function (done) {
    var compiler = webpack({
      entry: {
        main: path.join(__dirname, 'fixtures', 'entry.js')
      },
      output: {
        path: OUTPUT_DIR,
        filename: '[name].js'
      },
      plugins: [
        new HtmlWebpackPlugin({
          prefetch: ['demo.json']
        }),
        new HtmlResourceHintPlugin()
      ]
    }, function (err, result) {
      expect(err).toBeFalsy();
      expect(JSON.stringify(result.compilation.errors)).toBe('[]');
      var html = result.compilation.assets['index.html'].source();
      expect(!!html.indexOf('<link rel="prefetch" href="demo.json">')).toBe(true);
      done();
    });
    compiler.outputFileSystem = new MemoryFileSystem();
  });
});

describe('HtmlResourceHintPlugin', function () {
  it('allows to add fixed preload url', function (done) {
    var compiler = webpack({
      entry: {
        main: path.join(__dirname, 'fixtures', 'entry.js')
      },
      output: {
        path: OUTPUT_DIR,
        filename: '[name].js'
      },
      plugins: [
        new HtmlWebpackPlugin({
          preload: ['*.js', 'demo.json']
        }),
        new HtmlResourceHintPlugin()
      ]
    }, function (err, result) {
      expect(err).toBeFalsy();
      expect(JSON.stringify(result.compilation.errors)).toBe('[]');
      var html = result.compilation.assets['index.html'].source();
      expect(!!html.indexOf('<link rel="preload" href="demo.json">')).toBe(true);
      done();
    });
    compiler.outputFileSystem = new MemoryFileSystem();
  });
});
