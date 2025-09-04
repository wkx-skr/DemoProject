import moment from 'moment'
import HTTP from '@/resource/http'
import sort from '@/resource/utils/sort'
import Status from '../list/Status.vue'
import editImg from '@/assets/images/mxgraphEdit/Edit.svg'
import inElectron from '@/resource/utils/environment'
export default {
  components: {
    Status
    // DatabaseType
  },
  data () {
    return {
      activeName: 'first',
      tableData: null,
      rate: 5,
      sortBase: 'lastModificationTimestamp',
      sortOrder: 'desc',
      loading: true,
      pathMap: null,
      pageSize: 20,
      total: 0,
      currentPage: 1,
      showData: [],
      editImg,
      inElectron
    }
  },
  beforeMount () {
    this.getData()
  },
  methods: {
    goEditPage (scope) {
      this.$http.put(`${this.$url}/service/editor/${scope.row.id}/lock`).then(res => {
        if (res.data) {
          // let webEditor = window.open(`./index.html#/main/modeledit?id=${scope.row.id}&currentVersion=${scope.row.currentVersion}&modelType=${scope.row.modelType}&phase=${scope.row.phase ? scope.row.phase : 0}`, '', 'width=1300,height=800,contextIsolation=no,nodeIntegration=yes,autoHideMenuBar=true')
          const { ipcRenderer } = window.require('electron')
          ipcRenderer && ipcRenderer.send('newTab', JSON.stringify(scope.row))
        }
      }).catch(err => {
        this.$showFailure(err)
      })
    },
    handleClick (tab, event) {
    },
    getData () {
      this.getPathMap()
      this.getModelsList((data) => {
        this.gatherAllModel(data)
      })
    },
    getPathMap () {
      const pathMap = new Map()
      const forEach = (obj, path) => {
        if (obj.models && Array.isArray(obj.models)) {
          pathMap.set(obj.id, path + '/' + obj.name)
        }
        if (obj.children && Array.isArray(obj.children)) {
          obj.children.forEach(child => {
            forEach(child, path + '/' + obj.name)
          })
        }
      }
      const handler = data => {
        this.$store.state.modelsTree = data
        forEach(data, '')
        this.pathMap = pathMap
      }
      if (this.$store.state.modelsTree) {
        handler(this.$store.state.modelsTree)
      } else {
        HTTP.getModels({
          successCallback: handler
        })
      }
    },
    getModelsList (callback) {
      const handler = data => {
        this.$store.state.modelsList = data
        if (data) {
          const masterMap = new Map()
          data.forEach(item => {
            if (!item.branch) {
              masterMap.set(item.id, item.name)
            }
          })
          data.forEach(item => {
            if (item.branch) {
              item.modelName = masterMap.get(item.referredModelId)
            } else {
              item.modelName = item.name
            }
          })
          if (callback) {
            callback(data)
          }
        }
      }
      HTTP.getModelsList({
        successCallback: handler
      })
    },
    gatherAllModel (data) {
      const tableData = data.map(i => i.rate ? i : Object.assign(i, { rate: 0 }))
      this.$bus.$once('ratesReceived', () => {
        tableData.forEach(item => {
          if (this.$globalData.rateMap[item.id]) {
            item.rate = this.$globalData.rateMap[item.id]
          }
        })
        sort.sort(tableData, 'lastModificationTimestamp')
        this.tableData = tableData.reverse()
        let childrenMap = {}
        let newModels = []
        this.tableData.forEach(v => {
          if (v.referredModelId) {
            childrenMap[v.referredModelId] ? childrenMap[v.referredModelId].push(v) : childrenMap[v.referredModelId] = [v]
          } else {
            if (!childrenMap[v.id]) {
              childrenMap[v.id] = []
            }
            v.children = childrenMap[v.id]
            newModels.push(v)
          }
        })
        this.tableData = newModels
        this.getShowData()
      })
      this.$bus.$emit('getRates', tableData.map(item => item.id))
      this.$nextTick(() => {
        this.$bus.$emit('modelsReceived', tableData)
      })
    },
    getShowData () {
      this.loading = true
      let s = this.pageSize
      let c = this.currentPage

      this.showData = this.tableData.slice(s * (c - 1), s * c)
      this.total = this.tableData.length || 0
      this.loading = false
    },
    handleSizeChange (pageSize) {
      this.pageSize = pageSize
      this.getShowData()
    },
    handleCurrentChange (currentPage) {
      this.currentPage = currentPage
      this.getShowData()
    },
    handleRowClick (row) {
      this.prevModel = row
      if (inElectron) {
        this.$router.push({
          name: 'electronList',
          query: {
            id: row.id,
            pId: row.categoryId
          }
        }).then(() => {

        })
      } else {
        this.$router.push({
          name: 'list',
          query: {
            id: row.id,
            pId: row.categoryId
          }
        }).then(() => {
        })
      }
    },
    dateFormatter (row, column) {
      let timestamp = row[column.property]
      return moment(timestamp).format('HH:mm:ss') + '\u0020\u0020\u0020' + moment(timestamp).format('MM-DD')
    },
    handleSortCommand (name, fromUser) {
      this.sortBase = name
      if (name === 'name') {
        if (fromUser !== true) {
          this.sortOrder = 'asc'
        }
        sort.sortConsiderChineseNumber(this.tableData, 'modelName')
      } else if (name === 'star') {
        if (fromUser !== true) {
          this.sortOrder = 'desc'
        }
        if (this.sortOrder === 'asc') {
          this.tableData.sort((a, b) => {
            return a.rate - b.rate
          })
        } else {
          this.tableData.sort((a, b) => {
            return a.rate - b.rate
          })
        }
      } else if (name === 'lastModificationTimestamp') {
        if (fromUser !== true) {
          this.sortOrder = 'desc'
        }
        sort.sort(this.tableData, name)
      }
      if (this.sortOrder === 'desc') {
        this.tableData.reverse()
      }

      this.handleCurrentChange(1)
    },
    changeToAsc () {
      this.sortOrder = 'asc'
      this.handleSortCommand(this.sortBase, true)
    },
    changeToDesc () {
      this.sortOrder = 'desc'
      this.handleSortCommand(this.sortBase, true)
    }
  },
  computed: {
    sortBaseLabel () {
      let isEng = this.$isEng
      switch (this.sortBase) {
        case 'lastModificationTimestamp':
          if (isEng) {
            return 'Sort by date'
          } else {
            return '按时间排序'
          }
        case 'name':
          if (isEng) {
            return 'Sort by name'
          } else {
            return '按名称排序'
          }
        case 'star':
          if (isEng) {
            return 'Sort by rating'
          } else {
            return '按星级排序'
          }
      }
    }
  }
}
