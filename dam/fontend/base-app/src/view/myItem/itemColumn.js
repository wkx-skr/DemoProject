import * as eChart from 'echarts'
import profileRate from './profileRate.vue'
import profileDistribute from './profileDistribute.vue'
export default {
  components: {
    profileRate,
    profileDistribute,
  },
  data() {
    return {
      /* columns: [
        {
          name: 'ID',
          chName: '唯一识别编码',
          dataType: 'NUMBER(19)',
        },
        {
          name: 'ACE_ORDER',
          chName: '次序',
          dataType: 'NUMBER(10)',
        },
        {
          name: 'AUDIT_FAILURE',
          chName: '失败',
          dataType: 'BOOLEAN',
        },
        {
          name: 'AUDIT_SUCCESS',
          chName: '成功',
          dataType: 'BOOLEAN',
        },
        {
          name: 'SID',
          dataType: 'CHAR(100)',
        },
        {
          name: 'MASK',
          dataType: 'CHAR(100)',
        },
        {
          name: 'ACL_OBJECT_IDENTITY',
          dataType: 'CHAR(100)',
        },
        {
          name: 'GRANTING',
          dataType: 'CHAR(100)',
        },
        {
          name: 'COMMENT',
          dataType: 'CHAR(100)',
        },
        {
          name: 'DEFAULT_OWNER',
          dataType: 'CHAR(100)',
        },
        {
          name: 'OPTIONAL',
          dataType: 'CHAR(100)',
        },
      ], */
      tableData: [],
      shortTableData: [],
      showFullData: false,
      style: {
        headerCellStyle: {
          backgroundColor: 'var(--main-content-bgc)',
          height: '40px',
          color: 'var(--base-font-color)',
          fontSize: '12px',
        },
        cellStyle: {
          height: '60px',
          fontSize: '12px',
          paddingLeft: '5px',
          paddingRight: 0,
          paddingTop: '8px',
          paddingBottom: '8px',
        },
        more: {
          height: '40px',
          lineHeight: '40px',
          textAlign: 'center',
        },
      },
      dialogVisible: false,
      dialogHtml: 'test',
      dialogTitle: this.$t('meta.DS.tableDetail.dataQuality.rangeDistribute'),
      dialogProfile: '',
      columnOption: {
        // selectable: true,
        showColumnSelection: false,
        // columnSelection: [],
        columnResizable: true,
      },
    }
  },
  props: {
    data: {
      type: Array,
    },
    metadata: {
      type: Boolean,
    },
    heightValue: {
      type: String,
    },
    columnMapping: {
      type: Object,
    },
    databaseType: {},
  },
  mounted() {
    this.data.forEach(column => {
      if (column.tags && Array.isArray(column.tags)) {
        this.$utils.sort.sort(column.tags, 'name')
      }
    })
    this.tableData = this.data
    this.draw()
  },
  methods: {
    logicalNameFormatter(row) {
      if (row.logicalName) {
        return row.logicalName
      } else {
        return row.physicalName
      }
    },
    dataTypeFormatter(row) {
      if (!row.type) {
        return ''
      }
      let type =
        this.columnMapping[
          this.databaseType + '_@@_' + row.type.replaceAll(/\s*\(.*?\)\s*/g, '')
        ]
      if (type !== undefined) {
        return type
      } else {
        return row.type.replaceAll(/\s*\(.*?\)\s*/g, '')
      }
      // const type = row.type.toLowerCase()
      // if (
      //   type.includes('int') ||
      //   type.includes('long') ||
      //   type.includes('number')
      // ) {
      //   return 'number'
      // } else if (type.includes('char') || type.includes('text')) {
      //   return 'string'
      // } else if (type.includes('time') || type.includes('date')) {
      //   return 'time'
      // } else {
      //   return row.type
      // }
    },
    iconSrc(name) {
      return require(`../../assets/images/icon/${name}.svg`)
    },
    iconHtmlFormat(name) {
      let formatedName = ''
      let color = ''
      let txtColor = ''
      formatedName = name.toUpperCase()
      switch (name) {
        case this.$t('meta.common.datatype.time'):
          color = 'rgba(67, 193, 202, 0.1)'
          txtColor = '#43C1CA'
          break
        case this.$t('meta.common.datatype.date'):
          color = 'rgba(67, 193, 202, 0.1)'
          txtColor = '#43C1CA'
          break
        case this.$t('meta.common.datatype.int'):
          color = 'rgba(140, 92, 255, 0.1)'
          txtColor = '#8C5DFE'
          break
        case this.$t('meta.common.datatype.text'):
          color = 'rgba(92,140,255,0.1)'
          txtColor = '#5C8CFF'
          break
        case this.$t('meta.common.datatype.file'):
          color = 'rgba(227,188,55,0.1)'
          txtColor = '#E3BC37'
          break
        case this.$t('meta.common.datatype.json'):
          color = 'rgba(235,132,73,0.1)'
          txtColor = '#EB8449'
          break
        case this.$t('meta.common.datatype.binaryFile'):
          color = 'rgba(125,194,106,0.1)'
          txtColor = '#7DC26A'
          break
        case this.$t('meta.common.datatype.binaryText'):
          color = 'rgba(125,194,106,0.1)'
          txtColor = '#7DC26A'
          break
        case this.$t('meta.common.datatype.binaryData'):
          color = 'rgba(125,194,106,0.1)'
          txtColor = '#7DC26A'
          break
        case this.$t('meta.common.datatype.complexData'):
          color = 'rgba(97,128,231,0.1)'
          txtColor = '#6180E7'
          break
        case this.$t('meta.common.datatype.boolean'):
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
    handleExpand() {
      this.showFullData = true
      this.tableData = this.data
      /* setTimeout(()=>{
        this.draw();
      }); */
      this.$emit('height-update')
    },
    handleCollapse() {
      this.showFullData = false
      this.tableData = this.shortTableData
      this.$emit('height-update')
    },
    draw() {
      const vm = this
      const rateOption = {
        animation: false,
        color: ['#1D69DB', '#FFF'],
        series: [
          {
            name: vm.$t('meta.DS.tableDetail.dataQuality.accessSource'),
            type: 'pie',
            radius: ['45%', '65%'],
            hoverAnimation: false,
            avoidLabelOverlap: false,
            emphasis: {
              label: {
                show: true,
                formatter: '{c}',
              },
            },
            label: {
              show: false,
              position: 'center',
            },
            labelLine: {
              show: false,
            },
            data: [
              {
                value: 100,
                name: vm.$t('meta.DS.tableDetail.dataQuality.directAccess'),
              },
            ],
          },
        ],
      }
      const distOption = {
        xAxis: {
          show: false,
          type: 'value',
          boundaryGap: false,
        },
        yAxis: {
          show: false,
          min: 0,
          max: /* 'dataMax' */ 100,
          type: 'value',
        },
        series: [
          {
            data: [
              [1, 100],
              [2, 80],
              [3, 70],
              [4, 60],
              [5, 70],
              [6, 65],
              [7, 55],
              [8, 65],
              [9, 55],
              [10, 60],
            ],
            type: 'line',
            itemStyle: {
              color: 'transparent',
              opacity: 0,
            },
            lineStyle: {
              color: 'transparent',
            },
            areaStyle: {
              color: '#E4E4E4',
            },
            hoverAnimation: false,
          },
        ],
      }
      this.tableData.forEach((item, index) => {
        if ($('#rate-' + index).length > 0) {
          eChart
            .init(document.getElementById('rate-' + index))
            .setOption(rateOption)
        }
        if ($('#dist-' + index).length > 0) {
          eChart
            .init(document.getElementById('dist-' + index))
            .setOption(distOption)
        }
      })
    },
    handlePushDialog({ detail, graph }) {
      const { physicalName, logicalName, profile } = detail
      const handleProfile = profile => {
        let text = `上次运行时间：${this.$timeFormatter(
          profile.profileTimestamp
        )}，`
        if (profile.profilingResult) {
          const { rowCount, distinctValueCount, minValue, maxValue } =
            profile.profilingResult
          text = this.$t('meta.DS.tableDetail.dataQuality.dialogText', {
            rowCount: rowCount,
            distinctValueCount: distinctValueCount,
          })
          if (
            maxValue &&
            typeof maxValue === 'number' &&
            maxValue > 0.3e12 &&
            maxValue < 5.7e12
          ) {
            text += this.$t('meta.DS.tableDetail.dataQuality.dialogText1', {
              minValue: this.$timeFormatter(minValue),
              maxValue: this.$timeFormatter(maxValue),
            })
          } else if (maxValue && typeof maxValue === 'number') {
            text += this.$t('meta.DS.tableDetail.dataQuality.dialogText1', {
              minValue: minValue,
              maxValue: maxValue,
            })
          }
        }
        return text
      }
      const profilingProfile = handleProfile(profile)
      this.dialogProfile = profilingProfile
      this.dialogTitle = this.$t(
        'meta.DS.tableDetail.dataQuality.dialogTitle',
        { title: physicalName }
      )
      if (logicalName) {
        this.dialogTitle += '(' + logicalName + ')'
      }
      this.dialogTitle += this.$t(
        'meta.DS.tableDetail.dataQuality.dialogTitleSuffix'
      )
      // this.dialogHtml = graph;
      this.dialogVisible = true
      setTimeout(() => {
        this.drawEChart(graph)
      })
    },
    drawEChart(graph) {
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
            type: 'shadow', // 默认为直线，可选为：'line' | 'shadow'
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
          },
        },
        grid: {
          top: '10px',
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true,
        },
        xAxis: [
          {
            type: 'category',
            data: nameArray,
            axisLabel: {
              rotate: 60,
              formatter: data => {
                if (data.length < 10) {
                  return data
                } else {
                  return data.slice(0, 10) + '...'
                }
              },
            },
          },
        ],
        yAxis: [
          {
            type: 'value',
            axisLabel: {
              formatter: '{value}%',
            },
          },
        ],
        series: [
          {
            name: this.$t('meta.DS.tableDetail.dataQuality.occupy'),
            type: 'bar',
            barWidth: '60%',
            data: rateArray,
          },
        ],
      }
      eChart.init($('#profiling-chart')[0]).setOption(option)
    },
  },
  watch: {
    tableData(val) {
      console.log(val)
    },
  },
}
