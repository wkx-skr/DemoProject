<template>
  <div
    class="datablau-tabs"
    :class="[
      hasContent ? '' : 'datablau-tabs-content',
      $attrs.type === 'card' ? 'datablau-tabs-card' : 'datablau-tabs-normal',
    ]"
  >
    <el-tabs
      :test-name="testName"
      v-model="$attrs.active || $attrs.value"
      v-on="$listeners"
      v-bind="$attrs"
      ref="tabs"
    >
      <slot></slot>
    </el-tabs>
  </div>
</template>

<script>
export default {
  name: 'DatablauTabs',
  props: {
    testName: String,
    hasContent: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {}
  },
  methods: {},
}
</script>

<style scoped lang="scss">
@import '../color';
.datablau-tabs {
  &.datablau-tabs-content {
    /deep/ .el-tabs {
      .el-tabs__content {
        height: 0;
      }
    }
  }
  &.datablau-tabs-normal {
    /deep/ .el-tabs {
      .el-tabs__header {
        .el-tabs__nav {
          .el-tabs__item {
            border: 0 !important;
            &:nth-child(2) {
              padding-left: 0 !important;
            }
          }
        }
      }
      &.el-tabs--border-card {
        .el-tabs__header {
          .el-tabs__nav {
            .el-tabs__item {
              &:nth-child(2) {
                padding-left: 10px !important;
              }

              &:last-child {
                padding-right: 10px !important;
              }
            }
          }
        }
      }
    }
  }
  &.datablau-tabs-card {
    /deep/ .el-tabs {
      &.el-tabs--card {
        .el-tabs__header {
          border-bottom: 0;
          .el-tabs__nav {
            box-sizing: border-box;
            border: none;
            .el-tabs__item {
              border: 1px solid $border-color;
              border-left: 1px solid transparent;
              line-height: 30px;
              position: relative;
              &:nth-child(2) {
                padding-left: 10px;
              }
              &:nth-of-type(1) {
                border-left: 1px solid $border-color;
              }

              &.is-active {
                border: 1px solid $primary-color;
                z-index: 1;
              }

              &:last-child {
                padding-right: 10px;
              }

              &.is-disabled {
                border-color: #ddd;
                background-color: #f5f5f5;
                color: #999;
                cursor: default;

                &:hover {
                  color: #999;
                }
              }
            }
          }
        }
      }
      &.el-tabs--border-card {
        .el-tabs__item {
          &:nth-child(2) {
            padding-left: 10px;
          }

          &:last-child {
            padding-right: 10px;
          }
        }
      }
    }
  }
  /deep/ .el-tabs {
    .el-tabs__nav-wrap {
      &:after {
        height: 1px;
        // height: 0.5px;
        background-color: $border-color;
      }
      .el-tabs__active-bar {
        border-radius: 2px 2px 0px 0px;
      }
      .el-tabs__item {
        color: $text-default;
        &.is-active {
          color: $primary-color;
        }
        &:hover {
          color: $primary-color;
        }
      }
    }
    .el-tabs__item {
      padding: 0 10px;
      height: 32px;
      line-height: 32px;
      font-size: 12px;
      box-shadow: none !important;
      &:nth-child(1) {
        border-radius: 2px 0px 0px 2px;
      }
      &:nth-child(2) {
        padding-left: 0;
      }
      &:last-child {
        padding-right: 0;
        border-radius: 0px 2px 2px 0px;
      }
      &.is-closable {
        height: 28px !important;
        line-height: 26px !important;
      }
      .el-icon-close {
        top: -2px;
        &:hover {
          background-color: $primary-color;
        }
      }
    }
  }
}
</style>
