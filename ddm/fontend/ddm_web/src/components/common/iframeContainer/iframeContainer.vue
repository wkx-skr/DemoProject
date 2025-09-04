<template>
  <div class="iframe-container" v-loading="!iframeReady">
    <iframe
        id="nestedIframe"
        ref="nestedIframe"
        :src="iframeBaseUrl"
        v-if="iframeBaseUrl"
        frameborder="0"
        width="100%"
        height="100%"
        v-show="iframeReady"
    ></iframe>
  </div>
</template>

<script>
import HTTP from '@/resource/http.js'

export default {
  name: 'iframeContainer',
  data() {
    return {
      iframeBaseUrl: '',
      iframeReady: false,
      ddmDefaultEmptyPage: 'ddmDefaultEmptyPage',
      newPosition: false,
      currentRoute: {
        name: 'ddmDefaultEmptyPage',
        query: null
      },
      // 非 dam 默认业务页面, 也需要嵌套时使用, 例如个人工作台
      passRouteArr: ['userModal'],
      iframeMainPosition: {
        left: '160px',
        top: '50px'
      }
    }
  },
  components: {},
  computed: {},
  props: {
    app: {
      required: true,
      type: String
    }
  },
  mounted() {
    this.dataInit();
    if (window.NODE_APP!== 'ddd') {
      this.$bus.$on('left-menu-display', display => {
        this.positionChange()
      })
    }
    this.$bus.$on('left-menu-shrink', show => {
      this.positionChange()
    })
    window.addEventListener('message',this.handleMessage)
    this.$on('hook:beforeDestory',()=>{
        window.removeEventListener('message',this.handleMessage)
    })
  },
  beforeDestroy() {
    if (window.NODE_APP!== 'ddd') {
      this.$bus.$off('left-menu-display')
    }
    this.$bus.$off('left-menu-shrink')
  },
  methods: {
    handleMessage(event){
      const { data } = event
      let eventdata = {}
      try {
        eventdata = JSON.parse(event.data)
      } catch (e) {
        // console.log(e)
      }
      if(event.data.type === 'emptyRoute') {
        this.$router.push({
          query: {
          },
        })
      }
      if (eventdata.type === 'goToMeta') {
        this.$emit('goToMeta', eventdata.metaModelId)
      }
    },
    dataInit() {
      this.iframeBaseUrl = `${HTTP.getDamLoginUrl(this.app)}#/ddm/main/ddmDefaultEmptyPage?ddmFirst=true`
      window.addEventListener('message', e => {
        // console.log('e.origin ', e.origin) //子页面URL，这里是http://b.index.com
        // console.log(e.source) // 子页面window对象，全等于iframe.contentWindow
        // console.log(e.data) //子页面发送的消息
        // <!-- 对消息来源origin做一下过滤，避免接收到非法域名的消息导致的xss攻击 -->
        if (HTTP.getDamLoginUrl(this.app).includes(e.origin)) {
          let data = e.data
          if (e.data) {
            try {
              let data = JSON.parse(e.data)
              if (this.app !== data.app) return; // 不同应用，直接忽略
              if (data.type === 'databaseManagement') {
                this.$router.push(`/main/databaseManagement`)
              }
              if (data.ready) {
                // iframe 页面加载完成, 对当前路由进行初始化, 并初始化 iframe 位置
                if (!this.iframeReady) {
                  this.iframeReady = true
                  this.iframePostMessage(this.currentRoute)

                  this.positionChange()
                }
              }
              // console.log('iframe data: ', data)
              // iframe 显示弹框时, 外层页面显示 遮罩
              if (data.dialogVisible || data.dialogVisible === false) {
                this.$bus.$emit('iframe-dialog-visible-change', data.dialogVisible)
                $('.iframe-container-outer').css('zIndex', data.dialogVisible ? 4 : 1)
              }

              if (data.iframePush) {
                this.$router.push(data.iframePush)
              }

              if (data.iframeLogout) {
                // dam 登出
                HTTP.logout()
              }

              if (data.clearPopover) {
                this.clearPopover()
              }
            } catch (e) {
              console.log(e)
            }
          }
        }
      }, false)
    },
    iframePostMessage(message) {
      if (this.newPosition) {
        message = _.cloneDeep(message)
        message.position = this.iframeMainPosition
        this.newPosition = false
      }
      message.appName = window.NODE_APP.toLowerCase() === 'ddd' ? 'DDD' : 'DDM'

      if (!this.iframeReady) return
      if (typeof message === 'object') {
        message = JSON.stringify(message)
      }
      const nestedIframe = this.$refs.nestedIframe
      // console.log(HTTP.getDamLoginUrl(this.app, true), message)
      nestedIframe && nestedIframe.contentWindow && nestedIframe.contentWindow.postMessage(message, HTTP.getDamLoginUrl(this.app, true));
      // nestedIframe.contentWindow.postMessage(message);
    },
    positionChange() {
      setTimeout(() => {
        this.newPosition = true
        let $main = $('.el-main.base-main')
        let left = $main.css('left')
        let top = $main.css('top')
        if (this.passRouteArr.includes(this.$route.name)) {
          left = 0
        }
        this.iframeMainPosition = {
          left,
          // top
        }
        // $('.iframe-container').css({left: `-${left}`, top: `-${top}`})
        // $('.iframe-container').css({left: `-${left}`})
        this.iframePostMessage({})
      }, 10)

    },
    clearPopover() {
      document.dispatchEvent(new MouseEvent('mousedown', {bubbles: true, cancelable: true}));
      document.dispatchEvent(new MouseEvent('mouseup', {bubbles: true, cancelable: true}));
    },
    dialogMaskClick() {
      this.iframePostMessage({dialogMaskClick: true})
    },
  },
  watch: {
    '$route': {
      immediate: true,
      handler: function (newVal) {
        if (window.NODE_APP.toLowerCase() === 'ddd'){
          this.positionChange()
        }
        if(this.$route.path.indexOf('ddd') !== -1) {
          this.dataInit()
        }
        if(this.$route.meta.app === this.app) {
          if ((newVal.meta && newVal.meta.keepAlive) || this.passRouteArr.includes(newVal.name)) {
            let routerName = newVal.name
            // 个人工作台 页面, 特殊处理, 增加 Ddm
            if (routerName === 'userModal') {
              routerName = 'userModalDdm'
              this.iframePostMessage({name: this.ddmDefaultEmptyPage})
            }
            this.currentRoute.name = routerName
            if (routerName === 'myTodo') {
              this.currentRoute.name = 'myTodoDdm'
            }
            if (routerName === 'myDone') {
              this.currentRoute.name = 'myDoneDdm'
            }
            if (routerName === 'myApply') {
              this.currentRoute.name = 'myApplyDdm'
            }
            routerName = this.currentRoute.name
            this.currentRoute.query = newVal.query
            this.iframePostMessage({name: routerName, query: newVal.query})
          } else {
            if (newVal.name ==='processManagement') {
              if (newVal.query.type === 'processCenter') {
                this.currentRoute.name = 'processCenterDdm'
                this.currentRoute.query = null
                this.iframePostMessage({name: 'processCenterDdm',query: {}})
              } else if (newVal.query.type === 'allApply'){
                this.currentRoute.name = 'allApplyDdm'
                this.currentRoute.query = null
                this.iframePostMessage({name: 'allApplyDdm',query: {}})
              } else if (newVal.query.type === 'monitor'){
                this.currentRoute.name = 'monitorDdm'
                this.currentRoute.query = null
                this.iframePostMessage({name: 'monitorDdm',query: {}})
              }
            } else if(newVal.name ==='databaseManagement') {
              if (newVal.query.type === 'dataSourceDdm') {
                this.iframePostMessage({name: this.ddmDefaultEmptyPage})
              } else
              if (newVal.query.type === 'modelCategoryDdm'){
                this.currentRoute.name = 'modelCategoryDdm'
                this.currentRoute.query = null
                this.iframePostMessage({name: 'modelCategoryDdm',query: {}})
              } else if (newVal.query.type === 'dataCatalogDdm'){
                if (newVal.query.metaModelId) {
                  this.currentRoute.name = 'dataCatalogDdm'
                  this.currentRoute.query = this.$route.query.metaModelId
                  this.iframePostMessage({name: 'dataCatalogDdm',query: {'metaModelId':this.$route.query.metaModelId}})
                } else {
                  this.currentRoute.name = 'dataCatalogDdm'
                  this.currentRoute.query = null
                  this.iframePostMessage({name: 'dataCatalogDdm',query: {}})
                }
              }
            } else if (newVal.name ==='userManagement') {
              if (newVal.query.type === 'userDdm') {
                this.currentRoute.name = 'userDdm'
                this.currentRoute.query = null
                this.iframePostMessage({name: 'userDdm', query: {}})
              } else if (newVal.query.type === 'organizationManageDdm') {
                this.currentRoute.name = 'organizationManageDdm'
                this.currentRoute.query = null
                this.iframePostMessage({name: 'organizationManageDdm', query: {}})
              } else if (newVal.query.type === 'groupDdm') {
                this.currentRoute.name = 'groupDdm'
                this.currentRoute.query = null
                this.iframePostMessage({name: 'groupDdm', query: {}})
              }
            } else if (newVal.name === 'dataCatalogDdm') {
              this.currentRoute.name = 'dataCatalogDdm'
              this.currentRoute.query = null
              this.iframePostMessage({name: 'dataCatalogDdm', query: {}})
            } else {
              this.iframePostMessage({name: this.ddmDefaultEmptyPage})
            }
          }
        } else {
          this.iframePostMessage({name: this.ddmDefaultEmptyPage})
        }
      }
    }
  },
}
</script>

<style lang="scss" scoped>
.iframe-container, #nestedIframe {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  top: 0;
  //border: 1px solid red;
}

.iframe-container {
  left: 0;
  //top: -50px;
  top: 0;
}

</style>
