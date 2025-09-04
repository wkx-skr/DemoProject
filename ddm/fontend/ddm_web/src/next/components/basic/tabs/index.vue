<template>
  <div
    class="datablau-tabs"
    :class="[
      hasContent ? '' : 'datablau-tabs-content',
      $attrs.type === 'card' ? 'datablau-tabs-card' : 'datablau-tabs-normal',
      noBottom ? 'noBottom' : '',
      themeBlack?'black-theme': ''
    ]"
  >
    <el-tabs
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
    hasContent: {
      type: Boolean,
      default: true,
    },
    noBottom: {
      type: Boolean,
      default: false,
    },
    themeBlack: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  data() {
    return {
      editorTheme: localStorage.getItem('editorTheme')
    }
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
                border-color: #DDD;
                background-color: #F5F5F5;
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
    &.noBottom{
      /deep/ .el-tabs {
        .el-tabs__nav-wrap {
          .el-tabs__item{
            &.is-active{
              background: #45484a !important;
              border-bottom: 2px solid #45484a !important;
              &:hover{
                background: #45484a !important;
                border-bottom: 2px solid #45484a !important;
              }
            }
            &:hover{
              background: #333333!important;
              border-bottom: 2px solid #333333 !important;
            }
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
        line-height: 28px !important;
      }
      .el-icon-close {
        top: -2px;
        &:hover {
          background-color: $primary-color;
        }
      }
    }
  }
  &.black-theme{
      /deep/ .el-tabs {
        &.el-tabs--card {
          .el-tabs__header {
            border-bottom: 0;
            .el-tabs__nav {
              box-sizing: border-box;
              border: none;
              &:hover{
                .el-tabs__item {
                  background: #333;
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
        .el-tabs__nav-wrap {
          .el-tabs__item{
              background:  transparent !important;
              border-bottom: 2px solid  #3C3F41 !important;
              border: none !important;
              color: #BBBBBB;
              .el-icon-close{
                color: #666F72;;
                &:hover{
                  background-color: #666666;
                  color: #333;
                }
              }
              &.is-closable{
                height: 32px !important;
                line-height: 32px !important;
                color: #bbb;
              }
            &.is-active{
              background: transparent !important;
              border-bottom: 2px solid #409eff !important;
              color: #409EFF !important;
              &:hover{
                background: #45484a !important;
                border-bottom: 2px solid #409eff !important;
              }
            }
            &:hover{
              background: #333333!important;
              border-bottom: 2px solid #333333 !important;
              color: #409EFF !important;
            }
          }
        }
        .el-tabs__nav-wrap:after{
          background-color: #4D4D4D;
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
      .el-tabs__nav-wrap {
          .el-tabs__item{
            &.is-active{
              background: transparent !important;
              border-bottom: 2px solid transparent !important;
              color: #409EFF !important;
              &:hover{
                background: transparent !important;
                border-bottom: 2px solid transparent !important;
              }
            }
            &:hover{
              background: transparent !important;
              border-bottom: 2px solid transparent !important;
            }
          }
      }
    }
  }
}
</style>
