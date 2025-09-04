<template>
  <div class="page-heading">
    <img class="datablau-logo"  id="logo" src="../../assets/images/blue_logo.svg" alt="logo" style="cursor:pointer;" @click="goToIndex" />
    <Menu ref="menu"></Menu>
    <div class="right">
      <div
        class="search-outer" :class="{'show-search-input': showSearchInput}"
        v-if="$store.state.lic.quality && $store.state.lic.serverEnable"
        :style="{'max-width': windowWidth + 'px'}"
        @click="searchInputShow"
      >
        <div class="input-outer">
          <el-input
            :placeholder="$v.pageHead.placeholder"
            size="mini"
            v-model="keyword"
            @blur="searchInputBlur"
            @focus="searchInputFocus"
            @keyup.enter.native="skip2Search"
            @clear="focusInput"
            :clearable="true"
            v-show="showSearchInput"
            ref="searchInput"
            class="search-input"
          >
          </el-input>
          <i class="iconfont icon-search" style="color: #999;font-size: 16px;" v-show="!showSearchInput"></i>
        </div>
      </div>
      <!-- <datablau-switch
        active-text="ddm"
        inactive-text="dam"
        active-value="ddm"
        inactive-value="dam"
        v-model="checkProduct"
        style="
          display: inline-block;
          margin-right: 10px;
          position: relative;
          top: -5px;
        "
        @change="switchProduct"
      ></datablau-switch> -->
      <iframe :src="iframeSrc" style="display:none;"></iframe>
      <datablau-tooltip
        :content="$v.about.versionInfo" :hide-after="1000" effect="light"
        v-if="$store.state.lic.serverEnable"
      >
        <i class="iconfont icon-banben" style="color: #999;font-size: 16px;padding-right: 16px;cursor: pointer;"
           @click="showInfo"></i>
      </datablau-tooltip>
      <span class="downlod-ddm">
        <datablau-tooltip :content="$store.state.$v.header.downloadDDM" :hide-after="1000" effect="light">
          <span
            class="down-btn"
            @click="downloadDDM"
          >
            <i class="iconfont icon-download" style="color: #999;font-size: 16px;"></i>
          </span>
        </datablau-tooltip>
      </span>
      <task-info></task-info>
       <span class="downlod-ddm" style="margin-right: 8px">
        <datablau-tooltip content="跳转架构" :hide-after="1000" effect="light">
          <div class="sign-in-ddm-wrapper" style="width:87px !important;">
            <span class="down-btn" @click="switchProduct">&nbsp;跳转架构</span>
          </div>
        </datablau-tooltip>
      </span>
      <new-model></new-model>
      <span class="downlod-ddm" style="margin-right: 8px;" v-if="$store.state.lic.serverEnable">
        <datablau-tooltip :content="$v.pageHead.launch" :hide-after="1000" effect="light">
          <div class="sign-in-ddm-wrapper">
            <span class="down-btn" @click="signInDDM"><i class="iconfont icon-workbench" style="top: 0;"></i>&nbsp;{{ $v.pageHead.launch }}</span>
          </div>
        </datablau-tooltip>
      </span>
      <datablau-dropdown
        trigger="click"
        @command="handleCommand"
        style="display: inline-block;line-height: 34px;"
      >
        <!--<span class="el-dropdown-link">
          <i class="iconfont icon-schema"></i>
          <span class="text oneline-eclipse">{{ $store.state.user.username }}</span>
          <i class="el-icon-arrow-down el-icon&#45;&#45;right"></i>
        </span>-->
        <span class="el-dropdown-link">
          <div class="user">
            <div class="portrait">
              <i class="iconfont icon-schema"></i>
            </div>
            <datablau-tooltip :content="$store.state.user.fullName">
              <div class="name oneline-eclipse">
                {{ $store.state.user.fullName }}
              </div>
            </datablau-tooltip>
            <i class="el-icon-arrow-down"></i>
          </div>
        </span>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item command="token" v-if="!$isEng && $store.state.lic.serverEnable">
            {{ $v.pageHead.getDynamicPd }}
          </el-dropdown-item>
          <!--<el-dropdown-item command="changeProduct" v-if="gatewayEnable && damEnabled && otherProduct">-->
          <!--  切换产品-->
          <!--</el-dropdown-item>-->
          <el-dropdown-item command="logout">
            {{ $v.pageHead.logout }}
          </el-dropdown-item>
        </el-dropdown-menu>
      </datablau-dropdown>
    </div>
  </div>
