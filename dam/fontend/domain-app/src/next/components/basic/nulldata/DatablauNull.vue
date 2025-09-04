<template>
  <div class="datablau-null">
    <div v-if="!contentType">
      <datablau-icon
        :test-name="testName"
        :data-type="iconType"
        :icon-type="svg"
        :size="size"
      ></datablau-icon>
      <p>{{ tipDisplay }}</p>
    </div>
    <div v-else class="nocontent">
      <datablau-icon
        :test-name="testName"
        style="margin: 0 10px"
        :data-type="iconType"
        :icon-type="svg"
        :size="sizeContent"
      ></datablau-icon>
      <div class="nocontent-tip" :style="{ height: size }">
        <slot name="slotContent"></slot>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DatablauNull',
  props: {
    testName: String,
    tip: {
      type: String,
      default: '',
    },
    type: {
      type: String,
      default: 'data',
    },
    svg: {
      type: String,
      default: 'svg',
    },
    size: {
      type: Number,
      default: 160,
    },
    contentType: {
      type: Boolean,
      default: false,
    },
    sizeContent: {
      type: Number,
      default: 40,
    },
  },
  computed: {
    iconType() {
      switch (this.type) {
        case 'data':
          return 'no-result'
          break
        case 'search':
          return 'search-result'
          break
        case 'error':
          return 'err-result'
          break
        case 'nocontent':
          return 'no-content'
          break
        default:
          return 'no-result'
          break
      }
    },
    tipDisplay() {
      if (this.tip) {
        return this.tip
      } else {
        return this.$t('component.table.noData')
      }
    },
  },
  data() {
    return {}
  },
  created() {},
  mounted() {},
  methods: {},
}
</script>

<style scoped lang="scss">
@import '../color';
.datablau-null {
  position: relative;
  padding-top: 20px;
  // line-height: inherit;
  .noresult-img {
    width: 90px;
    margin: 0 auto;
    margin-top: 30px;
    img {
      width: 90px;
      height: auto;
    }
  }
  p {
    text-align: center;
    // margin-top: 14px;
    font-size: 12px;
    line-height: 12px;
    color: $text-default;
    // width: 180px;
  }
  .nocontent {
    display: flex;
    align-items: center;
    .nocontent-tip {
      font-size: 12px;
      color: $text-disabled;
    }
  }
}
</style>
