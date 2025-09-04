<template>
  <div id="main-container">
    <various-selector></various-selector>
    <div
      id="main-content"
      :class="{
        'to-top': !deeps,
        'ddc-home': $store.state.isDdcHome,
        ext: $store.state.isNavExtension,
        full: $store.state.isMainFull,
        en: $i18n.locale === 'en',
      }"
      v-loading="loading"
    >
      <div class="loading-outer" v-if="!loading">
        <keep-alive>
          <router-view
            v-if="isRouterAlive && $route.meta.keepAlive"
          ></router-view>
        </keep-alive>
        <router-view
          v-if="isRouterAlive && !$route.meta.keepAlive"
        ></router-view>
      </div>
      <!-- <router-view v-if="isRouterAlive"></router-view> -->
    </div>
    <div id="full-screen-mask"></div>
  </div>
</template>

<script>
import main from './main.js'
export default main
</script>
<style scoped lang="scss">
@import './main.scss';
</style>
