<template>
  <div class="tree-header">
    <div class="tree-name">
      <slot name="title"></slot>
      <slot name="more"></slot>
    </div>
    <div class="tree-search-box">
      <slot name="search"></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DatablauTreeHeader',
  data() {
    return {}
  },
  created() {},
  mounted() {},
  methods: {},
}
</script>

<style scoped lang="scss">
@import '~@/next/components/basic/color.sass';
.tree-header {
  .tree-name {
    height: 44px;
    line-height: 24px;
    padding: 10px;
    padding-right: 7px;
    font-size: 16px;
    font-weight: 600;
    > div {
      float: right;
      line-height: 24px;
      height: 24px;
      width: 24px;
      text-align: center;
      cursor: pointer;
      font-size: 14px;
      border-radius: 2px;
      color: #999;
      &:hover {
        background-color: var(--tree-current-bgc);
        transition: background-color 0.3s;
        color: $primary-color;
      }
    }
    i {
      float: right;
      line-height: 24px;
      height: 24px;
      width: 24px;
      text-align: center;
      cursor: pointer;
      font-size: 14px;
      border-radius: 2px;
      color: #999;
      &:hover {
        background-color: var(--tree-current-bgc);
        transition: background-color 0.3s;
        color: $primary-color;
      }
    }
  }
  .tree-search-box {
    position: relative;
    height: 32px;
    .datablau-input {
      position: absolute;
      top: 0px;
      left: 10px;
      right: 10px;
    }
    .datablau-select {
      position: absolute;
      top: 0px;
      left: 10px;
      right: 10px;
    }
  }
}
</style>
