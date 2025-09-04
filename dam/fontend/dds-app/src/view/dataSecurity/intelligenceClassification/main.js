import ruleList from './ruleList/ruleList.vue'
import identifyResult from './identifyResult/identifyResult.vue'
import taskManagement from './taskManagement/taskManagement.vue'
import API from '@/view/dataSecurity/util/api'
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
      this.$auth.DATA_SECURITY_DISCERN_RULE_MANAGE ||
      this.$auth.DATA_SECURITY_DISCERN_RULE
    ) {
      this.currentTab = 'first'
    } else if (
      this.$auth.DATA_SECURITY_DISCERN_TASK_MANAGE ||
      this.$auth.DATA_SECURITY_DISCERN_TASK
    ) {
      this.currentTab = 'second'
    } else if (
      this.$auth.DATA_SECURITY_DISCERN_RESULT_MANAGE ||
      this.$auth.DATA_SECURITY_DISCERN_RESULT
    ) {
      this.currentTab = 'third'
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
