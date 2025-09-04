import { AssetsTypeEnum } from './Enum'
export const formatTreeData = data => {
  // 空数组
  let treeData = []
  // 判断不是数组  直接返回
  if (!Array.isArray(data)) {
    return treeData
  }
  // 遍历  删除  children 属性  做初始化操作
  data.forEach(item => {
    item.children = []
  })
  //  空对象
  let map = {}
  data.forEach(item => {
    map[item.id] = item
  })

  /**
   * map对象的 键: 是每个id  值：对应的item
   * 1: {id: 1, pid: 0, name: "body"}
   * 2: {id: 2, pid: 1, name: "title"}
   * 3: {id: 3, pid: 2, name: "div"}
   */
  data.forEach(item => {
    // item.pid 为0时 返回underfined
    let parent = map[item.parentId]
    if (parent) {
      ;(parent.children || (parent.children = [])).push(item)
    } else {
      // 这里push的item是pid为0的数据
      treeData.push(item)
    }
  })
  return treeData
}

// 生成 目录树 的嵌套数据结构
export const findChildren = (treeData, data, level) => {
  if (treeData.length !== 0) {
    treeData.forEach(item => {
      item.children = data
        .filter(d => d.parentId === item.id)
        .map(item => {
          return {
            ...item,
            catalogName: item.name,
            catalogLevel: level,
            children: [],
          }
        })
      findChildren(item.children, data, level + 1)
    })
  }
  return treeData
}

// tree 节点 上溯  返回 所有父节点
export const findParents = (allNodes, targetNode) => {
  const breadcrumbNodes = [targetNode]
  const structureNodes = allNodes[targetNode.structureId]
  let parentId = targetNode.parentId
  while (parentId) {
    const item = structureNodes[parentId]
    if (item) {
      breadcrumbNodes.unshift(item)
      parentId = item.parentId
    } else {
      parentId = null
    }
  }
  return breadcrumbNodes
}

const algorithmsKeyMap = {
  DEPT: 'assets.summaryInfo.ownershipText',
  ASSETS_LIST: 'assets.summaryInfo.assetListTitle',
  DATA_BUTLER: 'assets.summaryInfo.stewardText',
  SECURITY_LEVEL: 'assets.summaryInfo.secLevelText',
  KEYWORDS: 'assets.commonHead.keyword',
  DESCRIPTION: 'assets.commonHead.descText',
  ENGLISH_ABBREVIATION: 'assets.commonHead.englishText',
}
// 生成完成度字符串
export const toCompletionStr = (data, _this) => {
  let completeness
  const completenessArr = (data.staticProperties || []).concat(
    data.udpDtoList || []
  )
  if (completenessArr.length) {
    completeness = completenessArr
      .map((item, idx) => {
        const algorithms = `${
          _this.$t(algorithmsKeyMap[item.attribute]) || item.extendProp
        } * ${item.weight}%`
        if (idx !== 0) {
          return ` + ${algorithms}`
        } else {
          return algorithms
        }
      })
      .join('')
  } else {
    completeness = `${_this.$t('assets.generalSettings.dept')} * 25%
     + ${_this.$t('assets.summaryInfo.assetListTitle')} * 20%
     + ${_this.$t('assets.generalSettings.butler')} * 20%
     + ${_this.$t('assets.generalSettings.keywords')} * 10%
     + ${_this.$t('assets.generalSettings.description')} * 15%
     + ${_this.$t('assets.commonHead.englishText')} * 10%`
  }
  return completeness
}

export const handleSuggestionData = suggessData => {
  let suggessArr = []
  if (Array.isArray(suggessData) && suggessData.length) {
    suggessData.forEach(s => {
      const { type, buckets, totalHits } = s
      let obj = {
        typeId: type,
        count: totalHits,
        options: [],
      }
      if (Array.isArray(buckets) && buckets.length) {
        buckets.forEach(suggest => {
          let basicObj = {
            isAuth: suggest.isAuth,
            catalogPath: 0,
            typeId: type,
            objectId: suggest.itemId,
            description: suggest.description,
            name: suggest.assetsName,
            alias: suggest.alias,
            code: suggest.domainCode, // 标准代码
            itemId: suggest.itemId, // 数据标准/基础标准
            id: suggest.id,
            api: suggest.api,
            domainId: suggest.itemId,
            vote: suggest.vote,
            fileType: suggest.fileType,
            categoryId: suggest.categoryId,
            secName: suggest.alias,
            structureId: suggest.structureId,
            catalogId: suggest.catalogId,
          }
          obj.options.push(basicObj)
        })
      }
      suggessArr.push(obj)
    })
  }
  return suggessArr
}

