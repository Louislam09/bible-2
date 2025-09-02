const { getDefaultConfig } = require("expo/metro-config");

/** @type {import('expo/metro-config').MetroConfig} */
const defaultConfig = getDefaultConfig(__dirname);

defaultConfig.resolver.assetExts.push("db");
defaultConfig.resolver.assetExts.push("zip");
defaultConfig.resolver.assetExts.push("mp3");
defaultConfig.resolver.assetExts.push("SQLite3");
defaultConfig.resolver.assetExts.push("css");

defaultConfig.transformer.assetPlugins = ["expo-asset/tools/hashAssetFiles"];
// defaultConfig.unstable_enablePackageExports = false;

module.exports = defaultConfig;
