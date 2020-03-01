const path = require('path')

const modeConfig = env => require(`./build-utils/webpack.${env}`)(env);

const CopyPlugin = require('copy-webpack-plugin');


const baseConfig = {
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js'
  },
  externals: {
      fsevents: 'fsevents',
      "better-sqlite3": "commonjs better-sqlite3",
    },
  module: {
    rules: [
      {
        test: /\.js$/,
        enforce: 'pre',
        loader: 'standard-loader',
        options: {
          typeCheck: true,
          emitErrors: true
        }
      },
      {
        test: /\.tsx?$/,
        loader: 'ts-loader'
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.ts', '.tsx', '.json']
  },
  node: {
      __dirname: false
  },  
}

const commonConfig = Object.assign(baseConfig, modeConfig);

const HtmlWebpackPlugin = require('html-webpack-plugin')
module.exports = [
  Object.assign(
    {
      target: 'node',
      entry: { headless: './src/headless/headless.ts' },
      plugins: [
      ]
    },
    commonConfig),
  Object.assign(
    {
      target: 'electron-main',
      entry: { main: './src/electron/main.ts' },
      plugins: [
      ]
    },
    commonConfig),
  Object.assign(
    {
      target: 'electron-renderer',
      entry: { gui: './src/electron/gui.ts' },
      plugins: [
        new HtmlWebpackPlugin(),
      ]
    },
    commonConfig)
]

