// 生成200个系统的模拟数据：可以自定义数量
function generateMockData() {
  // 1. 生成所有系统基本信息 (200个) 这里模拟生成N条
  const allSystemData = [];
  for (let i = 1; i <= 70; i++) {
    allSystemData.push({
      categoryId: i,
      categoryName: `系统${i}`,
      // 其他字段可以省略或填充默认值
      categoryAbbreviation: `Sys${i}`,
      description: `这是系统${i}的描述`,
      itDepartment: "00001",
      itDepartmentName: "数字与信息化部",
      // ...其他字段可以根据需要添加
    });
  }

  // 2. 生成系统关系图数据
  const graphData = {};
  const connectionSet = new Set(); // 用于记录已存在的连接(避免重复)

  // 初始化所有系统节点
  allSystemData.forEach(sys => {
    graphData[sys.categoryId] = {
      left: [], // 上游系统
      right: [] // 下游系统
    };
  });

  // 3. 创建系统连接 (确保连接合理分布)
  const systemIds = allSystemData.map(sys => sys.categoryId);

  // 创建主要连接链 (确保所有系统连通)
  for (let i = 1; i < systemIds.length; i++) {
    const from = systemIds[i - 1];
    const to = systemIds[i];
    const key = `${Math.min(from, to)}-${Math.max(from, to)}`;

    if (!connectionSet.has(key)) {
      connectionSet.add(key);

      // 随机决定方向
      if (Math.random() > 0.5) {
        graphData[from].right.push(getSystemInfo(allSystemData, to));
        graphData[to].left.push(getSystemInfo(allSystemData, from));
      } else {
        graphData[to].right.push(getSystemInfo(allSystemData, from));
        graphData[from].left.push(getSystemInfo(allSystemData, to));
      }
    }
  }

  // 4. 添加随机连接 (增加复杂性)
  const connectionCount = Math.floor(systemIds.length * 1.5); // 约300个额外连接
  for (let i = 0; i < connectionCount; i++) {
    const fromIndex = Math.floor(Math.random() * systemIds.length);
    let toIndex;
    do {
      toIndex = Math.floor(Math.random() * systemIds.length);
    } while (toIndex === fromIndex); // 确保不连接自己

    const from = systemIds[fromIndex];
    const to = systemIds[toIndex];
    const key = `${Math.min(from, to)}-${Math.max(from, to)}`;

    // 如果连接不存在则创建
    if (!connectionSet.has(key)) {
      connectionSet.add(key);

      // 随机决定方向
      if (Math.random() > 0.5) {
        graphData[from].right.push(getSystemInfo(allSystemData, to));
        graphData[to].left.push(getSystemInfo(allSystemData, from));
      } else {
        graphData[to].right.push(getSystemInfo(allSystemData, from));
        graphData[from].left.push(getSystemInfo(allSystemData, to));
      }
    }
  }

  // 5. 确保部分系统是独立的 (约10%的系统)
  const independentCount = Math.floor(systemIds.length * 0.1);
  for (let i = 0; i < independentCount; i++) {
    const index = Math.floor(Math.random() * systemIds.length);
    const id = systemIds[index];

    // 清除该系统的所有连接
    graphData[id].left = [];
    graphData[id].right = [];

    // 从其他系统中移除指向该系统的连接
    systemIds.forEach(otherId => {
      if (otherId !== id) {
        graphData[otherId].left = graphData[otherId].left.filter(
          sys => sys.categoryId !== id
        );
        graphData[otherId].right = graphData[otherId].right.filter(
          sys => sys.categoryId !== id
        );
      }
    });
  }

  return {graphData, allSystemData};
}

// 辅助函数：根据ID获取系统信息
function getSystemInfo(allSystems, id) {
  const system = allSystems.find(sys => sys.categoryId === id);
  // 返回系统信息的副本，避免引用问题
  return system ? {...system} : null;
}

// 生成模拟数据
const {graphData, allSystemData} = generateMockData();

// 导出数据
export {graphData, allSystemData};
