// import lineage from '@/next/service/lineage/main/lineage.vue'
import HTTP from '@/dataWarehouse/resource/http.js'
import { Base64 } from 'js-base64'

export default {
  name: 'lineageComponent',
  props: {
    sql: {
      type: String,
      required: true
    },
    theme: {
      type: String,
      default: 'dark'
    },
    dataSourceId: {
      type: [String, Number]
    },
    dataWarehouse: {
      type: Boolean,
      default: false
    }
  },
  components: {
    // lineage
  },
  data () {
    return {
      showLineage: false,
      pageColor: '#FFF',
      showMiddleProcess: true,
      getDataPromise: null,
      hoverErrorMsg: '',
      showDialog: false,
      optionslineage: {
        showMiddleProcess: true, // 显示加工过程
        showFullProcess: false, // 显示全部过程
        showColumn: true, // 显示字段
        groupBySchema: false, // 分组 (依据Schema)
        groupByCategory: false // 分组 (依据业务系统)
      },
      rawData: {},
      showFullProcess: false,
      showColumn: false,
      typeLineage: '1',
      loadingGraph: false
    }
  },
  mounted () {
  },
  beforeDestroy () {
  },
  computed: {},
  methods: {
    showFullScreenDialog () {
      this.typeLineage = '2'
      this.showDialog = true
    },
    showDialogClose () {
      this.typeLineage = '1'
      this.showDialog = false
    },
    getLineageDataPromise () {
      return this.getDataPromise
    },

    refreshLineage () {
      this.showLineage = false
      this.loadingGraph = true
      this.$bus.$emit('sqlHighlightClear')
      this.hoverErrorMsg = ''
      this.$nextTick(() => {
        if (this.sql) {
          const self = this
          this.getDataPromise = new Promise((resolve, reject) => {
            let id = this.$store.state.ddtStore.currentFileType.id
            let variable = this.$store.state.variable[id] || []
            // let url = `${self.$ddtUrl}/service/lineage`
            let url = `${HTTP.$dddServerUrl}lineage/parse`
            self.$http.post(url, {
              datasourceId: this.dataSourceId,
              properties: variable,
              sql: Base64.encode(this.sql)
            })
              .then(res => {
                this.loadingGraph = false
                this.showLineage = true
                resolve(res)
              })
              .catch(e => {
                this.loadingGraph = false
                if (e.response.data.errorMessage && e.response.data.errorMessage.includes('line')) {
                  this.hoverErrorMsg = e.response.data.errorMessage.replaceAll('\\n', ' ')
                  this.$bus.$emit('rowHighlight', e.response.data.errorMessage.match(/\d+/g)[0], e.response.data.errorMessage)
                } else {
                  this.hoverErrorMsg = e.response.data.errorType
                  reject(e)
                  this.$showFailure(e)
                }
              })
          })
          this.getDataPromise.then(res => {
            this.rawData = res.data
          })
        }
      })
    },

    hiddenLineageTab () {
      this.$emit('hiddenLineageTab')
    }
  },
  watch: {
    // theme (newVal) {
    //   this.refreshLineage()
    // }
  }
}
