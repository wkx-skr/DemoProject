<template>
  <div>
    <el-container>
      <!-- <el-header height="50px">
        <page-heading></page-heading>
      </el-header>
      <left-menu class="left-menu" :class="{hide: hideLeft, shrink: shrink}"></left-menu> -->
      <el-main
        class="base-main"
        :class="{full: hideLeft, shrink: shrink,'grey-bac': $route.path === '/main/report', noPad: $route.path.indexOf('enterprise') !== -1, 'full-top': $route.path === '/main/modeledit'}"
      >
        <router-view v-if="alive && !$route.meta.keepAlive
        "/>
      </el-main>
      <!-- <div
        class="iframe-container-outer el-main base-main"
        :class="{full: hideLeft, shrink: shrink,'grey-bac': $route.path === '/main/report', noPad: $route.path.indexOf('enterprise') !== -1}"
        v-show="$route.meta.keepAlive"
      >
        <iframe-container ref="iframeContainer"></iframe-container>
      </div> -->
      <various-selector></various-selector>
      <div v-show="$route.meta.keepAlive" class="iframe-dialog-base-mask v-modal" v-if="showDialogMask" @click="dialogMaskClick"></div>
    </el-container>
  </div>
</template>

<script>
// import PageHeading from './pageHeading.vue'
// import LeftMenu from './leftMenu.vue'
// import iframeContainer from '@/components/common/iframeContainer/iframeContainer.vue'
import variousSelector from '@/components/common/variousSelector/main.vue'

export default {
  components: {
    // PageHeading,
    // LeftMenu,
    // iframeContainer,
    variousSelector
  },
  provide () {
    return {
      refresh: this.refresh
    }
  },
  beforeCreate () {
  },
  mounted () {
    this.$bus.$on('left-menu-display', display => {
      this.hideLeft = !display
    })
    this.$bus.$on('left-menu-shrink', show => {
      this.shrink = show
    })
    this.$bus.$on('refreshMain', show => {
      this.refresh()
    })
    this.$bus.$on('iframe-dialog-visible-change', show => {
      this.showDialogMask = show
    })
  },
  beforeDestroy () {
    this.$bus.$off('left-menu-display')
    this.$bus.$off('left-menu-shrink')
    this.$bus.$off('refresh-main')
    this.$bus.$off('iframe-dialog-visible-change')
  },
  data () {
    return {
      hideLeft: true,
      shrink: false,
      alive: true,
      showDialogMask: false
    }
  },
  methods: {
    refresh () {
      this.alive = false
      this.$nextTick(() => {
        this.alive = true
      })
    },
    dialogMaskClick () {
      this.$refs.iframeContainer.dialogMaskClick()
    }
  }
}
</script>

<style scoped lang="scss">
.el-header {
  /* background: #303133; */
  /*background-color: var(--banner-bgcolor);*/
  // background-color: #455C7C;
  background: #283764;
  line-height: 50px;
}
.el-container {
  position:absolute;
  top:-1px;left:0;right:0;bottom:0;
  min-width:1200px;
  // z-index: 8;
}
.el-main {
  position:absolute;
  left: 160px;
  top: 0px;
  bottom: 0;
  right: 0;
  // border-top:1px solid #e3e3e3;
  overflow: hidden;
  &.shrink {
    left: 60px;
  }
  &.full {
    left: 0;
  }
  &.noPad {
    padding: 0;
  }
}
.el-main.grey-bac {
  background-color: #f6f6f6;
}
.left-menu {
  position: absolute;
  left: 0;
  bottom: 51px;
  top: 50px;
  width: 160px;
  background: #fff;
  border-right: 1px solid #EFEFEF;
  overflow-y: auto;
  overflow-x: hidden;
  &.shrink {
    width: 60px;
    overflow: visible;
  }

  &.hide {
    width: 0;
    display: none;
  }
}

.base-main {
  &.full-top {
    top: 0;
  }
}

.iframe-dialog-base-mask {
  z-index: 3;
}

.iframe-container-outer {
  z-index: 4;
  border: none;
}
</style>
