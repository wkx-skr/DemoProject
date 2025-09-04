<template>
  <div class="db-detail-subtitle" :style="{ marginTop: mt, marginBottom: mb }" :class="{'black-theme': themeBlack}">
    <span class="titleBorder"></span>
    <span class="message-title">{{ title }}</span>
  </div>
</template>
<script>
export default {
  props: {
    title: {
      required: true,
      type: String,
      default: '',
    },
    mt: {
      required: false,
      type: String,
      default: '2px',
    },
    mb: {
      required: false,
      type: String,
      default: '20px',
    },
    themeBlack: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  name: 'DatablauDetailSubtitle',
  data() {
    return {}
  },
  methods: {},
}
</script>
<style lang="scss">
@import '../../basic/color.sass';
.db-detail-subtitle {
  display: inline; // IE
  display: inline-block;
  .titleBorder {
    display: inline;
    display: inline-block;
    width: 0;
    height: 14px;
    line-height: 14px;
    border-left: 4px solid #409eff;
    border-radius: 1px;
    position: relative;
    top: 2px;
  }
  .message-title {
    position: relative;
    display: inline-block;
    padding-left: 6px;
    font-size: 14px;
    font-weight: 500;
    color: #555;
    /*&::before {
      position: absolute;
      top: 4px;
      left: 0;
      width: 4px;
      height: 14px;
      content: '';
      background: #409eff;
      border-radius: 1px;
    }*/
  }
  &.black-theme{
    .message-title{
      color: #BBBBBB;
    }
    .titleBorder{
      border-color: #187FFF;
    }
  }
}
</style>
