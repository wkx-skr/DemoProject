import fieldTitle from './fieldTitle.vue'
import exportDdl from './exportDDL.vue'
import exportJpa from './jpaClass/exportJpa.vue'
import $ from 'jquery'
export default {
  components: { fieldTitle, exportDdl, exportJpa },
  props: {
    modelId: {
      required: true
    },
    path: {},
    isConceptual: {}
  },
  data () {
    return {
      tableData: [],
      tableLoading: false,
      tableHeight: $('.content-box')[0].offsetHeight - 100,
      editLogMap: new Map(),
      log: [],
      logLoading: false,
      exportDDLVisible: false,
      exportJPAVisible: false,
      isLogical: false
    }
  },
  created () {
    this.isLogical = this.$store.state.isLogical
  },
  mounted () {
    this.getVersions(this.modelId)
    this.handleResize()
    $(window).resize(this.handleResize)
  },
  beforeDestroy () {
    $(window).unbind('resize', this.handleResize)
  },
  methods: {
    handleResize () {
      this.tableHeight = $('.content-box')[0].offsetHeight - 100
    },
    getEditLogs () {
      let modelId = this.modelId
      let requestUrl = `${this.$url}/service/models/${modelId}/editlog/list`
      this.$http.get(requestUrl).then(res => {
        let logs = res.data
        let logsMap = new Map()
        logs.forEach(item => {
          item.d = 'l' + item.verId
          logsMap.set(item.verId, item)
        })
        this.tableData.forEach(item => {
          let arr = []

          if (item.startVersion === item.endVersion) {
            if (logsMap.has(item.endVersion)) {
              let log = logsMap.get(item.endVersion)
              log.d = item.name + 'l' + log.verId
              arr.push(log)
            }
          } else {
            for (let i = item.endVersion; i > item.startVersion; i--) {
              if (logsMap.has(i)) {
                let log = logsMap.get(i)
                log.d = item.name + 'l' + log.verId
                arr.push(log)
              }
            }
          }
          this.editLogMap.set(item.d, arr)
        })
      })
      //      this.$http.get(requestUrl2);
    },
    getEditLog (verId, row) {
      this.logLoading = true
      let modelId = this.modelId
      let requestUrl = `${this.$url}/service/models/${modelId}/editlog?startVer=${verId}&endVer=${verId}`
      this.$http.get(requestUrl).then(res => {
        this.log = res.data
        this.$set(row, 'log', res.data)
        row.isOpen = true
        this.logLoading = false
      }).catch(e => {
        this.$showFailure(e)
        this.logLoading = true
      })
    },
    load (row, treeNode, resolve) {
      if (row.d[0] === 'v') {
        let result = _.cloneDeep(this.editLogMap.get(row.d))
        result.forEach(item => {
          item.d += Math.random()
        })
        resolve(result)
      }
    },
    getVersions (modelId) {
      this.tableLoading = true
      const self = this
      self.$http.get(self.$url + '/service/models/' + modelId + '/versions').then(res => {
        this.tableData = []
        res.data.forEach(item => {
          // if (item.name === 'Latest Version') {
          //   item.timestamp = new Date().getTime()
          // }
          item.d = 'v' + item.id
          item.hasChildren = true
          this.tableData.push(item)
        })

        this.getEditLogs()
        this.tableData.sort((a, b) => {
          return b.timestamp - a.timestamp
        })
        this.tableData[this.tableData.length - 1].isLast = true
        self.tableLoading = false
      }).catch(e => {
        self.tableLoading = false
      })
    },
    nl2br (value) {
      if (value) {
        return value.replace(/\n/g, '<br>')
      } else {
        return ''
      }
    },
    handleRowClick (row, column) {
      if (row.creator) {
        let td = $(this.$el).find(`[data-id=${row.d}]`)
        let icon = (td.parent().parent().parent().find('td').find('i[class*=-icon]'))
        icon.click()
      } else if (row.verId) {
        //        this.getEditLog(row.verId);
      }
    },
    scanLog (row) {
      //      this.tableData.forEach(item=>item.isOpen =  false);
      //      row.isOpen = true;
      this.getEditLog(row.verId, row)
    },
    logFormatter (row) {
      let str = ''
      switch (row.opType) {
        case 'CREATE':
          str += this.$store.state.$v.modelDetail.create
          break
        case 'UPDATE':
          str += this.$store.state.$v.modelDetail.mod
          break
        case 'DELETE':
          str += this.$store.state.$v.modelDetail.delete
          break
        default:
          console.error(this.$store.state.$v.modelDetail.noOperation + row.opType)
          break
      }
      str += this.typeFormatter(row)
      str += row.name
      return str
    },
    typeFormatter (a) {
      let typeId
      if (typeof a === 'object') {
        typeId = a.typeId
      } else if (typeof a === 'number') {
        typeId = a
      } else if (typeof a === 'string') {
        typeId = Number.parse(a)
      }
      switch (typeId) {
        case 80000004:
          return this.$store.state.$v.udp.table
        case 80000005:
          return this.$store.state.$v.udp.column
        case 80000006:
          return this.$store.state.$v.udp.category
        case 80000093:
          return this.$store.state.$v.modelDetail.keyKeygroup
        case 80500001:
          return this.$store.state.$v.modelDetail.keyIndex
        case 80500008:
          return this.$store.state.$v.udp.view
          //          return ''
        default:
          return typeId
      }
    }
  },
  watch: {
    modelId (newVal) {
      this.log = []
      this.getVersions(newVal)
    }
  }
}
