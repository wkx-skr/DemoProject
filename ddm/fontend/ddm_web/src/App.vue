<template>
  <div v-if="ready && $store.state.dbTypeReady">
    <!--<db-root
      :env="env"
      @update-route="updateRoute"
    >
      <router-view></router-view>
      <div slot="heading-partial">
        <right-button></right-button>
      </div>
    </db-root>-->
    <!--<db-root v-show="false"></db-root>-->
    <router-view></router-view>
    <staff-select v-if="$store.state.showStaffSelect"></staff-select>
    <branch-select v-if="$store.state.showBranchSelect"></branch-select>
    <version-message></version-message>
    <!-- <div id="context-menu" v-show="showContext">
      <ul class="context-menu-style">
        <li class="context-option" v-for="o in contextOptions" :key="o.label" @click="o.callback(o.args)">
          <i v-if="o.icon" class="icon" :class="o.icon"></i>
          <span class="label">{{ o.label }}</span>
        </li>
      </ul>
    </div> -->
    <context-menu v-show="showContext"></context-menu>
    <div id="context-menu-dam" v-show="showContextDam" :class="customClassName">
      <ul class="context-menu-style">
        <div v-for="(o) in contextOptions" :key="o.idx">
          <li v-if="!o.line" class="context-option" @click="o.callback(o.args,$event)">
            <i v-if="o.icon" class="icon" :class="o.icon"></i>
            <span class="label">{{ o.label }}</span>
          </li>
          <template v-else>
            <div class="hr"></div>
          </template>
        </div>
      </ul>
      <div class="arrow"></div>
    </div>
    <com-rate></com-rate>
    <model-category-selector></model-category-selector>
    <watermark :text="watermarkText"></watermark>
  </div>
</template>
<script>
import HTTP from '@/resource/http'
import VersionMessage from '@/components/common/about.vue'
import ComRate from '@/components/common/rate.vue'
import $ from 'jquery'
import _ from 'lodash'
import staffSelect from './components/common/staffSelect/staffSelect'
import Vue from 'vue'
import store from '@/store'
import licenseNotify from '@/views/common/licenseNotify.vue'
import ContextMenu from '@/components/common/contextMenu.vue'
import branchSelect from '@/dataWarehouse/views/dataIndex/damComponents/branchSelect/branchSelect.vue'
import modelCategorySelector from '@/components/selector/ModelCategorySelector.vue'
import Watermark from './components/common/watermark.vue'
// import rightButton from '@/views/common/rightButton.vue'

