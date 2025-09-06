<template>
  <div class="db-heading" :class="{hide: hideTop}">
    <logo @click.native="goToIndexPage"></logo>
    <menus
        ref="menus"
        :pagesTree="pagesTree"
        :pagesMap="pagesMap"
        :appsMap="appsMap"
        @handleTopMenuChange="handleTopMenuChange"
        @handleTopMenuChangeOnlyHighlight="handleTopMenuChangeOnlyHighlight"
        @openUserModal="openUserModal"
        @trigger-hide-nav-controller="triggerHideNavController"
        :env="env"
        :stablePromise="stablePromise"
    ></menus>
    <top-right-corner
        :stablePromise="stablePromise"
        @openUserModal="openUserModal"
    >
      <slot></slot>
    </top-right-corner>
  </div>
</template>
<script>
import Logo from './logo.vue'
import Menus from './menus.vue'
import TopRightCorner from './topRightCorner/topRightCorner.vue'
export default {
  props: {
    pagesTree: {},
    pagesMap: {},
    appsMap: {
      required: true,
      type: Map,
    },
    env: {
      required: true,
    },
    stablePromise: {
      required: true,
    },
    hideTop: {
      default: false,
      type: Boolean,
    },
  },
  components: {
    Logo,
    Menus,
    TopRightCorner,
    // PageHeading,
  },
  methods: {
    useLastTopMenu() {
      this.$refs.menus.useLastTopMenu()
    },
    goToIndexPage() {
      this.$refs.menus.goToIndexPage()
    },
    handleTopMenuChange(level1) {
      this.$emit('handleTopMenuChange', level1)
    },
    handleTopMenuChangeOnlyHighlight(pageName) {
      this.$emit('handleTopMenuChangeOnlyHighlight', pageName)
    },
    openUserModal(args) {
      this.$emit('openUserModal', args)
    },
    triggerHideNavController(routeName) {
      this.$emit('trigger-hide-nav-controller', routeName)
    }
  },
}
</script>
<style lang="scss" scoped>
.db-heading {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 50px;
  background-color: #FFF;
  box-shadow: var(--heading-shadow);
  z-index: 9;
  &.hide {
    display: none;
  }
}
</style>
