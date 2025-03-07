import { app as t, BrowserWindow as l } from "electron";
import { fileURLToPath as r } from "url";
import o from "path";
const n = o.dirname(r(import.meta.url));
let e = null;
function i() {
  e = new l({
    width: 1200,
    height: 620,
    fullscreenable: !1,
    useContentSize: !0,
    webPreferences: {
      nodeIntegration: !0,
      contextIsolation: !1,
      allowRunningInsecureContent: !1
    },
    show: !1,
    backgroundColor: "#ffffff",
    // titleBarStyle: 'hidden',
    trafficLightPosition: { x: 12, y: 12 },
    icon: o.join(n, "../src/image/logo.png")
  }), e.once("ready-to-show", () => {
    e == null || e.show();
  }), e.webContents.on("did-fail-load", () => {
    e == null || e.loadFile(o.join(n, "../dist/error.html"));
  }), process.env.NODE_ENV === "development" ? (e.loadURL("http://localhost:5174"), e.webContents.openDevTools()) : e.loadFile(o.join(n, "../dist/index.html")), e.on("closed", () => {
    e = null;
  });
}
t.on("ready", i);
t.on("window-all-closed", () => {
  process.platform !== "darwin" && t.quit();
});
t.on("activate", () => {
  l.getAllWindows().length === 0 && i();
});
