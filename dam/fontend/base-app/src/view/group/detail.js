import addUser from './addUser.vue'
import HTTP from '@/http/main'
export default {
  components: { addUser },
  props: ['preData', 'tableData'],
  inject: ['headerProduction'],
  data() {
    const SELAPI = (rule, value, callback) => {
      if (this.selApi.length === 0) {
        callback(new Error('请选择角色编码'))
      } else {
        callback()
      }
    }
    const LIMITNAME = (rule, value, callback) => {
      if (!value) {
        callback(new Error('请选择权限'))
      } else if (this.isEditLimitName) {
        callback(new Error('请确认变更'))
      } else {
        callback()
      }
    }
    return {
      content: {
        roleIds: [],
        userIds: [],
        description: '',
        name: '',
      },
      selectedUserIds: [],
      selectedUsers: null,
      allUsers: [],
      dialogVisible: false,
      dialogVisibles: false,
      rules: {
        name: [
          {
            required: true,
            message:
              this.$t('system.group.name') +
              this.$t('system.group.validator.notEmpty'),
            trigger: 'blur',
          },
        ],
      },
      showUserTable: true,
      treegroups: [
        //      {
        //         "id":6067,
        //         "roleName":"suibian",
        //         "roleFriendlyName":"数据源编辑",
        //         "roleDescription":"",
        //         "roleUrl":"",
        //         "roleMethod":"",
        //         "roleModule":"元数据",
        //         "roleModuleClass":"数据源",
        //         "appName":"DAM"
        //       },
        //       {
        //         "id":6068,
        //         "roleName":"suibian",
        //         "roleFriendlyName":"数据源删除",
        //         "roleDescription":"",
        //         "roleUrl":"",
        //         "roleMethod":"",
        //         "roleModule":"元数据",
        //         "roleModuleClass":"数据源",
        //         "appName":"DAM"
        //       },{
        //         "id":6069,
        //         "roleName":"suibian",
        //         "roleFriendlyName":"报表删除",
        //         "roleDescription":"",
        //         "roleUrl":"",
        //         "roleMethod":"",
        //         "roleModule":"元数据",
        //         "roleModuleClass":"报表",
        //         "appName":"DAM"
        //       },{
        //         "id":6070,
        //         "roleName":"suibian",
        //         "roleFriendlyName":"报表新增",
        //         "roleDescription":"",
        //         "roleUrl":"",
        //         "roleMethod":"",
        //         "roleModule":"元数据",
        //         "roleModuleClass":"报表",
        //         "appName":"DAM"
        //       },
        //       {
        //         "id":6071,
        //         "roleName":"suibian",
        //         "roleFriendlyName":"报表编辑",
        //         "roleDescription":"",
        //         "roleUrl":"",
        //         "roleMethod":"",
        //         "roleModule":"元数据",
        //         "roleModuleClass":"报表",
        //         "appName":"DAM"
        // }
      ],
      checkList: [],
      spanArr: [],
      pos: 0,
      spanArr1: [],
      pos1: 0,
      spanArr2: [],
      pos2: 0,
      treeDes: [],
      checkRoleModule: {},
      checkRoleModuleIndeterminate: {},
      checkRoleModuleClass: {},
      checkRoleModuleClassIndeterminate: {},
      roleModuleList: null,
      roleModuleClassList: null,
      getUser: [],
      activeName: 'access',
      currentPage: 1,
      pageSize: 10,
      total: 0,
      maleImg: 'static/images/male.svg', // 引入男生的图标
      femaleImg: 'static/images/female.svg', // 引入女生的图标
      deleteGetUserArr: [], // 获取到移除掉的数据
      allGetUserData: [], // 存储所有的表格的数据
      groupCount: 0, // 设置编辑的次数
      ifDefaultGroup: false,
      enableEditLimit: false, // 特定键盘事件--操作许可（ctrl + delete）
      showAddLimit: false, // 权限弹窗
      apiList: [], // 所有api
      selApi: [], // 已选择的api
      limitRules: {
        roleModule: [
          { required: true, message: '请选择模块', trigger: 'change' },
        ],
        roleModuleClass: [
          { required: true, message: '请选择功能', trigger: 'change' },
        ],
        roleFriendlyName: [
          {
            required: true,
            trigger: 'change',
            validator: LIMITNAME,
          },
        ],
        roleName: [
          { required: true, message: '请输入角色编码', trigger: 'blue' },
        ],
        selApi: [
          {
            required: true,
            trigger: 'change',
            validator: SELAPI,
          },
        ],
      },
      limitFormData: {
        roleModule: '',
        roleModuleClass: '',
        roleFriendlyName: '',
        roleDescription: '',
        roleName: '',
        roleApis: [],
      },
      roleModuleData: [], // 模块数据
      roleModuleClassData: [], // 对应模块的功能
      roleFriendlyNameData: [], // 对应功能的权限
      isEdit: false, // 编辑
      isDelete: false, // 删除
      isEditLimitName: false, // 编辑状态下->更改权限名称
      limitId: '', // 编辑权限id
      limitTitle: '添加权限',
      limitDelData: '', // 删除权限数据
      editRoleFriendlyName: '', // 编辑状态-model权限数据
    }
  },
  created() {
    this.handleKeyup()
  },
  mounted() {
    if (this.preData) {
      const callback = () => {
        this.prepare()
        this.groupTree()
      }
      this.getAllUsers(callback)
      this.getAllData()
    } else {
      // 权限树
      this.groupTree()
    }
    this.$bus.$on('addUserToGroup', ids => {
      this.content.userIds = ids
      this.dialogVisible = false
      this.getSelectedUsers()
      //		  this.confirm(true);
    })

    if (this.headerProduction.toUpperCase() === 'DAM') {
      this.getAllApi()
    }

    this.$bus.$on('closeAddUserToGroup', () => {
      this.dialogVisible = false
    })
  },

  beforeDestroy() {
    window.removeEventListener('keydown', this.handleKeyUp)
    this.$bus.$off('addUserToGroup')
    this.$bus.$off('closeAddUserToGroup')
    // this.preData = {}
  },
  methods: {
    handleKeyup() {
      let self = this
      let code = 0
      let code2 = 0
      document.onkeydown = function (e) {
        // let evn = e || event || window.event || arguments.callee.caller.arguments[0]
        let evn = e || event || window.event
        let key = evn.keyCode || evn.which || evn.charCode
        if (key === 17) {
          code = 1
        }
        if (key === 46) {
          code2 = 1
        }
        if (code === 1 && code2 === 1) {
          self.enableEditLimit = true
          code = 0
          code2 = 0
        }
      }
      document.onkeyup = () => {
        code = 0
        code2 = 0
      }
    },
    changeIsEdit() {
      if (this.isEditLimitName) {
        this.limitFormData.roleFriendlyName = this.editRoleFriendlyName
        setTimeout(() => {
          this.$refs.limitForm.validateField('roleFriendlyName')
        })
      } else {
        this.editRoleFriendlyName =
          this.limitFormData.roleFriendlyName.split('-')[0]
      }
      this.isEditLimitName = !this.isEditLimitName
    },

    addLimit() {
      this.getRoleModuleData()
      this.showAddLimit = true
      try {
        if (this.$refs.limitForm !== undefined) {
          this.$refs.limitForm.resetFields()
        }
      } catch (e) {
        console.log(e)
      }
      this.limitFormData = {
        roleModule: '',
        roleModuleClass: '',
        roleFriendlyName: '',
        roleDescription: '',
        roleName: '',
        roleApis: [],
      }
      this.limitTitle = '添加权限'
    },
    getRoleModuleData() {
      let moduleMap = new Map()
      let module = []
      this.treegroups.forEach(item => {
        if (!moduleMap.has(item.roleModule)) {
          moduleMap.set(item.roleModule, item)
          module.push(item.roleModule)
        }
      })
      this.roleModuleData = module
    },
    handleClear(level) {
      if (level === 3) {
        this.roleFriendlyNameData = []
      }
      if (level > 2) {
        this.limitFormData.roleModuleClass = '' // 功能
      }
      if (level > 1) {
        this.limitFormData.roleFriendlyName = '' // 权限
      }
      if (!this.isEdit) {
        this.limitFormData.roleName = '' // 权限编码
        this.limitFormData.roleDescription = '' // 描述
        this.limitFormData.roleApis = [] // api
        this.selApi = [] // api
      }
      this.$nextTick(() => {
        if (this.$refs.limitForm !== undefined) {
          try {
            this.$refs.limitForm.clearValidate()
          } catch (e) {
            console.log(e)
          }
        }
      })
    },

    // 切换模块
    changeSelModule(val) {
      let tempArr = []
      this.treegroups.forEach(item => {
        if (val === item.roleModule) {
          if (tempArr.indexOf(item.roleModuleClass) < 0) {
            tempArr.push(item.roleModuleClass)
          }
        }
      })
      this.roleModuleClassData = tempArr
      this.handleClear(3)
    },
    // 切换功能
    changeSelModuleClass(val) {
      let tempArr = []
      this.treegroups.forEach(item => {
        if (val === item.roleModuleClass) {
          if (tempArr.indexOf(item.roleFriendlyName) < 0) {
            tempArr.push({
              roleFriendlyName: item.roleFriendlyName,
              roleName: item.roleName,
            })
          }
        }
      })
      this.roleFriendlyNameData = tempArr
      this.handleClear(2)
    },
    // 切换权限
    changeSelFriendlyName(val) {
      let item = this.treegroups.filter(t => {
        return val === t.roleFriendlyName + '-' + t.roleName
      })
      if (item && item.length) {
        this.limitDelData = item[0].id
        this.limitId = item[0].id
        this.limitFormData.roleDescription = item[0].roleDescription
        this.limitFormData.roleName = item[0].roleName
        this.limitFormData.roleApis = item[0].roleApis || []
        let apiArr = item[0].roleApis
        let tempArr = []
        if (apiArr.length > 0) {
          for (let i in apiArr) {
            let a = apiArr[i]
            for (let j in this.apiList) {
              let api = this.apiList[j]
              if (
                a.apiMethod.toLowerCase() === api.method.toLowerCase() &&
                a.apiServer.toLowerCase() === api.server.toLowerCase() &&
                a.apiUrl.toLowerCase() === api.url.toLowerCase()
              ) {
                tempArr.push(j - 0)
                break
              }
            }
          }
          this.selApi = tempArr
        }
      } else {
        this.limitDelData = ''
        this.limitFormData.limitDelData = ''
        this.handleClear(1)
      }
    },
    // 编辑权限
    editLimit(row) {
      this.changeSelModuleClass(row.roleModuleClass)
      this.showAddLimit = true
      this.$nextTick(() => {
        try {
          if (this.$refs.limitForm !== undefined) {
            this.$refs.limitForm.resetFields()
          }
        } catch (e) {
          console.log(e)
        }
        this.limitTitle = '编辑权限'
        this.isEdit = true
        this.limitFormData.roleModule = row.roleModule
        this.limitFormData.roleModuleClass = row.roleModuleClass
        this.limitFormData.roleDescription = ''
        this.limitFormData.roleFriendlyName = ''
        this.limitFormData.roleName = ''
        this.limitFormData.roleApis = []
        this.selApi = []
      })
    },
    // 删除权限
    delLimit(row) {
      this.showAddLimit = true
      this.limitTitle = '权限删除'
      this.isDelete = true
      this.limitFormData.roleModule = row.roleModule
      this.limitFormData.roleModuleClass = row.roleModuleClass
      this.changeSelModuleClass(row.roleModuleClass)
      this.limitFormData.roleFriendlyName = ''
    },
    closeLimit() {
      this.showAddLimit = false
      setTimeout(() => {
        this.isEdit = false
        this.isDelete = false
        this.isEditLimitName = false
        this.selApi = []
        this.$refs.limitForm.resetFields()
      }, 200)
    },
    saveLimit() {
      this.$refs.limitForm.validate(valid => {
        if (valid) {
          if (this.isEditLimitName) {
            return
          }
          let obj = {
            roleName: this.limitFormData.roleName,
            appName: 'DAM',
            roleFriendlyName: this.limitFormData.roleFriendlyName.includes('-')
              ? this.limitFormData.roleFriendlyName.split('-')[0]
              : this.limitFormData.roleFriendlyName,
            roleDescription: this.limitFormData.roleDescription,
            roleModule: this.limitFormData.roleModule,
            roleModuleClass: this.limitFormData.roleModuleClass,
            roleApis: this.limitFormData.roleApis,
          }
          if (this.isEdit) {
            obj.id = this.limitId.toString()
            this.$http
              .put(this.$user_url + '/role/', obj)
              .then(res => {
                if (res.status === 200) {
                  this.showAddLimit = false
                  this.$message.success('操作成功！')
                  this.treegroups = []
                  this.groupTree()
                  this.resetStatus()
                }
              })
              .catch(e => {
                this.$showFailure(e)
              })
          } else if (this.isDelete) {
            this.$http
              .delete(this.$user_url + '/role/' + this.limitDelData)
              .then(res => {
                if (res.status === 200) {
                  this.showAddLimit = false
                  this.$message.success('操作成功！')
                  this.treegroups = []
                  this.groupTree()
                  this.resetStatus()
                }
              })
              .catch(e => {
                this.$showFailure(e)
              })
          } else {
            this.$http
              .post(this.$user_url + '/role/', obj)
              .then(res => {
                if (res.status === 200) {
                  this.showAddLimit = false
                  this.$message.success('操作成功！')
                  this.treegroups = []
                  this.groupTree()
                  this.resetStatus()
                }
              })
              .catch(e => {
                this.$showFailure(e)
              })
          }
        } else {
          return false
        }
      })
    },
    resetStatus() {
      this.isEdit = false
      this.isDelete = false
      this.isEditLimitName = false
      this.selApi = []
    },
    // 获取所有api
    getAllApi() {
      this.$http
        .get(this.$user_url + '/role/all/api')
        .then(res => {
          if (res.data) {
            this.apiList = res.data.map(item => {
              return {
                urlWidthMethod: item.method + ' ' + item.url,
                ...item,
              }
            })
            // this.apiList = res.data
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    changeApi(api) {
      if (api.length) {
        let temparr = []
        api.forEach(i => {
          temparr.push({
            apiUrl: this.apiList[i].url,
            apiMethod: this.apiList[i].method,
            apiServer: this.apiList[i].server,
          })
          this.limitFormData.roleApis = temparr
        })
      }
    },
    // 根据角色名称判断是否是默认角色
    getIfDefaultGroup() {
      this.ifDefaultGroup = this.content.systemDefault
    },
    initialization() {
      HTTP.initializationDefaultGroup(this.content.id)
        .then(res => {
          this.$message.success('初始化成功')
          this.$bus.$emit('removeTab', this.preData.name)
          this.$bus.$emit('reload')
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    // 编辑进来时：获取到全部的成员列表的数据
    getAllData() {
      this.allGetUserData = []
      let requestBody = {
        currentPage: 1,
        pageSize: 1000000, // 这个目前是写固定了，后续可能要修改，这个地方主要是获取到成员列表的所有数据，然后前端进行分页处理
        roleId: this.preData.id,
      }
      this.$http
        .post(this.$user_url + '/org/groups/page', requestBody)
        .then(res => {
          const rawDataMap = res.data
          this.allGetUserData = rawDataMap.content
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    // 表格合并
    objectSpanMethod({ row, column, rowIndex, columnIndex }) {
      if (columnIndex === 0) {
        const _row = this.spanArr[rowIndex]
        const _col = _row > 0 ? 1 : 0
        return {
          rowspan: _row,
          colspan: _col,
        }
      }
      if (columnIndex === 1 || columnIndex === 2 || columnIndex === 3) {
        const _row = this.spanArr1[rowIndex]
        const _col = _row > 0 ? 1 : 0
        return {
          rowspan: _row,
          colspan: _col,
        }
      }
    },
    uniqueArr(arr) {
      const res = new Map()
      return arr.filter(item => !res.has(item.id) && res.set(item.id, 1))
    },
    // 添加成员按钮
    addUsers() {
      this.$utils.staffSelect
        .start({ filterIds: this.allGetUserData.map(item => item.id) })
        .then(data => {
          this.allGetUserData = this.uniqueArr(this.allGetUserData.concat(data)) // 过滤掉重复的数据
          this.getUser = this.allGetUserData.slice(
            (this.currentPage - 1) * this.pageSize,
            this.currentPage * this.pageSize
          )
          this.total = this.allGetUserData.length
        })
    },
    cancelAddUser() {
      let requestBody = []
      requestBody = this.allGetUserData.map(e => e.id)
      this.$http
        .put(
          this.$user_url + `/usermanagement/groups/${this.preData.id}/users`,
          requestBody
        )
        .then(res => {
          // this.$message.success('添加成功')
          // this.getAllUsers()
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    empty(data) {
      for (var i = 0; i < data.length; i++) {
        for (var j = i + 1; j < data.length; j++) {
          if (data[i] == data[j]) {
            data.splice(j, 1)
            j--
          }
        }
      }
      return data
    },
    prepare() {
      if (this.preData) {
        this.preData.roleIds = []
        this.content = _.cloneDeep(this.preData)
        delete this.content.groupRoles
        this.getUserRoles()
        this.getIfDefaultGroup()
      } else {
        const index = this.$roles.findIndex(item => {
          return item.roleName === 'ROLE_USER'
        })
        this.content.roleIds = [this.$roles[index].userRoleId]
      }
      this.getSelectedUsers()
    },
    // 权限树
    groupTree() {
      const getGroupTree = async () => {
        try {
          let res = null
          res = await HTTP.getAuthByApp()
          const data = []

          // // 需要隐藏的模块
          // const disableModules = {
          //   数据服务: true,
          // }

          // // 数据服务可以连接, 取消隐藏
          // try {
          //   const ddsStatus = await HTTP.getDdsServiceStatus()
          //   if (ddsStatus.data?.ddsEnable) {
          //     disableModules['数据服务'] = false
          //   }
          // } catch (e) {
          //   console.log(e)
          // }
          /* disableModules['元数据'] = !this.$featureMap.FE_META
          disableModules['数据质量'] = !this.$featureMap.FE_QUALITY
          disableModules['数据标准'] = !this.$featureMap.FE_DOMAIN
          disableModules['数据指标'] = !this.$featureMap.FE_MEASURE
          disableModules['数据安全'] = !this.$featureMap.FE_SECURITY
          disableModules['数据资产'] = !this.$featureMap.FE_ASSET
          disableModules['数据服务'] = !this.$featureMap.FE_SERVICE

          if (this.headerProduction.toUpperCase() === 'DDM') {
            // ddm 时, 如果有 dam, 不显示 数据标准
            // 没有 ddm lic, 不显示 数据标准
            disableModules['数据标准'] =
              this.$damEnabled || !this.$store.state.lic.domain
          } else {
            disableModules['数据标准'] = !this.$featureMap.FE_DOMAIN
          } */

          for (let i = 0; i < res.data.children.length; i++) {
            // 如果模块已经隐藏, 跳过循环
            // if (disableModules[res.data.children[i].module]) continue

            data.push(res.data.children[i])
          }
          this.treeDes = data
          this.getSpanArrs(data)
        } catch (e) {
          this.$showFailure(e)
        }
      }

      getGroupTree()
    },
    getSpanArrs(data) {
      for (var i = 0; i < data.length; i++) {
        if (data[i].children != '' && data[i].children.length != 0) {
          this.getSpanArrs(data[i].children)
        } else {
          for (var index = 0; index < data[i].content.length; index++) {
            this.treegroups.push(data[i].content[index])
          }
        }
      }
      this.getSpanArr(this.treegroups)
      setTimeout(() => {
        this.treegroups.forEach(item => {
          this.handleCheckListChange(item.roleModuleClass)
        })
      })
    },
    getSpanArr(data) {
      this.spanArr = []
      this.pos = 0
      this.spanArr1 = []
      this.pos1 = 0
      this.spanArr2 = []
      this.pos2 = 0

      for (var i = 0; i < data.length; i++) {
        if (i === 0) {
          // 如果是第一条记录（即索引是0的时候），向数组中加入１
          this.spanArr.push(1)
          this.spanArr1.push(1)
          this.pos = 0
          this.pos1 = 0
        } else {
          if (data[i].roleModule === data[i - 1].roleModule) {
            // 如果itemCode相等就累加，并且push 0
            this.spanArr[this.pos] += 1
            this.spanArr.push(0)
          } else {
            this.spanArr.push(1)
            this.pos = i
          }
          if (data[i].roleModuleClass === data[i - 1].roleModuleClass) {
            // 如果itemCode相等就累加，并且push 0
            this.spanArr1[this.pos1] += 1
            this.spanArr1.push(0)
          } else {
            this.spanArr1.push(1)
            this.pos1 = i
          }
          // if (data[i].roleModuleClass === data[i - 1].roleModuleClass) {
          //   // 如果itemCode相等就累加，并且push 0
          //   this.spanArr2[this.pos1] += 1;
          //   this.spanArr2.push(1);
          // } else {
          //   this.spanArr2.push(0);
          //   this.pos2 = i;
          // }
        }
      }
    },

    getSelectedUsers() {
      this.selectedUsers = []
      this.selectedUserIds = []
      this.allUsers.forEach(item => {
        if (this.content.userIds.indexOf(item.userId) > -1) {
          this.selectedUsers.push(item)
          this.selectedUserIds.push(item.userId)
        }
      })
    },
    getAllUsers(callback) {
      let requestBody = {
        currentPage: this.currentPage,
        pageSize: this.pageSize,
        roleId: this.preData.id,
      }
      this.$http
        .post(this.$user_url + '/org/groups/page', requestBody)
        .then(res => {
          const rawDataMap = res.data
          this.total = res.data.totalItems
          this.allUsers = []
          this.allUsers = rawDataMap.content
          this.getUser = rawDataMap.content
          this.content.userIds = this.getUser.map(e => e.id)
          if (callback) {
            callback()
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    handleSizeChange(val) {
      this.pageSize = val
      this.currentPage = 1
      // this.getAllUsers()
      this.getUser = this.allGetUserData.slice(
        (this.currentPage - 1) * this.pageSize,
        this.currentPage * this.pageSize
      )
    },
    handleCurrentChange(val) {
      this.currentPage = val
      this.getUser = this.allGetUserData.slice(
        (this.currentPage - 1) * this.pageSize,
        this.currentPage * this.pageSize
      )
      // this.getAllUsers()
    },
    getUserRoles() {
      this.preData.groupRoles.forEach(item => {
        this.content.roleIds.push(item.userRoleId)
      })
      this.checkList = this.content.roleIds
    },

    // 确定按钮
    confirm(remain) {
      this.$refs.content.validate(bool => {
        if (!bool) {
        } else {
          const content = this.content
          content.roleIds = this.checkList
          const request = content
          if (this.preData) {
            // 编辑时判断组件名称的修改
            let contentName = _.trim(this.content.name)
            let nameArr = []
            this.tableData.forEach(item => {
              if (item.name !== this.preData.name) {
                nameArr.push(item.name)
              }
            })
            if (nameArr.indexOf(contentName) > -1) {
              this.$showFailure(`组名[${contentName}]已经存在`)
            } else {
              // update
              this.$http
                .post(
                  this.$user_url +
                    `/usermanagement/groups/${this.preData.id}/onlyRole`,
                  request
                )
                .then(res => {
                  this.$message.success('修改成功')
                  if (remain !== true) {
                    // this.remove()
                    this.$bus.$emit('removeTab', this.preData.name)
                    this.$bus.$emit('reload')
                  } else {
                    this.content.userIds = res.data.userIds
                    this.getSelectedUsers()
                  }
                })
                .catch(e => {
                  this.$showFailure(e)
                })
            }
            this.cancelDeleteUser() // 移除成员列表的数据
            this.cancelAddUser() // 选择成员的接口
          } else {
            // add
            request.userIds = this.getUser.map(e => e.id)
            // this.$http
            //   .post('/user/usermanagement/groups/', request)
            HTTP.createUserGroups(request)
              .then(res => {
                this.$message.success('添加成功')
                // this.remove()
                this.$bus.$emit('removeTab')
                this.$bus.$emit('reload')
              })
              .catch(e => {
                this.$showFailure(e)
              })
          }
        }
      })
    },
    remove() {
      // 编辑内容后才出现弹窗提示，反之就直接返回页面
      if (this.groupCount > 3) {
        this.$DatablauCofirm(
          this.$t('common.info.savePage'),
          this.$t('common.info.title'),
          {
            confirmButtonText: this.$t('common.button.ok'),
            cancelButtonText: this.$t('common.button.cancel'),
            type: 'warning',
          }
        )
          .then(() => {
            this.confirm()
          })
          .catch(() => {
            this.$message({
              type: 'info',
              message: this.$t('common.info.editCancelled'),
            })
            if (this.preData) {
              this.$bus.$emit('removeTab', this.preData.name)
            } else {
              this.$bus.$emit('removeTab')
            }
            this.$bus.$emit('reload')
          })
      } else {
        if (this.preData) {
          this.$bus.$emit('removeTab', this.preData.name)
        } else {
          this.$bus.$emit('removeTab')
        }
        this.$bus.$emit('reload')
      }
      // if (this.preData) {
      //   this.$bus.$emit('removeTab', this.preData.name)
      // } else {
      //   this.$bus.$emit('removeTab')
      // }
      // this.$bus.$emit('reload')
    },
    // 成员列表中的移除按钮，只有点击下方的确定按钮后，才会移除成功
    deleteUser(index, row) {
      this.$message.success('删除成功')
      this.deleteGetUserArr.push(row.id) // 获取到全部移除的数据,先暂时存储起来
      this.getUser.splice(index, 1)
      this.allGetUserData.some((aItem, aIndex) => {
        if (aItem.id === row.id) {
          this.allGetUserData.splice(aIndex, 1)
          return true
        }
      })
      this.total -= 1
      if (this.getUser.length % this.pageSize === 0) {
        this.currentPage = this.currentPage === 1 ? 1 : this.currentPage - 1
      }
      this.getUser = this.allGetUserData.slice(
        (this.currentPage - 1) * this.pageSize,
        this.currentPage * this.pageSize
      )
    },
    // 点击确定按钮后才移除
    cancelDeleteUser() {
      this.deleteGetUserArr.forEach(item => {
        this.$http
          .delete(
            this.$user_url +
              `/usermanagement/groups/${this.preData.id}/users/${item}`
          )
          .then(res => {
            // this.$message.success('删除成功')
          })
          .catch(e => {
            this.$showFailure(e)
          })
      })
    },
    freshTableHeight() {
      this.showUserTable = false
      this.$nextTick(() => {
        this.showUserTable = true
      })
    },
    nameFormatter(row) {
      if (row.fullUserName) {
        return row.fullUserName
      } else {
        return row.name
      }
    },
    prepareRoleModuleList() {
      const roleModuleList = {}
      const roleModuleClassList = {}
      this.treegroups.forEach(item => {
        if (!roleModuleClassList.hasOwnProperty(item.roleModuleClass)) {
          roleModuleClassList[item.roleModuleClass] = []
        }
        roleModuleClassList[item.roleModuleClass].push(item.id)

        if (!roleModuleList.hasOwnProperty(item.roleModule)) {
          roleModuleList[item.roleModule] = []
        }
        if (!roleModuleList[item.roleModule].includes(item.roleModuleClass)) {
          roleModuleList[item.roleModule].push(item.roleModuleClass)
        }
      })
      this.roleModuleClassList = roleModuleClassList
      this.roleModuleList = roleModuleList
    },
    handleCheckRoleModuleChange(rowModule) {
      this.$set(this.checkRoleModuleIndeterminate, rowModule, false)
      if (this.checkRoleModule[rowModule]) {
        this.roleModuleList[rowModule].forEach(item => {
          this.$set(this.checkRoleModuleClass, item, true)
          this.$set(this.checkRoleModuleClassIndeterminate, item, false)
          this.handleCheckRoleModuleClassChangeEnd(item)
        })
      } else {
        this.roleModuleList[rowModule].forEach(item => {
          this.$set(this.checkRoleModuleClass, item, false)
          this.$set(this.checkRoleModuleClassIndeterminate, item, false)
          this.handleCheckRoleModuleClassChangeEnd(item)
        })
      }
    },
    handleCheckRoleModuleClassChange(rowRoleModuleClass) {
      this.$set(
        this.checkRoleModuleClassIndeterminate,
        rowRoleModuleClass,
        false
      )
      this.handleCheckRoleModuleClassChangeFront(rowRoleModuleClass)
      this.handleCheckRoleModuleClassChangeEnd(rowRoleModuleClass)
    },
    handleCheckRoleModuleClassChangeFront(rowRoleModuleClass) {
      for (const key in this.roleModuleList) {
        if (this.roleModuleList[key].includes(rowRoleModuleClass)) {
          const fullCheck = this.roleModuleList[key].every(item => {
            return this.checkRoleModuleClass[item]
          })
          if (fullCheck) {
            this.checkRoleModule[key] = true
            this.checkRoleModuleIndeterminate[key] = false
          } else {
            this.checkRoleModule[key] = false
            this.$set(
              this.checkRoleModuleIndeterminate,
              key,
              this.roleModuleList[key].some(item => {
                return (
                  this.checkRoleModuleClass[item] ||
                  this.checkRoleModuleClassIndeterminate[item]
                )
              })
            )
          }
        }
      }
    },
    handleCheckRoleModuleClassChangeEnd(rowRoleModuleClass) {
      if (this.checkRoleModuleClass[rowRoleModuleClass]) {
        this.roleModuleClassList[rowRoleModuleClass].forEach(item => {
          if (!this.checkList.includes(item)) {
            this.checkList.push(item)
          }
        })
      } else {
        const checkList = []
        const list = this.roleModuleClassList[rowRoleModuleClass]
        this.checkList = _.difference(this.checkList, list)
      }
    },
    handleCheckListChange(rowRoleModuleClass) {
      if (!this.roleModuleList) {
        this.prepareRoleModuleList()
      }
      const rowData = this.treegroups.filter(
        item => item.roleModuleClass === rowRoleModuleClass
      )
      let cnt = 0
      this.checkList.forEach(item => {
        if (rowData.map(item => item.id).includes(item)) {
          cnt++
        }
      })
      this.$set(
        this.checkRoleModuleClass,
        rowRoleModuleClass,
        cnt === rowData.length
      )
      this.$set(
        this.checkRoleModuleClassIndeterminate,
        rowRoleModuleClass,
        cnt > 0 && cnt < rowData.length
      )
      this.handleCheckRoleModuleClassChangeFront(rowRoleModuleClass)
    },
  },
  computed: {
    useDdm() {
      return this.headerProduction?.toUpperCase() === 'DDM'
    },
  },
  watch: {
    selectedUsers: {
      deep: true,
      handler: function (newVal) {
        this.freshTableHeight()
      },
    },
    content: {
      handler(val) {
        if (val) {
          this.groupCount++
        }
      },
      deep: true,
    },
    // 监听权限设置
    treegroups: {
      handler(val) {
        if (val) {
          this.groupCount++
        }
      },
      deep: true,
    },
    // 监听成员列表
    getUser: {
      handler(val) {
        if (val) {
          this.groupCount++
        }
      },
      deep: true,
    },
  },
}
