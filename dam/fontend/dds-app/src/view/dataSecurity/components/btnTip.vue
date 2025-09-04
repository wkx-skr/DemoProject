<template>
  <div class="btn-tip-page" v-if="num > 0">
    <span class="check-info"></span>
    <span class="footer-row-info">
      {{ $t('securityModule.selNum') }}{{ num }}
    </span>
  </div>
</template>

<script>
export default {
  name: 'BtnTip',
  props: {
    num: {
      type: Number,
      default: 0,
    },
  },
}
</script>

<style lang="scss" scoped>
@import '~@/next/components/basic/color.sass';
.btn-tip-page {
  display: inline-block;
  .check-info {
    width: 14px;
    height: 14px;
    display: inline-block;
    background: $primary-color;
    margin-right: -13px;
    vertical-align: middle;
  }

  .footer-row-info {
    height: 50px;
    margin-right: 10px;
    &:before {
      content: '\e6da';
      font-family: 'element-icons';
      font-size: 12px;
      font-weight: 200;
      margin-right: 5px;
      vertical-align: middle;
      line-height: 13px;
      color: white;
    }
  }
}
</style>
