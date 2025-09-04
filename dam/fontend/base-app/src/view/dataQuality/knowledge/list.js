export default {
  props: ['hasAccess'],
  data() {
    return {
      rawData: [],
      data: [],
      keyword: '',
      dataDisplay: null,

      tableHeight: 100,
      currentPage: 1,
      pageSize: 20,
      total: 0,

      multipleSelection: [],
      keywordTimeout: null,
      tableLoading: false,
      searchType: 'name',
      nameMapping: {},
      deleteArr: [
        'rawData',
        'data',
        'dataDisplay',
        'multipleSelection',
        'nameMapping',
      ],
      option: {
        selectable: true,
        autoHideSelectable: true,
        showColumnSelection: true,
        columnSelection: [],
        columnResizable: true,
      },
    }
  },
  watch: {
    keyword() {
      clearTimeout(this.keywordTimeout)
      this.tableLoading = true
      this.keywordTimeout = setTimeout(() => {
        // 修复 分页查询不对的问题 搜索时默认按第一页发送数据请求
        this.currentPage = 1
        this.loadData()
      }, 1000)
    },
  },
  mounted() {
    const self = this
    // setTimeout(() => {
    //   this.resize()
    // })
    $(window).on('resize', this.resize)
    this.$bus.$on('reload', this.loadData)
    this.loadData()
  },
  beforeDestroy() {
    this.$bus.$off('reload')
    $(window).off('resize', this.resize)
    setTimeout(() => {
      this.deleteArr.forEach(item => {
        if (typeof this[item] === 'object' && this[item]) {
          Object.keys(this[item]).forEach(o => {
            this[item][o] = null
          })
        }
        this[item] = null
      })
      if (window.CollectGarbage) {
        window.CollectGarbage()
      }
    }, 3000)
  },
  methods: {
    getUserByIds(idList) {
      if (!idList) {
        return
      }
      return new Promise(resolve => {
        this.$http
          .post(`${this.$url}/service/staffs/ids?isTuAcct=true`, idList)
          .then(res => {
            const obj = {}
            res.data.forEach(e => {
              obj[e.tuAcct] = e.tuCname
            })
            this.nameMapping = obj
          })
          .catch(e => {
            this.$showFailure(e)
          })
      })
    },
    getPeopleName(list) {
      return list.map(e => this.nameMapping[e]).toString()
        ? list.map(e => this.nameMapping[e]).toString()
        : list.toString()
    },
    resize() {
      if ($('.table-row')[0].offsetHeight === 0) {
        return
      }
      this.tableHeight = $('.table-row')[0].offsetHeight
    },
    refresh() {
      this.currentPage = 1
      this.keyword = ''

      this.loadData()
    },
    addTab() {
      // this.$store.commit('changeKnowState', true);
      this.$bus.$emit('addTab', null, true)
    },
    handleSelectionChange(val) {
      this.multipleSelection = val
      this.deletedataDisabled = this.multipleSelection.length === 0
    },
    handleSearchTypeChange() {
      if (this.keyword) {
        this.loadData()
      }
    },
    loadData() {
      const requestBody = {
        currentPage: this.currentPage,
        pageSize: this.pageSize,
        //        techRule:this.keyword,
        title: this.keyword,
      }
      if (this.searchType === 'name') {
        requestBody.title = this.keyword
        delete requestBody.techRule
      } else {
        delete requestBody.title
        requestBody.techRule = this.keyword
      }
      this.tableLoading = true
      this.dataDisplay = null
      this.rawData = []

      this.$http
        .post(this.$quality_url + '/knowledge/kds', requestBody)
        .then(res => {
          this.tableLoading = false
          this.total = res.data.totalItems
          if (Array.isArray(res.data.content)) {
            this.rawData = this.rawData.concat(res.data.content)
            this.rawData.forEach(item => {
              item.name = item.title
            })
            this.dataDisplay = this.rawData
            let arr2 = this.dataDisplay.map(e => e.lastModifier)
            arr2 = [...new Set(arr2)]
            // this.getUserByIds(arr2)
            this.openKnowledgeTab()
          }
        })
        .catch(e => {
          this.$showFailure(e)
          this.tableLoading = false
        })
    },
    handleSizeChange(size) {
      this.pageSize = size
      this.currentPage = 1
      this.loadData()
    },
    handleCurrentChange(current) {
      this.currentPage = current
      this.loadData()
    },
    openKnowledgeTab() {
      const query = this.$route.query.kdId
      query &&
        this.dataDisplay.forEach(item => {
          if (item.kdId == query) {
            this.$bus.$emit('addTab', item)
          }
        })
    },
    preDeleteRows() {
      let text = ''
      if (this.multipleSelection.length === 1) {
        text = this.$t('quality.page.knowledgebase.deleteTips1', {
          name: this.multipleSelection[0].name,
        })
      } else {
        text = this.$t('quality.page.knowledgebase.deleteTips2', {
          selection: this.multipleSelection.length,
        })
      }
      this.$DatablauCofirm(
        text,
        this.$t('quality.page.knowledgebase.deleteTipsTitle'),
        {
          type: 'warning',
          closeOnClickModal: false,
        }
      )
        .then(() => {
          this.deleteRows()
        })
        .catch(() => {})
    },
    deleteRows() {
      const self = this
      const rows = self.multipleSelection
      const length = rows.length
      if (length === 0) {
      } else {
        const ids = []
        rows.forEach((row, index) => {
          ids.push(row.kdId)
        })
        this.$http
          .post(this.$quality_url + '/knowledge/kd/delete', ids)
          .then(res => {
            this.$message.success(this.$version.common.operationSucceed)
            this.loadData()
          })
          .catch(e => {
            this.$message.error(e.response.errorMessage)
          })
      }
    },
    handleRowClick(row) {
      // this.$store.commit('changeKnowState', false);
      this.$bus.$emit('addTab', row, false)
    },
    handleEdit(index) {
      // this.$store.commit('changeKnowState', true);
      const detail = this.dataDisplay[index]
      this.$bus.$emit('addTab', detail, true)
    },
    ruleFormatter() {
      const content = arguments[0][arguments[1].property]
      return content.toString()
    },
  },
  computed: {
    deleteDisabled() {
      return this.multipleSelection.length === 0
    },
  },
}
