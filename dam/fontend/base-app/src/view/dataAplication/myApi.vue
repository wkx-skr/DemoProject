<template>
  <div class="my-info">
    <el-tabs v-model="activeName" @tab-click="handleClick">
      <el-tab-pane label="我的API" name="myApi">
        <my-app modeType="api"></my-app>
      </el-tab-pane>
      <el-tab-pane label="我的应用" name="myApp">
        <my-app modeType="app"></my-app>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
<script>
import HTTP from './ddsHTTP.js'
import myApp from './myApi/myApp.vue'
export default {
  components: { myApp },
  data() {
    return {
      activeName: 'myApi',
    }
  },
  methods: {
    handleClick(tab, event) {
      this.activeName = tab.name
    },
  },
}
</script>
<style scoped lang="scss">
.my-info {
  position: relative;
  width: 100%;
  height: 100%;
  padding-left: 15px;
  background-color: white;
}
</style>
