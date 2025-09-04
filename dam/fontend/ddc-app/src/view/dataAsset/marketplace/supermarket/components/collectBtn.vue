<template>
  <div
    class="collect-btn-component"
    :class="{
      'no-collect': !collected,
      collected: collected,
      'is-list': isList,
      'no-click': !canClick,
    }"
    @click.stop="collect"
  >
    <el-tooltip
      v-if="isList"
      :content="
        collected
          ? $t('assets.marketplace.collectedText')
          : $t('assets.marketplace.collectText')
      "
    >
      <i :class="['iconfont', collected ? 'icon-collect' : 'icon-remove']"></i>
    </el-tooltip>

    <template v-else>
      <i :class="['iconfont', collected ? 'icon-collect' : 'icon-remove']"></i>
      <!-- <span v-if="isList">{{ count }}</span> -->
      <span v-if="!isList && showType === 'card'">
        {{
          collected
            ? $t('assets.marketplace.collectedText')
            : $t('assets.marketplace.collectText')
        }}
      </span>
      <span v-else>{{ count }}</span>
    </template>
  </div>
</template>

<script>
import API from '@/view/dataAsset/utils/api'
import { AssetsTypeEnum } from '@/view/dataAsset/utils/Enum.ts'
import {
  assetsCollect,
  cancelAssetsCollect,
} from '@/view/dataAsset/utils/methods'
export default {
  props: {
    type: {
      type: String,
      default: '',
    },
    canClick: {
      // 是否可以点击收藏
      type: Boolean,
      default: true,
    },
    baseInfo: {
      type: Object,
      default() {
        return {}
      },
    },
    favouriteList: {
      type: Array,
      default: () => [],
    },
    isList: {
      // 是否从数据超市列表过来的
      type: Boolean,
      default: false,
    },
    showType: {
      // 列表过来，卡片和列表样式
      type: String,
      default: '',
    },
    isIndex: {
      // 是否从首页过来的
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      collectList: [],
      count: 0,
    }
  },
  watch: {
    favouriteList: {
      handler() {
        this.collectList = this.favouriteList
      },
    },
    baseInfo: {
      handler() {
        // if (this.baseInfo.assetId && this.favouriteList.length) {
        if (this.isIndex) {
          this.collectList = this.favouriteList
        } else {
          if (this.baseInfo.assetId && this.baseInfo.typeId) {
            this.getCollectList()
            this.getCount()
          }
        }
      },
      deep: true,
      immediate: true,
    },
  },
  mounted() {},
  methods: {
    getCount() {
      const params = {
        objId: this.baseInfo.collectId,
        typeId: this.baseInfo.typeId,
      }
      API.assetsCollectNumApi(params)
        .then(res => {
          this.count = res.data
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    getCollectList() {
      API.assetsCollectListApi()
        .then(res => {
          this.collectList = res.data
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    judgeCollect() {
      let bool = false
      bool = this.collectList.some(
        item => item.objId == this.baseInfo.collectId
      )
      return bool
    },
    collect() {
      if (!this.canClick) {
        return
      }
      if (this.type === AssetsTypeEnum.CATALOG) {
        this.cataclogCollect()
      } else {
        this.assetsCollect()
      }
    },
    async cataclogCollect() {
      const params = {
        catalogId: this.baseInfo.assetId,
        catalogName: this.baseInfo.name,
      }
      const bool = await this.judgeCollect()
      if (bool) {
        API.cancelCollectCatalogAPI(params)
          .then(res => {
            this.$datablauMessage.success(
              this.$t('assets.marketplace.cancelCollectedSuccess')
            )
            this.getCollectList()
            this.getCount()
          })
          .catch(e => {
            this.$showFailure(e)
          })
      } else {
        API.collectCatalogAPI(params)
          .then(res => {
            this.$datablauMessage.success(
              this.$t('assets.marketplace.collectSuccess')
            )
            this.getCollectList()
            this.getCount()
          })
          .catch(e => {
            this.$showFailure(e)
          })
      }
    },
    assetsCollect() {
      const bool = this.judgeCollect()
      if (bool) {
        // 取消收藏
        let collectId
        this.collectList.map(item => {
          if (parseFloat(item.objId) === parseFloat(this.baseInfo.collectId)) {
            collectId = item.id
          }
        })
        cancelAssetsCollect(this, API, collectId)
          .then(res => {
            this.$datablauMessage.success(
              this.$t('assets.marketplace.cancelCollectedSuccess')
            )
            this.getCount()
            this.getCollectList()
          })
          .catch(e => {
            this.$showFailure(e)
          })
      } else {
        // 收藏
        const params = {
          objId: this.baseInfo.collectId,
          objectName: this.baseInfo.name,
          typeId: this.baseInfo.typeId,
        }
        assetsCollect(this, API, params)
          .then(res => {
            this.$datablauMessage.success(
              this.$t('assets.marketplace.collectSuccess')
            )
            this.getCount()
            this.getCollectList()
          })
          .catch(e => {
            this.$showFailure(e)
          })
      }
    },
    // 根据资产类型获取资产的typeId
    getAssetsId(type) {
      let typeId
      switch (type) {
        case AssetsTypeEnum.TABLE:
          typeId = 80000004
          break
        case AssetsTypeEnum.VIEW:
          typeId = 80500008
          break
        case AssetsTypeEnum.DATA_OBJECT:
          typeId = 80000005
          break
        case AssetsTypeEnum.REPORT:
          typeId = 82800002
          break
        case AssetsTypeEnum.FILE:
          typeId = 82800008
          break
        default:
          break
      }
      return typeId
    },
  },
  computed: {
    collected() {
      return this.collectList.some(
        item => item.objId == this.baseInfo.collectId
      )
    },
  },
}
</script>

<style lang="scss">
.collect-btn-component {
  width: 100%;
  height: 32px;
  border: 1px solid #ff4040;
  border-radius: 6px;
  font-size: 13px;
  color: #ff4040;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  &.is-list {
    border: none;
    background-color: #fff;
    &.collected {
      &:hover {
        background-color: rgba(255, 64, 64, 0.1);
      }
      &:active {
        background: rgba(255, 64, 64, 0.2);
      }
    }
    &.no-collect {
      border: none;
    }
    i {
      font-size: 14px;
    }
  }
  &.no-click {
    cursor: not-allowed;
  }
  &.no-collect {
    border: 1px solid #e6eaf2;
    color: #7c89a8;

    &:hover {
      background: rgba(230, 234, 242, 0.3);
    }
    &:active {
      background: rgba(230, 234, 242, 0.5);
    }
    i {
      color: #7c89a8;
    }
  }
  &:hover {
    background: rgba(255, 64, 64, 0.1);
  }
  &:active {
    background: rgba(255, 64, 64, 0.2);
  }
  i {
    font-size: 13px;
    color: #ff4040;
  }
}
</style>
