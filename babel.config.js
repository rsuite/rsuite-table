module.exports = (api, options) => {
  const { NODE_ENV } = options || process.env;
  const dev = NODE_ENV === 'development';
  const modules = NODE_ENV === 'esm' ? false : 'commonjs';

  if (api) {
    api.cache(() => NODE_ENV);
  }

  return {
    presets: [
      ['@babel/preset-env', { modules, loose: true }],
      ['@babel/preset-react', { development: dev }],
      '@babel/preset-typescript'
    ],
    plugins: [
      'lodash',
      '@babel/plugin-proposal-export-default-from',
      ['@babel/plugin-transform-class-properties', { loose: true }],
      '@babel/plugin-transform-optional-chaining',
      '@babel/plugin-transform-export-namespace-from',
      ['@babel/plugin-transform-runtime', { useESModules: !modules }]
    ]
  };
};
