
const path = require('path')
const fse = require('fs-extra');

// 源文件夹路径
const sourceFolderPath = '../../dist/';
// 目标文件夹路径
const targetFolderPath = '../../public/static/js/';

// 使用 fs-extra 的 copy 方法进行拷贝
fse.copy(path.resolve(__dirname, sourceFolderPath), path.resolve(__dirname, targetFolderPath), (err) => {
  if (err) {
    console.error('拷贝文件夹时出错:', err);
  } else {
    console.log('文件夹拷贝完成');
  }
});
