'use strict';
var assert = require('assert');
var objectAssign = require('object-assign');
var minimatch = require('minimatch');
var path = require('path');

var preloadDirective = {
  '.js': 'script',
  '.css': 'style',
  '.woff': 'font',
  '.woff2': 'font',
  '.jpeg': 'image',
  '.jpg': 'image',
  '.gif': 'image',
  '.png': 'image',
  '.svg': 'image'
};

function ResourceHintWebpackPlugin (options) {
  assert.equal(options, undefined, 'The ResourceHintWebpackPlugin does not accept any options');

  this.publicPath = null;
}

function createResourceHintTag (url, ResourceHintType, htmlWebpackPluginOptions) {
  return {
    tagName: 'link',
    selfClosingTag: !!htmlWebpackPluginOptions.xhtml,
    attributes: {
      rel: ResourceHintType,
      href: url
    }
  };
}

/**
 * The as attribute's value must be a valid request destination.
 * If the provided value is omitted, the value is initialized to the empty string.
 *
 * @see https://w3c.github.io/preload/#link-element-interface-extensions
 * @param {[type]} tag [description]
 */
function addPreloadType (tag) {
  var ext = path.extname(tag.attributes.href);
  if (preloadDirective[ext]) {
    tag.attributes.as = preloadDirective[ext];
  }
  return tag;
}

ResourceHintWebpackPlugin.prototype.apply = function (compiler) {
  var self = this;
  // Hook into the html-webpack-plugin processing
  compiler.plugin('compilation', function (compilation) {
    compilation.plugin('html-webpack-plugin-before-html-processing', function (htmlPluginData, callback) {
      // html-webpack-plugin makes the publicPath available in this phase, but
      // not in the next one, so we capture it here. if not empty, we can
      // count on it having a trailing slash.
      self.publicPath = htmlPluginData.assets.publicPath;
      callback(null, htmlPluginData);
    });

    compilation.plugin('html-webpack-plugin-alter-asset-tags', function (htmlPluginData, callback) {
      var htmlWebpackPluginOptions = htmlPluginData.plugin.options;
      var pluginData = objectAssign({}, htmlPluginData);
      var assets = compilation.getStats().compilation.assets;

      var tags = {
        prefetch: [],
        // https://w3c.github.io/preload/#link-type-preload
        preload: []
      };
      // Create Resource tags
      Object.keys(tags).forEach(function (ResourceHintType) {
        var filters;
        if (htmlWebpackPluginOptions[ResourceHintType] === false) {
          return;
        }
        // Add all files by default:
        if (htmlWebpackPluginOptions[ResourceHintType] === undefined) {
          filters = ['**/*.*'];
        } else {
          filters = [].concat(htmlWebpackPluginOptions[ResourceHintType]);
        }
        filters.forEach(function (filter) {
          if (filter.indexOf('*') !== -1) {
            Array.prototype.push.apply(tags[ResourceHintType], self.addResourceHintTags(
              ResourceHintType,
              filter,
              htmlWebpackPluginOptions,
              assets
            ));
          } else {
            tags[ResourceHintType].push(createResourceHintTag(filter, ResourceHintType, htmlWebpackPluginOptions));
          }
        });
      });
      // Add all Resource tags to the head
      Array.prototype.push.apply(pluginData.head, tags.preload.map(addPreloadType));
      Array.prototype.push.apply(pluginData.head, tags.prefetch);
      callback(null, pluginData);
    });
  });
};

/**
 * Adds Resource hint tags
 */
ResourceHintWebpackPlugin.prototype.addResourceHintTags = function (ResourceHintType, filter, htmlWebpackPluginOptions, assets) {
  var self = this;
  return Object.keys(assets)
    .filter(minimatch.filter(filter))
    .map(function (assetFile) {
      return createResourceHintTag(self.publicPath + assetFile, ResourceHintType, htmlWebpackPluginOptions);
    });
};

module.exports = ResourceHintWebpackPlugin;
