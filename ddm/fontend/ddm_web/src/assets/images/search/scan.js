const fs = require('fs');
const path = require('path');

// 输入目录地址
const inputDirectory = process.argv[2];

// 输出 JSON 文件路径
const outputJsonFile = process.argv[3];

// 用于存储文件信息的数组
const fileInfoArray = [];

// 扫描目录
fs.readdir(inputDirectory, (error, files) => {
  if (error) {
    console.error('无法读取目录:', error);
    return;
  }

  // 遍历文件列表
  files.forEach(fileName => {
    // 获取文件的完整路径
    const filePath = path.join(inputDirectory, fileName);

    // 获取文件信息
    const fileInfo = {
      type: fileName.replace(/\.([^\.]+)$/, ''),
      iconType: path.extname(filePath).replace(/^\./, ''),
    };
    fileInfo.name = fileInfo.type

    // 将文件信息添加到数组中
    fileInfoArray.push(fileInfo);
  });

  // 清空输出文件的内容
  fs.writeFile(outputJsonFile, '', (error) => {
    if (error) {
      console.error('无法清空输出文件:', error);
      return;
    }

    // 将文件信息数组写入 JSON 文件
    fs.writeFile(outputJsonFile, JSON.stringify(fileInfoArray), (error) => {
      if (error) {
        console.error('无法写入 JSON 文件:', error);
        return;
      }

      console.log('文件信息已成功写入 JSON 文件');
    });
  });
});
