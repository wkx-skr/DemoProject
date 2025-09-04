<template>
  <div class="glossary-tab">
    <datablau-upload
      class="inline-block upload-btn"
      :action="postUrl"
      :before-upload="handleBeforeUpload"
      :on-error="onError"
      :on-success="onSuccess"
      :show-file-list="false"
      accept=".xlsx"
      :headers="$headers"
      :isEdit="true"
      style="vertical-align: top"
      v-show="false"
      ref="uploadComponent"
    >
      <datablau-button type="text">
        {{ $t('domain.common.batchImport') }}
      </datablau-button>
    </datablau-upload>
    <datablau-eltable
      class="table-tab-container table-scroll-y"
      style="margin-right: 20px"
      ref="glossaryTable"
      :searchPlaceholder="$t('domain.glossary.searchPlaceholder')"
      :totalShow="totalShow"
      :columnDefs="columnDefs"
      :getShowData="getShowData"
      :hideTopLine="hideTopLine"
      :hideBottomLine="hideBottomLine"
      :tableOption="tableOption"
      :tableHidePagination="tableHidePagination"
      :defaultParaData="defaultParaData"
      @gridSelectionChanged="gridSelectionChanged"
    >
      <div v-if="hasAccess" class="right-top" slot="header">
        <datablau-button
          size="mini"
          type="important"
          class="iconfont icon-tianjia"
          v-if="$auth['DICTIONARY_ADD'] || $auth['ROLE_NAMING_STANDARD_IMPORT']"
          @click="showAddGlossaryDialog"
        >
          {{ $t('domain.glossary.createGlossary') }}
        </datablau-button>
        <el-dropdown trigger="click" @command="moreHandle" v-if="hasAccess">
          <datablau-button
            size="mini"
            class="el-dropdown-link"
            style="margin: 10px 0 10px 10px"
            type="secondary"
            v-if="
              $auth['DICTIONARY_IMPORT'] ||
              $auth['DICTIONARY_EXPORT'] ||
              $auth['ROLE_NAMING_STANDARD_EXPORT'] ||
              $auth['DICTIONARY_IMPORT']
            "
          >
            {{ $t('domain.common.moreOperation') }}
            <i class="el-icon-arrow-down el-icon--right"></i>
          </datablau-button>
          <el-dropdown-menu class="more-drop-box" slot="dropdown">
            <el-dropdown-item
              icon="iconfont icon-import"
              command="import"
              v-if="$auth['DICTIONARY_IMPORT']"
            >
              {{ $t('domain.common.batchImport') }}
            </el-dropdown-item>
            <el-dropdown-item
              icon="iconfont icon-export"
              command="export"
              v-if="
                $auth['DICTIONARY_EXPORT'] ||
                $auth['ROLE_NAMING_STANDARD_EXPORT']
              "
            >
              {{ this.$t('domain.glossary.exportGlossary') }}
            </el-dropdown-item>
            <el-dropdown-item
              icon="iconfont icon-download"
              command="download"
              v-if="$auth['DICTIONARY_IMPORT']"
            >
              {{ $t('domain.common.downloadTemp') }}
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
      <div class="bottom-line" slot="footer">
        <span v-if="!deleteDisabled">
          <span class="count-span">
            {{
              $t('common.deleteMessage', {
                selection: (selection || 0).length || 0,
              })
            }}
          </span>
          <datablau-button
            icon="el-icon-delete"
            v-if="hasAccess && $auth['DICTIONARY_DELETE']"
            type="danger"
            size="small"
            @click="deleteRow"
            :disabled="deleteDisabled"
          >
            {{ $t('common.button.delete') }}
          </datablau-button>
        </span>
      </div>
      <template
        class="option-col"
        slot-scope="scope"
        slot="optionCol"
        align="center"
        fixed="right"
      >
        <datablau-button
          type="icon"
          @click="editGlossary(scope.row)"
          v-if="$auth['DICTIONARY_EDIT']"
        >
          <datablau-tooltip
            :content="
              hasAccess ? $t('domain.common.edit') : $t('domain.common.check')
            "
            placement="bottom"
          >
            <i
              :class="hasAccess ? 'iconfont icon-bianji' : 'iconfont icon-see'"
            ></i>
          </datablau-tooltip>
        </datablau-button>
        <datablau-button
          type="icon"
          @click="showCheckResult(scope.row)"
          v-if="$ddmConnectable"
        >
          <datablau-tooltip
            :content="$t('domain.glossary.matchCheckTooltip')"
            placement="bottom"
          >
            <i class="fa fa-calendar-times-o"></i>
          </datablau-tooltip>
        </datablau-button>
        <datablau-button type="icon" @click="showHistory(scope.row)">
          <datablau-tooltip
            :content="$t('domain.glossary.checkHistory')"
            placement="bottom"
          >
            <i class="iconfont icon-History"></i>
          </datablau-tooltip>
        </datablau-button>
      </template>
    </datablau-eltable>
  </div>
