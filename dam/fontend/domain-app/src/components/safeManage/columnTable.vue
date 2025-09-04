<template>
  <div class="column-table-with-tag">
    <div class="top-line">
      <div class="vertical-container list-search-content">
        <div class="search-item">
          <!-- <span class="search-prop">关键字:</span> -->
          <datablau-input
            v-model="keyword"
            clearable
            placeholder="搜索字段名"
            :iconfont-state="true"
          ></datablau-input>
        </div>
        <div class="search-item">
          <span class="search-prop">系统</span>
          <datablau-select
            style="display: inline-block"
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
          <span class="search-prop">安全等级</span>
          <datablau-select
            style="display: inline-block"
            v-model="tagIdFilter"
            filterable
            clearable
            size="mini"
          >
            <el-option
              v-for="tag in allSafeTags"
              :label="tag.name"
              :value="tag.tagId"
              :key="tag.tagId"
            ></el-option>
          </datablau-select>
        </div>
        <div class="search-item">
          <span class="search-prop">负责人</span>
          <!-- @change="changeFilter"  -->
          <!-- <el-select v-model="ownerFilter" filterable clearable size="mini">
            <el-option v-for="user in allUserData" :label="user.username" :value="user.username" :key="user.userId"></el-option>
          </el-select> -->
          <datablau-input
            style="display: inline-block"
            size="mini"
            @focus="addUsers"
            v-model="ownerFilter"
            clearable
          ></datablau-input>
        </div>
        <div class="search-item">
          <span class="search-prop">处理状态</span>
          <datablau-select
            v-model="status"
            filterable
            clearable
            size="mini"
            style="display: inline-block"
          >
            <el-option
              v-for="item in statusTypeArr"
              :value="item"
              :key="item"
              :label="item"
            ></el-option>
          </datablau-select>
        </div>
        <datablau-button
          style="vertical-align: top; margin-left: -10px"
          type="normal"
          @click="changeFilter"
          :disabled="disabledSearch"
        >
          查询
        </datablau-button>
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
      >
        <div class="bottom-container" slot="footer">
          <div class="edit-cont">
            <el-form size="small" ref="form" :inline="true">
              <div class="edit-item">
                <el-form-item>
                  <span>批量编辑</span>
                  <el-select
                    v-model="editType"
                    size="mini"
                    @change="handleTypeChange"
                  >
                    <el-option
                      v-for="item in allEditType"
                      :value="item.value"
                      :key="item.value"
                      :label="item.name"
                    ></el-option>
                  </el-select>
                  <span>:</span>
                  <el-select
                    v-model="editValue"
                    size="mini"
                    allow-create
                    clearable
                    filterable
                    v-if="editType === 'dataType'"
                  >
                    <el-option
                      v-for="item in allSafeType"
                      :value="item"
                      :key="item"
                      :label="item"
                    ></el-option>
                  </el-select>
                  <el-select
                    v-model="editValue"
                    size="mini"
                    filterable
                    clearable
                    v-if="editType === 'owner'"
                  >
                    <el-option
                      v-for="item in allUserData"
                      :value="item.username"
                      :key="item.username"
                      :label="item.username"
                    ></el-option>
                  </el-select>
                  <el-select
                    v-model="editValue"
                    size="mini"
                    filterable
                    clearable
                    v-if="editType === 'status'"
                  >
                    <el-option
                      v-for="item in statusTypeArr"
                      :value="item"
                      :key="item"
                      :label="item"
                    ></el-option>
                  </el-select>
                  <el-button
                    size="mini"
                    :disabled="!couldSubmit"
                    @click="submitBatchEdit"
                  >

                    {{ $t('common.button.ok') }}

                  </el-button>
                </el-form-item>
              </div>
            </el-form>
          </div>
        </div>
      </datablau-tab-with-eltable>
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
let tableOptionCell = {
  template:
    `<div><el-button type="text" @click="editItem" size="small">{{ $t('common.button.edit') }}</el-button></div>`,
  data() {
    return {
      tabComponent: null,
    }
  },
  mounted() {
    this.tabComponent = this.params.tabComponent
  },
  methods: {
    editItem(e) {
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
      columnDefs: null,
      tableOption: null,
      totalShow: 0,
      hideTopLine: true,
      hideBottomLine: false,
      tableHidePagination: false,
      defaultParaData: {
        currentPage: 1,
        pageSize: 20,
      },
      selection: [],
      categoryIdFilter: '',
      tagIdFilter: '',
      ownerFilter: '',

      allSafeTags: null,
      tagIdMap: null,
      editType: 'status',
      editValue: '处理中',
      allEditType: [
        {
          name: '数据分类',
          value: 'dataType',
        },
        {
          name: '负责人',
          value: 'owner',
        },
        {
          name: '处理状态',
          value: 'status',
        },
      ],
      keyword: '',
      keywordTimer: null,
      status: '',
      disabledSearch: false,
    }
  },
  props: {
    getAllTages: {
      type: Promise,
      required: true,
    },
    safeTagCatalogName: {
      type: String,
      required: true,
    },
    allUserData: {
      type: Object,
      required: true,
    },
    allSafeType: {
      type: Array,
      required: true,
    },
    statusTypeArr: {
      type: Array,
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
        t = this.$timeFormatter(data.value) || '-'
      } else {
        t = '-'
      }
      return t
    }
    const columnDefs = [
      // {
      //   type: ['selectionCheckboxColumn'],
      // },
      {
        headerName: '字段名',
        field: 'objectPhysicalName',
        // tooltipField: 'objectPhysicalName',
        valueFormatter: this.getColName,
        tooltipValueGetter: this.getColName,
        minWidth: 150,
        type: ['customSortCol'],
      },
      {
        headerName: '系统',
        field: 'modelCategoryName',
        tooltipField: 'modelCategoryName',
        minWidth: 150,
      },
      {
        headerName: '数据分类',
        field: 'dataType',
        tooltipField: 'dataType',
        width: 150,
        minWidth: ['customSortCol'],
      },
      {
        headerName: '安全等级',
        field: 'tagName',
        tooltipField: 'tagName',
        minWidth: 150,
      },
      {
        headerName: '负责人',
        field: 'owner',
        tooltipField: 'owner',
        minWidth: 150,
        type: ['customSortCol'],
      },
      {
        headerName: '创建时间',
        field: 'discernedCreationTime',
        valueFormatter: formatterTime,
        // tooltipField: 'creationTime',
        tooltipValueGetter: formatterTime,
        width: 150,
        type: ['customSortCol'],
      },
      {
        headerName: '数据来源',
        field: 'modelName',
        valueFormatter: this.getSrc,
        tooltipValueGetter: this.getSrc,
        minWidth: 150,
      },
      // {
      //   headerName: '处理状态',
      //   field: 'status',
      //   tooltipField: 'status',
      //   width: 150,
      //   type: ['customSortCol'],
      // },
      // {
      //   headerName: '脱敏描述',
      //   field: 'dataMask',
      //   tooltipField: 'dataMask',
      //   minWidth: 150,
      //   type: ['customSortCol'],
      // },
      // {
      //   headerName: '备注',
      //   field: 'note',
      //   tooltipField: 'note',
      //   minWidth: 150,
      //   type: ['customSortCol'],
      // },
      {
        headerName: '操作',
        width: 100,
        type: ['optionsWithContent'],
        cellRendererParams: {
          tabComponent: this,
          options: [
            {
              name: 'editItem',
              text: '编辑',
              method: 'editItem',
              icon: 'icon-bianji',
            },
          ],
        },
      },
    ]
    this.columnDefs = columnDefs
    const tableOption = {}
    this.tableOption = tableOption
    this.dataInit()
  },
  mounted() {},
  methods: {
    getShowData(para) {
      // console.log(para, 'para')
      this.disabledSearch = true
      const c = para.currentPage
      const p = para.pageSize || 20
      const orderBy = para.sortData
        ? para.sortData.colId || 'discernedCreationTime'
        : 'discernedCreationTime'
      const sort = para.sortData ? para.sortData.sort || 'desc' : 'desc'
      return new Promise((resolve, reject) => {
        const url = `${this.$url}/service/tags/securityInfo?modelCategoryId=${
          this.categoryIdFilter || ''
        }&tagId=${this.tagIdFilter || ''}&owner=${
          this.ownerFilter || ''
        }&currentPage=${c}&pageSize=${p}&keyword=${encodeURIComponent(
          this.keyword
        )}&status=${encodeURIComponent(
          this.status || ''
        )}&orderBy=${encodeURIComponent(orderBy)}&sort=${encodeURIComponent(
          sort
        )}&objectTypeId=80000005`
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
            this.disabledSearch = false
          })
          .catch(e => {
            this.$showFailure(e)
            reject(e)
            this.disabledSearch = false
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
      this.getAllTages
        .then(res => {
          const tagArr = res.data
          const tagIdMap = {}
          const allSafeTags = []
          if (tagArr && Array.isArray(tagArr) && tagArr.length > 0) {
            tagArr.forEach(tag => {
              tagIdMap[tag.tagId] = tag
              if (tag.parentName === this.safeTagCatalogName) {
                allSafeTags.push(tag)
              }
            })
          }
          this.allSafeTags = allSafeTags
          this.tagIdMap = tagIdMap
        })
        .catch(e => {
          console.log(e)
        })
    },
    editItem({ data }) {
      this.$emit('editCol', data)
    },
    getSrc(para) {
      const data = para.data
      const result = `${data.modelName}\\${data.databaseName}\\${data.tableName}`
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
          this.$showSuccess('修改成功')
          this.refreshTable()
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    handleTypeChange() {
      this.editValue = ''
    },
    getColName(para) {
      let result = para.value
      const data = para.data
      if (data.objectLogicalName) {
        result += `(${data.objectLogicalName})`
      }
      return result
    },
    addUsers() {
      this.$utils.staffSelect.open([], true).then(data => {
        const response = []
        let arr = []
        data.forEach(element => {
          arr.push(element)
          response.push(element.id)
        })
        if (arr.length > 1) {
          arr = [arr[arr.length - 1]]
        }
        this.ownerFilter = arr[0].fullUserName
      })
    },
  },
  watch: {
    keyword(newVal) {
      // if(this.keywordTimer) {
      //   clearTimeout(this.keywordTimer);
      // }
      // this.keywordTimer = setTimeout(() => {
      //   this.changeFilter();
      // }, 300);
    },
  },
}
</script>
<style scoped lang="scss">
.table-container {
  /deep/ .tab-with-table {
    .tab-table-line {
      padding: 0 20px;
      border-top: 0;
    }
  }
}
</style>
<style lang="scss">
.column-table-with-tag {
  // min-width: 1200px;
  position: absolute;
  top: 40px;
  left: 0;
  right: 0;
  bottom: 0;
  .top-line {
    height: 34px;
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
        .search-prop {
          display: inline-block;
        }
        .el-select,
        .el-input {
          width: 150px;
        }
      }
      .green-btn {
        height: 28px;
      }
    }
  }
  .table-container {
    position: absolute;
    top: 44px;
    left: 0;
    right: 0;
    bottom: 0px;
    min-height: 300px;
    .edit-cont {
      padding-left: 10px;
      .el-form-item {
        margin: 0;
        .el-select {
          width: 150px;
        }
      }
    }
  }
}
.btn-outer {
  margin-right: 0;
}
</style>
