import _ from 'lodash'

export default {
  data() {
    return {
      allRuleIds: [],
      ruleIds: [],
      total: 0,
      multipleCriteria: {
        '@type': '.MultipleCriteria',
        criteria: [
          {
            '@type': '.FieldInCriteria',
            fieldName: 'id',
            values: this.ruleIds,
            inCollection: true,
          },
        ],
        page: {
          currentPage: 1, // 分页查询
          pageSize: 10,
          sortBy: [],
        },
      },
      jobInstanceOrder: {},
    }
  },
  computed: {
    tableHeight() {
      if (this.hasPagination) {
        return 445
      } else {
        return 445
      }
    },
    hasPagination() {
      return this.total > this.multipleCriteria.page.pageSize
    },
  },
  methods: {
    getJobResult(result, order) {
      let obj = {
        fullRuleName: this.searchFormData.ruleName,
        jobInstanceId: result,
        currentPage: this.multipleCriteria.page.currentPage,
        pageSize: this.multipleCriteria.page.pageSize,
        ruleResultStatus: this.searchFormData.runResult,
        countResultStatus: this.searchFormData.countResult,
      }
      if (this.jobInstanceOrder) {
        obj.orderName = this.jobInstanceOrder.orderName
        obj.orderAsc = this.jobInstanceOrder.orderAsc
      }
      if (this.job.jobType === '标准核检任务') {
        if (this.searchFormData.runResult === '全部') {
          obj.ruleResultStatus = '全部'
        } else if (this.searchFormData.runResult === '发现问题') {
          obj.ruleResultStatus = 'problem'
        } else if (this.searchFormData.runResult === '未发现问题') {
          obj.ruleResultStatus = 'good'
        } else if (this.searchFormData.runResult === '运行失败') {
          obj.ruleResultStatus = 'fail'
        }
      }
      this.$http
        .post(this.$quality_url + '/quality/dataRule/getJobResult', obj)
        .then(res => {
          this.total = res.data.totalItems
          this.displayRules = res.data.content
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    changeSort(val) {
      if (this.job.jobType === '标准核检任务') {
        this.jobInstanceOrder = {
          orderName: 'fullRuleName',
        }
        if (val.order === 'ascending') {
          this.jobInstanceOrder.orderAsc = true
        } else if (val.order === 'descending') {
          this.jobInstanceOrder.orderAsc = false
        } else {
          this.jobInstanceOrder.orderAsc = null
        }
        this.getJobResult(this.jobInstanceId)
      } else {
        let existingIndex = this.multipleCriteria.page.sortBy.findIndex(
          item => item.field === val.prop
        )
        if (val.order === null) {
          // 如果 val.order 为 null，则删除当前对象
          if (existingIndex !== -1) {
            this.multipleCriteria.page.sortBy.splice(existingIndex, 1)
            this.multipleCriteria.page.sortBy = []
          }
        } else if (existingIndex !== -1) {
          // 切换order（如果当前是ASC，则改为DESC，反之亦然）
          this.multipleCriteria.page.sortBy[existingIndex].order =
            val.order === 'ascending' ? 'ASC' : 'DESC'
        } else {
          // 如果没有找到，且 val.order 不为 null，则添加新对象
          if (val.order !== null) {
            this.multipleCriteria.page.sortBy.push({
              field: val.prop,
              order: val.order === 'ascending' ? 'ASC' : 'DESC',
            })
          }
        }
        this.getMultiPage()
      }
    },
    updateMultipleCriteriaByCondition() {
      this.multipleCriteria.criteria.length = 1
      if (this.searchFormData.ruleName) {
        this.multipleCriteria.criteria.push({
          '@type': '.FieldLikeCriteria',
          fieldName: 'name',
          matchWord: `%${_.trim(this.searchFormData.ruleName)}%`,
          isIgnoreCase: true,
        })
      }
      let tmpIds = []
      this.allRuleIds.forEach(id => {
        if (
          this.mapFormatter(this.problemMap[id]) ===
          this.searchFormData.runResult
        ) {
          tmpIds.push(id)
        } else if (this.searchFormData.runResult === '全部') {
          tmpIds = this.allRuleIds
        }
      })
      let tmpIds2 = []
      tmpIds.forEach(id => {
        if (this.searchFormData.countResult === 'hasException') {
          ;(this.totalCntMap[id] === '-' || this.problemCntMap[id] === '-') &&
            tmpIds2.push(id)
        } else if (this.searchFormData.countResult === 'noException') {
          this.totalCntMap[id] !== '-' &&
            this.problemCntMap[id] !== '-' &&
            tmpIds2.push(id)
        } else if (this.searchFormData.countResult === '全部') {
          tmpIds2 = tmpIds
        }
      })
      this.ruleIds = tmpIds2
      this.multipleCriteria.criteria[0].values = this.ruleIds
      this.getMultiPage()
    },
    getMultiPage() {
      if (this.ruleIds.length === 0) {
        this.displayRules = []
        this.total = 0
        return
      }
      this.multipleCriteria.criteria[0].values = this.ruleIds
      this.$http
        .post(
          this.$quality_url + '/quality/rule/tech/multiPage',
          this.multipleCriteria
        )
        .then(res => {
          if (
            res.data.content.length === 0 &&
            this.multipleCriteria.page.currentPage > 1
          ) {
            this.multipleCriteria.page.currentPage--
            this.getMultiPage()
          } else {
            this.total = res.data.totalItems
            res.data.content.forEach(item => {
              item.problemCount = this.problemCntMap[item.id]
              item.totalCount = this.totalCntMap[item.id]
              item.problemSample = this.problemMap[item.id]
            })
            this.displayRules = res.data.content
            this.displayRules.forEach(element => {
              if (
                this.mapFormatter(this.problemMap[element.id]) ===
                this.$t('quality.page.qualityExamineJob.results.fail')
              ) {
                element.sortValue = 1
              } else if (
                this.mapFormatter(this.problemMap[element.id]) ===
                this.$t('quality.page.qualityExamineJob.results.problem')
              ) {
                element.sortValue = 2
              } else if (
                this.mapFormatter(this.problemMap[element.id]) ===
                this.$t('quality.page.qualityExamineJob.results.good')
              ) {
                element.sortValue = 3
              }
              this.mapFormatter(this.problemMap[element.id])
            })
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    handleCurrentPageChange(newVal) {
      this.multipleCriteria.page.currentPage = newVal
      if (this.job.jobType === '标准核检任务') {
        this.getJobResult(this.jobInstanceId)
      } else {
        this.getMultiPage()
      }
    },
    handlePageSizeChange(newVal) {
      this.multipleCriteria.page.currentPage = 1
      this.multipleCriteria.page.pageSize = newVal
      if (this.job.jobType === '标准核检任务') {
        this.getJobResult(this.jobInstanceId)
      } else {
        this.getMultiPage()
      }
    },
  },
}
