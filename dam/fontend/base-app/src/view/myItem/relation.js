import RelationNetwork from './RelationNetwork.js'
export default {
  props: ['objectId'],
  data() {
    const style = {
      container: {
        padding: '20px',
        position: 'relative',
        minHeight: '350px',
      },
      tableBox: {
        position: 'absolute',
        right: '20px',
        top: '10px',
        width: '400px',
      },
      tableHeader: {
        background: '#F1F4F8',
        height: '40px',
        lineHeight: '40px',
        paddingLeft: '20px',
        fontSize: '14px',
      },
    }
    return {
      style: style,
      tableData: [],
      network: null,
      tableDisplay: false,
    }
  },
  mounted() {
    this.drawNetwork()
  },
  methods: {
    drawNetwork() {
      const container = document.getElementById('relation-network')
      const data = {
        objectId: this.objectId,
        physicalName: this.$parent.summary.physicalName,
        logicalName: this.$parent.summary.logicalName,
      }
      this.network = new RelationNetwork({
        container: container,
        data: data,
        vThis: this,
      })
      this.network.start()
    },
    showTable(tableData) {
      this.tableDisplay = true
      this.tableData = []
      const map = {}
      tableData.forEach(item => {
        if (!map[item.sourceTable]) {
          map[item.sourceTable] = []
        }
        map[item.sourceTable].push(item)
      })
      for (const i in map) {
        this.tableData.push({
          detail:
            map[i][0].sourceTable + '到' + map[i][0].targetTable + '的关系',
        })
        let detail = ''
        map[i].forEach((item, index) => {
          detail += `<i class="fa fa-link"></i>  ${item.sourceColumn} 到 ${item.targetColumn}<br>`
        })
        this.tableData.push({
          detail: detail,
        })
      }
    },
    hideTable() {
      this.tableData = []
      this.tableDisplay = false
    },
    tableRowClassName({ row, rowIndex }) {
      if (rowIndex === 0 || rowIndex === 2) {
        return 'warning-row'
      } else {
        return ''
      }
    },
  },
}
