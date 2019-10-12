'use strict';
const assert = require('assert');
const objectAssign = require('object-assign');
const minimatch = require('minimatch');
const path = require('path');

const preloadDirective = {
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

// By default all files are prefetched and preload
const defaultFilter = ['**/*.*'];

class ResourceHintWebpackPlugin {
  constructor (options) {
    assert.equal(options, undefined, 'The ResourceHintWebpackPlugin does not accept any options');
  }

  apply (compiler) {
    // Hook into the html-webpack-plugin processing
    if (compiler.hooks) {
      // Webpack 4+ Plugin System
      compiler.hooks.compilation.tap('ResourceHintWebpackPlugin', compilation => {
        let hook = compilation.hooks.htmlWebpackPluginAlterAssetTags;
        if (!hook) {
          const [HtmlWebpackPlugin] = compiler.options.plugins.filter(
                  (plugin) => plugin.constructor.name === 'HtmlWebpackPlugin');
          hook = HtmlWebpackPlugin.constructor.getHooks(compilation).alterAssetTagGroups;
        }
        hook.tapAsync('ResourceHintWebpackPluginAlterAssetTags',
            resourceHintWebpackPluginAlterAssetTags
        );
      });
    } else {
      // Webpack 1-3 Plugin System
      compiler.plugin('compilation', compilation => {
        compilation.plugin('html-webpack-plugin-alter-asset-tags',
          resourceHintWebpackPluginAlterAssetTags
        );
      });
    }
  }
}

/**
 * The main processing function
 */
function resourceHintWebpackPluginAlterAssetTags (htmlPluginData, callback) {
  const htmlWebpackPluginOptions = htmlPluginData.plugin.options;
  const pluginData = objectAssign({}, htmlPluginData);
  const tags = {
    prefetch: [],
    // https://w3c.github.io/preload/#link-type-preload
    preload: []
  };
  // Create Resource tags
  Object.keys(tags).forEach(resourceHintType => {
    // Check if it is disabled for the current htmlWebpackPlugin instance:
    // e.g.
    // new HtmlWebpackPlugin({
    //   prefetch: false
    // })
    if (htmlWebpackPluginOptions[resourceHintType] === false) {
      return;
    }
    // If no options are found all files are prefetched / preload
    const fileFilters = htmlWebpackPluginOptions[resourceHintType]
      ? [].concat(htmlWebpackPluginOptions[resourceHintType])
      : defaultFilter;
    // Process every filter
    fileFilters.forEach(filter => {
      if (filter.indexOf('*') !== -1) {
        Array.prototype.push.apply(tags[resourceHintType], addResourceHintTags(
          resourceHintType,
          filter,
          pluginData.body || pluginData.bodyTags,
          htmlWebpackPluginOptions
        ));
      } else {
        tags[resourceHintType].push(createResourceHintTag(filter, resourceHintType, htmlWebpackPluginOptions));
      }
    });
  });
  const head = pluginData.head || pluginData.headTags;
  // Add all Resource tags to the head
  Array.prototype.push.apply(head, tags.preload.map(addPreloadType));
  Array.prototype.push.apply(head, tags.prefetch);
  callback(null, pluginData);
}

/**
 * Adds Resource hint tags
 */
function addResourceHintTags (resourceHintType, filter, assetTags, htmlWebpackPluginOptions) {
  const urls = assetTags
    .map(tag => tag.attributes.src || tag.attributes.href)
    .filter(url => url)
    .filter(minimatch.filter(filter));
  // Add a ResourceHint for every match
  return urls.map(url => createResourceHintTag(url, resourceHintType, htmlWebpackPluginOptions));
}

function createResourceHintTag (url, resourceHintType, htmlWebpackPluginOptions) {
  return {
    tagName: 'link',
    selfClosingTag: !!htmlWebpackPluginOptions.xhtml,
    attributes: {
      rel: resourceHintType,
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
  const ext = path.extname(tag.attributes.href);
  if (preloadDirective[ext]) {
    tag.attributes.as = preloadDirective[ext];
  }
  return tag;
}

module.exports = ResourceHintWebpackPlugin;
