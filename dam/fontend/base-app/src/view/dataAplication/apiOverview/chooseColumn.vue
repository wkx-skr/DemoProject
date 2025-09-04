<template>
  <div class="choose-table-container">
    <el-dialog
      title="选择表"
      :visible.sync="showChooseTable"
      width="50%"
      class="app-edit-dialog"
      append-to-body
    >
      <div class="table-outer">
        <choose-table
          :singleRowSelection="true"
          :schema="schema"
          :modelId="modelId"
          :showModelFilter="false"
          @confirmChoose="confirmChoose"
        ></choose-table>
      </div>
    </el-dialog>
    <div class="table-outer">
      <datablau-eltable
        class="table-tab-container column-container"
        ref="modelsTable"
        :totalShow="totalShow"
        :columnDefs="columnDefs"
        :hideBottomLine="true"
        :getShowData="getShowData"
        :hideTopLine="false"
        rowKey="objectId"
        :reserveSelection="true"
        :hideDefaultFilter="true"
        :showCustomFilter="true"
        :tableOption="tableOption"
        :tableHeightInfo="tableHeightInfo"
        :tableHidePagination="tableHidePagination"
        :defaultParaData="defaultParaData"
        @selectionChange="gridSelectionRealChange"
        maxHeight="400"
      >
        <!-- @gridReady="gridReady" -->
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
              placeholder="请选择表"
              v-model="keyword"
              :clearable="true"
              stype="with: 150px;"
              v-if="showTableFilter"
            ></datablau-input>
            <datablau-input
              class="search-input"
              size="mini"
              placeholder="输入关键字进行搜索"
              v-model="keyword"
              :clearable="true"
              stype="with: 150px;"
              v-length-validator:[keywordMaxLength]="keyword"
            ></datablau-input>
            &nbsp;&nbsp;
            <el-checkbox
              @change="showStyleChange"
              v-model="onlyShowChosen"
              v-if="!singleRowSelection"
            >
              仅显示已选择
            </el-checkbox>
          </div>
        </div>
        <div class="right-filter" slot="header">
          <datablau-button size="mini" @click="refreshTable">
            刷 新
          </datablau-button>
        </div>
        <div class="bottom-btn-container" slot="footer">
          <datablau-button
            type="primary"
            size="small"
            class="delete-btn"
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
      <!-- <span v-if="!singleRowSelection" style="margin-left: 10px">
          共选中
          <span class="chosen-count">{{ chosenCount }}</span>
          条数据
        </span> -->
      <datablau-pagination
        class="bottom-pagination"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="currentPage"
        :page-sizes="[20, 50, 100]"
        :page-size="pageSize"
        :total="totalShow"
        layout="total, sizes, prev, pager, next"
      ></datablau-pagination>
    </div>
  </div>
</template>

<script>
import HTTP from '@/http/main.js'
import chooseTable from './chooseTable.vue'
import treeDemoVue from '@/next/components/document/basic/treeDemo.vue'

