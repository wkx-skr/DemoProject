export default {
  data() {
    return {
      displayTable: [],
      tableHeight: 300,
      dialogVisible: false,
      detail: {
        returnType: '',
        engine: '',
        database: '',
        functionName: '',
        funcDesc: '',
        parameters: [],
      },
    }
  },
  mounted() {
    setTimeout(() => {
      const height = $('.content-area')[0].offsetHeight
      this.tableHeight = height - 130
    })
    this.getFunctions()
  },
  methods: {
    addFunction() {
      this.detail = {
        returnType: '',
        engine: '',
        database: '',
        functionName: '',
        funcDesc: '',
        parameters: [],
      }
      this.dialogVisible = true
    },
    editFunction(cur) {
      this.detail = cur
      this.dialogVisible = true
    },
    deleteFunction(id) {
      this.$confirm('此操作将永久删除该函数, 是否继续?', '提示', {
        confirmButtonText: this.$t('common.button.ok'),
        cancelButtonText: this.$t('common.button.cancel'),
        type: 'warning',
      })
        .then(() => {
          this.$http
            .delete(this.$url + '/service/me/funcs/' + id)
            .then(res => {
              this.$message.success('删除成功')
              this.getFunctions()
            })
            .catch(e => {
              this.$showFailure(e)
            })
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除',
          })
        })
    },
    getFunctions() {
      this.$http
        .get(this.$url + '/service/me/funcs')
        .then(res => {
          this.displayTable = res.data
          this.$bus.$emit('gotFunctions', res.data)
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    submit() {
      const requestBody = _.clone(this.detail)
      if (!this.detail.funcId) {
        requestBody.funcId = 'F-' + this.$getUniqueId()
      }
      this.$http
        .post(this.$url + '/service/me/funcs', requestBody)
        .then(res => {
          this.dialogVisible = false
          this.getFunctions()
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    removeDomain(item) {
      var index = this.detail.parameters.indexOf(item)
      if (index !== -1) {
        this.detail.parameters.splice(index, 1)
      }
    },
    addDomain() {
      this.detail.parameters.push({
        order: this.detail.parameters.length + 1,
        name: '',
        type: '',
        description: '',
      })
    },
  },
}
