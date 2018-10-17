import * as path from 'path';

// import * as AutoDllPlugin from 'autodll-webpack-plugin';
import * as webpack from 'webpack';

import * as CaseSensitivePathPlugin from 'case-sensitive-paths-webpack-plugin';
import * as FriendlyErrorsWebpackPlugin from 'friendly-errors-webpack-plugin';
import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin';
import * as merge from 'webpack-merge';
import * as WebpackBar from 'webpackbar';
import * as WriteFilePlugin from 'write-file-webpack-plugin';

import clientPlugins from './plugins/client';
import serverPlugins from './plugins/server';

import { getEnv } from '../env';

import paths from '../paths';

import scriptLoader from './loader/script';
import styleLoader from './loader/style';

export type IAppConfigPlugin = <T>(webpackConfig: T, config: IConfig, dotenv: any) => any;

export interface IAppConfig {
  configureWebpack?: any;
  plugins?: IAppConfigPlugin[];
  hotPort?: string;
  hotHost?: string;
  port?: string;
  host?: string;
  modify?: IAppConfigPlugin;
}

export interface IConfig {
  dev: boolean;
  isServer: boolean;
  ssr?: boolean;
}

export default (
  {
    dev = false,
    isServer = false,
    ssr = !!process.env.SSR
  }: IConfig,
  {
    plugins = [],
    configureWebpack,
    modify,
  }: IAppConfig
) => {
  const webpackMode = dev ? 'development' : 'production';
  const publicPath = '/public/';
  const dotenv = getEnv(isServer, {
    plugins,
    configureWebpack,
    modify,
  }, '');
  let webpackConfig = {
    mode: webpackMode,
    devtool: 'source-map',
    name: isServer ? 'server' : 'client',
    target: isServer ? 'node' : 'web',
    cache: true,
    output: {
      path: path.join(paths.appBuildSrc, isServer ? 'server' : ''),
      filename: isServer ? 'server.js' : 'static/chunks/app.js',
      publicPath,
      libraryTarget: isServer ? 'commonjs2' : 'jsonp',
      hotUpdateChunkFilename: 'static/webpack/[id].[hash].hot-update.js',
      hotUpdateMainFilename: 'static/webpack/[hash].hot-update.json',
      chunkFilename: isServer ? '[name].[contenthash].js' : 'static/chunks/[name].[contenthash].js',
    },
    // performance: {
    //   hints: false
    // },
    resolve: {
      extensions: ['.wasm', '.mjs', '.js', '.jsx', '.ts', '.tsx', '.json'],
      alias: {
        'styles': paths.appStyles
      },
      plugins: [
        new TsconfigPathsPlugin({
          // configFile: paths.appTsconfig
        }),
      ]
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          exclude: /node_modules/,
          loader: 'tslint-loader',
          enforce: 'pre'
        },
        styleLoader({isServer}),
        scriptLoader({isServer}),
        {
          exclude: [/\.(js|jsx|mjs|tsx?)$/, /\.html$/, /\.json$/, /\.css|less$/],
          loader: require.resolve('file-loader'),
          options: {
            name: 'static/media/[name].[hash:8].[ext]',
          },
        },
      ]
    },
    plugins: [
      // new AutoDllPlugin(),
      new webpack.DefinePlugin(dotenv),
      new webpack.NamedModulesPlugin(),
      new WebpackBar({
        name: isServer ? 'server' : 'client'
      }),
      dev && new FriendlyErrorsWebpackPlugin(),
      dev && new webpack.HotModuleReplacementPlugin(),
      dev && new CaseSensitivePathPlugin(),
      dev && !!process.env.SSR && new WriteFilePlugin({
        exitOnErrors: false,
        log: false,
        // required not to cache removed files
        useHashIndex: false
      })
    ].filter(Boolean)
  };
  plugins.push(clientPlugins);
  plugins.push(serverPlugins);
  plugins.forEach(plugin => {
    if (typeof(plugin) === 'function') {
      webpackConfig = plugin(webpackConfig, { isServer, dev, ssr }, dotenv);
    }
  });
  merge(configureWebpack, (webpackConfig as any));
  if (modify) {
    webpackConfig = modify<typeof webpackConfig>(webpackConfig, { isServer, dev, ssr }, dotenv);
  }
  return webpackConfig;
};
