<template>
  <div class="iframe-container" v-loading="!iframeReady" ref="frameBox">
    <iframe
        id="dsWorkflowIframe"
        ref="dsWorkflowIframe"
        :src="iframeBaseUrl"
        v-if="iframeBaseUrl"
        frameborder="0"
        width="100%"
        height="100%"
        v-show="iframeReady"
    ></iframe>
    <div class="dropMask" ref="dropMask"></div>
  </div>
</template>

<script>
import HTTP from '@/dataWarehouse/resource/http.js'

export default {
  name: 'dsIframeContainer',
  data () {
    return {
      iframeBaseUrl: '',
      iframeReady: true,
      evnData: null,
      codeId: null,
      projectCode: '',
      dropEle: null
      // ddmDefaultEmptyPage: 'ddmDefaultEmptyPage',
      // newPosition: false,
      // currentRoute: {
      //   name: 'ddmDefaultEmptyPage',
      //   query: null
      // },
      // iframeMainPosition: {
      //   left: '160px',
      //   top: '50px'
      // }
    }
  },
  props: {
    projectId: {
      type: [String, Number],
      required: true
    },
    pageType: {
      type: String,
      default: 'workflowDefinition'
    },
    isThemeBlack: {
      type: Boolean,
      default: true
    },
    branchName: {
      type: String,
      default: 'master'
    },
    refreshWork: {
      type: Boolean,
      default: false
    },
    workflowCode: {
      type: [String, Number]
    },
    createDefinition: {
      type: Boolean
    }
  },
  components: {},
  computed: {},
  mounted () {
    this.$bus.$on('toggleTheme', (isDark) => {
      this.iframePostMessage({ theme: isDark ? 'dark' : 'light' })
    })
    this.dataInit()
    // 接受iframe的参数
    window.addEventListener('message', this.handleIncomingMessage, false)
  },
  beforeDestroy () {
    this.$bus.$off('toggleTheme')
  },
  methods: {
    triggerMethod (obj) {
      let { node, ev } = obj
      this.iframePostMessage({ theme: 'dark',
        creatSqlTask: {
          name: node.data.name,
          id: node.data.id,
          type: node.data.type,
          codeDetailId: node.data.codeDetailId || '',
          ev
        } })
    },
    handleIncomingMessage (e) {
      if (e.data.dropEle) {
        this.dropEle = e.data.dropEle
        this.$emit('getDropEle', this.dropEle)
        return
      }
      this.codeId = e.data.checkedRowKeys
      this.projectCode = e.data.projectCode
      this.$emit('getExportCode', this.codeId, this.projectCode)
    },
    getExport () {
    },
    dataInit () {
      let baseUrl = `${location.protocol}//${location.host}/ds-app`
      // 开发环境, 使用 localhost 与 固定的默认端口
      if (process.env.NODE_ENV === 'development') {
        let host = location.hostname
        baseUrl = `${location.protocol}//${host}:5173`
      }
      let theme = this.isThemeBlack ? 'dark' : 'light'
      if (this.pageType === 'workflowDefinition') {
        this.iframeBaseUrl = `${baseUrl}/projects/${this.projectId}/workflow-definition?theme=${theme}`
      } else {
        this.iframeBaseUrl = `${baseUrl}/projects/${this.projectId}/workflow/instances?theme=${theme}`
      }
      window.addEventListener('message', e => {
        // console.log('e.origin ', e.origin) //子页面URL，这里是http://b.index.com
        // console.log(e.source) // 子页面window对象，全等于iframe.contentWindow
        // console.log(e.data) //子页面发送的消息
        // <!-- 对消息来源origin做一下过滤，避免接收到非法域名的消息导致的xss攻击 -->
        if (HTTP.$damWebOrigin.includes(e.origin)) {
          // iframe 页面加载完成, 对当前路由进行初始化, 并初始化 iframe 位置
          if (!this.iframeReady) {
            this.iframeReady = true
            this.iframePostMessage(this.currentRoute)

            this.positionChange()
          }
          let data = e.data
          if (e.data) {
            try {
              let data = JSON.parse(e.data)
              // console.log('iframe data: ', data)
              // iframe 显示弹框时, 外层页面显示 遮罩
              if (data.dialogVisible || data.dialogVisible === false) {
                this.$bus.$emit('iframe-dialog-visible-change', data.dialogVisible)
              }
            } catch (e) {
              console.log(e)
            }
          }
        }
      }, false)
    },
    iframePostMessage (message) {
      let baseUrl = `http://${location.host}`
      // 开发环境, 使用 localhost 与 固定的默认端口
      if (process.env.NODE_ENV === 'development') {
        let host = location.hostname
        baseUrl = `http://${host}:5173`
      }
      if (this.newPosition) {
        message = _.cloneDeep(message)
        message.position = this.iframeMainPosition
        this.newPosition = false
      }
      message.appName = window.NODE_APP.toLowerCase() === 'ddd' ? 'DDD' : 'DDM'
      // if (!this.iframeReady) return
      message.parentBranch = this.branchName || 'master'
      if (typeof message === 'object') {
        message = JSON.stringify(message)
      }
      const nestedIframe = this.$refs.dsWorkflowIframe
      nestedIframe && nestedIframe.contentWindow && nestedIframe.contentWindow.postMessage(message, baseUrl)
      // nestedIframe.contentWindow.postMessage(message);
    },
    dialogMaskClick () {
      this.iframePostMessage({ dialogMaskClick: true, projectCode: this.projectCode })
    },
    changebranchName () {
      this.iframePostMessage({
        appName: window.NODE_APP === 'ddd' ? 'DDD' : 'DDM',
        parentBranch: this.branchName || 'master',
        theme: 'dark',
        workflowCode: this.workflowCode,
        createDefinition: this.createDefinition,
        pageType: this.pageType
      })
    }
  },
  watch: {
    refreshWork () {
      this.projectCode && this.iframePostMessage({ theme: 'dark', refreshWork: this.refreshWork, workflowCode: this.workflowCode, createDefinition: this.createDefinition, pageType: this.pageType })
    }
  }
}
</script>

<style lang="scss" scoped>
.iframe-container, #dsWorkflowIframe {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  top: 0;
  //border: 1px solid red;
}
.dropMask{
  position: absolute;
  top: 91px;
  left: 231px;
  right: 0;
  bottom: 0;
  display: none;
}
//.iframe-container {
//  left: -160px;
//  //top: -50px;
//  top: 0;
//}
</style>
