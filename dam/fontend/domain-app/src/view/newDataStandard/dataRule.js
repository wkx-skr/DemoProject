import HTTP from '@/http/main.js'
export default {
  data() {
    return {
      classOptions: [],
      bigClassList: [],
      tableData: [],
      pageSize: 20,
      currentPage: 1,
      total: 0,
      associationVisible: false,
      associationData: [],
      pageSizeAss: 20,
      currentPageAss: 1,
      totalAss: 0,
      selectionAssData: [],
      classOptions: [],
    }
  },
  props: {
    documentsIds: {
      type: Array,
      default() {
        return []
      },
    },
    isAssets: {},
    domainCode: {
      type: String,
    },
  },
  computed: {},
  watch: {},
  components: {},
  filters: {},
  created() {},
  beforeMount() {},
  mounted() {
    this.getListData()
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
    closeAssociationVisible() {
      this.associationVisible = false
    },
    domainRuleBind() {
      let dataRuleIds = []
      this.selectionAssData.forEach(element => {
        dataRuleIds.push(element.id)
      })
      this.$http
        .post(this.$domain_url + `/domains/dataRule/bind`, {
          domainCode: this.domainCode,
          dataRuleIds: dataRuleIds,
        })
        .then(res => {
          this.closeAssociationVisible()
          this.$datablauMessage.success('关联成功')
          this.handleCurrentChange(1)
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    changeEnableValue(row) {
      this.$http
        .post(this.$domain_url + `/domains/dataRule/updateBindStatus`, {
          domainCode: this.domainCode,
          dataRuleId: row.id,
        })
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
          .post(this.$domain_url + `/domains/dataRule/unbind`, {
            domainCode: this.domainCode,
            dataRuleIds: [row.id],
          })
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
        'dataRule',
        JSON.parse(JSON.stringify(row))
      )
    },
    getListData() {
      let obj = {
        name: this.keywords,
        currentPage: this.currentPage,
        pageSize: this.pageSize,
        domainCode: this.domainCode,
        notInDomainCode: false,
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
    handleSizeChange(size) {
      this.currentPage = 1
      this.pageSize = size
      this.getListData()
    },
    handleCurrentChange(current) {
      this.currentPage = current
      this.getListData()
    },
    manage() {
      this.$emit('openManage')
    },
    handleSizeChangeAss(size) {
      this.currentPageAss = 1
      this.pageSizeAss = size
      this.getAssociation()
    },
    handleCurrentChangeAss(current) {
      this.currentPageAss = current
      this.getAssociation()
    },
    association() {
      // associationData
      this.associationVisible = true
      this.handleCurrentChangeAss(1)
    },
    getAssociation() {
      let obj = {
        name: this.keywords,
        currentPage: this.currentPageAss,
        pageSize: this.pageSizeAss,
        domainCode: this.domainCode,
        notInDomainCode: true,
      }
      this.$http
        .post(this.$domain_url + `/domains/dataRule/getPage`, obj)
        .then(res => {
          this.associationData = res.data.content
          this.totalAss = res.data.totalItems
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    handleSelectionChange(selection) {
      this.selectionAssData = selection
    },

    addRow() {
      this.$emit('openDialogDomainRule', 'dataRule', '', this.domainCode)
    },
  },
}
