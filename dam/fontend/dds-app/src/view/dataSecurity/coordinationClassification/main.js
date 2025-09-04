import ResizeHorizontal from '@/components/common/ResizeHorizontal'
import AssetsUpload from '../components/assetsUpload.vue'
import isShowTooltip from '@/view/dataSecurity/components/isShowTooltip.vue'
import API from '@/view/dataSecurity/util/api'
import { dumpMetaDetail } from '@/view/dataSecurity/util/util'
import classifyTree from '@/view/dataSecurity/components/classifyTree.vue'
import _ from 'lodash'
export default {
  components: {
    AssetsUpload,
    isShowTooltip,
    classifyTree,
  },
  data() {
    return {
      listShow: true,
      combStatusMap: {},
      uncombList: [],
      unreviewedList: [],
      publishedList: [],
      notCombList: [],
      showInfoItem: false,
      loading: false,
      deptName: '',
      searchBoxH: 0,
      defaultProps: {
        children: 'dataSources',
        label: 'name',
        isLeaf: 'leaf',
      },
      pageSearchParams: {
        systemId: '',
        datasourceId: '',
        modelId: '',
        schemaName: '',
      },
      assetKeywords: '',
      typeIconMap: {
        80000004: 'biao',
        80500008: 'shitu',
        80000005: 'ziduan',
      },
      assetsTypeList: [],
      form: {
        page: 1,
        size: 20,
        assetsName: '',
        sort: '',
        orderBy: '',
      },
      defaultSort: {
        prop: 'submissionTime',
        order: '',
      },
      assetList: [],
      total: 0,
      showImport: false,
      assetsTotal: {
        UN_COMB: 0,
        UN_CONFIRMED: 0,
        PUBLISH: 0,
        NOT_COMB: 0,
        PENDING_REVIEW: 0,
      },
      cardingStatus: 'UN_COMB',
      percent: 0,
      treeData: [],
      treeStructure: {},
      systemOptions: [],
      gatherDataList: [],
      dataSourceOptions: [],
      schemaOptions: [],
      currentClassfication: null,
      selAssetsList: [80000005],
      selectedUncombList: [],
      selectedUnreviewList: [],
      selectedPublishList: [],
      selectedNotcombList: [],
      currentSecurityLevel: '',
      showSecurityPopover: false,
      securityOptions: [],
      showModifyClassificationDialog: false,
      targetClassification: null,
      exportBtnDisabled: false,
      scanVisible: false,
      dotTab: {
        UN_COMB: false,
        UN_CONFIRMED: false,
        PUBLISH: false,
        NOT_COMB: false,
      },
      confirmVisible: false,
      typeMap: {},
      sourceStatusTimer: null,
      listStatus: '',
      assetsNameList: ['数据项'],
      supportList: [],
      logicalModelNo: true,
    }
  },
  mounted() {
    this.combStatusMap = {
      UN_COMB: this.$t('coordination.unComb'),
      UN_CONFIRMED: this.$t('coordination.confirmed'),
      PUBLISH: this.$t('coordination.publish'),
      NOT_COMB: this.$t('coordination.notComb'),
    }
    this.assetsTypeList = [
      {
        value: 80000004,
        label: this.$t('securityModule.table'),
        type: 'TABLE',
        selected: false,
      },
      {
        value: 80500008,
        label: this.$t('securityModule.shitu'),
        type: 'VIEW',
        selected: false,
      },
      {
        value: 80000005,
        label: this.$t('securityModule.dataItem'),
        type: 'DATA_OBJECT',
        selected: true,
      },
    ]
    this.typeMap = {
      DATA_OBJECT: this.$t('securityModule.dataItem'),
      TABLE: this.$t('securityModule.table'),
      VIEW: this.$t('securityModule.shitu'),
      80000004: this.$t('securityModule.table'),
      80500008: this.$t('securityModule.shitu'),
    }
    this.initResizeHorizontal()
    this.init()
  },
  methods: {
    handleData(data) {
      let typeList = []
      data.map(item => {
        let newMap = {}
        let newList = []
        switch (item.level) {
          case 1:
            newMap.name = this.$t('coordination.oneFloor')
            break
          case 2:
            newMap.name = this.$t('coordination.twoFloor')
            break
          case 3:
            newMap.name = this.$t('coordination.threeFloor')
            break
          case 4:
            newMap.name = this.$t('coordination.fourFloor')
            break
          case 5:
            newMap.name = this.$t('coordination.fiveFloor')
            break
          default:
            break
        }
        if (item.assetsTypes.includes('TABLE')) {
          newList.push(this.$t('securityModule.table'))
        }
        if (item.assetsTypes.includes('VIEW')) {
          newList.push(this.$t('securityModule.shitu'))
        }
        if (item.assetsTypes.includes('DATA_OBJECT')) {
          newList.push(this.$t('securityModule.dataItem'))
        }
        newMap.type = newList.join(',')
        typeList.push(newMap)
      })
      this.supportList = typeList
    },
    // 给数字添加千位符
    formatNum(num) {
      var str = num.toString()
      var reg =
        str.indexOf('.') > -1 ? /(\d)(?=(\d{3})+\.)/g : /(\d)(?=(?:\d{3})+$)/g
      return str.replace(reg, '$1,')
    },
    getTotal(assetsTotal) {
      let total = 0
      if (assetsTotal.PENDING_REVIEW) {
        total =
          assetsTotal.UN_COMB +
          assetsTotal.UN_CONFIRMED +
          assetsTotal.PUBLISH +
          assetsTotal.NOT_COMB +
          assetsTotal.PENDING_REVIEW
      } else {
        total =
          assetsTotal.UN_COMB +
          assetsTotal.UN_CONFIRMED +
          assetsTotal.PUBLISH +
          assetsTotal.NOT_COMB
      }
      var str = total.toString()
      var reg =
        str.indexOf('.') > -1 ? /(\d)(?=(\d{3})+\.)/g : /(\d)(?=(?:\d{3})+$)/g
      return str.replace(reg, '$1,')
    },
    getAssetRowKeys(row) {
      return row.objectId
    },
    // 页面初始化
    async init() {
      await this.getSystem()
      const firstCategoryId = (this.systemOptions[0] || {}).categoryId
      this.pageSearchParams.systemId = firstCategoryId
      firstCategoryId && this.gatherList(firstCategoryId)
      this.getList()
      this.getStatistics()
      this.getSpeed()
    },
    // 查询业务系统
    async getSystem() {
      try {
        const systemRes = await API.getBusinessSystemList()
        if (systemRes.data) {
          const result = systemRes.data.data || []
          this.systemOptions = result
        }
      } catch (error) {
        this.$showFailure(error)
      }
    },
    // 查询采集源
    gatherList(id) {
      API.realAataSourceListApi(id)
        .then(res => {
          this.gatherDataList = res.data.data || []
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    // 查询数据源
    getDataSource(id) {
      API.virDataSourceListApi(id)
        .then(res => {
          if (res.data) {
            this.dataSourceOptions = res.data.data || []
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    // 查询schema
    getSchema(id) {
      API.getSchemaList(id).then(res => {
        if (res.data) {
          this.schemaOptions = res.data.data || []
        }
      })
    },
    // 懒加载分类树
    async loadTreeData(node, resolve) {
      const treeRes = await API.getClassifyTree(
        node.level === 0 ? 0 : node.data.id
      )
      const catalogVos = treeRes.data.DataSecurityStructureVo.catalogVos
      if (node.level === 0) {
        this.treeData = catalogVos
        this.treeStructure = treeRes.data.DataSecurityStructureVo
      }
      this.$utils.sort.sortConsiderChineseNumber(catalogVos, 'name')
      resolve(catalogVos)
    },
    domResize() {
      const searchBox = this.$refs.searchBox
      const h = $(searchBox).height()
      this.searchBoxH = h + 'px'
    },
    initResizeHorizontal() {
      setTimeout(() => {
        new ResizeHorizontal({
          leftDom: $('.tree-box'),
          middleDom: $('.resize-column-middle'),
          rightDom: $('.right-box'),
          noCrack: true,
          minWith: { leftMinWidth: 240 },
        })
      }, 1000)
    },
    handleNodeClick(data) {
      if (this.showModifyClassificationDialog) {
        this.targetClassification = data
      } else {
        if (!data) {
          this.currentClassfication = null
          this.getList()
        }
        this.currentClassfication = data
      }
    },
    dataIconFunction(data, node) {
      if (node.expanded) {
        return 'iconfont icon-openfile'
      } else {
        return 'iconfont icon-file'
      }
    },
    filterNode(value, data, node) {
      if (!value) return true
      return data.name.indexOf(value) !== -1
    },
    handleSystemChange(id) {
      // 查询当前业务系统下的数据源
      // 1. 数据源、schema清空
      // 2. 查询梳理进度
      // 3. 统计当前业务系统下的各资产状态统计值
      // 4. tab切换至‘未梳理’
      // 5. 重新获取未梳理的表、视图、字段
      this.pageSearchParams.datasourceId = ''
      this.pageSearchParams.modelId = ''
      this.schemaOptions = []
      this.pageSearchParams.schemaName = ''
      this.dataSourceOptions = []
      this.listStatus = ''
      this.form.sort = ''
      this.handleClick({ name: 'UN_COMB' })
      this.gatherList(id)
      this.getSpeed()
      this.getStatistics()
    },
    // 数据源更新完成后的提示
    fullfiledTips(modelId) {
      const currentModel = this.dataSourceOptions.find(
        item => item.modelId === modelId
      )
      if (
        this.$route.path === '/main/coordinationClassification' &&
        this.pageSearchParams.modelId === modelId
      ) {
        this.$datablauMessage.success(this.$t('coordination.updateCom'))
        this.scanVisible = false
        this.updatePageData()
      } else {
        this.$notify({
          message: `${
            this.$route.path === '/main/coordinationClassification'
              ? ''
              : this.$t('coordination.coorTip')
          }${this.$t('coordination.coorTip1', {
            definition: currentModel.definition,
          })}`,
          type: 'success',
        })
      }
    },
    // 数据源更新状态
    getSourceStatus(modelId) {
      if (modelId) {
        API.notScanAgain(modelId)
          .then(res => {
            // data.status  没有的时候，不需要更新， 1为正在更新 2为更新完成
            const status = res.data.data.status
            this.listStatus = status
            switch (status) {
              case 'updating':
                if (!this.sourceStatusTimer) {
                  this.sourceStatusTimer = setInterval(() => {
                    this.getSourceStatus(modelId)
                  }, 3000)
                } else {
                  this.updatePageData()
                }
                break
              case 'completed':
                if (this.sourceStatusTimer) {
                  this.fullfiledTips(modelId)
                  clearInterval(this.sourceStatusTimer)
                  this.sourceStatusTimer = null
                } else {
                  this.updatePageData()
                }
                break
              case 'prepare':
                this.updatePageData()
                break
              default:
                break
            }
          })
          .catch(error => {
            this.assetList = []
            this.total = 0
            this.$showFailure(error)
          })
      }
    },
    updatePageData() {
      this.getList()
      this.getSpeed()
      this.getStatistics()
    },
    handleGatherChange(id) {
      this.gatherDataList.forEach(element => {
        if (element.modelId === id) {
          if (element.type === 'DATADICTIONARY_LOGICAL') {
            this.logicalModelNo = false
            this.getSourceStatus(id)
          } else {
            this.logicalModelNo = true
          }
        }
      })
      this.pageSearchParams.modelId = ''
      this.schemaOptions = []
      this.pageSearchParams.schemaName = ''
      this.dataSourceOptions = []
      this.listStatus = ''
      this.handleClick({ name: 'UN_COMB' })
      if (id) {
        this.getDataSource(id)
      }
      this.getSpeed()
      this.getStatistics()
    },
    handleSourceChange(id) {
      // 1. 查询当前数据源下的schema
      // 2. 清空当前schema值
      // 3. 获取梳理进度
      // 4. tab页切换至'未梳理'
      // 5. 获取各状态下的统计数字
      // 6. 获取未梳理的表、视图、字段
      // this.getSchema(id)
      this.schemaOptions = []
      this.pageSearchParams.schemaName = ''
      this.dataSourceOptions.map(item => {
        if (parseFloat(item.modelId) === parseFloat(id)) {
          this.pageSearchParams.schemaName = item.schema || item.database
          this.schemaOptions = [item.schema || item.database]
        }
      })
      this.handleClick({ name: 'UN_COMB' }, false)
      clearInterval(this.sourceStatusTimer)
      this.sourceStatusTimer = null
      if (id) {
        this.getSourceStatus(this.pageSearchParams.modelId)
      } else {
        this.getList()
        this.listStatus = ''
      }
    },
    handleSchemaChange() {
      // 1. 获取当前schema下的梳理进度
      // 2. 获取当前schema下各资产的统计值
      // 3. tab页切换至‘未梳理’
      // 4. 获取当前schema下 未梳理的表、字段、视图
      this.handleClick({ name: 'UN_COMB' })
      this.getSpeed()
      this.getStatistics()
    },
    // 重新扫描
    scan() {
      // 调接口，开始扫描任务，重新扫描全系统未梳理的表、视图、字段
      this.$datablauMessage.success(this.$t('coordination.scanTip'))
    },
    scanByModel() {
      const currentModel = this.dataSourceOptions.find(
        item => item.modelId === this.pageSearchParams.modelId
      )
      this.loading = true
      this.listStatus = 'updating'
      this.scanVisible = false
      API.scanByModelId(
        this.pageSearchParams.datasourceId,
        this.logicalModelNo
          ? this.pageSearchParams.modelId
          : this.pageSearchParams.datasourceId
      )
      setTimeout(() => {
        this.getSourceStatus(
          // this.logicalModelNo === false
          //   ? this.pageSearchParams.modelId
          //   : this.pageSearchParams.datasourceId
          this.pageSearchParams.datasourceId
        )
        this.handleClick({ name: 'UN_COMB' })
        this.loading = false
      }, 3000)
    },
    // 导入数据资产
    importAssets() {
      this.showImport = true
    },
    cancelImportAssets() {
      this.showImport = false
    },
    exportAssets() {
      let params
      if (this.selectedList && this.selectedList.length !== 0) {
        // 导出已选
        params = this.selectedList.map(item => item.objectId)
        API.exportSelectedAssets(params, this.cardingStatus).then(res => {
          this.$refs.assetTable.clearSelection()
          this.$bus.$emit('getTaskJobResult', res.data, 'export')
        })
      } else {
        // 导出全部
        this.exportBtnDisabled = true
        params = {
          status: this.cardingStatus,
          ...this.pageSearchParams,
          assetName: this.assetKeywords,
          types: this.selAssetsList,
          catalogId:
            this.cardingStatus !== 'UN_COMB'
              ? this.currentClassfication
                ? this.currentClassfication.id
                : ''
              : '',
          pageNum: 1,
          pageSize: 20,
          orderBy: '',
          sort: '',
        }
        API.exportAllAssets(params)
          .then(res => {
            this.$refs.assetTable.clearSelection()
            this.exportBtnDisabled = false
            this.$bus.$emit('getTaskJobResult', res.data, 'export')
          })
          .catch(error => {
            this.exportBtnDisabled = false
            this.$showFailure(error)
          })
      }
    },
    // 统计
    getStatistics() {
      const { systemId, modelId, schemaName } = this.pageSearchParams
      const params = {
        categoryId: systemId,
        datasourceId: this.pageSearchParams.datasourceId,
        modelId,
        schema: schemaName,
        types: this.selAssetsList,
      }
      API.getStatistics(params)
        .then(res => {
          this.listShow = true
          const result = res.data.data || []
          Object.keys(this.assetsTotal).forEach(key => {
            const rsItem = result.find(item => item.combStatus === key)
            rsItem
              ? (this.assetsTotal[key] = rsItem.count)
              : (this.assetsTotal[key] = 0)
          })
        })
        .catch(e => {
          this.listShow = false
          this.$showFailure(e)
        })
    },
    // 获取梳理进度
    getSpeed() {
      const params = {
        categoryId: this.pageSearchParams.systemId,
        datasourceId: this.pageSearchParams.datasourceId,
        modelId: this.pageSearchParams.modelId,
        schema: this.pageSearchParams.schemaName,
        types: this.selAssetsList,
      }
      API.getSpeed(params)
        .then(res => {
          this.percent = parseFloat(res.data.data)
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    getDefaultOrder() {
      let orderBy = ''
      // console.log(this.cardingStatus)
      switch (this.cardingStatus) {
        case 'UN_COMB':
          orderBy = 'submissionTime'
          break
        case 'PUBLISH':
          orderBy = 'publishTime'
          break
        default:
          orderBy = 'checkTime'
      }
      return orderBy
    },
    // 获取资产盘点列表
    getList(defaultParams) {
      // 如果 当前用户下的应用系统为空 不进行查询
      if (this.systemOptions.length) {
        const selectedList = _.cloneDeep(this.selectedList)
        const params = {
          status: this.cardingStatus,
          ...this.pageSearchParams,
          assetName: this.assetKeywords,
          types: this.selAssetsList,
          // 如果当前tab是“待梳理”，查询结果需不与数据分类联动，否则需联动
          catalogId:
            this.cardingStatus === 'UN_COMB'
              ? ''
              : this.currentClassfication
              ? this.currentClassfication.id
              : '',
          pageNum: this.form.page,
          pageSize: this.form.size,
          orderBy: this.form.orderBy || this.getDefaultOrder(),
          sort: this.form.sort || 'DESC',
          ...defaultParams,
          datasourceId: this.pageSearchParams.datasourceId,
        }
        this.assetList = null
        API.getAssetsData(params)
          .then(res => {
            let logicalInfoArr = []
            res.data.data.content.forEach(item => {
              if (item.type === 80000004 || item.type === 80000005) {
                logicalInfoArr.push(item.objectId)
              }
            })
            this.getLogicalInfo(logicalInfoArr)
            if (
              params.assetName === this.assetKeywords &&
              params.types === this.selAssetsList &&
              params.systemId === this.pageSearchParams.systemId &&
              params.modelId === this.pageSearchParams.modelId &&
              params.schemaName === this.pageSearchParams.schemaName &&
              params.status === this.cardingStatus
            ) {
              this.total = res.data.data.totalItems
              const assets = res.data.data.content || []
              assets.map(item => {
                item.assetsType = (
                  this.assetsTypeList.find(
                    type => parseInt(type.value) === item.type
                  ) || {}
                ).type
              })
              this.assetList = assets || []
              this.loading = false
              this.form = {
                ...this.form,
                page: params.pageNum,
                size: params.pageSize,
                orderBy: params.orderBy,
                sort: params.sort,
              }
              this.$nextTick(() => {
                // console.log(selectedList)
                this.assetList.forEach(row => {
                  this.$refs.assetTable.$refs.table.toggleRowSelection(
                    row,
                    !!selectedList.find(item => item.id === row.id)
                  )
                })
              })
            }
          })
          .catch(e => {
            this.total = 0
            this.assetList = []
            this.loading = false
          })
      } else {
        this.loading = false
        this.assetList = []
      }
    },
    getLogicalInfo(logicalInfoArr) {
      this.$http
        .post('/metadata/entities/getLogicalInfo', logicalInfoArr)
        .then(res => {
          this.assetList.forEach(element => {
            this.$set(element, 'logical', res.data[Number(element.objectId)])
          })
        })
        .catch(e => {
          this.failureCallback(e)
        })
    },
    // 获取梳理状态名字
    getCardingStatusName(type, num = 1) {
      let result = ''
      let name = ''
      let output = ''
      this.cardingStatusList.map(item => {
        if (item.name === type) {
          result = item.combStatus
        }
        if (item.type === type) {
          name = item.name
        }
      })
      switch (num) {
        case 1:
          output = result
          break
        case 2:
          output = name
          break
        default:
          break
      }
      return output
    },
    // 获取盘点模式名字
    getModeName(type) {
      let result = ''
      this.countingModeList.map(item => {
        if (item.type === type) {
          result = item.name
        }
      })
      return result
    },
    // 关联信息项  子组件传来的方法
    clickChild(name, options) {
      switch (name) {
        case 'addStandard':
          if (options.type === 'close') {
          }
          if (options.type === 'submit') {
          }
          this.showInfoItem = false
          break
        case 'assetsUpload':
          if (options.type === 'close') {
            this.showImport = false
          }
          if (options.type === 'sure') {
            this.$refs.uploadAssets.$refs.assetsUpload.$refs.upload.submit()
          }
          if (options.type === 'refresh') {
            this.getSpeed()
            this.getStatistics()
            this.handleClick({ name: 'UN_COMB' })
            // if (
            //   options.data.UN_CONFIRMED &&
            //   this.cardingStatus !== 'UN_CONFIRMED'
            // )
            //   this.dotTab.UN_CONFIRMED = true
            // if (options.data.PUBLISH && this.cardingStatus !== 'PUBLISH')
            //   this.dotTab.PUBLISH = true
          }
          break
        case 'classifyTree':
          console.log(options)
          if (options) {
            this.handleNodeClick(options.data)
          } else {
            this.handleNodeClick(null)
          }
          break
        case 'addUnConfirmed':
          this.currentClassfication = options.data
          // 添加到待确认
          this.addToUnConfirmed()
          break
        case 'detailVos':
          // 获取支持资产类型
          this.handleData(options.typeList)
          break
        default:
          break
      }
    },
    query() {
      this.form.page = 1
      this.getList()
      this.getSpeed()
      this.getStatistics()
    },
    reset() {
      this.form = {
        size: 20,
        page: 1,
        system: '',
        keyword: '',
        status: '',
        sachema: '',
      }
      this.getList()
      this.getSpeed()
      this.getStatistics()
    },
    handleClick(tab, refreshTable = true) {
      this.form.sort = ''
      this.$refs.assetTable.clearSort()
      this.cardingStatus = tab.name
      if (tab.name === 'UN_CONFIRMED' || tab.name === 'PUBLISH') {
        this.$refs.classifyTree.handleAllTree()
      }
      this.dotTab[tab.name] = false
      this.form.orderBy = this.getDefaultOrder()
      this.selectedUncombList = []
      this.selectedUnreviewList = []
      this.selectedPublishList = []
      this.selectedNotcombList = []
      this.currentClassfication = null
      this.$refs.classifyTree &&
        this.$refs.classifyTree.$refs.tree.setCurrentKey(null)
      this.$refs.assetTable.clearSelection()
      if (refreshTable) {
        this.getList({
          // pageSize: 20,
          pageNum: 1,
        })
        this.getSpeed()
        this.getStatistics()
      }
    },
    handleSelectChange(selection) {
      // console.log(selection)
      if (this.cardingStatus === 'UN_COMB') this.selectedUncombList = selection
      if (this.cardingStatus === 'UN_CONFIRMED')
        this.selectedUnreviewList = selection
      if (this.cardingStatus === 'PUBLISH') this.selectedPublishList = selection
      if (this.cardingStatus === 'NOT_COMB')
        this.selectedNotcombList = selection
    },
    sortChange({ column, order, prop }) {
      // console.log(order, prop)
      let propName = ''
      switch (prop) {
        case 'createTime':
          propName = 'submissionTime'
          break
        case 'publishTime':
          propName = 'publishTime'
          break
        case 'combTime':
          propName = 'checkTime'
          break
        default:
          break
      }
      this.form.sort = order ? (order === 'ascending' ? 'ASC' : 'DESC') : 'DESC'
      this.form.orderBy = propName
      this.form.page = 1
      this.getList()
      this.getSpeed()
      this.getStatistics()
    },
    handlePageChange(val) {
      this.form.page = val
      this.getList()
      this.getSpeed()
      this.getStatistics()
    },
    handleSizeChange(val) {
      this.form.size = val
      this.form.page = 1
      this.getList()
      this.getSpeed()
      this.getStatistics()
    },
    toCheckAssetDetails(asset) {
      let params = {}
      if (asset.type === 80000005) {
        params = {
          name: 'dataCatalogForDDC',
          query: {
            objectId: asset.objectId,
            blank: true,
            isAssets: true,
          },
        }
      }
      if (asset.type === 80000004) {
        // 表
        params = {
          name: 'dataCatalogForDDC',
          query: {
            objectId: asset.objectId,
            type: 'TABLE',
            blank: true,
            isAssets: true,
          },
        }
      }
      if (asset.type === 80500008) {
        // 视图
        params = {
          name: 'dataCatalogForDDC',
          query: {
            objectId: asset.objectId,
            type: 'VIEW',
            blank: true,
            isAssets: true,
          },
        }
      }
      dumpMetaDetail(this, params)
    },
    // 添加到待确认
    async addToUnConfirmed() {
      // 1. 调接口，提交已选择的数据资产
      // 2. 提交成功后，将selectedUncombList置空
      // 3. 切换tab页至'待评审'
      // 注意：事件触发点有两处，一是未梳理tab下，二是暂不梳理tab下
      const selectedList = _.cloneDeep(
        this.cardingStatus === 'UN_COMB'
          ? this.selectedUncombList
          : this.selectedNotcombList
      )
      // console.log(selectedList)
      try {
        await API.bindClassification({
          catalogId: this.currentClassfication.id,
          ids: selectedList.map(s => s.id),
        })
        this.$datablauMessage.success(this.$t('coordination.addSuccess'))
        this.$refs.assetTable.clearSelection()
        if (this.cardingStatus === 'UN_COMB') this.selectedUncombList = []
        if (this.cardingStatus === 'NOT_COMB') this.selectedNotcombList = []
        // this.cardingStatus = 'UN_CONFIRMED'
        this.confirmVisible = false
        this.dotTab.UN_CONFIRMED = true
        this.getSpeed()
        this.getStatistics()
        this.getList({
          pageNum: 1,
          // pageSize: 20,
        })
        this.currentClassfication = null
        this.$refs.classifyTree.$refs.tree.setCurrentKey(null)
      } catch (error) {
        this.$showFailure(error)
      }
    },
    // 标记为暂不梳理
    addToNotComb() {
      this.$DatablauCofirm(this.$t('coordination.combTip'))
        .then(async () => {
          const selectedUncombList = _.cloneDeep(this.selectedUncombList)
          try {
            await API.updateAssetStatus({
              status: 'NOT_COMB',
              ids: selectedUncombList.map(item => item.id),
            })
            this.$datablauMessage.success(this.$t('coordination.signSuccess'))
            this.$refs.assetTable.clearSelection()
            this.selectedUncombList = []
            this.dotTab.NOT_COMB = true
            this.getSpeed()
            this.getStatistics()
            this.getList({
              pageNum: 1,
              // pageSize: 20,
            })
          } catch (error) {
            this.$showFailure(error)
          }
        })
        .catch(e => {
          console.log(e)
        })
    },
    // 确认提交评审
    async comfirmToReview() {
      await API.updateAssetStatus({
        status: 'PENDING_REVIEW',
        ids: this.selectedUnreviewList.map(item => item.id),
      })
      this.$datablauMessage.success(this.$t('coordination.submitSuccess'))
      this.$refs.assetTable.clearSelection()
      this.selectedUnreviewList = []
      this.getSpeed()
      this.getStatistics()
      this.getList({ pageNum: 1 })
    },
    // 修改安全等级
    async changeAssetSecurityLevel() {
      // console.log(this.selectedUnreviewList, this.currentSecurityLevel)
      if (this.currentSecurityLevel) {
        try {
          await API.updateAssetSecurity({
            securityId: this.currentSecurityLevel,
            ids: this.selectedUnreviewList.map(item => item.id),
          })
          this.$datablauMessage.success(this.$t('securityModule.editSuccess'))
          this.$refs.assetTable.clearSelection()
          this.getList()
          this.getSpeed()
          this.getStatistics()
          this.currentSecurityLevel = ''
          this.showSecurityPopover = false
        } catch (error) {
          this.$showFailure(error)
        }
      } else {
        this.$datablauMessage.error(this.$t('securityModule.selSecurityLevel'))
      }
    },
    // 取消修改数据分类
    cancelChangeClassification() {
      this.showModifyClassificationDialog = false
      this.targetClassification = null
      this.$refs.assetTable.clearSelection()
    },
    // 确定修改数据分类
    async changeClassification() {
      try {
        await API.bindClassification({
          catalogId: this.targetClassification.id,
          ids: this.selectedUnreviewList.map(item => item.id),
        })
        this.$datablauMessage.success(this.$t('securityModule.editSuccess'))
        this.showModifyClassificationDialog = false
        this.targetClassification = null
        this.$refs.assetTable.clearSelection()
        this.getList()
        this.getSpeed()
        this.getStatistics()
      } catch (error) {
        this.$showFailure(error)
      }
    },
    // 重新梳理
    async reComb() {
      const selectedList = this.selectedList
      // this.cardingStatus === 'PUBLISH'
      //   ? this.selectedPublishList
      //   : this.selectedNotcombList
      await API.updateAssetStatus({
        status: 'UN_COMB',
        ids: selectedList.map(item => item.id),
      })
      this.$datablauMessage.success(this.$t('securityModule.submitSuccess'))
      // this.cardingStatus = 'UN_COMB'
      this.dotTab.UN_COMB = true
      this.$refs.assetTable.clearSelection()
      this.selectedPublishList = []
      this.selectedNotcombList = []
      this.getSpeed()
      this.getStatistics()
      this.getList({
        pageNum: 1,
      })
    },
    handleFun(type) {
      switch (type) {
        case 1:
          // 添加到待确认
          this.addToUnConfirmed()
          break
        case 2:
          // 标记为暂不梳理
          // 调接口，提交已选择的数据资产
          this.addToNotComb()
          break
        case 3:
          // 导出
          // 调接口，提交已选择的数据资产 或 导出查询条件下的全部数据
          this.exportAssets()
          break
        case 4:
          // 确认提交评审
          this.comfirmToReview()
          break
        case 5:
          // 修改数据分类
          this.showModifyClassificationDialog = true
          break
        case 7:
          // 重新梳理
          this.reComb()
          break
        default:
          break
      }
    },
    handleRemove(file, fileList) {
      this.fileList = fileList
    },
    handleUploadError(e) {
      this.$showUploadFailure(e)
    },
    beforeUpload(file) {
      if (!this.checkFileValidation(file, ['xlsx'])) {
        this.$datablauMessage.error(this.$t('assets.catalogue.importLimit'))
        return false
      }
    },
    checkFileValidation(file, supported) {
      const fileName = file.name
      const splitedName = fileName.split('.')
      const puffix = splitedName[splitedName.length - 1]
      return supported.indexOf(puffix) !== -1
    },
    handleTypeChange(val) {
      if (val.length > 0) {
        this.selAssetsList = val
      } else {
        this.selAssetsList = [80000004, 80500008, 80000005]
      }
      this.getAssetsName()
      this.getStatistics()
      this.getSpeed()
      this.getList({ pageNum: 1 })
    },
    getAssetsName() {
      let newList = []
      this.selAssetsList.map(m => {
        this.assetsTypeList.map(v => {
          if (parseFloat(v.value) === m) {
            newList.push(v.label)
          }
        })
      })
      this.assetsNameList = newList
    },
  },
  computed: {
    canAdd() {
      let targetClassification
      let selected
      if (this.showModifyClassificationDialog) {
        targetClassification = this.targetClassification
        selected = this.selectedUnreviewList
      } else {
        targetClassification = this.currentClassfication
        selected = this.selectedUncombList
      }
      if (!selected.length) {
        this.confirmVisible = false
        return false
      }
      if (targetClassification) {
        const unAddList = selected.find(
          item =>
            targetClassification.assetsType &&
            targetClassification.assetsType.indexOf(item.assetsType) === -1
        )
        return !unAddList && targetClassification.canAddAsset
      } else {
        return false
      }
    },
    cannotAddTooltip() {
      if (!this.$auth.DATA_SECURITY_CATALOG_ELEMENT_MANAGE) {
        return this.$t('coordination.powerTip')
      }
      let targetClassification
      let selected
      if (this.showModifyClassificationDialog) {
        targetClassification = this.targetClassification
        selected = this.selectedUnreviewList
      } else {
        targetClassification = this.currentClassfication
        selected = this.selectedUncombList
      }
      if (!selected.length) {
        return this.$t('coordination.selectAssets')
      }
      if (targetClassification) {
        const types = targetClassification.assetsType
        for (let i = 0; i < selected.length; i++) {
          const type = this.assetsTypeList.find(
            item => item.value == selected[i].type
          ).type
          if (types && types.indexOf(type) === -1) {
            return this.$t('coordination.notSupport') + this.typeMap[type]
          }
        }
        if (!targetClassification.canAddAsset) {
          return this.$t('coordination.skipTip')
        }
      } else {
        return this.$t('coordination.selClassCatalog')
      }
      return ''
    },
    selectedList() {
      if (this.cardingStatus === 'UN_COMB') return this.selectedUncombList
      if (this.cardingStatus === 'UN_CONFIRMED')
        return this.selectedUnreviewList
      if (this.cardingStatus === 'PUBLISH') return this.selectedPublishList
      if (this.cardingStatus === 'NOT_COMB') return this.selectedNotcombList
      return []
    },
    currentDataPath() {
      let rs = ''
      if (this.pageSearchParams.systemId) {
        rs += this.systemOptions.find(
          item => item.categoryId == this.pageSearchParams.systemId
        ).categoryName
      }
      if (this.pageSearchParams.modelId) {
        rs += `- ${
          this.dataSourceOptions.find(
            item => item.modelId === this.pageSearchParams.modelId
          ).definition
        }`
      }
      if (this.pageSearchParams.schemaName) {
        rs += `- ${this.pageSearchParams.schemaName}`
      }
      return rs
    },
    tabTips() {
      if (this.pageSearchParams.systemId) {
        return `${this.$t('coordination.current')} “${
          this.systemOptions.find(
            item => item.categoryId === this.pageSearchParams.systemId
          ).categoryName
        }${
          this.pageSearchParams.modelId
            ? '-' +
              this.dataSourceOptions.find(
                item => item.modelId === this.pageSearchParams.modelId
              ).definition
            : ''
        }${
          this.pageSearchParams.schemaName
            ? '-' +
              this.schemaOptions.find(
                item => item === this.pageSearchParams.schemaName
              )
            : ''
        }” ${this.$t('coordination.current1')} “${this.assetsNameList.join(
          '/'
        )}” ${this.$t('coordination.current2')}`
      } else {
        return ''
      }
    },
    handleSearch() {
      this.getList({
        pageNum: 1,
        assetName: this.assetKeywords,
      })
      this.getSpeed()
      this.getStatistics()
    },
  },
  watch: {
    assetKeywords(val) {
      if (!val) {
        this.handleSearch()
      }
    },
    showSecurityPopover: {
      async handler(val) {
        if (val) {
          const levelRes = await API.getLevelData()
          // console.log(levelRes.data.data)
          this.securityOptions = levelRes.data.data
            .filter(item => item.classificationType === 'DATA_SECURITY_LEVEL')
            .map(item => item.tag)
        }
      },
    },
    currentClassfication: {
      handler(newVal, oldVal) {
        if (newVal && newVal.id) {
          this.cardingStatus !== 'UN_COMB' &&
            this.getList({
              catalogId: newVal.id,
            })
          this.getSpeed()
          this.getStatistics()
        }
      },
    },
  },
  beforeDestroy() {
    clearInterval(this.sourceStatusTimer)
  },
}
