const { app, BrowserWindow, ipcMain, dialog, nativeImage, desktopCapturer} = require('electron')
const isDev = require('electron-is-dev');
const fs = require('fs-extra')
const moment = require('moment')
const shelljs = require('shelljs')

let devtools = null

//在这里获取本地文件夹中的截图文件
ipcMain.handle('get-capture-files', ()=>{

    let captureFiles = [];

    //shelljs.ls()的固定写法就是后边接一个forEach来处理里边的第一项，这里把他们放到一个新的数组里边去
    shelljs.ls('Capture*.jpg').forEach(element => {
        captureFiles.push(app.getAppPath()+ '\\'+element);
    }); 

    //返回的就是所有截图文件完整地址的数组
    return captureFiles
})

//主进程写入文件，这里要传参数别忘了默认第一个参数是event
// ipcMain.handle('write-image', async (e, data) =>{

//     //使用moment模块来生成一个方便人看，同时又不会重复的文件名，“-X”是Linux时间戳
//     const timestamp = moment(new Date()).format('YYYY.MM.DD-HH.mm.ss-X')
//     //使用fs-extra模块异步写入文件，等文件写入完成后，再完成handle函数，返回到invoke
//     await fs.outputFile(`./Capture_${timestamp}.jpg`, data)

//     //这里返回的文件名在renderer里没有用到
//     return `./Capture_${timestamp}.jpg`
// })

ipcMain.handle('capture-screen', async ()=>{
    //截图现在只能在主进程里进行：https://www.electronjs.org/docs/latest/breaking-changes#removed-desktopcapturergetsources-in-the-renderer
    const sources = await desktopCapturer.getSources({types: ['screen']})
    //把第一个屏幕的截图转换成90%的JPEG数据
    const imageJpg = sources[0].thumbnail.toJPEG(90);

    //使用moment模块来生成一个方便人看，同时又不会重复的文件名，“-X”是Linux时间戳
    const timestamp = moment(new Date()).format('YYYY.MM.DD-HH.mm.ss-X')
    //使用fs-extra模块异步写入文件，等文件写入完成后，再完成handle函数，返回到invoke
    await fs.outputFile(`./Capture-${timestamp}.jpg`, imageJpg)
    
    return imageJpg
})

ipcMain.handle('delete-file', async(e, fileName)=>{

    try {
        await fs.remove('./'+fileName)
    } catch (error) {
        console.error(error)
    }

    return fileName + ' removed'
})
ipcMain.handle('write-setting', async (e, data)=>{
    settingObj = {"captureFiles": data}

    try {
        await fs.outputJson('./setting.json', settingObj)
    } catch (error) {
        console.error(error)
    }
})
ipcMain.handle('get-setting-file', async ()=>{
    
    let setting = {}

    try {
        setting = await fs.readJSON('./setting.json')
    } catch (error) {
       // console.error(error)
        console.error(error.message)
        console.error(error.name)
        setting = {}
    }

    return setting
})
 
ipcMain.on('select-files1', (e)=>{
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

ipcMain.handle('select-files', async (e)=>{
    const result = await dialog.showOpenDialog({properties: ['openFile', 'multiSelections']})
    console.log(result.canceled)
    console.log(result.filePaths)
    
    return result.filePaths
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