import Status from './Status'
import index from '../qualityRule/index'
import jobList from '../repairJob/jobList.vue'
import examineJob from '../examineJob/jobList.vue'
import HTTP from '@/http/main'

export default {
  components: {
    Status,
    index,
    jobList,
    examineJob,
  },
  props: ['ruleData', 'allCategories', 'auth'],
  data() {
    return {
      activeName: 'first',
      checkedmodelCategoryIds: [],
      ruleSearch: {
        searchWord: '',
        system: '',
        type: '',
        dataTime: '',
        bigClass: '',
      },
      typeList: [],
      systemList: [],
      bigClassList: [],
      options: [],
      optionProps: {
        value: 'id',
        label: 'name',
        children: 'subNodes',
        checkStrictly: true,
      },
      total: null,
      jobsDisplay: [],
      defaultPara: {
        currentPage: 1,
        pageSize: 20,
        taskName: null,
        modelCategoryId: null,
        status: null,
        beginTime: null,
        endTime: null,
        owner: null,
        orderCol: 'createOn',
        orderType: 'DESC',
        verifyStatus: null,
        verify: null,
        monitor: this.isMonitor,
      },
      jobListData: {},
      tabsHeight: 0,
      ruleCategoryMap: new Map(),
      ruleDataCatalog: null,
      organizationList: null,
    }
  },
  watch: {
    checkedmodelCategoryIds(newVal) {
      this.ruleData.modelCategoryIds = newVal.join(',')
    },
  },
  mounted() {
    if (this.ruleData.modelCategoryIds) {
      this.checkedmodelCategoryIds = this.ruleData.modelCategoryIds
        .split(',')
        .map(item => {
          return item - 0
        })
    }
    // if (typeof this.ruleData.catalog == 'string') {
    //   this.ruleData.catalog = JSON.parse(this.ruleData.catalog)
    // }
    this.getOrganizationList()
    // if (this.ruleData.orgBm) {
    //   setTimeout(() => {
    //     this.$set(
    //       this.ruleData,
    //       'bms',
    //       this.findPathbyId(this.organizationList, this.ruleData.orgBm)
    //     )
    //   })
    // }
    this.getBigClassListAndBusinessTypeList()
    this.systemList = this.$modelCategories
    this.getCatalogs()
    if (
      this.$auth.QUALITY_ISSUE_LIST_VIEW_MY ||
      this.$auth.QUALITY_ISSUE_LIST_VIEW_ALL
    ) {
      this.loadQualityJobs()
    }
    let div = document.getElementById('tabs')
    this.tabsHeight = div.offsetHeight - 34
  },
  filters: {
    systemFilter(id, systemList) {
      let result = ''
      systemList.forEach(e => {
        if (e.categoryId === id) {
          result = e.categoryName
        }
      })
      return result
    },
  },
  methods: {
    getStatusColor(row) {
      const statue = row.state
      if (row.processing) {
        return '#4386F5'
      } else {
        switch (statue) {
          case 'A':
            return '#5CB793'
          case 'D':
            return '#F79B3F'
          case 'C':
            return '#4386F5'
          case 'X':
            return '#AFB4BF'
        }
      }
      /* switch (statue) {
        case 'A':
          return '#5CB793'
        case 'D':
          return '#F79B3F'
        case 'C':
          return '#4386F5'
        case 'X':
          return '#AFB4BF'
      } */
    },
    statusFormatter(row) {
      const param = {
        value: row.state,
      }
      const processType = row.processType
      if (row.processing) {
        switch (processType) {
          case 'D_TO_A':
            return this.$t(
              'quality.page.qualityRule.publishStatus.copyReleaseUnderReview'
            )
          case 'A_TO_X':
            return this.$t(
              'quality.page.qualityRule.publishStatus.copyAbandonedUnderEeview'
            )
          case 'A_TO_A':
            return this.$t(
              'quality.page.qualityRule.publishStatus.copyChangeInReview'
            )
          case 'X_TO_A':
            return this.$t(
              'quality.page.qualityRule.publishStatus.rePublishing'
            )
        }
      } else {
        if (row.level === 2 && row.processState) {
          return row.processState
        }
        switch (param.value) {
          case 'X':
            return this.$t('quality.page.qualityRule.publishStatus.deprecated')
          case 'D':
            return this.$t(
              'quality.page.qualityRule.publishStatus.shortToBeAudited'
            )
          case 'C':
            return this.$t('quality.page.qualityRule.publishStatus.inReview')
          case 'A':
            return this.$t('quality.page.qualityRule.publishStatus.adopted')
        }
      }
    },
    getOrganizationList() {
      if (!this.ruleData.orgBm) {
        this.$set(this.ruleData, 'bms', '')
      }
      HTTP.getOrgDetailByBm(this.ruleData.orgBm).then(res => {
        this.$set(this.ruleData, 'bms', res.data.fullName)
      })
    },
    getCatalogs() {
      this.ruleDataCatalog = null
      const requestBody = {
        category: 'BR',
        names: ['目录'],
      }
      this.$http
        .get(`${this.$quality_url}/categories/tree/?type=QUALITY_RULE`)
        .then(res => {
          this.options = []
          this.$utils.sort.sortConsiderChineseNumber(
            res.data.subNodes,
            'name',
            'ascending',
            true
          )
          this.options = res.data.subNodes
          this.ruleDataCatalog =
            typeof this.ruleData.catalog === 'string'
              ? JSON.parse(this.ruleData.catalog)
              : this.ruleData.catalog
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    handleClick() {},
    edtiDetail() {
      this.ruleData.directEdit = true
      this.$bus.$emit('startEditBusinessRule', this.ruleData)
    },
    getBigClassListAndBusinessTypeList() {
      this.$http
        .post(`${this.$url}/select/option/get`, {
          category: 'TR',
          names: ['规则大类'],
        })
        .then(res => {
          res.data.forEach(element => {
            this.ruleCategoryMap.set(element.id, element.optionValue)
          })
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    loadQualityJobs(para) {
      if (!para) {
        para = _.clone(this.defaultPara)
        this.$refs.jobList.resetTableSta(para)
      }
      for (const key in para) {
        if (!para[key]) {
          para[key] = null
        }
      }
      if (
        this.$auth.QUALITY_TECHNICAL_REGULATION_VIEW_MY &&
        !this.$auth.QUALITY_TECHNICAL_REGULATION_VIEW_ALL
      ) {
        if (!para.owner) {
          para.owner = [this.$user.username]
        } else if (!para.owner.includes(this.$user.username)) {
          para.owner.push(this.$user.username)
        }
      }
      para.buRuleId = this.ruleData.id
      if (this.isMonitor && para.owner && para.owner.length === 0) {
        this.total = 0
        this.jobsDetail = []
        this.jobsDisplay = []
        this.$bus.$emit('repairJobLoaded', [])
      } else {
        this.$bus.$emit('setLoading', true)
        this.$http
          .post(this.$quality_url + '/quality/rule/tasks', para)
          .then(res => {
            this.$bus.$emit('setLoading', false)
            let arr = []
            this.total = arr.length
            if (res.data && Array.isArray(res.data.content)) {
              arr = res.data.content
              this.total = res.data.totalItems
            }
            this.jobsDetail = arr
            this.jobsDisplay = arr
            this.$bus.$emit('repairJobLoaded', arr)
          })
          .catch(e => {
            this.$bus.$emit('setLoading', false)
            this.$showFailure(e)
          })
      }
    },
  },
}
