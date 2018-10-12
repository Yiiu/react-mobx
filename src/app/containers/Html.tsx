import * as React from 'react';
import { Helmet } from 'react-helmet';

import '@styles/index.less';
export interface IHtmlProps {
  markup: string;
  js: string[];
  style: string[];
}

export default class Html extends React.PureComponent<IHtmlProps> {
  public render() {
    const { markup, js } = this.props;
    const helmet = Helmet.renderStatic();
    const htmlAttrs = helmet.htmlAttributes.toComponent();
    const bodyAttrs = helmet.bodyAttributes.toComponent();
    return (
      <html {...htmlAttrs}>
        <head>
          {helmet.title.toComponent()}
          {helmet.meta.toComponent()}
          {helmet.link.toComponent()}
          {
            js.map(v => (
              <link key={v} rel="stylesheet" type="text/css" href={v} />
            ))
          }
        </head>
        <body {...bodyAttrs}>
          <div id="root" dangerouslySetInnerHTML={{__html: markup}} />
          <script src="/public/static/js/bundle.js" />
          {
            js.map(v => (
              <script key={v} src={v} />
            ))
          }
        </body>
      </html>
    );
  }
}
