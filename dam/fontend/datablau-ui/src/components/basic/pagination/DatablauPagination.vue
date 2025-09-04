<template>
  <div class="datablau-pagination">
    <el-pagination
      :test-name="testName"
      v-bind="$attrs"
      v-on="$listeners"
      :layout="layout"
      popper-class="pagination_select"
    ></el-pagination>
  </div>
</template>

<script>
export default {
  name: 'DatablauPagination',
  props: {
    testName: String,
    layout: {
      type: String,
      required: false,
      default: 'total, sizes, prev, pager, next',
    },
  },
  data() {
    return {}
  },
  beforeMount() {},
  methods: {},
  computed: {},
  watch: {},
}
</script>

<style lang="scss" scoped="scoped">
@import '../../color';
</style>
<style lang="scss">
@import '../../color';
.datablau-pagination {
  .el-select {
    .el-input {
      .el-select__caret {
        font-size: 16px;
        margin-right: 2px;
        color: #999999;
      }
    }
  }
  .el-pagination {
    color: $text-default;
    padding: 0;
  }
  .el-input--mini .el-input__inner {
    height: 30px;
    line-height: 30px;
  }
  .el-pagination__editor.el-input .el-input__inner {
    height: 30px;
    border-radius: 2px;
    line-height: 30px;
  }
  .el-pagination button:disabled {
    color: $border-color;
    &:hover {
      background: transparent !important;
    }
  }
  .el-pagination button,
  .el-pagination span:not([class*='suffix']) {
    height: 30px;
    font-size: 12px;
    line-height: 30px;
  }
  .el-pagination button {
    height: 24px;
    padding: 0;
    margin-top: 3px;
    color: $text-disabled;
    &:hover {
      color: $primary-color;
    }
  }
  .el-pagination__total {
    font-size: 12px;
    color: $text-default;
    margin-right: 3px;
  }
  .el-pagination__sizes {
    margin: 0 3px 0 0;
  }
  .el-pagination .btn-prev {
    padding: 0;
    min-width: 24px;
  }
  .el-pagination .btn-next {
    padding-left: 0px;
    min-width: 24px;
  }
  .el-pagination__jump {
    margin-left: 8px;
  }
  .el-pagination__editor {
    margin: 0 8px;
    height: 30px;
    padding: 0;
  }
  .el-pagination__jump {
    color: $text-default;
  }
  .el-input__inner:hover {
    border-color: $primary-color;
  }
  .el-pagination__editor.el-input {
    width: 56px;
  }
  .el-input__inner {
    border-color: $border-color;
  }
  .el-pager .more::before {
    line-height: 26px !important;
  }
  .el-pager li {
    margin-top: 2px;
    font-size: 12px;
    min-width: 24px;
    height: 24px;
    line-height: 24px;
    padding: 0 4px;
    font-weight: normal;
  }
  .el-pager li:hover {
    background: $table-hover-color !important;
    color: $primary-color;
  }
  .el-pagination button:hover {
    background: $table-hover-color !important;
    border-radius: 2px;
  }
  .el-pagination__sizes .el-input .el-input__inner {
    font-size: 12px;
    text-align: left;
  }
}
.pagination_select {
  min-width: 100px !important;
  .el-select-dropdown__item {
    height: 30px;
    line-height: 30px;
    padding: 0 8px;
    text-align: left;
  }
  .el-select-dropdown__item.hover,
  .el-select-dropdown__item:hover {
    background-color: $table-hover-color;
  }
}
</style>
