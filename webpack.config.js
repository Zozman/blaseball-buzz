const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const CompressionPlugin = require("compression-webpack-plugin");
const FaviconsWebpackPlugin = require("favicons-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

module.exports = (env, argv) => {
  return {
    mode: argv.mode,
    entry: {
      index: "./src/index.js",
    },
    optimization: {
      splitChunks: {
        chunks: "all",
      },
    },
    devtool: argv.mode === "development" ? "inline-source-map" : false,
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
      new CleanWebpackPlugin(),
      new FaviconsWebpackPlugin(path.resolve(__dirname, "images/icon.svg")),
      new HtmlWebpackPlugin({
        hash: true,
        title: "Blaseball Buzz",
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
      new CompressionPlugin({
        filename: "[path][base].gz",
        algorithm: "gzip",
      }),
      new CompressionPlugin({
        filename: "[path][base].br",
        algorithm: "brotliCompress",
      }),
    ],
    output: {
      filename: "[name].[contenthash].bundle.js",
      path: path.resolve(__dirname, "dist"),
      clean: true,
    },
  };
};
