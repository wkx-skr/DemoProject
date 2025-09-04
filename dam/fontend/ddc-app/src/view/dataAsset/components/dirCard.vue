<template>
  <el-card
    shadow="hover"
    class="dir-item"
    :class="{
      add: isAdd,
      'no-jump': noJump,
    }"
  >
    <template v-if="isAdd">
      <div @click="handleCardClick" style="padding-top: 20px; height: 100%">
        <img
          src="@/assets/images/dataAssets/plus.svg"
          alt=""
          style="height: 20px; color: #409eff"
        />
        <span>
          {{ $t('assets.summaryInfo.newDir') }}
        </span>
      </div>
    </template>
    <div
      v-else
      :class="dirData.type"
      @click="handleCardClick"
      :style="{
        cursor: noJump ? 'default' : 'pointor',
      }"
    >
      <div style="display: flex; justify-content: space-between">
        <div>
          <div style="display: inline-block; max-width: 110px">
            <is-show-tooltip
              :content="dirData.name"
              :refName="'dirName'"
            ></is-show-tooltip>
          </div>

          <p class="dir-count">{{ dirData.totalAssets || 0 }}</p>
        </div>
        <div
          style="display: flex; flex-direction: column; align-items: flex-end"
        >
          <div
            v-if="dirData.status === 'PUBLISHED'"
            class="child-status published"
          >
            <img
              src="@/assets/images/dataAssets/published.svg"
              alt=""
              style="height: 14px"
            />
            <span>{{ $t('assets.summaryInfo.publishedText') }}</span>
          </div>
          <div
            v-if="dirData.status === 'UNDER_REVIEW'"
            class="child-status checking"
          >
            <img
              src="@/assets/images/dataAssets/checking.svg"
              alt=""
              style="height: 14px"
            />
            <span>{{ $t('assets.summaryInfo.reviewText') }}</span>
          </div>
          <div
            v-if="dirData.status === 'UNPUBLISHED'"
            class="child-status unpublish"
          >
            <img
              src="@/assets/images/dataAssets/shangchuan.svg"
              alt=""
              style="height: 14px"
            />
            <span>{{ $t('assets.summaryInfo.unpublishText') }}</span>
          </div>
          <div v-if="dirData.status === 'OFFLINE'" class="child-status offline">
            <img
              src="@/assets/images/dataAssets/offline.svg"
              alt=""
              style="height: 14px"
            />
            <span>{{ $t('assets.summaryInfo.offlineText') }}</span>
          </div>
          <el-rate
            v-if="$versionFeature.dataasset_AssetComments"
            class="dir-star"
            v-model="dirData.star"
            disabled
            text-color="#777"
            score-template="{value}"
          ></el-rate>
        </div>
      </div>
      <div class="dir-bottom">
        <span class="dir-date">
          <is-show-tooltip
            :content="dirData.createTime && dirData.createTime.slice(0, 10)"
            :refName="'dirData.createTime && dirData.createTime.slice(0, 10)'"
          ></is-show-tooltip>
        </span>
        <span style="padding: 0 10px; color: #ddd">
          <is-show-tooltip content="|" refName="'|'"></is-show-tooltip>
        </span>
        <span class="dir-owner">
          <is-show-tooltip
            :content="dirData.dataOrg"
            :refName="'dirData.dataOrg'"
          ></is-show-tooltip>
        </span>
      </div>
    </div>
  </el-card>
</template>

