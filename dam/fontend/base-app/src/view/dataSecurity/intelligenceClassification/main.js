import ruleList from './ruleList/ruleList.vue'
import identifyTasks from '../components/identifyTasks.vue'
import identifyResult from './identifyResult/identifyResult.vue'
import taskManagement from './taskManagement/taskManagement.vue'
import API from '@/view/dataSecurity/util/api'
export default {
  components: {
    ruleList,
    identifyTasks,
    identifyResult,
    taskManagement,
  },
  data() {
    return {
      currentTab: 'first',
      hasMachine: false,
    }
  },
  mounted() {
    this.getMachineEnable()
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
