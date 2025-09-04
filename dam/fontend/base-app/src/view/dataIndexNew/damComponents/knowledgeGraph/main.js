/*eslint-disable*/

import Vis from 'vis'
import HTTP from '@/http/main.js'
import AddRelation from './addRelation.vue'
import LDMTypes from '@constant/LDMTypes'
import Resource from './resource.js'
import ListData from './listData.vue'
import _ from 'lodash'
import PinyinMatch from 'pinyin-match'

// 80010000:标签
// 82800002:报表
// 82800010:用户
// 82800009:元数据
// 82800017:业务规则
// 82800012:应用系统
// 82800016:技术规则
// 80010001:数据源
// 80010066:数据标准
// 80010098:标准代码
// 82800015 血缘
// 82800019 API
// 80010076 目录
// 82800020 同义词
// 82800023 维度
// 82800031 维度层级
// 82800008 文件
export default {

  components: {
    AddRelation,
    ListData
  },
  mixins: [Resource],
  props: ['summary', 'name', 'currentNode', 'permission', 'thema', 'isAssets'],
  data () {
    const hierarchy = []
    for (let i = 1; i <= 100; i++) {
      hierarchy.push({
        value: String(i),
        label: String(i) + this.$t('meta.DS.tableDetail.knowledgeGraph.tier')
      })
    }
    return {
      app: '',
      allNode: new Map(), // 全量的节点
      allEdge: new Map(), // 全量的线
      doubleClickTimeout: null,
      firstEstablish: false,
      listMode: false,
      nodesArrayInitial: [],
      maxSibling: 10,
      verified: '',
      // displayTypeImg: '/static/kgimg/nodeIcon2.svg',
      // displayTypeImg2: '/static/kgimg/coreIcon.svg',
      showContent: true,
      displayType: '1',
      searchFormData: {
        relationshipOptions: [
          // {
          //   value: '',
          //   label: this.$t('meta.DS.tableDetail.knowledgeGraph.all'),
          // },
        ],
        nodeOptions: [
          // {
          //   value: '',
          //   label: this.$t('meta.DS.tableDetail.knowledgeGraph.all'),
          // },
        ],
        hierarchy: hierarchy,
        direction: [
          {
            value: 'right',
            label: this.$t('meta.DS.tableDetail.knowledgeGraph.right')
          },
          {
            value: 'left',
            label: this.$t('meta.DS.tableDetail.knowledgeGraph.left')
          },
          {
            value: 'all',
            label: this.$t(
              'meta.DS.tableDetail.knowledgeGraph.doubleDirective'
            )
          }
        ]
      },
      hierarchyValue: '4',
      relationshipValue: [],
      directionValue: 'all',
      nodeOptionsValue: [],
      isWidth: false,
      nodes: [],
      edges: [],
      // network:null,
      container: null,
      //   节点数组
      nodesArray: [],
      nodesArrayDetail: [],
      options: {},
      data: {},
      nodeExtendArr: [], // 已扩展的节点
      nodesArr: [],
      edgesArray: [],
      basicArr: [],
      typeArr: [],
      nodeArrLoading: true,
      firstNode: {},
      currentId: '',
      level1: [],
      level2: [],
      level3: [],
      getIdNum: 0,
      getIdNum2: 0,
      getIdNum3: 0,
      edgesArrayDetail: [],
      positionMap: new Map(),
      positionMap2: new Map(),
      loadingKg: true,
      noresultState: true,
      scopeNum: null,
      lastUpdateTime: '',
      assetTypeId: [
        // 数据资产需要查资产id 的资产类型
        '80000005',
        '80000004',
        '82800002',
        '80010098',
        '82800003',
        '82800008'
      ],
      searchKeyword: '',
      searchResult: [],
      parentNode: {},
      isAssets: ''
    }
  },
  watch: {
    searchKeyword: {
      handler () {
        let keyword = _.trim(this.searchKeyword)
        if (keyword) {
          this.searchResult = this.nodesArr.filter(i => {
            return (
              _.toLower(i.label).includes(_.toLower(keyword)) ||
              PinyinMatch.match(i.label, _.toLower(keyword))
            )
          })
        } else {
          this.searchResult = []
        }
      }
    },
    maxSibling: {
      handler: function () {
        this.firstEstablish = false
        this.network = null
        this.nodesArray = []
        this.nodesArr = []
        this.edgesArray = []
        this.nodeExtendArr = []
        this.getSearchNodeRelation()
      }
    },
    hierarchyValue: {
      deep: true,
      handler: function (newVal, oldVal) {
        if (oldVal !== newVal) {
          this.firstEstablish = false
          this.network = null
          this.nodesArray = []
          this.nodesArr = []
          this.edgesArray = []
          this.nodeExtendArr = []
          this.getSearchNodeRelation()
        }
      }
    },
    // 关系类型
    relationshipValue: {
      deep: true,
      handler: function (newVal, oldVal) {
        if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
          this.firstEstablish = false
          this.network = null
          // this.hierarchyValue = '4'
          this.nodesArr = []
          this.edgesArray = []
          this.getNodeArr()
        }
      }
    },
    // 节点类型
    nodeOptionsValue: {
      deep: true,
      handler: function (newVal, oldVal) {
        if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
          this.firstEstablish = false
          this.network = null
          // this.handleLegendClick(newVal)
          // this.hierarchyValue = '4'
          this.nodesArr = []
          this.edgesArray = []
          this.getNodeArr()
        }
      }
    },
    directionValue: {
      deep: true,
      handler: function (newVal, oldVal) {
        if (oldVal !== newVal) {
          this.firstEstablish = false
          this.network = null
          // this.hierarchyValue = '1'
          this.searchFormData.relationshipOptions = []
          this.searchFormData.nodeOptions = []
          this.nodeOptionsValue = []
          this.relationshipValue = []
          this.nodesArr = []
          this.edgesArray = []
          this.getSearchNodeRelation()
          // this.getSearchNodeRelation()
        }
      },
      immediate: true
    },
    nodesArr: {
      deep: true,
      handler: function (newVal, oldVal) {}
    },
    displayType: {
      deep: true,
      handler: function (newVal, oldVal) {
        if (newVal === '1' || newVal === '2') {
          this.listMode = false
          if (oldVal !== 'table') {
            this.firstEstablish = false
            this.network = null
            this.getNodeArr()
          }
        } else if (newVal === 'table') {
          this.listMode = true
        }
      }
    }
  },
  mounted () {
    this.getSearchNodeRelation()
    const self = this
    if (this.$route.query.isAssets || this.name === 'assets') {
      this.isAssets = this.$route.query.isAssets || true
    }
    document.onclick = function (e) {
      var e = e || event
      var o = e.target || e.srcElement
      if (o.tagName === 'CANVAS') {
        self.$refs.hierarchySelect?.blur()
        self.$refs.nodeOptionsSelect?.blur()
        self.$refs.relationshipSelect?.blur()
      }
    }
  },
  methods: {
    isDamAsset (nodesArrayDetail) {
      return ![
        LDMTypes.DataDimension,
        LDMTypes.DataDimensionValue,
        LDMTypes.ModifierType,
        LDMTypes.TimeModifierType,
        LDMTypes.Modifier,
        LDMTypes.TimeModifier
      ].includes(Number.parseInt(nodesArrayDetail.typeId))
    },
    handleRowClick (row) {
      const options = {
        scale: 1,
        offset: { x: -10, y: 0 },
        animation: {
          duration: 500,
          easingFunction: 'easeInOutQuad'
        }
      }
      this.network.focus(row.id, options)
    },
    callSearchPane () {
      jQuery('#detail-box').fadeOut()
      jQuery('#detail-box2').fadeOut()
      jQuery('#detail-box3').fadeIn()
    },
    removeSubNodes (element, includeSelf) {
      this.edges.forEach(edge => {
        if (edge.from === element.id) {
          this.nodes.remove(edge.to)
        }
      })
    },
    showSubNodes (element) {
      let nodes = []
      let edges = []
      // 找到所有已这个节点为起点的边
      this.allEdge.forEach((edge, key, map) => {
        // 找到对应边的目标节点
        if (edge.from === element.id) {
          let target = this.allNode.get(edge.to)
          // 将边与目标节点添加到节点数组中
          nodes.push(target)
          // edges.push(edge) // 原本的 edge 没有移除, 不需要新增
        }
      })
      this.addNetworkParams({
        nodes: nodes,
        edges: edges
      })

    },
    removeSelf (element) {
      this.nodes.remove(element.id)
    },
    nodeOptionsValueChange () {
      this.relationshipValue = []
    },
    relationshipValueChange () {
      this.nodeOptionsValue = []
    },
    displayTypeChange (value) {
      // if (this.displayType === '1') {
      //   this.displayTypeImg = '/static/kgimg/nodeIcon2.svg'
      //   this.displayTypeImg2 = '/static/kgimg/coreIcon.svg'
      // } else if (this.displayType === '2') {
      //   this.displayTypeImg = '/static/kgimg/nodeIcon.svg'
      //   this.displayTypeImg2 = '/static/kgimg/coreIcon2.svg'
      // }
    },
    getAssetId (detail, callback) {
      HTTP.getAssetId({
        itemId: detail.Id,
        assetsType: detail.typeId,
        getAssetId: this.currentNode.id
      })
        .then(res => {
          /* HTTP.judgeAuth(res.data.data || '')
            .then(res => {
              if (res.data.data) {
                callback(res.data.data)
              } else {
                callback('')
              }
            })
            .catch(err => {
              // this.$showFailure(err)
              callback('')
            }) */
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    // 获取父级目录节点
    getParentNode (node) {
      const edgesData = this.edges._data
      const edgeKeys = Object.keys(edgesData)
      const targetEdgeKey = edgeKeys.find(key => {
        const edgeItem = edgesData[key]
        if (edgeItem.to === node.businessId) {
          return true
        } else {
          return false
        }
      })
      const parentNodeId = edgesData[targetEdgeKey].from
      // console.log(parentNodeId)
      const parentNode = this.nodes._data[parentNodeId]
      // if (parentNode.type === '80010076' || parentNode.type === '60010076') {
      //   this.parentNode = parentNode.detail
      // } else {
      //   this.getParentNode(parentNode.detail)
      // }
      this.parentNode = parentNode.detail
    },

    // 数据集权限
    hasDataSetAuth () {
      if (this.$auth.METADATA_VIEW) {
        return true
      } else {
        return false
      }
    },
    // 报表权限
    hasReportAuth () {
      if (this.$auth.METADATA_REPORT_VIEW) {
        return true
      } else {
        return false
      }
    },
    // 文件权限
    hasFileAuth () {
      if (this.$auth.METADATA_FILE_VIEW) {
        return true
      } else {
        return false
      }
    },
    // 指标权限
    hasIndexAuth () {
      if (this.$auth.DATA_STANDARD_DIM_VIEW) {
        return true
      } else {
        return false
      }
    },
    // 基础标准权限
    hasStandardAuth () {
      if (this.$auth.DATA_STANDARD_VIEW) {
        return true
      } else {
        return false
      }
    },
    // 标准代码权限
    hasCodeAuth (e) {
      if (this.$auth.STANDARD_CODE_VIEW) {
        return true
      } else {
        return false
      }
    },
    // 服务权限
    hasServiceAuth () {
      if (this.$auth.API_DEVELOP_ADMIN) {
        return true
      } else {
        return false
      }
    },
    judgeModuleAuth (typeId) {
      switch (typeId) {
        case '80000004':
        case '80000005':
        case '80500008':
          return this.hasDataSetAuth()
        case '82800002':
          return this.hasReportAuth()
        case '80010098':
          return this.hasStandardAuth()
        case '82800003':
          return this.hasIndexAuth()
        case '82800008':
          return this.hasFileAuth()
      }
    },
    // 详情跳转
    async goDetail (detail) {
      let queryData = ''
      if (this.isAssets) {
        queryData = `&isAssets=${this.isAssets}`
      }
      var pos = location.href.indexOf('#/')
      var baseUrl = location.href.slice(0, pos + 2)

      // 标签
      if (detail.typeId === '80010000') {
        // window.open(
        //   this.BaseUtils.RouterUtils.getFullUrl('tagManage', {
        //     tagId: detail.Id
        //   })
        // )
        window.open(baseUrl + `main/dataStandard/tagManage?tagId=${detail.Id}`)
      } else if (
        [
          LDMTypes.Entity,
          LDMTypes.Attribute,
          LDMTypes.View,
          LDMTypes.StoredProcedure,
          LDMTypes.Function,
          LDMTypes.Package
        ].includes(parseInt(detail.typeId))
      ) {
        // 元数据
        // window.open(
        //   this.BaseUtils.RouterUtils.getFullUrl('dataCatalog', {
        //     objectId: detail.Id,
        //     blank: 'true',
        //     isAssets: this.isAssets
        //   })
        // )
        window.open(baseUrl + `main/meta?objectId=${detail.Id}&blank=true`)
      } else if (detail.typeId === '82800002') {
        // 报表
        window.open(
          // this.BaseUtils.RouterUtils.getFullUrl('reportFormManage', {
          //   objectId: detail.Id,
          //   blank: true,
          //   isAssets: this.isAssets
          // })
          baseUrl + `main/reportFormManage?objectId=${detail.Id}&blank=true`
        )
      } else if (detail.typeId === '82800010') {
        // 用户
        // window.open(
        //   this.BaseUtils.RouterUtils.getFullUrl('user', {
        //     username: detail.Name
        //   })
        // )
        window.open(baseUrl + `main/user?username=${detail.Name}`)
      } else if (detail.typeId === '82800017') {
        // 业务规则
        // window.open(
        //   this.BaseUtils.RouterUtils.getFullUrl('dataQualityRules', {
        //     id: detail.Id
        //   })
        // )
        window.open(baseUrl + `main/dataQuality/rules?id=${detail.Id}`)
      } else if (detail.typeId === '82800012') {
        // 应用系统
        // window.open(
        //   this.BaseUtils.RouterUtils.getFullUrl('modelCategory', {
        //     id: detail.Id
        //   })
        // )
        window.open(baseUrl + `main/modelCategory?id=${detail.Id}`)
      } else if (detail.typeId === '80010098') {
        // 标准代码
        // window.open(
        //   this.BaseUtils.RouterUtils.getFullUrl('code', {
        //     code: detail.Id,
        //     blank: true,
        //     isAssets: this.isAssets
        //   })
        // )
        window.open(
          baseUrl +
            `main/dataStandard/code?code=${detail.Id}&blank=true&isAssets=true`
        )
      } else if (detail.typeId === '80010001') {
        // 数据源
        // window.open(
        //   this.BaseUtils.RouterUtils.getFullUrl('dataCatalog', {
        //     modelId: detail.Id
        //   })
        // )
        window.open(baseUrl + `main/databaseManagement?databaseId=${detail.Id}`)
      } else if (detail.typeId === '80010066') {
        // 数据标准
        this.$skip2Domain(detail.Id, this.isAssets)
        // window.open(baseUrl + `main/dataStandard?domain=${detail.Id}`)
      } else if (detail.typeId === '82800003') {
        // 指标
        this.$skip2Domain(detail.Id, this.isAssets)
        // window.open(baseUrl + `main/index?domain=${detail.Id}`)
      } else if (detail.typeId === '82800016') {
        // 技术规则
        // window.open(
        //   this.BaseUtils.RouterUtils.getFullUrl('qualityRule', {
        //     id: detail.Id
        //   })
        // )
        window.open(baseUrl + `main/dataQuality/qualityRule?id=${detail.Id}`)
      } else if (detail.typeId === '82800018') {
        // 机构管理
        window.open(
          this.BaseUtils.RouterUtils.getFullUrl('organizationManage', {
            id: detail.Id
          })
        )
      } else if (detail.typeId === '82800015') {
        // 血缘
        window.open(
          this.BaseUtils.RouterUtils.getFullUrl('lineageDemo', {
            id: detail.Id,
            filename: encodeURIComponent(detail.Name),
            name: encodeURIComponent(detail.description)
          })
        )
      } else if (detail.typeId === '82800019') {
        // API
        window.open(baseUrl + `main/manageApi?apiId=${detail.Id}${queryData}`)
      } else if (detail.typeId === '80010076' || detail.typeId === '60010076') {
        // 目录
        // if (this.name === 'assets') {
        if (this.$route.query.blank) {
          let noPermission = true
          const authRes = await HTTP.getDirDetails(detail.Id)
          const res = authRes.data.data
          noPermission = res.authType === 'NONE'
          if (noPermission) {
            this.$datablauMessage({
              dangerouslyUseHTMLString: true,
              message: `您对[${detail.Name}]没有访问权限`,
              type: 'warning',
              showClose: true
            })
          } else {
            window.open(
              this.BaseUtils.RouterUtils.getFullUrl('assetOverview', {
                id: detail.Id,
                type: 'catalogue',
                blank: true
              })
            )
          }
        } else {
          if (this.name === 'assets') {
            this.$bus.$emit('changeTreeNode', { id: detail.Id })
          } else {
            window.open(
              this.BaseUtils.RouterUtils.getFullUrl('assetOverview', {
                id: detail.Id,
                type: 'catalogue',
                blank: true
              })
            )
          }
        }
      } else if (detail.typeId === '82800008') {
        // 文件
        window.open(
          `${baseUrl}main/metaFolder?objectId=${detail.Id}&type=file&blank=true${queryData}`
        )
      } else if (parseInt(detail.typeId) === LDMTypes.ModifierType) {
        window.open(`${baseUrl}main/indexModifier?id=${detail.Id}`)
      } else if (parseInt(detail.typeId) === LDMTypes.TimeModifierType) {
        window.open(`${baseUrl}main/indexTimer?id=${detail.Id}`)
      } else if (detail.typeId === '82800034') {
        this.$http
          .post(`/domain/modifier/getValue?id=${detail.Id}`)
          .then(res => {
            const id = res.data.modifierTypeId
            window.open(`${baseUrl}main/indexModifier?id=${id}`)
          })
          .catch(e => {
            this.$showFailure(e)
          })
      } else if (detail.typeId === '82800035') {
        this.$http
          .post(`/domain/modifier/getValue?id=${detail.Id}`)
          .then(res => {
            const id = res.data.modifierTypeId
            window.open(`${baseUrl}main/indexTimer?id=${id}`)
          })
          .catch(e => {
            this.$showFailure(e)
          })
      } else if (detail.typeId === '60010077') {
        window.open(
          this.BaseUtils.RouterUtils.getFullUrl('accessControl', {
            id: detail.Id,
            blank: 'true'
          })
        )
      } else {
        console.log(detail)
      }
    },
    // 数据资产 获取节点路劲
    async getCatalogPath (id) {
      let obj = {}
      this.loadingKg = true
      await api
        .getDirDetails(id)
        .then(res => {
          this.loadingKg = false
          obj = res.data.data
        })
        .catch(e => {
          this.loadingKg = false
          this.$showFailure(e)
        })
      return obj
    },
    typeNameArrName (type) {
      return this.typeNameArr[type]
    },
    // 获取数据
    getSearchNodeRelation (givenId, givenType, app = 'graph') {
      const type = givenType || this.summary.properties.TypeId
      app = this.summary.properties.App || app
      this.app = app
      let id = givenId || ''
      // this.summary.properties.Id !== 'undefined'
      //   ? this.summary.properties.Id
      //   : this.$route.query.domain
      if (!id) {
        if (this.$route.query.domain) {
          id = this.$route.query.domain
        } else {
          id = this.summary.properties.Id
        }
      }
      let typeId = ''
      const AllMetadataTypes = [
        LDMTypes.Function,
        LDMTypes.StoredProcedure,
        LDMTypes.Attribute,
        LDMTypes.Entity,
        LDMTypes.View,
        LDMTypes.Package,
        LDMTypes.ModelSource
      ]
      if (AllMetadataTypes.includes(parseInt(type))) {
        typeId = LDMTypes.MetadataObject
      } else {
        typeId = type
      }
      let getData = null
      if (app === 'graph') {
        getData = this.$http
          .post(
            this.$graph_url +
            '/graph/searchNodeRelation?type=' +
            typeId +
            '&id=' +
            id +
            '&layers=' +
            this.hierarchyValue +
            '&scope=' +
            this.directionValue
          )
      } else {
        let url = `${this.$archyUrl}graph/relation?type=${typeId}&id=${id}&layers=${this.hierarchyValue}&scope=${this.directionValue}`
        getData = this.$http.post(url)
      }
      getData
        .then(res => {
          // res.data
          this.changNameAlias(res.data.data)
          this.nodesArrayInitial = res.data.data;
          this.nodesArray = this.siblingFilter(res.data.data)
          this.lastUpdateTime = res.data.lastUpdateTime
          if (res.data.data.length === 0) {
            // $("#kg").attr("style","display:none;");
            this.noresultState = false
          } else {
            this.noresultState = true
          }
          this.loadingKg = true
          this.getNodeArr()
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    changNameAlias (arr) {
      if (this.app !== 'archy') {
        return
      }
      // 表和字段默认显示中文名称, 将中英文名称对调
      arr.forEach(item => {
        let changeName = (obj) => {
          if (obj.Type === 'Attribute' || obj.Type === 'Entity') {
            let name = obj.Name
            obj.Name = obj.alias || name
            obj.alias = name
          }
        }
        changeName(item.startNode)
        changeName(item.endNode)
      })
    },
    re () {
      this.showContent = !this.showContent
    },
    getId () {
      this.getId = function () {
        return this.getIdNum++
      }
      return this.getIdNum++
    },
    siblingFilter (rawList) {
      let list
      {
        if (this.relationshipValue.length > 0) {
          list = rawList.filter(i => {
            return this.relationshipValue.includes(i.relation.relationName)
          })
        } else {
          list = rawList;
        }
      }

      const max= this.maxSibling

      if (max && list.length > 0) {
        const ResultList = []
        const LevelCountMap = new Map()
        const LevelDisplayMap = new Map()
        const RightRelation = list.filter(i => i.startNode.scope === 'right')
        if (RightRelation.length > 0) {
          RightRelation.sort((a, b) => {
            return a.startNode.level - b.startNode.level
          })
          LevelDisplayMap.set(0, RightRelation[0].startNode.businessId)
          RightRelation.forEach(item => {
            const currentLevel = item.startNode.level
            const endLevel = item.endNode.level
            if (!LevelCountMap.get(currentLevel)) {
              LevelCountMap.set(currentLevel, 0)
            }
            if (
              LevelCountMap.get(currentLevel) < max &&
              LevelDisplayMap.get(currentLevel) && LevelDisplayMap.get(currentLevel).includes(
                item.startNode.businessId
              )
            ) {
              if (!LevelDisplayMap.get(endLevel)) {
                LevelDisplayMap.set(endLevel, [])
              }
              LevelCountMap.set(
                currentLevel,
                LevelCountMap.get(currentLevel) + 1
              )
              LevelDisplayMap.get(endLevel).push(item.endNode.businessId)
              ResultList.push(item)
            } else {
              // 超数量的节点不再展示,被过滤掉
            }
          })
        }

        const LeftRelation = list.filter(i => i.startNode.scope === 'left')
        if (LeftRelation.length > 0) {
          LeftRelation.sort((a, b) => {
            return a.endNode.level - b.endNode.level
          })
          LevelCountMap.set(0, 0) // 重新初始化LevelCountMap，避免受右侧的影响
          LevelDisplayMap.set(0, LeftRelation[0].endNode.businessId)
          LeftRelation.forEach(item => {
            const currentLevel = -item.endNode.level
            const startLevel = -item.startNode.level
            if (!LevelCountMap.get(currentLevel)) {
              LevelCountMap.set(currentLevel, 0)
            }
            if (
              LevelCountMap.get(currentLevel) < max &&
              LevelDisplayMap.get(currentLevel)?.includes(
                item.endNode.businessId
              )
            ) {
              if (!LevelDisplayMap.get(startLevel)) {
                LevelDisplayMap.set(startLevel, [])
              }
              LevelCountMap.set(
                currentLevel,
                LevelCountMap.get(currentLevel) + 1
              )
              LevelDisplayMap.get(startLevel).push(item.startNode.businessId)
              ResultList.push(item)
            } else {
              // 超数量的节点不再展示,被过滤掉
            }
          })
        }
        return ResultList
      } else {
        return list
      }
    },
    getNodeArr () {
      this.nodesArray = this.siblingFilter(_.cloneDeep(this.nodesArrayInitial));
      this.getIdNum = 0
      this.typeArr = []
      this.nodesArr = []
      const nodesArrSet = new Set();
      var DIR = 'static/kgimg/'
      if (this.relationshipValue.length > 0) {
        this.nodesArray.forEach(element => {
          if (this.relationshipValue.includes(element.relation.relationName)) {
            if (this.app === 'archy'){
              let typeImgidstart = ''
              let typeImgidend = ''
              if (element.startNode.typeId === '80010001') {
                typeImgidstart = '80010001-1'
              } else if (element.startNode.typeId === '80010076') {
                typeImgidstart = '80010076-1'
              } else {
                typeImgidstart = element.startNode.typeId
              }
              if (element.endNode.typeId === '80010001') {
                typeImgidend = '80010001-1'
              } else if (element.endNode.typeId === '80010076') {
                typeImgidend = '80010076-1'
              } else {
                typeImgidend = element.endNode.typeId
              }
              this.nodesArr.push({
                detail: element.startNode,
                id: element.startNode.businessId,
                label: element.startNode.Name,
                type: element.startNode.typeId,
                level: element.startNode.level,
                color: this.colorArr[element.startNode.typeId],
                shape: 'image',
                image: DIR + typeImgidstart + '.svg',
                imagePadding: { left: 2, top: 10, right: 8, bottom: 20 },
                size: 24,
                scope: element.startNode.scope
              })
              this.nodesArr.push({
                detail: element.endNode,
                id: element.endNode.businessId,
                label: element.endNode.Name,
                type: element.endNode.typeId,
                level: element.endNode.level,
                color: this.colorArr[element.endNode.typeId],
                shape: 'image',
                image: DIR + typeImgidend + '.svg',
                imagePadding: { left: 2, top: 10, right: 8, bottom: 20 },
                size: 24,
                scope: element.startNode.scope
              })
            } else {
              if (nodesArrSet.has(element.startNode.businessId)) {

              } else {
                this.nodesArr.push({
                  detail: element.startNode,
                  id: element.startNode.businessId,
                  label: element.startNode.Name,
                  type: element.startNode.typeId,
                  level: element.startNode.level,
                  color: this.colorArr[element.startNode.typeId],
                  shape: 'image',
                  image: DIR + element.startNode.typeId + '.svg',
                  imagePadding: { left: 2, top: 10, right: 8, bottom: 20 },
                  size: 24,
                  scope: element.startNode.scope
                })
              }
              nodesArrSet.add(element.startNode.businessId);
              if (nodesArrSet.has(element.endNode.businessId)) {

              } else {
                this.nodesArr.push({
                  detail: element.endNode,
                  id: element.endNode.businessId,
                  label: element.endNode.Name,
                  type: element.endNode.typeId,
                  level: element.endNode.level,
                  color: this.colorArr[element.endNode.typeId],
                  shape: 'image',
                  image: DIR + element.endNode.typeId + '.svg',
                  imagePadding: { left: 2, top: 10, right: 8, bottom: 20 },
                  size: 24,
                  scope: element.startNode.scope
                })
              }
              nodesArrSet.add(element.endNode.businessId);
            }

            this.edgesArray.push({
              from: element.relation.startbusinessId,
              to: element.relation.endbusinessId,
              label: element.relation.relationName,
              id: element.relation.businessId,
              detail: element.relation,
              color: {
                color: this.edgesColorArr(element.relation.relationName),
                highlight: this.edgesColorArr(element.relation.relationName),
                hover: this.edgesColorArr(element.relation.relationName)
              }
            })
          }
        })
      } else {
        this.searchFormData.relationshipOptions = [
          // {
          //   value: '',
          //   label: this.$t('meta.DS.tableDetail.knowledgeGraph.all'),
          // },
        ]
        this.searchFormData.nodeOptions = [
          // {
          //   value: '',
          //   label: this.$t('meta.DS.tableDetail.knowledgeGraph.all'),
          // },
        ]
        this.nodesArray.forEach(element => {
          // element.upLevelId = element.startNode.businessId
          if (this.nodeExtendArr.length !== 0 && element.level) {
            if (this.app === 'archy'){
              let typeImgidstart = ''
              let typeImgidend = ''
              if (element.startNode.typeId === '80010001') {
                typeImgidstart = '80010001-1'
              } else if (element.startNode.typeId === '80010076') {
                typeImgidstart = '80010076-1'
              } else {
                typeImgidstart = element.startNode.typeId
              }
              if (element.endNode.typeId === '80010001') {
                typeImgidend = '80010001-1'
              } else if (element.endNode.typeId === '80010076') {
                typeImgidend = '80010076-1'
              } else {
                typeImgidend = element.endNode.typeId
              }
              this.nodesArr.push({
                detail: element.startNode,
                id: element.startNode.businessId,
                label: element.startNode.Name,
                type: element.startNode.typeId,
                level: element.level,
                x: element.x,
                y: element.y,
                color: this.colorArr[element.startNode.typeId],
                shape: 'image',
                image: DIR + typeImgidstart + '.svg',
                imagePadding: { left: 2, top: 10, right: 8, bottom: 20 },
                size: 24,
                scope: element.startNode.scope
              })
              this.nodesArr.push({
                detail: element.endNode,
                id: element.endNode.businessId,
                label: element.endNode.Name,
                type: element.endNode.typeId,
                level: element.level,
                x: element.x,
                y: element.y,
                color: this.colorArr[element.endNode.typeId],
                shape: 'image',
                image: DIR + typeImgidend + '.svg',
                imagePadding: { left: 2, top: 10, right: 8, bottom: 20 },
                size: 24,
                scope: element.startNode.scope
              })
            } else {
              this.nodesArr.push({
                detail: element.startNode,
                id: element.startNode.businessId,
                label: element.startNode.Name,
                type: element.startNode.typeId,
                level: element.level,
                x: element.x,
                y: element.y,
                color: this.colorArr[element.startNode.typeId],
                shape: 'image',
                image: DIR + element.startNode.typeId + '.svg',
                imagePadding: { left: 2, top: 10, right: 8, bottom: 20 },
                size: 24,
                scope: element.startNode.scope
              })
              this.nodesArr.push({
                detail: element.endNode,
                id: element.endNode.businessId,
                label: element.endNode.Name,
                type: element.endNode.typeId,
                level: element.level,
                x: element.x,
                y: element.y,
                color: this.colorArr[element.endNode.typeId],
                shape: 'image',
                image: DIR + element.endNode.typeId + '.svg',
                imagePadding: { left: 2, top: 10, right: 8, bottom: 20 },
                size: 24,
                scope: element.startNode.scope
              })
            }
          } else {
            if (this.app === 'archy'){
              let typeImgidstart = ''
              let typeImgidend = ''
                if (element.startNode.typeId === '80010001') {
                  typeImgidstart = '80010001-1'
                } else if (element.startNode.typeId === '80010076') {
                  typeImgidstart = '80010076-1'
                } else {
                  typeImgidstart = element.startNode.typeId
                }
                if (element.endNode.typeId === '80010001') {
                  typeImgidend = '80010001-1'
                } else if (element.endNode.typeId === '80010076') {
                  typeImgidend = '80010076-1'
                } else {
                  typeImgidend = element.endNode.typeId
                }

              this.nodesArr.push({
                detail: element.startNode,
                id: element.startNode.businessId,
                label: element.startNode.Name,
                type: element.startNode.typeId,
                level: element.startNode.level,
                // upLevelId:element.startNode.businessId,
                // color: { background: this.colorArr[element.startNode.typeId]},
                color: this.colorArr[element.startNode.typeId],
                shape: 'image',
                image: DIR + typeImgidstart + '.svg',
                imagePadding: { left: 2, top: 10, right: 8, bottom: 20 },
                size: 24,
                scope: element.startNode.scope
              })
              this.nodesArr.push({
                detail: element.endNode,
                id: element.endNode.businessId,
                label: element.endNode.Name,
                type: element.endNode.typeId,
                level: element.endNode.level,
                // upLevelId:element.startNode.businessId,
                // color: { background: this.colorArr[element.endNode.typeId]},
                color: this.colorArr[element.endNode.typeId],
                shape: 'image',
                image: DIR + typeImgidend + '.svg',
                imagePadding: { left: 2, top: 10, right: 8, bottom: 20 },
                size: 24,
                scope: element.startNode.scope
              })
            } else {
              this.nodesArr.push({
                detail: element.startNode,
                id: element.startNode.businessId,
                label: element.startNode.Name,
                type: element.startNode.typeId,
                level: element.startNode.level,
                // upLevelId:element.startNode.businessId,
                // color: { background: this.colorArr[element.startNode.typeId]},
                color: this.colorArr[element.startNode.typeId],
                shape: 'image',
                image: DIR + element.startNode.typeId + '.svg',
                imagePadding: { left: 2, top: 10, right: 8, bottom: 20 },
                size: 24,
                scope: element.startNode.scope
              })
              this.nodesArr.push({
                detail: element.endNode,
                id: element.endNode.businessId,
                label: element.endNode.Name,
                type: element.endNode.typeId,
                level: element.endNode.level,
                // upLevelId:element.startNode.businessId,
                // color: { background: this.colorArr[element.endNode.typeId]},
                color: this.colorArr[element.endNode.typeId],
                shape: 'image',
                image: DIR + element.endNode.typeId + '.svg',
                imagePadding: { left: 2, top: 10, right: 8, bottom: 20 },
                size: 24,
                scope: element.startNode.scope
              })
            }
          }
          this.edgesArray.push({
            from: element.relation.startbusinessId,
            to: element.relation.endbusinessId,
            label: element.relation.relationName,
            id: element.relation.businessId,
            detail: element.relation,
            color: {
              color: this.edgesColorArr(element.relation.relationName),
              highlight: this.edgesColorArr(element.relation.relationName),
              hover: this.edgesColorArr(element.relation.relationName)
            }
          })
          const type = this.summary.properties.TypeId
          let typeId = ''
          const AllMetadataTypes = [
            LDMTypes.Function,
            LDMTypes.StoredProcedure,
            LDMTypes.Attribute,
            LDMTypes.Entity,
            LDMTypes.View,
            LDMTypes.Package,
            LDMTypes.ModelSource
          ]
          if (AllMetadataTypes.includes(parseInt(type))) {
            typeId = LDMTypes.MetadataObject
          } else {
            typeId = type
          }
          this.searchFormData.relationshipOptions.push({
            value: element.relation.relationName,
            label: element.relation.relationName
          })
          if (element.startNode.level === 1 || element.startNode.level === 0) {
            this.searchFormData.nodeOptions.push({
              value: element.startNode.typeId,
              label: this.typeNameArr[element.startNode.typeId]
            })
          }
          if (element.endNode.level === 1 || element.endNode.level === 0) {
            this.searchFormData.nodeOptions.push({
              value: element.endNode.typeId,
              label: this.typeNameArr[element.endNode.typeId]
            })
          }
        })
      }
      // 关系类型过滤
      const relationshipOptionsObj = {}
      const relationshipOptionsPeon =
        this.searchFormData.relationshipOptions.reduce((cur, next) => {
          relationshipOptionsObj[next.value] ? '' : (relationshipOptionsObj[next.value] = true && cur.push(next))
          return cur
        }, []) // 设置cur默认类型为数组，并且初始值为空的数组
      this.searchFormData.relationshipOptions = relationshipOptionsPeon

      // 节点类型过滤
      const rnodeOptionsObj = {}
      const nodeOptionsPeon = this.searchFormData.nodeOptions.reduce(
        (cur, next) => {
          rnodeOptionsObj[next.value]
            ? ''
            : (rnodeOptionsObj[next.value] = true && cur.push(next))
          return cur
        },
        []
      ) // 设置cur默认类型为数组，并且初始值为空的数组
      this.searchFormData.nodeOptions = nodeOptionsPeon
      // 节点
      this.nodesArr.forEach((element, index) => {
        this.typeArr.push(element.detail.typeId)
        if (element.label.length > 20) {
          element.label = element.label.substring(0, 20) + '...'
        }
        if (element.detail.Id === this.summary.properties.Id) {
          this.firstNode = element
          // element.physics = true
        }
      })
      if (this.nodeOptionsValue.length > 0) {
        this.nodesArr = this.nodesArr.filter(item =>
          this.nodeOptionsValue.includes(item.type)
        )
        // this.nodesArr.push(this.firstNode)
      }
      const edgesObj = {}
      const edgesPeon = this.edgesArray.reduce((cur, next) => {
        edgesObj[next.id] ? '' : (edgesObj[next.id] = true && cur.push(next))
        return cur
      }, []) // 设置cur默认类型为数组，并且初始值为空的数组
      this.edgesArray = edgesPeon

      const obj = {}
      const peon = this.nodesArr.reduce((cur, next) => {
        obj[next.id] ? '' : (obj[next.id] = true && cur.push(next))
        return cur
      }, []) // 设置cur默认类型为数组，并且初始值为空的数组
      // peon.sort(this.compare("type"))
      this.nodesArr = peon
      this.getNodeArrState()
      // 当等级大于2时去查询他上一级坐标然后给出当前坐标
      // 节点详情
      const obj2 = {}
      const peon2 = this.typeArr.reduce((cur, next) => {
        obj2[next] ? '' : (obj2[next] = true && cur.push(next))
        return cur
      }, []) // 设置cur默认类型为数组，并且初始值为空的数组
      this.typeArr = peon2
      this.$nextTick(() => {
        this.getStart()
      })
    },
    // 整理各级坐标
    getNodeArrState () {
      const levelNew = []
      const nodesAddNumIn = []
      this.nodesArr.forEach((item, it) => {
        if (levelNew.findIndex(it => it === item.level) === -1) {
          levelNew.push(item.level)
        }
      })
      let levelNewObj = []
      levelNew.forEach(ele => {
        const objLevelNew = {
          key: '',
          data: []
        }
        this.nodesArr.forEach(element => {
          if (ele === element.level) {
            objLevelNew.key = ele
            objLevelNew.data.push(element)
          }
        })
        objLevelNew.data = objLevelNew.data.sort(function (a, b) {
          return a.type - b.type
        })
        levelNewObj.push(objLevelNew)
      })
      if (this.directionValue !== 'right') {
        levelNewObj = levelNewObj.sort(this.compare('key'))
      }
      for (let i = 0; i < levelNewObj.length; i++) {
        // levelNewObj[i]
        this.getIdNum = 0
        this.getIdNum2 = 0
        this.getIdNum3 = 0
        // if (levelNewObj[i].key !== 0) {
        this.scopeNum = levelNewObj[i].data.map(item => {
          return item.scope
        })
        this.getRepeatNum(this.scopeNum)
        // }
        levelNewObj[i].data.forEach(element => {
          this.edgesArray.forEach(ele => {
            if (element.scope === 'right' && ele.to === element.id) {
              element.upLevelId = ele.from
              element.lenghtArr = this.getRepeatNum(this.scopeNum).right
            } else if (
              element.scope === 'left' &&
              ele.from === element.id &&
              element.level !== 0
            ) {
              element.upLevelId = ele.to
              element.lenghtArr = this.getRepeatNum(this.scopeNum).left
            }
          })
          // element.lenghtArr = levelNewObji].data.length
          element.numIndex = this.getId()
          if (element.level === 0) {
            element.upOneIndex = 0
            this.positionMap2.set(element.id, { upOneIndex: element.numIndex })
          } else {
            element.upOneIndex = this.getupOneIndexId(element)
            this.positionMap2.set(element.id, { upOneIndex: element.numIndex })
          }
        })
        const levelArr = levelNewObj[i].data
          .sort(function (a, b) {
            return a.upOneIndex - b.upOneIndex
          })
          .sort(function (a, b) {
            return a.type - b.type
          })
        levelArr.forEach(element => {
          if (element.scope === 'right') {
            element.numIndex2 = this.getIdNum2++
          } else {
            element.numIndex2 = this.getIdNum3++
          }
          if (element.level !== 0) {
            element.x = this.calculatePosition(element).x
            element.y = this.calculatePosition(element).y
            this.positionMap.set(element.id, { x: element.x, y: element.y })
          } else {
            if (this.displayType === '1') {
              element.fixed = true
            } else {
              element.fixed = false
            }
            element.x = 0
            element.y = 0
            this.positionMap.set(element.id, { x: element.x, y: element.y })
          }
          nodesAddNumIn.push(element)
        })
      }
      this.nodesArr = nodesAddNumIn
    },
    getRepeatNum (arr) {
      if (arr) {
        return arr.reduce(function (prev, next) {
          prev[next] = prev[next] + 1 || 1
          return prev
        }, {})
      }
    },
    // 计算上级顺序
    getupOneIndexId (item) {
      if (this.positionMap2.get(item.upLevelId)) {
        const oneIndexMap = this.positionMap2.get(item.upLevelId)
        return oneIndexMap.upOneIndex
      } else {
        return 0
      }
    },
    // 计算节点坐标
    calculatePosition (item) {
      if (item.scope === 'right') {
        // debugger
        const yN = (-(item.lenghtArr - 1) * 100) / 2
        // let yN = -(item.lenghtArr*100)/2
        const newXY = this.positionMap.get(item.upLevelId)
        const yNum = yN + item.numIndex2 * 100
        let elemX
        if (newXY) {
          elemX = 300 * item.level
        } else {
          elemX = 300
        }
        const elemY = yNum
        return { x: elemX, y: elemY }
      } else {
        // debugger
        const yN = (-(item.lenghtArr - 1) * 100) / 2
        // let yN = -(item.lenghtArr*100)/2
        const newXY = this.positionMap.get(item.upLevelId)
        const yNum = yN + item.numIndex2 * 100
        let elemX
        if (newXY) {
          elemX = -300 * item.level
        } else {
          elemX = -300
        }
        const elemY = yNum
        return { x: elemX, y: elemY }
      }
    },
    compare (prop) {
      return function (obj1, obj2) {
        var val1 = obj1[prop]
        var val2 = obj2[prop]
        if (!isNaN(Number(val1)) && !isNaN(Number(val2))) {
          val1 = Number(val1)
          val2 = Number(val2)
        }
        if (val1 < val2) {
          return -1
        } else if (val1 > val2) {
          return 1
        } else {
          return 0
        }
      }
    },
    getStart () {
      // 初始化
      this.init()
      if (true || !this.firstEstablish) {
        this.network.moveTo({ scale: 0.8 })
        var param = { nodes: this.nodesArr, edges: this.edgesArray }
        // 创建network
        this.addNetworkParams(param)
        // 鼠标点击事件节点
        this.network.on('click', params => {
          // 使 input 失去焦点，并隐藏下拉框
          this.$refs.relationshipSelect?.DATA.blur()
          this.$refs.hierarchySelect?.DATA.blur()
          this.$refs.nodeOptionsSelect?.DATA.blur()
          this.$refs.directionSelect?.DATA.blur()

          clearTimeout(this.doubleClickTimeout)
          this.doubleClickTimeout = setTimeout(() => {
            this.$bus.$emit('removeContextMenu')
            if (this.app === 'archy') {
              params.nodes.length = 0
              params.edges.length = 0
            }
            if (params.nodes.length === 0 && params.edges.length === 0) {
              // when click vacant part.
              // self.removeDetail();
              jQuery('#detail-box').fadeOut()
              jQuery('#detail-box2').fadeOut()
              jQuery('#detail-box3').fadeOut()
            } else if (params.nodes.length === 1) {
              // when click one node.
              // this.showNodeDetail(params);
              this.nodesArr.forEach(element => {
                if (params.nodes[0] === element.id) {
                  this.nodesArrayDetail = element.detail
                }
              })
              jQuery('#detail-box2').fadeOut()
              jQuery('#detail-box3').fadeOut()
              jQuery('#detail-box').fadeIn()
            } else if (params.edges.length === 1) {
              // when click one edge.
              // this.showEdgeDetail(params);
              this.edgesArray.forEach(element => {
                if (params.edges[0] === element.id) {
                  this.edgesArrayDetail = element.detail
                }
              })
              jQuery('#detail-box').fadeOut()
              jQuery('#detail-box3').fadeOut()
              jQuery('#detail-box2').fadeIn()
            }
          }, 200)
        })
        // 鼠标双击事件
        this.network.on('doubleClick', params => {
          clearTimeout(this.doubleClickTimeout)
          if (params.nodes.length > 0) {
            const selectId = params.nodes[0]
            if (this.nodeExtendArr.includes(selectId)) {
              this.$message.warning(
                this.$t('meta.DS.message.nodeHasBeenExpanded')
              )
            } else {
              // 每个节点只能扩展一次,nodeExtendArr记录已扩展的节点
              this.nodeExtendArr.push(selectId)
              this.handleAddNode(selectId)
            }
          }
        })
        this.network.on('oncontext', params => {
          const { x: x0, y: y0 } = params.pointer.DOM
          const nodeId = this.network.getNodeAt({ x: x0, y: y0 })
          const edgeId = this.network.getEdgeAt({ x: x0, y: y0 })
          const evt = params.event
          const { clientX: x, clientY: y } = evt
          evt.stopPropagation()
          evt.preventDefault()
          const options = []
          if (!nodeId && edgeId) {
            this.edgesArray.forEach(element => {
              if (
                edgeId === element.id &&
                element.detail.relationName.includes('自定义类型')
              ) {
                options.push({
                  icon: 'el-icon-delete',
                  label: '删除关系',
                  callback: () => {
                    this.$confirm(`确定要删除自定义类型的关系吗？`, '提示', {
                      type: 'warning'
                    })
                      .then(() => {
                        this.$http
                          .post(
                            this.$graph_url + `/graph/removeCustomizedRelation`,
                            element.detail
                          )
                          .then(_ => {
                            this.edges.remove(element.id)
                          })
                          .catch(e => {
                            this.$showFailure(e)
                          })
                      })
                      .catch()
                  }
                })
              }
            })
          } else if (nodeId) {
            this.nodesArr.forEach(element => {
              if (nodeId === element.id) {
                this.app !== 'archy' && options.push({
                  icon: 'el-icon-location-outline',
                  label: '作为中心节点',
                  callback: () => {
                    this.firstEstablish = false
                    this.network = null
                    this.nodesArray = []
                    this.nodesArr = []
                    this.edgesArray = []
                    this.nodeExtendArr = []
                    this.getSearchNodeRelation(
                      element.detail.Id,
                      element.detail.typeId
                    )
                  }
                })
                // if (
                //   [LDMTypes.Domain, LDMTypes.Entity, LDMTypes.Attribute].includes(
                //     parseInt(element.type)
                //   )
                // ) {
                this.app !== 'archy' && options.push({
                  icon: 'el-icon-plus',
                  label: '创建正向关系',
                  callback: () => {
                    // console.log(element.detail)
                    this.$refs.addRelation.newRelation(element.detail, false)
                  },
                  args: null
                })
                this.app !== 'archy' && options.push({
                  icon: 'el-icon-plus',
                  label: '创建反向关系',
                  callback: () => {
                    // console.log(element.detail)
                    this.$refs.addRelation.newRelation(element.detail, true)
                  },
                  args: null
                })
                // }
                options.push({
                  icon: 'el-icon-delete',
                  label: '隐藏节点',
                  callback: () => {
                    this.removeSelf(element)
                  }
                })
                options.push({
                  icon: 'el-icon-delete',
                  label: '隐藏子节点',
                  callback: () => {
                    this.removeSubNodes(element, false)
                  }
                })
                options.push({
                  icon: 'el-icon-delete',
                  label: '显示子节点',
                  callback: () => {
                    this.showSubNodes(element)
                  }
                })
              }
            })
          }
          if (options.length > 0) {
            let yOfResult = y
            let bottomMargin = 30 * options.length + 15
            if (window.innerHeight - y < bottomMargin) {
              yOfResult = window.innerHeight - bottomMargin
            }
            this.$bus.$emit('callContextMenu', {
              x: x,
              y: yOfResult,
              options: options,
              placement: 'right'
            })
          }
        })
        this.network.on('dragEnd', e => {
          if (e.nodes && e.nodes.length > 0) {
            // 拖拽节点后,使得节点可以固定不动
            this.network.clustering.updateClusteredNode(e.nodes[0], {
              physics: false
            })
          }
        })
        this.firstEstablish = true
      }
    },
    handleAddNode (selectId, scopeSet) {
      const selectNode = this.nodesArr.filter(item => item.id === selectId)
      // 获取需要的参数，获取参数后可到后台获取扩展后的数据
      const type = selectNode[0].detail.Type
      const id = selectNode[0].detail.Id
      let typeId = ''
      if (
        type === '80010119' ||
        type === '80010118' ||
        type === '80000005' ||
        type === '80000004' ||
        type === '80500008'
      ) {
        typeId = '82800009'
      } else {
        typeId = type
      }
      let scope = scopeSet
      if (!scope) {
        this.nodesArr.forEach(element => {
          if (selectId === element.id) {
            scope = element.scope
          }
        })
      }
      this.$http
        .post(
          this.$graph_url +
            '/graph/searchNodeRelation?type=' +
            typeId +
            '&id=' +
            id +
            '&layers=1' +
            '&scope=' +
            scope
        )
        .then(res => {
          this.siblingFilter(res.data.data).forEach(element => {
            element.level = selectNode[0].level + 1
            this.nodesArray.push(element)
          })
          this.getNodeArr()
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    handleUpdateGraph (json) {
      let selectId = '' + json.sourceId + json.sourceType
      let scope = 'right'
      let selectNode = this.nodesArr.filter(item => item.id === selectId)
      if (selectNode.length === 0) {
        // 说明新增的是反向关系
        selectId = '' + json.targetId + json.targetType
        selectNode = this.nodesArr.filter(item => item.id === selectId)
        scope = 'left'
      }
      if (selectNode.length === 0) {

      } else {
        this.nodeExtendArr.push(selectId)
        this.handleAddNode(selectId, scope)
      }
    },
    getNode (option) {
      for (var i = 0; i < this.nodesArr.length; i++) {
        if (option === this.nodesArr[i].id) {
          return this.nodesArr[i]
        }
      }
    },
    // 缩略图点击高亮显示
    handleLegendClick (type) {
      const allNodes = this.nodesArr
      const updateArray = []
      for (const typeId in allNodes) {
        if (allNodes.hasOwnProperty(typeId)) {
          const node = allNodes[typeId]
          if (type !== '') {
            if (node.type !== type) {
              node.group = 'grey'
            } else {
              node.group = ''
            }
          } else {
            node.group = type
          }
          updateArray.push(allNodes[typeId])
        }
      }
      this.nodes.update(updateArray)
    },
    // 初始化
    init () {
      if (true || !this.network) {
        // 初次绘图
        this.nodes = new Vis.DataSet([])
        this.edges = new Vis.DataSet([])
        this.container = document.getElementById('network_id')
        this.data = {
          nodes: this.nodes,
          edges: this.edges
        }
        this.options = {
          autoResize: true, // 网络将自动检测其容器的大小调整，并相应地重绘自身
          locale: 'cn', // 语言设置：工具栏显示中文
          // 设置节点样式
          nodes: {
            shape: 'box', // 节点的外观。为circle时label显示在节点内，为dot时label显示在节点下方
            size: 24, // 节点的大小，
            shadow: false, // 如果为true，则节点使用默认设置投射阴影。
            font: {
              // 字体配置
              size: 16,
              color: this.thema === 'black' ? '#bbb' : 'black',
              align: 'center'
            },
            //  color: {
            //   border: "white",
            //   background: "black",
            //  },
            margin: 5, // 当形状设置为box、circle、database、icon、text；label的边距
            // widthConstraint: 100, //设置数字，将节点的最小和最大宽度设为该值,当值设为很小的时候，label会换行，节点会保持一个最小值，里边的内容会换行
            borderWidth: 1, // 节点边框宽度，单位为px
            borderWidthSelected: 3, // 节点被选中时边框的宽度，单位为px
            labelHighlightBold: false // 确定选择节点时标签是否变为粗体
          },
          // 边线配置
          edges: {
            width: 1,
            length: 240,
            // color: {
            //     color: "#848499",
            //     highlight: "rgb(117, 218, 167)",
            //     hover: "#88dab1",
            //     inherit: "from",
            //     opacity: 1.0,
            // },
            shadow: false,
            smooth: {
              // 设置两个节点之前的连线的状态
              enabled: true // 默认是true，设置为false之后，两个节点之前的连线始终为直线，不会出现贝塞尔曲线
              // type:'dynamic'
            },
            arrows: { middle: true }, // 箭头指向to
            font: {
              align: 'top',
              color: 'black'
            }
          },
          // 用于所有用户与网络的交互。处理鼠标和触摸事件以及导航按钮和弹出窗口
          interaction: {
            dragNodes: true, // 是否能拖动节点
            dragView: true, // 是否能拖动画布
            hover: true, // 鼠标移过后加粗该节点和连接线
            multiselect: true, // 按 ctrl 多选
            selectable: true, // 是否可以点击选择
            selectConnectedEdges: true, // 选择节点后是否显示连接线
            hoverConnectedEdges: true, // 鼠标滑动节点后是否显示连接线
            zoomView: true // 是否能缩放画布
          },
          // 操作模块:包括 添加、删除、获取选中点、设置选中点、拖拽系列、点击等等
          manipulation: {
            enabled: true, // 该属性表示可以编辑，出现编辑操作按钮
            addNode: true,
            addEdge: true,
            // editNode: undefined,
            editEdge: true,
            deleteNode: true,
            deleteEdge: true
          }
          // 计算节点之前斥力，进行自动排列的属性
          // physics: false,
          // groups:{
          //   // useDefaultGroups: true,
          //   grey: {color:{background:'#C1C1C1'}},
          //   '80010000': {color:{background:' #FBD6A6'}},
          //   '82800002': {color:{background:'#F8DD6C'}},
          //   '82800010': {color:{background:'#F8976C'}},
          //   '82800009': {color:{background:'#F86C6C'}},
          //   '82800017': {color:{background:'#F86C9F'}},
          //   '82800012': {color:{background:'#CF4BD5'}},
          //   '82800016': {color:{background:'#9663F3'}},
          //   '80010001': {color:{background:'#A77CF8'}},
          //   '80010066': {color:{background:'#7C8BF8'}},
          //   '80010098': {color:{background:'#5DABFF'}},
          // },
        }
        if (this.displayType === '1') {
          this.options.physics = false
        } else if (this.displayType === '2') {
          this.options.physics = {
            stabilization: false,
            barnesHut: {
              gravitationalConstant: -3000,
              springConstant: 0.04,
              springLength: 95
            }
          }
        }
        this.network = new Vis.Network(this.container, this.data, this.options)
      } else {
        // 补充装
        const param = {
          nodes: [],
          edges: []
        }
        this.nodesArr.forEach(item => {
          if (!this.nodes._data.hasOwnProperty(item.id)) {
            param.nodes.push(item)
          }
        })
        this.edgesArray.forEach(item => {
          if (!this.edges._data.hasOwnProperty(item.id)) {
            param.edges.push(item)
          }
        })
        this.addNetworkParams(param)
      }

      this.loadingKg = false
    },
    // 扩展节点 增加nodes和edges集合参数
    addNetworkParams (param) {
      // 添加节点
      for (var i = 0; i < param.nodes.length; i++) {
        var node = param.nodes[i]
        // console.log(node, 'node')
        if (isNaN(node.x) || isNaN(node.y)) {
          // return
        } else {
          this.nodes.add({
            label: node.name,
            ...node
          })
        }
        this.allNode.set(node.id, node)
      }
      // 添加关系
      for (var j = 0; j < param.edges.length; j++) {
        var edge = param.edges[j]
        this.edges.add({
          ...edge
        })
        // console.log(edge, 'edge')
        this.allEdge.set(edge.id, edge)
      }
    }
  }
}
