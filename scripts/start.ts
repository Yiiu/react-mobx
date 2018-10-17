
import * as historyApiFallback from 'connect-history-api-fallback';
import * as express from 'express';
import * as fs from 'fs';
import * as path from 'path';
// import formatWebpackMessages from 'react-dev-utils/formatWebpackMessages';
import * as webpack from 'webpack';
import * as WebpackDevMiddleware from 'webpack-dev-middleware';
import webpackConfigs, { IAppConfig } from '../config/webpack/index';
const clearConsole = require('react-dev-utils/clearConsole');

import paths from '../config/paths';

const app = express();
const main = async () => {
  let config: IAppConfig = {};
  if (await fs.existsSync(paths.appConfig)) {
    try {
      config = require(paths.appConfig);
    } catch (e) {
      clearConsole();
      console.error('Invalid razzle.config.js file.', e);
      process.exit(1);
    }
  }
  const port = (
    process.env.PORT ?
    (parseInt(process.env.PORT, 10) + 1) : (config.port || 3001)
  );
  const host = process.env.HOST ? process.env.HOST : (config.host || 3001);
  const DIST_DIR = path.join(paths.appBuildSrc);
  const clientConfig = webpackConfigs({
      dev: true,
      isServer: false
    }, config) as any;
  const serverConfig = webpackConfigs({
      dev: true,
      isServer: true
    }, config) as any;
  const webpackConfig = [
    clientConfig
  ];
  if (process.env.SSR) {
    webpackConfig.push(serverConfig);
  }
  const multiCompiler = webpack(webpackConfig as any) as any;

  // const webpackDevMiddlewareConfig = {
  //   publicPath: `/__server/static/webpack`,
  //   noInfo: true,
  //   logLevel: 'silent'
  // };
  const devMiddleware = WebpackDevMiddleware(multiCompiler, {
    publicPath: clientConfig.output.publicPath,
    logLevel: 'silent',
    historyApiFallback: true
  } as any);
  app.use(require('webpack-hot-middleware')(multiCompiler.compilers[0], {}));
  app.use(historyApiFallback());
  app.use(devMiddleware);
  app.use(express.static(DIST_DIR));
  app.listen(port, () => {
    // if (openBrowser('http://localhost:3000')) {
    //   console.log('The browser tab has been opened!');
    // }
    console.log(`hot server ${host} at ${port}`);
  });
};

main();
