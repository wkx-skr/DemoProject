<template>
  <div
    class="datablau-list-search"
    v-resize="domResize"
    :class="{ 'hide-title': hideTitle, 'datablau-list-search-no': noMinWidth }"
    ref="listSearchBox"
  >
    <div class="list-title" v-if="$slots.title && !hideTitle">
      <slot name="title"></slot>
    </div>
    <div
      class="datablau-form-box"
      :class="{ 'no-title': !$slots.title }"
      ref="formBox"
    >
      <div class="list-search-box" ref="form" v-if="$slots.default">
        <slot></slot>
      </div>
      <div class="list-buttons" ref="btn">
        <slot name="buttons"></slot>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DatablauListSearch',
  data() {
    return {}
  },
  props: {
    hideTitle: {
      type: Boolean,
      default: false,
    },
    noMinWidth: {
      type: Boolean,
      default: false,
    },
  },
  created() {},
  mounted() {
    this.$nextTick(() => {
      // console.log($(this.$refs.title))
      // console.log(this.$slots)
    })
    this.$bus.$on('domResize', this.domResize)
  },
  methods: {
    domResize(data) {
      this.$nextTick(() => {
        const listSearchBox = this.$refs.listSearchBox
        const formBox = this.$refs.formBox
        const form = this.$refs.form
        const btn = this.$refs.btn
        const boxW = $(formBox).width()
        const btnW = $(btn).width()
        if (btnW) {
          $(form).css('width', boxW - btnW - 30 + 'px')
        }
        this.$emit('domResize', $(form).height())
      })
    },
  },
  computed: {},
}
</script>

<style scoped lang="scss">
.datablau-list-search {
  &.datablau-list-search-no {
    .datablau-form-box {
      .list-search-box {
        /deep/ .el-form {
          .el-form-item {
            .el-form-item__content {
              min-width: auto;
            }
          }
        }
      }
    }
  }
  .list-title {
    height: 40px;
    line-height: 40px;
    vertical-align: middle;
    font-size: 16px;
    font-weight: 600;
  }
  .datablau-form-box {
    &.no-title {
      // padding-top: 10px;
    }
    .list-search-box {
      display: inline-block;

      .search-item {
        margin-right: 20px;

        &:last-child {
          margin-right: 0;
        }

        span {
          padding-right: 6px;
        }
      }

      /deep/ .datablau-input {
        width: 240px;
        display: inline-block;
        margin-right: 10px;
        vertical-align: top;

        .el-input {
          width: 100% !important;
        }
      }

      .is-block {
        vertical-align: top;
      }

      /deep/ .datablau-select {
        width: 240px;
        display: inline-block;
        .datablau-tooltip {
          width: 100%;
        }
        .el-select {
          width: 100%;

          .el-input {
            width: 100% !important;
          }
        }
      }
      /deep/ .datablau-datarange {
        // 日期组件
        line-height: 34px;
      }
      /deep/ .el-form {
        .el-form-item {
          display: inline-block;
          margin-right: 20px;
          // margin-bottom: 0;
          vertical-align: top;
          &.min-form-item {
            .el-form-item__content {
              min-width: 120px;
            }
          }
          &.btn {
            margin-left: -10px;
            .el-form-item__content {
              min-width: auto;
            }
          }
          &:last-child {
            margin-right: 0;
          }
          .el-form-item__label {
            padding-right: 6px;
            line-height: 32px;
          }
          .el-form-item__content {
            display: inline-block;
            line-height: 32px;
            min-width: 240px;
            .datablau-input {
              width: 100%;
              margin-right: 0;
            }
          }
        }
      }
    }

    .list-buttons {
      float: right;
    }
  }

  &.hide-title {
    .list-title {
      display: none;
    }

    .list-search-box {
      padding-top: 10px;
    }
  }
}
</style>
