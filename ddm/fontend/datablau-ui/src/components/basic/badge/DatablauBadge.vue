<template>
  <div class="datablau-badge">
    <el-badge
      ref="datablauBadge"
      v-bind="$attrs"
      v-on="$listeners"
      :test-name="testName"
    >
      <slot></slot>
    </el-badge>
  </div>
</template>
<script>
export default {
  props: {
    testName: String,
    contntType: {
      type: String,
      default: '',
    },
  },
  name: 'DatablauBadge',
  data() {
    return {}
  },
  mounted() {
    if (this.contntType === 'text') {
      const badge_content_dom =
        this.$refs.datablauBadge.$el.querySelector('.el-badge__content')
      badge_content_dom.classList.add('content_right_0')
    }
  },
  methods: {},
}
</script>
<style lang="scss" scoped>
@import '../../color.sass';
.datablau-badge {
  display: inline-block;
  /deep/ .content_right_0 {
    right: 0;
  }
  .el-badge {
    cursor: pointer;
    /deep/ .el-badge__content {
      line-height: 16px;
    }
  }
}
</style>
