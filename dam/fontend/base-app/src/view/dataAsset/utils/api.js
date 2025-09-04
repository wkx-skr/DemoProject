// get
import HTTP from '@/http/main.js'
import axios from 'axios'
const $http = HTTP.$http
const $url = HTTP.$url
const $assetsUrl = '/assets'
const api = {
  /// ////////////////////// 公共接口 //////////////////////////////////////
  // 获取当前登陆用户的信息
  getUserInfo() {
    return $http.get($url + '/service/userInfo')
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
    return $http.get($assetsUrl + `/assets/${id}/isVerified`)
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
      if (isView) {
        data.range = 'LIST'
      } else {
        data.range = 'BROWSE'
      }
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
    console.log(params)
    return $http.post(
      $assetsUrl + `/catalog/org/${params.catalogId}/${params.bm}`
    )
  },

  // 修改资产目录数据管家
  updateSteward(params) {
    console.log(params)
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
    console.log(data)
    return $http.post(
      $assetsUrl +
        `/getAllSubAssetsByCatalogId/${data.catalogId}/${data.structureId}`,
      data.status
    )
  },

  // 获取数据源
  getFromre(data) {
    return $http.post('/metadata/models/fromre/page', data)
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
  getDDCAssets(id) {
    return $http.get($assetsUrl + `/${id}`)
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
    console.log(bm)
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
  // 删除评论
  deleteComment(id) {
    return $http.delete($assetsUrl + `/comment/${id}`)
  },
  // 导入资产数据
  importAssets() {
    return $http.post($assetsUrl + `/assets/import`)
  },
  // 导出资产数据
  exportAssets() {
    return $http.post($assetsUrl + `/assets/export`)
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
    return $http.get($assetsUrl + '/config/recover/' + id)
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
}
export default api
