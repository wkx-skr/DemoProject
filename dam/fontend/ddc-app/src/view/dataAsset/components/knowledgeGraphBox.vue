<template>
  <div
    class="knowledgeBox"
    :style="{
      top: `${84 + topH}px`,
    }"
  >
    <knowledgeGraph
      ref="knowledgeGraph"
      v-if="summaryLoaded"
      :summary="summary"
      :currentNode="currentNode"
      :permission="permission"
      :structureId="structureId"
      :editable="editable"
      name="assets"
    ></knowledgeGraph>
  </div>
</template>

<script>
import { number } from 'echarts'
import knowledgeGraph from './knowledgeGraph/main.vue'
export default {
  components: { knowledgeGraph },
  props: {
    currentNode: {
      type: Object,
      default: () => {
        return {}
      },
    },
    topH: {
      type: Number,
      default: 0,
    },
    permission: {
      type: String,
    },
    structureId: {
      type: [Number, String],
      default: '',
    },
    editable: {
      type: Boolean,
      default: false,
    }
  },
  data() {
    return {
      summaryLoaded: true,
      summary: { properties: { TypeId: '60010076', Id: this.currentNode.id } }, // 80010076
    }
  },
  methods: {},
  mounted() {
    // console.log(this.topH)
  },
}
</script>

<style scoped lang="scss">
.knowledgeBox {
  position: absolute;
  padding: 0 20px;
  top: 172px;
  left: 0px;
  right: 0;
  bottom: 0;
  overflow: scroll;
  min-width: 1115px;
}
</style>
