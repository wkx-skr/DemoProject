<template>
  <el-container style="background: #fff; height: 100%">
    <el-header style="padding: 0">
      <el-menu
        :default-active="activeIndex2"
        class="el-menu-demo"
        mode="horizontal"
        @select="handleSelect"
        background-color="#545c64"
        text-color="#fff"
        active-text-color="#ffd04b"
      >
        <el-menu-item index="grid">Grid</el-menu-item>
        <el-menu-item index="zip">zip</el-menu-item>
        <el-menu-item index="map">map</el-menu-item>
        <el-menu-item index="map2">map2</el-menu-item>
        <!--<el-menu-item index="dataStage">dataStage</el-menu-item>-->
        <el-menu-item index="d3">d3</el-menu-item>
        <el-menu-item index="layout">layout</el-menu-item>
        <el-menu-item index="progress">progress</el-menu-item>
        <el-menu-item index="catalogNetworkDemo">catalogNetwork</el-menu-item>
        <el-menu-item index="shot">shot</el-menu-item>
        <el-menu-item index="three">three</el-menu-item>
      </el-menu>
    </el-header>
    <el-main style="">
      <div v-if="activeIndex2 === 'grid'">
        <grid-demo></grid-demo>
      </div>
      <div v-else-if="activeIndex2 === 'zip'">
        <zip-demo v-if="activeIndex2 === 'zip'"></zip-demo>
      </div>
      <map-demo v-else-if="activeIndex2 === 'map'"></map-demo>
      <map-demo2 v-else-if="activeIndex2 === 'map2'"></map-demo2>
      <layout-demo v-else-if="activeIndex2 === 'layout'"></layout-demo>
      <progress-demo v-else-if="activeIndex2 === 'progress'"></progress-demo>
      <catalog-network-demo
        v-else-if="activeIndex2 === 'catalogNetworkDemo'"
      ></catalog-network-demo>
      <shot-demo v-else-if="activeIndex2 === 'shot'"></shot-demo>
      <three-demo v-else-if="activeIndex2 === 'three'"></three-demo>
    </el-main>
  </el-container>
</template>

<script>
import gridDemo from './grid.vue'
import zipDemo from './zip.vue'
import mapDemo from './mapDemo.vue'
import mapDemo2 from './mapDemo2.vue'
import layoutDemo from './layoutDemo.vue'
import progressDemo from './progressDemo.vue'
import catalogNetworkDemo from './catalogNetworkDemo.vue'
import shotDemo from './shotDemo.vue'
import threeDemo from './threeDemo.vue'

export default {
  components: {
    gridDemo,
    zipDemo,
    mapDemo,
    mapDemo2,
    // d3Demo,
    layoutDemo,
    progressDemo,
    catalogNetworkDemo,
    shotDemo,
    threeDemo,
  },
  data() {
    return {
      activeIndex2: 'three',
    }
  },
  methods: {
    handleSelect(key, keyPath) {
      //        console.log(key);
      this.activeIndex2 = key
    },
  },
}
</script>

<style scoped></style>
