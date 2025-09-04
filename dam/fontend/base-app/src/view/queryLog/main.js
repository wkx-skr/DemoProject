export default {
  data() {
    return {
      currentTab: 'list',
      tables: null,
      postUrl: this.$url + '/service/ql/logs/upload',
      query: {
        table: '',
        schema: '',
      },
      countInterval: null,
      count: '',
      relatedTables: [],
      currentTable: null,
      thatTable: null,
      sqls: [],
    }
  },
  mounted() {
    //    this.getTables();
    this.getCount()
    this.countInterval = setInterval(() => {
      this.getCount()
    }, 10000)
  },
  beforeDestroy() {
    clearInterval(this.countInterval)
  },
  methods: {
    downloadTemplate() {
      const url = this.$url + '/service/ql/logs/template'
      this.$downloadFile(url)
    },
    onError(e) {
      this.$showUploadFailure(e)
    },
    onSuccess(msg) {
      this.$showSuccess('导入成功' + msg)
      //      this.getTables();
    },
    getCount() {
      this.$http
        .get(this.$url + '/service/ql/sql/count')
        .then(res => {
          this.count = res.data
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    getAllTables() {
      this.tables = null
      this.relatedTables = null
      this.thatTable = null
      this.$http
        .get(this.$url + '/service/ql/tables')
        .then(res => {
          this.tables = res.data
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    searchTables() {
      this.tables = null
      this.relatedTables = null
      this.thatTable = null
      const { schema, table } = this.query
      this.$http
        .get(
          this.$url +
            `/service/ql/tables/search?schema=${schema}&table=${table}`
        )
        .then(res => {
          this.tables = res.data
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    getRelatedTables({ tableId, table, schema }) {
      this.currentTable = {
        table: table,
        schema: schema,
        tableId: tableId,
      }
      this.relatedTables = null
      this.thatTable = null
      this.$http
        .get(this.$url + `/service/ql/tables/${tableId}`)
        .then(res => {
          this.relatedTables = res.data
          this.currentTab = 'relatedTables'
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    getSqls(table) {
      this.thatTable = table
      this.$http
        .get(
          this.$url +
            `/service/ql/tables/relationship/${this.currentTable.tableId}/${table.tableId}`
        )
        .then(res => {
          this.sqls = res.data
          this.currentTab = 'thatTable'
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    removeTab(targetName) {
      if (targetName === 'relatedTables') {
        this.currentTab = 'list'
        this.relatedTables = null
        this.thatTable = null
      } else if (targetName === 'thatTable') {
        this.currentTab = 'relatedTables'
        this.thatTable = null
      }
    },
  },
}
