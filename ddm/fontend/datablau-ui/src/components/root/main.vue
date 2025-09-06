<template>
  <div v-if="!isInIframe">
    <com-heading
      v-if="pagesMap"
      ref="heading"
      :pagesTree="pagesTree"
      :pagesMap="pagesMap"
      :appsMap="appsMap"
      @handleTopMenuChange="handleTopMenuChange"
      @handleTopMenuChangeOnlyHighlight="handleTopMenuChangeOnlyHighlight"
      @openUserModal="openUserModal"
      @trigger-hide-nav-controller="triggerHideNavController"
      :stablePromise="stablePromise"
      :env="env"
      :hide-top="hideTop"
    >
      <div slot="default">
        <slot name="heading-partial"></slot>
      </div>
    </com-heading>
    <com-nav
      v-if="pagesMap"
      ref="nav"
      :hide-left="hideLeft"
      :pagesMap="pagesMap"
      :appsMap="appsMap"
      @update-route="updateRoute"
      @trigger-hide-nav-controller="triggerHideNavController"
      @use-last-top-menu="useLastTopMenu"
      @update-nav-extension="updateNavExtension"
      :env="env"
    ></com-nav>
    <div id="db-main" :class="{hideLeft: hideLeft, hideTop: hideTop, isNavExtension: isNavExtension, en: $i18n.locale === 'en'}">
      <slot></slot>
    </div>
  </div>
  <div v-else>
    <slot></slot>
  </div>
