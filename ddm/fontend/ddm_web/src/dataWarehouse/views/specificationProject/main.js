export default {
  data () {
    return {
      projectList: [],
      dialogVisible: false,
      page: {
        current: 1,
        size: 20,
        count: 0
      },
      formData: {
        typeName: '',
        description: '',
        defaultId: null,
        policyId: null,
        status: 1
      },
      rules: {
        typeName: {
          required: true,
          message: '请输入项目类型',
          trigger: 'blur'
        },
        description: {
          required: true,
          message: '请输入类型描述',
          trigger: 'blur'
        },
        defaultId: {
          required: true,
          message: '请选择模型策略',
          trigger: 'change'
        },
        policyId: {
          required: true,
          message: '请选择程序策略',
          trigger: 'change'
        },
        status: {
          required: true,
          message: '请选择是否开启',
          trigger: 'change'
        }
      },
      defaultOptions: [],
      policyOptions: [],
      selectedOut: [],
      disabledForm: false
    }
  },
  mounted () {
    this.getProjectList()
    this.getDefaultOptions()
    this.getPolicyOptions()
  },
  methods: {
    getDefaultOptions () {
      this.$http.post(`${this.$ddmUrl}/rules/groups?currentPage=1&pageSize=9999`).then(res => {
        this.defaultOptions = res.data.content
      }).catch(err => {
        this.$showFailure(err)
      })
    },
    getPolicyOptions () {
      this.$http.get(`${this.$dddUrl}/policy/list?currentPage=1&pageSize=999`).then(res => {
        this.policyOptions = res.data.content
      }).catch(err => {
        this.$showFailure(err)
      })
    },
    openCreateProject () {
      this.dialogVisible = true
      this.$refs.form.resetFields()
      this.formData = {
        typeName: '',
        description: '',
        defaultId: null,
        policyId: null,
        status: 1
      }
    },
    darkClick (row, type) {
      this.dialogVisible = true
      this.formData = row
      if (type) {
        this.disabledForm = true
      } else {
        this.disabledForm = false
      }
    },
    handleClose () {
      this.dialogVisible = false
      this.$refs.form.resetFields()
    },
    addProject () {
      let obj = this.formData
      this.$refs.form.validate(valid => {
        if (valid) {
          if (this.formData.id) {
            this.updatedProject(this.formData, 'edit')
          } else {
            this.$http.post(`${this.$dddUrl}/project/type/add`, this.formData).then(res => {
              this.$blauShowSuccess('新建成功')
              this.getProjectList()
              this.handleClose()
            }).catch(err => {
              this.$showFailure(err)
            })
          }
        }
      })
    },
    updatedProject (data, type) {
      this.$http.put(`${this.$dddUrl}/project/type/update`, data).then(res => {
        this.$blauShowSuccess('修改成功')
        this.getProjectList()
        if (type) {
          this.handleClose()
        }
      }).catch(e => {
        this.$showFailure(e)
      })
    },
    handleDelete () {
      let arr = []
      this.selectedOut.forEach(element => {
        arr.push(element.id)
      })
      this.$http.delete(`${this.$dddUrl}/project/type/delete?ids=${arr.join(',')}`).then(res => {
        this.$blauShowSuccess('删除成功')
        this.getProjectList()
      }).catch(err => {
        this.$showFailure(err)
      })
    },
    handleSizeChange (val) {
      this.page.size = val
      this.page.current = 1
      this.getProjectList()
    },
    handleCurrentChange (current) {
      this.page.current = current
      this.getProjectList()
    },
    handleSelectionChange (selection) {
      this.selectedOut = selection
    },
    changeValue (row) {
      this.updatedProject(row)
    },
    getProjectList () {
      this.$http.get(`${this.$dddUrl}/project/type/list?currentPage=${this.page.current}&pageSize=${this.page.size}`).then(res => {
        this.projectList = res.data.content
        this.page.count = res.data.totalItems
      }).catch(err => {
        this.$showFailure(err)
      })
    }
  }
}
