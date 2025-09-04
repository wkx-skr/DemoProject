import project from '../project/main.vue'
export default {
  components: {
    project
  },
  props: ['nodeClickId'],
  data () {
    return {
      tableData: [],
      keyword: '',
      conditions: {
        state: '',
        businessDepartment: '',
        labels: []
      },
      alwaysShowFilters: undefined,
      showMoreFilters: false,
      judgeComponentCallback: () => {
        this.judgeComponentContainerWidth()
      },
      currentPage: 1,
      pageSize: 20,
      totalItems: 0,
      selection: [],
      // 需求优先级
      priorityOptions: [
        {
          value: 0,
          label: 'P1'
        },
        {
          value: 1,
          label: 'P2'
        },
        {
          value: 3,
          label: 'P3'
        }
      ],
      // 需求状态
      stautsOptions: [
        {
          value: 'A',
          label: '待审核'
        },
        {
          value: 'RA',
          label: '审批中'
        },
        {
          value: 'RJ',
          label: '已拒绝'
        },
        {
          value: 'C',
          label: '已确认'
        },
        {
          value: 'RC',
          label: '验收中'
        },
        {
          value: 'RK',
          label: '验收未通过'
        },
        {
          value: 'R',
          label: '验收通过'
        },
        {
          value: 'RG',
          label: '需求变更审核中'
        },
        {
          value: 'RL',
          label: '需求废弃审核中'
        },
        {
          value: 'L',
          label: '已废弃'
        }
      ],
      stautsOptionsList: {
        'A': '待审核',
        'RA': '审批中',
        'RJ': '已拒绝',
        'C': '已确认',
        'RC': '验收中',
        'RK': '验收未通过',
        'R': '验收通过',
        'RG': '需求变更审核中',
        'RL': '需求废弃审核中',
        'L': '已废弃'
      },
      uploadUrl: `${this.$domains}requirementmanagement/upload`,
      uploading: false,
      orderIsAsc: false,
      orderBy: 'requirementCreatTime',
      formExamine: {
        approver: []
      },
      userList: [],
      nameInput: '',
      currentPageUsers: 1,
      pageSizeUsers: 20,
      totalUsers: 0,
      showUsersApply: false,
      applyReleaseList: null,
      auth: this.$store.state.$auth,
      addProDisabled: true,
      treeClickId: null,
      isAdmin: this.$store.state.user.isAdmin

    }
  },
  mounted () {
    this.judgeComponentContainerWidth()
    $(window).resize(this.judgeComponentCallback)
    this.getData()
    this.$bus.$on('updateRequirementItem', this.listClick)
    this.$bus.$on('updateRequirementItem2', this.getData)
  },
  beforeDestroy () {
    this.$bus.$off('updateRequirementItem')
    this.$bus.$off('updateRequirementItem2')
    $(window).unbind('resize', this.judgeComponentCallback)
  },
  methods: {
    applyChanges () {
      if (this.selection.length > 1) {
        this.$message.warning('请选择一个需求进行操作')
      }
      this.$emit('EditClick', this.selection[0], 'change')
    },
    applyAbolish () {
      console.log(this.selection[0], 'this.formData')
      let obj = {
        'id': this.selection[0].id,
        'categoryId': this.selection[0].categoryId,
        'dmndType': this.selection[0].dmndType,
        'name': this.selection[0].name,
        'requirementCode': this.selection[0].requirementCode,
        'requirementPriority': this.priorityOptions.filter(
          item => item.label === this.selection[0].requirementPriority
        )[0]?.value,
        'requirementStauts': this.selection[0].requirementStauts,
        'module': this.selection[0].module,
        'requirementLeader': this.selection[0].requirementLeader,
        'requirementDescription': this.selection[0].requirementDescription,
        'requirementEditor': this.selection[0].requirementEditor,
        'requirementCreatTime': this.selection[0].requirementCreatTime,
        'enclosureId': this.selection[0].enclosureId,
        'requirementDataobject': this.selection[0].requirementDataobject,
        'dataDelete': this.selection[0].dataDelete,
        'techDirector': this.selection[0].techDirector,
        'techDescription': this.selection[0].techDescription
        // 'categorys': [6],
        // 'doneTime': 1694620800000
      }
      this.$http
        .post(`${this.$domains}requirementmanagement/apply/abolish`, obj)
        .then(res => {
          this.$message.success(
            '申请废弃成功'
          )
          if (this.nodeClickId) {
            this.getData({ id: this.nodeClickId })
            this.$emit('clickTree', this.nodeClickId)
          } else {
            this.$emit('handleAllShow')
          }
        }).catch(e => {
          this.$showFailure(e)
        })
    },
    applicationApproval () {
      let priority = null
      this.priorityOptions.forEach(element => {
        if (element.label === this.applyReleaseList.requirementPriority) {
          priority = element.value
        }
      })

      let requestBody = {
        'id': this.applyReleaseList.id,
        'requirementCode': this.applyReleaseList.requirementCode,
        'name': this.applyReleaseList.name,
        'status': this.applyReleaseList.requirementStauts,
        'priority': priority,
        'module': this.applyReleaseList.module,
        'type': this.applyReleaseList.dmndType,
        'director': this.applyReleaseList.requirementLeader,
        'directory': this.applyReleaseList.categoryId
        // 'approver': this.formExamine.approver.join(',')
      }

      this.$http.post(`${this.$dddUrl}/service/project/requirement/publish`, requestBody)
        .then(res => {
          this.$message.success('申请成功')
          this.showUsersApply = false
          if (this.nodeClickId) {
            this.getData({ id: this.nodeClickId })
            this.$emit('clickTree', this.nodeClickId)
          } else {
            this.$emit('handleAllShow')
          }
        })
        .catch(err => {
          this.$showFailure(err)
        })
    },
    closeBtn () {
      this.showUsersApply = false
    },
    applyRelease (row) {
      this.applyReleaseList = row
      // this.formExamine.approver = []
      // this.showUsersApply = true
      this.applicationApproval()
    },
    changeApproverlList (val) {
      this.currentPage = 1
      this.nameInput = val || ''
      this.getUsers('approver')
    },
    getUsers (approver) {
      let requestBody = {
        currentPage: this.currentPageUsers,
        pageSize: this.pageSizeUsers,
        username: this.nameInputUsers,
        fullUserName: this.nameInputUsers
      }
      this.$http.post('/user/org/groups/page?appName=ddt', requestBody)
        .then(res => {
          if (this.currentPage === 1) {
            this.userList = res.data.content
          } else {
            this.userList.push(...res.data.content)
          }
          this.totalUsers = res.data.totalItems
        })
        .catch(err => {
          this.$showFailure(err)
        })
    },
    approverListloading () {
      if (this.totalUsers && this.totalUsers >= this.userList.length) return
      this.currentPage += 1
      this.getUsers('approver')
    },
    remoteMethod (val) {
      this.currentPage = 1
      this.getUsers(val)
    },
    addPro () {
      let idArr = []
      this.selection.forEach(element => {
        idArr.push(element.id)
      })
      this.$bus.$emit('addProject', idArr)
    },
    listClick (data) {
      this.currentPage = 1
      this.getData(data)
    },
    handleBeforeUpload () {
      this.uploading = true
      this.$message.info({
        message: this.$t('quality.page.dataQualityRules.importing'),
        duration: 0,
        showClose: true
      })
    },
    handleUploadSuccess (res) {
      this.uploading = false
      this.$message.closeAll()
      this.$message.success(this.$t('assets.upload.success'))
      let data = { id: this.categoryId }
      this.getData(data)
      // if (res === 0) {
      //   this.$message.error('导入文件错误')
      // } else if (typeof res === 'number') {
      //   this.$message.success(`成功导入了${res}条规则`)
      // } else if (Array.isArray(res)) {
      //   let msg = ''
      //   res.forEach(item => {
      //     msg += item + '<br>'
      //   })
      //   const str = msg ? `未匹配信息如下：<br>${msg}` : '导入成功'
      //   if (str === '导入成功') {
      //     this.$showSuccess(str)
      //   } else {
      //     this.$showSuccess(str, 'info')
      //   }
      // }
    },
    handleUploadFailure (e) {
      this.$showUploadFailure(e)
      this.$message.error(this.$t('assets.upload.failed'))
      this.uploading = false
      this.$message.closeAll()
    },
    changePage () {
      this.currentPage = 1
      let data = { id: this.categoryId }
      this.getData(data)
    },
    // 获取需求列表
    getData (data) {
      if (data) {
        this.categoryId = data.id
      } else {
        this.categoryId = null
      }
      let url = `${this.$domains}requirementmanagement/page`
      let body = {
        categoryId: this.categoryId ? this.categoryId : null,
        currentPage: this.currentPage,
        dmndType: this.conditions.dmndType || null,
        keyword: this.keyword,
        pageSize: this.pageSize,
        requirementStatus: this.conditions.requirementStatus || null,
        orderBy: this.orderBy ? this.orderBy : null,
        orderIsAsc: this.orderIsAsc
      }
      this.$http
        .post(url, body)
        .then(res => {
          this.tableData = res.data.content
          this.totalItems = res.data.totalItems
          // 翻译需求优先级
          this.tableData.forEach(element => {
            if (element.module == null) {
              element.module = ''
            }
            if (element.requirementPriority !== null) {
              element.requirementPriority = this.priorityOptions.filter(
                item => item.value === element.requirementPriority
              )[0]?.label
            }
            // if (element.requirementStauts !== null) {
            //   element.requirementStauts = this.stautsOptions.filter(
            //     item => item.value == element.requirementStauts
            //   )[0].label
            // }
          })
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    // 回车搜索
    handleKeywordChange () {},
    handleConditionsChange () {},
    judgeComponentContainerWidth () {
      const width = parseInt($(this.$el).css('width'))
      this.alwaysShowFilters = width >= 1200
    },
    handleSizeChange (val) {
      this.pageSize = val
      let data = { id: this.categoryId }
      this.getData(data)
    },
    handleCurrentChange (val) {
      this.currentPage = val
      let data = { id: this.categoryId }
      this.getData(data)
    },
    handleSelectionChange (val) {
      this.selection = val
      let ary = val.filter(item => item.requirementStauts === 'A' && !item.projectName && item.module === 'D3')
      if (ary.length === val.length && this.auth['DDD_PROJECT_EDIT']) {
        this.addProDisabled = false
      } else {
        this.addProDisabled = true
      }
    },
    // 查看
    handleItemClick (row) {
      this.$emit('itemClick', row)
    },
    // 编辑
    EditClick (row) {
      this.$emit('EditClick', row)
    },
    // 新增需求
    addDemand () {
      this.$emit('addDemand', this.categoryId)
    },
    // 删除
    DeleteClick (row) {
      this.$DatablauCofirm(
        this.$t('meta.report.delConfirm'),
        this.$t('meta.report.tips'),
        {
          type: 'warning',
          cancelButtonText: this.$t('common.button.cancel'),
          confirmButtonText: this.$t('common.button.ok')
        }
      )
        .then(() => {
          let ids = []
          if (row.id) {
            ids.push(row.id)
          } else {
            ids = this.selection.map(item => {
              return item.id
            })
          }
          let url = `${this.$domains}requirementmanagement/delete`
          this.$http
            .post(url, ids)
            .then(res => {
              let data = { id: this.categoryId }
              this.getData(data)
              this.$message.success(
                this.$t('quality.page.qualityRule.successfullyDeleted')
              )
            })
            .catch(e => {
              this.$showFailure(e)
            })
        })
        .catch(e => {
          // this.$showFailure(e)
        })
    },
    // 导出
    updateExport () {
      let url = `${HTTP.$domains}requirementmanagement/export`
      let obj = {
        categoryId: null,
        currentPage: this.currentPage,
        dmndType: this.conditions.dmndType || null,
        keyword: this.keyword,
        pageSize: this.pageSize,
        requirementStatus: this.conditions.requirementStatus || null
      }
      this.$downloadFilePost(url, obj)
    },
    // 表格排序
    handleSortChange (sortData) {
      this.orderIsAsc = sortData.order === 'ascending'
      this.orderBy = sortData.prop
      let data = { id: this.categoryId }
      this.getData(data)
    },
    statusFormatter (status) {
      return this.stautsOptionsList[status]
    },
    getStatusColor (statue) {
      switch (statue) {
        case 'A':
          return '#5dc4c0'
        case 'RA':
          return '#409eff'
        case 'RJ':
          return '#ff4b53'
        case 'C':
          return '#BB6CF9'
        case 'RC':
          return '#409eff'
        case 'RK':
          return '#ff4b53'
        case 'R':
          return '#66bf16'
        case 'RG':
          return '#409eff'
        case 'RL':
          return '#409eff'
        case 'L':
          return '#AFB4BF'
      }
    }
  },
  computed: {
    multipleLength () {
      if (this.selection) {
        return this.selection.length
      } else {
        return 0
      }
    },
    applyChangesDisabled () {
      if (this.selection.length > 1) {
        return true
      } else {
        if (this.selection.length && this.selection[0].requirementStauts === 'C') {
          return false
        } else {
          return true
        }
      }
    }
  },
  watch: {
    // keyword() {
    //   this.currentPage = 1
    //   this.$bus.$emit('clearTree')
    //   let data = { id: this.categoryId }
    //   this.getData(data);
    // },
  }
}