export const typeStyleMap = (data, _this) => {
  if (data.typeId) {
    // console.log(data.typeId)
    switch (`${data.typeId}`) {
      case `TABLE`:
        return {
          dataType: 'table',
          bg: 'rgba(64, 158, 255, 0.1)',
          name: _this.$t('assets.gateway.table'),
        }
        break
      case `VIEW`:
        return {
          dataType: 'view',
          bg: 'rgba(75, 92, 196, 0.1)',
          name: _this.$t('assets.gateway.view'),
        }
        break
      case `INDEX`:
        return {
          dataType: 'index',
          bg: 'rgba(209, 175, 62, 0.1)',
          name: _this.$t('assets.gateway.dataIndex'),
        }
        break
      case `DATA_SERVICE`:
        return {
          dataType: 'api',
          bg: 'rgba(0, 164, 151, 0.1)',
          name: 'API',
        }
        break
      case `DATA_STANDARD`:
        return {
          dataType: 'datastandard',
          bg: 'rgba(56, 180, 139, 0.1)',
          name: _this.$t('assets.gateway.dataStandrad'),
        }
        break
      case `DATA_STANDARD_CODE`:
        return {
          dataType: 'daima',
          bg: 'rgba(157, 91, 139, 0.1)',
          name: _this.$t('assets.gateway.standardCode'),
        }
        break
      case `FILE`:
        return {
          dataType: _this.$fileTypeFormatter(data.fileType),
          bg: 'rgba(64, 158, 255, 0.1)',
          name: _this.$t('assets.gateway.file'),
        }
        break
      case `REPORT`:
        return {
          dataType: 'report',
          bg: 'rgba(0, 136, 153, 0.1)',
          name: _this.$t('assets.gateway.report'),
        }
        break
      case `DATA_OBJECT`:
        return {
          dataType: 'column',
          bg: 'rgba(75, 92, 196, 0.1)',
          name: _this.$t('assets.gateway.dataObject'),
        }
        break
      case `CATALOG`:
        return {
          dataType: 'folder',
          bg: 'rgba(91, 126, 145, 0.1)',
          name: _this.$t('assets.gateway.catalog'),
        }
        break
      default:
        return {
          dataType: 'folder',
          bg: 'rgba(91, 126, 145, 0.1)',
          name: _this.$t('assets.gateway.catalog'),
        }
    }
  }
}

export const getSearchTypes = _this => {
  return [
    { label: _this.$t('assets.generalSettings.object'), id: 'DATA_OBJECT' },
    {
      label: _this.$t('assets.gateway.table'),
      id: 'TABLE',
    },
    {
      label: _this.$t('assets.gateway.view'),
      id: 'VIEW',
    },
    {
      label: _this.$t('assets.gateway.dataStandrad'),
      id: 'DATA_STANDARD',
    },
    {
      label: _this.$t('assets.gateway.standardCode'),
      id: 'DATA_STANDARD_CODE',
    },
    {
      label: _this.$t('assets.gateway.dataIndex'),
      id: 'INDEX',
    },
    {
      label: _this.$t('assets.gateway.report'),
      id: 'REPORT',
    },
    {
      label: _this.$t('assets.gateway.dataService'),
      id: 'DATA_SERVICE',
    },
    {
      label: _this.$t('assets.gateway.file'),
      id: 'FILE',
    },
    { label: _this.$t('assets.generalSettings.none'), id: 'CATALOG' },
  ]
}

export const getVisitParams = item => {
  let objectId
  switch (item.typeId) {
    // 表
    case 'TABLE':
      objectId = item.objectId
      break
    // 数据标准 或 数据指标
    case 'DATA_STANDARD':
      objectId = item.domainId
      break
    // 数据指标
    case 'INDEX':
      objectId = item.domainId
      break
    // 报表
    case 82800002:
      objectId = item.itemId
      break
    // 文件
    case 'FILE':
      objectId = item.itemId
      break
    // 标准代码
    case 'DATA_STANDARD_CODE':
      objectId = item.code
      break
    case 'CATALOG':
      objectId = `${item.catalogId}/${item.structureId}`
      break
    case 'DATA_OBJECT':
      objectId = item.itemId
      break
    default:
      objectId = item.objectId
  }
  return {
    ...item,
    objectId,
  }
}

