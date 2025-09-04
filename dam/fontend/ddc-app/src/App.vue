<template>
  <div class="default-style">
    <div class="full-mask" v-loading="!dataReady"></div>
    <db-root @update-route="updateRoute" @get-global-message="getGlobalMessage">
      <router-view v-if="dataReady && isRouterAlive"></router-view>
    </db-root>
    <!-- <version-message v-if="dataReady"></version-message> -->
    <staff-select v-if="$store.state.showStaffSelect"></staff-select>
    <branch-select v-if="$store.state.showBranchSelect"></branch-select>
    <personnel-select
      v-if="$store.state.showPersonnelSelect"
    ></personnel-select>
    <global-component v-show="false" v-if="dataReady"></global-component>
    <context-menu v-if="dataReady"></context-menu>
    <i18n-controller></i18n-controller>
    <watermark v-if="authReady" :text="watermarkText"></watermark>
    <div id="extension"></div>
  </div>
</template>
<script>
import VersionMessage from './components/common/main/about.vue'
import preventPageZoom from '@/utils/preventPageZoom'
import staffSelect from './components/common/staffSelect/staffSelect'
import branchSelect from './components/common/branchSelect/branchSelect'
import personnelSelect from './components/common/personnelSelect/personnelSelect'
import globalComponent from '@/components/common/globalComponent.vue'
import I18nController from '@/next/i18n/I18nController'
import ContextMenu from '@/components/common/contextMenu.vue'
import Watermark from './components/common/watermark.vue'
import axios from 'axios'
import Vue from 'vue'
import HTTP from '@/http/main'
// import i18n from '@/next/i18n'

export default {
  components: {
    VersionMessage,
    staffSelect,
    branchSelect,
    personnelSelect,
    globalComponent,
    I18nController,
    ContextMenu,
    Watermark,
  },
  data() {
    return {
      dataReady: true,
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
  beforeMount() {
    this.dataInit()
  },
  mounted() {
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
    updateRoute(router) {
      // this.$router.push(router)
      const pageName = router.name
      if (router.name === this.$route.name) {
        this.reload()
      } else {
        if (pageName !== 'assetHome' && pageName !== 'assetOverview') {
          this.$router.push(router)
        }
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

    getGlobalMessage(promises) {
      const This = Vue.prototype
      // console.log(promises)
      promises.getUserInfo().then(data => {
        console.log('got it from header', data)
        const roles = data.roles || []
        This.$auth = {}
        roles.forEach(role => {
          This.$auth[role] = true
        })
        Vue.prototype.$user = data
        Vue.prototype.$isAdmin = data.username === 'admin'
        this.authReady = true
      })
      promises.getEnableList().then(data => {})
      promises.getAllServersOfCurrentProduct().then(data => {
        let $security = false
        if (data.includes('DATA_SECURITY')) {
          $security = true
        }
        Vue.prototype.$security = $security
      })
      promises.getAbout().then(data => {
        This.$strongPassword = data.strongPassword
        This.$knowledgeGraphEnabled = data.knowledgeGraphEnabled
        This.$tagRcmdEnabled = data.tagRcmdEnabled
        This.$hideFunForRelease = data.release
        This.$customerId = data.customerId
        This.$authServerEnabled = data.$authServerEnabled
        This.$esEnabled = data.$esEnabled
        This.$maxInterval = data.maxInterval
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
          this.$set(This.$featureMap, f, true)
        })
      })
      // 企业版、专业版、预览版
      promises
        .getVersionLevel()
        .then(data => {
          console.log('version level data: ', data)
          This.$versionFeature = {}
          let $versionFeature = {}
          let tempArr = []
          for (let key in data.edition) {
            tempArr.push(...data.edition[key])
          }
          tempArr.forEach(t => {
            This.$set($versionFeature, t, true)
          })
          This.$versionFeature = $versionFeature
        })
        .catch(e => {
          console.log('version feature failure')
          let tempArr = []
          for (let key in res.data.edition) {
            tempArr.push(...res.data.edition[key])
          }
          tempArr.forEach(t => {
            This.$set($versionFeature, t, true)
          })
          This.$versionFeature = $versionFeature
        })
      promises.getAllRolesOfCurrentProduct().then(data => {
        // console.log('getAllRolesOfCurrentProduct ==== ', data)
      })
      promises.getAllServersOfCurrentProduct().then(data => {
        // console.log('getAllServersOfCurrentProduct====', data)
      })
    },
    dataInit() {
      this.$nextTick(() => {
        this.dataReady = true
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
    position: absolute;
    .el-loading-spinner {
      position: fixed;
    }
  }
}
</style>
