export default {
  props: [
    'categoryMap',
    'callTypeMap',
    'interfaceUrl',
    'defaultInterface',
    'hasAccess',
    'reloadModelCategories',
    'postUrl',
  ],
  data() {
    return {
      /* table */
      tableData: null,
      isLoading: false,
      selection: [],
      deleteDisabled: true,
      /** filter */
      keyword: '',
      // fileTypeFilter: [],
      // creatorFilter: '',
      /** 筛选参数 */
      srcModelCategoryIds: [],
      dstModelCategoryIds: [],
      filers: [],
      importers: [],
      sortField: null,
      desc: false,

      srcCateArr: [], // 筛选数组
      dstCateArr: [], // 筛选数组
      filersArr: [], // 筛选数组
      importersArr: [], // 筛选数组
      testMap: {}, // 防止筛选数组重复

      /** pagination */
      pageSize: 20,
      currentPage: 1, // 显示的页面编号, 从1开始
      total: 0,

      timer: 'first', // 防止频繁从后台读取数据
      modelMap: {},
      selectionLen: 0,
      option: {
        autoHideSelectable: true,
        columnResizable: true,
      },
    }
  },
  mounted() {
    this.tableDatInit()
  },
  methods: {
    // 查询调用系统
    getAllCallerSystem() {
      this.$http.delete(this.interfaceUrl + '/all/callerModelIds').then(res => {
        let temparr = []
        res.data.forEach(item => {
          let obj = {
            text: this.categoryMap[item]
              ? this.categoryMap[item].categoryName
              : '',
            value: item,
          }
          temparr.push(obj)
        })
        this.srcCateArr = temparr
      })
    },
    // 查询被调用系统
    getAllCalleeSystem() {
      this.$http.delete(this.interfaceUrl + '/all/calleeModelIds').then(res => {
        let temparr = []
        res.data.forEach(item => {
          let obj = {
            text: this.categoryMap[item]
              ? this.categoryMap[item].categoryName
              : '',
            value: item,
          }
          temparr.push(obj)
        })
        this.dstCateArr = temparr
      })
    },
    /** 响应事件 */
    tableDatInit() {
      const para = {}
      para.currentPage = 0
      para.pageSize = this.pageSize
      this.getTableData(para)
      this.getAllCallerSystem()
      this.getAllCalleeSystem()
    },
    // 分页设置
    // setCurrent(row) {
    //   this.$refs.dsTable.setCurrentRow(row);
    // },
    handleCurrentChange(currentPage) {
      // this.currentPage = currentPage;
      const para = {}
      para.currentPage = currentPage - 1
      this.getTableData(para)
      this.$emit('currentPage', para.currentPage)
    },
    handleSizeChange(size) {
      const para = {}
      para.pageSize = size
      this.pageSize = size
      this.getTableData(para)
    },
    // table 操作
    handleSelectionChange(val) {
      this.selection = val
      this.selectionLen = val.length
      this.deleteDisabled = this.selection.length == 0
    },
    filterHandler(obj) {
      const para = {}
      for (const key in obj) {
        switch (key) {
          case 'srcModelCategoryIds':
            this.srcModelCategoryIds = obj[key]
            break
          case 'dstModelCategoryIds':
            this.dstModelCategoryIds = obj[key]
            break
          case 'filers':
            this.filers = obj[key]
            break
          case 'importers':
            this.importers = obj[key]
            break
        }
      }
      this.getTableData(para)
    },
    handleSortChange(sortData) {
      const para = {}
      if (sortData && sortData.prop) {
        this.sortField = sortData.prop
        this.desc = sortData.order === 'descending'
      }
      this.getTableData(para)
    },
    // delete choose interface
    deleteRow() {
      const self = this
      self
        .$DatablauCofirm(this.$t('meta.interface.deConfirm'))
        .then(() => {
          this.isLoading = true
          const handleSuccess = () => {
            this.timer = 'first'
            this.getTableData()
            this.getAllCallerSystem()
            this.getAllCalleeSystem()
            self.$message.success({
              message: this.$t('meta.DS.message.delSucceed'),
            })
          }
          const deletNext = () => {
            if (this.selection.length > 0) {
              this.deleteCurrentRow(this.selection[0], deletNext)
            } else {
              handleSuccess()
            }
          }
          deletNext()
        })
        .catch(e => {
          console.log(e)
        })
    },
    showLoading() {
      this.isLoading = true
    },
    hideLoading() {
      this.isLoading = false
    },
    editInterface(interfaceData) {
      this.$emit('uploadFile', interfaceData)
    },

    /** 处理显示的数据 */
    // delete interface action
    deleteCurrentRow(interfaceData, callback) {
      this.$http
        .delete(this.interfaceUrl + '/' + interfaceData.id)
        .then(res => {
          this.selection.shift()
          callback && callback()
        })
        .catch(e => {
          this.$showFailure(e)
          this.getTableData()
        })
    },
    // 响应获取table数据的操作
    getTableData(para, callback) {
      if (this.timer === 'first') {
        this.getTableDataInner(para, callback)
        this.timer = null
        return
      }
      if (this.timer) {
        clearTimeout(this.timer)
      }
      this.timer = setTimeout(() => {
        this.getTableDataInner(para, callback)
        this.timer = null
      }, 500)
    },
    getTableDataInner(para, callback) {
      const empty = {
        currentPage: '',
        pageSize: '',
        keyword: '',

        sortField: '',
        desc: '',
        srcModelCategoryIds: '',
        dstModelCategoryIds: '',
        filers: '',
        importers: '',
      }
      para = para || {}
      para.currentPage = para.currentPage || 0
      para.keyword = this.keyword || para.keyword || ''
      para.pageSize = para.pageSize || this.pageSize

      para.srcModelCategoryIds =
        para.srcModelCategoryIds || this.srcModelCategoryIds
      para.dstModelCategoryIds =
        para.dstModelCategoryIds || this.dstModelCategoryIds
      para.filers = para.filers || this.filers
      para.importers = para.importers || this.importers

      para.sortField = this.sortField || 'callerModelCategoryId'
      para.desc = !this.desc

      this.$http
        .post(this.interfaceUrl + '/search', para)
        .then(res => {
          this.isLoading = false
          this.total = res.data.totalElements
          if (res.data.content && Array.isArray(res.data.content)) {
            const arr = []
            res.data.content.forEach(item => {
              if (
                !this.categoryMap[item.callerModelCategoryId] &&
                !this.reloadModelCategories
              ) {
                this.$emit('reloadModelCategories')
              }
              if (
                this.categoryMap[item.callerModelCategoryId] &&
                this.categoryMap[item.calleeModelCategoryId]
              ) {
                arr.push(item)
              }
              /* if (!this.testMap[item.callerModelCategoryId + '/testSrc']) {
                const obj = {
                  text: this.categoryMap[item.callerModelCategoryId]
                    ? this.categoryMap[item.callerModelCategoryId].categoryName
                    : '',
                  value: item.callerModelCategoryId,
                }
                this.testMap[item.callerModelCategoryId + '/testSrc'] = true
                if (obj.text && obj.value) {
                  this.srcCateArr.push(obj)
                }
              } */
              /* if (!this.testMap[item.calleeModelCategoryId + '/testDst']) {
                const obj = {
                  text: this.categoryMap[item.calleeModelCategoryId]
                    ? this.categoryMap[item.calleeModelCategoryId].categoryName
                    : '',
                  value: item.calleeModelCategoryId,
                }
                this.testMap[item.calleeModelCategoryId + '/testDst'] = true
                this.dstCateArr.push(obj)
              } */
              if (!this.testMap[item.filer + '/testFiler']) {
                this.testMap[item.filer + '/testFiler'] = true
                this.filersArr.push({ text: item.filer, value: item.filer })
              }
              if (!this.testMap[item.importer + '/testImporter']) {
                this.testMap[item.importer + '/testImporter'] = true
                this.importersArr.push({
                  text: item.importer,
                  value: item.importer,
                })
              }
            })
            this.tableData = arr || []
          }
          callback && callback()
        })
        .catch(e => {
          this.isLoading = false
          this.$showFailure(e)
        })
    },
    formatterCategory(row, column, cellValue, index) {
      return this.categoryMap[cellValue]
        ? this.categoryMap[cellValue].categoryName
        : this.$t('meta.interface.delTips', { cellValue: cellValue })
    },
    callTypeFormat(row, column, cellValue, index) {
      return this.callTypeMap[cellValue]
        ? this.callTypeMap[cellValue].label
        : cellValue
    },
    downloadMouldFile(para) {
      this.$emit('downloadMouldFile', para)
    },
    downloadInterfaceFile(para) {
      this.$emit('downloadInterfaceFile', para)
    },
    showtab(para) {
      this.$emit('showtab', para)
    },
    handleBeforeUpload(para) {
      this.$emit('handleBeforeUpload', para)
    },
    onUploadError(para) {
      this.$emit('onUploadError', para)
    },
    onUploadSuccess(para) {
      this.$emit('onUploadSuccess', para)
    },
    /******************************************/
    // isCreater(row, index) {
    //   return row.creator === this.$user.username;
    // },
  },
  watch: {
    keyword(newVal) {
      const para = {}
      para.keyword = newVal
      this.$nextTick(() => {
        this.getTableData(para)
      })
    },
  },
  computed: {},
}
