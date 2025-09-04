<template>
  <div style="margin-bottom: 20px">
    <el-table
      :data="bottomDataRelDbs"
      class="plain-table"
      :stripe="true"
      :header-cell-style="{ 'background-color': '#F1F5F8' }"
    >
      <el-table-column width="30"></el-table-column>
      <el-table-column type="index" width="55" label="排序"></el-table-column>
      <el-table-column
        prop="modelId"
        label="数据库"
        :formatter="modelFormater"
        show-overflow-tooltip
      ></el-table-column>
      <el-table-column prop="tableId" label="表" show-overflow-tooltip>
        <template slot-scope="scope">
          <span
            style="cursor: pointer; color: #811717"
            v-if="scope.row.tableId"
            @click="jumpToTable(scope.row)"
          >
            {{ scope.row.tableName }}
          </span>
          <span v-else>{{ scope.row.tableName }}</span>
        </template>
      </el-table-column>
      <el-table-column
        prop="columnId"
        label="字段"
        :formatter="columnFormater"
        show-overflow-tooltip
      ></el-table-column>
      <!-- <el-table-column
        prop="columnName"
        label="字段"
        show-overflow-tooltip
      ></el-table-column> -->
      <!--<el-table-column
        prop="name"
        width="300"
        label="操作"
      >
        <template slot-scope="scope">
          <el-button type="text">编辑</el-button>
        </template>
      </el-table-column>-->
    </el-table>
  </div>
</template>
<script>
export default {
  props: {
    getData: {
      type: Function,
      required: true,
    },
  },
  data() {
    return {
      bottomDataRelDbs: [],
    }
  },
  mounted() {
    this.getTableData()
  },
  methods: {
    getTableData() {
      this.getData().then(data => {
        this.bottomDataRelDbs = data.relatedTable || []
      })
    },
    modelFormater(row, column, cellValue, index) {
      // console.log(row, 'rel table row')
      let result = ''
      if (row.modelName) {
        result = row.modelName
      } else {
        result = cellValue
      }
      return result
    },
    tableFormater(row, column, cellValue, index) {
      let result = ''
      if (row.tableName) {
        result = row.tableName
      } else {
        result = cellValue
      }
      return result
    },
    columnFormater(row, column, cellValue, index) {
      let result = ''
      if (row.columnName) {
        result = row.columnName
      } else {
        result = cellValue
      }
      return result
    },
    jumpToTable(row) {
      const type = 'TABLE'
      window.open(
        `${location.origin}${location.pathname}#/myItem?objectId=${row.tableId}&type=${type}`
      )
    },
  },
}
</script>
