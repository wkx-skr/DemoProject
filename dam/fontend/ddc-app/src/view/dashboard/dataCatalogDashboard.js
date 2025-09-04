/**
 * Created by baobao on 2017/6/30.
 */
'use strict'
import * as echarts from 'echarts'

import entityMap from '@/view/developerMode/mapDemo.vue'
import catalogCountTable from './catalogCountTable.vue'
import catalogCountList from './catalogCountList.vue'

export default {
  data() {
    this.BASE_URL = this.$url + '/service/statistics/'
    return {
      dashboardData: {},
      topShowItemMap: {},
      tagCount: '',
      showType: 'default',

      // get data
      getCatalogCount: null,
      iframeUrl: this.$settingIni.dashboard,
    }
  },
  components: {
    entityMap,
    catalogCountTable,
    catalogCountList,
  },
  beforeMount() {
    this.showType = 'default'
    this.refreshCatalogCount()
  },
  mounted() {
    this.loadDashboardData()
    this.featureUpdata()
    this.$bus.$on('forceUpdataNav', this.featureUpdata)
  },
  destroyed() {
    Ps.update($('#main-content')[0])
    this.$bus.$off('forceUpdataNav')
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
    totalDataSizeFilter(val) {
      if (!val && val !== 0) {
        return '0'
      }
      for (let i = 0; i < 6; i++) {
        val = val / 10
        if (val >= 1) {
          val = Math.floor(val)
        }
      }
      val = val + 'TB'
      return val
    },
  },
  methods: {
    loadDashboardData() {
      this.$http
        .get(this.$url + '/service/dashboard/main')
        .then(res => {
          const json = res.data
          this.dashboardData = json
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    featureUpdata() {
      if (Object.keys(this.$featureMap).length === 0) {
        return
      }
      const topShowItemMap = {
        ddm: false,
      }
      let itemCount = 1
      let arrIndex = 0
      const featureArr = ['FE_META', 'FE_MEASURE', 'FE_DOMAIN', 'FE_QUALITY']
      while (itemCount < 5 && arrIndex < featureArr.length) {
        // 顺序 业务系统, 数据源, 数据报表, 数据模型, 数据标准
        if (featureArr[arrIndex] === 'FE_META' && this.$featureMap.FE_META) {
          topShowItemMap.FE_META = true
          itemCount++
        } else if (
          featureArr[arrIndex] === 'FE_MEASURE' &&
          this.$featureMap.FE_MEASURE
        ) {
          topShowItemMap.FE_MEASURE = true
          itemCount++
        } else if (
          featureArr[arrIndex] === 'FE_DOMAIN' &&
          this.$featureMap.FE_DOMAIN
        ) {
          topShowItemMap.FE_DOMAIN = true
          itemCount++
        }
        if (
          itemCount < 5 &&
          !topShowItemMap.tag_count &&
          this.$featureMap.FE_META &&
          false
        ) {
          topShowItemMap.tag_count = true
          this.getTagData()
          itemCount++
        }
        if (
          itemCount < 5 &&
          featureArr[arrIndex] === 'FE_QUALITY' &&
          this.$featureMap.FE_QUALITY
        ) {
          topShowItemMap.FE_QUALITY = true
          itemCount++
        }
        arrIndex++
      }

      this.topShowItemMap = topShowItemMap
    },
    getTagData() {
      const para = {
        currentPage: 1,
        keyword: null,
        pageSize: 1,
        types: ['TAG'],
      }
      this.$http
        .post(this.$url + '/service/entities/search', para)
        .then(res => {
          const tagCount = res.data.totalItems
          this.tagCount = tagCount
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    redrawNetwork2() {
      this.drawNetworkMap2()
    },

    // get data for show
    refreshCatalogCount() {
      const url = `${this.$url}/service/entities/statistics`
      this.getCatalogCount = this.$http.get(url)
    },
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
        if (this.$auth.METADATA_TABALE_VIEW) {
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
  watch: {},
}
