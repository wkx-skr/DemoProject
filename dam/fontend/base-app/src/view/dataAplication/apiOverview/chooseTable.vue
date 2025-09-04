<template>
  <div class="choose-table-container">
    <div class="table-outer">
      <datablau-eltable
        class="table-tab-container"
        ref="modelsTable"
        :totalShow="totalShow"
        :columnDefs="columnDefs"
        :getShowData="getShowData"
        :hideTopLine="false"
        :hideDefaultFilter="true"
        :showCustomFilter="true"
        :hideBottomLine="true"
        :tableOption="tableOption"
        :tableHidePagination="tableHidePagination"
        :defaultParaData="defaultParaData"
        @selectionChange="gridSelectionRealChange"
        :tableHeightInfo="tableHeightInfo"
      >
        <div class="right-btn-container" slot="customFilter">
          <div class="left-filter">
            <datablau-cascader
              v-model="modelSchema"
              placeholder="请选择数据源"
              clearable
              size="mini"
              v-if="showModelFilter"
              :options="chooseTreeData"
              :props="dsCascaderProps"
              :show-all-levels="false"
              :disabled="!couldChangeModel"
              @change="changeSchema"
            >
              <template slot-scope="{ node, data }">
                <span>
                  <i
                    class="tree-icon fa fa-database"
                    v-if="data.type === 'MODEL'"
                  ></i>
                  <i
                    class="tree-icon fa fa-cube"
                    v-else-if="data.type === 'SCHEMA'"
                  ></i>
                  <span class="icon-i-folder" v-else>
                    <span class="path1"></span>
                    <span class="path2"></span>
                  </span>
                </span>
                <span>{{ data.name }}</span>
              </template>
            </datablau-cascader>
            <datablau-input
              class="search-input"
              size="mini"
              placeholder="输入关键字进行搜索"
              v-model="keyword"
              v-length-validator:[keywordMaxLength]="keyword"
              :clearable="true"
            ></datablau-input>
            <datablau-checkbox2
              @change="showStyleChange"
              v-model="onlyShowChosen"
              v-if="!singleRowSelection"
            >
              仅显示已选择
            </datablau-checkbox2>
          </div>
        </div>
        <div class="right-filter" slot="header">
          <datablau-button size="mini" @click="refreshTable">
            刷 新
          </datablau-button>
        </div>
      </datablau-eltable>
    </div>
    <div class="dialog-bottom">
      <datablau-button
        type="primary"
        class="btn-detail"
        @click="confirmChoose"
        :disabled="!couldDeleteBatch"
      >
        确 定
      </datablau-button>
      <span v-if="!singleRowSelection" style="margin-left: 10px">
        共选中
        <span class="chosen-count">{{ chosenCount }}</span>
        条数据
      </span>
      <datablau-pagination
        class="bottom-pagination"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="currentPage"
        :page-sizes="[20, 50, 100]"
        :page-size="pageSize"
        :total="totalShow"
        layout="total, sizes, prev, pager, next, jumper"
      ></datablau-pagination>
    </div>
  </div>
</template>

<script>
import HTTP from '@/http/main.js'

