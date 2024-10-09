module.exports = {
  context: __dirname + "/src",
  entry: ["@babel/polyfill", "./index"],
  output: {
    path: __dirname + "/public/build",
    filename: "bundle.js",
    publicPath: "/build",
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        loader: "babel-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.tsx?$/,
        loader: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [".js", ".jsx", ".ts", ".tsx"],
    extensionAlias: {
      ".js": [".ts", ".js"],
      ".mjs": [".mts", ".mjs"],
    },
  },
  devtool: "source-map",
};
