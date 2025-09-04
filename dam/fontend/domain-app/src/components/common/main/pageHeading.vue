<template>
  <div class="page-heading">
    <download-progress></download-progress>
    <product-bucket>
      <div slot="logo" class="logo-box">
        <div
          v-if="$showOurLogo"
          id="datablau-logo"
          @click="goToIndex"
          :class="{
            white: $settingIni.logoBackground,
            other: $showOtherLogo === 'custom',
            'ddc-home': $store.state.isDdcHome,
          }"
        >
          <img
            v-if="showLogo"
            class="cur-logo"
            :src="'dam/service/files/download/image?fileId=damlogo&' + nowTime"
            @error="imgerrorfun()"
            alt=""
          />
          <img
            v-else-if="$showOtherLogo === 'custom'"
            :src="'/static/logo/guanwang_black.png'"
            alt=""
          />
          <img
            v-else-if="$showOtherLogo"
            src="../../../assets/images/logo/other-logo.png"
            style=""
          />
          <img
            class="default-svg-logo"
            width="160px;"
            v-else-if="transparentLogo || $store.state.isDdcHome"
            src="../../../assets/images/logo/guanwang_black.png"
          />
          <img
            class="default-svg-logo"
            width="160px"
            v-else
            src="../../../assets/images/logo/guanwang_black.png"
          />
        </div>
        <div v-else id="no-logo">数据架构平台</div>
      </div>
    </product-bucket>
    <top-right-corner></top-right-corner>
  </div>
</template>

<script>
import pageHeading from './pageHeading.js'
export default pageHeading
</script>

<style lang="scss" scoped="scoped">
@import './pageHeading.scss';
.portrait {
  height: 30px !important;
  width: 30px;
  border-radius: 15px;
  background: #fff;
  display: inline-block;
  vertical-align: middle;
  margin-right: 5px;
}
.el-icon-arrow-down:before {
  &.dark {
    color: #f1f1f1 !important;
  }
  font-weight: normal;
}
</style>

<style lang="scss">
@keyframes showHidden {
  from {
    background: rgba(0, 0, 0, 0);
    border-color: rgba(0, 0, 0, 0);
  }
  to {
    background: #f56c6c;
    border-color: #fff;
  }
}
@keyframes shakeBell {
  from {
    transform: rotate(25deg);
  }
  to {
    transform: rotate(-25deg);
  }
}
.item.msg-count {
  vertical-align: top;
  i {
    font-size: 15px;
    transform: rotate(0deg);
  }
  sup.el-badge__content {
    top: 15px;
    $cirSize: 16px;
    min-width: $cirSize;
    height: $cirSize;
    padding: 0 2px;
    font-size: 12px;
    line-height: $cirSize;
    border: none;
    // animation: showHidden 1s infinite ease;
  }
  i.fa.fa-bell-o.have-unread-msg {
    transform-origin: 50% 10%;
    animation: shakeBell 0.2s infinite ease-in-out alternate;
  }
}
</style>
