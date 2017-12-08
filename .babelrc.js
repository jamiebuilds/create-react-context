const { BABEL_ENV, NODE_ENV } = process.env

const modules = BABEL_ENV === 'cjs' || NODE_ENV === 'test' ? 'commonjs' : false

const plugins = ['transform-class-properties']

if (modules === 'commonjs') {
	plugins.push('add-module-exports')
}

module.exports = {
  presets: [
    [
      'env',
      {
        loose: true,
        modules,
        targets: {
          browsers: ['last 2 versions', 'ie >= 9']
        }
      }
    ],
    'react',
    'flow',
  ],
  plugins,
}
