<template>
  <div class="glossary-page" :class="{ showHome: true }">
    <template>
      <div class="tree-area">
        <tree-catalogue
          ref="treeCatalog"
          @itemClick="treeNodeClick"
        ></tree-catalogue>
      </div>
      <div class="tree-area-margin-right"></div>
    </template>
    <div class="content-area">
      <div class="glossary-tab">
        <div class="glossary-tabs" style="background: #fff">
          <datablau-eltable
            class="table-tab-container table-scroll-y"
            style="margin-right: 20px"
            ref="glossaryTable"
            :totalShow="totalShow"
            :columnDefs="columnDefs"
            :getShowData="getShowData"
            :hideTopLine="hideTopLine"
            :hideBottomLine="hideBottomLine"
            :tableOption="tableOption"
            :hide-default-filter="true"
            :show-custom-filter="true"
            :tableHidePagination="tableHidePagination"
            :defaultParaData="defaultParaData"
            @gridSelectionChanged="gridSelectionChanged"
          >
            <div slot="chNameTableCol" slot-scope="scope">
              <span>
                {{ scope?.row?.chName }}
              </span>
            </div>
            <div slot="custom-state" slot-scope="scope">
              <span :style="`color:${getStatusColor(scope.row.state)}`">
                <span
                  :style="`background-color:${getStatusColor(scope.row.state)}`"
                  class="circle"
                ></span>
                {{ statusFormatter(scope.row.state) }}
              </span>
            </div>
            <div class="search-area" slot="customFilter">
              <datablau-input
                :placeholder="$t('domain.glossary.searchPlaceholder')"
                v-model="defaultParaData.keyword"
                maxlength="50"
                clearable
              ></datablau-input>
              <datablau-input
                :placeholder="$t('domain.glossary.domainCodePlaceholder')"
                v-model="defaultParaData.domainCode"
                maxlength="50"
                clearable
              ></datablau-input>
              <datablau-select
                :placeholder="$t('domain.glossary.statePlaceholder')"
                v-model="defaultParaData.state"
                filterable
                clearable
              >
                <el-option
                  v-for="item in stateOptions"
                  :key="item.value"
                  :value="item.value"
                  :label="item.label"
                ></el-option>
              </datablau-select>
              <datablau-button
                size="mini"
                type="normal"
                :disabled="tableLoading"
                @click="getTableData()"
              >
                {{ $t('domain.common.search') }}
              </datablau-button>
              <datablau-button
                size="mini"
                type="secondary"
                :disabled="tableLoading"
                @click="getTableData(true)"
              >
                {{ $t('domain.common.reset') }}
              </datablau-button>
            </div>
          </datablau-eltable>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import HTTP from '@/http/main'
import glossaryTab from './glossaryTab2.vue'
import editGlossaryTab from './editGlossaryTab.vue'
import checkResultTable from './checkResultTable.vue'
import historyTab from './historyTab.vue'
import treeCatalogue from '@/view/dataStandardCode/newTree.vue'
import {
  columnDefs,
  getStatusColor,
  stateOptions,
  statusFormatter,
} from '@/view/dataStandardGlossary/glossaryConstants'

