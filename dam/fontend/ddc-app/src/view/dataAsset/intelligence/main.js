import ruleList from './ruleList/ruleList.vue'
import identifyResult from './identifyResult/identifyResult.vue'
import taskManagement from './taskManagement/taskManagement.vue'
import API from '../utils/s_api'
export default {
  components: {
    ruleList,
    identifyResult,
    taskManagement,
  },
  data() {
    return {
      currentTab: '',
      hasMachine: false,
    }
  },
  mounted() {
    this.getMachineEnable()
    if (
      this.$auth.RECOMMEND_RESULT_MANAGE ||
      this.$auth.RECOMMEND_RESULT_VIEW
    ) {
      this.currentTab = 'third'
    } else if (
      this.$auth.IDENTIFY_RULE_MANAGE ||
      this.$auth.IDENTIFY_RULE_VIEW ||
      this.$auth.IDENTIFY_RULE_CATALOG_VIEW
    ) {
      this.currentTab = 'first'
    } else if (
      this.$auth.IDENTIFY_TASK_MANAGE ||
      this.$auth.IDENTIFY_TASK_VIEW ||
      this.$auth.IDENTIFY_TASK_CATALOG_MANAGE
    ) {
      this.currentTab = 'second'
    }
  },

  methods: {
    getMachineEnable() {
      // 判断机器学习的服务是否运行
      API.machineEnable()
        .then(res => {
          this.hasMachine = res.data.data
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    tabClick(data) {
      this.currentTab = data.name
    },
  },
}
