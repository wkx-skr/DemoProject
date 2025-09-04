<template>
  <div class="column-table-with-tag">
    <div class="top-line">
      <div class="vertical-container">
        <div class="search-item">
          <span class="search-prop">{{ $t('domain.common.keyWord') }}:</span>
          <datablau-input
            v-model="keyword"
            clearable
            class="keyword-search"
            :placeholder="$t('domain.verification.searchDomainName')"
          ></datablau-input>
        </div>
        <div class="search-item">
          <span class="search-prop">{{ $t('domain.common.system') }}:</span>
          <datablau-select
            v-model="categoryIdFilter"
            filterable
            clearable
            size="mini"
          >
            <el-option
              v-for="c in $modelCategories"
              :label="c.categoryName + '(' + c.categoryAbbreviation + ')'"
              :value="c.categoryId"
              :key="c.categoryId"
            ></el-option>
          </datablau-select>
        </div>
        <div class="search-item">
          <span class="search-prop">
            {{ $t('domain.verification.matchResult') }}:
          </span>
          <datablau-select
            v-model="statusFilter"
            filterable
            clearable
            size="mini"
          >
            <el-option
              v-for="statu in matchType"
              :label="statu"
              :value="statu"
              :key="statu"
            ></el-option>
          </datablau-select>
        </div>
        <datablau-button size="mini" @click="changeFilter">
          {{ $t('domain.common.search') }}
        </datablau-button>
        <div style="float: right; margin-right: 0">
          <datablau-button
            class="iconfont icon-export"
            type="important"
            @click="exportFileSearch"
          >
            {{ $t('domain.common.export') }}
          </datablau-button>
        </div>
      </div>
    </div>
    <div class="table-container">
      <datablau-tab-with-eltable
        class="table-tab-container"
        ref="cloumnTable"
        :totalShow="totalShow"
        :columnDefs="columnDefs"
        :getShowData="getShowData"
        :hideTopLine="hideTopLine"
        :hideBottomLine="hideBottomLine"
        :tableOption="tableOption"
        :tableHidePagination="tableHidePagination"
        :defaultParaData="defaultParaData"
        @gridSelectionChanged="gridSelectionChanged"
      ></datablau-tab-with-eltable>
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
let tableOptionCell = {
  template: `<datablau-button
                type="icon"
                @click="editItem"
              >
                <datablau-tooltip :content="$t('common.button.edit')" placement="top">
                  <i class="iconfont icon-bianji"></i>
                </datablau-tooltip>
              </datablau-button>`,
  data() {
    return {
      tabComponent: null,
    }
  },
  mounted() {
    this.tabComponent = this.params.tabComponent
  },
  methods: {
    editItem(params) {
      const data = this.params.data
      const tabComponent = this.tabComponent
      tabComponent && tabComponent.editItem && tabComponent.editItem(data)
    },
  },
}
tableOptionCell = Vue.extend(tableOptionCell)
export default {
  data() {
    return {
      themeFilter: '',
      modelCategoryId: '',
      statusFilter: '',
      keyword: '',
      allDomainCata: [],
      columnDefs: null,
      tableOption: null,
      totalShow: 0,
      hideTopLine: true,
      hideBottomLine: false,
      tableHidePagination: false,
      defaultParaData: {
        currentPage: 1,
        pageSize: 20,
        sortData: {
          colId: 'updateTime',
          sort: 'desc',
        },
      },
      selection: [],
      categoryIdFilter: '',
      domainSetArr: [],
    }
  },
  props: {
    matchType: {
      type: Object,
      required: true,
    },
  },
  components: {},
  computed: {
    couldSubmit() {
      const arr = this.selection
      return (
        arr &&
        Array.isArray(arr) &&
        arr.length > 0 &&
        this.editType &&
        this.editValue
      )
    },
  },
  beforeMount() {
    const formatterTime = data => {
      let t = ''
      if (data.value) {
        t = this.$timeFormatter(data.value) || this.$t('domain.common.none')
      } else {
        t = this.$t('domain.common.none')
      }
      return t
    }
    const columnDefs = [
      {
        headerName: '',
        field: '',
        type: ['iconCol'],
        iconType: 'DOMAIN',
        className: 'iconfont icon-tancha',
        customColName: 'iconfont icon-biaozhun',
        // valueFormatter: formatterTime,
      },
      {
        headerName: this.$t('domain.common.domainName'),
        field: 'domainName',
        tooltipField: 'domainName',
        minWidth: 100,
        type: ['customSortCol'],
      },
      {
        headerName: this.$t('domain.common.domainPropCode'),
        field: 'domainCode',
        tooltipField: 'domainCode',
        minWidth: 100,
        type: ['customSortCol'],
      },
      {
        headerName: this.$t('domain.common.standardTheme'),
        field: 'domainPath',
        valueFormatter: this.getDomainTheme,
        tooltipValueGetter: this.getDomainTheme,
        // tooltipField: 'domainPath',
        minWidth: 100,
      },
      {
        headerName: this.$t('domain.verification.mappingField'),
        field: 'objectPhysicalName',
        tooltipField: 'objectPhysicalName',
        minWidth: 100,
        type: ['customSortCol'],
      },
      {
        headerName: this.$t('domain.verification.fieldSource'),
        field: 'objectName',
        valueFormatter: this.getColPath,
        tooltipValueGetter: this.getColPath,
        minWidth: 100,
      },
      {
        headerName: this.$t('domain.verification.matchResult'),
        field: 'status',
        tooltipField: 'status',
        width: 130,
        type: ['customSortCol'],
      },
      {
        headerName: this.$t('domain.common.owner'),
        field: 'owner',
        tooltipField: 'owner',
        width: 100,
        type: ['customSortCol'],
      },
      {
        headerName: this.$t(
          'domain.verification.verificationProblemDescription'
        ),
        field: 'problem',
        tooltipField: 'problem',
        minWidth: 100,
        sortable: false,
        // type: ['customSortCol'],
      },
      {
        headerName: this.$t('domain.verification.handlingSuggestion'),
        field: 'suggestion',
        sortable: false,
        tooltipField: 'suggestion',
        minWidth: 100,
        // type: ['customSortCol'],
      },
      {
        headerName: this.$t('domain.common.remark'),
        field: 'note',
        tooltipField: 'note',
        minWidth: 100,
        sortable: false,
        // type: ['customSortCol'],
      },
      {
        headerName: this.$t('domain.verification.lastDetectionTime'),
        field: 'updateTime',
        valueFormatter: formatterTime,
        tooltipValueGetter: formatterTime,
        width: 150,
        type: ['customSortCol'],
      },
      {
        headerName: this.$t('domain.common.operation'),
        width: this.$i18n.locale === 'en' ? 100 : 50,
        type: ['optionsWithContent'],
        cellRendererParams: {
          tabComponent: this,
          options: [
            {
              name: 'edit',
              text: this.$t('domain.common.edit'),
              icon: 'iconfont icon-bianji',
              method: 'editItem',
            },
          ],
        },
      },
    ]
    this.columnDefs = columnDefs
    const tableOption = {
      rowSelection: 'single',
    }
    this.tableOption = tableOption
    this.dataInit()
  },
  mounted() {},
  methods: {
    exportFileSearch() {
      this.$downloadFilePost(this.$meta_url + '/service/domains/download')
    },
    getShowData(para) {
      // console.log(para, 'para');
      const c = para.currentPage
      const p = para.pageSize || 20
      const orderBy = para.sortData ? para.sortData.colId || '' : ''
      const sort = para.sortData ? para.sortData.sort || '' : 'asc'
      return new Promise((resolve, reject) => {
        const url = `${
          this.$meta_url
        }/service/domains/domainVerifyInfo?currentPage=${c}&pageSize=${p}&keyword=${encodeURIComponent(
          this.keyword
        )}&status=${encodeURIComponent(
          this.statusFilter || ''
        )}&theme=${encodeURIComponent(
          this.themeFilter || ''
        )}&modelCategoryId=${
          this.categoryIdFilter || ''
        }&orderBy=${encodeURIComponent(orderBy)}&sort=${encodeURIComponent(
          sort
        )}`
        this.$http
          .get(url)
          .then(res => {
            const data = res.data
            this.totalShow = data.totalItems || 0
            // this.totalShow = 10000;
            const content = data.content
            if (content && Array.isArray(content)) {
              // this.totalShow = content.length;
              resolve(content)
            }
          })
          .catch(e => {
            this.$showFailure(e)
            reject(e)
          })
      })
    },
    gridSelectionChanged(para) {
      const api = para.api
      const arr = api.getSelectedNodes()
      const result = []
      arr.forEach(item => {
        result.push(item.data)
      })
      this.selection = result
    },
    changeFilter() {
      const para = {
        currentPage: 1,
      }
      if (this.$refs.cloumnTable && this.$refs.cloumnTable.setCurrentPara) {
        this.$refs.cloumnTable.setCurrentPara(para)
      }
    },
    dataInit() {
      // this.getAllPubDomain
      // .then(res => {
      //   let arr = [];
      //   let data = res.data;
      //   if (data) {
      //     let domSets = data.nodes;
      //     if (domSets && Array.isArray(domSets)) {
      //       domSets.forEach(node => {
      //         arr.push(node.name);
      //       });
      //     }
      //   }
      //   this.domainSetArr = arr;
      // })
      // .catch(e => {
      //   console.log(e);
      // })
    },
    editItem(params) {
      this.$emit('editCol', params.data)
    },
    getSrc(para) {
      const data = para.data
      const result = `${data.modelName}\\${data.databaseName}\\${data.tableName}`
      return result
    },
    getDomainTheme(para) {
      const data = para.data
      let result = ''
      if (
        data.domainPath &&
        Array.isArray(data.domainPath) &&
        data.domainPath.length > 0
      ) {
        result = `${data.domainPath.slice(-1)}`
      }
      return result
    },
    refreshTable() {
      if (this.$refs.cloumnTable && this.$refs.cloumnTable.refreshData) {
        this.$refs.cloumnTable.refreshData()
      }
    },
    submitBatchEdit() {
      const ids = this.selection.map(item => {
        return item.id
      })
      const para = {
        ids,
      }
      const url = `${
        this.$url
      }/service/tags/bulkUpdateSecurityInfo?fieldName=${encodeURIComponent(
        this.editType
      )}&newValue=${encodeURIComponent(this.editValue)}`
      this.$http
        .post(url, para)
        .then(res => {
          this.$emit('updataColData')
          this.$showSuccess(this.$t('domain.common.modifySuccessfully'))
          this.refreshTable()
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    handleTypeChange() {
      this.editValue = ''
    },
    getColPath(para) {
      let result = para.value
      const data = para.data
      result = `${data.modelCategoryName}/${data.modelName}/${data.tableName}`
      return result
    },
  },
  watch: {},
}
</script>

<style lang="scss">
.column-table-with-tag {
  // min-width: 1200px;
  position: relative;
  height: 100%;
  .top-line {
    height: 50px;
    padding-left: 10px;
    position: relative;
    .vertical-container {
      position: absolute;
      // width: 100%;
      left: 20px;
      right: 20px;
      top: 50%;
      white-space: nowrap;
      overflow: hidden;
      transform: translateY(-50%);
      .search-item {
        display: inline-block;
        margin-right: 10px;
        .search-prop {
          padding-right: 8px;
          display: inline-block;
        }
        .datablau-select,
        .el-input {
          display: inline-block;
          width: 175px;
        }

        .keyword-search {
          .el-input {
            width: 240px;
          }
        }
      }
      .green-btn {
        height: 28px;
      }
    }
  }
  .table-container {
    position: absolute;
    top: 50px;
    left: 20px;
    right: 20px;
    bottom: 0;
    min-height: 200px;

    .edit-cont {
      padding-left: 10px;

      .el-form-item {
        margin: 0;

        .datablau-select {
          width: 150px;
        }
      }
    }
  }
}
</style>
