<template>
  <div style="position: absolute;
        top: 0;
        right: 0;
        left: 0;
        bottom: 0;background:#000">
    <rawData class="rawData" style="z-index: 9;right: 16px;" @close="close" :object="object" v-if="showRawData"></rawData>
    <div ref="graph" id="3d-graph" style="position: absolute;
        top: 0;
        right: 0;
        left: 0;
        bottom: 0;"></div>
    <div class="checkBtn">
      <datablau-radio
        v-model="radioValue"
        @change="changeRadio"
      >
        <el-radio :label="'2'">系统</el-radio>
        <el-radio :label="'0'">数据源</el-radio>
        <el-radio :label="'1'">表</el-radio>
      </datablau-radio>
    </div>

  </div>
</template>
<!-- <script src="//unpkg.com/3d-force-graph"></script> -->
<script>

// "80000004", "表"
// "82800012", "应用系统"
// "80010001", "数据源"
// "linkType":  1是血缘关系 0是父子关系
import rawData from '@/dataWarehouse/views/dataMap/rawData'

import HTTP from '@/resource/http'
import ForceGraph3D from '3d-force-graph'
import datagrafh from './data.json'
import SpriteText from 'three-spritetext'
import * as THREE from 'three'
// const myGraph3D = ForceGraph3D();
export default {
  data () {
    return {
      graphData: null,
      // graphData: datagrafh,
      myGraph: null, // 3D-graph对象
      showRawData: false,
      object: {},
      radioValue: '2'
    }
  },
  components: {
    rawData
  },
  mounted () {
    this.getMapData('2')
    // this.initGraph()
  },
  methods: {
    changeRadio () {
      this.getMapData(this.radioValue)
    },
    getMapData (type) {
      this.isDisabled = type
      this.$http.get(`${HTTP.$damServerUrl}lineage/dataMap/overView/${type}`)
        .then(res => {
          console.log(res, 'res')
          this.graphData = res.data
          this.initGraph()
        })
        .catch(err => {
          this.$showFailure(err)
        })
    },
    initGraph () {
      this.graphData.nodes.forEach(element => {
        if (element.nodeType === '82800012') { // 系统
          element.val = 8
          element.group = 'm' + element.id
          // element.colorkey = this.getRandomColor()
          // element.group = '82800012'
        } else if (element.nodeType === '80010001') { // 数据源
          // element.val = 30
          element.val = 2
          // element.colorkey = this.getRandomColor()
          // element.group = '80010001'
          element.group = 'c' + element.id
          // element.colorkey = '#F5F5F5'
        } else if (element.nodeType === '80000004') { // 表
          // element.val = 20
          // element.colorkey = '#F5F5F5'
          // element.colorkey = this.getRandomColor()
          // element.group = '80000004'
          element.group = 't' + element.id
        }
      })
      this.graphData.links.forEach(element => {
        if (element.linkType === 0) {
          element.colorkey = '#38B48B'
        } else if (element.linkType === 1) {
          element.colorkey = '#E198B4'
        }
        element.val = 10
      })
      this.myGraph = ForceGraph3D()
      this.myGraph(document.getElementById('3d-graph')).graphData(this.graphData).nodeLabel(node => {
        let typeName = ''
        if (node.nodeType === '82800012') {
          typeName = '系统：'
        } else if (node.nodeType === '80010001') {
          typeName = '数据源：'
        } else if (node.nodeType === '80000004') {
          typeName = '表：'
        }
        return `<p style="color: #fff">${typeName}${node.name}<p>` // `${node.id}: ${node.name}`
      })
        .nodeAutoColorBy('group')
        // .nodeColor('colorkey') // 数据中对应节点颜色的key,不使用nodeColor默认会自己提取color的颜色,若没有color则会给默认颜色
        // .nodeAutoColorBy('group') // //按照group进行分类，仅影响没有颜色值的数据
        .nodeResolution(12) // 数值越大 节点圆越圆滑
        .nodeThreeObjectExtend(true)
        .onNodeClick(node => {
          console.log(node, 'node')

          if (node.nodeType === '82800012') { // 系统
            console.log('我是系统')
            this.getSystemData(node.id)
            this.radioValue = null
          } else if (node.nodeType === '80010001') { // 数据源
            console.log('我是数据源')
            this.getModelData(node.id)
            this.radioValue = null
          } else if (node.nodeType === '80000004') { // 表
            console.log(node, '我是表')

            this.object = {
              'physicalName': node.name,
              'objectId': node.id
            }
            this.showRawData = true
          }
        })
        .nodeThreeObject(node => {
          // const imgTexture = new THREE.TextureLoader().load(require(`./img/${node.nodeType}.svg`))
          // imgTexture.colorSpace = THREE.SRGBColorSpace
          // const material = new THREE.SpriteMaterial({ map: imgTexture })
          // const sprite = new THREE.Sprite(material)
          // sprite.scale.set(16, 16)
          // return sprite
          if (node.nodeType !== '80000004') {
            let typeName = ''
            if (node.nodeType === '82800012') {
              typeName = '系统：'
            } else if (node.nodeType === '80010001') {
              typeName = '数据源：'
            } else if (node.nodeType === '80000004') {
              typeName = '表：'
            }
            const sprite = new SpriteText(`${typeName}${node.name}`)
            sprite.color = '#fff'
            sprite.textHeight = 4
            sprite.position.set(0, 12, 0)
            return sprite
          }
        })
        .linkOpacity('0.5')
        .linkWidth(link => 0.7)
    },
    getSystemData (id) {
      this.$http.get(`${HTTP.$damServerUrl}lineage/dataMap/system/${id}`)
        .then(res => {
          console.log(res, 'resgetSystemData')
          this.graphData = res.data
          this.initGraph()
        })
        .catch(err => {
          this.$showFailure(err)
        })
    },
    getModelData (id) {
      this.$http.get(`${HTTP.$damServerUrl}lineage/dataMap/model/${id}`)
        .then(res => {
          console.log(res, 'resgetModelData')
          this.graphData = res.data
          this.initGraph()
        })
        .catch(err => {
          this.$showFailure(err)
        })
    },
    addSpriteText (node) {
      const sprite = node
      sprite.color = '#fff'
      sprite.textHeight = 10
      sprite.position.set(0, 12, 0)
      return sprite
    },
    close () {
      this.showRawData = false
    }
  }
}
</script>
<style lang="scss" scoped>
 .checkBtn{
    background: rgb(247, 248, 252);
    width: 230px;
    height: 40px;
    position: absolute;
    left: 20px;
    top: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
 }
</style>
