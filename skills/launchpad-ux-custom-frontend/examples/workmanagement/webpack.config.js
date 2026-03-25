const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');
const zlib = require('zlib');

module.exports = (env, argv) => {
  const plugins = [];
  const webpackMode = argv.mode;

  if (webpackMode === 'development') {
    plugins.push(new webpack.HotModuleReplacementPlugin());
  }

  plugins.push(
    new HtmlWebpackPlugin({
      template: './src/index.html',
      filename: 'index.html'
    })
  );

  plugins.push(
    new CopyWebpackPlugin({
      patterns: [
        { from: './sdk-config.json', to: './' },
        { from: './sdk-local-component-map.js', to: './' },
        {
          from: './node_modules/@pega/auth/lib/oauth-client/authDone.html',
          to: './auth.html'
        },
        {
          from: './node_modules/@pega/auth/lib/oauth-client/authDone.js',
          to: './'
        },
        { from: './assets/css/*', to: './' },
        { from: './assets/img/*', to: './' },
        {
          from: './node_modules/@pega/constellationjs/dist/bootstrap-shell.js',
          to: './constellation'
        },
        {
          from: './node_modules/@pega/constellationjs/dist/bootstrap-shell.*.*',
          to() {
            return Promise.resolve('constellation/[name][ext]');
          }
        },
        {
          from: './node_modules/@pega/constellationjs/dist/lib_asset.json',
          to: './constellation'
        },
        {
          from: './node_modules/@pega/constellationjs/dist/constellation-core.*.*',
          to() {
            return Promise.resolve('constellation/prerequisite/[name][ext]');
          },
          globOptions: {
            ignore: webpackMode === 'production' ? ['**/constellation-core.*.map'] : undefined
          }
        },
        {
          from: './node_modules/@pega/constellationjs/dist/js',
          to: './constellation/prerequisite/js'
        }
      ]
    })
  );

  if (webpackMode === 'production') {
    plugins.push(
      new CompressionPlugin({
        filename: '[path][base].gz',
        algorithm: 'gzip',
        test: /\.js$|\.ts$|\.css$|\.html$/,
        exclude: /constellation-core.*.js|bootstrap-shell.js/,
        threshold: 10240,
        minRatio: 0.8
      })
    );
    plugins.push(
      new CompressionPlugin({
        filename: '[path][base].br',
        algorithm: 'brotliCompress',
        test: /\.(js|ts|css|html|svg)$/,
        exclude: /constellation-core.*.js|bootstrap-shell.js/,
        compressionOptions: {
          params: { [zlib.constants.BROTLI_PARAM_QUALITY]: 11 }
        },
        threshold: 10240,
        minRatio: 0.8
      })
    );
  }

  return {
    mode: argv.mode,
    entry: {
      app: './src/index.tsx'
    },
    devServer: {
      static: path.join(__dirname, 'dist'),
      historyApiFallback: true,
      hot: true,
      host: 'localhost',
      port: 3502,
      open: false,
      proxy: [
        {
          context: ['/dx'],
          target: 'https://auraworkmanagement-iz0vw7-prod.pegalaunchpad.com',
          changeOrigin: true,
          secure: true
        }
      ],
      client: {
        overlay: {
          errors: false,
          warnings: false,
          runtimeErrors: false
        }
      }
    },
    devtool: argv.mode === 'production' ? false : 'inline-source-map',
    plugins,
    output: {
      filename: '[name].bundle.js',
      path: path.resolve(__dirname, 'dist'),
      clean: true
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: 'ts-loader',
          exclude: /node_modules/
        },
        {
          test: /\.jsx?$/,
          use: 'ts-loader',
          exclude: /node_modules/
        },
        {
          test: /\.css$/,
          include: [
            path.resolve(__dirname, 'src'),
            path.resolve(__dirname, 'node_modules/@pega/react-sdk-components/lib'),
            path.resolve(__dirname, 'node_modules/react-datepicker/dist')
          ],
          use: ['style-loader', 'css-loader']
        },
        {
          test: /\.s[ac]ss$/,
          use: ['style-loader', 'css-loader', 'sass-loader']
        },
        {
          test: /\.(png|gif|jpg|cur)$/i,
          loader: 'url-loader',
          options: { limit: 8192 }
        },
        {
          test: /\.woff2(\?v=[0-9]\.[0-9]\.[0-9])?$/i,
          loader: 'url-loader',
          options: { limit: 10000, mimetype: 'application/font-woff2' }
        },
        {
          test: /\.woff(\?v=[0-9]\.[0-9]\.[0-9])?$/i,
          loader: 'url-loader',
          options: { limit: 10000, mimetype: 'application/font-woff' }
        },
        {
          test: /\.(ttf|eot|svg|otf)(\?v=[0-9]\.[0-9]\.[0-9])?$/i,
          loader: 'file-loader'
        },
        {
          test: /\.(d\.ts)$/,
          loader: 'null-loader'
        },
        {
          test: /\.(map)$/,
          loader: 'null-loader'
        }
      ]
    },
    resolve: {
      extensions: ['.tsx', '.ts', '.js', '.jsx']
    }
  };
};
