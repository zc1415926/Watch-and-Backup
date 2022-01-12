const { app, BrowserWindow } = require('electron')
const isDev = require('electron-is-dev');

function createWindow() {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true
        }
    })
    // 这里对官网代码进行了修改，因为cra是启动了web服务而非静态文件
    // win.loadFile('index.html');
    win.loadURL(isDev ? 'http://localhost:3000' : `file://${__dirname}/build/index.html`);
    //win.webContents.openDevTools();
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