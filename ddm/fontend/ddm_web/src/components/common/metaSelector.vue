<template>
  <datablau-dialog
    :width="dialogWidth"
    :title="dialogTitle"
    :visible.sync="tableDialogVisible"
  >
    <div style="height: 350px; position: relative">
      <div style="position: absolute; top: 0; left: 0; width: 300px; bottom: 0">
        <datablau-input
          v-model="keyword"
          style="width: 300px"
          placeholder="搜索数据源"
        ></datablau-input>
        <datablau-tree
          style="
            position: absolute;
            top: 50px;
            left: 0;
            right: 0;
            bottom: 0;
            overflow: auto;
          "
          @node-click="handleNodeClick"
          node-key="id"
          :props="defaultProps"
          :data="treeData"
          :data-supervise="false"
          :data-icon-function="dataIconFunction"
          :expand-on-click-node="false"
          ref="tree2"
          :filter-node-method="filterNode"
        ></datablau-tree>
      </div>
      <div
        style="position: absolute; left: 320px; width: 300px; bottom: 0; top: 0"
      >
        <datablau-input
          v-model="tableKeyword"
          :placeholder="$t('meta.lineageManage.searchTable')"
          style="width: 100%"
        ></datablau-input>
        <datablau-tree
          style="
            position: absolute;
            top: 50px;
            left: 0;
            right: 0;
            bottom: 0;
            overflow: auto;
          "
          ref="tree"
          :props="defaultProps2"
          :data="treeDataOfTable"
          :data-supervise="false"
          :data-icon-function="dataIconFunction2"
          @node-click="handleNodeClick2"
        ></datablau-tree>
      </div>
      <div
        v-if="selectColumn"
        style="position: absolute; left: 640px; right: 0; bottom: 0; top: 0"
      >
        <datablau-input
          v-model="columnKeyword"
          :placeholder="$t('meta.lineageManage.searchColumn')"
          style="width: 100%"
        ></datablau-input>
        <datablau-tree
          style="
            position: absolute;
            top: 50px;
            left: 0;
            right: 0;
            bottom: 0;
            overflow: auto;
          "
          :props="defaultProps3"
          :data="columns"
          ref="tree1"
          :filter-node-method="filterNode1"
          :data-supervise="false"
          :data-icon-function="dataIconFunction3"
          @node-click="handleNodeClick3"
        ></datablau-tree>
      </div>
    </div>
    <div slot="footer">
      <datablau-button type="secondary" @click="closeTableDialog">
        {{ $t('common.button.cancel') }}
      </datablau-button>
      <datablau-button
        type="primary"
        @click="saveTableDialog"
        :disabled="buttonDisabled"
      >
        {{ $t('common.button.ok') }}
      </datablau-button>
    </div>
  </datablau-dialog>
</template>

