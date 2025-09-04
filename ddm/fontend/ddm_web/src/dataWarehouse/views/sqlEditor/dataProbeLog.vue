<template>
  <div>
    <datablau-dialog
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      width="740px"
      append-to-body
      :blackTheme="true"
    >
      <div style="position: relative; top: -20px">{{ dialogProfile }}</div>
      <div id="profiling-chart" style="height: 350px"></div>
    </datablau-dialog>
    <datablau-dialog
      class="dialog-wrapper"
      :visible.sync="visible"
      title="数据探查"
      append-to-body
      @close="closeTableDetails"
      :blackTheme="true"
      height="600">
      <datablau-tips class="settingIcon" :effect=" $route.path.indexOf('sql_editor') !== -1?'light':'dark'" content="
如果数据探查无结果输出，请确认是否满足以下条件：<br>
1、数据库中存在此表并至少存储1条以上记录；<br>
2、探查时长和表数据量有关" icon="icon-tips" style="display:inline-block;margin-left:8px;color:#999">
      </datablau-tips>
      <datablau-tabs v-model="activeName" :themeBlack="true">
        <el-tab-pane label="数据探查" name="first"></el-tab-pane>
        <el-tab-pane label="数据预览" name="second"></el-tab-pane>
      </datablau-tabs>
      <!--<div class="no-data" v-if="activeName === 'first' && !objectId">
        <div class="center-content">
          <datablau-icon :data-type="'no-result'" icon-type="svg" :size="120"></datablau-icon>
          <div>数据库或元数据中未能找到此表</div>
        </div>
      </div>-->
      <datablau-table
        v-show="activeName === 'first'"
        :data="tableShowData"
        v-loading="loading"
        row-key="id"
        :element-loading-background="'rgba(0,0,0,0.6)'"
        height="406px"
        :themeBlack="true"
      >
        <el-table-column width="40" align="right" label="序号">
          <template slot-scope="scope">
            {{ $utils.string.appendLeadingZero(scope.$index + 1) }}
          </template>
        </el-table-column>
        <el-table-column
          label="信息名称"
          :width="150"
          show-overflow-tooltip>
          <template slot-scope="scope">
            <div style="line-height: 32px">
              <!--<img :src="iconSrc(dataTypeFormatter(scope.row))" :alt="dataTypeFormatter(scope.row)" style="height:24px;position:relative;top:6px;margin-right:0.5em;">-->
              {{ scope.row.columnName }}
            </div>
          </template>
        </el-table-column>
        <el-table-column
          prop="physicalName"
          label="数据类型"
          :width="128"
          show-overflow-tooltip>
          <template slot-scope="scope">
            <div
              style="line-height: 32px; display: inline-block"
              v-if="scope.row.columnType"
            >
              <datablau-tooltip
                :content="scope.row.columnType"
                placement="bottom"
                effect="dark"
              >
              <span
                v-html="iconHtmlFormat(dataTypeFormatter(scope.row))"
              ></span>
              </datablau-tooltip>
            </div>
          </template>
        </el-table-column>
        <el-table-column
          label="非空数据占比"
          :width="160"
          align="center"
          show-overflow-tooltip>
          <template slot-scope="scope">
            <profile-rate
              v-if="scope.row.profilingResult.rowCount > 0"
              :data="scope.row.profilingResult"
            ></profile-rate>
          </template>
        </el-table-column>
        <el-table-column
          label="值域分布"
          align="center"
          :width="180"
          show-overflow-tooltip>
          <template slot-scope="scope">
<!--            v-if="scope.row.access === true"-->
            <div >
              <profile-distribute
                v-if="scope.row.profilingResult.rowCount > 0"
                :fullData="scope.row"
                :data="scope.row.profilingResult"
                @pushDialog="handlePushDialog"
              ></profile-distribute>
            </div>
<!--            <span v-if="scope.row.access === false">无权查看</span>-->
          </template>
        </el-table-column>
        <el-table-column
          label="值域"
          align="left"
          show-overflow-tooltip>
          <template slot-scope="scope">
<!--             v-if="scope.row.access === true"-->
            <p>
              {{scope.row.profilingResult && scope.row.profilingResult.minValue }}～{{
              scope.row.profilingResult && scope.row.profilingResult.maxValue
              }}
            </p>
