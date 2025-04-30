import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import electron from 'vite-plugin-electron';
import tailwindcss from '@tailwindcss/vite';
import path from 'path'; // 引入 path 模块

export default defineConfig({
  server: {
    port: 3066
  },
  plugins: [
    vue(),
    tailwindcss(),
    electron({
      entry: 'electron/main.ts', // 主进程入口文件
    }),
  ],
  resolve: { // 添加 resolve 配置
    alias: {
      '@': path.resolve(__dirname, 'src'), // 定义 @ 别名指向 src 目录
    },
  },
  build: {
    outDir: 'dist', // 打包输出目录
    minify: 'terser', // 使用terser进行更严格的minify
    cssCodeSplit: true, // 启用CSS代码分割
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('element-plus')) {
              return 'element-plus'; // 将element-plus单独打包
            }
            if (id.includes('lodash-es')) {
              return 'lodash'; // 将lodash-es单独打包
            }
            return 'vendor'; // 其他node_modules依赖
          }
        },
        chunkFileNames: 'assets/[name]-[hash].js', // 分割后的文件命名规则
      },
    },
    chunkSizeWarningLimit: 1000, // 设置chunk大小警告限制
    sourcemap: false, 
    terserOptions: {
      compress: {
        // drop_console: true, // 移除console.log
        drop_debugger: true, // 移除debugger
      },
    },
  },
  assetsInclude: ['src/image/**/*']
});
