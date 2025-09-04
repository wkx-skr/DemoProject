<template>
  <div :style="style.container">
    <div class="title">
      <span class="return-button">
        <datablau-button
          type="icon" class="iconfont icon-leftarrow"
          @click="backToReportList"
        ></datablau-button>
      </span>
      {{ $store.state.$v.report.title1 }}{{ reportName }}{{ $store.state.$v.report.title2 }}
    </div>

    <div :id="'figure' + currentReport.id">
    </div>
    <div class="filter-row">
      <el-checkbox v-model="conditions.public" @change="filterData">{{$store.state.$v.report.check1}}</el-checkbox>
      <!--<el-checkbox v-model="conditions.private" @change="filterData">{{$store.state.$v.report.check2}}</el-checkbox>-->
      <el-checkbox v-model="conditions.none" @change="filterData">{{$store.state.$v.report.check3}}</el-checkbox>
      <el-checkbox v-model="ignorePhysical" @change="getData">{{$store.state.$v.report.check4}}</el-checkbox>
      <!--<el-input v-model="keyword" style="float:right;width:100px;" size="small"></el-input>-->
      <div class="search-box close" style="float:right;width:240px;margin-right:10px;position:relative;top:-8px;">
        <div>
          <el-input size="small" v-model="keyword" :placeholder="$store.state.$v.report.placeholder" />
        </div>
      </div>
    </div>
    <div class="table-container">
      <datablau-table
        :data="tableDataSinglePage"
        v-loading="tableLoading"
        height="100%"
        class="datablau-table"
        :key="currentPage"
        @sort-change="handleSortChange"
        row-class-name="row-can-click"
        @row-click="handleRowClick"
      >
        <el-table-column width="50" align="center">
          <template slot-scope="scope">{{ scope.$index + 1 }}</template>
        </el-table-column>
        <el-table-column sortable="custom" prop="tN" :label="$store.state.$v.dataEntity.tableName" show-overflow-tooltip>
          <template slot-scope="scope">
            <b>{{scope.row.tN}}</b>
          </template>
        </el-table-column>
        <el-table-column sortable="custom" prop="tA" :label="$store.state.$v.report.tableLogiName" show-overflow-tooltip></el-table-column>
        <el-table-column sortable="custom" prop="cN" :label="$store.state.$v.modelDetail.colName" show-overflow-tooltip></el-table-column>
        <el-table-column sortable="custom" prop="cA" :label="$store.state.$v.report.colLogiName" show-overflow-tooltip></el-table-column>
        <el-table-column :label="$store.state.$v.report.domain" show-overflow-tooltip>
          <template slot-scope="scope" >
            <el-popover
              ref="popover-model"
              placement="left"
              width="200"
              trigger="hover"
            >
              <div class="popover-content">
                <p v-show="scope.row.dCn">
                  <b>{{$store.state.$v.report.domainCN}}：</b>{{ scope.row.dCn }}
                </p>
                <p v-show="scope.row.dEn">
                  <b>{{$store.state.$v.report.description}}：</b>{{ scope.row.dEn }}
                </p>
              </div>
            </el-popover>
            <span class="standard-info" v-popover:popover-model>{{ scope.row.dCn }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$store.state.$v.report.type" show-overflow-tooltip>
          <template slot-scope="scope">
            <span v-if="scope.row.p === true">{{ $store.state.$v.report.public }}</span>
            <span v-else-if="scope.row.p === false">{{ $store.state.$v.report.private }}</span>
            <span v-else>{{ $store.state.$v.report.check3 }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="dRefC" :label="$store.state.$v.dataEntity.domainCode"
                         show-overflow-tooltip></el-table-column>
      </datablau-table>
    </div>
    <el-button type="primary" size="small" class="download-button" @click="download">{{$store.state.$v.report.download}}</el-button>
    <el-pagination
      style=""
      class="pagination"
      layout="total, sizes, prev, pager, next"
      :total="total"
      :current-page.sync="currentPage"
      :page-size="pageSize"
      :page-sizes="[20, 50, 100, 200]"
      @current-change="getTableSinglePage"
      @size-change="handleSizeChange"
    >
    </el-pagination>
  </div>
</template>
<script>
import HTTP from '@/resource/http'
import sort from '@/resource/utils/sort'
import string from '@/resource/utils/string'
import _ from 'lodash'
import down from '@/resource/utils/downloadFile.js'
import $version from '@/resource/version.json'

export default {
  props: {
    modelId: {},
    path: {},
    detail: {},
    reportName: {},
    currentReport: {},
    modelVersionMap: {}
  },
  beforeMount () {
    this.$version = $version
  },
  mounted () {
    this.getData()
  },
  data () {
    return {
      style: {
        container: {
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          padding: '20px',
          overflow: 'hidden'
        }
      },
      apply: true,
      tableDataFull: [],
      tableData: [],
      conditions: {
        'public': true,
        'private': false,
        'none': true
      },
      report: {
        totalTable: '',
        totalColumn: '',
        'public': '',
        'private': '',
        none: ''
      },
      tableLoading: false,
      tableDataSinglePage: [],
      pageSize: 50,
      currentPage: 1,
      total: 0,
      domainInfo: {

      },
      domainInfoLoading: true,
      keyword: '',
      ignorePhysical: false
    }
  },
  methods: {
    handleSortChange ({ prop, order }) {
      sort.sortConsiderChineseNumber(this.tableDataFull, prop, order)
      this.filterData()
    },
    download () {
      const url = this.$url + `/service/models/manage/${this.modelId}/domain_state/export?versionId=${this.modelVersionMap.get(this.currentReport.id).endVersion}`
      down.download(url)
    },
    getData () {
      this.tableLoading = true
      const self = this
      let modelId = this.modelId
      HTTP.getReportAboutDomain({
        modelId: this.modelId,
        versionId: this.modelVersionMap.get(this.currentReport.id).endVersion,
        ignorePhysical: this.ignorePhysical,
        successCallback: data => {
          if (this.ignorePhysical) {
            this.tableDataFull = data.filter(item => {
              return !item.cPo
            })
          } else {
            this.tableDataFull = data
          }
          self.compute()
          self.drawGraph()
          self.filterData()
        },
        finallyCallback: () => {
          this.tableLoading = false
        }
      })
    },
    filterData () {
      this.currentPage = 1
      const self = this
      self.tableData = []
      if (this.conditions['public'] && this.conditions['private'] && this.conditions.none) {
        self.tableData = self.tableDataFull
      } else {
        self.tableDataFull.forEach(item => {
          let p = item.p
          if (this.conditions['public'] && p === true) {
            self.tableData.push(item)
          } else if (this.conditions['private'] && p === false) {
            self.tableData.push(item)
          } else if (this.conditions.none && (p === null || p === undefined)) {
            self.tableData.push(item)
          }
        })
      }
      let tableData = _.clone(this.tableData)
      this.tableData = []
      let keyword = this.keyword.toLowerCase()
      tableData.forEach(item => {
        let is = false
        if (string.matchKeyword(item, keyword, 'tA', 'cN', 'tN', 'cA')) {
          is = true
        }
        if (is) {
          this.tableData.push(item)
        }
      })
      self.total = this.tableData.length
      self.getTableSinglePage()
    },
    getTableSinglePage () {
      let start = (this.currentPage - 1) * this.pageSize
      let end = start + this.pageSize
      this.tableDataSinglePage = this.tableData.slice(start, end)
    },
    handleSizeChange (val) {
      this.pageSize = val
    },
    compute () {
      const self = this
      let tableSet = []
      let report = {
        totalTable: 0,
        totalColumn: 0,
        'public': 0,
        'private': 0,
        none: 0
      }
      self.tableDataFull.forEach(item => {
        if (tableSet.indexOf(item.tN) === -1) {
          tableSet.push(item.tN)
        }
        if (item.p === true) {
          report['public']++
        } else if (item.p === false) {
          report['private']++
        } else if (!item.p) {
          report.none++
        }
      })
      report.totalColumn = self.tableDataFull.length
      report.totalTable = tableSet.length
      self.report = report
    },
    drawGraph () {
      const self = this
      const echarts = require('echarts')
      const myChart = echarts.init(document.getElementById('figure' + this.currentReport.id))
      myChart.innerHTML = ''
      const option = {
        color: ['#4386f5', '#FCB100', '#D6D9E0'],
        tooltip: {
          trigger: 'item',
          formatter: '{b} ({d}%)'
        },
        legend: {
          orient: 'vertical',
          align: 'left',
          x: 'right',
          y: 'middle',
          data: [
            self.$store.state.$v.report.check1 + ': ' + self.report['public'],
            // self.$store.state.$v.report.check2 + ': ' + self.report['private'],
            self.$store.state.$v.report.check3 + ': ' + self.report.none
          ]
        },
        series: [
          {
            name: '',
            itemStyle: {},
            type: 'pie',
            radius: ['50%', '85%'],
            center: ['35%', '50%'],
            avoidLabelOverlap: false,
            label: {
              normal: {
                show: false,
                position: 'center'
              },
              emphasis: {
                show: true,
                textStyle: {
                  fontSize: '14',
                  fontWeight: 'bold'
                }
              }
            },
            labelLine: {
              normal: {
                show: false
              }
            },
            data: [
              {
                value: self.report['public'],
                name: self.$store.state.$v.report.check1 + ': ' + self.report['public']
              },
              // {
              //   value: self.report['private'],
              //   name: self.$store.state.$v.report.check2 + ': ' + self.report['private']
              // },
              { value: self.report.none, name: self.$store.state.$v.report.check3 + ': ' + self.report.none }
            ]
          }
        ]
      }
      myChart.setOption(option)
    },
    getElementParent (elementId) {
      return new Promise((resolve, reject) => {
        HTTP.getElementParent({
          elementId: elementId,
          modelId: this.detail.id,
          successCallback: data => {
            if (data) {
              resolve(data)
            } else {
              this.$message.error(this.$store.state.$v.report.err2)
              reject(new Error())
            }
          },
          failureCallback: error => {
            this.$message.error(err2)
            reject(error)
          },
          finallyCallback: data => {
          }
        })
      })
    },
    handleRowClick (row) {
      const pos = location.href.indexOf('#/')
      const baseUrl = location.href.slice(0, pos + 2)
      this.getElementParent(row.eId).then(pId => {
        window.open(baseUrl + `main/list?id=${this.detail.id}&pId=${this.detail.categoryId}&objectId=${pId}&objectType=table`, '_blank')
      }).catch(() => {
      })
    },
    backToReportList () {
      this.$emit('backToReportList')
    }
  },
  watch: {
    modelId (newVal) {
      this.getData()
    },
    pageSize (size) {
      this.pageSize = size
      this.currentPage = 1
      this.getTableSinglePage()
    },
    keyword (newValue) {
      this.currentPage = 1
      this.filterData()
    }
  }
}
</script>

<style scoped lang="scss">
  .title {
    font-size: 16px;
    //margin-bottom:1em;
    line-height: 40px;
    margin-top: -20px;
  }
  .filter-row {
    position:absolute;
    top:130px;
    left:20px;right:20px;
    display:block;
    border-bottom:1px solid #e5e5e5;
  }
  [id^=figure] {
    width:600px;
    height:145px;
    position:absolute;
    top:0;
    right:50px;
  }
  .table-container {
    position:absolute;
    top:170px;
    bottom:50px;
    left:20px;right:20px;
  }
  .pagination {
    position:absolute;
    bottom:10px;right:20px;
  }
  .download-button {
    position:absolute;
    bottom:10px;
    left:20px;
  }
</style>
