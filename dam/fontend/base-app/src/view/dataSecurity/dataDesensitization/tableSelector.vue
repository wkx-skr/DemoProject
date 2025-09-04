<template>
  <div>
    <el-dialog
      title="添加源表"
      :visible.sync="visible"
      width="1000px"
      :close-on-click-modal="false"
      append-to-body
      :before-close="close"
    >
      <div id="dir-rule-selector">
        <el-input
          v-model="keyword"
          placeholder="请输入关键词"
          size="mini"
        ></el-input>
        <div class="table-box">
          <el-table
            ref="table"
            @selection-change="tableSelectionChanged"
            :data="tableData"
            height="100%"
            size="small"
          >
            <el-table-column type="selection" width="55"></el-table-column>
            <el-table-column
              prop="physicalName"
              label="表名"
              min-width="120"
            ></el-table-column>
            <el-table-column
              prop="name"
              label="中文名"
              min-width="120"
            ></el-table-column>
            <el-table-column prop="" label="数据安全等级"></el-table-column>
            <el-table-column prop="" label="脱敏方法"></el-table-column>
          </el-table>
        </div>
        <div class="bottom">
          <div class="button-box">
            <el-button @click="addData" type="primary" size="small">
              添加
            </el-button>
            <el-button type="" size="small" @click="close">
              {{ $t('common.button.cancel') }}
            </el-button>
          </div>
          <el-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page.sync="currentPage"
            :page-sizes="[10, 20, 50, 100]"
            :page-size.sync="pageSize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total"
            class="page"
          ></el-pagination>
        </div>
      </div>
    </el-dialog>
  </div>
</template>
<script>
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
    }
  },
  props: ['id'],
  mounted() {
    this.getOriginTables(this.id)
  },
  methods: {
    getOriginTables(id) {
      this.getTableByModelId(id)
        .then(res => {
          const datas = res.data.content
          this.tableData = datas
          this.total = datas.length
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    getTableByModelId(id) {
      const obj = {
        currentPage: this.currentPage,
        keyword: encodeURI(this.keyword),
        modelId: id,
        pageSize: this.pageSize,
        tagIds: null,
        types: ['TABLE'],
      }
      return this.$http.post(
        `${this.$meta_url}/service/entities/searchMetadata`,
        obj
      )
    },
    handleSizeChange(val) {
      this.pageSize = val
      this.currentPage = 1
      this.getOriginTables()
    },
    handleCurrentChange(val) {
      this.currentPage = val
      this.getOriginTables()
    },
    tableSelectionChanged(selection) {
      this.selection = selection
      //     if (selection.length > 1) {
      //     let del_row = selection.shift()
      //     this.$refs.table.toggleRowSelection(del_row, false)
      //   }
    },
    addData() {
      this.$emit('addData', this.selection)
      this.$emit('close')
    },
    close() {
      this.$emit('close')
    },
  },
  watch: {
    keyword() {
      clearTimeout(this.timer)
      this.timer = setTimeout(() => {
        this.getOriginTables()
      }, 200)
    },
  },
}
</script>
<style lang="scss" scoped>
#dir-rule-selector {
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
<style lang="scss">
// #dir-rule-selector {
//     table th .el-checkbox {
//         display: none;
//     }
// }
</style>
