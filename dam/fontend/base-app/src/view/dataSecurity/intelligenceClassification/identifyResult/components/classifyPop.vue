<template>
  <div class="classification-content">
    <div class="head-box">
      <div class="icon">
        <img
          :src="getIcon(catalogInfo.icon)"
          style="width: 20px; max-height: 20px"
        />
      </div>
      <div class="right-content">
        <div class="title">{{ catalogInfo.catalogName }}</div>
        <div class="brief">
          <i class="iconfont icon-file"></i>
          {{ catalogInfo.catalogPath }}
        </div>
      </div>
    </div>
    <div class="intro-content">
      <div class="list">
        <div class="name">分类类型：</div>
        <div class="brief">{{ catalogInfo.type }}</div>
      </div>
      <div class="list">
        <div class="name">分类描述：</div>
        <div class="brief">{{ catalogInfo.desc }}</div>
      </div>
    </div>
  </div>
</template>

<script>
import folder from '@/assets/images/search/folder.svg'
export default {
  props: {
    catalogInfo: {
      type: Object,
      default() {
        return {}
      },
    },
  },
  data() {
    return {}
  },
  mounted() {},
  methods: {
    getIcon(icon) {
      return icon
        ? window.setting.restApiPathName + '/service/ddc/config/icon/' + icon
        : folder
    },
  },
}
</script>

<style lang="scss">
.classification-card-popover {
  padding: 15px 8px;
  .classification-content {
    .head-box {
      padding-bottom: 8px;
      border-bottom: 1px solid #ddd;
      &:after {
        content: '';
        display: block;
        clear: both;
      }
      .icon {
        height: 24px;
        width: 24px;
        border-radius: 50%;
        float: left;
        // background: transparentize($color: #409eff, $amount: 0.9);
      }
      .right-content {
        margin-left: 4px;
        float: left;
        width: 270px;
        .title {
          line-height: 20px;
          font-size: 14px;
          font-weight: 500;
          color: #555555;
        }
        .brief {
          margin-top: 4px;
          line-height: 16px;
          font-size: 12px;
          i {
            font-size: 14px;
            color: #999;
          }
        }
      }
    }
  }
  .intro-content {
    .list {
      height: 17px;
      line-height: 17px;
      color: #555;
      font-size: 12px;
      margin-top: 8px;
      .name {
        float: left;
        font-weight: 500;
      }
      .brief {
        float: left;
      }
    }
  }
}
</style>
