module.exports = {
  apps: [
    {
      name: 'chat app',
      script: './src/index.js',
      node_args: '-r esm'
    }
  ]
}
