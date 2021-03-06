const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackIncludeAssetsPlugin = require('html-webpack-include-assets-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const {
  CLIENT_PORT,
  SERVER_PORT,
  LOCAL_HOST,
  WEB_HOST
} = require('./config/app_config.json');

module.exports = (env, argv) => {
  const SERVER_HOST = (argv.mode === 'production') ? WEB_HOST : LOCAL_HOST;
  console.log(`SERVER_HOST :${SERVER_HOST}`);
  const outputDirectory = 'dist';

  const clientDir = path.join(__dirname, 'src', 'client');
  const publicDir = path.join(__dirname, 'public');
  const assetsBase = path.join(publicDir, 'assets');

  const cssFiles = [
    'css/bootstrap-clearmin.css',
    'css/roboto.css',
    'css/material-design.css',
    'css/small-n-flat.css',
    'css/font-awesome.min.css',
    'css/style.css'
  ];

  const jsFiles = [
    'js/lib/jquery-2.1.3.min.js',
    'js/jquery.mousewheel.min.js',
    'js/jquery.cookie.min.js',
    'js/fastclick.min.js',
    'js/bootstrap.min.js',
    'js/clearmin.js'
  ];

  const finalConfig = {
    entry: path.join(clientDir, '/index.js'),
    output: {
      path: path.join(__dirname, outputDirectory),
      filename: 'bundle.js',
      publicPath: '/'
    },
    module: {
      rules: [
        {
          test: /\.(js|jsx)$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader'
          }
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader']
        },
        {
          test: /\.(png|woff|woff2|eot|ttf|svg)$/,
          loader: 'url-loader?limit=100000'
        }
      ]
    },
    devServer: {
      contentBase: assetsBase,
      port: CLIENT_PORT,
      open: true,
      historyApiFallback: true,
      host: '0.0.0.0',
      disableHostCheck: true,
      proxy: {
        '/api': `${SERVER_HOST}:${SERVER_PORT}`
      }
    },
    plugins: [
      new CopyWebpackPlugin([
        { from: path.join(assetsBase, 'css'), to: 'css/' },
        { from: path.join(assetsBase, 'js'), to: 'js/' }
      ]),
      new CleanWebpackPlugin([outputDirectory]),
      new HtmlWebpackPlugin({
        template: path.join(publicDir, 'index.html'),
        favicon: path.join(publicDir, 'favicon.ico')
      }),
      new HtmlWebpackIncludeAssetsPlugin({
        assets: jsFiles,
        append: false
      }),
      new HtmlWebpackIncludeAssetsPlugin({
        assets: cssFiles,
        append: true
      })
    ],
    performance: {
      maxAssetSize: 600000,
      maxEntrypointSize: 600000
    },
    resolve: {
      modules: ['node_modules'],
      extensions: ['.js', '.jsx', '.json']
    },
    devtool: 'source-map'
  };

  return finalConfig;
};
