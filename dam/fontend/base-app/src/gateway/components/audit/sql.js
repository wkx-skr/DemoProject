import ComponentCaseName from '@constant/ComponentCaseName'
import detail from './detail.vue'
export default {
  components: {
    detail,
  },
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
      showInfo: false,
      componentCaseName: ComponentCaseName.sql,
      isDetail: false,
      pathArr: [],
      wordShow: true,
      form: {
        query: '',
        date: [],
        pageSize: 20,
        pageNum: 1,
      },
      loading: false,
      tableData: [],
      total: 0,
      propsParam: {},
      rowItem: {},
      allColumns: [
        {
          prop: 'query',
          label: 'SQL语句',
          'min-width': '250',
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
      detailData: [],
      total1: 0,
      detailInfo: {
        result: [],
        nameList: [],
      },
      detailTotal: 0,
      detailSize: 20,
      detailPage: 1,
      keyData: [],
      curQuery: ''
    }
  },
  props: {
    detailRow: {
      type: Object,
      default() {
        return {}
      },
    },
  },
  mounted() {
    this.$nextTick(() => {
      this.getNode()
      this.propsParam = _.cloneDeep(this.detailRow)
      this.getList()
    })
    // Object.assign(this.form ,this.detailRow)
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
    changeValue() {

    },
    close() {
      this.isDetail = false
    },
    getNode() {
      this.pathArr = [
        {
          name: '访问日志',
          level: 1,
          couldClick: false,
        },
        {
          name: 'SQL请求',
          level: 2,
        },
      ]
    },
    nodeClick() {},
    backClick() {
      this.$emit('close', 'link')
      // this.$router.go(-1)
    },
    handleClose() {
      this.wordShow = false
      this.propsParam = {}
      this.getList()
    },
    getList() {
      this.loading = true
      let params = {
        ...this.form,
      }
      // params.userName = this.propsParam.serviceUser
      // params.serverAddress = this.propsParam.serverAddress
      params.uuidC = this.propsParam.uuidC
      if (this.form.date && this.form.date.length > 0) {
        params.startTime = this.form.date[0]
        params.endTime = this.form.date[1]
      }
      delete params.date
      this.$http
        .get(this.$url + '/service/audit/jdbc/query', { params: params })
        .then(data => {
          this.loading = false
          this.total = data.data.totalHits
          if (data.data.messages.length > 0) {
            if (data.data.messages[0].errorMsg) {
              this.tableData = []
              this.$blauShowFailure(data.data.messages[0].errorMsg)
            } else {
              let tempArr = data.data.messages.map(item => {
                item.timestamp = this.$timeFormatter(item.timestamp)
                item.serviceUser = this.detailRow.serviceUser
                item.jdbcUrl = this.detailRow.jdbcUrl
                return { ...item }
              })
              this.tableData = tempArr
            }
          } else {
            this.tableData = []
          }
          
        }).catch(e => {
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
        query: '',
        date: [],
        pageSize: 20,
        pageNum: 1,
      }
      this.getList()
    },
    changeEventStartTime(val) {
      this.form.date = val
    },
    refresh() {
      this.loading = true
      this.getList()
    },
    detail(row) {
      this.curQuery = row.query
      this.getDetail(row)
      this.showInfo = true
    },
    getDetail(row) {
      let params = {
        ...this.form,
      }
      params.uuidC = row.uuidC
      params.uuidQ = row.uuidQ
      if (this.form.date && this.form.date.length > 0) {
        params.startTime = this.form.date[0]
        params.endTime = this.form.date[1]
      }
      delete params.date
      delete params.query
      this.$http
        .get(this.$url + '/service/audit/jdbc/result', { params: params })
        .then(data => { // 只有一个
          let newList = []
          this.total1 = data.data.totalHits
          if (data.data.messages.length > 1) {
            Object.keys(data.data.messages[1].tableMap).forEach(item => {
              let newMap = {}
              newMap.name = item
              newMap.keys = data.data.messages[1].tableMap[item]
              newList.push(newMap)
            })
          } 
          this.detailData =  newList
          // this.moreKeys(this.detailData[0])
        }).catch(e => {
          this.$showFailure(e)
        })
    },
    moreKeys(row) {
      this.detailInfo = row
        this.showKey = true
        if (row.result) {
          this.detailTotal = row.result.length
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
    limitData() {
      this.keyData = this.detailInfo.nameList.slice(
        (this.detailPage - 1) * this.detailSize,
        this.detailPage * this.detailSize
      )
    },
    handlePrev() {
      this.form.pageNum--
      this.getList()
    },
    handleNext() {
      this.form.pageNum++
      this.getList()
    },
    handleSizeChange(size) {
      this.form.pageNum = 1
      this.form.pageSize = size
      this.getList()
    },
    handleCurrentChange(page) {
      this.form.pageNum = page
      this.getList()
    }
  },
}
