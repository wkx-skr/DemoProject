import HTTP from '@/http/main.js'
import spanWithTooltip from '@/components/common/spanWithTooltip.vue'

export default {
  data() {
    return {
      viewId: '',
      viewData: {},
      viewName: '',
      viewColumns: [],
      resultColumns: [],

      apiUrl: '',
      apiShow: '',

      sqlContent: '',
      choosedColumns: [],
      pageSize: 100,
      currentPage: 0,
      where: '',
      groupBy: [],
      orderBy: [],

      resultUrl: '',
      showSql: false,
      showResultTab: 'fieldsInfo',
      execuTime: '',
      execuSucces: null,
      execuErrMsg: '',
      resultData: [],
      dataTableHeight: null,
      execuHistoryData: [
        // {
        //   execuTime: 1549007413482,
        //   SQL: 'sss'
        // }
      ],
      localStorageHisItem: '',
    }
  },
  components: {
    spanWithTooltip,
  },
  computed: {},
  mounted() {
    setTimeout(() => {
      this.resize()
    }, 1000)
    this.dataInit()

    $(window).resize(this.resize)
  },
  beforeDestroy() {
    $(window).unbind('resize', this.resize)
  },
  methods: {
    resize() {
      setTimeout(() => {
        this.setDataConHeight()
      }, 200)
    },
    dataInit() {
      const dealviewData = viewData => {
        this.viewData = viewData
        this.apiUrl = viewData.url
        this.apiShow = viewData.url
        this.viewName = viewData.name
        this.viewColumns = viewData.columns
        this.resultColumns = viewData.columns
        this.sqlContent = 'SELECT * FROM ' + this.viewName
        this.localStorageHisItem = 'selViewHis' + this.viewName
        this.execuHistoryData = this.getHistroy()
      }

      let viewData = null
      const query = this.$route.query
      if (query && query.viewId) {
        this.viewId = query.viewId
        const viewDataStr = localStorage.getItem(this.viewId)
        if (viewDataStr && this.$utils.isJSON(viewDataStr)) {
          viewData = JSON.parse(viewDataStr)
          localStorage.removeItem(this.viewId)
        }
        if (viewData) {
          dealviewData(viewData)
        } else {
          let url = '/vdp/view'
          if (query.tableId) {
            url = `${this.$url}/service/vdp/views?objId=${query.tableId}`
          } else {
            url = `${this.$url}/service/vdp/view`
          }
          this.$http
            .get(url)
            .then(res => {
              let data = res.data
              if (!query.tableId) {
                data = res.data.views
              }
              let result = {}
              if (data && Array.isArray(data)) {
                data.forEach(item => {
                  if (item.uuid + '' === this.viewId + '') {
                    result = item
                  }
                })
                console.log(result, 'result')
                if (result && result.uuid) {
                  const data = result
                  const urlStr =
                    window.location.host +
                    '' +
                    this.$url +
                    '/service/vdp/data/' +
                    data.name
                  viewData = {
                    name: data.name,
                    creator: data.creator,
                    dependsOn: data.dependsOn ? data.dependsOn.join(',') : '',
                    description: data.description,
                    id: data.uuid,
                    expire: data.expire,
                    url: urlStr,
                    columns: data.columns,
                  }
                  dealviewData(viewData)
                } else {
                  this.$showFailure('未找到视图')
                }
              }
            })
            .catch(e => this.$showFailure(e))
        }
      } else {
        setTimeout(() => {
          this.skipToFinishedPage('004')
        }, 500)
      }
    },
    handleCreatUrl() {
      let str = this.apiUrl + '?'

      if (this.showSql) {
        const sqlBase64 = window.btoa(this.sqlContent)
        str += '$sql=' + sqlBase64
        this.saveHistory(this.sqlContent)
      } else {
        if (
          this.choosedColumns &&
          Array.isArray(this.choosedColumns) &&
          this.choosedColumns.length > 0
        ) {
          let choosedStr = this.choosedColumns.join(',')
          choosedStr = window.encodeURIComponent(choosedStr)
          if (choosedStr) {
            str += '$select=' + choosedStr + '&'
          }
        }

        if (this.pageSize && !isNaN(this.pageSize - 0)) {
          str += '$pageSize=' + this.pageSize + '&'
        }
        if (
          (this.currentPage || this.currentPage === 0) &&
          !isNaN(this.currentPage - 0)
        ) {
          str += '$page=' + this.currentPage + '&'
        }

        if (this.where) {
          const whereStr = window.encodeURIComponent(this.where)
          str += '$where=' + whereStr + '&'
        }

        if (
          this.groupBy &&
          Array.isArray(this.groupBy) &&
          this.groupBy.length > 0
        ) {
          let groupByStr = this.groupBy.join(',')
          groupByStr = window.encodeURIComponent(groupByStr)
          if (groupByStr) {
            str += '$groupBy=' + groupByStr + '&'
          }
        }

        if (
          this.orderBy &&
          Array.isArray(this.orderBy) &&
          this.orderBy.length > 0
        ) {
          let orderByStr = this.orderBy.join(',')
          orderByStr = window.encodeURIComponent(orderByStr)
          if (orderByStr) {
            str += '$orderBy=' + orderByStr + '&'
          }
        }

        str = str.slice(0, -1)
      }

      this.apiShow = str
    },
    handleCopyUrl() {
      this.copyUrl(this.apiShow)
    },
    handleClickRow(row, event, column) {
      const sql = row.SQL
      this.sqlContent = sql
      this.getSqlData()
    },
    skipToFinishedPage(type) {
      this.$router.push({
        name: 'finishedPage',
        path: '/main/finishedPage',
        query: {
          msgType: type,
        },
      })
    },
    handleChangeTab() {},
    getData() {
      this.resultUrl = 'http://' + this.apiShow
      this.getDataShow(this.resultUrl)
    },
    copyUrl(url) {
      const input = document.createElement('input')
      input.setAttribute('readonly', 'readonly')
      input.setAttribute('value', url)
      document.body.appendChild(input)
      input.focus()
      input.select()
      input.setSelectionRange(0, url.length)
      if (document.execCommand('copy')) {
        document.execCommand('copy', false, null)
        this.$showSuccess('复制成功')
      }
      document.body.removeChild(input)
    },
    getDataShow(url) {
      this.execuErrMsg = ''
      this.$http
        .get(url)
        .then(res => {
          const result = res.data
          if (result.data && Array.isArray(result.data)) {
            const resultData = result.data[0] || []
            this.resultData = resultData
            let resultColumns = []
            resultColumns = result.columns
            this.resultColumns = resultColumns
          }
          this.execuSucces = true
          this.showResultTab = 'queryResult'
          this.execuTime = new Date().getTime()
        })
        .catch(e => {
          this.$showFailure(e)
          this.execuSucces = false
          if (e.response && e.response.data) {
            this.execuErrMsg = e.response.data.errorMessage
          }
          this.showResultTab = 'queryInfo'
          this.execuTime = new Date().getTime()
        })
    },
    getSqlData() {
      this.handleCreatUrl()
      this.getData()
    },
    setDataConHeight() {
      return
      const height =
        $('.data-show-page .message-box').height() -
        $('.data-show-page .view-name').height() -
        $('.data-show-page .form-box').height() -
        115
      $('.data-show-page .data-contain').css({ height: height })
      $('.data-show-page .data-contain .tab-item').css({ height: height })
      // this.dataTableHeight = height - 55;
      this.dataTableHeight = height
    },
    saveHistory(sql) {
      // localStorage item: queryViewSqlHistoroy
      const hisArr = this.getHistroy()
      hisArr.unshift({
        execuTime: new Date().getTime(),
        SQL: sql,
      })
      this.execuHistoryData = hisArr
      localStorage.setItem(this.localStorageHisItem, JSON.stringify(hisArr))
    },
    getHistroy() {
      const str = localStorage.getItem(this.localStorageHisItem)
      const hisArr = []
      if (this.$utils.isJSON(str)) {
        const arr = JSON.parse(str)
        const nowTime = new Date().getTime()
        arr.forEach(item => {
          // if (nowTime - item.execuTime < 1000 * 3600 * 24) {
          if (nowTime - item.execuTime < 1000 * 3600 * 24 * 365) {
            hisArr.push(item)
          }
        })
      }
      hisArr.sort((a, b) => {
        return b.execuTime - 0 - (a.execuTime - 0)
      })
      localStorage.setItem(this.localStorageHisItem, JSON.stringify(hisArr))
      return hisArr
    },
    removeHisItem({ row }) {
      let hisArr = this.getHistroy()
      const execuTime = row.execuTime
      hisArr = hisArr.filter(item => {
        return execuTime !== item.execuTime
      })
      hisArr.sort((a, b) => {
        return b.execuTime - 0 - (a.execuTime - 0)
      })
      this.execuHistoryData = hisArr
      localStorage.setItem(this.localStorageHisItem, JSON.stringify(hisArr))
      this.$message.success('删除成功')
    },
    removeHisAll() {
      const hisArr = []
      this.execuHistoryData = hisArr
      localStorage.setItem(this.localStorageHisItem, JSON.stringify(hisArr))
      this.$message.success('删除成功')
    },
  },
  watch: {
    showSql(newVal) {
      this.resize()
    },
    $route(newVal) {
      this.$nextTick(this.dataInit)
    },
  },
}
