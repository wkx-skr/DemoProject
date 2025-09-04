<template>
  <div class="default-style">
    <div class="full-mask" v-loading="!dataReady"></div>
    <db-root @update-route="updateRoute" @get-global-message="getGlobalMessage">
      <router-view
        v-if="dataReady && isRouterAlive && isServerReady && authReady"
      ></router-view>
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
    <el-dialog
      :visible.sync="showUploadProgress"
      width="500px"
      :title="uploadProgress.title"
      :close-on-click-modal="true"
      append-to-body
    >
      <datablau-progress
        ref="progress"
        :timePrediction="uploadProgress.time"
      ></datablau-progress>
      <div style="text-align: right; margin-right: 1em; margin-top: 0.5em">
        <span v-if="uploadProgress.status === 'success'">
          {{
            this.$t(
              'quality.page.dataQualityRepairJob.documents.uploadSuccessful'
            )
          }}!
        </span>
        <span v-if="uploadProgress.status === 'progress'">
          {{ this.$t('quality.page.dataQualityRepairJob.documents.Uploading') }}
        </span>
        <span v-if="uploadProgress.status === 'failure'">
          {{
            this.$t('quality.page.dataQualityRepairJob.documents.uploadFailed')
          }}
        </span>
      </div>
    </el-dialog>
  </div>
</template>
<script>
// import VersionMessage from './components/common/main/about.vue'
import preventPageZoom from '@/utils/preventPageZoom'
import staffSelect from './components/common/staffSelect/staffSelect'
import branchSelect from './components/common/branchSelect/branchSelect'
import personnelSelect from './components/common/personnelSelect/personnelSelect'
import globalComponent from '@/components/common/globalComponent.vue'
import I18nController from '@/next/i18n/I18nController'
import ContextMenu from '@/components/common/contextMenu.vue'
import DatasourceController from '../../base-components/http/baseController/DatasourceController'
import Watermark from './components/common/watermark.vue'

import axios from 'axios'
import Vue from 'vue'
import HTTP from '@/http/main'
// import i18n from '@/next/i18n'
import store from '@/store'

export default {
  components: {
    // VersionMessage,
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
      isServerReady: false,
      authReady: false,
      showUploadProgress: false,
      uploadProgress: {
        time: 10,
        title: 'default',
        status: 'progress',
      },
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
    this.getAllPlugins()
    this.getBigClassListAndBusinessTypeList()
    // this.dataInit()
  },
  beforeDestroy() {
    this.$bus.$off('showUploadProgress')
    this.$bus.$off('changeUploadProgress')
    this.$bus.$off('hideUploadProgress')
    this.$bus.$off('getRuleType')
    this.$bus.$off('getAllPlugins')
  },
  mounted() {
    preventPageZoom()
    this.$bus.$on('getAllPlugins', this.getAllPlugins)
    window.document.documentElement.setAttribute('data-theme', this.$theme) // 根据主题设置样式
    // 全局变量, 用于区分 开发环境与 生产环境
    // VUE_APP 开头的数据才会加入到 vue 应用中, 在 vue 组件内使用
    // console.info('RUN_ENV: ', RUN_ENV)
    // console.info('process.env.GLOBAL_DATA: ', process.env.GLOBAL_DATA)
    // console.info('process.env.VUE_APP_GLOBAL_DATA: ', process.env.VUE_APP_GLOBAL_DATA)
    this.$bus.$on('showUploadProgress', ({ name = '默认', time = 10 }) => {
      this.uploadProgress.title = name
      this.uploadProgress.time = time
      this.showUploadProgress = true
      this.uploadProgress.status = 'progress'
      this.$nextTick(() => {
        this.$refs.progress.start()
      })
    })
    this.$bus.$on('changeUploadProgress', isSuccess => {
      if (isSuccess) {
        this.$refs.progress.finish()
        setTimeout(() => {
          this.uploadProgress.status = 'success'

          setTimeout(() => {
            this.showUploadProgress = false
          }, 500)
        }, 500)
      } else {
        this.showUploadProgress = false
        this.$refs.progress?.failure()
        this.uploadProgress.status = 'failure'
      }
    })
    this.$bus.$on('hideUploadProgress', () => {
      this.showUploadProgress = false
    })
    this.$bus.$on('getRuleType', () => {
      this.getBigClassListAndBusinessTypeList()
    })
  },
  methods: {
    getBigClassListAndBusinessTypeList() {
      const This = Vue.prototype
      this.$http
        .post(`${this.$url}/select/option/get`, {
          category: 'TR',
          names: ['业务类型', '规则大类', '规则小类'],
        })
        .then(res => {
          This.$bigClassList = []
          This.$smallClassListAll = []
          This.$typeList = []
          const classList = res.data.filter(e => e.optionName === '规则大类')
          const typeList = res.data.filter(e => e.optionName === '业务类型')
          const smallClassListAll = res.data.filter(
            e => e.optionName === '规则小类'
          )
          classList.forEach(e => {
            const classObj = {
              id: e.id,
              label: e.optionValue,
              value: e.ruleCode,
            }
            This.$bigClassList.push(classObj)
          })
          smallClassListAll.forEach(e => {
            const classObj = {
              id: e.id,
              label: e.optionValue,
              value: e.ruleCode,
            }
            This.$smallClassListAll.push(classObj)
          })
          typeList.forEach(e => {
            const typeObj = {
              label: e.optionValue,
              value: e.optionValue,
            }
            This.$typeList.push(typeObj)
          })
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    getGlobalMessage(promises) {
      const This = Vue.prototype
      This.$versionFeature = {}
      let $versionFeature = {}
      promises
        .getAppEnableConfig()
        .then(data => {
          // data.dam = false
          This.$ddmConnectable = data.ddm
          This.$damEnabled = data.dam
          this.$store.commit('setDamConnectable', data.dam)
          this.$store.commit('setDdmConnectable', data.ddm)
          // 数据质量
          if (This.$damEnabled) {
            This.$getQuality()
          }
        })
        .catch(e => {
          console.log(e)
        })

      promises.getUserInfo().then(data => {
        console.log('got it from header', data)
        This.$user = data
        if (!This.$auth) {
          This.$auth = {}
        }
        This.$user.roles.forEach(item => {
          This.$auth[item] = true
        })
        This.$isAdmin = This.$user.roles.includes('ROLE_SUPERUSER')
        this.authReady = true
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
      promises
        .getVersionLevel()
        .then(data => {
          console.log('got it from header，getVersionLevel', data)
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
          // This.$showFailure(e)
        })
      promises.getAllServersOfCurrentProduct().then(data => {
        localStorage.setItem('allServers', JSON.stringify(data))
        this.isServerReady = true
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
    },
    updateRoute(router) {
      if (router.name === this.$route.name) {
        this.reload()
      } else {
        this.$router.push(router)
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
    getAllPlugins(callback) {
      let This = Vue.prototype
      This.$allPlugins = []
      const getAllPlugin = async () => {
        let allPlugin = await DatasourceController.getAllPlugins()
        return allPlugin.data
      }
      getAllPlugin()
        .then(res => {
          This.$allPlugins = res
          let offline = res.filter(r => {
            return r.dbType === 'OFFLINEDUMP'
          })[0]
          offline?.options[0].candidate.forEach(o => {
            This['$offline_' + o.value] = o
          })
        })
        .then(() => {
          if (callback) {
            callback()
          }
        })
    },
  },
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
