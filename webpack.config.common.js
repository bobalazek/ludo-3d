const path = require("path");
const dotenv = require('dotenv');
const CopyWebpackPlugin = require("copy-webpack-plugin");
const DotenvPlugin = require('webpack-dotenv-plugin');


const dotenvResult = dotenv.config();
if (dotenvResult.error) {
  if (process.env.NODE_ENV === "production" && result.error.code === "ENOENT") {
    console.info("expected this error because we are in production without a .env file")
  } else {
    throw dotenvResult.error
  }
}

module.exports = {
    entry: "./src/index.ts",
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "bundle.js",
    },
    resolve: {
        extensions: [".ts", ".tsx", ".js"],
    },
    module: {
        rules: [
            { test: /\.tsx?$/, loader: "ts-loader" /* awesome-typescript-loader has issues with colyseus */ },
        ],
    },
    plugins: [
        new CopyWebpackPlugin([
            {
                from: path.resolve(__dirname, "src", "static"),
            },
        ]),
        new DotenvPlugin({
            sample: '.env.default',
            path: '.env',
      }),
    ],
    externals: {
        "oimo": true,
        "cannon": true,
        "earcut": true,
        "ammo": true
    },
}