const This = Vue.prototype
export default {
  components: {
    VersionMessage,
    ComRate,
    // rightButton,
    // eslint-disable-next-line
    licenseNotify,
    staffSelect,
    ContextMenu,
    modelCategorySelector,
    branchSelect,
    Watermark
  },
  created () {
    this.getProductsVersion()
    // this.getEnableList()
  },
  beforeMount () {
    // this.getModelsTree()
    // 全局变量, 用于区分 开发环境与 生产环境
    // VUE_APP 开头的数据才会加入到 vue 应用中, 在 vue 组件内使用
    // console.info('RUN_ENV: ', RUN_ENV)
    // console.info('process.env.GLOBAL_DATA: ', process.env.GLOBAL_DATA)
    // console.info('process.env.VUE_APP_GLOBAL_DATA: ', process.env.VUE_APP_GLOBAL_DATA)
    console.warn('DDM Build Time: ', moment(BUILD_TIME).format('YYYY-MM-DD HH:mm:ss'))
    this.env = RUN_ENV === 'dev' ? 'dev' : 'prod'

    This.$devMode = RUN_ENV === 'dev'
  },
  data () {
    return {
      showContext: false,
      'showContextDam': false,
      contextOptions: [],
      preDataPromise: [],
      ready: false,
      licCustomerId: '',
      versionCustomerId: '',
      // processHttpReady: false,
      customClassName: '',
      hasFeature: false,
      expiredLicense: [],
      env: '',
      authReady: false
    }
  },
  computed: {
    watermarkText () {
      console.log('watermarkText', this.$user)
      if (this.$user && this.$user.fullName && this.$user.username) {
        return `${this.$user.fullName}(${this.$user.username})`
      }
      return ''
    }
  },
  mounted () {
    this.getAppEnableConfig()
    this.createContextMenu()
    // this.getUserInfo()
    this.getAppList()
    this.getBpmnStatus()
    // 获取 lic 信息
    new Promise((resolve, reject) => {
      this.$http.post(HTTP.BASE_BASE_URL + 'license/getLicenseDetail')
        .then(res => {
          resolve(res)
        })
        .catch(e => {
          this.$showFailure(e)
          resolve({})
        })
    })
    // this.$http.post('/base/license/getLicenseDetail')
      .then(res => {
        let expiredLicense = []
        let featureInfos = res.data?.licenseInfo?.featureInfos || []
        let featureMap = {}
        featureInfos.forEach(item => {
          featureMap[item.featureCode] = item.status === 'NORMAL' || item.status === 'WILL_EXPIRE'
          // featureMap[item.featureCode] = false
          if (item.status === 'WILL_EXPIRE') {
            // if (item.status === 'NORMAL') {
            expiredLicense.push(item)
          }
        })
        this.expiredLicense = expiredLicense
        if (expiredLicense.length > 0) {
          this.showLicenseNotify()
        }
        const store = this.$store
        if (featureMap['FE_DDM_WEB']) {
          store.commit('setEREdit', true)
          store.state.lic.editor = true
          // this.hasFeature = true
        }
        if (featureMap['FE_DDM_WEB_DISPLAY']) {
          store.state.lic.quality = true
          // this.hasFeature = true
        }
        if (featureMap['FE_DDM']) {
          store.state.lic.serverEnable = true
          store.state.licServerEmbedded = true // 两个变量相同
          this.hasFeature = true
        }
        if (featureMap['FE_DOMAIN']) {
          store.state.lic.domain = true
          // this.hasFeature = true
        }
        if (featureMap['FE_DDM_ARCH']) {
          store.state.lic.archy = true
          // this.hasFeature = true
        }
        store.state.lic.ready = true
        store.state.lic.noActiveLic = !this.hasFeature

        // 获取用户信息，根据是否有 ddm lic 判断是否刷新
        return new Promise((resolve, reject) => {
          if (this.hasFeature) {
            setTimeout(() => {
              this.getDomainCodes()
            }, 500)
            // 每次登录前刷新权限
            this.$http(this.$url + '/service/permissions/flush')
              .then(res => {
                resolve()
              })
              .catch(e => {
                reject(e)
              })
          } else {
            resolve()
          }
        })
      })
      .then(res => {
        this.getUserInfo()
        Promise.all(this.preDataPromise)
          .then(res => {
            this.$store.state.lic.ready = true
            setTimeout(() => {
              this.$store.dispatch('ddmPermission/initMenuPermissions')
                .then(res => {
                  if (this.hasFeature) {
                    this.$store.dispatch('getPhases')
                    this.getCurrentPagePermissions()
                    this.getAbout()
                  } else {
                    // 没有有效的 lic，并且有页面权限，跳转到 lic 管理页面
                    // if (this.$auth['ROLE_LICENSE_MANAGE_DDM']) {
                    //   if (this.$route.name !== 'licenseManageDdm') {
                    //     this.$router.push('licenseManageDdm')
                    //   } else {
                    //     this.getCurrentPagePermissions()
                    //   }
                    // } else {
                    //   if (this.$route.name !== 'userInformation') {
                    //     this.$router.push('userInformation')
                    //   } else {
                    //     this.getCurrentPagePermissions()
                    //   }
                    // }
                    if (this.$route.name !== 'userInformation') {
                      this.$router.push('userInformation')
                    } else {
                      this.getCurrentPagePermissions()
                    }
                  }
                })
                .catch(e => {
                  console.log(e)
                })
            }, 100)
          })
          .catch(e => {
            this.$showFailure(e)
            setTimeout(() => {
              HTTP.logout()
            }, 10000)
          })
      })
      .catch(e => {
        // this.$showFailure(e)
      })
  },
  beforeDestroy () {
    this.$bus.$off('callContextMenu')
  },
  methods: {
    getBpmnStatus () {
      const getBpmnStatus = this.$http.get(this.$url + '/main/connectable').then(res => {
        this.$store.state.lic.bpmn = res.data.BPMN
        // this.$store.state.lic.dw = res.data.DW
      }).catch(e => {
        // this.$showFailure(e)
      })
      this.preDataPromise.push(getBpmnStatus)
    },
    getProductsVersion () {
      // P代表专业版, E代表企业版，A代表演示版。
      let levelMap = {
        p: 0,
        e: 1,
        a: 2
      }
      const levelPromise = (async () => {
        let res = {}
        try {
          res = await HTTP.getProductsVersion()
        } catch (e) {
          console.log(e)
          res = {}
          this.$showFailure(e)
        }
        return res
      })()
      // TEST
      // const levelPromise = this.$http.get('http://127.0.0.1:8180/user/main/editionInfos')
      this.preDataPromise.push(levelPromise)
      levelPromise
        .then(res => {
          let data = res?.edition || {}
          let features = []
          let featureMap = {}
          for (let key in data) {
            // console.log(key, 'key')
            if (data[key]) {
              features.push(...data[key])
            }
          }
          features.forEach(item => {
            featureMap[item] = true
          })

          featureMap.ddm_Database_TDSQLMySQL = true // ddm_Database_TDSQLMySQL 彻底放开
          // featureMap.ddm_Messages = true

          // featureMap = {
          //   ddm_Messages: true,
          //   ddm_BindingSystem: true,
          //   ddm_WebModelAdvancedAttribute: true,
          //   ddm_JPAClass: true,
          //   ddm_AutoBranchMerging: true,
          //   ddm_WebDDLConfig: true,
          //   ddm_CustomStatus: true,
          //   ddm_CustomModelCheckPolicy: true,
          //   ddm_CustomModelCheckRule: true, // 暂时不用
          //   domain_Domain: true,
          //   domain_Field: true,
          //   ddm_Database_CBase: true,
          //   ddm_Database_TDSQLMySQL: true,
          //   ddm_Database_Cassandra: true,
          //   ddm_Database_MongoDB: true
          // }
          localStorage.setItem('featureMap', JSON.stringify(featureMap))
          this.$store.commit('setFeatureMap', featureMap)
          this.$store.commit('setFeatureMapReady', true)

          this.versionCustomerId = data.customerid
        })
        .catch(e => {
          // this.$showFailure(e)
          console.log(e, 'e')
          this.$store.commit('setFeatureMapReady', true)
        })
    },
    testCustomer () {
      if (!this.licCustomerId || !this.versionCustomerId || this.licCustomerId.toLowerCase() !== this.versionCustomerId.toLowerCase()) {
        this.$DatablauCofirm('客户名称不匹配!', 'error', {
          confirmButtonText: '确定',
          showCancelButton: false,
          showClose: false,
          closeOnClickModal: false,
          closeOnPressEscape: false,
          callback: action => {
            HTTP.logout()
          }
        })
      }
    },
    getAbout () {
      const aboutPromise = this.$http.get(this.$url + '/service/utils/about')
      // this.preDataPromise.push(aboutPromise)
      aboutPromise.then((res) => {
        const store = this.$store
        let data = res.data
        // // 校验 lic 用户 与 版本用户是否一致, 放到后台校验, 前端放开
        // this.licCustomerId = data.customerId
        // if ((data.web.parsedRv & 16) === 16) {
        //   store.commit('setEREdit', true)
        //   store.state.lic.editor = true
        // }
        // if ((data.web.parsedRv & 256) === 256) {
        //   store.state.lic.quality = true
        // }
        // if ((data.web.parsedRv & 4096) === 4096) {
        //   store.state.lic.domain = true
        // }
        // if ((data.web.parsedRv & 65536) === 65536) {
        //   store.state.lic.archy = true
        // }
        // store.state.lic.ready = true
        // store.state.licServerEmbedded = data.licServerEmbedded
        // @ts-ignore
        let v = data.version?.split('-')
        // if (v[0] !== window.setting.version.ddm) {
        //   this.$datablauMessage.warning('请留意，web和server版本不一致')
        // }
      }).catch((e) => {
        console.log(e)
      })
    },
    updateRoute (router) {
      this.$router.push(router)
    },
    createContextMenu () {
      const dom = $('#context-menu')
      $(window).on('mouseup', this.hideContextMenu)
      this.$bus.$on('closeContextMenu', () => {
        this.showContext = false
        this['showContextDam'] = false
      })
      this.$bus.$on(
        'callContextMenu',
        ({ x, y, options, placement = 'right' }) => {
          this.contextOptions = options
          this.showContext = true
          this.$nextTick(() => {
            switch (placement) {
              case 'right':
                dom.removeClass('to-right')
                dom.css({
                  top: y + 1 + 10 + 'px',
                  left: x + 1 - 23 + 'px'
                })
                break
              case 'left':
                dom.addClass('to-right')
                dom.css({
                  top: y + 1 + 10 + 'px',
                  left: x + 25 - parseFloat(dom.css('width')) + 'px'
                })
                break
              case 'bottom-left':
                dom.css({
                  top: y + 10 + 'px',
                  left: x - 100 + 'px'
                })
                break
            }
          })
        }
      )
      this.$bus.$on('callContextMenu-dam', ({ x, y, options, isLeft, customClassName = '' }) => {
        const dom = $('#context-menu-dam')
        if (isLeft) {
          dom.css({
            top: y + 1 + 'px',
            left: x - 120 + 'px'
          })
        } else {
          dom.css({
            top: y + 1 + 'px',
            left: x + 1 + 'px'
          })
        }
        this.customClassName = customClassName
        this.contextOptions = options
        this['showContextDam'] = true
      })
    },
    getDomainCodes () {
      HTTP.getDomainCodes({
        successCallback: data => {
          this.handleCodesList(data.publicCodes)
        }
      })
    },
    handlePrivateCodesList (list) {
      const map = this.$globalData.domainCodes.map
      const valueMap = this.$globalData.domainCodes.valueMap
      const treeData = this.$globalData.domainCodes.treeData
      list.forEach(item => {
        map.set(item.code, item.name)
        valueMap.set(item.code, item.values)
      })
      treeData.push({
        name: this.$store.state.$v.doaminSelector.lv2,
        children: list
      })
    },
    handleCodesList (list) {
      const codeTreeData = []
      let codesTreeMap = {}
      let map = new Map()
      let valueMap = new Map()
      list.forEach(item => {
        if (codesTreeMap.hasOwnProperty(item.dataset)) {

        } else {
          codesTreeMap[item.dataset] = []
        }
        codesTreeMap[item.dataset].push(item)
        map.set(item.code, item.name)
        valueMap.set(item.code, item.values)
      })
      let publicTreeData = []
      for (let i in codesTreeMap) {
        let codes = codesTreeMap[i]
        publicTreeData.push({
          name: i,
          children: codes
        })
      }
      codeTreeData.push({
        name: this.$store.state.$v.doaminSelector.lv1,
        children: publicTreeData
      })
      this.$globalData.domainCodes = {
        map: map,
        treeData: codeTreeData,
        valueMap
      }
      this.$bus.$emit('updateDomains')
    },
    getDomains () {
      const map = new Map()
      const idFullMap = new Map()
      const result = []
      HTTP.getDomains({
        successCallback: (data) => {
          data && data.publicDomains && data.publicDomains.forEach(item => {
            result.push({
              id: item.id,
              value: item.chName
            })
            map.set(item.id, item.chName)
            idFullMap.set(item.id, item)
          })

          if (data && data.privateDomainRoot) {
            const forEachPrivateDomain = node => {
              if (node.domains) {
                node.domains.forEach(item => {
                  result.push({
                    id: item.id,
                    value: item.chName,
                    private: true
                  })
                  map.set(item.id, item.chName)
                  idFullMap.set(item.id, item)
                })
              }
              if (node.children) {
                node.children.forEach(c => {
                  forEachPrivateDomain((c))
                })
              }
            }
            data && forEachPrivateDomain(data.privateDomainRoot)
          }
          this.$globalData.allDomains = result
          this.$globalData.domainIdMap = map
          this.$globalData.domainIdFullMap = idFullMap
          this.$bus.$emit('updateDomains')
          this.createDomainTree(data)
        }
      })
    },
    createDomainTree (data) {
      const treeDataMap = {}
      const treeData = []
      data && data.publicDomains && data.publicDomains.forEach(item => {
        for (let i = 0; i < item.path.length; i++) {
          let currentParent = treeDataMap
          for (let j = 0; j <= i; j++) {
            if (!currentParent[item.path[j]]) {
              currentParent[item.path[j]] = {}
            }
            currentParent = currentParent[item.path[j]]
            if (j === item.path.length - 1) {
              currentParent[item.id] = item
            }
          }
        }
      })
      const forEach = (object, array) => {
        for (let i in object) {
          if (object[i].id) {
            array.push({
              id: object[i].id,
              name: object[i].chName,
              domainCode: object[i].domainCode,
              dataType: object[i].dataType,
              chName: object[i].chName,
              enName: object[i].enName,
              dataScale: object[i].dataScale,
              abbrivation: object[i].abbrivation,
              notNull: object[i].notNull,
              description: object[i].description
            })
          } else {
            let children = []
            forEach(object[i], children)
            array.push({
              name: i,
              nodes: children
            })
          }
        }
      }
      const privateDomains = {
        name: '自定义标准',
        nodes: []
      }
      if (data && data.privateDomainRoot && data.privateDomainRoot.domains) {
        data && data.privateDomainRoot.domains.forEach(item => {
          privateDomains.nodes.push({
            id: item.id,
            name: item.chName,
            domainCode: item.domainCode,
            dataType: item.dataType,
            chName: item.chName,
            enName: item.enName,
            dataScale: item.dataScale,
            abbrivation: item.abbrivation,
            notNull: item.notNull,
            description: item.description
          })
        })
      }
      forEach(treeDataMap, treeData)
      treeData.push(privateDomains)
      this.$globalData.domainTreeData = treeData
      this.$bus.$emit('updateDomains')
    },
    getUserInfo () {
      const getUserInfoPromise = new Promise((resolve, reject) => {
        HTTP.getGatewayUserInfo()
          .then(data => {
            this.$store.state.user.username = data.username
            this.$store.state.user.fullName = data.fullname
            this.$store.state.user.userId = data.userid
            this.$store.state.user.name = data.username
            // // TODO 测试使用
            // this.$store.commit('setAdmin', true)

            if (data.roles.includes('ROLE_SUPERUSER_DDM')) {
              this.$store.commit('setAdmin', true)
            }
            if (data.roles.includes('ROLE_WEB_EDITOR')) {
              this.$store.state.user.isEditor = true
            }
            const roles = data.roles
            const auth = {}
            roles.forEach(item => {
              auth[item] = true
            })
            this.$store.commit('setRoles', roles)
            this.$store.commit('setAuth', auth)
            This.$user = this.$store.state.user
            This.$auth = auth
            this.authReady = true
            resolve()
            HTTP.getProcessConfig(data.username)
              .then(res => {
                resolve()
                // this.processHttpReady = true
              })
          })
          .catch(e => {
            this.$showFailure(e)
            reject(e)
          })
      })
      this.preDataPromise.push(getUserInfoPromise)
    },
    getAppEnableConfig () {
      this.$http.get(this.$gatewayUrl + 'server/configConnect')
        .then(res => {
          let data = res.data
          // data.dam = false
          This.$ddmConnectable = data.ddm
          This.$damEnabled = data.dam
          window.setting.damEnabled = This.$damEnabled
          this.$store.commit('setDamConnectable', data.dam)
          this.$store.commit('setDdmConnectable', data.ddm)
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    getAppList () {
      const getAppList = this.$http.get(this.$gatewayUrl + 'server/config')
      getAppList
        .then(res => {
          let data = res.data['DDM'] || []
          data = data.map(item => item.toUpperCase())
          this.$store.commit('setServerList', data)
          HTTP.$appList = data
          console.log(HTTP.$appList, 'HTTP.$appList')
        })
        .catch(e => {
          this.$showFailure(e)
        })
      this.preDataPromise.push(getAppList)
    },
    showLicenseNotify () {
      const h = this.$createElement
      this.$notify({
        title: '产品授权临期提醒',
        dangerouslyUseHTMLString: true,
        message: h('licenseNotify', {
          ref: 'licenseNotify',
          props: {
            license: this.expiredLicense
          }
        }),
        customClass: 'license-notify-right',
        duration: 0,
        type: 'warning',
        offset: 38
      })
    },
    getModelsTree () {
      // 废弃, 不要使用
      const getModelsPromise = new Promise((resolve, reject) => {
        HTTP.getModels({
          successCallback: (result) => {
            this.$store.state.modelsTree = result
            resolve()
          }
        })
      })
      // this.preDataPromise.push(getModelsPromise)
    },
    getCurrentPagePermissions () {
      // 检查当前页面是否有权限
      // 没有 router，延后校验
      if (!this.$route) return
      // 权限页面没有初始化完成，延后校验
      if (!this.$store.state.ddmPermission.initMenu) return
      this.$store.dispatch('ddmPermission/getRouterPermission', { to: this.$route })
        .then(result => {
          let { targetPath, message } = result
          if (message) {
            // 跳转到首页, 但取消报错
            // this.$showFailure(result.message)
          }
          if (targetPath && targetPath !== this.$route.path) {
            console.log(targetPath, 'targetPath')
            this.$router.push({
              path: targetPath
            })
          } else {
            if (this.$store.state.ddmPermission.initMenu) {
              this.ready = true
            }
          }
        })
        .catch(e => {
          console.log(e)
        })
    }
  },
  watch: {
    $route: {
      // immediate: true,
      // 页面权限校验
      handler: function (newVal, oldVal) {
        this.getCurrentPagePermissions()
      }
    },
    '$store.state.ddmPermission.initMenu' () {
      this.getCurrentPagePermissions()
    },
    '$store.state.damConnectable' () {
      // dam 启动，隐藏数据标准相关页面，需要重新校验页面权限
      this.getCurrentPagePermissions()
    }
  }
}
</script>
<style lang="scss" scoped>
#app {
  font-family: "Microsoft YaHei", "PingFang SC", serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

#nav {
  padding: 30px;
  a {
    font-weight: bold;
    color: #2c3e50;

    &.router-link-exact-active {
      color: #42b983;
    }
  }
}
#context-menu, #context-menu-dam {
  position:absolute;
  z-index:9999;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,.1);
}
.context-menu-style {
  line-height:30px;
  background-color:#f8f9fc;
  margin:0;
  padding: 0;
  i {
    margin-left:3px;
    cursor:pointer;
    margin-right:5px;
    &.fa {
      display:inline-block;
      width:17px;
      margin-right:1px;
    }
  }
  .hr {
    height: 1px;
    margin: 6px -4px;
    background-color: #e0e0e0;
  }
  .context-option {
    min-width: 80px;
    background: #FFF;
    padding-left: 1em;
    padding-right: 1em;
    color: #494850;

    &:hover {
      background: #d6d9e0;
      cursor: pointer;
    }
  }
}
</style>
