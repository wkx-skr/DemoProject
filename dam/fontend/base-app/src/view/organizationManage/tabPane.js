import HTTP from '@/http/main'
export default {
  props: ['addData'],
  data() {
    return {
      checked: false,
      keyword: '',
      tableLoading: false,
      currentPage: 1,
      pageSize: 20,
      total: 0,
      currentPage2: 1,
      pageSize2: 20,
      total2: 0,
      form: {
        bm: '',
        fullName: '',
        simpleName: '',
        leader: '',
        leaderName: '',
        deputyLeader: '',
        deputyLeaderName: '',
        // toBgnF: '0',
        toLstupdate: '',
      },
      formProps: {
        bm: '',
        deputyLeader: '',
        deputyLeaderName: '',
        englishName: '',
        fullName: '',
        id: '',
        leader: '',
        leaderName: '',
        path: '',
        simpleName: '',
      },
      isEdit: false,
      isEdits: false,
      addId: '',
      showId: '',
      staffData: [],
      activeName: 'first',
      addFormData: {
        likeClause: '',
        state: false,
        toId: '',
        tuNo: '',
        tuCname: '',
        groupId: '',
        organizationName: '',
      },
      addStaffState: false,
      isAdd: false,
      newStaffData: [],
      organizatOptions: [],
      organizatOptions2: [],
      groupOptions: [],
      wholeTreeData: [],
      deleteIndex: null,
      staffLoading: false,
      rules: {
        bm: [
          {
            required: true,
            trigger: 'blur',
            message:
              this.$t('system.organization.property.organizationCode') +
              this.$t('system.organization.validator.isRequired'),
          },
        ],
        fullName: [
          {
            required: true,
            trigger: 'blur',
            message:
              this.$t('system.organization.property.organizationFullName') +
              this.$t('system.organization.validator.isRequired'),
          },
        ],
      },
      toEdit: true,
      isDisabled: true,
      formData: {},
      toOfficer: '',
      toDeputysir: '',
      isSelectOwner: false,
      selectType: null,
      toBm2: '',
      toFullName: '',
      toSimpleName: '',
      toLeader: '',
      toDeputyLeader: '',
      toOrder2: '',
      organizationDelete: [
        'newStaffData',
        'organizatOptions',
        'staffData',
        'wholeTreeData',
      ],
      // toDeputyLeader: '',
      // toLeader: '',
      toPbm: '',
      keywordUsername: '',
      optionKeys: JSON.stringify({
        value: 'valueKey',
        label: 'labelKey',
      }),
      optionsTrue: JSON.stringify([
        {
          valueKey: 'user',
          labelKey: this.$t('system.user.showEnabled'),
        },
      ]),
      showLeftMag: false, // 设置默认展示信息，不可以操作的
      maleImg: 'static/images/male.svg', // 引入男生的图标
      femaleImg: 'static/images/female.svg', // 引入女生的图标
      showEditDialog: false, // 设置树形结构上面出现弹窗
      copyForm: {}, // 将初始值保存下来
    }
  },
  mounted() {
    this.$bus.$on('initData', val => {
      let tempForm = val[0]
      for (let key in this.formProps) {
        if (!tempForm[key]) {
          this.$set(tempForm, key, '')
        }
      }
      this.form = _.cloneDeep(tempForm)
      this.isEdit = false
    })
    // this.getOrganizationOptions();

    this.$bus.$on('showTab', data => {
      if (this.showEditDialog) {
        if (JSON.stringify(this.copyForm) === JSON.stringify(this.form)) {
          this.initShowTab(data)
        } else {
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
              if (this.isEdits) {
                this.editOrganization()
              } else {
                this.save()
              }
            })
            .catch(() => {
              let message = this.$t('common.info.editCancelled')
              this.$message({
                type: 'info',
                message: message,
              })
              this.initShowTab(data)
            })
            .then(() => {
              // this.showEditDialog = false
              this.isAdd = false
            })
        }
      } else {
        this.initShowTab(data)
        // this.showEditDialog = false
        this.isAdd = false
      }
    })
    if (this.addData) {
      this.form = this.addData
    }
    this.$bus.$on('addSame', (data, type) => {
      this.addContent(data, type)
    })
    this.$bus.$on('addNext', (data, type) => {
      this.addContent(data, type)
    })
  },
  beforeDestroy() {
    this.$bus.$off('initData')
    this.$bus.$off('showTab')
    this.$bus.$off('addSame')
    this.$bus.$off('addNext')
    setTimeout(() => {
      this.organizationDelete.forEach(item => {
        if (typeof this[item] === 'object' && this[item]) {
          Object.keys(this[item]).forEach(o => {
            this[item][o] = null
          })
        }
        this[item] = null
      })
      this.$refs.addForm = null
      this.$refs.tabStaff = null
      if (window.CollectGarbage) {
        window.CollectGarbage()
      }
    }, 3000)
  },
  methods: {
    // 初始化点击树形节点获取到的值
    initShowTab(data) {
      this.showLeftMag = false
      this.$refs.addForm.resetFields()
      this.isEdit = false
      this.formData = _.cloneDeep(data)
      this.form = _.cloneDeep(data)
      this.copyForm = _.cloneDeep(data)
      if (data.deputyLeader === '') {
        this.form.deputyLeader = ''
        this.form.deputyLeaderName = ''
        this.toDeputyLeader = ''
      }
      if (data.leader === '') {
        this.form.leader = ''
        this.form.leaderName = ''
        this.toLeader = ''
      }
      this.toPbm = data.bm
      this.currentPage = 1
      this.getTableData(this.form.toId)
      this.backEdit()
      this.showEditDialog = false
    },
    formResetFields() {
      this.$refs.addForm.resetFields()
    },
    clearOwner(type) {
      if (type === 1) {
        this.form.leaderName = ''
        this.form.leader = ''
      } else {
        this.form.deputyLeaderName = ''
        this.form.deputyLeader = ''
      }
    },
    selectOwner(type) {
      if (this.isDisabled) {
        return
      }
      this.$utils.staffSelect.openFromOrganization().then(data => {
        if (type === 1) {
          this.$set(this.form, 'leaderName', data[0].fullUserName)
          this.$set(this.form, 'leader', data[0].username)
          this.toLeader = data[0].fullUserName
        } else {
          this.$set(this.form, 'deputyLeaderName', data[0].fullUserName)
          this.$set(this.form, 'deputyLeader', data[0].username)
          this.toDeputyLeader = data[0].fullUserName
        }
      })
    },
    selectOwner2(type) {
      this.$utils.staffSelect.openFromOrganization(this.staffData.map(e => e.id)).then(data => {
        const response = []
        data.forEach(element => {
          response.push(element.id)
        })
        this.$http
          .post(
            this.$user_url + '/org/organization/' + this.form.id + '/users/add',
            response
          )
          .then(res => {
            this.getTableData()
          })
          .catch(e => {
            this.$showFailure(e)
          })
      })
    },
    editOrganization() {
      this.isEdits = false
      const requestBody = {
        id: this.form.id,
        bm: this.form.bm,
        pbm: this.form.pbm,
        fullName: this.form.fullName,
        simpleName: this.form.simpleName,
        leader: this.form.leader,
        deputyLeader: this.form.deputyLeader,
        // leader: this.form.leaderName,
        // deputyLeader: this.form.deputyLeaderName,
        toLstupdate: new Date(),
      }
      this.$http
        .put(this.$user_url +'/org/organization', requestBody)
        .then(res => {
          this.showId = res.data
          this.$bus.$emit('refreshTree', 'edit', this.form.bm)
          this.$message.success(this.$t('system.organization.info.editSucceed'))
          this.$http
            .get(this.$user_url +'/org/organization/' + this.form.id)
            .then(newData => {
              this.form = _.cloneDeep(newData.data)
            })
            .catch(e => {
              this.$showFailure(e)
            })
          this.backEdit()
        })
        .catch(e => {
          this.$showFailure(e.response.data.rootErrorMessage)
        })
    },
    showOnlyUse(val) {
      this.checked = val
      this.getTableData()
    },
    getTableData() {
      let toEnabled = ''
      if (this.checked === true) {
        toEnabled = 'true'
      } else {
        toEnabled = ''
      }
      const params = {
        orgBm: this.toPbm,
        currentPage: this.currentPage,
        pageSize: this.pageSize,
        fullUsername: this.form.fullName,
        username: this.keywordUsername,
        enabled: toEnabled,
      }
      this.tableLoading = true
      this.$http
        .post(this.$user_url + `/org/groups/page?appName=${HTTP.$appName}`, params)
        .then(res => {
          this.tableLoading = false
          this.staffData = res.data.content
          this.total = res.data.totalItems
          this.$bus.$emit('setTotal', this.total)
        })
        .catch(e => {
          this.$showFailure(e)
          this.tableLoading = false
        })
    },
    save() {
      this.showLeftMag = true
      // this.showEditDialog = false
      const requestBody = {
        bm: this.form.bm,
        pbm: this.toPbm,
        fullName: this.form.fullName,
        simpleName: this.form.simpleName,
        leader: this.form.leader,
        deputyLeader: this.form.deputyLeader,
        englishName: 'admin',
      }
      if (this.form.bm.replace(/\s+/g, '') === '') {
        this.$message.error(
          this.$t('common.placeholder.prefix') +
            this.$t('system.organization.property.organizationCode')
        )
      } else if (this.form.fullName.replace(/\s+/g, '') === '') {
        this.$message.error(
          this.$t('common.placeholder.prefix') +
            this.$t('system.organization.property.organizationFullName')
        )
      } else {
        this.$http
          .post(this.$user_url + '/org/organization', requestBody)
          .then(res => {
            this.isEdit = false
            this.isAdd = false
            this.showId = 'add'
            this.isDisabled = true
            this.$bus.$emit('refreshTree', 'add', this.form.bm)
            this.$message.success(
              this.$t('system.organization.info.organizationAdded')
            )
            this.showLeftMag = false
            this.showEditDialog = false
          })
          .catch(e => {
            this.$showFailure(e.response.data.rootErrorMessage)
          })
      }
    },
    cancel() {
      this.$refs.addForm.resetFields()
      this.isEdit = false
      this.form = _.cloneDeep(this.formData)
      this.isAdd = false
      this.isDisabled = true
      this.showLeftMag = false
      this.showEditDialog = false
    },
    showEdit() {
      this.toEdit = false
      this.isEdits = true
      this.isDisabled = false
      this.showLeftMag = true
      this.showEditDialog = true
    },
    backEdit() {
      this.$refs.addForm.resetFields()
      this.toEdit = true
      this.isDisabled = true
      this.isEdits = false
      this.showLeftMag = false
      this.form = _.cloneDeep(this.formData)
      this.showEditDialog = false
    },
    getData(data) {
      if (data.nodes) {
        data.nodes.forEach(item => {
          this.organizatOptions.push({
            fullName: item.fullName,
            toId: item.toId,
          })
          this.getData(item)
        })
      }
    },
    handleSizeChange(val) {
      this.currentPage = 1
      this.pageSize = val
      this.getTableData()
    },
    handleCurrentChange(val) {
      this.currentPage = val
      this.getTableData()
    },
    handleSizeChange2(val) {
      this.currentPage2 = 1
      this.pageSize2 = val
      this.getAllStaff()
    },
    handleCurrentChange2(val) {
      this.currentPage2 = val
      this.getAllStaff()
    },
    handleClick(val) {
      this.activeName = val.name
    },

    // 切换tab页签阻止属性
    beforeLeaveTab(activeName, oldName) {
      if (oldName === 'first' && this.isEdits) {
        if (JSON.stringify(this.copyForm) === JSON.stringify(this.form)) {
          this.backEdit()
        } else {
          let p = new Promise((resolve, reject) => {
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
                this.editOrganization()
              })
              .catch(() => {
                this.$message({
                  type: 'info',
                  message: this.$t('common.info.editCancelled'),
                })
                this.backEdit()
                return true
              })
          })
          return p
        }
      }
    },
    addContent(data, type) {
      this.toPbm = type ? data.bm : data.pbm // 设置新增同级和下级的区别
      this.isAdd = true
      this.addId = data.toId
      this.addType = type
      this.isEdit = true
      this.isDisabled = false
      this.activeName = 'first'
      this.staffData = []
      this.$refs.addForm.resetFields()
      this.toOfficer = ''
      this.toDeputysir = ''
      this.form.leaderName = ''
      this.form.deputyLeaderName = ''
      this.showLeftMag = true
      this.form.bm = ''
      this.form.fullName = ''
      this.form.simpleName = ''
      // 这是不让机构正职领导和机构副职领导给附带上去
      this.form.leader = ''
      this.form.deputyLeader = ''
      this.showEditDialog = true
    },
  },
  watch: {
    keyword(val) {
      clearTimeout(this.firstTimeout) // 防抖
      this.firstTimeout = setTimeout(() => {
        this.keywordUsername = val
        this.currentPage = 1
        this.getTableData()
      }, 800)
    },
    toOfficer(val) {
      if (!val) {
        this.form.toOfficer = ''
      }
    },
    toDeputysir(val) {
      if (!val) {
        this.form.toDeputysir = ''
      }
    },
    form: {
      deep: true,
      handler: function (newVal) {
        for (let key in this.formProps) {
          if (!newVal[key]) {
            this.$set(this.form, key, '')
          }
        }
      },
    },
  },
}
