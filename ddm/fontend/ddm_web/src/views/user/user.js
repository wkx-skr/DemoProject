import HTTP from '@/resource/http'
import string from '@/resource/utils/string'
import sort from '@/resource/utils/sort'
import _ from 'lodash'
export default {
  data () {
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
      currentRow: null
    }
  },
  mounted () {
    this.getUsers()
  },
  inject: ['refresh'],
  methods: {
    getUsers () {
      HTTP.getUsers({
        successCallback: data => {
          data.forEach(item => {
            data.isEditor = false
          })
          sort.sort(data, 'username')
          data.forEach(user => {
            user.fullName = _.toString(user.firstname) + _.toString(user.lastname)
          })
          this.allData = data
          this.filterData()
          this.getAllEditors()
        }
      })
    },
    filterData () {
      this.filteredData = this.allData.filter(item => {
        return string.matchKeyword(item, this.keyword, 'username', 'fullName')
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
      this.tableData = this.filteredData.slice((this.currentPage - 1) * this.pageSize, (this.currentPage) * this.pageSize)
    },
    handleRowClick (row) {
      this.currentRow = row
      this.dialogBody = _.clone(row)
      this.dialogTitle = `${this.$v.userMgr.tip_01}${row.username}`
      this.dialogVisible = true
    },
    handleSave () {
      HTTP.createOrUpdateUser({
        userInfo: this.dialogBody,
        successCallback: data => {
          this.currentRow = _.clone(this.dialogBody)
          this.dialogVisible = false
        }
      })
    },
    getAllEditors () {
      HTTP.getEditorUsers({
        successCallback: data => {
          data.forEach(item => {
            this.allData.forEach(j => {
              if (item.userId === j.userId) {
                this.$set(j, 'isEditor', true)
              }
            })
          })
        }
      })
    },
    handleChange (row) {
      let tips = ''
      if (row.isEditor) {
        if (this.$isEng) {
          tips = `Are you sure you want to accord ${row.username} edit permission?`
        } else {
          tips = `确定要给与${row.username}编辑权限吗？`
        }
      } else {
        if (this.$isEng) {
          tips = `Are you sure you want to revoke ${row.username} edit permission?`
        } else {
          tips = `确定要撤销${row.username}的编辑权限吗？`
        }
      }
      this.$confirm(tips).then(() => {
        this.postChangeRequest(row)
      }).catch(() => {
        this.$message.info(this.$v.userMgr.tip_02)
        row.isEditor = !row.isEditor
      })
    },
    postChangeRequest (row) {
      HTTP.setEditorUsers({
        userIds: this.allData.filter(item => item.isEditor).map(item => item.userId),
        failureCallback: () => {
          row.isEditor = !row.isEditor
        }
      })
    }
  },
  watch: {
    keyword (value) {
      this.filterData()
    }
  }
}
