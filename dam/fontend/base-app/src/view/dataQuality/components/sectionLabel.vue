<template>
  <div class="box" :class="{ edit: edit }">
    <div class="line"></div>
    <div class="text">
      <slot></slot>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    edit: {
      required: false,
      type: Boolean,
      default: false,
    },
  },
}
</script>
<style lang="scss" scoped>
.box {
  margin-left: 20px;
  margin-right: 10px;
  position: relative;
}
.box.edit {
  .text {
    border-left: none;
    font-size: 14px;
    color: var(--default-opposite-color);
    padding-left: 0;
  }
}
.text {
  border-left: 4px solid #4386f5;
  padding-left: 0.5em;
  padding-right: 0.75em;
  font-size: 14px;
  background-color: var(--heading-ddc-bgc);
  position: relative;
  display: inline-block;
}
.line {
  border-top: 1px solid #e4e4e4;
  position: absolute;
  top: 10px;
  /*left: 6em;*/
  left: 0;
  right: 10px;
}
</style>
