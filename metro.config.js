const { getDefaultConfig } = require("expo/metro-config");

/** @type {import('expo/metro-config').MetroConfig} */
const defaultConfig = getDefaultConfig(__dirname);

defaultConfig.resolver.assetExts.push("db");
defaultConfig.resolver.assetExts.push("zip");
defaultConfig.resolver.assetExts.push("mp3");
defaultConfig.resolver.assetExts.push("SQLite3");
defaultConfig.resolver.assetExts.push("css");

// Add wasm asset support
defaultConfig.resolver.assetExts.push('wasm');

// Add COEP and COOP headers to support SharedArrayBuffer
defaultConfig.server.enhanceMiddleware = (middleware) => {
    return (req, res, next) => {
        res.setHeader('Cross-Origin-Embedder-Policy', 'credentialless');
        res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
        middleware(req, res, next);
    };
};

defaultConfig.transformer.assetPlugins = ["expo-asset/tools/hashAssetFiles"];
// defaultConfig.unstable_enablePackageExports = false;

module.exports = defaultConfig;
