<template>
  <div class="sql-result-data" :class="{'dark-theme-result': theme === 'dark'}">
    <div class="top-line">
      <datablau-tabs v-model="currentTab" class="data-tabs" :themeBlack="true">
        <el-tab-pane
            v-for="item in tabsArr"
            :label="item.label"
            :name="`${item.value}_${prefix}`"
            :key="`${item.value}_${prefix}`"
        >
        </el-tab-pane>
      </datablau-tabs>
      <div class="hidden-btn">
        <datablau-button  type="text" @click="exportScv()" v-show="columns.length>0" style="position: absolute;
    right: 23px;
    top: 0px;width: 128px;">
          <i class="iconfont icon-export"></i>导出当前页结果
        </datablau-button>
        <datablau-button
            @click="hiddenLineageTab"
            size="small"
            type="icon"
            class="icon el-icon-minus"
        >
        </datablau-button>
      </div>
    </div>
    <div class="table-outer" v-loading="loading">
      <datablau-table  :data="tableData" height="100%" v-show="columns && columns.length" :themeBlack="true">
        <el-table-column
            v-for="item in columns"
            :label="item"
            :key="item"
            :prop="item"
            :formatter="jsonFormatter"
            :min-width="120"
            show-overflow-tooltip
        >
          <div slot="header">
            <datablau-tooltip
                :content="item"
                placement="top-start"
            >
              <span class="show-tooltip-header">
                {{ item }}
              </span>
            </datablau-tooltip>
          </div>
          <template slot-scope="scope">
            {{ scopeJsonFormatter(scope) }}
          </template>
        </el-table-column>
      </datablau-table>
    </div>
    <div class="no-data" v-if="(!columns || !columns.length) && !loading">
      <div class="center-content" style="    display: flex;
    flex-flow: column;align-items: center;">
        <datablau-icon :data-type="'no-result'" icon-type="svg" :size="80"></datablau-icon>
        <!-- <p>{{ errormsg }}</p> -->
      </div>
    </div>
    <div class="pagination-part" style="position: fixed;bottom: 0px;right: 20px;z-index: 99;">
      <datablau-pagination
      :themeBlack="true"
      v-if="paginationShow"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="currentPage"
        :page-sizes="[20, 100, 200, 300]"
        :page-size="pageSize"
        :total="total"
        :layout="'total, sizes, prev, pager, next, jumper'"
      ></datablau-pagination>
    </div>
  </div>
</template>

