<template>
  <div class="en-list-box">
    <datablau-dialog
      :title="$t('meta.DS.tableDetail.codeSelect.title')"
      :visible.sync="visible"
      width="1000px"
      :height="606"
      :close-on-click-modal="false"
      append-to-body
      @close="handleClose"
    >
      <div
        style="
          position: relative;
          height: 460px;
          border-bottom: 1px solid #e6e6e6;
        "
      >
        <el-form
          class="st-page-form"
          label-position="right"
          label-width="50px"
          :inline="true"
          :model="searchFormData"
          style="margin-top: 5px"
        >
          <el-form-item>
            <datablau-input
              clearable
              maxlength="100"
              style="width: 275px"
              :placeholder="$t('meta.DS.tableDetail.codeSelect.placeholder')"
              type="text"
              :iconfont-state="true"
              v-model="searchFormData.keyword"
            ></datablau-input>
          </el-form-item>
          <!--      <el-form-item label="代码编号">-->
          <!--        <el-input type="text" clearable maxlength="100" size="mini" v-model="searchFormData.code"></el-input>-->
          <!--      </el-form-item>-->
          <!--      <el-form-item label="代码状态">-->
          <!--        <el-select size="mini" v-model="searchFormData.state">-->
          <!--          <el-option-->
          <!--            v-for="item in stateOptions"-->
          <!--            :key="item.value"-->
          <!--            :value="item.value"-->
          <!--            :label="item.label"-->
          <!--          ></el-option>-->
          <!--        </el-select>-->
          <!--      </el-form-item>-->
          <el-form-item>
            <datablau-button
              size="mini"
              type="normal"
              @click="handleCurrentChange(1)"
            >
              {{ $t('common.button.query') }}
            </datablau-button>
          </el-form-item>
        </el-form>
        <div style="position: absolute; top: 50px; bottom: 0; width: 100%">
          <datablau-table
            class="datablau-table"
            height="100%"
            id="selectDomainCodeTable"
            ref="selectDomainCodeTable"
            :data="tableData"
            v-loading="tableLoading"
            :data-selectable="true"
            @selection-change="tableSelectionChanged"
          >
            <!-- <el-table-column type="selection" width="50"></el-table-column> -->
            <el-table-column
              min-width="120px"
              :label="$t('meta.DS.tableDetail.codeSelect.standardTheme')"
              prop="datasetName"
              show-overflow-tooltip
            ></el-table-column>
            <el-table-column
              min-width="120px"
              :label="$t('meta.DS.tableDetail.codeSelect.name')"
              prop="name"
              show-overflow-tooltip
            ></el-table-column>
            <el-table-column
              :label="$t('meta.DS.tableDetail.codeSelect.enName')"
              prop="enName"
              min-width="120px"
              show-overflow-tooltip
            ></el-table-column>
            <el-table-column
              width="100px"
              :label="$t('meta.DS.tableDetail.codeSelect.code')"
              prop="code"
              show-overflow-tooltip
            ></el-table-column>
            <el-table-column
              :label="$t('meta.DS.tableDetail.codeSelect.state')"
              prop="state"
              :min-width="80"
              show-overflow-tooltip
            >
              <template slot-scope="scope">
                <datablau-status
                  :type="scope.row.resultType"
                  :desc="statusFormatter(scope.row.state)"
                ></datablau-status>
              </template>
            </el-table-column>
            <el-table-column
              :label="$t('meta.DS.tableDetail.codeSelect.submitter')"
              prop="submitter"
              :min-width="80"
              show-overflow-tooltip
            ></el-table-column>
            <el-table-column
              :label="$t('meta.DS.tableDetail.codeSelect.mask')"
              prop="comment"
              :min-width="80"
              show-overflow-tooltip
            ></el-table-column>
          </datablau-table>
          <!--          <template slot="buttons">
            <datablau-pagination
              style="float: right"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
              :current-page="currentPage"
              :page-sizes="[20, 50, 100]"
              :page-size="pageSize"
              :pager-count="5"
              layout="total, sizes, prev, pager, next, jumper"
              :total="total"
            ></datablau-pagination>
            <datablau-button
              @click="handleSelect"
              :disabled="selection.length < 1"
              type="important"
            >
              选定
            </datablau-button>
            <datablau-button type="secondary" @click="visible = false">
              关闭
            </datablau-button>
          </template>-->
        </div>
      </div>
      <div class="dialog-bottom">
        <div style="position: absolute; left: 20px">
          <datablau-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="currentPage"
            :page-sizes="[20, 50, 100]"
            :page-size="pageSize"
            :pager-count="5"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total"
          ></datablau-pagination>
        </div>
        <datablau-button
          @click="handleSelect"
          :disabled="selection.length < 1"
          type="important"
        >
          {{ $t('common.button.sel') }}
        </datablau-button>
        <datablau-button type="secondary" @click="handleClose">
          {{ $t('common.button.close') }}
        </datablau-button>
      </div>
    </datablau-dialog>
  </div>
