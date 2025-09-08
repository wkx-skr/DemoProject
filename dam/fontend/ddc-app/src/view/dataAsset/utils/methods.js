import { AssetsTypeEnum } from './Enum'
export const formatTreeData = (
  data,
  itemId = 'id',
  parentKey = 'parentId',
  childrenKey = 'children'
) => {
  // 空数组
  let treeData = []
  // 判断不是数组  直接返回
  if (!Array.isArray(data)) {
    return treeData
  }
  // 遍历  删除  children 属性  做初始化操作
  data.forEach(item => {
    item[childrenKey] = []
  })
  //  空对象
  let map = {}
  data.forEach(item => {
    map[item[itemId]] = item
  })

  // console.log(map)

  /**
   * map对象的 键: 是每个id  值：对应的item
   * 1: {id: 1, pid: 0, name: "body"}
   * 2: {id: 2, pid: 1, name: "title"}
   * 3: {id: 3, pid: 2, name: "div"}
   */
  data.forEach(item => {
    // item.pid 为0时 返回underfined
    let parent = map[item[parentKey]]
    if (parent) {
      ;(parent[childrenKey] || (parent[childrenKey] = [])).push(item)
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
  KEYWORDS: 'assets.summaryInfo.keywordText',
  DESCRIPTION: 'assets.summaryInfo.descText',
  ENGLISH_ABBREVIATION: 'assets.summaryInfo.englishText',
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
            assetsCode: suggest.assetsCode,
            isAuth: suggest.isAuth,
            catalogPath: 0,
            typeId: type,
            objectId: suggest.itemId,
            description: suggest.description,
            name: suggest.assetsName,
            alias: suggest.alias || suggest.catalogEnglishName, // 对于目录来说，alias是指目录的英文名称，对于标准类资产来说，alias是指标准编码，对于其他资产类型来说，alias是指资产的英文名称
            domainCode: suggest.domainCode, // 标准代码
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
            isLogical: suggest.isLogical,
            icon: suggest.icon,
            assetsId: suggest.assetsId,
          }
          if (type === 'METAMODEL_OBJECT') {
            basicObj.itemTypeId = suggest.itemTypeId
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
  if (data && data.typeId) {
    // console.log(data.typeId, 'data.typeId')
    switch (`${data.typeId}`) {
      // console.log(data.typeId)
      case `TABLE`:
      case 'table':
        return {
          dataType:
            data.isLogical || data.originData?.isLogical
              ? 'logicaltable'
              : 'table',
          bg: 'rgba(64, 158, 255, 0.1)',
          name: _this.$t('assets.gateway.table'),
        }
        break
      case `VIEW`:
      case 'view':
        return {
          dataType: 'view',
          bg: 'rgba(75, 92, 196, 0.1)',
          name: _this.$t('assets.gateway.view'),
        }
        break
      case `INDEX`:
      case 'index':
        return {
          dataType: 'index',
          bg: 'rgba(209, 175, 62, 0.1)',
          name: _this.$t('assets.gateway.dataIndex'),
        }
        break
      case AssetsTypeEnum.META_MODEL:
        return {
          dataType: AssetsTypeEnum.META_MODEL,
          bg: 'rgba(64, 158, 255, 0.1)',
          name: '自定义对象',
        }
        break
      case `DATA_STANDARD`:
      case `data_standard`:
        return {
          dataType: 'datastandard',
          bg: 'rgba(56, 180, 139, 0.1)',
          name: _this.$t('assets.gateway.dataStandrad'),
        }
        break
      case `DATA_STANDARD_CODE`:
      case `data_standard_code`:
        return {
          dataType: 'daima',
          bg: 'rgba(157, 91, 139, 0.1)',
          name: _this.$t('assets.gateway.standardCode'),
        }
        break
      case `FILE`:
      case 'file':
        return {
          dataType: _this.$fileTypeFormatter(data.fileType),
          bg: 'rgba(64, 158, 255, 0.1)',
          name: _this.$t('assets.gateway.file'),
        }
        break
      case `REPORT`:
      case 'report':
        return {
          dataType: 'report',
          bg: 'rgba(0, 136, 153, 0.1)',
          name: _this.$t('assets.gateway.report'),
        }
        break
      case `DATA_OBJECT`:
      case 'data_object':
        return {
          dataType:
            data.isLogical || data.originData?.isLogical
              ? 'logicalcolumn'
              : 'column',
          bg: 'rgba(75, 92, 196, 0.1)',
          name: _this.$t('assets.gateway.dataObject'),
        }
        break
      case `CATALOG`:
      case 'catalog':
        return {
          dataType: data.icon || data.originData?.icon ? '' : 'folder',
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
    _this.$versionFeature.dataasset_CatalogType
      ? {
          label: _this.$t('assets.gateway.report'),
          id: 'REPORT',
        }
      : null,
    _this.$versionFeature.dataasset_CatalogType
      ? {
          label: _this.$t('assets.gateway.file'),
          id: 'FILE',
        }
      : null,
    { label: _this.$t('assets.generalSettings.none'), id: 'CATALOG' },
  ].filter(item => !!item)
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
    case AssetsTypeEnum.META_MODEL:
      objectId = item.objectId
      break
    default:
      objectId = item.objectId
  }
  return {
    ...item,
    id: undefined,
    // id: item.id || item.assetsId,
    categoryId: item.categoryId,
    description: item.description,
    name: item.name || item.assetsName,
    objectId,
    typeId: item.typeId,
    icon: item.icon,
    createTime: undefined,
  }
}

export const toBrowsing = (data, _this) => {
  _this.showSearchHelper = false
  _this.showSuggestions = false
  let hasAuth = false
  if (`${data.typeId}` === `FILE`) {
    // 文件类型--id
    hasAuth = true
    const url = _this.BaseUtils.RouterUtils.getFullUrl('fileDetails', {
      objectId: data.itemId,
      catalogId: data.catalogId,
      id: data.assetsId,
      blank: true,
    })
    window.open(url)
  }
  const query = {
    objectId: data.objectId,
    keyword: _this.keywords,
    catalogPath: _this.catalogPath,
    type: data.type,
    typeId: String(data.typeId),
  }
  if (query.typeId === 'DATA_OBJECT') {
    hasAuth = true
    const url = _this.BaseUtils.RouterUtils.getFullUrl('columnDetails', {
      objectId: data.itemId,
      catalogId: data.catalogId,
      id: data.assetsId,
      blank: true,
    })
    window.open(url)
  }
  if (query.typeId === 'TABLE') {
    hasAuth = true
    // 表
    const url = _this.BaseUtils.RouterUtils.getFullUrl('tableDetails', {
      objectId: data.itemId,
      catalogId: data.catalogId,
      id: data.assetsId,
      type: 'table',
      blank: true,
    })
    window.open(url)
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
  if (query.typeId === 'VIEW') {
    hasAuth = true
    // 视图
    const url = _this.BaseUtils.RouterUtils.getFullUrl('viewDetails', {
      objectId: data.itemId,
      catalogId: data.catalogId,
      id: data.assetsId,
      type: 'view',
      blank: true,
    })
    window.open(url)
  }
  if (
    (query.typeId === 'DATA_STANDARD' && _this.$auth.DATA_STANDARD_VIEW) ||
    (query.typeId === 'INDEX' &&
      (_this.$auth.DATA_STANDARD_DIM_VIEW ||
        _this.$auth.METRIC_INDEX_ATOM ||
        _this.$auth.METRIC_INDEX_DERIVE))
  ) {
    let name = 'index'
    let metric = localStorage.getItem('allServers')
      ? JSON.parse(localStorage.getItem('allServers')).includes('METRIC')
      : false
    if (
      metric &&
      ((data.indexDefinitionNew && !_this.$auth.METRIC_INDEX_ATOM) ||
        (!data.indexDefinitionNew && !_this.$auth.METRIC_INDEX_DERIVE))
    ) {
      hasAuth = false
      return
    }
    if (data.indexDefinitionNew === 5) {
      name = 'indexDefinitionNew'
    } else if (data.indexDefinitionNew === 6) {
      name = 'forkIndexDefinitionNew'
    }
    hasAuth = true
    let newName =
      query.typeId === 'DATA_STANDARD' && _this.$auth.DATA_STANDARD_VIEW
        ? 'dataStandard'
        : name
    // 标准
    const url = _this.BaseUtils.RouterUtils.getFullUrl(newName, {
      domainId: data.itemId,
      id: data.itemId,
      blank: true,
      isAssets: true,
    })
    window.open(url)
  }
  if (query.typeId === 'DATA_STANDARD_CODE' && _this.$auth.STANDARD_CODE_VIEW) {
    hasAuth = true
    // 标准代码
    const url = _this.BaseUtils.RouterUtils.getFullUrl('code', {
      code: data.itemId,
      blank: true,
      isAssets: true,
    })
    window.open(url)
  }

  if (query.typeId === 'REPORT') {
    hasAuth = true
    // 报表
    const url = _this.BaseUtils.RouterUtils.getFullUrl('reportDetails', {
      objectId: data.itemId,
      id: data.assetsId,
      catalogId: data.catalogId,
      blank: true,
    })
    window.open(url)
  }
  if (query.typeId === 'CATALOG') {
    hasAuth = true
    const url = _this.BaseUtils.RouterUtils.getFullUrl('catalogDetails', {
      structureId: data.structureId,
      id: data.catalogId,
      blank: true,
    })
    window.open(url)
  }
  if (!hasAuth) {
    _this.$showFailure('您没有该模块的查看权限')
  }
  return hasAuth
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
    icon:
      _this.currentStructure &&
      _this.currentStructure.detailDtos &&
      _this.currentStructure.detailDtos[level - 1]
        ? _this.currentStructure.detailDtos[level - 1].icon
        : null,
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
    subDirectory: { data: subInfo, totalPages: 1 },
    descInfo: comment,
    assetTypes: assetsType,
    canAddChildren: assetsType.indexOf('CATALOG') !== -1 && level < maxLevel,
    catalogCode: _this.baseInfo.code,
    autoCode: !!_this.baseInfo.codeGenerate?.autoIncState,
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
  _this.currentNode.deptName = orgSetting?.deptName
  _this.summaryInfo.attrInfo = {
    ownship: orgSetting?.deptName,
    steward: orgSetting?.butler,
    topUsers: orgSetting?.topUsers.filter(item => item !== null).slice(0, 3),
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
    isNull: attrInfo.isNull,
    baseInfo: attrInfo
  }
}

export const getAssetTypeMap = _this => {
  return {
    TABLE: _this.$t('assets.generalSettings.table'),
    VIEW: _this.$t('assets.generalSettings.view'),
    DATA_OBJECT: _this.$t('assets.generalSettings.object'),
    DOMAIN: _this.$t('assets.assetList.dataStandard'),
    INDEX: _this.$t('assets.assetList.dataIndicators'),
    REPORT: _this.$t('assets.generalSettings.report'),
    FILE: _this.$t('assets.generalSettings.file'),
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
  // if (
  //   data.subAssetsType === AssetsTypeEnum.INDEX ||
  //   data.subAssetsType === AssetsTypeEnum.DATA_STANDARD
  // ) {
  //   result = data.techDeptName
  // } else {
  //   data.departmentNameList &&
  //     data.departmentNameList.length > 0 &&
  //     data.departmentNameList.map(item => {
  //       newList.push(item.name)
  //     })
  //   result = newList.join('、')
  // }
  data.departmentNameList &&
    data.departmentNameList.length > 0 &&
    data.departmentNameList.map(item => {
      newList.push(item.name)
    })
  result = newList.join('、')
  return result || '--'
}

// 数据集权限
export const hasDataSetAuth = (_this, isView = false) => {
  if (isView) {
    if (_this.$auth.METADATA_VIEW) {
      return true
    } else {
      return false
    }
  } else {
    if (
      _this.$auth.EXPORT_METADATA ||
      _this.$auth.UPDATA_METADATA ||
      // _this.$auth.METADATA_VIEW ||
      _this.$auth.METADATA_EDIT ||
      _this.$auth.METADATA_EDIT_CURRENT_SYSTEM ||
      _this.$auth.EDIT_DATA_SOURCE
    ) {
      return true
    } else {
      return false
    }
  }
}
// 报表权限
export const hasReportAuth = (_this, isView = false) => {
  if (isView) {
    if (_this.$auth.METADATA_REPORT_VIEW) {
      return true
    } else {
      return false
    }
  } else {
    if (
      // _this.$auth.METADATA_REPORT_VIEW ||
      _this.$auth.METADATA_REPORT_ADD ||
      _this.$auth.METADATA_REPORT_MODIFY ||
      _this.$auth.METADATA_REPORT_DELETE ||
      _this.$auth.METADATA_REPORT_IMPORT ||
      _this.$auth.METADATA_REPORT_EXPORT
    ) {
      return true
    } else {
      return false
    }
  }
}
// 文件权限
export const hasFileAuth = (_this, isView = false) => {
  if (_this.$auth.METADATA_FILE_VIEW) {
    return true
  } else {
    return false
  }
}
// 指标权限
export const hasIndexAuth = (_this, isView = false) => {
  if (isView) {
    if (_this.$auth.DATA_STANDARD_DIM_VIEW) {
      return true
    } else {
      return false
    }
  } else {
    if (
      _this.$auth.DATA_STANDARD_DIM_DELETE ||
      _this.$auth.DATA_STANDARD_DIM_IMPORT_STANDARDS ||
      _this.$auth.DATA_STANDARD_DIM_IMPORT_DIRECT ||
      _this.$auth.DATA_STANDARD_DIM_EXPORT ||
      _this.$auth.DATA_STANDARD_DIM_EXPORT_CHECKED ||
      _this.$auth.DATA_STANDARD_DIM_ADD ||
      _this.$auth.DATA_STANDARD_DIM_RELEASE ||
      _this.$auth.DATA_STANDARD_DIM_UPDATA ||
      _this.$auth.DATA_STANDARD_DIM_SCRAP ||
      _this.$auth.DATA_STANDARD_DIM_EDIT ||
      _this.$auth.METRIC_INDEX_ATOM ||
      _this.$auth.METRIC_INDEX_DERIVE
    ) {
      return true
    } else {
      return false
    }
  }
}
// 基础标准权限
export const hasStandardAuth = (_this, isView = false) => {
  if (isView) {
    // 查看权限
    if (_this.$auth.DATA_STANDARD_VIEW) {
      return true
    } else {
      return false
    }
  } else {
    // 新增权限
    if (
      _this.$auth.DATA_STANDARD_DELETE ||
      _this.$auth.DATA_STANDARD_IMPORT_STANDARDS ||
      _this.$auth.DATA_STANDARD_IMPORT_DIRECT ||
      _this.$auth.DATA_STANDARD_EXPORT ||
      _this.$auth.DATA_STANDARD_EXPORT_CHECKED ||
      _this.$auth.DATA_STANDARD_ADD ||
      _this.$auth.DATA_STANDARD_RELEASE ||
      _this.$auth.DATA_STANDARD_UPDATA ||
      _this.$auth.DATA_STANDARD_SCRAP ||
      _this.$auth.DATA_STANDARD_EDIT
    ) {
      return true
    } else {
      return false
    }
  }
}
// 标准代码权限
export const hasCodeAuth = (_this, isView = false) => {
  if (isView) {
    // 查看权限
    if (_this.$auth.STANDARD_CODE_VIEW) {
      return true
    } else {
      return false
    }
  } else {
    // 新增权限
    if (
      _this.$auth.STANDARD_CODE_DELETE ||
      _this.$auth.STANDARD_CODE_IMPORT_CODE ||
      _this.$auth.STANDARD_CODE_IMPORT_DIRECT ||
      _this.$auth.STANDARD_CODE_EXPORT ||
      _this.$auth.STANDARD_CODE_EXPORT_SELECTED ||
      _this.$auth.STANDARD_CODE_ADD ||
      _this.$auth.STANDARD_CODE_RELEASE ||
      _this.$auth.STANDARD_CODE_UPDATA ||
      _this.$auth.STANDARD_CODE_SCRAP ||
      _this.$auth.STANDARD_CODE_EDIT
    ) {
      return true
    } else {
      return false
    }
  }
}
// 服务权限
export const hasServiceAuth = (_this, isView = false) => {
  if (isView) {
    // 查看权限
    if (_this.$auth.API_DEVELOP_VIEW) {
      return true
    } else {
      return false
    }
  } else {
    // 新增权限
    if (_this.$auth.API_DEVELOP_APPLYING || _this.$auth.API_DEVELOP_ALL) {
      return true
    } else {
      return false
    }
  }
}

// 资产收藏
export const assetsCollect = (_this, http, data) => {
  const params = {
    objId: data.objId,
    objectName: data.objectName,
    typeId: data.typeId,
  }
  return new Promise((resolve, reject) => {
    http
      .assetsCollectApi(params)
      .then(res => {
        resolve()
      })
      .catch(e => {
        _this.$showFailure(e)
      })
  })
}
// 取消资产收藏
export const cancelAssetsCollect = (_this, http, id) => {
  return new Promise((resolve, reject) => {
    http
      .cancelAssetsCollectApi(id)
      .then(res => {
        resolve()
      })
      .catch(e => {
        _this.$showFailure(e)
      })
  })
}
// 获取属性列表
export const getAttrList = (_this, http, type) => {
  return new Promise(resolve => {
    http
      .getAssets()
      .then(res => {
        let data = res.data.data
        let newList = data.filter(k => k.classificationType === type)
        let levelList = newList.map(m => Object.assign({}, m.tag))
        levelList.sort((a, b) => {
          return a.tagId - b.tagId
        })
        resolve(levelList)
      })
      .catch(e => {
        _this.$showFailure(e)
      })
  })
}

// 数据超市--资产详情页获取数据管家和数据权属
export const assetsGetDepartment = (data, name) => {
  let departmentNameList = []
  data &&
    data.map(item => {
      departmentNameList.push(item[name])
    })
  return departmentNameList.join('，')
}
// 判断css省略号...是否出现
export const judgeEllipsize = boxTag => {
  let bool = false
  if (boxTag.scrollWidth > boxTag.clientWidth) {
    bool = true
  } else {
    bool = false
  }
  return bool
}

export const typeIdMap = {
  table: 80000004,
  view: 80500008,
  file: 82800008,
  report: 82800002,
  column: 80000005,
}
