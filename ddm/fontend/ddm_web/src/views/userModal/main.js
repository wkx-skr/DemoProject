// import UserInformation from './UserInformation'
// import UserFavourite from './UserFavourite'
// import UserComFavourite from './UserComFavourite.vue'
// import UserSubscribe from './UserSubscribe.vue'
import notification from '@/views/notification/notification.vue'
import myApply from '@/views/processControl/myApply.vue'
import myDone from '@/views/processControl/myDone.vue'
import myTodo from '@/views/processControl/myTodo.vue'
import userInformation from '@/views/userModal/entrance/userInformation.vue'

// import createApplication from '@/views/authorityManage/createApplication.vue'

export default {
  components: {
    // UserInformation,
    // UserFavourite,
    // UserComFavourite,
    // UserSubscribe,
    notification,
    myApply,
    myDone,
    myTodo,
    userInformation
    // createApplication,
  },
  props: {
    navFromEntrance: {
      required: false,
      default: 'user',
      type: String
    }
  },
  data () {
    return {
      currentNav: this.navFromEntrance,
      useWorkFlow: false,
      createApplicationSrc: require('@/views/mainForDdc/icon/application.png')
    }
  },
  mounted () {
    const workflowStatus = this.$workflowStatus
    if (workflowStatus && workflowStatus.workflow_enable) {
      this.useWorkFlow = true
    }
    const queryData = this.$route.query
    if (queryData.currentNav) {
      this.setCurrentNav(queryData.currentNav)
    } else {
      this.changeCurrentNav(this.currentNav)
    }
  },
  beforeDestroy() {
    this.$bus.$emit('show-dam-iframe', false)
  },
  methods: {
    handleSelect(option) {
      this.changeCurrentNav(option)
    },
    changeCurrentNav(currentNav) {
      if (!this.$globalData.$isDam && currentNav === 'comFavourite') {
        currentNav = 'favourite'
      }
      this.$router.push({
        // name: this.$globalData.$isDam ? 'userModal' : 'userModalForDdc',
        query: {
          currentNav: currentNav
        }
      })
    },
    setCurrentNav (currentNav) {
      if (!this.$globalData.$isDam && currentNav === 'comFavourite') {
        currentNav = 'favourite'
        this.changeCurrentNav(currentNav)
      } else {
        this.currentNav = currentNav
      }
    }
  },
  watch: {
    $route: {
      deep: true,
      handler: function (to, from) {
        const currentNav = to.query.currentNav
        if (currentNav) {
          this.currentNav = currentNav
        } else {
          this.changeCurrentNav('user')
        }
      }
    },
    currentNav: {
      immediate: true,
      handler: function (newVal) {
        setTimeout(() => {
          if (newVal === 'user') {
            // this.$bus.$emit('show-dam-iframe', true)
            // this.$bus.$emit('show-dam-iframe', true)
          } else {
            this.$bus.$emit('show-dam-iframe', false)
          }
        }, 500)

      }
    }
  }
}
