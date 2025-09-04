<template>
  <div :style="style.container">
    <div id="relation-network"></div>
    <div :style="style.tableBox" v-if="tableDisplay">
      <!--<div :style="style.tableHeader"><i class="fa fa-link"></i> 与此表有关的数据</div>-->
      <el-table
        :data="tableData"
        id="relation-detail-table"
        :show-header="false"
        :row-class-name="tableRowClassName"
      >
        <el-table-column>
          <template slot-scope="scope">
            <div v-html="scope.row.detail"></div>
          </template>
        </el-table-column>
        <!--<el-table-column
          prop="sourceTable"
          show-overflow-tooltip
        >
        </el-table-column>
        <el-table-column
          prop="sourceColumn"
          show-overflow-tooltip
        >
        </el-table-column>
        <el-table-column
          prop="targetTable"
          show-overflow-tooltip
        >
        </el-table-column>
        <el-table-column
          prop="targetColumn"
          show-overflow-tooltip
        >
        </el-table-column>-->
      </el-table>
    </div>
  </div>
</template>
<script>
import relation from './relation.js'
export default relation
</script>
<style lang="scss" scoped>
#relation-network {
  position: absolute;
  top: 0;
  left: 0;
  right: 450px;
  bottom: 0;
}
</style>
<style lang="scss">
.el-table .warning-row {
  background: #f1f4f8;
}
#relation-detail-table {
  .cell {
    padding: 5px 0;
  }
}
</style>
