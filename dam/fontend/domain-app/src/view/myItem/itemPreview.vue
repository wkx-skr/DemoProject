<template>
  <div style="">
    <el-table
      :data="tableData"
      :header-cell-style="style.headerCellStyle"
      :cell-style="style.cellStyle"
    >
      <el-table-column width="40" align="right">
        <template slot-scope="scope">
          {{ $utils.string.appendLeadingZero(scope.$index + 1) }}
        </template>
      </el-table-column>
      <el-table-column prop="physicalName">
        <span slot="header">headeerfadsf</span>
      </el-table-column>
      <el-table-column prop="logicalName" label="中文名"></el-table-column>
      <el-table-column prop="type" label="数据类型"></el-table-column>
    </el-table>
    <div :style="style.more" v-if="columns.length > 6">
      <el-button type="text" v-if="!showFullData" @click="handleExpand">
        展开其它{{ columns.length - 6 }}条数据
      </el-button>
      <el-button type="text" v-else @click="handleCollapse">收起</el-button>
    </div>
  </div>
</template>
<script>
import * as eChart from 'echarts'
export default {
  data() {
    return {
      columns: [
        {
          name: 'ID',
          chName: '唯一识别编码',
          dataType: 'NUMBER(19)',
        },
      ],
      tableData: [],
      shortTableData: [],
      showFullData: false,
      style: {
        headerCellStyle: {
          backgroundColor: '#EFF2F7',
          height: '42px',
          color: '#606060',
          fontSize: '12px',
        },
        cellStyle: {
          height: '60px',
          fontSize: '12px',
        },
        more: {
          height: '40px',
          lineHeight: '40px',
          textAlign: 'center',
        },
      },
    }
  },
  props: {
    data: {
      type: Array,
    },
  },
  mounted() {
    this.shortTableData = this.columns.slice(0, 6)
    this.tableData = this.shortTableData
  },
  methods: {
    handleExpand() {
      this.showFullData = true
      this.tableData = this.columns
      this.$emit('height-update')
    },
    handleCollapse() {
      this.showFullData = false
      this.tableData = this.shortTableData
      this.$emit('height-update')
    },
  },
}
</script>
