<template>
  <div class="top-base-info-page" ref="topBox">
    <div class="left-part" ref="leftBox">
      <div class="datablauIcon">
        <img
          v-if="catalogIcon.length"
          :src="catalogIcon"
          alt=""
          style="width: 48px; max-height: 48px"
        />
        <datablau-icon
          v-else
          class="iconBox"
          data-type="folder"
          :size="48"
        ></datablau-icon>
      </div>
      <div class="name-box" ref="nameBox">
        <div class="name">
          <is-show-tooltip
            :content="heightCatalog.name"
            :refName="'name'"
          ></is-show-tooltip>
          <span @click="editDir">
            <i
              v-if="hasManageAuth"
              class="iconfont icon-bianji"
              :title="'编辑'"
            ></i>
          </span>
        </div>
        <is-show-tooltip
          class="assets-type"
          :content="'分类类型：' + heightCatalog.catalogType"
          :refName="'catalogType'"
        ></is-show-tooltip>
      </div>
    </div>
    <!-- <div class="right-part" ref="rightBox">
      <ul>
        <li class="li-progressed">
          <p>
            完整度
            <datablau-tooltip
              :content="'完整度算法：' + baseInfo.completeness"
              placement="top"
              effect="dark"
              style="display: inline-block"
            >
              <i class="iconfont icon-tips" style="font-size: 12px"></i>
            </datablau-tooltip>
          </p>
          <datablau-progressed
            :percent="baseInfo.percent"
          ></datablau-progressed>
        </li>
        <li class="li-visit">
          <p>访问</p>
          <div class="partRight-box">
            <span>{{ baseInfo.visit }}</span>
            <span class="span-company">次</span>
          </div>
        </li>
      </ul>
    </div> -->
  </div>
</template>

<script>
import isShowTooltip from '@/view/dataProperty/meta/isShowTooltip.vue'
export default {
  components: {
    isShowTooltip,
  },
  props: {
    hasManageAuth: Boolean,
    clickChild: {
      type: Function,
    },
    editable: {
      type: Boolean,
      default: false,
    },
    heightCatalog: {
      type: Object,
      default() {
        return {}
      },
    },
  },
  data() {
    return {}
  },
  watch: {
    heightCatalog: {
      handler(val) {
        // console.log(val)
      },
      immediate: true,
      deep: true,
    },
  },
  computed: {
    catalogIcon() {
      const url = this.heightCatalog.icon
        ? window.setting.restApiPathName +
          '/service/ddc/config/icon/' +
          this.heightCatalog.icon
        : ''
      return url
    },
  },
  mounted() {},
  methods: {
    editDir() {
      this.clickChild('baseInfo', {
        type: 'edit',
        data: this.heightCatalog,
      })
    },
  },
}
</script>
<style lang="scss">
.el-popover {
  text-align: center;
}
</style>
<style scoped lang="scss">
@import '~@/next/components/basic/color.sass';
.top-base-info-page {
  padding: 20px 0;
  position: relative;
  width: 100%;
  &:after {
    content: '';
    clear: both;
    display: block;
  }
  .left-part {
    width: 500px;
    height: 48px;
    float: left;
    &:after {
      content: '';
      display: block;
      clear: both;
    }
    /deep/ .datablauIcon {
      float: left;
      height: 48px;
    }
    .name-box {
      float: left;
      margin-left: 16px;
      width: 420px;
      .name {
        line-height: 24px;
        height: 24px;
        color: #555555;
        font-size: 16px;
        font-weight: 500;
        /deep/ .text-tooltip {
          height: 24px;
          line-height: 24px;
          max-width: 380px;
          vertical-align: top;
          span {
            line-height: 24px;
          }
        }
      }
      span {
        vertical-align: top;
        line-height: 24px;
        width: 24px;
        height: 24px;
        margin-left: 10px;
        cursor: pointer;
        color: $primary-color;
        border-radius: 2px;
        display: inline-block;
        text-align: center;
        &:hover {
          background-color: var(--tree-current-bgc);
          transition: background-color 0.3s;

          .icon-bianji {
            color: $primary-color;
          }
        }
        i {
          font-size: 14px;
        }
      }

      .assets-type {
        font-size: 14px;
        line-height: 20px;
        color: #777;
      }
    }
  }
  .right-part {
    float: right;
    margin-top: 4px;
    height: 40px;
    // min-width: 850px;
    &:after {
      content: '';
      display: block;
      clear: both;
    }

    ul {
      li {
        float: left;
        position: relative;
        padding: 0 20px;
        &:after {
          content: '';
          position: absolute;
          height: 40px;
          width: 1px;
          background: #ddd;
          top: 0;
          right: 0px;
        }
        &:last-child {
          padding-right: 0;
          &:after {
            width: 0;
          }
        }
        &.li-authentication {
          .li-intro {
            width: 59px;
            height: auto;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 2px 2px 2px 0;
            // height: 14px;
            border-radius: 7px;
            &.published {
              color: #66bf16;
              background-color: rgba(102, 191, 22, 0.1);
            }
            &.checking {
              color: #409eff;
              background-color: rgba(64, 158, 255, 0.1);
            }
            &.unpublished {
              color: #5dc4c0;
              background-color: rgba(93, 196, 192, 0.1);
            }
            &.offline {
              color: #999;
              background-color: rgba(153, 153, 153, 0.1);
            }
            span {
              transform: scale(0.9);
            }
          }
        }
        &.li-progressed {
          /deep/ .el-progress {
            margin-top: 7px;
            .el-progress-bar {
              width: 100px;
              .el-progress-bar__outer {
                height: 6px !important;
              }
            }
            .el-progress__text {
              font-size: 12px !important;
            }
          }
        }
        &.li-collection {
          p {
            cursor: pointer;
            img {
              margin-left: 10px;
            }
          }
        }
        p {
          line-height: 14px;
          font-size: 12px;
          color: $text-default;
        }
        .li-intro {
          margin-top: 5px;

          img {
            display: block;
            width: 100%;
            height: auto;
          }
        }
        &.catalogue-attr {
          padding-top: 4px;
          span {
            height: 32px;
            line-height: 32px;
            padding: 0 10px;
            background: #409eff;
            border-radius: 2px;
            display: inline-block;
            color: #fff;
            cursor: pointer;
          }
        }
        .partRight-box {
          margin-top: 6px;
          span {
            font-size: 16px;
            color: $text-default;
            &.span-company {
              padding-left: 4px;
              font-size: 12px;
              color: $text-message;
            }
          }
        }
      }
    }
  }
}
</style>
