<template>
  <div>
    <datablau-dialog
      title="选择维度"
      :visible.sync="visible"
      size="xl"
      :close-on-click-modal="false"
      @close="handleClose"
      append-to-body
      :height="606"
    >
      <div style="height: 450px; overflow: auto">
        <el-form
          label-position="right"
          label-width="65px"
          :inline="true"
          style="margin-top: 0"
        >
          <el-form-item>
            <datablau-input
              style="width: 238px"
              type="text"
              clearable
              maxlength="100"
              :iconfont-state="true"
              placeholder="请输入"
              v-model="keyword"
            ></datablau-input>
          </el-form-item>
          <el-form-item style="float: right">
            <datablau-input
              style="width: 238px"
              type="text"
              clearable
              maxlength="100"
              :iconfont-state="true"
              placeholder="请输入"
              v-model="tableKeyword"
            ></datablau-input>
          </el-form-item>
        </el-form>
        <div class="typeTable" v-loading="loading">
          <div
            class="dimList"
            :class="actIdx === index ? 'active' : ''"
            v-for="(item, index) in dimList1"
            :key="'a' + index"
            v-show="dimList1.length"
          >
            <div class="dimList_item" @click="getDimValueList(item, index)">
              {{ item.dimensionName }}
            </div>
          </div>
          <div v-if="isEmpty" class="empty">
            <div>暂无数据</div>
          </div>
        </div>

        <div
          style="
            position: absolute;
            top: 44px;
            bottom: 50px;
            right: 20px;
            left: 280px;
            border-bottom: 1px solid #e6e6e6;
          "
        >
          <div style="height: 100%; width: 100%; overflow: auto">
            <datablau-table
              :data="tableData1"
              row-key="codeId"
              ref="selectDimTable"
              :default-expand-all="true"
              :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
              @selection-change="changeSel"
              data-selectable
            >
              <el-table-column
                min-width="120"
                label="中文名称"
                prop="chineseName"
                show-overflow-tooltip
              >
                <template slot-scope="scope">
                  {{ scope.row.chineseName }}
                </template>
              </el-table-column>
              <el-table-column
                min-width="120"
                label="英文名称"
                prop="name"
                show-overflow-tooltip
              >
                <template slot-scope="scope">
                  {{ scope.row.name }}
                </template>
              </el-table-column>
              <el-table-column
                min-width="140"
                label="编码"
                prop="code"
                show-overflow-tooltip
              >
                <template slot-scope="scope">
                  {{ scope.row.code }}
                </template>
              </el-table-column>
            </datablau-table>
          </div>
        </div>
      </div>
      <div class="dialog-bottom">
        <!--        <div style="position: absolute; left: 20px">
          <datablau-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page.sync="currentPage"
            :page-sizes="[20, 50, 100]"
            :page-size="pageSize"
            :pager-count="5"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total"
          ></datablau-pagination>
        </div>-->
        <datablau-button @click="handleClose" type="secondary" style="">
          关闭
        </datablau-button>
        <datablau-button
          @click="handleSelect"
          style=""
          :disabled="selection.length < 1"
          type="important"
        >
          选定
        </datablau-button>
      </div>
    </datablau-dialog>
  </div>
</template>
<script>
export default {
  props: {
    multiple: Boolean
  },
  data () {
    return {
      visible: false,
      keyword: '',
      tableKeyword: '',
      allDimsTree: [], // 树数据
      dimList: [],
      dimList1: [],
      selection: [],
      actIdx: '',
      isEmpty: false,
      tableData: [],
      tableData1: [],
      loading: true,
      keywordSetTimeout: null,
      tableKeywordSetTimeout: null
    }
  },
  mounted () {},
  beforeDestroy () {
    clearTimeout(this.tableKeywordSetTimeout)
    clearTimeout(this.keywordSetTimeout)
  },
  methods: {
    openDialog () {
      this.getDimensionPage()
      this.visible = true
    },
    getDimensionPage () {
      this.loading = true
      const requestUrl = `${this.$metric_url}dimension/page`
      const requestBody = {
        categoryId: null,
        currentPage: 1,
        keyword: '',
        pageSize: 500,
        orderBy: null,
        orderIsAsc: null
      }
      this.$http
        .post(requestUrl, requestBody)
        .then(res => {
          if (res.data) {
            this.loading = false
            this.dimList = res.data.content
            this.dimList1 = _.cloneDeep(this.dimList)
            this.getDimValueList(this.dimList1[0], 0)
          } else {
            this.dimList = []
            this.dimList1 = []
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    getDimValueList (obj, i) {
      this.getValueTree(obj.dimensionId)
      this.actIdx = i
    },
    // 右侧列表
    getValueTree (id) {
      let url = `${this.$metric_url}dimension/tree/get?id=${id}`
      this.$http
        .post(url)
        .then(res => {
          if (res.data && Array.isArray(res.data)) {
            this.tableData = res.data
            this.tableData1 = _.cloneDeep(this.tableData)
            this.total = res.data.length
          } else {
            this.tableData = []
            this.tableData1 = []
            this.total = 0
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    handleClose () {
      this.visible = false
      this.keyword = ''
      this.tableKeyword = ''
      this.tableData = []
      this.tableData1 = []
      this.selection = []
    },
    changeSel (sel) {
      this.selection = sel
      if (!this.multiple && sel.length > 1) {
        const delRow = sel.shift()
        this.$refs.selectDimTable.toggleRowSelection(delRow, false)
      }
    },
    handleSelect () {
      this.$emit('changeSel', this.selection)
      this.visible = false
    }
  },
  watch: {
    keyword (value) {
      this.actIdx = null
      if (!value) {
        this.dimList1 = _.cloneDeep(this.dimList)
      }
      clearTimeout(this.keywordSetTimeout)
      setTimeout(() => {
        this.keywordSetTimeout = setTimeout(() => {
          this.dimList1 = this.dimList.filter(item => {
            return item.dimensionName.includes(value)
          })
          if (this.dimList1.length === 0) {
            this.isEmpty = true
          }
        }, 800)
      })
    },
    tableKeyword (value) {
      clearTimeout(this.tableKeywordSetTimeout)
      setTimeout(() => {
        this.tableKeywordSetTimeout = setTimeout(() => {
          this.tableData1 = this.tableData.filter(item => {
            return item.chineseName.includes(value)
          })
        }, 800)
      })
    }
  }
}
</script>
<style lang="scss">
.el-select > .el-input {
  font-size: 12px;
}
</style>
<style scoped lang="scss">
.typeTable {
  position: absolute;
  top: 50px;
  bottom: 50px;
  left: 20px;
  right: 700px;
  padding: 0;
  border: 1px solid #dddddd;
  overflow: auto;
  .empty {
    margin-top: 40px;
    text-align: center;
  }
  .dimList {
    line-height: 24px;
    cursor: pointer;
    &.active {
      .dimList_item {
        background-color: rgba(64, 158, 255, 0.1);
      }
    }
    .dimList_item {
      padding: 4px 14px;
      &:hover {
        background-color: rgba(64, 158, 255, 0.1);
      }
    }
  }
  &.typeIndexTable {
    top: 11px;
    border-top: 1px solid #dddddd;
  }
}
</style>
