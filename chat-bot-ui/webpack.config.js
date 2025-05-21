// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/* eslint-env node */
const webpack = require('webpack');
const CopyPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { WebpackManifestPlugin } = require('webpack-manifest-plugin');
const path = require('path');
// CSS optimizers for production
const autoprefixer = require("autoprefixer");
const postcssNested = require("postcss-nested");
const TerserJSPlugin = require('terser-webpack-plugin');
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");

// disambiguates webpack.config.js between development and production builds
// export a function instead of configuration object to determine 'development'
// vs 'production' modes for plugins
// it's possible to look at the command line arguments as well by using
//    module.exports = (env, argv) => { ... }
// https://webpack.js.org/guides/environment-variables/
module.exports = env => {

  console.log(JSON.stringify(env));

  const DEV_MODE = env.NODE_ENV !== 'production';
  const DEMO_MODE = env.DEMO_MODE === 'true';
  console.log('NODE_ENV ? ', env.NODE_ENV);
  console.log('DEV_MODE ? ', DEV_MODE);
  console.log('DEMO_MODE ? ', DEMO_MODE);

  const BUILD_PATH = path.resolve(__dirname, 'dist');
  const APP_PATH = path.resolve(__dirname, 'src');

  console.log('BUILD_PATH ? ', BUILD_PATH);
  console.log('APP_PATH ? ', APP_PATH);

  const postcssOpts = {
		postcssOptions: {
			plugins: [
				autoprefixer,
        postcssNested
			]
		}
	};

  return {
    // refer to https://webpack.js.org/configuration/mode/
    mode: DEV_MODE ? 'development' : 'production',

    // refer to https://webpack.js.org/configuration/entry-context/
    entry: {
      // approach #1
      // index: path.join(APP_PATH, 'index.jsx'),
      // app: path.join(APP_PATH, 'components/App.jsx'),
      // header: path.join(APP_PATH, 'components/Header/Header.jsx'),
      // main: path.join(APP_PATH, 'components/Main/Main.jsx'),

      // approach #2
      app: path.join(APP_PATH, 'index.jsx'),
    },

    // refer to https://webpack.js.org/configuration/output/
    output: {
      path: BUILD_PATH,
      filename: '[name].bundle.js',
      publicPath: '/', // when specifying sub paths, path should contain leading and trailing '/'
      clean: true
    },

    // refer to https://webpack.js.org/configuration/resolve/
    resolve: {
      extensions: [
        '.js', '.jsx', '.ts', '.tsx'
      ],
      // https://github.com/angular/angular-cli/issues/20819
      // graphql/amplify requires polly fills for node modules in webpack 5
      fallback: {
        'stream': require.resolve('stream-browserify'),
        'crypto': require.resolve('crypto-browserify')
      }
    },

    // refer to https://webpack.js.org/configuration/stats/#statschildren
    stats: {
      children: true,
      errorDetails: true
    },

    // refer to https://webpack.js.org/configuration/optimization/
    optimization: {
      splitChunks: {
        chunks: 'all'
      },
      // splitChunks: {
      //   cacheGroups: {
      //     styles: {
      //       name: 'ultra-special-styles',
      //       test: /\.css$/,
      //       chunks: 'all',
      //       enforce: true
      //     }
      //   }
      // },
      // CSS optimizers for production
      minimizer: DEV_MODE ? [] : [new TerserJSPlugin(), new CssMinimizerPlugin()],
      minimize: ! DEV_MODE,
    },

    // refer to https://webpack.js.org/configuration/module/
    module: {
      rules: [
        {
          test: /(\.js$|\.jsx|\.tsx$)/,
          exclude: /node_modules/,
          // include : APP_PATH,
          use: {
            loader: 'babel-loader',
          }
        },
        // graphql mjs work-around
        // https://github.com/graphql/graphql-js/issues/2721#issuecomment-723008284
        {
          test: /\.m?js/,
          resolve: {
              fullySpecified: false
          }
        },
        {
          test: /\.html$/,
          // include : APP_PATH,
          use: [
            {
              // use raw-loader to process HTML file because there is no easy
              // way to exclude vendor minified css from getting parsed by html-loader.
              // vendor minified css have embedded data:/ tags that cause MiniCssExtractPlugin
              // to fail
              loader: 'raw-loader'
              // loader: "html-loader",
              // options: {
              //   minimize: true
              // }
            }
          ]
        },
        // css-loader bundles all the css files into one file
        {
          test: /\.css$/,
          // include : APP_PATH,
          use: [
            {
              loader: MiniCssExtractPlugin.loader,
              // options: {
              //   // only enable hot in development
              //   // hmr: DEV_MODE,
              //   // if hmr does not work, this is a forceful method.
              //   // reloadAll: DEV_MODE
              // },
            },
            {
              loader: 'css-loader',
              // options: {
              //   sourceMap: DEV_MODE,
              //   modules: false
              // },
            },
            {
							loader:  "postcss-loader",
							options: postcssOpts
						}
          ]
        },
        // css-loader bundles all the scss files into one file
        {
          test: /\.scss$/,
          // include : APP_PATH,
          use: [
            {
              loader: MiniCssExtractPlugin.loader,
              // options: {
              //   // only enable hot in development
              //   // hmr: DEV_MODE,
              //   // if hmr does not work, this is a forceful method.
              //   // reloadAll: DEV_MODE
              // },
            },
            {
              loader: 'css-loader',
              options: {
              //   sourceMap: DEV_MODE,
              //   modules: false
                // https://github.com/webpack-contrib/css-loader#exportonlylocals
                exportOnlyLocals: true,
              },
            },
            {
							loader:  "postcss-loader",
							options: postcssOpts
						},
            {
              loader: 'sass-loader'
            }
          ]
        },
        /*
         * webpack v5 - Asset Modules
         * refer to https://webpack.js.org/guides/asset-modules/
         */
        // handle resource assets - images
        {
          test: /\.(png|jpg|jpeg|gif)$/i,
          type: 'asset/resource',
        },
        // handle inline assets - fonts
        {
          test: /\.(woff|woff2|eot|ttf|otf)$/i,
          type: 'asset/resource',
        },
        /*
         * SVG loader as React Component: https://react-svgr.com/docs/webpack/
         */
        {
          test: /\.svg$/i,
          issuer: /\.[jt]sx?$/,
          use: ['@svgr/webpack'],
        },
      ]
    },

    // refer to https://webpack.js.org/configuration/devtool/#devtool
    // another option is to use 'nosources-source-map' in 'production' mode
    devtool: DEV_MODE ? 'eval-source-map' : 'hidden-source-map',

    // refer to https://webpack.js.org/configuration/dev-server/#devserver
    devServer: {
      devMiddleware: {
        writeToDisk: true
      },
      static: {
        directory: APP_PATH,
        publicPath: '/', // The bundled files will be available in the browser under this path.
      },
      historyApiFallback: true,
    },

    // refer to https://webpack.js.org/configuration/plugins/
    plugins: [

      // https://webpack.js.org/plugins/html-webpack-plugin/#root
      // simplifies creation of HTML files to serve your webpack bundles
      new HtmlWebpackPlugin({
        inject: true,
        template: DEMO_MODE ? path.join(APP_PATH, 'demo.html') : path.join(APP_PATH, 'index.html')
      }),

      // https://webpack.js.org/plugins/mini-css-extract-plugin/#root
      new MiniCssExtractPlugin({
        filename: 'style/[name].css',
        chunkFilename: 'style/[id].css'
      }),

      // https://webpack.js.org/plugins/copy-webpack-plugin/#getting-started
      // copies individual files or entire directories, which already exist, to the build directory.
      new CopyPlugin({
        patterns: [
          { from: 'src/style', to: 'style' },
          { from: 'src/image', to: 'image' },
          // { from: 'node_modules/semantic-ui-css/themes', to: 'style/semantic-ui/themes' },
          // { from: 'node_modules/semantic-ui-css/semantic.min.css', to: 'style/semantic-ui/semantic.min.css' }
        ],
      }),

      // https://github.com/danethurber/webpack-manifest-plugin
      // https://webpack.js.org/guides/output-management/
      // generate an asset manifest.
      new WebpackManifestPlugin(),

      // https://webpack.js.org/plugins/define-plugin/#root
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(env.NODE_ENV),
        '__LOCALE__': env.LOCALE ? JSON.stringify(env.LOCALE) : process.env.LOCALE ? JSON.stringify(process.env.LOCALE) : JSON.stringify("en_US"),
        '__AWS_REGION__': env.AWS_REGION ? JSON.stringify(env.AWS_REGION) : process.env.AWS_REGION ? JSON.stringify(process.env.AWS_REGION) : JSON.stringify("us-east-1"),
        '__API_ENDPOINT__': env.API_ENDPOINT ? JSON.stringify(env.API_ENDPOINT) : process.env.API_ENDPOINT ? JSON.stringify(process.env.API_ENDPOINT) : JSON.stringify("https://localhost:8080/chat"),
        '__API_KEY__': env.API_KEY ? JSON.stringify(env.API_KEY) : process.env.API_KEY ? JSON.stringify(process.env.API_KEY) : JSON.stringify(""),
        '__GRAPHQL_ENDPOINT__': env.GRAPHQL_ENDPOINT ? JSON.stringify(env.GRAPHQL_ENDPOINT) : process.env.GRAPHQL_ENDPOINT ? JSON.stringify(process.env.GRAPHQL_ENDPOINT) : JSON.stringify("https://localhost:8080/graphql"),
        '__GRAPHQL_API_KEY__': env.GRAPHQL_API_KEY ? JSON.stringify(env.GRAPHQL_API_KEY) : process.env.GRAPHQL_API_KEY ? JSON.stringify(process.env.GRAPHQL_API_KEY) : JSON.stringify(""),
        '__CHAT_BOT_NAME__': env.CHAT_BOT_NAME ? JSON.stringify(env.CHAT_BOT_NAME) : process.env.CHAT_BOT_NAME ? JSON.stringify(process.env.CHAT_BOT_NAME) : JSON.stringify("GenAI"),
        '__CONVERSATION_HISTORY_ENABLED__': env.CONVERSATION_HISTORY_ENABLED ? JSON.stringify(env.CONVERSATION_HISTORY_ENABLED) : process.env.CONVERSATION_HISTORY_ENABLED ? JSON.stringify(process.env.CONVERSATION_HISTORY_ENABLED) : JSON.stringify(false),
        '__CONVERSATION_HISTORY_WINDOW__': env.CONVERSATION_HISTORY_WINDOW ? JSON.stringify(env.CONVERSATION_HISTORY_WINDOW) : process.env.CONVERSATION_HISTORY_WINDOW ? JSON.stringify(process.env.CONVERSATION_HISTORY_WINDOW) : JSON.stringify(5),
        '__DEMO_MODE__': env.DEMO_MODE ? JSON.stringify(env.DEMO_MODE) : process.env.DEMO_MODE ? JSON.stringify(process.env.DEMO_MODE) : JSON.stringify(false),
        '__APPSYNC_ENABLED__': env.APPSYNC_ENABLED ? JSON.stringify(env.APPSYNC_ENABLED) : process.env.APPSYNC_ENABLED ? JSON.stringify(process.env.APPSYNC_ENABLED) : JSON.stringify(false),
        '__WEBSOCKET_ENABLED__': env.WEBSOCKET_ENABLED ? JSON.stringify(env.WEBSOCKET_ENABLED) : process.env.WEBSOCKET_ENABLED ? JSON.stringify(process.env.WEBSOCKET_ENABLED) : JSON.stringify(false),
        '__WEBSOCKET_ENDPOINT__': env.WEBSOCKET_ENDPOINT ? JSON.stringify(env.WEBSOCKET_ENDPOINT) : process.env.WEBSOCKET_ENDPOINT ? JSON.stringify(process.env.WEBSOCKET_ENDPOINT) : JSON.stringify(false),
        '__AGENT_ENABLED__': env.AGENT_ENABLED ? JSON.stringify(env.AGENT_ENABLED) : process.env.AGENT_ENABLED ? JSON.stringify(process.env.AGENT_ENABLED) : JSON.stringify(false),
        '__MOCK_ENABLED__': env.MOCK ? JSON.stringify(env.MOCK) : process.env.MOCK ? JSON.stringify(process.env.MOCK) : JSON.stringify(false)
      })
    ]
  };
};
