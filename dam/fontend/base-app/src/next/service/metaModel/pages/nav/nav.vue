<template>
  <el-menu
    default-active="overview"
    :default-openeds="['1', '2']"
    class="el-menu-vertical-demo"
    background-color="#545c64"
    text-color="#fff"
    active-text-color="#ffd04b"
    @select="handleMenuSelect"
  >
    <el-menu-item index="overview">
      <i class="el-icon-s-data"></i>
      <span slot="title">元模型概览</span>
    </el-menu-item>
    <el-menu-item index="object-overview">
      <i class="el-icon-s-data"></i>
      <span slot="title">资产关系概览</span>
    </el-menu-item>
    <el-submenu index="1">
      <template slot="title">
        <i class="el-icon-setting"></i>
        <span>元模型管理</span>
      </template>
      <el-menu-item index="namespace">
        <i class="el-icon-setting"></i>
        <span slot="title">命名空间</span>
      </el-menu-item>
      <el-menu-item index="domain">
        <i class="el-icon-setting"></i>
        <span slot="title">域</span>
      </el-menu-item>
      <el-menu-item index="properties">
        <i class="el-icon-setting"></i>
        <span slot="title">属性</span>
      </el-menu-item>
      <el-menu-item index="assets">
        <i class="el-icon-setting"></i>
        <span slot="title">资产类型</span>
      </el-menu-item>
      <el-menu-item index="relationships">
        <i class="el-icon-setting"></i>
        <span slot="title">关系</span>
      </el-menu-item>
    </el-submenu>
    <el-menu-item index="object">
      <i class="el-icon-document"></i>
      <span slot="title">资产浏览</span>
    </el-menu-item>
    <el-menu-item index="developer">
      <i class="el-icon-cpu"></i>
      <span slot="title">开发者模式</span>
    </el-menu-item>
  </el-menu>
</template>
<script>
export default {
  mounted() {
    console.log('nav.vue mounted')
  },
  methods: {
    handleMenuSelect(index) {
      console.log(index)
      this.$emit('open-page', index)
    },
  }
}
</script>
