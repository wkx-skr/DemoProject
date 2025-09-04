<template>
  <div class="process-control">
    <el-tabs
      type="card"
      class="page-card-tabs"
      v-model="currentTab"
      @tab-remove="removeTab"
    >
      <!-- <el-tab-pane label="流程中心" name="processCenter" ref="processCenter" >
        <process-center v-if="currentTab==='processCenter'"></process-center>
      </el-tab-pane> -->
      <!--      <el-tab-pane label="流程监控" name="allApply" ref="allApply" >-->
      <!--        <all-apply v-if="currentTab==='allApply'"></all-apply>-->
      <!--      </el-tab-pane>-->
      <el-tab-pane label="我的申请" name="myApply" ref="myApply">
        <my-apply v-if="currentTab === 'myApply'"></my-apply>
      </el-tab-pane>
      <el-tab-pane label="我的待办" name="myTodo" ref="myTodo">
        <my-todo v-if="currentTab === 'myTodo'"></my-todo>
      </el-tab-pane>
      <el-tab-pane label="我的已办" name="myDone" ref="myDone">
        <my-done v-if="currentTab === 'myDone'"></my-done>
      </el-tab-pane>
      <!--      <el-tab-pane label="历史任务" name="historyResult" ref="historyResult" >-->
      <!--        <history v-if="currentTab==='historyResult'"></history>-->
      <!--      </el-tab-pane>-->
      <!--
      <el-tab-pane
        closable
        v-for="item in dataArray"
        :key="item.name"
        :label="'' + item.name"
        :name="item.name"
        >
        <our-detail :preData="item"></our-detail>
      </el-tab-pane> -->
    </el-tabs>
  </div>
</template>

<script>
import processCenter from './processCenter.vue'
import myApply from './myApply.vue'
import allApply from './allApply.vue'
import myTodo from './myTodo.vue'
import myDone from './myDone.vue'
import history from './history.vue'

export default {
  components: {
    processCenter,
    allApply,
    myApply,
    myTodo,
    myDone,
    history
  },
  computed: {},
  data () {
    return {
      lastTab: 'myApply',
      currentTab: 'myTodo',

      // old
      showAddTab: false,
      dataMap: {}, // param-list
      dataArray: [], // param-list
      agentManageOntop: false,
      controlDelete: ['dataArray', 'dataMap']
    }
  },
  mounted () {
    // this.$bus.$on('addTab',detail=>{
    //   if(detail){
    //     this.addTab(_.clone(detail));
    //   }else{
    //     this.showAddTab = true;
    //     this.currentTab = 'add';
    //   }
    // });
    // this.$bus.$on('addValueTab',detail=>{
    //   this.addValueTab(_.clone(detail));
    // });
    // this.$bus.$on('removeTab',name=>{
    //   if(name){
    //     this.removeTab(name);
    //   }else{
    //     this.removeTab('add');
    //   }
    // });
    // if(!this.$featureMap['FE_QUALITY']) {
    //   this.currentTab = 'setMail';
    // }
  },
  beforeDestroy () {
    // this.$bus.$off('addTab');
    // this.$bus.$off('removeTab');
    // this.$bus.$off('addValueTab');
    setTimeout(() => {
      this.controlDelete.forEach(item => {
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
    addTab (data) {
      if (this.dataMap[data.name]) {
      } else {
        this.dataMap[data.name] = data
        this.dataArray.push(data)
      }
      this.currentTab = data.name
    },
    addValueTab (data) {
      if (this.paramsMap[data.cName]) {
      } else {
        this.paramsArray.push(data)
        this.paramsMap[data.cName] = data
      }
      this.currentTab = data.cName
    },
    removeTab (tabName) {
      if (tabName == 'add') {
        this.currentTab = this.lastTab
        this.showAddTab = false
        this.$bus.$emit('reload')
      } else if (tabName.indexOf('PARAM:') != 0) {
        this.dataArray.forEach((rule, index) => {
          if (rule.name == tabName) {
            this.dataArray.splice(index, 1)
            delete this.dataMap[tabName]
          }
        })
        this.currentTab = this.lastTab
        this.$bus.$emit('reload')
      } else {
        this.paramsArray.forEach((rule, index) => {
          if (rule.cName == tabName) {
            this.paramsArray.splice(index, 1)
            delete this.paramsMap[tabName]
          }
        })
        this.currentTab = this.lastTab
      }
    }
  },
  watch: {
    currentTab (newVal) {
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
    }
  }
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
<style lang="scss">
@mixin absPos() {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}
.process-control {
  .page-card-tabs {
    @include absPos();
    .el-tabs__content {
      @include absPos();
      top: 40px;
    }
  }
}
</style>
