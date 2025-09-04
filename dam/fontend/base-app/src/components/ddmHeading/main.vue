<template>
  <div v-loading="loading">
    <el-container v-if="!loading">
      <el-header height="50px" v-if="!isInIframe">
        <page-heading></page-heading>
      </el-header>
      <left-menu
        class="left-menu"
        :class="{ hide: hideLeft, shrink: shrink }"
        v-if="!isInIframe"
      ></left-menu>
      <el-main
        :class="{
          full: hideLeft,
          shrink: shrink,
          'grey-bac': $route.path === '/main/report',
          'iframe-full': isInIframe,
        }"
      >
        <div
          class="ddm-main-container"
          id="ddm-main-content"
          :class="{ ext: shrink }"
        >
          <router-view v-if="alive" />
        </div>
      </el-main>
    </el-container>
  </div>
</template>

<script>
import PageHeading from './pageHeading.vue'
import LeftMenu from './leftMenu.vue'
import HTTP from '@/http/main'

require('@/assets/styles/base.css')
require('@/assets/styles/base.scss')
require('@/assets/styles/table.scss')
require('@/assets/styles/page.scss')
require('@/assets/styles/list.scss')

export default {
  components: {
    PageHeading,
    LeftMenu,
  },
  provide() {
    return {
      refresh: this.refresh,
      headerProduction: HTTP.$appName === 'DDD' ? 'ddd' : 'ddm',
    }
  },
  beforeCreate() {
    if (HTTP.$appName === 'DAM') {
      HTTP.$appName = 'DDM'
    }
  },
  created() {
    console.log(HTTP.$appName, 'HTTP.$appName')
    // 数据标准模块, 当有 dam 页面时, ddm 页面只能查看
    this.$resetDomainAuth(HTTP.$appName)
    // if (!this.$ddmFirst) {
    //   this.$router.push({
    //     name: 'dataCatalogDashboard',
    //   })
    // }
    this.getDdmUserInfo = HTTP.getGatewayUserInfo()
    // this.getDomainWorkflowStatus = HTTP.getDomainWorkflowStatus()

    this.dataInit()
      .then(res => {
        this.loading = false
      })
      .catch(e => {
        console.log(e)
      })
  },
  mounted() {
    window.localStorage.setItem('currentProduct', 'ddm')
    this.$bus.$on('left-menu-display', display => {
      // this.hideLeft = !display
    })
    this.$bus.$on('left-menu-shrink', show => {
      this.shrink = show
    })

    this.$bus.$on('dialog-visible-change', visible => {
      // this.shrink = show
      this.iframePostMessage({ dialogVisible: !!visible })
    })

    this.$bus.$on('iframe-logout', show => {
      this.iframePostMessage({ iframeLogout: true })
    })
    this.isInIframe = window.top !== window

    // this.iframePostMessage({ ready: true })
    window.addEventListener('message', this.handleEvent, false)

    this.$nextTick(() => {
      this.iframePostMessage({ ready: true })
    })

    document.addEventListener('mouseup', e => {
      this.iframePostMessage({ clearPopover: true })
    })
  },
  beforeDestroy() {
    this.$bus.$off('left-menu-display')
    this.$bus.$off('left-menu-shrink')
    this.$bus.$off('dialog-visible-change')
    this.$bus.$off('iframe-logout')
    window.removeEventListener('message', this.handleEvent, false)
  },
  data() {
    return {
      hideLeft: false,
      shrink: false,
      alive: true,
      // 部分数据需要加载完成才开始渲染页面
      loading: true,
      getDdmUserInfo: null,
      getDomainWorkflowStatus: null,
      isInIframe: false,
    }
  },
  methods: {
    handleEvent(e) {
      // console.log('e.origin: ', e.origin) // 父页面URL，这里是http://a.index.com
      // console.log(e.source) // 父页面window对象，全等于window.parent/window.top
      // console.log(e.data) // 父页面发送的消息
      // <!-- 对消息来源origin做一下过滤，避免接收到非法域名的消息导致的xss攻击 -->
      if (HTTP.$ddmWebOrigin.includes(e.origin)) {
        if (e.data) {
          try {
            // 将传入数据转成 JSON
            let data = JSON.parse(e.data)
            if (data.appName) {
              HTTP.$appName = data.appName
              this.$resetDomainAuth(HTTP.$appName)
            }

            // 如果有 路由, 切换页面
            if (data.name) {
              let obj = { name: data.name }
              if (data.query) {
                obj.query = data.query
              }
              this.$router.replace(obj)
            }

            // 调整 iframe 内 main 组件位置
            let position = data.position
            if (position) {
              // if (position.top || position.top === 0) {
              //   $('.iframe-full').css('top', position.top)
              // }
              if (position.left || position.left === 0) {
                // $('.iframe-full').css('left', position.left)
              }
            }

            if (data.dialogMaskClick) {
              $('.el-dialog__wrapper').click()
            }
          } catch (e) {
            console.log(e)
          }
        }
      }
    },
    refresh() {
      this.alive = false
      this.$nextTick(() => {
        this.alive = true
      })
    },
    async dataInit() {
      if (!this.$workflowStatus) {
        this.prototype.$workflowStatus = {}
      }
      this.$workflowStatus.workflow_enable = true
      this.$workflowStatus.workflow_domain_enable = true
      try {
        // try {
        //   let res = await this.getDomainWorkflowStatus
        //   let workflowStatus = res.data
        //   if (workflowStatus === 'true') {
        //     if (!this.$workflowStatus) {
        //       this.prototype.$workflowStatus = {}
        //     }
        //     this.$workflowStatus.workflow_enable = true
        //     this.$workflowStatus.workflow_domain_enable = true
        //   } else {
        //     this.$workflowStatus.workflow_domain_enable = false
        //   }
        // } catch (e) {
        //   console.log(e)
        // }

        const userInfo = await this.getDdmUserInfo
        let roles = userInfo.data.roles
        if (roles.includes('ROLE_SUPERUSER_DDM')) {
          this.$isDdmAdmin = true
        }
        // // TODO 测试使用
        // this.$isDdmAdmin = true
        const auth = {}
        roles.forEach(item => {
          auth[item] = true
        })
        this.$store.commit('setRoles', roles)
        this.$store.commit('setAuth', auth)
      } catch (e) {
        this.$showFailure(e)
      }
    },
    iframePostMessage(obj = {}) {
      obj.app = 'base-app'
      window.parent.postMessage(JSON.stringify(obj), HTTP.$ddmWebOrigin)
    },
  },
}
</script>

<style scoped lang="scss">
.el-header {
  /* background: #303133; */
  /*background-color: var(--banner-bgcolor);*/
  /*background-color: #455c7c;*/
  background: #283764;
  line-height: 50px;
}

.el-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  min-width: 1000px;
}

.el-main {
  position: absolute;
  left: 160px;
  top: 50px;
  bottom: 0;
  right: 0;
  border-top: 1px solid #e3e3e3;

  &.shrink {
    left: 60px;
  }

  &.full {
    left: 0;
  }

  &.iframe-full {
    // top: 50px;
    // left: 160px;
    top: 0;
    //left: 0;
    left: 0;
  }
}

.el-main.grey-bac {
  background-color: #f6f6f6;
}

.ddm-main-container {
  //border: 1px solid red;
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  min-width: 240px;
  overflow: hidden;
}

.left-menu {
  position: absolute;
  left: 0;
  bottom: 0;
  top: 50px;
  width: 160px;
  background: #fff;
  border-right: 1px solid #efefef;

  &.shrink {
    width: 60px;
  }

  &.hide {
    width: 0;
    display: none;
  }
}
</style>
