// import HTTP from '@/http/main.js'
import HTTP from '@/http/main.js'
export default {
  props: [],
  components: {},
  data() {
    return {
      type: 82800027,
      tableData: [],
      keyword: '',
      conditions: {
        state: '',
        businessDepartment: '',
        labels: [],
      },
      showUdps: false,
      alwaysShowFilters: undefined,
      showMoreFilters: false,
      judgeComponentCallback: () => {
        this.judgeComponentContainerWidth()
      },
      currentPage: 1,
      pageSize: 20,
      totalItems: 0,
      selection: [],
      // 状态
      stautsOptions: [
        {
          value: 0,
          label: this.$t('indicator.dimension.stateOptions.0'),
        },
        {
          value: 1,
          label: this.$t('indicator.dimension.stateOptions.1'),
        },
        {
          value: 2,
          label: this.$t('indicator.dimension.stateOptions.2'),
        },
      ],
      uploadUrl: `${this.$metric_url}requirementmanagement/upload`,
      uploading: false,
      orderIsAsc: null,
      orderBy: null,
      categoryId: null,
    }
  },
  mounted() {
    this.judgeComponentContainerWidth()
    $(window).resize(this.judgeComponentCallback)
    this.getTreeList()
    setTimeout(() => {
      this.getData()
    }, 200)
    this.$bus.$on('updateThemeItem', this.listClick)
    this.$bus.$on('updateThemeItem1', this.getData)
  },
  beforeDestroy() {
    this.$bus.$off('updateThemeItem')
    this.$bus.$off('updateThemeItem1')
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
    // 查询维度
    getData(data) {
      // console.log(data, 'data')
      // this.tableData=[{id:1,name:'需求1'},{id:2,name:'需求2'}];
      // let url = `${this.$metric_url}requirementmanagement/getall`;
      if (data) {
        this.categoryId = data.id
        console.log(this.categoryId, 'this.categoryId')
      } else {
        this.categoryId = null
      }
      let url = `${this.$metric_url}querytheme/page`
      let body = {
        categoryId: this.categoryId ? this.categoryId : null,
        currentPage: this.currentPage,
        // dmndType: this.conditions.dmndType || null,
        keyword: this.keyword,
        pageSize: this.pageSize,
        status: this.conditions.status,
        orderBy: this.orderBy ? this.orderBy : 'creatDate',
        orderIsAsc: this.orderIsAsc ? this.orderIsAsc : false,
      }
      this.$http
        .post(url, body)
        .then(res => {
          this.tableData = res.data.content
          this.totalItems = res.data.totalItems
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    handleConditionsChange() {},
    // 展开收起过滤
    showFilterTag() {
      this.showMoreFilters = !this.showMoreFilters
    },
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
    // 新增维度
    addTheme() {
      this.$emit('addTheme', this.categoryId)
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
          let url = `${this.$metric_url}querytheme/delete`
          this.$http
            .post(url, ids)
            .then(res => {
              this.$message.success(
                this.$t('quality.page.qualityRule.successfullyDeleted')
              )
              let data = { id: this.categoryId }
              this.getData(data)
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
      let url = `${this.$metric_url}requirementmanagement/export`
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
    // 关闭扩展属性
    closeSetUp() {
      showUdps = false
    },
    // 表格排序
    handleSortChange(sortData) {
      this.orderIsAsc = sortData.order === 'ascending'
      this.orderBy = sortData.prop
      let data = { id: this.categoryId }
      this.getData(data)
      // console.log(sortData);
    },
    // 获取目录列表
    getTreeList() {
      let url = `${this.$metric_url}categories/get?type=${this.type}`
      this.$http
        .post(url)
        .then(res => {
          this.treeList = res.data
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    // 筛选目录
    sortCategory(element) {
      // console.log(id,'id')
      let category = ''
      if (Array.isArray(this.treeList)) {
        let c = this.treeList.filter(
          item => item.categoryId === element.categoryId
        )[0]
        // console.log(this.treeList,'this.treeList')
        category = c.name
        // if (c.parentId) {
        //   //console.log(c.parentId, 'c.parentId')
        //   this.sortCategory(c)
        // }
      }
      // console.log(this.category,'this.category')
      return category
    },
    statusFormatter(status) {
      return this.$t('indicator.dimension.stateOptions.' + status)
    },
    getStatusColor(statue) {
      switch (statue) {
        case 0:
          return '#5CB793'
        case 2:
          return '#F79B3F'
        case 1:
          return '#4386F5'
        case 3:
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
    //   let data={id:this.categoryId}
    //   this.getData(data);
    //   this.$bus.$emit('clearTree')
    // },
  },
}
