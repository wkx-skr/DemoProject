import checkPasswordBox from '@/components/common/checkPasswordBox'

import HTTP from '@/http/main'

export default {
  props: ['preData', 'allRoles'],
  inject: ['headerProduction'],
  components: {
    checkPasswordBox,
  },
  data() {
    const validateUsername = (rule, value, callback) => {
      const uPattern = /^[a-zA-Z0-9_-]{4,100}$/
      if (uPattern.test(value)) {
        callback()
      } else {
        callback(new Error())
      }
    }
    const validateRoles = (rule, value, callback) => {
      if (value.length > 0) {
        callback()
      } else {
        callback(new Error())
      }
    }
    const validatePassword = (rule, value, callback) => {
      const pPattern =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[~!@#$%^&*()_+`\-={}:";'<>?,.\/]).{8,}$/
      if (pPattern.test(value)) {
        callback()
      } else {
        callback(new Error(' '))
      }
    }
    const validateConfirmPassword = (rule, value, callback) => {
      if (value === this.content.password) {
        callback()
      } else {
        callback(new Error())
      }
    }
    const validateDialogConfirmPassword = (rule, value, callback) => {
      // if (this.$auth.ROLE_SUPERUSER || true) {
      if (true) {
        if (value === this.passwordDialog.resetPasswordForm.password) {
          callback()
        } else {
          callback(new Error())
        }
      } else {
        if (value === this.passwordDialog.resetPasswordForm.newPassword) {
          callback()
        } else {
          callback(new Error())
        }
      }
    }
    const validateOldPassword = (rule, value, callback) => {
      if (value === this.passwordDialog.resetPasswordForm.oldPassword) {
        callback(new Error(this.$t('system.user.validator.samePassword')))
      } else {
        callback()
      }
    }
    //    let validateCharType = (rule,value)=>{
    //      console.log([rule,value])
    //    }
    this.BASE_URL = '/user/usermanagement/'
    return {
      bms: '',
      dialogVisible: false,
      roles: [],
      requestRoles: [],
      branch: '',
      treeDatas: [],
      filterText: '',
      content: {
        username: '',
        password: '',
        newPassword: '',
        oldPassword: '',
        confirmPassword: '',
        roleIds: [],
        title: '',
        fullUserName: '',
        gender: '男',
        bm: '',
        tenantId: '',
      },
      // defaultProps:{
      //   children: 'children',
      //   label: 'fullName'
      // },
      rules: {
        username: [
          {
            required: true,
            message:
              this.$t('system.user.loginName') +
              this.$t('system.user.validator.notEmpty'),
            trigger: 'blur',
          },
          {
            min: 3,
            message: this.$t('system.user.validator.nameMinRule'),
            trigger: 'blur',
          },
          {
            max: 128,
            message: this.$t('system.user.validator.nameMaxRule'),
            trigger: 'blur',
          },
          {
            max: 128,
            message: this.$t('system.user.validator.nameMaxRule'),
            trigger: 'change',
          },
        ],
        tenantId: [
          {
            required: true,
            message:
              this.$t('el.select.placeholder') + this.$t('system.user.tenant'),
            trigger: 'change',
          },
        ],
        password: !this.$strongPassword
          ? [
              {
                required: true,
                message:
                  this.$t('system.user.password') +
                  this.$t('system.user.validator.notEmpty'),
              },
            ]
          : [
              {
                required: true,
                message: '',
                // '密码需要同时包括特殊字符、大写字母、小写字母、数字且大于8位',
                trigger: 'blur',
                validator: validatePassword,
              },
              {
                min: 8,
                message: this.$t('system.user.validator.minRule'),
                trigger: 'blur',
              },
              {
                max: 128,
                message: this.$t('system.user.validator.maxRule'),
                trigger: 'blur',
              },
              {
                max: 128,
                message: this.$t('system.user.validator.maxRule'),
                trigger: 'change',
              },
            ],
        confirmPassword: [
          {
            required: true,
            message: this.$t('system.user.validator.inconsistentPassword'),
            trigger: 'blur',
            validator: validateConfirmPassword,
          },
        ],
        fullUserName: [
          {
            required: true,
            message:
              this.$t('common.placeholder.prefix') +
              this.$t('system.user.fullName'),
            trigger: 'blur',
          },
        ],
        emailAddress: [
          {
            required: true,
            message:
              this.$t('common.placeholder.prefix') +
              this.$t('system.user.email'),
            trigger: 'blur',
            // pattern: /^\w+@[a-z0-9]+(\.[a-z]{2,3}){1,2}$/g
          },
          {
            pattern:
              /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
            message: this.$t('system.user.validator.correctEmail'),
            trigger: 'blur',
          },
        ],
        phoneNumber: [
          {
            required: true,
            message:
              this.$t('common.placeholder.prefix') +
              this.$t('system.user.phone'),
            trigger: 'blur',
          },
          // {
          //   // pattern: /^[1][3,4,5,7,8][0-9]{9}|1{11}$/,
          //   // pattern: /^[\s,\d,+,-]{7,11}$/,
          //   pattern:
          //     /^((([0-9]{3,4})?(-|[ ])?\d{7,8})|((\+?)+(\d{2}(-|[ ])?)?[1][3,4,5,7,8][0-9]\d{8}))$/,
          //   message: this.$t('system.user.validator.correctPhone'),
          //   trigger: 'blur',
          // },
        ],
      },
      passwordDialog: {
        dialogFormVisible: false,
        resetPasswordForm: {
          password: '',
          confirmPassword: '',
          oldPassword: '',
          newPassword: '',
          loginPassword: '',
        },
        inputRules: {
          oldPassword: !this.$strongPassword
            ? [
                {
                  required: true,
                  message:
                    this.$t('system.user.oldPass') +
                    this.$t('system.user.validator.notEmpty'),
                },
              ]
            : [
                {
                  max: 128,
                  message: this.$t('system.user.validator.maxRule'),
                  trigger: 'blur',
                },
                {
                  max: 128,
                  message: this.$t('system.user.validator.maxRule'),
                  trigger: 'change',
                },
              ],
          loginPassword: {
            required: true,
            message:
              this.$t('system.user.password') +
              this.$t('system.user.validator.notEmpty'),
          },
          password: !this.$strongPassword
            ? [
                {
                  required: true,
                  message:
                    this.$t('system.user.password') +
                    this.$t('system.user.validator.notEmpty'),
                },
              ]
            : [
                {
                  required: true,
                  message: '',
                  // '密码需要同时包括特殊字符、大写字母、小写字母、数字且大于8位',
                  trigger: 'blur',
                  validator: validatePassword,
                },
                {
                  min: 8,
                  message: this.$t('system.user.validator.minRule'),
                  trigger: 'blur',
                },
                {
                  max: 128,
                  message: this.$t('system.user.validator.maxRule'),
                  trigger: 'blur',
                },
                {
                  max: 128,
                  message: this.$t('system.user.validator.maxRule'),
                  trigger: 'change',
                },
              ],
          newPassword: !this.$strongPassword
            ? [
                {
                  required: true,
                  message:
                    this.$t('system.user.password') +
                    this.$t('system.user.validator.notEmpty'),
                },
                {
                  required: true,
                  validator: validateOldPassword,
                  trigger: 'blur',
                },
              ]
            : [
                {
                  required: true,
                  message: '',
                  // '密码需要同时包括特殊字符、大写字母、小写字母、数字且大于8位',
                  trigger: 'blur',
                  validator: validatePassword,
                },
                {
                  required: true,
                  validator: validateOldPassword,
                  trigger: 'blur',
                },
                {
                  min: 8,
                  message: this.$t('system.user.validator.minRule'),
                  trigger: 'blur',
                },
                {
                  max: 128,
                  message: this.$t('system.user.validator.maxRule'),
                  trigger: 'blur',
                },
                {
                  max: 128,
                  message: this.$t('system.user.validator.maxRule'),
                  trigger: 'change',
                },
              ],
          confirmPassword: [
            {
              required: true,
              message: this.$t('system.user.placeholder.retypePass'),
              trigger: 'blur',
            },
            {
              validator: validateDialogConfirmPassword,
              message: this.$t('system.user.validator.inconsistentPassword'),
              trigger: 'blur',
            },
          ],
        },
      },
      labelPosition: 'top',
      assignedCategories: [],
      dialogRoleOrManage: false, // 设置角色弹窗的展示
      roleTableSelect: [],
      selectionRoleList: [], // 设置选中的角色的展示
      keyword: '',
      tableData: [],
      roleOrManage: true, // 设置默认弹窗的展示是添加角色的
      selectionManageList: [], // 设置选中添加系统的内容
      selectionManageId: [],
      boxWidth: '500px',
      deleteManageList: [], // 移除系统内容的值
      dialogBoxWidth: '525px',
      count: 0, // 设置编辑的次数的次数
      tenantList: [], // 租户list
    }
  },
  beforeMount() {
    this.treeData()
  },
  mounted() {
    // 获取租户列表
    this.$appName === 'DDD' && this.getTenantList()
    if (this.preData) {
      this.$appName === 'DDD' && this.getTenantUserName()
      this.getUserRoles()
      this.getUserModelCategory()
      this.preData.roles = []
      this.content = _.cloneDeep(this.preData)
      if (this.content.bm) {
        setTimeout(() => {
          const tree = JSON.parse(localStorage.getItem('treeDatas'))
          this.deepSearch(this.content.bm, tree)
        }, 300)
        // console.log(this.$refs.tree);
      }
      // console.log(this.filterNode(this.content.bm,this.treeDatas));
      // this.getUserRoles();
      // this.getUserModelCategory();
    } else {
      const index = this.$roles.findIndex(item => {
        return item.roleName === 'ROLE_USER'
      })

      this.requestRoles = [this.$roles[index].userRoleId]
      this.content.roleIds = [this.$roles[index].userRoleId]
    }
    this.tableData = this.dataArr // 设置表格的内容展示
  },
  watch: {
    //   filterText(val) {
    //     this.$refs.tree.filter(val);
    //   }
    keyword(newVal, oldVal) {
      let word = newVal.trim().toLowerCase()
      this.tableData =
        this.dataArr.filter((item, index) => {
          if (this.roleOrManage) {
            return item.name.toLowerCase().includes(word)
          } else {
            let newName =
              item.categoryName + '(' + item.categoryAbbreviation + ')'
            return newName.toLowerCase().includes(word)
          }
        }) || []
      let selection = this.roleOrManage ? this.roles : this.assignedCategories
      let type = this.roleOrManage ? 'role' : 'manage'
      // this.toggleRowChange(type, this.tableData, selection)
    },
    content: {
      handler(val) {
        if (val) {
          this.count++
        }
      },
      deep: true,
    },
    bms: {
      handler(val) {
        if (val) {
          this.count++
        }
      },
      deep: true,
    },
    selectionRoleList: {
      handler(val) {
        if (val) {
          this.count++
        }
      },
      deep: true,
    },
    selectionManageList: {
      handler(val) {
        if (val) {
          this.count++
        }
      },
      deep: true,
    },
  },
  computed: {
    columnDefs() {
      let roleDefs = [
        {
          headerName: this.$t('system.user.roleName'),
          field: 'name',
          tooltipField: 'name',
        },
        {
          headerName: this.$t('system.user.description'),
          field: 'description',
          tooltipValueGetter: 'description',
        },
      ]
      let manageDefs = [
        {
          headerName: this.$t('system.user.categoryName'),
          field: 'categoryName',
          tooltipField: 'categoryName',
        },
        {
          headerName: this.$t('system.user.description'),
          field: 'description',
          tooltipValueGetter: 'description',
        },
      ]
      let arr = this.roleOrManage ? roleDefs : manageDefs
      return arr
    },
    dataArr() {
      // 设置表格中的数据
      return this.roleOrManage ? this.allRoles : this.$modelCategories
    },
    resetName() {
      return this.roleOrManage
        ? this.$t('system.user.addRole')
        : this.$t('system.user.addCategory')
    },
    $appName() {
      // return (this.headerProduction || '').toUpperCase()
      return HTTP.$appName
    },
  },
  methods: {
    /** 设置角色和系统弹窗表格中的复选框内容回显
     * type: 判断是角色还是系统
     * data: 表格的tableData数据
     * selection: 表格选中的复选框内容
     * **/
    toggleRowChange(type, data, selection) {
      this.$nextTick(() => {
        data.forEach(row => {
          this.$refs.tableRole.toggleRowSelection(row, false)
          if (selection.length) {
            if (type === 'role' && selection.indexOf(row.id) > -1) {
              this.$refs.tableRole.toggleRowSelection(row, true)
            } else if (
              type === 'manage' &&
              selection.indexOf(row.categoryId) > -1
            ) {
              this.$refs.tableRole.toggleRowSelection(row, true)
            }
          }
        })
      })
    },
    // 设置添加角色和系统的弹窗展示
    addDialogArr(type) {
      this.keyword = ''
      this.dialogRoleOrManage = true
      this.roleTableSelect = []
      this.roleOrManage = type === 'role'
      this.tableData = this.dataArr
      let selection = this.roleOrManage ? this.roles : this.assignedCategories
      this.toggleRowChange(type, this.tableData, [])
    },
    // 表格中复选框内容选中
    datablauSelectionChanged(para) {
      this.roleTableSelect = para
    },
    // 弹窗确认按钮事件
    // confirmRole() {
    //   let arr = []
    //   let arrId = []
    //   let categoryArr = []
    //   this.roleTableSelect.forEach(item=>{
    //     arr.push(item)
    //     arrId.push(item.id)
    //     categoryArr.push(item.categoryId)
    //   })
    //   if(this.roleOrManage) {
    //     this.selectionRoleList = arr
    //     this.roles = arrId
    //     console.log(arrId, 88888, this.roleTableSelect)
    //   } else {
    //     this.selectionManageList = arr
    //     this.assignedCategories = categoryArr
    //   }
    //   this.dialogRoleOrManage = false
    // },
    uniqueArr(type, arr) {
      const res = new Map()
      if (type === 'role') {
        return arr.filter(item => !res.has(item.id) && res.set(item.id, 1))
      } else if (type === 'manage') {
        return arr.filter(
          item => !res.has(item.categoryId) && res.set(item.categoryId, 1)
        )
      }
    },
    confirmRole() {
      let arr = []
      // this.roles = []
      // this.assignedCategories = []
      if (this.keyword) {
        /* if (this.roleOrManage) {
          this.selectionRoleList = []
        } else {
          this.selectionManageList = []
        } */
        this.roleTableSelect.forEach(item => {
          arr.push(item)
        })
      } else {
        /* if (this.roleOrManage) {
          this.selectionRoleList = []
        } else {
          this.selectionManageList = []
        } */
        this.roleTableSelect.forEach(item => {
          if (this.roleOrManage) {
            this.selectionRoleList.push(item)
          } else {
            this.selectionManageList.push(item)
          }
        })
      }
      if (this.roleOrManage) {
        this.roles = []
        this.selectionRoleList = this.uniqueArr('role', [
          ...this.selectionRoleList,
          ...arr,
        ])
        this.selectionRoleList.forEach(sItem => {
          this.roles.push(sItem.id)
        })
      } else {
        this.assignedCategories = []
        this.selectionManageList = this.uniqueArr('manage', [
          ...this.selectionManageList,
          ...arr,
        ])
        this.selectionManageList.forEach(sItem => {
          this.assignedCategories.push(sItem.categoryId)
        })
      }
      this.dialogRoleOrManage = false
    },
    // 取消事件
    removeRole() {
      this.dialogRoleOrManage = false
    },
    // 角色和系统移除的事件
    removeTag(type, val) {
      let arr = []
      // this.$message.success('移除成功')
      if (type === 'role') {
        this.roles.some((item, index) => {
          if (item === val.id) {
            this.roles.splice(index, 1)
            return true
          }
        })
        this.selectionRoleList.some((sItem, sIndex) => {
          if (sItem.id === val.id) {
            this.selectionRoleList.splice(sIndex, 1)
            return true
          }
        })
      } else {
        this.assignedCategories.some((item, index) => {
          if (item === val.categoryId) {
            this.assignedCategories.splice(index, 1)
            return true
          }
        })
        this.selectionManageList.some((sItem, sIndex) => {
          if (sItem.categoryId === val.categoryId) {
            this.selectionManageList.splice(sIndex, 1)
            return true
          }
        })
        this.deleteManageList.push(val.categoryId)
      }
    },
    treeData() {
      this.$http
        .get(this.$user_url + '/org/organization/tree')
        .then(res => {
          const treeArr = [res.data]
          localStorage.setItem('treeDatas', JSON.stringify(treeArr))
          const data = res.data
          this.treeDatas = [data]
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    // addBm() {
    //   this.$utils.branchSelect.open().then(res => {
    //     this.content.bm = res.bm
    //     this.bms = res.fullName

    //   })
    // },
    deepSearch(data, tree) {
      for (var i = 0; i < tree.length; i++) {
        if (tree[i].bm == data) {
          this.bms = tree[i].fullName
        } else {
          this.deepSearch(data, tree[i].children)
        }
      }
    },

    // renderContent(h, { node, data, store }) {
    //   if(data.bm === '@ROOT'){
    //     return(
    //       <span style="width: 88%;position:relative;">
    //       <span class="icon-i-folder">
    //       <span class="path1"></span>
    //       <span class="path2"></span>
    //       </span>
    //       <span>{(node.label).indexOf('/') != -1 ? (node.label).split('/')[1] : node.label}</span>
    //       <span class='three-point' style="position: absolute;right: 5px;">
    //       <el-dropdown trigger="hover" style='float:right;margin-right:5px' size='mini' on-command={command => this.commandHandle(command, data)}>
    //         <el-dropdown-menu></el-dropdown-menu>
    //       </el-dropdown>
    //       </span>
    //       </span>
    //   );
    //   }else{
    //     return(
    //       <span style="width: 88%;position:relative;">
    //       <span class="icon-i-user">
    //       <span class="path1" style="margin-right:0px;"></span>
    //       <span class="path2"></span>
    //       </span>
    //       &nbsp;
    //   <span>{(node.label).indexOf('/') != -1 ? (node.label).split('/')[1] : node.label}</span>
    //     <span class='three-point' style="position: absolute;right: 5px;">
    //       <el-dropdown trigger="hover" style='float:right;margin-right:5px' size='mini' on-command={command => this.commandHandle(command, data)}>
    //       <el-dropdown-menu></el-dropdown-menu>
    //       </el-dropdown>
    //       </span>
    //       </span>
    //   );
    //   }
    // },

    getUserModelCategory() {
      this.$getUserModelCategory(
        this.preData.username == this.$user.username
          ? null
          : this.preData.username,
        ids => {
          this.selectionManageList = []
          this.assignedCategories = []
          this.assignedCategories = ids

          this.$modelCategories.forEach(item => {
            if (ids.indexOf(item.categoryId) > -1) {
              this.selectionManageList.push(item)
            }
          })
        }
      )
    },
    addBm() {
      this.$utils.branchSelect.open().then(res => {
        // this.content.bm = res.bm
        this.$set(this.content, 'bm', res.bm)
        this.bms = res.fullName
      })
    },

    resetPassword() {
      this.passwordDialog.resetPasswordForm = {
        password: '',
        confirmPassword: '',
      }
      this.passwordDialog.dialogFormVisible = true
    },
    confirmResetPassword() {
      const self = this
      // if (this.$auth.ROLE_SUPERUSER || true) {
      if (true) {
        const obj = {
          newPassword: this.$pwEncrypt(
            this.passwordDialog.resetPasswordForm.password
          ),
          oldPassword: this.$pwEncrypt(
            this.passwordDialog.resetPasswordForm.loginPassword
          ),
          username: this.preData.username,
        }
        this.$refs.resetPasswordForm.validate(bool => {
          if (bool) {
            let url = ''
            // if (this.$appName === 'DDD') {
            //   url = `${HTTP.$dddServerUrl}user/${this.preData.id}/password`
            //   self.$http
            //     .put(url, obj)
            //     .then(res => {
            //       //				self.$message.success('The password has been updated successfully');
            //       self.$message.success(
            //         this.$t('system.user.info.passwordChanged')
            //       )
            //       self.passwordDialog.dialogFormVisible = false
            //     })
            //     .catch(e => {
            //       //				self.$message.error('Failed to reset the password.' + e.message);
            //       // self.$message.error('密码修改失败')
            //       this.$showFailure(e)
            //       console.log(e)
            //     })
            // } else {
            HTTP.updateUserPassword(obj)
              .then(res => {
                self.$message.success('密码修改成功')
                self.passwordDialog.dialogFormVisible = false
              })
              .catch(e => {
                this.$showFailure(e)
              })
            // }
          } else {
          }
        })
      } else {
        const obj = {
          newPassword: this.$pwEncrypt(
            this.passwordDialog.resetPasswordForm.newPassword
          ),
          oldPassword: this.$pwEncrypt(
            this.passwordDialog.resetPasswordForm.oldPassword
          ),
        }
        this.$refs.resetPasswordForm.validate(bool => {
          if (bool) {
            self.$http
              .put(
                self.BASE_URL + 'users/' + this.preData.id + '/password/update',
                obj
              )
              .then(res => {
                //				self.$message.success('The password has been updated successfully');
                self.$message.success(
                  this.$t('system.user.info.passwordChanged')
                )
                self.passwordDialog.dialogFormVisible = false
              })
              .catch(e => {
                //				self.$message.error('Failed to reset the password.' + e.message);
                // self.$message.error('密码修改失败')
                this.$showFailure(e)
                console.log(e)
              })
          } else {
          }
        })
      }
    },
    testConfirmPassword() {
      if (this.content.confirmPassword) {
        this.$refs.content.validateField('confirmPassword')
      }
    },
    subTree() {
      // console.log(1)
    },
    // 获取租户列表
    getTenantList() {
      this.$http
        .get(`${HTTP.$dddServerUrl}user/tenants/all`)
        .then(res => {
          this.tenantList = res.data
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    getTenantUserName() {
      this.$http
        .get(
          `${HTTP.$dddServerUrl}user/tenants/?userName=${this.preData.username}`
        )
        .then(res => {
          this.tenantList.forEach(element => {
            if (element.tenantCode === res.data) {
              this.$set(this.content, 'tenantId', element.id)
              this.count--
            }
          })
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    getUserRoles() {
      this.$http
        .get(
          this.$user_url + '/usermanagement/users/' + this.preData.id + '/roles'
        )
        .then(res => {
          res.data.forEach(item => {
            this.requestRoles.push(item.userRoleId)
          })
        })
        .catch(e => {
          this.$showFailure(e)
        })
      HTTP.getUserGroups(this.preData.id)
        .then(res => {
          this.selectionRoleList = []
          res.data.forEach(item => {
            this.roles.push(item.id)
            this.selectionRoleList.push(item)
          })
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    confirm() {
      this.$refs.content.validate((bool, obj) => {
        if (!bool) {
          return
        }
        const content = _.cloneDeep(this.content)
        content.password = this.$pwEncrypt(content.password)
        content.confirmPassword = this.$pwEncrypt(content.confirmPassword)
        delete content.roles
        const request = {
          userDetail: content,
          userRoles: this.requestRoles,
        }
        if (this.$appName === 'DDD') {
          request.tenant = this.content.tenantId
        }
        if (this.preData) {
          // update
          if (this.$appName === 'DDD') {
            HTTP.updateUserDetailDdd({
              userId: this.preData.id,
              requestBody: request,
            })
              .then(res => {
                const requestBody = {
                  username: this.preData.username,
                  modelCategoryIds: this.assignedCategories,
                  appName: 'DAM',
                  cleanOldCategories: false,
                }
                return HTTP.addUserToGroups(requestBody)
              })
              .then(res => {
                HTTP.updateUserGroups(this.preData.id, this.roles).then(res => {
                  this.$message.success(this.$t('system.user.info.changed'))
                  this.$bus.$emit('removeTab', this.preData.username)
                  this.$bus.$emit('reload')
                })
              })
              .catch(e => {
                this.$showFailure(e)
              })
          } else {
            HTTP.updateUserDetail({
              userId: this.preData.id,
              requestBody: request,
            })
              .then(res => {
                if (this.$appName !== 'DDM') {
                  const requestBody = {
                    username: this.preData.username,
                    modelCategoryIds: this.assignedCategories,
                    // todo --zl 需要知道是哪个产品 11111
                    appName: 'DAM',
                    cleanOldCategories: false,
                  }
                  return HTTP.addUserToGroups(requestBody)
                } else {
                  return new Promise((resolve, reject) => {
                    resolve()
                  })
                }
              })
              .then(res => {
                HTTP.updateUserGroups(this.preData.id, this.roles).then(res => {
                  this.$message.success(this.$t('system.user.info.changed'))
                  this.$bus.$emit('removeTab', this.preData.username)
                  this.$bus.$emit('reload')
                })
              })
              .catch(e => {
                this.$showFailure(e)
              })
          }
        } else {
          let userId = ''
          let url = ''
          // add
          if (this.$appName === 'DDD') {
            url = `${HTTP.$dddServerUrl}user/create`
          } else {
            url = this.$user_url + '/usermanagement/users/'
          }
          this.$http
            .post(url, request)
            .then(res => {
              userId = res.data.userId
              if (this.$appName !== 'DDM') {
                const requestBody = {
                  username: res.data.username,
                  modelCategoryIds: this.assignedCategories,
                  appName: 'DAM',
                  cleanOldCategories: false,
                }
                return HTTP.addUserToGroups(requestBody)
              } else {
                return new Promise((resolve, reject) => {
                  resolve()
                })
              }
            })
            .then(res => {
              return HTTP.updateUserGroups(userId, this.roles)
            })
            .then(res => {
              this.$message.success(
                this.content.username + this.$t('system.user.info.appended')
              )
              // this.remove()
              this.$bus.$emit('removeTab')
              this.$bus.$emit('reload')
            })
            .catch(e => {
              this.$showFailure(e.response.data.rootErrorMessage)
            })
        }
      })
    },
    //  取消按钮的事件
    remove() {
      if (this.preData) {
        // 进入编辑页面
        if (this.count > 4) {
          this.dialogDetail()
        } else {
          this.removeDetail()
        }
      } else {
        // 进入新增页面
        if (this.count > 1) {
          this.dialogDetail()
        } else {
          this.removeDetail()
        }
      }
    },
    dialogDetail() {
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
          this.removeDetail()
        })
    },
    removeDetail() {
      if (this.preData) {
        this.$bus.$emit('removeTab', this.preData.username)
      } else {
        this.$bus.$emit('removeTab')
      }
      this.$bus.$emit('reload')
    },
  },
}
