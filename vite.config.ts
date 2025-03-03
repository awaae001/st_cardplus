import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import electron from 'vite-plugin-electron';
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  server: {
    port: 5174
  },
  plugins: [
    vue(),
    tailwindcss(),
    electron({
      entry: 'electron/main.ts', // 主进程入口文件
    }),
  ],
  build: {
    outDir: 'dist', // 打包输出目录
    minify: 'terser', // 使用terser进行更严格的minify
    cssCodeSplit: true, // 启用CSS代码分割
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return 'vendor'; // 将node_modules中的依赖打包到单独文件
          }
        },
        chunkFileNames: 'assets/[name]-[hash].js', // 分割后的文件命名规则
      },
    },
    chunkSizeWarningLimit: 1000, // 设置chunk大小警告限制
    sourcemap: true, // 生成sourcemap便于调试
    terserOptions: {
      compress: {
        drop_console: true, // 移除console.log
        drop_debugger: true, // 移除debugger
      },
    },
  },
  assetsInclude: ['src/image/**/*']
});
