<template>
  <div class="table-box-page" v-loading="loading">
    <div class="datablau-icon" :class="[assetType]">
      <datablau-icon
        class="iconBox"
        :data-type="assetType"
        :size="32"
      ></datablau-icon>
    </div>
    <div class="table-info">
      <div class="name">
        {{
          info.logicalName
            ? `${info.physicalName}(${info.logicalName})`
            : info.physicalName
        }}
        <span @click="editDir">
          <i class="iconfont icon-bianji" :title="'编辑'"></i>
        </span>
      </div>
      <div class="intro">
        <span>安全等级：{{ info.security ? info.security : '-' }}</span>
        <span>安全分类：{{ info.path ? info.path : '-' }}</span>
        <span>权威来源：{{ info.source }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import API from '@/view/dataSecurity/util/api'
export default {
  props: {
    assetInfo: {
      type: Object,
      default: () => {},
    },
    clickAsset: {
      type: Function,
    },
  },
  data() {
    return {
      info: {},
      assetType: '',
      loading: false,
    }
  },
  watch: {
    assetInfo: {
      handler(val) {
        if (val.assetId) {
          this.getAssetInfo(val)
        }
      },
      immediate: true,
      deep: true,
    },
  },
  mounted() {},
  methods: {
    getTypeIcon(typeId) {
      switch (parseFloat(typeId)) {
        case 80000004:
          this.assetType = 'TABLE'
          break
        case 80500008:
          this.assetType = 'VIEW'
          break
        case 80000005:
          this.assetType = 'COLUMN'
          break
        default:
          break
      }
    },
    editDir() {
      this.clickAsset('assetInfo', { id: this.assetInfo.assetId })
    },
    getAssetInfo(params) {
      this.loading = true
      API.getAssetInfo(params)
        .then(res => {
          this.loading = false
          this.info = res.data.data
          this.getTypeIcon(this.info.typeId)
          // 当前资产的信息，传给index，提交时使用
          this.$bus.$emit('assetInfo', this.info)
        })
        .catch(e => {
          this.loading = false
          this.$showFailure(e)
        })
    },
  },
}
</script>

<style scoped lang="scss">
.table-box-page {
  padding: 0 20px;
  height: 64px;
  padding-bottom: 8px;
  &:after {
    content: '';
    clear: both;
    display: block;
  }
  .datablau-icon {
    float: left;
    width: 56px;
    height: 56px;
    line-height: 56px;
    border-radius: 6px;
    text-align: center;
    &.TABLE {
      background: transparentize($color: #409eff, $amount: 0.9);
    }
    &.VIEW {
      background: transparentize($color: #4b5cc4, $amount: 0.9);
    }
    &.COLUMN {
      background: transparentize($color: #b44c97, $amount: 0.9);
    }
    /deep/ .img-icon-outer {
      margin-top: 12px;
    }
  }
  .table-info {
    float: left;
    margin-left: 8px;
    .name {
      height: 32px;
      line-height: 32px;
      font-size: 14px;
      font-weight: 600;
      color: #555555;
      span {
        vertical-align: middle;
        display: inline-block;
        margin-left: 4px;
        height: 24px;
        width: 24px;
        line-height: 24px;
        text-align: center;
        border-radius: 2px;
        cursor: pointer;
        &:hover {
          background-color: var(--tree-current-bgc);
          i {
            color: #409eff;
          }
        }
        i {
          color: #409eff;
          font-size: 14px;
        }
      }
    }
    .intro {
      margin-top: 4px;
      height: 14px;
      line-height: 14px;
      font-size: 14px;
      color: #555555;
      span {
        float: left;
        padding-right: 8px;
        margin-right: 8px;
        border-right: 2px solid #ddd;
        &:last-child {
          padding-right: 0;
          margin-right: 0;
          border-right: 0;
        }
      }
    }
  }
}
</style>
