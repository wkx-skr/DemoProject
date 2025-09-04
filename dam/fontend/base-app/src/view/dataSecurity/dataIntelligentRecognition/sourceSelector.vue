<template>
  <div>
    <el-dialog
      title="添加数据源"
      :visible.sync="visible"
      width="1000px"
      :close-on-click-modal="false"
      append-to-body
      :before-close="close"
    >
      <div id="dir-ds-selector">
        <data-source-selector
          @selectionChange="selectionChange"
        ></data-source-selector>
        <div class="button-box">
          <el-button type="primary" size="mini" @click="addDs">添加</el-button>
          <el-button type="" size="mini" @click="close">关闭</el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import dataSourceSelector from './dataSourceSelector/dataSourceTab.vue'
import HTTP from '@/http/main.js'

export default {
  data() {
    return {
      visible: true,
      keyword: '',
      tableLoading: false,
      tableData: [],
      currentPage: 1,
      pageSize: 20,
      total: 0,
      selection: [],
      currentDs: null,
    }
  },
  components: {
    dataSourceSelector,
  },
  mounted() {
    this.getRules()
  },
  methods: {
    getRules() {
      this.tableLoading = true
      HTTP.getDIscernRules({
        keyword: '',
        page: this.currentPage,
        size: this.pageSize,
      })
        .then(res => {
          this.tableLoading = false
          const data = res.data
          this.tableData = data.content
          this.total = data.totalItems
        })
        .catch(err => {
          this.tableLoading = false
          console.error(err)
          this.$showFailure(err)
        })
    },
    handleSizeChange(val) {
      this.pageSize = val
      this.currentPage = 1
      this.getRules()
    },
    handleCurrentChange(val) {
      this.currentPage = val
      this.getRules()
    },
    tableSelectionChanged(selection) {
      console.log(selection, 234)
      this.selection = selection
    },
    selectionChange(val) {
      this.currentDs = val
    },
    addDs() {
      this.$emit('addDs', this.currentDs)
      this.$emit('close')
    },
    close() {
      this.$emit('close')
    },
  },
}
</script>
<style lang="scss" scoped>
#dir-ds-selector {
  width: 100%;
  height: 520px;
  .table-box {
    height: 460px;
  }
  .buttom {
    padding-top: 6px;
  }
  .button-box {
    position: absolute;
    bottom: 5px;
    right: 18px;
  }
  //  position: absolute;
  //  top: -50px;
  //  left: 0;
  //  right: 0;
  //  bottom: 0;
  //  z-index: 5;
  //  background-color: rgba(0,0,0,0.6);
}
</style>
