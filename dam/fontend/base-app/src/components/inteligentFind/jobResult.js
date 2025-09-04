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
      keyword: '',
      filterData: {},
      sortData: {},
      pageSize: 20,
      currentPage: 1,

      selection: [],
      mutipleLength: 0,
      deleteDisabled: true,

      defaultPara: {
        keyword: '',
        filterData: {},
        currentPage: 1,
        pageSize: 20,
        sortData: {
          prop: 'higestScore',
          order: 'desc',
        },
      },
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
    // this.tableDatInit();
    this.isLoading = true
    this.getModelTree()
    this.hashHeader = location.hash.split('/')[2].split('?')[0]
    this.resizeTable()
    $(window).resize(this.resizeTable)
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
      const obj = this.$route.query
      // zl
      obj.modelCategoryId = ''
      obj.modelId = ''
      if (Object.keys(obj).length > 0) {
        const url = this.$url + '/service/entities/domains/candidates'
        let str = ''
        this.$nextTick(() => {
          str += '?'
          for (const key in obj) {
            str +=
              encodeURIComponent(key) + '=' + encodeURIComponent(obj[key]) + '&'
            if (key === 'pageSize') {
              this.pageSize = obj[key] - 0
            } else if (key === 'currentPage') {
              const page = obj[key] - 0 + 1
              // this.currentPage = page;
              setTimeout(() => {
                this.currentPage = page
              }, 500)
            }
          }
          str = str.slice(0, -1)
          this.getData(url + str)
        })
      } else {
        const para = {
          keyword: this.keyword,
          filterData: this.filterData,
          currentPage: 1,
          pageSize: this.pageSize,
        }
        this.getTableData(para)
      }
    },
    // pagination
    handleCurrentChange(currentPage) {
      this.currentPage = currentPage
      const para = {
        keyword: this.keyword,
        filterData: {
          categoryIds: this.choosedCategoryId,
          modelId: this.currentModel,
        },
        sortData: this.sortData,
        pageSize: this.pageSize,
        currentPage: this.currentPage,
      }
      this.getTableData(para)
    },
    handleSizeChange(size) {
      this.pageSize = size
      this.currentPage = 1
      const para = {
        keyword: this.keyword,
        filterData: {
          categoryIds: this.choosedCategoryId,
          modelId: this.currentModel,
        },
        sortData: this.sortData,
        pageSize: this.pageSize,
        currentPage: this.currentPage,
      }
      this.getTableData(para)
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
      this.clearKeyword()
      this.clearSort()
      const para = {
        keyword: '',
        filterData: {
          categoryIds: categoryIds,
        },
        sortData: {},
        pageSize: this.pageSize,
        currentPage: 1,
      }
      this.getTableData(para)
    },
    handleModelChange(modelId) {
      this.clearKeyword()
      this.clearSort()
      const para = {
        keyword: '',
        filterData: {
          categoryIds: this.choosedCategoryId,
          modelId: modelId,
        },
        sortData: {},
        pageSize: this.pageSize,
        currentPage: 1,
      }
      this.filterData = para.filterData
      this.getTableData(para)
    },
    handleSortChange(sortData) {
      // optional parameters name，alias， timstamp， modelId， modelCategoryId
      const obj = {
        prop: sortData.prop,
        order: sortData.order,
      }
      const para = {
        keyword: this.keyword,
        filterData: {
          categoryIds: this.choosedCategoryId,
          modelId: this.currentModel,
        },
        sortData: obj,
        pageSize: this.pageSize,
        currentPage: 1,
      }
      this.sortData = obj
      this.getTableData(para)
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
        // this.clearKeyword();
        // this.currentPage = 1;
        para = this.getCurrentPara()
      }
      para.pageSize = para.pageSize ? para.pageSize : this.pageSize
      this.currentPage = para.currentPage
      this.gettableDataShow(para, callback)
    },

    handleSkip2Domain(domain) {
      this.$skip2Domain(domain.id)
    },

    resizeTable() {
      this.$nextTick(() => {
        this.tableHeight = $('.rec-job-result .table-row')[0].offsetHeight
      })
      // setTimeout(() => {
      //   this.tableHeight = $(".rec-job-result .table-row")[0].offsetHeight;
      // }, 300);
    },
    /** *************************************** */
    handleChooseDom(scope, item) {
      this.recDomaMap[scope.row.objectId] = item.id
    },
    gettableDataShow(para, callback) {
      this.showLoading()
      let url = this.$url + '/service/entities/domains/candidates'
      let str = ''
      if (para) {
        str += '?'
        if (para.pageSize) {
          str += 'pageSize=' + encodeURIComponent(para.pageSize) + '&'
        }
        if (para.currentPage || para.currentPage === 0) {
          if (para.currentPage > 0) {
            para.currentPage--
          }
          str += 'currentPage=' + encodeURIComponent(para.currentPage) + '&'
        }
        if (para.keyword) {
          str += 'keyword=' + encodeURIComponent(para.keyword) + '&'
        }
        if (para.filterData) {
          const obj = para.filterData
          if (obj.categoryIds || obj.categoryIds === 0) {
            str +=
              'modelCategoryId=' + encodeURIComponent(obj.categoryIds) + '&'
          }
          if (obj.modelId || obj.modelId === 0) {
            str += 'modelId=' + encodeURIComponent(obj.modelId) + '&'
          }
        }
        if (para.sortData && para.sortData.prop) {
          const obj = para.sortData
          str += 'orderBy=' + obj.prop + '&'
          if (obj.order === 'descending') {
            str += 'sort=desc&'
          } else {
            str += 'sort=asc&'
          }
        } else {
          const obj = para.sortData
          if (obj.order && obj.order === 'descending') {
            str += 'orderBy=higestScore&sort=desc&'
          } else {
            str += 'orderBy=higestScore&sort=asc&'
          }
        }
        str = str.slice(0, -1)
        this.$nextTick(() => {
          location.hash = '#/main/' + this.hashHeader + str
        })
      }
      url += str
      this.getData(url, callback)
    },
    refresh() {
      this.showLoading()
      this.getTableData()
    },
    modelCategorieFormat(row, column, cellValue, index) {
      return this.$modelCategoriesMap[cellValue]
    },
    handleBindDom(scope) {
      // this.showLoading();
      const json = {
        domainId: this.recDomaMap[scope.row.objectId],
        objectId: scope.row.objectId,
      }
      this.$http
        .post(this.$url + '/service/domains/entities', json)
        .then(res => {
          this.$message.success({
            message: this.$t('domain.common.modifySuccessfully'),
          })
          this.getThisPage()
        })
        .catch(e => {
          this.failureCallback(e)
        })
    },
    handlerejDom(scope) {
      // this.showLoading();
      this.$http
        .delete(
          this.$url +
            '/service/entities/domains/candidates/' +
            scope.row.objectId
        )
        .then(res => {
          this.$message.success({
            message: this.$t('domain.common.modifySuccessfully'),
          })
          this.getThisPage()
        })
        .catch(e => {
          this.failureCallback(e)
        })
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
        // this.$http.post(this.$url+'/service/domains/entities', json)
        this.$http
          .delete(
            this.$url + '/service/entities/domains/candidates/' + item.objectId
          )
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
      const para = {
        keyword: this.keyword,
        filterData: this.filterData,
        sortData: this.sortData,
        pageSize: this.pageSize,
        currentPage: this.currentPage,
      }
      this.getTableData(para)
    },
    clearKeyword() {
      this.clearKw = true
      this.keyword = ''
    },
    resetKeyword() {
      this.clearKw = true
      this.keyword = ''
    },
    clearSort() {
      this.$refs.recDomTable.clearSort()
    },
    getModels(categoryId) {
      if (!categoryId && categoryId !== 0) {
        this.modelsArr = []
        this.currentModel = ''
      }
      this.$http
        .get(this.$meta_url + '/service/models/fromre/')
        .then(res => {
          const modelsArr = []
          if (res.data && Array.isArray(res.data)) {
            if (categoryId || categoryId === 0) {
              res.data.forEach(item => {
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
        })
        .catch(e => this.failureCallback(e))
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
          .get(this.$url + '/service/domains/details/' + domainId)
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
        .get(this.$url + '/service/models/modeltree')
        .then(res => {
          this.modelCategoryMap = {}
          this.modelMap = {}
          const getChildrenMap = obj => {
            if (obj.type === 'MODEL_CATEGORY') {
              this.modelCategoryMap[obj.id + ''] = obj.name
            } else if (obj.type === 'MODEL') {
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
    getData(url, callback) {
      this.$http
        .get(url)
        .then(res => {
          if (res.data) {
            this.total = res.data.totalElements
            const arr = res.data.content
            const arrForPath = []
            if (arr && Array.isArray(arr)) {
              this.tableDataShow = arr
              console.log(this.tableDataShow, 'this.tableDataShow')
              arr.forEach(item => {
                if (item.domains[0] && item.domains[0].id) {
                  this.$set(
                    this.recDomaMap,
                    item.objectId + '',
                    item.domains[0].id
                  )
                }
                arrForPath.push(item.objectId)
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
        keyword: this.keyword,
        filterData: this.filterData,
        sortData: this.sortData,
      }
      for (const key in this.defaultPara) {
        if (!obj[key]) {
          if (key === 'sortData' && (!obj[key] || !obj[key].prop)) {
            obj[key] = this.defaultPara[key]
          } else {
            obj[key] = this.defaultPara[key]
          }
        }
      }
      return obj
    },
    failureCallback(e) {
      this.refresh()
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
    keyword(newVal) {
      if (this.clearKw) {
        this.clearKw = fasle
        return
      }
      this.currentPage = 1
      const para = {
        keyword: newVal,
        filterData: this.filterData,
        sortData: this.sortData,
        pageSize: this.pageSize,
        currentPage: 1,
      }
      this.$nextTick(() => {
        this.getTableData(para)
      })
    },
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
