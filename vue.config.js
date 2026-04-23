const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  publicPath: './',
  devServer: {
    hot: true,         // 热更新（不刷新页面，只更新代码）
    open: true,        // 启动项目自动打开浏览器
    client: {
      overlay: false   // 关闭错误全屏遮挡
    }
  }
})