</template>

<script>
import vue from 'vue'
import HTTP from '@/http/main'

export default {
  props: ['hasAccess', 'postUrl'],
  components: {},
  data() {
    const glossaryUrl = this.$url + '/service/ns/'
    return {
      glossaryUrl: glossaryUrl,
      totalShow: 0,
      hideTopLine: false,
      hideBottomLine: false,
      tableOption: null,
      tableHidePagination: false,
      defaultParaData: {
        keyword: '',
        sortData: {
          colId: 'timestamp',
          sort: 'desc',
        },
        filterType: {},
        currentPage: 1,
        pageSize: 20,
      },
      deleteDisabled: true,
      getCategories: null,
      selection: [],
      columnDefs: [],
    }
  },
  beforeMount() {
    // this.refreshFilterItem();
    const noSortFunction = (valueA, valueB, nodeA, nodeB, isInverted) => {
      return !isInverted
    }
    // const typeName = this.hasAccess
    //   ? 'selectionCheckboxColumn'
    //   : 'firstEmptyColumn'
    const tableOption = {
      frameworkComponents: {},
      selectable: this.hasAccess && this.$auth.DICTIONARY_DELETE,
      autoHideSelectable: true,
      showColumnSelection: false,
      columnSelection: [],
      columnResizable: true,
    }
    this.tableOption = tableOption
    const columnDefs = [
      {
        headerName: this.$t('domain.glossary.glossaryCName'),
        field: 'chName',
        tooltipField: 'chName',
        type: ['customSortCol'],
        minWidth: 80,
      },
      {
        headerName: this.$t('domain.glossary.glossaryFullName'),
        field: 'enName',
        tooltipField: 'enName',
        type: ['customSortCol'],
        minWidth: 80,
      },
      {
        headerName: this.$t('domain.glossary.glossaryAbbr'),
        field: 'abbr',
        tooltipField: 'abbr',
        type: ['customSortCol'],
        minWidth: 80,
      },
      {
        headerName: this.$t('domain.glossary.classify'),
        field: 'category',
        colId: 'category',
        tooltipField: 'category',
        type: ['customFilter', 'customSortCol'],
        filterParams: {
          getFilterItem: this.getFilterItem,
          autoRefresh: true,
        },
        minWidth: 80,
      },
      {
        headerName: this.$t('domain.glossary.modifyTime'),
        field: 'timestamp',
        valueFormatter: this.formatterTime,
        // tooltipField: 'timestamp',
        tooltipValueGetter: this.formatterTime,
        type: ['customSortCol'],
        width: 250,
      },
      {
        headerName: this.$t('domain.common.operation'),
        width: this.$ddmConnectable ? 120 : 80,
        type: ['customCol'],
        cellRendererParams: {
          riginComponent: this,
        },
        customColName: 'optionCol',
      },
    ]
    this.columnDefs = columnDefs
  },
  mounted() {},
  beforeDestroy() {},
  methods: {
    getShowData(para) {
      // console.log(para, 'para')
      return new Promise((resolve, reject) => {
        const self = this
        const orderByMap = {
          chName: 'chineseName',
          enName: 'englishName',
          abbr: 'abbreviation',
          timestamp: 'timestamp',
          category: 'category',
        }
        para.sortData = para.sortData || {}
        const obj = {
          currentPage: para.currentPage || 1,
          keyword: para.keyword || '',
          pageSize: para.pageSize || 20,
          orderBy: orderByMap[para.sortData.colId || 'timestamp'],
          sort: para.sortData.sort === 'asc' ? 'asc' : 'desc',
          categories: '',
        }
        if (para.filterType && para.filterType.category) {
          const cateArr = para.filterType.category
          if (cateArr && Array.isArray(cateArr)) {
            obj.categories = cateArr.join('|')
          }
        }

        const resultPara = obj
        resultPara.currentPage--
        // this.$http
        //   .get(this.glossaryUrl, { params: resultPara })
        const tryCurrent = res => {
          const data = res.data.content
          this.totalShow = res.data.totalItems
          if (res.data.totalItems > 0 && data.length === 0) {
            resultPara.currentPage--
            HTTP.nsGetPageService(resultPara).then(res => {
              const data = res.data.content
              this.totalShow = res.data.totalItems
              tryCurrent(res)
            })
          } else {
            resolve(data)
            this.$testLastPageEmpty({
              data: res.data,
              refComponent: this.$refs && this.$refs.glossaryTable,
              startWith0: true,
            })
          }
        }
        HTTP.nsGetPageService(resultPara)
          .then(res => {
            tryCurrent(res)
          })
          .catch(e => {
            this.$showFailure(e)
            reject(e)
          })
      })
    },
    gridSelectionChanged(para) {
      const api = para.api
      if (!api) return
      const arr = api.getSelectedNodes()
      const result = []
      arr.forEach(item => {
        result.push(item.data)
      })
      this.selection = result
      this.deleteDisabled = this.selection.length === 0
    },
    getTableData() {
      this.$refs.glossaryTable && this.$refs.glossaryTable.refreshData()
      // this.refreshFilterItem();
    },
    editGlossary(item) {
      this.$emit('editGlossary', item)
    },
    showCheckResult(item) {
      this.$emit('showCheckResult', item)
    },
    showHistory(item) {
      this.$emit('showHistory', item)
    },

    // delete choose lineage
    deleteRow() {
      const self = this
      self
        .$confirm(
          this.$t('domain.common.delConfirm'),
          this.$t('domain.common.delete'),
          {
            confirmButtonText: this.$t('common.button.ok'),
            cancelButtonText: this.$t('common.button.cancel'),
            type: 'warning',
          }
        )
        .then(() => {
          const arr = []
          this.selection.forEach(item => {
            arr.push(item.nsId)
          })
          console.log(arr, 'arr')
          // this.$http
          //   .put(self.glossaryUrl, arr)
          HTTP.nsDeleteService(arr)
            .then(res => {
              this.$message.success(this.$t('domain.common.delSucceed'))
              // this.timer = 'first';
              // this.getTableData();
              this.getTableData()
            })
            .catch(e => {
              console.log(e, 'e')
              if (
                e.response &&
                e.response.data &&
                e.response.data.rootErrorMessage
              ) {
                const reason =
                  e.response.data.rootErrorMessage ||
                  this.$t('domain.glossary.unknown')
                this.$showFailure(reason)
              } else {
                this.$showFailure(e)
              }
            })
        })
        .catch(res => {
          console.log(res, 'res')
        })
    },

    // table filter
    getFilterItem() {
      return new Promise((resolve, reject) => {
        const result = []
        let getCategories = this.getCategories
        if (!getCategories || true) {
          // getCategories = this.$http.get(`${this.$url}/service/ns/categories/`)
          getCategories = HTTP.nsGetCategoriesService()
        }
        getCategories
          .then(res => {
            const data = res.data
            if (data && Array.isArray(data)) {
              data.forEach(item => {
                if (item) {
                  result.push(item)
                }
              })
            }
            resolve(result)
          })
          .catch(e => {
            this.$showFailure(e)
            reject(e)
          })
      })
    },
    refreshFilterItem() {
      this.getCategories = HTTP.nsGetCategoriesService()
    },
    downloadFile(para) {
      this.$emit('downloadFile', para)
    },
    downloadGlossary(para) {
      this.$emit('downloadGlossary', para)
    },
    showAddGlossaryDialog(para) {
      this.$emit('showAddGlossaryDialog', para)
    },
    handleBeforeUpload(para) {
      this.$emit('handleBeforeUpload', para)
    },
    onError(para) {
      this.$emit('onError', para)
    },
    onSuccess(para) {
      this.$emit('onSuccess', para)
    },
    formatterTime(params) {
      let t = ''
      if (params.value) {
        t = this.$timeFormatter(params.value) || this.$t('domain.common.none')
      } else {
        t = this.$t('domain.common.none')
      }
      return t
    },
    moreHandle(command) {
      switch (command) {
        case 'download':
          this.downloadFile()
          break
        case 'export':
          this.downloadGlossary()
          break
        case 'import':
          this.uploadCodeFile()
          break
      }
    },
    uploadCodeFile() {
      if (
        this.$refs.uploadComponent &&
        this.$refs.uploadComponent.$slots.default &&
        this.$refs.uploadComponent.$slots.default[0] &&
        this.$refs.uploadComponent.$slots.default[0].elm
      ) {
        this.$refs.uploadComponent.$slots.default[0].elm.click()
      }
    },
  },
  watch: {},
  computed: {},
}
</script>
<style lang="scss">
.glossary-tab {
  .right-top {
    white-space: nowrap;
    padding-top: 2px;
    // padding-right: 20px;

    .upload-btn {
      display: inline-block;
    }
  }
  .datablau-tab-top-line {
    // top: 10px!important;
    .datablau-input {
      position: absolute;
      //transform: translateY(11px);
      top: 50%;
      transform: translateY(-50%);
    }
  }
  .datablau-tab-table-line {
    .db-table.datablau-table-info {
      .datablau-table {
        // position: relative;
        .el-table__body-wrapper {
          //bottom: 10px;
        }
      }
    }
  }
  .bottom-line {
    margin-left: 0px;

    .count-span {
      margin-right: 10px;
    }
  }
  .more-drop-box .el-dropdown-menu__item {
    .iconfont {
      color: #999;
      font-size: 14px;
    }
    &:hover {
      color: #409eff;
      .iconfont {
        color: #409eff;
      }
    }
  }
}
</style>
