<template>
  <div class="enterMain">
    <el-container class="container">
      <left-menu class="left-menu"></left-menu>
      <el-main class="el-main">
        <router-view name="enterpriseBox"/>
      </el-main>
    </el-container>
  </div>
</template>

<script>
import LeftMenu from './leftMenu.vue'
export default {
  components: { LeftMenu },
  props: {},
  data () {
    return {
    }
  },
  watch: {},
  computed: {},
  methods: {},
  created () {},
  mounted () {}
}
</script>
<style lang="scss" scoped>
.enterMain{
  width: 100%;
  height: 100%;
  .container{
    display: flex;
    width: 100%;
    height: 100%;
    .left-menu{
      height: 100%;
      width: 220px;
      border-right: 1px solid #EFEFEF;
      // padding: 24px 0 0px 18px;
    }
    .el-main{
      flex: 1;
    }
  }
}
</style>
