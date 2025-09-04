/**
  企业数据架构--tabs
 */
<template>
  <datablau-tabs v-model="activeName" @tab-click="handleClick" style="margin-top: 10px;">
    <el-tab-pane v-for="l in tabsLabel" :key="l.name" :name="l.name" :label="l.label">
      <tab-content :level="level" :parentData="parentData"  v-show="l.name === 'tab1'"/>
      <tab-entity v-show="l.name === 'tab2'" :parentData="parentData" :activeName="activeName"></tab-entity>
    </el-tab-pane>
  </datablau-tabs>
</template>

<script>
import TabContent from './tabContent.vue'
import TabEntity from './tabEntity'
export default {
  components: { TabContent, TabEntity },
  data () {
    return {
      activeName: 'first',
      tabsLabel: [{
        name: 'tab1',
        label: '业务对象'
      }, {
        name: 'tab2',
        label: '业务实体'
      }],
      level: 0,
      parentData: {
        id: null
      }
    }
  },
  mounted () {
    this.activeName = this.tabsLabel[0].name
    this.getLevel()
  },
  methods: {
    getLevel () {
      this.$bus.$on('levelChange', (data) => {
        // console.log(data)
        this.parentData = data
        switch (data.type) {
          case 'Framework': {
            this.level = 0
            break
          }
          case 'Domain': {
            this.level = 1
            break
          }
          case 'Subject': {
            this.level = 2
            break
          }
          default: {
            break
          }
        }
      })
    },
    handleClick (tab) {
      // 实体点击
      if (tab.name === 'tab2') {}
    }
  },
  beforeDestroy () {
    this.$bus.$off('levelChange')
  }
}
</script>

<style>
.el-tabs__content{
  overflow: unset;
}
</style>
