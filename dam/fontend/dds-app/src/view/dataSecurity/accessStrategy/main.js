import NewAccessStrategy from './components/newAccessStrategy.vue'
import RowAccessStrategy from './components/rowAccessStrategy.vue'
import DesensitizeBox from './components/desensitizeBox/index.vue'
import Details from './components/details.vue'
import ResizeHorizontal from '@/components/common/ResizeHorizontal'
import api from '../util/api'
import { accessType } from '@/view/dataSecurity/util/attrEnum.ts'
import catalogTree from '@/view/dataSecurity/components/catalogTree.vue'
import { delObjMethod } from '@/view/dataSecurity/util/util.js'
export default {
  name: 'AccessStrategy',
  components: {
    NewAccessStrategy,
    RowAccessStrategy,
    Details,
    DesensitizeBox,
    catalogTree,
  },
  data() {
    let nameValidatePass = async (rule, value, callback) => {
      if (this.catalogDetails.name === '') {
        callback(new Error(this.$t('securityModule.inputName')))
      } else {
        // 判断是否含不允许输入的特殊字符
        const reg = /[#/\\@$_%<>]/gi
        if (reg.test(this.catalogDetails.name)) {
          callback(new Error(this.$t('securityModule.catalogLimitation')))
        } else {
          // 判断名称是否已存在
          const params = {
            parentId: this.catalogDetails.parentId || 0,
            name: this.catalogDetails.name,
            type: 'ACCESS_CONTROL',
            catalogId: this.catalogDetails.catalogId,
          }
          const existRes = await api.checkStrategyCatalogName(params)
          if (!existRes.data.data) {
            callback(new Error(this.$t('securityModule.catalogRepeat')))
          } else {
            callback()
          }
        }
      }
    }
    return {
      listShow: true,
      catalogInfo: {},
      strategyType: '',
      currentStrategyId: null, // 查看的时候传的当前策略id
      currentNode: {},
      catalogDetails: {},
      loading: false,
      keyword: '',
      tableData: [],
      tableLoading: true,
      pagination: {
        pageNum: 1,
        pageSize: 20,
        total: 0,
        sort: 'desc',
      },
      tableSelection: [],
      showDetails: false,
      editable: false,
      activeStrategy: {},

      tableId: '',
      columnId: '',
      breadcrumbNodes: [],
      curName: '',
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
    // 初次加载
    // this.getStrategyData()
  },
  methods: {
    clickTree(name, options) {
      switch (name) {
        case 'catalogTree':
          this.catalogLen = options.catalogLen
          this.pagination.pageNum = 1
          this.currentNode = options.data
          this.catalogId = options.data.catalogId || 0
          this.getStrategyData()
          break
        case 'listShow':
          this.listShow = false
          break
        default:
          break
      }
    },
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
    getStrategyData() {
      this.tableLoading = true
      const params = {
        catalogId: this.catalogId || 0,
        strategyName: this.keyword,
        pageNum: this.pagination.pageNum,
        pageSize: this.pagination.pageSize,
        sort: this.pagination.sort,
      }
      api
        .getStrategyList(params)
        .then(res => {
          this.listShow = true
          this.tableLoading = false
          this.tableData = res.data.data.content || []
          this.pagination.pageNum = params.pageNum
          this.pagination.pageSize = params.pageSize
          this.pagination.total = res.data.data.totalItems
        })
        .catch(res => {
          this.listShow = false
          this.tableLoading = false
          this.$showFailure(res)
        })
    },
    handleNodeClick(data, node) {
      this.currentNode = data
      this.selectedStrategy = []
      this.$refs.strategyTable.clearSelection()
    },
    // 策略类型映射
    strategyTypeMap(type, num = 1) {
      let result = ''
      let color = ''
      let rgba = ''
      switch (type) {
        case accessType.ACCESS_STRATEGY:
          result = this.$t('accessStrategy.accessPolicy')
          color = '#29C1AF'
          rgba = '(41,193,175,0.1)'
          break
        case accessType.ACCESS_ROW_STRATEGY:
          result = this.$t('accessStrategy.rowLevelAccessPolicy')
          color = '#4E85F7'
          rgba = '(78,133,247,0.1)'
          break
        case accessType.ACCESS_DATAMASK_COLUMN:
          result = this.$t('accessStrategy.fieldDesensitizationStrategy')
          color = '#6F54EB'
          rgba = '(111,84,235,0.1)'
          break
        case accessType.ACCESS_DATAMASK_TABLE:
          result = this.$t('accessStrategy.tableDesensitizationStrategy')
          color = '#6F54EB'
          rgba = '(111,84,235,0.1)'
          break
        default:
          break
      }
      if (num === 1) {
        return result
      }
      if (num === 2) {
        const style = {
          color: color,
          background: 'rgba' + rgba,
        }
        return style
      }
    },
    // 访控策略表格逻辑处理 开始dataOptionsFunction
    handleTableSelectChange(list) {
      this.tableSelection = _.cloneDeep(list)
    },
    handleSizeChange(size) {
      this.pagination.pageNum = 1
      this.pagination.pageSize = size
      this.getStrategyData()
    },
    handleCurrentChange(current) {
      this.pagination.pageNum = current
      this.getStrategyData()
    },
    handleSortChange({ order }) {
      const sort = order === 'ascending' ? 'asc' : 'desc'
      this.pagination.sort = sort
      this.pagination.pageNum = 1
      this.getStrategyData()
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
      if (row) {
        selectedStrategy = [row]
      } else {
        selectedStrategy = this.tableSelection
      }
      const delParams = {
        this: this,
        objName: this.$t('accessStrategy.strategy'),
        name: row && row.accessControlName,
        type: row ? 'single' : 'multiple',
        num: this.tableSelection.length,
      }
      delObjMethod(delParams).then(() => {
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
              this.$datablauMessage.success(
                this.$t('securityModule.delSuccess')
              )
              this.tableSelection = []
              this.pagination.pageNum = 1
              this.getStrategyData()
              this.$refs.strategyTable.clearSelection()
            }
          })
          .catch(e => {
            this.$showFailure(e)
          })
      })
    },
    copyStrategy(row) {
      const params = {
        id: row.accessControlId,
        accessControlType: row.type,
      }
      api
        .copyStrategy(params)
        .then(res => {
          this.$datablauMessage.success(this.$t('securityModule.copySuccess'))
          this.pagination.pageNum = 1
          this.getStrategyData()
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    setBreadcrumb() {
      if (this.currentNode.nameList) {
        this.breadcrumbNodes = [
          ...this.currentNode.nameList,
          { name: this.curName },
        ]
      } else {
        this.breadcrumbNodes = [
          {
            name: this.curName,
          },
        ]
      }
    },
    setCurBreadcrumb(path) {
      const pathList = path.split('/')
      let newList = []
      pathList.map(item => {
        const newMap = {
          name: item,
        }
        newList.push(newMap)
      })
      this.breadcrumbNodes = [...newList, { name: this.curName }]
    },
    setName(type, status) {
      let name = ''
      let opt = ''
      switch (status) {
        case 'new':
          opt = this.$t('securityModule.new')
          break
        case 'view':
          opt = this.$t('securityModule.view')
          break
        case 'edit':
          opt = this.$t('securityModule.edit')
          break
        default:
          break
      }
      switch (type) {
        case 'ACCESS_DATAMASK_COLUMN':
          name = this.$t('accessStrategy.fieldDesensitizationStrategy')
          break
        case 'ACCESS_DATAMASK_TABLE':
          name = this.$t('accessStrategy.tableDesensitizationStrategy')
          break
        case 'ACCESS_STRATEGY':
          name = this.$t('accessStrategy.accessPolicy')
          break
        case 'ACCESS_ROW_STRATEGY':
          name = this.$t('accessStrategy.rowLevelAccessPolicy')
          break
        default:
          break
      }
      this.curName = opt + name
    },
    async handleCommand(name) {
      await this.setName(name, 'new')
      this.catalogInfo = {
        catalogId: this.currentNode.catalogId,
        catalogName: this.currentNode.name,
      }
      this.setBreadcrumb()
      this.activeStrategy = {}
      this.showDetails = true
      this.strategyType = name
      this.editable = true
    },
    async checkStrategy(row) {
      await this.setName(row.type, 'view')
      this.showDetails = true
      this.strategyType =
        row.type === 'ACCESS_DATAMASK'
          ? 'ACCESS_DATAMASK_' + row.maskType
          : row.type
      this.editable = false
      this.activeStrategy = row
      this.currentStrategyId = row.accessControlId
      this.setCurBreadcrumb(row.path)
    },
    async editStrategy(row) {
      await this.setName(row.type, 'edit')
      this.showDetails = true
      this.strategyType = row.type
      this.editable = true
      this.activeStrategy = row
      this.setCurBreadcrumb(row.path)
    },
    closeDetails(needRefresh) {
      this.showDetails = false
      this.$router.replace('/main/accessStrategy')
      this.editable = false
      this.activeStrategy = {}
      if (needRefresh) this.getStrategyData()
    },
    handleSearch() {
      this.pagination.pageNum = 1
      this.getStrategyData()
    },
  },
  watch: {
    keyword(val) {
      if (!val) {
        this.handleSearch()
      }
    },
  },
  computed: {
    noDataText() {
      return this.$t('securityModule.noData')
    },
  },
}
