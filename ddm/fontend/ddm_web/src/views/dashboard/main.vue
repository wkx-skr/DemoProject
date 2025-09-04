<template>
  <div class="page-container" v-loading="vLoading">
<!--    <div class="page-title">{{$store.state.$v.header.dashboard}}</div>-->
    <div class="welcome"><b>{{$v.dashboard.mineModel}}</b>{{date}}，{{$v.dashboard.welcome}}</div>
<!--    <el-button type="text" @click="changeVersion">en</el-button>-->
    <div class="bottom">
      <model-list class="model-list" :class="{'full': !$store.state.lic.quality}">
      </model-list>
      <report-list v-if="$store.state.lic.quality" class="report-list">
      </report-list>
      <todo-list @showTodo="showTodo" v-if="$store.state.lic.quality"  class="todo-list"></todo-list>
<!--      <news-list class="news-list"></news-list>-->
    </div>
  </div>
</template>
<script>
import moment from 'moment'
import modelList from './modelList.vue'
import reportList from './reportList.vue'
import TodoList from './todo.vue'
// import newsList from './newsList.vue'
import HTTP from '@/resource/http'
import $ from 'jquery'
if (window.lang.toLowerCase() === 'chinese') {
  moment.locale('zh-cn')
}

export default {
  data () {
    return {
      date: moment().format('YYYY-MM-DD dddd'),
      isAssignee: false,
      vLoading: true,
      en: true
    }
  },
  components: {
    modelList,
    reportList,
    TodoList
    // newsList
  },
  beforeCreate () {
  },
  beforeMount () {
    let interval = setInterval(() => {
      if (this.$store.state.lic.ready && this.$store.state.lic.quality) {
        let reportList = $('.report-list')
        reportList.css('height', '100%')
        reportList.css('visibility', 'visible')
      }
      if (this.$store.state.lic.ready) {
        this.vLoading = false
        clearInterval(interval)
      } else if (!this.$store.state.lic.quality) {
        this.vLoading = false
      }
    }, 30)

    // mock demo 函数
    false && HTTP.getDemoData({ enableMock: true })
      .then(res => {
        console.log(res, 'res')
      })
      .catch(e => {
        this.$showFailure(e)
      })
  },
  methods: {
    showTodo () {
      $('.todo-list').css('visibility', 'visible')
      $('.report-list').css('height', '50%')
    },
    changeVersion () {
      this.en = !this.en
      this.$store.commit('changeVersion', this.en)
    },
    getWorkflowProcessConfiguration () {
      HTTP.getWorkflowProcessConfiguration({
        successCallback: data => {
          if (data && data.assignee) {
            this.isAssignee = data.assignee.some(v => v.assignees.indexOf(this.$store.state.user.name) > -1)
            if (!this.isAssignee) {
              data.assignee.forEach(v => {
                if (v.parallelNode.some(v => v.assignees.indexOf(this.$store.state.user.name) > -1)) {
                  this.isAssignee = true
                }
              })
            }
          }
          let reportList = $('.report-list')
          let todoList = $('.todo-list')
          if (this.isAssignee) {
            todoList.css('visibility', 'visible')
          } else {
            reportList.css('height', '100%')
          }
          reportList.css('visibility', 'visible')
        },
        finallyCallback: () => {
          this.vLoading = false
        }
      })
    }
  }
}
</script>

<style scoped lang="scss">
@import './main';
</style>
