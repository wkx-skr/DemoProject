const path = require('path')
const fs = require('fs');

// 要删除的文件列表
const filesToDelete = [
  '../views/list/graph/modelGraphEdit.vue',
  '../views/list/graph/modelGraphEdit.js',
  '../views/list/graph/modelGraph.vue',
  '../views/list/graph/modelGraph.js',
  '../views/list/graph/DrawGraph.js',
  '../views/list/graph/DrawGraphEdit.js',
  '../views/list/graph/editComponents/addEntityDialog.vue',
  '../views/list/graph/editComponents/colDetails.vue',
  '../views/list/graph/editComponents/createEdgeDetails.vue',
  '../views/list/graph/editComponents/diagramDetails.vue',
  '../views/list/graph/editComponents/dwMapping.vue',
  '../views/list/graph/editComponents/edgeDetails.vue',
  '../views/list/graph/editComponents/editUdp.js',
  '../views/list/graph/editComponents/editUdp.vue',
  '../views/list/graph/editComponents/indexColumnsEditor.vue',
  '../views/list/graph/editComponents/indexEditor.js',
  '../views/list/graph/editComponents/indexEditor.vue',
  '../views/list/graph/editComponents/modelDetails.vue',
  '../views/list/graph/editComponents/namingOption.vue',
  '../views/list/graph/editComponents/namingStandards.vue',
  '../views/list/graph/editComponents/opacityComponent.vue',
  '../views/list/graph/editComponents/partionEditor.vue',
  '../views/list/graph/editComponents/subtypeDetail.vue',
  '../views/list/graph/editComponents/tableDetail.js',
  '../views/list/graph/editComponents/tableDetails.vue',
  '../views/list/graph/editComponents/udp.js',
  '../views/list/graph/editComponents/udp.vue',
  '../views/list/graph/editComponents/udpList.vue',
  '../views/list/graph/editComponents/viewColDetails.vue',
  '../views/list/graph/editComponents/viewDetail.js',
  '../views/list/graph/editComponents/viewDetails.vue'
];

// 遍历文件列表，逐个删除文件
filesToDelete.forEach(filePath => {
  fs.unlink(path.resolve(__dirname, filePath), (err) => {
    if (err) {
      console.error(`删除文件 ${filePath} 出错：`, err);
    } else {
      console.log(`已删除文件：${filePath}`);
    }
  });
});
