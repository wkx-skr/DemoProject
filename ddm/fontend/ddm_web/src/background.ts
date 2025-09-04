'use strict'

import { app, protocol, BrowserWindow, ipcMain, dialog } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer'
import path from 'path'
const isDevelopment = process.env.NODE_ENV !== 'production'

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } }
])

const { session } = require('electron')

app.whenReady().then(() => {
  const filter = { urls: ['http://*/*'] }
  session.defaultSession.webRequest.onHeadersReceived(filter, (details, callback) => {
    if (details.responseHeaders && details.responseHeaders['Set-Cookie']) {
      for (let i = 0; i < details.responseHeaders['Set-Cookie'].length; i++) {
        let index = details.responseHeaders['Set-Cookie'][i].indexOf('SameSite')
        if (index !== -1) {
          details.responseHeaders['Set-Cookie'][i] = details.responseHeaders['Set-Cookie'][i].slice(0, index) + 'SameSite=None;'
        }
      }
    }
    callback({ responseHeaders: details.responseHeaders })
  })
})

async function createWindow () {
  // Create the browser window.
  console.log(process.versions.chrome)
  app.commandLine.appendSwitch('disable-web-security')
  app.commandLine.appendSwitch('--no-sandbox')
  const win = new BrowserWindow({
    width: 500,
    height: 740,
    resizable: false, // 用户不可以调整窗口
    center: true, // 窗口居中
    transparent: false,
    autoHideMenuBar: !process.env.WEBPACK_DEV_SERVER_URL, // 隐藏菜单栏，由于项目中菜单栏一般用不到，此处隐藏
    backgroundColor: '#455c7c', // 窗口颜色
    modal: true,
    titleBarOverlay: {
      color: 'red',
      symbolColor: 'grey'
    },
    webPreferences: {
      plugins: true,
      webSecurity: false,
      devTools: true,
      // Required for Spectron testing
      // enableRemoteModule: !!process.env.IS_TEST,

      // Use pluginOptions.nodeIntegration, leave this alone
      // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
      // nodeIntegration: (process.env
      //   .ELECTRON_NODE_INTEGRATION as unknown) as boolean,
      nodeIntegration: true,
      nodeIntegrationInWorker: true,
      contextIsolation: false
    }
    // icon: path.join(__dirname, 'public/Datablau.ico')
  })
  // if (process.platform === 'darwin') {
  //   app.dock.setIcon(path.join(__dirname, 'public/Datablau.ico'))
  // }
  let windowToModelIdMap = new Map()
  let modelIdModified = new Set()

  // @ts-ignore
  ipcMain.on('logout', () => {
    win.setOpacity(1)
    win.setResizable(false)
  })

  ipcMain.on('hideWindow', () => {
    win.setOpacity(0)
    win.unmaximize()
    win.setSize(500, 740)
  })
  // @ts-ignore
  ipcMain.on('maxWindow', () => {
    win.setResizable(true)
    win.setMaximizable(true)
    win.maximize()
    win.setOpacity(1)
    win.show()
    win.focus()
  })

  ipcMain.on('newTab', async (event, args) => {
    let row = JSON.parse(args)
    const webEditor = new BrowserWindow({
      width: 1300,
      height: 800,
      autoHideMenuBar: true,
      modal: true,
      transparent: true,
      titleBarOverlay: {
        color: 'red',
        symbolColor: 'grey'
      },
      webPreferences: {
        plugins: true,
        webSecurity: false,
        devTools: true,
        nodeIntegration: true,
        nodeIntegrationInWorker: true,
        contextIsolation: false
      }
    })
    windowToModelIdMap.set(webEditor, +row.id)
    if (process.env.WEBPACK_DEV_SERVER_URL) {
      // Load the url of the dev server if in development mode
      await webEditor.loadURL(process.env.WEBPACK_DEV_SERVER_URL as string + `index.html#/main/modeledit?id=${row.id}&currentVersion=${row.currentVersion}&modelType=${row.modelType}&phase=${row.phase ? row.phase : 0}`)
      // if (!process.env.IS_TEST) win.webContents.openDevTools()
    } else {
      createProtocol('app')
      await webEditor.loadURL(`app://./index.html#/main/modeledit?id=${row.id}&currentVersion=${row.currentVersion}&modelType=${row.modelType}&phase=${row.phase ? row.phase : 0}`)
    }
    webEditor.on('close', (e) => {
      let modelId = windowToModelIdMap.get(webEditor)
      if (modelIdModified.has(modelId)) {
        e.preventDefault()
        dialog.showMessageBox(webEditor, {
          'type': 'warning',
          'title': '提示',
          'message': '还有操作未保存，确定关闭？',
          'buttons': [
            '保存',
            '取消'
          ]
        }).then((result) => {
          if (result.response !== 0) {
            windowToModelIdMap.delete(webEditor)
            modelIdModified.delete(modelId)
            webEditor.close()
            return
          }
          if (result.response === 0) {
            webEditor.webContents.send('openSaveDialog')
            console.log('保存')
          }
        }).catch(() => {

        }).finally(() => {

        })
      } else {
        windowToModelIdMap.delete(webEditor)
      }
    })
    webEditor.once('ready-to-show', () => {
      webEditor.show()
    })
  })

  ipcMain.on('needSave', (event, modelId, needSave) => {
    if (needSave) {
      modelIdModified.add(+modelId)
    } else {
      modelIdModified.delete(+modelId)
    }
  })

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL as string + 'electron/datablau.html?product=ddm')
    // if (!process.env.IS_TEST) win.webContents.openDevTools()
  } else {
    createProtocol('app')
    // Load the index.html when not in development
    await win.loadURL('app://./electron/datablau.html?product=ddm')
  }
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.commandLine.appendSwitch('js-flags', '--max-old-space-size=8192')
app.on('ready', async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      await installExtension(VUEJS_DEVTOOLS)
    } catch (e) {
      console.error('Vue Devtools failed to install:', e.toString())
    }
  }
  createWindow()
  // if (!process.env.WEBPACK_DEV_SERVER_URL) {
  //   const { Menu } = require('electron')
  //   Menu.setApplicationMenu(null)
  //   // hide menu for Mac
  //   if (process.platform !== 'darwin') {
  //     app.dock.hide()
  //   }
  // }
})

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      app.quit()
    })
  }
}
