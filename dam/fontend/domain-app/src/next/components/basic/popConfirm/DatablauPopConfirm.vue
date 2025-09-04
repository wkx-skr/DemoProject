<template>
  <div class="datablau-pop-confirm">
    <el-popover
      :test-name="testName"
      v-bind="$attrs"
      v-on="$listeners"
      v-model="visible"
      :width="$attrs.width ? $attrs.width : '160'"
      popper-class="poper_zl"
    >
      <div v-if="!$slots.content" style="display: flex">
        <div style="width: 20px">
          <i
            :class="icon"
            :style="{
              color: iconColor,
              'margin-right': '4px',
              'font-size': '16px',
            }"
          ></i>
        </div>
        <div>
          {{ content }}
        </div>
      </div>
      <slot name="content"></slot>
      <div style="text-align: right; margin: 20px 0 0 0">
        <datablau-button type="text" @click="cancel">
          {{ cancelButtonText }}
        </datablau-button>
        <datablau-button type="text" @click="ok">
          {{ confirmButtonText }}
        </datablau-button>
      </div>
      <slot name="reference" slot="reference"></slot>
    </el-popover>
  </div>
</template>
<script>
export default {
  props: {
    testName: String,
    cancelButtonText: {
      type: String,
      default: '否',
    },
    confirmButtonText: {
      type: String,
      default: '是',
    },
    content: {
      type: String,
      default: '',
    },
    icon: {
      type: String,
      default: '',
    },
    iconColor: {
      type: String,
      default: '',
    },
  },
  name: 'DatablauPopConfirm',
  data() {
    return {
      visible: false,
    }
  },
  mounted() {},
  methods: {
    ok() {
      this.$emit('ok')
      this.visible = false
    },
    cancel() {
      this.$emit('cancel')
      this.visible = false
    },
  },
}
</script>
<style lang="scss" scoped>
@import '../../basic/color.sass';
.datablau-pop-confirm {
  display: inline-block;
}
</style>
<style lang="scss">
.poper_zl {
  padding: 12px 10px !important;
  .is-block.text {
    padding: 0 6px;
    margin: 0;
  }
  .clearfix:after {
    content: '';
    height: 0;
    visibility: hidden;
    clear: both;
    display: block;
  }
}
</style>