<!--            <span v-if="scope.row.access === false">无权查看</span>-->
          </template>
        </el-table-column>
      </datablau-table>
      <datablau-button
        class="probeBtn"
        @click="postProfile"
        type="important"
        v-if="!loading && tableShowData && !tableShowData.length && activeName==='first' && this.objectId"
      >执行探查</datablau-button>
      <div v-show="activeName === 'second'" style="height:406px" class="secondBox" v-loading="previewLog" :element-loading-background="'rgba(0,0,0,0.6)'">
        <div style="margin-bottom:10px">
          <datablau-button @click="sqlExpansion" type="text" >
            <span style="display: flex;align-items: center;">
            <i style="font-size: 14px;line-height: 24px;" v-if="!expansion" class="iconfont icon-shouqi"></i>
            <i style="font-size: 14px;line-height: 24px;" v-if="expansion" class="iconfont icon-zhankai"></i>
            </span>
          </datablau-button>
          <i></i>
        </div>
        <div v-if="expansion" style="height: 600px;">
          <monaco
            v-loading="loading"
            :element-loading-background="'rgba(0,0,0,0)'"
            ref="editor"
            :opts="monacoOpts"
            :isDiff="false"
            class="monacoEdit"
            @change="changeValue(...arguments)"
            style="height:130px"
          ></monaco>
          <datablau-button @click="getSqlList" :themeBlack="true" type="important" style="margin-top: 10px;width: auto">SQL执行</datablau-button>
        </div>
        <div :style="{height: expansion ? '50%': '100%',position:'relative'}">
          <datablau-table :themeBlack="true" :data="dataExplorationData" height="100%" v-show="dataExplorationColumn && dataExplorationColumn.length" class="blackTheme">
            <el-table-column
              v-for="item in dataExplorationColumn"
              :label="item"
              :key="item"
              :prop="item"
              :formatter="jsonFormatter"
              :min-width="130"
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
          <div class="no-data" v-if="!previewLog && (!dataExplorationColumn || !dataExplorationColumn.length)">
            <div class="center-content">
              <datablau-icon :data-type="'no-result'" icon-type="svg" :size="120"></datablau-icon>
              <div>暂无数据</div>
            </div>
          </div>
        </div>
      </div>
      <div slot="footer">
        <datablau-button :themeBlack="true" type="important" @click="addNewFile">
          确定
        </datablau-button>
      </div>
    </datablau-dialog>
  </div>
</template>

<script>
import HTTP from '@/dataWarehouse/resource/http'
import profileRate from './profileRate.vue'
import profileDistribute from './profileDistribute.vue'
import { Base64 } from 'js-base64'
import * as eChart from 'echarts'
import monaco from './monaco.vue'

