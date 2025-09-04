import DatabaseType from '@/components/dataSource/DatabaseType.vue'
import { datasourceList } from '@/view/dataSecurity/util/util.js'
import API from '@/view/gateway/utils/api'
import { delObjMethod } from '@/view/dataSecurity/util/util.js'
export default {
  components: {
    DatabaseType,
  },
  data() {
    return {
      listShow: true,
      nameType: '自定义用户登录',
      dataSource: [],
      allDataSource: [], // 透明网关数据源
      tableData: null,
      currentPage: 1,
      pageSize: 20,
      total: 0,
      detailDialog: false,
      detailTitle: '',
      addDialog: false,
      editDialog: false,
      dialogTitle: '',
      gatherList: [],
      allGatherList: [],
      form: {
        groupId: '', // 网关组id
        name: '', // 网关名字
        datasourceId: '', // 采集名称id
        modelId: '', // 数据源id
        modelName: '', // 数据源名字
        port: '', // 端口
        custom: true,
        serviceUsername: '',
        servicePassword: '',
        state: true,
      },
      editForm: {
        name: '',
        serviceUsername: '',
        servicePassword: '',
        custom: false,
        modelName: '',
        datasourceId: '',
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
    this.getGatherList()
    this.getTeam()
  },
  methods: {
    canEdit(row) {
      return row.edit || Boolean(row.id)
    },
    tableRowClassName({ row, rowIndex }) {
      row.index = rowIndex
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
      API.gatewayGroupListApi()
        .then(res => {
          res.data.map(item => {
            item.edit = true
          })
          this.teamData = res.data
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
          // this.$datablauMessage.error('请填写完整信息')
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
            API.updateGatewayGroupApi(params)
              .then(data => {
                this.$datablauMessage.success('编辑成功')
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
            API.newGatewayGroupApi(params)
              .then(data => {
                this.$datablauMessage.success('新建成功')
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
        const delParams = {
          this: this,
          objName: '网关组',
          type: 'single',
          name: row.name,
        }
        delObjMethod(delParams).then(() => {
          API.delGatewayGroupListApi(row.id)
            .then(data => {
              this.$datablauMessage.success('删除成功')
              this.teamPage = 1
              this.getTeam()
            })
            .catch(e => {
              this.$showFailure(e)
            })
        })
      } else {
        this.teamData.splice(row.index, 1)
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
      API.gatewayListApi()
        .then(data => {
          this.listShow = true
          this.loading = false
          data.data.map(item => {
            item.lable = item.name
            if (item.enable == 1) {
              item.state = true
            } else {
              item.state = false
            }
          })
          this.tableData = data.data || []
        })
        .catch(e => {
          this.listShow = false
          this.loading = false
          this.$showFailure(e)
        })
    },
    // 查询采集源
    getGatherList() {
      API.realAataSourceListApi()
        .then(res => {
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
          const data = res.data.data
          this.allGatherList = data.filter(item => {
            return noTypeList.indexOf(item.type.toUpperCase()) === -1
          })
          let newList = []
          data.filter(item => {
            // 目前数据库只支持的类型
            const type = item.type.toUpperCase()
            const flag = datasourceList().some(v => type === v.value)
            if (flag) {
              newList.push(item)
            }
          })
          this.gatherList = newList
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    handleAdd() {
      this.teamPage = 1
      this.getTeam()
      this.resetFormData()
      this.dialogTitle = '新建安全网关'
      this.addDialog = true
    },
    resetFormData() {
      this.form = {
        groupId: '', // 网关组id
        name: '', // 网关名字
        modelId: '', // 数据源id
        modelName: '', // 数据源名字
        datasourceId: '',
        port: '', // 端口
        custom: true,
        serviceUsername: '',
        servicePassword: '',
        state: true,
      }
    },
    handleSelectionChange() {},
    handleState(row) {
      this.$http
        .post(`/datasecurity/dataSecurity/enable/${row.id}/${row.enable}`)
        .then(data => {
          if (row.enable === 1) {
            this.$datablauMessage.success('网关已关闭')
          } else {
            this.$datablauMessage.success('启动成功')
          }
          this.getList()
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    handleClose() {
      this.detailDialog = false
      // this.$refs.editForm.resetFields()
      // this.editForm.custom = false
    },
    detail(row) {
      this.detailTitle = row.name
      this.editForm = row
      this.detailDialog = true
    },
    edit(row) {
      this.curId = row.id
      this.dialogTitle = '编辑安全网关'
      this.editForm = row
      this.editDialog = true
    },
    deleteObject(row) {
      const delParams = {
        this: this,
        objName: '安全网关',
        type: 'single',
        name: row.name,
      }
      delObjMethod(delParams).then(() => {
        API.delGatewayListApi(row.id)
          .then(data => {
            this.$datablauMessage.success('删除成功')
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
    async resetEditForm(formName) {
      await this.getList()
      this.editDialog = false
      // this.$refs[formName].resetFields()
      this.editForm.custom = false
    },
    handleEditSure(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          let params = {
            id: this.editForm.id,
            name: this.editForm.name,
            groupId: this.editForm.groupId,
            enable: this.editForm.state ? 1 : 0,
          }
          if (this.editForm.custom) {
            params.serviceUsername = this.editForm.serviceUsername
            params.servicePassword = this.editForm.servicePassword
          }
          API.updateGatewayApi({ id: this.curId, params })
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
          this.allGatherList.map(item => {
            if (item.modelId == this.form.modelId) {
              this.form.modelName = item.definition
              this.form.datasourceId = item.datasourceId
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
          API.newGatewayApi(params)
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
    exportJdbc() {
      const url = '/datasecurity/dataSecurity/download/driver'
      this.$downloadFile(url)
      // API.exportJdbcApi()
      //   .then(res => {
      //     this.$bus.$emit('getTaskJobResult', res.data, 'export')
      //   })
      //   .catch(e => {
      //     this.$showFailure(e)
      //   })
    },
  },
}
