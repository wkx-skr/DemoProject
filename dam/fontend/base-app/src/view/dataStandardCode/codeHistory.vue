/** * codeHistory.vue */
<template>
  <div class="code-history">
    <datablau-table
      :data="tableData"
      @selection-change="versionSelect"
      size="mini"
      v-loading="tableLoading1"
      :max-height="tableHeight"
      class="datablau-table"
      ref="multipleTable"
      :data-selectable="true"
    >
      <el-table-column
        prop="timestamp"
        :label="$t('domain.code.operationTime')"
        :formatter="$timeFormatter"
      ></el-table-column>
      <el-table-column
        prop="operator"
        :label="$t('domain.code.operator')"
      ></el-table-column>
      <el-table-column
        prop="changes"
        :label="$t('domain.code.change')"
      ></el-table-column>
    </datablau-table>
    <div style="margin-top: 20px">
      <datablau-button
        icon="fa fa-files-o"
        type="primary"
        size="small"
        @click="versionCompare"
        :disabled="CompareDisabled"
        :tooltip-content="
          CompareDisabled ? $t('domain.code.chooseTwoVersions') : ''
        "
      >
        {{ $t('domain.code.versionComparison') }}
      </datablau-button>
    </div>
    <el-dialog
      class="jobs-sta"
      :title="$t('domain.code.compareResults')"
      :visible.sync="showVersionCompareDialog"
      append-to-body
      :close-on-click-modal="false"
    >
      <span class="sub-title">{{ $t('domain.code.codeDetail') }}</span>
      <el-checkbox v-model="onlyShowChange1">
        {{ $t('domain.code.onlyShowChange') }}
      </el-checkbox>
      <el-table
        class="table1"
        max-height="200"
        ref="domainTable"
        :data="compareResultTableData"
        size="small"
        :cell-style="cellStyle"
        v-loading="tableLoading"
        border
      >
        <el-table-column
          :label="$t('domain.code.attrVersion')"
          prop="key"
        ></el-table-column>
        <el-table-column
          :label="smallVersionName1"
          prop="tagValue"
        ></el-table-column>
        <el-table-column
          :label="smallVersionName2"
          prop="srcValue"
        ></el-table-column>
      </el-table>
      <span v-if="!showCodeDetail" class="sub-title">
        {{ $t('domain.code.codeValue') }}
      </span>
      <el-checkbox v-if="!showCodeDetail" v-model="onlyShowChange2">
        {{ $t('domain.code.onlyShowChange') }}
      </el-checkbox>
      <el-table
        v-if="!showCodeDetail"
        class="table2"
        max-height="200"
        ref="domainTable"
        :data="compareResultTableData2"
        size="small"
        :cell-style="cellStyle2"
        @row-click="handleRowClick"
        v-loading="tableLoading"
        border
      >
        <el-table-column
          show-overflow-tooltip
          :label="$t('domain.code.codePropCode')"
          prop="order"
        ></el-table-column>
        <el-table-column
          show-overflow-tooltip
          :label="$t('domain.code.codeValue')"
          prop="value"
        ></el-table-column>
        <el-table-column
          show-overflow-tooltip
          :label="$t('domain.code.cName')"
          prop="name"
        ></el-table-column>
        <el-table-column
          show-overflow-tooltip
          :label="$t('domain.code.remark1')"
          prop="definition"
        ></el-table-column>
        <el-table-column
          show-overflow-tooltip
          :label="$t('domain.code.remark2')"
          prop="definition2"
        ></el-table-column>
        <el-table-column
          show-overflow-tooltip
          :label="$t('domain.code.remark3')"
          prop="definition3"
        ></el-table-column>
        <el-table-column
          show-overflow-tooltip
          :label="$t('domain.code.changeType')"
          prop="type"
        ></el-table-column>
      </el-table>
      <el-pagination
        v-if="!showCodeDetail"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page.sync="currentPage"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        style="margin-top: 5px"
        class="page"
      ></el-pagination>
      <span v-if="showCodeDetail" class="sub-title">
        {{ $t('domain.code.valueDetail') }}
      </span>
      <el-checkbox v-if="showCodeDetail" v-model="onlyShowChange3">
        {{ $t('domain.code.onlyShowChange') }}
      </el-checkbox>
      <span
        style="margin-left: 20px"
        v-if="showCodeDetail"
        class="d-return icon-i-return return"
        @click="showCodeDetail = false"
      ></span>
      <el-table
        v-if="showCodeDetail"
        class="table1"
        max-height="200"
        :data="compareResultTableData3"
        size="small"
        :cell-style="cellStyle"
        border
      >
        <el-table-column
          :label="$t('domain.code.attrVersion')"
          prop="name"
        ></el-table-column>
        <el-table-column
          :label="smallVersionName1"
          prop="tagValue"
        ></el-table-column>
        <el-table-column
          :label="smallVersionName2"
          prop="srcValue"
        ></el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script>
