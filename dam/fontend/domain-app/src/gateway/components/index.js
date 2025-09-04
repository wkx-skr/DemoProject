import DatabaseType from '@/components/dataSource/DatabaseType.vue'
export default {
  components: {
    DatabaseType,
  },
  data() {
    return {
      nameType: '自定义用户登录',
      dataSource: [],
      allDataSource: [], // 透明网关数据源
      tableData: [],
      currentPage: 1,
      pageSize: 20,
      total: 0,
      detailDialog: false,
      detailTitle: '',
      addDialog: false,
      editDialog: false,
      dialogTitle: '',
      form: {
        groupId: '', // 网关组id
        gatewayType: 'DATAMASKING_GATEWAY',
        name: '', // 网关名字
        modelId: '', // 数据源id
        databaseName: '', // 数据源名字
        port: '', // 端口
        custom: true,
        serviceUsername: '',
        servicePassword: '',
        state: true,
      },
      editForm: {
        name: '',
        gatewayType: '',
        serviceUsername: '',
        servicePassword: '',
        custom: false,
        databaseName: '',
        port: '',
        state: true,
      },
      isDisabled: false,
      curId: '',
      loading: false,
      showTeam: false,
      teamData: [],
      teamSize: 10,
      teamPage: 1,
      teamTotal: 0,
      showStatus: false,
      statusData: [],
      curStatusData: [],
      statusSize: 10,
      statusPage: 1,
      statusTotal: 0,
    }
  },
  watch: {
    'form.custom'(state) {
      if (state) {
        this.nameType = '自定义用户登录'
      } else {
        this.nameType = 'DAM用户登录'
      }
    },
  },
  mounted() {
    this.getList()
    this.getDataSource()
    this.getTeam()
  },
  methods: {
    tableRowClassName({ row, rowIndex }) {
      row.index = rowIndex
    },
    changeType(type) {
      if (this.addDialog) {
        this.form.gatewayType = type
      }
    },
    teamManage() {
      this.teamPage = 1
      this.getTeam()
      this.showTeam = true
    },
    closeTeam() {
      this.showTeam = false
    },
    getTeam() {
      // const params = {
      //   search: '',
      //   order_by: '',
      //   is_asc: false,
      //   current_page: this.teamPage,
      //   page_size: this.teamSize,
      // }
      this.$http
        .get(this.$url + '/service/dataSecurity/group/page')
        .then(data => {
          data.data.map(item => {
            item.edit = true
          })
          this.teamData = data.data
          // this.teamTotal = data.data.length
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    addTeam() {
      const newMap = {
        code: '',
        name: '',
        edit: false,
      }
      this.teamData.push(newMap)
    },
    changeInput(val, row) {
      if (val) {
        $('#group-name-' + row.index).removeClass('error-input')
      }
    },
    changeInputCode(val, row) {
      if (val) {
        $('#group-code-' + row.index).removeClass('error-input')
      }
    },
    editTeam(row) {
      if (row.edit) {
        // 编辑
        this.teamData.map(item => {
          if (item.id === row.id) {
            item.edit = false
          }
        })
      } else {
        // 保存
        if (!row.name) {
          $('#group-name-' + row.index).addClass('error-input')
          // this.$blauShowFailure('请填写完整信息')
        }
        if (!row.code) {
          $('#group-code-' + row.index).addClass('error-input')
        }
        if (row.name && row.code) {
          if (row.id) {
            const params = {
              code: row.code,
              name: row.name,
              id: row.id,
            }
            this.$http
              .post(this.$url + '/service/dataSecurity/group/update', params)
              .then(data => {
                this.teamPage = 1
                this.getTeam()
                this.getList()
              })
              .catch(e => {
                this.$showFailure(e)
              })
          } else {
            const params = {
              code: row.code,
              name: row.name,
            }
            this.$http
              .post(this.$url + '/service/dataSecurity/group/create', params)
              .then(data => {
                this.teamPage = 1
                this.getTeam()
              })
              .catch(e => {
                this.$showFailure(e)
              })
          }
        }
      }
    },
    deleteTeam(row) {
      if (row.id) {
        this.$DatablauCofirm(`确认要删除吗？`).then(() => {
          this.$http
            .delete(this.$url + '/service/dataSecurity/group/delete/' + row.id)
            .then(data => {
              this.$blauShowSuccess('删除成功')
              this.teamPage = 1
              this.getTeam()
            })
            .catch(e => {
              this.$showFailure(e)
            })
        })
      } else {
        this.teamData.splice(row.index, 1)
        // this.$blauShowSuccess('请先保存', 'warning')
      }
    },
    query() {
      this.$router.push({
        name: 'unifiedQuery',
      })
    },
    audit() {
      this.$router.push({
        name: 'ipSearch',
      })
    },
    getList() {
      this.loading = true
      this.$http
        .get(this.$url + '/service/dataSecurity/page')
        .then(data => {
          this.loading = false
          data.data.map(item => {
            if (item.enable == 1) {
              item.state = true
            } else {
              item.state = false
            }
          })
          this.tableData = data.data
          // this.total = data.data.totalItems
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    getDataSource() {
      this.$http
        .get(this.$url + '/service/models/fromre/')
        .then(data => {
          const noTypeList = [
            'EXCEL',
            'YONGHONG',
            'FINE',
            'FINE_REPORT',
            'DAVINCI',
            'SMARTBI',
            'COGNOS',
            'DATADICTIONARY',
            'SMBSHAREFILE',
            'SQLSERVER',
            'MONGODB',
            'ES',
          ] // 透明网关过滤出这些数据源
          this.allDataSource = data.data.filter(item => {
            return noTypeList.indexOf(item.type.toUpperCase()) === -1
          })
          this.dataSource = data.data.filter(item => {
            // 目前数据库只支持MYSQL,ORACLE,HIVE
            return (
              item.type.toUpperCase() === 'MYSQL' ||
              // item.type.toUpperCase() === 'ORACLE' ||
              item.type.toUpperCase() === 'HIVE'
            )
          })
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    handleAdd() {
      this.teamPage = 1
      this.getTeam()
      this.dialogTitle = '新增安全网关'
      this.addDialog = true
    },
    getStatus() {
      this.statusData = []
      this.$http
        .get(this.$url + '/service/dataSecurity/server')
        .then(res => {
          let newMap = {}
          this.statusTotal = res.data.length
          res.data.map(item => {
            const newArr = item.split('_')
            newMap.system = newArr[0]
            newMap.name = newArr[1]
            this.statusData.push(newMap)
          })
          this.curStatusData =
            this.statusData.slice(
              this.statusSize * (this.statusPage - 1),
              this.statusSize * this.statusPage
            ) || []
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    handleStatus() {
      this.showStatus = true
      this.getStatus()
    },
    handleSelectionChange() {},
    handleState(row) {
      this.$http
        .post(
          this.$url + `/service/dataSecurity/enable/${row.id}/${row.enable}`
        )
        .then(data => {
          if (row.enable === 1) {
            this.$blauShowSuccess('网关已关闭')
          } else {
            this.$blauShowSuccess('启动成功')
          }
          this.getList()
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    getDetail(row, flag) {
      this.$http
        .get(this.$url + '/service/dataSecurity/' + row.id)
        .then(data => {
          data.data.state = data.data.enable === 1
          this.editForm = data.data
          this.teamData.map(item => {
            if (item.groupId === data.data.groupId) {
              this.editForm.name = item.name
            }
          })
          if (flag) {
            this.editDialog = true
          } else {
            this.detailDialog = true
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    handleClose() {
      this.detailDialog = false
      this.$refs.editForm.resetFields()
      this.editForm.custom = false
    },
    detail(row) {
      console.log(row)
      this.detailTitle = row.name
      this.editForm = row
      // this.getDetail(row, false)
      this.detailDialog = true
    },
    edit(row) {
      this.curId = row.id
      this.dialogTitle = '编辑安全网关'
      this.editForm = row
      this.editDialog = true
    },
    deleteObject(row) {
      this.$DatablauCofirm(`确认要删除吗？`).then(() => {
        this.$http
          .delete(this.$url + '/service/dataSecurity/delete/' + row.id)
          .then(data => {
            this.getList()
          })
          .catch(e => {
            this.$showFailure(e)
          })
      })
    },
    handleSizeChange(size) {
      this.currentPage = 1
      this.pageSize = size
      this.getList()
    },
    handleCurrentChange(page) {
      this.currentPage = page
      this.getList()
    },
    handleTeamSizeChange(size) {
      this.teamPage = 1
      this.teamSize = size
      this.getTeam()
    },
    handleTeamCurrentChange(page) {
      this.teamPage = page
      this.getTeam()
    },

    handleStatusSizeChange(size) {
      this.statusPage = 1
      this.statusSize = size
      this.getStatus()
    },
    handleStatusCurrentChange(page) {
      this.statusPage = page
      this.getStatus()
    },
    resetEditForm(formName) {
      this.editDialog = false
      this.$refs[formName].resetFields()
      this.editForm.custom = false
    },
    handleEditSure(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          let params = {
            id: this.editForm.id,
            name: this.editForm.name,
            gatewayType: this.editForm.gatewayType,
            groupId: this.editForm.groupId,
            enable: this.editForm.state ? 1 : 0,
          }
          if (
            this.editForm.custom &&
            this.editForm.gatewayType !== 'PROXY_GATEWAY'
          ) {
            params.serviceUsername = this.editForm.serviceUsername
            params.servicePassword = this.editForm.servicePassword
          }
          this.$http
            .post(
              this.$url + `/service/dataSecurity/update/${this.curId}`,
              params
            )
            .then(data => {
              this.getList()
              this.editForm.custom = false
              this.editDialog = false
            })
            .catch(e => {
              this.$showFailure(e)
            })
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    handleSure(formName) {
      let params = {}
      this.$refs[formName].validate(valid => {
        if (valid) {
          const testPort = /^[1-9]\d*|0$/
          if (!testPort.test(this.form.port)) {
            this.$datablauMessage({
              message: '端口号格式不对',
              type: 'error',
            })
            return
          }
          if (this.form.port > 65535) {
            this.$datablauMessage({
              message: '端口号不能大于65535',
              type: 'error',
            })
            return
          }
          if (this.form.port < 1000) {
            this.$datablauMessage({
              message: '端口号不能小于1000',
              type: 'error',
            })
            return
          }
          this.allDataSource.map(item => {
            if (item.modelId == this.form.modelId) {
              this.form.databaseName = item.definition
            }
          })
          this.dataSource.map(item => {
            if (item.modelId == this.form.modelId) {
              this.form.databaseName = item.definition
            }
          })
          this.form.enable = this.form.state ? 1 : 0
          if (!this.form.custom) {
            params = {
              ...this.form,
              servicePort: this.form.port,
            }
            delete params.serviceUsername
            delete params.servicePassword
          } else {
            params = {
              ...this.form,
              servicePort: this.form.port,
            }
          }
          this.$http
            .post(this.$url + '/service/dataSecurity/create', params)
            .then(data => {
              this.$refs[formName].resetFields() // 清空form表单数据
              this.form.state = true
              this.getList()
              this.addDialog = false
            })
            .catch(e => {
              this.$showFailure(e)
            })
        } else {
          return false
        }
      })
    },
    resetForm(formName) {
      this.addDialog = false
      this.$refs[formName].resetFields()
      this.form.state = true
      this.form.custom = true
    },
  },
}
