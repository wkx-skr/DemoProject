import standardDetail from './standardDetail.vue'
import quoto from './quoto.vue'
import scan from './standardScan.vue'
import HTTP from '@/http/main.js'

import treeCatalogue from '@/view/dataStandardCode/newTree.vue'
import {
  stateOptions,
  statusFormatter,
  getStatusColor,
  checkStatusFormatter,
} from '@/view/dataStandardGlossary/glossaryConstants'

export default {
  components: {
    treeCatalogue,
    standardDetail,
    quoto,
    scan,
  },
  props: {
    hasEditAuth: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      typeIds: 1,
      contentStatus: 'folder',
      currentTab: 'details',
      currentFolder: null,
      udps: [],
      searchFormData: {
        domainCode: '',
        domainName: '',
      },
      selection: [],
      tableData: [],
      tableLoading: false,
      currentPage: 1,
      pageSize: 20,
      total: 0,
      orderColumn: ['lastModification'],
      ascOrder: [false],
      stateOptions: stateOptions(this),
      statusFormatter,
      getStatusColor,
      checkStatusFormatter,
      newDomain: null,
      newDomainId: null,
      nodeData: [],
      domainHasComment: new Map(),
      toPublishLoading: false,
    }
  },
  inject: ['headerProduction'],
  computed: {
    labelText() {
      let obj = {}
      if (this.typeIds === 3) {
        obj = {
          typeName: this.$t('domain.common.dataDictionary'),
          standard: this.$t('domain.common.dictionaryInformation'),
          domainCode: this.$t('domain.common.dictionaryEncoding'),
          status: this.$t('domain.common.dictionaryState'),
          name: this.$t('domain.common.dictionaryName'),
          nameAbbr: this.$t('domain.common.dictionary'),
        }
      } else if (this.typeIds === 2) {
        obj = {
          typeName: this.$t('domain.common.indicator'),
          standard: this.$t('domain.common.indicatorInformation'),
          domainCode: this.$t('domain.common.indicatorCoding'),
          status: this.$t('domain.common.indicatorStatus'),
          name: this.$t('common.page.index'),
          nameAbbr: this.$t('domain.common.indicator'),
        }
      } else {
        obj = {
          typeName: this.$t('domain.common.dataStandard'),
          standard: this.$version.domain.propertyType.standard,
          domainCode: this.$version.domain.property.domainCode,
          status: this.$t('domain.common.standardStatus'),
          name: this.$t('domain.common.dataStandard'),
          nameAbbr: this.$t('domain.common.standard'),
        }
      }

      return obj
    },
    foldId() {
      return this.currentFolder?.foldId
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
  created() {},
  mounted() {
    this.getUdps()
    this.getList()
  },
  beforeDestroy() {},
  methods: {
    getUdps() {
      HTTP.getUpds({ categoryId: this.typeIds })
        .then(res => {
          let data = res.data
          if (data && Array.isArray(data)) {
            data = data.filter(
              item => item.bindFolderId - 0 === this.typeIds - 0
            )
          } else {
            data = []
          }
          this.udps = data
        })
        .catch(e => {
          this.$showFailure(e)
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
      this.getList()
    },
    tableSelectionChanged(selection) {
      this.selection = selection
    },
    setPath(nodeData) {
      this.nodeData = nodeData
    },
    getList(pageNum, reset) {
      if (reset) {
        this.searchFormData = {}
      }
      const obj = {
        domainCode: this.searchFormData.domainCode,
        chineseName: this.searchFormData.domainName,
        domainState: 'X',
        folderId: this.foldId || this.typeIds,
        orderColumn: this.orderColumn,
        ascOrder: this.ascOrder,
        currentPage: pageNum || this.currentPage,
        pageSize: this.pageSize,
        categoryId: this.typeIds,
      }

      this.tableLoading = true
      HTTP.getFolderListService(obj)
        .then(res => {
          this.tableData = res.data.content
          this.total = res.data.totalItems
        })
        .catch(e => {
          this.$showFailure(e)
        })
        .finally(() => {
          this.tableLoading = false
        })
    },
    disabledControl(state) {
      return (
        !this.selection.length ||
        this.selection.filter(e => e.state === state).length !==
          this.selection.length
      )
    },
    disabledControl2() {
      let flag = true
      flag = this.selection.every(item => {
        return item.state === 'X' || item.state === 'D'
      })
      return flag
    },
    openScan(domainObj) {
      setTimeout(() => {
        this.nowDomainId = domainObj.domainId
        this.nowDomain = domainObj
        this.currentTab = 'scan'
        this.contentStatus = 'scan'
      })
    },
    handleCurrentChange() {
      this.getList()
    },
    handleSizeChange() {
      this.getList()
    },
    toPublish() {
      this.toPublishLoading = true
      const domainIds = this.selection.map(item => item.domainId)
      const promiseList = []
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
      if (!this.selection?.length) {
        return
      }
      this.$DatablauCofirm(
        this.$version.domain.dialog.deleteConfirmTip.format(
          this.selection.length
        ),
        this.$version.domain.dialog.deleteConfirmTitle,
        {
          type: 'warning',
        }
      )
        .then(() => {
          const checkedIds = this.selection
            ? this.selection.map(e => e.domainId)
            : []
          this.isAdopting = true

          let postMehtod = this.$postLongList
          // if (!this.$ddmFirst) {
          postMehtod = HTTP.deleteDomainByIdsService
          // }
          postMehtod({
            method: 'post',
            requestUrl: this.$url + '/service/domains/deleteByIds',
            requestBody: checkedIds,
            listParameter: null,
            successCallback: () => {
              this.$message({
                title: this.$version.common.success,
                message: this.$version.common.operationSucceed,
                type: 'success',
              })
            },
            failureCallback: e => {
              this.$showFailure(e)
            },
            finallyCallback: () => {
              console.log('finallyCallback')
              this.isAdopting = false
            },
          })
        })
        .catch(() => {})
    },
    handleItemClicked(data, node) {
      this.contentStatus = 'folder'
      this.currentFolder = data
      this.$nextTick(() => {
        this.getList(1)
      })
    },
    goBack() {
      this.contentStatus = 'folder'
    },
  },
}
