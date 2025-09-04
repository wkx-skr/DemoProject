export default {
  props: ['data', 'state', 'domainHasComment', 'typeIds', 'draggable', 'selectedType'],
  mounted () {
    this.initTableData()
  },
  data () {
    return {
      columnDefs: null,
      allData: [],
      tableData: [],
      frameworkComponents: null,
      tableLoading: false,
      searchFormData: {
        // themeCategory: '全部',
        // theme: '',
        stateValue: null,
        // department: '',
        // departmentId: '',
        domainName: '',
        bigVersionId: '',
        startTime: null,
        endTime: null,
        domainCode: '',
        ownerOrg: '',
        submitter: ''
      },
      ownerOrgOptions: [],
      timer: null,
      themeCategoryArr: [],
      themeArr: [],
      themeOption: [],

      stateOptions: [
        {
          label: '全部',
          value: null
        },
        {
          label: '审核中',
          value: 'C'
        },
        {
          label: '待审核',
          value: 'D'
        },
        {
          label: '已发布',
          value: 'A'
        },
        {
          label: '已废弃',
          value: 'X'
        }
      ],
      bigVersionList: [],
      currentPage: 1,
      pageSize: 20,
      total: 0,
      selection: [],
      subscribeObjList: [],
      subscribeList: [],
      toAbandonLoading: false,
      toPublishLoading: false,
      keyword: '',
      selectedDomain: null
    }
  },
  computed: {
    stas () {
      return this.$route.path.includes('embeddedModule') ? 'false' : ''
    }
  },
  methods: {
    domainChanged () {
      this.$emit('domainSelected', this.selectedDomain)
    },
    selectDomain () {

    },
    refreshData () {
      this.initTableData()
    },
    initTableData () {
      const obj = {
        domainCode: this.keyword,
        chineseName: this.keyword,
        domainState: 'A',
        folderId: this.data.foldId || this.typeIds,
        submitter: '',
        firstPublishStart: null,
        firstPublishEnd: null,
        ownerOrg: '',
        orderColumn: ['createTime'],
        ascOrder: [false],
        currentPage: this.currentPage,
        pageSize: this.pageSize
      }
      this.tableLoading = true
      this.$http.post(`${this.$url}/service/domains/latest/page`, obj).then(res => {
        this.tableLoading = false
        this.tableData = res.data.items
        this.total = res.data.totalItems
        if (this.draggable) {
          // er图支持拖拽落标
          setTimeout(() => {
            let rows = document.querySelectorAll('#domainFolder .el-table__row')
            rows.forEach((v, i) => {
              v.draggable = true
              v.ondragstart = event => {
                let currentDomain = res.data.items[i]
                currentDomain.inheritType = this.selectedType
                event.dataTransfer.setData('domain-info', JSON.stringify(currentDomain))
                this.$emit('visibleChange', false)
              }
              v.ondragend = e => {
                this.$emit('visibleChange', true)
              }
            })
          }, 200)
        }
      }).catch(e => {
        this.tableLoading = false
        this.$showFailure(e)
      })
    },
    handleSizeChange (val) {
      this.pageSize = val
      this.handleCurrentChange(1)
    },
    handleCurrentChange (val) {
      this.currentPage = val
      this.selectedDomain = null
      this.initTableData()
    },
    openEdit (row, isUpdate) {
      this.$emit('editCurrent', row, isUpdate)
    },
    resetQuery () {
      this.searchFormData = {
        stateValue: null,
        domainName: '',
        bigVersionId: '',
        startTime: null,
        endTime: null,
        domainCode: '',
        submitter: ''
      }
      this.handleCurrentChange(1)
    }
  },
  watch: {
    keyword () {
      this.currentPage = 1
      if (this.timeout) {
        clearTimeout(this.timeout)
      }
      this.timeout = setTimeout(() => {
        this.initTableData()
        this.timeout = null
      }, 400)
    }
  }
}
