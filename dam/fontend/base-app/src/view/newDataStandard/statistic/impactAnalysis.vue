<template>
  <div>
    <datablau-breadcrumb
      :node-data="nodeData"
      :separator="'/'"
      :couldClick="false"
      :highlight-back="true"
      @back="back"
    ></datablau-breadcrumb>
    <div class="search-container">
      <span style="margin-right: 10px; color: #555">{{ $t('domain.common.system') }}:</span>
      <datablau-select
        style="margin-right: 20px"
        v-model="system"
        size="mini"
        filterable
      >
        <el-option
          v-for="item in systemList"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        ></el-option>
      </datablau-select>
      <datablau-button type="normal" size="small" @click="search()">
        {{ $t('domain.common.search') }}
      </datablau-button>
    </div>
    <div class="impact-table">
      <datablau-table
        :data="tableData"
        tooltip-effect="dark"
        size="small"
        v-loading="loading"
        :header-cell-style="{
          color: '#494850',
          'font-size': '12px',
          'font-weight': 'bold',
        }"
      >
        <!-- @selection-change="handleSelectionChange" -->
        <el-table-column
          prop="modelCategoryName"
          :label="$t('domain.common.system')"
          show-overflow-tooltip
          min-width="150"
        ></el-table-column>
        <el-table-column
          prop="tableName"
          :label="$t('domain.common.table')"
          min-width="150"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          prop="columnName"
          :label="$t('domain.common.field')"
          min-width="150"
          show-overflow-tooltip
        ></el-table-column>
      </datablau-table>
    </div>
    <div
      class="page-footer"
      style="
        position: absolute;
        bottom: 0;
        width: 100%;
        min-width: 800px;
        height: 50px;
        display: flex;
        align-items: center;
        justify-content: flex-end;
        box-shadow: 0px -5px 14px -8px rgb(0 0 0 / 20%);
        border-top: 1px solid transparent;
        z-index: 9;
      "
    >
      <datablau-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page.sync="currentPage"
        :page-sizes="[20, 50, 100]"
        :page-size="pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></datablau-pagination>
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts'
export default {
  name: 'impactAnalysis',
  props: ['domainObj'],
  data() {
    return {
      systemList: [],
      system: 0,
      treeData: {},
      treeData2: '',
      myChart: null,
      loading: true,
      currentPage: 1,
      pageSize: 200,
      total: 0,
      tableData: [],
      tableHeight: null,
      deleteArr: ['systemList', 'treeData', 'tableData'],
      nodeData: [this.$t('domain.queryStandard.domainQuoteCount')],
    }
  },
  mounted() {
  },
  beforeDestroy() {
    setTimeout(() => {
      // window.sessionStorage.removeItem('fishData')
      // this.myChart && this.myChart.dispose()
      this.deleteArr.forEach(item => {
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
  watch: {
    domainObj: {
      deep: false,
      handler(newval) {
        // console.log('newval', newval)
        if (
          newval.hasOwnProperty('categoryId') &&
          newval.hasOwnProperty('domainId')
        ) {
          this.nodeData = [this.$t('domain.queryStandard.domainQuoteCount'), this.domainObj.domainName]
          this.systemList = [
            {
              label: this.$t('domain.common.allSystem'),
              value: 0,
            },
            {
              label: this.domainObj.categoryName,
              value: this.domainObj.categoryId,
            },
          ]
          this.system = this.domainObj.categoryId
          this.initTableData()
        }
      },
    },
  },
  methods: {
    initTableData() {
      this.loading = true
      this.$http
        .get(
          `${this.$url}/service/domains/${this.system}/${this.domainObj.domainId}/usage?currentPage=${this.currentPage}&pageSize=${this.pageSize}`
        )
        .then(res => {
          // setTimeout(() => {
          //   this.tableHeight = document.documentElement.clientHeight - 150
          // })
          this.tableData = res.data.domainUsageDto
          this.systemList = [
            {
              label: this.$t('domain.common.allSystem'),
              value: 0,
            },
            {
              label: this.domainObj.categoryName,
              value: this.domainObj.categoryId,
            },
          ]
          for (const item in res.data.modelCategoryMap) {
            if (
              res.data.modelCategoryMap.hasOwnProperty(item) &&
              parseInt(item) !== this.domainObj.categoryId
            ) {
              const obj = {
                label: res.data.modelCategoryMap[item],
                value: parseInt(item),
              }
              this.systemList.push(obj)
            }
          }
          this.total = res.data.total
          // const data = {
          //   name: this.domainObj.domainChName.length > 8 ? this.domainObj.domainChName.substring(0, 8) + '...' : this.domainObj.domainChName,
          //   children: res.data.domainUsageDto
          // }
          // // this.treeData = data
          // this.systemList = res.data.modelCategoryMap
          // this.system = res.data.domainUsageDto[0].name
          // // this.systemList.push(...data.children.map(e => e.name))
          // window.sessionStorage.setItem('fishData', JSON.stringify(data))
          this.loading = false
          // this.initEchart(JSON.parse(window.sessionStorage.getItem('fishData')))
        })
        .catch(e => {
          this.loading = false
          this.$showFailure(e)
        })
    },
    search() {
      this.currentPage = 1
      this.initTableData()
    },
    back() {
      this.$emit('back')
    },
    handleSizeChange(val) {
      this.currentPage = 1
      this.pageSize = val
      this.initTableData()
    },
    handleCurrentChange(val) {
      this.currentPage = val
      this.initTableData()
    },
    initEchart(data) {
      let total = 0
      data.children.forEach(e1 => {
        e1.children.forEach(e => {
          total = total + e.children.length
        })
      })
      document.getElementById('impactEchars').style.height =
        (total * 40 < 320 ? 320 : total * 40) + 'px'
      this.myChart = echarts.init(document.getElementById('impactEchars'))
      const option = {
        tooltip: {
          trigger: 'item',
          triggerOn: 'mousemove',
        },
        series: [
          {
            type: 'tree',
            id: 0,
            name: 'tree1',
            data: [data],

            top: '20',
            left: '130',
            bottom: '28',
            right: '20%',

            symbolSize: 7,

            edgeShape: 'polyline',
            edgeForkPosition: '63%',
            initialTreeDepth: 3,

            lineStyle: {
              width: 2,
            },

            label: {
              backgroundColor: '#fff',
              position: 'left',
              verticalAlign: 'middle',
              align: 'right',
            },

            leaves: {
              label: {
                position: 'right',
                verticalAlign: 'middle',
                align: 'left',
              },
            },

            expandAndCollapse: true,
            animationDuration: 550,
            animationDurationUpdate: 750,
          },
        ],
      }
      this.myChart.setOption(option)
    },
    handleCommand(command) {
      this.system = command
      this.myChart.dispose()
      this.loading = true
      if (this.system !== this.$t('domain.common.allSystem')) {
        for (const item in this.systemList) {
          if (
            this.systemList.hasOwnProperty(item) &&
            this.systemList[item] === this.system
          ) {
            this.initData(item)
          }
        }
        // this.treeData.children = JSON.parse(window.sessionStorage.getItem('fishData')).children.filter(e => e.name === this.system)
        // this.initEchart(this.treeData)
      } else {
        // this.treeData = JSON.parse(window.sessionStorage.getItem('fishData'))
        this.initEchart(JSON.parse(window.sessionStorage.getItem('fishData')))
      }
      this.loading = false
    },
  },
}
</script>

<style scoped>
.echarts {
  width: 100%;
  margin-top: 20px;
  /*min-height: 340px!important;*/
}
.select-div {
  margin-left: 45px;
}
.search-container {
  display: flex;
  align-items: center;
  margin: 10px 0;
}
.impact-table {
  height: auto !important;
  position: absolute !important;
  top: 100px;
  bottom: 50px;
  left: 0;
  right: 0;
  /* margin: auto; */
  overflow-y: hidden;
}
</style>
<style lang="scss">
.impact-table {
  .db-table {
    height: 100%;
    // position: absolute !important;
    // top: 0;
    // left: 0;
    // right: 0;
    // bottom: 0;
    overflow: hidden;
    .datablau-table {
      height: 95%;
      overflow: hidden;
    }
  }
  .el-table__body-wrapper {
    height: calc(100% - 40px);
    overflow-y: scroll !important;
  }
}
</style>
