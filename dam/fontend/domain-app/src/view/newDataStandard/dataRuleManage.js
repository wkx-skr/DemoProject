export default {
  data() {
    return {
      nodeData: [{ name: '数据规则', couldClick: false }],
      keywords: '',
      tableData: [],
      pageSize: 20,
      currentPage: 1,
      total: 0,
      classOptions: [],
    }
  },
  mounted() {
    this.getTableData()
    this.getBigClassListAndBusinessTypeList()
  },
  methods: {
    getBigClassListAndBusinessTypeList() {
      this.classOptions = []
      this.$http
        .post(`${this.$url}/select/option/get`, {
          category: 'TR',
          names: ['规则大类'],
        })
        .then(res => {
          this.classOptions = res.data
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    searchQuery(id) {
      let name = ''
      this.classOptions.forEach(element => {
        if (element.ruleCode == id) {
          name = element.optionValue
        }
      })
      return name
    },
    addRow() {
      this.$emit('openDialogDomainRule', 'manage')
    },
    getTableData() {
      let obj = {
        name: this.keywords,
        currentPage: this.currentPage,
        pageSize: this.pageSize,
      }
      this.$http
        .post(this.$domain_url + `/domains/dataRule/getPage`, obj)
        .then(res => {
          this.tableData = res.data.content
          this.total = res.data.totalItems
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    changeEnableValue(row) {
      this.$http
        .post(
          this.$domain_url +
            `/domains/dataRule/updateDataRuleStatus?dataRuleId=${row.id}`
        )
        .then(res => {
          this.$datablauMessage.success('更改成功')
          this.handleCurrentChange(1)
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    deleteRow(row) {
      this.$DatablauCofirm(`确定要删除吗？`, '提示', {
        type: 'warning',
      }).then(() => {
        this.$http
          .post(
            this.$domain_url +
              `/domains/dataRule/deleteDataRule?dataRuleId=${row.id}`
          )
          .then(res => {
            this.$datablauMessage.success('删除成功')
            this.handleCurrentChange(1)
          })
          .catch(e => {
            this.$showFailure(e)
          })
      })
    },
    editRow(row) {
      this.$emit(
        'openDialogDomainRule',
        'manage',
        JSON.parse(JSON.stringify(row))
      )
    },
    backToFolder() {
      this.$emit('closeRuleManage')
    },
    handleSizeChange(size) {
      this.currentPage = 1
      this.pageSize = size
      this.getTableData()
    },
    handleCurrentChange(current) {
      this.currentPage = current
      this.getTableData()
    },
  },
  watch: {
    keywords() {
      this.handleCurrentChange(1)
    },
  },
}
