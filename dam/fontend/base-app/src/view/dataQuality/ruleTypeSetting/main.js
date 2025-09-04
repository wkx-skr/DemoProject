import editDialog from './editDialog.vue'
export default {
  components: {
    editDialog,
  },
  data() {
    return {
      option: {
        selectable: false,
        autoHideSelectable: true,
        showColumnSelection: true,
        columnSelection: [],
        columnResizable: true,
      },
      tableData: [],
      parentData: [],
      loading: false,
      pageSize: 20,
      currentPage: 1,
      total: 0,
    }
  },
  created() {
    this.getTableData()
  },
  beforeDestroy() {},
  methods: {
    getDialogData(data) {
      this.$http
        .post(this.$url + '/select/option/rule', data)
        .then(res => {
          this.$refs.editDialog.isShow = false
          this.$message.success(this.$t('assets.common.saveSuccess'))
          this.getTableData()
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    addRule() {
      this.$refs.editDialog.open('addRule')
    },
    addSub() {
      this.$refs.editDialog.open('addSub')
    },
    deleteRow(row) {
      this.$DatablauCofirm(
        this.$t('quality.page.ruleTypeSetting.deleteTips'),
        this.$t('common.info.title'),
        {
          type: 'warning',
        }
      )
        .then(() => {
          this.$http
            .get(this.$url + `/select/option/rule/${row.id}`)
            .then(res => {
              if (res.data.data.length === 0) {
                this.$message.success(this.$t('assets.common.deleteSuccess'))
              } else {
                let typeMap = {
                  BUSINESS_RULE: this.$t('common.page.dataQualityRules'),
                  TECH_RULE: this.$t('common.page.dataQualityTechRules'),
                  RULE_TEMPLATE: this.$t('common.page.ruleTemplate'),
                  DATA_RULE: '数据规则',
                }
                let text = []
                res.data.data.forEach(d => {
                  text.push(typeMap[d])
                })
                this.$DatablauCofirm(
                  this.$t('quality.page.ruleTypeSetting.reldelTips', {
                    type: text.join('、'),
                  }),
                  this.$t('common.info.title'),
                  {
                    type: 'warning',
                    cancelButtonText: this.$t('common.button.close'),
                    showConfirmButton: false,
                  }
                )
                  .then(() => {})
                  .catch(() => {})
              }
              this.getTableData()
            })
            .catch(e => {
              this.$showFailure(e)
            })
        })
        .catch(() => {})
    },
    editRow(row) {
      this.currentRow = row
      this.$refs.editDialog.open('edit', row)
    },
    getTableData() {
      this.$http
        .get(this.$url + '/select/option/rule/list')
        .then(res => {
          this.tableData = res.data.data
          if (Array.isArray(this.tableData)) {
            this.parentData = this.tableData.map(data => {
              return {
                name: data.optionValue,
                value: data.id,
                ruleCode: data.ruleCode,
              }
            })
          }
        })
        .catch(e => {
          this.tableData = []
          this.$showFailure(e)
        })
    },
    handleSizeChange(val) {
      this.pageSize = val
      this.currentPage = 1
      this.getTableData()
    },
    handleCurrentChange(val) {
      this.currentPage = val
      this.getTableData()
    },
  },
  computed: {},
  watch: {},
}
