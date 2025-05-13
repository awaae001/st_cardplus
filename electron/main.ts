import { app, BrowserWindow, session } from 'electron';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow: BrowserWindow | null = null;

const VITE_DEV_SERVER_PORT = 3066;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 620,
    fullscreenable: false,
    useContentSize: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      allowRunningInsecureContent: false,
      // preload: path.join(__dirname, 'preload.js')
    },
    show: false,
    backgroundColor: '#ffffff',
    trafficLightPosition: { x: 12, y: 12 },
    icon: path.join(app.getAppPath(), 'src/image/logo.png')
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    console.error(`[Main Process] mainWindow event: did-fail-load. URL: ${validatedURL}, Error: ${errorCode} - ${errorDescription}`);
    // 生产环境下加载错误页面 (可选)
    // if (process.env.NODE_ENV !== 'development' && !validatedURL.endsWith('error.html')) {
    //   const errorHtmlPath = path.join(__dirname, '../dist/error.html');
    //   mainWindow?.loadFile(errorHtmlPath).catch(err => {
    //     console.error(`[Main Process] Failed to load error.html:`, err);
    //   });
    // }
  });

  const viteDevServerURL = process.env.VITE_DEV_SERVER_URL;
  const isDev = !!viteDevServerURL;

  const prodFileURL = `file://${path.join(__dirname, '../dist/index.html')}`;
  const loadURL = isDev ? viteDevServerURL : prodFileURL;

  if (loadURL) {
    if (isDev) {
      mainWindow.loadURL(loadURL).catch(err => {
        console.error(`[Main Process] Failed to load Vite dev URL ${loadURL}:`, err);
      });
      mainWindow.webContents.openDevTools();
    } else {
      mainWindow.loadFile(loadURL).catch(err => { // loadFile in production
        console.error(`[Main Process] Failed to load file ${loadURL}:`, err);
      });
    }
  } else {
    console.error('[Main Process] Critical error: loadURL is not defined. Check VITE_DEV_SERVER_URL and production path.');
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    // 主要为 mainFrame 和 subFrame 设置 CSP
    if (details.resourceType === 'mainFrame' || details.resourceType === 'subFrame') {
      const cspString =
        "default-src 'self'; " +
        "script-src 'self' 'unsafe-inline' https://umami.awaae001.top; " + // 允许 umami 脚本
        "style-src 'self' 'unsafe-inline' data:; " +
        "img-src 'self' data: file:; " +
        "font-src 'self' data:; " +
        "connect-src 'self' ws://localhost:* ws://127.0.0.1:* http://localhost:* http://127.0.0.1:* " + // Vite HMR
        "https://umami.awaae001.top https://api.iconify.design https://api.unisvg.com https://api.simplesvg.com;"; // 允许连接的外部服务

      const newHeaders = {
        ...details.responseHeaders,
        'Content-Security-Policy': cspString.trim()
      };
      callback({ responseHeaders: newHeaders });
    } else {
      callback({ responseHeaders: details.responseHeaders });
    }
  });

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

process.on('uncaughtException', (error) => {
  console.error('[Main Process] Uncaught Exception:', error);
  // 考虑在这里添加更健壮的错误处理或日志记录
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[Main Process] Unhandled Rejection at:', promise, 'reason:', reason);
  // 考虑在这里添加更健壮的错误处理或日志记录
});