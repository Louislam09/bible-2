module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      [
        "babel-preset-expo",
        {
          jsxImportSource: "react",
          lazyImports: true,
        },
      ],
    ],
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
      "react-native-reanimated/plugin",
    ],
    env: {
      production: {
        plugins: [
          // Remove console logs in production (only if the plugin is available)
          // ["transform-remove-console", { exclude: ["error", "warn"] }],
        ],
      },
    },
  };
};
