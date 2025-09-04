import HTTP from '@/http/main.js'
import doroBalls from '@/view/authorityManage/dropBall.vue'
import spanWithTooltip from '@/components/common/spanWithTooltip.vue'
import { setTimeout, clearTimeout } from 'timers'
import showViews from '@/view/authorityManage/showViews.vue'
import chooseTheme from '@/components/common/themePick/chooseTheme.vue'
import themeMixin from '@/components/common/themePick/themeMixin.js'

export default {
  name: 'heading',
  mixins: [themeMixin],
  data() {
    const { blue, greyText } = this.$style
    const username = this.$user.firstName || this.$user.username
    return {
      style: {
        logo: {
          display: 'inline-block',
          verticalAlign: 'top',
          width: '240px',
          cursor: 'pointer',
        },
        menu: {
          display: 'inline-block',
        },
        topRightPart: {},
        input: {},
        user: {},
        userName: {},
        searchIcon: {
          position: 'absolute',
          right: '7px',
          top: '40%',
          fontSize: '14px',
          color: 'var(--map-btn-bgc)',
          fontWeight: 'bold',
          cursor: 'pointer',
        },
      },
      activeIndex: undefined,
      keyword: '',
      keywordFromSelect: false,
      key: 0,
      showMenu: true,
      showGlobalSearch: false,
      shopCarTargetDom: {},
      userName: username,
      applicaCount: 0,
      notifiCount: 0,
      timerGetNoti: null,
      timeoutOfSuggestions: null,
      showViewsDialog: false,
      transparentLogo: false,
    }
  },
  components: { doroBalls, spanWithTooltip, showViews, chooseTheme },
  mounted() {
    this.handleMenu()
    this.toggleGlobalSearch(this.$route)
    this.getNotification()
    this.getApplactionCount()

    this.shopCarTargetDom = $('.heading .data-application')

    this.$bus.$on('getInfication', data => {
      if (data) {
        this.dealwithNotiData(data)
      } else {
        this.notifiStatChanged()
      }
    })
    this.$bus.$on('addTableApplication', event => {
      event = event || {}
      setTimeout(this.getApplactionCount, 0.4)
      const dom = event.srcElement ? event.srcElement : event.target
      this.addDomToAppliList(dom)
    })
    this.$bus.$on('removeTableApplication', () => {
      setTimeout(this.getApplactionCount, 0.4)
    })
    this.$bus.$on('resetKeyword', this.handleResetKeyword)
    // this.$bus.$on('changeGlobalTheme', this.handleThemeChange);
    this.$bus.$on('changeTableApplyNum', this.getApplactionCount)
  },
  beforeDestroy() {
    this.handleInputBlur()
    this.$bus.$off('resetKeyword', this.handleResetKeyword)
    // this.$bus.$off('changeGlobalTheme');
    this.$bus.$off('changeTableApplyNum', this.getApplactionCount)
  },
  destroyed() {
    this.$bus.$off('getInfication')
    this.$bus.$off('addTableApplication')
    this.$bus.$off('removeTableApplication')
    this.$bus.$off('resetKeyword')
  },
  watch: {
    $route(route) {
      this.handleMenu()
      this.toggleGlobalSearch(route)
      this.showViewsDialog = false
    },
    keyword() {
      if (this.keywordFromSelect) {
      } else {
        this.handleInputChange()
      }
    },
  },
  methods: {
    handleResetKeyword(keyword) {
      this.keywordFromSelect = true
      this.keyword = keyword
    },
    handleCommand(command) {
      switch (command) {
        case 'user':
          this.$router.push({ name: 'userModalForDdc' })
          break
        case 'sync':
          this.sync()
          break
        case 'dam':
          this.$router.push('/')
          break
        case 'find':
          this.openDataFind()
          break
        case 'viewsdata':
          this.showviewsdata()
          break
        case 'logout':
          window.location.href = this.$url + '/j_spring_security_logout'
      }
    },
    showviewsdata() {
      this.showViewsDialog = true
    },
    toggleGlobalSearch(route) {
      const name = route.name
      switch (name) {
        case 'home':
          this.showGlobalSearch = false
          break
        default:
          this.showGlobalSearch = true
      }
    },
    handleMenu() {
      this.activeIndex = this.$route.path
      if (this.activeIndex === '/search') {
        this.key++
      } else {
      }
    },
    handleSelect() {},
    search() {
      {
        const query = _.clone(this.$route.query)
        query.keyword = this.keyword
        this.$router.push({ name: 'search', query: query })
      }
      this.$bus.$emit('resetKeyword', this.keyword)
      $('#sug-list').hide()
    },
    openDataFind() {
      this.$router.push({ name: 'transform' })
    },
    handleClickLogo() {
      this.$emit('logo-click')
    },
    sync() {
      this.$http
        .post(this.$url + '/service/ddc/sync')
        .then(res => {
          this.$message('同步成功')
        })
        .catch(e => {
          this.$message.error('同步失败')
        })
    },
    handleGoCreateAppla() {
      this.$router.push({
        name: 'createApplication',
        path: '/main/createApplication',
      })
    },
    getNotification() {
      // HTTP.getNotification({
      //   succesedCallback: data => {
      //     this.$bus.$emit('getInfication', data) // 全局通知获得消息
      //     // setTimeout(this.getNotification, 1000);
      //     clearTimeout(this.timerGetNoti)
      //     this.timerGetNoti = setTimeout(this.getNotification, 60 * 1000)
      //   },
      //   failureCallback: e => {
      //     this.$showFailure(e)
      //   },
      // })
    },
    handleCheckNotification() {
      this.$router.push({
        name: 'notification',
        path: '/main/notification',
      })
    },
    addDomToAppliList(target) {
      this.$refs.doroBalls.drop(target)
    },
    getApplactionCount() {
      const obj = {
        attr: 'dataApply',
        type: 'Object',
        userName: this.userName,
      }
      const arr = this.$utils.localStorage.getDataApplication(obj)
      this.applicaCount = arr.length ? arr.length : 0
    },
    dealwithNotiData(data) {
      if (data && Array.isArray(data)) {
        const arr = []
        data.forEach(item => {
          if (!item.read && item.target === this.$user.username) {
            arr.push(item)
          }
        })
        this.notifiCount = arr.length
      }
    },
    notifiStatChanged() {
      setTimeout(this.getNotification, 1000)
    },
    handleInputFocus(event) {
      const element = $(event.srcElement)
      const offset = element.offset()
      const { offsetHeight: height, offsetWidth: width } = element[0]
      this.$bus.$emit('handleDataList', {
        type: 'focus',
        height: height,
        width: width,
        left: offset.left,
        top: offset.top,
      })
      if (!this.keyword) {
        this.emitInputChangeFromLocal()
      }
    },
    handleInputBlur() {
      this.$bus.$emit('handleDataList', {
        type: 'blur',
      })
    },
    emitInputChange(rawOptions) {
      const options = new Set()
      if (rawOptions['alias.comp-suggestion']) {
        rawOptions['alias.comp-suggestion'].forEach(o => {
          o.options.forEach(item => {
            options.add(item.text)
          })
        })
      }
      if (rawOptions['name.comp-suggestion']) {
        rawOptions['name.comp-suggestion'].forEach(o => {
          o.options.forEach(item => {
            options.add(item.text)
          })
        })
      }
      if (options.size > 0) {
        this.$bus.$emit('handleDataList', {
          type: 'change',
          options: options,
        })
      } else {
        this.$bus.$emit('handleDataList', {
          type: 'change',
          options: options,
        })
        /* this.$bus.$emit('handleDataList',{
          type:'blur'
        }) */
      }
    },
    emitInputChangeFromLocal() {
      const local = localStorage.getItem('recentSearch')
      let options = []
      if (local) {
        options = local.split('||').reverse()
      } else {
        options = []
      }
      this.$bus.$emit('handleDataList', {
        type: 'change',
        local: true,
        options: options,
      })
    },
    handleInputChange() {
      clearTimeout(this.timeoutOfSuggestions)
      if (this.keyword) {
        this.timeoutOfSuggestions = setTimeout(() => {
          HTTP.getSuggestions({
            keyword: this.keyword,
            successCallback: data => {
              this.emitInputChange(data.suggest)
            },
          })
        }, 600)
      } else {
        this.emitInputChangeFromLocal()
      }
    },
    handleThemeChange(theme) {
      this.transparentLogo = theme === 'dark'
    },
  },
  computed: {
    hasDam() {
      return true
      // return !!(this.$isAdmin || (this.$user.roles.length > 2) || this.$user.roles.indexOf('ROLE_REPORT_VIEWER') === -1);
    },
  },
}
