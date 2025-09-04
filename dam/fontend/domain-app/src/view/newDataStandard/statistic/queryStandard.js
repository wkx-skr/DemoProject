import * as echarts from 'echarts'
import managePart from './managePart.vue'
import themeDetail from './themeDetail.vue'
import impactAnalysis from './impactAnalysis'
import HTTP from '@/http/main'
export default {
  components: {
    managePart,
    themeDetail,
    impactAnalysis,
  },
  data() {
    return {
      // options: [
      //   {
      //     value: '1',
      //     label: '主题被引用统计',
      //   },
      //   {
      //     value: '2',
      //     label: '系统引用统计',
      //   },
      //   {
      //     value: '3',
      //     label: '标准定义部门统计',
      //   },
      //   {
      //     value: '4',
      //     label: '最新发布排行',
      //   },
      //   {
      //     value: '5',
      //     label: '影响力排行',
      //   },
      // ],
      // selectType: '主题被引用统计',
      selectValue: '7',
      themeName: '',
      type: '',
      domainObj: {},
      categoryName: '',
      activeName: 'standard',
      showTabs: false,
      showStandard: false,
      themeValue: '',
      standardValue: '',
      systemValue: '',
      domainCode: '',
      departmentValue: '',
    }
  },
  beforeMount() {
    // 处理跳转参数
    this.themeValue = this.$route.query.themeValue
      ? this.$route.query.themeValue
      : ''
    this.standardValue = this.$route.query.standardValue
      ? this.$route.query.standardValue
      : ''
    this.systemValue = this.$route.query.systemValue
      ? this.$route.query.systemValue
      : ''
    this.domainCode = this.$route.query.domainCode
      ? this.$route.query.domainCode
      : ''
    this.departmentValue = this.$route.query.departmentValue
      ? this.$route.query.departmentValue
      : ''
    this.systemValue = this.$route.query.systemValue
      ? this.$route.query.systemValue
      : ''
    this.activeName = this.$route.query.activeName
      ? this.$route.query.activeName
      : 'standard'
  },
  mounted() {
    setTimeout(() => {
      this.showTabs = true
    }, 500)
  },
  beforeDestroy() {
    // this.$bus.$off('updateStatisticsData')
  },
  methods: {
    handleClick(data) {
      this.activeName = data.name
    },
    changeType(val) {
      this.selectValue = val
    },
    systemDetail(val, system, type) {
      this.selectValue = '6'
      this.categoryName = system
      this.type = type
      this.themeName = val
    },
    themeDetail(val, system, type) {
      this.selectValue = '6'
      this.type = type
      this.categoryName = system
      this.themeName = val
    },
    showSystem() {
      this.selectValue = '2'
    },
    showTheme() {
      this.selectValue = '1'
    },
    showThemeDetail(data, type) {
      this.selectValue = '6'
      this.type = type
      this.themeName = data
    },
    // showImpactAnalysis(row) {
    //   this.selectValue = '7'
    //   this.domainObj = row
    // },
    back() {
      this.domainObj = {}
      // debugger
      this.showStandard = false
    },
    showImpactAnalysis(row) {
      this.domainObj = row
      // debugger
      this.showStandard = true
    },
    handleStatisticsRefresh() {
      // 处理数据标准统计刷新
      this.$http
        .get(this.$meta_url + '/service/dashboard/domain/count/cache/update')
        .then(res => {
          // 刷新标准概览图表的数据
          HTTP.refreshDomainCount()
          HTTP.getDomainStatisticsCountFn()
          this.$bus.$emit('refreshEnd')
        })
        .catch(e => {
          this.$bus.$emit('refreshEnd')
          this.$showFailure(e)
        })
    },
  },
}
