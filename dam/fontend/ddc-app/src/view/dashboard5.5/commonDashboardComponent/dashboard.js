import problemStatistics from '@/view/dataQuality/dashboard/problemStatistics'
import ruleStatistics from '@/view/dataQuality/dashboard/ruleStatistics.vue'
import systemStatistics from '@/view/dataQuality/dashboard/systemStatistics.vue'
import repairJobStatistics from '@/view/dataQuality/dashboard/repairJobStatistics.vue'
import otherStatistics from '@/view/dataQuality/dashboard/otherStatistics.vue'
import problemDetail from '@/view/dataQuality/dashboard/problemDetail.vue'
import importantProblem from '@/view/dataQuality/dashboard/importantProblem.vue'
import topPerson from '@/view/dataQuality/dashboard/topPerson.vue'
import modelCategory from '@/view/dashboard5.5/metaComponent/modelCategory.vue'
import dataSource from '@/view/dashboard5.5/metaComponent/dataSource.vue'
import rule from '@/view/dashboard5.5/metaComponent/rule.vue'
import report from '@/view/dashboard5.5/metaComponent/report.vue'
import domain from '@/view/dashboard5.5/metaComponent/domain.vue'
import catalogCountList from '@/view/dashboard/catalogCountList.vue'
import _ from 'lodash'
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
  top: {
    marginRight: '20px',
  },
  bottom: {
    margin: '10px 20px',
  },
  leftContainer: {
    display: 'inline-block',
    width: '66.3%',
    float: 'left',
  },
  leftItem: {
    marginBottom: '20px',
  },
  rightContainer: {
    display: 'inline-block',
    float: 'right',
    clear: 'right',
    width: '32.3%',
    verticalAlign: 'top',
  },
  rightItem: {
    position: 'relative',
    marginBottom: '20px',
  },
}

