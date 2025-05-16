/// <reference types="vitest" />
// vite.config.ts
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import electron from 'vite-plugin-electron';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import fs from 'fs'; // 导入 fs 模块

// 读取 package.json 文件
const packageJsonPath = path.resolve(__dirname, 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

export default defineConfig({
  server: {
    port: 3066
  },
  plugins: [
    vue(),
    tailwindcss(),
    electron([ // 假设你的 electron 配置是一个数组，如果只有一个对象则不需要数组
      {
        entry: 'electron/main.ts',
      },
      // 如果你有 preload 脚本，应该像这样配置:
      // {
      //   entry: 'electron/preload.ts', // 根据你的实际路径修改
      //   onstart(options) {
      //     options.reload(); // 或者 options.startup();
      //   },
      // }
    ]),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@assets': path.resolve(__dirname, 'src/assets'),
      '@modules': path.resolve(__dirname, 'src/modules'),
      '@core': path.resolve(__dirname, 'src/modules/core'),
      '@character': path.resolve(__dirname, 'src/modules/character'),
      '@world': path.resolve(__dirname, 'src/modules/world'),
      '@toolbox': path.resolve(__dirname, 'src/modules/toolbox'),
      '@pages': path.resolve(__dirname, 'src/pages'),
      '@router': path.resolve(__dirname, 'src/router'),
      '@styles': path.resolve(__dirname, 'src/styles'),
    },
  },
  define: {
    'import.meta.env.PACKAGE_VERSION': JSON.stringify(packageJson.version),
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
            if (id.includes('lodash-es')) {
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
        drop_debugger: true,
      },
    },
  },
  assetsInclude: ['src/image/**/*'],
test: {
    globals: true,
    environment: 'jsdom',
    include: ['src/**/*.spec.ts'], // 注意这里是双星号以匹配任意子目录
    // 如果需要，可以添加对 @vue/test-utils 的设置
    // setupFiles: ['./vitest.setup.ts'], // 如果有全局设置文件
  },
});