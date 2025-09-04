<template>
  <div>
    <div v-show="topLevel" class="wrapper">
      <Head></Head>
      <!-- 领域模块 -->
      <!-- <filed-box></filed-box> -->
      <!-- <FieldBox v-show="Subject"></FieldBox> -->
<!--      <ErMap />-->
      <Tabs />
    </div>
    <div v-show="!topLevel">
      <InnerArchitecture :routerMap="routerMap" :currentData="currentData" />
    </div>
  </div>
</template>

<script>
import Head from '../component/head'
import Tabs from '../component/tabs'
import InnerArchitecture from './innerArchitecture'
import ErMap from './erMap'
export default {
  components: { Head, Tabs, InnerArchitecture },
  props: {},
  data () {
    return {
      Subject: true,
      topLevel: true,
      routerMap: [],
      currentData: {}
    }
  },
  watch: {},
  computed: {},
  created () {},
  mounted () {
    this.$bus.$on('showTopData', data => {
      this.topLevel = true
      this.routerMap = []
      this.$bus.$emit('levelChange', data)
      this.$bus.$emit('level', data)
    })
    this.$bus.$on('showLowerData', data => {
      this.routerMap.push(...Object.values(data))
      this.routerMap = [...new Set(this.routerMap)]
      if (data.row.routerDel) {
        this.routerMap.forEach((item, index) => {
          if (item.name === data.row.name) {
            this.routerMap = this.routerMap.splice(0, index + 1)
          }
        })
      }

      this.currentData = data.row
      this.topLevel = false
    })
  },
  beforeDestroy () {
    this.$bus.$off('showTopData')
    this.$bus.$off('showLowerData')
  }
}
</script>
<style lang="scss" scoped>
.wrapper{
  padding-bottom: 15px;
}
</style>
