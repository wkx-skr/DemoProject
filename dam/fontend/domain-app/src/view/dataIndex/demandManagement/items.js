import HTTP from '@/http/main'

export default {
  props: [],
  data() {
    return {
      tableData: [],
      keyword: '',
      conditions: {
        state: '',
        businessDepartment: '',
        labels: [],
      },
      alwaysShowFilters: undefined,
      showMoreFilters: false,
      judgeComponentCallback: () => {
        this.judgeComponentContainerWidth()
      },
      currentPage: 1,
      pageSize: 20,
      totalItems: 0,
      selection: [],
      // 需求优先级
      priorityOptions: [
        {
          value: 0,
          label: 'p1',
        },
        {
          value: 1,
          label: 'p2',
        },
        {
          value: 3,
          label: 'p3',
        },
      ],
      // 需求状态
      stautsOptions: [
        {
          value: 'A',
          label: this.$t('indicator.demand.stateOption.A'),
        },
        {
          value: 'R',
          label: this.$t('indicator.demand.stateOption.R'),
        },
        {
          value: 'C',
          label: this.$t('indicator.demand.stateOption.C'),
        },
        {
          value: 'D',
          label: this.$t('indicator.demand.stateOption.D'),
        },
        // {
        //   value: 'E',
        //   label: '已拒绝',
        // },
      ],
      uploadUrl: '/domain/requirementmanagement/upload',
      uploading: false,
      orderIsAsc: null,
      orderBy: null,
    }
  },
  mounted() {
    this.judgeComponentContainerWidth()
    $(window).resize(this.judgeComponentCallback)
    this.getData()
    this.$bus.$on('updateRequirementItem', this.listClick)
    this.$bus.$on('updateRequirementItem2', this.getData)
  },
  beforeDestroy() {
    this.$bus.$off('updateRequirementItem')
    this.$bus.$off('updateRequirementItem2')
    $(window).unbind('resize', this.judgeComponentCallback)
  },
  methods: {
    listClick(data) {
      this.currentPage = 1
      this.getData(data)
    },
    handleBeforeUpload() {
      this.uploading = true
      this.$message.info({
        message: this.$t('quality.page.dataQualityRules.importing'),
        duration: 0,
        showClose: true,
      })
    },
    handleUploadSuccess(res) {
      this.uploading = false
      this.$message.closeAll()
      this.$message.success(this.$t('assets.upload.success'))
      let data = { id: this.categoryId }
      this.getData(data)
      // if (res === 0) {
      //   this.$message.error('导入文件错误')
      // } else if (typeof res === 'number') {
      //   this.$message.success(`成功导入了${res}条规则`)
      // } else if (Array.isArray(res)) {
      //   let msg = ''
      //   res.forEach(item => {
      //     msg += item + '<br>'
      //   })
      //   const str = msg ? `未匹配信息如下：<br>${msg}` : '导入成功'
      //   if (str === '导入成功') {
      //     this.$showSuccess(str)
      //   } else {
      //     this.$showSuccess(str, 'info')
      //   }
      // }
    },
    handleUploadFailure(e) {
      this.$showUploadFailure(e)
      this.$message.error(this.$t('assets.upload.failed'))
      this.uploading = false
      this.$message.closeAll()
    },
    changePage() {
      this.currentPage = 1
      let data = { id: this.categoryId }
      this.getData(data)
    },
    // 获取需求列表
    getData(data) {
      if (data) {
        this.categoryId = data.id
        console.log(this.categoryId, 'this.categoryId')
      } else {
        this.categoryId = null
      }
      let url = `/domain/requirementmanagement/page`
      let body = {
        categoryId: this.categoryId ? this.categoryId : null,
        currentPage: this.currentPage,
        dmndType: this.conditions.dmndType || null,
        keyword: this.keyword,
        pageSize: this.pageSize,
        requirementStatus: this.conditions.requirementStatus || null,
        orderBy: this.orderBy ? this.orderBy : null,
        orderIsAsc: this.orderIsAsc,
      }
      this.$http
        .post(url, body)
        .then(res => {
          this.tableData = res.data.content
          this.totalItems = res.data.totalItems
          console.log(this.tableData, 'this.tableData')
          // 翻译需求优先级
          this.tableData.forEach(element => {
            if (element.module == null) {
              element.module = ''
            }
            if (element.requirementPriority !== null) {
              element.requirementPriority = this.priorityOptions.filter(
                item => item.value == element.requirementPriority
              )[0].label
            }
            // if (element.requirementStauts !== null) {
            //   element.requirementStauts = this.stautsOptions.filter(
            //     item => item.value == element.requirementStauts
            //   )[0].label
            // }
          })
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    // 回车搜索
    handleKeywordChange() {},
    handleConditionsChange() {},
    judgeComponentContainerWidth() {
      const width = parseInt($(this.$el).css('width'))
      this.alwaysShowFilters = width >= 1200
    },
    handleSizeChange(val) {
      this.pageSize = val
      let data = { id: this.categoryId }
      this.getData(data)
    },
    handleCurrentChange(val) {
      this.currentPage = val
      let data = { id: this.categoryId }
      this.getData(data)
    },
    handleSelectionChange(val) {
      this.selection = val
    },
    // 查看
    handleItemClick(row) {
      this.$emit('itemClick', row)
    },
    // 编辑
    EditClick(row) {
      this.$emit('EditClick', row)
    },
    // 新增需求
    addDemand() {
      this.$emit('addDemand', this.categoryId)
    },
    // 删除
    DeleteClick(row) {
      this.$DatablauCofirm(
        this.$t('meta.report.delConfirm'),
        this.$t('meta.report.tips'),
        {
          type: 'warning',
          cancelButtonText: this.$t('common.button.cancel'),
          confirmButtonText: this.$t('common.button.ok'),
        }
      )
        .then(() => {
          let ids = []
          if (row.id) {
            ids.push(row.id)
          } else {
            ids = this.selection.map(item => {
              return item.id
            })
          }
          let url = '/domain/requirementmanagement/delete'
          this.$http
            .post(url, ids)
            .then(res => {
              let data = { id: this.categoryId }
              this.getData(data)
              this.$message.success(
                this.$t('quality.page.qualityRule.successfullyDeleted')
              )
            })
            .catch(e => {
              this.$showFailure(e)
            })
        })
        .catch(e => {
          // this.$showFailure(e)
        })
    },
    // 导出
    updateExport() {
      let url = `/domain/requirementmanagement/export`
      let obj = {
        categoryId: null,
        currentPage: this.currentPage,
        dmndType: this.conditions.dmndType || null,
        keyword: this.keyword,
        pageSize: this.pageSize,
        requirementStatus: this.conditions.requirementStatus || null,
      }
      this.$downloadFilePost(url, obj)
    },
    // 表格排序
    handleSortChange(sortData) {
      this.orderIsAsc = sortData.order === 'ascending'
      this.orderBy = sortData.prop
      let data = { id: this.categoryId }
      this.getData(data)
    },
    statusFormatter(status) {
      return this.$t('indicator.demand.stateOption.' + status)
    },
    getStatusColor(statue) {
      switch (statue) {
        case 'D':
          return '#5CB793'
        case 'A':
          return '#F79B3F'
        case 'R':
          return '#4386F5'
        case 'C':
          return '#AFB4BF'
      }
    },
  },
  computed: {
    multipleLength() {
      if (this.selection) {
        return this.selection.length
      } else {
        return 0
      }
    },
  },
  watch: {
    // keyword() {
    //   this.currentPage = 1
    //   this.$bus.$emit('clearTree')
    //   let data = { id: this.categoryId }
    //   this.getData(data);
    // },
  },
}
