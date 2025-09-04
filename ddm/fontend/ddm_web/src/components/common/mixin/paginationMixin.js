import _ from 'lodash'
export default {
  data() {
    return {
      autoSearch: true, // 是否在关键字变更时自动触发搜索
      currentPage: 1,
      pageSize: 20,
      total: 0,
      tableData: [],
      keyword: '',
      allData: [],
      sortData: {
        prop: '',
        order: '',
      },
      searchProps: []
    };
  },
  watch: {
    keyword(newKeyword) {
      if (this.autoSearch) {
        this.currentPage = 1;
        this.fetchData();
      }
    },
  },
  methods: {
    // 需要自定义函数 getData 来获取数据,
    // 如果需求前端分页, 可以调用 getDataFromAll 函数
    fetchData () {
      // this.tableData = null
      // this.total = 0;
      let para = {
        keyword: this.keyword,
        currentPage: this.currentPage,
        pageSize: this.pageSize
      }
      if (this.getData) {
        this.getData(para)
      }

    },
    // TODO
    // 检查删除后 是否超出最后一页
    // 前端分页时的过滤函数, 当过滤参数比 keyword 多时, 可以在组件内覆盖
    filterForPagination (dataList) {
      if (this.searchProps && this.searchProps.length > 0) {
        return dataList.filter(item => this.$MatchKeyword(item, _.trim(this.keyword), ...this.searchProps))
      } else {
        return dataList
      }

    },
    sortAllData (allData) {
      let sortProp = this.sortData?.prop ||'';
      if (sortProp) {
        let sortList = _.sortBy(allData, sortProp)
        if (this.sortData?.order === 'descending') {
          sortList.reverse()
        }
        return sortList;
      } else {
        return allData;
      }
    },
    // 前端分页获取数据, 如果前端分页时, 可以使用
    getDataFromAll() {
      let sortData = this.sortAllData(this.allData)
      let filteredData = this.filterForPagination(sortData)
      // console.log(filteredData, 'filteredData')
      const start = (this.currentPage - 1) * this.pageSize;
      const end = start + this.pageSize;

      this.tableData = filteredData.slice(start, end);
      this.total = filteredData.length;
    },
    handleCurrentChange(page) {
      this.currentPage = page
      this.fetchData()
    },
    handleSortChange (sortData) {
      this.sortData = sortData;
      this.currentPage = 1
      this.fetchData()
    },
    handleSizeChange(pageSize) {
      this.pageSize = pageSize
      this.currentPage = 1
      this.fetchData()
    },
  },
};
