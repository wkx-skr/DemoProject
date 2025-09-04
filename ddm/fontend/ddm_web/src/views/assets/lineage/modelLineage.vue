<template>
  <div class="model-lineage">
    <lineage
      :modelId="modelId"
      :type="type"
    ></lineage>
  </div>
</template>

<script>
import lineage from './lineageGraph.vue'

export default {
  name: 'modelLineage',
  data () {
    return {}
  },
  props: {
    modelId: {
      type: [String, Number],
      required: true
    },
    type: {
      type: [String, Number], // businessArea
      default: '' // LogicalBusinessDomain  逻辑领域模型 ConceptualBusinessDomain  概念领域模型
    }
  },
  components: {
    lineage
  },
  computed: {},
  mounted () {
    this.dataInit()
  },
  methods: {
    dataInit () {
      // console.log('dataInit')
      console.log(this.type, 'type')
    }
  },
  watch: {}
}
</script>

<style lang="scss" scoped>
.model-lineage {
  border: 1px solid #eee;
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
}
</style>