<script>
  export default {
    props: {
      type: {
        type: String,
        default: 'table',
      },
      dialogTitle: {
        type: String,
        default: '数据源设置',
      },
    },
    data() {
      return {
        tableDialogVisible: false,
        keyword: '',
        defaultProps: {
          children: 'subNodes',
          label: 'name',
        },
        treeData: [],
        selectedTable: null,
        modelCatMap: {},
        modelMap: {},
        tableKeyword: '',
        modelId: null,
        schema: null,
        treeDataOfTable: [],
        defaultProps2: {
          label: 'physicalName',
        },
        defaultProps3: {
          label: 'physicalName',
        },
        idCount: 0,
        selectedColumn: null,
        columns: [],
        columnKeyword: '',
        modelIdId: ''
      }
    },
    computed: {
      selectColumn() {
        return this.type === 'column'
      },
      dialogSize() {
        let size = 'm'
        if (this.selectColumn) {
          return 'xl'
        }
        return size
      },
      dialogWidth() {
        if (this.selectColumn) {
          return '980px'
        } else {
          return '660px'
        }
      },
      buttonDisabled() {
        if (this.selectColumn) {
          return !this.selectedColumn
        } else {
          return !this.selectedTable
        }
      },
    },
    mounted() {
      this.getModelTree()
    },
    methods: {
      init() {
        this.tableDialogVisible = true
        this.selectedColumn = null
        this.selectedTable = null
        if (this.$refs.tree) {
          this.$refs.tree.setCurrentKey()
        }
      },
      handleNodeClick(data) {
        if (data.type === 'MODEL') {
          this.schema = null
          this.modelId = data.modelIds
          this.modelIdId = data.id
          this.modelName = data.name
          this.searchTables()
        } else if (data.type === 'MODEL_SCHEMA') {
          this.schema = data.name
          this.modelId = data.modelIds
          this.modelIdId = data.id
          this.modelName =
            data.id.split('_%_')[1] /* + ' / ' + data.id.split('_%_')[2] */
          this.searchTables()
        }
      },
      getModelTree() {
        this.treeData = []
        this.$http
          .get(this.$damUrl + '/models/modeltree')
          .then(res => {
            if (res.data.subNodes) {
              const modelTree = _.cloneDeep(res.data.subNodes)
              modelTree.forEach(dep => {
                if (dep.subNodes) {
                  dep.subNodes.forEach(cat => {
                    if (cat.subNodes) {
                      cat.subNodes.forEach(model => {
                        delete model.subNodes
                      })
                    }
                  })
                }
              })
              this.getModCatMap(res.data)
              this.treeData = this.treeSort(res.data)
              // this.handleTreeFiltered()
            }
          })
          .catch(e => {
            this.$showFailure(e)
          })
          .then(() => {})
      },
      getModCatMap(node) {
        if (!node) return
        node.id = node.id || 'noId' + this.idCount++
        this.modelMap[node.id] = node
        if (node.type === 'MODEL_CATEGORY') {
          this.modelCatMap[node.id + ''] = node
        }
        if (
          node &&
          node.subNodes &&
          Array.isArray(node.subNodes) &&
          node.subNodes.length > 0
        ) {
          const arr = node.subNodes
          arr.forEach(item => {
            this.getModCatMap(item)
          })
        }
      },
      classifyModel() {
        const arr = []
        const map = {} // name => modle
        const others = {
          name: '其他',
          subNodes: [],
          id: 'others',
          type: 'catlog',
        }
        let idCnt = 1
        this.$modelCategories.forEach(item => {
          const prop = this.classifyType
          const obj = this.modelCatMap[item.categoryId + '']
          let par = null
          if (!item[prop]) {
            // 该属性为 null
            if (!map.others) {
              map.others = others
              arr.push(others)
            }
            par = map.others
          } else if (!map[item[prop]]) {
            // 该属性有值, 但第一次出现
            const catlog = {
              name: item[prop],
              subNodes: [],
              id: 'catId' + idCnt++,
              type: 'catlog',
            }
            map[catlog.name] = catlog
            arr.push(catlog)
            par = catlog
          } else {
            par = map[item[prop]]
          }
          if (par.subNodes && Array.isArray(par.subNodes)) {
            par.subNodes.push(obj)
          }
        })
        const root = {
          name: 'root',
          id: 'root',
          type: 'root',
          subNodes: arr,
        }
        this.treeData = this.treeSort(root)
        setTimeout(() => {
          if (this.keyword) {
            this.$refs.tree2.filter(this.keyword)
          }
        })
      },
      treeSort(root) {
        const t = root.subNodes
        if (t != null) {
          this.sortByName(root)
          t.forEach(item => {
            this.sortByName(item)
            item.subNodes &&
            item.subNodes.forEach(c => {
              if (c.type === 'MODEL_CATEGORY') {
                c.id = 'c' + c.id
              }
              if (c.subNodes) {
                this.sortByName(c)
                c.subNodes.forEach(m => {
                  if (m.subNodes) {
                    this.sortByName(m)
                    m.subNodes.forEach(s => {
                      s.id += '_%_' + m.name + '_%_' + s.name
                    })
                  }
                })
              }
            })
          })
        }
        const index = t.findIndex(item => {
          return item.id === 'others'
        })
        if (index !== -1) {
          const others = t.splice(index, 1)
          t.push(others[0])
        }
        return t
      },
      sortByName(node) {
        const departments = node.subNodes
        this.$utils.sort.sortConsiderChineseNumber(departments)
      },
      searchTables() {
        const requestUrl = `${this.$damUrl}/entities/searchMetadata`
        const requestBody = {
          currentPage: 1,
          keyword: this.tableKeyword,
          pageSize: 500,
          modelIds: this.modelId,
          schema: this.schema,
          typeIds: ['80000004'],
          tagIds: null,
          sortByName: null,
          sortByCreateTime: null,
        }
        this.$http.post(requestUrl, requestBody).then(res => {
          this.treeDataOfTable = res.data.content
        })
      },
      dataIconFunction(data, node) {
        if (data.type === 'IT_DEPART') {
          if (node.expanded) {
            return 'iconfont icon-openfile'
          } else {
            return 'iconfont icon-file'
          }
        } else if (data.type === 'MODEL') {
          return 'iconfont icon-shujuyuan'
        } else if (data.type === 'MODEL_SCHEMA') {
          return 'iconfont icon-schema'
        } else if (data.type === 'MODEL_CATEGORY') {
          return 'iconfont icon-xitong'
        } else {
          console.error(data)
        }
      },
      dataIconFunction2() {
        return 'iconfont icon-biao'
      },
      dataIconFunction3() {
        return 'iconfont icon-ziduan'
      },
      filterNode(value, data, node) {
        if (!value) return true
        if (data.type === 'ALL' || data.type === 'ALLFILE') {
          return true
        }
        let current = node
        do {
          if (this.$MatchKeyword(current.data, value, 'name')) {
            return true
          }
          current = current.parent
        } while (current && current.data.name)
        return false
      },
      filterNode1(value, data, node) {
        if (!value) return true
        if (_.toLower(data.physicalName).includes(_.trim(_.toLower(value)))) {
          return true
        }
      },
      handleNodeClick2(data) {
        this.selectedTable = data
        this.searchColumns(data.objectId)
      },
      searchColumns(tableId) {
        const requestUrl = `${this.$damUrl}/entities/${tableId}/columns`
        this.$http
          .get(requestUrl)
          .then(res => {
            this.columns = res.data
          })
          .catch(e => {
            this.$showFailure(e)
          })
      },
      handleNodeClick3(data) {
        this.selectedColumn = data
      },
      saveTableDialog() {
        this.tableDialogVisible = false
        const node = this.$refs.tree2.getNode(this.modelIdId)
        let categoryName, categoryId
        if (node.parent.data.type === 'MODEL_CATEGORY') {
          categoryName = node.parent.data.name
          categoryId = parseInt(node.parent.data.id.slice(1))
        } else {
          categoryName = node.parent.parent.data.name
          categoryId = parseInt(node.parent.parent.data.id.slice(1))
        }
        this.$emit('select', {
          model: {
            categoryName,
            categoryId,
            name: this.modelName,
            id: this.modelId,
            schema: this.selectedTable.schema,
          },
          table: this.selectedTable,
          column: this.selectedColumn,
        })
      },
      closeTableDialog() {
        this.tableDialogVisible = false
      },
    },
    watch: {
      keyword(val) {
        this.$refs.tree2.filter(val)
      },
      columnKeyword(val) {
        this.$refs.tree1.filter(val)
      },
      tableKeyword(val) {
        this.searchTables()
      },
    },
  }
</script>

<style scoped></style>
