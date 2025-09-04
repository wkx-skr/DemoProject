import machine from './machine/index.vue'
import algorithmLibrary from './algorithmLibrary/algorithmLibrary.vue'
import API from '@/view/dataSecurity/util/api'
export default {
  components: {
    algorithmLibrary,
    machine,
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
      this.$auth.DATA_SECURITY_DISCERN_ALGORITHM_MANAGE ||
      this.$auth.DATA_SECURITY_DISCERN_ALGORITHM
    ) {
      this.currentTab = 'first'
    } else if (this.$auth.DATA_SECURITY_DISCERN_CC) {
      this.currentTab = 'second'
    } else if (this.$auth.DATA_SECURITY_DISCERN_ML) {
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
