const path = require('path')
const fs = require('fs')
const webpack = require('webpack')
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin')
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const ModuleScopePlugin = require('react-dev-utils/ModuleScopePlugin');
const paths = require('./paths');
const autoprefixer = require('autoprefixer');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const ReactLoadablePlugin = require('react-loadable/webpack').ReactLoadablePlugin;

const baseConfig = require('./base')

const nodeModules = {};
fs.readdirSync('node_modules')
    .filter(function(x) {
        return ['.bin'].indexOf(x) === -1;
    })
    .forEach(function(mod) {
        nodeModules[mod] = 'commonjs ' + mod;
    });

module.exports = {
  mode: 'development',
  entry: './src/app/server.tsx',
  devtool: 'source-map',
  target: 'node',
  // context: path.resolve(__dirname, ''),
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
    // modules: [path.resolve(__dirname), 'node_modules', 'app'],
    alias: {
      'styles': paths.appStyles
    },
    plugins: [
      new TsconfigPathsPlugin(),
      // new ModuleScopePlugin(paths.appSrc, [paths.appPackageJson])
    ]
  },
  output: {
    path: path.resolve(`./${paths.appBuild}/server`),
    filename: 'entry-server.js',
    publicPath: '/public/',
    libraryTarget: 'commonjs',
    chunkFilename: '[name].chunk.js'
    // devtoolModuleFilenameTemplate: info =>
    //   path.resolve(info.absoluteResourcePath).replace(/\\/g, '/'),
  },
  externals: nodeModules,
  module: baseConfig.module(true),
  plugins: [
    new ForkTsCheckerWebpackPlugin(),
    new webpack.NamedModulesPlugin(),
    new MiniCssExtractPlugin({
      filename: "client/static/css/[name].css",
      chunkFilename: "[id].css"
    }),
    new ReactLoadablePlugin({
      filename: path.join(__dirname, '..', paths.appBuild, 'react-loadable.json'),
    })
    // new HtmlWebpackPlugin(),
  ]
}