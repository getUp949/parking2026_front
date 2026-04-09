const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  pages: {
    index: {
      entry: 'src/main.js',
      template: 'public/index.html',
      filename: 'index.html'
    },
    mobile: {
      entry: 'src/mobile/main.js',
      template: 'public/mobile.html',
      filename: 'mobile.html'
    }
  },
  devServer: {
    port: 8081,
    historyApiFallback: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true
      }
    }
  }
})
