import ResizeHorizontal from '@/components/common/ResizeHorizontal'
import AssetsUpload from '../components/assetsUpload.vue'
import isShowTooltip from '@/view/dataProperty/meta/isShowTooltip.vue'
import API from '../util/api'
import _ from 'lodash'
import nUtils from '@/utils/Number.js'
export default {
  components: {
    AssetsUpload,
    isShowTooltip,
  },
  data() {
    return {
      combStatusMap: {
        UN_COMB: '待梳理',
        UN_CONFIRMED: '待确认',
        PUBLISH: '已发布',
        NOT_COMB: '暂不梳理',
      },
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
        modelId: '',
        schemaName: '',
      },
      assetKeywords: '',
      typeIconMap: {
        80000004: 'biao',
        80500008: 'shitu',
        80000005: 'ziduan',
      },
      assetsTypeList: [
        {
          value: '80000004',
          label: '表',
          type: 'TABLE',
          selected: false,
        },
        {
          value: '80500008',
          label: '视图',
          type: 'VIEW',
          selected: false,
        },
        {
          value: '80000005',
          label: '数据项',
          type: 'DATA_OBJECT',
          selected: true,
        },
      ],
      form: {
        page: 1,
        size: 20,
        assetsName: '',
        sort: '',
        orderBy: '',
      },
      defaultSort: {
        prop: 'physicalName',
        order: 'ascending',
      },
      assetList: null,
      total: 0,
      showImport: false,
      assetsTotal: {
        UN_COMB: 0,
        UN_CONFIRMED: 0,
        PUBLISH: 0,
        NOT_COMB: 0,
      },
      cardingStatus: 'UN_COMB',
      percent: 0,
      treeData: [],
      treeStructure: {},
      systemOptions: [],
      dataSourceOptions: [],
      schemaOptions: [],
      currentClassfication: null,
      assetsList: [],
      selectedUncombList: [],
      selectedUnreviewList: [],
      selectedPublishList: [],
      selectedNotcombList: [],
      scanAgain: false, // 数据源是否需要重新扫描
      scaning: false, // 数据源是否正在扫描中
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
      typeMap: {
        DATA_OBJECT: '数据项',
        TABLE: '数据表',
        VIEW: '视图',
        80000004: '数据表',
        80500008: '视图',
      },
      sourceStatusTimer: null,
    }
  },
  mounted() {
    this.initResizeHorizontal()
    this.init()
  },
  methods: {
    // 给数字添加千位符
    formatNum(num) {
      var str = num.toString()
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
      firstCategoryId && this.getDataSource(firstCategoryId)
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
        this.$blauShowFailure(error)
      }
    },
    // 查询数据源
    getDataSource(id) {
      API.getDataSourceList(id).then(res => {
        if (res.data) {
          this.dataSourceOptions = res.data.data || []
        }
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
      console.log(data)
      if (this.showModifyClassificationDialog) {
        this.targetClassification = data
      } else {
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
      if (data.type === 'ALL' || data.type === 'ALLFILE') {
        return true
      }
      let current = node
      do {
        if (this.$MatchKeyword(current.data, value, 'name')) {
          return true
        }
        current = current.parent
      } while (current && current.data.name)
      return false
    },
    handleSystemChange(id) {
      // 查询当前业务系统下的数据源
      // 1. 数据源、schema清空
      // 2. 查询梳理进度
      // 3. 统计当前业务系统下的各资产状态统计值
      // 4. tab切换至‘未梳理’
      // 5. 重新获取未梳理的表、视图、字段
      this.pageSearchParams.modelId = ''
      this.pageSearchParams.schemaName = ''
      this.scaning = false
      this.scanAgain = false
      this.handleClick({ name: 'UN_COMB' })
      this.getDataSource(id)
      this.getSpeed()
      this.getStatistics()
    },
    // 数据源更新完成后的提示
    fullfiledTips(modelId) {
      const currentModel = this.dataSourceOptions.find(
        item => item.modelId === modelId
      )
      console.log(this.$route.path, modelId)
      if (
        this.$route.path === '/main/coordinationClassification' &&
        this.pageSearchParams.modelId === modelId
      ) {
        this.$blauShowSuccess('更新完成')
        this.scanVisible = false
        this.updatePageData()
      } else {
        this.$notify({
          message: `${
            this.$route.path === '/main/coordinationClassification'
              ? ''
              : '协同分类分级页面下，'
          }名为${currentModel.definition}的数据源更新完成`,
          type: 'success',
        })
      }
    },
    // 数据源更新状态
    getSourceStatus(modelId) {
      API.notScanAgain(modelId)
        .then(res => {
          const scaning =
            res.data.data.status == null ? false : !res.data.data.status
          this.scanAgain = !res.data.data.isSync
          this.scaning = scaning
          if (scaning) {
            if (!this.sourceStatusTimer) {
              this.sourceStatusTimer = setInterval(() => {
                this.getSourceStatus(modelId)
              }, 3000)
            } else {
              this.updatePageData()
            }
          } else {
            if (this.sourceStatusTimer) {
              this.fullfiledTips(modelId)
              clearInterval(this.sourceStatusTimer)
              this.sourceStatusTimer = null
            } else {
              this.updatePageData()
            }
          }
        })
        .catch(error => {
          this.$blauShowFailure(error)
        })
    },
    updatePageData() {
      this.getList()
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
      this.pageSearchParams.schemaName = ''
      this.getSchema(id)
      // this.getSpeed()
      // this.getStatistics()
      this.handleClick({ name: 'UN_COMB' }, false)
      clearInterval(this.sourceStatusTimer)
      this.sourceStatusTimer = null
      if (id) {
        this.getSourceStatus(this.pageSearchParams.modelId)
      } else {
        this.scanAgain = false
        this.scaning = false
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
      this.$blauShowSuccess(
        '已开始扫描任务，可移步至系统任务页查看任务完成情况，待任务完成后，刷新本页面，即可查看最新扫描数据'
      )
    },
    scanByModel() {
      const currentModel = this.dataSourceOptions.find(
        item => item.modelId === this.pageSearchParams.modelId
      )
      this.loading = true
      this.scaning = true
      this.scanVisible = false

      API.scanByModelId(this.pageSearchParams.modelId)
      setTimeout(() => {
        this.getSourceStatus(this.pageSearchParams.modelId)
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
          this.$bus.$emit('getTaskJobResult', res.data, 'export')
        })
      } else {
        // 导出全部
        this.exportBtnDisabled = true
        params = {
          status: this.cardingStatus,
          ...this.pageSearchParams,
          assetName: this.assetKeywords,
          types: this.assetsTypeList
            .filter(item => item.selected)
            .map(item => item.value),
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
            this.exportBtnDisabled = false
            this.$bus.$emit('getTaskJobResult', res.data, 'export')
          })
          .catch(error => {
            this.exportBtnDisabled = false
            this.$blauShowFailure(error)
          })
      }
    },
    // 统计
    getStatistics() {
      const { systemId, modelId, schemaName } = this.pageSearchParams
      const params = {
        categoryId: systemId,
        modelId,
        schema: schemaName,
        types: this.assetsTypeList
          .filter(item => item.selected)
          .map(item => item.value),
      }
      API.getStatistics(params)
        .then(res => {
          const result = res.data.data || []
          Object.keys(this.assetsTotal).forEach(key => {
            const rsItem = result.find(item => item.combStatus === key)
            rsItem
              ? (this.assetsTotal[key] = rsItem.count)
              : (this.assetsTotal[key] = 0)
          })
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    // 获取梳理进度
    getSpeed() {
      const params = {
        categoryId: this.pageSearchParams.systemId,
        modelId: this.pageSearchParams.modelId,
        schema: this.pageSearchParams.schemaName,
        types: ['80000004', '80500008', '80000005'],
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
          orderBy = null
      }
      return orderBy
    },
    // 获取资产盘点列表
    getList(defaultParams) {
      const selectedList = _.cloneDeep(this.selectedList)
      const params = {
        status: this.cardingStatus,
        ...this.pageSearchParams,
        assetName: this.assetKeywords,
        types: this.assetsTypeList
          .filter(item => item.selected)
          .map(item => item.value),
        catalogId: '',
        pageNum: this.form.page,
        pageSize: this.form.size,
        orderBy: this.form.orderBy || this.getDefaultOrder(),
        sort: this.form.sort || 'ASC',
        ...defaultParams,
      }
      this.assetList = null
      API.getAssetsData(params)
        .then(res => {
          if (
            params.types.join(',') ===
            this.assetsTypeList
              .filter(item => item.selected)
              .map(item => item.value)
              .join(',')
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
        default:
          break
      }
    },
    query() {
      this.form.page = 1
      this.getList()
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
    },
    handleClick(tab, refreshTable = true) {
      this.cardingStatus = tab.name
      this.dotTab[tab.name] = false
      this.form.orderBy = this.getDefaultOrder()
      refreshTable &&
        this.getList({
          // pageSize: 20,
          pageNum: 1,
        })
      this.selectedUncombList = []
      this.selectedUnreviewList = []
      this.selectedPublishList = []
      this.selectedNotcombList = []
      this.currentClassfication = null
      this.$refs.classificationTree &&
        this.$refs.classificationTree.setCurrentKey(null)
      this.$refs.assetTable.clearSelection()
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
    },
    handlePageChange(val) {
      this.form.page = val
      this.getList()
    },
    handleSizeChange(val) {
      this.form.size = val
      this.form.page = 1
      this.getList()
    },
    toCheckAssetDetails(asset) {
      const pos = location.href.indexOf('#/')
      const baseUrl = location.href.slice(0, pos + 2)
      if (asset.type === 80000005) {
        window.open(
          baseUrl +
            `main/meta?objectId=${asset.objectId}&blank=true&isAssets=true`
        )
      }
      // this.$bus.$emit('showDetail', query);
      if (asset.type === 80000004) {
        // 表
        window.open(
          baseUrl +
            `myItem?objectId=${asset.objectId}&type=TABLE&blank=true&isAssets=true`
        )
      }
      if (asset.type === 80500008) {
        // 视图
        window.open(
          baseUrl +
            `myItem?objectId=${asset.objectId}&type=VIEW&blank=true&isAssets=true`
        )
      }
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
        this.$blauShowSuccess('添加成功')
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
        this.$refs.classificationTree.setCurrentKey(null)
      } catch (error) {
        this.$blauShowFailure(error)
      }
    },
    // 标记为暂不梳理
    addToNotComb() {
      this.$DatablauCofirm('是否将所选数据资产标记为暂不梳理？', '提示', {
        type: 'warning',
        cancelButtonText: '取消',
        confirmButtonText: '确定',
      })
        .then(async () => {
          const selectedUncombList = _.cloneDeep(this.selectedUncombList)
          try {
            await API.updateAssetStatus({
              status: 'NOT_COMB',
              ids: selectedUncombList.map(item => item.id),
            })
            this.$blauShowSuccess('标记成功')
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
            this.$blauShowFailure(error)
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
      this.$blauShowSuccess('提交评审成功！')
      this.$refs.assetTable.clearSelection()
      this.selectedUnreviewList = []
      this.getSpeed()
      this.getStatistics()
      this.getList()
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
          this.$blauShowSuccess('修改成功')
          this.getList()
          this.currentSecurityLevel = ''
          this.showSecurityPopover = false
        } catch (error) {
          this.$blauShowFailure(error)
        }
      } else {
        this.$blauShowFailure('请选择安全等级')
      }
    },
    // 取消修改安全分类
    cancelChangeClassification() {
      this.showModifyClassificationDialog = false
      this.targetClassification = null
    },
    // 确定修改安全分类
    async changeClassification() {
      try {
        await API.bindClassification({
          catalogId: this.targetClassification.id,
          ids: this.selectedUnreviewList.map(s => s.id),
        })
        this.$blauShowSuccess('修改成功')
        this.showModifyClassificationDialog = false
        this.targetClassification = null
        this.getList()
      } catch (error) {
        this.$blauShowFailure(error)
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
      this.$blauShowSuccess('提交成功！')
      // this.cardingStatus = 'UN_COMB'
      this.dotTab.UN_COMB = true
      this.$refs.assetTable.clearSelection()
      this.selectedPublishList = []
      this.selectedNotcombList = []
      this.getSpeed()
      this.getStatistics()
      this.getList()
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
          // 修改安全分类
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
        this.$blauShowFailure(this.$t('assets.catalogue.importLimit'))
        return false
      }
    },
    checkFileValidation(file, supported) {
      const fileName = file.name
      const splitedName = fileName.split('.')
      const puffix = splitedName[splitedName.length - 1]
      return supported.indexOf(puffix) !== -1
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
            targetClassification.assetsType.indexOf(item.assetsType) === -1
        )
        // console.log(unAddList)
        return !unAddList
      } else {
        return false
      }
    },
    cannotAddTooltip() {
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
        return '请选择资产'
      }
      if (targetClassification) {
        const types = targetClassification.assetsType
        for (let i = 0; i < selected.length; i++) {
          const type = this.assetsTypeList.find(
            item => item.value == selected[i].type
          ).type
          if (types.indexOf(type) === -1) {
            return '当前分类目录不支持' + this.typeMap[type]
          }
        }
      } else {
        return '请选择分类目录'
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
    typesNameStr() {
      const selectedTypes = this.assetsTypeList.filter(item => item.selected)
      return selectedTypes.length === 0 || selectedTypes.length === 3
        ? '全部资产类型'
        : selectedTypes.map(item => item.label).join(', ')
    },
    tabTips() {
      if (this.pageSearchParams.systemId) {
        return `当前 “${
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
        }” 下，资产类型为 “${this.assetsTypeList
          .filter(item => item.selected === true)
          .map(item => item.label)
          .join('/')}” 时的统计数量`
      } else {
        return ''
      }
    },
  },
  watch: {
    assetKeywords: {
      handler(value) {
        this.getList({
          assetName: value,
        })
      },
    },
    assetsTypeList: {
      handler() {
        if (!this.assetsTypeList.find(item => item.selected === true)) {
          this.assetsTypeList.forEach(item => (item.selected = true))
        }
        this.getStatistics()
        this.getList()
      },
      deep: true,
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
        if (newVal.id) {
          this.cardingStatus !== 'UN_COMB' &&
            this.getList({
              catalogId: newVal.id,
            })
        }
      },
    },
  },
  beforeDestroy() {
    clearInterval(this.sourceStatusTimer)
  },
}
