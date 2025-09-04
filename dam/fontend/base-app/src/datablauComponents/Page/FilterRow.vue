<template>
  <div :style="style">
    <slot></slot>
  </div>
</template>

<script>
export default {
  name: 'FilterRow',
  data() {
    return {
      style: {
        paddingLeft: '20px',
        height: '34px',
      },
    }
  },
}
</script>

<style lang="scss" scoped>
.label {
  margin-left: 15px;
  margin-right: 10px;
  width: 75px;
  display: inline-block;
  text-align: right;
}
</style>
