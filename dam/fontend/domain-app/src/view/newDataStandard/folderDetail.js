import HTTP from '@/http/main.js'
import {
  getStatusColor,
  statusFormatter,
  stateOptions,
  checkStatusFormatter,
} from '@/view/dataStandardGlossary/glossaryConstants'
import DomainSimilarityList from '@/view/newDataStandard/DomainSimilarityList.vue'

export default {
  components: { DomainSimilarityList },
  props: {
    data: {},
    state: {},
    domainHasComment: {},
    typeIds: {},
    labelText: {},
    useWorkflow: {
      type: Boolean,
      default: true,
    },
    useDam: {
      type: Boolean,
      default: true,
    },
    showShareFile: {},
    // eventStartTime: '',
    hasEditAuth: {
      type: Boolean,
      default: true,
    },
  },
  beforeMount() {},
  mounted() {
    if (this.$route.query.domain || this.$route.query.domainId) {
      this.openScan({
        domainId: this.$route.query.domain || this.$route.query.domainId,
      })
    }
    this.$bus.$on('hiddenMessage', state => {
      this.messageState.close()
    })
    this.getUdpOption()
    this.$bus.$on('getUdpsKey', state => {
      this.getUdpOption()
    })
  },
  beforeDestroy() {
    this.$bus.$off('hiddenMessage')
    this.$bus.$off('getUdpsKey')
  },
  data() {
    return {
      columnDefs: null,
      allData: [],
      tableData: null,
      frameworkComponents: null,
      tableLoading: false,
      searchFormData: {
        stateValue: null,
        domainName: '',
        bigVersionId: '',
        startTime: null,
        endTime: null,
        domainCode: '',
        ownerOrg: '',
        submitter: '',
        udpKey: '',
        udpValue: '',
      },
      ownerOrgOptions: [],
      submitterOrgOptions: [],
      timer: null,
      themeCategoryArr: [],
      themeArr: [],
      themeOption: [],
      statusFormatter,
      getStatusColor,
      stateOptions: stateOptions(this).filter(item => (item.value !== 'X' && item.value !== 'N')),
      checkStatusFormatter,
      bigVersionList: [],
      currentPage: 1,
      pageSize: 20,
      total: 0,
      selection: [],
      subscribeObjList: [],
      subscribeList: [],
      toMoveLoading: false,
      toAbandonLoading: false,
      toPublishLoading: false,
      messageState: null,
      searchTimeType: 'start',
      showMoreSearchCondition: true,
      showSelect: false,
      topNum: 0,
      eventStartTime: '',
      orderColumn: ['lastModification'],
      ascOrder: [false],
      currentTag: null,
      tagNames: null,
      all: 'more',
      udpValueOption: [],
      popoverVisible: false,
      similarityRow: {},
      similarityListDialogVis: false,
      similarityCheckLoading: false,
    }
  },
  inject: ['headerProduction'],
  computed: {
    stas() {
      return this.$route.path.includes('embeddedModule') ? 'false' : ''
    },
    hasSimilarity() {
      return (
        this.tableData &&
        this.tableData.findIndex(v => v.checkState === 'UNPASS') > -1
      )
    },
    showMoreOptionsButton() {
      let bool = false
      let authList = []
      if (this.labelText.nameAbbr === this.$t('domain.common.standard')) {
        authList = [
          'DATA_STANDARD_IMPORT_STANDARDS',
          'ROLE_DOMAIN_IMPORT',
          'DATA_STANDARD_EXPORT',
          'ROLE_DOMAIN_TEMPLATE',
          'DATA_STANDARD_EXPAND',
          'ROLE_DOMAIN_IMPORT',
        ]
      } else if (
        this.labelText.nameAbbr === this.$t('domain.common.dictionary')
      ) {
        authList = [
          'DATA_STANDARD_DICT_IMPORT_STANDARDS',
          'DATA_STANDARD_DICT_EXPORT',
          'DATA_STANDARD_DICT_EXPAND',
        ]
      } else if (
        this.labelText.nameAbbr === this.$t('domain.common.indicator')
      ) {
        authList = [
          'DATA_STANDARD_DIM_IMPORT_STANDARDS',
          'DATA_STANDARD_DIM_EXPORT',
          'DATA_STANDARD_DIM_EXPAND',
        ]
      }
      authList.forEach(item => {
        if (this.$auth[item]) {
          bool = true
        }
      })

      return bool
    },
    // dam 启用时, ddm 页面 数据标准不能编辑
    couldEdit() {
      let bool = true
      if (this.$damEnabled && this.headerProduction.toUpperCase() === 'DDM') {
        bool = false
      }
      return bool
    },
  },
  methods: {
    queryMainData(){
      // this.currentTag = [];
      // this.handleCurrentChange(1);
      this.$message('暂无主数据');
    },
    viewSimilarityList(row) {
      this.similarityRow = row
      this.similarityListDialogVis = true
    },
    skipFinished() {
      this.similarityListDialogVis = false
      this.handleCurrentChange(1)
    },
    runJob(id, callback) {},
    similarityCheck() {
      this.similarityCheckLoading = true
      this.$http
        .post(`${this.$job_url}/main/query/jobs/byDto`, {
          pageSize: 20,
          currentPage: 1,
          type: '数据标准-相似度检查任务',
        })
        .then(res => {
          const job = res.data.content[0]
          if (job && job.jobId) {
            return this.$http.post(
              `/job/main/startJob?jobId=${job.jobId}&executor=admin`
            )
          }
          return Promise.reject()
        })
        .then(res => {
          this.handleCurrentChange(1)
        })
        .catch(e => {
          this.$showFailure(e)
        })
        .finally(() => {
          this.similarityCheckLoading = false
        })
    },
    disabledControl2() {
      let flag = true
      flag = this.selection.every(item => {
        return item.state === 'X' || item.state === 'D'
      })
      return flag
    },
    unpassOrUnCheck() {
      return (
        this.selection.findIndex(item => {
          return (
            !item.checkState || ['UNPASS', 'UNCHECK'].includes(item.checkState)
          )
        }) > -1
      )
    },
    openPopover() {
      // this.popoverVisible = true
    },
    closePopover() {
      this.popoverVisible = false
    },
    getUdpOption() {
      this.udpValueOption = []
      HTTP.getUpds({ categoryId: this.typeIds === 1 ? 1 : this.typeIds })
        .then(res => {
          res.data.forEach(element => {
            this.udpValueOption.push({
              label: element.name,
              value: element.udpId,
            })
          })
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    handleClose(v, i) {
      this.currentTag.splice(i, 1)
      this.tagNames.splice(i, 1)
    },
    callTagSelector() {
      this.$bus.$once('tagSelected', ({ keys, names }) => {
        if (keys && names) {
          this.currentTag = keys
          this.tagNames = names
          this.currentPage = 1
        }
      })
      this.$bus.$emit('callSelectorDialog', {
        type: 'tag',
        tagIds: this.currentTag,
        single: false,
        security: false,
      })
    },
    cancelTagSelect() {
      this.currentTag = null
      this.tagNames = null
      this.currentPage = 1
    },
    domResize(data) {
      let height = Number.parseFloat(data.height) - 88 + 110
      // console.log(height)
      if (isNaN(height)) return
      this.$nextTick(() => {
        this.topNum = height
      })
    },
    refreshData() {
      this.getSubscribeList().then(() => {
        this.initTableData()
      })
    },
    changeSort(val) {
      if (val.prop === 'descriptionDepartmentName') {
        val.prop = 'descriptionDepartment'
      }
      if (val.order === 'ascending') {
        this.ascOrder[0] = 'true'
        this.orderColumn[0] = val.prop
      } else if (val.order === 'descending') {
        this.ascOrder[0] = 'false'
        this.orderColumn[0] = val.prop
      } else {
        this.ascOrder[0] = 'false'
        this.orderColumn[0] = 'createTime'
      }
      this.initTableData()
    },
    initTableData() {
      if (
        this.searchFormData.startTime &&
        this.searchFormData.endTime &&
        this.searchFormData.endTime < this.searchFormData.startTime
      ) {
        this.$message.error(this.$t('domain.domain.endBeforeStart'))
        this.searchFormData.endTime = null
        return
      }

      const obj = {
        domainCode: this.searchFormData.domainCode,
        chineseName: this.searchFormData.domainName,
        domainState: this.searchFormData.stateValue,
        folderId: this.data.foldId || this.typeIds,
        submitter: this.searchFormData.submitter,
        firstPublishStart: this.searchFormData.startTime,
        firstPublishEnd: this.searchFormData.endTime
          ? this.searchFormData.endTime + 1000 * 3600 * 24 - 1
          : null,
        // ownerOrg: this.searchFormData.ownerOrg,
        descriptionDepartment: this.searchFormData.ownerOrg,
        orderColumn: this.orderColumn,
        ascOrder: this.ascOrder,
        currentPage: this.currentPage,
        pageSize: this.pageSize,
        categoryId: this.typeIds,
        tagIds: this.currentTag,
        udpKey: this.searchFormData.udpKey,
        udpValue: this.searchFormData.udpValue,
        notEqState: 'X', // 去除已废弃的标准
      }

      this.tableLoading = true
      HTTP.getFolderListService(obj)
        .then(res => {
          this.tableLoading = false
          this.tableData = res.data.content
          this.total = res.data.totalItems
        })
        .catch(e => {
          this.tableLoading = false
          this.$showFailure(e)
        })
    },
    tableSelectionChanged(selection) {
      this.selection = selection
    },
    selectSubmitter(event) {
      if (event.relatedTarget && this.searchFormData.submitter) {
        this.searchFormData.submitter = ''
        this.submitterOrgOptions = null
        if (
          this.$refs.submitterChooseSelect &&
          this.$refs.submitterChooseSelect.blur
        ) {
          this.$refs.submitterChooseSelect.blur()
        }
      } else {
        if (
          this.$refs.submitterChooseSelect &&
          this.$refs.submitterChooseSelect.blur
        ) {
          this.$refs.submitterChooseSelect.blur()
        }
        this.$utils.staffSelect.open([], true).then(res => {
          this.submitterOrgOptions = [res]
          this.searchFormData.submitter = res[0].username
        })
      }
    },
    openScan(row) {
      this.$bus.$emit('goToDomain', row)
    },
    getSubscribeList() {
      if (this.useDam) {
        return new Promise(resolve => {
          this.$http
            .post(this.$baseurl + `/subscribe/loadUserSub`)
            .then(res => {
              this.subscribeList = res.data
                .filter(e => e.typeId === 80010066)
                .map(e => e.objId)
              this.subscribeObjList = res.data
              resolve()
            })
            .catch(e => {
              this.$showFailure(e)
            })
        })
      } else {
        return new Promise(resolve => resolve())
      }
    },

    handleSizeChange(val) {
      this.pageSize = val
      this.handleCurrentChange(1)
    },
    handleCurrentChange(val) {
      this.currentPage = val
      this.initTableData()
    },
    openEdit(row, isUpdate) {
      this.$emit('editCurrent', row, isUpdate)
    },
    clickMoveBtn() {
      this.$emit('clickMoveBtn')
    },
    toMove(data, successCallback) {
      const { foldId, name } = data
      this.closePopover()
      this.$DatablauCofirm(
        `确认将选中的数据迁移至[${name}]目录？`,
        this.$t('domain.common.warning'),
        {
          type: 'warning',
        }
      ).then(() => {
        this.toMoveLoading = true
        const domainIds = this.selection.map(item => {
          return {
            domainId: item.domainId,
            folderId: item.folderId,
          }
        })
        this.$http
          .post(this.$domain_url + `/domains/move?id=${foldId}`, domainIds)
          .then(res => {
            this.toMoveLoading = false
            this.$message.success('操作成功')
            successCallback && successCallback()
            this.handleCurrentChange(1)
          })
          .catch(e => {
            this.toMoveLoading = false
            this.$showFailure(e)
          })
      })
    },
    toAbandon() {
      this.closePopover()
      this.$DatablauCofirm(
        this.$t('domain.domain.abortDomainConfirm'),
        this.$t('domain.common.warning'),
        {
          type: 'warning',
        }
      )
        .then(() => {
          this.toAbandonLoading = true
          const domainIds = this.selection.map(item => item.domainId)
          const promiseList = []
          let processType = ''
          // if (this.typeIds > 4) {
          //   processType = '领域数据标准_废弃'
          // } else {
          //   processType =
          //     this.labelText.nameAbbr === this.$t('domain.common.indicator')
          //       ? '指标标准_废弃'
          //       : '数据标准_废弃'
          // }
          let ids = []
          domainIds.forEach(item => {
            ids.push(item)
          })
          promiseList.push(HTTP.abolish(ids))
          Promise.all(promiseList)
            .then(res => {
              this.toAbandonLoading = false
              this.$message.success(
                this.$t('domain.common.applyDiscardSucceed')
              )
              this.handleCurrentChange(1)
            })
            .catch(e => {
              this.toAbandonLoading = false
              this.$showFailure(e)
            })
        })
        .catch(() => {})
    },
    toChange() {
      this.closePopover()
      if (this.selection.length > 1) {
        this.$message.warning(this.$t('domain.domain.domainOnlyChooseOne'))
        return
      }
      this.openEdit(this.selection[0], true)
    },
    // 发布
    toPublish() {
      this.toPublishLoading = true
      const domainIds = this.selection.map(item => item.domainId)
      const promiseList = []
      // let processType = ''
      // if (this.typeIds > 4) {
      //   processType = '领域数据标准'
      // } else {
      //   processType =
      //     this.labelText.nameAbbr === this.$t('domain.common.indicator')
      //       ? '指标标准'
      //       : '数据标准'
      // }
      let ids = []
      domainIds.forEach(item => {
        ids.push(item)
      })
      promiseList.push(HTTP.publish(ids))

      Promise.all(promiseList)
        .then(res => {
          this.toPublishLoading = false
          this.$message.success(this.$t('domain.common.applyPublishSucceed'))
          this.handleCurrentChange(1)
        })
        .catch(e => {
          this.toPublishLoading = false
          this.$showFailure(e)
        })
    },
    toDelete() {
      this.$emit('deleteStandard', this.selection)
    },
    exportStandards(isAll) {
      this.messageState = this.$message({
        message: this.$t('domain.common.loadingExportText'),
        type: 'warning',
        showClose: true,
        duration: 0,
      })
      if (isAll) {
        const obj = {
          domainCode: this.searchFormData.domainCode,
          chineseName: this.searchFormData.domainName,
          domainState: this.searchFormData.stateValue,
          categoryId: this.typeIds,
          submitter: this.searchFormData.submitter,
          firstPublishStart: this.searchFormData.startTime,
          firstPublishEnd: this.searchFormData.endTime
            ? this.searchFormData.endTime + 1000 * 3600 * 24 - 1
            : null,
          orderColumn: this.orderColumn,
          ascOrder: this.ascOrder,
          currentPage: this.currentPage,
          pageSize: this.pageSize,
          descriptionDepartment: this.searchFormData.ownerOrg,
          tagIds: this.currentTag,
          udpKey: this.searchFormData.udpKey,
          udpValue: this.searchFormData.udpValue,
        }
        this.$downloadFilePost(HTTP.domainExportUrl(), obj)
      } else {
        if (!this.selection.length) {
          this.$message.info(this.$t('domain.code.exportCheckTooltip'))
          return
        }
        this.$downloadFilePost(HTTP.domainExportUrl(), {
          domainIds: this.selection.map(e => e.domainId),
          categoryId: this.typeIds,
        })
      }
    },
    disabledControl(state) {
      return (
        !this.selection.length ||
        this.selection.filter(e => e.state === state).length !==
          this.selection.length
      )
    },
    resetQuery() {
      this.searchFormData = {
        stateValue: null,
        domainName: '',
        bigVersionId: '',
        startTime: null,
        endTime: null,
        domainCode: '',
        submitter: '',
      }
      this.currentTag = null
      this.eventStartTime = []
      this.handleCurrentChange(1)
    },
    clearSelect(event) {},
    clickSelect(event) {},
    selectOwnerOrg(event) {
      if (event.relatedTarget && this.searchFormData.ownerOrg) {
        this.searchFormData.ownerOrg = ''
        this.ownerOrgOptions = null
        if (this.$refs.ownerChooseSelect && this.$refs.ownerChooseSelect.blur) {
          this.$refs.ownerChooseSelect.blur()
        }
      } else {
        if (this.$refs.ownerChooseSelect && this.$refs.ownerChooseSelect.blur) {
          this.$refs.ownerChooseSelect.blur()
        }
        this.$utils.branchSelect.open(false).then(res => {
          this.ownerOrgOptions = [res]
          // this.searchFormData.ownerOrg = res.bm
          this.$set(this.searchFormData, 'ownerOrg', res.bm)
        })
      }
    },
    subscribeRow(isHas, row) {
      clearTimeout(this.timer)
      this.timer = setTimeout(() => {
        let domainFolderId = this.data.data
          ? this.data.data.foldId
          : this.data.foldId
        if (!isHas) {
          this.$http
            .post(this.$baseurl + `/subscribe/add`, {
              flag: 0,
              objId: row.domainId,
              objectName: row.path.join('/') + '/' + row.chineseName,
              typeId: 80010066,
              domainFolderId,
            })
            .then(() => {
              this.$message.success(
                this.$t('domain.common.subscriptionSucceed')
              )
              // this.$getSubscribe()
              this.getSubscribeList().then(() => {
                this.initTableData()
              })
            })
            .catch(e => {
              this.$showFailure(e)
            })
        } else {
          let id = this.subscribeObjList.filter(
            e => e.objId === row.domainId
          )[0].id // number
          this.$http
            .post(this.$baseurl + '/subscribe/delete?subId=' + Number(id), {})
            .then(() => {
              this.$message.success(this.$t('domain.common.unsubscribeSucceed'))
              // this.$getSubscribe()
              this.getSubscribeList().then(() => {
                this.initTableData()
              })
            })
            .catch(e => {
              this.$showFailure(e)
            })
        }
      }, 800)
    },
    moreHandle(command) {
      this.$emit('moreHandle', command)
    },
    add() {
      this.$emit('add')
    },
    changeEventStartTime(data) {
      if (!data) {
        this.searchFormData.startTime = null
        this.searchFormData.endTime = null
      } else {
        this.eventStartTime = data
        this.searchFormData.startTime = data[0]
        this.searchFormData.endTime = data[1]
      }
    },
    changeDateChoose() {
      this.eventStartTime = null
      this.searchFormData.endTime = ''
      this.searchFormData.startTime = ''
    },
    toggleSeachMore() {
      this.showMoreSearchCondition = !this.showMoreSearchCondition
    },
  },
  watch: {
    tableLoading: {
      immediate: true,
      handler: function (newValue) {
        if (newValue) {
          this.tableData = null
        }
      },
    },
  },
}
