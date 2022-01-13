const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const isDev = require('electron-is-dev');
const fs = require('fs')
const moment = require('moment')

let devtools = null

ipcMain.handle('app-path', ()=>{
    return app.getPath('desktop')
})

//主进程写入文件，这里要传参数别忘了默认第一个参数是event
ipcMain.handle('write-image', (e, data) =>{
    const timestamp = moment(new Date()).format('YYYY.MM.DD-HH.MM.SS-X')
    console.log(timestamp)
    fs.writeFile(`./${timestamp}.jpg`, data, console.log)
})

ipcMain.on('select-files', (e)=>{
    dialog.showOpenDialog({
        properties: ['openFile', 'multiSelections']})
        .then(result=>{
          //console.log(result.canceled)
          console.log(result.filePaths)
    
          e.reply('file-list', result.filePaths)
        //   fileWatcher.on('change', path => {
        //     console.log(`File ${path} has been changed`);
        //   }) 
        }).catch(err=>{
          console.log(err)
        })
})

function createWindow() {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        x: 1200,
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
    devtools = new BrowserWindow({x:2300, y:300})
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