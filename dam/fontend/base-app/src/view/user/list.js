export default {
  data() {
    return {
      rawDataMap: [],
      rawData: [],
      data: [],
      keyword: '',
      dataDisplay: null,
      currentPage: 1,
      pageSize: 20,
      total: 0,
      multipleSelection: [],
      deleteDisabled: true,
      showAllUser: true,
      optionKeys: JSON.stringify({
        value: 'valueKey',
        label: 'labelKey',
      }),
      optionsTrue: JSON.stringify([
        {
          valueKey: 'user',
          labelKey: this.$t('system.user.showEnabled'),
          disabled: false,
        },
      ]),
      // loading: true, // 设置表格内容的加载
      maleImg: 'static/images/male.svg', // 引入男生的图标
      femaleImg: 'static/images/female.svg', // 引入女生的图标
      checkDisabledObj: {
        // 设置禁用后不可选中的列
        userEditAble: [false],
      },
      keywordTimeout: null,
    }
  },
  watch: {
    keyword() {
      // this.loadData()
      // this.loading = true
      clearTimeout(this.keywordTimeout)
      this.keywordTimeout = setTimeout(() => {
        this.currentPage = 1
        this.loadData()
      }, 500)
    },
    showAllUser() {
      this.loadData()
    },
    dataDisplay(val) {
      val.length > 0 &&
        val.map(item => {
          item.userEditAble = true
          if (!item.enabled || item.username === this.$user.username) {
            item.userEditAble = false
          }
          return item
        })
    },
  },
  mounted() {
    this.$bus.$on('reload', this.loadData)
    this.loadData()
    this.defaultOpenDetail()
  },
  beforeDestroy() {
    this.$bus.$off('reload')
  },
  methods: {
    refresh() {
      this.loadData()
    },
    addTab() {
      this.$bus.$emit('addTab')
    },
    handleSelectionChange(val) {
      this.multipleSelection = val
      this.deleteDisabled = this.multipleSelection.length === 0
    },
    loadData() {
      // this.dataDisplay = []
      // this.loading = true
      let getUser = null
      let requestBody = {
        currentPage: this.currentPage,
        pageSize: this.pageSize,
        username: this.keyword,
        fullUserName: this.keyword,
        enabled: this.showAllUser === true ? this.showAllUser : '',
      }
      this.$http
        .post(this.$user_url + '/org/groups/page', requestBody)
        .then(res => {
          this.rawDataMap = res.data
          this.dataDisplay = res.data.content
          this.total = res.data.totalItems
        })
        .catch(e => {
          this.$showFailure(e)
          this.dataDisplay = []
        })
        .then(() => {
          // this.loading = false
        })
    },
    filtData() {
      this.data = []
      this.rawData.forEach(item => {
        if (
          item.name
            .concat(
              item.firstName,
              item.emailAddress,
              item.phoneNumber,
              item.fullUserName
            )
            .toLowerCase()
            .indexOf(this.keyword.toLowerCase()) > -1
        ) {
          this.data.push(item)
        }
      })
      this.total = this.data.length
      this.currentPage = 1
      this.changedataDisplay()
    },
    handleSizeChange(size) {
      this.pageSize = size
      this.currentPage = 1
      this.loadData()
    },
    handleCurrentChange(current) {
      this.currentPage = current
      this.loadData()
    },
    changedataDisplay(current) {
      const self = this
      self.dataDisplay = self.data.slice(
        self.pageSize * (self.currentPage - 1),
        self.pageSize * self.currentPage
      )
    },
    disabledUsers() {
      this.$DatablauCofirm(
        this.$t('system.user.info.sureToDisable'),
        this.$t('common.info.title'),
        {
          type: 'warning',
          cancelButtonText: this.$t('common.button.cancel'),
          confirmButtonText: this.$t('common.button.ok'),
        }
      )
        .then(() => {
          const user = []
          this.multipleSelection.forEach(item => {
            user.push(item.username)
          })
          const callback = () => {
            this.loadData()
          }
          if (user.length > 0) {
            const disableArr = () => {
              if (user.length > 0) {
                this.disabledUser(user[0], disableArr, callback)
                user.shift()
              } else {
                callback()
                this.$message.success(
                  this.$t('system.user.info.disableSuccess')
                )
              }
            }
            disableArr()
          }
        })
        .catch(() => {})
    },
    disabledUser(userName, successCallback, failureCallback) {
      this.$plainRequest
        .put('/user/usermanagement/users/disable', userName)
        .then(res => {
          successCallback && successCallback()
        })
        .catch(e => {
          this.$showFailure(e)
          failureCallback && failureCallback()
        })
    },
    disableRow({ row }) {
      const success = () => {
        this.$message.success(this.$t('system.user.info.disabled'))
        this.loadData()
      }
      this.disabledUser(row.username, success)
    },
    enableRow({ row }) {
      this.$plainRequest
        .put('/user/usermanagement/users/restore', row.username)
        .then(res => {
          this.$message.success(this.$t('system.user.info.enabled'))
          this.loadData()
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    editDetail(row) {
      const detail = row
      this.$bus.$emit('addTab', detail)
    },
    defaultOpenDetail() {
      if (this.$route.query && this.$route.query.username) {
        const username = this.$route.query.username
        this.$http
          .post(
            this.$user_url + `/usermanagement/user/getUserByUsername?username=${username}`
          )
          .then(res => {
            this.$bus.$emit('addTab', res.data)
          })
          .catch(e => {
            this.$showFailure(e)
          })
      }
    },
    editAccess() {},
    selectable(row) {
      return !(row.username === this.$user.username || !row.enabled)
    },
    //  设置状态的禁用和启用的
    changeEnabled({ row }) {
      if (row.enabled) {
        this.enableRow({ row })
      } else {
        this.disableRow({ row })
      }
    },
  },
}
