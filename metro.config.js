const { getDefaultConfig } = require('expo/metro-config');

const defaultConfig = getDefaultConfig(__dirname);

defaultConfig.resolver.assetExts.push('db');
defaultConfig.resolver.assetExts.push('mp3');
defaultConfig.resolver.assetExts.push('SQLite3');

module.exports = defaultConfig;