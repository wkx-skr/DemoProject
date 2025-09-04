import * as echarts from 'echarts'
import typeAnalysis from '../dataQuality/components/typeAnalysis.vue'
import systemAnalysis from '../dataQuality/components/systemAnalysis.vue'
import curveAnalysis from '../dataQuality/components/curveAnalysis.vue'
import moment from 'moment'
import html2pdf from 'html2pdf.js'

export default {
  components: {
    typeAnalysis,
    systemAnalysis,
    curveAnalysis,
  },
  data() {
    return {
      activeName: 'first',
      nowDate: null,
      nowStartTime: null,
      nowEndTime: null,
      dateRange1: {
        startTime: null,
        endTime: null,
      },
      dateRange2: {
        startTime: null,
        endTime: null,
      },
      dateRange3: {
        startTime: null,
        endTime: null,
      },
      systemNameArr: [],
      systemValueArr: [],
      curveData: [],
      curveNameArr: [],
      curveAddArr: [],
      curveDelArr: [],
      curveAllArr: [],
    }
  },
  mounted() {
    this.initDate()
    this.initTypeTab()
    this.initSystemTab()
    this.initCurveTab()
  },
  beforeDestroy() {},
  methods: {
    generate(name, className) {
      let opt = {
        margin: 15,
        filename: name + '.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          width: 1200,
          height: 1600,
        },
      }
      html2pdf().set(opt).from($(className)[0]).save()
    },
    initDate() {
      this.nowDate = new Date()
      this.nowEndTime = moment(this.nowDate).format('YYYY-MM-DD')
      this.nowStartTime = moment(this.nowDate - 518400000).format('YYYY-MM-DD')
      this.dateRange1.startTime = this.nowStartTime
      this.dateRange1.endTime = this.nowEndTime
      this.dateRange2.startTime = this.nowStartTime
      this.dateRange2.endTime = this.nowEndTime
      this.dateRange3.startTime = this.nowStartTime
      this.dateRange3.endTime = this.nowEndTime
    },
    initTypeTab() {
      if (
        this.dateRange1.startTime !== null &&
        this.dateRange1.endTime !== null
      ) {
        this.$http
          /* .get(
            this.$quality_url +
              `/dashboard/tech/task/class/count?start=${this.dateRange1.startTime}&end=${this.dateRange1.endTime}`
          ) */
          .get(
            this.$quality_url +
              `/dashboard/tech/task/class/count/v2?start=${this.dateRange1.startTime}&end=${this.dateRange1.endTime}`
          )
          .then(res => {
            let tempJson = {
              dateStr: [],
            }
            if (!Array.isArray(res.data) || res.data.length === 0) {
              return
            }
            res.data[0].optionDtoList.forEach(o => {
              tempJson[o.opName] = []
            })
            res.data.forEach(item => {
              tempJson.dateStr.push(item.date)
              item.optionDtoList.forEach(o => {
                tempJson[o.opName].push(o.opCount)
              })
            })
            const legend = res.data[0].optionDtoList.map(o => {
              return { name: o.opName }
            })
            this.$bus.$emit('typeData', tempJson, 0, legend)
          })
      } else {
        this.$message.warning(
          this.$t('quality.page.problemReport.message.name5')
        )
      }
    },
    initSystemTab() {
      this.systemValueArr = []
      this.systemNameArr = []
      if (
        this.dateRange2.startTime !== null &&
        this.dateRange2.endTime !== null
      ) {
        this.$http
          .get(
            this.$quality_url +
              `/dashboard/tech/task/category/count?start=${this.dateRange2.startTime}&end=${this.dateRange2.endTime}`
          )
          .then(res => {
            var count = 0
            if (res.data.length > 10) {
              res.data.forEach((item, index) => {
                if (index < 10) {
                  this.systemNameArr.push(item.categoryName)
                  this.systemValueArr.push(item.count)
                } else {
                  count += item.count
                }
              })
              this.systemNameArr.push('其他')
              this.systemValueArr.push(count)
            } else {
              res.data.forEach((item, index) => {
                this.systemNameArr.push(item.categoryName)
                this.systemValueArr.push(item.count)
              })
            }
            this.$bus.$emit(
              'systemData',
              this.systemNameArr,
              this.systemValueArr,
              1
            )
          })
          .catch(e => {
            this.$showFailure(e)
          })
      } else {
        this.$message.warning(
          this.$t('quality.page.problemReport.message.name5')
        )
      }
    },
    initCurveTab() {
      this.curveAddArr = []
      this.curveAllArr = []
      this.curveNameArr = []
      this.curveDelArr = []
      if (
        this.dateRange3.startTime !== null &&
        this.dateRange3.endTime !== null
      ) {
        this.$http
          .get(
            this.$quality_url +
              `/dashboard/tech/task/date/count?start=${this.dateRange3.startTime}&end=${this.dateRange3.endTime}`
          )
          .then(res => {
            res.data.forEach(item => {
              this.curveAddArr.push(item.add)
              this.curveAllArr.push(item.all)
              this.curveNameArr.push(item.date)
              this.curveDelArr.push(item.close)
            })
            this.$bus.$emit(
              'curveData',
              this.curveNameArr,
              this.curveAllArr,
              this.curveAddArr,
              this.curveDelArr,
              1
            )
          })
          .catch(e => {
            this.$showFailure(e)
          })
      } else {
        this.$message.warning(
          this.$t('quality.page.problemReport.message.name5')
        )
      }
    },
    changeTypeStart() {
      if (
        moment(this.dateRange1.startTime).valueOf() >
        moment(this.dateRange1.endTime).valueOf()
      ) {
        this.$message.warning(
          this.$t('quality.page.problemReport.message.name2')
        )
        this.dateRange1.startTime = null
      } else if (
        moment(this.dateRange1.endTime).valueOf() -
          moment(this.dateRange1.startTime).valueOf() >
        864000000
      ) {
        this.$message.warning(
          this.$t('quality.page.problemReport.message.name1')
        )
        this.dateRange1.startTime = null
      }
    },
    changeTypeEnd() {
      if (this.dateRange1.startTime === null) {
        this.$message.warning(
          this.$t('quality.page.problemReport.message.name3')
        )
        this.dateRange1.endTime = null
      } else if (
        moment(this.dateRange1.startTime).valueOf() >
        moment(this.dateRange1.endTime).valueOf()
      ) {
        this.$message.warning(
          this.$t('quality.page.problemReport.message.name4')
        )
        this.dateRange1.endTime = null
      } else if (
        moment(this.dateRange1.endTime).valueOf() -
          moment(this.dateRange1.startTime).valueOf() >
        864000000
      ) {
        this.$message.warning(
          this.$t('quality.page.problemReport.message.name1')
        )
        this.dateRange1.endTime = null
      }
    },
    changeSystemStart() {
      if (
        moment(this.dateRange2.startTime).valueOf() >
        moment(this.dateRange2.endTime).valueOf()
      ) {
        this.$message.warning(
          this.$t('quality.page.problemReport.message.name2')
        )
        this.dateRange2.startTime = null
      }
    },
    changeSystemEnd() {
      if (this.dateRange2.startTime === null) {
        this.$message.warning(
          this.$t('quality.page.problemReport.message.name3')
        )
        this.dateRange2.endTime = null
      } else if (
        moment(this.dateRange2.startTime).valueOf() >
        moment(this.dateRange2.endTime).valueOf()
      ) {
        this.$message.warning(
          this.$t('quality.page.problemReport.message.name4')
        )
        this.dateRange2.endTime = null
      }
    },
    changeCurveStart() {
      if (
        moment(this.dateRange3.startTime).valueOf() >
        moment(this.dateRange3.endTime).valueOf()
      ) {
        this.$message.warning(
          this.$t('quality.page.problemReport.message.name2')
        )
        this.dateRange3.startTime = null
      } else if (
        moment(this.dateRange3.endTime).valueOf() -
          moment(this.dateRange3.startTime).valueOf() >
        864000000
      ) {
        this.$message.warning(
          this.$t('quality.page.problemReport.message.name1')
        )
        this.dateRange3.startTime = null
      }
    },
    changeCurveEnd() {
      if (this.dateRange3.startTime === null) {
        this.$message.warning(
          this.$t('quality.page.problemReport.message.name3')
        )
        this.dateRange3.endTime = null
      } else if (
        moment(this.dateRange3.startTime).valueOf() >
        moment(this.dateRange3.endTime).valueOf()
      ) {
        this.$message.warning(
          this.$t('quality.page.problemReport.message.name4')
        )
        this.dateRange3.endTime = null
      } else if (
        moment(this.dateRange3.endTime).valueOf() -
          moment(this.dateRange3.startTime).valueOf() >
        864000000
      ) {
        this.$message.warning(
          this.$t('quality.page.problemReport.message.name1')
        )
        this.dateRange3.endTime = null
      }
    },
    downLoadType() {
      const url =
        this.$quality_url +
        `/dashboard/tech/problem/count/download/v2?start=${this.dateRange1.startTime}&end=${this.dateRange1.endTime}`
      this.$downloadFilePost(
        url,
        null,
        this.$t('quality.page.problemReport.tabbar.first') + '.xlsx'
      )
    },
    downLoadSystem() {
      const url =
        this.$quality_url +
        `/dashboard/tech/rule/count/download?start=${this.dateRange2.startTime}&end=${this.dateRange2.endTime}&type=5`
      this.$downloadFile(url)
    },
    downLoadCurve() {
      const url =
        this.$quality_url +
        `/dashboard/tech/rule/count/download?start=${this.dateRange3.startTime}&end=${this.dateRange3.endTime}&type=6`
      this.$downloadFile(url)
    },
  },
}
