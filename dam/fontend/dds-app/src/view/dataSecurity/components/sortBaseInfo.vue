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
              v-if="hasManageAuth && !isView"
              class="iconfont icon-bianji"
              :title="$t('securityModule.edit')"
            ></i>
          </span>
        </div>
        <is-show-tooltip
          class="assets-type"
          :content="
            $t('accessControl.classificationType') +
            '：' +
            heightCatalog.catalogType
          "
          :refName="'catalogType'"
        ></is-show-tooltip>
      </div>
    </div>
    <div class="right-part" ref="rightBox">
      <datablau-button
        v-if="$auth.DATA_SECURITY_CATALOG_ASSETS_EXPORT && !isView"
        @click="exportResult"
        class="iconfont icon-export"
      >
        {{ $t('securityModule.export') }}
      </datablau-button>
    </div>
  </div>
</template>

<script>
import isShowTooltip from '@/view/dataSecurity/components/isShowTooltip.vue'
import API from '@/view/dataSecurity/util/api'
export default {
  components: {
    isShowTooltip,
  },
  props: {
    isView: {
      type: Boolean,
      default: false,
    },
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
        ? window.setting.iconApiPathName +
          '/datasecurity/datasecurity/structure/icon/' +
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
    exportResult() {
      API.exportCatalogResult(this.heightCatalog.id)
        .then(res => {
          this.$bus.$emit('getTaskJobResult', res.data, 'export')
        })
        .catch(e => {
          this.$showFailure(e)
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
    height: 48px;
    line-height: 48px;
    vertical-align: middle;
    &:after {
      content: '';
      display: block;
      clear: both;
    }
  }
}
</style>
