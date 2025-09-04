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
