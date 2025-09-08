// get
import HTTP from '@/http/main.js'
import axios from 'axios'
const $http = HTTP.$http
const $url = HTTP.$url
const $assetsUrl = '/assets'
const $metric = '/metric'
const $meta = '/metadata'
const api = {
  /// ////////////////////// 公共接口 //////////////////////////////////////
  // 获取当前登陆用户的信息
  getUserInfo() {
    return $http.post('/gateway/main/getUserInfo')
  },
  getAssets() {
    // 获取安全等级
    return $http.get('/datasecurity/datasecurity/level/securitylist')
  },

  // 获取目录空间
  getStructureList(origin = 'ANALYSIS') {
    // MANAGE  /  MINE  /  BROWSE  /  ANALYSIS
    return $http.get($assetsUrl + `/catalog/structures?fromPage=${origin}`)
  },

  // 获取目录树数据 0: 资产目录管理 1：资产浏览 2：我的资产
  getCatalogList(type, structureId, catalogId = 0) {
    if (type === 0)
      return $http.get(
        $assetsUrl + `/catalog/manage/${structureId}/${catalogId}`
      )
    if (type === 1)
      return $http.get(
        $assetsUrl + `/catalog/browse/${structureId}/${catalogId}`
      )
    if (type === 2) {
      return $http.get($assetsUrl + `/catalog/mine/${structureId}/${catalogId}`)
    }
  },
  getManageTree(structureId){
    return $http.get(`${$assetsUrl}/catalog/manageTree/${structureId}`)
  },
  // 搜索目录树
  getCatalogsByKeyword(type, structureId, keyword = '') {
    if (type === 0)
      return $http.get(
        $assetsUrl +
          `/catalog/manage/${structureId}/search?keywords=${encodeURIComponent(
            keyword
          )}`
      )
    if (type === 1)
      return $http.get(
        $assetsUrl +
          `/catalog/browse/${structureId}/search?keywords=${encodeURIComponent(
            keyword
          )}`
      )
    if (type === 2) {
      return $http.get(
        $assetsUrl +
          `/catalog/mine/${structureId}/search?keywords=${encodeURIComponent(
            keyword
          )}`
      )
    }
  },
  // 目录树排序
  changeCatalogOrder(params) {
    return $http.post($assetsUrl + `/catalog/sort`, params)
  },
  judgeAuth(id) {
    return $http.get($assetsUrl + `/${id}/isVerified`)
  }, // 判断资产是否已认证

  // 获取机构列表
  getOrganizationList() {
    return $http.get('/user/org/organization/tree/')
  },

  // 目录访问埋点
  visitDatalog(data) {
    return $http.post(
      $assetsUrl + `/catalog/visit/${data.structureId}/${data.catalogId}`
    )
  },

  /// ////////////////////// 资产门户 /////////////////////////////////

  // 目录空间列表
  getCatalogInstructureList() {
    return $http.get($assetsUrl + '/catalog/home/catalog')
  },

  // 提交浏览历史数据
  visitAsset(data) {
    return $http.post($assetsUrl + '/browsing/history/save', data)
  },

  // 获取浏览历史
  getAssetVisitHistory(data) {
    return $http.get(
      $assetsUrl + `/browsing/history/${data.pageNum}/${data.pageSize}`
    )
  },

  // 根据 关键字 和 类型 进行模糊搜索，得到搜索建议
  searchSuggestion(data) {
    return $http.post($assetsUrl + `/es/home/search`, data)
  },

  // 根据 关键字 和 类型 模糊搜索，得到搜索结果
  searchByKeyword(data) {
    return $http.post($assetsUrl + `/es/home/search/do`, data)
  },
  /// ////////////////////// 资产目录 ///////////////////////////////////
  // 根据目录空间ID，导出资产目录
  exportCatalog(structureId) {
    return $http.post($assetsUrl + `/catalog/export/${structureId}`)
  },

  exportAssetsByStructureId(structureId, form) {
    return $http.post(
      $assetsUrl + `/assets/export/structure/${structureId}`,
      form
    )
  },
  exportAssetsByCatalogId(option) {
    return $http.post($assetsUrl + `/assets/export`, option)
  },
  // 根据目录id 和 目录属性 获取完成度
  getCompletenessByOptions(data) {
    return $http.put($assetsUrl + '/catalog/update/check/complete', data)
  },

  // 提交 新建资产目录 的数据
  submitNewDir(data) {
    return $http.post($assetsUrl + '/catalog/add', data)
  },

  // 根据 目录id 获取目录详情
  getDirDetails(id) {
    return $http($assetsUrl + `/catalog/detail/${id}/nolog`)
  },
  getDirDetailsWithLog(id) {
    return $http($assetsUrl + `/catalog/detail/${id}`)
  },
  // 根据 目录id 统计子级目录
  getSubCatalogStatistics(params) {
    return $http.post($assetsUrl + `/catalog/subCatalog`, params)
  },

  // 获取资产清单列表
  getAssetsList(type, data, isView = false) {
    if (type === 0) {
      // 资产管理清单
      data.range = 'LIST'
    }
    if (type === 1) {
      // 资产浏览
      data.range = 'BROWSE'
    }
    if (type === 2) {
      // 我的资产
      data.range = 'MY'
    }
    return $http.post($assetsUrl + '/assets/list', data)
  },
  // 手动同步摘要信息和资产清单的数据
  syncData(data) {
    return $http.post(
      $assetsUrl + `/sync/${data.structureId}/${data.catalogId}?range=CATALOG`
    )
  },

  // 移动资产目录
  changeDirPath(data) {
    return $http.put(
      $assetsUrl + `/catalog/move?id=${data.id}&parentId=${data.parentId}`
    )
  },

  // 判断资产目录是否占用
  isCatalogInUse(catalogId) {
    return $http.post($assetsUrl + `/sync/bi/task/catalog/check/${catalogId}`)
  },

  // 删除资产目录
  deleteCatalog(id) {
    return $http.delete($assetsUrl + `/catalog/del/${id}`)
  },

  // 修改资产目录
  updateCatalog(data) {
    return $http.put($assetsUrl + '/catalog/update', data)
  },

  // 修改资产目录数据权属
  updateDepartment(params) {
    // console.log(params)
    return $http.post(
      $assetsUrl + `/catalog/org/${params.catalogId}/${params.bm}`
    )
  },

  // 修改资产目录数据管家
  updateSteward(params) {
    // console.log(params)
    return $http.post(
      $assetsUrl + `/catalog/butler/${params.catalogId}?butler=${params.butler}`
    )
  },

  // 修改资产目录状态(发布、下线)
  publishOrOfflineAssets(data) {
    // return $http.post(`/workflow/service/workflow/process/apply`, data)
    return $http.post($assetsUrl + `/workflow/applyOfAssets`, data)
  },

  // 发布或下线目录
  publishOrOfflineCatalog(params) {
    return $http.post($assetsUrl + `/workflow/applyOfCatalog`, params)
  },

  // 资产目录变更
  changeCatalog(data) {
    return $http.post($assetsUrl + `/workflow/applyOfChangeCatalog`, data)
  },
  // 资产目录权限申请
  applyAuthForCatalog(data) {
    return $http.post($assetsUrl + `/workflow/applyAuthOfChangeCatalog`, data)
  },

  // 资产目录历史版本
  getCatalogVersions(data) {
    return $http.get(
      $assetsUrl +
        `/catalog/change/record/${data.pageNum}/${data.pageSize}?catalogId=${data.catalogId}`
    )
  },

  // ======================= 扩展属性 =========================

  // 根据目录空间id和目录层级获取扩展属性
  getUDPsByLevel(params) {
    return $http.get(
      `${$assetsUrl}/config/catalog/${params.structureId}/${params.level}/udps`
    )
  },

  // 根据目录Id获取扩展属性
  getCatalogUDPs(catalogId) {
    return $http.get($assetsUrl + `/catalog/udp/${catalogId}`)
  },

  // 编辑扩展属性值
  editUDPValue(data) {
    return $http.post(`${$assetsUrl}/catalog/udp/addorupdateupdval`, data)
  },

  // 获取目录类型的扩展属性
  getUdps(id) {
    return $http.get(`${$assetsUrl}/config/catalog/udps/${id}`)
  },

  // 添加扩展属性
  addUDPs(data) {
    return $http.post($assetsUrl + '/udp/add', data)
  },

  // ========================== 扩展属性 ===========================

  /// ////////////////////// 添加数据资产 ///////////////////////////
  // 获取目录下已添加过的资产id
  getAddedAssetsIds(data) {
    return $http.post(
      $assetsUrl + `/assets/bound/${data.catalogId}`,
      data.typeList
    )
  },

  // 获取目录下未发布和已下线的资产
  getAssetsByStatus(data) {
    return $http.post($assetsUrl + `/getAssetsByStatus`, data)
  },

  getAllAssetsByStatus(data) {
    // console.log(data)
    return $http.post(
      $assetsUrl +
        `/getAllSubAssetsByCatalogId/${data.catalogId}/${data.structureId}`,
      data.status
    )
  },

  // 获取数据源
  getFromre(data) {
    return $http.post('/assets/metadata/models/fromre/page', data)
  },
  // 获取需要过滤调的数据源
  getFilteredModel(data) {
    return $http.post(`/metadata/models/fromre/filter/page`, data)
  },
  // 获取所有数据源
  getAllFromre() {
    return $http.get($meta + '/metadata/models/fromre/')
  },
  /// //////////////////////// 摘要信息 ////////////////////////////////

  // 获取资产目录摘要信息-上下级等  structureId:结构id id: 资产目录的id（点击树结构时传0）
  getBrowseList(structureId, id) {
    return $http.get($assetsUrl + `/catalog/browse/list/${structureId}/${id}`)
  },
  // 资产浏览：获取当前目录下的目录 id: 资产目录的id, type: 是否发布状态（0-已发布，1-全部）
  getStatisticsInfo(id, isOverview = false) {
    let statusList = []
    if (isOverview) {
      statusList = ['PUBLISHED']
    } else {
      statusList = ['UNPUBLISHED', 'PUBLISHED', 'UNDER_REVIEW', 'OFFLINE']
    }
    return $http.post($assetsUrl + `/catalog/relation`, {
      catalogId: id,
      status: statusList,
    })
  },
  // 根据tableId获取表的主键
  getTableKey(tableId) {
    return $http.get($assetsUrl + `/assets/columns/key/${tableId}`)
  },
  // 数据资产跳转详情时，判断是否可以跳转
  judgeCanToDetail(params) {
    return $http.post(
      $assetsUrl +
        `/assets/skip/${params.id}?assetsType=${params.subAssetsType}`
    )
  },
  // 获取资产目录属性信息
  getAttrInfo(id) {
    return $http.get($assetsUrl + `/catalog/getcatalogpropery?catalogId=${id}`)
  },
  // 获取数据资产编号配置
  getAssetsCodeConfig(catalogId) {
    return $http.get($assetsUrl + `/config/generate/DATA_ASSETS/${catalogId}`)
  },
  // 检查数据资产编号是否重复
  isExsistAssetsCode(data) {
    return $http.post($assetsUrl + `/assets/code/check`, data)
  },
  // 保存数据资产编号
  saveAssetsCode(list) {
    return $http.post($assetsUrl + `/assets/code/modify`, list)
  },
  // 收藏资产目录
  collectCatalog(data) {
    return $http.post(
      $assetsUrl + `/catalog/collect/${data.catalogId}/${data.catalogName}`
    )
  },

  // 取消收藏资产目录
  discollectCatalog(data) {
    return $http.post($assetsUrl + `/catalog/cancel/${data.catalogId}`)
  },

  // 根据目录id获取流程id
  getProcessIdByCatalogId(catalogId) {
    return $http.get(
      $assetsUrl + `/apply/record/${catalogId}?recordType=CATALOG`
    )
  },

  hasUnderReviewAsset(data) {
    return $http.get(
      $assetsUrl + `/assets/exist/unpublishedAssets/${data.catalogId}`
    )
  },
  getDDCAssets(id, type) {
    return $http.get($assetsUrl + `/assets/${id}/${type}`)
  },
  /// ////////////////////  数据资产--通用设置 //////////////////////////

  // 新建资产目录类型
  setAssetCatalog(params) {
    return $http.post(`${$assetsUrl}/config/assets/type`, params)
  },

  // 添加自定义资产目录完成度算法
  setCompleteness(params) {
    return $http.post(`${$assetsUrl}/config/assets/algorithm`, params)
  },
  // 拉取完成度算法
  getCompleteness(catalogTypeId) {
    return $http.get(`${$assetsUrl}/config/catalog/algorithm/${catalogTypeId}`)
  },
  // 获取所有用户
  getAllUser() {
    const url = `/user/usermanagement/users?includeDisabled=${false}`
    return $http.get(url)
  },
  // 获取所有用户 --- 翻页
  getAllUserPage(params) {
    return $http.post(`/user/org/groups/page`, params)
  },
  // 数据资产-知识图谱获取资产id
  getAssetId(params) {
    return $http.get(
      `${$assetsUrl}/${params.getAssetId}/${params.itemId}/${params.assetsType}`
    )
  },
  // 知识图谱判断是否可以跳转
  judgeJump(params) {
    return $http.get(
      $assetsUrl +
        `/graph/${params.catalogId}/${params.assetsId}/${params.assetsType}?catalogStatus=PUBLISHED`
    )
  },

  // 保存按钮
  saveBtn(params1, params2, params3) {
    return axios.all([
      this.setAssetCatalog(params1),
      // this.setCompleteness(params2),
      $http.put($url + '/service/configs/', params3),
    ])
  },
  // 获取所有目录类型
  getDirectoryType(level) {
    return $http.get(`${$assetsUrl}/config/catalog/type/all`)
  },
  // 目录类型详情
  getTypeDet(id) {
    return $http.get(`${$assetsUrl}/config/catalog/single/type/${id}`)
  },
  // 拉取完成度算法下拉框
  getPropertiesList(id) {
    return $http.get(
      `${$assetsUrl}/config/catalog/algorithm/properties?catalogTypeId=${id}`
    )
  },
  // 拉取目录类型的完成度算法
  getAlgorithm(id) {
    return $http.get(`${$assetsUrl}/config/catalog/algorithm/${id}`)
  },
  // 保存新的目录类型
  saveType(params) {
    return $http.post(`${$assetsUrl}/config/catalog/type`, params)
  },
  // 删除目录类型
  delAssetType(id) {
    return $http.delete(`${$assetsUrl}/config/catalog/type/${id}`)
  },
  // 根据目录类型id获取完成度阈值
  getCompletionThresholdByCatalogType(typeId) {
    return $http.get($assetsUrl + `/config/catalog/single/type/${typeId}`)
  },

  // 判断当前目录下的子目录是否有不满足发布基线的子目录
  getUnderThresholdCatalog(data) {
    return $http.get(
      $assetsUrl +
        `/catalog/check/subs/${data.structureId}?path=${data.catalogPath}`
    )
  },

  /** *********************************目录空间设置************************************************/
  // 目录空间排序
  strucOrder(params) {
    return $http.post(`${$assetsUrl}/config/structures/order`, params)
  },
  // 获取所有目录空间
  getStruc(params) {
    return $http.get(
      `${$assetsUrl}/config/structures?openStatus=${params.openStatus}`
    )
  },
  // 添加新的目录空间
  addStructure(params) {
    return $http.post(`${$assetsUrl}/config/structure`, params)
  },
  // 删除目录空间
  delStructure(id) {
    return $http.delete(`${$assetsUrl}/config/structure/${id}`)
  },
  // 修改目录空间状态
  updataStructure(params) {
    // (params.key)
    return $http.post(
      `${$assetsUrl}/config/structure/${params.id}?${params.obj.key}=${params.obj.value}`
    )
  },
  // 根据目录空间id获取目录空间详情
  getStructureById(id) {
    return $http.get(`${$assetsUrl}/config/structure/${id}`)
  },
  /** *********************************目录空间设置完************************************************/
  // 获取顶级审批人
  getTopP() {
    return $http.get(
      `${$url}/service/configs/get_one?name=configurable.assets.approver`
    )
  },

  // 获取完成度算法的属性
  getProperties() {
    return $http.get($assetsUrl + `/config/assets/algorithm/properties`)
  },
  //  权限设置
  permissions(catalogId) {
    return $http.get($assetsUrl + `/auth/${catalogId}`)
  },
  getSubMechanism(bm, withUserNumber = false) {
    // console.log(bm)
    if (!bm) {
      return $http.post(
        `/user/org/organization/getFirstLevelChildren?withUserNumber=${withUserNumber}`
      )
    } else {
      return $http.post(
        `/user/org/organization/getFirstLevelChildren?bm=${bm}&withUserNumber=${withUserNumber}`
      )
    }
  },
  // 查询机构
  mechanism(params = false) {
    // withUserNumber 值为true或者false，如果是false就不会查询人数
    return $http.get(`/user/org/organization/tree?withUserNumber=${params}`)
  },
  // 查询机构人员
  mechanismPeo(params) {
    return $http.post(`/user/usermanagement/user/getUserByBm?bm=${params.bm}`)
  },
  // 添加新的权限
  addNewPermission(params, id) {
    return $http.post(`${$assetsUrl}/auth/${id}`, params)
  },
  // 删除目录权限
  delPermission(params) {
    return $http.post(`${$assetsUrl}/auth/del`, params)
  },
  // 修改共享权限
  upPermission(params) {
    return $http.put(`${$assetsUrl}/auth/${params.id}?type=${params.type}`)
  },
  // 查找角色
  getRole() {
    return $http.post(`/user/usermanagement/group/getGroupBaseInfo`)
  },
  // 查找角色下的人员
  getRolePeo(params) {
    return $http.post(
      `/user/usermanagement/user/getUserByGroupId?groupId=${params.id}`
    )
  },
  // 获取用户组
  getGroups() {
    return $http.get(`/user/org/groups`)
  },
  // 获取用户组人员
  getGroupsPeo(params) {
    return $http.post(
      `/user/usermanagement/user/getUserByOrgVirtualId?orgVirtualId=${params.id}`
    )
  },
  // 搜索人员  -- 模糊查询
  getPersonnel(params) {
    return $http.post(
      `/user/usermanagement/user/getUserByKeyword?keyword=${params.keyword}`
    )
  },

  /// //////////////////////////// 发表评论 //////////////////////////
  // 获取评论列表
  getCommentList(id) {
    return $http.get($assetsUrl + `/comment/list/${id}`)
  },

  // 发表评论
  submitComment(data) {
    return $http.post($assetsUrl + '/comment/comment', data)
  },

  // 发表数据资产评论
  submitAssetComment(data) {
    return $http.post(
      `/base/thread/updateThread?threadId=${data.threadId}`,
      data.message
    )
  },
  // 发表数据资产评分
  submitAssetStar(data) {
    return $http.post(`/base/vote/asset`, data)
  },

  // 删除数据资产评论
  deleteAssetsComment(id) {
    return $http.post(`/base/thread/deleteMessage?messageId=${id}`)
  },

  // 删除评论
  deleteComment(id) {
    return $http.delete($assetsUrl + `/comment/${id}`)
  },

  // 获取未读评论条数
  getUnreadMessageNum(params) {
    if (params.type === 'catalog') {
      return $http.post(
        $assetsUrl +
          `/assets/reply/count?type=${params.type}&structureId=${params.structureId}&objectId=${params.id}&assetId=${params.assetId}`
      )
    } else {
      return $http.post(
        $assetsUrl +
          `/assets/reply/count?type=${params.type}&objectId=${params.objectId}&assetId=${params.assetId}`
      )
    }
  },
  // 清除某资产的所有未读
  setAllReadByAsset(params) {
    if (params.type === 'catalog') {
      return $http.post(
        $assetsUrl +
          `/assets/reply/read?type=${params.type}&structureId=${params.structureId}&objectId=${params.id}&assetId=${params.assetId}`
      )
    } else {
      return $http.post(
        $assetsUrl +
          `/assets/reply/read?type=${params.type}&objectId=${params.objectId}&assetId=${params.assetId}`
      )
    }
  },
  // 导入资产数据
  importAssets() {
    return $http.post($assetsUrl + `/assets/assets/import`)
  },
  // 导出资产数据
  exportAssets() {
    return $http.post($assetsUrl + `/assets/assets/export`)
  },
  /** *********************** dashboard *******************/
  // 查看资产申请趋势
  getAssetApplication(id) {
    return $http.get($assetsUrl + `/dashboard/assets/apply/${id}`)
  },
  // 查看资产发布流程转化
  transformation(id) {
    return $http.get($assetsUrl + `/dashboard/trans/${id}`)
  },
  // 查看资产总量以及各类型资产数量  |  已发布数据资产分布情况
  getTotalAsset(id) {
    return $http.get($assetsUrl + `/dashboard/sum/${id}`)
  },
  // 查看资产总量以及各类型资产数量  |  已发布数据资产分布情况
  getGuanwangTotalAsset() {
    return $http.get($assetsUrl + `/ext/dashboard/all`)
  },
  // 资产安全等级占比
  getSecurityLevel(id) {
    return $http.get($assetsUrl + `/dashboard/access/${id}`)
  },
  // 资产目录数据资产分布
  catalogDataAsset(id) {
    return $http.get($assetsUrl + `/dashboard/distribution/${id}`)
  },
  // 各部门数据资产分布
  departmental(id) {
    return $http.get($assetsUrl + `/dashboard/dept/${id}`)
  },
  // 资产目录概览
  assetCatalogOverview(id) {
    return $http.get($assetsUrl + `/dashboard/overview/${id}`)
  },
  // 质量问题数
  numberOfQuality(id) {
    return $http.get($assetsUrl + `/dashboard/quality/${id}`)
  },
  // 目录top10
  top10(id) {
    return $http.get($assetsUrl + `/dashboard/top/${id}`)
  },
  funnel(id) {
    return $http.get($assetsUrl + `/dashboard/funnel/${id}`)
  },
  // 资产目录发布状态占比统计
  postStatus(id) {
    return $http.get($assetsUrl + `/dashboard/publish/${id}`)
  },
  // 各资产目录质量问题率
  catalogProblem(id) {
    return $http.get($assetsUrl + `/dashboard/quality/type/${id}`)
  },
  /** *********************** dashboard 完*******************/
  /** *********************目录管理权限**************************************/
  // 添加,修改删除权限
  addNewPermissions(params) {
    return $http.post($assetsUrl + `/auth/manage/${params.id}`, params)
  },
  // 获取目录的所有权限
  getPermission(params) {
    return $http.get($assetsUrl + `/auth/list/${params.id}/${params.type}`)
  },
  // 删除权限
  delPremision(id) {
    return $http.post($assetsUrl + `/auth/del/${id}`)
  },
  // 修改
  updatePremision(param) {
    return $http.put(
      $assetsUrl + `/auth/update/${param.id}?authType=${param.authType}`
    )
  },
  // 修改目录公开
  directoryPublic(params) {
    return $http.post(
      $assetsUrl +
        `/catalog/public/read/${params.id}?publicType=${params.publicType}`
    )
  },
  /** *********************目录管理权限完**************************************/
  // 图片上传
  upload(param) {
    return $http.post($assetsUrl + '/config/upload', param)
  },
  // 获取图片
  getImage(id) {
    return $http.get($assetsUrl + '/config/icon/' + id)
  },
  // 获取默认图片
  getDefault(id) {
    return $http.get($assetsUrl + '/config/recover?imageName=' + id)
  },
  // 修改图片
  reviseImage(params) {
    return $http.put(
      $assetsUrl + `/config/catalog/type/icon/${params.id}/${params.iconId}`
    )
  },
  // 是否有权限在只是图谱中跳转
  getStatus(params) {
    if (!params.status)
      return $http.get($assetsUrl + '/catalog/graph/' + params.id)
    return $http.get(
      $assetsUrl + '/catalog/graph/' + params.id + '?status=' + params.status
    )
  },
  // 数据资产编号配置
  updateAssetsCodeConfig(params) {
    return $http.post($assetsUrl + `/config/generate/assets`, params)
  },
  /**
   * =================================  数据超市开始  =====================================
   */
  getStructureIdByCatalogId(id) {
    return $http.get($assetsUrl + `/catalog/${id}`)
  },
  // 目录收藏
  collectCatalogAPI(params) {
    return $http.post(
      $assetsUrl + `/catalog/collect/${params.catalogId}/${params.catalogName}`
    )
  },
  // 取消目录收藏
  cancelCollectCatalogAPI(params) {
    return $http.post($assetsUrl + `/catalog/cancel/${params.catalogId}`)
  },
  // 添加购物车
  addShoppingCartApi(params) {
    return $http.post($assetsUrl + `/shopping/cart/`, params)
  },
  // 根据结构空间获取资产一级目录
  getOneLevelCatalog(params) {
    return $http.post($assetsUrl + `/assets/level/one`, params)
  },
  // 报表详情页--顶部基本信息
  reportBaseDetailApi(id) {
    return $http.get($assetsUrl + `/detail/report/base/${id}`)
  },
  // 报表详情页--中部基本信息
  reportMiddleDetailApi(id) {
    return $http.get($assetsUrl + `/detail/report/detail/${id}`)
  },
  // 报表详情页--底部基本信息
  reportFooterDetailApi(id) {
    return $http.get($assetsUrl + `/detail/report/other/${id}`)
  },
  // 文件详情页--顶部基本信息
  fileBaseDetailApi(id) {
    return $http.get($assetsUrl + `/detail/file/base/${id}`)
  },
  // 文件详情页--中部基本信息
  fileMiddleDetailApi(id) {
    return $http.get($assetsUrl + `/detail/file/detail/${id}`)
  },
  // 各种资产收藏集合
  assetsCollectListApi() {
    return $http.post(`/base/favor/loadAllFav`)
  },
  // 收藏资产
  assetsCollectApi(params) {
    return $http.post(`/base/favor/addToFavorite`, params)
  },
  // 取消收藏资产
  cancelAssetsCollectApi(id) {
    return $http.post(`/base/favor/delete?favId=${id}`)
  },
  // 资产收藏数
  assetsCollectNumApi(params) {
    return $http.post(`/base/favor/count`, params)
  },

  /**
   * =================================  数据超市结尾  =====================================
   */

  /// ////////////// 数据市场  //////////////////////////

  // 首页 - 统计
  getHomeStatistics() {
    return $http.get($assetsUrl + `/dashboard/statistics`)
  },

  // 新闻资讯
  getNews() {
    return $http.get($assetsUrl + `/pa/home/list`)
  },

  // 首页 - 热门目录
  getHotCatalogs() {
    return $http.get($assetsUrl + `/dashboard/top/catalog`)
  },

  // 首页 - 推荐数据
  getSuggestData() {
    return $http.get($assetsUrl + `/dashboard/recommend/data`)
  },

  // 购物车
  getShoppingList() {
    return $http.post($assetsUrl + `/shopping/cart/list`, {})
  },
  // 删除购物车资产
  deleteCartAsset(ids) {
    return $http.delete($assetsUrl + `/shopping/cart/`, { data: ids })
  },
  // 根据购物车id和表id查询表中的字段
  getColumnsByTableId(parmas) {
    return $http.post($assetsUrl + `/shopping/cart/column/list`, parmas)
  },
  toSetCartColumn(params) {
    return $http.post($assetsUrl + `/shopping/cart/edit/list`, params)
  },
  // 购物车 提交审批
  submitShoppingList(data) {
    return $http.post($assetsUrl + `/shopping/cart/application`, data)
  },
  submitApplyInstance(params) {
    return $http.post($assetsUrl + `/shopping/cart/application/now`, params)
  },

  // 数据资产访问埋点
  toVisitAsset(data) {
    return $http.post(
      $assetsUrl +
        `/assets/visit/${data.catalogId}/${data.assetType}/${data.itemId}/${data.assetId}`
    )
  },
  // 获取 表/视图/字段 基本信息
  getObjectBaseInfo(objectId, assetsId) {
    return $http.get($assetsUrl + `/assets/property/${objectId}/${assetsId}`)
  },
  getDomainById(
    para = {
      domainId: '',
    }
  ) {
    return $http.post($metric + `/domains/domain/getDomainById`, para)
  },
  // 获取 表/视图/字段 属性信息（除了扩展属性和标签）
  getObjectAttrInfo(catalogId, objectId) {
    return $http.get($assetsUrl + `/assets/detail/${catalogId}/${objectId}`)
  },
  // 获取质量问题详情
  getQualityDetails(objectId) {
    return $http.get($assetsUrl + `/assets/quality/${objectId}`)
  },
  // 获取 表/视图/字段 扩展属性和标签信息
  getObjectTagsAndExtens(objectId) {
    return $http.get($assetsUrl + `/assets/tree/summary/${objectId}`)
  },
  // 获取标签
  getTagListApi() {
    return $http.get(`/base/tags/tree`)
  },
  // 获取 表/视图 字段信息
  getObjectColumns(data) {
    return $http.post($assetsUrl + `/assets/columns`, data)
  },
  // 获取 表/视图 的采样数据
  getObjectSamples(data) {
    return $http.post($assetsUrl + `/assets/data/sample`, data)
  },

  // 查询 数据表/视图 的血缘数据
  getObjectLineageData(data) {
    return $http.get($assetsUrl + `/assets/lineage/${data.objectId}/left`)
  },
  // 查询 报表 的血缘数据
  reportLineageApi(objectId) {
    return $http.get($assetsUrl + `/assets/report/${objectId}/type`)
  },

  // 获取部门详情
  getOrgDetails(id) {
    return $http.get(`/user/org/organization/${id}`)
  },

  // 根据编码获取部门详情
  getOrgDetailsByBm(bm) {
    return $http.post($assetsUrl + `/assets/org/detail?bm=${bm}`)
  },

  // 根据 id 获取部门详情
  getOrgDetailsById(id) {
    return $http.get(`/user/org/organization/${id}`)
  },

  // 获取用户详情
  getUserDetails(username) {
    return $http.post(
      `/user/usermanagement/user/getUserByUsername?username=${username}`
    )
  },
  // 获取用户详情
  getUserDetailsByUsername(username) {
    return $http.post($assetsUrl + `/assets/user/detail?username=${username}`)
  },

  // 获取系统详情
  getSystemDetails(categoryId) {
    return $http.post(
      `/base/modelCategory/getModelCategoryById?categoryId=${categoryId}`
    )
  },

  // 安全模块是否启动
  haveSecurity() {
    return $http.get($assetsUrl + `/assets/security/needle`)
  },

  // 某资产是否已添加购物车
  hasAddedToShoppingCart(assetId) {
    return $http.get($assetsUrl + `/assets/shop/${assetId}`)
  },

  // 公告信息管理
  // 公告列表
  getNoticeList(data) {
    return $http.get(
      $assetsUrl + `/pa/list?pageNo=${data.pageNo}&pageSize=${data.pageSize}`
    )
  },
  addOrUpdateNotice(data) {
    return $http.post($assetsUrl + `/pa/addorupdate`, data)
  },
  // 删除公告信息
  deleteNotice(id) {
    return $http.delete($assetsUrl + `/pa/${id}`)
  },
  // 发布公告信息
  publishNotice(id) {
    return $http.put($assetsUrl + `/pa/publish/${id}`)
  },
  // 下线公告信息
  offlineNotice(id) {
    return $http.put($assetsUrl + `/pa/unpublish/${id}`)
  },
  // 查看公告详情
  getNoticeDetails(id) {
    return $http.get($assetsUrl + `/pa/${id}`)
  },
  // ==========================同步任务===========================
  // 同步任务列表
  getSyncTaskList(params) {
    return $http.post($assetsUrl + `/sync/bi/task/list`, params)
  },
  // 获取时间模板
  getTimeTemplate() {
    return $http.post(`/job/dateTemplate/list`)
  },
  // 测试BI 连接
  async testBIConnection(params) {
    return Promise.all([
      $http.post($assetsUrl + `/sync/bi/task/bi/catalog`, params),
      $http.post($assetsUrl + `/sync/bi/task/bi/datasource`, params),
    ]).then(res => {
      return res
    })
  },
  // 同步任务 - 获取资产目录空间（已开启）
  syncAssetStructure() {
    return $http.post($assetsUrl + `/sync/bi/task/assets/structure`)
  },
  // 同步任务 - 根据目录id查询子目录（不加权限限制）
  syncGetSubCatalogs(structureId, catalogId) {
    return $http.post(
      $assetsUrl + `/sync/bi/task/assets/${structureId}/${catalogId}`
    )
  },
  // 同步任务 - 根据资产目录id获取所以子目录的id和name
  getAllSubCatalogIds(structureId, catalogId) {
    return $http.post(
      $assetsUrl + `/sync/bi/task/assets/subs/${structureId}/${catalogId}`
    )
  },
  // 添加同步任务
  addSyncTask(params) {
    return $http.post($assetsUrl + `/sync/bi/task/add`, params)
  },
  // 更新同步任务
  updateSyncTask(params) {
    return $http.post($assetsUrl + `/sync/bi/task/modify`, params)
  },
  // 获取同步任务详情
  getSyncTaskDetails(taskId) {
    return $http.get($assetsUrl + `/sync/bi/task/detail/${taskId}`)
  },
  // 测试cron表达式
  testCron(string) {
    return $http.post($assetsUrl + `/sync/bi/task/cron/check?cron=${string}`)
  },
  // 删除同步任务
  deleteSyncTask(taskId) {
    return $http.post($assetsUrl + `/sync/bi/task/delete/${taskId}`)
  },
  canTaskRun(taskId) {
    return $http.post(`/job/main/canExecuteToday?jobId=${taskId}`)
  },
  runTask(taskId, executor) {
    return $http.post(`/job/main/startJob?jobId=${taskId}&executor=${executor}`)
  },
  // enable：true 或 false
  changeTaskEnable(taskId, enable) {
    return $http.get($assetsUrl + `/sync/bi/task/detail/${taskId}/${enable}`)
  },
  searchAssetCatalog(structureId, keyword) {
    return $http.post(
      $assetsUrl +
        `/sync/bi/task/assets/search/${structureId}?keywords=${encodeURIComponent(
          keyword
        )}`
    )
  },
  getMetaModelList(taskId, enable) {
    let url = `${$meta}/mm/getMetaModels`
    return $http.post(url)
  },
  async getMetaModelTypes(taskId, enable) {
    let url = `${$meta}/mm/getAssetMetaElementList`
    let res = null
    try {
      res = await $http.post(url)
      res.data.forEach(item => {
        item.enName = item.name
        item.name = item.chineseName ? item.chineseName : item.fullName
      })
    } catch (e) {
      return e
    }
    return res
  },
}
export default api
