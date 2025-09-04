import approve from '@/assets/images/icon/approve.png'
import clear from '@/assets/images/icon/clear.png'
export default {
  data() {
    const opt = [
      {
        value: 'PENDING',
        label: '审批中',
      },
      {
        value: 'APPROVED',
        label: '已批准',
      },
      {
        value: 'DELETED',
        label: '已移除',
      },
    ]
    const typeOptions = [
      {
        value: 80000004,
        label: '表',
      },
      {
        value: 80500008,
        label: '视图',
      },
      {
        value: 80000005,
        label: '字段',
      },
    ]
    return {
      typeOptions,
      currentType: '',
      selection: [],
      mutipleLength: 0,
      currentPage: 1,
      currentPageSize: 20,
      total: 0,
      currentStatus: '',
      opt,
      keyword: '',
      currentTableData: [],
      currentTableName: 'tag',
      tagData: [],
      infoCatalogData: [],
      domainData: [],
      tableLoading: false,
      approve,
      clear,
      selectionId: '',
      selectIds: [],
      eventStartTime: '',
      canClick: true,
    }
  },
  mounted() {
    this.getTableData()
  },
  methods: {
    formatObjectName(row) {
      let physicalName = ''
      let logicalName = ''
      if (row.elementObjectDto) {
        physicalName = row.elementObjectDto.physicalName
        logicalName = row.elementObjectDto.logicalName
          ? `(${row.elementObjectDto.logicalName})`
          : ''
      }
      return physicalName + logicalName
    },
    changeObjectType() {
      this.getTableData()
    },
    // 跳转字段详情页
    jumpToColumn(row) {
      const pos = location.href.indexOf('#/')
      const baseUrl = location.href.slice(0, pos + 2)
      window.open(
        baseUrl +
          `main/meta?objectId=${row.elementObjectDto.objectId}&blank=true`,
        '_blank'
      )
    },
    changeEventStartTime(val) {
      this.eventStartTime = val
      this.getTableData()
    },
    changeStatus() {
      this.getTableData()
    },
    handleSelect(val) {
      this.currentTableName = val.name
      this.currentPage = 1
      this.keyword = ''
      this.currentStatus = ''
      this.getTableData()
    },
    getTableData() {
      this.tableLoading = true
      let name = this.currentTableName
      let BuildInCode = ''
      let url = ''
      // const createTime = this.eventStartTime
      const createTime = 'createTime'
      if (this.currentTableName === 'dataAuth') {
        name = 'tag'
        BuildInCode = 'dataAuth'
        url = `${this.$url}/service/discerned/${name}s?current_page=${
          this.currentPage
        }&page_size=${this.currentPageSize}&search=${encodeURI(
          this.keyword
        )}&is_asc=false&order_by=${createTime}&build_in_code=${BuildInCode}&status=${
          this.currentStatus
        }&elementTypeId=${this.currentType}`
      } else if (this.currentTableName === 'datamask') {
        url = `${this.$url}/service/discerned/${name}?current_page=${
          this.currentPage
        }&page_size=${this.currentPageSize}&search=${encodeURI(
          this.keyword
        )}&is_asc=false&order_by=${createTime}&status=${
          this.currentStatus
        }&elementTypeId=${this.currentType}`
      } else {
        url = `${this.$url}/service/discerned/${name}s?current_page=${
          this.currentPage
        }&page_size=${this.currentPageSize}&search=${encodeURI(
          this.keyword
        )}&is_asc=false&order_by=${createTime}&status=${
          this.currentStatus
        }&elementTypeId=${this.currentType}`
      }

      this.$http
        .get(url)
        .then(res => {
          this.tableLoading = false
          this.currentTableData = res.data.content || []
          // this[`${this.currentTableName}Data`] = res.data.content
          this.total = res.data.totalItems
          this.$refs.table.doLayout()
        })
        .catch(err => {
          this.currentTableData = []
          this.tableLoading = false
          this.$showFailure(err)
        })
    },
    getDate(time) {
      const date = new Date(time)
      return moment(date).format('YYYY-MM-DD HH:mm')
    },
    getStatus(str) {
      let status = ''
      switch (str) {
        case 'PENDING':
          status = '等待确认'
          break
        case 'APPROVED':
          status = '已批准'
          break
        case 'REJECTED':
          status = '已拒绝'
          break
        case 'DELETED':
          status = '已移除'
          break
        default:
          break
      }
      return status
    },
    handleSelectionChange(val) {
      this.canClick = true
      const ids = []
      this.selection = val
      val.map(item => {
        ids.push(item.id)
        if (item.status !== 'PENDING') {
          this.canClick = false
        }
      })
      this.selectIds = ids
      this.selectionId = ids.join(',')
      this.mutipleLength = val.length
    },
    batchUpdateStatus(status) {
      const nType =
        this.currentTableName === 'dataAuth' ? 'tag' : this.currentTableName
      if (nType === 'datamask') {
        let newMap = {}
        this.selection.map(item => {
          newMap[item.id] = item.accessCode ? item.accessCode : ''
        })
        const params = {
          discernedIds: this.selectIds,
          status: status,
          tagBuildInCodes: newMap,
        }
        this.maskTag(status, params)
      } else {
        this.normalTag(this.selectionId, status, nType)
      }
    },
    exportData() {
      let url = ''
      let name = ''
      console.log(this.currentTableName)
      switch (this.currentTableName) {
        case 'tag':
          url = this.$url + '/service/discerned/tag/download'
          name = '识别到的标签'
          break
        case 'infoCatalog':
          url = this.$url + '/service/discerned/infoCatalog/download'
          name = '识别到的目录'
          break
        case 'domain':
          url = this.$url + '/service/discerned/domain/download'
          name = '识别到的标准'
          break
        case 'dataAuth':
          url =
            this.$url + '/service/discerned/tag/download?build_in_code=dataAuth'
          name = '识别到的安全等级'
          break
        case 'datamask':
          url = this.$url + '/service/discerned/datamask/download'
          name = '识别到的脱敏函数'
          break
        default:
          break
      }
      this.$datablauDownload(url, {}, name)
    },
    updateStatus(row, status) {
      const id = row.id
      const nType =
        this.currentTableName === 'dataAuth' ? 'tag' : this.currentTableName
      if (nType === 'datamask') {
        const ids = [id]
        let newMap = {}
        newMap[row.id] = row.accessCode ? row.accessCode : ''
        const params = {
          discernedIds: [id],
          status: status,
          tagBuildInCodes: newMap,
        }
        this.maskTag(status, params)
      } else {
        this.normalTag(id, status, nType)
      }
    },
    maskTag(status, params) {
      const title = status === 'DELETED' ? '移除' : '批准'
      this.$DatablauCofirm(`确认要${title}吗`, '提示', {
        type: 'warning',
        cancelButtonText: '取消',
        confirmButtonText: '确定',
      }).then(() => {
        const newUrl = `${this.$url}/service/discerned/discerned/update/datamask`
        this.$http
          .put(newUrl, params)
          .then(res => {
            this.getTableData()
          })
          .catch(err => {
            this.$showFailure(err)
          })
      })
    },
    normalTag(id, status, nType) {
      const title = status === 'DELETED' ? '移除' : '批准'
      this.$DatablauCofirm(`确认要${title}吗`, '提示', {
        type: 'warning',
        cancelButtonText: '取消',
        confirmButtonText: '确定',
      }).then(() => {
        const newUrl = `${this.$url}/service/discerned/discerned/update/${nType}?discernedIds=${id}&status=${status}`
        this.$http
          .put(newUrl)
          .then(res => {
            this.getTableData()
          })
          .catch(err => {
            this.$showFailure(err)
          })
      })
    },
    handlePageChange(page) {
      this.getTableData()
    },
    handleSizeChange(size) {
      this.currentPageSize = size
      this.getTableData()
    },
    getStatusColor(status) {
      let color = ''
      switch (status) {
        case 'PENDING':
          color = '#4386F5'
          break
        case 'APPROVED':
          color = '#57A07F'
          break
        case 'DELETED':
          color = '#AFB4BF'
          break
      }
      return color
    },
    getCurrentName(row) {
      let str = ''
      switch (this.currentTableName) {
        case 'tag':
        case 'dataAuth':
          str = row.tagName
          break
        case 'infoCatalog':
          str = row.infoCatalogName
          break
        case 'domain':
          str = row.chineseName
          break
        case 'datamask':
          str = row.datamaskName
      }
      return str
    },
    getCurrentNameLabel() {
      let str = ''
      switch (this.currentTableName) {
        case 'tag':
          str = '标签'
          break
        case 'infoCatalog':
          str = '目录'
          break
        case 'domain':
          str = '标准'
          break
        case 'dataAuth':
          str = '安全等级'
          break
        case 'datamask':
          str = '脱敏函数'
          break
      }
      return str
    },
    getCurrentPath(row) {
      const modelPhysicalName = row.modelObjectDto
        ? row.modelObjectDto.physicalName
        : ''
      let elementPhysicalName = ''
      if (row.elementTypeId === 80500008 || row.elementTypeId === 80000004) {
        elementPhysicalName = ''
      } else {
        elementPhysicalName = row.elementObjectDto
          ? row.elementObjectDto.tableName
          : ''
      }
      return `${modelPhysicalName}${
        elementPhysicalName !== '' ? '/' + elementPhysicalName : ''
      } `
    },
    timeFormatter() {
      if (typeof arguments[0] === 'number') {
        return moment(arguments[0]).format('YYYY-MM-DD HH:mm')
      } else if (arguments[0] == undefined) {
        return ''
      } else if (typeof arguments[0] === 'string') {
        return arguments[0]
      }
      if (arguments[0][arguments[1].property]) {
        return moment(arguments[0][arguments[1].property]).format(
          'YYYY-MM-DD HH:mm'
        )
      } else {
        return '-'
      }
    },
  },
  watch: {
    keyword() {
      clearTimeout(this.keyTimer)
      this.keyTimer = setTimeout(() => {
        this.currentPage = 1
        this.getTableData()
      }, 600)
    },
  },
}