<script>
import isShowTooltip from '@/components/common/isShowTooltip/isShowTooltip.vue'
export default {
  name: 'dirCard',
  inject: {
    isOverview: {
      value: 'isOverview',
      default: false,
    },
  },
  components: {
    isShowTooltip,
  },
  props: {
    dirData: {
      type: Object,
      default() {
        return {}
      },
    },
    isAdd: {
      type: Boolean,
      default: false,
    },
    noJump: { type: Boolean, default: false },
    authFunction: { type: Function },
    authTooltip: { type: Function },
  },
  methods: {
    handleCardClick() {
      if (!this.dirData.authType) {
        this.$datablauMessage({
          message: '没有该目录的访问权限',
          type: 'warning',
          duration: 5000,
        })
        return
      }
      if (this.isAdd) {
        this.$emit('clickCard', this.dirData)
      } else {
        if (this.isOverview) {
          // 资产浏览可以点击
          this.$bus.$emit('changeTreeNode', this.dirData)
          return
        }
        if (this.authFunction && !this.authFunction(this.dirData)) {
          this.$bus.$emit('changeTreeNode', this.dirData)
        } else {
          let errorMsg = this.authTooltip
            ? this.authTooltip(this.dirData)
            : this.$t('assets.summaryInfo.noPermission', {
                type: this.$t('assets.summaryInfo.access'),
              })
          this.$datablauMessage({
            dangerouslyUseHTMLString: true,
            message: errorMsg,
            type: 'warning',
            showClose: true,
          })
        }
      }
    },
  },
}
</script>

<style lang="scss" scoped>
@import '~@/next/components/basic/color.sass';

.dir-star {
  margin-top: 5px;
  width: 70px;
  /deep/ .el-rate__item {
    padding-top: 3px;
    .el-rate__icon {
      font-size: 14px;
      margin-right: 0;
    }
  }
}
.dir-item {
  width: 200px;
  height: 90px;
  padding: 10px 12px;
  border-radius: 2px;
  margin-right: 10px;
  margin-bottom: 10px;
  cursor: pointer;
  color: #555;
  border-color: #ddd;
  &.add {
    padding: 10px;
    span {
      font-size: 12px;
      color: rgb(119, 119, 119);
      display: inline-block;
      vertical-align: middle;
      margin-left: 10px;
    }
  }
  &.no-jump {
    cursor: default;
    &:hover {
      border: 1px solid #ddd;
      box-shadow: none;
    }
  }
  &:hover {
    border: 1px solid #409eff;
    box-shadow: 0 2px 12px 0 rgba(64, 158, 255, 0.1);
  }
  .dir-name {
    max-width: 110px;
    /deep/ .datablau-tooltip {
      line-height: 14px;
      height: 14px;
      p {
        overflow: hidden;
        width: 110px !important;
        line-height: 14px;
        height: 18px;
        text-overflow: ellipsis;
        display: inline-block;
        white-space: nowrap;
        span {
          width: 100% !important;
          line-height: 14px;
          height: 18px;
          font-size: 14px;
          font-weight: 500;
          display: inline-block;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }
    }
  }
  .dir-count {
    margin-top: 6px;
    font-size: 18px;
    line-height: 18px;
    font-weight: 500;
    color: $text-message;
  }
  .dir-bottom {
    font-size: 12px;
    color: $text-message;
    margin-top: 7px;
    span {
      display: inline-block;
      text-align: right;
      &:first-child {
        text-align: left;
        width: 75px;
      }
      &:last-child {
        width: 75px;
      }
    }

    /deep/ .datablau-tooltip p {
      width: 100% !important;
      height: auto;
    }
    /deep/ .datablau-tooltip p span {
      font-size: 12px;
      width: 100% !important;
      font-weight: 500;
      display: inline-block;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
  .child-status {
    width: 55px;
    line-height: 14px;
    display: flex;
    justify-content: space-between;
    border-radius: 7px;
    font-size: 12px;
    padding: 2px 2px 2px 0;
    &.published {
      color: #66bf16;
      background-color: rgba(102, 191, 22, 0.1);
    }
    &.checking {
      color: #409eff;
      background-color: rgba(64, 158, 255, 0.1);
    }
    &.unpublish {
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
</style>
<style>
.dir-item .el-card__body {
  padding: 0;
}
.add .el-card__body {
  /* background-color: #f5f5f5; */
  height: 100%;
  text-align: center;
  border: 1px dashed #ddd;
}
</style>
