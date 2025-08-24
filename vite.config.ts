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
    // 获取最近10条的提交日志
    let gitLog: string[] = [];
    if (!process.env.CF_PAGES) {
      gitLog = execSync('git log --pretty=format:"%h - %s (%cr)" -n 10').toString().trim().split('\n');
    }
    return { commitHash, commitCount, gitLog };
  } catch (e) {
    console.error('Failed to get git info:', e);
    return { commitHash: 'unknown', commitCount: 'unknown', gitLog: ['Failed to get git log'] };
  }
};

const { commitHash, commitCount, gitLog } = getGitVersionInfo();

// 优先使用 Cloudflare Pages 的环境变量
const appVersion = process.env.CF_PAGES_COMMIT_SHA ? process.env.CF_PAGES_COMMIT_SHA.slice(0, 7) : commitHash;
const appCommitCount = commitCount;
const appGitLog = gitLog;


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
      'fs': path.resolve(__dirname, 'src/polyfills/fs.js'),
      'path': path.resolve(__dirname, 'src/polyfills/path.js'),
      'os': path.resolve(__dirname, 'src/polyfills/os.js'),
      // 确保 Vue 在生产环境中正确解析
      'vue': 'vue/dist/vue.esm-bundler.js',
    },
  },
  define: {
    // 防止 Node.js 模块在浏览器环境中被访问
    global: 'globalThis',
    __APP_VERSION__: JSON.stringify(appVersion),
    __APP_COMMIT_COUNT__: JSON.stringify(appCommitCount),
    __APP_GIT_LOG__: JSON.stringify(appGitLog),
    // 禁用 EJS 中的文件系统访问
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
    // 为浏览器环境提供 require 和 module 的 polyfill
    'require': 'undefined',
    'module': 'undefined',
    'exports': 'undefined',
    // 确保 Vue 开发工具和功能标志正确设置
    __VUE_OPTIONS_API__: true,
    __VUE_PROD_DEVTOOLS__: false,
  },
  optimizeDeps: {
    exclude: [],
    include: ['js-yaml', 'ejs', 'vue', '@vue/runtime-core', '@vue/runtime-dom', 'vuedraggable'],
    force: true, // 强制重新预优化
  },
  build: {
    outDir: 'dist', // 打包输出目录
    minify: 'terser', // 使用terser进行更严格的minify
    cssCodeSplit: false, // 禁用CSS代码分割以避免加载顺序问题
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('vue')) {
              return 'vue'; // 单独打包 Vue
            }
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
      external: [], // 确保不排除 Vue
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
