import pdGraph from './pdGraph.vue'
export default {
  components: {
    pdGraph,
  },
  props: {
    rootData: {
      required: true,
      type: Array,
    },
  },
  data() {
    return {
      base: 'busDepartment',
      thisYear: true,
      timeBase: 'month',
      tableData: [],
      graphData: null,
      loading: false,
      popoverVisible: false,
      pdGraphKey: 0,
      ruleDelete: [],
    }
  },
  mounted() {
    this.prepareData()
  },
  beforeDestroy() {
    setTimeout(() => {
      this.ruleDelete.forEach(item => {
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
      const cluster = new Map()
      this.rootData.forEach(rule => {
        if (this.base === 'bigClassSelectOption') {
          const clusterFullType = rule[this.base]
          if (clusterFullType) {
            const clusterType = clusterFullType.split(' /')[0]
            if (cluster.has(clusterType)) {
              cluster.get(clusterType).push(rule)
            } else {
              cluster.set(clusterType, [rule])
            }
          }
        } else {
          const clusterType = rule[this.base]
          if (cluster.has(clusterType)) {
            cluster.get(clusterType).push(rule)
          } else {
            cluster.set(clusterType, [rule])
          }
        }
      })
      const tableData = []
      cluster.forEach((item, key) => {
        const countResult = {
          category: key,
          keys: [],
          values: [],
          problem: 0,
          problemIncrease: 0,
          iProblem: 0,
          iProblemIncrease: 0,
        }
        if (!key) {
          countResult.category = '-'
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
        let notNullIndex = -1
        item.forEach((rule, index) => {
          if (rule[scale]) {
            notNullIndex = index
          }
        })
        item.forEach((rule, index) => {
          if (rule[scale]) {
            Object.keys(rule[scale]).forEach((label, objIndex) => {
              const value = rule[scale][label]
              if (index === notNullIndex) {
                if (this.timeBase === 'week') {
                  if (label.includes(year + '-')) {
                    key = label.split(year + '-').join('')
                  } else {
                    key = label
                  }
                } else {
                  key = label
                }
                if (this.thisYear && key.includes(String(year - 1))) {
                } else {
                  countResult.keys.push(key)
                  if (typeof countResult.values[objIndex] !== 'number') {
                    // countResult.values[objIndex] = 0
                    countResult.values[objIndex] = 0.1
                  }
                  countResult.values[objIndex] += value
                }
              } else {
                if (this.thisYear && key.includes(String(year - 1))) {
                } else {
                  if (typeof countResult.values[objIndex] !== 'number') {
                    // countResult.values[objIndex] = 0
                    countResult.values[objIndex] = 0.1
                  }
                  countResult.values[objIndex] += value
                }
              }
            })
          }
        })
        countResult.keys.reverse()
        countResult.values.reverse()
        item.forEach((rule, index) => {
          if (rule[scale]) {
            if (!rule[scale][currentDate]) {
              rule[scale][currentDate] = 0
            }
            const diff = rule[scale][prevDate] ? rule[scale][prevDate] : 0
            countResult.problem += rule[scale][currentDate]
            countResult.problemIncrease += rule[scale][currentDate] - diff
            if (rule.important) {
              countResult.iProblem += rule[scale][currentDate]
              countResult.iProblemIncrease += rule[scale][currentDate] - diff
            }
          }
        })
        tableData.push(countResult)
      })

      this.graphData = _.cloneDeep(tableData)
      this.$utils.sort.sort(tableData, 'problem')
      tableData.reverse()
      this.tableData = tableData.slice(0, 10)
      this.pdGraphKey++
      setTimeout(() => {
        this.loading = false
      }, 400)
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
  },
  computed: {
    timeBaseLabel() {
      let label = ''
      if (this.thisYear) {
        label += this.$t('quality.page.dataQualityDashboard.thisYear') + '：'
      }
      if (this.timeBase === 'year') {
        label += this.$t('quality.page.dataQualityDashboard.year')
      } else if (this.timeBase === 'month') {
        label += this.$t('quality.page.dataQualityDashboard.month')
      } else {
        label += this.$t('quality.page.dataQualityDashboard.week')
      }
      return label
    },
    baseLabel() {
      switch (this.base) {
        case 'busDepartment':
          return this.$t('quality.page.dataQualityDashboard.busDepartment')
        case 'itDepartment':
          return this.$t('quality.page.dataQualityDashboard.itDepartment')
        case 'categoryName':
          return this.$t('quality.page.dataQualityDashboard.categoryName')
        case 'bigClassSelectOption':
          return this.$t('quality.page.dataQualityDashboard.ruleType')
      }
    },
  },
}
