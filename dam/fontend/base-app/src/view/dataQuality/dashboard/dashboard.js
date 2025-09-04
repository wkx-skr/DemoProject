import VueGridLayout from 'vue-grid-layout'
import problemStatistics from './problemStatistics'
import ruleStatistics from './ruleStatistics.vue'
import systemStatistics from './systemStatistics.vue'
import repairJobStatistics from './repairJobStatistics.vue'
import otherStatistics from './otherStatistics.vue'
import problemDetail from './problemDetail.vue'
import importantProblem from './importantProblem.vue'
import topPerson from './topPerson.vue'
const STYLE = {
  container: {
    backgroundColor: 'var(--grey-table-title)',
    position: 'absolute',
    minWidth: '1200px',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'auto',
    borderLeft: '1px solid var(--border-color-lighter)',
    borderLeftColor: 'var(--border-color-lighter)',
  },
}
export default {
  components: {
    GridLayout: VueGridLayout.GridLayout,
    GridItem: VueGridLayout.GridItem,
    problemStatistics,
    ruleStatistics,
    systemStatistics,
    repairJobStatistics,
    otherStatistics,
    problemDetail,
    importantProblem,
    topPerson,
  },
  mounted() {
    this.getCountingData()
  },
  data() {
    return {
      style: STYLE,
      layout: [
        { x: 0, y: 0, w: 5, h: 3, i: 'problemStatistics' },
        { x: 5, y: 0, w: 5, h: 3, i: 'ruleStatistics' },
        { x: 10, y: 0, w: 5, h: 3, i: 'systemStatistics' },
        { x: 15, y: 0, w: 5, h: 3, i: 'otherStatistics' },
        { x: 0, y: 3, w: 12, h: 15, i: 'problemDetail' },
        { x: 12, y: 3, w: 8, h: 15, i: 'topPerson' },
      ],
      loading: true,
      countingData: null,
      detailData: null,
      nameMapping: {},
    }
  },
  methods: {
    getCountingData() {
      this.$http
        .get(this.$quality_url + '/dashboard/quality/main')
        .then(res => {
          this.countingData = res.data
        })
        .catch(e => {
          this.$showFailure(e)
        })
        .then(() => {
          this.getDetailData()
        })
    },
    getDetailData() {
      this.$http
        .get(this.$url + '/service/dashboard/quality/rule')
        .then(res => {
          this.detailData = res.data
        })
        .catch(e => {
          this.$showFailure(e)
        })
        .then(() => {
          this.loading = false
        })
    },
  },
}
