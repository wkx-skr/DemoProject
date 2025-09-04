<template>
  <div class="datablau-pagination" :class="[this.type]">
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
import $ from 'jquery'
export default {
  name: 'DatablauPagination',
  props: {
    type: {
      type: String,
      default: '',
    },
    testName: String,
    // layout: {
    //   type: String,
    //   required: false,
    //   default: 'total, sizes, prev, jumper, next',
    // },
  },
  data() {
    return {
      layout: 'total, sizes, prev, jumper, next',
    }
  },
  beforeMount() {},
  mounted() {},
  methods: {
    updateJumpText() {
      const jumpElement = $(this.$el).find('.el-pagination__jump')[0]
      if (jumpElement) {
        const jump = jumpElement.childNodes
        jump[0].nodeValue = ' '
        jump[2].nodeValue = '/'
        if ($(this.$el).find('.jump-text').length === 0) {
          var element = document.createElement('span')
          element.className = 'jump-text'
          var textNode = document.createTextNode('')
          element.appendChild(textNode)
          $(this.$el).find('.el-pagination__jump')[0].appendChild(element)
        }
        this.$nextTick(() => {
          $(this.$el).find('.jump-text')[0].childNodes[0].nodeValue =
            this.wholePage + ' ' + this.$t('el.pagination.pageClassifier')
        })
      }
    },
  },
  computed: {
    wholePage() {
      if (!this.$attrs.total) {
        return 1
      } else {
        return Math.ceil(
          Number(this.$attrs.total) /
            Number(this.$attrs['page-size'] || Number(this.$attrs.pageSize))
        )
      }
    },
  },
  watch: {
    $attrs: {
      handler() {
        // console.log(this.$attrs)
        if (this.type === 'ES') {
          this.layout = 'prev, pager, next'
        }
        if (this.layout.indexOf('jumper') !== -1) {
          this.updateJumpText()
        }
      },
      immediate: true,
      deep: true,
    },
  },
}
</script>

<style lang="scss" scoped="scoped">
@import '../color';
</style>
<style lang="scss">
@import '../color';
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
    margin-left: 0px;

    .jump-text {
      min-width: 8px;
      margin-left: 4px;
      margin-right: 4px;
    }
  }
  .el-pagination__editor {
    margin: 0 8px 0 4px;
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
    width: 40px;
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
  &.ES {
    .el-pagination button {
      margin-top: 0;
      padding-left: 4px;
      padding-right: 4px;
      height: 30px;
    }
    .el-pager li {
      height: 26px;
      line-height: 26px;
      margin-left: 4px;
      &:hover {
        color: #555;
      }
      &.active {
        background-color: rgba(64, 158, 255, 0.1) !important;
        color: #409eff;
      }
    }
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
