const fs = require('fs-extra');
const path = require('path');

// 文件夹路径
const folderPath = '../../public/static/js';

// 使用 fs-extra 的 emptyDir 方法删除文件夹下所有内容
fs.emptyDir(path.resolve(__dirname, folderPath))
  .then(() => {
    console.log('文件夹已清空');
  })
  .catch(err => {
    console.error('删除文件夹内容时出错:', err)
  })
