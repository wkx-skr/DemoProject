<template>
  <div>
    <h1>数字卡片</h1>
    <p>数字卡片是驾驶舱中的一种基础组件模板，用于显示一组文本和数字</p>
    <h2>基本用法</h2>
    <div>
      <dashboard-number-card
        class="component-box"
        style=""
        label="短名称"
        :value="1234"
      ></dashboard-number-card>
      <dashboard-number-card
        class="component-box"
        style=""
        label="非常长的名称非常长的名称非常长的名称非常长的名称"
        :value="12345"
      ></dashboard-number-card>
      <dashboard-number-card
        class="component-box"
        style=""
        label="短名称"
        :value="123556789123456"
      ></dashboard-number-card>
    </div>
  </div>
</template>
<script>
export default {
  components: {},
  data() {
    return {}
  },
  mounted() {},
  methods: {},
}
</script>
<style lang="scss" scoped>
@import '../base.scss';
div {
}
</style>
