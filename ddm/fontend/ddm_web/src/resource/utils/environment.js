// 检测是否在 Electron 环境中运行
let inElectron = false

// 方法1: 通过 userAgent 检测
let userAgent = navigator.userAgent.toLowerCase()
if (userAgent.indexOf(' electron/') > -1) {
  inElectron = true
}

// 方法2: 通过 window.process 检测
try {
  if (window && window.process && window.process.versions && window.process.versions.electron) {
    inElectron = true
  }
} catch (e) {
  // 忽略错误
}

export default inElectron