</template>
<script>
import HTTP from '@/resource/http'
import Menu from '@/components/Menu'
import string from '@/resource/utils/string'
import newModel from '@/views/common/newModel.vue'
import taskInfo from './taskInfoVersion2.vue'
export default {
  components: { Menu, newModel, taskInfo },
  inject: ['refresh'], // 刷新 main
  data () {
    return {
      icon: {
        // version: this.$customSetting.enable ? require('./navIcon/version1.svg') : require('./navIcon/version.svg')
        version: require('./navIcon/version.svg')
      },
      showSearchInput: false,
      keyword: '',
      ifSearchInputFocus: false,
      // portraitSrc: require('./portrait/head.jpg'),
      imgName: require('../../../static/logo/logo.svg'),
      iframeSrc: null,
      damEnabled: window.setting.damEnabled !== 'false' && window.setting.damEnabled !== false,
      gatewayEnable: window.setting.gatewayEnable,
      otherProduct: false,
      innerWidth: window.innerWidth,
      checkProduct: 'ddm'
    }
  },
  computed: {
    customerId () {
      return this.$customerId || 'datablau'
    },
    windowWidth () {
      return (Math.max(this.innerWidth, 1280) - 1180)
    }
  },
  mounted () {
    window.onresize = () => {
      this.innerWidth = window.innerWidth
    }
    if (window.setting.servicesAlive) {
      this.otherProduct = window.setting.servicesAlive.ddd || window.setting.servicesAlive.dam
    } else {
      this.otherProduct = true
    }
    let route = this.$route
    this.handleCommandFromDam()
    if (route && route.name === 'searchResult') {
      let query = this.$route.query
      let keyword = _.trim(query.keyword)
      if (keyword) {
        this.searchInputShow()
        this.keyword = keyword
        setTimeout(() => {
          this.focusInput()
        }, 1000)
      }
    }
  },
  methods: {
    switchProduct () {
      const currentProduct = window.localStorage.getItem('currentProduct')
      console.log(process.env)
      let env = process.env.NODE_ENV
      if (env.toLowerCase().startsWith('dev')) {
        location.href = `${location.protocol}//${location.hostname}:8071/#/`
      } else if (env.toLowerCase().startsWith('prod')) {
        if (currentProduct === 'ddm') {
          window.localStorage.setItem('currentProduct', 'dam')
        }
        location.href = `${location.origin}/base-app/#/`
      }
    },
    handleCommandFromDam () {
      const query = _.cloneDeep(this.$route.query)
      const command = query.command
      delete query.command
      switch (command) {
        case 'dataModelingDownload':
          this.downloadDDM()
          break
        case 'dataModelingSetup':
          this.signInDDM()
          break
        case 'dataModelingMyModel':
        case 'dataModelingModelMap':
          this.$router.push({
            query: query
          })
          break
        default:
          break
      }
    },
    handleCommand (command) {
      if (command === 'logout') {
        HTTP.logout()
      } if (command === 'changeProduct') {
        HTTP.changeProduct()
      } else if (command === 'version') {
        this.showInfo()
      } else if (command === 'update') {
        this.$router.push('update').catch(e => {
          this.$message.info(this.$v.pageHead.tip_1)
        })
      } else if (command === 'token') {
        HTTP.getWebToken({
          successCallback: (token) => {
            if (token) {
              console.log(token)
              const h = this.$createElement
              this.$msgbox({
                title: this.$v.pageHead.dynamicPd,
                showCancelButton: true,
                cancelButtonText: this.$v.pageHead.comfirm,
                confirmButtonText: this.$v.pageHead.copy,
                message: h('textarea', {
                  attrs: {
                    'readonly': 'readonly'
                  },
                  style: {
                    width: '350px',
                    height: '80px',
                    resize: 'none'
                  }
                }, token),
                closeOnClickModal: false
              }).then(() => {
                string.setClipBoard(token)
                this.$message.success(this.$v.pageHead.copySuccsee)
              }).catch(() => {

              })
            }
          }
        })
      } else if (command === 'user') {
        this.$router.push({ name: 'userModal' })
      }
    },
    showInfo () {
      this.$bus.$emit('showVersionMessage')
    },
    goToIndex () {
      this.$refs.menu.goTo('userPane')
      // this.$router.push({ name: 'dashboard' })
    },
    searchInputShow () {
      this.showSearchInput = true
      this.$nextTick(() => {
        this.$refs.searchInput.focus()
      })
    },
    searchInputHide () {
      // let keyword = _.trim(this.keyword)
      // if (!keyword && !this.ifSearchInputFocus) {
      //   this.showSearchInput = true
      // }
      this.showSearchInput = this.ifSearchInputFocus
    },
    searchInputFocus () {
      this.ifSearchInputFocus = true
    },
    searchInputBlur () {
      this.ifSearchInputFocus = false
      this.searchInputHide()
    },
    skip2Search () {
      let keyword = _.trim(this.keyword)
      let query = this.$route.query || {}
      let queryKeyword = _.trim(query.keyword || '')
      if (queryKeyword !== keyword) {
        this.$router.push({
          name: 'searchResult',
          query: {
            keyword: keyword
          }
        })
      }
    },
    focusInput (para) {
      if (this.$refs.searchInput) {
        this.$refs.searchInput.focus()
      }
    },
    downloadDDM () {
      let webPath = window.setting.products.ddm.webPath || '/'
      // let url = this.$url + '/static/download/DDMSetup.zip'
      let url = window.lang === 'English' ? 'https://datablau.com/download/ddm/enterprise/DDMClientSetup.msi' : `${webPath}static/download/DDMSetup.zip`
      // this.$downloadFile(url);
      window.open(url)
    },
    signInDDM () {
      let p1 = this.$http.get(this.$url + '/service/configs/')
      let p2 = this.$http.get(this.$url + `/service/main/login/web/token`)
      Promise.all([p1, p2]).then(res => {
        let config = res[0]?.data || []
        let hostname = ''
        let port = ''
        let UseHttps = ''
        config.forEach(item => {
          if (item.propertyName === 'configurable.server.https') {
            if (item.propertyValue !== '') {
              UseHttps = item.propertyValue === true || item.propertyValue === 'true'
            } else {
              UseHttps = window.location.protocol !== 'http:'
            }
          } else if (item.propertyName === 'configurable.server.ip') {
            hostname = item.propertyValue || location.hostname
          } else if (item.propertyName === 'configurable.server.port') {
            port = item.propertyValue || ''
          }
        })
        let defaultPort = UseHttps ? 443 : 80
        port = port || location.port || defaultPort

        const json = {
          Host: hostname,
          Port: port,
          App: 'ddm',
          WebLoginToken: res[1].data,
          UseHttps: UseHttps
        }
        const s = JSON.stringify(json)
        this.iframeSrc = 'ddm:' + `${btoa(JSON.stringify(json))}`
        this.$message({
          message: `正在尝试启动DDM客户端。如未看到启动界面，请检查DDM客户端是否已被正确的安装和配置`,
          type: 'warning',
          duration: 8000,
          showClose: true
        })
        setTimeout(() => {
          this.iframeSrc = ''
        }, 100)
      }).catch(e => {
        this.$showFailure(e)
      })
    }
  }

}
</script>
<style scoped lang="scss">
@import '~@/next/components/basic/color.sass';
.user {
  display: inline-block;
  width: 126px;
  height: 30px;
  margin-top: 2px;
  margin-left: 12px;
  line-height: 30px;
  vertical-align: top;
  cursor: pointer;
  background-color: $grey-6;
  border-radius: 15px;
}
.portrait {
  position: relative;
  top: -1px;
  display: inline-block;
  width: 21px;
  height: 21px;
  margin-left: 15px;
  line-height: 20px;
  color: $primary-color;
  text-align: center;
  vertical-align: middle;
  border: 1px solid $primary-color;
  border-radius: 10px;
  margin-right: 0;
}
.name {
  position: relative;
  top: -1px;
  display: inline-block;
  width: 48px;
  margin-right: 8px;
  margin-left: 10px;
  color: $text-default;
  font-size: 12px;
  vertical-align: middle;
}
.downlod-ddm {
  cursor: pointer;
}
.sign-in-ddm-wrapper {
  display: inline-block;
  width: 132px;
  height: 32px;
  background: linear-gradient(138deg, #6ECBFF 0%, #4072FF 100%);
  border-radius: 16px;
  color: #fff;
  font-size: 12px;
  cursor: pointer;
  line-height: 32px;
  padding-left: 10px;
  &:hover {
    background: linear-gradient(121deg, #64ADFF 0%, #2052EF 100%);
  }
}
.el-dropdown {
  display: inline-block;
  height: 32px;
  background: rgba(140,160,200,0.2);
  border-radius: 16px;
  padding: 0 10px;
  line-height: 32px;
  vertical-align: middle
}
  @import './pageHeading.scss';
</style>

<style lang="scss">
.show-search-input {
  .search-input {
    input.el-input__inner:focus {
      outline: none;
      border-color: #DCDFE6;
    }
  }
}
</style>
