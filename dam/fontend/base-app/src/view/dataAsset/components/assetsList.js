import api from '../utils/api'
import { AssetsTypeEnum } from '@/view/dataAsset/utils/Enum'
import { departmentName } from '@/view/dataAsset/utils/methods'
export default {
  props: {
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
          name: this.$t('assets.assetList.dataItem'),
        },
        {
          id: 3,
          type: 'TABLE',
          name: this.$t('assets.assetList.dataSheet'),
        },
        {
          id: 10,
          type: 'VIEW',
          name: this.$t('assets.assetList.view'),
        },
        {
          id: 4,
          type: 'DATA_STANDARD',
          name: this.$t('assets.assetList.basicDomain'),
        },
        {
          id: 11,
          type: 'DATA_STANDARD_CODE',
          name: this.$t('assets.assetList.standardCode'),
        },
        {
          id: 6,
          type: 'INDEX',
          name: this.$t('assets.assetList.dataIndicators'),
        },
        {
          id: 7,
          type: 'REPORT',
          name: this.$t('assets.assetList.dataReport'),
        },
        {
          id: 8,
          type: 'FILE',
          name: this.$t('assets.assetList.file'),
        },
        {
          id: 9,
          type: 'DATA_SERVICE',
          name: this.$t('assets.assetList.dataService'),
        },
      ]
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
    }
  },
  beforeMount() {
    // 获取安全等级
    api
      .getAssets()
      .then(res => {
        this.accessList =
          (res.data.data &&
            res.data.data
              .filter(item => item.classificationType === 'DATA_SECURITY_LEVEL')
              .map(item => item.tag)) ||
          []
      })
      .catch(e => {
        this.$showFailure(e)
      })
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
    this.getList()
  },
  methods: {
    sortChange(data) {
      this.form.sort = data.order
      this.form.page = 1
      this.getList()
    },
    handleSelectionChange(selection) {
      selection.map(item => {
        item.assetsSecurityLevel = this.getSecurityLevel(item.tagCode)
      })
      this.selections = selection
      this.canDelete = this.selections.every(item => {
        // 未发布，已下线
        return item.status === 'UNPUBLISHED' || item.status === 'OFFLINE'
      })
      this.canPublish = this.selections.some(item => {
        // 已发布，审核中
        return item.status === 'PUBLISHED' || item.status === 'UNDER_REVIEW'
      })
      this.canOffline = this.selections.every(item => {
        // 已发布
        return item.status === 'PUBLISHED'
      })
    },
    toDetail(row) {
      let url = ''
      const pos = location.href.indexOf('#/')
      const baseUrl = location.href.slice(0, pos + 2)
      switch (row.subAssetsType) {
        case AssetsTypeEnum.DATA_OBJECT: // 数据项
          url = `main/meta?objectId=${row.itemId}&blank=true&isAssets=true`
          break
        case AssetsTypeEnum.TABLE: // 数据表
        case AssetsTypeEnum.VIEW: // 数据表
          url = `myItem?objectId=${row.itemId}&type=TABLE&blank=true&isAssets=true`
          break
        case AssetsTypeEnum.REPORT: // 报表
          url = `reportForm?reportId=${row.itemId}&blank=true&isAssets=true`
          break
        case AssetsTypeEnum.FILE: // 文件
          url = `main/metaFolder?objectId=${row.itemId}&type=file&blank=true&isAssets=true`
          break
        case AssetsTypeEnum.DOMAIN:
          if (row.subAssetsType === AssetsTypeEnum.DATA_STANDARD) {
            // 基础标准
            url = `domain?domainId=${row.itemId}&blank=true&isAssets=true`
          } else if (row.subAssetsType === AssetsTypeEnum.DATA_STANDARD_CODE) {
            // 标准代码
            url = `main/dataStandard/code?code=${row.itemId}&blank=true&isAssets=true`
          }
          break
        case AssetsTypeEnum.DATA_STANDARD:
          // 基础标准
          url = `domain?domainId=${row.itemId}&blank=true&isAssets=true`
          break
        case AssetsTypeEnum.DATA_STANDARD_CODE:
          // 标准代码
          url = `main/dataStandard/code?code=${row.itemId}&blank=true&isAssets=true`
          break
        case AssetsTypeEnum.INDEX: // 基础指标
          url = `domain?domainId=${row.itemId}&blank=true&isAssets=true`
          break
        case AssetsTypeEnum.DATA_SERVICE: // 服务
          url = `main/apiOverview?apiId=${row.itemId}&blank=true&isAssets=true`
          break
        default:
          break
      }
      const params = {
        id: row.itemId,
        type: row.subAssetsType,
        subAssetsType: row.subAssetsType,
      }
      api
        .judgeCanToDetail(params)
        .then(res => {
          if (res.data.data) {
            window.open(baseUrl + url)
          } else {
            this.$DatablauCofirm(
              this.$t('assets.assetList.deleteAssetTip'),
              this.$t('common.info.title'),
              {
                confirmButtonText: this.$t('common.button.ok'),
                cancelButtonText: this.$t('common.button.cancel'),
                type: 'warning',
              }
            ).then(() => {
              this.deleteAsset([row.assetsId])
            })
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    remove(row) {
      this.$DatablauCofirm(
        this.$t('assets.assetList.delAssetsTips1'),
        this.$t('assets.common.tip'),
        {
          type: 'warning',
        }
      ).then(() => {
        this.deleteAsset([row.assetsId])
      })
    },
    batchDelete() {
      this.$DatablauCofirm(
        this.$t('assets.assetList.delAssetsTips2', {
          num: this.selections.length,
        }),
        this.$t('assets.common.tip'),
        {
          type: 'warning',
        }
      )
        .then(() => {
          const idList = this.selections.map(item => item.assetsId)
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
        .delete(`${this.$url}/service/ddc/assets/`, { data })
        .then(res => {
          this.form.page = 1
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
        orderBy = 'publishTime'
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
        catalogId: this.id, // 目录ID不能为空
        assetsName: this.form.name, // 资产名称
        status: this.isView ? 'PUBLISHED' : this.form.state, // 资产状态int
        tagCode: this.form.access, // 数据安全等级
        assetsType: this.form.type, // 数据类型
        catalogPath: this.currentNode.catalogPath, // 目录路径
        orderBy, // 根据某个字段排序
        sort, // ASC=>升序  DESC=>降序  默认升序
        isFromBrowse: this.type === 1, // 是否从浏览页面进入
      }
      // 我的资产和资产浏览只展示有权限目录下可看到的资产
      api
        .getAssetsList(this.type, params, this.isView)
        .then(res => {
          this.loading = false
          if (res.data.data && res.data.data.assetsList) {
            this.total = res.data.data.total
            res.data.data.assetsList.map(async item => {
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
                case 'REPORT':
                  item.assetsName =
                    item.assetsName +
                    (item.reportCode ? `(${item.reportCode})` : '')
                  break
                default:
                  item.assetsName =
                    item.assetsName + (item.alias ? `(${item.alias})` : '')
                  break
              }
            })
            this.displayData = res.data.data.assetsList
          } else {
            this.total = 0
            this.displayData = []
          }
        })
        .catch(e => {
          this.$showFailure(e)
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
          result = this.$t('assets.assetList.dataSheet')
          iconType = data.subAssetsType
          color = '#0095d9'
          rgba = '(0,149,217,0.1)'
          break
        case AssetsTypeEnum.VIEW:
          result = this.$t('assets.assetList.view')
          iconType = data.subAssetsType
          color = '#4b5cc4'
          rgba = '(75,92,196,0.1)'
          break
        case AssetsTypeEnum.DATA_OBJECT:
          result = this.$t('assets.assetList.dataItem')
          color = '#c44ad1'
          rgba = '(196,74,209,0.1)'
          iconType = 'COLUMN'
          break
        case AssetsTypeEnum.DATA_STANDARD:
          result = this.$t('assets.assetList.basicDomain')
          color = '#38b48b'
          rgba = '(56,180,139,0.1)'
          iconType = 'DOMAIN'
          break
        case AssetsTypeEnum.DATA_STANDARD_CODE:
          result = this.$t('assets.assetList.standardCode')
          color = '#9D5B8B'
          rgba = '(157,91,139,0.1)'
          iconType = 'daima'
          break
        case AssetsTypeEnum.INDEX:
          result = this.$t('assets.assetList.dataIndicators')
          color = '#d1af3e'
          rgba = '(209,175,62,0.1)'
          iconType = 'domain_code'
          break
        case AssetsTypeEnum.REPORT:
          result = this.$t('assets.assetList.dataReport')
          color = '#008899'
          rgba = '(0,136,153,0.1)'
          iconType = 'Report'
          break
        case AssetsTypeEnum.FILE:
          result = this.$t('assets.assetList.file')
          color = '#3397ff'
          rgba = '(51,151,255,0.1)'
          const iconList = ['xlsx', 'jpg', 'mp3']
          iconType = iconList.includes(data.fileType) ? data.fileType : 'file'
          break
        case AssetsTypeEnum.DATA_SERVICE:
          result = this.$t('assets.assetList.dataService')
          color = '#35bae6'
          rgba = '(53,186,230,0.1)'
          iconType = 'service'
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
      const params = {
        type: 'assetsData',
        data: this.selections,
        id: this.selections[0].catalogId, // 当前资产目录的id
      }
      this.clickNode(name, params)
    },
  },
}
