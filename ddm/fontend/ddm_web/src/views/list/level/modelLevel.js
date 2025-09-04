import modelList from './modelList.vue'
import lineageGraph from '../../modelLevel/lineage/lineageGraph.vue'
import modelItemTitle from '@/views/list/level/modelItemTitle.vue'
// import lineageGraph from '@/next/service/lineage/main/lineage.vue'

export default {
  props: {
    modelId: {
      required: true,
      type: [String, Number]
    },
    currentModel: {
      type: Object
    },
    modelLevel: {
      type: String,
      required: true
    }
  },
  components: {
    lineageGraph,
    modelList,
    modelItemTitle
  },
  mounted () {
    this.dataInit()
  },

  data () {
    return {
      tabLoading: false,
      currentTab: 'upstreamList',
      modelLevelArr: ['ModelA', 'ModelB', 'ModelC', 'ModelCA', 'ModelD']
      // modelLevelArr: ['Model-A', 'Model-B', 'Model-C', 'Model-C-Apostrophe', 'Model-D'],
    }
  },
  methods: {
    dataInit () {
      if (!this.modelLevel) {
        this.currentTab = 'lineage'
      }
      if (this.modelLevel === this.modelLevelArr[0]) {
        this.currentTab = 'downstreamList'
      }
    }
  }
}
