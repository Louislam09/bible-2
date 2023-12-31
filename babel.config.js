// module.exports = function (api) {
//   api.cache(true);
//   return {
//     presets: ['babel-preset-expo'],
//     plugins: [
//       'react-native-reanimated/plugin'
//     ],
//   };
// };
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
      "react-native-reanimated/plugin",
    ],
  };
};
