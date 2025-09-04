<template>
  <div class="process-control">
    <el-tabs
      type="card"
      class="page-card-tabs"
      v-model="currentTab"
      @tab-remove="removeTab"
    >
      <el-tab-pane
        label="流程中心"
        name="processCenter"
        ref="processCenter"
        v-if="false"
      >
        <process-center
          v-if="currentTab === 'processCenter'"
          @showAssignee="showAssignee"
        ></process-center>
      </el-tab-pane>
      <el-tab-pane label="流程中心" name="modelCenter" ref="modelCenter">
        <model-center v-if="currentTab === 'modelCenter'"></model-center>
      </el-tab-pane>
      <el-tab-pane label="表单中心" name="formCenter" ref="formCenter">
        <form-center v-if="currentTab === 'formCenter'"></form-center>
      </el-tab-pane>
      <el-tab-pane label="监听器" name="eventListener" ref="eventListener">
        <event-listener v-if="currentTab === 'eventListener'"></event-listener>
      </el-tab-pane>
      <el-tab-pane
        v-for="item in tabArr"
        :key="item.name"
        :label="item.name"
        :name="item.name"
        closable
      >
        <edit-assignee
          :processData="item.data"
          @removeTab="removeTab(item.name)"
        ></edit-assignee>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import processCenter from './processCenter.vue'
import modelCenter from './modelCenter.vue'
import editAssignee from './editAssignee.vue'
import formCenter from './formCenter.vue'
import eventListener from './eventListener.vue'
export default {
  components: {
    processCenter,
    modelCenter,
    editAssignee,
    formCenter,
    eventListener,
  },
  computed: {},
  data() {
    return {
      lastTab: 'modelCenter',
      currentTab: 'modelCenter',
      tabArr: [],
      defaultTab: 'modelCenter',
      modelTabArr: ['tabArr'],
    }
  },
  mounted() {
    const query = this.$route.query
  },
  beforeDestroy() {
    setTimeout(() => {
      this.modelTabArr.forEach(item => {
        if (typeof this[item] === 'object' && this[item]) {
          Object.keys(this[item]).forEach(o => {
            this[item][o] = null
          })
        }
        this[item] = null
      })
      if (window.CollectGarbage) {
        window.CollectGarbage()
      }
    }, 3000)
  },
  methods: {
    showAssignee(data) {
      const tab = {
        name: data.name,
        id: data.id,
        type: 'dataStandard',
        data: data,
      }
      this.addTab(tab)
    },
    addTab(tab) {
      const name = tab.name
      const index = this.tabArr.findIndex(item => item.name === name)
      if (index === -1) {
        this.tabArr.push(tab)
      }

      this.currentTab = name
    },
    removeTab(name) {
      const index = this.tabArr.findIndex(item => item.name === name)
      if (index !== -1) {
        this.tabArr.splice(index, 1)
      }

      if (this.currentTab === name) {
        this.currentTab = this.defaultTab
      }
    },
  },
  watch: {
    currentTab(newVal) {
      // if (newVal === 'agentManage') {
      //   this.agentManageOntop = true;
      // } else {
      //   this.agentManageOntop = false;
      // }
      // if (newVal === 'synonyms') {
      //   this.$nextTick(() => {
      //     if (this.$refs.synonymsTab && this.$refs.synonymsTab.tableLayout) {
      //       this.$refs.synonymsTab.tableLayout();
      //     }
      //   })
      // }
    },
  },
}
</script>
<style scoped lang="scss">
@mixin absPos() {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}
.process-control {
  // border: 1px solid red;
  // @include absPos();
  position: relative;
  width: 100%;
  height: 100%;
}
</style>