export default {
  props: {
    selectionIds: {
      type: Array,
      default: () => [],
    },
  },
  components: {
    treeCatalogue,
    glossaryTab,
    editGlossaryTab,
    checkResultTable,
    historyTab,
  },
  data() {
    const glossaryUrl = this.$url + '/service/ns/'
    return {
      glossaryUrl: glossaryUrl,
      columnDefs: columnDefs(this, false),
      currentFolder: null,
      treeData: [],

      totalShow: 0,
      hideTopLine: false,
      hideBottomLine: false,
      tableOption: null,
      tableHidePagination: false,
      stateOptions: stateOptions(this),
      defaultParaData: {
        keyword: '',
        domainCode: '',
        state: '',
        sortData: {
          colId: 'updateTime',
          sort: 'desc',
        },
        filterType: {},
        currentPage: 1,
        pageSize: 20,
      },
      initSelections: [...this.selectionIds],
      tableLoading: false,
    }
  },
  created() {
    const tableOption = {
      frameworkComponents: {},
      selectable: true,
      autoHideSelectable: true,
      showColumnSelection: false,
      columnSelection: [],
      columnResizable: true,
    }
    this.tableOption = tableOption
  },
  mounted() {},
  methods: {
    statusFormatter,
    getStatusColor,
    getTableData(reset) {
      const promise = this.$refs.glossaryTable
        ? this.$refs.glossaryTable.refreshData()
        : null
      setTimeout(() => {
        promise &&
          promise.then(() => {
            this.$refs.glossaryTable.columnFomatter()
            this.$refs.glossaryTable.initSelection(
              this.initSelections,
              'domainCode'
            )
          })
      })
    },
    getShowData(para) {
      return new Promise((resolve, reject) => {
        const orderByMap = {
          chName: 'chineseName',
          domainCode: 'domainCode',
          enName: 'englishName',
          abbr: 'abbr',
          firstPublish: 'firstPublish',
          updateTime: 'updateTime',
        }
        para.sortData = para.sortData || {}
        const resultPara = {
          keyword: para.keyword || '',
          domainCode: para.domainCode || '',
          state: para.state || '',
          folderId: this.currentFolderId,
          currentPage: para.currentPage || 1,
          pageSize: para.pageSize || 20,
          orderBy: orderByMap[para.sortData.colId || 'updateTime'],
          sort: para.sortData.sort === 'asc' ? 'asc' : 'desc',
          domainState: 'A'
        }

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
      const selectionIds = result.map(item => item.domainCode)
      this.$emit('update:selectionIds', selectionIds)
    },
    treeNodeClick(data, node) {
      this.currentFolder = data
      this.$nextTick(() => {
        this.getTableData()
      })
    },
    // 面包屑组件api
    backClick(e) {
      this.showHome = true
      this.breadcrumbData = []
    },
    downloadFile() {
      // const url = this.glossaryUrl + 'template'
      this.$downloadFilePost(HTTP.nsTemplateDownloadUrl())
    },
  },
  watch: {},
  computed: {
    currentFolderId() {
      return this.currentFolder ? this.currentFolder.foldId : null
    },
  },
}
</script>
<style scoped lang="scss">
$grey-border: 1px solid #eaecf1;
$blue: #268bd3;
$tree-box-width: 240px;
$border-text: 1px solid #aaa;
@import '../../next/components/basic/color.sass';
.glossary-page.showHome {
  .content-area {
    left: $tree-box-width !important;
  }
}
.glossary-page {
  background: #fff;
  .tree-area {
    width: $tree-box-width;

    .tree-search-box {
      padding: 10px;
    }

    .tree-box {
      position: absolute;
      top: 45px;
      right: 0;
      bottom: 48px;
      left: 0;

      &.full {
        bottom: 0;
      }
    }

    .manage-box {
      position: absolute;
      right: 0;
      bottom: 0;
      left: 0;
      height: 48px;
      padding: 10px;
      border-top: $grey-border;

      span {
        position: absolute;
        top: 15px;
        right: 10px;
        color: #9b9ea2;
      }
    }
  }
  .tree-area-margin-right {
    position: absolute;
    top: 0;
    left: $tree-box-width - 3px;
    width: 7px;
    height: 100%;
    cursor: e-resize !important;
    background-color: transparent;
    z-index: 2;
  }

  .right-top {
    position: absolute;
    top: 8px;
    right: 20px;
    z-index: 9;

    .margin20 {
      margin-left: 20px;
    }

    .inline-block {
      display: inline-block;
    }

    .inline-block-btn {
      margin-left: 0;
    }
  }

  .content-area {
    left: 0;
    .glossary-tabs {
      /deep/ .tab-bottom-line {
        // right: 0;
        // margin: 0 20px;
      }
      .check-result-table {
        /deep/.datablau-tab-table-line {
          top: 52px;
          // right: 20px;
          // bottom: auto;
        }
      }
    }
  }
}

.glossary-tab {
  .tab-with-table {
    .datablau-tab-table-line.hide-filter {
      top: 60px;
    }
  }
  .right-top {
    white-space: nowrap;
    padding-top: 2px;

    .upload-btn {
      display: inline-block;
    }
  }
  .datablau-tab-top-line {
    .search-area {
      display: flex;
      align-items: center;
      height: 60px;
    }
    .datablau-input {
      //margin-top: 15px;
      margin-right: 15px;
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