<script>
import HTTP from '@/dataWarehouse/resource/http.js'
import { Base64 } from 'js-base64'
import json2csv from 'json2csv'
import moment from 'moment'
export default {
  name: 'sqlData',
  data () {
    return {
      tableData: [],
      allDataList: [],
      prefix: '',
      currentTab: '',
      tabsArr: [],
      columns: [],
      sqlNum: 10,
      timeout: 1800,
      loading: false,
      currentPage: 1,
      pageSize: 20,
      total: 0,
      paginationShow: false,
      resault: [],
      errormsg: ''
    }
  },
  props: {
    sql: {
      type: String,
      required: true
    },
    dataSourceId: {
      type: [String, Number]
    },
    schemaNameOp: {
      type: [String, Number]
    },
    bottomCurrentTab: {
      type: String,
      default: ''
    },
    maxLength: {
      type: [String, Number]
    },
    theme: {
      type: String,
      default: 'dark'
    }
  },
  components: {},
  computed: {},
  mounted () {
    // 防止组件 id 重复
    this.prefix = new Date().getTime()
    this.dataInit()
  },
  methods: {
    exportScv () {
      // datas：数据，fields：字段名
      try {
        const result = json2csv.parse(this.tableData, {
          fields: this.columns

        })
        // 判断浏览器类型
        if ((navigator.userAgent.indexOf('compatible') > -1 &&
            navigator.userAgent.indexOf('MSIE') > -1) ||
            navigator.userAgent.indexOf('Edge') > -1) {
          // IE10或Edge浏览器
          var BOM = '\uFEFF'
          var csvData = new Blob([BOM + result], { type: 'text/csv' })
          navigator.msSaveBlob(csvData, `Data-${moment(new Date()).format('YYYY-MM-DD HH:mm:ss')}.csv`)
        } else {
          // 非IE浏览器
          var csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + result
          // 使用a标签的download属性实现下载功能
          var link = document.createElement('a')
          link.href = encodeURI(csvContent)
          link.download = `Data-${moment(new Date()).format('YYYY-MM-DD HH:mm:ss')}.csv`
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
        }
      } catch (err) {
        alert(err)
      }
    },
    handleSizeChange (size) {
      const obj = {
        currentPage: 1,
        pageSize: size
      }
      this.currentPage = 1
      this.pageSize = size
      this.changeShowData(obj)
    },
    handleCurrentChange (currentPage) {
      const obj = {
        currentPage: currentPage,
        pageSize: this.pageSize
      }
      this.changeShowData(obj)
    },
    dataInit () {
      // console.log('dataInit')
      this.$bus.$on('sqlSetting', res => {
        let { timeout, sqlNum } = res
        this.timeout = timeout
        this.sqlNum = sqlNum
      })
    },
    performUpdate () {
      this.refreshData('performUpdate')
    },
    refreshData (val) {
      console.log(val)
      if (!this.sql) {
        return
      }

      // let url = `${this.$dddUrl}/service/sql/run`
      let url = val ? `${HTTP.$damServerUrl}models/sql/saveProcedure` : `${HTTP.$dddServerUrl}sqls/runSql`
      // let json = { }
      let id = this.$store.state.ddtStore.currentFileType.id
      let variable = this.$store.state.variable[id] || []
      /* variable.forEach(item => {
        item.prop = item.name
      }) */
      this.allDataList = []
      this.tabsArr = []
      this.currentTab = ''
      this.loading = true
      let obj = {
        datasourceId: this.dataSourceId,
        timeout: this.timeout,
        maxLine: this.sqlNum || 9999,
        sql: Base64.encode(this.sql),
        uuid: new Date().getTime() + Number.parseInt(Math.random() * 1000),
        properties: variable,
        funNames: this.$store.state.funNames[id] || []
      }
      if (val === undefined) {
        obj.schemaName = this.schemaNameOp
      }
      this.$http.post(url, obj)
        .then(res => {
          if (res.data.code === 200) {
            let data = res.data.data || []
            if (data.length === 0) {
              this.loading = false
              return
            }
            this.allDataList = res.data.data || []
            this.changeShowData({
              currentPage: this.currentPage,
              pageSize: this.pageSize
            })
            if (this.allDataList && Array.isArray(this.allDataList) && this.allDataList.length) {
              this.tabsArr = this.allDataList.map((item, index) => {
                return {
                  label: `结果${index + 1}`,
                  value: index
                }
              })
              this.currentTab = `${0}_${this.prefix}`
              this.loading = false
            }
            this.$emit('showDate')
          } else {
            let error = res.data.msg || res.data.message
            // this.$datablauMessage.warning(error)
            this.errormsg = error
            this.$emit('errormsg', error)
            this.loading = false
          }
        })
        .catch(e => {
          // this.$showFailure(e)
          this.$emit('errormsg', e)
          this.loading = false
        })
    },
    changeShowData (para) {
      let index = parseInt(this.currentTab)
      if (isNaN(index)) {
        this.columns = []
        return
      }

      let data = this.allDataList[index] || []
      if (data.length < 1) {
        this.columns = []
        return
      }
      // console.log(data[0].header)
      this.columns = data[0].header
      if (data[0].data.length === 0) {
        // 都没有值，则是后端返回的columns
        let obj = this.columns.find(item => data[0].data[item])
        !obj && (data[0].data = [])
      }
      let lastData = []
      data[0].data.forEach((item) => {
        let obj = {}
        item.forEach((v, j) => {
          obj[this.columns[j]] = v
        })
        lastData.push(obj)
      })
      const currentPage = para.currentPage || 1 // 任意其它条件改变, currentPage 变为 1
      const pageSize2 = para.pageSize || this.pageSize
      this.tableData = lastData.slice(
        pageSize2 * (currentPage - 1),
        pageSize2 * currentPage
      )
      this.total = lastData.length
      this.$nextTick(() => {
        this.paginationShow = true
      })
      // console.log('tableData', this.tableData)
      // console.log('this.columns', this.columns)
      // console.log('this.columns[0]', this.columns[0])
      // console.log('tableData columns', this.tableData[this.columns[0]])
    },
    exportData () {
      // console.log('exportData', this.tableData)
      const self = this
      // let data = this.tableData
      let data = [JSON.stringify(this.tableData)]
      let blobData = new Blob(data, {
        type: 'application/vnd.ms-excel;charset=utf-8'
      })
      // FileReader主要用于将文件内容读入内存
      let reader = new FileReader()
      reader.readAsDataURL(blobData)
      // onload当读取操作成功完成时调用
      reader.onload = function (e) {
        let a = document.createElement('a')
        // 获取文件名fileName
        let fileName = '提数结果导出.json'
        a.download = fileName
        a.href = e.target.result
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)

        self.$message.success('导出成功')
      }
    },
    showScope (s) {
      // console.log(s, 's')
    },
    scopeJsonFormatter (scope) {
      let cellValue = scope.row[scope?.column?.property] || ''
      return this.jsonFormatter(scope.row, scope.column, cellValue)
    },
    jsonFormatter (row, column, cellValue, index) {
      if (!cellValue) {
        return cellValue
      }
      let jsonData = null
      try {
        let jsonData2 = jsonData
        // json 字符串转义
        jsonData2 = JSON.parse(cellValue)
        jsonData2 = JSON.stringify(jsonData2)
        jsonData = jsonData2
        // console.log(jsonData, 'jsonData')
        // console.log(cellValue, 'cellValue')
      } catch (e) {
        // console.warn('json 转义报错: ', e)
      }
      return jsonData || cellValue
    },
    hiddenLineageTab () {
      this.$emit('hiddenLineageTab')
    }
  },
  watch: {
    currentTab () {
      this.currentPage = 1
      this.pageSize = 20
      this.paginationShow = false
      this.changeShowData({
        currentPage: 1,
        pageSize: 20
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.show-tooltip-header {
  //border: 1px solid red;
  display: inline-block;
  // width: 100px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;

}

.sql-result-data {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  right: 0;

  .top-line {
    position: relative;
    height: 32px;
    border-bottom: 1px solid #e5e5e4;
    overflow: hidden;

    .data-tabs {
      margin-left: 20px;
      width: 85%;
    }
  }

  .hidden-btn {
    position: absolute;
    right: 20px;
    top: 3px;
    width: 20px;
    height: 20px;
    z-index: 2;
  }

  &.dark-theme-result {
    .top-line {
      border-bottom: 1px solid #353535;
    }
  }
}

.no-data, .table-outer {
  position: absolute;
  left: 20px;
  top: 32px;
  bottom: 2px;
  right: 20px;

  .center-content {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
}

</style>
