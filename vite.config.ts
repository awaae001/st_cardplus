// vite.config.ts
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import electron from 'vite-plugin-electron';
import tailwindcss from '@tailwindcss/vite'; // 1. 导入 @tailwindcss/vite
import path from 'path';

export default defineConfig({
  server: {
    port: 3066
  },
  plugins: [
    vue(),
    tailwindcss(), // 2. 将 tailwindcss() 添加到 plugins 数组
    electron({
      entry: 'electron/main.ts',
      // 如果你的 electron 配置有多个入口，确保它们都在这里
      // 例如，如果你有 preload 脚本：
      // {
      //   entry: 'electron/preload.ts',
      //   onstart(options) {
      //     options.reload()
      //   },
      // }
    }),
    // 如果你之前有 vite-plugin-electron-renderer，它也应该在这里
    // electronRenderer(), // 假设你可能需要这个，如果你的原始配置更复杂
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  build: {
    outDir: 'dist',
    minify: 'terser',
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('element-plus')) {
              return 'element-plus';
            }
            if (id.includes('lodash-es')) { // 假设你项目中有 lodash-es
              return 'lodash';
            }
            return 'vendor';
          }
        },
        chunkFileNames: 'assets/[name]-[hash].js',
      },
    },
    chunkSizeWarningLimit: 1000,
    sourcemap: false,
    terserOptions: {
      compress: {
        // drop_console: true,
        drop_debugger: true,
      },
    },
  },
  assetsInclude: ['src/image/**/*'],
  // 3. 移除所有手动的 css.postcss 配置。
  // Tailwind CSS v4.0 和 @tailwindcss/vite@next 会自动处理 PostCSS。
  // css: {
  //   postcss: {} // <--- 删除或注释掉这一整块
  // }
});