<template>
  <div class="model-lineage">
    <el-dialog
      :fullscreen="true" :modal-append-to-body="true" :append-to-body="true" :close-on-click-modal="false"
      :close-on-press-escape="false" :show-close="false" :visible.sync="showDialog">
      <lineage :modelId="modelId" v-if="modelId" :entityId="entityId" :isModel="isModel" :title="entityName"></lineage>
    </el-dialog>
  </div>
</template>

<script>
import lineage from './lineageGraph.vue'
// import lineage from '@/next/service/lineage/main/lineage.vue'

export default {
  name: 'modelLineage',
  data () {
    return {
      modelId: '',
      entityId: '',
      entityName: '',
      isModel: false,
      showDialog: true
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
      const query = this.$route.query
      if (query && query.modelid) {
        this.modelId = query.modelid
      }
      if (query && query.entityid) {
        this.entityId = query.entityid
      }
      if (query && query.entityid) {
        this.entityName = query.entityname
      }

      // console.log('dataInit')
    }
  },
  watch: {}
}
</script>

<style lang="scss" scoped>

</style>