export default {
  components: {
    problemStatistics,
    ruleStatistics,
    systemStatistics,
    repairJobStatistics,
    otherStatistics,
    modelCategory,
    dataSource,
    rule,
    report,
    domain,
    problemDetail,
    catalogCountList,
    importantProblem,
    topPerson,
  },
  props: {
    dashboardName: {
      type: String,
      required: true,
    },
  },
  mounted() {
    this.getCountingData()
    this.loadDashboardData()
    this.initEventListeners()
  },
  beforeMount() {
    this.getLayout()
    this.refreshCatalogCount()
  },
  beforeDestroy() {
    this.$bus.$off('edit-dashboard-layout')
    this.$bus.$off('process-dashboard-layout')
  },
  data() {
    const defaultLayoutMap = {
      topLine: [],
      left: [],
      right: [],
    }
    switch (this.dashboardName) {
      case 'qualityDashboard':
        defaultLayoutMap.topLine = [
          'problemStatistics',
          'ruleStatistics',
          'systemStatistics',
          'otherStatistics',
        ]
        defaultLayoutMap.left = ['problemDetail']
        defaultLayoutMap.right = ['topPerson']
        break
      case 'metaDashboard':
        defaultLayoutMap.topLine = [
          'modelCategory',
          'dataSource',
          'report',
          'domain',
          'rule',
        ]
        defaultLayoutMap.left = ['systemAsset']
        break
      default:
        break
    }
    return {
      style: STYLE,
      fullMap: {
        topLine: [
          'problemStatistics',
          'ruleStatistics',
          'systemStatistics',
          'otherStatistics',
          'modelCategory',
          'dataSource',
          'report',
          'domain',
          'rule',
        ],
        left: ['problemDetail', 'systemAsset'],
        right: ['topPerson'],
      },
      defaultLayoutMap: defaultLayoutMap,
      layoutMap: null,
      loading: true,
      getCatalogCount: null,
      countingData: {
        allQualityCount: {},
        ruleQualityCount: {},
        categoryQualityCount: {},
        taskQualityCount: {},
        jobCount: {},
      },
      dashboardData: {},
      detailData: null,
      dialogVisible: false,
      dragonSet: false,
      dialog: {
        componentType: 'topLine',
        component: null,
      },
      isAdmin: this.$isAdmin,
    }
  },
  methods: {
    refreshCatalogCount() {
      const url = `${this.$url}/service/entities/statistics`
      this.getCatalogCount = this.$http.get(url)
    },
    getCountingData() {
      this.$http
        .get(this.$url + '/service/dashboard/quality/main')
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
    loadDashboardData() {
      this.$http
        .get(this.$url + '/service/dashboard/main')
        .then(res => {
          if (res.data) {
            this.dashboardData = res.data
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    initEventListeners() {
      this.$bus.$on('edit-dashboard-layout', componentName => {
        const { topLine, left, right } = this.layoutMap
        this.$bus.$emit('edit-dashboard-layout-response', {
          canLeft:
            topLine.includes(componentName) && topLine[0] !== componentName,
          canRight:
            topLine.includes(componentName) &&
            topLine[topLine.length - 1] !== componentName,
          canTop:
            (left.includes(componentName) && left[0] !== componentName) ||
            (right.includes(componentName) && right[0] !== componentName),
          canBottom:
            (left.includes(componentName) &&
              left[left.length - 1] !== componentName) ||
            (right.includes(componentName) &&
              right[right.length - 1] !== componentName),
          canEdit: true,
          canDelete: true,
          canAdd: true,
        })
      })
      this.$bus.$on('process-dashboard-layout', ({ component, command }) => {
        const { topLine, left, right } = this.layoutMap
        const inTop = topLine.includes(component)
        const inLeft = left.includes(component)
        const inRight = right.includes(component)
        let idx = -1
        if (inTop) {
          idx = topLine.indexOf(component)
        } else if (inLeft) {
          idx = left.indexOf(component)
        } else if (inRight) {
          idx = right.indexOf(component)
        }
        if (command === 'right') {
          this.$set(topLine, idx, topLine[idx + 1])
          this.$set(topLine, idx + 1, component)
        } else if (command === 'left') {
          this.$set(topLine, idx, topLine[idx - 1])
          this.$set(topLine, idx - 1, component)
        } else if (command === 'top') {
          if (inLeft) {
            this.$set(left, idx, left[idx - 1])
            this.$set(left, idx - 1, component)
          } else if (inRight) {
            this.$set(right, idx, right[idx - 1])
            this.$set(right, idx - 1, component)
          }
        } else if (command === 'bottom') {
          if (inLeft) {
            this.$set(left, idx, left[idx + 1])
            this.$set(left, idx + 1, component)
          } else if (inRight) {
            this.$set(right, idx, right[idx + 1])
            this.$set(right, idx + 1, component)
          }
        } else if (command === 'remove') {
          this.$confirm('确定要删除模块吗？', '')
            .then(() => {
              if (inTop) {
                topLine.splice(idx, 1)
              } else if (inLeft) {
                left.splice(idx, 1)
              } else if (inRight) {
                right.splice(idx, 1)
              }
              this.saveLayout()
            })
            .catch(() => {})
        } else if (command === 'reset') {
          this.resetLayout()
        } else if (command === 'add') {
          let part
          if (inTop) {
            part = 'topLine'
          } else if (inLeft) {
            part = 'left'
          } else if (inRight) {
            part = 'right'
          }
          this.addComponent(part)
        }
        if (!['remove', 'reset', 'add'].includes(command)) {
          this.saveLayout()
        }
      })
    },
    resetLayout(arg) {
      if (arg === 'empty') {
        this.$set(this, 'layoutMap', _.cloneDeep(this.defaultLayoutMap))
        this.saveLayout()
      } else {
        this.$confirm('确定要重置所有吗？', '')
          .then(() => {
            this.$set(
              this.layoutMap,
              'topLine',
              _.cloneDeep(this.defaultLayoutMap.topLine)
            )
            this.$set(
              this.layoutMap,
              'left',
              _.cloneDeep(this.defaultLayoutMap.left)
            )
            this.$set(
              this.layoutMap,
              'right',
              _.cloneDeep(this.defaultLayoutMap.right)
            )
            this.saveLayout()
          })
          .catch(() => {})
      }
    },
    addComponent(part) {
      if (part) {
        this.dialog.componentType = part
      }
      this.dialogVisible = true
    },
    processAddComponent() {
      this.layoutMap[this.dialog.componentType].push(this.dialog.component)
      this.dialog.component = null
      this.saveLayout()
    },
    closeDialog() {
      this.dialogVisible = false
    },
    saveLayout() {
      this.$http
        .post(this.$base_url + `/widget/saveWidgetConfig`, {
          widgetId: this.dashboardName,
          content: JSON.stringify(this.layoutMap),
        })
        .then(() => {})
        .catch(e => {
          this.showFailure(e)
        })
      // localStorage.setItem('dashboardLayout', JSON.stringify(this.layoutMap))
    },
    getLayout() {
      this.$http
        .post(
          this.$base_url + `/widget/getWidgetConfig?id=${this.dashboardName}`
        )
        .then(res => {
          const dashboardLayout = res.data.content
          if (dashboardLayout) {
            this.layoutMap = JSON.parse(dashboardLayout)
          } else {
            this.layoutMap = _.cloneDeep(this.defaultLayoutMap)
          }
        })
        .catch(() => {
          this.layoutMap = _.cloneDeep(this.defaultLayoutMap)
        })
      // if (localStorage.getItem('dashboardLayout')) {
      //   this.layoutMap = JSON.parse(localStorage.getItem('dashboardLayout'))
      // } else {
      //   this.layoutMap = _.cloneDeep(this.defaultLayoutMap)
      // }
    },
  },
  computed: {
    topStyle() {
      const style = {
        position: 'relative',
        marginTop: '20px',
        marginLeft: '20px',
        display: 'inline-block',
        height: '130px',
        width: `calc(${100 / this.layoutMap.topLine.length}% - 20px)`,
      }
      return style
    },
    topCanSelect() {
      return this.fullMap.topLine.filter(item => {
        return this.layoutMap && !this.layoutMap.topLine.includes(item)
      })
    },
    noRight() {
      return !this.layoutMap.right || this.layoutMap.right.length === 0
    },
  },
  watch: {
    'dialog.componentType'() {
      this.dialog.component = null
    },
  },
}
