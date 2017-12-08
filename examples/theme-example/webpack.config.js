module.exports = {
    entry: './index.js',
    output: {
        filename:'bundle.js'
    },
    module:{
        rules: [
            { test: /\.js$/, use: 'babel-loader' }
          ]
    }
}