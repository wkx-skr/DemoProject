<!-- 个人工作台--我的待办 -->
<template>
  <div class="todo">
    <div class="tabs-box">
      <datablau-tabs v-model="activeName">
        <el-tab-pane
          :label="$t('assets.myTodo.todo')"
          name="agency"
        ></el-tab-pane>
        <el-tab-pane
          :label="$t('assets.myTodo.done')"
          name="done"
        ></el-tab-pane>
      </datablau-tabs>
    </div>
    <div class="todo-box">
      <datablau-form-submit>
        <myTodo assets="assets" v-if="activeName === 'agency'"></myTodo>
        <myDone assets="assets" v-if="activeName === 'done'"></myDone>
      </datablau-form-submit>
    </div>
  </div>
</template>

<script>
import myDone from '@/view/processControl/myDone.vue'
import myTodo from '@/view/processControl/myTodo.vue'
export default {
  name: 'assetsMyTodo',
  components: { myDone, myTodo },
  data() {
    return {
      activeName: 'agency',
    }
  },
}
</script>

<style scoped lang="scss">
.todo {
  position: absolute;
  top: 0;
  left: 0px;
  bottom: 0;
  right: 0;
  background-color: #fff;
  .tabs-box {
    height: 40px;
    line-height: 40px;
    /deep/ .datablau-tabs {
      padding: 0 20px;
      .el-tabs__header {
        .el-tabs__item {
          font-size: 14px;
        }
      }
      .el-tabs__content {
        height: 10px;
        overflow: hidden;
      }
    }
  }
  .todo-box {
    position: absolute;
    top: 40px;
    bottom: 0;
    left: 0;
    right: 0;
    /deep/ .form-submit {
      left: 20px;
      .row-buttons {
        border: 0;
      }
      .tab-with-table {
        .assets {
          top: 10px;
        }
        .table-row {
          margin-top: 54px !important;
        }
      }
    }
  }
}
/deep/ .el-tab-pane {
  position: relative;
}
.pos {
  height: 80vh;
}
</style>