export default {
  props: {
    dataProbeDialog: {
      type: Boolean,
      default: false
    },
    preview: {
      type: Boolean,
      default: false
    },
    columnMapping: {
      type: Object,
      default: () => {}
    },
    /* // 请求数据探查的表单的objectId
    objectId: {
      type: Number
    }, */
    threeIdName: {
      type: Object,
      default: () => {}
    }
  },
  components: { profileRate, profileDistribute, monaco },
  data () {
    return {
      tableShowData: null,
      activeName: this.preview ? 'second' : 'first',
      dataExplorationColumn: [],
      dataExplorationData: null,
      columnsArr: [],
      objectId: null,
      databaseType: '',
      dialogVisible: false,
      dialogTitle: '',
      dialogProfile: '',
      postProfileMth: false,
      visible: false,
      profilingInterval: null,
      loading: false,
      sqlSelect: '',
      previewLog: true,
      monacoOpts: {
        value: '',
        origin: '',
        readOnly: false,
        theme: 'vs-dark'
      },
      expansion: false,
      dataSourceList: []
    }
  },
  watch: {
    preview (val) {
      this.activeName = this.preview ? 'second' : 'first'
      this.preview && this.dataPreview()
      this.preview && this.getProbe()
    },
    /* objectId (val) {
      if (!val) return

    }, */
    threeIdName: {
      handler (val) {
        let ary = Object.values(val).filter(item => !item)
        if (!ary.length) {
          this.preview && this.dataPreview()
          this.visible = true
          this.getProbe()
        }
      },
      deep: true,
      immediate: true
    }
  },
  methods: {
    sqlExpansion () {
      this.expansion = !this.expansion
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
      } catch (e) {
      }
      return jsonData || cellValue
    },
    // 数据探查
    getProbe () {
      let url = `${HTTP.$dddServerUrl}datatype/${this.threeIdName.dataSourceId}/${this.threeIdName.schemaName}/${this.threeIdName.tableName}/profile`
      this.$http.get(url)
        .then(res => {
          //  tableShowData
          this.tableShowData = res.data.data
          /* this.columnsArr = []
          // console.log(res, 'res')
          this.objectId = res.data.content[0]?.objectId || null
          this.objectId && this.getColumns()
          if (!this.objectId) {
            /!*! this.preview && this.$datablauMessage.warning('数据库未能找到此表！') *!/
            this.tableShowData = []
            // !this.preview && (this.visible = false)
            // return
          }
          this.visible = true
          !this.preview && this.dataPreview() */
          !this.preview && this.dataPreview()
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    postProfile () {
      this.postProfileMth = true
      this.$http.post(`${HTTP.$damServerUrl}profile/${this.objectId}`)
        .then(res => {
          this.loading = true
          clearInterval(this.profilingInterval)
          this.profilingInterval = setInterval(() => {
            this.getProfilingState()
          }, 1500)
          // this.getProfileData()
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    getProfilingState () {
      this.$http.get(`${HTTP.$damServerUrl}profile/${this.objectId}/state`)
        .then(res => {
          if (res.data) {
          } else {
            clearInterval(this.profilingInterval)
            this.getColumns()
          }
        })
        .catch(e => {
          let errorMessage = ''
          if (typeof e === 'string') {
            errorMessage = e
          }
          if (e.response && e.response.data && e.response.data.errorMessage) {
            errorMessage = e.response.data.errorMessage
          }
          if (!errorMessage && e && e.message) {
            try {
              errorMessage = JSON.parse(e.message).errorMessage
            } catch (err) {
              console.warn(err)
              errorMessage = e.message
            }
          }
          console.log(errorMessage)
          if (errorMessage.indexOf('权限') !== -1) {
            clearInterval(this.profilingInterval)
            setTimeout(() => { this.getColumns() }, 3000)
            // this.$showFailure(errorMessage + '，请到dam平台添加相应权限')
            return
          }
          this.$showFailure(e)
        })
    },
    getProfileData () {
      this.loading = true
      this.$http.get(`${HTTP.$damServerUrl}profile/${this.objectId}`)
        .then(res => {
          const columnsProfileMap = new Map()
          /* if (!res.data.length && !this.postProfileMth) {
            this.postProfile()
          } */
          res.data.forEach(item => {
            columnsProfileMap.set(item.objectId, item)
            if (
              item.profileTimestamp &&
              item.profileTimestamp > this.profilingTimestamp
            ) {
              this.profilingTimestamp = item.profileTimestamp
            }
            if (item.typeId === 80000004) {
              this.profilingRowCount = item.rowCount
            }
            this.columnsArr.forEach(col => {
              col.profile = columnsProfileMap.get(col.objectId)
            })
          })
          // console.log(res.data, 'profile')
          res.data.length && (this.tableShowData = this.columnsArr || [])
          !res.data.length && (this.tableShowData = [])
          // console.log(this.columnsArr)
          this.loading = false
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    getSqlGeneration () {
      this.$http
        .get(HTTP.$dddServerUrl + `datatype/getSqlGeneration?datasourceId=${this.threeIdName.dataSourceId}&schemaName=${this.threeIdName.schemaName}&tableName=${this.threeIdName.tableName}`)
        .then(res => {
          this.sqlSelect = res.data.data.sqlSelect
          this.monacoOpts.value = this.sqlSelect
          this.getSqlList()
        })
        .catch(e => {
          this.previewLog = false
        })
    },
    changeValue (val) {
      this.sqlSelect = val
    },
    dataPreview () {
      this.visible = true
      this.previewLog = true
      this.getSqlGeneration()
      this.dataExplorationColumn = null
      // let sql = res.data.data.sqlSelect
    },
    getSqlList () {
      this.dataExplorationData = null
      let url = `${HTTP.$dddServerUrl}sqls/runSql`
      this.$http.post(url, {
        // timeout: 30000,
        datasourceId: this.threeIdName.dataSourceId,
        timeout: 1800,
        maxLine: 10,
        sql: Base64.encode(this.sqlSelect),
        uuid: new Date().getTime() + Number.parseInt(Math.random() * 1000),
        properties: [],
        funNames: []
      })
        .then(res => {
          if (res.data.code !== 200) {
            this.objectId && this.$datablauMessage.warning(res.data.msg)
            this.previewLog = false
            return
          }
          if (res.data.data.length) {
            let resData = res.data.data[0][0]
            this.dataExplorationColumn = resData.header || []
            let lastData = []
            resData.data.forEach((item) => {
              let obj = {}
              item.forEach((v, j) => {
                obj[this.dataExplorationColumn[j]] = v
              })
              lastData.push(obj)
            })
            // this.dataExplorationColumn = Object.keys(res.data.data[0][0])
            this.dataExplorationData = lastData || []
            this.dataExplorationVisible = true
          } else {
            this.dataExplorationData = []
            this.dataExplorationColumn = []
          }
          this.previewLog = false
        })
        .catch(e => {
          this.$showFailure(e)
          this.loading = false
        })
    },
    getProp () {
      this.$http
        .get(HTTP.$damServerUrl + `entities/${this.objectId}/summary/prop`)
        .then(res => {
          if (res.data.databaseType) {
            this.databaseType = res.data.databaseType.toUpperCase()
          }
          this.getProfileData()
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    getColumns () {
      // tableDetails.js文件中的 getColumnsData
      this.columnsArr = []
      HTTP.getColumns(this.objectId)
        .then(res => {
          res.sort((a, b) => {
            return a.ordinal - b.ordinal
          })
          this.columnsArr = res
          // this.getAccessibleList(this.columnsArr)
          this.getProp()
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    // 判断字段是否已有权限
    getAccessibleList (datas) {
      this.$http({
        url: HTTP.$damServerUrl + 'auth/check/batch',
        method: 'post',
        data: datas.map(data => ({
          itemType: 80000005,
          itemId: data.objectId
        }))
      })
        .then(res => {
          // console.log(datas, res.data)
          datas.forEach(item => {
            this.$set(item, 'access', res.data[item.objectId])
          })
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    addNewFile () {
      this.$emit('closeLog')
    },
    closeTableDetails () {
      clearInterval(this.profilingInterval)
      this.$emit('closeLog')
    },
    // 信息名称修改
    logicalNameFormatter (row) {
      if (row.logicalName) {
        return row.logicalName
      } else {
        return row.physicalName
      }
    },
    dataTypeFormatter (row) {
      if (!row.columnType) {
        return ''
      }
      let databaseType = this.dataSourceList.find(item => item.id === this.threeIdName.dataSourceId)?.type?.toUpperCase()
      let columnType = row.columnType?.replaceAll(/\s*\(.*?\)\s*/g, '').toUpperCase()
      let type = this.columnMapping[this.typeMap(databaseType) + '_@@_' + columnType]
      if (type !== undefined) {
        return type
      } else {
        return row.columnType.replaceAll(/\s*\(.*?\)\s*/g, '')
      }
    },
    typeMap (val) {
      let type
      switch (val) {
        case 'POSTGRESGL': type = 'POSTGRESGL'
          break
        case 'HIVE' : type = 'HIVE'
          break
        case 'CLICKHOUSE' : type = 'HIVE'
          break
        case 'ORACLE' : type = 'ORACLE'
          break
        case 'OCEANBASE-ORACLE' : type = 'ORACLE'
          break
        case 'GAUSSDB' : type = 'GAUSS'
          break
        default: type = 'MYSQL'
      }
      return type
    },
    iconHtmlFormat (name) {
      let formatedName = ''
      let color = ''
      let txtColor = ''
      formatedName = name.toUpperCase()
      switch (name) {
        case '时间':
          color = 'rgba(67, 193, 202, 0.1)'
          txtColor = '#43C1CA'
          break
        case '日期':
          color = 'rgba(67, 193, 202, 0.1)'
          txtColor = '#43C1CA'
          break
        case '数值':
          color = 'rgba(140, 92, 255, 0.1)'
          txtColor = '#8C5DFE'
          break
        case '文本':
          color = 'rgba(92,140,255,0.1)'
          txtColor = '#5C8CFF'
          break
        case '文件':
          color = 'rgba(227,188,55,0.1)'
          txtColor = '#E3BC37'
          break
        case 'JSON文件':
          color = 'rgba(235,132,73,0.1)'
          txtColor = '#EB8449'
          break
        case '二进制文件':
          color = 'rgba(125,194,106,0.1)'
          txtColor = '#7DC26A'
          break
        case '二进制文本':
          color = 'rgba(125,194,106,0.1)'
          txtColor = '#7DC26A'
          break
        case '二进制数据':
          color = 'rgba(125,194,106,0.1)'
          txtColor = '#7DC26A'
          break
        case '复合数据':
          color = 'rgba(97,128,231,0.1)'
          txtColor = '#6180E7'
          break
        case '布尔':
          color = 'rgba(203,112,222,0.1)'
          txtColor = '#CB7ADE'
          break
        default:
          color = 'rgba(153, 153, 153, 0.1)'
          txtColor = '#999'
          break
      }
      return `<span style="
      color: ${txtColor};background:${color};width:92px;height:22px;font-size: 14px;line-height:22px;text-align:center;border-radius:2px;display:inline-block;margin-right: 5px;overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;vertical-align: middle;
      margin-bottom: 3px;">${formatedName}</span>`
    },
    handlePushDialog ({ detail, graph }) {
      // console.log(detail, 'detaildetaildetail')
      const { columnName, logicalName, profilingResult, profileTimestamp } = detail
      const handleProfile = profile => {
        const { rowCount, distinctValueCount, minValue, maxValue } =
          profile
        let text = `上次运行时间：${this.$timeFormatter(
          profileTimestamp
        )}，`
        text = `"共分析了${rowCount}行，其中有${distinctValueCount}个不同取值`
        if (
          maxValue &&
          typeof maxValue === 'number' &&
          maxValue > 0.3e12 &&
          maxValue < 5.7e12
        ) {
          text += `，介于${minValue}和${maxValue}之间`
        } else if (maxValue && typeof maxValue === 'number') {
          text += `，介于${minValue}和${maxValue}之间`
        }
        return text
      }
      const profilingProfile = handleProfile(profilingResult)
      this.dialogProfile = profilingProfile
      this.dialogTitle = `字段“${columnName}"`
      if (logicalName) {
        this.dialogTitle += '(' + logicalName + ')'
      }
      this.dialogTitle += '”的值分布'
      // this.dialogHtml = graph;
      this.dialogVisible = true
      setTimeout(() => {
        this.drawEChart(graph)
      })
    },
    drawEChart (graph) {
      const [nameArray, rateArray] = [[], []]
      const rowCntMap = new Map()
      graph.forEach(item => {
        nameArray.push(
          item.name.split(this.$t('meta.DS.tableDetail.dataQuality.to'))[0]
        )
        rateArray.push(item.rate)
        rowCntMap.set(
          item.name.split(this.$t('meta.DS.tableDetail.dataQuality.to'))[0],
          item.rowCnt
        )
      })
      const option = {
        color: ['#4eb6ac'],
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            // 坐标轴指示器，坐标轴触发有效
            type: 'shadow' // 默认为直线，可选为：'line' | 'shadow'
          },
          // formatter:'{b0}<br>共{rowCntMap.get(b0)}<br>占比{c0}%'
          formatter: param => {
            let { data, name, color } = param[0]
            const wholeName = name
            let formatName = ''
            if (name.length <= 30) {
              formatName = name
            }
            while (name.length > 30) {
              formatName += name.slice(0, 30) + '<br>'
              name = name.slice(30)
            }
            return `${formatName}<br><span style="background-color:${color};width:10px;height:10px;display:inline-block;border-radius:3px;margin-right:0.5em;"></span>${this.$t(
              'meta.DS.tableDetail.dataQuality.appear'
            )}${rowCntMap.get(wholeName)}${this.$t(
              'meta.DS.tableDetail.dataQuality.times'
            )}<br><span style="background-color:${color};width:10px;height:10px;display:inline-block;border-radius:3px;margin-right:0.5em;"></span>${this.$t(
              'meta.DS.tableDetail.dataQuality.percent'
            )}${data}%`
          }
        },
        grid: {
          top: '10px',
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: [
          {
            type: 'category',
            data: nameArray,
            axisLabel: {
              color: '#fff',
              rotate: 60,
              formatter: data => {
                if (data.length < 10) {
                  return data
                } else {
                  return data.slice(0, 10) + '...'
                }
              }
            }
          }
        ],
        yAxis: [
          {
            type: 'value',
            axisLabel: {
              formatter: '{value}%',
              color: '#fff'
            }
          }
        ],
        series: [
          {
            name: this.$t('meta.DS.tableDetail.dataQuality.occupy'),
            type: 'bar',
            barWidth: '60%',
            data: rateArray
          }
        ]
      }
      eChart.init($('#profiling-chart')[0]).setOption(option)
    },
    getSourceList () {
      this.$http.get(`${this.$dddUrl}/service/model/getDataSource?projectId=${this.$route.query.projectId}`).then(res => {
        this.dataSourceList = res.data.data
      }).catch(e => {
        this.$showFailure(e)
      })
    }
  },
  mounted () {
    this.getSourceList()
  }
}
</script>

<style scoped lang='scss'>
  .no-data{
    position: absolute;
    left: 20px;
    top: 32px;
    bottom: 0;
    right: 20px;

    .center-content {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      text-align: center;
    }
  }
  .probeBtn{
    position: absolute;
    bottom: 60px;
    left: 50%;
    margin-left: -35px;
  }
  .settingIcon{
    position: absolute;
    top: -34px!important;
    left: 88px;
    color: #AFB1B4!important;
  }
  .secondBox{
    display: flex;
    flex-direction: column;
  }
</style>
