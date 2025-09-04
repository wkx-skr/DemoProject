import NewAccessStrategy from './components/newAccessStrategy.vue'
import RowAccessStrategy from './components/rowAccessStrategy.vue'
import DesensitizeBox from './components/desensitizeBox/index.vue'
import Details from './components/details.vue'
import ResizeHorizontal from '@/components/common/ResizeHorizontal'
import api from '../util/api'
export default {
  name: 'AccessStrategy',
  components: {
    NewAccessStrategy,
    RowAccessStrategy,
    Details,
    DesensitizeBox,
  },
  data() {
    let nameValidatePass = async (rule, value, callback) => {
      if (this.catalogDetails.name === '') {
        callback(new Error('请输入目录名称'))
      } else {
        // 判断是否含不允许输入的特殊字符
        const reg = /[#/\\@$_%<>]/gi
        if (reg.test(this.catalogDetails.name)) {
          callback(new Error('目录名称不允许包含#/\\@$_%<>等特殊字符'))
        } else {
          // 判断名称是否已存在
          const existRes = await api.checkStrategyCatalogName({
            parentId: this.catalogDetails.parentId,
            name: this.catalogDetails.name,
            id: this.catalogDetails.catalogId || 0,
          })
          if (!existRes.data.data) {
            callback(new Error('目录名称已存在，请重新输入'))
          } else {
            callback()
          }
        }
      }
    }
    return {
      catalogInfo: {},
      strategyType: '',
      currentStrategyId: null,
      treeData: [],
      defaultProps: {
        children: 'subNodes',
        label: 'name',
      },
      treeStructure: {},
      allCatalogs: {},
      currentNode: {},
      chooseResult: {},
      searchLoading: false,
      searchResult: [],
      catalogKeyword: '',
      catalogDialogVisible: false,
      catalogDialogTitle: '',
      catalogDetails: {},
      rulePram: {
        name: {
          required: true,
          validator: nameValidatePass,
          trigger: 'blur',
        },
      },
      loading: false,
      keyword: '',
      tableData: [],
      pagination: {
        pageNum: 1,
        pageSize: 20,
        total: 0,
        sort: 'desc',
      },
      tableSelection: [],
      showDetails: false,
      editable: false,
      catalogEditable: false,
      activeStrategy: {},

      tableId: '',
      columnId: '',
    }
  },
  created() {
    const type = this.$route.query.type

    // 如果是访问策略，需要从vuex中查询用户所选的表，如果是其他策略，则通过路由带参数

    switch (type) {
      // newAccessStrategy --- 表访问策略
      case 'accessStrategy':
        this.strategyType = 'ACCESS_STRATEGY'
        this.showDetails = true
        this.editable = true
        break
      // rowAccessStrategy --- 行级访问策略
      case 'rowAccessStrategy':
        this.strategyType = 'ACCESS_ROW_STRATEGY'
        this.tableId = this.$route.query.tableId
        this.showDetails = true
        this.editable = true
        break
      // columnMaskStrategy --- 字段脱敏策略
      case 'columnMaskStrategy':
        this.strategyType = 'ACCESS_DATAMASK_COLUMN'
        this.columnId = this.$route.query.columnId
        this.showDetails = true
        this.editable = true
        break
      // tableMaskStrategy --- 表脱敏策略
      case 'tableMaskStrategy':
        this.strategyType = 'ACCESS_DATAMASK_TABLE'
        this.tableId = this.$route.query.tableId
        this.showDetails = true
        this.editable = true
        break
      default:
        this.strategyType = ''
        this.showDetails = false
        this.editable = false
        break
    }
  },
  async mounted() {
    this.initResizeHorizontal()
    await this.getStrategyCatalogList()
    this.$nextTick(() => {
      if (!this.currentNode.catalogId) {
        this.currentNode = this.treeData[0] || {}
      }
    })
  },
  methods: {
    initResizeHorizontal() {
      setTimeout(() => {
        new ResizeHorizontal({
          leftDom: $('.page-tree'),
          middleDom: $('.resize-column-middle'),
          rightDom: $('.page-content'),
          noCrack: true,
          minWith: { leftMinWidth: 240, leftMaxWidth: 800 },
        })
      }, 1000)
    },
    async getStrategyCatalogList() {
      try {
        const res = await api.getStrategyCatalog()
        if (res.status === 200) {
          const treeData = res.data.data.subNodes || []
          this.treeData = treeData
        } else {
          this.$blauShowFailure(res)
        }
      } catch (error) {
        this.$blauShowFailure(error)
      }
    },
    getStrategyData(defaultProps = {}) {
      const params = {
        catalogId: this.currentNode.catalogId,
        strategyName: this.keyword,
        currentPage: this.pagination.currentPage,
        pageSize: this.pagination.pageSize,
        sort: this.pagination.sort,
        ...defaultProps,
      }
      api
        .getStrategyList(params)
        .then(res => {
          this.tableData = res.data.data.content || []
          this.pagination.currentPage = params.currentPage
          this.pagination.pageSize = params.pageSize
          this.pagination.total = res.data.data.totalItems
        })
        .catch(res => {
          this.$blauShowFailure(res)
        })
    },

    async searchCatalog(value) {
      this.searchLoading = true
      try {
        const searchRes = await api.searchItemCatalog(value)
        const result = searchRes.data || []
        result.forEach(item => {
          item.catalogNamePath = item.catalogNamePath + item.name
        })
        this.searchResult = result
        this.searchLoading = false
      } catch (error) {
        this.searchLoading = false
        this.$showFailure(error)
      }
    },
    // 根据关键字过滤策略目录树
    filterStrategyCatalogs(value, data) {
      if (!value) return true
      return data.name.indexOf(value) !== -1
    },
    // 将当前节点的所有父级节点展开
    async expandParents(node) {
      const tree = this.$refs.strategyTree.$refs.tree
      let parentNode = tree.getNode({ catalogId: node.parentId })
      while (parentNode) {
        const parentData = parentNode.data
        parentNode.isLeaf = false
        parentNode.expanded = true
        parentNode = tree.getNode({ catalogId: parentData.parentId })
      }
    },
    handleNodeClick(data, node) {
      this.currentNode = data
      this.selectedStrategy = []
      this.$refs.strategyTable.clearSelection()
    },
    // 目录树操作菜单
    dataOptionsFunction(data) {
      return [
        this.$auth.DATA_SECURITY_STRATEGY_MANAGE
          ? {
              icon: 'iconfont icon-tianjia',
              label: '新建目录',
              callback: () => {
                this.openCatalogDialog('new', data)
              },
            }
          : '',
        this.$auth.DATA_SECURITY_STRATEGY
          ? {
              icon: 'iconfont icon-see',
              label: '查看目录',
              callback: () => {
                this.openCatalogDialog('see', data)
              },
            }
          : '',
        this.$auth.DATA_SECURITY_STRATEGY_MANAGE
          ? {
              icon: 'iconfont icon-revise',
              label: '修改目录',
              callback: () => {
                this.openCatalogDialog('edit', data)
              },
            }
          : '',
        this.$auth.DATA_SECURITY_STRATEGY_MANAGE
          ? {
              icon: 'iconfont icon-delete',
              label: '删除目录',
              callback: () => {
                this.deleteCatalog(data)
              },
            }
          : '',
      ].filter(item => item !== '')
    },
    // 目录树节点图标
    dataIconFunction(data, node) {
      let className = ''
      if (data.code) {
        className = 'tree-icon domain'
        if (data.udpatingId) {
          className += ' is-udpating'
        }
      } else {
        if (node.expanded) {
          className = 'iconfont icon-openfile'
        } else {
          className = 'iconfont icon-file'
        }
      }
      return className
    },
    // 打开目录对话框（新建或修改）
    openCatalogDialog(type, data) {
      if (type === 'new') {
        this.catalogDetails = {
          name: '',
          describe: '',
          parentId: data.catalogId || 0,
        }
        this.catalogDialogTitle = '新建目录'
        this.catalogEditable = true
      }
      if (type === 'edit') {
        this.catalogDetails = {
          name: data.name,
          describe: data.describe,
          parentId: data.parentId,
          catalogId: data.catalogId,
        }
        this.catalogDialogTitle = '修改目录'
        this.catalogEditable = true
      }

      if (type === 'see') {
        console.log(data)
        this.catalogDetails = {
          ...data,
        }
        this.catalogDialogTitle = '查看目录'
        this.catalogEditable = false
      }

      this.catalogDialogVisible = true
      this.$refs.catalogForm && this.$refs.catalogForm.clearValidate()
    },
    // 关闭目录对话框
    closeCatalogDialog() {
      this.catalogDetails = {}
      this.catalogDialogTitle = ''
      this.catalogDialogVisible = false
    },
    submitCatalog() {
      if (this.catalogDetails.catalogId) {
        this.changeCatalog()
      } else {
        this.addCatalog()
      }
    },
    // 提交新增目录
    async addCatalog() {
      // console.log('add catalog')
      this.$refs.catalogForm.validate(async valid => {
        if (valid) {
          try {
            const { name, parentId, describe } = this.catalogDetails
            const addRes = await api.addStrategyCatalog({
              parentId,
              name,
              describe,
              subNodes: [],
              type: 'ACCESS_CONTROL',
            })
            // console.log(addRes)
            if (addRes.status === 200) {
              this.catalogDialogVisible = false
              await this.getStrategyCatalogList()
              this.currentNode = this.$refs.strategyTree.$refs.tree.getNode({
                catalogId: addRes.data.data,
              }).data
              this.$message.success('新增成功')
            }
          } catch (error) {
            this.$blauShowFailure(error)
          }
        }
      })
    },
    // 提交修改目录
    async changeCatalog() {
      let para = _.cloneDeep(this.catalogDetails)
      const updateRes = await api.modifyStrategyCatalog({
        ...para,
        type: 'ACCESS_CONTROL',
      })
      if (updateRes.status === 200) {
        this.catalogDialogVisible = false
        let node = this.$refs.strategyTree.$refs.tree.getNode({
          catalogId: para.catalogId,
        })
        if (node) {
          node.data = { ...para, subNodes: node.data.subNodes }
          this.currentNode = node.data
        }
        this.$message.success('修改成功')
      }
    },

    // 删除目录
    deleteCatalog(data) {
      if (data.subNodes && data.subNodes.length !== 0) {
        this.$message.error('存在下级目录，不能直接删除本目录')
      } else {
        this.$DatablauCofirm(
          '确定要删除该目录吗？',
          this.$t('domain.common.tip'),
          {
            type: 'warning',
            closeOnClickModal: false,
          }
        ).then(() => {
          const { catalogId, parentId } = data
          api
            .deleteStrategyCatalog(catalogId, 'ACCESS_CONTROL')
            .then(async deleteRes => {
              if (deleteRes.status === 200) {
                this.$blauShowSuccess('删除成功')
                this.$refs.strategyTree.$refs.tree.remove({ catalogId })
                if (this.currentNode.catalogId === catalogId) {
                  this.currentNode =
                    parentId === 0
                      ? this.treeData[0]
                      : this.$refs.strategyTree.$refs.tree.getNode({
                          catalogId: data.parentId,
                        }).data
                } else {
                  this.currentNode = _.cloneDeep(this.currentNode)
                }
              } else {
                this.$blauShowFailure(deleteRes.data)
              }
            })
            .catch(error => {
              this.$blauShowFailure(error)
            })
        })
      }
    },
    // 策略类型映射
    strategyTypeMap(row) {
      if (row.type === 'ACCESS_STRATEGY') return '访问策略'
      if (row.type === 'ACCESS_ROW_STRATEGY') return '行级访问策略'
      if (row.type === 'ACCESS_DATAMASK_COLUMN') return '字段脱敏策略'
      if (row.type === 'ACCESS_DATAMASK_TABLE') return '表脱敏策略'
      return ''
    },
    // 访控策略表格逻辑处理 开始dataOptionsFunction
    handleTableSelectChange(list) {
      this.tableSelection = _.cloneDeep(list)
    },
    handleSizeChange(size) {
      this.getStrategyData({
        pageSize: size,
        currentPage: 1,
      })
    },
    handleCurrentChange(current) {
      this.getStrategyData({
        currentPage: current,
      })
    },
    handleSortChange({ order }) {
      const sort = order === 'ascending' ? 'asc' : 'desc'
      this.pagination.sort = sort
      this.getStrategyData({
        currentPage: 1,
        sort,
      })
    },
    // 访控策略表格逻辑处理 结束
    // 删除策略
    deleteStrategy(row) {
      let params = {
        ACCESS_STRATEGY: [],
        ACCESS_DATAMASK_TABLE: [],
        ACCESS_DATAMASK_COLUMN: [],
        ACCESS_ROW_STRATEGY: [],
      }
      let selectedStrategy = []
      let title = '确定要删除吗？'
      if (row) {
        title = '确定要删除吗？'
        selectedStrategy = [row]
      } else {
        title = `选中“${this.tableSelection.length}条”，确认要删除吗？`
        selectedStrategy = this.tableSelection
      }
      this.$DatablauCofirm(title, '提示', {
        type: 'warning',
        cancelButtonText: '取消',
        confirmButtonText: '确定',
      }).then(() => {
        selectedStrategy.forEach(strategy => {
          params[strategy.type].push(strategy.accessControlId)
        })
        api
          .deleteStrategyData({
            accessStrategyIdList: params.ACCESS_STRATEGY,
            maskIdList: params.ACCESS_DATAMASK_TABLE.concat(
              params.ACCESS_DATAMASK_COLUMN
            ),
            rowAccessStrategyIdList: params.ACCESS_ROW_STRATEGY,
          })
          .then(res => {
            if (res.data.status === 200) {
              this.$blauShowSuccess('删除成功')
              this.tableSelection = []
              this.getStrategyData()
              this.$refs.strategyTable.clearSelection()
            }
          })
          .catch(e => {
            this.$showFailure(e)
          })
      })
    },
    checkStrategy(row) {
      // console.log(row)
      this.showDetails = true
      this.strategyType =
        row.type === 'ACCESS_DATAMASK'
          ? 'ACCESS_DATAMASK_' + row.maskType
          : row.type
      this.editable = false
      this.activeStrategy = row
      this.currentStrategyId = row.accessControlId
    },
    handleCommand(name) {
      switch (name) {
        case 'ACCESS_DATAMASK_COLUMN':
          break
        case 'ACCESS_DATAMASK_TABLE':
          break
        case 'ACCESS_STRATEGY':
          break
        case 'ACCESS_ROW_STRATEGY':
          break
        default:
          break
      }
      this.catalogInfo = {
        catalogId: this.currentNode.catalogId,
        catalogName: this.currentNode.name,
      }
      this.activeStrategy = {}
      this.showDetails = true
      this.strategyType = name
      this.editable = true
    },
    editStrategy(row) {
      this.showDetails = true
      this.strategyType = row.type
      this.editable = true
      this.activeStrategy = row
    },
    closeDetails(needRefresh) {
      this.showDetails = false
      this.$router.replace('/main/accessStrategy')
      this.editable = false
      this.activeStrategy = {}
      if (needRefresh) this.getStrategyData()
    },
  },
  watch: {
    currentNode: {
      async handler(node) {
        if (node.catalogId) {
          this.$nextTick(() => {
            this.$refs.strategyTree.$refs.tree.setCurrentKey(node.catalogId)
            this.expandParents(node)
          })
          this.getStrategyData({
            currentPage: 1,
          })
        }
        this.$datablauLoading.close()
      },
    },
    keyword: {
      handler(word) {
        console.log(`根据关键字'${word}'查询策略`)
        this.getStrategyData({
          currentPage: 1,
        })
      },
    },
    catalogKeyword: {
      handler(val) {
        this.$refs.strategyTree.$refs.tree.filter(val)
      },
    },
  },
  computed: {
    noDataText() {
      return '暂无数据'
    },
  },
}
