import HTTP from '@/http/main.js'
import axios from 'axios'
import { param } from 'jquery'
import { isExportDeclaration } from 'typescript'
const $http = HTTP.$http
const $url = HTTP.$url
const $meta_url = HTTP.$meta_url
const api = {
  //  法规条文
  uploadRegulations(params) {
    return $http.post($url + `/service/datasecurity/regulation/add`, params)
  },
  // 删除数据
  delectRegulation(id) {
    return $http.delete($url + `/service/datasecurity/regulation/${id}`)
  },

  // 获取法规条文
  getRegulation(params) {
    return $http.post($url + `/service/datasecurity/regulation/search`, params)
  },
  // 查看法规详情
  detailRegulation(params) {
    return $http.get(
      $url + `/service/datasecurity/regulation/detail/${params.id}`
    )
  },
  // 预览法规条文
  browseRegulation(params) {
    return $http.get(
      $url + `/service/datasecurity/regulation/browse/${params.id}`,
      {},
      { responseType: 'arraybuffer' }
    )
  },
  // 删除法规条文
  delRegulation(params) {
    return $http.delete($url + `/service/datasecurity/regulation/${params.id}`)
  },
  // 批量删除
  delAryRegulation(params) {
    return $http.post($url + `/service/datasecurity/regulation/`, params)
  },
  // 下载法规条文
  downloadRegulation(params) {
    return $http.post(
      $url + `/service/datasecurity/regulation/download/${params.regulationId}`,
      params
    )
  },

  /** ******************分类结构*****************/
  // 拉取安全的目录结构
  getStructure() {
    return $http.get($url + `/service/datasecurity/structure/list`)
  },
  // 同步目录  拉取资产目录
  getStructureDdc() {
    return $http.get(`${$url}/service/datasecurity/structure/list/ddc`)
  },
  // 保存分类结构
  saveStructure(params) {
    return $http.post($url + `/service/datasecurity/structure/save/`, params)
  },
  // // 获取目录类型的属性
  // getExtended(params) {
  //   return $http.get(
  //     $url + `/service/datasecurity/structure/catalog/udps/${params.id}`
  //   )
  // },
  // // 获取目录类型的完成度
  // getalgorithm(params) {
  //   return $http.get(
  //     $url + `/service/datasecurity/structure/algorithm/${params.id}`
  //   )
  // },
  // 获取默认图片
  getDefault(id) {
    return $http.get($url + '/service/ddc/config/recover/' + id)
  },
  // 图片上传
  upload(param) {
    return $http.post($url + '/service/ddc/config/upload', param)
  },
  // 修改图片
  reviseImage(params) {
    return $http.put(
      $url +
        `/service/ddc/config/catalog/type/icon/${params.id}/${params.iconId}`
    )
  },
  /** ******************智能分类分级*****************/
  // 获取识别任务
  getIdentifyTask(params) {
    return $http.get(
      $url +
        `/service/discern/scopes?search=${params.keyword}&current_page=${params.page}&page_size=${params.size}`
    )
  },

  /** ***************************  数据分级  ***************************************/
  // 获取分级信息
  getLevelData() {
    return $http.get($url + `/service/datasecurity/level/securitylist`)
  },
  // 某分级下的资产列表
  getAssetsByLevel(params) {
    return $http.post($url + `/service/datasecurity/level/queryassets`, params)
  },
  // 新增安全等级
  addNewLevel(params) {
    console.log(params)
    return $http.post($url + `/service/datasecurity/level/addorupdate`, params)
  },
  // 修改安全等级
  updateLevel(params) {
    return $http.post($url + `/service/datasecurity/level/addorupdate`, params)
  },
  // 删除安全等级
  deleteLevel(id) {
    return $http.post($url + `/service/datasecurity/level/del?tagId=${id}`)
  },
  // 根据关键词搜索等级
  searchLevel(keyword) {
    return $http.get(
      $url +
        `/service/datasecurity/level/securitylist/checkname?name=${keyword}`
    )
  },
  // 获取等级详情
  getLevelDetails(id) {
    return $http.get($url + `/service/datasecurity/level/securitydetails/${id}`)
  },

  /** ***************************  信息项  ***************************************/
  // 导出分类信息项
  exportItems(data) {
    return $http.post(
      $url + `/service/datasecurity/sensitive/export/standard`,
      data
    )
  },
  // 获取信息项自动编码生成配置
  getInformationItemCodeConfig() {
    return $http.get(
      $url + `/service/datasecurity/sensitive/classify/generate/`
    )
  },

  // 更改信息项编码自动生成配置
  updateInformationItemCodeConfig(params) {
    return $http.post(
      $url + `/service/datasecurity/sensitive/classify/generate/${params.id}`,
      params
    )
  },
  // 获取信息项目录
  getItemCatalog(id) {
    return $http.get($url + `/service/datasecurity/sensitive/catalog/${id}`)
  },
  // 新建信息项目录
  addNewItemCatalog(params) {
    return $http.post(
      $url + `/service/datasecurity/sensitive/classify/add`,
      params
    )
  },
  // 修改信息项目录
  updateItemCatalog(params) {
    return $http.put(
      $url + `/service/datasecurity/sensitive/classify/modify`,
      params
    )
  },
  // 删除信息项目录
  deleteItemCatalog(id) {
    return $http.delete($url + `/service/datasecurity/sensitive/classify/${id}`)
  },

  // 搜索信息项目录
  searchItemCatalog(keyword) {
    return $http.get(
      $url +
        `/service/datasecurity/sensitive/search/catalog?keywords=${keyword}`
    )
  },

  // 获取信息项的扩展属性
  getItemUdps() {
    return $http.get($url + `/service/datasecurity/sensitive/classify/udps`)
  },

  // 修改信息项的扩展属性
  updateItemUdps(params) {
    return $http.post(
      $url + `/service/datasecurity/sensitive/classify/udps`,
      params
    )
  },
  // 获取某信息项扩展属性及其值
  getItemUdpsById(id) {
    return $http.get(
      $url + `/service/datasecurity/sensitive/classify/udp/${id}`
    )
  },

  // 获取某一信息项的所有属性（基础属性 + 扩展属性）
  getItemAttrs(id) {
    return $http.get(
      $url + `/service/datasecurity/sensitive/classify/sensitive/get/${id}`
    )
  },

  // 验证是否已存在信息项目录名称
  isExistCatalogName(data) {
    return $http.get(
      $url +
        `/service/datasecurity/sensitive/check/catalog?parentId=${
          data.parentId
        }&name=${encodeURIComponent(data.name)}${
          data.id ? '&id=' + data.id : ''
        }`
    )
  },

  // 验证是否存在编码
  isExistCode(code) {
    return $http.post(
      $url + `/service/datasecurity/sensitive/classify/code/check`,
      {
        stdCode: code,
      }
    )
  },

  // 新建或编辑信息项
  addOrUpdateItem(params) {
    return $http.post(
      $url + `/service/datasecurity/sensitive/classify/sensitive/add`,
      params
    )
  },
  // 删除信息项
  deleteItem(ids) {
    return $http.post(
      $url + `/service/datasecurity/sensitive/classify/sensitive/del`,
      ids
    )
  },
  // 获取信息项列表
  getItemData(params) {
    return $http.post(
      $url +
        `/service/datasecurity/sensitive/classify/list/${params.catalogId}`,
      params.data
    )
  },
  /** *********************** 评审与发布 ********************** **/
  // 评审与发布搜索
  getPublishassetsList(params) {
    return $http.post(
      $url + `/service/datasecurity/check/search/publishassets`,
      params
    )
  },
  // 评审发布  通过或者驳回
  judgesssets(params) {
    return $http.post($url + `/service/datasecurity/check/judgesssets`, params)
  },
  /** ***************************  协同分类分级  ***************************************/
  // 数据资产导出（全部）
  exportAllAssets(params) {
    return $http.post($url + `/service/datasecurity/check/export`, params)
  },
  exportSelectedAssets(params, status) {
    return $http.post(
      $url + `/service/datasecurity/check/export/${status}`,
      params
    )
  },
  // 业务系统
  getBusinessSystemList() {
    return $http.get($url + `/service/datasecurity/check/searchitem/business`)
  },
  // 数据源
  getDataSourceList(id) {
    return $http.get(
      $url +
        `/service/datasecurity/check/searchitem/datasource?categoryId=${id}`
    )
  },
  // schema
  getSchemaList(id) {
    return $http.get(
      $url + `/service/datasecurity/check/searchitem/schema?dataSourceId=${id}`
    )
  },
  // 表检索
  getTableList(params) {
    return $http.post($url + `/service/entities/searchMetadata`, params)
  },
  // 获取分类目录树一级
  getClassificationInitData() {
    return $http.get($url + `/service/security/dept/`)
  },
  // 获取分类目录树子级
  getSubClassificationData(parentId) {
    return $http.get($url + `/service/security/dept/`)
  },
  // 是否需要重新扫描
  notScanAgain(modelId) {
    return $http.get($url + `/service/datasecurity/check/${modelId}/version/`)
  },
  scanByModelId(modelId) {
    return $http.get($url + `/service/datasecurity/check/scan/${modelId}`)
  },
  // 扫描数据项
  scanData(id) {
    return $http.post(
      $url + `/service/security/standard/element/scan?typeId=` + id
    )
  },
  // 获取资产盘点内容
  getAssetsData(params) {
    return $http.post($url + `/service/datasecurity/check/search`, params)
  },
  // 添加到待确认
  bindClassification(params) {
    return $http.post(
      $url + `/service/datasecurity/check/add/catalog/${params.catalogId}`,
      params.ids
    )
  },
  // 修改安全等级
  updateAssetSecurity(params) {
    return $http.post(
      $url + `/service/datasecurity/check/update/level/${params.securityId}`,
      params.ids
    )
  },
  // 修改资产梳理状态
  updateAssetStatus(params) {
    return $http.post(
      $url + `/service/datasecurity/check/update/asset/${params.status}`,
      params.ids
    )
  },
  // 梳理进度
  getSpeed(params) {
    return $http.post($url + `/service/datasecurity/check/progress`, params)
  },
  // 状态统计
  getStatistics(params) {
    return $http.post($url + `/service/datasecurity/check/count`, params)
  },
  // 下载导入模板
  getImportTemplate() {
    return $http.get($url + `/service/datasecurity/check/download`)
  },
  /** ***************************  数据分类  ***************************************/
  // 导出安全分类
  exportSecurityClassification() {
    return $http.get($url + `/service/datasecurity/catalog/export`)
  },
  // 获取数据分类的树
  getClassifyTree(id) {
    return $http.get($url + `/service/datasecurity/catalog/classify/${id}`)
  },
  // 新建安全分类目录
  newClassifyCatalog(params) {
    return $http.post(
      $url + `/service/datasecurity/catalog/classify/add`,
      params
    )
  },
  // 安全分类绑定信息项获取列表
  getBindInfoItemList(sensitiveId, securityId, params) {
    return $http.post(
      $url +
        `/service/datasecurity/sensitive/classify/list/${sensitiveId}/${securityId}`,
      params
    )
  },
  // 获取详情
  getClassifyDetail(id) {
    return $http.post(
      $url + `/service/datasecurity/catalog/classify/detail/${id}`
    )
  },
  // 修改安全分类目录
  modifyClassifyCatalog(params) {
    return $http.put(
      $url + `/service/datasecurity/catalog/classify/modify`,
      params
    )
  },
  // 删除安全分类目录
  delClassifyCatalog(id) {
    return $http.delete($url + `/service/datasecurity/catalog/classify/${id}`)
  },
  // 获取敏感信息列表
  getInfoItemList(id, params) {
    return $http.post(
      $url + `/service/datasecurity/catalog/sensitive/${id}`,
      params
    )
  },
  // 获取敏感信息项
  getInfoItemDetail(id, params) {
    return $http.post(
      $url + `/service/datasecurity/catalog/sensitive/object/${id}`,
      params
    )
  },
  // 绑定分类信息项
  bindInfoItem(params) {
    return $http.post(
      $url + `/service/datasecurity/catalog/bind/sensitive/object/${params.id}`,
      params.data
    )
  },
  // 取消绑定分类信息项
  cancelBindInfoItem(params) {
    return $http.post(
      $url + `/service/datasecurity/catalog/unBind/sensitive/object`,
      params.data
    )
  },
  // 数据分类左侧目录树检索功能
  classifySearch(keywords) {
    return $http.get(
      $url +
        `/service/datasecurity/catalog/search?keywords=${encodeURI(keywords)}`
    )
  },

  /** ***************************  智能分类分级  ***************************************/
  // 算法导出
  exportSelectedAlgorithm(data) {
    return $http.post(
      $url + `/service/datasecurity/algorithm/export/selected`,
      data
    )
  },
  exportAllAlgorithm(params) {
    return $http.post($url + `/service/datasecurity/algorithm/export`, params)
  },
  // 识别规则导出
  exportRules() {
    return $http.post($url + `/service/datasecurity/rule/export`)
  },
  // 新建识别规则目录
  newRuleCatalog(params) {
    return $http.post($url + `/service/categories/`, params)
  },
  // 修改识别规则目录
  modifyRuleCatalog(id, params) {
    return $http.put($url + `/service/categories/${id}`, params)
  },
  // 获取识别规则的目录树
  getRuleTree() {
    return $http.get($url + `/service/categories/?type=DISCERN_RULE`)
  },
  // 删除识别规则目录
  delRule(id) {
    return $http.delete($url + `/service/datasecurity/rule/catalog/${id}`)
  },
  // 获取识别规则列表
  getRuleList(params) {
    return $http.post($url + `/service/datasecurity/rule/get`, params)
  },
  // 获取识别规则列表(过滤掉没有绑定信息项的)
  getFilterRuleList(params) {
    return $http.post($url + `/service/datasecurity/rule/filter`, params)
  },
  // 获取识别规则详情
  getRuleDetail(id) {
    return $http.get($url + `/service/datasecurity/rule/get/${id}`)
  },
  // 新建识别规则
  newRule(params) {
    return $http.put($url + `/service/datasecurity/rule/add`, params)
  },
  // 获取新建识别规则的自定义属性
  customAttr(id) {
    return $http.get($url + `/service/entities/udps/${id}`)
  },
  // 修改识别规则
  modifyRule(params) {
    return $http.post($url + `/service/datasecurity/rule/update`, params)
  },
  // 编辑规则或算法时，判断是否有任务正在运行
  judgeTaskRun(params) {
    return $http.post(
      $url + `/service/datasecurity/rule/to/update?${params.type}=${params.id}`
    )
  },
  // 编辑规则时，判断是否被任务引用
  judgeRule(id) {
    return $http.get($url + `/service/datasecurity/rule/toUpdate/${id}`)
  },
  // 删除识别规则
  delRuleList(params) {
    return $http.post($url + `/service/datasecurity/rule/delete`, params)
  },
  // 测试识别规则
  testRule(params) {
    return $http.put($url + `/service/datasecurity/rule/test`, params)
  },
  // 获取识别算法列表
  getAlgorithmList(params) {
    return $http.post($url + `/service/datasecurity/algorithm/get`, params)
  },
  // 获取识别算法详情
  getAlgorithmDetail(id) {
    return $http.get($url + `/service/datasecurity/algorithm/get/${id}`)
  },
  // 新建识别算法
  newAlgorithm(params) {
    return $http.put($url + `/service/datasecurity/algorithm/add`, params)
  },
  // 修改识别算法
  modifyAlgorithm(params) {
    return $http.post($url + `/service/datasecurity/algorithm/update`, params)
  },
  // 编辑算法时，判断是否被引用
  judgeAlgorithm(id) {
    return $http.get($url + `/service/datasecurity/algorithm/toUpdate/${id}`)
  },
  // 删除识别算法
  delAlgorithm(params) {
    return $http.post($url + `/service/datasecurity/algorithm/delete`, params)
  },
  // 测试算法
  testAlgorithm(params) {
    return $http.post($url + `/service/datasecurity/algorithm/test`, params)
  },
  // 机器学习算法-牛刀小试
  machineSearch(keyword) {
    return $http.get(
      $url + `/service/datasecurity/ml/mlcalresult?seq=${keyword}`
    )
  },
  // 机器学习算法-机器学习服务探针，判断机器学习服务是否启动
  machineEnable() {
    return $http.get($url + `/service/datasecurity/ml/enable`)
  },
  // 机器学习算法-词汇量
  machineVocabulary() {
    return $http.get($url + `/service/datasecurity/ml/getwordnumber`)
  },
  // 添加识别任务
  newTask(params) {
    return $http.put($url + `/service/datasecurity/task/add`, params)
  },
  // 修改识别任务
  modifyTask(params) {
    return $http.post($url + `/service/datasecurity/task/update`, params)
  },
  // 添加一般识别规则时，判断规则是否关联信息项
  judgeRuleAndItem(params) {
    return $http.post($url + `/service/datasecurity/rule/check`, params)
  },
  // 校验cron语句
  checkCron(params) {
    return $http.post($url + `/service/datasecurity/task/cron`, params)
  },
  // 获取识别任务列表
  getTaskList(params) {
    return $http.get(
      $url +
        `/service/datasecurity/task/get?searchStr=${params.searchStr}&currentPage=${params.currentPage}&pageSize=${params.pageSize}&orderBy=${params.orderBy}&sort=${params.sort}`
    )
  },
  // 获取识别任务详情
  getTaskDetail(id) {
    return $http.get($url + `/service/datasecurity/task/${id}`)
  },
  // 删除识别任务
  delTaskList(id) {
    return $http.delete($url + `/service/datasecurity/task/${id}`)
  },
  // 复制识别任务
  copyTask(params) {
    return $http.post($url + `/service/datasecurity/task/copy`, params)
  },
  // 判断任务是否在时间模板
  judgeTimeTemplate(id) {
    return $http.post(
      $url + `/service/datablau_jobs/canExecuteToday?jobId=${id}`
    )
  },
  // 停止，启动识别任务
  enabledTask(id, enabled) {
    return $http.get($url + `/service/datasecurity/task/${id}/${enabled}`)
  },
  // 获取识别结果列表
  getTaskResult(params) {
    return $http.post($url + `/service/datasecurity/result/get`, params)
  },
  // 处理识别结果
  handleTaskResult(params) {
    return $http.post($url + `/service/datasecurity/result/handle`, params)
  },
  // 识别结果页-获取安全分类详情
  getCatalogDetail(id) {
    return $http.get($url + `/service/datasecurity/result/catalog/${id}`)
  },
  // 识别结果页-获取表详情
  getTableDetail(id) {
    return $http.get($url + `/service/datasecurity/result/table/${id}`)
  },
  /** ********************************   策略   ***************************************/
  // 获取管控策略
  getControl() {
    return $http.get($url + `/service/security/policy/control/`)
  },
  // 安全策略列表
  getControlList(params) {
    return $http.post($url + `/service/security/policy/list`, params)
  },
  // 获取数据分类
  getCatalogList(params) {
    return $http.get($url + `/service/catalogs/`)
  },
  // 安全等级
  getAuthLevel(params) {
    return $http.get($url + `/service/tags/auth`)
  },
  // 新建安全策略
  addPolicy(params) {
    return $http.post($url + `/service/security/policy/`, params)
  },
  // 删除安全策略
  delPolicy(id) {
    return $http.post($url + `/service/security/policy/delete`, id)
  },
  // /security/policy/rules/
  // 删除策略规则
  delRules(params) {
    return $http.post($url + `/service/security/policy/rules/delete`, params)
  },
  // 策略规则列表
  rulesList(params) {
    return $http.post(
      $url + `/service/security/policy/rules/getSecurityPolicyRules`,
      params
    )
  },
  // 获取系统所有用户
  getAllUserPage(params) {
    return $http.post(`${$url}/service/org/groups/page`, params)
  },
  // 获取系统下所有用户组
  getGroups() {
    return $http.get(`/user/org/groups`)
  },
  // 查询系统下所有机构
  mechanism(params) {
    // withUserNumber 值为true或者false，如果是false就不会查询人数
    return $http.get(`/user/org/organization/tree?withUserNumber=true`)
  },
  /* ***********  ***********  dashboard ***********  *********** */
  /* 数据资产分级概览 */
  getClassification() {
    return $http.get(
      `${$url}/service/datasecurity/dashboard/assetClassification`
    )
  },
  // 资产分类分级概览
  getDataAsset() {
    return $http.get(
      `${$url}/service/datasecurity/dashboard/assetClassification/summary`
    )
  },
  // 数据资产分级情况  按系统统计
  getSystemAsset() {
    return $http.get(
      `${$url}/service/datasecurity/dashboard/businessSystem/summary`
    )
  },
  // 数据资产分级情况  按部门统计  dashborad
  getbusinessAsset() {
    return $http.get(
      `${$url}/service/datasecurity/dashboard/businessUnit/summary`
    )
  },
  // 获取数据源
  getFromre(data) {
    return $http.post($meta_url + '/service/models/fromre/page', data)
  },

  /// ////////////////////// 访控策略列表页 和 目录树 ///////////////////////////////////////
  // 获取访控策略列表
  getStrategyList(data) {
    return $http.post(
      $url +
        `/service/accessStrategy/get?strategyName=${encodeURIComponent(
          data.strategyName
        )}&catalogId=${data.catalogId}&currentPage=${
          data.currentPage
        }&pageSize=${data.pageSize}&sort=${data.sort}`
    )
  },
  // 获取访控策略目录树
  getStrategyCatalog() {
    return $http.post(
      $url + '/service/accessStrategy/catalog/tree?type=ACCESS_CONTROL'
    )
  },
  // 删除访控策略目录节点
  deleteStrategyCatalog(id, type) {
    // ACCESS_CONTROL 访问策略目录
    // MASK_RULE 脱敏规则规则
    return $http.post(
      $url + `/service/accessStrategy/catalog/delete/${id}/${type}`
    )
  },
  // 新增访控策略目录节点
  addStrategyCatalog(data) {
    return $http.post($url + `/service/accessStrategy/catalog/add`, data)
  },
  // 策略目录树节点是否重名
  checkStrategyCatalogName(data) {
    return $http.post(
      $url +
        `/service/accessStrategy/catalog/checkName?catalogName=${data.name}&catalogId=${data.id}&parentId=${data.parentId}`
    )
  },
  // 编辑策略目录树节点
  modifyStrategyCatalog(data) {
    return $http.post($url + `/service/accessStrategy/catalog/modify`, data)
  },

  // 删除访控策略(批量)
  deleteStrategyData(data) {
    return $http.post($url + `/service/accessStrategy/batch/delete`, data)
  },

  // 获取访问策略基本信息
  getStrategyBaseDetails(strategyId) {
    return $http.post($url + `/service/accessStrategy/get/basic/${strategyId}`)
  },
  // 获取访问策略 访问者 配置信息
  getStrategyVisitorDetails(data) {
    return $http.post(
      $url +
        `/service/accessStrategy/get/visitor/${data.strategyId}?visitorType=${
          data.visitorType
        }&query=${encodeURIComponent(data.keyword)}&currentPage=${
          data.currentPage
        }&pageSize=${data.pageSize}&sort=${data.sort}`
    )
  },

  // 获取访问策略 访问数据 配置信息
  getStrategyObjectDetails(data) {
    return $http.post(
      $url +
        `/service/accessStrategy/get/object/${data.strategyId}?currentPage=${data.currentPage}&pageSize=${data.pageSize}&sort=${data.sort}`
    )
  },

  // 新增数据安全访问策略
  addStrategy(params) {
    return $http.post($url + `/service/accessStrategy/add`, params)
  },
  // 新增或者修改行级访问策略
  rowlevelPolicy(params) {
    return $http.post($url + `/service/accessStrategy/row/add`, params)
  },
  // 查询字段
  //  service/entities/5112/columns
  getColumns(id) {
    return $http.post($url + `/service/entities/${id}/columns`)
  },
  // 行级访问策略详情
  rowPolicyDetail(param) {
    return $http.get(
      `${$url}/service/accessStrategy/row/get/${param.id}/${param.scopeType}`
    )
  },
  // 获取数据安全访问策略详情
  getstrategyDetail(id) {
    return $http.post(`${$url}/service/accessStrategy/get/modify/${id}`)
  },
  // 根据指定的表id列表获取字段信息
  getFieldFromId(params) {
    return $http.post(`${$url}/service/entities/columns`, params)
  },
  // 获取数据安全访问策略访问者列表
  getVisitorList(param) {
    return $http.post(
      `${$url}/service/accessStrategy/get/all/visitor/${param.controlId}`,
      param.json
    )
  },
  // 获取数据安全访问策略访问数据列表 - 修改页
  getAccessDataList(param) {
    return $http.post(
      `${$url}/service/accessStrategy/get/${param.typeId}/${param.controlId}`,
      param.json
    )
  },
  // 修改数据安全访问策略
  // /accessStrategy/modify
  modifyingPolicy(param) {
    return $http.post(`${$url}/service/accessStrategy/modify`, param)
  },
  /**
   * =================================  脱敏策略相关接口  =====================================
   */
  // 脱敏策略搜索元数据
  getMetaData(params) {
    return $http.post(
      `${$url}/service/accessStrategy/mask/searchMetadata`,
      // `${$url}/service/entities/searchMetadata`,
      params
    )
  },
  // 获取脱敏策略目录树
  getDesensitizeTree() {
    return $http.post(
      `${$url}/service/accessStrategy/catalog/tree/?type=MASK_RULE`
    )
  },
  // 获取脱敏策略规则
  getMaskingRules(params) {
    return $http.get(
      `${$url}/service/datamasking/page?search=${params.keyword}&current_page=${params.page}&page_size=${params.size}&ruleInfoCatalog=${params.ruleInfoCatalog}&order_by=${params.order_by}`
    )
  },
  // 根据表格id获取表格下的数据项
  getcolumns(id) {
    return $http.get(`${$url}/service/entities/${id}/columns?keyword=`)
  },
  // 新增表级脱敏
  newTableMask(params) {
    return $http.put(`${$url}/service/accessStrategy/mask/table`, params)
  },
  // 修改表级脱敏
  modifyTableMask(params) {
    return $http.post(
      `${$url}/service/accessStrategy/mask/table/modify`,
      params
    )
  },
  // 根据资产id获取资产相关详情
  getAssetInfo(params) {
    return $http.get(`${$url}/service/accessStrategy/prop/${params.assetId}`)
  },
  // 获取表级脱敏策略详情
  getTableMaskDetail(params) {
    return $http.post(`${$url}/service/accessStrategy/mask/table`, params)
  },
  // 获取表级脱敏策略适用范围
  getTableScopedMaskDetail(params) {
    return $http.post(`${$url}/service/accessStrategy/mask/table/scope`, params)
  },
  // 新增字段脱敏
  newColumnMask(params) {
    return $http.put(`${$url}/service/accessStrategy/mask/column`, params)
  },
  // 修改字段脱敏
  modifyColumnMask(params) {
    return $http.post(
      `${$url}/service/accessStrategy/mask/column/modify`,
      params
    )
  },
  // 获取字段脱敏策略详情
  getColumnMaskDetail(params) {
    return $http.post(`${$url}/service/accessStrategy/mask/column`, params)
  },
  // 删除脱敏策略
  delDesensitizeStrategy(params) {
    return $http.delete(`${$url}/service/accessStrategy/mask`, params)
  },
  // 数据安全防控策略详情基本信息
  accessStrategyBaseInfo(id) {
    return $http.post(`${$url}/service/accessStrategy/get/basic/${id}`)
  },
  /**
   * =================================  脱敏规则管理  =====================================
   */
  // 新建脱敏规则
  newDesensitizeRule(params) {
    return $http.put(`${$url}/service/mask/rule/add`, params)
  },
  // 脱敏规则列表
  desensitizeRuleList(params) {
    return $http.post(`${$url}/service/mask/rule/list`, params)
  },
  // 修改脱敏规则
  modifyDesensitizeRule(params) {
    return $http.post(`${$url}/service/mask/rule/modify`, params)
  },
  // 删除脱敏规则
  delDesensitizeRule(data) {
    return $http.post(`${$url}/service/mask/rule/delete`, data)
  },
}

export default api
