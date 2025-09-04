<template>
  <div class="views-list-container">
    <div class="view-box-contianer" v-for="view in viewsList" :key="view.uuid">
      <view-box
        :oldviewData="view"
        @updataViews="updataViews"
        @deteleView="deteleView"
        @checkView="checkView"
      ></view-box>
    </div>
    <div class="empty-text" v-if="!viewsList || viewsList.length === 0">
      暂无数据
    </div>
  </div>
</template>

<script>
import viewBox from './viewBox.vue'
export default {
  data() {
    return {}
  },
  components: {
    viewBox,
  },
  props: {
    viewsList: {
      type: Array,
      required: true,
    },
  },
  computed: {},
  mounted() {},
  methods: {
    updataViews(args) {
      this.$emit('updataViews', args)
    },
    deteleView(args) {
      this.$emit('updataViews', args)
    },
    checkView(args) {
      this.$emit('checkView', args)
    },
  },
  watch: {},
}
</script>

<style lang="scss">
.views-list-container {
  // border: 1px solid red;
  // display: flex;
  // flex-wrap: wrap;
  // justify-content: flex-start;
  // min-width: 760px;
  // max-height: 500px;
  width: 100%;
  min-height: 400px;
  // overflow: auto;
  .view-box-contianer {
    // width: 500px;
    width: 28%;
    min-width: 250px;
    max-width: 500px;
    display: inline-block;
  }
  .empty-text {
    text-align: center;
    padding-top: 100px;
  }
}
</style>
