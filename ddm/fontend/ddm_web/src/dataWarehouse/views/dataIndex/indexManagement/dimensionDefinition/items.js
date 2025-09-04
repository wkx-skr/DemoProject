import setUdp from './setUdp.vue'
import LDMTypes from '@constant/DAMLDMTypes'
export default {
  props: [],
  components: {
    setUdp
  },
  data () {
    return {
      LDMTypes: LDMTypes,
      tableData: [],
      keyword: '',
      conditions: {
        state: '',
        businessDepartment: '',
        labels: []
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
          label: this.$t('indicator.dimension.stateOptions.0')
        },
        {
          value: 1,
          label: this.$t('indicator.dimension.stateOptions.1')
        },
        {
          value: 2,
          label: this.$t('indicator.dimension.stateOptions.2')
        }
      ],
      uploadUrl: `domain/requirementmanagement/upload`,
      uploading: false,
      orderIsAsc: null,
      orderBy: null,
      categoryId: null
    }
  },
  mounted () {
    this.judgeComponentContainerWidth()
    $(window).resize(this.judgeComponentCallback)
    this.getTreeList(() => {
      this.getData()
    })
    // 目录更新
    this.$bus.$on('updateDimensionItem', this.listClick)
    this.$bus.$on('updateDimensionItem1', this.getData)
  },
  beforeDestroy () {
    this.$bus.$off('updateDimensionItem')
    this.$bus.$off('updateDimensionItem1')
    $(window).unbind('resize', this.judgeComponentCallback)
  },
  methods: {
    listClick (data) {
      this.currentPage = 1
      this.getData(data)
    },
    handleBeforeUpload () {
      this.uploading = true
      this.$message.info({
        message: this.$t('quality.page.dataQualityRules.importing'),
        duration: 0,
        showClose: true
      })
    },
    handleUploadSuccess (res) {
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
    handleUploadFailure (e) {
      this.$showUploadFailure(e)
      this.$message.error(this.$t('assets.upload.failed'))
      this.uploading = false
      this.$message.closeAll()
    },
    changePage () {
      this.currentPage = 1
      let data = { id: this.categoryId }
      this.getData(data)
    },
    prepareSearchCondition () {
      return {
        categoryId: this.categoryId ? this.categoryId : null,
        currentPage: this.currentPage,
        keyword: this.keyword,
        pageSize: this.pageSize,
        status: this.conditions.status,
        orderBy: this.orderBy ? this.orderBy : null,
        orderIsAsc: this.orderIsAsc
      }
    },
    // 查询维度
    getData (data) {
      if (data) {
        this.categoryId = data.id
      } else {
        this.categoryId = null
      }
      let url = `${this.$domains}dimension/page`
      let body = this.prepareSearchCondition()
      // this.$emit('update-tree')
      this.$http
        .post(url, body)
        .then(res => {
          this.tableData = res.data.content
          this.totalItems = res.data.totalItems
          //
          this.tableData.forEach(element => {
            // 维度层级
            if (element.hierarchy !== null) {
              element.hierarchy.sort(function (a, b) {
                return a.order - b.order
              })
              let hierarchyWay = ''
              element.hierarchy.forEach(item => {
                hierarchyWay += '-' + item.chName
              })
              hierarchyWay = hierarchyWay.slice(1)
              element.hierarchyWay = hierarchyWay
            }
            // 翻译状态
            // if (element.stauts !== null && element.stauts !== undefined) {
            //   element.stauts = this.stautsOptions.filter(
            //     item => item.value == element.stauts
            //   )[0].label
            // }
            // 所属分类
            element.category = this.sortCategory(element)
            // console.log(element,'111111')
            // console.log(this.sortCategory(element))
          })
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    handleConditionsChange () { },
    // 展开收起过滤
    showFilterTag () {
      this.showMoreFilters = !this.showMoreFilters
    },
    judgeComponentContainerWidth () {
      const width = parseInt($(this.$el).css('width'))
      this.alwaysShowFilters = width >= 1200
    },
    handleSizeChange (val) {
      this.pageSize = val
      let data = { id: this.categoryId }
      this.getData(data)
    },
    handleCurrentChange (val) {
      this.currentPage = val
      let data = { id: this.categoryId }
      this.getData(data)
    },
    handleSelectionChange (val) {
      this.selection = val
    },
    // 查看
    handleItemClick (row) {
      this.$emit('itemClick', row)
    },
    // 编辑
    EditClick (row) {
      this.$emit('EditClick', row)
    },
    // 新增维度
    addDimension () {
      this.$emit('addDimension', this.categoryId)
    },
    // 删除
    DeleteClick (row) {
      this.$DatablauCofirm(
        this.$t('meta.report.delConfirm'),
        this.$t('meta.report.tips'),
        {
          type: 'warning',
          cancelButtonText: this.$t('common.button.cancel'),
          confirmButtonText: this.$t('common.button.ok')
        }
      )
        .then(() => {
          let ids = []
          if (row.dimensionId) {
            ids.push(row.dimensionId)
          } else {
            ids = this.selection.map(item => {
              return item.dimensionId
            })
          }
          let url = `${this.$domains}dimension/delete`
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
    updateExport () {
      let url = `${this.$domains}requirementmanagement/export`
      let obj = {
        categoryId: null,
        currentPage: this.currentPage,
        dmndType: this.conditions.dmndType || null,
        keyword: this.keyword,
        pageSize: this.pageSize,
        requirementStatus: this.conditions.requirementStatus || null
      }
      this.$downloadFilePost(url, obj)
    },
    // 关闭扩展属性
    closeSetUp () {
      this.showUdps = false
    },
    // 表格排序
    handleSortChange (sortData) {
      this.orderIsAsc = sortData.order === 'ascending'
      this.orderBy = sortData.prop
      let data = { id: this.categoryId }
      this.getData(data)
      // console.log(sortData);
    },
    // 获取目录列表
    getTreeList (callback) {
      let url = `${this.$domains}categories/get?type=82800023`
      this.$http
        .post(url)
        .then(res => {
          this.treeList = res.data
          if (callback) {
            callback()
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    // 筛选目录
    sortCategory (element) {
      // console.log(id,'id')
      let category = ''
      if (Array.isArray(this.treeList)) {
        let c = this.treeList.filter(item => item.categoryId === element.categoryId)[0]
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
    statusFormatter (status) {
      return this.$t('indicator.dimension.stateOptions.' + status)
    },
    getStatusColor (statue) {
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
    handleCommand (command) {
      this[command]()
    },
    importIndex () {
      this.$refs.uploadBtn.$el.click()
    },
    onUploadSuccess () {
      this.$message.success(this.$t('assets.upload.success'))
      this.getTreeList(() => {
        this.getData()
      })
    },
    onUploadError (err) {
      this.$showUploadFailure(err)
    },
    exportIndex () {
      const url = `${this.$domains}dimension/export`
      this.$downloadFilePost(url, this.prepareSearchCondition())
    },
    downloadTemplate () {
      const url = `${this.$domains}dimension/downloadTemplate`
      this.$downloadFilePost(url)
    },
    showUdpDialog () {
      this.showUdps = true
    }
  },
  computed: {
    multipleLength () {
      if (this.selection) {
        return this.selection.length
      } else {
        return 0
      }
    }
  },
  watch: {
    // keyword() {
    //   this.currentPage = 1
    //   let data={id:this.categoryId}
    //   this.getData(data);
    //   this.$bus.$emit('clearTree')
    // },
  }
}
