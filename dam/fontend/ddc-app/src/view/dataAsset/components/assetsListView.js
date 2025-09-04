import _ from 'lodash'
import Visible from '@/view/search/icon/visible.vue'
import PinyinMatch from 'pinyin-match'
import LDMTypes from '@constant/LDMTypes'
import api from '../utils/api'
import { AssetsTypeEnum } from '@/view/dataAsset/utils/Enum'
import { departmentName } from '@/view/dataAsset/utils/methods'
import folder from '../../../assets/images/search/folder.svg'
import IsShowTooltip from '@/components/common/isShowTooltip/isShowTooltip.vue'
import {
  hasDataSetAuth,
  hasReportAuth,
  hasFileAuth,
  hasIndexAuth,
  hasStandardAuth,
  hasCodeAuth,
  hasServiceAuth,
  toBrowsing,
} from '@/view/dataAsset/utils/methods'
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
    IsShowTooltip,
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
      tagMap: {},
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
      contentLoading: false,
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
      pageSize: 20,
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
  async mounted() {
    this.getDirectoryType()
    this.getOrgList()
    await this.initTags()
    this.initEventListener()
    // this.initTagGroupList(list => {
    //   this.getUdps(list)
    // })
    await this.initTagGroupList()
    await this.initTagCollection()
  },
  watch: {
    contentLoading(val) {
      this.clickNode('loading', { listLoading: val })
    },
    nowBase: {
      handler(val, old) {
        this.keyword = ''
        this.currentPage = 1
        // this.selectedDataTypes = []
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
    async initTagCollection() {
      try {
        const collection = await this.getFromDatabase('tag-ddc-visible')
        try {
          const collectionArray = JSON.parse(collection)
          this.filterPopoverTableData.forEach(item => {
            if (!item.isUdp) {
              this.$set(
                this.tagCollection,
                item.tagId,
                collectionArray.includes(String(item.tagId))
              )
            }
          })
          if (this.isAdmin || (!this.isAdmin && this.tagCollection)) {
            this.notAnyTag = !Object.values(this.tagCollection).some(i => i)
          }
        } catch (e) {}
      } catch (error) {
        this.filterPopoverTableData.forEach(item => {
          if (!item.isUdp) {
            this.$set(this.tagCollection, item.tagId, false)
          }
        })
      }
    },
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
          url = `${window.setting.products.dam.assetsUrl}/config/icon/${curList[0].icon}`
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
          newList.push(item.name)
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
      }
      if (row.manager !== 'AUTH') {
        // this.$datablauMessage.warning('您没有该资产的浏览权限')
        return
      }
      const pos = location.href.indexOf('#/')
      let result = false
      let url = ''
      switch (row.subAssetsType) {
        case AssetsTypeEnum.DATA_OBJECT: // 数据项
          url = this.BaseUtils.RouterUtils.getFullUrl('columnDetails', {
            objectId: row.itemId,
            catalogId: row.catalogId,
            id: row.itemId,
            blank: true,
          })
          result = hasDataSetAuth(this, true)
          break
        case AssetsTypeEnum.TABLE: // 数据表
          url = this.BaseUtils.RouterUtils.getFullUrl('tableDetails', {
            objectId: row.itemId,
            catalogId: row.catalogId,
            id: row.itemId,
            type: 'table',
            blank: true,
          })
          result = hasDataSetAuth(this, true)
          break
        case AssetsTypeEnum.VIEW: // 数据表
          url = this.BaseUtils.RouterUtils.getFullUrl('viewDetails', {
            objectId: row.itemId,
            catalogId: row.catalogId,
            id: row.itemId,
            type: 'view',
            blank: true,
          })
          result = hasDataSetAuth(this, true)
          break
        case AssetsTypeEnum.REPORT: // 报表
          url = this.BaseUtils.RouterUtils.getFullUrl('reportDetails', {
            objectId: row.itemId,
            id: row.assetsId,
            catalogId: row.catalogId,
            blank: true,
          })
          result = hasReportAuth(this, true)
          break
        case AssetsTypeEnum.FILE: // 文件
          url = this.BaseUtils.RouterUtils.getFullUrl('fileDetails', {
            objectId: row.itemId,
            catalogId: row.catalogId,
            id: row.assetsId,
            blank: true,
          })
          result = hasFileAuth(this)
          break
        case AssetsTypeEnum.DATA_STANDARD:
          // 基础标准
          url = this.BaseUtils.RouterUtils.getFullUrl('dataStandard', {
            domainId: row.itemId,
            blank: true,
            isAssets: true,
          })
          result = hasStandardAuth(this, true)
          break
        case AssetsTypeEnum.DATA_STANDARD_CODE:
          // 标准代码
          url = this.BaseUtils.RouterUtils.getFullUrl('code', {
            code: row.itemId,
            blank: true,
            isAssets: true,
          })
          result = hasCodeAuth(this, true)
          break
        case AssetsTypeEnum.INDEX: // 基础指标
          url = this.BaseUtils.RouterUtils.getFullUrl('dataStandard', {
            domainId: row.itemId,
            blank: true,
            isAssets: true,
          })
          result = hasIndexAuth(this, true)
          break
        default:
          break
      }
      if (!result) {
        this.$blauShowSuccess('您没有相关模块权限', 'warning')
        return
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
            toBrowsing(
              {
                typeId: row.subAssetsType,
                objectId: row.itemId,
                code: row.domainCode,
                domainId: row.itemId,
              },
              this
            )
          } else {
            this.$DatablauAlert(
              '数据资产源端已被删除。',
              this.$t('common.info.title'),
              {
                confirmButtonText: this.$t('common.button.ok'),
                type: 'warning',
              }
            )
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    // 当资产所在的元数据中的数据源改变时，数据资产中的资产已经不存在了，提示删除
    deleteAsset(data) {
      this.$http
        .delete(`${this.$asstes_url}/assets/`, { data })
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
          result = this.$t('assets.generalSettings.none')
          color = '#3295f8'
          rgba = '(50,149,248,0.1)'
          iconType = data.subAssetsType
          icon = data.icon
          break
        case AssetsTypeEnum.TABLE:
          result = this.$t('assets.generalSettings.table')
          if (data.subAssetsType === AssetsTypeEnum.TABLE) {
            iconType = data.isLogical ? 'logicaltable' : data.subAssetsType
            color = '#3295f8'
            rgba = '(50,149,248,0.1)'
          } else {
            iconType = data.subAssetsType
            color = '#4B5CC4'
            rgba = '(75,92,196,0.1)'
          }
          break
        case AssetsTypeEnum.VIEW:
          result = this.$t('assets.generalSettings.view')
          if (data.subAssetsType === AssetsTypeEnum.TABLE) {
            iconType = data.isLogical ? 'logicaltable' : data.subAssetsType
            color = '#3295f8'
            rgba = '(50,149,248,0.1)'
          } else {
            iconType = data.subAssetsType
            color = '#4B5CC4'
            rgba = '(75,92,196,0.1)'
          }
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
          color = '#9d5b8b'
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
          const iconList = ['xlsx', 'jpg', 'mp3']
          iconType = iconList.includes(data.fileType) ? data.fileType : 'file'
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
      this.currentPage = 1
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
    async initTagGroupList() {
      try {
        const res = await this.$http.post(this.$base_url + '/tags/getTagGroup')
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
        this.$nextTick(() => {
          this.filterPopoverTableData = this.moreTags.map(tag => ({
            tagId: tag.id,
            tagName: tag.name,
            groupName: tag.groupName,
          }))
        })
      } catch (error) {
        this.$showFailure(error)
      }
    },
    async initTags() {
      const res = await this.$http.get('/base/tags/tree')
      let allTagGroup = []
      res.data.forEach(category => {
        allTagGroup = allTagGroup.concat(category.children)
      })
      const allTags = {}
      const tagMap = {}
      allTagGroup.forEach(group => {
        if (
          [
            'DATA_IMPORTANCE',
            'DATA_IMPACT_DEGREE',
            'DATA_INFLUENCE_OBJECT',
            'DATA_INFLUENCE_SCOPE',
            'DATA_SENSITIVE',
            'dataAuth',
          ].indexOf(group.content.builtInCode) !== -1 &&
          !this.$featureMap.FE_SECURITY
        ) {
        } else {
          allTags[group.content.tagId] = {
            id: group.content.tagId,
            name: group.name,
            groupName: group.name,
            children: group.children.map(tag => {
              tagMap[tag.content.tagId] = tag.content
              tagMap[group.content.tagId] = group.content
              return { ...tag.content, tagName: tag.name }
            }),
            selection: [],
          }
        }
      })
      this.tags = allTags
      this.tagMap = tagMap
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
          tagBox.css('overflowY', 'auto')
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
          tagBox.css('overflowY', 'auto')
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
      const tagMap = this.tagMap
      const tagParent = new Map()
      const tagIdsArray = []
      this.tagIds &&
        this.tagIds.forEach(item => {
          if (tagParent.has(tagMap[item].parentId)) {
          } else {
            tagParent.set(tagMap[item].parentId, [])
          }
          tagParent.get(tagMap[item].parentId).push(item)
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
              this.$versionFeature.dataasset_CatalogType &&
                dataType.push(AssetsTypeEnum.REPORT)
              break
            case 82800008:
              this.$versionFeature.dataasset_CatalogType &&
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
        catalogPath = this.currentNode.catalogPath + this.currentNode.id + '/' // 目录路径
      }
      const isPower = this.selectedDataTypes.some(item => item === 22222222)
      const params = {
        udpFilters: udpFilters, // 自定义属性
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
                  item.tableName =
                    item.assetsName + (item.alias ? `(${item.alias})` : '')
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
    handleTagCheckboxChange(bool, tag) {
      if (bool) {
        this.tagIds.push(parseFloat(tag.tagId))
      } else {
        this.tagIds = this.tagIds.filter(
          m => parseFloat(m) !== parseFloat(tag.tagId)
        )
      }
      this.getSearchResults()
    },
    handleTagChange(selection) {
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
    // async pushUdpToFilterPopoverTableData(filterPopoverTableData) {
    //   this.udps.forEach(item => {
    //     if (!filterPopoverTableData.find(data => data.tagId === item.id)) {
    //       filterPopoverTableData.push({
    //         isUdp: true,
    //         tagId: item.id,
    //         tagName: item.name,
    //       })
    //     }
    //   })
    //   this.filterPopoverTableData = filterPopoverTableData
    //   await this.getFromDatabase('tag-ddc-visible')
    //     .then(collection => {
    //       try {
    //         const collectionArray = JSON.parse(collection)
    //         filterPopoverTableData.forEach(item => {
    //           if (!item.isUdp) {
    //             this.$set(
    //               this.tagCollection,
    //               item.tagId,
    //               collectionArray.includes(String(item.tagId))
    //             )
    //           }
    //         })
    //       } catch (e) {}
    //     })
    //     .catch(() => {
    //       filterPopoverTableData.forEach(item => {
    //         if (!item.isUdp) {
    //           this.$set(this.tagCollection, item.tagId, false)
    //         }
    //       })
    //     })
    //     .then(() => {
    //       if (this.isAdmin || (!this.isAdmin && this.tagCollection)) {
    //         this.notAnyTag = !Object.values(this.tagCollection).some(i => i)
    //       }
    //     })
    //   const udpSet = []
    //   this.getFromDatabase('udp-ddc-visible')
    //     .then(collection => {
    //       try {
    //         const collectionArray = JSON.parse(collection)
    //         filterPopoverTableData.forEach(item => {
    //           if (item.isUdp) {
    //             this.$set(
    //               this.udpCollection,
    //               item.id,
    //               collectionArray.includes(String(item.id))
    //             )
    //             if (!this.isAdmin) {
    //               if (collectionArray.includes(String(item.id))) {
    //                 udpSet.push(this.udpsMap[item.id])
    //               }
    //             } else {
    //               udpSet.push(this.udpsMap[item.id])
    //             }
    //           }
    //         })
    //         this.getUdpValuesBatch(udpSet)
    //       } catch (e) {}
    //     })
    //     .catch(() => {
    //       filterPopoverTableData.forEach(item => {
    //         if (item.isUdp) {
    //           this.$set(this.udpCollection, item.id, false)
    //           udpSet.push(this.udpsMap[item.tagId])
    //         }
    //       })
    //       this.getUdpValuesBatch(udpSet)
    //     })
    //     .then(() => {
    //       if (this.isAdmin || (!this.isAdmin && udpSet.length > 0)) {
    //         this.notAnyTag = false
    //       }
    //     })
    // },
    // getUdps(filterPopoverTableData) {
    //   const sortByOrder = arr => {
    //     arr.sort((a, b) => a.order - b.order)
    //   }
    //   this.$http
    //     .post(this.$base_url + `/udps/getUdpsOfType?typeId=${LDMTypes.Entity}`)
    //     .then(res => {
    //       this.$http
    //         .post(
    //           this.$base_url + `/udps/getUdpsOfType?typeId=${LDMTypes.View}`
    //         )
    //         .then(res1 => {
    //           this.$http
    //             .post(
    //               this.$base_url +
    //                 `/udps/getUdpsOfType?typeId=${LDMTypes.Report}`
    //             )
    //             .then(res2 => {
    //               sortByOrder(res.data)
    //               sortByOrder(res1.data)
    //               sortByOrder(res2.data)
    //               this.udps = res.data.concat(res1.data).concat(res2.data)
    //               this.udps.forEach(u => {
    //                 this.udpValue[u.id] = []
    //                 this.udpsMap[u.id] = u
    //               })
    //               this.pushUdpToFilterPopoverTableData(filterPopoverTableData)
    //               this.calculateFilterHeight()
    //             })
    //         })
    //     })
    //     .catch(() => {
    //       this.filterPopoverTableData = filterPopoverTableData
    //     })
    // },
    getUdpValues(udp) {
      const udpId = udp.id
      if (!udp.selection) {
        this.$http
          .post(this.$base_url + `/udps/getValuesOfUdp?udpId=${udpId}`)
          .then(res => {
            this.$set(udp, 'selection', res.data)
          })
          .catch(e => {
            this.$showFailure(e)
          })
      }
    },
    getUdpValuesBatch(udps = []) {
      const valueNotLoadedUdps = udps.filter(item => {
        return !item.selection
      })
      this.$http
        .post(
          this.$base_url + '/udps/getValuesOfGivenUdps',
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
        .post(this.$base_url + '/widget/saveWidgetConfig', {
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
          .post(this.$base_url + `/widget/getWidgetConfig?id=${widgetId}`)
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
          name: this.$t('assets.assetList.views'),
          status: false,
          id: 'visitCount',
        },
      ]
      // 如果不是专业版，展示按评分排序，且高亮的是评分按钮
      if (this.$versionFeature.dataasset_AssetComments) {
        result[0].status = false
        result.splice(0, 0, {
          name: this.$t('assets.assetList.score'),
          status: true,
          id: 'score',
        })
      }
      return result
    },
    dataTypes() {
      const result = {
        Entity: {
          label: this.$t('assets.generalSettings.table'),
          typeId: LDMTypes.Entity,
          type: AssetsTypeEnum.TABLE, // 数据表
        },
        VIEW: {
          label: this.$t('assets.generalSettings.view'),
          typeId: LDMTypes.View,
          type: AssetsTypeEnum.VIEW, // 视图
        },
        Attribute: {
          label: this.$t('assets.generalSettings.object'),
          typeId: LDMTypes.Attribute,
          type: AssetsTypeEnum.DATA_OBJECT, // 数据项
        },
        Report: {
          label: this.$t('assets.generalSettings.report'),
          typeId: LDMTypes.Report,
          type: AssetsTypeEnum.REPORT,
        },
        ShareFile: {
          label: this.$t('assets.generalSettings.file'),
          typeId: LDMTypes.ShareFile,
          type: AssetsTypeEnum.FILE,
        },
        Domain: {
          label: this.$t('assets.generalSettings.basicStandard'),
          typeId: LDMTypes.Domain,
          type: AssetsTypeEnum.DATA_STANDARD, // 基础标准
        },
        DomainCode: {
          label: this.$t('assets.generalSettings.standardCode'),
          typeId: LDMTypes.CODE,
          type: AssetsTypeEnum.DATA_STANDARD_CODE, // 标准代码
        },
        Index: {
          label: this.$t('assets.generalSettings.index'),
          typeId: LDMTypes.Index,
          type: AssetsTypeEnum.INDEX,
        },
        catalog: {
          label: this.$t('assets.generalSettings.none'),
          typeId: 11111111,
          type: AssetsTypeEnum.CATALOG, // 目录
        },
      }
      if (!this.$versionFeature.dataasset_CatalogType) {
        delete result.Report
      }
      if (!this.$versionFeature.dataasset_CatalogType) {
        delete result.ShareFile
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
        return this.tagMap[String(a)]?.order - this.tagMap[b]?.order
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
      if (this.$auth && this.$auth.DATA_ASSET_CHOOSE_TAG_MANAGE) {
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
