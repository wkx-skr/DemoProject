<template>
  <div class="box">
    <div class="box-label">
      {{ $version.dashboard.importantProblem }}
    </div>
    <div class="time-base">
      <el-popover
        placement="bottom-end"
        :visible-arrow="false"
        width="233"
        v-model="popoverVisible"
        trigger="click"
      >
        <div class="button" slot="reference">
          <i class="el-icon-date"></i>
          {{ timeBaseLabel }}
        </div>
        <div class="time-base-pop">
          <el-checkbox v-model="thisYear" @change="thisYearChange">
            只看今年
          </el-checkbox>
          <span class="gun">|</span>
          <span
            class="radio"
            @click="timeBaseChange('week')"
            :class="{ checked: timeBase === 'week' }"
          >
            周
          </span>
          <span
            class="radio"
            @click="timeBaseChange('month')"
            :class="{ checked: timeBase === 'month' }"
          >
            月
          </span>
          <span
            class="radio"
            @click="timeBaseChange('year')"
            :class="{ checked: timeBase === 'year', disabled: thisYear }"
          >
            年
          </span>
        </div>
      </el-popover>
    </div>
    <div class="table-container">
      <el-table :key="pdGraphKey" :data="tableData" class="ip-table">
        <el-table-column width="30">
          <template slot-scope="scope">
            <span class="grey">{{ scope.$index + 1 }}</span>
          </template>
        </el-table-column>
        <el-table-column
          label="规则名称"
          prop="name"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          label="问题数"
          width="100"
          prop="problem"
        ></el-table-column>
        <el-table-column label="趋势图">
          <template slot-scope="scope">
            <div
              style="height: 44px"
              :key="scope.row.name"
              class="ip-graph"
              :data-id="scope.$index"
            ></div>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>
<script>
import * as echarts from 'echarts'
import $ from 'jquery'
import DashboardMore from '@/view/dashboard5.5/commonDashboardComponent/dashboardMore'
export default {
  props: {
    rootData: {
      required: true,
      type: Array,
    },
  },
  components: {
    DashboardMore,
  },
  data() {
    return {
      pdGraphKey: 0,
      popoverVisible: false,
      tableData: [],
      timeBase: 'month',
      thisYear: true,
      resize: [],
    }
  },
  mounted() {
    this.prepareData()
    setTimeout(() => {
      this.draw()
      $(window).resize(this.handleResize)
      this.handleResize()
    })
  },
  methods: {
    prepareData() {
      this.loading = true
      setTimeout(() => {
        this.loading = false
      }, 1000)
      const date = new Date()
      const [year, month, day] = [
        date.getFullYear(),
        date.getMonth() + 1,
        date.getDate(),
      ]
      const tableData = []
      this.rootData.forEach((item, key) => {
        const countResult = {
          name: item.techRuleName,
          problem: 0,
          values: [],
        }
        let currentDate, prevDate, scale
        switch (this.timeBase) {
          case 'month':
            currentDate = year + '-' + month
            prevDate =
              (month > 1 ? year : year - 1) + '-' + (month > 1 ? month - 1 : 12)
            scale = 'monthErrorCount'
            break
          case 'year':
            currentDate = year
            prevDate = year - 1
            scale = 'yearErrorCount'
            break
          case 'week':
            const oneWeek = new Date(date.getTime() - 1000 * 3600 * 24 * 7)
            const twoWeek = new Date(date.getTime() - 1000 * 3600 * 24 * 7 * 2)
            currentDate =
              oneWeek.getFullYear() +
              '-' +
              (oneWeek.getMonth() + 1) +
              '-' +
              oneWeek.getDate() +
              '~' +
              year +
              '-' +
              month +
              '-' +
              day
            prevDate =
              twoWeek.getFullYear() +
              '-' +
              (twoWeek.getMonth() + 1) +
              '-' +
              twoWeek.getDate() +
              '~' +
              oneWeek.getFullYear() +
              '-' +
              (oneWeek.getMonth() + 1) +
              '-' +
              oneWeek.getDate()
            scale = 'weekErrorCount'
            break
        }
        if (item[scale]) {
          countResult.problem = item[scale][currentDate]
          Object.keys(item[scale]).forEach((label, objIndex) => {
            const value = item[scale][label]
            if (this.thisYear && label.includes(String(year - 1))) {
            } else {
              countResult.values[objIndex] = value
            }
          })
        }
        countResult.values.reverse()
        tableData.push(countResult)
      })
      this.$utils.sort.sort(tableData, 'problem')
      tableData.reverse()
      this.tableData = tableData.slice(0, 5)
      this.pdGraphKey++
      setTimeout(() => {
        this.draw()
        this.loading = false
      }, 400)
    },
    handleResize() {
      this.resize.forEach(item => {
        setTimeout(() => {
          item()
        })
      })
    },
    thisYearChange() {
      if (this.thisYear && this.timeBase === 'year') {
        this.timeBase = 'month'
      }
      this.onConditionChange()
    },
    timeBaseChange(value) {
      if (this.thisYear && value === 'year') {
        return
      }
      this.popoverVisible = false
      this.timeBase = value
      this.onConditionChange()
    },
    onConditionChange() {
      this.prepareData()
    },
    setOption(index) {
      const option = {
        xAxis: {
          show: false,
          type: 'category',
        },
        yAxis: {
          show: false,
          min: 0,
        },
        grid: {
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
          containLabel: false,
        },
        legend: {
          show: false,
        },
        series: [
          {
            name: '',
            data: this.tableData[index].values,
            type: 'line',
            symbol: 'none',
            itemStyle: {
              color: '#4d91f7',
            },
            areaStyle: {
              color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [
                  {
                    offset: 0,
                    color: '#c6deff',
                  },
                  {
                    offset: 1,
                    color: '#f6faff',
                  },
                ],
              },
            },
          },
        ],
      }
      option.author = 'wk'
      return option
    },
    draw() {
      const ipGraph = $('.ip-graph')
      for (let i = 0; i < ipGraph.length; i++) {
        const graph = echarts.init(ipGraph[i])
        graph.setOption(this.setOption(i))
        this.resize.push(graph.resize)
      }
    },
  },
  computed: {
    timeBaseLabel() {
      let label = ''
      if (this.thisYear) {
        label += '只看今年：'
      }
      if (this.timeBase === 'year') {
        label += '年'
      } else if (this.timeBase === 'month') {
        label += '月'
      } else {
        label += '周'
      }
      return label
    },
  },
}
</script>
<style scoped lang="scss">
$grey: #9096a3;
@import './dashboard.scss';
.box {
  background: var(--default-bgc);
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 3px;
}
.box-label {
  position: absolute;
  left: 20px;
  top: 12px;
  font-size: 15px;
}
.table-container {
  position: absolute;
  top: 48px;
  left: 10px;
  right: 10px;
  bottom: 10px;
}
</style>
<style lang="scss">
$grey: #9096a3;
.ip-table {
  &::before {
    display: none;
  }
  font-size: 12px;
  thead {
    color: var(--table-head-bgc);
    th {
      /*font-weight:normal;*/
    }
  }
  td {
    padding: 3px 0;
  }
  th {
    padding: 6px 0;
  }
  tr:last-child {
    td {
      border-bottom: none;
    }
  }
  .grey {
    color: $grey;
  }
}
</style>
