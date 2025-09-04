<template>
  <div>
    <el-container>
      <el-main>
        <router-view />
      </el-main>
    </el-container>
  </div>
</template>
<script>
import inElectron from '@/resource/utils/environment'
export default {
  data () {
    return {
      inElectron
    }
  },
  mounted () {
    if (localStorage.getItem('fromLogin') === 'true' && window.require) {
      const { ipcRenderer } = window.require('electron')
      ipcRenderer && ipcRenderer.send('maxWindow')
      localStorage.setItem('fromLogin', 'false')
    }
  }
}
</script>
<style scoped lang="scss">
  .el-main {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    right: 0;
    padding: 0;
    &.top-border {
      border-top: 1px solid #e3e3e3;
    }
  }
  body {
    font-size: 12px;
  }
</style>
