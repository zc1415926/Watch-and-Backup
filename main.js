const { app, BrowserWindow } = require('electron')
const isDev = require('electron-is-dev');

let devtools = null

function createWindow() {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        x: 100,
        y: 0,
        webPreferences: {
          contextIsolation: false,
          nodeIntegration: true
        }
    })
    //开发时Electron窗口调用'http://localhost:3000'中React动态构建的文件
    //打包后Electron就调用生成的静态React文件
    win.loadURL(isDev ? 'http://localhost:3000' : `file://${__dirname}/build/index.html`);
    
    //把devtools放在一个单独的窗口中并与主窗口分开显示，以免对主窗口中的内容产生干扰
    devtools = new BrowserWindow({x:1000, y:0})
    win.webContents.setDevToolsWebContents(devtools.webContents)
    win.webContents.openDevTools({ mode: 'detach' ,activate: 'false'})
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow()
    }
})