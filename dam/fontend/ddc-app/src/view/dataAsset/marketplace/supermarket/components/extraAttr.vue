<template>
  <span>
    <el-popover
      v-if="udps.length"
      popper-class="extra-attr-card-pop"
      placement="bottom"
      width=" 400"
      trigger="click"
    >
      <div class="attr attribute" slot="reference">
        <i class="iconfont icon-expand"></i>
        <span>{{ $t('assets.marketplace.attribute') }}</span>
      </div>
      <div class="extra-attr-content">
        <datablau-detail-subtitle
          :title="$t('assets.marketplace.extendAttr')"
          mt="0px"
          mb="0px"
          style="margin-left: 10px"
        ></datablau-detail-subtitle>
        <div class="item-content">
          <template v-if="udps.length">
            <div
              class="item"
              style="clear: both"
              v-for="item in udps"
              :key="item.id"
            >
              <div class="name">
                <is-show-tooltip
                  :content="item.name"
                  :open-delay="200"
                  :w="'84px'"
                  placement="bottom"
                >
                  <template>
                    {{ item.name }}
                  </template>
                </is-show-tooltip>
              </div>
              <div class="des">
                <is-show-tooltip :content="item.value"></is-show-tooltip>
              </div>
            </div>
          </template>
          <datablau-null
            v-else
            :size="120"
            style="
              height: 180px;
              display: flex;
              flex-direction: column;
              align-items: center;
            "
          ></datablau-null>
        </div>
      </div>
    </el-popover>
    <template v-else>
      <datablau-tooltip :content="$t('assets.marketplace.noData')">
        <div class="attr attribute">
          <i class="iconfont icon-expand"></i>
          <span>{{ $t('assets.marketplace.attribute') }}</span>
        </div>
      </datablau-tooltip>
    </template>
  </span>
</template>

<script>
import isShowTooltip from '@/components/common/isShowTooltip/isShowTooltip.vue'
export default {
  components: {
    isShowTooltip,
  },
  props: {
    udps: {
      type: Array,
      default() {
        return []
      },
    },
  },
  data() {
    return {
      visible: true,
      attrList: [],
    }
  },
  mounted() {
    console.log(this.udps)
  },
  methods: {
    closeDialog() {},
  },
}
</script>

<style lang="scss">
.extra-attr-card-pop {
  height: 252px;
  padding: 0;
  .extra-attr-content {
    padding: 16px 0;
    height: 100%;
    .db-detail-subtitle {
      .titleBorder {
        border-left: 4px solid #3c64f0;
      }
    }
    .item-content {
      height: calc(100% - 28px);
      padding-left: 12px;
      margin-right: 4px;
      margin-top: 8px;
      overflow-y: auto;
      &::-webkit-scrollbar {
        width: 8px;
      }
      &::-webkit-scrollbar-thumb {
        background: transparentize($color: #7c89a8, $amount: 0.8);
      }
      .item {
        height: 32px;
        line-height: 32px;
        font-size: 13px;
        .name {
          color: #7c89a8;
          width: 90px;
          float: left;
          margin-right: 16px;
          height: 32px;
          line-height: 32px;
          // text-align: right;
          .text-tooltip {
          }
        }
        .des {
          color: #354f7b;
          float: left;
          width: 260px;
        }
      }
    }
  }
}
</style>

<style lang="scss" scoped>
.attribute {
  cursor: pointer;
  i {
    font-size: 14px;
    margin-right: 4px;
  }
}
</style>
