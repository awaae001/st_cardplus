import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import electron from 'vite-plugin-electron';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import { execSync } from 'child_process';

// 安全地获取 git commit hash 和 count
const getGitVersionInfo = () => {
  try {
    const commitHash = execSync('git rev-parse --short HEAD').toString().trim();
    const commitCount = execSync('git rev-list --count HEAD').toString().trim();
    return { commitHash, commitCount };
  } catch (e) {
    console.error('Failed to get git info:', e);
    return { commitHash: 'unknown', commitCount: 'unknown' };
  }
};

const { commitHash, commitCount } = getGitVersionInfo();

// 优先使用 Cloudflare Pages 的环境变量
const appVersion = process.env.CF_PAGES_COMMIT_SHA ? process.env.CF_PAGES_COMMIT_SHA.slice(0, 7) : commitHash;
const appCommitCount = commitCount;


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
  define: {
    // 防止 Node.js 模块在浏览器环境中被访问
    global: 'globalThis',
    __APP_VERSION__: JSON.stringify(appVersion),
    __APP_COMMIT_COUNT__: JSON.stringify(appCommitCount),
  },
  optimizeDeps: {
    exclude: ['fs', 'path', 'os'],
    include: ['js-yaml', 'ejs'],
  },
  build: {
    outDir: 'dist', // 打包输出目录
    minify: 'terser', // 使用terser进行更严格的minify
    cssCodeSplit: false, // 禁用CSS代码分割以避免加载顺序问题
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
        // drop_console: true, 
        drop_debugger: true, // 移除debugger
      },
    },
  },
  assetsInclude: ['src/image/**/*']
});
