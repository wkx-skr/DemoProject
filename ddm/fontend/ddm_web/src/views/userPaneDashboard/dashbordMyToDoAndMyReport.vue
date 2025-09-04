<template>
  <div class="dashboard-item">
    <div class="title-line">
      <span class="title">我的待办<span class="des">（最新20条）</span></span>
      <datablau-button
        type="text"
        style="float: right"
        @click="checkMore"
      >
        查看更多
      </datablau-button>
    </div>
    <!--<ul class="count-wrapper">
      <li :class="{current: currentTab === 'todo'}" @click="currentTab = 'todo'">
        <div class="content">
          <div>
            <h2>{{myTodoCount}}</h2>
            <p>待办事项</p>
          </div>
        </div>
      </li>
      <li :class="{current: currentTab === 'report'}" @click="currentTab = 'report'">
        <div class="content">
          <div>
            <h2>{{myReportCount}}</h2>
            <p>待处理报告</p>
          </div>
        </div>
      </li>
    </ul>-->
    <datablau-tabs v-if="alive" v-model="currentTab">
      <el-tab-pane :label="'待办事项'" name="todo"></el-tab-pane>
      <el-tab-pane :label="'待处理报告'" name="report"></el-tab-pane>
    </datablau-tabs>
    <dashboard-my-todo
      class="hide-item"
      :class="{'show-item': currentTab === 'todo'}"
      @getCount="(count) => {this.myTodoCount = count}"
    ></dashboard-my-todo>
    <dashboard-my-report
      class="hide-item"
      :class="{'show-item': currentTab === 'report'}"
      @getCount="(count) => {this.myReportCount = count}"
    ></dashboard-my-report>
  </div>
</template>

<script>
import dashboardMyTodo from '@/views/userPaneDashboard/dashboardMyTodo'
import dashboardMyReport from '@/views/userPaneDashboard/dashboardMyReport'
import _ from 'lodash'
export default {
  data () {
    return {
      alive: true,
      currentTab: 'todo',
      myTodoCount: 0,
      myReportCount: 0
    }
  },
  components: {
    dashboardMyTodo,
    dashboardMyReport
  },
  mounted () {
    this.resizeFunc = _.debounce(() => {
      this.alive = false
      this.$nextTick(() => {
        this.alive = true
      })
    }, 500)
    window.addEventListener('resize', this.resizeFunc)
  },
  beforeDestroy () {
    window.removeEventListener('resize', this.resizeFunc)
  },
  methods: {
    checkMore () {
      if (this.currentTab === 'todo') {
        this.$router.push({
          name: 'myTodo'
        })
      } else if (this.currentTab === 'report') {
        this.$router.push({
          name: 'myTodo',
          query: {
            processType: '模型报告'
          }
        })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.datablau-tabs.datablau-tabs-normal /deep/ {
  .el-tabs .el-tabs__header {
    .el-tabs__nav-wrap {
      width: 100%;
    }
    .el-tabs__nav {
      width: 100%;
    }
    .el-tabs__item {
      width: 50%;
      padding-left: 0 !important;
      padding-right: 0 !important;
      text-align: center;
    }
  }
}
.dashboard-item {
  background: #fff;
  padding: 16px 16px;
}
.title-line {
  .title {
    font-size: 14px;
    line-height: 20px;
    font-weight: bold;
    color: #555;

    .des {
      font-size: 12px;
      line-height: 20px;
      font-weight: normal;
    }
  }
}
.count-wrapper {
  margin-top: 6px;
  li {
    cursor: pointer;
    display: inline-block;
    width: 48%;
    border-radius: 8px;
    border: 1px solid #ddd;
    &.current {
      border-color: #409EFF;
      h2 {
        color: #409EFF;
      }
      p {
        color: #409EFF;
      }
    }
    .content {
      display: flex;
      justify-content: left;
      align-items: center;
      padding: 6px 14px;
      h2 {
        font-weight: normal;
        font-size: 20px;
        line-height: 24px;
        text-align: left;
      }
      p {
        margin-top: 4px;
        line-height: 17px;
        font-size: 12px;
      }
    }
  }
  li + li {
    margin-left: 4%;
  }
}
.dashboard-item /deep/ .table-container {
  //border: 1px solid red;
  position: absolute;
  top: 80px;
  bottom: 10px;
  left: 10px;
  right: 5px;
}

.hide-item {
  visibility: hidden;

  &.show-item {
    visibility: visible;
  }
}
</style>
