import DatabaseType from '../../components/dataSource/DatabaseType.vue'
import HTTP from '@/http/main'

const moment = require('moment')
export default {
  data() {
    return {
      isEditing: false,
      displayData: [],
      keyword: '',
      currentPage: 1,
      pageSize: 100,
      total: 0,
      loadingDS: true,
      /* typeOption: [
        { lable: '全部', value: '全部' },
        { label: 'Postgresql', value: 'POSTGRESQL' },
        { label: 'Greenplum', value: 'GREENPLUM' },
        { label: 'MySQL', value: 'MYSQL' },
        { label: 'Oracle', value: 'ORACLE' },
        { label: 'SqlServer', value: 'SQLSERVER' },
        { label: 'Hive', value: 'HIVE' },
        { label: 'GBASE', value: 'GBASE' },
        { label: 'SAP Hana', value: 'HANA' },
        { label: 'ODPS', value: 'ODPS' },
        { label: 'MaxCompute', value: 'MAXCOMPUTE' },
        { label: 'Teradata', value: 'TERADATA' },
        { label: 'DB2I', value: 'DB2I' },
        { label: 'Impala', value: 'IMPALA' },
        { label: '自定义', value: 'CUSTOMIZED' },
        { label: 'GaussDB', value: 'GAUSSDB' },
        { label: 'OceanBase', value: 'OCEANBASE' },
        { label: 'CirroData', value: 'CIRRODATA' },
        { label: 'Phoenix', value: 'PHOENIX' },
        { label: 'OceanBase OracleMode', value: 'OCEANBASEO' },
        { label: 'PolarDB', value: 'POLARDB' },
        { label: 'TiDB', value: 'TIDB' },
        { label: 'ClickHouse', value: 'CLICKHOUSE' },
        { label: 'Vertica', value: 'VERTICA' },
        { label: 'Transwarp-Inceptor', value: 'INCEPTOR' },
        { label: 'FusionInsight', value: 'FUSIONINSIGHT' },
      ], */
      typeValue: '全部',
      expandRowKeys: [],
      dsDataKey: 0,
      defaultDriverArr: [],
      defaultDriverValue: '',
      loadingDS2: false,
      driverTypeList: undefined,
      defaultDriverType: '',
      optionsData: {},
    }
  },
  props: {
    dsformConstant: Object,
    formatDataSource: Function,
  },

  components: { DatabaseType },

  computed: {},

  mounted() {
    $(window).resize(this.resizeTable)
    this.getdriverTypeList()
  },
  beforeDestroy() {
    $(window).unbind('resize', this.resizeTable)
    this.$bus.$off('changeDs')
    this.$bus.$off('dataSourceTabOntop')
    this.$bus.$off('forceUpdataNav')
    this.$bus.$off('callDataSourceTabToAddDs')
    this.$bus.$off('updateDataSourceJobStatus')
  },

  methods: {
    // 设置默认驱动
    handleDefaultDriverChange(value) {
      this.$http
        .post(
          this.$url +
            `/drivers/setTypeDefaultDriver?type=${this.defaultDriverType}&driverId=${value}`
        )
        .then(res => {
          this.$message.success(
            this.$t('meta.driveManage.changeDefaultSucceed')
          )
          Object.keys(this.defaultDriverArr).forEach(key => {
            if (this.defaultDriverArr[key].value === value) {
              this.defaultDriverValue = this.defaultDriverArr[key].label
            }
          })
          this.getdriverTypeList()
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    handleRowClick(row, column, event) {
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
    expandChange(row, expandedRows) {
      if (expandedRows && expandedRows.length > 0) {
        this.expandRowKeys = [expandedRows[expandedRows.length - 1].type]
        this.defaultDriverValue = row.defaultDriver
        this.defaultDriverType = row.type
        this.getdriverList(row.type)
      }
    },
    getdriverTypeList() {
      this.$http
        .post(this.$url + '/drivers/getDriverGroups')
        .then(res => {
          this.driverTypeList = res.data
          this.$utils.sort.sortConsiderChineseNumber(
            this.driverTypeList,
            'type',
            'ascending',
            true
          )
          this.loadingDS = false
        })
        .catch(e => {
          this.driverTypeList = []
          this.$showFailure(e)
        })
    },
    getdriverList(type) {
      this.loadingDS2 = true
      // let type
      // if (this.typeValue === '全部'){
      //   type = ''
      // } else {
      //   type = this.typeValue
      // }
      this.defaultDriverArr = []
      this.$http
        .post(
          this.$url +
            `/drivers/search/?pageSize=${this.pageSize}&currentPage=${this.currentPage}&type=${type}`
        )
        .then(res => {
          this.displayData = res.data.content
          this.total = res.data.totalItems
          res.data.content.length &&
            res.data.content.forEach(element => {
              this.defaultDriverArr.push({
                label: element.driverName,
                value: element.id,
              })
            })
          this.optionsData.data = this.defaultDriverArr
          this.optionsData.value = 'value'
          this.optionsData.key = 'value'
          this.optionsData.label = 'label'
          this.loadingDS2 = false
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    // 分页 设置
    handleSizeChange(size) {
      this.currentPage = 1
      this.pageSize = size
      this.getdriverList()
    },
    handleCurrentChange(currentPage) {
      this.currentPage = currentPage
      this.getdriverList()
    },
    handleDelete(row) {
      if (this.defaultDriverValue === row.driverName) {
        this.$showFailure(
          '此驱动为当前数据库的默认驱动，不能删除，请切换默认驱动后再尝试'
        )
        return
      }
      this.$DatablauCofirm(
        this.$t('meta.driveManage.delDriverConfirm'),
        this.$t('common.button.delete'),
        {
          confirmButtonText: this.$t('common.button.ok'),
          cancelButtonText: this.$t('common.button.cancel'),
          type: 'warning',
        }
      )
        .then(() => {
          this.$http
            .post(this.$url + `/drivers/deleteDriver?driverId=${row.id}`)
            .then(res => {
              this.getdriverTypeList()
              this.getdriverList(this.defaultDriverType)
            })
            .catch(e => {
              this.$showFailure(e)
            })
        })
        .catch(e => {
          console.log(e)
        })
    },
    // 触发 编辑数据源
    handleEdit(row) {
      this.isEditing = true
      let para = {}
      para = row
      this.$emit('showDSeditab', this.isEditing, para)
    },
    // 触发 添加数据源
    addDs(row) {
      this.isEditing = false
      const para = row
      this.$emit('showDSeditab', this.isEditing, para)
    },
  },
  watch: {
    keyword(newVal) {
      this.currentPage = 1
      this.getdriverList()
    },
    typeValue(newVal) {
      this.currentPage = 1
      this.getdriverList()
    },
  },
}
