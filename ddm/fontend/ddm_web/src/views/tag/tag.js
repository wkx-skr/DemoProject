import HTTP from '@/resource/http'
import string from '@/resource/utils/string'
import sort from '@/resource/utils/sort'
import _ from 'lodash'
export default {
  data () {
    let contentValidate = (rule, value, callback) => {
      value = _.trim(this.tagName)
      if (!value) {
        callback(new Error(this.$v.tagMgr.tip_01))
      } else {
        callback()
      }
    }
    return {
      keyword: '',
      allData: null,
      filteredData: null,
      tableData: null,
      total: 0,
      pageSize: 20,
      currentPage: 1,
      dialogTitle: '',
      dialogVisible: false,
      dialogBody: null,
      currentRow: null,
      currentData: null,
      editDialogVisible: false,
      editDialogTitle: '',
      tagName: '',
      tagDef: '',
      rules: {
        name: {
          required: true,
          validator: contentValidate,
          trigger: 'blur'
        }
      }
    }
  },
  mounted () {
    this.getTags()
  },
  inject: ['refresh'],
  methods: {
    getTags () {
      HTTP.getTags({
        successCallback: data => {
          sort.sort(data, 'name')
          this.allData = data
          this.filterData()
        }
      })
    },
    filterData () {
      this.filteredData = this.allData.filter(item => {
        return string.matchKeyword(item, this.keyword, 'name')
      })
      this.total = this.filteredData.length
      this.getCurrentPageData()
    },
    handleSizeChange (size) {
      this.currentPage = 1
      this.pageSize = size
      this.getCurrentPageData()
    },
    handleCurrentChange () {
      this.getCurrentPageData()
    },
    getCurrentPageData () {
      // 计算最大页数
      const maxPage = Math.ceil(this.filteredData.length / this.pageSize) || 1

      // 判断是否超出最大页数
      if (this.currentPage > maxPage) {
        this.currentPage = maxPage
      }

      this.tableData = this.filteredData.slice((this.currentPage - 1) * this.pageSize, (this.currentPage) * this.pageSize)
    },
    initCreateTag () {
      this.currentData = {}
      this.tagName = ''
      this.tagDef = ''
      this.editDialogTitle = this.$v.tagMgr.creLabel
      this.editDialogVisible = true
      this.$nextTick(() => {
        this.$refs.editDialogInput?.focus()
      })
    },
    initEditTag (currentData) {
      this.currentData = currentData
      this.editDialogTitle = this.$v.tagMgr.modLabel
      this.editDialogVisible = true
      this.tagName = this.currentData.name
      this.tagDef = this.currentData.tagDef
      this.$nextTick(() => {
        this.$refs.editDialogInput?.focus()
      })
    },
    save () {
      let requestBody = this.currentData
      if (this.currentData.id === 0) {
        requestBody = {
          name: this.tagName,
          tagDef: this.tagDef
        }
      } else {
        requestBody.name = this.tagName
        requestBody.tagDef = this.tagDef
      }
      HTTP.editTag({
        requestBody: requestBody,
        successCallback: () => {
          this.editDialogVisible = false
          this.getTags()
          this.$datablauMessage.success('创建成功')
        },
        finallyCallback: () => {
        }
      })
    },
    deleteTag (currentData) {
      let tips = '确定要删除标签' + currentData.name + '吗？'
      if (this.$isEng) {
        tips = `Are you sure you want to delete the label: ${currentData.name}?`
      }
      this.$DatablauCofirm(tips, this.$v.tagMgr.delLabel, {
        type: 'warning'
      }).then(() => {
        this.currentData = currentData
        HTTP.deleteTag({
          tagId: this.currentData.id,
          successCallback: data => {
            this.getTags()
          }
        })
      }).catch(() => {
        this.$message.info(this.$v.tagMgr.tip_02)
      })
    },
    closeEditDialog () {
      this.editDialogVisible = false
    },
    sortNameMethod (a, b) {
      return a.id - b.id
    }
  },
  watch: {
    keyword (value) {
      this.filterData()
    }
  },
  computed: {
    canSave () {
      return !!_.trim(this.tagName)
    }
  }
}
