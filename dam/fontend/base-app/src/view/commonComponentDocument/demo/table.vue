<template>
  <div>
    <h1>1 表格</h1>
    <span>code@/view/commonComponentDocument/demo/table.vue</span>
    <h2>1.1 基础用法</h2>
    <el-card>
      <el-table :data="tableData" class="datablau-table">
        <el-table-column label="#" prop="id"></el-table-column>
        <el-table-column label="名称" prop="name"></el-table-column>
        <el-table-column label="创建者" prop="owner"></el-table-column>
      </el-table>
      <div>使用 class="datablau-table"套用默认样式</div>
    </el-card>
    <h2>1.2 带复选框</h2>
    <el-card>
      <el-table
        :data="tableData"
        class="datablau-table"
        @selection-change="handleSelectionChange"
      >
        <el-table-column
          type="selection"
          align="left"
          header-align="left"
          width="50"
        ></el-table-column>
        <el-table-column label="#" prop="id"></el-table-column>
        <el-table-column label="名称" prop="name"></el-table-column>
        <el-table-column label="创建者" prop="owner"></el-table-column>
      </el-table>
      <div>
        {{
          selectedRows && selectedRows.length > 0
            ? '当前选中"' + selectedRows.map(i => i.name).join(',') + '"'
            : '当前未选中'
        }}
      </div>
    </el-card>

    <h2>1.3 带排序</h2>
    <el-card>
      <el-table :data="tableData" class="datablau-table">
        <el-table-column label="#" prop="id"></el-table-column>
        <el-table-column label="名称" prop="name" sortable></el-table-column>
        <el-table-column label="创建者" prop="owner" sortable></el-table-column>
      </el-table>
    </el-card>
    <h2>1.4 带右侧固定按钮</h2>
    <el-card>
      <el-table :data="tableData" class="datablau-table">
        <el-table-column label="#" prop="id"></el-table-column>
        <el-table-column label="名称" prop="name"></el-table-column>
        <el-table-column label="创建者" prop="owner"></el-table-column>
        <el-table-column
          label="创建时间"
          prop="createTime"
          :formatter="$timeFormatter"
        ></el-table-column>
        <el-table-column
          fixed="right"
          header-align="right"
          align="right"
          :width="100"
          label="操作"
        >
          <el-button size="mini" type="text">{{ $t('common.button.edit') }}</el-button>
          <el-button size="mini" type="text">{{ $t('common.button.delete') }}</el-button>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      tableData: [
        {
          id: 1,
          name: '内容模板1',
          owner: '超级用户',
          createTime: new Date(1992, 11, 13).getTime(),
        },
        {
          id: 2,
          name: '内容模板2',
          owner: '超级用户',
          createTime: new Date(2017, 5, 1).getTime(),
        },
      ],
      selectedRows: null,
    }
  },
  methods: {
    handleSelectionChange(selection) {
      this.selectedRows = selection
    },
  },
}
</script>

<style scoped lang="scss">
@import './base.scss';
</style>
