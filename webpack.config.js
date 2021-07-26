const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = {
  mode: "development",
  entry: {
    index: "./src/index.js",
  },
  devtool: "inline-source-map",
  devServer: {
    contentBase: "./dist",
    index: "index.html",
    hot: true,
    proxy: {
      "/settings": {
        bypass: (req, res) =>
          res.send({
            EventStream:
              // "https://before.sibr.dev/events/streamData",
              "https://api.sibr.dev/replay/v1/replay?from=2021-07-01T01:00:08.17Z",
          }),
      },
    },
  },
  plugins: [
    new HtmlWebpackPlugin({
      hash: true,
      title: "Blaseball Morse",
      template: "./src/index.html",
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          context: "node_modules/@webcomponents/webcomponentsjs",
          from: "webcomponents-loader.js",
          to: "webcomponents",
        },
      ],
    }),
  ],
  output: {
    filename: "[name].bundle.js",
    path: path.resolve(__dirname, "dist"),
    clean: true,
  },
};
