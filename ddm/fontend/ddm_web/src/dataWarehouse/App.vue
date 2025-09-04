<template>
  <div v-if="ready">
    <db-root
        :env="env"
        @update-route="updateRoute"
        @get-global-message="getGlobalMessage"
      >
        <router-view v-if="isServerReady"></router-view>
    </db-root>
    <staff-select v-if="$store.state.showStaffSelect"></staff-select>
    <branch-select v-if="$store.state.showBranchSelect"></branch-select>
    <version-message></version-message>
    <div id="context-menu" v-show="showContext" :class="$route.path.indexOf('sql_editor') !== -1 ? 'black-themeContext-menu': 'white-theme'">
      <ul class="context-menu-style">
        <li class="context-option" v-for="o in contextOptions" :key="o.label" @click="menuClick(o)" :class="{'clickShow': o.childList,'context-option-line':o.line}">
          <i v-if="o.icon" class="icon" :class="o.icon"></i>
          <span v-if="o.label" class="label" :class="{'clickShow': o.childList}">{{ o.label }}</span>
          <span v-if="o.line"></span>
          <ul v-if="o.childShow" class="childList">
            <li class="context-option" v-for="(v, index) in o.childList" :key="'v' + index" @click="v.callback()">
              <database-type v-if="v.type" style="display: inline-block" :size="16"
                             :value="'tree-' + v.type" :hide-label="false"
                             :label="v.name || v.type"
              >
              </database-type>
              <span class="label">{{ v.label }}</span>
            </li>
          </ul>
        </li>
      </ul>
    </div>
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
  </div>
</template>
<script>
import VersionMessage from '@/components/common/about.vue'
import ComRate from '@/components/common/rate.vue'
import $ from 'jquery'
import staffSelect from '@/components/common/staffSelect/staffSelect'
import HTTP from '@/resource/http'
import _ from 'lodash'
import databaseType from '@/components/common/DatabaseType.vue'
import branchSelect from '@/dataWarehouse/views/dataIndex/damComponents/branchSelect/branchSelect.vue'
import Vue from 'vue'

