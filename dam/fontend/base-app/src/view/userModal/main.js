import UserInformation from './UserInformation'
import UserFavourite from './UserFavourite'
import UserSubscribe from './UserSubscribe.vue'
import notification from '@/view/notification/notification.vue'
import myApply from '@/view/processControl/myApply.vue'
import myDone from '@/view/processControl/myDone.vue'
import myTodo from '@/view/processControl/myTodo.vue'
// import userPane from '@/view/dashboard5.7/api/userPane.vue'
import createApplication from '@/view/authorityManage/createApplication.vue'
import HTTP from '@/http/main'

let userPane = {}
if (HTTP.$appName === 'DAM') {
  userPane = require('@/view/dashboard5.7/api/userPane.vue')?.default
}

export default {
  components: {
    UserInformation,
    UserFavourite,
    UserSubscribe,
    notification,
    myApply,
    myDone,
    myTodo,
    createApplication,
    userPane, // 个人工作台
  },
  inject: ['headerProduction'],
  props: {
    navFromEntrance: {
      required: false,
      default: 'myTodo',
      type: String,
    },
  },
  data() {
    return {
      currentNav: this.navFromEntrance,
      useWorkFlow: false,
      createApplicationSrc: require('@/view/mainForDdc/icon/application.png'),
      contentKey: {
        userPane: 0,
        favourite: 0,
        subscribe: 0,
        user: 0,
        message: 0,
        messageSendMailbox: 0,
        myApply: 0,
        myTodo: 0,
        myDone: 0,
      },
    }
  },
  computed: {
    useDam() {
      return this.headerProduction && this.headerProduction === 'dam'
    },
  },
  mounted() {
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

    this.setPosition()
  },
  methods: {
    addKey(key) {
      this.contentKey[key]++
    },
    handleSelect(option) {
      if (this.currentNav === option) {
        this.addKey(option)
      }
      this.changeCurrentNav(option)
    },
    changeCurrentNav(currentNav) {
      this.$router.push({
        query: {
          currentNav: currentNav,
        },
      })
    },
    setCurrentNav(currentNav) {
      this.currentNav = currentNav
    },
    // 嵌套在 iframe中时, 初始化位置
    setPosition() {
      this.$nextTick(() => {
        $('.iframe-full').css('left', !this.useDam ? 0 : '160px')
      })
    },
  },
  watch: {
    $route: {
      deep: true,
      handler: function (to, from) {
        const currentNav = to.query.currentNav
        if (currentNav) {
          this.currentNav = currentNav
        }
      },
    },
  },
}
