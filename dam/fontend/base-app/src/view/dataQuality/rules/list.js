import Status from './Status'
import HTTP from '@/http/main.js'
import applyProcessDialog from '../components/applyProcessDialog'
var no_result = 'No Result'
export default {
  components: {
    Status,
    applyProcessDialog,
  },
  data() {
    return {
      writable: true,
      allCategories: [],
      selectedCatalog: '',
      multipleSelection: [],
      preRawRules: [],
      isSelf: null,
      rawRules: [],
      rules: [],
      rulesDisplay: null,
      tableHeight: 100,
      currentPage: 1,
      pageSize: 20,
      total: 0,
      deleteRulesDisabled: true,
      uploadHost: this.$url + '/service/upload',
      keyword: '',
      statusOption: null,
      allCategoriesMap: {},
      uploadUrl: this.$quality_url + '/quality/rules/bu/file',
      canNotDown: false,
      dataLoading: false,
      uploading: false,
      timer: null,
      catalogStr: '',
      option: {
        selectable: true,
        autoHideSelectable: true,
        showColumnSelection: true,
        columnSelection: [],
        columnResizable: true,
      },
      routeString: '',
      direction: '',
      orderCol: '',
      administrators: null,
      queryArr: [],
      productionStatus: null,
      productionStatusOption: {
        PRODUCTION_TO_QUALITY_TASK: this.$t(
          'quality.page.dataQualityRules.productionStatusOption.QUALITY_TASK'
        ),
        PRODUCTION_TO_TECH_RULE: this.$t(
          'quality.page.dataQualityRules.productionStatusOption.TECH_RULE'
        ),
        NOT_PRODUCTION: this.$t(
          'quality.page.dataQualityRules.productionStatusOption.PRODUCTION'
        ),
      },
      formFile: [],
      isUploadPublishedStandard: false,
      uploadDialogVisible: false,
      defaultProps: {
        value: 'treeId',
        label: 'name',
        children: 'subNodes',
      },
      treeId: 0,
      idArrlevel: null,
      idArr: [],
      stateList: [
        {
          label: this.$t('quality.page.dataQualityRules.allStatus'),
          value: null,
        },
        {
          label: this.$t('quality.page.dataQualityRules.stateOption.shortD'),
          value: 'D',
        },
        {
          label: this.$t('quality.page.dataQualityRules.stateOption.A'),
          value: 'A',
        },
        {
          label: this.$t('quality.page.dataQualityRules.stateOption.X'),
          value: 'X',
        },
      ],
      processingState: [
        {
          label: this.$t(
            'quality.page.qualityRule.publishStatus.copyReleaseUnderReview'
          ),
          value: 'D_TO_A',
        },
        {
          label: this.$t(
            'quality.page.qualityRule.publishStatus.copyChangeInReview'
          ),
          value: 'A_TO_A',
        },
        {
          label: this.$t(
            'quality.page.qualityRule.publishStatus.copyAbandonedUnderEeview'
          ),
          value: 'A_TO_X',
        },
        {
          label: this.$t('quality.page.qualityRule.publishStatus.rePublishing'),
          value: 'X_TO_A',
        },
      ],
      exportType: false,
    }
  },
  props: {
    auth: Boolean,
    addAuth: Boolean,
  },
  watch: {
    keyword() {
      clearTimeout(this.timer)
      this.timer = setTimeout(() => {
        this.queryRules()
      }, 800)
    },
    uploadDialogVisible(value) {
      if (value === true && this.$refs.standardImport) {
        this.isUploadPublishedStandard = false
        this.$refs.standardImport.$refs.upload.clearFiles()
      }
    },
  },
  created() {
    if (!this.$isShort) {
      this.stateList.push(...this.processingState)
    }
  },
  mounted() {
    const self = this
    // setTimeout(() => {
    //   this.resize()
    // })
    // $(window).resize(this.resize)
    this.$bus.$on('reloadQualityRules', this.queryRules)
    this.isSelf = !this.$auth.QUALITY_BUSINESS_RULE_VIEW_ALL
    this.queryRules()
    this.getQuery()
    // this.getDqmuser()
    this.$bus.$on('categoriesLoaded', caterogies => {
      this.allCategories = caterogies
      this.allCategories.forEach(item => {
        this.allCategoriesMap[item.categoryId] = item.categoryName
      })
      self.queryRules()
    })
  },
  beforeDestroy() {
    this.$bus.$off('reloadQualityRules')
    this.$bus.$off('categoriesLoaded')
    // $(window).unbind('resize', this.resize)
    this.$message.closeAll()
  },
  methods: {
    showFooterText() {
      let flag =
        (this.$auth.QUALITY_BUSINESS_RULE_VIEW_DELETE && this.auth) ||
        (this.applyDisabled('D_TO_A') && !this.$isShort) ||
        this.applyDisabled() ||
        this.applyDisabled('A_TO_X') ||
        this.applyDisabled('X_TO_A')
      return flag
    },
    applyDisabled(type) {
      let flag = true
      if (!type) {
        // 变更
        flag = this.multipleSelection.every(
          item => item.copyId && item.applyState !== 'PROCESSING'
        )
      } else if (type === 'D_TO_A') {
        // 申请发布--待审核状态
        flag = this.multipleSelection.every(
          item => item.state === 'D' && !item.processing
        )
      } else if (type === 'A_TO_X') {
        // 申请废弃--已发布状态主规则
        flag = this.multipleSelection.every(
          item => item.state === 'A' && !item.copyId && !item.processing
        )
      } else if (type === 'X_TO_A') {
        // 重新发布--已废弃状态
        flag = this.multipleSelection.every(
          item => item.state === 'X' && !item.processing
        )
      }
      if (!this.$auth.QUALITY_BUSINESS_RULE_VIEW_EDIT || !this.auth) {
        flag = false
      }
      return flag
    },
    openApplyProDialog(type) {
      if (this.$isShort) {
        const id = this.multipleSelection.map(data => {
          return data.id
        })
        this.preChangeState(id, type)
      } else {
        if (type === 'A_TO_X') {
          if (
            this.multipleSelection.some(
              item => Array.isArray(item.children) && item.children.length
            )
          ) {
            this.$DatablauCofirm(
              this.$t('quality.page.dataQualityRules.a2xTips'),
              this.$t('el.messagebox.title'),
              {
                type: 'warning',
                cancelButtonText: this.$t('common.button.cancel'),
                confirmButtonText: this.$t('common.button.ok'),
              }
            )
              .then(() => {
                this.$refs.applyProcessDialog.open(type)
              })
              .catch(e => {
                console.log(e)
              })
          } else {
            this.$refs.applyProcessDialog.open(type)
          }
        } else {
          this.$refs.applyProcessDialog.open(type)
        }
      }
    },
    // 提交申请
    applyTech(data) {
      let obj = {
        applyReason: data.commonApplyReason,
        applyFile: data.commonApplyFile,
        ruleIds: this.idArr,
      }
      let url = ''
      if (!data.processState) {
        url = `${this.$quality_url}/workflow/businessRules/submitApply`
      } else {
        url = `${this.$quality_url}/workflow/businessRules/copySubmitApply`
        obj.processState = data.processState
      }
      this.$http
        .post(url, obj)
        .then(res => {
          this.$message({ message: '申请成功', type: 'success' })
          this.loadRules(this.routeString)
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    getStatusColor(row) {
      const statue = row.state
      if (!this.$isShort && row.processing) {
        return '#4386F5'
      } else {
        switch (statue) {
          case 'A':
            return '#5CB793'
          case 'D':
            return '#F79B3F'
          case 'C':
            return '#4386F5'
          case 'X':
            return '#AFB4BF'
        }
      }
    },
    getLevelState(processState) {
      const param = {
        value: processState,
      }
      switch (param.value) {
        case '发布':
          return this.$t(
            'quality.page.qualityRule.publishStatus.copyPublishing'
          )
        case '发布-审核中':
          return this.$t(
            'quality.page.qualityRule.publishStatus.copyReleaseUnderReview'
          )
        case '变更':
          return this.$t('quality.page.qualityRule.publishStatus.copyChange')
        case '变更-审核中':
          return this.$t(
            'quality.page.qualityRule.publishStatus.copyChangeInReview'
          )
        case '废弃-审核中':
          return this.$t(
            'quality.page.qualityRule.publishStatus.copyAbandonedUnderEeview'
          )
      }
      return param.value
    },
    statusFormatter(row) {
      const param = {
        value: row.state,
      }
      const processType = row.processType
      if (!this.$isShort && row.processing) {
        switch (processType) {
          case 'D_TO_A':
            return this.$t(
              'quality.page.qualityRule.publishStatus.copyReleaseUnderReview'
            )
          case 'A_TO_X':
            return this.$t(
              'quality.page.qualityRule.publishStatus.copyAbandonedUnderEeview'
            )
          case 'A_TO_A':
            return this.$t(
              'quality.page.qualityRule.publishStatus.copyChangeInReview'
            )
          case 'X_TO_A':
            return this.$t(
              'quality.page.qualityRule.publishStatus.rePublishing'
            )
        }
      } else {
        switch (param.value) {
          case 'X':
            return this.$t('quality.page.qualityRule.publishStatus.deprecated')
          case 'D':
            return this.$t(
              'quality.page.qualityRule.publishStatus.shortToBeAudited'
            )
          case 'C':
            return this.$t('quality.page.qualityRule.publishStatus.inReview')
          case 'A':
            return this.$t('quality.page.qualityRule.publishStatus.adopted')
        }
      }
    },
    createCopy(row, processState) {
      let obj = {
        buRuleId: row.id,
        processState: processState,
      }
      this.$http
        .post(`${this.$quality_url}/quality/rule/bu/createCopy`, obj)
        .then(res => {
          this.$message({ message: '创建副本成功！', type: 'success' })
          this.loadRules(this.routeString)
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    standardImportAction() {
      this.uploadDialogVisible = false
      this.$refs.standardImport.$refs.upload.submit()
    },
    showBegain() {
      this.$bus.$emit('showUploadProgress', {
        name: '导入业务规则',
        time: 10,
      })
    },
    importRule() {
      this.exportType = false
      this.uploadDialogVisible = true
      this.formFile = []
    },
    onChange(e) {
      this.formFile.push(e)
    },
    beforeRemove(e) {
      this.formFile = []
    },
    elRadioSelect(state) {
      this.isUploadPublishedStandard = state
    },
    handleUpdateMetadataSuccess(res) {
      this.$bus.$emit('changeUploadProgress', true)
      this.$bus.$emit('getTaskJobResult', res, 'import')
      // this.handleCurrentChange(1)
    },
    handleUpdateMetadataError(err, file, fileList) {
      this.$bus.$emit('changeUploadProgress', false)
      this.$showFailure(JSON.parse(err.message).rootErrorMessage)
    },
    modelDownload() {
      const url = this.$quality_url + `/quality/rules/bu/file?isTemplate=true`
      this.$downloadFile(url)
    },
    productionStatusChange() {
      this.loadRules(this.routeString)
    },
    getQuery() {
      this.$http
        .post(`${this.$url}/select/option/get`, {
          category: 'TR',
          names: ['规则大类'],
        })
        .then(res => {
          this.queryArr = res.data
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    searchQuery(id) {
      let name = ''
      this.queryArr.forEach(element => {
        if (element.id == id) {
          name = element.optionValue
        }
      })
      return name
    },
    getDqmuser() {
      this.$http
        .get(`/user/usermanagement/dqmuser?username=${this.$user.username}`)
        .then(res => {
          this.administrators = res.data
          this.queryRules()
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    changeSort(val) {
      if (val.order === 'ascending') {
        this.direction = 'ASC'
        this.orderCol = val.prop
      } else if (val.order === 'descending') {
        this.direction = 'DESC'
        this.orderCol = val.prop
      } else {
        this.direction = ''
        this.orderCol = ''
      }
      this.loadRules(this.routeString)
    },
    switchDirectory() {
      this.statusOption = null
      this.keyword = ''
    },
    goToTechRules(buRule) {
      const pos = location.href.indexOf('#/')
      const baseUrl = location.href.slice(0, pos + 2)
      window.open(
        baseUrl +
          `main/dataQuality/qualityRule?buRuleId=${buRule.id}&buRuleName=${buRule.name}`,
        '_blank'
      )
    },
    handleBeforeUpload() {
      this.uploading = true
      this.$message.info({
        message: this.$t('quality.page.dataQualityRules.importingRule'),
        duration: 0,
        showClose: true,
      })
    },
    handleUploadSuccess(res) {
      this.uploading = false
      this.$message.closeAll()
      if (res === 0) {
        this.$message.error(
          this.$t('quality.page.dataQualityRules.import.fileError')
        )
      } else if (typeof res === 'number') {
        this.$message.success(
          this.$t('quality.page.dataQualityRules.import.rulesImported', {
            res: res,
          })
        )
      } else if (Array.isArray(res)) {
        let msg = ''
        res.forEach(item => {
          msg += item + '<br>'
        })
        const str = msg
          ? this.$t('quality.page.dataQualityRules.import.unmatched', {
              msg: msg,
            })
          : this.$t('quality.page.dataQualityRules.import.importSuccessful')
        if (
          str ===
          this.$t('quality.page.dataQualityRules.import.importSuccessful')
        ) {
          this.$showSuccess(str)
        } else {
          this.$showSuccess(str, 'info')
        }
      }
      this.queryRules()
      this.canNotDown = false
    },
    handleUploadFailure(e) {
      this.uploading = false
      this.$message.closeAll()
      //      this.$message.error(JSON.parse(e.message).errorMessage);
      this.canNotDown = false
      this.$showUploadFailure(e)
    },
    downloadFile() {
      this.canNotDown = true
      try {
        if (this.isSelf === true) {
          const url = this.$quality_url + '/quality/rules/bu/file?all=false'
          this.$downloadFile(url)
        } else {
          const url = this.$quality_url + '/quality/rules/bu/file?all=true'
          this.$downloadFile(url)
        }
      } catch (e) {
        this.$showFailure(e)
      }
    },
    resize() {
      const tableRow = $('.table-row')[0]
      if (tableRow.offsetHeight === 0) {
        return
      }
      this.tableHeight = tableRow.offsetHeight
    },
    getAssignedData() {
      if (this.$route.query.id != undefined) {
        let respsone = {
          currentPage: this.currentPage,
          pageSize: this.pageSize,
          uniCategoryId: this.catalogStr,
          ruleName: encodeURI(this.keyword),
          state: this.statusOption,
          productionStatus: this.productionStatus,
          ruleId: this.$route.query.id,
        }
        if (`${this.$route.query.copy}` === 'true') {
          this.$http
            .post(
              `${this.$quality_url}/quality/rule/bu/getCopyDetail?buRuleCopyId=${this.$route.query.copyId}`
            )
            .then(res => {
              this.$bus.$emit('startSeeBusinessRule', _.clone(res.data))
            })
            .catch(e => {
              this.$showFailure(e)
            })
        } else {
          this.$http
            .get(
              `${this.$quality_url}/quality/rule/bu/getRuleById?ruleId=${this.$route.query.id}`
            )
            .then(res => {
              if (!res.data) {
                this.$message({
                  showClose: true,
                  message: this.$t('quality.page.dataQualityRules.ruleDelTips'),
                  type: 'error',
                  duration: 5000,
                })
              }
              this.$bus.$emit('startSeeBusinessRule', _.clone(res.data))
            })
            .catch(e => {
              this.$showFailure(e)
            })
        }
      }
    },
    handleStateChange() {
      this.queryRules()
    },
    addRule() {
      if (this.catalogStr === 0 || this.catalogStr === '') {
        if (this.addAuth) {
          this.$bus.$emit('addBusinessRule', this.catalogStr)
        } else {
          this.$blauShowSuccess('请联系质量管理员赋权', 'warning')
        }
      } else {
        if (this.auth === false) {
          this.$blauShowSuccess('请联系质量管理员赋权', 'warning')
        } else {
          this.$bus.$emit('addBusinessRule', this.catalogStr)
        }
      }
    },
    toggleSelection() {},
    handleSelectionChange(val) {
      this.multipleSelection = val
      if (
        val.every(item => item.level === val[0].level) &&
        val.every(
          item =>
            !item.processing &&
            (item.state === 'D' ||
              item.state === 'X' ||
              (item.applyState && item.applyState !== 'PROCESSING'))
        )
      ) {
        this.deleteRulesDisabled = false
        this.idArrlevel = val.map(item => item.level)[0]
      } else {
        this.deleteRulesDisabled = true
      }
      if (val.length) {
        this.idArr = val.map(item => item.id)
      } else {
        this.idArr = []
      }
    },
    selected() {
      this.$bus.$emit('qualityRulesSelected', this.multipleSelection)
      this.$bus.$emit('closeChooseQualityRulesDialog')
    },
    queryRules() {
      this.currentPage = 1
      this.loadRules(this.routeString)
    },
    loadRules(routeString) {
      this.routeString = routeString
      // if (routeString) {
      //   this.catalogStr = routeString
      // } else {
      //   this.catalogStr = ''
      // }
      if (this.productionStatus === '') {
        this.productionStatus = null
      }
      this.catalogStr = routeString
      this.dataLoading = true
      let respsone = {
        currentPage: this.currentPage,
        pageSize: this.pageSize,
        uniCategoryId: this.catalogStr,
        ruleName: this.keyword,
        state: this.statusOption,
        productionStatus: this.productionStatus,
        creator: this.isSelf ? this.$user.username : '',
      }
      this.orderCol && (respsone.orderCol = this.orderCol)
      this.direction && (respsone.orderType = this.direction)
      this.$http
        .post(`${this.$quality_url}/quality/rules/bu/report/page`, respsone)
        .then(res => {
          // this.preRawRules = res.data
          // this.filterSelf()
          this.rulesDisplay = res.data.content
          this.total = res.data.totalItems
          this.getAssignedData()
          setTimeout(() => {
            this.dataLoading = false
          }, 500)
        })
        .catch(e => {
          this.$showFailure(e)
          this.dataLoading = false
        })
    },
    filterSelf() {
      this.$nextTick(() => {
        if (this.isSelf) {
          const rules = this.preRawRules
          this.rawRules = []
          const username = this.$user.username
          rules.forEach(item => {
            if (item.creator === username) {
              this.rawRules.push(item)
            }
          })
        } else {
          this.rawRules = this.preRawRules
        }
        this.queryRules()
      })
    },
    // filtRules(){
    //   this.rules = [];
    //   this.rawRules.forEach(item=>{
    //     if(item.name.toLowerCase().indexOf(this.keyword.toLowerCase()) > -1 || (item.description && item.description.toLowerCase().indexOf(this.keyword.toLowerCase())>-1)){
    //       if(item.state === 0 && this.state[0] || item.state === 1 && this.state[1]){
    //         if(!this.selectedCatalog){
    //           this.rules.push(item);
    //         }
    //         else if(item.catalog == this.selectedCatalog){
    //           this.rules.push(item);
    //         }
    //
    //       }
    //     }
    //   });
    //   this.total = this.rules.length;
    //   this.currentPage = 1;
    //   this.changeRulesDisplay();
    // },
    handleSizeChange(size) {
      this.pageSize = size
      this.currentPage = 1
      this.loadRules(this.routeString)
    },
    handleCurrentChange(current) {
      this.currentPage = current
      this.loadRules(this.routeString)
    },
    changeRulesDisplay(current) {
      // const self = this;
      // self.rulesDisplay = self.rules.slice(self.pageSize * (self.currentPage-1),self.pageSize*self.currentPage);
    },
    preDeleteRows() {
      if (!this.$auth.QUALITY_BUSINESS_RULE_VIEW_DELETE || !this.auth) {
        this.$datablauMessage.error('您没有权限操作或访问该功能')
        return
      }
      let text = ''
      if (this.idArrlevel === 1) {
        if (this.multipleSelection.length === 1) {
          text = this.$t('quality.page.dataQualityRules.deleteTips1', {
            name: this.multipleSelection[0].name,
          })
        } else {
          text = this.$t('quality.page.dataQualityRules.deleteTips2', {
            selection: this.multipleSelection.length,
          })
        }
        this.$DatablauCofirm(
          text,
          this.$t('quality.page.dataQualityRules.confirm.titele'),
          {
            type: 'warning',
          }
        )
          .then(() => {
            this.deleteRows()
          })
          .catch()
      } else {
        const self = this
        const rows = self.multipleSelection
        const ids = []
        rows.forEach((row, index) => {
          ids.push(row.id)
        })
        let text = ''
        if (this.multipleSelection.length === 1) {
          text = this.$t('quality.page.dataQualityRules.deleteTips1', {
            name: this.multipleSelection[0].name,
          })
        } else {
          text = this.$t('quality.page.dataQualityRules.deleteTips2', {
            selection: this.multipleSelection.length,
          })
        }
        this.$DatablauCofirm(
          text,
          this.$t('quality.page.dataQualityRules.confirm.titele'),
          {
            type: 'warning',
          }
        )
          .then(() => {
            let url = null
            url = `/quality/rule/bu/deleteCopy`
            this.$http
              .post(`${this.$quality_url}` + url, ids)
              .then(res => {
                if (res) {
                  this.$message({
                    message: this.$t(
                      'quality.page.qualityRule.successfullyDeleted'
                    ),
                    type: 'success',
                  })
                }
                this.queryRules()
              })
              .catch(e => {
                this.$showFailure(e)
              })
          })
          .catch()
      }
    },
    deleteRows() {
      const self = this
      const rows = self.multipleSelection
      const length = rows.length
      if (length === 0) {
      } else {
        const ids = []
        rows.forEach((row, index) => {
          ids.push(row.id)
        })
        this.$http
          .post(this.$quality_url + '/quality/rules/bu/delete', ids)
          .then(res => {
            this.$message.success(this.$version.common.operationSucceed)
            this.$bus.$emit('rulesDeleted', this.multipleSelection)
            this.queryRules()
          })
          .catch(e => {
            this.$showFailure(e)
          })
      }
    },
    handleRowClick(row) {
      const detail = row
      detail.writable = this.$isAdmin || this.$user.username === detail.creator
      detail.directEdit = false
      this.$bus.$emit('startSeeBusinessRule', detail)
    },
    changeState(id, state) {
      this.$http
        .post(
          `${this.$quality_url}/quality/rule/bu/updateState?state=${state}`,
          id
        )
        .then(res => {
          this.$message.success(
            this.$t('quality.page.dataQualityRules.operated')
          )
          this.loadRules(this.routeString)
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    preChangeState(id, type) {
      if (type === 'a2x' || type === 'A_TO_X') {
        // 废弃
        this.$DatablauCofirm(
          this.$t('quality.page.dataQualityRules.a2xTips1'),
          this.$t('assets.common.tip'),
          {
            confirmButtonText: this.$t('common.button.ok'),
            cancelButtonText: this.$t('common.button.cancel'),
            type: 'warning',
          }
        )
          .then(() => {
            this.changeState(id, 'X')
          })
          .catch(e => {
            console.log(e)
          })
      } else if (type === 'x2a' || type === 'X_TO_A') {
        this.$DatablauCofirm(
          this.$t('quality.page.dataQualityRules.x2aTips'),
          this.$t('assets.common.tip'),
          {
            confirmButtonText: this.$t('common.button.ok'),
            cancelButtonText: this.$t('common.button.cancel'),
            type: 'warning',
          }
        )
          .then(() => {
            this.changeState(id, 'A')
          })
          .catch(e => {
            console.log(e)
          })
      }
    },
    handleEdit(row) {
      const detail = row
      detail.writable = this.$isAdmin || this.$user.username === detail.creator
      detail.directEdit = true
      this.$bus.$emit('startEditBusinessRule', detail)
    },
    exportRules() {
      const url = this.$url + '/service/quality/rules/file'
      this.$downloadFile(url)
    },
    mappingCategory(row, column) {
      return this.allCategoriesMap[row[column.property]]
    },
    selectable(row) {
      return this.$isAdmin || this.$user.username === row.creator
    },
    importUpload() {
      this.$refs.uploadButton.$el.click()
    },
    exportDownload() {
      this.downloadFile()
    },
    showMenu(evt) {
      const x = window.innerWidth - 20
      const y = 120
      const options = []
      if (this.$auth.QUALITY_BUSINESS_RULE_VIEW_IMPORT) {
        options.push({
          // icon: 'el-icon-upload2',
          label: this.$version.quality.rule.upload,
          callback: () => {
            this.$refs.uploadButton.$el.click()
          },
        })
      }
      if (this.$auth.QUALITY_BUSINESS_RULE_VIEW_EXPORT) {
        options.push({
          // icon: 'el-icon-download',
          label: this.$version.quality.rule.download,
          callback: () => {
            this.downloadFile()
          },
        })
      }

      this.$bus.$emit('callContextMenu', {
        x: x,
        y: y,
        options: options,
        isLeft: true,
        placement: 'bottom-left',
      })
    },
  },
  computed: {
    state() {
      if (this.statusOption === 2) {
        return {
          0: true,
          1: true,
        }
      } else if (this.statusOption === 0) {
        return {
          0: true,
          1: false,
        }
      } else {
        return {
          0: false,
          1: true,
        }
      }
    },
    standardUploadUrl() {
      let url =
        this.$quality_url +
        `/quality/rules/bu/file?publish=${this.isUploadPublishedStandard}&ignoreError=${this.exportType}`
      return url
    },
  },
}
