import ComponentCaseName from '@constant/ComponentCaseName'
import sql from './sql.vue'
import detail from './detail.vue'

export default {
  components: {
    sql,
    detail,
  },
  data() {
    return {
      currentTab: 'desGateway',
      componentCaseName: ComponentCaseName.GatewayAudit,
      activeName: 'link',
      loading: false,
      loading1: false,
      pathArr: [],
      form: {
        userName: '',
        type: '',
        datasourceName: '',
        gatewayName: '',
        date: [],
        pageSize: 20,
        pageNum: 1,
      },
      tableData: [],
      total: 0,
      detailRow: {},
      allColumns: [
        {
          prop: 'serviceUser',
          label: '登录名',
          'min-width': '120',
          'show-overflow-tooltip': true,
        },
        // {
        //   prop: 'jdbcUrl',
        //   label: '安全网关地址',
        //   'min-width': '350',
        //   'show-overflow-tooltip': true,
        // },
        {
          prop: 'address',
          label: '数据源地址',
          'min-width': '150',
          'show-overflow-tooltip': true,
        },
        {
          prop: 'type',
          label: '数据源类型',
          'min-width': '120',
          'show-overflow-tooltip': true,
          type: 'dataSource',
        },
        {
          prop: 'dateSourceName',
          label: '数据源名称',
          'min-width': '120',
          'show-overflow-tooltip': true,
        },
        {
          prop: 'gatewayName',
          label: '网关名称',
          'min-width': '120',
          'show-overflow-tooltip': true,
        },
        {
          prop: 'timestamp',
          label: '时间',
          'min-width': '120',
          'show-overflow-tooltip': true,
          noconfig: true,
        },
        {
          prop: 'option',
          label: '操作',
          align: 'center',
          slotName: 'option',
          noconfig: true,
        },
      ],
      dataSource: [],
      typeLoading: false,
      groupData: [],
      groupLoading: false,
      dataTypeList: [],
      showSql: false,
      setOptions: {
        toolbar: true,
        copy: true,
        setTheme: true,
        setFontSize: true,
        fullScreen: true,
        formater: true,
        gutterMark: true,
      },
      tables: {
        t_users: ['id', 'name', 'account', 'password', 'email'],
        t_role: ['id', 'uid', 'code', 'permissions'],
      },
      curQuery: '',
      agentPage: 1,
      agentSize: 20,
      tableData1: [],
      total1: 0,
      searchBoxH: 0,
    }
  },
  mounted() {
    this.getNode()
    this.getList()
    this.getDataSource()
    this.dataTypeList = [
      {
        id: 1,
        name: 'MYSQL',
      },
      {
        id: 2,
        name: 'HIVE',
      },
      // {
      //   id: 3,
      //   name: 'ORACLE'
      // },
    ]
  },
  computed: {
    canPrev() {
      if (this.form.pageNum === 1) {
        return true
      } else {
        return false
      }
    },
    canNext() {
      if (this.tableData.length >= this.form.pageSize) {
        return false
      } else {
        return true
      }
    },
    canAgentPrev() {
      if (this.agentPage === 1) {
        return true
      } else {
        return false
      }
    },
    canAgentNext() {
      if (this.tableData1.length >= this.agentSize) {
        return false
      } else {
        return true
      }
    },
  },
  methods: {
    domResize() {
      const searchBox = this.$refs.searchBox
      const h = $(searchBox).height()
      this.searchBoxH = h + 83 + 'px'
    },
    getAgentList() {
      this.loading1 = true
      const params = {
        pageSize: this.agentSize,
        pageNum: this.agentPage,
      }
      this.$http
        .get(this.$url + '/service/audit/jdbc/proxy', { params: params })
        .then(res => {
          this.total1 = res.data.totalHits
          this.loading1 = false
          if (res.data.messages.length > 0) {
            if (res.data.messages[0].errorMsg) {
              this.tableData = []
              this.$blauShowFailure(res.data.messages[0].errorMsg)
            } else {
              this.tableData1 = res.data.messages || []
            }
          } else {
            this.tableData1 = []
          }
        })
        .catch(e => {
          this.loading1 = false
          this.$showFailure(e)
        })
    },
    tabClick(tab) {
      this.currentTab = tab.name
      if (tab.name === 'tranGateway') {
        this.getAgentList()
      } else {
        this.getList()
      }
    },
    toDetail(row) {
      this.curQuery = row.sql
      console.log(this.curQuery)
      this.showSql = true
    },
    getNode() {
      this.pathArr = [
        {
          name: '访问日志',
          level: 1,
        },
        {
          name: '链接请求',
          level: 3,
        },
      ]
    },
    close(name) {
      this.activeName = name
    },
    remoteMethodType(query = '') {
      this.getGroup(query)
    },
    focus() {
      this.remoteMethodType()
    },
    getDataSource() {
      this.typeLoading = true
      this.$http
        .get(this.$url + '/service/models/fromre/')
        .then(data => {
          this.typeLoading = false
          this.dataSource = data.data.filter(item => {
            // 目前数据库只支持MYSQL和ORACLE, HIVE
            return (
              item.type.toUpperCase() === 'MYSQL' ||
              // item.type.toUpperCase() === 'ORACLE' ||
              item.type.toUpperCase() === 'HIVE'
            )
          })
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    getGroup(key) {
      this.groupLoading = true
      const params = {
        current_page: 1,
        page_size: 200,
        search: key,
      }
      this.$http
        .get(this.$url + '/service/dataSecurity/page')
        .then(data => {
          this.groupLoading = false
          data.data.content.map(item => {
            if (item.enable == 1) {
              item.state = true
            } else {
              item.state = false
            }
          })
          this.groupData = data.data.filter(
            item => item.gatewayType === 'DATAMASKING_GATEWAY'
          )
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    getList() {
      this.loading = true
      let params = {
        ...this.form,
      }
      if (this.form.date && this.form.date.length > 0) {
        params.startTime = this.form.date[0]
        params.endTime = this.form.date[1]
      }
      delete params.date
      this.$http
        .get(this.$url + '/service/audit/jdbc/connection', {
          params: params,
        })
        .then(data => {
          this.loading = false
          console.log(data)
          if (data && data.data) {
            this.total = data.data.totalHits
            if (data.data.messages.length > 0) {
              if (data.data.messages[0].errorMsg) {
                this.tableData = []
                this.$blauShowFailure(data.data.messages[0].errorMsg)
              } else {
                let tempArr = data.data.messages.map(item => {
                  item.timestamp = this.$timeFormatter(item.timestamp)
                  let address
                  if (item.jdbcUrl) {
                    address = item.jdbcUrl.split('//')[1].split('/')[0]
                  }
                  item.address = address
                  return {
                    ...item,
                  }
                })
                this.tableData = tempArr
              }
            } else {
              this.tableData = []
            }
          }
        })
        .catch(e => {
          this.loading = false
          this.$showFailure(e)
        })
    },
    query() {
      this.form.pageNum = 1
      this.getList()
    },
    resetForm() {
      this.form = {
        userName: '',
        type: '',
        datasourceName: '',
        gatewayName: '',
        pageSize: 20,
        pageNum: 1,
        date: [],
      }
      this.getList()
    },
    backClick() {
      this.$router.go(-1)
    },
    nodeClick() {},
    detail(row) {
      this.detailRow = row
      this.activeName = 'sql'
      // this.$router.push({ name: 'sql' })
    },
    changeEventStartTime(val) {
      this.form.date = val
    },
    refresh() {
      this.loading = true
      this.getList()
    },
    handlePrev() {
      if (this.currentTab === 'desGateway') {
        this.form.pageNum--
        this.getList()
      }
      if (this.currentTab === 'tranGateway') {
        this.agentPage--
        this.getAgentList()
      }
    },
    handleNext() {
      if (this.currentTab === 'desGateway') {
        this.form.pageNum++
        this.getList()
      }
      if (this.currentTab === 'tranGateway') {
        this.agentPage++
        this.getAgentList()
      }
    },

    handleSizeChange(size) {
      if (this.currentTab === 'desGateway') {
        this.form.pageNum = 1
        this.form.pageSize = size
        this.getList()
      }
      if (this.currentTab === 'tranGateway') {
        this.agentPage = 1
        this.agentSize = size
        this.getAgentList()
      }
    },
    handleCurrentChange(page) {
      if (this.currentTab === 'desGateway') {
        this.form.pageNum = page
        this.getList()
      }
      if (this.currentTab === 'tranGateway') {
        this.agentPage = page
        this.getAgentList()
      }
    },
  },
}
