<template>
  <div class="default-style">
    <div class="full-mask" v-loading="!dataReady"></div>
    <db-root @update-route="updateRoute" @get-global-message="getGlobalMessage">
      <router-view
        v-if="
          dataReady && versionFeatureReady && featureMapReady && isRouterAlive
        "
      ></router-view>
    </db-root>
    <staff-select v-if="$store.state.showStaffSelect"></staff-select>
    <branch-select v-if="$store.state.showBranchSelect"></branch-select>

    <global-component
      v-show="false"
      v-if="dataReady && versionFeatureReady && featureMapReady"
    ></global-component>
    <!-- 树右侧的更多操作 -->
    <context-menu
      v-if="dataReady && versionFeatureReady && featureMapReady"
    ></context-menu>
    <popover-menu
      v-if="dataReady && versionFeatureReady && featureMapReady"
    ></popover-menu>
    <watermark v-if="authReady" :text="watermarkText"></watermark>
    <!-- <i18n-controller></i18n-controller> -->
  </div>
</template>
<script>
import preventPageZoom from '@/utils/preventPageZoom'
import staffSelect from './components/common/staffSelect/staffSelect'
import branchSelect from './components/common/branchSelect/branchSelect'
import globalComponent from '@/components/common/globalComponent.vue'
import I18nController from '@/next/i18n/I18nController'
import ContextMenu from '@/components/common/contextMenu.vue'
import PopoverMenu from '@/components/common/popoverMenu.vue'
import Watermark from './components/common/watermark.vue'
import Vue from 'vue'
import API from '@/view/dataSecurity/util/api'

export default {
  components: {
    staffSelect,
    branchSelect,
    globalComponent,
    I18nController,
    ContextMenu,
    PopoverMenu,
    Watermark,
  },
  data() {
    return {
      dataReady: false,
      versionFeatureReady: false,
      featureMapReady: false,
      isRouterAlive: true,
      authReady: false,
    }
  },
  computed: {
    watermarkText() {
      if (this.$user && this.$user.fullname && this.$user.username) {
        return `${this.$user.fullname}(${this.$user.username})`
      }
      return ''
    },
  },
  beforeMount() {},
  mounted() {
    this.getModelCategories()
    preventPageZoom()
    window.document.documentElement.setAttribute('data-theme', this.$theme) // 根据主题设置样式
    // 全局变量, 用于区分 开发环境与 生产环境
    // VUE_APP 开头的数据才会加入到 vue 应用中, 在 vue 组件内使用
    // console.info('RUN_ENV: ', RUN_ENV)
    // console.info('process.env.GLOBAL_DATA: ', process.env.GLOBAL_DATA)
    // console.info('process.env.VUE_APP_GLOBAL_DATA: ', process.env.VUE_APP_GLOBAL_DATA)
    console.warn(
      'build time: ',
      moment(BUILD_TIME).format('YYYY-MM-DD HH:mm:ss')
    )
  },
  methods: {
    updateRoute(route) {
      if (route.name === this.$route.name) {
        this.reload()
      } else {
        this.$router.push(route)
      }
    },
    reload() {
      this.isRouterAlive = false
      this.$nextTick(() => {
        this.$router.push({
          query: {},
        })
        this.isRouterAlive = true
      })
    },
    getModelCategories() {
      API.modelCategoriesWithUdpApi()
        .then(res => {
          Vue.prototype.$modelCategories = res.data
          Vue.prototype.$modelCategories.forEach(item => {
            if (item.categoryAbbreviation) {
              item.displayName =
                item.categoryName + '（' + item.categoryAbbreviation + '）'
            } else {
              item.displayName = item.categoryName
            }
            Vue.prototype.$modelCategoriesMap[item.categoryId] =
              item.categoryName + '(' + item.categoryAbbreviation + ')'
            Vue.prototype.$modelCategoriesDetailsMap[item.categoryId] = item
          })
        })
        .catch(e => {
          console.log(e)
        })
    },
    featureTest(testItem, baseNum) {
      let testObj = {
        FE_META: 0b0001,
        FE_SECURITY: 0b0010,
        FE_ASSET: 0b0100,
        FE_SERVICE: 0b1000,
        // FE_QUALITY: 0b1_0000,
        // FE_DOMAIN: 0b1_0000_0000,
        // FE_MEASURE: 0b1_0000_0000_0000,
        // FE_LINEAGE: 0b1_0000_0000_0000_0000,
        // FE_BASE: 0b1_0000_0000_0000_0000_0000,
      }
      for (const key in testObj) {
        Vue.set(Vue.prototype.$featureMap, key, false)
      }
      let result = false
      if (baseNum || baseNum === 0) {
        result = testObj[testItem] === (baseNum & testObj[testItem])
      }
      return result
    },
    getGlobalMessage(promises) {
      const This = Vue.prototype
      This.$versionFeature = {}
      let $versionFeature = {}
      Vue.prototype.$auth = {}
      promises.getUserInfo().then(res => {
        Vue.prototype.$user = res
        let newMap = {}
        res.roles.map(item => {
          newMap[item] = true
        })
        Vue.prototype.$isAdmin = res.roles.some(m => m === 'ROLE_SUPERUSER')
        Vue.prototype.$auth = newMap
        this.dataReady = true
        this.authReady = true
      })
      promises.getAbout().then(res => {
        This.$strongPassword = data.strongPassword
        This.$knowledgeGraphEnabled = data.knowledgeGraphEnabled
        This.$tagRcmdEnabled = data.tagRcmdEnabled
        This.$hideFunForRelease = data.release
        This.$customerId = data.customerId
        This.$authServerEnabled = data.$authServerEnabled
        This.$esEnabled = data.$esEnabled
        This.$maxInterval = data.maxInterval
        // let featuresNumber = res.features
        // featuresNumber = 1118495 // 本地测试使用
        // // for (const key in Vue.prototype.$featureMap) {
        // //   Vue.prototype.$featureMap[key] = this.featureTest(key, featuresNumber)
        // // }
        // Vue.prototype.$featureMap = {
        //   FE_ASSET: true,
        //   FE_BASE: true,
        //   FE_DOMAIN: true,
        //   FE_LINEAGE: true,
        //   FE_MEASURE: true,
        //   FE_META: true,
        //   FE_QUALITY: true,
        //   FE_SECURITY: true,
        //   FE_SERVICE: true,
        // }
      })
      promises.getVersionLevel().then(data => {
        let tempArr = []
        for (let key in data.edition) {
          tempArr.push(...data.edition[key])
        }
        tempArr.forEach(t => {
          Vue.prototype.$set($versionFeature, t, true)
        })
        Vue.prototype.$versionFeature = $versionFeature
        this.versionFeatureReady = true
      })
      promises.getLicenseDetail().then(data => {
        const $featureMap = []
        const featureInfo = data.licenseInfo?.featureInfos
        if (Array.isArray(featureInfo) && featureInfo.length) {
          featureInfo.forEach(feature => {
            if (feature.status !== 'EXPIRED') {
              $featureMap.push(feature.featureCode)
            }
          })
        }
        $featureMap.forEach(f => {
          this.$set(Vue.prototype.$featureMap, f, true)
        })
        this.featureMapReady = true
      })
    },
  },
  beforeDestroy() {},
}
</script>

<style scoped lang="scss">
.default-style {
  height: 100%;
  .full-mask /deep/ .el-loading-mask {
    height: 100%;
    min-height: 100vh;
    position: absolute;
    .el-loading-spinner {
      position: fixed;
    }
  }
}
</style>
