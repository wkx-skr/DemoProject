import DashboardMore from '@/view/dashboard5.5/commonDashboardComponent/dashboardMore'
export default {
  components: {
    DashboardMore,
  },
  props: {
    // dashboardData: {
    //   type: Object,
    //   required: true
    // },
    rootData: {
      type: Object,
      required: true,
    },
  },
  computed: {
    dashboardData() {
      return this.rootData
    },
  },
  methods: {
    goPreview(routerName) {
      if (routerName == 'modelCategory') {
        if (this.$auth.APPLICATION_SYSTEM_VIEW) {
          this.$router.push({ name: routerName })
        } else {
          this.$message.error('您暂无访问权限')
        }
      } else if (routerName == 'dataSource') {
        if (this.$auth.DATA_VIEW) {
          this.$router.push({ name: routerName })
        } else {
          this.$message.error('您暂无访问权限')
        }
      } else if (routerName == 'reportFormManage') {
        if (this.$auth.METADATA_REPORT_VIEW) {
          this.$router.push({ name: routerName })
        } else {
          this.$message.error('您暂无访问权限')
        }
      } else if (routerName == 'dataStandard') {
        if (this.$auth.DATA_STANDARD_VIEW) {
          this.$router.push({ name: routerName })
        } else {
          this.$message.error('您暂无访问权限')
        }
      } else if (routerName == 'dataQualityRules') {
        if (
          this.$auth.BUSINESS_RULE_VIEW_MY ||
          this.$auth.BUSINESS_RULE_VIEW_ALL
        ) {
          this.$router.push({ name: routerName })
        } else {
          this.$message.error('您暂无访问权限')
        }
      }
    },
  },
  filters: {
    lineageDataPer(val) {
      if (!val && val !== 0) {
        return '0'
      }
      return parseInt(val) + '%'
    },
    lineageData(val) {
      // val = 30004001;
      let result = ''
      if (!val && val !== 0) {
        return '0'
      }
      do {
        let mo = val % 1000
        if (val > 1000) {
          if (mo < 10) {
            mo = '00' + mo
          } else if (mo < 100) {
            mo = '0' + mo
          }
        }
        result = mo + ',' + result
        val = parseInt(val / 1000)
      } while (val > 0)
      if (window.lang === 'English') {
        return result.slice(0, -1)
      } else {
        return result.slice(0, -1) + ' 个'
      }
    },
  },
}
