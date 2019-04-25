/* eslint-env jasmine */
const path = require('path');
const MemoryFileSystem = require('memory-fs');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlResourceHintPlugin = require('../');

const OUTPUT_DIR = path.join(__dirname, '../dist');

const expected = '<!doctype html><html><head><meta charset="utf-8"><title>Webpack App</title><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="preload" href="main.js" as="script"><link rel="prefetch" href="main.js"></head><body><script src="main.js"></script></body></html>';

describe('HtmlResourceHintPlugin', () => {
  it('adds prefetch tags by default', (done) => {
    const compiler = webpack({
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
    }, (err, result) => {
      expect(err).toBeFalsy();
      expect(JSON.stringify(result.compilation.errors)).toBe('[]');
      const html = result.compilation.assets['index.html'].source();
      expect(html).toBe(expected);
      done();
    });
    compiler.outputFileSystem = new MemoryFileSystem();
  });
});

describe('HtmlResourceHintPlugin', () => {
  it('adds prefetch tags', (done) => {
    const compiler = webpack({
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
    }, (err, result) => {
      expect(err).toBeFalsy();
      expect(JSON.stringify(result.compilation.errors)).toBe('[]');
      const html = result.compilation.assets['index.html'].source();
      expect(html).toBe(expected);
      done();
    });
    compiler.outputFileSystem = new MemoryFileSystem();
  });
});

describe('HtmlResourceHintPlugin', () => {
  it('adds no file which do not match the filter', (done) => {
    const compiler = webpack({
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
    }, (err, result) => {
      expect(err).toBeFalsy();
      expect(JSON.stringify(result.compilation.errors)).toBe('[]');
      const html = result.compilation.assets['index.html'].source();
      expect(html.indexOf('rel="prefetch"') === -1).toBe(true);
      expect(html.indexOf('rel="preload"') === -1).toBe(true);
      done();
    });
    compiler.outputFileSystem = new MemoryFileSystem();
  });
});

describe('HtmlResourceHintPlugin', () => {
  it('allows to add fixed prefetch url', (done) => {
    const compiler = webpack({
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
    }, (err, result) => {
      expect(err).toBeFalsy();
      expect(JSON.stringify(result.compilation.errors)).toBe('[]');
      const html = result.compilation.assets['index.html'].source();
      expect(!!html.indexOf('<link rel="prefetch" href="demo.json">')).toBe(true);
      done();
    });
    compiler.outputFileSystem = new MemoryFileSystem();
  });
});

describe('HtmlResourceHintPlugin', () => {
  it('allows to add fixed preload url', (done) => {
    const compiler = webpack({
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
    }, (err, result) => {
      expect(err).toBeFalsy();
      expect(JSON.stringify(result.compilation.errors)).toBe('[]');
      const html = result.compilation.assets['index.html'].source();
      expect(!!html.indexOf('<link rel="preload" href="demo.json">')).toBe(true);
      done();
    });
    compiler.outputFileSystem = new MemoryFileSystem();
  });
});
