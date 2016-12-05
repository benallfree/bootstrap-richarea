module.exports = {
     entry: './src/js/index.js',
     output: {
         path: './dist',
         filename: 'richarea.js',
     },
     module: {
         loaders: [{
             test: /\.js$/,
             exclude: /node_modules/,
             loader: 'babel-loader'
         }]
     }
 }