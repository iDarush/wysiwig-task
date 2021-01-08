const path = require("path");
const CleanWebpackPlugin = require("clean-webpack-plugin").CleanWebpackPlugin;
const CopyWebpackPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  entry: "./src/main.ts",
  devtool: "inline-source-map",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "bundle-[fullhash].js",
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
  devServer: {
    contentBase: "dist",
    compress: true,
    port: 8080,
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: "ts-loader",
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin(),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, "assets"),
          to: "assets",
        },
        {
          from: path.resolve(__dirname, "styles"),
          to: "styles",
        },
        {
          from: path.resolve(__dirname, "./favicon.ico"),
        },
      ],
    }),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, "./index.html"),
      filename: "index.html",
      minify: false,
    }),
  ],
};
