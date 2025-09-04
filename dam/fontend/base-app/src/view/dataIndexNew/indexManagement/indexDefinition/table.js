import HTTP from '@/http/main.js'
import UserInformationService from '@service/UserInformationService'
import udps from './udps.vue'
import { IndexType, IndexTypeLabel } from './class/Enum'
import { IndexPage, CategoryId } from './entrance/Constant.ts'
export default {
  props: {
    indexPage: IndexPage,
  },
  components: {
    udps,
  },
  data() {
    return {
      IndexType: IndexType,
      CategoryId: CategoryId,
      IndexPage: IndexPage,
      IndexTypeLabel: IndexTypeLabel,
      folderId: null,
      folderDetail: {},
      isRoot: true,
      headerKey: 0,
      tableData: null,
      keyword: '',
      conditions: {
        state: '',
        businessDepartment: '',
        labels: [],
      },
      tableLoading: false,
      searchFormData: {
        stateValue: null,
        domainName: '',
        // bigVersionId: '',
        startTime: null,
        endTime: null,
        // domainCode: '',
        // ownerOrg: '',
        submitter: '',
        metricsType: null,
      },
      stateOptions: [
        {
          label: this.$t('indicator.definition.stateOption.ALL'),
          value: null,
        },
        {
          label: this.$t('indicator.definition.stateOption.C'),
          value: 'C',
        },
        {
          label: this.$t('indicator.definition.stateOption.D'),
          value: 'D',
        },
        {
          label: this.$t('indicator.definition.stateOption.A'),
          value: 'A',
        },
        {
          label: this.$t('indicator.definition.stateOption.X'),
          value: 'X',
        },
      ],
      alwaysShowFilters: undefined,
      showMoreFilters: false,
      judgeComponentCallback: () => {
        this.judgeComponentContainerWidth()
      },
      orderColumn: ['domainCode'],
      ascOrder: [false],
      currentPage: 1,
      pageSize: 20,
      total: 0,
      selection: [],
      isAdopting: false,
      toPublishLoading: false,
      toAbandonLoading: false,
      userMap: {},
      // 扩展属性
      showUdps: false,
      // END of 扩展属性
    }
  },
  mounted() {
    this.judgeComponentContainerWidth()
    $(window).resize(this.judgeComponentCallback)
    // this.getData()
  },
  beforeDestroy() {
    $(window).unbind('resize', this.judgeComponentCallback)
  },
  methods: {
    getDataFromFolder(folder) {
      this.isRoot = !folder.hasOwnProperty('parentId')
      this.folderId = folder.foldId
      this.folderDetail.name = folder.name
      this.folderDetail.description = folder.description
      this.currentPage = 1
      this.getData()
    },
    updateCategoryMessage(category) {
      if (this.folderId === category.id) {
        this.folderDetail.name = category.name
        this.folderDetail.description = category.description
        this.headerKey++
      }
    },
    handleSearch() {
      this.currentPage = 1
      this.getData()
    },
    getData() {
      this.initTableData()
    },
    exportSelection() {
      const url = `${this.$metric_url}metricManagement/exportMetric`
      const condition = this.prepareSearchCondition()
      condition.domainIds = this.selection.map(e => e.domainId)
      this.$downloadFilePost(url, condition)
    },
    prepareSearchCondition() {
      const obj = {
        keyword: this.searchFormData.domainName,
        domainState: this.searchFormData.stateValue,
        folderId: this.folderId,
        submitter: this.searchFormData.submitter,
        firstPublishStart: this.searchFormData.startTime,
        firstPublishEnd: this.searchFormData.endTime
          ? this.searchFormData.endTime + 1000 * 3600 * 24 - 1
          : null,
        ownerOrg: this.searchFormData.ownerOrg,
        metricsType: this.searchFormData.metricsType,
        orderColumn: this.orderColumn,
        ascOrder: this.ascOrder,
        currentPage: this.currentPage,
        pageSize: this.pageSize,
        categoryId: CategoryId[this.indexPage],
      }
      return obj
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
        this.orderColumn[0] = 'domainCode'
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
      this.tableLoading = true
      HTTP.getFolderListServiceNew(this.prepareSearchCondition())
        .then(res => {
          this.tableLoading = false
          this.tableData = res.data.content || []
          this.total = res.data.totalItems
        })
        .catch(e => {
          this.tableLoading = false
          this.$showFailure(e)
        })
        .then(() => {
          const users =
            Array.isArray(this.tableData) &&
            this.tableData.map(i => i.submitter)
          this.getNameByUserName(users)
        })
    },
    getNameByUserName(users) {
      users &&
        users.length &&
        UserInformationService.getUsernames(users).then(map => {
          map.forEach((item, index) => {
            this.$set(this.userMap, index, item)
          })
        })
    },
    handleKeywordChange() {},
    handleConditionsChange() {},
    showFilterTag() {
      this.showMoreFilters = !this.showMoreFilters
    },
    judgeComponentContainerWidth() {
      const width = parseInt($(this.$el).css('width'))
      this.alwaysShowFilters = width >= 1200
    },
    handleSizeChange(pageSize) {
      this.pageSize = pageSize
      this.currentPage = 1
      this.getData()
    },
    handleCurrentChange(current) {
      this.currentPage = current
      this.getData()
    },
    handleSelectionChange(val) {
      this.selection = val
    },
    handleAddCommand(command) {
      this[command]()
    },
    importIndex() {
      this.$refs.uploadBtn.$el.click()
    },
    onUploadSuccess() {
      this.$datablauMessage.success(this.$t('domain.glossary.importSuccessful'))
      this.$emit('update-tree')
      this.getData()
    },
    onUploadError(err) {
      this.$showUploadFailure(err)
    },
    exportIndex() {
      const url = `${this.$metric_url}metricManagement/exportMetric`
      this.$downloadFilePost(url, this.prepareSearchCondition())
    },
    downloadTemplate() {
      const url = `${
        this.$metric_url
      }metricManagement/downloadMetricTemplate?categoryId=${
        CategoryId[this.indexPage]
      }`
      this.$downloadFilePost(url)
    },
    staticAdd() {
      this.$emit('add-item', IndexType.BASIC)
    },
    staticAdd2() {
      this.$emit('add-item', IndexType.DERIVE)
    },
    staticAdd3() {
      this.$emit('add-item', IndexType.FORK)
    },
    handleView(row) {
      this.$emit('view-item', row)
    },
    handleEdit(row) {
      // 含工作流的编辑，适合已发布的
      this.$emit('edit-item', row)
    },
    toUpdate(row) {
      // 不含工作流的编辑，适合待审核的
      this.$emit('update-item', row)
    },
    statusFormatter(status) {
      return this.$t('indicator.definition.stateOption.' + status)
    },
    getStatusColor(statue) {
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
    },
    disabledControl(state) {
      return (
        !this.selection.length ||
        this.selection.filter(e => e.state === state).length !==
          this.selection.length
      )
    },
    deleteSingleStandard(row) {
      this.deleteStandard([{ domainId: row.domainId }])
    },
    deleteStandard(selectionFromOtherFunction) {
      const selection = selectionFromOtherFunction || this.selection
      const self = this
      this.$DatablauCofirm(
        '将要删除这' + selection.length + '个指标,是否继续?',
        '提示',
        {
          type: 'warning',
        }
      )
        .then(() => {
          const checkedIds = selection.map(e => e.domainId)
          this.isAdopting = true
          let postMethod = HTTP.$postLongList
          postMethod({
            method: 'post',
            requestUrl: `${this.$metric_url}/domains/domain/deleteDomainByIds`,
            requestBody: checkedIds,
            listParameter: null,
            successCallback: () => {
              self.$message({
                title: this.$version.common.success,
                message: this.$version.common.operationSucceed,
                type: 'success',
              })
              this.getData()
            },
            failureCallback: e => {},
            finallyCallback: () => {
              this.isAdopting = false
            },
          })
        })
        .catch(() => {})
    },
    testToPublish() {
      const selection = this.selection
      const promises = []
      selection.forEach(item => {
        item.state = 'A'
        promises.push(
          new Promise((resolve, reject) => {
            this.$http
              .post(`${this.$metric_url}domains/domain/updateDomain`, item)
              .then(res => {
                this.$datablauMessage.success('修改成功')
                resolve()
              })
              .catch(e => {
                reject()
                this.$showFailure(e)
              })
          })
        )
      })
      Promise.all(promises).finally(() => {
        this.getData()
      })
    },
    toPublish() {
      this.toPublishLoading = true
      const domainIds = this.selection.map(item => item.domainId)
      const promiseList = []
      domainIds.forEach(item => {
        // const para = {
        //   requestBody: {
        //     processType: '指标标准',
        //     formDefs: [{ code: 'domainId', value: item }]
        //   }
        // }
        promiseList.push(item)
      })
      this.$http
        .post(`${this.$metric_url}flow/domain/applyPublish`, promiseList)
        .then(res => {
          this.toPublishLoading = false
          this.$message.success(this.$t('assets.common.publishSuccess'))
          this.getData()
        })
        .catch(e => {
          this.toPublishLoading = false
          this.$showFailure(e)
        })
    },
    toChange() {
      if (this.selection.length > 1) {
        this.$message.warning(
          this.$t('indicator.definition.domainOnlyChooseOne')
        )
        return
      }
      this.handleEdit(this.selection[0])
    },
    testToAbandon() {
      const selection = this.selection
      const promises = []
      selection.forEach(item => {
        item.state = 'X'
        promises.push(
          new Promise((resolve, reject) => {
            this.$http
              .post(`${this.$metric_url}domains/domain/updateDomain`, item)
              .then(res => {
                this.$datablauMessage.success('修改成功')
                resolve()
              })
              .catch(e => {
                reject()
                this.$showFailure(e)
              })
          })
        )
      })
      Promise.all(promises).finally(() => {
        this.getData()
      })
    },
    toAbandon() {
      this.$DatablauCofirm(
        '将要废弃这' + this.selection.length + '个指标,是否继续?',
        this.$t('domain.common.warning'),
        {
          type: 'warning',
        }
      )
        .then(() => {
          this.toAbandonLoading = true
          const domainIds = this.selection.map(item => item.domainId)
          const promiseList = []
          domainIds.forEach(item => {
            // const para = {
            //   requestBody: {
            //     processType: '指标标准_废弃',
            //     formDefs: [{ code: 'domainId', value: item }]
            //   }
            // }
            promiseList.push(item)
          })
          this.$http
            .post(`${this.$metric_url}flow/domain/applyAbolish`, promiseList)
            // Promise.all(promiseList)
            .then(res => {
              this.toAbandonLoading = false
              this.$message.success(
                this.$t('domain.common.applyDiscardSucceed')
              )
              this.handleCurrentChange(1)
            })
            .catch(e => {
              this.toAbandonLoading = false
              // this.$message.error(e.errorMessage)
              this.$showFailure(e)
            })
        })
        .catch(() => {})
    },
    showUdpDialog() {
      this.showUdps = true
    },
    getUdps() {
      this.$emit('get-udps')
    },
  },
  computed: {
    multipleLength() {
      if (this.selection) {
        return this.selection.length
      } else {
        return 0
      }
    },
    uploadRequestBody() {
      return {
        categoryId: CategoryId[this.indexPage],
      }
    },
  },
}
