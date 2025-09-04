<template>
  <div class="map-lineage">
    <div class="top-bar">
      <span>
        {{ object.physicalName }}
        <span v-if="object.name">({{ object.name }})</span>
        {{ $t('meta.map.allLineage') }}
      </span>
      <i class="fa fa-close" @click="handleClose"></i>
    </div>
    <div
      style="position: absolute; top: 40px; right: 0; left: 0; bottom: 0"
      ref="linegraphCon"
      class="map-lineage-con"
    >
      <lineage-graph
        ref="lineageGraph"
        :data="object"
        :canRealFullscreen="true"
        @resetFullScreen="resetFullScreen"
        from="map"
      ></lineage-graph>
    </div>
  </div>
</template>
<script>
import lineageGraph from '../dataProperty/dataCatalog/consanguinityGraph.vue'
export default {
  props: {
    object: {
      type: Object,
      default: () => {
        return {}
      },
    },
  },
  components: {
    lineageGraph,
  },
  methods: {
    handleClose() {
      this.$emit('close')
    },
    resetFullScreen(bool) {
      this.$emit('resetFullScreen', bool)
    },
  },
  mounted() {
    const dom = this.$refs.linegraphCon
    Ps.initialize(dom)
    console.log('init')
  },
}
</script>
<style lang="scss" scoped>
.top-bar {
  height: 40px;
  line-height: 40px;
  background-color: #666;
  span {
    margin-left: 1em;
    color: lightblue;
    font-size: 16px;
  }
  i {
    float: right;
    margin: 0.35em 0.4em;
    font-size: 20px;
    display: inline-block;
    cursor: pointer;
    width: 26px;
    height: 26px;
    line-height: 26px;
    border-radius: 13px;
    text-align: center;
    &:hover {
      background: #888;
    }
  }
}
</style>
<style lang="scss">
.map-lineage {
  .map-lineage-con {
    .graph-outer {
      //overflow: visible;
    }
  }
}
</style>