import HTTP from '@/http/main'
export default {
  data() {
    return {
      totalShow: 0,
      columnDefs: null,
      hideTopLine: true,
      showBottom: true,
      lastSelected: [],
      showCompareDailog: false,
      oldVersions: null,
      showVersionCompareDialog: false,
      onlyShowChange1: false,
      onlyShowChange2: false,
      compareResultTableData: [],
      compareResultTableData2: [],
      compareResultTableData3: [],
      // allCompareResultTableData: [],
      // allCompareResultTableData2: [],
      // allCompareResultTableData3: [],
      smallVersionName1: '',
      smallVersionName2: '',
      CompareDisabled: true,
      selection: [],
      cancelCheck: {},
      ChEnObj: {},
      allData: {},
      showCodeDetail: false,
      onlyShowChange3: false,
      tableLoading: false,
      tableLoading1: false,
      pageSize: 10,
      currentPage: 1,
      total: 0,
      tableData: [],
      tableHeight: null,
      deleteArr: [
        'compareResultTableData',
        'compareResultTableData2',
        'compareResultTableData3',
        'ChEnObj',
      ],
    }
  },
  // props: {
  // codeData: {
  //   type: Object,
  //   required: true,
  // },
  // currentCodeData: {
  //   type: Object,
  //   default() {
  //     return {};
  //   }
  // }
  // },
  inject: ['categoryId'],
  props: ['codeDataCode'],
  components: {
    // versionCompare
  },
  computed: {
    couldCompare() {
      return this.selection.length === 2
    },
    compareVersions() {
      const result = []
      this.lastSelected.forEach(node => {
        result.push(node.data.version + 1)
      })
      result.sort((a, b) => {
        return a - b
      })
      return result
    },
  },
  mounted() {
    this.getTableData()
    this.tableHeight = document.documentElement.clientHeight - 150
  },
  beforeDestroy() {
    setTimeout(() => {
      this.clearData()
    }, 3000)
  },
  methods: {
    clearData() {
      window.sessionStorage.removeItem('allCompareResultTableData')
      window.sessionStorage.removeItem('allCompareResultTableData2')
      window.sessionStorage.removeItem('compareResultTableData2')
      window.sessionStorage.removeItem('allCompareResultTableData3')
    },
    getAllHistory() {
      const para = {
        currentPage: 1,
        pageSize: 999,
        code: this.codeDataCode,
        categoryId: this.categoryId,
      }
      return HTTP.getCodeHistoryService(para)
      // const url = `${this.$url}/service/domains/codes/history?currentPage=1&pageSize=999&codeNumber=${this.codeDataCode}`
      // return this.$http.get(url)
    },
    getOldVersions() {
      const para = {
        code: this.codeDataCode,
        categoryId: this.categoryId,
      }
      return HTTP.getCodeOldVersionsService(para)
    },
    getTableData() {
      this.tableLoading1 = true
      this.getAllHistory()
        .then(res => {
          this.getOldVersions()
            .then(data => {
              this.tableLoading1 = false
              const vers = data.data
              if (vers && Array.isArray(vers) && vers.length > 0) {
                this.tableData.push(...res.data.content)
              }
            })
            .catch(() => {
              this.tableLoading1 = false
            })
          // setTimeout(() => {
          //   $('table th .el-checkbox').remove()
          // }, 10)
        })
        .catch(() => {
          this.tableLoading = false
        })
    },
    // compare2Version() {
    //   this.$refs.versionCompare && this.$refs.versionCompare.refreshData && this.$refs.versionCompare.refreshData();
    //   this.showCompareDailog = true;
    // },
    versionSelect(selection) {
      if (selection.length > 2) {
        const del_row = selection.shift()
        this.$refs.multipleTable.toggleRowSelection(del_row, false)
      }
      if (selection.length === 2) {
        this.selection = selection.sort((a, b) => {
          return a.timestamp - b.timestamp
        })
        this.CompareDisabled = false
        this.smallVersionName1 = this.selection[0].version.toString()
        this.smallVersionName2 = this.selection[1].version.toString()
      } else {
        this.CompareDisabled = true
      }
    },
    EnToCh(key) {
      return this.ChEnObj[key]
    },
    getChEnObj() {
      return new Promise(resolve => {
        HTTP.codeGetColumnMapping({ categoryId: this.categoryId })
          .then(res => {
            this.ChEnObj = res.data
            resolve()
          })
          .catch(e => {
            this.$showFailure(e)
          })
      })
    },
    async versionCompare() {
      this.tableLoading = true
      this.showCodeDetail = false
      await this.getChEnObj()
      this.showVersionCompareDialog = true
      this.onlyShowChange = false
      HTTP.codeCompareVersionService({
        code: this.codeDataCode,
        categoryId: this.categoryId,
        srvVersion: this.smallVersionName1,
        tagVersion: this.smallVersionName2,
      })
        .then(res => {
          this.compareResultTableData = res.data.standardCompareResult
          window.sessionStorage.setItem(
            'allCompareResultTableData',
            JSON.stringify(res.data.standardCompareResult)
          )
          const codeArr = []
          res.data.addCodes.forEach(e => {
            const obj = {
              order: e.order,
              value: e.value,
              name: e.name,
              definition: e.definition,
              definition2: e.definition2,
              definition3: e.definition3,
              type: this.$t('domain.code.changeTypeAdd'),
              data: {
                tagValue: null,
                srcValue: e,
              },
            }
            codeArr.push(obj)
          })
          res.data.deleteCodes.forEach(e => {
            const obj = {
              order: e.order,
              value: e.value,
              name: e.name,
              definition: e.definition,
              definition2: e.definition2,
              definition3: e.definition3,
              type: this.$t('domain.code.changeTypeDel'),
              data: {
                tagValue: e,
                srcValue: null,
              },
            }
            codeArr.push(obj)
          })
          res.data.noChangeCode.forEach(e => {
            const obj = {
              order: e.order,
              type: this.$t('domain.code.changeTypeEmpty'),
              name: e.name,
              value: e.value,
              definition: e.definition,
              definition2: e.definition2,
              definition3: e.definition3,
              data: {
                tagValue: e,
                srcValue: e,
              },
            }
            codeArr.push(obj)
          })
          for (const item in res.data.modifyCodes) {
            if (res.data.modifyCodes.hasOwnProperty(item)) {
              const obj = {
                order: item,
                type: this.$t('domain.code.changeTypeModify'),
                name: res.data.modifyCodes[item][1].srcValue,
                value: res.data.modifyCodes[item][0].srcValue,
                definition: res.data.modifyCodes[item][3].srcValue,
                definition2: res.data.modifyCodes[item][4].srcValue,
                definition3: res.data.modifyCodes[item][5].srcValue,
                data: {
                  tagValue: {
                    name: res.data.modifyCodes[item][1].tagValue,
                    value: res.data.modifyCodes[item][0].tagValue,
                    definition: res.data.modifyCodes[item][3].tagValue,
                    definition2: res.data.modifyCodes[item][4].tagValue,
                    definition3: res.data.modifyCodes[item][5].tagValue,
                    order: res.data.modifyCodes[item][2].tagValue,
                  },
                  srcValue: {
                    name: res.data.modifyCodes[item][1].srcValue,
                    value: res.data.modifyCodes[item][0].srcValue,
                    definition: res.data.modifyCodes[item][3].srcValue,
                    definition2: res.data.modifyCodes[item][4].srcValue,
                    definition3: res.data.modifyCodes[item][5].srcValue,
                    order: res.data.modifyCodes[item][2].srcValue,
                  },
                },
              }
              codeArr.push(obj)
            }
          }
          codeArr.sort((a, b) => {
            return a.order - b.order
          })
          this.tableLoading = false
          this.total = codeArr.length
          window.sessionStorage.setItem(
            'allCompareResultTableData2',
            JSON.stringify(codeArr)
          )
          window.sessionStorage.setItem(
            'compareResultTableData2',
            JSON.stringify(codeArr)
          )
          this.handleCurrentChange(1)
        })
        .catch(e => {
          this.tableLoading = false
          this.$showFailure(e)
        })
    },
    statusFormatter(status) {
      switch (status) {
        case 'X':
          return this.$t('domain.common.obsolete')
        case 'D':
          return this.$t('domain.common.pendingReview')
        case 'C':
          return this.$t('domain.common.underReview')
        case 'A':
          return this.$t('domain.common.published')
      }
    },
    handleRowClick(row) {
      const rowArr = []
      if (row.type === this.$t('domain.code.changeTypeAdd')) {
        for (const key in row.data.srcValue) {
          if (row.data.srcValue.hasOwnProperty(key)) {
            if (key !== 'domainId' && key !== 'domainCode') {
              const obj = {
                name: key,
                srcValue: JSON.stringify(row.data.srcValue[key]),
                tagValue: null,
              }
              rowArr.push(obj)
            }
          }
        }
      } else if (row.type === this.$t('domain.code.changeTypeDel')) {
        for (const key in row.data.tagValue) {
          if (row.data.tagValue.hasOwnProperty(key)) {
            if (key !== 'domainId' && key !== 'domainCode') {
              const obj = {
                name: key,
                srcValue: null,
                tagValue: JSON.stringify(row.data.tagValue[key]),
              }
              rowArr.push(obj)
            }
          }
        }
      } else {
        for (const key in row.data.tagValue) {
          if (row.data.tagValue.hasOwnProperty(key)) {
            if (key !== 'domainId' && key !== 'domainCode') {
              const obj = {
                name: key,
                srcValue: JSON.stringify(row.data.srcValue[key]),
                tagValue: JSON.stringify(row.data.tagValue[key]),
              }
              rowArr.push(obj)
            }
          }
        }
      }
      const ar = []
      rowArr.forEach(e => {
        e.name =
          this.EnToCh('2_' + e.name) ||
          this.EnToCh('3_' + e.name) ||
          this.EnToCh('1_' + e.name)
        if (e.name === this.$t('domain.common.standardStatus')) {
          e.srcValue = this.statusFormatter(JSON.parse(e.srcValue))
          e.tagValue = this.statusFormatter(JSON.parse(e.tagValue))
        }
        if (
          e.name &&
          e.name !== this.$t('domain.code.enName') &&
          (e.srcValue !== 'null' || e.tagValue !== 'null')
        ) {
          ar.push(e)
        }
      })
      this.compareResultTableData3 = ar
      // this.allCompareResultTableData3 = ar
      window.sessionStorage.setItem(
        'allCompareResultTableData3',
        JSON.stringify(ar)
      )
      this.showCodeDetail = true
    },
    cellStyle({ row, column, rowIndex, columnIndex }) {
      if (columnIndex === 2 && row.srcValue !== row.tagValue) {
        if (row.srcValue && !row.tagValue) {
          return {
            backgroundColor: '#ADFF2F',
          }
        } else if (!row.srcValue && row.tagValue) {
          return {
            backgroundColor: '#ec808d',
          }
        } else {
          return {
            backgroundColor: '#81d3f8',
          }
        }
      }
    },
    cellStyle2({ row, column, rowIndex, columnIndex }) {
      if (columnIndex === 6) {
        if (row.type === this.$t('domain.code.changeTypeAdd')) {
          return {
            backgroundColor: '#95f204',
          }
        } else if (row.type === this.$t('domain.code.changeTypeModify')) {
          return {
            backgroundColor: '#81d3f8',
          }
        } else if (row.type === this.$t('domain.code.changeTypeDel')) {
          return {
            backgroundColor: '#ec808d',
          }
        }
      }
    },
    handleSizeChange(val) {
      this.pageSize = val
      this.handleCurrentChange(1)
      this.currentPage = 1
    },
    handleCurrentChange(val) {
      try {
        this.compareResultTableData2 = JSON.parse(
          window.sessionStorage.getItem('compareResultTableData2')
        ).slice(
          (val - 1) * this.pageSize,
          (val - 1) * this.pageSize + this.pageSize
        )
      } catch (e) {
        this.compareResultTableData2 = JSON.parse(
          window.sessionStorage.getItem('compareResultTableData2')
        ).slice(val * this.pageSize)
      }
    },
    exportFile(isAll) {
      const ids = []
      const url = `${this.$url}/service/domains/standard/history/export/${this.codeDataCode}`
      if (!isAll) {
        this.tableData.forEach(item => {
          ids.push(item.version)
        })
      }
      this.$downloadFilePost(url, ids, this.$t('domain.code.codeModifyHistory'))
    },
  },
  watch: {
    onlyShowChange1(value) {
      if (value) {
        this.compareResultTableData = JSON.parse(
          window.sessionStorage.getItem('allCompareResultTableData')
        ).filter(e => e.srcValue !== e.tagValue)
      } else {
        this.compareResultTableData = JSON.parse(
          window.sessionStorage.getItem('allCompareResultTableData')
        )
      }
    },
    onlyShowChange2(value) {
      if (value) {
        const arr = JSON.parse(
          window.sessionStorage.getItem('allCompareResultTableData2')
        ).filter(e => e.type !== this.$t('domain.code.changeTypeEmpty'))
        this.total = arr.length
        window.sessionStorage.setItem(
          'compareResultTableData2',
          JSON.stringify(arr)
        )
        this.handleCurrentChange(1)
      } else {
        window.sessionStorage.setItem(
          'compareResultTableData2',
          window.sessionStorage.getItem('allCompareResultTableData2')
        )
        this.total = JSON.parse(
          window.sessionStorage.getItem('allCompareResultTableData2')
        ).length
        this.handleCurrentChange(1)
      }
    },
    onlyShowChange3(value) {
      if (value) {
        this.compareResultTableData3 = JSON.parse(
          window.sessionStorage.getItem('allCompareResultTableData3')
        ).filter(e => e.srcValue !== e.tagValue)
      } else {
        this.compareResultTableData3 = JSON.parse(
          window.sessionStorage.getItem('allCompareResultTableData3')
        )
      }
    },
    showVersionCompareDialog(value) {
      if (!value) {
        this.clearData()
      }
    },
  },
}
</script>

<style lang="scss">
.code-history {
  .datablau-table {
    height: auto;
  }
}
</style>

<style lang="scss">
.code-history {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;

  .compare-btn {
    margin-left: 20px;
  }
}

.table1,
.table2 {
  /*max-height: 25vh;*/
  /*overflow-y: auto;*/
  margin-bottom: 20px;
  margin-top: 10px;
}

.sub-title {
  margin-right: 50px;
}
</style>