const This = Vue.prototype
export default {
  components: {
    VersionMessage,
    ComRate,
    staffSelect,
    databaseType,
    branchSelect
  },
  beforeMount () {
    // 全局变量, 用于区分 开发环境与 生产环境
    // VUE_APP 开头的数据才会加入到 vue 应用中, 在 vue 组件内使用
    // console.info('RUN_ENV: ', RUN_ENV)
    // console.info('process.env.GLOBAL_DATA: ', process.env.GLOBAL_DATA)
    // console.info('process.env.VUE_APP_GLOBAL_DATA: ', process.env.VUE_APP_GLOBAL_DATA)
    console.warn('build time: ', moment(BUILD_TIME).format('YYYY-MM-DD HH:mm:ss'))
    this.env = RUN_ENV === 'dev' ? 'dev' : 'prod'
  },
  data () {
    return {
      showContext: false,
      'showContextDam': false,
      contextOptions: [],
      // processHttpReady: false,
      customClassName: '',
      preDataPromise: [],
      ready: false,
      env: '',
      isServerReady: false
    }
  },
  computed: {
    isThemeBlack () {
      return (localStorage.getItem('editorTheme') || window.setting.editorTheme) === 'black'
    }
  },
  mounted () {
    this.createContextMenu()
    this.getModelCategories()
    setTimeout(() => {
      this.getDomainCodes()
    }, 500)
    this.getModelsTree()
    this.getUserInfo()
    this.$store.dispatch('getPhases')

    Promise.all(this.preDataPromise)
      .then(res => {
        setTimeout(() => {
          this.ready = true
          this.$store.state.lic.ready = true
        }, 100)
      })
      .catch(e => {
        this.$showFailure(e)
      })
  },
  beforeDestroy () {
    this.$bus.$off('callContextMenu')
  },
  methods: {
    getModelCategories () {
      this.$http.post(`${HTTP.$damBase}modelCategory/getModelCategories`)
        .then(res => {
          res.data.forEach(item => {
            this.$modelCategoriesMap[item.categoryId] =
                        item.categoryName + '(' + item.categoryAbbreviation + ')'
          })
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    menuClick (o) {
      o.callback && o.callback(o.args)
      !o.callback && this.$set(o, 'childShow', true)
    },
    getAbout () {
      const aboutPromise = this.$http.get(this.$url + '/service/utils/about')
      this.preDataPromise.push(aboutPromise)
      aboutPromise.then((res) => {
        const store = this.$store
        let data = res.data
        if ((data.web.parsedRv & 16) === 16) {
          store.commit('setEREdit', true)
          store.state.lic.editor = true
        }
        if ((data.web.parsedRv & 256) === 256) {
          store.state.lic.quality = true
        }
        if ((data.web.parsedRv & 4096) === 4096) {
          store.state.lic.domain = true
        }
        if ((data.web.parsedRv & 65536) === 65536) {
          store.state.lic.archy = true
        }
        store.state.lic.ready = true
        // store.state.licServerEmbedded = data.licServerEmbedded
      }).catch((e) => {
        console.log(e)
      })
    },
    getDomainCodes () {
      HTTP.getDomainCodes({
        successCallback: data => {
          this.handleCodesList(data.publicCodes)
          this.handlePrivateCodesList(data.privateCodes)
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
        HTTP.getUserInfo()
          .then(data => {
            const fullName = _.toString(data.details.firstname) + _.toString(data.details.lastname)
            if (fullName) {
              this.$store.state.user.username = fullName
            } else {
              this.$store.state.user.username = data.username
            }
            this.$store.state.user.userId = data.details.userId
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
    getModelsTree () {
      const getModelsPromise = new Promise((resolve, reject) => {
        HTTP.getModels({
          successCallback: (result) => {
            this.$store.state.modelsTree = result
            resolve()
          }
        })
      })
      this.preDataPromise.push(getModelsPromise)
    },
    updateRoute (router) {
      console.log(router, '---router')
      if (router.name === 'missionCenter') {
        let url = location.protocol + '//' + location.host + '/ds-app/home?them=da'
        window.open(url)
        return
      }
      this.$router.push(router)
    },
    getGlobalMessage (promises) {
      const This = Vue.prototype
      promises.getEnableList().then((res) => {
        This.$enableList = res
        this.isServerReady = true
      })
      promises.getAllServersOfCurrentProduct().then((res) => {
        this.$store.commit('setServerList', res)
        This.$appList = res
      })
      promises.getLicenseDetail().then(data => {
        console.log(data, 'data')
        let expiredLicense = []
        let featureInfos = data?.licenseInfo?.featureInfos || []
        let featureMap = {}
        featureInfos.forEach(item => {
          featureMap[item.featureCode] = item.status === 'NORMAL' || item.status === 'WILL_EXPIRE'
          // featureMap[item.featureCode] = false
          if (item.status === 'WILL_EXPIRE') {
            // if (item.status === 'NORMAL') {
            expiredLicense.push(item)
          }
        })
        // this.expiredLicense = expiredLicense
        // if (expiredLicense.length > 0) {
        //   this.showLicenseNotify()
        // }
        const store = this.$store
        if (featureMap['FE_DDM_WEB']) {
          store.commit('setEREdit', true)
          store.state.lic.editor = true
          this.hasFeature = true
        }
        if (featureMap['FE_DDM_WEB_DISPLAY']) {
          store.state.lic.quality = true
          this.hasFeature = true
        }
        if (featureMap['FE_DDM']) {
          store.state.lic.serverEnable = true
          store.state.licServerEmbedded = true // 两个变量相同
          this.hasFeature = true
        }
        if (featureMap['FE_DOMAIN']) {
          store.state.lic.domain = true
          this.hasFeature = true
        }
        if (featureMap['FE_DDM_ARCH']) {
          store.state.lic.archy = true
          this.hasFeature = true
        }
        store.state.lic.ready = true
        store.state.lic.noActiveLic = !this.hasFeature
      })
      // promises.getAllRolesOfCurrentProduct().then(_ => {
      //   console.log(_)
      // })
      // promises.getUserInfo().then(_ => {
      //   console.log(_)
      // })
    },
    createContextMenu () {
      $(window).on('mouseup', (e) => {
        if (!$(e.target).hasClass('clickShow')) {
          this.showContext = false
          this['showContextDam'] = false
        }
      })
      this.$bus.$on('closeContextMenu', () => {
        this.showContext = false
        this['showContextDam'] = false
      })
      this.$bus.$on('callContextMenu', ({ x, y, options, placement = 'right' }) => {
        let dom = $('#context-menu')
        switch (placement) {
          case 'right':
            dom.css({
              top: y + 1 + 'px',
              left: x + 1 + 'px'
            })
            break
          case 'left':
          case 'bottom-left':
            dom.css({
              top: y + 10 + 'px',
              left: x - 80 + 'px'
            })
            break
        }
        this.contextOptions = options
        this.showContext = true
      })
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
    .context-option {
      min-width:9em;
      background:#F8F9FC;
      padding-left:1em;
      padding-right:1em;
      color:#494850;
      &:hover {
        background:#d6d9e0;
        cursor:pointer;
      }
      &.context-option-line{
        height: 1px !important;
        background: #EFEFEF;
      }
    }
  }
  #context-menu .clickShow{
    position: relative;
    .childList{
      position: absolute;
      left: 100%;
      top: 0;
      border: 1px solid #646464;
      border-left: 0;
      height: 150px;
      overflow: auto;
      width: 204px;
      li:hover{
        background: #3C3F41;
      }
    }
  }

  .context-menu-style {
    /* 槽 */
    ::-webkit-scrollbar-track {
      -webkit-box-shadow: none;
      width: 16px;
      border-radius: 0;
      background: #2B2B2B;
      /*滚动条有底色 #4e5152;*/
      &:hover {
        background: #2B2B2B;
      }
    }
    /* 滑块 */
    ::-webkit-scrollbar-thumb {
      background-color:#666666;
      -webkit-border-radius: 10px;
      border-radius: 10px;
      border: 4px solid transparent;
      background-clip: content-box;
      /*&:hover {
        background: rgb(79,79,79);
      }*/

    }
    ::-webkit-scrollbar {
      width: 16px;
      height:8px;
    }
  }
  #context-menu.black-theme .context-menu-style .context-option:hover{
    background: #555455;
    cursor:pointer;
  }
  .black-themeContext-menu{
    background-color:  #2A2A2A !important;
    border: 1px solid #333333 !important;
    box-shadow: 0px 2px 8px 0px rgba(0,0,0,0.2);
    border-radius: 2px !important;
    // overflow: hidden;
    .context-menu-style{
      background-color:  #2A2A2A !important;
      border-radius: 2px;
      .context-option{
        background:  #2A2A2A !important;
        padding-left: 16px !important;
        padding-right: 16px !important;
        .label{
          color: #BBBBBB !important;
        }
        &:hover{
          background:  rgba(24, 127, 255, .2) !important;
        }
      }
    }
    .clickShow .childList{
      width: 230px !important;
      background: #2A2A2A !important;
      border: 1px solid #333333 !important;
      .context-option{
        color: #bbbbbb !important;
      }
    }
  }
</style>