export default {
  name: 'chooseTable',
  data() {
    return {
      tableHeightInfo: '',
      modelTreePromise: null,
      modelSchema: '',
      chooseTreeData: [],
      // modelId, schema 找到 tree node
      dbid2Optionid: {},
      dsCascaderTreeMap: {},
      dsCascaderProps: {
        value: 'nodeId',
        emitPath: false,
        label: 'name',
        expandTrigger: 'click',
        checkStrictly: true,
      },
      selectedModelId: '',
      selectedSchema: '',
      keyword: '',
      keywordMaxLength: 20,
      onlyShowChosen: false,

      // *** tab with table ***
      totalShow: 0,
      columnDefs: [],
      hideTopLine: false,
      tableOption: {
        rowSelection: this.singleRowSelection ? 'single' : 'multiple',
        selectable: true,
        autoHideSelectable: true,
        showColumnSelection: true,
        columnSelection: [],
        columnResizable: false,
      },
      tableHidePagination: false,
      currentPage: 1,
      pageSize: 20,
      defaultParaData: {
        currentPage: 1,
        pageSize: 20,
      },
      chosenMap: {},
      showData: [],
      chosenCount: 0,
      selection: [],
    }
  },
  props: {
    singleRowSelection: {
      // 单选还是多选
      type: Boolean,
      default: true,
    },
    schema: {
      type: String,
      default: '',
    },
    modelId: {
      type: [String, Number],
      default: '',
    },
    showModelFilter: {
      type: Boolean,
      default: false,
    },
    couldChangeModel: {
      type: Boolean,
      default: false,
    },
  },
  components: {},
  computed: {
    disabledSave() {
      let bool = false
      if (this.editRules) {
        for (const key in this.editRules) {
          if (!this.applyData || !this.applyData[key]) {
            bool = true
          }
        }
      }
      return bool
    },
    couldDeleteBatch() {
      if (this.singleRowSelection) {
        const arr = this.selection
        return arr && Array.isArray(arr) && arr.length > 0
      } else {
        return this.chosenCount > 0
      }
    },
  },
  created() {
    this.modelTreePromise = HTTP.getModelTree()
  },
  beforeMount() {
    this.selectedModelId = this.modelId
    this.selectedSchema = this.schema

    this.getDbData()

    const formatterTime = data => {
      const t = this.$timeFormatter(data.value)
      return t
    }
    const getLogicalName = data => {
      const obj = data.data
      let name = obj.logicalName
      //  兼容 logicalName 字段没有的情况, 等后台加上 logicalName 后就没用了
      if (!name) {
        name = obj.physicalName === obj.name ? '' : obj.name
      }
      return name
    }
    const columnDefs = [
      // {
      //   headerCheckboxSelection: !this.singleRowSelection,
      //   type: ['selectionCheckboxColumn'],
      // },
      {
        headerName: '名称',
        field: 'physicalName',
        tooltipField: 'physicalName',
        // minWidth: 100,
        // type: ['customSortCol'],
      },
      {
        headerName: '中文名',
        field: 'logicalName',
        // tooltipField: 'logicalName',
        valueFormatter: getLogicalName,
        tooltipValueGetter: getLogicalName,
        // minWidth: 80,
        // type: ['customSortCol'],
      },
      {
        headerName: '数据源',
        field: 'modelName',
        tooltipField: 'parentPhysicalName',
        // minWidth: 150,
        // type: ['customSortCol'],
      },
      {
        headerName: 'schema',
        field: 'schema',
        tooltipField: 'schema',
        // minWidth: 80,
        // type: ['customSortCol'],
      },
      {
        headerName: '创建时间',
        field: 'creationTime',
        // tooltipField: 'createTime',
        valueFormatter: formatterTime,
        tooltipValueGetter: formatterTime,
        // width: 200,
        // type: ['customSortCol'],
      },
      // {
      //   headerName: '操作',
      //   width: 100,
      //   type: ['optionsWithContent'],
      //   cellRendererParams: {
      //     tabComponent: this,
      //     options: [
      //       { name: 'checkObject', text: '查看', method: 'checkObject' },
      //     ],
      //   },
      // },
    ]
    this.columnDefs = columnDefs
  },

  mounted() {
    this.dataInit()
  },
  beforeDestroy() {},
  methods: {
    handleSizeChange(val) {
      this.pageSize = val
      this.currentPage = 1
      this.$refs.modelsTable && this.$refs.modelsTable.handleSizeChange(val)
    },
    handleCurrentChange(newVal) {
      this.currentPage = newVal
      this.$refs.modelsTable &&
        this.$refs.modelsTable.handleCurrentChange(newVal)
    },
    dataInit() {
      // console.log('choose table data init')
    },
    // *** tab with table ***
    getShowData(para) {
      // const keyword = _.trim(this.keyword) || ''
      // this.$http
      //   .get(
      //     `/dds/api/${this.selectedModelId}/${this.selectedSchema}/raw-tables?pageSize=${para.pageSize}&currentPage=${para.currentPage}&search=${keyword}`
      //   )
      //   .then(res => {
      //     console.log(res, 'res')
      //     const data = res.data
      //     const result = data.content
      //     this.totalShow = data.totalItems
      //     this.showData = result
      //     console.log(this.showData, 'this.showData')
      //     // setTimeout(() => {
      //     //   this.setChosenRow()
      //     // }, 50)
      //   })
      //   .catch(e => {
      //     this.$showFailure(e)
      //   })
      return new Promise((resolve, reject) => {
        const currentPage = para.currentPage
        const pageSize = para.pageSize
        const keyword = _.trim(this.keyword) || ''

        let getShowDataPro = null
        if (this.onlyShowChosen) {
          getShowDataPro = new Promise((resolve, reject) => {
            const result = []
            Object.keys(this.chosenMap).forEach(key => {
              const item = this.chosenMap[key]
              const props = ['definition', 'name']
              if (this.$MatchKeyword(item, keyword, ...props)) {
                result.push(item)
              }
            })

            const s = para.pageSize
            const c = para.currentPage
            const showArr = result.slice(s * (c - 1), s * c)

            resolve({
              data: {
                content: showArr,
                totalItems: result.length,
              },
            })
          })
        } else {
          const requestBody = {
            keyword: keyword,
            pageSize: pageSize + '',
            currentPage: currentPage + '',
            modelIds: [this.selectedModelId],
            schema: this.selectedSchema,
            types: ['TABLE'],
          }
          getShowDataPro = HTTP.getDbDataList({ requestBody })
        }

        getShowDataPro
          .then(res => {
            const data = res.data
            const result = data.content
            this.totalShow = data.totalItems
            this.showData = result
            setTimeout(() => {
              this.setChosenRow()
            }, 50)
            resolve(result)
          })
          .catch(e => {
            this.$showFailure(e)
            reject(e)
          })
      })
    },
    gridSelectionRealChange(para) {
      // const api = para.api
      const arr = para
      if (this.singleRowSelection) {
        this.selection = para
      } else {
        const newChosenNode = {}
        arr.forEach(item => {
          newChosenNode[item.objectId] = item
        })
        this.showData.forEach(item => {
          this.chosenMap[item.objectId] = newChosenNode[item.objectId] || ''
          if (!this.chosenMap[item.objectId]) {
            delete this.chosenMap[item.objectId]
          }
        })
        const result = []
        Object.keys(this.chosenMap).forEach(key => {
          result.push(this.chosenMap[key])
        })
        this.selection = result

        this.chosenCount = this.selection.length
      }
    },
    refreshTable() {
      // 关键字长度超出, 跳过搜索
      if (this.keyword && this.keyword.length > this.keywordMaxLength) return
      if (this.$refs.modelsTable && this.$refs.modelsTable.refreshData) {
        this.$refs.modelsTable.refreshData()
      }
    },
    confirmChoose() {
      this.$emit(
        'confirmChoose',
        this.singleRowSelection ? this.selection[0] || {} : this.selection
      )
    },
    getDbData() {
      /** 获取关联库表选项 tree 信息 */
      const sortByName = node => {
        const departments = node.subNodes
        this.$utils.sort.sortConsiderChineseNumber(departments)
      }
      this.modelTreePromise
        .then(res => {
          const t = res.data.subNodes
          if (t != null) {
            sortByName(res.data)
            t.forEach(item => {
              sortByName(item)
            })
            this.chooseTreeData = this.data2Casopts(t)
          }

          if (this.modelId && this.schema) {
            this.modelSchema =
              this.dbid2Optionid[`${this.modelId}/${this.schema}`] || ''
          } else if (this.modelId) {
            this.modelSchema = this.dbid2Optionid[this.modelId] || ''
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    data2Casopts(arr) {
      const dsCascaderTreeMap = {}
      const dbid2Optionid = {}
      let idCount = 1
      const arr2 = []
      const dealwithNode = node => {
        const children = []
        node.subNodes &&
          node.subNodes.forEach(subnode => {
            const newSub = dealwithNode(subnode)
            children.push(newSub)
          })
        const newNode = {
          id: node.id,
          type: node.type,
          name: node.name,
          disabled: !(node.type === 'MODEL' || node.type === 'SCHEMA'),
          children: children.length > 0 ? children : null,
          nodeId: idCount++,
        }
        dsCascaderTreeMap[newNode.nodeId] = newNode
        if (newNode.type === 'MODEL') {
          dbid2Optionid[newNode.id] = newNode.nodeId
        } else if (newNode.type === 'SCHEMA') {
          dbid2Optionid[newNode.id + '/' + newNode.name] = newNode.nodeId
        }
        return newNode
      }
      arr.forEach(item => {
        const newNode = dealwithNode(item)
        arr2.push(newNode)
      })
      this.dbid2Optionid = dbid2Optionid
      // console.log(this.dbid2Optionid, 'this.dbid2Optionid')
      this.dsCascaderTreeMap = dsCascaderTreeMap
      return arr2
    },
    changeSchema() {
      this.filterChange()
    },
    filterChange() {
      if (this.$refs.modelsTable && this.$refs.modelsTable.setCurrentPara) {
        this.$refs.modelsTable.setCurrentPara({
          currentPage: 1,
        })
      }
    },
    setChosenRow() {
      if (this.$refs.modelsTable && this.$refs.modelsTable.setChosenRow) {
        const ifChosen = node => {
          let bool = false
          if (this.chosenMap[node.data.objectId]) {
            bool = true
          }
          return bool
        }
        this.$refs.modelsTable.setChosenRow(ifChosen)
      }
    },
    showStyleChange() {
      this.filterChange()
    },
    checkObject({ data, api, e }) {
      this.$skip2({ name: 'table', query: { objectId: data.objectId } })
    },
    keywordChange: _.debounce(function () {
      this.filterChange()
    }, 500),
  },
  watch: {
    keyword(newVal) {
      if (newVal && newVal.length > this.keywordMaxLength) {
      } else {
        this.keywordChange()
      }
      // this.filterChange()
    },
  },
}
</script>

<style lang="scss" scoped>
.process-center-tab {
  // border: 1px solid red;
  // position: relative;
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;

  .delete-btn {
    margin-left: 20px;
  }
}

.choose-table-container {
  min-width: 800px;
  overflow: auto;
  background-color: #fff;
  .table-outer {
    .table-tab-container {
      bottom: 50px;
      // height: 440px;
      overflow: auto;
      .right-btn-container {
        width: 300px;
      }
      /deep/.datablau-tab-table-line {
        top: 52px;
        right: 20px;
        bottom: auto;
      }
      .right-filter {
        margin-right: 20px;
      }
    }
  }

  .dialog-bottom {
    .btn-detail {
      margin-top: 6px;
      display: inline-block;
      float: left;
    }
    .bottom-pagination {
      float: right;
      margin-top: 6px;
      margin-right: 20px;
    }
  }

  .left-filter {
    //border: 1px solid red;
    width: 600px;
  }

  .chosen-count {
    //color: #409eff;
  }
}
</style>
