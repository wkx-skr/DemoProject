import ModelCategoryController from '../../../../base-components/http/baseController/ModelCategoryController'

export default {
  data() {
    return {
      pathMap: {},
      domainDetailPopOption: {
        gpuAcceleration: false,
      },
      currentDomainId: '',
      currentDomainData: {},

      isLoading: true,
      tableHeight: 300,

      keyword: '',
      currentPage: 1,
      pageSize: 20,
      orderByColumn: '',
      order: null,
      sortAttr: '',
      sortOrder: '', // ['ascending', 'descending', null]
      filterAttrArr: [],
      filterAttrValue: {},
      paraAttr: [
        'keyword',
        'currentPage',
        'pageSize',
        'sortAttr',
        'sortOrder',
        'filterAttrArr',
        'filterAttrValue',
      ],
      tableDataShow: [],
      total: 0,

      selection: [],
      mutipleLength: 0,
      removeColumn: [],
      categoryName: '',
      modelName: '',
      categoryArr: [],
      categoryNameArr: [],
      dataSourceArr: [],
      allTableData: [],
      categoryId: '',
      modelCategoryNames: [],
      allDataLoadingCh: false,
    }
  },
  components: {},
  props: {
    clusterData: {
      type: Object,
      required: true,
    },
    propDomainId: {
      type: String,
    },
    allDataLoading: {
      default: false,
    },
    columnsSort: {
      default: () => {},
    },
    getColumnsData: {
      type: Function,
      required: true,
    },
    getPrecision: {
      type: Function,
      required: true,
    },
  },
  computed: {
    acceptDisabled() {
      return this.selection.length <= 0
    },
  },
  mounted() {
    this.isLoading = false
    this.allDataLoadingCh = this.allDataLoading
    this.getCategory()
    this.dataInit()
    this.resetStyle()
    ModelCategoryController.getModelCategoriesWithUdp().then(res => {
      this.modelCategoryNames = res.data
      // console.log(this.modelCategoryNames);
    })
    // console.log(This.$modelCategories);

    $(window).resize(this.resetStyle)
  },
  beforeDestroy() {
    $(window).unbind('resize', this.resetStyle)
  },
  methods: {
    getDetails(para) {
      this.allDataLoadingCh = true
      if (!para) {
        para = this.getDefaultPara()
      } else {
        this.setThisPara(para)
      }
      this.$http
        .post(
          `${this.$meta_url}/service/domains/cluster_result/detaildelete/page`,
          {
            clusterId: this.clusterData.clusterId,
            keyword: this.keyword,
            modelCategoryId: this.categoryId,
            modelId: this.modelName,
            // orderByScore: false,
            orderByColumn: this.orderByColumn,
            order: this.order,
            currentPage: this.currentPage,
            pageSize: this.pageSize,
          }
        )
        .then(res => {
          this.allColumns = res.data.content
          this.total = res.data.totalItems
          // this.tableDataShow = res.data.content
          let allColumns = this.allColumns
          if (allColumns.length > 0) {
            let ids = []
            allColumns.forEach(item => {
              ids.push(item.id)
            })
            this.getPaths(ids)
            this.getColumnsData(ids)
              .then(res => {
                allColumns.forEach(item => {
                  item.data = res[item.id]
                })
              })
              .catch(e => this.$showFailure(e))
          } else {
            this.allDataLoadingCh = false
          }
          this.$nextTick(() => {
            this.tableDataShow = [...allColumns]
            // this.isLoading = false;
          })
        })
        .catch(e => this.$showFailure(e))
    },

    getCategory() {
      this.$http
        .get(this.$meta_url + '/models/fromre/?includeLogicalEntity=false')
        .then(res => {
          this.categoryArr = res.data
          this.categoryNameArr = [
            ...new Set(res.data.map(v => v.categoryName).filter(c => !!c)),
          ]
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    dataInit() {
      // this.getShowData()
      this.getDetails()
    },
    handleSelectionChange(val) {
      this.selection = val
      this.mutipleLength = val.length
    },
    filterHandler() {},
    handleSortChange(sordData) {
      this.orderByColumn =
        sordData.prop === 'modelCategoryName' ? 'categoryName' : sordData.prop
      this.order =
        sordData.order === 'descending'
          ? false
          : sordData.order === 'ascending'
          ? true
          : ''
      const para = this.getDefaultPara()
      const newPara = {
        currentPage: 1,
        sortAttr: sordData.prop,
        sortOrder: sordData.order,
      }
      // this.getShowData(_.assign(para, newPara));
      this.getDetails(_.assign(para, newPara))
    },
    // search system
    changeCategory(val) {
      this.dataSourceArr = []
      this.modelName = ''
      if (val === null || val === '') {
        this.modeName = ''
        this.dataSourceArr = []
        this.categoryId = ''
      } else {
        this.modeName = ''
        this.categoryArr.forEach(item => {
          if (item.categoryName === val) {
            this.dataSourceArr.push(item)
            this.categoryId = item.categoryId
          }
        })
      }
      const para = {
        keyword: this.keyword,
        currentPage: 1,
        pageSize: this.pageSize,
        sortAttr: null,
        sortOrder: null,
        categoryId: this.categoryId,
      }
      // this.getShowData(para);
      this.getDetails(para)
    },
    changeModel(val) {
      this.modelName = val
      const para = {
        keyword: this.keyword,
        currentPage: 1,
        pageSize: this.pageSize,
        sortAttr: null,
        sortOrder: null,
        categoryId: this.categoryId,
        modelName: this.modelName,
      }
      // this.getShowData(para);
      this.getDetails(para)
    },
    handleSizeChange(newSize) {
      const para = this.getDefaultPara()
      const newPara = {
        pageSize: newSize,
        currentPage: 1,
        categoryId: this.categoryId,
      }
      // this.getShowData(_.assign(para, newPara));
      this.getDetails(_.assign(para, newPara))
    },
    handleCurrentChange(currentPage) {
      const para = this.getDefaultPara()
      const newPara = {
        currentPage: currentPage,
        categoryId: this.categoryId,
      }
      // this.getShowData(_.assign(para, newPara));
      this.getDetails(_.assign(para, newPara))
    },
    handleSkip2Domain() {},
    handleRefresh() {
      this.pathMap = {}
      this.$nextTick(() => {
        this.dataInit()
      })
    },
    resetStyle() {
      this.$nextTick(() => {
        this.tableHeight = $(this.$el).find('.table-row')[0].offsetHeight
      })
    },
    getDefaultPara() {
      const result = {}
      this.paraAttr.forEach(item => {
        result[item] = this[item]
      })
      return result
    },
    setThisPara(para) {
      this.paraAttr.forEach(item => {
        this[item] = para[item]
      })
    },
    getShowData(para) {
      // this.isLoading = true;
      let result = []
      let allData = []
      if (!para) {
        para = this.getDefaultPara()
      } else {
        this.setThisPara(para)
      }

      const allColumns = this.clusterData.columns
      if (allColumns && Array.isArray(allColumns) && allColumns.length > 0) {
        if (para.keyword.length > 0) {
          const keyword = para.keyword.toLowerCase()
          const filterAttrs = ['alias', 'name']
          allColumns.forEach(item => {
            // filter
            let bool = false
            filterAttrs.forEach(prop => {
              if (
                !bool &&
                item[prop] &&
                item[prop].toLowerCase &&
                item[prop].toLowerCase().indexOf(keyword) !== -1
              ) {
                bool = true
              }
            })
            if (bool) {
              allData.push(item)
            }
          })
        } else {
          allData = allColumns
        }
        if (
          para.categoryId !== '' &&
          para.categoryId !== null &&
          para.categoryId !== undefined
        ) {
          const categoryData = []
          allData.forEach(item => {
            if (item.modelCategoryId === para.categoryId) {
              categoryData.push(item)
            }
          })
          allData = categoryData
        }
        if (
          para.modelName !== '' &&
          para.modelName !== null &&
          para.modelName !== undefined
        ) {
          const modelData = []
          allData.forEach(item => {
            if (item.modelId === para.modelName) {
              modelData.push(item)
            }
          })
          allData = modelData
        }
        if (this.filterAttrArr && this.filterAttrArr.length > 0) {
        }

        if (para.sortAttr) {
          this.columnsSort(allData, para.sortAttr, para.sortOrder)
        } else {
          this.columnsSort(allData, 'score', 'descending')
        }

        const currentPage = para.currentPage || 1
        const pageSize = para.pageSize || this.pageSize
        result = allData.slice(
          pageSize * (currentPage - 1),
          pageSize * currentPage
        )
      }

      this.total = allData.length
      this.tableDataShow = result
      this.allTableData = _.cloneDeep(this.tableDataShow)

      if (result.length > 0) {
        const ids = []
        result.forEach(item => {
          if (!this.pathMap[item.id]) {
            ids.push(item.id)
          }
        })
        this.getPaths(ids)
        // this.getColumnsData(ids)
        //   .then(res => {
        //     this.tableDataShow.forEach(item => {
        //       item.data = res[item.id]
        //     })
        //     this.$nextTick(() => {
        //       this.tableDataShow = [...this.tableDataShow]
        //       // this.isLoading = false;
        //     })
        //   })
        //   .catch(e => this.$showFailure(e))
      }
    },

    getPaths(ids) {
      if (ids && Array.isArray(ids) && ids.length !== 0) {
        this.$http
          .get(
            this.$meta_url +
              '/service/entities/objects/path?ids=' +
              ids.join(',')
          )
          .then(res => {
            if (res.data && Array.isArray(res.data) && res.data.length > 0) {
              res.data.forEach(item => {
                this.pathMap[item.objectId] = item
              })
              this.mergePath()
              this.allDataLoadingCh = false
            }
          })
          .catch(e => this.$showFailure(e))
      } else {
        this.mergePath()
      }
    },
    mergePath() {
      const arr = []
      this.tableDataShow.forEach(item => {
        let obj = {}
        if (this.pathMap[item.id]) {
          obj = _.assign({}, item, this.pathMap[item.id])
        } else {
          obj = item
        }
        arr.push(obj)
        this.$set(
          obj,
          'dataTypeFormatter',
          `${obj.dataType}`.split('(')[0].toUpperCase()
        )
      })
      this.tableDataShow = arr
    },
    getDataType(row, column, cellValue, index) {
      let result = ''
      let DataType = ''
      if (row.dataType) {
        DataType = row.dataType
      }
      if (!DataType) {
        result = ''
      } else {
        const index = DataType.indexOf('(')
        result = DataType.slice(0, index)
      }
      return result.toUpperCase()
    },
    getDataScale(row, column, cellValue, index) {
      let DataType = ''
      if (row.dataType && row.dataType && row.dataType) {
        DataType = row.dataType
      }
      const str = DataType
      let result = ''
      if (!str) {
        result = ''
      }
      const start = str.indexOf('(')
      const comma = str.indexOf(',')
      const end = str.indexOf(')')
      if (start == -1) {
        result = ''
      }
      if (comma == -1 && end != -1) {
        result = str.slice(start + 1, end)
      }
      if (start != -1 && comma != -1 && comma < end) {
        result = str.slice(start + 1, comma)
      }
      if (result) {
        result = result - 0
        if (isNaN(result)) {
          result = ''
        }
      }
      return result
    },
    // showLoading() {},
    // handlecreateDomain() {
    //   const column = this.selection[0]
    //   this.$emit('createDom', column, this.clusterData, this.selection)
    // },
  },
  watch: {
    keyword(newVal) {
      const para = {
        keyword: newVal,
        currentPage: 1,
        pageSize: this.pageSize,
        sortAttr: null,
        sortOrder: null,
        categoryId: this.categoryId,
        modelName: this.modelName,
      }
      // this.getShowData(para);
      this.getDetails(para)
    },
    currentDomainId: {
      handler: function (id) {
        if (!id) return
        this.$http
          .get(this.$url + '/service/domains/details/' + id)
          .then(res => {
            this.currentDomainData = res.data
          })
          .catch(e => {
            this.$showFailure(e)
          })
      },
      immediate: true,
    },
    propDomainId: {
      handler: function (newId) {
        if (!newId) return
        this.currentDomainId = newId
      },
      immediate: true,
    },
  },
}
