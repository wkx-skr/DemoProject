const fs = require('fs')
const path = require('path')
const json = require('./i18n.json')
// 将要保存文件的路径
const filePath = path.join(__dirname, ' i18n.txt')
const dataString = json.join('\n')
// 使用fs模块将字符串写入文件
fs.writeFile(filePath, dataString, err => {
  if (err) {
    console.error('写入文件时发生错误:', err)
    return
  }
  console.log('文件已保存到:', filePath)
})
