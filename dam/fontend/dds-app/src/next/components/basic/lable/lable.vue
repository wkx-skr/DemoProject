<template>
  <div>
    <datablau-button
      type="important"
      class="iconfont icon-tianjia add-btn"
      style="margin-left: 10px"
      @click="addLable"
    >
      选择标签
    </datablau-button>
  </div>
</template>

<script>
export default {
  name: 'DatablauLable',
  data() {
    return {}
  },
  methods: {
    addLable() {
      this.showLable = true
    },
  },
}
</script>

<style></style>
