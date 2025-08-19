module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      [
        "module-resolver",
        {
          extensions: [".tsx", ".ts", ".js", ".json"],
          root: ["."],
          alias: {
            components: "./components",
          },
        },
      ],
      "expo-asset/tools/hashAssetFiles", // 👈 required for expo-updates
      "react-native-reanimated/plugin",
    ],
  };
};
