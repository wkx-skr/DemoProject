import DatabaseType from '@/components/common/DatabaseType.vue'
import dbType from '@/components/dataSource/databaseType.js'
import HTTP from '@/resource/http'
import $version from '@/resource/version.json'
import sort from '@/resource/utils/sort'

const moment = require('moment')
export default {
  data () {
    return {
      isEditing: false,
      displayData: [],
      keyword: '',
      currentPage: 1,
      pageSize: 100,
      total: 0,
      loadingDS: true,
      typeOption: [],
      typeValue: this.$v.drive.whole,
      expandRowKeys: [],
      dsDataKey: 0,
      defaultDriverArr: [],
      defaultDriverValue: '',
      loadingDS2: false,
      driverTypeList: [],
      defaultDriverType: ''
    }
  },
  props: {
    dsformConstant: Object,
    formatDataSource: Function
  },

  components: { DatabaseType },
  created () {
    this.$version = $version
  },
  computed: {},
  mounted () {
    this.tableHeight = $('.table-row')[0].offsetHeight
    $(window).resize(this.resizeTable)
    this.getdriverTypeList()
  },
  beforeDestroy () {
    $(window).unbind('resize', this.resizeTable)
    this.$bus.$off('changeDs')
    this.$bus.$off('dataSourceTabOntop')
    this.$bus.$off('forceUpdataNav')
    this.$bus.$off('callDataSourceTabToAddDs')
    this.$bus.$off('updateDataSourceJobStatus')
  },

  methods: {
    handleDefaultDriverChange (value) {
      this.$http.put(this.$url + `/service/driver/default/${value}?type=${this.defaultDriverType}`).then(res => {
        this.$message.success(this.$v.drive.editDriveSuccessfully)
        Object.keys(this.defaultDriverArr).forEach(key => {
          if (this.defaultDriverArr[key].value === value) {
            this.defaultDriverValue = this.defaultDriverArr[key].label
          }
        })
        this.getdriverTypeList()
      }).catch(e => {
        this.$showFailure(e)
      })
    },
    handleRowClick (row, column, event) {
      const localName = event.srcElement.localName
      if (event.srcElement.localName === 'td' || localName === 'div') {
        if (this.expandRowKeys.indexOf(row.type) > -1) {
          this.expandRowKeys.splice(this.expandRowKeys.indexOf(row.type), 1)
        } else {
          this.expandRowKeys = [row.type]
        }
      }
      this.defaultDriverValue = row.defaultDriver
      this.defaultDriverType = row.type
      this.getdriverList(row.type)
    },
    // 展开多行时, 只保留最后一次展开的行
    expandChange (row, expandedRows) {
      if (expandedRows && expandedRows.length > 0) {
        this.expandRowKeys = [expandedRows[expandedRows.length - 1].type]
        this.defaultDriverValue = row.defaultDriver
        this.defaultDriverType = row.type
        this.getdriverList(row.type)
      }
    },
    getdriverTypeList () {
      let dbTypeMap = dbType.dbMap
      HTTP.getDriverTypes()
        .then(data => {
          this.driverTypeList = data.filter(item => {
            return dbTypeMap[item.type.toUpperCase()]
          })
          sort.sortConsiderChineseNumber(this.driverTypeList, 'type', 'ascending', true)
          this.loadingDS = false
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    refreshDataList () {
      this.getdriverTypeList()
    },
    getdriverList (type) {
      this.loadingDS2 = true
      // let type
      // if (this.typeValue === '全部'){
      //   type = ''
      // } else {
      //   type = this.typeValue
      // }
      this.defaultDriverArr = []
      this.$http.get(this.$url + `/service/driver/search/?pageSize=${this.pageSize}&currentPage=${this.currentPage}&type=${type}`)
        .then(res => {
          this.displayData = res.data.content
          this.total = res.data.totalItems
          res.data.content.forEach(element => {
            this.defaultDriverArr.push({
              label: element.driverName,
              value: element.id
            })
          })
          this.loadingDS2 = false
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    // 分页 设置
    handleSizeChange (size) {
      this.currentPage = 1
      this.pageSize = size
      this.getdriverList()
    },
    handleCurrentChange (currentPage) {
      this.currentPage = currentPage
      this.getdriverList()
    },
    handleDelete (row) {
      if (this.defaultDriverValue === row.driverName) {
        this.$showFailure(this.$v.drive.deletelongTips)
        return
      }
      this.$confirm(this.$v.drive.sureDelete, this.$v.drive.delete, {
        confirmButtonText: this.$v.drive.Yes, // '确定',
        cancelButtonText: this.$v.drive.cancel, // '取消',
        type: 'warning'
      })
        .then(() => {
          this.$http.delete(this.$url + `/service/driver/${row.id}`).then(res => {
            this.getdriverTypeList()
            this.getdriverList(this.defaultDriverType)
            this.$message.success(this.$v.drive.deletedSuccessfully)
          }).catch(e => {
            this.$showFailure(e)
          })
        })
        .catch(e => {
          console.log(e)
        })
    },
    // 触发 编辑数据源
    handleEdit (row) {
      this.isEditing = true
      let para = {}
      para = row
      this.$emit('showDSeditab', this.isEditing, para)
    },
    // 触发 添加数据源
    addDs (row) {
      this.isEditing = false
      const para = row
      this.$emit('showDSeditab', this.isEditing, para)
    }
  },
  watch: {
    keyword (newVal) {
      this.currentPage = 1
      this.getdriverList()
    },
    typeValue (newVal) {
      this.currentPage = 1
      this.getdriverList()
    }
  }
}
