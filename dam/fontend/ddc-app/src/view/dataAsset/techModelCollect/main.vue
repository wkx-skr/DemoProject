<!-- 页面初始化 -->
<template>
  <div class="main">
    <div class="main-content">
      <div class="main-content-header">
        <h1>技术元数据查询</h1>
      </div>
      <div class="main-content-body">
        <el-row :gutter="20">
          <el-col :span="24">
            <el-card>
              <el-table :data="tableData">
                <el-table-column
                  prop="name"
                  label="名称"
                  width="180"
                ></el-table-column>
                <el-table-column
                  prop="type"
                  label="类型"
                  width="180"
                ></el-table-column>
                <el-table-column
                  prop="description"
                  label="描述"
                  width="180"
                ></el-table-column>
              </el-table>
            </el-card>
          </el-col>
        </el-row>
      </div>
    </div>
  </div>
</template>
<!-- 页面脚本 -->
<script>
export default {
  name: 'techModelCollect',
  data() {
    return {
      tableData: [],
    }
  },
  mounted() {
    this.fetchData()
  },
  methods: {
    fetchData() {
      // 模拟数据获取
      this.tableData = [
        { name: '模型1', type: '类型1', description: '描述1' },
        { name: '模型2', type: '类型2', description: '描述2' },
        { name: '模型3', type: '类型3', description: '描述3' },
      ]
    },
  },
}
</script>
