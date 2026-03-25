# Webpack Configuration — Critical Details

The webpack config must copy several assets from `node_modules` into the output for the Constellation engine to work:

```js
new CopyWebpackPlugin({
  patterns: [
    { from: './sdk-config.json', to: './' },
    { from: './sdk-local-component-map.js', to: './' },
    // Auth redirect handler pages
    { from: './node_modules/@pega/auth/lib/oauth-client/authDone.html', to: './auth.html' },
    { from: './node_modules/@pega/auth/lib/oauth-client/authDone.js', to: './' },
    // Constellation bootstrap shell
    { from: './node_modules/@pega/constellationjs/dist/bootstrap-shell.js', to: './constellation' },
    { from: './node_modules/@pega/constellationjs/dist/bootstrap-shell.*.*', to: 'constellation/[name][ext]' },
    { from: './node_modules/@pega/constellationjs/dist/lib_asset.json', to: './constellation' },
    // Constellation core prerequisite files
    { from: './node_modules/@pega/constellationjs/dist/constellation-core.*.*', to: 'constellation/prerequisite/[name][ext]' },
    { from: './node_modules/@pega/constellationjs/dist/js', to: './constellation/prerequisite/js' },
    // Static assets
    { from: './assets/css/*', to: './' },
    { from: './assets/img/*', to: './' },
  ]
})
```

Without these copy rules, the Constellation engine won't load and `PCore` will never become available. The `auth.html` file handles the OAuth redirect callback.

## Module Rules

The webpack config needs loaders for TypeScript, CSS, SCSS, fonts, and must null-load `.d.ts` and `.map` files from the SDK packages:

```js
rules: [
  { test: /\.tsx?$/, use: 'ts-loader', exclude: /node_modules/ },
  { test: /\.css$/, include: [path.resolve(__dirname, 'src'), path.resolve(__dirname, 'node_modules/@pega/react-sdk-components/lib')], use: ['style-loader', 'css-loader'] },
  { test: /\.s[ac]ss$/, use: ['style-loader', 'css-loader', 'sass-loader'] },
  { test: /\.(d\.ts)$/, loader: 'null-loader' },
  { test: /\.(map)$/, loader: 'null-loader' },
]
```

The CSS include path for `@pega/react-sdk-components/lib` is required — the SDK ships CSS files that must be resolved. **Also include `react-datepicker/dist`**, as the SDK's `DashboardFilter` component imports `react-datepicker.css`:

```js
{
  test: /\.css$/,
  include: [
    path.resolve(__dirname, 'src'),
    path.resolve(__dirname, 'node_modules/@pega/react-sdk-components/lib'),
    path.resolve(__dirname, 'node_modules/react-datepicker/dist')
  ],
  use: ['style-loader', 'css-loader']
}
```

## Dev Server Proxy (Required for CORS)

Launchpad's API endpoints don't include CORS headers for localhost. The webpack dev server must proxy **all `/dx/` requests** to the Launchpad server:

```js
devServer: {
  static: path.join(__dirname, 'dist'),
  historyApiFallback: true,
  hot: true,
  host: 'localhost',
  port: 3502,
  proxy: [
    {
      context: ['/dx'],
      target: 'https://myapp-xyz-prod.pegalaunchpad.com',
      changeOrigin: true,
      secure: true
    }
  ]
}
```

This proxies the token exchange (`/dx/uas/oauth/token`), token revocation (`/dx/uas/oauth/revoke`), and all DX API calls (`/dx/api/...`). The `sdk-config.json` should then point `token`, `revoke`, and `infinityRestServerUrl` to `http://localhost:<port>` during development.

> **Production:** In production, the proxy is not available. You must either configure CORS on the Launchpad server (see Section 4) or deploy your front-end on the same domain. Update `sdk-config.json` to use the actual Launchpad server URLs.

## Hot Module Replacement

If you see `[HMR] Hot Module Replacement is disabled`, add the webpack HMR plugin explicitly for development:

```js
const webpack = require('webpack');

// In the plugins array (development mode only):
if (webpackMode === 'development') {
  plugins.push(new webpack.HotModuleReplacementPlugin());
}
```
