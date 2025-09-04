import api from '../utils/api'
import HTTP from '@/http/main.js'
import { AssetsTypeEnum } from '@/view/dataAsset/utils/Enum'
import { departmentName } from '@/view/dataAsset/utils/methods'
import {
  hasDataSetAuth,
  hasReportAuth,
  hasFileAuth,
  toBrowsing,
} from '@/view/dataAsset/utils/methods'
export default {
  props: {
    structureList: {
      type: Array,
      default: () => [],
    },
    type: {
      type: Number,
      default: 0,
    },
    isView: {
      // 资产浏览详情里面的资产清单仍读取接口list
      type: Boolean,
      default: false,
    },
    id: {
      // 目录id
      type: [String, Number],
      default: '',
    },
    topH: {
      // 顶部简介的高度
      type: [String, Number],
      default: '',
    },
    assetsType: {
      type: String,
      default: '',
    },
    currentNode: {
      type: Object,
      default() {
        return {}
      },
    },
    breadcrumbNodes: {
      type: Array,
      default() {
        return []
      },
    },
    clickNode: {
      type: Function,
    },
    treeData: {
      type: Object,
      default() {
        return {}
      },
    },
  },
  computed: {
    dataTypeList() {
      const result = [
        {
          id: 1,
          type: '',
          name: this.$t('assets.assetList.all'),
        },
        {
          id: 2,
          type: 'DATA_OBJECT',
          name: this.$t('assets.generalSettings.object'),
        },
        {
          id: 3,
          type: 'TABLE',
          name: this.$t('assets.generalSettings.table'),
        },
        {
          id: 10,
          type: 'VIEW',
          name: this.$t('assets.generalSettings.view'),
        },
        {
          id: 4,
          type: 'DATA_STANDARD',
          name: this.$t('assets.generalSettings.basicStandard'),
        },
        {
          id: 5,
          type: 'DATA_STANDARD_CODE',
          name: this.$t('assets.generalSettings.standardCode'),
        },
        {
          id: 6,
          type: 'INDEX',
          name: this.$t('assets.generalSettings.index'),
        },
        this.$versionFeature.dataasset_CatalogType
          ? {
              id: 7,
              type: 'REPORT',
              name: this.$t('assets.generalSettings.report'),
            }
          : null,
        this.$versionFeature.dataasset_CatalogType
          ? {
              id: 8,
              type: 'FILE',
              name: this.$t('assets.generalSettings.file'),
            }
          : null,
      ].filter(item => !!item)
      return result
    },
    stateList() {
      const result = [
        {
          state: '',
          name: this.$t('assets.assetList.all'),
          id: 0,
        },
        {
          state: 'PUBLISHED',
          name: this.$t('assets.assetList.published'),
          id: 1,
        },
        {
          state: 'UNDER_REVIEW',
          name: this.$t('assets.assetList.underReview'),
          id: 2,
        },
        {
          state: 'UNPUBLISHED',
          name: this.$t('assets.assetList.unpublished'),
          id: 3,
        },
        {
          state: 'OFFLINE',
          name: this.$t('assets.assetList.offline'),
          id: 4,
        },
      ]
      return result
    },
  },
  data() {
    return {
      form: {
        size: 20,
        page: 1,
        name: '',
        type: '',
        access: '',
        state: '',
        sort: 'ascending',
        orderBy: 'publishTime',
      },
      total: 0,
      accessList: [],
      loading: false,
      displayData: null,
      selections: [],
      canDelete: false,
      canPublish: false,
      canOffline: false,
      allList: {},
      minScreen: false,
      screenW: 0,
      editingAssetsCode: false,
      autoIncState: false,
      metaModelIconMap: {},
      AssetsTypeEnum,
      assetsTypeList: [],
      getAssetList: [],
      allList: [],
    }
  },
  beforeMount() {
    // 获取安全等级
    // this.accessList = []
    if (this.$featureMap.FE_SECURITY) {
      api
        .getAssets()
        .then(res => {
          this.accessList =
            (res.data.data &&
              res.data.data
                .filter(
                  item => item.classificationType === 'DATA_SECURITY_LEVEL'
                )
                .map(item => item.tag)) ||
            []
        })
        .catch(e => {
          this.$showFailure(e)
        })
    }
  },
  watch: {
    assetsType(val) {
      this.form.type = val
      this.getList()
    },
    id(val) {
      // 目录id变化时，更新资产清单列表
      this.getList()
    },
    screenW(val) {
      if (val > 1366) {
        this.minScreen = true
      } else {
        this.minScreen = false
      }
    },
  },
  async mounted() {
    this.screenW = document.body.clientWidth
    window.onresize = () => {
      this.$nextTick(() => {
        this.screenW = document.body.clientWidth
      })
    }
    this.form.type = this.assetsType
    this.getAssetsCodeConfig()
    this.getList()
    this.getAssetMetaElementList()
    this.getAllList()
  },
  methods: {
    getAllList() {
      this.$http
        .post(`/metadata/mm/getAllList`, {
          filterLdmModel: true,
          onlyM1Element: true,
        })
        .then(res => {
          this.allList = res.data
        })
        .catch(err => {
          this.$showFailure(err)
        })
    },
    getAssetMetaElementList() {
      this.$http
        .post(`/metadata/mm/getAssetMetaElementList`)
        .then(res => {
          this.getAssetList.push(
            {
              assetKey: 'CATALOG',
              chineseName: '目录',
            },
            {
              assetKey: 'DATA_OBJECT',
              chineseName: this.$t('assets.generalSettings.object'),
            },
            {
              assetKey: 'TABLE',
              chineseName: this.$t('assets.generalSettings.table'),
            },
            {
              assetKey: 'VIEW',
              chineseName: this.$t('assets.generalSettings.view'),
            },
            {
              assetKey: 'DATA_STANDARD',
              chineseName: this.$t('assets.generalSettings.basicStandard'),
            },
            {
              assetKey: 'DATA_STANDARD_CODE',
              chineseName: this.$t('assets.generalSettings.standardCode'),
            },
            {
              assetKey: 'INDEX',
              chineseName: this.$t('assets.generalSettings.index'),
            },
            this.$versionFeature.dataasset_CatalogType
              ? {
                  assetKey: 'REPORT',
                  chineseName: this.$t('assets.generalSettings.report'),
                }
              : null,
            this.$versionFeature.dataasset_CatalogType
              ? {
                  assetKey: 'FILE',
                  chineseName: this.$t('assets.generalSettings.file'),
                }
              : null
          )
          res.data.forEach(element => {
            this.getAssetList.push(element)
          })
          this.currentNode.assetsType.split(',').forEach(element => {
            this.assetsTypeList.push({
              name: this.getTypeName(element),
              type: element,
            })
          })
        })
        .catch(err => {
          this.$showFailure(err)
        })
    },
    getTypeName(name) {
      let aName = ''
      this.getAssetList.forEach(element => {
        if (element.assetKey === name) {
          aName = element.chineseName
        }
      })
      return aName
    },
    clearSelections() {
      this.selections = []
      this.$refs.dsTable.clearSelection()
    },
    // 获取资产编号配置，如果是自动生成，不可以再编辑资产编号
    getAssetsCodeConfig() {
      if (this.currentNode.id) {
        api.getAssetsCodeConfig(this.currentNode.id).then(res => {
          if (res.data) {
            this.autoIncState = res.data.autoIncState
          } else {
            this.autoIncState = false
          }
        })
      }
    },
    // 编辑资产编号
    toEditAssetsCode(e) {
      e.cancelBubble = true
      this.selections = []
      this.$refs.dsTable.clearSelection()
      this.editingAssetsCode = true
    },
    // 编辑资产编号时，不可以选择数据资产进行发布、下线等操作
    rowSelectable() {
      return !this.editingAssetsCode
    },
    // 保存资产编号
    saveAssetsCode() {
      // if (this.displayData.find(item => !item.codeValidate)) return
      api
        .saveAssetsCode(
          this.displayData.map(item => ({
            assetsId: item.assetsId,
            code: item.assetsCode,
          }))
        )
        .then(res => {
          if (res.status === 200) {
            this.$blauShowSuccess(this.$t('assets.assetList.saveSuccess'))
            this.editingAssetsCode = false
          } else {
            this.$blauShowFailure(res)
          }
        })
        .catch(error => {
          this.$blauShowFailure(error)
        })
    },
    cancelAssetsCode() {
      this.getList()
    },
    checkkAssetsCodeValidate(row) {
      // console.log(row)
      // true: 重复，false: 不重复
      if (row.assetsCode === '') {
        row.codeInvalid = false
        return
      }
      if (
        this.displayData.find(
          item =>
            item.assetsCode &&
            item.assetsCode === row.assetsCode &&
            item.assetsId !== row.assetsId
        )
      ) {
        row.codeInvalid = true
      } else {
        api
          .isExsistAssetsCode({
            assetsId: row.assetsId,
            code: row.assetsCode,
          })
          .then(res => {
            if (res.data) {
              row.codeInvalid = true
            } else {
              row.codeInvalid = false
            }
          })
      }
    },
    sortChange(data) {
      this.form.sort = data.order
      this.form.orderBy = data.prop
      this.form.page = 1
      this.getList()
    },
    handleSelectionChange(selection) {
      selection.map(item => {
        item.assetsSecurityLevel = this.getSecurityLevel(item.tagCode)
      })
      this.selections = selection
      this.canPublish = this.selections.every(item => {
        // 未发布，已下线
        return item.status === 'UNPUBLISHED' || item.status === 'OFFLINE'
      })
      this.canDelete = this.selections.some(item => {
        // 未发布，已下线
        return item.status === 'UNPUBLISHED' || item.status === 'OFFLINE'
      })
      this.canOffline = this.selections.every(item => {
        // 已发布
        return item.status === 'PUBLISHED'
      })
    },
    async toDetail(row) {
      // let result = false
      // switch (row.subAssetsType) {
      //   case AssetsTypeEnum.DATA_OBJECT: // 数据项
      //     result = hasDataSetAuth(this, true)
      //     break
      //   case AssetsTypeEnum.TABLE: // 数据表
      //   case AssetsTypeEnum.VIEW: // 数据表
      //     result = hasDataSetAuth(this, true)
      //     break
      //   case AssetsTypeEnum.REPORT: // 报表
      //     result = hasReportAuth(this, true)
      //     break
      //   case AssetsTypeEnum.FILE: // 文件
      //     result = hasFileAuth(this)
      //     break
      //   default:
      //     break
      // }
      // if (!result) {
      //   this.$blauShowSuccess(
      //     this.$t('assets.assetList.noModulePermission'),
      //     'warning'
      //   )
      //   return
      // }
      let metric = localStorage.getItem('allServers')
        ? JSON.parse(localStorage.getItem('allServers')).includes('METRIC')
        : false
      let indexDefinitionNew = ''
      const params = {
        id: row.itemId,
        type: row.subAssetsType,
        subAssetsType: row.subAssetsType,
      }
      try {
        // 合并判断是否可以进入详情页和获取 indexDefinitionNew 的逻辑
        const canToDetailResponse = await api.judgeCanToDetail(params)
        if (canToDetailResponse.data.data) {
          if (metric && row.subAssetsType === AssetsTypeEnum.INDEX) {
            const domainResponse = await api.getDomainById({
              domainId: row.itemId,
            })
            indexDefinitionNew = domainResponse.data.categoryId
          }

          if (
            ['DATA_STANDARD', 'DATA_STANDARD_CODE', 'INDEX'].includes(
              row.subAssetsType
            ) &&
            row.status === 'PUBLISHED'
          ) {
            await api.toVisitAsset({
              catalogId: row.catalogId,
              assetType: row.subAssetsType,
              itemId: row.itemId,
              assetId: row.assetsId,
            })
          }

          toBrowsing(
            {
              typeId: row.subAssetsType,
              indexDefinitionNew,
              ...row,
            },
            this
          )
        } else {
          this.$DatablauAlert(
            this.$t('assets.assetList.assetErrorMessage'),
            this.$t('common.info.title'),
            {
              confirmButtonText: this.$t('common.button.ok'),
              type: 'warning',
            }
          )
        }
      } catch (e) {
        this.$showFailure(e)
      }
    },
    remove(row) {
      // console.log(row)
      this.$DatablauCofirm(
        this.$t('assets.assetList.delAssetsTips1', {
          assetName: row.assetsName,
        }),
        this.$t('assets.assetList.deleteAssetsTip'),
        {
          type: 'warning',
        }
      ).then(() => {
        this.deleteAsset([row.assetsId])
      })
    },
    batchDelete() {
      const cannotDeteteNum = this.selections.filter(
        item => item.status === 'PUBLISHED' || item.status === 'UNDER_REVIEW'
      ).length
      this.$DatablauCofirm(
        cannotDeteteNum
          ? this.$t('assets.assetList.delAssetsTips3', {
              num: cannotDeteteNum,
            })
          : this.$t('assets.assetList.delAssetsTips2', {
              num: this.selections.length,
            }),
        this.$t('assets.assetList.deleteAssetsTip'),
        {
          type: 'warning',
        }
      )
        .then(() => {
          const idList = this.selections
            .filter(
              item => item.status === 'UNPUBLISHED' || item.status === 'OFFLINE'
            )
            .map(item => item.assetsId)
          // 去重
          const newList = new Set(idList)
          const ids = Array.from(newList)
          this.deleteAsset(ids)
        })
        .catch(e => {
          console.info(e)
        })
    },
    deleteAsset(data) {
      this.$http
        .delete(`${this.$asstes_url}/assets/`, { data })
        .then(res => {
          this.$blauShowSuccess(this.$t('assets.assetList.deleteSuccess'))
          this.form.page = 1
          this.selections = []
          this.$refs.dsTable.clearSelection()
          this.getList()
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    handleSizeChange(val) {
      this.form.size = val
      this.form.page = 1
      this.getList()
    },
    handlePageChange(val) {
      this.form.page = val
      this.getList()
    },
    getStatusColor(state) {
      let result = ''
      switch (state) {
        case 'UNPUBLISHED':
          result = '#5DC4C0'
          break
        case 'UNDER_REVIEW':
          result = '#409EFF'
          break
        case 'PUBLISHED':
          result = '#66BF16'
          break
        case 'OFFLINE':
          result = '#999'
          break
        default:
          result = '#409EFF'
          break
      }
      return result
    },
    getSecurityLevel(code) {
      let result = '--'
      this.accessList.map(item => {
        if (item.builtInCode === code) {
          result = item.name
        }
      })
      return result
    },
    // 获取当前点击目录下，所有有权限子孙目录的id
    getIds(id) {
      // console.log(this.treeData)
      const catalogData = this.treeData.catalogData
      var result = {} // 也可以是全局声明的变量
      function recursive(obj) {
        obj.forEach(item => {
          if (item.id == id) {
            result = item
          }
          if (item.children) {
            recursive(item.children)
          }
        })
      }
      recursive(catalogData)
      return result
    },
    getIdList(data, idList) {
      idList = idList || []
      data.map(item => {
        switch (this.type) {
          case 0:
            // 资产管理
            if (item.authType === 'MANAGER' || item.authType === 'EDIT') {
              idList.push(item.id)
            }
            break
          case 1:
            // 资产浏览
            if (item.authType !== 'NONE') {
              idList.push(item.id)
            }
            break
          case 2:
            // 我的资产
            if (item.authType === 'MANAGER') {
              idList.push(item.id)
            }
            break
          default:
            break
        }
        item.children && this.getIdList(item.children, idList)
      })
      return idList
    },
    getDepartmentName(data) {
      return departmentName(data)
    },
    async getList() {
      this.loading = true
      let sort = ''
      let orderBy = ''
      if (this.form.sort) {
        orderBy = this.form.orderBy
        if (this.form.sort === 'ascending') {
          sort = 'ASC'
        } else {
          sort = 'DESC'
        }
      }
      if (this.isView && !this.id) {
        // 资产浏览页面，首次进入没有目录id
        return
      }
      const params = {
        // structureId: this.currentNode.structureId,
        pageNum: this.form.page,
        pageSize: this.form.size,
        catalogIds: [this.id],
        assetsName: this.form.name, // 资产名称
        status: this.isView ? 'PUBLISHED' : this.form.state, // 资产状态int
        // tagCode: this.form.access, // 数据安全等级
        assetsType: this.form.type, // 数据类型
        catalogPath: this.currentNode.catalogPath, // 目录路径
        orderBy, // 根据某个字段排序
        sort, // ASC=>升序  DESC=>降序  默认升序
        isFromBrowse: this.type === 1, // 是否从浏览页面进入
        structureIds: this.structureList.map(s => s.id),
        searchStr: this.form.name,
        curCatalog: true,
        assetsTypeList: this.form.type
          ? [this.form.type]
          : ['TABLE', 'VIEW', 'DATA_OBJECT', 'FILE', 'REPORT'],
        tagCode: this.form.access
          ? this.accessList.find(a => a.builtInCode == this.form.access)
              .builtInCode
          : '',
        withAlias: true, // 英文名是否参与搜索
        withDesc: false, // 描述是否参与搜索
      }
      if (this.type === 0) {
        params.catalogId = this.id
      }
      if (this.isView) {
        params.tagIds = this.form.access
          ? [
              [
                this.accessList.find(a => a.builtInCode == this.form.access)
                  .tagId,
              ],
            ]
          : []
      }
      // 我的资产和资产浏览只展示有权限目录下可看到的资产
      api
        .getAssetsList(this.type, params, this.isView)
        .then(res => {
          this.loading = false
          this.editingAssetsCode = false
          if (res.data.data && res.data.data.assetsList) {
            this.total = res.data.data.total
            res.data.data.assetsList.map(async item => {
              item.codeInvalid = false
              item.status = item.status ? item.status : 'UNPUBLISHED'
              if (
                item.departmentNameList &&
                item.departmentNameList.length > 0
              ) {
                item.deptName = await this.getDepartmentName(item)
              } else {
                item.deptName = ''
              }
              switch (item.subAssetsType) {
                case 'DATA_STANDARD':
                case 'DATA_STANDARD_CODE':
                case 'INDEX':
                  item.assetsName =
                    item.assetsName + (item.alias ? `(${item.alias})` : '')
                  // item.alias + (item.assetsName ? `(${item.assetsName})` : '')
                  break
                case 'TABLE':
                case 'VIEW':
                case 'DATA_OBJECT':
                  item.assetsName =
                    item.assetsName + (item.alias ? `(${item.alias})` : '')
                  break
                default:
                  break
              }
            })
            this.displayData = res.data.data.assetsList
            this.displayData.forEach(item => {
              if (item.subAssetsType === AssetsTypeEnum.META_MODEL) {
                this.getIconSrc(item.itemTypeId)
              }
            })
            this.toggleSelection()
            this.loading = false
          } else {
            this.total = 0
            this.displayData = []
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    toggleSelection() {
      this.displayData.forEach(data => {
        this.$refs.dsTable.toggleSelection &&
          this.$refs.dsTable.toggleSelection(
            data,
            !!this.selections.find(item => item.assetsId === data.assetsId)
          )
      })
    },
    query() {
      this.form.page = 1
      this.getList()
    },
    reset() {
      this.form = {
        size: 20,
        page: 1,
        name: '',
        type: '',
        access: '',
        state: '',
        sort: this.form.sort,
      }
      this.getList()
    },
    transState(type) {
      if (type === 'UNPUBLISHED') {
        return this.$t('assets.assetList.unpublished')
      } else if (type === 'UNDER_REVIEW') {
        return this.$t('assets.assetList.underReview')
      } else if (type === 'PUBLISHED') {
        return this.$t('assets.assetList.published')
      } else if (type === 'OFFLINE') {
        return this.$t('assets.assetList.offline')
      } else {
        return this.$t('assets.assetList.unpublished')
      }
    },
    getAssetsType(type, num, data = {}) {
      let result = ''
      let color = ''
      let rgba = ''
      let iconType = ''
      switch (type) {
        case AssetsTypeEnum.TABLE:
          result = this.$t('assets.generalSettings.table')
          iconType = data.isLogical ? 'logicaltable' : data.subAssetsType
          color = '#0095d9'
          rgba = '(0,149,217,0.1)'
          break
        case AssetsTypeEnum.VIEW:
          result = this.$t('assets.generalSettings.view')
          iconType = data.subAssetsType
          color = '#4b5cc4'
          rgba = '(75,92,196,0.1)'
          break
        case AssetsTypeEnum.META_MODEL:
          result = '自定义对象'
          iconType = data.subAssetsType
          color = '#4b5cc4'
          rgba = '(75,92,196,0.1)'
          break
        case AssetsTypeEnum.DATA_OBJECT:
          result = this.$t('assets.generalSettings.object')
          color = '#c44ad1'
          rgba = '(196,74,209,0.1)'
          iconType = data.isLogical ? 'logicalcolumn' : 'COLUMN'
          break
        case AssetsTypeEnum.DATA_STANDARD:
          result = this.$t('assets.generalSettings.basicStandard')
          color = '#38b48b'
          rgba = '(56,180,139,0.1)'
          iconType = 'DOMAIN'
          break
        case AssetsTypeEnum.DATA_STANDARD_CODE:
          result = this.$t('assets.generalSettings.standardCode')
          color = '#9D5B8B'
          rgba = '(157,91,139,0.1)'
          iconType = 'daima'
          break
        case AssetsTypeEnum.INDEX:
          result = this.$t('assets.generalSettings.index')
          color = '#d1af3e'
          rgba = '(209,175,62,0.1)'
          iconType = 'domain_code'
          break
        case AssetsTypeEnum.REPORT:
          result = this.$t('assets.generalSettings.report')
          color = '#008899'
          rgba = '(0,136,153,0.1)'
          iconType = 'Report'
          break
        case AssetsTypeEnum.FILE:
          result = this.$t('assets.generalSettings.file')
          color = '#3397ff'
          rgba = '(51,151,255,0.1)'
          const iconList = ['xlsx', 'jpg', 'mp3', 'pdf', 'txt']
          iconType = data.fileType
            ? this.$fileTypeFormatter(data.fileType)
            : 'file'
          break

        default:
          break
      }
      if (num === 1) {
        return result
      }
      if (num === 2) {
        const style = {
          color: color,
          background: 'rgba' + rgba,
        }
        return style
      }
      if (num === 3) {
        return iconType
      }
    },
    getAssetsType2(type, num, data = {}) {
      let result = ''
      let color = ''
      let rgba = ''
      let iconType = ''
      switch (type.subAssetsType) {
        case AssetsTypeEnum.META_MODEL:
          result = this.allList.filter(item => item.id === type.itemTypeId)[0]
            ?.chineseName
          iconType = data.subAssetsType
          color = '#4b5cc4'
          rgba = '(75,92,196,0.1)'
          break
        default:
          break
      }
      if (num === 1) {
        return result
      }
      if (num === 2) {
        const style = {
          color: color,
          background: 'rgba' + rgba,
        }
        return style
      }
      if (num === 3) {
        return iconType
      }
    },

    judgeSubmit(data) {
      let result
      let oldList = []
      data.map(item => {
        const len = item.catalogPath.split('/').length - 1
        const parentId = item.catalogPath.split('/')[len]
        oldList.push(parentId)
      })
      const newList = [...new Set(oldList)]
      if (newList.length > 1) {
        // 多个父目录
        result = false
      } else {
        result = true
      }
      return result
    },
    async handlePublishOrOffline(name) {
      // 判断资产是否在同一个目录下，不同一个目录，审批人可能不同，禁止批量发布或下线
      if (this.selections.length > 1) {
        const result = await this.judgeSubmit(this.selections)
        if (!result) {
          this.$blauShowSuccess(
            this.$t('assets.assetList.publishProcessTip'),
            'warning'
          )
          return
        }
      }
      this.selections.map(async item => {
        item.deptName = await this.getDepartmentName(item)
      })
      const params = {
        type: 'assetsData',
        data: this.selections,
        id: this.selections[0].catalogId, // 当前资产目录的id
      }
      this.clickNode(name, params)
    },
    getIconSrc(typeId) {
      HTTP.getMetaModelIconNew(typeId)
        .then(res => {
          if (res.data && res.data.size > 0) {
            // 检查返回的blob是否有内容
            const blob = new Blob([res.data], { type: 'image/png' })
            const iconUrl = URL.createObjectURL(blob)
            this.$set(this.metaModelIconMap, typeId, iconUrl)
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
  },
}
