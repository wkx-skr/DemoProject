import _ from 'lodash'
import Visible from '@/view/search/icon/visible.vue'
import PinyinMatch from 'pinyin-match'
import LDMTypes from '@constant/LDMTypes'
import api from '../utils/api'
import { AssetsTypeEnum } from '@/view/dataAsset/utils/Enum'
import { departmentName } from '@/view/dataAsset/utils/methods'
import folder from '../../../assets/images/search/folder.svg'
import isShowTooltip from '@/view/dataProperty/meta/isShowTooltip.vue'
export default {
  props: {
    currentNode: {
      type: Object,
      default() {
        return {}
      },
    },
    nowBase: {
      type: Object,
      default() {
        return {}
      },
    },
    clickNode: {
      type: Function,
    },
    selectedAttr: {
      type: Array,
      default() {
        return []
      },
    },
  },
  components: {
    Visible,
    isShowTooltip,
  },
  data() {
    const { grey, greyBorder } = this.$style
    const [absolute, relative] = ['absolute', 'relative']
    return {
      managerMap: {},
      AssetsTypeEnum: AssetsTypeEnum,
      showNull: false,
      isSearch: false,
      curCatalogList: [],
      departmentList: [], // 机构部门list
      objectType: 'folder',
      tables: [],
      selectedTagMoudleLen: 0,
      showTagCollapse: true,
      filterTagHeight: 1,
      showTagFolder: false,
      $window: window,
      style: {},
      nav: [],
      tags: {},
      orderBy: 'score',
      ps: null,
      filterPs: null,
      tagCntMap: {},
      modelTypes: [],
      modelCntMap: {},
      keyword: '',
      lastKeyword: '',
      tagIds: null,
      lastCatalogs: '',
      contentLoading: true,
      listKey: 0,
      lastNoTagSearch: {
        blur: false,
        keyword: '',
        catalogs: '',
        tagsResult: null,
      },
      selectedDataTypes: [],
      currentPage: 1,
      totalItems: 0,
      pageSize: 10,
      udps: [],
      udpsMap: {},
      udpValue: {},
      filterPopoverVisible: false,
      tagGroupList: [],
      filterPopoverTableData: [],
      tableKey: 0,
      isAdmin: this.$isAdmin,
      tagCollection: {},
      udpCollection: {},
      tagFilterKeyword: '',
      udpNoValueSet: new Set(),
      notAnyTag: true,
      catalogTypeList: [],
      newTableData: [],
    }
  },
  mounted() {
    this.getDirectoryType()
    this.getOrgList()
    this.prepareTags()
    this.initEventListener()
    this.getTagGroupList(list => {
      this.getUdps(list)
    })
  },
  watch: {
    contentLoading(val) {
      this.clickNode('loading', { listLoading: val })
    },
    nowBase: {
      handler(val, old) {
        this.getSearchResults()
        this.calculateFilterHeight()
      },
      immediate: true,
      deep: true,
    },
    selectedAttr: {
      handler(val) {
        this.selectedDataTypes = val
      },
      immediate: true,
      deep: true,
    },
    tables: {
      handler(val) {
        this.newTableData = val
      },
      immediate: true,
      deep: true,
    },
    $route() {
      this.currentPage = 1
    },
    selectedTagMoudleLen() {
      this.calculateFilterHeight()
    },
    keyword(val) {
      if (!val) {
        this.currentPage = 1
        this.getSearchResults()
      }
    },
    filterPopoverVisible(visible) {
      if (!visible) {
        this.tagFilterKeyword = ''
      }
    },
  },
  beforeDestroy() {
    if (this.ps) {
      this.ps.destroy()
    }
    if (this.filterPs) {
      this.filterPs.destroy()
    }
  },
  methods: {
    getDirectoryType() {
      api
        .getDirectoryType(0)
        .then(res => {
          let data = res.data.catalogTypes || []
          this.catalogTypeList = data
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    getIcon(type) {
      let url = ''
      if (this.catalogTypeList.length > 0) {
        const curList = this.catalogTypeList.filter(item => item.name === type)
        if (curList.length > 0 && curList[0].icon) {
          url = `${window.setting.restApiPathName}/service/ddc/config/icon/${curList[0].icon}`
        } else {
          url = folder
        }
      } else {
        url = folder
      }
      return url
    },
    initEventListener() {
      // 收起标签
      const job = () => {
        this.filterPopoverVisible = false
      }
      const dom = $(this.$refs['filter-popover'])
      dom.on('mouseenter', () => {
        $(document.body).off('click', job)
      })
      dom.on('mouseleave', () => {
        $(document.body).one('click', job)
      })
      $(this.$el).on('mouseenter', '.filter-header-btn.active', function () {
        $(document.body).off('click', job)
      })
      $(this.$el).on('mouseleave', '.filter-header-btn.active', function () {
        $(document.body).one('click', job)
      })
    },
    handleNode(row) {
      if (row.manager === 'AUTH') {
        // 有权限
        this.clickNode('catalogueAttr', row)
      }
      if (row.manager === 'UN_AUTH' || !row.manager) {
        // 申请权限
        this.clickNode('applyPower', row)
      }
    },
    getDepartmentList(data) {
      return departmentName(data)
    },
    getDataManagers(data, type) {
      let result = ''
      let newList = []
      data &&
        data.length > 0 &&
        data.map(item => {
          if (type === AssetsTypeEnum.CATALOG) {
            newList.push(item.butler)
          } else {
            newList.push(item.name)
          }
        })
      result = newList.join('、')
      return result || '--'
    },
    handlerOver(row) {
      if (row.subAssetsType === AssetsTypeEnum.CATALOG) {
        return
      } else {
        if (row.manager !== 'AUTH') {
          this.tables.map(item => {
            if (item.assetsId === row.assetsId) {
              item.tooltip = true
            } else {
              item.tooltip = false
            }
          })
        }
      }
    },
    handlerLeave(row) {
      if (row.subAssetsType === AssetsTypeEnum.CATALOG) {
        return
      } else {
        if (row.manager !== 'AUTH') {
          row.tooltip = false
        }
      }
    },
    showDetail(row) {
      if (row.subAssetsType === AssetsTypeEnum.CATALOG) {
        // 点击列表都可以跳转
        this.clickNode('jumpTree', row)
        return
        if (row.manager === 'AUTH') {
          // 有权限
          this.clickNode('jumpTree', row)
        }
        if (row.manager === 'UNDER_REVIEW') {
          // 权限申请中
          this.$datablauMessage({
            message: this.$t('assets.assetList.powerTip'),
            type: 'info',
          })
        }
        if (row.manager === 'UN_AUTH') {
          // 申请权限
          this.clickNode('applyPower', row)
        }
        return
      }
      if (row.manager !== 'AUTH') {
        // this.$datablauMessage.warning('您没有该资产的浏览权限')
        return
      }
      const pos = location.href.indexOf('#/')
      const baseUrl = location.href.slice(0, pos + 2)
      let url = ''
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
      // 判断是否可以跳转
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
    // 当资产所在的元数据中的数据源改变时，数据资产中的资产已经不存在了，提示删除
    deleteAsset(data) {
      this.$http
        .delete(`${this.$url}/service/ddc/assets/`, { data })
        .then(res => {
          this.getList()
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    // 判断当前用户是否有查看目录的权限
    getManage(manager, type) {
      let result = false
      let name = '申请权限'
      let data = {}
      let className = ''
      if (manager === 'AUTH') {
        // 目录属性
        result = true
        name = this.$t('assets.assetList.properties')
        className = 'normal-power'
      } else if (manager === 'UN_AUTH') {
        // 申请权限
        result = false
        className = ''
        name = this.$t('assets.assetList.applyForPermission')
      } else if (manager === 'UNDER_REVIEW') {
        // 申请中
        result = false
        className = 'powering'
        name = this.$t('assets.assetList.applying')
      }
      if (parseInt(type) === 1) {
        return result
      }
      if (parseInt(type) === 2) {
        return name
      }
      if (parseInt(type) === 3) {
        return className
      }
    },
    // 机构部门或数据权属的列表
    getOrgList() {
      api.getOrganizationList().then(res => {
        this.departmentList = res.data.children || []
      })
    },
    // 通过数据权属或者机构id返回名称
    getDepartmentName(id) {
      let result = ''
      this.departmentList.map(item => {
        if (item.id === id) {
          result = item.fullName
        }
      })
      return result
    },
    // 获取资产目录的发布状态
    getPublishStatus(type) {
      let typeName = ''
      let flag = true // 是否有访问权限
      if (type === 'UNPUBLISHED') {
        typeName = this.$t('assets.assetList.unpublished')
        flag = false
      } else if (type === 'UNDER_REVIEW') {
        typeName = this.$t('assets.assetList.underReview')
        flag = false
      } else if (type === 'PUBLISHED') {
        typeName = this.$t('assets.assetList.published')
        flag = true
      } else if (type === 'OFFLINE') {
        typeName = this.$t('assets.assetList.offline')
        flag = false
      } else {
        typeName = this.$t('assets.assetList.unpublished')
      }
      return flag
    },
    // 获取资产类型
    getAssetsType(type, num, data = {}) {
      let result = ''
      let color = ''
      let rgba = ''
      let iconType = ''
      let icon = ''
      switch (type) {
        case AssetsTypeEnum.CATALOG:
          result = this.$t('assets.gateway.catalog')
          color = '#3295f8'
          rgba = '(50,149,248,0.1)'
          iconType = data.subAssetsType
          icon = data.icon
          break
        case AssetsTypeEnum.TABLE:
        case AssetsTypeEnum.VIEW:
          result = this.$t('assets.assetList.dataSheet')
          iconType = data.subAssetsType
          if (iconType === AssetsTypeEnum.TABLE) {
            color = '#3295f8'
            rgba = '(50,149,248,0.1)'
          } else {
            color = '#4B5CC4'
            rgba = '(75,92,196,0.1)'
          }
          break
        case AssetsTypeEnum.DATA_OBJECT:
          result = this.$t('assets.assetList.dataItem')
          color = '#c44ad1'
          rgba = '(196,74,209,0.1)'
          iconType = 'COLUMN'
          break
        case AssetsTypeEnum.DATA_STANDARD:
          result = this.$t('assets.assetList.dataStandard')
          color = '#38b48b'
          rgba = '(56,180,139,0.1)'
          iconType = 'DOMAIN'
          break
        case AssetsTypeEnum.DATA_STANDARD_CODE:
          result = this.$t('assets.assetList.standardCode')
          color = '#38b48b'
          rgba = '(56,180,139,0.1)'
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
    search() {
      this.getSearchResults()
    },
    tagsVisible(groupName, tagName, tagValue) {
      const keyword = this.tagFilterKeyword
      if (!keyword) {
        return true
      }
      const groupIn = contentIncludes => {
        const groupFit = PinyinMatch.match(groupName, keyword)
        const tags = this.filterPopoverTableDataDisplay.filter(
          i => i.groupName === groupName
        )
        if (groupFit) {
          return true
        } else if (contentIncludes) {
          const contentFit = tags.some(t => {
            let valueFit = false
            if (t.isUdp) {
              valueFit =
                this.udpsMap[t.id].selection &&
                this.udpsMap[t.id].selection
                  .filter(i => i)
                  .some(i => {
                    return PinyinMatch.match(i, keyword)
                  })
            } else {
              valueFit = this.tags[t.tagId].children.some(i => {
                return PinyinMatch.match(i.name, keyword)
              })
            }
            return PinyinMatch.match(t.tagName, keyword) || valueFit
          })
          if (contentFit) {
            return true
          }
        }
        return false
      }
      const tagIn = contentIncludes => {
        const tags = this.filterPopoverTableDataDisplay.filter(
          i => i.groupName === groupName
        )
        let valueFit = false
        const t = tags.filter(i => i.tagName === tagName)[0]
        if (!contentIncludes) {
          return PinyinMatch.match(t.tagName, keyword)
        }

        if (t.isUdp) {
          valueFit =
            this.udpsMap[t.id].selection &&
            this.udpsMap[t.id].selection
              .filter(i => i)
              .some(i => {
                return PinyinMatch.match(i, keyword)
              })
        } else {
          valueFit = this.tags[t.tagId].children.some(i => {
            return PinyinMatch.match(i.name, keyword)
          })
        }
        return PinyinMatch.match(t.tagName, keyword) || valueFit
      }
      const valueIn = () => {
        return PinyinMatch.match(tagValue, keyword)
      }
      if (groupName && !tagName) {
        if (groupIn(true)) {
          return true
        }
      } else {
        if (groupIn()) {
          return true
        }
      }
      if (tagName && !tagValue) {
        if (tagIn(true)) {
          return true
        }
      } else if (tagName) {
        if (tagIn()) {
          return true
        }
      }
      if (tagValue) {
        if (valueIn()) {
          return true
        }
      }
    },
    handleCurrentChange(current) {
      this.currentPage = current
      this.getSearchResults()
    },
    handleSizeChange(size) {
      this.pageSize = size
      this.currentPage = 1
      this.getSearchResults()
    },
    getTagGroupList(callback) {
      this.$http
        .get(this.$url + '/service/tags/group')
        .then(res => {
          res.data.sort((a, b) => {
            if (typeof a.order === 'number' && typeof b.order === 'number') {
              return a.order - b.order
            }
            if (!a.order) {
              return 1
            }
            if (!b.order) {
              return -1
            }
          })
          this.tagGroupList = res.data
          const filterPopoverTableData = []
          this.tagGroupList.forEach(item => {
            this.moreTags
              .filter(t => {
                return t.tagGroupId === item.id
              })
              .forEach(t => {
                filterPopoverTableData.push({
                  groupId: item.id,
                  groupName: item.name,
                  tagId: t.id,
                  tagName: t.name,
                })
              })
          })
          callback(filterPopoverTableData)
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    prepareTags() {
      const tags = {}
      const tmpTags = _.cloneDeep(this.$globalData.tags)
      for (const groupId in tmpTags) {
        const group = tmpTags[groupId]
        const children = []
        group.children.forEach(t => {
          children.push(t)
        })
        tags[group.id] = {
          id: group.id,
          name: group.name,
          children: children,
          selection: [],
          tagGroupId: group.tagGroupId,
        }
      }
      this.tags = tags
      this.calculateFilterHeight()
    },
    handleTagCollapse(data) {
      setTimeout(() => {
        const list = $(this.$refs.contentList)
        const tagBox = $('#tag-target')
        const tagFolder = $('#tag-folder')
        const navHeight = 50
        const height =
          Number.parseFloat($('#calculate-width').css('height')) - 10
        // console.log(data)
        if (data) {
          tagBox.css('overflow', 'visible')
          tagBox.css('height', 'auto')
          this.showTagCollapse = false
          this.showTagFolder = true

          let filterTagHeight = $('#tag-target')[0]
            ? $('#tag-target')[0].offsetHeight / 40
            : 1
          tagBox.css('height', self.filterTagHeight * 40)
          list.css('top', height + navHeight + (filterTagHeight - 1) * 40)
          tagFolder.css('margin-top', filterTagHeight * 40 - 30)
        } else {
          tagBox.css('overflow', 'hidden')
          tagBox.css('height', 80)
          list.css('top', height + navHeight + 40)
          this.showTagCollapse = true
          this.showTagFolder = false
        }
      })
    },
    calculateFilterHeight() {
      setTimeout(() => {
        let filterTagHeight = $('#tag-target')[0]
          ? $('#tag-target')[0].offsetHeight / 40
          : 1
        const height =
          Number.parseFloat($('#calculate-width').css('height')) - 10
        const list = $(this.$refs.contentList)
        const sort = $('.content-sort')
        const nav = $('.content-nav')
        const tagBox = $('#tag-target')
        const navHeight = 50
        nav.css('height', height + 10)
        sort.css('top', height + 10)
        if (filterTagHeight > 2) {
          this.showTagCollapse = true
          tagBox.css('height', 80)
          tagBox.css('overflow', 'hidden')
          list.css('top', height + navHeight + 40)
          this.showTagCollapse = true
          this.showTagFolder = false
        } else {
          this.showTagCollapse = false
          this.showTagFolder = false
          list.css('top', height + navHeight + (filterTagHeight - 1) * 40)
        }
      })
    },
    tagsLabel(selection) {
      if (selection && selection.length > 0) {
        return ' : ' + selection.map(item => item.name).join(', ')
      } else {
        return ''
      }
    },
    udpLabel(udpId, udpValue) {
      if (this.udpValue[udpId] && udpValue) {
        return ' : ' + udpValue
      } else {
        return ''
      }
    },
    handleFakeSelectorClick(id) {
      $('#realSelector' + id).click()
    },
    changeSort(row) {
      this.sortLabel.map(item => {
        if (item.id === row.id) {
          item.status = true
        } else {
          item.status = false
        }
      })
      this.currentPage = 1
      this.getSearchResults()
    },
    getCatalogManager(data) {
      if (data && data.length > 0) {
        let dataList = []
        data.map(item => {
          dataList.push(item.catalogManager)
        })
        return dataList.join('、')
      }
      return '--'
    },
    getSearchResults(deleteTagId) {
      this.showNull = false
      this.lastKeyword = this.keyword
      const query = this.$route.query
      this.contentLoading = true
      const tagMap = this.$globalData.tagMap
      const tagParent = new Map()
      const tagIdsArray = []
      this.tagIds &&
        this.tagIds.forEach(item => {
          if (tagParent.has(tagMap.get(item).parentId)) {
          } else {
            tagParent.set(tagMap.get(item).parentId, [])
          }
          tagParent.get(tagMap.get(item).parentId).push(item)
        })
      tagParent.forEach(tags => {
        if (tags.indexOf(deleteTagId) > -1) {
          let index = tags.indexOf(deleteTagId)
          delete tags[index]
        }
        let newTag = tags.filter(item => {
          if (item) return item
        })
        newTag.length ? tagIdsArray.push(newTag) : null
      })
      let udpFilters = null
      if (this.udpValue) {
        Object.keys(this.udpValue).forEach(v => {
          if (this.udpValue[v] && this.udpValue[v].length > 0) {
            if (!udpFilters) {
              udpFilters = {}
            }
            udpFilters[v] = this.udpValue[v].join('@\n@')
          }
        })
      }
      let categories = null
      if (query.hasOwnProperty('categories')) {
        categories = query.categories.split(',')
        categories = categories
          .map(item => parseInt(item))
          .filter(item => !!item)
      }
      let dataType = []
      if (this.selectedDataTypes.length > 0) {
        this.selectedDataTypes.map(type => {
          switch (type) {
            case 80000004:
              dataType.push(AssetsTypeEnum.TABLE)
              break
            case 80500008:
              dataType.push(AssetsTypeEnum.VIEW)
              break
            case 80000005:
              dataType.push(AssetsTypeEnum.DATA_OBJECT)
              break
            case 82800002:
              dataType.push(AssetsTypeEnum.REPORT)
              break
            case 82800019:
              dataType.push(AssetsTypeEnum.DATA_SERVICE)
              break
            case 82800008:
              dataType.push(AssetsTypeEnum.FILE)
              break
            case 80010066:
              dataType.push(AssetsTypeEnum.DATA_STANDARD)
              break
            case 80010098:
              dataType.push(AssetsTypeEnum.DATA_STANDARD_CODE)
              break
            case 82800003:
              dataType.push(AssetsTypeEnum.INDEX)
              break
            case 11111111:
              dataType.push(AssetsTypeEnum.CATALOG)
              break
            case 22222222:
              dataType.push(AssetsTypeEnum.CATALOG)
              break
            default:
              break
          }
        })
      } else {
        dataType = Object.keys(this.dataTypes).map(key => {
          return this.dataTypes[key].type
        })
      }
      let orderBy
      this.sortLabel.map(item => {
        if (item.status) {
          orderBy = item.id
        }
      })
      let catalogPath
      if (this.currentNode.id) {
        catalogPath = this.currentNode.catalogPath + '/' + this.currentNode.id // 目录路径
      }
      const isPower = this.selectedDataTypes.some(item => item === 22222222)
      const params = {
        noRight: isPower,
        pageNum: this.currentPage,
        pageSize: this.pageSize,
        structureId: this.nowBase.structureId,
        catalogId: this.currentNode.id, // 目录ID不能为空
        catalogPath, // 目录路径
        searchStr: this.keyword, // 搜索关键字
        assetsTypeList: Array.from(new Set(dataType)), // 资产类型
        tagIds: tagIdsArray, // 标签id组合
        orderBy,
        sort: 'DESC', // DESC：降序   ASC：升序
      }
      if (
        this.keyword ||
        dataType.length !== this.isSearch.length ||
        tagIdsArray.length > 0
      ) {
        this.isSearch = true
      } else {
        this.isSearch = false
      }
      if (!this.nowBase.structureId) {
        // 刚进入页面时，没有structureId时，不请求接口
        return
      }
      api
        .getAssetsList(1, params)
        .then(res => {
          this.showNull = true
          this.managerMap = res.data.data.status
          this.clickNode('manager', this.managerMap)
          if (res.data.data.assetsList && res.data.data.assetsList.length > 0) {
            // 当前结构下的目录的权限集合
            if (!this.currentNode.id) {
            }
            res.data.data.assetsList.map(async item => {
              switch (item.subAssetsType) {
                case AssetsTypeEnum.CATALOG:
                  item.tableName = item.assetsName
                  break
                case AssetsTypeEnum.TABLE:
                case AssetsTypeEnum.VIEW:
                  // 表和视图
                  item.typeId = 80000004
                  item.objectId = item.itemId
                  item.tableName =
                    item.assetsName + (item.alias ? `(${item.alias})` : '')
                  break
                case AssetsTypeEnum.DATA_OBJECT:
                  item.typeId = 80000005
                  item.objectId = item.itemId
                  item.tableName =
                    item.assetsName + (item.alias ? `(${item.alias})` : '')
                  break
                case AssetsTypeEnum.REPORT:
                  item.typeId = 82800002
                  item.objectId = item.itemId
                  item.tableName =
                    item.assetsName + (item.alias ? `(${item.alias})` : '')
                  break
                case AssetsTypeEnum.DATA_STANDARD:
                  item.typeId = 80010066
                  item.domainId = item.itemId
                  item.tableName =
                    item.assetsName + (item.alias ? `(${item.alias})` : '')
                  break
                case AssetsTypeEnum.DATA_STANDARD_CODE:
                  item.typeId = 80010098
                  item.domainId = item.itemId
                  item.tableName =
                    item.assetsName + (item.alias ? `(${item.alias})` : '')
                  break
                case AssetsTypeEnum.INDEX:
                  item.typeId = 82800003
                  item.domainId = item.itemId
                  item.tableName =
                    item.assetsName + (item.alias ? `(${item.alias})` : '')
                  break
                case AssetsTypeEnum.DATA_SERVICE:
                  item.typeId = 82800019
                  item.api = item.itemId
                  item.tableName =
                    item.assetsName + (item.alias ? `(${item.alias})` : '')
                  break
                case AssetsTypeEnum.FILE:
                  item.typeId = 82800008
                  item.objectId = item.itemId
                  item.tableName =
                    item.assetsName + (item.alias ? `(${item.alias})` : '')
                  break
                default:
                  break
              }
              item.manager = this.managerMap[item.catalogId]
              item.tooltip = false
              let tagIds = []
              if (item.tagMap && item.tagMap.length > 0) {
                item.tagMap.map(o => {
                  tagIds.push(parseInt(o.id))
                })
              }
              item.tagIds = tagIds
              item.vote = item.score ? item.score : 0
            })
            if (this.currentNode.id) {
              // 避免有时加载过慢，展示的数据不对
              if (this.currentNode.id === params.catalogId) {
                this.tables = res.data.data.assetsList
                this.totalItems = res.data.data.total
              }
            } else {
              this.tables = res.data.data.assetsList
              this.totalItems = res.data.data.total
            }
          } else {
            this.totalItems = 0
            this.tables = []
          }
          this.contentLoading = false
        })
        .catch(e => {
          this.showNull = true
          this.contentLoading = false
          this.totalItems = 0
          this.tables = []
          this.showFailure(e)
        })
    },
    handleDataTypeChange() {
      this.currentPage = 1
      this.getSearchResults()
    },
    removeTag(i, array) {
      array.splice(i, 1)
      this.$set(array, -1, 'update')
      this.handleTagChange()
    },
    handleTagCheckboxChange(tag) {
      // this.getSearchResults(tag.tagId)
    },
    handleTagChange(selection) {
      console.log(selection)
      const tagIds = []
      for (const index in this.tags) {
        const t = this.tags[index]
        t.selection.forEach(item => {
          tagIds.push(item.tagId)
        })
      }
      this.tagIds = tagIds
      this.currentPage = 1
      this.getSearchResults()
      this.calculateFilterHeight()
      if (selection && selection.length === 0) {
        $('#calculate-width').click()
      }
    },
    // table 数组去重
    // @Deprecated
    removeDupTable(dataArr) {
      const arr2 = []
      const map = {}
      dataArr.forEach(item => {
        if (!map[item.id]) {
          arr2.push(item)
          map[item.id] = item
        }
      })
      return arr2
    },
    async pushUdpToFilterPopoverTableData(filterPopoverTableData) {
      this.udps.forEach(item => {
        filterPopoverTableData.push({
          isUdp: true,
          groupName: item.typeId,
          id: item.id,
          tagName: item.name,
        })
      })
      this.filterPopoverTableData = filterPopoverTableData
      await this.getFromDatabase('tag-ddc-visible')
        .then(collection => {
          try {
            const collectionArray = JSON.parse(collection)
            filterPopoverTableData.forEach(item => {
              if (!item.isUdp) {
                this.$set(
                  this.tagCollection,
                  item.tagId,
                  collectionArray.includes(String(item.tagId))
                )
              }
            })
          } catch (e) {}
        })
        .catch(() => {
          filterPopoverTableData.forEach(item => {
            if (!item.isUdp) {
              this.$set(this.tagCollection, item.tagId, false)
            }
          })
        })
        .then(() => {
          if (this.isAdmin || (!this.isAdmin && this.tagCollection)) {
            this.notAnyTag = !Object.values(this.tagCollection).some(i => i)
          }
        })
      const udpSet = []
      this.getFromDatabase('udp-ddc-visible')
        .then(collection => {
          try {
            const collectionArray = JSON.parse(collection)
            filterPopoverTableData.forEach(item => {
              if (item.isUdp) {
                this.$set(
                  this.udpCollection,
                  item.id,
                  collectionArray.includes(String(item.id))
                )
                if (!this.isAdmin) {
                  if (collectionArray.includes(String(item.id))) {
                    udpSet.push(this.udpsMap[item.id])
                  }
                } else {
                  udpSet.push(this.udpsMap[item.id])
                }
              }
            })
            this.getUdpValuesBatch(udpSet)
          } catch (e) {}
        })
        .catch(() => {
          filterPopoverTableData.forEach(item => {
            if (item.isUdp) {
              this.$set(this.udpCollection, item.id, false)
              udpSet.push(this.udpsMap[item.id])
            }
          })
          this.getUdpValuesBatch(udpSet)
        })
        .then(() => {
          if (this.isAdmin || (!this.isAdmin && udpSet.length > 0)) {
            this.notAnyTag = false
          }
        })
    },
    getUdps(filterPopoverTableData) {
      const sortByOrder = arr => {
        arr.sort((a, b) => a.order - b.order)
      }
      this.$http
        .get(this.$url + `/service/entities/udps/${LDMTypes.Entity}`)
        .then(res => {
          this.$http
            .get(this.$url + `/service/entities/udps/${LDMTypes.View}`)
            .then(res1 => {
              this.$http
                .get(this.$url + `/service/entities/udps/${LDMTypes.Report}`)
                .then(res2 => {
                  sortByOrder(res.data)
                  sortByOrder(res1.data)
                  sortByOrder(res2.data)
                  this.udps = res.data.concat(res1.data).concat(res2.data)
                  this.udps.forEach(u => {
                    this.udpValue[u.id] = []
                    this.udpsMap[u.id] = u
                  })
                  this.pushUdpToFilterPopoverTableData(filterPopoverTableData)
                  this.calculateFilterHeight()
                })
            })
        })
        .catch(() => {
          this.filterPopoverTableData = filterPopoverTableData
        })
    },
    getUdpValues(udp) {
      const udpId = udp.id
      if (!udp.selection) {
        this.$http
          .get(this.$url + `/service/entities/udps/${udpId}/values`)
          .then(res => {
            this.$set(udp, 'selection', res.data)
          })
          .catch(e => {
            this.$showFailure(e)
          })
      }
    },
    getUdpValuesBatch(udps) {
      const valueNotLoadedUdps = udps.filter(item => {
        return !item.selection
      })
      this.$http
        .post(
          this.$url + '/service/entities/udps/udpIds/values',
          valueNotLoadedUdps.map(u => u.id)
        )
        .then(res => {
          for (const k in res.data) {
            const udp = this.udpsMap[k]
            if (
              res.data[k] &&
              res.data[k].length > 0 &&
              !res.data[k].every(i => !i)
            ) {
              this.$set(udp, 'selection', res.data[k])
            } else {
              this.udpNoValueSet.add(k)
            }
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    handleUdpValueChange(u) {
      if (u && u.length === 0) {
        $('#calculate-width').click()
      }
      this.tableKey++
      this.calculateFilterHeight()
      this.getSearchResults()
    },
    cancelTagFilter(tag) {
      tag.selection = []
      this.handleTagChange(tag.selection)
      $('#calculate-width').click()
      this.calculateFilterHeight()
      this.getSearchResults()
    },
    cancelUdpFilter(udpId) {
      this.udpValue[udpId] = []
      $('#calculate-width').click()
      this.calculateFilterHeight()
      this.getSearchResults()
    },
    saveToDatabase(widgetId, json) {
      this.$http
        .post(this.$url + '/service/dashboard/widgets', {
          widgetId: widgetId,
          content: JSON.stringify(json),
        })
        .then(() => {})
        .catch(e => {
          this.showFailure(e)
        })
    },
    getFromDatabase(widgetId) {
      return new Promise((resolve, reject) => {
        this.$http
          .post(this.$url + `/widget/getWidgetConfig?id=${widgetId}`)
          .then(res => {
            resolve(res.data.content)
          })
          .catch(e => {
            reject()
          })
      })
    },
    handleCollectionChange(isUdp) {
      if (isUdp) {
        this.saveToDatabase(
          'udp-ddc-visible',
          Object.keys(this.udpCollection).filter(i => this.udpCollection[i])
        )
      } else {
        this.saveToDatabase(
          'tag-ddc-visible',
          Object.keys(this.tagCollection).filter(i => this.tagCollection[i])
        )
      }
    },
  },
  computed: {
    sortLabel() {
      const result = [
        {
          name: this.$t('assets.assetList.score'),
          status: true,
          id: 'score',
        },
        {
          name: this.$t('assets.assetList.views'),
          status: false,
          id: 'visitCount',
        },
      ]
      return result
    },
    dataTypes() {
      const result = {
        Entity: {
          label: this.$t('assets.assetList.table'),
          typeId: LDMTypes.Entity,
          type: AssetsTypeEnum.TABLE, // 数据表
        },
        VIEW: {
          label: this.$t('assets.assetList.view'),
          typeId: LDMTypes.View,
          type: AssetsTypeEnum.VIEW, // 视图
        },
        Attribute: {
          label: this.$t('assets.assetList.dataItem'),
          typeId: LDMTypes.Attribute,
          type: AssetsTypeEnum.DATA_OBJECT, // 数据项
        },
        Report: {
          label: this.$t('assets.assetList.dataReport'),
          typeId: LDMTypes.Report,
          type: AssetsTypeEnum.REPORT,
        },
        API: {
          label: this.$t('assets.assetList.dataService'),
          typeId: LDMTypes.API,
          type: AssetsTypeEnum.DATA_SERVICE,
        },
        ShareFile: {
          label: this.$t('assets.assetList.file'),
          typeId: LDMTypes.ShareFile,
          type: AssetsTypeEnum.FILE,
        },
        Domain: {
          label: this.$t('assets.assetList.basicDomain'),
          typeId: LDMTypes.Domain,
          type: AssetsTypeEnum.DATA_STANDARD, // 基础标准
        },
        DomainCode: {
          label: this.$t('assets.assetList.standardCode'),
          typeId: LDMTypes.CODE,
          type: AssetsTypeEnum.DATA_STANDARD_CODE, // 标准代码
        },
        Index: {
          label: this.$t('assets.assetList.indexStandard'),
          typeId: LDMTypes.Index,
          type: AssetsTypeEnum.INDEX,
        },
        catalog: {
          label: this.$t('assets.assetList.catalogue'),
          typeId: 11111111,
          type: AssetsTypeEnum.CATALOG, // 目录
        },
        // power: {
        //   label: this.$t('assets.assetList.filterWithoutPermission'),
        //   typeId: 22222222,
        //   type: AssetsTypeEnum.CATALOG, // 权限,只针对目录
        // },
      }
      return result
    },
    tagsDisplay() {
      return []
    },
    moreTags() {
      const result = []
      const keys = Object.keys(this.tags)
      keys.sort((a, b) => {
        return (
          this.$globalData.tagMap.get(parseInt(a)).order -
          this.$globalData.tagMap.get(parseInt(b)).order
        )
      })
      keys.forEach(item => {
        result.push(this.tags[item])
      })
      let selectedTagMoudle = result.filter(item => {
        return item.selection.length > 0
      })
      this.selectedTagMoudleLen = selectedTagMoudle.length
      return result
    },
    filterPopoverTableDataDisplay() {
      if (this.$auth.DATA_ASSET_CHOOSE_TAG_MANAGE) {
        return this.filterPopoverTableData
      } else {
        return this.filterPopoverTableData.filter(i => {
          if (i.isUdp) {
            return this.udpCollection[i.id]
          } else {
            return this.tagCollection[i.tagId]
          }
        })
      }
    },
    filterPopoverTableDataGroupName() {
      const all = this.filterPopoverTableDataDisplay
      const groupNames = new Set()
      all.forEach(item => {
        groupNames.add(item.groupName)
      })
      return Array.from(groupNames)
    },
    showTagFilter() {
      return (
        !this.filterPopoverVisible && this.filterPopoverTableData.length > 0
      )
    },
  },
}
