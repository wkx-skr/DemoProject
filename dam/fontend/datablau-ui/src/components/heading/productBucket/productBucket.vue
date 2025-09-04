<template>
  <div style="display: inline-block;">
    <div
        class="com-box"
        :class="{ active: active }"
        @mouseenter="handleMouseEnter"
        @mouseleave="handleMouseLeave"
        @click="handleClick"
    >
      <span></span>
      <span></span>
      <span></span>
    </div>
    <el-drawer
        :visible.sync="active"
        direction="ltr"
        append-to-body
        v-show="showDrawer"
        :withHeader="false"
        :show-close="false"
        :modal="modal"
        custom-class="product-bucket-drawer"
        size="550px"
    >
      <product-bucket-content
          :pagesTree="pagesTree"
          :pagesMap="pagesMap"
          ref="content"
          :is-active="active"
          @close-bucket="active = false"
      ></product-bucket-content>
    </el-drawer>
  </div>

</template>
<script>
import ProductBucketContent from './productBucketContent.vue'
export default {
  components: {
    ProductBucketContent,
  },
  props: {
    pagesTree: {},
    pagesMap: {},
  },
  data() {
    return {
      style: {
        container: {
          display: 'inline-block',
        },
      },
      active: true,
      showDrawer: false,
      mouseEnterTimeout: null,
      modal: false,
    }
  },
  beforeCreate() {
    setTimeout(() => {
      this.active = false
      this.modal = true
    })
  },
  methods: {
    handleMouseEnter() {
      clearTimeout(this.mouseEnterTimeout)
      this.mouseEnterTimeout = setTimeout(() => {
        if (this.active === false) {
          // this.active = true
        }
      }, 300)
    },
    handleMouseLeave() {
      clearTimeout(this.mouseEnterTimeout)
    },
    handleClick() {
      setTimeout(() => {
        clearTimeout(this.mouseEnterTimeout)
        this.active = !this.active
      })
    },
  },
}
</script>
<style lang="scss" scoped>
.com-box {
  width: 50px;
  height: 50px;
  display: inline-block;
  background-color: var(--color-primary);
  color: var(--color-white);
  position: relative;
  cursor: pointer;
  transition: background-color ease-in-out 0.3s;
  &.ddc-home:not(&:hover) {
    background-color: inherit;
  }
}
.com-box.active span {
  left: 18px;
  &:first-child {
    transform: rotate(45deg);
  }
  &:nth-child(2) {
    opacity: 0;
  }
  &:last-child {
    transform: rotate(-45deg);
  }
}
.com-box span {
  display: block;
  position: absolute;
  left: 15px;
  width: 20px;
  height: 2px;
  transition: all 0.3s ease-out 0s;
  background-color: var(--color-white);
  &:first-child {
    top: 17px;
    transform-origin: left center;
    transform: rotate(0deg);
  }
  &:nth-child(2) {
    top: 24px;
  }
  &:last-child {
    top: 31px;
    transform-origin: left center;
    transform: rotate(0deg);
  }
}
.collection {
  display: inline-block;
  line-height: 48px;
  height: 50px;
  padding: 0 16px;
  vertical-align: top;
  font-size: 14px;
  $text-color: #666;
  color: $text-color;
  &.ddc-home {
    color: #fff;
  }
  cursor: pointer;
  transition: background-color 0.3s ease-out 0s;
  &:hover {
    background-color: rgba(0, 46, 70, 0.04314);
  }
  &.checked/*,&:hover*/ {
    color: var(--color-primary);
    background: #edf4ff;
    transition: background-color 0.2s;
  }
  border-top: 2px solid transparent;
  &.checked {
    border-top: 2px solid var(--color-primary);
  }
  &.ddc-home {
    color: #fff;
    opacity: 0.7;
  }
  &.ddc-home.checked,
  &.ddc-home:hover {
    border-top: 2px solid transparent;
    opacity: 1;
    background: transparent;
  }
}
</style>
<style lang="scss">
.product-bucket-drawer {
  top: 50px !important;
  bottom: 0 !important;
  height: initial !important;
  header {
    display: none;
  }
  section {
    border-top: 1px solid var(--border-color-base);
  }
}
</style>