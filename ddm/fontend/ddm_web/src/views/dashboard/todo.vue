<template>
  <div>
    <div class="table-area">
      <div class="title-wrapper clearfixed">
        <div class="com-title"><span style="position: relative;top: 1px;">{{ $v.modelList.pendReport }}</span><span
          class="count-text" style="font-size: 12px;color: #777;margin-left: 5px;">(共 {{ count }} 条)</span></div>
        <div class="demo-icons" style="position:absolute;right:10px;top:16px;">
          <el-dropdown @command="handleSortCommand">
            <span class="el-dropdown-link">
              {{ sortBaseLabel }} <i class="fa fa-caret-down"></i>
            </span>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item command="name">{{ $v.modelList.byName }}</el-dropdown-item>
              <el-dropdown-item command="time">{{ $v.modelList.byTime }}</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
          <i class="fa fa-sort-amount-desc" v-if="sortOrder==='desc'" @click="changeToAsc" title=""></i>
          <i class="fa fa-sort-amount-asc" v-else @click="changeToDesc" title=""></i>
        </div>
      </div>
      <div class="table-container">
        <el-table
          v-loading="loading"
          class="datablau-table thin"
          :data="reports"
          row-class-name="row-can-click"
          @row-click="handleRowClick"
          height="100%"
          :show-header="false">
          <el-table-column
            prop="taskName"
            show-overflow-tooltip
          >
            <template slot-scope="scope">
              <b>{{ scope.row.param.reportName }}</b>
            </template>
          </el-table-column>
          <el-table-column
            prop="startTime"
            :formatter="$timeFormatter"
            show-overflow-tooltip
          ></el-table-column>
        </el-table>
      </div>
    </div>
  </div>
</template>

<script>
import HTTP from '@/resource/http'
import sort from '@/resource/utils/sort'
export default {
  data () {
    return {
      reports: null,
      reportsBak: null,
      sortBase: 'time',
      sortOrder: 'desc',
      count: 0,
      loading: true
    }
  },
  mounted () {
    this.getTodo()
  },
  methods: {
    getTodo () {
      HTTP.getAllWorkflowTodo({
        successCallback: data => {
          this.count = data.length || 0
          this.reports = data
          this.reportsBak = _.cloneDeep(data)
          this.loading = false
          if (this.reports && this.reports.length) {
            this.$emit('showTodo')
          }
        }
      })
    },
    handleSortCommand (name, fromUser) {
      this.sortBase = name
      this.reports = _.cloneDeep(this.reportsBak)
      if (name === 'name') {
        if (fromUser !== true) {
          this.sortOrder = 'asc'
        }
        sort.sort(this.reports, 'taskName')
      } else if (name === 'time') {
        if (fromUser !== true) {
          this.sortOrder = 'desc'
        }
        sort.sort(this.reports, 'startTime')
      }
      if (this.sortOrder === 'desc') {
        this.reports.reverse()
      }
    },
    handleRowClick (row) {
      let myModelList = this.$store.state.modelsList || []
      if (!myModelList.find(item => item.id === row.param.modelId)) {
        this.$message.warning(this.$v.modelList.tip_1)
        return
      }
      let param = row.param
      this.$router.push({
        name: 'list',
        query: {
          id: param.modelId,
          pId: param.categoryId,
          rId: param.reportId
        }
      })
    },
    changeToAsc () {
      this.sortOrder = 'asc'
      this.handleSortCommand(this.sortBase, true)
    },
    changeToDesc () {
      this.sortOrder = 'desc'
      this.handleSortCommand(this.sortBase, true)
    }
  },
  computed: {
    sortBaseLabel () {
      switch (this.sortBase) {
        case 'time':
          if (this.$isEng) {
            return 'Sort by date'
          } else {
            return '按时间排序'
          }
        case 'name':
          if (this.$isEng) {
            return 'Sort by name'
          } else {
            return '按名称排序'
          }
        default:
          return 'none'
      }
    }
  }
}
</script>

<style lang="scss" scoped>
  .com-title {
    &:before {
      display: inline-block;
      margin-right: 7px;
      content: '';
      width: 4px;
      height: 18px;
      background: #4386F5;
      border-radius: 2px;
      vertical-align: middle;
    }
    float: left;
    color:#20293B;
    font-weight: bold;
    font-size:15px;
    display:inline-block;
  }
  .table-area {
    padding: 10px;
    background: #FFF;
    border-radius: 10px;
    position: absolute;
    top: 10px;
    bottom: 0;
    left: 0;
    right: 0;
    overflow: auto;

    .datablau-table {
      margin-top: 10px;
      border-top: none;
    }

    .title-wrapper {
      margin: 10px 0 10px 10px;
    }

    .table-container {
      //border: 1px solid red;
      position: absolute;
      top: 45px;
      bottom: 20px;
      left: 10px;
      right: 10px;
    }
  }
  .item {
    height:40px;
    line-height: 40px;
    .circle {
      display: inline-block;
      width:24px;height:24px;
      border-radius: 12px;
      background: #f0f0f0;
      vertical-align: middle;
      position:relative;top:-2px;
      margin-left:8px;
      margin-right:5px;
    }
    .name {
      font-size:12px;
      max-width:15em;
      display:inline-block;
      margin-left:1em;
    }
    .date {
      color:grey;
      float:right;
      margin-right:20px;
    }
  }
</style>
