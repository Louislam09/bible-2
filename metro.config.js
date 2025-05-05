// const { getDefaultConfig } = require('@expo/metro-config');
const { getDefaultConfig } = require("expo/metro-config");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname); 

config.resolver.assetExts.push('db');
config.resolver.assetExts.push('mp3');
config.resolver.assetExts.push('SQLite3');

module.exports = config;