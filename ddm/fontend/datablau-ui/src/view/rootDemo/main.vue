<template>
  <div>
    <el-card style="margin: 20px;height: 500px;overflow: auto;position: relative;">
      <db-root
        @get-global-message="getGlobalMessage"
      >
        <div>123</div>
        <div slot="heading-partial" style="line-height: 50px;">ddm</div>
      </db-root>
    </el-card>

    当前产品:
    <el-radio-group v-model="product" @input="productChange">
      <el-radio-button label="dam">dam</el-radio-button>
      <el-radio-button label="ddc">ddc</el-radio-button>
      <el-radio-button label="ddm">ddm</el-radio-button>
      <el-radio-button label="ddd">ddd</el-radio-button>
      <el-radio-button label="dds">dds</el-radio-button>
      <el-radio-button label="ddsGw">ddsGw</el-radio-button>
    </el-radio-group>
  </div>
</template>
<script>
import Vue from 'vue'

Vue.prototype.$isAdmin = true
Vue.prototype.$store = {}
export default {
  data() {
    return {
      product: ''
    }
  },
  beforeMount() {
    this.product = localStorage.getItem('currentProduct') || ''
    window.sessionStorage.setItem('env', 'demo')
  },
  methods: {
    getGlobalMessage(promises) {
      console.log(promises)
      // promises.getUserLists()
      // promises.getAbout()
      // promises.getUserInfo()
      // promises.getEnableList()
      // promises.getAppEnableConfig()
      // promises.hello()
      // promises.getVersionLevel()
      // promises.getServerConfig()
      promises.getAllServersOfCurrentProduct().then(_ => {
        console.log(_)
      })
      promises.getAllRolesOfCurrentProduct().then(_ => {
        console.log(_)
      })
      promises.getUserInfo().then(_ => {
        console.log(_)
      })
    },
    productChange() {
      localStorage.setItem('currentProduct', this.product)
      window.location.reload();
    }
  }
}
</script>
<style lang="scss" scoped>

</style>
