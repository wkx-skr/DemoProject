import _ from 'lodash'

export default {
  data() {
    return {
      ruleIds: [],
      total: 0,
      removeIsPending: false,
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
          sortBy: [
            {
              field: 'id',
              order: 'ASC',
            },
          ],
        },
      },
    }
  },
  created() {
    this.$bus.$emit('getRuleType')
  },
  mounted() {},
  computed: {
    tableHeight() {
      if (this.hasPagination) {
        return 445
      } else {
        return null
      }
    },
    hasPagination() {
      return this.total > this.multipleCriteria.page.pageSize
    },
  },
  methods: {
    updateMultipleCriteriaByCondition() {
      this.multipleCriteria.criteria.length = 1
      if (this.searchFormData.ruleName) {
        this.multipleCriteria.criteria.push({
          '@type': '.FieldLikeCriteria', // 规则名称
          fieldName: 'name',
          matchWord: `%${_.trim(this.searchFormData.ruleName)}%`,
          isIgnoreCase: true,
        })
      }
      ;[
        'bigClassSelectOption',
        'smallClassSelectOption',
        'bizTypeSelectOption',
      ].forEach(fieldName => {
        if (this.searchFormData[fieldName]) {
          this.multipleCriteria.criteria.push({
            '@type': '.FieldEqualsCriteria',
            fieldName: fieldName,
            compareValue: this.searchFormData[fieldName],
            notEqual: false,
          })
        }
      })
      this.getMultiPage()
    },
    getMultiPage() {
      if (this.ruleIds.length === 0) {
        this.rulesDisplay = []
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
            this.rulesDisplay = res.data.content || []
            this.total = res.data.totalItems
            this.$http
              .post(
                this.$quality_url + `/quality/rule/tech/multiCheck`,
                res.data.content.map(i => i.id)
              )
              .then(res => {
                const hasAuthList = res.data
                this.rulesDisplay.forEach(i => {
                  if (hasAuthList.includes(i.id)) {
                    this.$set(i, 'auth', 17)
                  }
                })
              })
            this.rulesDisplay.forEach(item => {
              this.$bigClassList.forEach(b => {
                if (item.bigClassSelectOption === b.value) {
                  item.levelOneName = b.label
                }
              })
              this.$smallClassListAll.forEach(s => {
                if (item.smallClassSelectOption === s.value) {
                  item.levelTwoName = s.label
                }
              })
            })
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    handleCurrentPageChange() {
      this.getMultiPage()
    },
    handlePageSizeChange() {
      this.multipleCriteria.page.currentPage = 1
      this.getMultiPage()
    },
  },
}