</template>
<script>
import $directory from "../../../public/conf/directory";
import ComHeading from '../heading/heading.vue'
import licenseNotify from '../heading/licenseNotify.vue'
import ComNav from '../nav/nav.vue'
import GatewayController from "@/components/root/GatewayController";
import HideNavController from "@/components/root/HideNavController";
import axios from "axios";
export default {
  name: "dbRoot",
  components: {
    ComNav,
    ComHeading,
    licenseNotify
  },
  mixins: [GatewayController, HideNavController],
  beforeCreate() {
    sessionStorage.setItem('ui-last-commit-comment', '移除user-app')
    sessionStorage.setItem('ui-last-commit-time', '2024-01-18 14:52')
  },
  mounted() {
    this.init()
    this.handleCurrentRoute()
  },
  data() {
    let env = window.sessionStorage.getItem('env')
    if (!env) {
      env = 'production'
    }
    return {
      isInIframe: window.top !== window,
      env: env,
      pagesTree: {},
      pagesMap: null,
      appsMap: new Map(),
      isFirstRoute: true,
      // 受限于edition的菜单
      menuFeatureMap: {
        metadata_DataMap: 'map',
        metadata_Report: 'reportFormManage',
        metadata_File: 'metaFolder',
        metadata_ScriptManagement: 'scriptManage',
        metadata_SystemCalls: 'interfacepage',
        domain_Domain: 'domainStandard',
        domain_Field: 'dataStandardField',
        domain_Recommendations: 'dataFind',
        domain_Aggregation: 'domainCluster',
        domain_Verification: 'domainVertify',
        domain_Statistics: 'queryStandard',
        dataquality_RuleReport: 'ruleReport',
        dataquality_ProblemReport: 'problemReport',
        dataquality_RuleTemplate: 'ruleTemplate',
        dataquality_knowledgeBase: 'knowledgebase',
        dataquality_ProblemDistributionPolicy: 'problemProgramme',
        datasecurity_Regulations: 'statutoryProvisions',
        datasecurity_AccessControl: 'accessStrategy',
        datasecurity_Gateway: 'dataSecurityGateway',
      },
      $versionFeature: {},
      $featureMap: {},
      expiredLicense: [],
      hasLicenseAuth: false,
    }
  },
  methods: {
    showLicenseNotify() {
      const h = this.$createElement
      this.$notify({
        title: '产品授权临期提醒',
        dangerouslyUseHTMLString: true,
        message: h('licenseNotify', {
          ref: 'licenseNotify',
          props: {
            license: this.expiredLicense,
          },
        }),
        customClass: 'license-notify-right',
        duration: 0,
        type: 'warning',
        offset: 38,
      })
      window.sessionStorage.setItem('showLicNotify', 'true')
    },
    init() {
      this.setTitle()
      const vm = this
      const handleEditionInfo = ()=>{
        let $versionFeature  = {}
        let f1 = new Promise(function(resolve, reject){
          axios
            .post('/user/main/editionInfos')
            .then(res => {
              let tempArr = []
              for(let key in res.data.edition) {
                tempArr.push(...res.data.edition[key])
              }
              tempArr.forEach(t => {
                vm.$set($versionFeature, t, true)
              })
              vm.$versionFeature = $versionFeature
              resolve($versionFeature)
            })
            .catch(e => {
              resolve({})
            })
        });
        return f1;
      }
      const getUserInfo = ()=>{
        let f2 = new Promise(function(resolve, reject){
          vm.stablePromise.getUserInfo()
            .then(({roles}) => {
              if(roles.includes('BASE_LICENSE_MANAGE')) {
                vm.hasLicenseAuth = true
              }
              resolve(roles)
            })
            .catch(e => {
              resolve([])
            })
        });
        return f2;
      }
      const getLicense = ()=>{
        let expiredLicense = []
        let f3 = new Promise(function(resolve, reject){
          axios
            .post('/base/license/getLicenseDetail')
            .then(res => {
              const $featureMap = []
              const featureInfo = res.data?.licenseInfo?.featureInfos
              if(Array.isArray(featureInfo) && featureInfo.length) {
                featureInfo.forEach(feature => {
                  if(feature.status !== 'EXPIRED') {
                    $featureMap.push(feature.featureCode)
                  }
                  if(feature.status === 'WILL_EXPIRE') {
                    expiredLicense.push(feature)
                  }
                })
              }
              vm.expiredLicense = expiredLicense
              resolve($featureMap)
            })
              .catch(e => {
                resolve([])
              })
        });
        return f3;
      }
      Promise.all([handleEditionInfo(),getUserInfo(), getLicense()])
        .then((res)=>{
          if( (`${window.sessionStorage.getItem('showLicNotify')}` === 'false' || !window.sessionStorage.getItem('showLicNotify')) && this.expiredLicense.length && this.hasLicenseAuth) {
            this.showLicenseNotify()
          }
          this.handleDirectoryData(res)
        })
    },
    setTitle() {
      let titleMap = {
        dam: 'Datablau 数据治理平台',
        ddm: 'Datablau 数据建模平台',
        ddc: '数据资产目录服务平台',
        ddd: 'Datablau 模型开发平台',
        dds: 'Datablau 数据安全',
      }
      $('title').text(titleMap[window.localStorage.getItem('currentProduct')]);
      $('#title').text(titleMap[window.localStorage.getItem('currentProduct')]);
    },
    useLastTopMenu() {
      this.$refs.heading.useLastTopMenu()
    },
    handleDirectoryData(res) {
      let pagesMap = new Map()
      let pagesTree = {}
      $directory.apps.forEach(app => {
        this.appsMap.set(app.name, app)
      })
      pagesTree = $directory.products[window.localStorage.getItem('currentProduct')].pages
        // version feature start ↓
        let featureCtrlMenu = ['domain_Aggregation']
        for (let key in this.menuFeatureMap) {
          if (!res[0][key]) {
            featureCtrlMenu.push(this.menuFeatureMap[key])
            if (key === 'datasecurity_AccessControl') {
              featureCtrlMenu.push('datamaskingRule')
            }
            if (key === 'datasecurity_Gateway') {
              featureCtrlMenu.push('dataSecurityGateway')
              featureCtrlMenu.push('logAudit')
              featureCtrlMenu.push('logging')
            }
          }
        }
        const itemHasAccess = (page) => {
          const hasAccess = ((!$directory.pagesMap[page].accessRequired || $directory.pagesMap[page].accessRequired.some(accessItem => {
            return (res[1] || []).includes(accessItem)
          }) )&& (!$directory.pagesMap[page].licenseRequired || $directory.pagesMap[page].licenseRequired.some(accessItem => {
            return (res[2] || []).includes(accessItem)
          })))
          return hasAccess
        }
        Object.keys(pagesTree).forEach(level1Path => {
          Object.keys(pagesTree[level1Path]).forEach(level2Path => {
            if (pagesTree[level1Path][level2Path].every(item => {
              return !itemHasAccess(item)
            })) {
              delete pagesTree[level1Path][level2Path]
            } else {
              const tmp = []
              pagesTree[level1Path][level2Path].forEach((page, idx, arr) => {
                if (!itemHasAccess(page)) {
                } else {
                  if(!featureCtrlMenu.includes(page)) {
                    tmp.push(page)
                    $directory.pagesMap[page].path = [level1Path, level2Path]
                    pagesMap.set(page, $directory.pagesMap[page])
                  }
                }
              })
              pagesTree[level1Path][level2Path] = tmp
            }
            if (pagesTree[level1Path][level2Path]?.length === 0) {
              delete pagesTree[level1Path][level2Path]
            }
          })
          if (Object.keys(pagesTree[level1Path]).length === 0) {
            delete pagesTree[level1Path]
          }
        })
        this.pagesTree = pagesTree
        this.pagesMap = pagesMap
    },
    handleTopMenuChange(level1) {
      this.$refs.nav.handleTopMenuChange(level1)
    },
    handleTopMenuChangeOnlyHighlight(pageName) {
      this.$refs.nav.handleTopMenuChangeOnlyHighlight(pageName)
    },
    openUserModal(args) {
      this.$refs.nav.openUserModal(args)
    },
    handleCurrentRoute() {
    },
    updateRoute(routeName) {
      console.debug('$emit, update route by name', routeName)
      const query = {}
      if(location.hash) {
        let str = location.hash.split('?')[1]
        if (str) {
          let arr = str.split('&')
          arr.forEach(item => {
            try{
              query[item.split('=')[0]] = item.split('=')[1]
            } catch(e) {
              console.error(e)
              console.error('来自公共组件的警告：参数匹配失败')
            }
          })
        }
      }
      if (this.isFirstRoute && !location.href.includes('userModal')) {
        this.isFirstRoute = false
      } else {
        this.isFirstRoute = false
        this.$emit('update-route', {
          name: routeName,
          query: query
        });
        this.triggerHideNavController(routeName)
      }
    },
  },
  watch: {
  }
}
</script>
<style lang="scss" scoped>
#db-main {
  top: 50px;
  left: 50px;
  position: absolute;right: 0;bottom:0;
  &.isNavExtension {
    left: 160px;
    &.en{
      left: 220px;
    }
  }
  &.hideLeft {
    left: 0 !important;
  }
  &.hideTop {
    top: 0 !important;
  }
  //transition-property: left, top;
  //transition-duration: 200ms;
  //transition-timing-function: ease-in-out;
}
</style>
<style lang="scss">
@import '~@/assets/styles/base.scss';
@import '@/components/color.sass';
.license-notify-right {
  width: 360px;
  .el-notification__group {
    margin-left: 8px;
  }
  .el-notification__content {
    font-size: 12px;
  }
  .el-notification__closeBtn.el-icon-close {
    width: 24px;
    height: 24px;
    line-height: 24px;
    text-align: center;
    margin-top: -4px;
    &:hover {
      color: #409eff;
      background: $table-hover-color;
    }
  }
}
</style>
