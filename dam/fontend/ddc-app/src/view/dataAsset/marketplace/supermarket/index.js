import API from '@/view/dataAsset/utils/api'
import HTTP from '@/http/main'
import { AssetsTypeEnum, AttrsTypeEnum } from '@/view/dataAsset/utils/Enum.ts'
import collectBtn from './components/collectBtn.vue'
import IsShowTooltip from '@/components/common/isShowTooltip/isShowTooltip.vue'
import {
  departmentName,
  assetsCollect,
  cancelAssetsCollect,
  getAttrList,
  judgeEllipsize,
} from '@/view/dataAsset/utils/methods'
import folder from '@/assets/images/search/folder.svg'

export default {
  name: 'Supermarket',
  components: {
    collectBtn,
    IsShowTooltip,
  },
  data() {
    return {
      AssetsTypeEnum: AssetsTypeEnum,
      left: 0,
      viewType: 'card',
      form: {
        page: 1,
        size: 20,
      },
      total: 0,
      structureId: 0,
      keywords: '',
      structureList: [],
      catalogList: [],
      catalogId: 0,
      assetsList: [],
      addedAssetsList: false,
      levelList: [],
      orderBy: 'visitCount',
      tagList: {},
      groupList: [],
      sortLen: 0,
      resultTop: 160,
      tableData: [],
      managerMap: {},
      collectCatalogMap: {}, // 已收藏的目录id (key => 收藏id  value => 目录id)
      collectAssetsMap: {}, // 已收藏的资产id (key => 收藏id  value => 资产id)
      favouriteCatalogList: [], // 已收藏的资产id (key => 收藏id  value => 资产id)
      favouriteAssetsList: [], // 已收藏的资产id (key => 收藏id  value => 资产id)
      shoppingList: [], // 审批中的资产
      cartList: [], // 加入购物车的资产
      powerList: [], // 有权限的资产目录
      catalogTypeList: [],
      metaModelTypeList: [],
      metaModelTypes: {},
      allLevelId: [],
      visible: false,
      applyForm: {
        catalogId: '',
        catalogName: '',
        reason: '',
      },
      loading: false,
      isMore: false,
      showMore: false,
      // 骨架图
      headerLoading: true,
      searchLoading: true,
      contentLoading: true,
      favoriteList: [],
      structuredIndex: 0,
      metaModelIconMap: {},
    }
  },
  beforeMount() {
    this.setLeft()
    this.assetsList = [
      {
        name: this.$t('assets.marketplace.allText'),
        type: 'ALL',
        select: true,
      },
      {
        name: this.$t('assets.marketplace.catalog'),
        type: AssetsTypeEnum.CATALOG,
        select: false,
      },
      {
        name: this.$t('assets.marketplace.dataTable'),
        type: AssetsTypeEnum.TABLE,
        select: false,
      },
      {
        name: this.$t('assets.marketplace.view'),
        type: AssetsTypeEnum.VIEW,
        select: false,
      },
      {
        name: this.$t('assets.marketplace.dataObject'),
        type: AssetsTypeEnum.DATA_OBJECT,
        select: false,
      },
      {
        name: this.$t('assets.generalSettings.basicStandard'),
        type: AssetsTypeEnum.DATA_STANDARD,
        select: false,
      },
      {
        name: this.$t('assets.generalSettings.standardCode'),
        type: AssetsTypeEnum.DATA_STANDARD_CODE,
        select: false,
      },
      {
        name: this.$t('assets.generalSettings.index'),
        type: AssetsTypeEnum.INDEX,
        select: false,
      },
      this.$versionFeature.dataasset_CatalogType
        ? {
            name: this.$t('assets.marketplace.report'),
            type: AssetsTypeEnum.REPORT,
            select: false,
          }
        : null,
      this.$versionFeature.dataasset_CatalogType
        ? {
            name: this.$t('assets.marketplace.file'),
            type: AssetsTypeEnum.FILE,
            select: false,
          }
        : null,
      {
        name: '自定义对象',
        type: AssetsTypeEnum.META_MODEL,
        select: false,
      },
    ].filter(i => !!i)
  },
  async mounted() {
    // console.log(this.$route)
    // let metaModelTypes = {}
    // try {
    //   let res = await API.getMetaModelTypes()
    //   console.log(metaModelTypes, 'metaModelTypes')
    //   let data = res.data || []
    //   data.forEach(item => {
    //     metaModelTypes[item.assetKey] = item
    //   })
    //   this.metaModelTypes = metaModelTypes
    // } catch (e) {
    //   this.$showFailure(e)
    // }

    this.init()
  },
  beforeRouteEnter(to, from, next) {
    if (
      from.name == 'tableDetails' ||
      from.name == 'viewDetails' ||
      from.name == 'fileDetails' ||
      from.name === 'reportDetails' ||
      from.name === 'catalogDetails' ||
      from.name === 'columnDetails'
    ) {
      to.meta.isBack = true
    } else {
      to.meta.isBack = false
    }
    next()
  },
  activated() {
    if (!this.$route.meta.isBack) {
      this.loading = true
      this.contentLoading = true
      this.searchLoading = true
      this.tableData = []
      this.structureId = 0
      this.catalogId = ''
      this.catalogList = []
      this.sortLen = 0
      this.assetsList = [
        {
          name: this.$t('assets.marketplace.allText'),
          type: 'ALL',
          select: true,
        },
        {
          name: this.$t('assets.marketplace.catalog'),
          type: AssetsTypeEnum.CATALOG,
          select: false,
        },
        {
          name: this.$t('assets.marketplace.dataTable'),
          type: AssetsTypeEnum.TABLE,
          select: false,
        },
        {
          name: this.$t('assets.marketplace.view'),
          type: AssetsTypeEnum.VIEW,
          select: false,
        },
        {
          name: this.$t('assets.marketplace.dataObject'),
          type: AssetsTypeEnum.DATA_OBJECT,
          select: false,
        },
        {
          name: this.$t('assets.generalSettings.basicStandard'),
          type: AssetsTypeEnum.DATA_STANDARD,
          select: false,
        },
        {
          name: this.$t('assets.generalSettings.standardCode'),
          type: AssetsTypeEnum.DATA_STANDARD_CODE,
          select: false,
        },
        {
          name: this.$t('assets.generalSettings.index'),
          type: AssetsTypeEnum.INDEX,
          select: false,
        },
        this.$versionFeature.dataasset_CatalogType
          ? {
              name: this.$t('assets.marketplace.report'),
              type: AssetsTypeEnum.REPORT,
              select: false,
            }
          : null,
        this.$versionFeature.dataasset_CatalogType
          ? {
              name: this.$t('assets.marketplace.file'),
              type: AssetsTypeEnum.FILE,
              select: false,
            }
          : null,
        {
          name: '自定义对象',
          type: AssetsTypeEnum.META_MODEL,
          select: false,
        },
      ].filter(i => !!i)
      this.init()
    } else {
      this.form.page = 1
      this.getList()
    }
    this.$route.meta.isBack = false
  },
  methods: {
    async init() {
      const {
        keyword = '',
        types = '',
        sort = '',
        structure = null,
        catalog = null,
      } = this.$route.query
      this.keywords = keyword
      // types.split(',') 返回['']
      const selectedTypesArr = types.split(',').filter(item => item)
      if (selectedTypesArr.length) {
        if (
          this.assetsList
            .filter(i => i.type !== 'ALL')
            .every(item => selectedTypesArr.indexOf(item.type) !== -1)
        ) {
          this.assetsList.find(item => item.type === 'ALL').select = true
        } else {
          this.assetsList.find(item => item.type === 'ALL').select = false
          this.assetsList.forEach(item => {
            if (selectedTypesArr.indexOf(item.type) !== -1) {
              item.select = true
            } else {
              this.select = false
            }
          })
        }
      } else {
        this.assetsList.find(item => item.type === 'ALL').select = true
      }

      if (sort) {
        this.orderBy = sort
      } else {
        if (this.$versionFeature.dataasset_AssetComments) {
          this.orderBy = 'score'
        } else {
          this.orderBy = 'visitCount'
        }
      }
      if (structure) {
        this.structureId = structure
        if (catalog) {
          this.catalogId = catalog
        }
      }
      if (this.$featureMap.FE_SECURITY && this.$security) {
        this.getLevelList()
      }
      await this.getDirectoryType()
      await this.getStructureList()
      await this.getTagList()
      // this.getMetaTypes()
      this.loading = false
    },
    getMetaTypes() {
      if (this.addedAssetsList) {
        return
      } else {
        this.addedAssetsList = true
      }
      // 将 元模型 相关类型 添加到 资产类型
      let assetsList = _.cloneDeep(this.assetsList)
      this.metaModelTypeList.forEach(item => {
        let type = this.metaModelTypes[item] || {}
        if (type.assetKey) {
          let obj = {
            name: type.name,
            select: false,
            type: type.assetKey,
          }
          assetsList.push(obj)
        }
      })
      this.assetsList = assetsList
    },
    handleClick() {
      this.form.page = 1
      this.getList()
    },
    judgeEllipsizeBool() {
      const screenContent = this.$refs.screenContent
      const parentBox = this.$refs.parentBox
      this.isMore = screenContent.clientHeight > parentBox.clientHeight + 8
    },
    handlerMore() {
      this.showMore = !this.showMore
      this.getResultTop()
    },
    getTagList() {
      API.getTagListApi().then(res => {
        let allList = []
        // console.log(res.data)
        res.data.map(item => {
          allList = allList.concat(item.children)
        })
        this.handleTagList(allList)
      })
    },
    handleTagList(data) {
      let newList = []
      let newMap = {}
      data.map(item => {
        if (
          this.$featureMap.FE_SECURITY &&
          this.$security &&
          item.name !== '数据安全等级'
        ) {
          newMap = {
            groupId: item.content.tagId,
            groupName: item.name,
            children: item.children.map(m => {
              return m.content
            }),
            selectList: [],
          }
          newList.push(newMap)
        } else {
          if (
            item.name !== '重要程度' &&
            item.name !== '影响程度' &&
            item.name !== '影响对象' &&
            item.name !== '影响范围' &&
            item.name !== '敏感数据' &&
            item.name !== '数据安全等级'
          ) {
            newMap = {
              groupId: item.content.tagId,
              groupName: item.name,
              children: item.children.map(m => {
                return m.content
              }),
              selectList: [],
            }
            newList.push(newMap)
          }
        }
      })
      this.groupList = newList
    },
    getResultTop() {
      this.$nextTick(() => {
        const screenBoxH = $(this.$refs.screenBox).height()
        this.resultTop = screenBoxH + 8
        // console.log(this.resultTop)
      })
    },
    setLeft() {
      this.left = ($(window).width() - 1440) / 2
    },
    async getStructureList() {
      try {
        const res = await API.getStructureList('BROWSE')
        const newMap = {
          name: this.$t('assets.marketplace.allText'),
          id: 0,
        }
        this.structureList = _.cloneDeep(res.data)
        // this.structureList.unshift(newMap)
        if (res.data && res.data.length) {
          this.getCatalogTree()
        }
        if (res.data.length == 0) {
          this.catalogList = [
            {
              name: this.$t('assets.marketplace.allText'),
              id: 0,
              select: true,
              type: 'ALL',
            },
          ]
          this.loading = false
          this.contentLoading = false
          this.searchLoading = false
        }
      } catch (error) {
        this.$showFailure(e)
      }
    },
    async getCatalogTree() {
      if (this.structureList.length >= 1) {
        let ids = this.structureId ? [this.structureId] : []
        try {
          const res = await API.getOneLevelCatalog(ids)
          this.loading = false
          this.contentLoading = false
          this.searchLoading = false
          this.headerLoading = false
          const newMap = {
            name: this.$t('assets.marketplace.allText'),
            id: 0,
            select: true,
            type: 'ALL',
          }
          res.data.data.map(item => (item.select = false))
          this.catalogList = res.data.data || []
          this.catalogList.unshift(newMap)
          if (this.catalogId) {
            this.catalogList.forEach(c => {
              if (
                c.name === this.$t('assets.marketplace.allText') &&
                c.id == 0
              ) {
                c.select = false
              }
              if (c.id == this.catalogId) {
                c.select = true
              }
            })
          }
          this.form.page = 1
          this.getList()
          this.getResultTop()
          this.$nextTick(() => {
            this.judgeEllipsizeBool()
          })
        } catch (error) {
          this.$showFailure(e)
        }
      } else {
        // 没有目录空间的情况下
      }
    },
    getLevelList() {
      getAttrList(this, API, AttrsTypeEnum.LEVEL).then(res => {
        const levelList = res
        levelList.map(m => {
          m.select = false
          this.allLevelId.push(m.tagId)
        })
        const newMap = {
          name: this.$t('assets.marketplace.allText'),
          tagId: 0,
          select: true,
          type: 'ALL',
        }
        this.levelList = levelList
        this.levelList.unshift(newMap)
      })
    },
    navClick(item, index) {
      this.loading = true
      // this.contentLoading = true
      this.searchLoading = true
      this.structureId = item.id
      this.getCatalogTree(this.structureId)
    },
    handleBtn(btn) {
      // const left = $('.structure-content .all-content .content').css('left')
      if (btn === 'next') {
        if (this.structureList.length - 5 <= this.structuredIndex) {
          return
        }
        this.structuredIndex++
      } else {
        if (this.structuredIndex <= 0) {
          return
        }
        this.structuredIndex--
      }
      $('.structure-content .all-content .content').css({
        left: -(this.structuredIndex * 176) + 'px',
      })
    },
    selectAsset(name, bool) {
      this[name].map(item => {
        if (item.type === 'ALL') {
        } else {
          item.select = bool
        }
      })
    },
    screenClick(item, type) {
      let name = ''
      switch (type) {
        case 'catalog':
          name = 'catalogList'
          break
        case 'asset':
          name = 'assetsList'
          break
        case 'level':
          name = 'levelList'
          break
        default:
          break
      }
      if (item.type === 'ALL') {
        if (item.select) {
        } else {
          item.select = true
          this.selectAsset(name, false)
        }
        // item.select = !item.select
      } else {
        item.select = !item.select
        this[name][0].select = false
        if (this.assetsList.every(i => !i.select)) {
          this.assetsList.find(item => item.type === 'ALL').select = true
        }
        if (this.catalogList.every(i => !i.select)) {
          this.catalogList.find(item => item.type === 'ALL').select = true
        }
        if (
          this.$featureMap.FE_SECURITY &&
          this.levelList.every(i => !i.select)
        ) {
          const target = this.levelList.find(item => item.type === 'ALL')
          if (target) {
            target.select = true
          }
        }
      }
      this.form.page = 1
      this.getList()
    },
    searchList() {
      this.form.page = 1
      this.getList()
    },
    getDepartmentList(data) {
      return departmentName(data)
    },
    collect(row) {
      switch (row.subAssetsType) {
        case AssetsTypeEnum.CATALOG:
          this.cataclogCollect(row)
          break
        case AssetsTypeEnum.TABLE:
        case AssetsTypeEnum.VIEW:
        case AssetsTypeEnum.DATA_OBJECT:
        case AssetsTypeEnum.REPORT:
        case AssetsTypeEnum.FILE:
        case AssetsTypeEnum.DATA_STANDARD:
        case AssetsTypeEnum.DATA_STANDARD_CODE:
        case AssetsTypeEnum.INDEX:
          this.assetsCollect(row)
          break
        default:
          break
      }
    },
    async cataclogCollect(row) {
      const params = {
        catalogId: row.catalogId,
        catalogName: row.assetsName,
      }
      const bool = await this.judgeAssetState(row, 'collect', 'class')
      if (bool) {
        API.cancelCollectCatalogAPI(params)
          .then(res => {
            this.$datablauMessage.success(
              this.$t('assets.marketplace.cancelCollectedSuccess')
            )
            this.form.page = 1
            this.getList()
          })
          .catch(e => {
            this.$showFailure(e)
          })
      } else {
        API.collectCatalogAPI(params)
          .then(res => {
            this.$datablauMessage.success(
              this.$t('assets.marketplace.collectSuccess')
            )
            this.form.page = 1
            this.getList()
          })
          .catch(e => {
            this.$showFailure(e)
          })
      }
    },
    // 根据资产类型获取资产的typeId
    getAssetsId(type) {
      let typeId
      switch (type) {
        case AssetsTypeEnum.TABLE:
          typeId = 80000004
          break
        case AssetsTypeEnum.VIEW:
          typeId = 80500008
          break
        case AssetsTypeEnum.DATA_OBJECT:
          typeId = 80000005
          break
        case AssetsTypeEnum.REPORT:
          typeId = 82800002
          break
        case AssetsTypeEnum.FILE:
          typeId = 82800008
          break
        case AssetsTypeEnum.DATA_STANDARD:
          typeId = 80010066
          break
        case AssetsTypeEnum.DATA_STANDARD_CODE:
          typeId = 80010098
          break
        case AssetsTypeEnum.INDEX:
          typeId = 82800003
          break
        default:
          break
      }
      return typeId
    },
    assetsCollect(row) {
      const bool = this.judgeValue(this.collectAssetsMap, row.assetsId)
      const typeId = this.getAssetsId(row.subAssetsType)
      if (bool) {
        // 取消收藏
        let collectId
        // console.log(row.assetsId)
        // console.log(this.collectAssetsMap)
        Object.keys(this.collectAssetsMap).map(key => {
          if (
            parseFloat(this.collectAssetsMap[key]) === parseFloat(row.assetsId)
          ) {
            collectId = key
          }
        })
        cancelAssetsCollect(this, API, collectId)
          .then(res => {
            this.$datablauMessage.success(
              this.$t('assets.marketplace.cancelCollectedSuccess')
            )
            this.form.page = 1
            this.getList()
          })
          .catch(e => {
            this.$showFailure(e)
          })
      } else {
        // 收藏
        const params = {
          objId: row.itemId,
          objectName: row.alias, // assetsName
          typeId,
        }
        assetsCollect(this, API, params)
          .then(res => {
            this.$datablauMessage.success(
              this.$t('assets.marketplace.collectSuccess')
            )
            this.form.page = 1
            this.getList()
          })
          .catch(e => {
            this.$showFailure(e)
          })
      }
    },
    // 判断资产是否有权限
    judgePower(row, type) {
      const status = this.managerMap[row.catalogId]
      let name = ''
      switch (status) {
        case 'AUTH': // 有权限
          name = this.$t('assets.marketplace.hasAuth')
          break
        case 'UN_AUTH': // 无权限
          name = this.$t('assets.marketplace.applyAuth')
          break
        case 'UNDER_REVIEW': // 申请中
          name = this.$t('assets.marketplace.applying')
          break
          break
        default:
          break
      }
      if (type === 'class') {
        return status
      } else if (type === 'name') {
        return name
      }
    },
    // 判断map中是否含有某个值
    judgeValue(obj, val) {
      try {
        for (const p in obj) {
          if (parseFloat(obj[p]) === parseFloat(val)) {
            return true
          }
        }
        return false
      } catch (e) {
        return e
      }
    },
    cartTooltip(row) {
      const nameId = 'assetsId'
      const added = this.cartList.some(m => m === row[nameId])
      const applyed = this.shoppingList.some(m => m === row[nameId])
      if (applyed) {
        return this.$t('assets.marketplace.approving')
      } else if (added) {
        return this.$t('assets.marketplace.addedCartText')
      } else {
        return this.$t('assets.marketplace.addCartText')
      }
    },
    cartName(row) {
      const nameId = 'assetsId'
      const added = this.cartList.some(m => m === row[nameId])
      const applyed = this.shoppingList.some(m => m === row[nameId])
      if (applyed) {
        return this.$t('assets.marketplace.approving')
      } else if (added) {
        return this.$t('assets.marketplace.added')
      } else {
        return this.$t('assets.marketplace.addCartText')
      }
    },
    // 判断资产是否已收藏,加入购物车
    judgeAssetState(row, state, type) {
      let name = ''
      let hasClass = false
      let nameId = ''
      let mapName = ''
      let bool = false
      switch (row.subAssetsType) {
        case AssetsTypeEnum.CATALOG:
          // 目录类型
          nameId = 'catalogId'
          mapName = 'collectCatalogMap'
          break
        default:
          // 资产类型
          nameId = 'assetsId'
          mapName = 'collectAssetsMap'
          break
      }
      if (state === 'collect') {
        bool = this.judgeValue(this[mapName], row[nameId])
        name = bool
          ? this.$t('assets.marketplace.collectedText')
          : this.$t('assets.marketplace.colectText')
      } else if (state === 'shopping') {
        const added = this.cartList.some(m => m === row[nameId])
        const applyed = this.shoppingList.some(m => m === row[nameId])
        bool = added || applyed
        if (applyed) {
          name = this.$t('assets.marketplace.hasApplyed')
        } else if (added) {
          name = this.$t('assets.marketplace.addedCartText')
        } else {
          name = this.$t('assets.marketplace.addCartText')
        }
      } else if (state === 'power') {
        bool = this.shoppingList.some(m => m === row[nameId])
        name = bool
          ? this.$t('assets.marketplace.applyAth')
          : this.$t('assets.marketplace.applying')
      }
      hasClass = bool
      if (type === 'class') {
        return hasClass
      } else if (type === 'name') {
        return name
      }
    },
    async addShoppingCart(row) {
      const bool = await this.judgeAssetState(row, 'shopping', 'class')
      if (bool) {
        return
      }
      const params = {
        assetId: row.assetsId,
        objectId: row.itemId,
        catalogId: row.catalogId,
        modelId: row.modelId,
        remarks: '',
        assetType: row.subAssetsType,
      }
      API.addShoppingCartApi(params)
        .then(res => {
          this.$datablauMessage.success(
            this.$t('assets.marketplace.addCartSuccess')
          )
          this.getList()
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    async applyPower(row) {
      // console.log(row)
      let catalogId
      let catalogName
      if (row.subAssetsType !== 'CATALOG') {
        catalogId = row.catalogId
        catalogName = row.catalogNamePath.split('/').slice(-1)[0]
      } else {
        catalogId = row.catalogId
        catalogName = row.assetsName
      }
      const power = await this.judgePower(row, 'class')
      if (power === 'UNDER_REVIEW') {
        return
      }
      this.visible = true
      this.applyForm.catalogId = catalogId
      this.applyForm.catalogName = catalogName
    },
    getList() {
      if (this.structureList.length >= 1) {
        let assetsTypeList = []
        this.assetsList.forEach(item => {
          if (item.select) {
            if (item.type === 'ALL') {
              assetsTypeList = [
                AssetsTypeEnum.CATALOG,
                AssetsTypeEnum.TABLE,
                AssetsTypeEnum.VIEW,
                AssetsTypeEnum.DATA_OBJECT,
                AssetsTypeEnum.DATA_STANDARD,
                AssetsTypeEnum.DATA_STANDARD_CODE,
                AssetsTypeEnum.INDEX,
                AssetsTypeEnum.REPORT,
                AssetsTypeEnum.FILE,
                AssetsTypeEnum.META_MODEL,
              ]
              return
            } else {
              assetsTypeList.push(item.type)
            }
          }
        })
        let levelIds = []
        this.levelList.forEach(item => {
          if (item.select) {
            if (item.type === 'ALL') {
              levelIds = []
            } else {
              levelIds.push(item.tagId)
            }
          }
        })
        let catalogIds = []
        this.catalogList.forEach(item => {
          if (item.select) {
            if (item.type === 'ALL') {
              catalogIds = []
            } else {
              catalogIds.push(item.id)
            }
          }
        })
        let structureIds = []
        if (this.structureId) {
          structureIds = [this.structureId]
        } else {
          this.structureList.map(item => {
            if (item.id) {
              structureIds.push(item.id)
            }
          })
        }
        let tagIds = []
        this.groupList.map(item => {
          if (item.show) {
            let newList = []
            item.selectList.map(m => {
              newList.push(m.tagId)
            })
            tagIds.push(newList)
          }
        })
        levelIds.length > 0 && tagIds.push(levelIds)
        const params = {
          // udpFilters: null, // 自定义属性
          // noRight: false, //
          // catalogPath, // 目录路径
          pageNum: this.form.page,
          pageSize: this.form.size,
          structureIds,
          catalogIds, // 目录ID集合
          searchStr: this.keywords, // 搜索关键字
          assetsTypeList, // 资产类型
          tagIds: tagIds, // 标签id组合
          orderBy: this.orderBy === 'all' ? '' : this.orderBy,
          sort: 'DESC', // DESC：降序   ASC：升序
          withAlias: false, // 英文名是否参与搜索
          withDesc: true, // 描述是否参与搜索
        }
        this.loading = true
        API.getAssetsList(1, params)
          .then(res => {
            this.loading = false
            this.contentLoading = false
            const data = res.data.data
            if (data.assetsList) {
              data.assetsList.map(item => {
                switch (item.subAssetsType) {
                  case AssetsTypeEnum.CATALOG:
                    break
                  case AssetsTypeEnum.TABLE:
                    // 表
                    item.typeId = 80000004
                    break
                  case AssetsTypeEnum.VIEW:
                    item.typeId = 80500008
                    // 视图
                    break
                  case AssetsTypeEnum.DATA_OBJECT:
                    item.typeId = 80000005
                    break
                  case AssetsTypeEnum.REPORT:
                    item.typeId = 82800002
                    break
                  case AssetsTypeEnum.FILE:
                    item.typeId = 82800008
                    break
                  case AssetsTypeEnum.DATA_STANDARD:
                    item.typeId = 80010066
                    break
                  case AssetsTypeEnum.DATA_STANDARD_CODE:
                    item.typeId = 80010098
                    break
                  case AssetsTypeEnum.INDEX:
                    item.typeId = 82800003
                    break
                  default:
                    break
                }
                item.tableName =
                  item.assetsName + (item.alias ? `(${item.alias})` : '')
                if (item.subAssetsType === AssetsTypeEnum.CATALOG) {
                  item.baseInfo = {
                    name: item.assetsName,
                    id: item.catalogId,
                    assetId: item.catalogId,
                    type: item.subAssetsType,
                    collectId: `${item.catalogId}`,
                  }
                } else {
                  item.objectId = item.itemId
                  item.baseInfo = {
                    name: item.alias || item.assetsName,
                    id: item.itemId,
                    typeId: item.typeId,
                    assetId: item.assetsId,
                    catalogId: item.catalogId,
                    type: item.subAssetsType,
                    collectId: `${item.catalogId}/${item.assetsId}/${item.itemId}`,
                  }
                }
                // 处理资产安全等级及其颜色
                if (item.tagCode) {
                  const tagMap = res.data.data.tag || {}
                  item.tagColor = tagMap[item.tagCode]
                }
              })
              // 资产的权限状况
              this.managerMap = data.status || []
              this.collectCatalogMap = data.favouriteCatalogMap
              this.collectAssetsMap = data.favouriteMap
              this.cartList = data.shoppingCartSet || [] // 加购的资产
              this.shoppingList = data.applySet || [] // 申请中的资产
              this.powerList = data.catalogIdSet || [] // 申请权限的目录
              this.tableData = (data.assetsList || []).map(asset => {
                let { tagColor, tagMap, tagName } = asset
                if (!tagColor) {
                  const targetTag = (tagMap || []).find(
                    item => item.name === tagName
                  )
                  if (targetTag) {
                    const property = targetTag.property
                    if (property) {
                      tagColor = JSON.parse(property).color || ''
                    }
                  }
                }
                return {
                  ...asset,
                  tagColor: tagColor ? this.hexTorgb(tagColor) : '',
                }
              })
              this.tableData.forEach(item => {
                item.itemTypeId && this.getMetaModelIcon(item.itemTypeId)
              })
              this.total = data.total > 10000 ? 10000 : data.total
              this.getCollectList()
            } else {
              this.tableData = []
              this.total = 0
            }
          })
          .catch(e => {
            this.loading = false
            this.$showFailure(e)
          })
      }
    },
    hexTorgb(hex) {
      let rgb = ''
      hex = hex.replace('#', '')
      for (let i = 0; i < hex.length; i += 2) {
        rgb += parseInt(hex.slice(i, i + 2), 16) + (i < 4 ? ',' : '')
      }
      // console.log(rgb)
      return rgb
    },
    getCollectList() {
      API.assetsCollectListApi()
        .then(res => {
          this.favoriteList = res.data
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    handlePageChange(page) {
      this.form.page = page
      this.getList()
    },
    handleSizeChange(size) {
      this.form.size = size
      this.form.page = 1
      this.getList()
    },
    switchView(type) {
      if (type === 'list') {
        this.viewType = 'card'
      } else {
        this.viewType = 'list'
      }
    },
    sort(type) {
      this.orderBy = type
      this.form.page = 1
      this.getList()
    },
    handleTagChange(valList, id) {
      this.sortLen = 0
      this.groupList.map(m => {
        if (m.groupId === id) {
          m.selectList = valList
          if (m.selectList.length > 0) {
            m.show = true
          } else {
            m.show = false
          }
        }
        this.sortLen += m.selectList.length
      })
      this.getResultTop()
      this.form.page = 1
      this.getList()
    },
    delSortCard(id) {
      this.sortLen = 0
      this.groupList.map(m => {
        if (id === 'all') {
          m.show = false
          m.selectList = []
        } else {
          if (m.groupId === id) {
            m.show = false
            m.selectList = []
          }
          this.sortLen += m.selectList.length
        }
      })
      this.getResultTop()
      this.form.page = 1
      this.getList()
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
          result = this.$t('assets.marketplace.catalog')
          color = '#3295f8'
          rgba = '(50,149,248,0.1)'
          iconType = data.subAssetsType
          icon = data.icon
          break
        case AssetsTypeEnum.TABLE:
        case AssetsTypeEnum.VIEW:
          result = this.$t('assets.marketplace.table')
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
        case AssetsTypeEnum.META_MODEL:
          result = '自定义对象'
          iconType = data.subAssetsType
          color = '#4B5CC4'
          rgba = '(75,92,196,0.1)'
          break
        case AssetsTypeEnum.DATA_OBJECT:
          result = this.$t('assets.marketplace.dataObject')
          color = '#c44ad1'
          rgba = '(196,74,209,0.1)'
          iconType = data.isLogical ? 'logicalcolumn' : 'COLUMN'
          break
        case AssetsTypeEnum.REPORT:
          result = this.$t('assets.marketplace.report')
          color = '#008899'
          rgba = '(0,136,153,0.1)'
          iconType = 'Report'
          break
        case AssetsTypeEnum.FILE:
          result = this.$t('assets.marketplace.file')
          color = '#3397ff'
          rgba = '(51,151,255,0.1)'
          iconType = this.$fileTypeFormatter(data.fileType)
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
    getMetaModelIcon(typeId) {
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
    getDirectoryType() {
      API.getDirectoryType(0)
        .then(res => {
          let data = res.data.catalogTypes || []
          this.catalogTypeList = data
          this.metaModelTypeList = res.data.metaModelTypes || []
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    submitAssets() {
      this.$refs.applyForm.validate(valid => {
        if (valid) {
          const params = {
            catalogId: this.applyForm.catalogId,
            catalogName: this.applyForm.catalogName,
            mandateType: 'PERSON',
            reason: this.applyForm.reason,
          }
          API.applyAuthForCatalog(params)
            .then(res => {
              this.$datablauMessage.success(
                this.$t('assets.marketplace.applySuccess')
              )
              this.closeDialog()
              this.form.page = 1
              this.getList()
            })
            .catch(e => {
              this.$showFailure(e)
              this.closeDialog()
              // this.$datablauMessage.error('申请失败')
            })
        }
      })
    },
    closeDialog() {
      this.applyForm.reason = ''
      this.visible = false
    },
    clickChild() {
      this.form.page = 1
      this.getList()
    },
    async toDetail(row) {
      const auth = this.judgePower(row, 'class')
      if (auth === 'AUTH') {
        let id
        let name = ''
        let query = {}
        // console.log(row)
        // return
        switch (row.subAssetsType) {
          case AssetsTypeEnum.CATALOG:
            name = 'catalogDetails'
            id = row.catalogId
            query.structureId = row.structureId
            break
          case AssetsTypeEnum.TABLE:
            name = 'tableDetails'
            id = row.assetsId
            query.objectId = row.objectId
            query.catalogId = row.catalogId
            query.from = 'market'
            break
          case AssetsTypeEnum.META_MODEL:
            // name = 'tableDetails'
            // id = row.assetsId
            // query.objectId = row.objectId
            // query.catalogId = row.catalogId
            // query.from = 'market'

            // const url = this.BaseUtils.RouterUtils.getFullUrl('metaModelDetails', {
            //   objectId: row.itemId,
            //   catalogId: row.catalogId,
            //   id: row.assetsId,
            //   type: 'metaModel',
            //   blank: true,
            // })
            const url = this.BaseUtils.RouterUtils.getFullUrl('dataCatalog', {
              objectId: row.objectId,
              catalogId: row.catalogId,
              id: row.assetsId,
              type: 'META_MODEL',
              blank: true,
            })
            window.open(url)
            return
            break
          case AssetsTypeEnum.VIEW:
            name = 'viewDetails'
            id = row.assetsId
            query.objectId = row.objectId
            query.catalogId = row.catalogId
            query.from = 'market'
            break
          case AssetsTypeEnum.DATA_OBJECT:
            name = 'columnDetails'
            id = row.assetsId
            query.objectId = row.objectId
            query.catalogId = row.catalogId
            break
          case AssetsTypeEnum.REPORT:
            name = 'reportDetails'
            id = row.assetsId
            query.objectId = row.objectId
            query.catalogId = row.catalogId
            break
          case AssetsTypeEnum.FILE:
            name = 'fileDetails'
            id = row.assetsId
            query.objectId = row.objectId
            query.catalogId = row.catalogId
            break
          case AssetsTypeEnum.DATA_STANDARD:
            name = 'dataStandard'
            id = row.assetsId
            query.domainId = row.objectId
            query.vote = row.voteCount
            query.blank = true
            query.isAssets = true
            API.toVisitAsset({
              catalogId: row.catalogId,
              assetType: 'DATA_STANDARD',
              itemId: row.objectId,
              assetId: row.assetsId,
            })
            this.$skip2({ name: 'dataStandard', query: query })
            return
          case AssetsTypeEnum.DATA_STANDARD_CODE:
            name = 'code'
            id = row.assetsId
            // query.objectId = row.objectId
            // query.catalogId = row.catalogId
            query.code = row.objectId
            query.blank = true
            query.isAssets = true
            API.toVisitAsset({
              catalogId: row.catalogId,
              assetType: 'DATA_STANDARD_CODE',
              itemId: row.objectId,
              assetId: row.assetsId,
            })
            this.$skip2({ name: 'code', query: query })
            return
          case AssetsTypeEnum.INDEX:
            name = await this.getName(row)
            id = row.assetsId
            query.domainId = row.objectId
            query.id = row.objectId
            query.vote = row.voteCount
            query.blank = true
            query.isAssets = true
            API.toVisitAsset({
              catalogId: row.catalogId,
              assetType: 'INDEX',
              itemId: row.objectId,
              assetId: row.assetsId,
            })
            this.$skip2({ name: name, query: query })
            return
          default:
            break
        }
        query.id = id
        query.blank = false
        const href = this.$router.resolve({ name, query }).href
        window.location.href = href
        // window.open(href, '_blank')
      } else {
        this.$blauShowFailure(
          row.subAssetsType === 'CATALOG'
            ? this.$t('assets.marketplace.noCatalogAuth')
            : this.$t('assets.marketplace.noAssetsAuth')
        )
      }

      // this.$router.push({
      //   name,
      //   query,
      // })
    },
    async getName(row) {
      let metric = localStorage.getItem('allServers')
        ? JSON.parse(localStorage.getItem('allServers')).includes('METRIC')
        : false
      let name = 'index'
      if (metric) {
        await API.getDomainById({ domainId: row.objectId })
          .then(res => {
            name =
              res.data.categoryId === 5
                ? 'indexDefinitionNew'
                : 'forkIndexDefinitionNew'
          })
          .catch(e => {
            this.$showFailure(e)
          })
      }
      return name
    },
  },
}
