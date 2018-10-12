import { Request } from 'express';
import * as React from 'react';
import * as Loadable from 'react-loadable';
import { getBundles } from 'react-loadable/webpack';
import { StaticRouter } from 'react-router';

import { Provider } from 'mobx-react';
import { renderToString } from 'react-dom/server';

import App from '@containers';
import Html from '@containers/Html';

import { createStore } from '@stores';

export default (req: Request, stats: any) => {
  const modules: any[] = [];
  const newStores = createStore();
  const Router = StaticRouter as any;
  const markup = renderToString(
    <Loadable.Capture report={moduleName => modules.push(moduleName)}>
      <Router location={req.url} content={{}}>
        <Provider { ...newStores }>
          <App />
        </Provider>
      </Router>
    </Loadable.Capture>
  );
  const bundles = getBundles(stats, modules);
  console.log(bundles);
  const js = bundles
    .filter(bundle => bundle && bundle.file.endsWith('.js'))
    .map(bundle => {
      return `/public/static/js/${bundle.file}`;
    });
  const style = bundles
    .filter(bundle => bundle && bundle.file.endsWith('.css'))
    .map(bundle => {
      return `/public/static/css/${bundle.file}`;
    });
  return renderToString(
    <Html markup={markup} js={js} style={style} />
  );
};
