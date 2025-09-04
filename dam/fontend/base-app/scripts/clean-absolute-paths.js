const fs = require('fs');
const path = require('path');
const glob = require('glob');

// 清理绝对路径的脚本
function cleanAbsolutePaths() {
  console.log('🔍 开始清理绝对路径信息...');
  
  const distDir = path.join(__dirname, '../dist');
  
  if (!fs.existsSync(distDir)) {
    console.log('❌ dist 目录不存在，跳过清理');
    return;
  }

  // 查找所有 JS 文件
  const jsFiles = glob.sync(path.join(distDir, '**/*.js'));
  
  let cleanedFiles = 0;
  
  jsFiles.forEach(filePath => {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;
    
    // 清理 __file 字段
    content = content.replace(/__file:\s*["'][^"']*["']/g, '');
    content = content.replace(/__file:\s*`[^`]*`/g, '');
    
    // 清理可能的绝对路径模式
    content = content.replace(/["']\/Users\/[^"']*["']/g, '""');
    content = content.replace(/["']\/home\/[^"']*["']/g, '""');
    content = content.replace(/["']C:\\[^"']*["']/g, '""');
    content = content.replace(/["']D:\\[^"']*["']/g, '""');
    
    // 清理包含绝对路径的对象属性
    content = content.replace(/,\s*__file\s*:\s*[^,}]+/g, '');
    content = content.replace(/__file\s*:\s*[^,}]+,\s*/g, '');
    
    // 如果内容有变化，写回文件
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      cleanedFiles++;
      console.log(`✅ 已清理: ${path.relative(distDir, filePath)}`);
    }
  });
  
  console.log(`🎉 清理完成！共处理 ${jsFiles.length} 个文件，清理了 ${cleanedFiles} 个文件`);
}

// 如果直接运行此脚本
if (require.main === module) {
  cleanAbsolutePaths();
}

module.exports = cleanAbsolutePaths; 