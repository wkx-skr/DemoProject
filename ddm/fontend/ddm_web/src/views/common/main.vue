<template>
  <div>
    <el-container>
      <el-header height="50px" v-if="$route.path !== '/main/modeledit' && !$store.state.ddmPermission.hideTopMenu">
        <page-heading></page-heading>
      </el-header>
      <left-menu
        class="left-menu"
        :class="{hide: $store.state.ddmPermission.hideLeftMenu, shrink: shrink}"
        v-if="$store.state.lic.ready"
      ></left-menu>
      <el-main
        class="base-main"
        :class="{
          full: $store.state.ddmPermission.hideLeftMenu,
          shrink: shrink,
          'grey-bac': $route.path === '/main/report',
          noPad: $route.path.indexOf('enterprise') !== -1,
          'full-top': $route.path === '/main/modeledit' || $store.state.ddmPermission.hideTopMenu
        }"
      >
        <router-view v-if="alive && !$route.meta.keepAlive"/>
      </el-main>
      <!--个人工作台页面 使用 iframe 嵌套时, 左侧菜单 不会收窄或隐藏-->
      <!--<div
        v-if="$route.path !== '/main/modeledit'"
        class="iframe-container-outer el-main base-main"
        :class="{
          full: ($store.state.ddmPermission.hideLeftMenu && !showForUserModal),
          shrink: (shrink && !showForUserModal),
          'grey-bac': $route.path === '/main/report',
          noPad: $route.path.indexOf('enterprise') !== -1,
          'user-modal-left': showForUserModal
        }"
        v-show="$route.meta.app === 'user-app' && ($route.meta.keepAlive || showForUserModal)"
      >
        <iframe-container :app="'user-app'" ref="iframeContainer" key="damIframeContainer"></iframe-container>
      </div>-->
      <div
        v-if="$route.path !== '/main/modeledit' && !$store.state.damConnectable && $store.state.lic.domain"
        class="iframe-container-outer el-main base-main"
        :class="{
          full: ($store.state.ddmPermission.hideLeftMenu && !showForUserModal),
          shrink: (shrink && !showForUserModal),
          'grey-bac': $route.path === '/main/report',
          noPad: $route.path.indexOf('enterprise') !== -1,
          'user-modal-left': showForUserModal
        }"
        v-show="$route.meta.app === 'domain-app' && ($route.meta.keepAlive || showForUserModal)"
      >
        <iframe-container :app="'domain-app'" ref="iframeContainer" key="damIframeContainer"></iframe-container>
      </div>
      <div
        v-if="$route.path !== '/main/modeledit'"
        class="iframe-container-outer el-main base-main"
        :class="{
          full: ($store.state.ddmPermission.hideLeftMenu && !showForUserModal),
          shrink: (shrink && !showForUserModal),
          'grey-bac': $route.path === '/main/report',
          noPad: $route.path.indexOf('enterprise') !== -1,
          'user-modal-left': showForUserModal
        }"
        v-show="$route.meta.app === 'base-app' && ($route.meta.keepAlive || showForUserModal)"
      >
        <iframe-container :app="'base-app'" ref="iframeContainer" key="damIframeContainer"></iframe-container>
      </div>

      <div class="iframe-dialog-base-mask v-modal" v-if="showDialogMask" @click="dialogMaskClick"></div>
    </el-container>
  </div>
</template>

<script>
import PageHeading from './pageHeading.vue'
import LeftMenu from './leftMenu.vue'
import iframeContainer from '@/components/common/iframeContainer/iframeContainer.vue'
import $ from 'jquery'

export default {
  components: {
    PageHeading,
    LeftMenu,
    iframeContainer
  },
  provide () {
    return {
      headerProduction: 'ddm',
      refresh: this.refresh
    }
  },
  beforeCreate () {
  },
  mounted () {
    this.$bus.$on('left-menu-display', display => {
      this.$store.commit('ddmPermission/setHideLeftMenu', !display)
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
    this.$bus.$on('show-dam-iframe', display => {
      this.$nextTick(() => {
        this.showForUserModal = display
      })
    })
    this.$bus.$on('reset-main-z-index', this.resetMainZIndex)
    // this.getConfig()
  },
  beforeDestroy () {
    this.$bus.$off('left-menu-display')
    this.$bus.$off('left-menu-shrink')
    this.$bus.$off('refresh-main')
    this.$bus.$off('iframe-dialog-visible-change')
    this.$bus.$off('show-dam-iframe')
    this.$bus.$off('reset-main-z-index')
  },
  data () {
    return {
      shrink: false,
      alive: true,
      showForUserModal: false,
      showDialogMask: false
    }
  },
  methods: {
    getConfig () {
      this.$http.post(`/base/system/config/getConfig`).then(res => {
        res.data.forEach(element => {
          if (element.key === 'MAIN_PAGE_LOGO') {
            this.getImg(element.value, 'MAIN_PAGE_LOGO')
          } else if (element.key === 'WEB_ICON') {
            this.getImg(element.value, 'WEB_ICON')
          } else if (element.key === 'DDM_NAME') {
            $('title').text(element.value)
            $('#title').text(element.value)
          }
        })
      })
    },
    getImg (id, type) {
      this.$http({
        method: 'GET',
        url: `/base/files/download?fileId=${id}`,
        responseType: 'blob'
      })
        .then(response => {
          const imageUrl = URL.createObjectURL(new Blob([response.data]))
          if (type === 'WEB_ICON') {
            var link = document.getElementById('faviconIndex')
            if (link) {
              // 更改href到新的favicon
              link.href = imageUrl
            }
          } else {
            $('#logo').attr('src', imageUrl)
            $('#logo').css('opacity', '1')
          }
        })
    },
    refresh () {
      this.alive = false
      this.$nextTick(() => {
        this.alive = true
      })
    },
    // header 的阴影不能被 main 遮盖，所以 main 的 zIndex 为空，
    // 但是当 main 中的组件需要全屏时，需要给 main 设置 zIndex 反过来盖住 header
    resetMainZIndex (upZIndex) {
      let $mainDom = $('.el-main.base-main')
      if (upZIndex) {
        $mainDom.addClass('up-z-index')
      } else {
        $mainDom.removeClass('up-z-index')
      }
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
  // background: #283764;
  background-color: #fff;
  box-shadow: 0 5px 10px 0 hsla(0,0%,56%,.22);
  line-height: 50px;
  position: relative;
  z-index: 2;
}
.el-container {
  position:absolute;
  top:-1px;left:0;right:0;bottom:0;
}
.el-main {
  position:absolute;
  left: 160px;
  top: 50px;
  //left: 0;
  //top: 0;
  bottom: 0;
  right: 0;
  //border-top: 1px solid #e3e3e3;
  background: #fff;

  &.shrink {
    left: 60px;
  }

  &.full {
    left: 0;
  }

  &.noPad {
    padding: 0;
  }

  &.user-modal-left {
    left: 170px;
  }
}
.el-main.grey-bac {
  background-color: #f6f6f6;
}
.left-menu {
  position: absolute;
  left: 0;
  bottom: 0;
  top: 50px;
  width: 160px;
  background: #fff;
  border-right: 1px solid #ddd;
  overflow: auto;

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
  z-index: 1;

  &.full-top {
    top: 0;
  }

  &.up-z-index {
    z-index: 2;
  }
}

.iframe-dialog-base-mask {
  z-index: 3;
}

.iframe-container-outer {
  z-index: 1;
  border: none;
}
</style>