export default {
  name: 'chooseColumn',
  data() {
    return {
      modelTreePromise: null,
      tableHeightInfo: '',
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
      onlyShowChosen: false,
      loading: false,

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
        columnResizable: true,
      },
      tableHidePagination: false,
      currentPage: 1,
      pageSize: 20,
      defaultParaData: {
        currentPage: 1,
        pageSize: 20,
      },
      // 列表中展示的数据
      showData: [],
      // 存储选中的 table, 通过遍历, 生成 selection
      chosenMap: {},
      // 已选择的字段
      selection: [],
      chosenCount: 0,
      showChooseTable: false,
      keywordMaxLength: 20,
      // 当表已经选定, 保存表对应的字段
      tableColsMap: {},
      // 已经缓存的 字段 信息
      columnsMap: {},
      // grid ready 回调函数的 防抖
      initTimer: 0,
    }
  },
  props: {
    // TODO:
    // 如果有默认的 table, 并且不能选其他table,
    // 自动过滤给出的 默认选中的字段
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
    // 默认选中的 table
    tableId: {
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
    // 是否可以选择表
    showTableFilter: {
      type: Boolean,
      default: false,
    },
    couldChangeTable: {
      type: Boolean,
      default: false,
    },
    tableName: {
      type: String,
      default: '',
    },
    // 默认选中的 columns 对象,
    // 可以是 objectId 数字, 或者是对象数字, 对象必须包含 objectId 属性
    choseCols: {
      type: Array,
      default() {
        return []
      },
    },
  },
  components: {
    chooseTable,
  },
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
      //   width: 70,
      // },
      {
        headerName: '名称',
        field: 'physicalName',
        tooltipField: 'physicalName',
        minWidth: 80,
        // type: ['customSortCol'],
      },
      {
        headerName: '中文名',
        field: 'physicalName',
        // tooltipField: 'physicalName',
        valueFormatter: getLogicalName,
        tooltipValueGetter: getLogicalName,
        minWidth: 80,
        // type: ['customSortCol'],
      },
      {
        headerName: '数据类型',
        field: 'type',
        tooltipField: 'type',
        minWidth: 120,
        // type: ['customSortCol'],
      },
      {
        headerName: '数据源',
        field: 'modelName',
        tooltipField: 'parentPhysicalName',
        minWidth: 150,
        // type: ['customS/ortCol'],
      },
      {
        headerName: 'schema',
        field: 'schema',
        tooltipField: 'schema',
        minWidth: 80,
        // type: ['customSortCol'],
      },
      {
        headerName: '表',
        field: 'parentName',
        tooltipField: 'parentName',
        minWidth: 80,
        // type: ['customSortCol'],
      },
      {
        headerName: '创建时间',
        field: 'creationTime',
        // tooltipField: 'createTime',
        valueFormatter: formatterTime,
        tooltipValueGetter: formatterTime,
        width: 135,
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
    dataInit() {},
    // *** tab with table ***
    async getShowData(para) {
      return await new Promise((resolve, reject) => {
        const currentPage = para.currentPage
        const pageSize = para.pageSize
        const keyword = _.trim(this.keyword) || ''
        this.loading = true
        let getShowDataPro = null
        if (this.onlyShowChosen) {
          getShowDataPro = new Promise((resolve, reject) => {
            const result = []
            Object.keys(this.chosenMap).forEach(key => {
              const item = this.chosenMap[key]
              const props = ['physicalName', 'name']
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
          if (this.tableId) {
            getShowDataPro = new Promise((resolve, reject) => {
              let colsPro = this.tableColsMap[this.tableId]
              if (!colsPro) {
                colsPro = this.tableColsMap[this.tableId] = HTTP.getTableCols({
                  objectId: this.tableId,
                })
              }
              // HTTP.getTableCols({objectId: this.tableId})
              colsPro
                .then(res => {
                  const data = res.data
                  const result = []
                  data.forEach(item => {
                    item.name = item.physicalName
                    if (this.tableName) {
                      item.parentName = this.tableName
                    }
                    const props = ['physicalName', 'name']
                    if (this.$MatchKeyword(item, keyword, ...props)) {
                      result.push(item)
                    }

                    this.columnsMap[item.objectId] = item
                  })
                  this.$utils.sort.sort(result, 'physicalName')

                  const s = para.pageSize
                  const c = para.currentPage
                  const showArr = result.slice(s * (c - 1), s * c)
                  this.loading = false
                  resolve({
                    data: {
                      content: showArr,
                      totalItems: result.length,
                    },
                  })
                })
                .catch(e => {
                  this.loading = false
                  this.$showFailure(e)
                  resolve([])
                })
            })
          } else {
            const requestBody = {
              keyword: keyword,
              pageSize: pageSize + '',
              currentPage: currentPage + '',
              modelId: this.selectedModelId,
              schema: this.selectedSchema,
              types: ['TABLE'],
            }
            getShowDataPro = HTTP.getDbDataList({ requestBody })
          }
        }
        getShowDataPro
          .then(res => {
            const data = res.data
            const result = data.content
            this.totalShow = data.totalItems
            this.showData = result
            // this.$nextTick(() => {
            //   this.$nextTick(this.setChosenRow)
            // })
            setTimeout(() => {
              this.gridReady()
            }, 50)
            this.loading = false
            resolve(result)
          })
          .catch(e => {
            this.loading = false
            this.$showFailure(e)
            reject(e)
          })
      })
    },
    gridReady() {
      if (this.initTimer) {
        clearTimeout(this.initTimer)
      }
      this.initTimer = setTimeout(() => {
        this.initChoseCols()
          .then(res => {
            this.loading = false
          })
          .catch(e => {
            console.log(e)
          })
      }, 400)
    },
    gridSelectionRealChange(para) {
      // const api = para.api
      const arr = para
      if (this.singleRowSelection) {
        // 单选 直接赋值
        this.selection = para
      } else {
        const newChosenNode = {}
        arr.forEach(item => {
          newChosenNode[item.objectId] = item
        })

        // 遍历当前显示的一组数据, 选中的增加到 chosenMap, 未选中的从 chosenMap 中移出
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
      }
      this.chosenCount = this.selection.length
    },
    refreshTable() {
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
    async initChoseCols() {
      this.loading = true
      const proArr = []
      const choseCols = this.choseCols
      if (choseCols && Array.isArray(choseCols)) {
        for (let i = 0, len = choseCols.length; i < len; i++) {
          let objectId = choseCols[i]
          if (!objectId) continue
          if (isNaN(objectId - 0)) {
            if (objectId && objectId.objectId) {
              objectId = objectId.objectId
            }
          }
          let colData = this.columnsMap[objectId]
          if (!colData) {
            colData = HTTP.getTableSummaryPro({ objectId: objectId })
            colData
              .then(res => {
                this.loading = false
                this.columnsMap[objectId] = res.data
                this.chosenMap[objectId] = res.data
              })
              .catch(e => {
                this.loading = false
                this.$showFailure(e)
              })
            proArr.push(colData)
          } else {
            this.loading = false
            this.chosenMap[objectId] = colData
          }
        }
      }

      await Promise.all(proArr)
        .then(res => {
          const result = []
          Object.keys(this.chosenMap).forEach(key => {
            result.push(this.columnsMap[key])
          })
          this.selection = result
          if (this.selection.length > 0) {
            let self = this
            this.$nextTick(() => {
              self.selection.forEach(item => {
                self.$refs.modelsTable &&
                  self.$refs.modelsTable.$refs.deTable &&
                  self.$refs.modelsTable.$refs.deTable.$refs.table &&
                  self.$refs.modelsTable.$refs.deTable.$refs.table.toggleRowSelection(
                    item,
                    true
                  )
              })
            })
          }
          this.chosenCount = this.selection.length

          this.setChosenRow()
        })
        .catch(e => {
          console.log(e)
        })
    },
    setChosenRow() {
      // if (this.$refs.modelsTable && this.$refs.modelsTable.setChosenRow) {
      //   const ifChosen = node => {
      //     let bool = false
      //     console.log(this.chosenMap,'this.chosenMap')
      //     if (this.chosenMap[node.data.objectId]) {
      //       bool = true
      //     }
      //     return bool
      //   }
      //   this.$refs.modelsTable.setChosenRow(ifChosen)
      // }
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
      bottom: 54px;
      // height: 440px;
      overflow: auto;
      .right-btn-container {
        width: 300px;
      }
      /deep/.datablau-tab-top-line {
        top: 10px;
      }
      /deep/.datablau-tab-table-line {
        top: 70px;
        right: 20px;
        // bottom: auto;
      }
      .right-filter {
        margin-right: 20px;
      }
    }
  }

  .bottom-btn-info,
  .dialog-bottom {
    // position: absolute;
    // bottom: 0;
    // height: 50px;
    // margin-top: 9px;
    // left: 0;
    // right: 0;
    // z-index: 100;
    // background: white;
    // padding-left: 10px;
    // border-top: 1px solid #e0e0e0;
    // box-shadow: 0px -5px 14px -8px rgba(0, 0, 0, 0.2);
    .btn-detail {
      float: left;
    }
    .bottom-pagination {
      float: right;
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
