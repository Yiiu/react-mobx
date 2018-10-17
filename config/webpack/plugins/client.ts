import * as CopyWebpackPlugin from 'copy-webpack-plugin';
import * as HtmlWebpackPlugin from 'html-webpack-plugin';
import * as MiniCssExtractPlugin from 'mini-css-extract-plugin';
import * as path from 'path';
import { ReactLoadablePlugin } from 'react-loadable/webpack';
import * as ManifestPlugin from 'webpack-manifest-plugin';
import paths from '../../paths';
const errorOverlayMiddleware = require('react-dev-utils/errorOverlayMiddleware');
const InterpolateHtmlPlugin = require('react-dev-utils/InterpolateHtmlPlugin');

import { IConfig } from '../index';

export default (webpackConfig: any, { isServer, dev, ssr }: IConfig, dotenv: any) => {
  const hostPort = parseInt(dotenv.PORT, 10) + 1;
  if (!isServer) {
    if (dev) {
      webpackConfig.devServer = {
        compress: true,
        host: dotenv.HOST,
        port: hostPort,
        watchOptions: {
          ignored: /node_modules/,
        },
        contentBase: paths.appBuildSrc,
        publicPath: '/__server',
        before(app: any) {
          app.use(errorOverlayMiddleware());
        },
      };
    }
    if (!process.env.SSR) {
      webpackConfig.output.publicPath = '/';
      webpackConfig.plugins.unshift(
        new HtmlWebpackPlugin({
          inject: true,
          template: paths.appHtml,
        }),
      );
      webpackConfig.plugins.unshift(
        new InterpolateHtmlPlugin(HtmlWebpackPlugin, dotenv),
      );
    } else {
      webpackConfig.plugins.push(
        new ReactLoadablePlugin({
          filename: path.join(paths.appBuildSrc, 'react-loadable.json'),
        })
      );
    }
    webpackConfig.plugins.push(
      new MiniCssExtractPlugin({
        filename: 'static/style/[name].css',
        chunkFilename: 'static/style/[id].css'
      })
    );
    webpackConfig.plugins.push(
      new ManifestPlugin({
        fileName: 'asset-manifest.json',
        publicPath: webpackConfig.output.publicPath
      })
    );
    webpackConfig.plugins.push(
      new CopyWebpackPlugin([{
        from: paths.appPublic
      }])
    );
    webpackConfig.entry = [
      `webpack-hot-middleware/client?reload=true&path=http://${dotenv.HOST}:${hostPort}/__webpack_hmr`,
      paths.appClientIndexJs
    ];
  }
  return webpackConfig;
};
