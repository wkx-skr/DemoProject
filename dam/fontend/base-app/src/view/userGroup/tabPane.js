export default {
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
        groupName: null,
        note: null,
        creator: null,
        createTime: null,
        updater: null,
        updateTime: null,
      },
      groupData: [],
      addFormData: {
        likeClause: '',
        state: false,
        toId: '',
        tuNo: '',
        tuCname: '',
        groupId: '',
        organizationName: '',
      },
      // dialogVisible: false,
      newStaffData: [],
      selectArr: [],
      organizatOptions: [],
      allGroup: [],
      creator: '',
      updater: '',
      staffLoading: false,
      userDelete: ['groupData', 'newStaffData', 'organizatOptions'],
      editWholeTreeData: false,
      isDisable: false,
      isDisableds: false,
      isIEState: false,
      activeName: 'first',
      optionKeys: JSON.stringify({
        value: 'valueKey',
        label: 'labelKey',
      }),
      optionsTrue: JSON.stringify([
        {
          valueKey: 'user',
          labelKey: this.$t('system.userGroup.showUserInUse'),
        },
      ]),
      maleImg: 'static/images/male.svg', // 引入男生的图标
      femaleImg: 'static/images/female.svg', // 引入女生的图标
      isShowTooltip: true,
    }
  },
  mounted() {
    this.$bus.$on('initStaffGroup', val => {
      this.allGroup = val
      this.form = val[0]
      // this.getAllStaff();
    })
    this.$bus.$on('showUserGroup', val => {
      this.form = val
      this.currentPage = 1
      this.getAllStaff()
    })
    this.$bus.$on('editWholeTree', val => {
      if (val > 0) {
        this.editWholeTreeData = true
      } else {
        this.editWholeTreeData = false
      }
    })
    if (!!window.ActiveXObject || 'ActiveXObject' in window) {
      this.isIEState = true
    } else {
      this.isIEState = false
    }
  },
  beforeDestroy() {
    this.$bus.$off('initStaffGroup')
    this.$bus.$off('showUserGroup')
    setTimeout(() => {
      this.userDelete.forEach(item => {
        if (typeof this[item] === 'object' && this[item]) {
          Object.keys(this[item]).forEach(o => {
            this[item][o] = null
          })
        }
        this[item] = null
      })
      if (window.CollectGarbage) {
        window.CollectGarbage()
      }
    }, 3000)
  },
  methods: {
    inputOnMouserOver(event) {
      let target = event.target
      if (target.offsetWidth < target.scrollWidth) {
        this.isShowTooltip = false
      } else {
        this.isShowTooltip = true
      }
    },
    deleteStaffGroup() {
      this.isDisableds = true
      this.$DatablauCofirm(
        this.$t('system.userGroup.delConfirm'),
        this.$t('system.userGroup.tips'),
        {
          confirmButtonText: this.$t('common.button.ok'),
          cancelButtonText: this.$t('common.button.cancel'),
          type: 'warning',
          closeOnClickModal: false,
        }
      )
        .then(() => {
          this.$http
            .delete(this.$user_url + `/org/groups/${this.form.id}`)
            .then(res => {
              this.$refs.groupForm.resetFields()
              this.$bus.$emit('refreshGroupTree')
              this.$message.success(this.$t('system.userGroup.delSucceed'))
            })
            .catch(e => {
              this.$showFailure(e)
            })
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: this.$t('system.userGroup.cancelDel'),
          })
        })
      setTimeout(() => {
        this.isDisableds = false
      }, 3000)
    },
    getData(data) {
      if (data.nodes) {
        data.nodes.forEach(item => {
          this.organizatOptions.push({
            toFname: item.toFname,
            toId: item.toId,
          })
          this.getData(item)
        })
      }
    },
    selectOrganization() {
      this.$utils.branchSelect.open().then(res => {
        // this.branch = res.toFname
        // this.content.orgId = res.toId
        this.addFormData.toId = res.toId
        this.addFormData.organizationName = res.toFname
      })
    },

    editGroup() {
      this.$emit('editGroup', this.form)
    },
    getAllStaff() {
      let toEnabled = ''
      this.tableLoading = true
      this.groupData = []
      if (this.checked === true) {
        toEnabled = 'true'
      } else {
        toEnabled = ''
      }
      const requestBody = {
        groupId: this.form.id,
        currentPage: this.currentPage,
        pageSize: this.pageSize,
        username: this.keyword,
        fullUserName: this.keyword,
        enabled: toEnabled,
      }
      this.staffLoading = true
      this.$http
        .post(this.$user_url + '/org/groups/page', requestBody)
        .then(res => {
          this.staffLoading = false
          this.groupData = res.data.content
          this.total = res.data.totalItems
          !!this.groupData.length &&
            this.groupData.map(item => {
              item.isDisable = false
              return item
            })
        })
        .catch(e => {
          this.$showFailure(e)
        })
        .then(() => {
          this.tableLoading = false
        })
    },
    showOnlyUse() {
      // this.getTableData();
      this.getAllStaff()
    },
    removeStaff(row) {
      this.isDisable = true
      let id = row.id
      row.isDisable = true
      this.$http
        .delete(this.$user_url + `/org/groups/${this.form.id}/remove/${id}`)
        .then(res => {
          if (this.groupData.length === 1) {
            this.currentPage = 1
          }
          this.getAllStaff()
          this.$message.success(this.$t('system.userGroup.removed'))
        })
        .catch(e => {
          this.$showFailure(e)
        })
      setTimeout(() => {
        this.isDisable = false
      }, 3000)
    },
    addNewStaff() {
      // this.dialogVisible = true;
      // this.getAddStaff();
      this.$utils.staffSelect.open().then(data => {
        const response = []
        data.forEach(element => {
          response.push(element.id)
        })
        this.$http
          .post('/user/org/groups/' + this.form.id + '/add', response)
          .then(res => {
            this.getAllStaff()
          })
          .catch(e => {
            this.$showFailure(e)
          })
      })
    },
    handleSizeChange(val) {
      this.currentPage = 1
      this.pageSize = val
      this.getAllStaff()
    },
    handleCurrentChange(val) {
      this.currentPage = val
      this.getAllStaff()
    },
    handleClick(val) {
      this.activeName = val.name
    },
  },
  watch: {
    keyword(val) {
      this.currentPage = 1
      this.getAllStaff()
    },
  },
}
