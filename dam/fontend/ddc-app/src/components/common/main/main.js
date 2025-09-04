import dataDialogs from './dataDialogs.vue'
import variousSelector from './variousSelector/main.vue'
import productDocument from './document/main.vue'
import HTTP from '@/http/main'
import { mapMutations, mapState } from 'vuex'

require('@/assets/styles/base.css')
require('@/assets/styles/base.scss')
require('@/assets/styles/table.scss')
require('@/assets/styles/page.scss')
require('@/assets/styles/list.scss')

export default {
  components: {
    dataDialogs,
    variousSelector,
    productDocument,
  },
  provide() {
    return {
      reload: this.reload,
      headerProduction: 'dam',
      refresh: this.refresh,
    }
  },
  created() {
    HTTP.$appName = 'DAM'
    // this.$resetDomainAuth(HTTP.$appName)
    window.sessionStorage.setItem('ddmFirst', false)
    // this.$ddmFirst = false
    this.$setHeader(false)
    // 测试数据
    this.setTables({
      t_users: ['id', 'name', 'account', 'password', 'email'],
      t_role: ['id', 'uid', 'code', 'permissions'],
    })
    // dam 不能连接, 但 ddm 可以连接时, 跳转到 ddm 数据标准页面
    if (!this.$damEnabled) {
      this.$router.push({
        name: 'dataStandardDdm',
      })
    }

    this.dataInit()
      .then(res => {
        this.loading = false
      })
      .catch(e => {
        console.log(e)
      })
  },
  data() {
    return {
      subNavItems: [],

      labelPosition: 'top',
      showMessageList: false,
      showUploadProgress: false,
      uploadProgress: {
        time: 10,
        title: 'default',
        status: 'progress',
      },
      deeps: true,
      isRouterAlive: true,
      // 部分数据需要加载完成才开始渲染页面
      loading: true,
      routerAlive: true,
    }
  },
  watch: {
    showMessageList(newVal) {
      if (newVal === true) {
        this.displayList()
      } else {
        this.hideList()
      }
    },
    $route: {
      handler: function (val) {
        if (this.$isIEAll) {
          if (['dataCatalog'].includes(val.name)) {
            window.location.reload()
          }
        }
        if (
          val.path === '/main/embeddedModule' ||
          val.path === '/main/dataAsset/home' ||
          val.path.indexOf('/main/dataAsset/search') !== -1
        ) {
          this.deeps = false
        } else {
          this.deeps = true
        }
      },
      deep: true,
    },
  },
  beforeDestroy() {
    this.$bus.$off('showUploadProgress')
    this.$bus.$off('changeUploadProgress')
    this.$bus.$off('hideUploadProgress')
    this.$bus.$off('routerRefresh')
  },
  mounted() {
    this.$bus.$on('routerRefresh', isSuccess => {
      if (isSuccess) {
        this.reload()
      }
    })
    if (
      this.$route.path === '/main/embeddedModule' ||
      this.$route.path === '/main/dataAsset/home' ||
      this.$route.path.indexOf('/main/dataAsset/search') !== -1
    ) {
      this.deeps = false
    } else {
      this.deeps = true
    }
    $('body').addClass('body-for-dam')
    if (this.$i18n.locale === 'en') {
      $('body').addClass('body-for-dam_en')
    }
    this.initMessageList()
    const self = this
    const logout = function () {
      window.location.href = self.$url + '/j_spring_security_logout'
    }
    ;(function () {
      var timestamp
      var now = new Date()
      timestamp =
        now.getFullYear() +
        '-' +
        (now.getMonth() + 1) +
        '-' +
        now.getDate() +
        ' ' +
        now.getHours() +
        ':' +
        now.getMinutes() +
        ':' +
        now.getSeconds()
      // self.$http
      //   .put(self.$url + '/service/runlicensecheck', {
      //     operation: 'Login',
      //     description: 'Webportal',
      //     timestamp: timestamp,
      //   })
      //   .then(() => {})
      //   .catch(e => {
      //     if (!this.$ddmFirst) {
      //       alert(
      //         '您没有获得登录权限,请尝试重新登录。如仍无法登录，请联系管理员'
      //       )
      //       logout()
      //     }
      //   })
    })()
    //		Ps.initialize($('#main-content')[0])
    this.handleHashchange(null)
    window.onhashchange = this.handleHashchange
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
        this.$refs.progress.failure()
        this.uploadProgress.status = 'failure'
        this.showUploadProgress = false
      }
    })
    this.$bus.$on('hideUploadProgress', () => {
      this.showUploadProgress = false
    })
  },
  methods: {
    ...mapMutations('codeMirror', {
      setTables: 'setTables',
    }),
    async dataInit() {
      try {
        let res = await HTTP.getDomainWorkflowStatus()
        let workflowStatus = res.data
        if (workflowStatus === 'true') {
          if (!this.$workflowStatus) {
            this.prototype.$workflowStatus = {}
          }
          this.$workflowStatus.workflow_enable = true
          this.$workflowStatus.workflow_domain_enable = true
        } else {
          this.$workflowStatus.workflow_domain_enable = false
        }
      } catch (e) {
        this.$showFailure(e)
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
    initMessageList() {
      $('#full-screen-mask').on('click', e => {
        this.showMessageList = false
      })
    },
    displayList() {
      const list = $('#error-list')
      const mask = $('#full-screen-mask')
      mask.show()
      list.show()
      list.animate(
        {
          right: 0,
        },
        300
      )
      mask.animate(
        {
          opacity: 0.2,
        },
        300
      )
    },
    hideList() {
      const list = $('#error-list')
      const mask = $('#full-screen-mask')
      mask.animate(
        {
          opacity: 0,
        },
        300
      )
      list.animate(
        {
          right: -400,
        },
        300,
        null,
        () => {
          mask.hide()
          list.hide()
        }
      )
    },

    handleHashchange(hash) {
      this.$bus.$emit('resetNav')
      if ($('#main-content')[0]) {
        $('#main-content')[0].scrollTop = 0
        Ps.update($('#main-content')[0])
      }
      if (!hash || true) {
        hash = {}
        hash.newURL = location.hash
      }
    },
    removeErrorMessage(index) {
      this.$errorList.splice(index, 1)
    },
  },
}
