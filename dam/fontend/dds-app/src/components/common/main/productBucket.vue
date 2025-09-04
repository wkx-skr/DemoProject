<template>
  <div :style="style.container">
    <div
      class="com-box"
      :class="{ active: active, 'ddc-home': $store.state.isDdcHome }"
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
      size="750px"
    >
      <product-bucket-content
        ref="content"
        @close-bucket="active = false"
        @collection1-change="handleCollections1Change"
        @highlight-top-nav="highlightTopNav"
      ></product-bucket-content>
    </el-drawer>
    <slot name="logo" @click="active = false"></slot>
    <!--    <div
      style="display: inline-block"
      class="collection"
      :class="{
        checked: isHomePageScreen,
        'ddc-home': $store.state.isDdcHome,
      }"
      @click="toHomePage"
    >
      <span>资产大屏</span>
    </div>-->
    <template v-if="showBucket">
      <div
        v-for="c in collections1Display"
        class="collection"
        :class="{
          checked: currentHighlightChecked(c),
          'ddc-home': $store.state.isDdcHome,
        }"
        @click="preGoPreview(c)"
        @removed-contextmenu.prevent="preRemove(c)"
      >
        <span class="icon"></span>
        <span class="text">{{ $t('common.page.' + c.value) }}</span>
      </div>
      <el-dropdown
        trigger="click"
        style="vertical-align: top"
        @command="preGoPreview"
        v-if="Object.keys(collections1NotDisplay).length > 0"
      >
        <span class="collection el-dropdown-link">
          {{ $t('common.bucket.more') }}
          <i class="el-icon-arrow-down el-icon--right"></i>
        </span>
        <el-dropdown-menu slot="dropdown" class="menu">
          <el-dropdown-item v-for="c in collections1NotDisplay" :command="c">
            <span class="d-figure">{{ $t('common.page.' + c.value) }}</span>
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </template>
  </div>
</template>
<script>
import { ResizeObserver } from 'resize-observer'
import $ from 'jquery'
import ProductBucketContent from './productBucketContent.vue'
export default {
  components: {
    ProductBucketContent,
  },
  data() {
    return {
      showBucket: true,
      style: {
        container: {
          display: 'inline-block',
          // width: '50px'
        },
      },
      active: true,
      showDrawer: false,
      mouseEnterTimeout: null,
      collections1: {},
      modal: false,
      currentHighlightStr: '',
      observe: null,
      displayAmount: 5,
      // isHomePageScreen: false,
    }
  },
  beforeCreate() {
    setTimeout(() => {
      this.active = false
      this.modal = true
    })
  },
  beforeMount() {
    // 资产浏览不显示顶部的跳转入口
    if (this.$router.currentRoute.name === 'assetOverview') {
      this.showBucket = false
    } else {
      this.showBucket = true
    }
  },
  mounted() {
    this.$bus.$on('clearHighlightTopNav', () => {
      this.highlightTopNav('')
    })
    this.calculateMenus()
    this.initEventListener()
  },
  beforeDestroy() {
    this.$bus.$off('clearHighlightTopNav')
    if (this.observe) {
      this.observe.disconnect()
    }
  },
  computed: {
    collections1Display() {
      const obj = {}
      Object.keys(this.collections1)
        .slice(0, this.displayAmount)
        .forEach(item => {
          obj[item] = this.collections1[item]
        })
      return obj
    },
    collections1NotDisplay() {
      const obj = {}
      Object.keys(this.collections1)
        .slice(this.displayAmount)
        .forEach(item => {
          obj[item] = this.collections1[item]
        })
      return obj
    },
  },
  methods: {
    initEventListener() {
      const targetNode = $('#page-heading')[0]
      const handler = () => {
        console.log('catch')
      }
      // const config = { attributes: true, childList: true, subtree: true }
      // const observe = new MutationObserver(function (mutations, observe) {
      //   handler()
      // })
      // this.observe = observe
      // observe.observe(targetNode, config)
      const ro = new ResizeObserver(() => this.calculateMenus())
      ro.observe(targetNode)
    },
    calculateMenus() {
      if (this.$isIEAll) return
      const targetNode = $('#page-heading')
      const totalWidth = parseInt(targetNode.css('width'))
      const logoWidth = parseInt($('.logo-box').css('width'))
      const rightWidth = parseInt($('.top-right-corner-vue').css('width'))
      const rw = this.$i18n.locale === 'zh' ? 100 : 400
      const restWidth = totalWidth - 50 - logoWidth - rightWidth - rw
      this.displayAmount = Math.floor((restWidth - 120) / 96)
    },
    highlightTopNav(str) {
      console.log('---------')
      setTimeout(() => {
        if (this.currentHighlightStr) {
          let level0 = this.currentHighlightStr.split('-lv0-')[1].slice(0, -1)
          this.$bus.$emit('update-currentTopMenu', level0)
        } else {
          this.$bus.$emit('update-currentTopMenu', null)
        }
      })
      this.currentHighlightStr = str
    },
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
    preGoPreview(m) {
      // this.isHomePageScreen = false
      this.active = false
      this.$refs.content.preGoPreview(m)
    },
    /* toHomePage() {
      this.isHomePageScreen = true
      this.$router.push({
        path: '/homePageScreen',
      })
    }, */
    preRemove(c) {
      if (this.$isAdmin) {
        this.$confirm('是否移除“' + c.label + '”?', '提示', {
          confirmButtonText: this.$t('common.button.ok'),
          cancelButtonText: this.$t('common.button.cancel'),
          type: 'warning',
        })
          .then(() => {
            this.$refs.content.cancelCollect1(c)
          })
          .catch(() => {})
      }
    },
    handleCollections1Change(collections1) {
      this.collections1 = collections1
    },
    currentHighlightChecked(collection) {
      try {
        /* if (collection === 'homePageScreen') {
          return true
        } */
        const filtered = {}
        Object.keys(this.collections1).forEach(c => {
          if (
            this.currentHighlightStr.includes(
              this.collections1[c].value + this.collections1[c].level
            )
          ) {
            filtered[c] = this.collections1[c]
          }
        })
        if (Object.keys(filtered).length === 0) {
          return false
        } else if (Object.keys(filtered).length === 1) {
          return filtered[collection.value + collection.level]
        } else if (Object.keys(filtered).length > 1) {
          return (
            filtered[collection.value + collection.level] &&
            Object.values(filtered).every(i => {
              return i.level <= collection.level
            })
          )
        } else {
          return false
        }
      } catch (e) {
        console.error('获取高亮目录失败，')
        return this.currentHighlightStr.includes(
          collection.value + collection.level
        )
      }
    },
  },
  watch: {
    active: {
      immediate: true,
      handler: isActive => {
        setTimeout(() => {
          if (isActive) {
            $('.v-modal').css('top', '50px')
            $('.el-dialog__wrapper').css('top', '50px')
          } else {
            // $('.v-modal').css('top', 0)
          }
        })
      },
    },
    $route(val) {
      if (val.name === 'assetOverview') {
        this.showBucket = false
      } else {
        this.showBucket = true
      }
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
