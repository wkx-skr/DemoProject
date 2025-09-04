import createVirds from './createVirDs.vue'
import HTTP from '../../http/main'
const moment = require('moment')
export default {
  data() {
    this.BASE_URL = this.$url + '/service/'
    return {
      // 显示table
      selection: [],
      selectCal: 0,
      deltaData: [],
      allData: [],
      total: 0,
      dsData: [], // 过滤后的数组
      dsDataKey: 0,
      displayData: [],
      keyword: '',
      keywordFilterProps: ['definition', 'type', 'categoryName'],
      emptyPara: {
        keyword: '',
        currentPage: 1,
        sortData: {
          prop: '',
          order: 'ascending',
        },
        pageSize: 20,
      },
      sortData: {
        prop: '',
        order: 'ascending',
      },
      loadingDS: true,
      deleteDisabled: true,
      currentRow: null,
      tableHeight: undefined,
      showTable: false,
      currentPage: 1,
      pageSize: 20,

      // 修改,添加 数据源
      schemaSelected: [],
      isEditing: false,
      dsform: {},
      updateDataSource: false,
      autoSetJob: {
        modelId: '',
        modelName: '',
      },
      showMore: true,
      AuthenticationType: 0, // 授权方式 0:用户名/密码; 1:kerberos
      requireDbport: true,
      userPasswordRequ: false,
      dialogCrVdsVisible: false,
      vdpMap: {},
      currentDataSource: null,
      tableKey: 0,
      enableDbType: [
        'MYSQL',
        'ORACLE',
        'SQLSERVER',
        'POSTGRESQL',
        'GAUSSDB',
        'GREENPLUM',
        'DB2',
        'HIVE',
        'HANA',
        'TERADATA',
      ],
    }
  },
  props: {
    dsformConstant: Object,
    formatDataSource: Function,
  },

  components: { createVirds },

  computed: {
    isFileData() {
      var self = this
      var ds = self.dsform
      return (
        ds.dbtype == 'CSV' ||
        ds.dbtype == 'EXCEL' ||
        ds.dbtype == 'DATADICTIONARY' ||
        ds.dbtype == 'TABLEAU'
      )
    },
  },

  mounted() {
    this.$bus.$on('forceUpdataNav', () => {
      // 根据权限,刷新数据源 操作栏
      this.showMore = false
      setTimeout(() => {
        this.showMore = true
      }, 0)
    })
    var self = this
    this.tableHeight = $('.table-row')[0].offsetHeight
    $(window).resize(this.resizeTable)
    HTTP.getFds({
      succesedCallback: res => {
        res.forEach(item => {
          this.vdpMap[item.modelId] = item
        })
        this.innerLoadDataSources()
      },
    })
  },
  beforeDestroy() {
    $(window).unbind('resize', this.resizeTable)
    this.$bus.$off('changeDs')
    this.$bus.$off('dataSourceTabOntop')
    this.$bus.$off('forceUpdataNav')
  },

  methods: {
    tableRowClassName({ row, rowIndex }) {
      if (this.vdpMap[row.modelId]) {
        return 'success-row'
      }
      return ''
    },
    /** 响应事件 */
    // 分页 设置
    handleSizeChange(size) {
      const obj = {
        keyword: this.keyword,
        currentPage: 1,
        sortData: this.sortData,
        pageSize: size,
      }
      this.currentPage = 1
      this.pageSize = size
      this.changeDSDisplay(obj)
    },
    handleCurrentChange(currentPage) {
      const obj = {
        keyword: this.keyword,
        currentPage: currentPage,
        sortData: this.sortData,
        pageSize: this.pageSize,
      }
      this.changeDSDisplay(obj)
    },
    handleSortChange(sortData) {
      this.sortData = sortData
      // sortData = {column, prop, order}
      const obj = {
        sortData: {
          prop: sortData.prop,
          order: sortData.order,
        },
        keyword: this.keyword,
        currentPage: 1,
        pageSize: this.pageSize,
      }
      this.currentPage = 1
      this.changeDSDisplay(obj)
    },

    handleSelectionChange(val) {
      this.selection = val
      this.deleteDisabled = this.selection.length == 0
    },

    handleCreated() {
      this.dialogCrVdsVisible = false
      HTTP.getFds({
        succesedCallback: res => {
          res.forEach(item => {
            this.vdpMap[item.modelId] = item
          })
          this.tableKey++
        },
      })
    },
    handleCreateVirDS(row) {
      this.currentDataSource = row
      this.dialogCrVdsVisible = true
      this.$nextTick(() => {
        this.$refs.createVirds.dataInit()
      })
    },
    downloadMetadata(row) {
      this.$emit('downloadMetadata', row.modelId)
    },
    handleRefresh(index, row) {},

    /** 处理显示的数据 */
    parameterFormat: function (row) {
      return JSON.stringify(row.connectionInfo.parameterMap)
    },
    resizeTable() {
      this.$nextTick(() => {
        this.tableHeight = $('.table-row')[0].offsetHeight || this.tableHeight
      })
    },
    changeDSDisplay(para, allData) {
      allData = allData || this.allData
      const arr = []
      if (!para) {
        para = _.clone(this.emptyPara)
        para.pageSize = this.pageSize
        para.keyword = this.keyword
        this.currentPage = para.currentPage
      }
      para.keyword = para.keyword || this.keyword
      const keyword = para.keyword.trim().toLowerCase()
      allData.forEach(item => {
        let bool = false
        this.keywordFilterProps.forEach(prop => {
          if (item[prop] && item[prop].toLowerCase().indexOf(keyword) !== -1) {
            bool = true
          }
        })
        if (bool) {
          arr.push(item)
        }
      })
      this.total = arr.length
      this.dsData = arr

      if (para.sortData && para.sortData.prop) {
        const order =
          para.sortData.order !== 'descending' ? 'ascending' : 'descending'
        this.$utils.sort.sortConsiderChineseNumber(
          arr,
          para.sortData.prop,
          order
        )
      }
      const currentPage = para.currentPage || 1 // 任意其它条件改变, currentPage 变为 1
      const pageSize = para.pageSize || this.pageSize
      this.displayData = arr.slice(
        pageSize * (currentPage - 1),
        pageSize * currentPage
      )
      this.loadingDS = false
    },

    /** 处理不显示的数据 */
    isOracle() {
      var self = this
      var ds = self.dsform
      return ds.dbtype == 'ORACLE'
    },
    versionFormat: function (row) {
      return row.connectionInfo.versioning ? '是' : '否'
    },

    showSuccess(msg) {
      this.$message({
        title: 'Success',
        message: msg,
        type: 'success',
      })
    },

    // 显示 标签(修改,添加)
    showaddtab() {
      var self = this
      const para = {}
      this.$emit('showDSeditab', this.isEditing, self.dsform, para)
    },
    innerLoadDataSources() {
      var self = this
      self.loadingDS = true
      self.$http
        .get(self.BASE_URL + 'models/fromre/')
        .then(res => {
          if (!res.data || !Array.isArray(res.data)) {
            return
          }
          this.$utils.sort.sortConsiderChineseNumber(res.data, 'definition')
          self.allData = res.data
          if (this.keyword === '') {
            self.changeDSDisplay()
          } else {
            this.keyword = ''
          }
        })
        .catch(e => {
          this.loadingDS = false
          this.$showFailure(e)
        })
    },
    isFileItem(ds) {
      const arr = ['CSV', 'EXCEL', 'DATADICTIONARY', 'TABLEAU']
      return arr.indexOf(ds.type) !== -1
    },
    isEable(ds) {
      const bool = this.enableDbType.some(item => {
        return ds.type && item === ds.type.toUpperCase()
      })
      return bool
    },
  },
  watch: {
    keyword(newVal) {
      const obj = {
        keyword: newVal,
        currentPage: 1,
        sortData: this.sortData,
        pageSize: this.pageSize,
      }
      this.currentPage = 1
      this.changeDSDisplay(obj)
    },
  },
}
