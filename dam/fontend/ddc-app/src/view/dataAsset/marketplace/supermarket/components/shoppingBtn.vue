<template>
  <div
    class="shopping-btn-component"
    :class="{
      'has-shopping': baseDetail.shoppingCart,
    }"
    @click="addCard"
  >
    <i class="iconfont icon-cart-add"></i>
    <span>
      {{
        baseDetail.shoppingCart
          ? $t('assets.marketplace.addedCartText')
          : $t('assets.marketplace.addCartText')
      }}
    </span>
  </div>
</template>

<script>
import API from '@/view/dataAsset/utils/api'
export default {
  name: 'shoppingBtn',
  props: {
    baseDetail: {
      type: Object,
      default() {
        return {}
      },
    },
    baseParams: {
      type: Object,
      default() {
        return {}
      },
    },
    shoppingClick: {
      type: Function,
    },
  },
  data() {
    return {}
  },
  methods: {
    addCard() {
      if (this.baseDetail.shoppingCart) {
        return
      }
      API.addShoppingCardApi(this.baseParams)
        .then(res => {
          this.$datablauMessage.success(
            this.$t('assets.marketplace.addCartSuccess')
          )
          this.shoppingClick('file')
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
  },
}
</script>

<style lang="scss">
.shopping-btn-component {
  float: left;
  // width: 100px;
  padding: 0 8px;
  height: 32px;
  line-height: 32px;
  // background: #3c64f0;
  border: 1px solid #3c64f0;
  border-radius: 4px;
  font-size: 13px;
  text-align: center;
  color: #3c64f0;
  cursor: pointer;
  &:hover {
    background: rgba(60, 100, 240, 0.1);
  }
  &:active {
    background: rgba(60, 100, 240, 0.2);
  }
  &.has-shopping {
    background: rgba(230, 234, 242, 0.5);
    border: 1px solid #d6dcea;
    color: #7c89a8;
    cursor: not-allowed;
    i {
      color: #7c89a8;
    }
  }
  i {
    font-size: 14px;
    margin-right: 4px;
    color: #3c64f0;
  }
}
</style>