</template>

<script>
import HTTP from '@/http/main'

export default {
  name: 'codeSelect',
  data() {
    return {
      visible: false,
      dataList: [],
      filteredRules: [],
      tableData: [],
      headers: [],
      rowCanClick: false,
      fullSetting: {
        options: {},
        filters: [],
      },
      filters: [],
      pageSize: 20,
      currentPage: 1,
      total: 0,
      rowClassName: '',
      keyword: '',
      showContent: false,
      tableLoading: false,
      firstTimeout: null,
      tableHeight: null,
      selection: [],
      stateOptions: [
        {
          label: this.$t('meta.DS.tableDetail.codeSelect.all'),
          value: null,
        },
        {
          label: this.$t('meta.DS.tableDetail.codeSelect.C'),
          value: 'C',
        },
        {
          label: this.$t('meta.DS.tableDetail.codeSelect.D'),
          value: 'D',
        },
        {
          label: this.$t('meta.DS.tableDetail.codeSelect.A'),
          value: 'A',
        },
        {
          label: this.$t('meta.DS.tableDetail.codeSelect.X'),
          value: 'X',
        },
      ],
      searchFormData: {
        keyword: '',
        code: '',
        state: null,
      },
    }
  },
  mounted() {
    this.$bus.$on('callDomainCodeSelector', () => {
      this.visible = true
      this.getListData()
    })
  },
  beforeDestroy() {
    this.$bus.$off('callDomainCodeSelector')
  },
  methods: {
    getListData() {
      this.tableLoading = true
      const obj = {
        currentPage: this.currentPage,
        pageSize: this.pageSize,
        name: this.searchFormData.keyword,
        state: 'A',
        datasetName: '',
        categoryId: 1,
      }
      this.$http
        // .post(`${this.$url}/service/domains/code/getPage`, obj)
        .post(`/domain/domains/code/getPage/uncheckRole`, obj)
        // HTTP.getCodeListService(obj)
        .then(res => {
          this.tableLoading = false
          res.data.data.forEach(d => {
            switch (d.state) {
              case 'X':
                this.$set(d, 'resultType', 7) // 废弃
                break
              case 'D':
                this.$set(d, 'resultType', 3) // 待审核
                break
              case 'C':
                this.$set(d, 'resultType', 2) // 审核中
                break
              case 'A':
                this.$set(d, 'resultType', 4) // 已发布
                break
            }
          })
          this.tableData = res.data.data
          this.total = res.data.total
          setTimeout(() => {
            this.tableHeight = document.documentElement.clientHeight - 190
          })
          setTimeout(() => {
            $('#selectDomainCodeTable table th .el-checkbox').css({
              display: 'none',
            })
          }, 10)
        })
        .catch(e => {
          this.tableLoading = false
          this.$showFailure(e)
        })
    },
    handleSizeChange(size) {
      this.pageSize = size
      this.currentPage = 1
      this.getListData()
    },
    handleCurrentChange(current) {
      this.currentPage = current
      this.getListData()
    },
    tableSelectionChanged(selection) {
      this.selection = selection
      if (selection.length > 1) {
        const del_row = selection.shift()
        this.$refs.selectDomainCodeTable.toggleRowSelection(del_row, false)
      }
    },
    statusFormatter(status) {
      const param = {
        value: status,
      }
      switch (param.value) {
        case 'X':
          return this.$t('meta.DS.tableDetail.codeSelect.X')
        case 'D':
          return this.$t('meta.DS.tableDetail.codeSelect.D')
        case 'C':
          return this.$t('meta.DS.tableDetail.codeSelect.C')
        case 'A':
          return this.$t('meta.DS.tableDetail.codeSelect.A')
      }
      return param.value
    },
    handleSelect() {
      this.$bus.$emit('domainCodeSelected', this.selection[0])
      this.visible = false
    },
    handleClose() {
      this.visible = false
      this.searchFormData.keyword = ''
    },
  },
}
</script>
<style lang="scss">
.en-list-box .input input {
  background-color: #f6f6f6;
  border-radius: 3px;
  border: none;
  height: 30px;
  line-height: 30px;
  width: 240px;
}
</style>
<style scoped lang="scss">
.en-list-box {
  padding: 10px 0;
  overflow: auto;

  .content {
    background-color: #fff;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    padding: 15px 20px;
    z-index: 1;
  }
}
.datablau-table {
  .el-table__body-wrapper {
    overflow: auto;
  }
}
.row-filter {
  margin-top: 18px;
  min-width: 600px;
}

.row-table {
  position: absolute;
  top: 90px;
  left: 0;
  right: 0;
  bottom: 50px;
  min-width: 1000px;
  /*outline:1px solid pink;*/
}

.row-pagination {
  position: absolute;
  bottom: 5px;
  left: 20px;
  right: 20px;
  width: 100%;
}

.filter-item {
  margin-left: 1em;

  .label {
    margin-right: 0.5em;
    color: #20293b;
    font-size: 13px;
  }
}
</style>
