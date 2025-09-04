import HTTP from '@/http/main.js'

export default {
  props: {
    data: {},
    state: {},
    domainHasComment: {},
    typeIds: {},
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
  },
  beforeDestroy() {
    this.$bus.$off('hiddenMessage')
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
        itemName: '',
        bigVersionId: '',
        startTime: null,
        endTime: null,
        domainCode: '',
        ownerOrg: '',
        submitter: '',
      },
      ownerOrgOptions: [],
      submitterOrgOptions: [],
      timer: null,
      themeCategoryArr: [],
      themeArr: [],
      themeOption: [],

      stateOptions: [
        {
          label: this.$t('domain.common.all'),
          value: null,
        },
        {
          label: this.$t('domain.common.underReview'),
          value: 'C',
        },
        {
          label: this.$t('domain.common.pendingReview'),
          value: 'D',
        },
        {
          label: this.$t('domain.common.published'),
          value: 'A',
        },
        {
          label: this.$t('domain.common.obsolete'),
          value: 'X',
        },
      ],
      bigVersionList: [],
      currentPage: 1,
      pageSize: 20,
      total: 0,
      selection: [],
      subscribeObjList: [],
      subscribeList: [],
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
    }
  },
  computed: {},
  methods: {
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
      })
    },
    cancelTagSelect() {
      this.currentTag = null
      this.tagNames = null
      this.currentPage = 1
    },
    domResize(data) {
      let height = Number.parseFloat(data.height) - 88 + 110
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
        chineseName: this.searchFormData.chineseName,
        folderId: this.data.foldId || this.typeIds,
        orderColumn: this.orderColumn,
        ascOrder: this.ascOrder,
        currentPage: this.currentPage,
        pageSize: this.pageSize,
      }

      this.tableLoading = true
      HTTP.getFolderListService(obj)
        .then(res => {
          this.tableLoading = false
          res.data = {
            content: [
              {
                itemId: '7e5a0d6f69944914991c5a9e07f2f5d8',
                itemCode: 'cessssss',
                chineseName: 'test',
                englishName: 'test',
                abbreviation: 'test',
                businessDesc: 'test',
                folderId: 5,
                path: ['所有基础标准', '测试'],
                pathStr: '所有基础标准/测试',
                createTime: 1666856663629,
                lastModification: 1666856663659,
                autoGenCode: false,
              },
            ],
            totalItems: 1,
          }
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
    statusFormatter(status) {
      const param = {
        value: status,
      }
      switch (param.value) {
        case 'X':
          return this.$version.domain.status.deprecated
        case 'D':
          return this.$t('domain.common.pendingReview')
        case 'C':
          return this.$t('domain.common.underReview')
        case 'A':
          return this.$version.domain.status.adopted
      }
      return param.value
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
            .get(`${this.$url}/service/subscribe/`)
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
    openEdit(row) {
      this.$emit('editCurrent', row)
    },
    toAbandon() {
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
          domainIds.forEach(item => {
            const para = {
              requestBody: {
                processType: '数据标准_废弃',
                formDefs: [{ code: 'domainId', value: item }],
              },
            }
            promiseList.push(HTTP.publish(para))
          })
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
      if (this.selection.length > 1) {
        this.$message.warning(this.$t('domain.domain.domainOnlyChooseOne'))
        return
      }
      this.openEdit(this.selection[0], true)
    },
    toPublish() {
      this.toPublishLoading = true
      const domainIds = this.selection.map(item => item.domainId)
      const promiseList = []
      domainIds.forEach(item => {
        const para = {
          requestBody: {
            processType: '数据标准',
            formDefs: [{code: 'domainId', value: item}],
          },
        }
        promiseList.push(HTTP.publish(para))
      })
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
          chineseName: this.searchFormData.itemName,
          domainState: this.searchFormData.stateValue,
          categoryId: this.typeIds,
          submitter: this.searchFormData.submitter,
          firstPublishStart: this.searchFormData.startTime,
          firstPublishEnd: this.searchFormData.endTime,
          orderColumn: this.orderColumn,
          ascOrder: this.ascOrder,
          currentPage: this.currentPage,
          pageSize: this.pageSize,
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
        itemName: '',
        bigVersionId: '',
        startTime: null,
        endTime: null,
        domainCode: '',
        submitter: '',
      }
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
            .post(`${this.$url}/service/subscribe/`, {
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
              this.$getSubscribe()
              this.getSubscribeList().then(() => {
                this.initTableData()
              })
            })
            .catch(e => {
              this.$showFailure(e)
            })
        } else {
          this.$http
            .delete(
              `${this.$url}/service/subscribe/${
                this.subscribeObjList.filter(e => e.objId === row.domainId)[0]
                  .id
              }`,
              {}
            )
            .then(() => {
              this.$message.success(this.$t('domain.common.unsubscribeSucceed'))
              this.$getSubscribe()
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
      this.eventStartTime = data
      this.searchFormData.startTime = data[0]
      this.searchFormData.endTime = data[1]
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
