# Overview

This project contains a sample Generative AI Chatbot interface written in React 18+ and [React Context](https://react.dev/learn/scaling-up-with-reducer-and-context) to store application state.  The code uses browser's native fetch API to make service calls.  Additionally, React components use [React Bootstrap](https://react-bootstrap.netlify.app/) (with Bootstrap v5+) widgets as styled components.  Component-specific CSS overrides are in associated &lt;Component&gt;.css files.

The code uses latest Webpack 5 bundler and several key bundling plugins.  Creating development or production bundles are key steps of any front-end application.  Therefore more stringent bundling rules are applied to create smaller production bundles.  Read about each of these webpack plug in more details or their reference implementation in `webpack.config.js`.

* [copy-webpack-plugin](https://webpack.js.org/plugins/copy-webpack-plugin/#getting-started)
* [html-webpack-plugin](https://webpack.js.org/plugins/html-webpack-plugin/#root)
* [mini-css-extract-plugin](https://webpack.js.org/plugins/mini-css-extract-plugin/#root)
* [webpack-manifest-plugin](https://webpack.js.org/guides/output-management/#the-manifest)

Following webpack plugins are used specifically to optimize CSS for production deployment

* [terser-webpack-plugin](https://webpack.js.org/plugins/terser-webpack-plugin/#root)
* [css-minimizer-webpack-plugin](https://webpack.js.org/plugins/css-minimizer-webpack-plugin/#root)
* [postcss-nested](https://webpack.js.org/loaders/postcss-loader/#root)
* [autoprefixer](https://webpack.js.org/loaders/postcss-loader/#autoprefixer)

Refer to [blueprint-rag solution](../../solutions/blueprint-rag/) for architecture diagram and additional documentation.

## Prerequisites

Code was build with the following software stack.

* [Node v16.20.0](https://nodejs.org/en/download/releases)
  * npm v8.19+ bundles with Node v16
* [Yarn 1.22.19](https://classic.yarnpkg.com/lang/en/docs/install)

## Development Setup

> IMPORTANT: If you run into errors while installing node module using yarn, turn off `strict-ssl` flag to disallow SSL certificate verification.

```sh
yarn config set "strict-ssl" false -g
```

Install the required npm modules using `yarn` as follows:

```sh
cd <source folder>
yarn install
```

Run the development build to ensure webpack is successfully able to package the files into the `dist` folder.  `dist` folder contains the minified/bundled JS/CSS/HTML files that can be deployed to a web server (for example).  A development build however is not fully compress and contains source-map for debugging purposes.  Also during the development phase, we use webpack development server to serve these built files.

```sh
yarn run build-dev
```

Now you can serve the built contents using webpack development server from terminal window:

```sh
yarn run start-dev
```

Once the development server launches, you can launch Chrome in debug mode to start inspecting code with step-through VS Code debugger.  Switch to `Run and Debug` view:

* launch VSCode and switch to `Run and Debug` view
* From the `RUN AND DEBUG` drop-down, select `Launch Chrome`
* Hit the Play button to launch the browser.

## Deployment

Start build by calling the `build` target

```sh
yarn run build
```

The generated contents in `/dist` folder are minified and compressed using webpack plugins.
