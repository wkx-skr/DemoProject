import spanWithTooltip from '@/components/common/spanWithTooltip.vue'
import downloadProgress from './downloadProgress.vue'
import theme from './theme.js'
import chooseTheme from '@/components/common/themePick/chooseTheme.vue'
import HTTP from '@/http/main'
import ProductBucket from './productBucket.vue'
import TopRightCorner from './topRightCorner/topRightCorner.vue'
export default {
  data() {
    return {
      nowTime: 0,
      showLogo: true,
      getLogo: sessionStorage.getItem('damlogo') || null,
      keyword: '',
      showDiamond: false,
      diamonds: '',
      jobMode: false,
      logsArr: [],
      hidenDropdown: true,
      showLogLoading: 'notstart',
      showSearchInput: false,
      unReadNotiCount: 0,
      pollingTimer: null,
      lang: localStorage.getItem('language'),
      portraitSrc: require('./portrait/1.png'),
      icon: {
        error: require('./navIcon/error.svg'),
        version: require('./navIcon/version.svg'),
        message: require('./navIcon/message.svg'),
      },
      popoverLanguagevisible: false,
      popoverThemevisible: false,
      transparentLogo: false,
    }
  },
  components: {
    spanWithTooltip,
    downloadProgress,
    chooseTheme,
    ProductBucket,
    TopRightCorner,
  },
  mounted() {
    // this.initTestMode()
    // setTimeout(() => {
    //   this.showDiamond = false
    //   $(document).off('keydown')
    // }, 30 * 60 * 1000)

    this.$bus.$on('changeGlobalTheme', this.handleThemeChange)

    // 监听上传Damlogo
    this.$bus.$on('updateDamLogo', e => {
      this.nowTime = new Date().valueOf()
    })
    // this.$nextTick(() => {
    //   this.getHeight()
    // })
  },
  beforeDestroy() {
    $(document).off('keydown')
    this.$bus.$off('getInfication')
    this.$bus.$off('updateDamLogo')
    clearTimeout(this.pollingTimer)
    this.$bus.$off('changeGlobalTheme', this.handleThemeChange)
  },
  watch: {
    diamonds(newVal) {
      if (newVal.indexOf('diamond') != -1) {
        this.showDiamond = true
        $(document).off('keydown')
      }
    },
    lang(newVal, oldVal) {
      if (newVal && oldVal && newVal !== oldVal) {
        localStorage.setItem('language', newVal)
        location.reload()
      }
    },
  },
  methods: {
    imgerrorfun() {
      let img = event.srcElement
      img.src = '/static/logo/guanwang_black.png'
      img.onerror = null
    },
    getHeight() {
      const boxH = $('#datablau-logo').height()
      const h = $('#datablau-logo .cur-logo').height()
    },
    handleDevCommand(command) {
      const pos = location.href.indexOf('#/')
      const baseUrl = location.href.slice(0, pos + 2)
      switch (command) {
        case 'productDocument':
          this.openDocument()
          break
        case 'commonComponentDocument':
          window.open(baseUrl + 'commonComponentDocument', '_blank')
          break
        case 'frontendDevelopmentDocument':
          window.open(baseUrl + 'frontendDevelopmentDocument', '_blank')
          break
        default:
          break
      }
    },
    handleCommand(command) {
      switch (command) {
        case 'user':
          // 点击工作台时 不让语言和主题菜单显示
          this.userLock = true
          clearTimeout(this.userLockTimer)
          this.userLockTimer = setTimeout(() => {
            this.userLock = false
          }, 200)
          this.$bus.$emit('clearHighlightTopNav')
          this.openUserModal()
          break
        case 'logout':
          this.logout()
          break
        case 'help':
          window.open('http://www.datablau.cn/FQA')
          break
        case 'error':
          this.$parent.showMessageList = true
          break
        case 'version':
          this.showInfo()
          break
        case 'language':
          this.popoverLanguagevisible = true
          break
        case 'theme':
          this.popoverThemevisible = true
          break
        case 'themeChange':
          break
        default:
          break
      }
    },
    // handleThemeChange (name) {
    //   theme(name, this)
    // },
    openUserModal() {
      this.$router.push({ name: 'userModal' })
    },
    onUploadSuccessed() {
      this.$showSuccess('上传成功')
    },
    handleDownloadLog(log) {
      let url = `${this.$url}/service/logs/single/${log.name}`
      if (log.name === 'all') {
        // 下载所有日志
        url = `${this.$url}/service/logs/all`
      }
      this.$downloadFile(url)
    },
    handleDownlogLeave() {
      this.hidenDropdown = true
    },
    handleLanguageEnter() {
      if (this.userLock) {
        return
      }
      this.hidenDropdown = false
      this.popoverLanguagevisible = true
      this.popoverThemevisible = false
    },
    handleLanguageLeave() {
      this.hidenDropdown = true
    },
    handleThemeEnter() {
      if (this.userLock) {
        return
      }
      this.hideDropdown = false
      // this.popoverThemevisible = true
      this.popoverLanguagevisible = false
    },
    handleThemeLeave() {
      this.hidenDropdown = true
    },
    handleHideDropdown(show) {
      if (!show) {
        this.showLogLoading = 'notstart'
      }
      if (!show) {
        this.popoverLanguagevisible = false
        this.popoverThemevisible = false
      }
    },
    initTestMode() {
      $(document).on('keydown', e => {
        this.diamonds += e.key
      })
    },
    handleDiamondCommand(command) {
      switch (command) {
        case 'dba':
          this.runTest()
          break
        case 'uploadReportForm':
          break
        case 'uploadSystem':
          this.$router.push({ name: 'modelCategory' })
          break
        case 'system':
          this.bindSystems()
          break
        case 're':
          this.reModels()
          break
        case 'xDomain':
          this.$bus.$permitXDomain = true
          break
        case 'uploadLineage':
          this.$router.push({ name: 'lineage' })
          break
        case 'switchJobMode':
          this.jobMode = !this.jobMode
          if (!window.$DATABLAU) {
            window.$DATABLAU = {}
          }
          window.$DATABLAU.jobs = !window.$DATABLAU.jobs
          break
        default:
          break
      }
    },
    runTest() {
      HTTP.getAllGroups().then(res => {
        let hasDBA = false
        res.data.forEach(group => {
          if (group.name === 'DBA') {
            hasDBA = true
          }
        })
        if (hasDBA) {
          this.$message.info('已有DBA组')
          //            this.bindSystems()
        } else {
          this.addDBA()
        }
      })
    },
    addDBA(callback) {
      const roleIds = []
      this.$roles.forEach(item => {
        if (item.roleName === 'ROLE_DS_ADMIN') {
          roleIds.push(item.userRoleId)
        } else if (item.roleName === 'ROLE_USER') {
          roleIds.push(item.userRoleId)
        }
      })
      const requestBody = {
        description:
          'This role is placed for important test, do not remove it!',
        name: 'DBA',
        roleIds: roleIds,
        userIds: [this.$user.userid],
      }
      HTTP.createUserGroups(requestBody)
        .then(res => {
          this.$message.success('DBA角色添加成功')
          if (callback) {
            callback()
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    bindSystems() {
      const requestBody = {
        username: this.$user.username,
        modelCategoryIds: Object.keys(this.$modelCategoriesMap),
      }
      this.$http
        .post(this.$url + '/service/modelCategories/users', requestBody)
        .then(res => {
          this.$message.success(
            '用户成功绑定到' + requestBody.modelCategoryIds.length + '个系统'
          )
          //          this.reModels();
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    reModels() {
      const requestBodySample = {
        '@class': 'com.datablau.dam.data.dto.DatasourceProperties',
        categoryId: 317,
        categoryName: '应用托管平台',
        connectType: 'JDBC',
        createTime: '2018-09-25 14:51:50',
        credentialInfo: {
          user: 'root',
          password: 'root',
        },
        latestVersion: 'version_1',
        modelCategoryId: 317,
        parameterMap: {
          AuthenticationType: '0',
          CommentToLogicalName: true,
          DatabaseName: 'sakila',
          HostServer: 'localhost',
          PortNumber: '3306',
        },
        sourceName: 'm-627',
        type: 'MYSQL',
        versioning: true,
      }
      const length = this.$modelCategories.length
      let cnt = 0
      this.$modelCategories.forEach(category => {
        const requestBody = _.cloneDeep(requestBodySample)
        //          requestBody.categoryName
        requestBody.createTime = this.$timeFormatter()
        requestBody.categoryName = category.categoryName
        requestBody.categoryId = category.categoryId
        requestBody.modelCategoryId = category.categoryId
        requestBody.sourceName = category.categoryName + 'test'
        this.$http
          .post(this.$url + '/service/models/re/', requestBody)
          .then(res => {
            cnt++
            if (cnt === length) {
              this.$message.success(
                '成功为每个系统RE了数据源,接下来请手动导入血缘模版'
              )
              //              this.showDiamond = false;
            }
          })
          .catch(e => {
            this.$showFailure(e)
          })
      })
    },

    handleSearch() {
      if (this.keyword) {
        this.$router.push({
          name: 'searchForDam',
          query: { keyword: this.keyword },
        })
        this.$bus.$emit('searchForDam', this.keyword)
      }
    },
    logout() {
      // window.location.href = this.$url + '/j_spring_security_logout'
      this.$http
        .get(this.$url + '/j_spring_security_logout')
        .then(() => {
          if (window.setting.ssoLoginUrl) {
            window.$ssoLogin(true)
          } else {
            location.href = '../base-app/datablau.html?reason=user_logout_success'
          }
        })
        .catch(() => {
          if (window.setting.ssoLoginUrl) {
            window.$ssoLogin(true)
          } else {
            location.href = '../base-app/datablau.html?reason=user_logout_failure'
          }
        })
    },

    goToHelp() {
      // this.$router.push({
      //   name: 'helpDocPage',
      //   query: {
      //     page: 'helpDoc1_1'
      //   }
      // });
      const url = window.location.origin + this.$url + '/api.html'
      window.open(url, '_blank')
    },
    handleBlur() {
      if (!this.keyword) {
        this.showSearchInput = false
      }
    },
    downloadDDM() {
      const url = './static/download/DDMSetup.zip'
      this.$downloadFile(url)
    },
    goToIndex() {
      this.$bus.$emit('clearHighlightTopNav')
      this.$router.push({ path: '/' })
    },
    handleThemeChange(themeName) {
      this.transparentLogo = themeName !== 'light'

      theme(themeName !== 'light' ? 'dark' : 'light', this)
    },
    openDocument() {
      this.$bus.$emit('open-document')
    },
  },
}
