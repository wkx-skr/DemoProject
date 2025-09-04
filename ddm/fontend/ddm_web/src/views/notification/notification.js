import HTTP from '@/resource/http'

import checkNotification from './checkNotification.vue'
import newsList from './newsList.vue'
import spanWithTooltip from '@/components/common/spanWithTooltip.vue'
import sendMessage from './sendMessage.vue'
import sort from '@/resource/utils/sort'
export default {
  data () {
    return {
      currentTab: 'allGetNotifi',
      notiTabArr: [],
      notiTabObj: {},
      dialogVisibleNotiTabObj: false,
      sendVisible: false,
      sendObj: {},
      users: []
    }
  },
  components: {
    checkNotification,
    newsList,
    spanWithTooltip,
    sendMessage
  },
  props: {
    hideOuter: {
      type: Boolean,
      default: false
    },
    type: {
      type: String,
      default: false
    }
  },
  computed: {},
  mounted () {
    this.dataInit()
    // this.getUsers()
  },
  methods: {
    handleSendMessage () {
      this.sendObj.category = '个人消息'
      this.sendObj.priority = 3
      this.submitForm()
    },
    submitForm () {
      this.$refs['send-mes'].$refs['form'].validate((valid) => {
        let sendAll = this.$refs['send-mes'].getSendAll()
        if (valid) {
          let requestBody = _.cloneDeep(this.sendObj)
          requestBody.content = requestBody.content.replace(/\n/g, '<br/>')
          requestBody.targetList = requestBody.target
          if (sendAll) {
            requestBody.targetList = []
          }
          delete requestBody.target
          let params = {
            // userNames: this.sendObj.target,
            sendAll: sendAll,
            requestBody
          }
          HTTP.sendMessageMultiple(params)
            .then(res => {
              this.sendVisible = false
              this.dataInit()
            })
            .catch(err => {
              console.error(err)
              this.$showFailure(err)
            }
            )
        } else {
          return false
        }
      })
    },
    handleClose () {
      this.resetForm()
      this.sendVisible = false
    },
    resetForm (done) {
      this.$refs['send-mes'].$refs['form'].resetFields()
      done && done()
    },
    getUsers () {
      HTTP.getUsers({
        successCallback: data => {
          let currentUser = this.$store.state.user
          sort.sort(data, 'username')
          let users = []
          data.forEach(user => {
            if (currentUser.name !== user.username) {
              user.fullName = _.toString(user.firstname) + _.toString(user.lastname)
              users.push(user)
            }
          })
          // console.log(currentUser, 'user')
          if (currentUser.isAdmin) {
            users.unshift({
              firstname: '所有人',
              username: 'Anyone'
            })
          }
          this.users = users
        }
      })
    },
    showSend () {
      this.sendObj = {
        name: '',
        source: this.$store.state.user.name,
        target: [],
        title: '',
        content: ''
      }
      this.sendVisible = true
    },
    dataInit () {
      if (this.type === 'messageInbox') {
        this.$refs.allGetNotifiList.dataInit()
      } else if (this.type === 'messageSendMailbox') {
        this.$refs.sentNotifiList.dataInit()
      }
    },
    removeTab (name) {
      const index = this.notiTabArr.findIndex(item => {
        return item.nId + '' === name
      })
      if (index !== -1) {
        this.notiTabArr.splice(index, 1)
      }
      this.currentTab = 'allGetNotifi'
    },

    checkNoti (obj) {
      this.checkNormalNoti(obj)
    },
    checkNormalNoti (obj) {
      this.dialogVisibleNotiTabObj = true
      this.notiTabObj = obj
      setTimeout(() => {
        this.$refs.checkNotification.dataInit()
      })
    }
  },
  watch: {
    type (newVal) {
      if (newVal === 'messageInbox') {
        this.$refs.allGetNotifiList.resize()
        this.$refs.allGetNotifiList.dataInit()
      } else if (newVal === 'messageSendMailbox') {
        this.$refs.sentNotifiList.resize()
        this.$refs.sentNotifiList.dataInit()
      }
    },
    currentTab (newVal) {
      if (newVal === 'allGetNotifi') {
        this.$refs.allGetNotifiList.resize()
        this.$refs.allGetNotifiList.dataInit()
      } else if (newVal === 'sentNotifi') {
        this.$refs.sentNotifiList.resize()
        this.$refs.sentNotifiList.dataInit()
      }
    }
  }
}
