<template>
  <div class="datablau-tips">
    <el-tooltip
      v-bind="$attrs"
      :content="content"
      :placement="placement"
      popper-class="datablau_popper_zl"
    >
      <i class="iconfont" :class="icon"></i>
      <!-- 为了支持 <br>换行等标签 -->
      <span slot="content" v-html="content"></span>
    </el-tooltip>
  </div>
</template>
<script>
export default {
  props: {
    icon: {
      type: String,
      default: 'icon-tips',
    },
    content: {
      type: String,
      default: '',
    },
    placement: {
      type: String,
      default: 'right',
    },
  },
  name: 'DatablauTips',
  data() {
    return {}
  },
  methods: {},
}
</script>
<style lang="scss">
@import '../../basic/color.sass';
.datablau_popper_zl.is-dark {
  background-color: rgba(85, 85, 85, 0.7) !important;
}
.datablau_popper_zl.is-light {
  background-color: #BBBBBB !important;
}
/*tooltip箭头颜色*/
.datablau_popper_zl.is-dark[x-placement^='right'] .popper__arrow::after {
  border-right-color: rgba(85, 85, 85, 0.45) !important;
}
.datablau_popper_zl.is-dark[x-placement^='right'] .popper__arrow {
  border-right-color: rgba(85, 85, 85, 0.45) !important;
}
.datablau_popper_zl.is-dark[x-placement^='left'] .popper__arrow::after {
  border-left-color: rgba(85, 85, 85, 0.45) !important;
}
.datablau_popper_zl.is-dark[x-placement^='left'] .popper__arrow {
  border-left-color: rgba(85, 85, 85, 0.45) !important;
}
.datablau_popper_zl.is-dark[x-placement^='top'] .popper__arrow::after {
  border-top-color: rgba(85, 85, 85, 0.45) !important;
}
.datablau_popper_zl.is-dark[x-placement^='top'] .popper__arrow {
  border-top-color: rgba(85, 85, 85, 0.45) !important;
}
.datablau_popper_zl.is-dark[x-placement^='bottom'] .popper__arrow::after {
  border-bottom-color: rgba(85, 85, 85, 0.45) !important;
}
.datablau_popper_zl.is-dark[x-placement^='bottom'] .popper__arrow {
  border-bottom-color: rgba(85, 85, 85, 0.45) !important;
}
</style>
