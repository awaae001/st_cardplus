import { app, BrowserWindow } from 'electron';
import { fileURLToPath } from 'url';
import path from 'path';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
let mainWindow = null;
function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 620,
        fullscreenable: false,
        useContentSize: true,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            allowRunningInsecureContent: false
        },
        show: false,
        backgroundColor: '#ffffff',
        // titleBarStyle: 'hidden',
        trafficLightPosition: { x: 12, y: 12 },
        icon: path.join(__dirname, '../src/image/logo.png')
    });
    mainWindow.once('ready-to-show', () => {
        mainWindow === null || mainWindow === void 0 ? void 0 : mainWindow.show();
    });
    mainWindow.webContents.on('did-fail-load', () => {
        mainWindow === null || mainWindow === void 0 ? void 0 : mainWindow.loadFile(path.join(__dirname, '../dist/error.html'));
    });
    if (process.env.NODE_ENV === 'development') {
        mainWindow.loadURL('http://localhost:5174');
        mainWindow.webContents.openDevTools();
    }
    else {
        mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
    }
    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}
app.on('ready', createWindow);
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
//# sourceMappingURL=main.js.map