export const toBrowsing = (data, _this) => {
  // console.log(data)
  _this.showSearchHelper = false
  _this.showSuggestions = false
  if (`${data.typeId}` === `FILE` && _this.$auth.METADATA_FILE_VIEW) {
    // 文件类型--id
    const pos = location.href.indexOf('#/')
    const baseUrl = location.href.slice(0, pos + 1)
    const url = `${baseUrl}myShareFile?id=${data.itemId}&catalogPath=${data.catalogPath}&keyword=${_this.keywords}&isAssets=true`
    window.open(url)
  }
  const query = {
    objectId: data.objectId,
    keyword: _this.keywords,
    catalogPath: _this.catalogPath,
    type: data.type,
    typeId: String(data.typeId),
  }
  const pos = location.href.indexOf('#/')
  const baseUrl = location.href.slice(0, pos + 2)
  let hasAuth = false
  if (!data.typeId && data.api) {
    query.typeId = 'DATA_SERVICE'
  }
  if (query.typeId === 'DATA_OBJECT' && _this.$auth.METADATA_VIEW) {
    hasAuth = true
    window.open(
      baseUrl + `main/meta?objectId=${data.objectId}&blank=true&isAssets=true`
    )
  }
  // this.$bus.$emit('showDetail', query);
  if (query.typeId === 'TABLE' && _this.$auth.METADATA_VIEW) {
    hasAuth = true
    // 表
    window.open(
      baseUrl +
        `myItem?objectId=${data.objectId}&keyword=${_this.keywords}&catalogPath=${data.catalogPath}&type=TABLE&blank=true&isAssets=true`
    )
  }
  if (query.typeId === 'VIEW' && _this.$auth.METADATA_VIEW) {
    hasAuth = true
    // 视图
    window.open(
      baseUrl +
        `myItem?objectId=${data.objectId}&keyword=${_this.keywords}&catalogPath=${data.catalogPath}&type=VIEW&blank=true&isAssets=true`
    )
  }
  if (query.typeId === AssetsTypeEnum.META_MODEL) {
    hasAuth = true
    // const url = _this.BaseUtils.RouterUtils.getFullUrl('metaModelDetails', {
    //   objectId: data.itemId,
    //   catalogId: data.catalogId,
    //   id: data.assetsId,
    //   type: 'metaModel',
    //   blank: true,
    // })
    const url = _this.BaseUtils.RouterUtils.getFullUrl('dataCatalog', {
      objectId: data.itemId,
      catalogId: data.catalogId,
      id: data.assetsId,
      type: 'META_MODEL',
      blank: true,
    })
    window.open(url)
  }
  if (
    (query.typeId === 'DATA_STANDARD' && _this.$auth.DATA_STANDARD_VIEW) ||
    (query.typeId === 'INDEX' && _this.$auth.DATA_STANDARD_DIM_VIEW)
  ) {
    hasAuth = true
    // 标准
    window.open(
      baseUrl +
        `domain?domainId=${data.domainId}&keyword=${_this.keywords}&vote=${data.vote}&blank=true&isAssets=true`
    )
  }
  if (query.typeId === 'DATA_STANDARD_CODE' && _this.$auth.STANDARD_CODE_VIEW) {
    hasAuth = true
    // 标准代码
    window.open(
      baseUrl +
        `main/dataStandard/code?code=${data.code}&blank=true&isAssets=true`
    )
  }
  if (query.typeId === 'REPORT' && _this.$auth.METADATA_REPORT_VIEW) {
    hasAuth = true
    // 报表
    window.open(
      baseUrl +
        `reportForm?reportId=${data.itemId}&keyword=${_this.keywords}&blank=true&isAssets=true`
    )
  }
  if (query.typeId === 'DATA_SERVICE' && _this.$auth.API_DEVELOP_ADMIN) {
    hasAuth = true
    window.open(
      baseUrl +
        `main/apiOverview?apiId=${data.id || ''}&blank=true&isAssets=true`
    )
  }
  if (query.typeId === 'CATALOG') {
    hasAuth = true
    window.open(
      baseUrl +
        `main/dataAsset/overview?id=${data.catalogId || ''}&structureId=${
          data.structureId || ''
        }&type=catalogue&blank=true&isAssets=true`
    )
  }
  if (!hasAuth) {
    _this.$showFailure('您没有该模块的查看权限')
  }
}

