var path = require('path')
var webpack = require('webpack')

module.exports = {
  entry: {
    'richarea': './src/js/index.js',
  },
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: '[name].js'
  },
  module: {
    noParse: /node_modules\/json-schema\/lib\/validate\.js/,
    rules: [
      {
        test: /\.js$/,
        loader: 'string-replace-loader',
        query: {
          search: 'define.amd',
          replace: 'false'
        }
      },
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          loaders: {
            scss: 'style-loader!css-loader!sass-loader',
          }
        }
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/
      },
      {
        test: /\.html$/,
        loader: 'html-loader',
      },
      {
        test: /\.css$/,
        loader: 'style-loader!css-loader'
      },
      {
        test: /\.s[a|c]ss$/,
        loader: 'style-loader!css-loader!sass-loader',
      },
      {
        test: /\.(eot|svg|ttf|woff|woff2)(\?\S*)?$/,
        loader: 'file-loader'
      },
      {
        test: /\.(png|jpe?g|gif|svg)(\?\S*)?$/,
        loader: 'file-loader',
        query: {
          name: '[name].[ext]?[hash]'
        }
      },
    ]
  },
  resolve: {
    modules: [path.resolve(__dirname, ".."), "node_modules"],
    alias: {
      'vue$': 'vue/dist/vue'
    }
  },
  devServer: {
    historyApiFallback: true,
    noInfo: true
  },
  devtool: '#eval',
  externals: { jquery: "jQuery"}
}

if (process.env.NODE_ENV === 'production') {
  module.exports.output = {
    path: path.resolve(__dirname, './dist'),
    filename: '[name].min.js'
  };
  module.exports.devtool = '#source-map'
  // http://vue-loader.vuejs.org/en/workflow/production.html
  module.exports.plugins = (module.exports.plugins || []).concat([
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"production"'
      }
    }),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      }
    }),
    new webpack.LoaderOptionsPlugin({
      minimize: true
    })
  ])
}
