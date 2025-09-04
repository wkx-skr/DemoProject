import machine from './machine/index.vue'
import algorithmLibrary from './algorithmLibrary/algorithmLibrary.vue'
import API from '@/view/dataAsset/utils/s_api'
export default {
  components: {
    algorithmLibrary,
    machine,
  },
  props: {
    from: String,
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
      this.$auth.DATA_ASSET_DISCERN_ALGORITHM_MANAGE ||
      this.$auth.DATA_ASSET_DISCERN_ALGORITHM
    ) {
      this.currentTab = 'first'
    } else if (this.$auth.DATA_ASSET_DISCERN_CC) {
      this.currentTab = 'second'
    } else if (this.$auth.DATA_ASSET_DISCERN_ML) {
      this.currentTab = 'third'
    }
  },
  methods: {
    backClick() {
      this.$emit('back')
    },
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