// 基本信息处理
export const handleBaseInfo = (baseInfo, completeInfo, _this) => {
  _this.currentNode = {
    ..._this.currentNode,
    ...baseInfo,
  }
  const currentNode = {
    ..._this.currentNode,
    ...baseInfo,
  }
  const { assetsType, level, structureId, authType } = _this.currentNode
  _this.baseInfo = {
    ..._this.baseInfo,
    ..._this.currentNode,
    assetsType: assetsType
      ? assetsType.split(',').filter(item => item !== 'CATALOG')
      : [],
    completeness: toCompletionStr(completeInfo, _this),
    addChildren: assetsType.indexOf('CATALOG') !== -1,
    structureId,
    hasPermission: authType === 'MANAGER' || authType === 'EDIT',
    icon: _this.currentStructure.structureDto.detailDtos[level - 1].icon,
  }
}
// 处理统计信息
export const handleStatisticsInfo = (statisticsInfo, subInfo, _this) => {
  if (statisticsInfo && statisticsInfo.assetsStatisticsDtoList) {
    statisticsInfo.assetsStatisticsDtoList =
      statisticsInfo.assetsStatisticsDtoList.filter(item => item.count !== 0)
  }
  const { comment, assetsType, level, maxLevel } = _this.currentNode
  const { superior, subDirectory, assetsStatisticsDtoList } = statisticsInfo
  _this.summaryInfo.statisticsInfo = {
    assetsStatisticsDtoList,
    superior,
    subDirectory: { data: subInfo.content, totalPages: subInfo.totalPages },
    descInfo: comment,
    assetTypes: assetsType,
    canAddChildren: assetsType.indexOf('CATALOG') !== -1 && level < maxLevel,
  }
}
// 处理属性信息
export const handleAttrInfo = (attrInfo, _this, isOverview = false) => {
  const {
    assetCatalogPropertyDto: generalSetting, // 通用属性
    catalogOrgDto: orgSetting, // 人与组织
    catalogStatisticsDto: baseSetting, // 基本属性
    catalogSysPropertyDto: systemSetting, // 系统属性
    extendsProperties: extendProps, // 扩展属性
  } = attrInfo
  _this.currentNode.deptName = orgSetting.deptName
  _this.summaryInfo.attrInfo = {
    ownship: orgSetting.deptName,
    steward: orgSetting.butler,
    topUsers: orgSetting.topUsers.filter(item => item !== null).slice(0, 3),
    extendProps,
    generalSetting: {
      ...generalSetting,
      keyword: _this.currentNode.keyword,
      authType: _this.currentNode.authType,
    },
    systemSetting,
  }
  // 接口新加字段publishQpCount，资产浏览页面质量问题展示publishQpCount
  const qpNum = isOverview ? baseSetting.publishQpCount : baseSetting.qpCount
  _this.baseInfo = {
    ..._this.baseInfo,
    percent: baseSetting.progress || 0,
    vote: baseSetting.score || 0,
    quality: qpNum || 0,
    visit: baseSetting.pv || 0,
    hasCollected: baseSetting.collected,
    favoriteCount: baseSetting.collectedCount || 0,
    quote: baseSetting.citations || 0,
  }
}

export const getAssetTypeMap = _this => {
  return {
    TABLE: _this.$t('assets.assetList.dataSheet'),
    DATA_OBJECT: _this.$t('assets.assetList.dataItem'),
    DOMAIN: _this.$t('assets.assetList.dataStandard'),
    INDEX: _this.$t('assets.assetList.dataIndicators'),
    REPORT: _this.$t('assets.assetList.dataReport'),
    FILE: _this.$t('assets.assetList.file'),
    DATA_SERVICE: _this.$t('assets.assetList.dataService'),
  }
}

export const getStatusMap = _this => {
  return {
    UNPUBLISHED: _this.$t('assets.common.unpublishText'),
    UNDER_REVIEW: _this.$t('assets.common.reviewText'),
    PUBLISHED: _this.$t('assets.common.publishedText'),
    OFFLINE: _this.$t('assets.common.offlineText'),
  }
}
// 获取数据权属
export const departmentName = data => {
  let result = ''
  let newList = []
  if (
    data.subAssetsType === AssetsTypeEnum.INDEX ||
    data.subAssetsType === AssetsTypeEnum.DATA_STANDARD
  ) {
    result = data.techDeptName
  } else {
    data.departmentNameList &&
      data.departmentNameList.length > 0 &&
      data.departmentNameList.map(item => {
        newList.push(item.name)
      })
    result = newList.join('、')
  }
  return result || '--'
}
