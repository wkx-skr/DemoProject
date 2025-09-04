import columnDetailPopover from './columnDetailPopover.vue'
import reClusterItem from './reClusterItem.vue'
let resultAllData = []
export default {
  data() {
    return {
      hasAccess: false,
      isLoading: true,
      columnsPopArr: [],
      columnPopBoun: null,
      categoryNameArr: [],
      categoryArr: [],
      dataSourceArr: [],
      keyword: '',
      // resultAllData: [],
      tableDataShow: [],
      tableHeight: 300,
      columnGetTimer: null,
      columnGetDelay: 300,
      showOnceMap: {},
      selection: [],
      mutipleLength: 0,
      currentPage: 1,
      pageSize: 20,
      total: 0,
      isFullWord: 0,
      isFullWordOrigin: false,
      categoryId: '',
      modelId: '',
      fullMatch: false,
      categoryName: '',
      modelCategoryNames: [],
      modeName: '',
      orderByNum: 0,
    }
  },
  components: {
    columnDetailPopover,
    reClusterItem,
  },
  props: {
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
    deleteDisabled() {
      return this.selection.length === 0
    },
  },
  beforeMount() {
    this.hasAccess = true
  },
  mounted() {
    this.dataInit()
    this.resetStyle()
    this.getCategory()
    this.resizeTable()
    $(window).resize(this.resizeTable)
    $(window).resize(this.resetStyle)
    this.$http
      .post(this.$url + '/modelCategory/getModelCategories')
      .then(res => {
        this.modelCategoryNames = res.data
      })
  },
  beforeDestroy() {
    $(window).unbind('resize', this.resetStyle)
    this.columnsPopArr = []
    this.tableDataShow = []
    // this.resultAllData = [];
    resultAllData = null
    $(window).unbind('resize', this.resizeTable)
  },
  methods: {
    resizeTable() {
      this.$nextTick(() => {
        this.tableHeight = $('.cluster-result-tab2 .table-row')[0].offsetHeight
      })
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
    dataInit(callback) {
      this.isLoading = true
      this.columnPopBoun = this.$refs.tableLine
      // this.$http.get(this.$url + '/service/domains/cluster_result')
      // .then(res => {
      //   if (res.data && Array.isArray(res.data)) {
      //     resultAllData = res.data;
      //     resultAllData.forEach(item => {
      //       let columns = item.columns;
      //       if (columns && columns.length>0) {
      //         this.columnsSort(columns, 'score', 'descending');
      //       }
      //     });
      //     this.getShowData();
      //   } else {
      //     this.isLoading = false;
      //   }
      //   callback && callback();
      // })
      // .catch(e => {
      //   this.$showFailure(e);
      //   this.isLoading = false;
      //   callback && callback();
      // });
      let categoryId = ''
      this.categoryArr.forEach(item => {
        if (item.categoryName === this.categoryName) {
          categoryId = item.categoryId
        }
      })
      this.$http
        .get(
          this.$meta_url +
            `/service/domains/cluster_result/findDelete?currentPage=${
              this.currentPage - 1
            }&pageSize=${this.pageSize}&keyword=${this.keyword}&isFullWord=${
              this.isFullWord
            }&categoryId=${categoryId}&modelId=${this.modeName}&orderByNum=${
              this.orderByNum
            }`
        )
        .then(res => {
          this.isLoading = false
          const tableDataShowArr = []
          res.data.content.forEach(element => {
            if (element.columns && element.columns.length > 0) {
              tableDataShowArr.push(element)
            }
          })
          this.tableDataShow = tableDataShowArr
          resultAllData = _.cloneDeep(res.data.content)
          this.total = res.data.totalElements
        })
        .catch(e => {
          this.isLoading = false
          this.$showFailure(e)
        })
    },
    reRefresh() {
      const callback = () => {
        this.$emit('reRefreshResultOk')
      }
      this.dataInit(callback)
    },
    addJobTab() {
      this.$emit('addJobTab')
    },
    resetStyle() {
      this.$nextTick(() => {
        this.tableHeight = $(this.$el).find('.table-row')[0].offsetHeight
      })
    },
    showColumnDetail(column, row, event) {
      this.showOnceMap[column.id] = true
      this.columnGetTimer = setTimeout(() => {
        this.columnGetTimer = null
        if (!column.getData) {
          column.getData = true
          this.getColumnsData(column.id)
            .then(res => {
              const result = res[column.id]
              const popData = {
                name: column.name,
                id: column.id,
                referDom: event.target || event.srcElement,
                columnData: result,
              }
              row.popData = popData
              this.insertPop(popData)
            })
            .catch(e => {
              this.$showFailure(e)
            })
        }
      }, this.columnGetDelay)
    },
    hideColumnDetail(column, row, event) {
      this.showOnceMap[column.id] = false
      clearTimeout(this.columnGetTimer)
      if (this.columnGetTimer) {
        this.columnGetTimer = null
      }
    },
    handleSelectionChange(val) {
      this.selection = val
      this.mutipleLength = val.length
    },
    handleFilterChange() {},
    handleSortChange(sortData) {
      if (sortData.order === 'descending') {
        this.orderByNum = -1
      } else if (sortData.order === 'ascending') {
        this.orderByNum = 1
      } else {
        this.orderByNum = 0
      }
      this.currentPage = 1
      this.dataInit()
    },
    handleCheckItem(row) {
      console.log('row', row)
      const clusterId = row.clusterId
      if (!clusterId) return
      const itemData = this.getItemData(clusterId)

      this.$emit('readdItemTab', itemData)
    },
    handleSizeChange(val) {
      // let para = {
      //   pageSize: val,
      //   currentPage: 1,
      //   keyword: this.keyword,
      //   sortProp: this.sortProp,
      //   sortOrder: this.sortOrder
      // };
      this.pageSize = val
      this.currentPage = 1
      this.dataInit()
      // this.getShowData(para);
    },
    // getItemData(clusterId) {
    //   let result = {};
    //   result = resultAllData.find(item => {
    //     return item.clusterId === clusterId;
    //   });
    //   return result;
    // },
    getColumnsCount(row) {
      // let clusterId = row.data.clusterId;
      // let itemData = this.getItemData(clusterId);
      const count = row.columns ? row.columns.length : 0
      return count
    },
    // filterResult(keyword) {
    //   this.isLoading = true;
    //   if (keyword) {
    //     let arrData = this.resultAllData;
    //     if (Array.isArray(arrData) && arrData.length>0) {
    //       let result = [];
    //       arrData.forEach(item => {
    //         let columns = item.columns;
    //         let newColumns = this.filterColumns(columns, keyword);
    //         if (newColumns && newColumns.length > 0) {
    //           this.columnsSort(newColumns, 'score', 'descending');
    //           let obj = {
    //             data: item,
    //             exampleData: newColumns
    //           };
    //           result.push(obj);
    //         }
    //       });
    //       this.tableDataShow = result;
    //       this.isLoading = false;
    //     }
    //   } else {
    //     this.dataInit();
    //   }
    // },
    filterColumns(columns, keyword) {
      // let arr = [...columns];
      const arr = columns
      // let arr = [];
      const result = []
      keyword = _.trim(keyword)
      if (keyword && Array.isArray(arr) && arr.length > 0) {
        keyword = keyword.toLowerCase()
        if (this.fullMatch) {
          arr.forEach(item => {
            let name = item.alias || ''
            name = _.trim(name)
            if (name === keyword && result.length < 5) {
              result.push(item)
            }
          })
        } else {
          arr.forEach(item => {
            let name = item.alias || ''
            name = _.trim(name)
            if (name) {
              const index = name.toLowerCase().indexOf(keyword)
              if (index !== -1 && result.length < 5) {
                result.push(item)
              }
            }
          })
        }
      }
      return result
    },
    changeCategory(val) {
      this.dataSourceArr = []
      if (val === null || val === '') {
        this.modeName = ''
        this.dataSourceArr = []
      } else {
        this.modeName = ''
        this.categoryArr.forEach(item => {
          if (item.categoryName === val) {
            this.dataSourceArr.push(item)
          }
        })
      }
    },
    handleCurrentChange(val) {
      this.currentPage = val
      // let para = {
      //   pageSize: this.pageSize,
      //   currentPage: val,
      //   keyword: this.keyword,
      //   sortProp: this.sortProp,
      //   sortOrder: this.sortOrder
      // };
      // this.getShowData(para);
      this.dataInit()
    },
    handleDeleteItem(row) {
      this.$DatablauCofirm(
        this.$t('domain.domainCluster.reRecommendConfirm'),
        this.$t('domain.dataFind.reRecommend'),
        {
          confirmButtonText: this.$t('common.button.ok'),
          cancelButtonText: this.$t('common.button.cancel'),
          type: 'warning',
        }
      )
        .then(() => {
          let arr
          if (row) {
            arr = [row.clusterId]
          } else {
            arr = this.selection.map(item => item.clusterId)
          }
          if (arr && Array.isArray(arr) && arr.length > 0) {
            this.isLoading = true
            this.$http
              .post(
                `${this.$meta_url}/domains/cluster_result/reviveResult`,
                arr
              )
              .then(res => {
                if (
                  arr.length ===
                  this.total - this.pageSize * (this.currentPage - 1)
                ) {
                  if (this.currentPage > 1) {
                    this.currentPage--
                  }
                }
                this.reRefresh()
                this.isLoading = false
              })
              .catch(e => {
                this.$showFailure(e)
              })
          }
        })
        .catch(e => {
          console.log(e)
        })
    },

    getColumnDetail(columnId) {
      return this.$http.get(
        this.$meta_url + '/service/entities/' + columnId + '/summary'
      )
    },
    insertPop(popData) {
      const obj = {
        id: popData.id,
        referDom: popData.referDom,
        columnData: popData.columnData,
      }
      this.columnsPopArr.push(obj)
    },
    getItemData(clusterId) {
      let itemData = {}
      resultAllData.forEach(item => {
        if (item.clusterId === clusterId) {
          itemData = item
        }
      })
      return itemData
    },
    getShowData(para) {
      if (!para) {
        para = {
          pageSize: this.pageSize,
          currentPage: this.currentPage,
          keyword: this.keyword,
          sortProp: this.sortProp,
          sortOrder: this.sortOrder,
        }
      }
      // let resultItem = {
      //   clusterId: '',
      //   columns: [],
      //   timestamp: ''
      // }

      this.isLoading = true
      const allData = resultAllData
      let arrData = []
      let resultArr = []

      if (para.keyword && Array.isArray(allData) && allData.length > 0) {
        const keyword = para.keyword
        const result = []
        allData.forEach(item => {
          const columns = item.columns
          if (columns && Array.isArray(columns) && columns.length > 0) {
            const newColumns = this.filterColumns(columns, keyword)
            if (newColumns && newColumns.length > 0) {
              // this.columnsSort(newColumns, 'score', 'descending');
              item.showColumns = newColumns
              result.push(item)
            } else {
              item.showColumns = null
            }
          }
        })
        arrData = result
      } else {
        arrData = allData
      }
      const countResult = []
      arrData.forEach(item => {
        const columns = item.showColumns || item.columns
        if (columns && columns.length > 0) {
          // this.columnsSort(columns, 'score', 'descending');
          const obj = {
            data: item,
            exampleData: columns.slice(0, 5),
          }
          countResult.push(obj)
        }
      })
      arrData = countResult
      this.total = arrData.length
      if (para.sortProp) {
        if (para.sortProp === 'columnlength') {
          arrData.sort((a, b) => {
            const alen =
              a && a.data && a.data.columns ? a.data.columns.length : 0
            const blen =
              b && b.data && b.data.columns ? b.data.columns.length : 0
            return alen - blen
          })
          if (para.sortOrder === 'descending') {
            arrData.reverse()
          }
        }
      }

      const currentPage = para.currentPage || 1
      const pageSize = para.pageSize || this.pageSize
      resultArr = arrData.slice(
        pageSize * (currentPage - 1),
        pageSize * currentPage
      )

      this.tableDataShow = resultArr

      this.isLoading = false
    },
    matchTypeChange(val) {
      let keyword = this.keyword
      keyword = _.trim(keyword)
      if (keyword) {
        if (val === true) {
          this.isFullWord = 1
        } else {
          this.isFullWord = 0
        }
        this.currentPage = 1
        this.dataInit()
      } else {
        if (val === true) {
          this.isFullWord = 1
        } else {
          this.isFullWord = 0
        }
      }
    },
  },
  watch: {
    keyword() {
      this.currentPage = 1
      setTimeout(() => {
        this.dataInit()
      }, 500)
    },
    categoryName() {
      this.currentPage = 1
      setTimeout(() => {
        this.dataInit()
      }, 500)
    },
    modeName() {
      this.currentPage = 1
      setTimeout(() => {
        this.dataInit()
      }, 500)
    },
    // fullMatch() {
    //   this.currentPage = 1;
    //   setTimeout(() => {
    //     this.dataInit();
    //   }, 500)
    // }
  },
}
