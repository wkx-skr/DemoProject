import ComponentCaseName from '@constant/ComponentCaseName'
export default {
  data() {
    return {
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
      componentCaseName: ComponentCaseName.auditDetail,
      pathArr: [],
      wordShow: true,
      form: {
        date: [],
        pageSize: 10,
        pageNum: 1,
      },
      loading: false,
      tableData: [],
      showInfo: false,
      propsParam: {},
      isDate: true,
      detailInfo: {
        result: [],
        nameList: [],
      },
      showKey: false,
      currentPage: 1,
      pageSize: 20,
      total: 0,
      keyData: [],
      allColumns: [
        // {
        //   prop: 'username',
        //   label: 'username',
        //   'min-width': '120',
        //   'show-overflow-tooltip': true,
        // },
        // {
        //   prop: 'link',
        //   label: '安全网关地址',
        //   'min-width': '300',
        //   'show-overflow-tooltip': true,
        // },
        // {
        //   prop: 'sql',
        //   label: 'SQL语句',
        //   'min-width': '120',
        //   'show-overflow-tooltip': true,
        // },
        {
          prop: 'name',
          label: '字段名称',
          'min-width': '120',
          'show-overflow-tooltip': true,
          slotName: 'name',
        },
        {
          prop: 'key',
          label: '字段值',
          'min-width': '200',
          'show-overflow-tooltip': true,
          slotName: 'key',
        },
        {
          prop: 'timestamp',
          label: '时间',
          'min-width': '130',
          noconfig: true,
        },
        {
          prop: 'option',
          label: '操作',
          align: 'center',
          'min-width': '120',
          slotName: 'option',
          noconfig: true,
        },
      ],
    }
  },
  props: {
    rowItem: {
      type: Object,
      default() {
        return {}
      },
    },
  },
  mounted() {
    this.$nextTick(() => {
      this.getNode()
      this.propsParam = _.cloneDeep(this.rowItem)
      this.getList()
    })
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
  },
  methods: {
    getNode() {
      this.pathArr = [
        {
          name: '访问日志',
          level: 1,
          couldClick: false,
        },
        {
          name: '返回数据',
          level: 2,
        },
      ]
    },
    nodeClick() {},
    backClick() {
      this.$emit('close', 'sql')
      // this.$router.go(-1)
    },
    moreKeys(row) {
      this.detailInfo = row
      this.showKey = true
      if (row.result) {
        this.total = row.result.length
      }
      
      let columnInfo = row.columnInfo
      columnInfo = columnInfo.slice(1)
      const outArr = columnInfo.split('},')
      let newList = []
      outArr.map(item => {
        let innerArr = item.split(',')
        const newMap = {}
        innerArr.map((list, index) => {
          if (index === 0) {
            let listArr = list.split('=')
            newMap.name = listArr[1]
            newList.push(newMap)
          }
        })
      })
      let nameList = []
      newList.map((item, index) => {
        let list = {}
        list.name = item.name
        if (this.detailInfo.result && this.detailInfo.result.length > index) {
          list.key = this.detailInfo.result[index]
        } else {
          list.key = '-'
        }
        nameList.push(list)
      })
      this.detailInfo.nameList = nameList
      this.limitData()
    },
    handleSizeChange(size) {
      this.pageSize = size
      this.limitData()
    },
    handleCurrentChange(page) {
      this.currentPage = page
      this.limitData()
    },
    limitData() {
      this.keyData = this.detailInfo.nameList.slice(
        (this.currentPage - 1) * this.pageSize,
        this.currentPage * this.pageSize
      )
    },
    handleClose() {
      this.wordShow = false
    },
    query() {
      this.form.pageNum = 1
      this.getList()
    },
    resetForm() {
      this.isDate = false
      this.form = {
        // date: [],
        pageSize: 10,
        pageNum: 1,
      }
      this.$set(this.form, 'date', null)
      this.getList()
      setTimeout(() => {
        this.isDate = true
      })

      // this.$forceUpdate()
      // this.form = Object.assign({}, this.form)
    },
    getList() {
      this.loading = true
      let params = {
        ...this.form,
      }
      // params.userName = this.propsParam.serviceUser
      // params.serverAddress = this.propsParam.serverAddress
      // params.jdbcUrl = this.propsParam.jdbcUrl
      // params.query = this.propsParam.query
      params.uuidC = this.propsParam.uuidC
      params.uuidQ = this.propsParam.uuidQ
      if (this.form.date && this.form.date.length > 0) {
        params.startTime = this.form.date[0]
        params.endTime = this.form.date[1]
      }
      delete params.date
      this.$http
        .get(this.$url + '/service/audit/jdbc/result', { params: params })
        .then(data => {
          let tempArr = data.data.map(item => {
            item.timestamp = this.$timeFormatter(item.timestamp)
            item.username = this.rowItem.serviceUser
            item.link = this.rowItem.jdbcUrl
            item.sql = this.rowItem.query
            return { ...item }
          })
          this.tableData = tempArr
          this.loading = false
        })
    },
    changeEventStartTime(val) {
      this.form.date = val
    },
    refresh() {
      this.loading = true
      this.getList()
    },
    view(row) {
      this.showInfo = true
      this.detailInfo = row
    },
    handlePrev() {
      this.form.pageNum--
      this.getList()
    },
    handleNext() {
      this.form.pageNum++
      this.getList()
    },
  },
}
