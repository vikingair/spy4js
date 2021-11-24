const { BABEL_ENV } = process.env
const cjs = BABEL_ENV === 'commonjs'
const envConfig = cjs ? { targets: { node: 12 }} : {
  targets: { esmodules: true },
  bugfixes: true,
  modules: false,
  loose: true
};

module.exports = {
  comments: false,
  presets: [
    '@babel/preset-typescript',
    ['@babel/preset-env', envConfig]
  ]
}