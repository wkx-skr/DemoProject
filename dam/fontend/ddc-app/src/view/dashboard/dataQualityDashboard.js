import * as echarts from 'echarts'
import moment from 'moment'

export default {
  mounted() {
    setTimeout(() => {
      this.resize()
    })
    $('#q-d-container').addClass('qua-dashboard')
    $(window).resize(this.resize)
    this.getData()
  },
  destroyed() {
    $(window).unbind('resize', this.resize)
    $('#q-d-container').removeClass('qua-dashboard')
    Ps.update($('#main-content')[0])
  },
  data() {
    return {
      importantIssuesTopTen: [],
      goodEmployees: [],
      qualityData: {
        dataQuaScore: 0, // 质量总分
        totalRules: 0,
        totalBuRuleCnt: 0,
        totalTechRuleCnt: 0,
        buRuleCatalogs: [],
        buRuleCategories: [],
        taskStateCount: 0,
        taskStatesArr: [],
      },
      resizeHandle: [], // window resize 回调函数
      colors: ['#5793f3', '#d14a61', '#675bba', '#3b6f80', '#3a4388'],
      eChartsMethods: {},
      tableMethods: {
        setImpProData: undefined,
      },
      stateMap: {
        Not_Started: '未开始',
        Progressing: '未完成',
        Complete: '已完成',
      },
      bottomTableHeight: 0,
      detaildebounce: false,
      heightSave: '',
    }
  },
  methods: {
    // 响应事件
    initTable(classStr) {
      setTimeout(() => {
        const dom = $(classStr)[0]
        if (!dom) return
        Ps.initialize(dom)
        this.addResize(() => {
          Ps.update(dom)
        })
      }, 50)
    },
    resize() {
      const cardWidth = parseFloat($('.card').css('width'))
      $('.big-card.right').css('width', cardWidth * 2 + 1 * 10 + 'px')
      $('.big-card.left').css('width', cardWidth * 3 + 2 * 10 + 'px')
      setTimeout(() => {
        const heightLeft =
          parseInt($('#second-row').css('height')) -
          parseInt($('.echarts-row.el-row').css('height'))
        $('.index-row').css('height', heightLeft - 15 + 'px')
        this.bottomTableHeight = parseInt($('.imp-pro').css('height')) - 0
        this.resizeHandle.forEach(fn => {
          /* update eCharts dom & bottom table height */
          fn && fn()
        })
        Ps.update($('#main-content')[0])
        this.testHeight()
      }, 50)
    },
    sysProShow(show) {
      $('.echarts-row .left .mon-week div').removeClass('active')
      $('.echarts-row .left .mon-week div.' + show).addClass('active')
      this.eChartsMethods.setSysProData &&
        this.eChartsMethods.setSysProData(show)
    },
    impProShow(show) {
      $('.index-row .left .mon-week div').removeClass('active')
      $('.index-row .left .mon-week div.' + show).addClass('active')
      this.tableMethods.setImpProData && this.tableMethods.setImpProData(show)
    },
    showList(className, bool) {
      if (this.detaildebounce || (bool && bool !== 'false')) {
        return
      }
      const $dom1 = $('.' + className + ' .detail.show-list')
      const $ul = $('.' + className + ' .detail > ul')
      const $hideLi = $('.' + className + ' li.hidden-li')
      const $arrowBtn = $('.' + className + ' .arrow-btn')
      this.heightSave = this.detaildebounce ? this.detaildebounce : $ul.height()
      this.detaildebounce = true
      const $detail = $('.' + className + ' .detail')
      if ($dom1.length > 0 || (bool && bool === 'false')) {
        // hide
        $ul
          .css({
            overflow: 'hidden',
          })
          .animate(
            {
              height: '50px',
            },
            '500',
            'linear'
          )
        $arrowBtn.removeClass('rote-arr')
        setTimeout(() => {
          $detail.css({
            overflow: 'hidden',
          })
          $ul.css({
            overflow: 'visible',
            height: 'auto',
          })
          $hideLi.css({
            visibility: 'hidden',
          })
          $detail.removeClass('show-list')
          this.detaildebounce = false
        }, 600)
      } else {
        // show
        $detail.addClass('show-list')
        $detail.css({
          overflow: 'visible',
        })
        $ul.css({
          height: '50px',
          overflow: 'hidden',
          // border: '3px solid red',
        })
        $hideLi.css({
          visibility: 'visible',
        })
        $ul.animate(
          {
            height: this.heightSave,
          },
          '500'
        )
        $arrowBtn.addClass('rote-arr')
        setTimeout(() => {
          $ul.css({
            overflow: 'visible',
            // border: 'none',
          })
          this.detaildebounce = false
        }, 800)
      }
    },
    hideOverflow(className) {
      this.showList(className, 'false')
    },
    // 处理显示的数据
    initScore() {
      const option0 = {
        series: [
          {
            name: '质量总分',
            type: 'gauge',
            axisLine: {
              show: true,
              lineStyle: {
                color: [
                  [0.6, '#ef514d'],
                  [0.8, '#fcb100'],
                  [1.0, '#54d086'],
                ],
              },
            },
            detail: {
              formatter: '{value}',
            },
            data: [
              {
                value: this.qualityData.dataQuaScore,
                name: '',
              },
            ],
          },
        ],
      }
      echarts.init($('.graph [data-id="0"]')[0]).setOption(option0)
    },
    initTopCharts({ datas }) {
      const optionBase = {
        tooltip: {
          trigger: 'item',
          formatter: '{b}: {c} ({d}%)',
          textStyle: {
            fontSize: 36,
          },
        },
        title: {},
        legend: {
          show: false,
        },
        series: [
          {
            type: 'pie',
            radius: '65%',
            center: ['50%', '50%'],
            label: {
              normal: {
                show: false,
              },
            },
            selectedMode: 'single',
            // data: data1.data,
          },
        ],
      }
      const opts = []
      for (let i = 0; i < 4; i++) {
        opts[i] = _.assign({}, optionBase)
        opts[i].series[0].data = datas[i].data
        echarts
          .init($('.graph [data-id="' + (i + 1) + '"]')[0])
          .setOption(opts[i])
      }
      this.$nextTick(() => {
        this.setColor()
      })
    },
    setColor() {
      let i = 0
      let $dom = $('.legend' + i)
      while ($dom.length > 0) {
        if (this.colors.length === 0) {
          this.colors.length = 1
        }
        $dom.css({
          backgroundColor: this.colors[i % this.colors.length],
        })
        i++
        $dom = $('.legend' + i)
      }
    },

    initMiddleCharts1({ monthData, weekData, dayData }) {
      const sys_selected = {}
      monthData.sys_name.forEach((item, index) => {
        sys_selected[item] = index < 3
      })
      const option_system_month = {
        color: this.colors,
        tooltip: {
          show: true,
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
          },
        },
        legend: {
          data: monthData.sys_name,
          type: 'scroll',
          orient: 'vertical',
          x: 'right',
          y: 'middle',
          itemGap: 10,
          itemWidth: 6,
          itemHeight: 6,
          icon: 'circle',
          align: 'left',
          selected: sys_selected,
        },
        grid: {
          show: false,
          top: 30,
          bottom: 40,
          left: 50,
          right: '20%',
          width: 'auto',
        },
        xAxis: {
          type: 'category',
          name: '时间',
          axisTick: {
            alignWithLabel: true,
            interval: 0,
          },
          axisLine: {
            show: true,
            onZero: false,
            lineStyle: {
              // color: colors[1]
            },
          },
          axisPointer: {
            label: {
              formatter: function (params) {
                return '时间：' + params.value
              },
            },
          },
          splidLine: {
            show: true,
          },
          data: monthData.time_data,
        },
        yAxis: {
          show: true,
          type: 'value',
          name: '问题数',
          // min: (value) => {
          //   let result = 0;
          //   if (value.min - 100 > 0) {
          //     result = (parseInt(value.min / 100) - 1) * 100;
          //   }
          //   return result;
          // },
          // max: (value) => {
          //   return (parseInt(value.max / 100) + 2) * 100;
          // },
          splitLine: {
            show: true,
            interval: 'auto',
          },
          axisPointer: {
            show: true,
            type: 'line',
            snap: true,
          },
          axisTick: {
            show: true,
          },
          axisLabel: {
            show: true,
          },
        },
        series: monthData.datas,
      }
      function getOption(data) {
        const obj = _.cloneDeep(option_system_month)
        obj.legend.data = data.sys_name
        obj.xAxis.data = data.time_data
        obj.series = data.datas
        return obj
      }
      const option_system_week = getOption(weekData)
      const option_system_day = getOption(dayData)
      // option_system_week.legend.data = weekData.sys_name;
      setTimeout(() => {
        const systemGraph = echarts.init($('#system-graph')[0])
        systemGraph.setOption(option_system_month)
        this.addResize(systemGraph.resize)
        this.eChartsMethods.setSysProData = show => {
          if (show === 'month') {
            systemGraph.setOption(option_system_month)
          } else if (show === 'week') {
            systemGraph.setOption(option_system_week)
          } else if (show === 'day') {
            systemGraph.setOption(option_system_day)
          }
        }
      })
    },
    initMiddleCharts2({ dep_name, dep_pro }) {
      // let colors = ['#5793f3', '#d14a61', '#675bba'];
      const option_department = {
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b}: {c} ({d}%)',
        },
        legend: {
          type: 'scroll',
          pageIconSize: 8,
          orient: 'vertical',
          x: 'right',
          y: 'middle',
          data: dep_name,
          itemGap: 40,
          itemWidth: 16,
          itemHeight: 6,
          icon: 'circle',
          align: 'left',
          width: 'auto',
        },
        series: [
          {
            name: '问题数量',
            type: 'pie',
            radius: ['56%', '70%'],
            center: ['30%', '50%'],
            avoidLabelOverlap: false,
            label: {
              normal: {
                show: false,
                position: 'center',
              },
              emphasis: {
                show: true,
                textStyle: {
                  fontSize: '18',
                  fontWeight: 'bold',
                },
              },
            },
            labelLine: {
              normal: {
                show: false,
              },
            },
            data: dep_pro,
          },
        ],
      }
      setTimeout(() => {
        const departmentGraph = echarts.init($('#department-graph')[0])
        departmentGraph.setOption(option_department)
        this.addResize(departmentGraph.resize)
      }, 0)
    },
    // 处理不直接显示的数据
    getData() {
      this.$http
        .get(this.$url + '/service/dashboard/quality')
        .then(res => {
          const qualityData = res.data
          if (!qualityData) return
          const aqualityData = {
            totalBuRuleCnt: 0,
            totalTechRuleCnt: 0,
            buRuleState: [],
            techRuleState: [
              {
                group: 1,
                count: 5,
              },
            ],
            buRuleCatalog: [],
            techRuleCatalog: [
              {
                group: '其他',
                count: 5,
              },
            ],
            buRuleCategory: [],
            techRuleCategory: [
              {
                group: 0,
                count: 4,
              },
              {
                group: 1,
                count: 1,
              },
            ],
            techRuleModelCategory: [
              {
                group: 'ods',
                count: 2,
              },
              {
                group: 'dw',
                count: 2,
              },
              {
                group: 'yh',
                count: 1,
              },
            ],
            taskState: [
              {
                group: 'Progressing',
                count: 3,
              },
            ],
          }
          this.qualityData.totalBuRuleCnt = qualityData.totalBuRuleCnt
          this.qualityData.totalTechRuleCnt = qualityData.totalTechRuleCnt
          this.qualityData.totalRules =
            qualityData.totalBuRuleCnt + qualityData.totalTechRuleCnt
          const datas = []
          /* 质量规则 */
          datas[0] = {
            data: [
              {
                value: qualityData.totalBuRuleCnt,
                name: '业务规则',
              },
              {
                value: qualityData.totalTechRuleCnt,
                name: '技术规则',
              },
            ],
          }
          /* 按目录统计 */
          datas[1] = { data: [] }
          qualityData.buRuleCatalog.forEach(item => {
            datas[1].data.push({
              value: item.count,
              name: item.group,
            })
            this.qualityData.buRuleCatalogs.push(item.group)
          })
          if (datas[1].data.length === 0) {
            datas[1].data.push({
              value: 0,
              name: '',
            })
          }
          /* 按类型统计 */
          datas[2] = { data: [] }
          qualityData.buRuleCategory.forEach(item => {
            const str = this.$ruleCategoryMap[item.group]
            if (!str) return
            datas[2].data.push({
              value: item.count,
              name: str,
            })
            this.qualityData.buRuleCategories.push(str)
          })
          if (datas[2].data.length === 0) {
            datas[2].data.push({
              value: 0,
              name: '',
            })
          }
          /* 监测任务 */
          datas[3] = { data: [] }
          this.qualityData.taskStateCount = 0
          qualityData.taskState.forEach(item => {
            const str = this.stateMap[item.group]
            this.qualityData.taskStatesArr.push(str)
            datas[3].data.push({
              value: item.count,
              name: str,
            })
            this.qualityData.taskStateCount += item.count - 0
          })
          if (datas[3].data.length === 0) {
            datas[3].data.push({
              value: 0,
              name: '',
            })
          }
          for (let j = 0; j < 4; j++) {
            for (let i = 0, len = datas[j].data.length; i < len; i++) {
              const obj = {
                itemStyle: {
                  normal: {
                    color: this.colors[i],
                  },
                },
              }
              _.assign(datas[j].data[i], obj)
            }
          }
          const obj = {}
          obj.datas = datas
          this.initTopCharts(obj)

          setTimeout(() => {
            this.testHeight() /* reset top echarts legend height */
          }, 100)
        })
        .catch(e => {
          this.$showFailure(e)
        })

      this.$http
        .get(this.$url + '/service/dashboard/qualityStatistics')
        .then(res => {
          let staData = res.data
          /* get echart options */
          const getData = oldData => {
            oldData = oldData || {
              xAxis: [],
              series: [],
            }
            const obj = {}
            obj.time_data = [] // 横坐标
            oldData.xAxis.forEach(item => {
              obj.time_data.push(item)
            })
            obj.sys_name = [] // 系统
            obj.datas = [] // 值
            oldData.series.forEach(item => {
              const obj2 = {
                name: item.name,
                id: item.id,
                type: 'line',
                smooth: true,
                data: item.data,
                connectNulls: true,
              }
              obj.sys_name.push(item.name)
              obj.datas.push(obj2)
            })
            return obj
          }
          /* dealwith table data */
          const getRuleData = oldData => {
            oldData = oldData || {
              series: [],
            }
            const arr = []
            oldData.series.forEach(item => {
              arr.push({
                name: item.name,
                id: item.id,
                data: item.data[item.data.length - 1],
                time: oldData.xAxis[oldData.xAxis.length - 1],
              })
            })
            return arr
          }
          if (!staData) {
            // set empty data
            staData = {}
            const empObj = {
              xAxis: [],
              series: [],
            }
            const objArr = [
              'mcDaily',
              'mcWeekly',
              'mcMonthly',
              'ruleDaily',
              'ruleWeekly',
              'ruleMonthly',
            ]
            objArr.forEach(item => {
              staData[item] = _.clone(empObj)
            })
            _.assign(staData, {
              ruleDetail: [],
              taskTopUsers: [],
              score: 0,
            })
          }
          this.qualityData.dataQuaScore = staData.score
          this.initScore()
          /* 系统问题发现情况 */
          const monthData = getData(staData.mcMonthly)
          const weekData = getData(staData.mcWeekly)
          const dayData = getData(staData.mcDaily)
          this.initMiddleCharts1({ monthData, weekData, dayData })
          const showItemInd = 5 /* 下方table 显示的行数 */
          const impRuleData_day = getRuleData(staData.ruleDaily).slice(
            0,
            showItemInd
          )
          const impRuleData_week = getRuleData(staData.ruleWeekly).slice(
            0,
            showItemInd
          )
          const impRuleData_month = getRuleData(staData.ruleMonthly).slice(
            0,
            showItemInd
          )

          /* 重点规则 */
          this.importantIssuesTopTen = impRuleData_month
          if (staData.ruleDaily && staData.ruleDaily.series) {
            staData.ruleDaily.series = staData.ruleDaily.series.slice(
              0,
              showItemInd
            )
          }
          if (staData.ruleWeekly && staData.ruleWeekly.series) {
            staData.ruleWeekly.series = staData.ruleWeekly.series.slice(
              0,
              showItemInd
            )
          }
          if (staData.ruleMonthly && staData.ruleMonthly.series) {
            staData.ruleMonthly.series = staData.ruleMonthly.series.slice(
              0,
              showItemInd
            )
          }
          const tableEhartsData = staData.ruleDaily
          if (tableEhartsData && tableEhartsData.series) {
            const tableLength = tableEhartsData.series.length
            const getTableEchartsOptionArr = oldData => {
              if (!oldData.series) {
                return
              }
              const arr = []
              oldData.series.forEach(item => {
                const option = {
                  title: {
                    show: false,
                  },
                  tooltip: {
                    show: true,
                    confine: true,
                    formatter: '{b}：{c}',
                  },
                  legend: {
                    show: false,
                  },
                  grid: {
                    // show: true,
                    left: 10,
                    top: 4,
                    right: 10,
                    bottom: 4,
                  },
                  xAxis: {
                    show: true,
                    position: 'bottom',
                    type: 'category',
                    // name: '时间',
                    nameLocation: 'end',
                    boundaryGap: false,
                    data: oldData.xAxis,
                    axisTick: {
                      show: false,
                    },
                    axisLabel: {
                      show: false,
                    },
                    splitLine: {
                      show: false,
                    },
                  },
                  yAxis: {
                    type: 'value',
                    name: '发现问题数',
                    show: true,
                    axisLine: {
                      show: true,
                    },
                    splitLine: {
                      show: true,
                    },
                    axisTick: {
                      show: false,
                    },
                    axisLabel: {
                      show: false,
                    },
                  },
                  series: [
                    {
                      data: item.data,
                      name: '重点问题解决情况',
                      type: 'line',
                      symbol: 'emptyCircle',
                      showSymbol: true,
                      showAllSymbol: true,
                      areaStyle: {
                        normal: {
                          color: '#E9E1C9',
                        },
                      },
                      connectNulls: true,
                    },
                  ],
                }
                arr.push(option)
              })
              return arr
            }
            const dayImpOptionsArr = getTableEchartsOptionArr(staData.ruleDaily)
            const weekImpOptionsArr = getTableEchartsOptionArr(
              staData.ruleWeekly
            )
            const monthImpOptionsArr = getTableEchartsOptionArr(
              staData.ruleMonthly
            )
            const tableEchartArr = []
            for (let i = 0; i < tableLength; i++) {
              setTimeout(() => {
                const $dom = $('.trend-pic .rule-trend')[i]
                tableEchartArr[i] = echarts.init($dom)
                tableEchartArr[i].setOption(monthImpOptionsArr[i])
                this.addResize(tableEchartArr[i].resize)
              }, 0)
            }
            this.tableMethods.setImpProData = show => {
              if (show === 'day') {
                this.importantIssuesTopTen = impRuleData_day
                tableEchartArr.forEach((item, index) => {
                  item.setOption(dayImpOptionsArr[index])
                })
              } else if (show === 'week') {
                this.importantIssuesTopTen = impRuleData_week
                tableEchartArr.forEach((item, index) => {
                  item.setOption(weekImpOptionsArr[index])
                })
              } else if (show === 'month') {
                this.importantIssuesTopTen = impRuleData_month
                tableEchartArr.forEach((item, index) => {
                  item.setOption(monthImpOptionsArr[index])
                })
              }
            }
          }

          /* 各系统未完成质量修复任务状况统计 */
          const dep_pro = []
          const dep_name = []
          if (staData.ruleDetail && Array.isArray(staData.ruleDetail)) {
            staData.ruleDetail.forEach(item => {
              const obj1 = {
                name: item.name,
                value: item.errorCnt,
                id: item.id,
              }
              dep_pro.push(obj1)
              dep_name.push(obj1.name)
            })
          }
          if (dep_pro.length === 0) {
            const obj1 = {
              name: '',
              value: 0,
              id: 0,
            }
            dep_pro.push(obj1)
            dep_name.push(obj1.name)
          }
          const obj2 = { dep_name, dep_pro }
          this.initMiddleCharts2(obj2)

          /* 先进个人 */
          staData.taskTopUsers.forEach(item => {
            this.goodEmployees.push({
              // 'order': i + 1,
              name: item.user,
              department: item.department,
              total: item.totalCnt,
              recent: item.recentCnt,
            })
          })
          this.initTable(
            '.imp-prob-list .el-table__body-wrapper.is-scrolling-none'
          )
          this.initTable(
            '.per-top-10 .el-table__body-wrapper.is-scrolling-none'
          )
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    addResize(fn) {
      this.resizeHandle.push(fn)
    },
    testHeight() {
      /* 设置顶部 echarts 图例高度 */
      const resetClass = className => {
        const $dom1 = $('.' + className + ' .detail')
        const $dom2 = $('.' + className + ' ul')
        const $dom3 = $('.' + className + ' ul li')
        if ($dom2.height() > $dom1.height()) {
          $dom1.addClass('overheight')
        } else {
          $dom1.removeClass('overheight')
        }
        $dom3.each((index, ele) => {
          // 判断是否显示单个li标签,防止显示半行文字
          if (ele.offsetTop > 30) {
            $(ele).addClass('hidden-li').css({
              visibility: 'hidden',
            })
          } else {
            $(ele).removeClass('hidden-li').css({
              visibility: 'visible',
            })
          }
        })
      }
      resetClass('content-way')
      resetClass('type-way')
    },
  },
}
