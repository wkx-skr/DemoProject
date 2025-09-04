export default {
  props: [],
  data() {
    return {
      /** table */
      tableHeight: undefined,
      isLoading: false,
      tableDataShow: [],
      total: 0,

      /** pagination */
      // keyword: '',
      filterData: {},
      sortData: {},
      pageSize: 20,
      currentPage: 1,

      selection: [],
      mutipleLength: 0,
      deleteDisabled: true,

      defaultPara: {
        // keyword: '',
        // filterData: {},
        currentPage: 1,
        pageSize: 20,
        orderBy: '', // alias
        sort: '', // asc
        // sortData: {
        //   prop: 'alias',
        //   order: 'asc',
        // },
      },
      allModels: [],
      // recommendation domain for each data to be selected
      recDomaMap: {},
      choosedCategoryId: '',
      modelsArr: [],
      currentModel: '',
      modelCategoryMap: {},
      modelMap: {},
      hashHeader: '',
      currentDomain: {
        longText: false,
        id: '',
        path: '',
        // domainCode: '',
        domainChName: '',
        domainEnName: '',
        description: '',
        dataType: '',
        domainCode: '',
      },
      showDomainId: null,
      currentRef: '',
      domDetailPopOption: {
        boundariesElement: this.$refs.tableLine,
        gpuAcceleration: false,
      },
      domainCacheObj: {},
      showTooltipRow: '',
      showTooltipDom: '',
    }
  },
  mounted() {
    this.isLoading = true
    this.getModelTree()
    this.hashHeader = location.hash.split('/')[2].split('?')[0]
    this.$nextTick(() => {
      this.resizeTable()
      $(window).resize(this.resizeTable)
    })
    this.$set(
      this.domDetailPopOption,
      'boundariesElement',
      this.$refs.tableLine
    )
  },
  beforeDestroy() {
    $(window).unbind('resize', this.resizeTable)
  },
  methods: {
    tableDatInit() {
      // console.log('init')
      const obj = this.$route.query
      this.choosedCategoryId = obj.modelCategoryId || ''
      this.currentModel = obj.modelId || ''
      this.getTableData()
    },
    // pagination
    handleCurrentChange(currentPage) {
      this.currentPage = currentPage
      this.getTableData()
    },
    handleSizeChange(size) {
      this.pageSize = size
      this.currentPage = 1
      this.getTableData()
    },
    // table operation
    handleSelectionChange(val) {
      this.selection = val
      this.mutipleLength = val.length
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
    handleCategoryChange(categoryIds) {
      this.getModels(categoryIds)
      // this.clearKeyword()
      this.currentModel = ''
      this.clearSort()
      this.currentPage = 1
      this.getTableData()
    },
    handleModelChange(modelId) {
      // this.clearKeyword()
      this.clearSort()
      this.currentPage = 1
      this.getTableData()
    },
    handleSortChange(sortData) {
      this.sortData = sortData
      this.currentPage = 1
      this.getTableData()
    },
    showLoading() {
      this.isLoading = true
      this.tableDataShow = []
    },
    hideLoading() {
      this.isLoading = false
    },

    // table data
    getTableData(para, callback) {
      /**
       * para = {
       *  keyword: '',
       *  filterData: {},
       *  sortData: {},
       *  pageSize: number,
       *  currentPage: number,
       * }
       */
      if (!para) {
        para = this.getCurrentPara()
      }
      this.showLoading()
      this.getData(para, callback)
      // this.gettableDataShow(para, callback)
    },

    handleSkip2Domain(domain) {
      this.$skip2Domain(domain.id)
    },

    resizeTable() {
      this.$nextTick(() => {
        this.tableHeight = $('.rejectTab .table-row')[0].offsetHeight
      })
    },
    /** *************************************** */
    // 由于是重新推荐tab页面，此方法不需要（不推荐标准内部的按钮点击事件）
    // handleChooseDom(scope, item) {
    //   this.recDomaMap[scope.row.objectId] = item.id
    // },
    // gettableDataShow(para, callback) {
    //   this.showLoading()
    //   this.getData(para, callback)
    // },
    refresh() {
      this.showLoading()
      this.getTableData()
    },
    modelCategorieFormat(row, column, cellValue, index) {
      return this.$modelCategoriesMap[cellValue]
    },
    handlerejDom(scope) {
      let objectIds = []
      objectIds.push(scope.row.id)
      this.$DatablauCofirm(
        this.$t('domain.dataFind.recoveryConfirm'),
        this.$t('domain.dataFind.whetherToRecover'),
        {
          type: 'warning',
        }
      )
        .then(() => {
          this.$http.delete('/metadata/entities/domains/candidates/refuse', {data: objectIds})
            .then(res => {
              this.$message.success({
                message: this.$t('domain.common.modifySuccessfully'),
              })
              if (
                objectIds.length ===
                this.total - this.pageSize * (this.currentPage - 1)
              ) {
                if (this.currentPage > 1) {
                  this.currentPage--
                }
              }
              this.getThisPage()
            })
            .catch(e => {
              this.failureCallback(e)
            })
        })
        .catch(() => {})
    },
    confirmPost() {
      this.showLoading()
      const arr = this.selection
      const showSucces = () => {
        this.$message.success({
          message: this.$t('domain.common.modifySuccessfully'),
        })
        this.getTableData()
      }
      const binddom = item => {
        const json = {
          domainId: this.recDomaMap[item.objectId],
          objectId: item.objectId,
        }
        this.$http
          .post(this.$url + '/service/domains/entities', json)
          .then(res => {
            arr.shift()
            if (arr.length > 0) {
              binddom(arr[0])
            } else {
              showSucces()
            }
          })
          .catch(e => {
            this.failureCallback(e)
          })
      }
      binddom(arr[0])
    },
    rejBat() {
      // this.showLoading()
      const arr = this.selection.map(item => item.id)
      this.$DatablauCofirm(
        this.$t('domain.dataFind.recoveryConfirm'),
        this.$t('domain.dataFind.whetherToRecover'),
        {
          type: 'warning',
        }
      )
        .then(() => {
          this.$http
            .delete('/metadata/entities/domains/candidates/refuse', {data: arr})
            .then(res => {
              this.$message.success({
                message: this.$t('domain.common.modifySuccessfully'),
              })
              if (
                arr.length ===
                this.total - this.pageSize * (this.currentPage - 1)
              ) {
                if (this.currentPage > 1) {
                  this.currentPage--
                }
              }
              this.getTableData()
            })
            .catch(e => {
              this.failureCallback(e)
            })
        })
        .catch(() => {})
    },
    getPath(row) {
      let result = ''
      if (row.schema) {
        result +=
          this.$modelCategoriesMap[row.modelCategoryId] +
          '/' +
          this.modelMap[row.modelId + ''] +
          '/' +
          row.schema +
          '/' +
          row.tableName +
          '/' +
          row.name
      } else {
        result +=
          this.$modelCategoriesMap[row.modelCategoryId] +
          '/' +
          this.modelMap[row.modelId + ''] +
          '/' +
          row.tableName +
          '/' +
          row.name
      }
      return result
    },
    getThisPage() {
      // const para = {
      //   keyword: this.keyword,
      //   filterData: this.filterData,
      //   sortData: this.sortData,
      //   pageSize: this.pageSize,
      //   currentPage: this.currentPage,
      // }
      this.getTableData()
    },
    // clearKeyword() {
    //   this.clearKw = true
    //   this.keyword = ''
    // },
    // resetKeyword() {
    //   this.clearKw = true
    //   this.keyword = ''
    // },
    clearSort() {
      this.$refs.recDomTable.clearSort()
    },
    getModels(categoryId) {
      if (!categoryId && categoryId !== 0) {
        this.modelsArr = []
        this.currentModel = ''
      }
      const callback = data => {
        const modelsArr = []
        if (data && Array.isArray(data)) {
          if (categoryId || categoryId === 0) {
            data.forEach(item => {
              if (item.categoryId === categoryId) {
                modelsArr.push(item)
              }
            })
            this.modelsArr = modelsArr
          } else {
            this.modelsArr = []
            // this.modelsArr = res.data;
          }
        }
      }
      if (this.allModels && this.allModels.length > 0) {
        callback(this.allModels)
      } else {
        this.$http
          .get(this.$meta_url + '/service/models/fromre/')
          .then(res => {
            this.allModels = res.data
            callback(this.allModels)
          })
          .catch(e => this.failureCallback(e))
      }

    },
    getCloumnDetail(objectId) {
      this.$http
        .get(this.$url + '/service/entities/' + objectId + '/summary')
        .then(res => {})
        .catch(e => this.failureCallback(e))
    },
    getDomainDetail(domainId, columnId, e) {
      this.showTooltipDom = domainId
      this.showTooltipRow = columnId
      const dealwithDomain = domain => {
        this.domainCacheObj[domainId] = domain
        this.$set(this.currentDomain, 'id', domainId)
        this.$set(this.currentDomain, 'path', domain.path.join('/'))
        this.$set(this.currentDomain, 'domainCode', domain.domainCode)
        this.$set(this.currentDomain, 'domainChName', domain.chineseName)
        this.$set(this.currentDomain, 'domainEnName', domain.englishName)
        this.$set(this.currentDomain, 'description', domain.description)
        this.$set(this.currentDomain, 'dataType', domain.dataType)
        this.$set(this.currentDomain, 'domainCode', domain.domainCode)
        if (domain.description && domain.description.length > 300) {
          this.$set(this.currentDomain, 'longText', true)
        }
      }
      if (!domainId) {
        return
      }
      let domain = {}
      this.showDomainId = domainId
      this.currentRef = '' + domainId + columnId
      if (this.domainCacheObj[domainId]) {
        domain = this.domainCacheObj[domainId]
        dealwithDomain(domain)
      } else {
        this.$http
          .get(this.$meta_url + '/domains/details/' + domainId)
          .then(res => {
            if (!res.data) {
              return
            }
            domain = res.data
            dealwithDomain(domain)
          })
          .catch(e => {
            if (
              e.response &&
              e.response.data &&
              e.response.data.errorType === 'java.lang.NullPointerException'
            ) {
              let msg = ''
              msg = this.$t('domain.dataFind.domainNotFind')
              this.failureCallback(msg)
            } else {
              this.failureCallback(e)
            }
          })
      }
    },
    clearDomainDetail() {
      this.showDomainId = null
      this.currentRef = ''
    },
    getModelTree() {
      this.$http
        .get(this.$meta_url + '/models/modeltree')
        .then(res => {
          this.modelCategoryMap = {}
          this.modelMap = {}
          const getChildrenMap = obj => {
            if (obj.type === 'MODEL_CATEGORY') {
              this.modelCategoryMap[obj.id + ''] = obj.name
            } else if (obj.type === 'MODEL' || obj.type === 'MODEL_SCHEMA') {
              this.modelMap[obj.id + ''] = obj.name
            }
            const sub = obj.subNodes
            if (sub && Array.isArray(sub)) {
              sub.forEach(item => {
                getChildrenMap(item)
              })
            }
          }
          getChildrenMap(res.data)
          this.tableDatInit()
        })
        .catch(e => this.failureCallback(e))
    },
    getPaths(ids) {
      if (ids && Array.isArray(ids) && ids.length !== 0) {
        this.$http
          .get(
            this.$url + '/service/entities/objects/path?ids=' + ids.join(',')
          )
          .then(res => {
            // console.log(res, 'res');
          })
          .catch(e => this.failureCallback(e))
      }
    },
    getData(para = {}, callback) {
      let urlBase = `/metadata/entities/domains/candidates/refuse?`
      Object.keys(para).forEach(key => {
        if (para[key] || para[key] === 0) {
          urlBase += `${key}=${para[key]}&`
        }
      })
      this.$http
        .get(urlBase)
        .then(res => {
          // let arrForPath = []
          if (res.data) {
            this.tableDataShow = res.data.content
            this.total = res.data.totalElements
            if (this.tableDataShow && Array.isArray(this.tableDataShow)) {
              this.tableDataShow.forEach(item => {
                if (item.domains[0] && item.domains[0].id) {
                  this.$set(
                    this.recDomaMap,
                    item.objectId + '',
                    item.domains[0].id
                  )
                }
                // arrForPath.push(item.objectId)
                item.path = this.getPath(item)
              })
              // this.getPaths(arrForPath);
            }
          }
          this.hideLoading()
          callback && callback()
        })
        .catch(e => {
          this.failureCallback(e)
          this.hideLoading()
        })
    },
    getCurrentPara() {
      const obj = {
        pageSize: this.pageSize,
        currentPage: this.currentPage,
        modelId: this.currentModel,
        modelCategoryId: this.choosedCategoryId,
      }
      if (this.sortData?.prop) {
        obj.orderBy = this.sortData.prop
      }
      if (this.sortData?.order) {
        obj.sort = this.sortData.order === 'descending' ? 'desc' : ''
      }
      // obj.sort = 'asc'/'desc'

      // 空值赋给默认值
      Object.keys(this.defaultPara).forEach(key => {
        if (!obj[key] && this.defaultPara[key]) {
          obj[key] = this.defaultPara[key]
        }
      })
      obj.currentPage--
      return obj
    },
    failureCallback(e) {
      // this.refresh()
      if (e.response && e.response.data && e.response.data.errorMessage) {
        const msg = e.response.data.errorMessage
        const index = msg.indexOf('Cannot find the domain by id')
        if (index !== -1) {
          e = this.$t('domain.dataFind.domainNotFind')
        }
      }
      this.$showFailure(e)
    },
  },
  watch: {
    // keyword(newVal) {
    //   if (this.clearKw) {
    //     this.clearKw = fasle
    //     return
    //   }
    //   this.currentPage = 1
    //   const para = {
    //     keyword: newVal,
    //     filterData: this.filterData,
    //     sortData: this.sortData,
    //     pageSize: this.pageSize,
    //     currentPage: 1,
    //   }
    //   this.$nextTick(() => {
    //     this.getTableData(para)
    //   })
    // },
  },
  computed: {
    showpop() {
      let bool = false
      if (
        this.showDomainId &&
        this.currentDomain &&
        this.currentDomain.id &&
        this.currentDomain.id === this.showDomainId
      ) {
        bool = true
      }
      return bool
    },
  },
}
