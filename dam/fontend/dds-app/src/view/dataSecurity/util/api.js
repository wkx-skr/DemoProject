import HTTP from '@/http/main.js'
import axios from 'axios'
import { param } from 'jquery'
import { isExportDeclaration } from 'typescript'
const $http = HTTP.$http
let $url = HTTP.$url
$url = ''
const api = {
  //  法规条文
  uploadRegulations(params) {
    return $http.post(
      $url + `/datasecurity/datasecurity/regulation/add`,
      params
    )
  },
  // 删除数据
  delectRegulation(id) {
    return $http.delete($url + `/datasecurity/datasecurity/regulation/${id}`)
  },

  // 获取法规条文
  getRegulation(params) {
    return $http.post(
      $url + `/datasecurity/datasecurity/regulation/search`,
      params
    )
  },
  // 查看法规详情
  detailRegulation(params) {
    return $http.get(
      $url + `/datasecurity/datasecurity/regulation/detail/${params.id}`
    )
  },
  // 预览法规条文
  browseRegulation(params) {
    return $http.get(
      $url + `/datasecurity/datasecurity/regulation/browse/${params.id}`,
      {},
      { responseType: 'arraybuffer' }
    )
  },
  // 删除法规条文
  delRegulation(params) {
    return $http.delete(
      $url + `/datasecurity/datasecurity/regulation/${params.id}`
    )
  },
  // 批量删除
  delAryRegulation(params) {
    return $http.post($url + `/datasecurity/datasecurity/regulation/`, params)
  },
  // 下载法规条文
  downloadRegulation(params) {
    return $http.post(
      $url +
        `/datasecurity/datasecurity/regulation/download/${params.regulationId}`,
      params
    )
  },

  /** ******************分类结构*****************/
  // 拉取安全的目录结构
  getStructure() {
    return $http.get($url + `/datasecurity/datasecurity/structure/list`)
  },
  // 同步目录  拉取资产目录 （已开启的目录空间）
  getStructureDdc() {
    return $http.get(`${$url}/datasecurity/datasecurity/structure/list/ddc`)
  },
  // 保存分类结构
  saveStructure(params) {
    return $http.post(
      $url + `/datasecurity/datasecurity/structure/save/`,
      params
    )
  },
  // // 获取目录类型的属性
  // getExtended(params) {
  //   return $http.get(
  //     $url + `/datasecurity/datasecurity/structure/catalog/udps/${params.id}`
  //   )
  // },
  // // 获取目录类型的完成度
  // getalgorithm(params) {
  //   return $http.get(
  //     $url + `/datasecurity/datasecurity/structure/algorithm/${params.id}`
  //   )
  // },
  // 重置图片
  getDefault(id) {
    return $http.get($url + '/datasecurity/datasecurity/catalog/recover/' + id)
  },
  // 图片上传
  upload(param) {
    return $http.post(
      $url + '/datasecurity/datasecurity/catalog/upload/icon',
      param
    )
  },
  // 修改图片
  reviseImage(params) {
    return $http.put(
      $url +
        `/datasecurity/datasecurity/catalog/type/icon/${params.id}/${params.iconId}`
    )
  },
  /** ******************智能分类分级*****************/
  // 获取识别任务
  getIdentifyTask(params) {
    return $http.get(
      $url +
        `/datasecurity/discern/scopes?search=${params.keyword}&current_page=${params.page}&page_size=${params.size}`
    )
  },

  /** ***************************  数据分级  ***************************************/
  // 获取分级信息
  getLevelData() {
    return $http.get($url + `/datasecurity/datasecurity/level/securitylist`)
  },
  // 某分级下的资产列表
  getAssetsByLevel(params) {
    return $http.post(
      $url + `/datasecurity/datasecurity/level/queryassets`,
      params
    )
  },
  // 新增安全等级
  addNewLevel(params) {
    console.log(params)
    return $http.post(
      $url + `/datasecurity/datasecurity/level/addorupdate`,
      params
    )
  },
  // 修改安全等级
  updateLevel(params) {
    return $http.post(
      $url + `/datasecurity/datasecurity/level/addorupdate`,
      params
    )
  },
  // 删除安全等级
  deleteLevel(id) {
    return $http.post($url + `/datasecurity/datasecurity/level/del?tagId=${id}`)
  },
  // 根据关键词搜索等级
  searchLevel(keyword) {
    return $http.get(
      $url +
        `/datasecurity/datasecurity/level/securitylist/checkname?name=${keyword}`
    )
  },
  // 获取等级详情
  getLevelDetails(id) {
    return $http.get(
      $url + `/datasecurity/datasecurity/level/securitydetails/${id}`
    )
  },

  /** ***************************  信息项  ***************************************/
  // 导出分类信息项
  exportItems(data) {
    return $http.post(
      $url + `/datasecurity/datasecurity/sensitive/export/standard`,
      data
    )
  },
  // 获取信息项自动编码生成配置
  getInformationItemCodeConfig() {
    return $http.get(
      $url + `/datasecurity/datasecurity/sensitive/classify/generate/`
    )
  },
  // ranger 同步配置
  getRangerSyncConfig() {
    return $http.post($url + `/datasecurity/ranger/sync/all`)
  },

  // 更新 ranger 配置
  updateRangerSycnStatus(status) {
    return $http.post($url + `/datasecurity/ranger/sync/modify/${status}`)
  },

  // 新增 / 修改 ranger 配置中的数据源
  addRangerDataSource(data) {
    return $http.post($url + `/datasecurity/ranger/sync/add`, data)
  },
  // 删除 ranger 配置中的数据源
  deleteRangerDataSource(syncId) {
    return $http.post($url + `/datasecurity/ranger/sync/delete/${syncId}`)
  },

  // 通过类型获取数据源
  getSourceByType(type) {
    return $http.post($url + `/datasecurity/metadata/type?type=${type}`)
  },

  // 更改信息项编码自动生成配置
  updateInformationItemCodeConfig(params) {
    return $http.post(
      $url +
        `/datasecurity/datasecurity/sensitive/classify/generate/${params.id}`,
      params
    )
  },
  // 获取信息项目录
  getItemCatalog(id) {
    return $http.get(
      $url + `/datasecurity/datasecurity/sensitive/catalog/${id}`
    )
  },
  // 新建信息项目录
  addNewItemCatalog(params) {
    return $http.post(
      $url + `/datasecurity/datasecurity/sensitive/classify/add`,
      params
    )
  },
  // 修改信息项目录
  updateItemCatalog(params) {
    return $http.put(
      $url + `/datasecurity/datasecurity/sensitive/classify/modify`,
      params
    )
  },
  // 删除信息项目录
  deleteItemCatalog(id) {
    return $http.delete(
      $url + `/datasecurity/datasecurity/sensitive/classify/${id}`
    )
  },

  // 搜索信息项目录
  searchItemCatalog(keyword) {
    return $http.get(
      $url +
        `/datasecurity/datasecurity/sensitive/search/catalog?keywords=${keyword}`
    )
  },

  // 获取信息项的扩展属性
  getItemUdps() {
    return $http.get(
      $url + `/datasecurity/datasecurity/sensitive/classify/udps`
    )
  },

  // 修改信息项的扩展属性
  updateItemUdps(params) {
    return $http.post(
      $url + `/datasecurity/datasecurity/sensitive/classify/udps`,
      params
    )
  },
  // 获取某信息项扩展属性及其值
  getItemUdpsById(id, record = 0) {
    // record为1时，为查看记录日志
    return $http.get(
      $url + `/datasecurity/datasecurity/sensitive/classify/udp/${id}/${record}`
    )
  },

  // 获取某一信息项的所有属性（基础属性 + 扩展属性）
  getItemAttrs(id) {
    return $http.get(
      $url + `/datasecurity/datasecurity/sensitive/classify/sensitive/get/${id}`
    )
  },

  // 验证是否已存在信息项目录名称
  isExistCatalogName(data) {
    return $http.get(
      $url +
        `/datasecurity/datasecurity/sensitive/check/catalog?parentId=${
          data.parentId
        }&name=${encodeURIComponent(data.name)}${
          data.id ? '&id=' + data.id : ''
        }`
    )
  },

  // 验证是否存在编码
  isExistCode(code) {
    return $http.post(
      $url + `/datasecurity/datasecurity/sensitive/classify/code/check`,
      {
        stdCode: code,
      }
    )
  },

  // 新建或编辑信息项
  addOrUpdateItem(params) {
    return $http.post(
      $url + `/datasecurity/datasecurity/sensitive/classify/sensitive/add`,
      params
    )
  },
  // 删除信息项
  deleteItem(ids) {
    return $http.post(
      $url + `/datasecurity/datasecurity/sensitive/classify/sensitive/del`,
      ids
    )
  },
  // 获取信息项列表
  getItemData(params) {
    return $http.post(
      $url +
        `/datasecurity/datasecurity/sensitive/classify/list/${params.catalogId}`,
      params.data
    )
  },
  /** *********************** 评审与发布 ********************** **/
  // 评审与发布搜索
  getPublishassetsList(params) {
    return $http.post(
      $url + `/datasecurity/datasecurity/check/search/publishassets`,
      params
    )
  },
  // 评审发布  通过或者驳回
  judgesssets(params) {
    return $http.post(
      $url + `/datasecurity/datasecurity/check/judgesssets`,
      params
    )
  },
  /** ***************************  协同分类分级  ***************************************/
  // 数据资产导出（全部）
  exportAllAssets(params) {
    return $http.post($url + `/datasecurity/datasecurity/check/export`, params)
  },
  exportSelectedAssets(params, status) {
    return $http.post(
      $url + `/datasecurity/datasecurity/check/export/${status}`,
      params
    )
  },
  // 业务系统
  getBusinessSystemList() {
    return $http.get(
      $url + `/datasecurity/datasecurity/check/searchitem/business`
    )
  },
  // 数据源
  getDataSourceList(id) {
    return $http.get(
      $url +
        `/datasecurity/datasecurity/check/searchitem/datasource?categoryId=${id}`
    )
  },
  // 7.0采集数据源接口
  realAataSourceListApi(categoryId) {
    return $http.get($url + `/datasecurity/metadata/${categoryId}/logic/`)
  },
  // 7.0逻辑数据源接口
  virDataSourceListApi(modelId) {
    return $http.get($url + `/datasecurity/metadata/model/${modelId}`)
  },
  // schema
  getSchemaList(id) {
    return $http.get(
      $url +
        `/datasecurity/datasecurity/check/searchitem/schema?dataSourceId=${id}`
    )
  },
  // 访问策略 -- 获取schema
  accessSchemaAPI(id) {
    return $http.post($url + `/datasecurity/accessStrategy/search/model/${id}`)
  },
  // 表检索
  getTableList(params) {
    return $http.post($url + `/datasecurity/entities/searchMetadata`, params)
  },
  // 获取分类目录树一级
  getClassificationInitData() {
    return $http.get($url + `/datasecurity/security/dept/`)
  },
  // 获取分类目录树子级
  getSubClassificationData(parentId) {
    return $http.get($url + `/datasecurity/security/dept/`)
  },
  // 是否需要重新扫描
  notScanAgain(modelId) {
    return $http.get(
      $url + `/datasecurity/datasecurity/check/v2/${modelId}/version/`
    )
  },
  scanByModelId(datasourceId, modelId) {
    return $http.get(
      $url +
        `/datasecurity/datasecurity/check/v2/scan/${datasourceId}/${modelId}`
    )
  },
  // 扫描数据项
  scanData(id) {
    return $http.post(
      $url + `/datasecurity/security/standard/element/scan?typeId=` + id
    )
  },
  // 获取资产盘点内容
  getAssetsData(params) {
    return $http.post($url + `/datasecurity/datasecurity/check/search`, params)
  },
  // 添加到待确认
  bindClassification(params) {
    return $http.post(
      $url + `/datasecurity/datasecurity/check/add/catalog/${params.catalogId}`,
      params.ids
    )
  },
  // 修改安全等级
  updateAssetSecurity(params) {
    return $http.post(
      $url +
        `/datasecurity/datasecurity/check/update/level/${params.securityId}`,
      params.ids
    )
  },
  // 修改数据分类
  updateClassification(params) {
    return $http.post(
      $url +
        `/datasecurity/datasecurity/check/update/catalog/${params.catalogId}`,
      params.ids
    )
  },
  // 修改资产梳理状态
  updateAssetStatus(params) {
    return $http.post(
      $url + `/datasecurity/datasecurity/check/update/asset/${params.status}`,
      params.ids
    )
  },
  // 梳理进度
  getSpeed(params) {
    return $http.post(
      $url + `/datasecurity/datasecurity/check/v2/progress`,
      params
    )
  },
  // 状态统计
  getStatistics(params) {
    return $http.post(
      $url + `/datasecurity/datasecurity/check/v2/count`,
      params
    )
  },
  // 下载导入模板
  getImportTemplate() {
    return $http.get($url + `/datasecurity/datasecurity/check/download`)
  },
  /** ***************************  数据分类  ***************************************/
  // 导出数据分类
  exportSecurityClassification() {
    return $http.get($url + `/datasecurity/datasecurity/catalog/export`)
  },
  // 数据分类--数据资产结果导出
  exportCatalogResult(catalogId) {
    return $http.get(
      $url + `/datasecurity/datasecurity/catalog/export/assets/${catalogId}`
    )
  },
  // 数据分类--重新梳理数据资产
  reorganizeAssets(catalogId, params) {
    return $http.post(
      $url +
        `/datasecurity/datasecurity/catalog/reComb/sensitive/${catalogId}/`,
      params
    )
  },
  // 获取数据分类的树
  getClassifyTree(id) {
    return $http.get($url + `/datasecurity/datasecurity/catalog/classify/${id}`)
  },
  // 新建数据分类目录
  newClassifyCatalog(params) {
    return $http.post(
      $url + `/datasecurity/datasecurity/catalog/classify/add`,
      params
    )
  },
  // 数据分类绑定信息项获取列表
  getBindInfoItemList(sensitiveId, securityId, params) {
    return $http.post(
      $url +
        `/datasecurity/datasecurity/sensitive/classify/list/${sensitiveId}/${securityId}`,
      params
    )
  },
  // 获取详情
  getClassifyDetail(id, bool = false) {
    if (bool) {
      // 日志记录
      return $http.post(
        $url +
          `/datasecurity/datasecurity/catalog/classify/detail/${id}?log=true`
      )
    } else {
      return $http.post(
        $url + `/datasecurity/datasecurity/catalog/classify/detail/${id}`
      )
    }
  },
  // 修改数据分类目录
  modifyClassifyCatalog(params) {
    return $http.put(
      $url + `/datasecurity/datasecurity/catalog/classify/modify`,
      params
    )
  },
  // 删除数据分类目录
  delClassifyCatalog(id) {
    return $http.delete(
      $url + `/datasecurity/datasecurity/catalog/classify/${id}`
    )
  },
  // 获取敏感信息列表
  getInfoItemList(id, params) {
    return $http.post(
      $url + `/datasecurity/datasecurity/catalog/sensitive/${id}`,
      params
    )
  },
  // 获取敏感信息项
  getInfoItemDetail(id, params) {
    return $http.post(
      $url + `/datasecurity/datasecurity/catalog/sensitive/object/${id}`,
      params
    )
  },
  // 绑定分类信息项
  bindInfoItem(params) {
    return $http.post(
      $url +
        `/datasecurity/datasecurity/catalog/bind/sensitive/object/${params.id}`,
      params.data
    )
  },
  // 取消绑定分类信息项
  cancelBindInfoItem(params) {
    return $http.post(
      $url + `/datasecurity/datasecurity/catalog/unBind/sensitive/object`,
      params.data
    )
  },
  // 数据分类左侧目录树检索功能
  classifySearch(keywords) {
    return $http.get(
      $url +
        `/datasecurity/datasecurity/catalog/search?keywords=${encodeURI(
          keywords
        )}`
    )
  },

  /** ***************************  智能分类分级  ***************************************/
  // 算法导出
  exportSelectedAlgorithm(data) {
    return $http.post(
      $url + `/datasecurity/datasecurity/algorithm/export/selected`,
      data
    )
  },
  exportAllAlgorithm(params) {
    return $http.post(
      $url + `/datasecurity/datasecurity/algorithm/export`,
      params
    )
  },
  // 脱敏规则选择导出
  exportDatamaskingRule(params) {
    return $http.post(`${$url}/datasecurity/mask/rule/export/selected`, params)
  },
  // 脱敏规则导出全部
  exportAllDatamasking(params) {
    return $http.post(`${$url}/datasecurity/mask/rule/export`, params)
  },
  // 脱敏规则查看log记录日志
  maskLogApi(params) {
    return $http.post(`${$url}/datasecurity/mask/rule/view/log`, params)
  },
  // 智能识别分类分级--识别规则导出全部
  exportRules(params) {
    return $http.post($url + `/datasecurity/datasecurity/rule/export`, params)
  },
  // 智能识别分类分级--导出所选规则
  exportSelectRules(params) {
    return $http.post(
      $url + `/datasecurity/datasecurity/rule/export/selected`,
      params
    )
  },
  // 获取识别规则列表
  getRuleList(params) {
    return $http.post($url + `/datasecurity/datasecurity/rule/get`, params)
  },
  // 获取识别规则列表(过滤掉没有绑定信息项的)
  getFilterRuleList(params) {
    return $http.post($url + `/datasecurity/datasecurity/rule/filter`, params)
  },
  // 获取识别规则详情
  getRuleDetail(id, bool = false) {
    if (bool) {
      // 记录日志
      return $http.get(
        $url + `/datasecurity/datasecurity/rule/get/${id}?log=true`
      )
    } else {
      return $http.get($url + `/datasecurity/datasecurity/rule/get/${id}`)
    }
  },
  // 新建识别规则
  newRule(params) {
    return $http.put($url + `/datasecurity/datasecurity/rule/add`, params)
  },
  // 修改识别规则
  modifyRule(params) {
    return $http.post($url + `/datasecurity/datasecurity/rule/update`, params)
  },
  // 编辑规则或算法时，判断是否有任务正在运行
  judgeTaskRun(params) {
    return $http.post(
      $url +
        `/datasecurity/datasecurity/rule/to/update?${params.type}=${params.id}`
    )
  },
  // 编辑规则时，判断是否被任务引用
  judgeRule(id) {
    return $http.get($url + `/datasecurity/datasecurity/rule/toUpdate/${id}`)
  },
  // 删除识别规则
  delRuleList(params) {
    return $http.post($url + `/datasecurity/datasecurity/rule/delete`, params)
  },
  // 测试识别规则
  testRule(params) {
    return $http.put($url + `/datasecurity/datasecurity/rule/test`, params)
  },
  // 获取识别算法列表
  getAlgorithmList(params) {
    return $http.post($url + `/datasecurity/datasecurity/algorithm/get`, params)
  },
  // 获取识别算法详情
  getAlgorithmDetail(id, bool = false) {
    if (bool) {
      return $http.get(
        $url + `/datasecurity/datasecurity/algorithm/get/${id}?log=true`
      )
    } else {
      return $http.get($url + `/datasecurity/datasecurity/algorithm/get/${id}`)
    }
  },
  // 新建识别算法
  newAlgorithm(params) {
    return $http.put($url + `/datasecurity/datasecurity/algorithm/add`, params)
  },
  // 修改识别算法
  modifyAlgorithm(params) {
    return $http.post(
      $url + `/datasecurity/datasecurity/algorithm/update`,
      params
    )
  },
  // 编辑算法时，判断是否被引用
  judgeAlgorithm(id) {
    return $http.get(
      $url + `/datasecurity/datasecurity/algorithm/toUpdate/${id}`
    )
  },
  // 删除识别算法
  delAlgorithm(params) {
    return $http.post(
      $url + `/datasecurity/datasecurity/algorithm/delete`,
      params
    )
  },
  // 测试算法
  testAlgorithm(params) {
    return $http.post(
      $url + `/datasecurity/datasecurity/algorithm/test`,
      params
    )
  },
  // 机器学习算法-牛刀小试
  machineSearch(keyword) {
    return $http.get(
      $url + `/datasecurity/datasecurity/ml/mlcalresult?seq=${keyword}`
    )
  },
  // 机器学习算法-机器学习服务探针，判断机器学习服务是否启动
  machineEnable() {
    return $http.get($url + `/datasecurity/datasecurity/ml/enable`)
  },
  // 机器学习算法-词汇量
  machineVocabulary() {
    return $http.get($url + `/datasecurity/datasecurity/ml/getwordnumber`)
  },
  // 添加识别任务
  newTask(params) {
    return $http.put($url + `/datasecurity/datasecurity/task/add`, params)
  },
  // 修改识别任务
  modifyTask(params) {
    return $http.post($url + `/datasecurity/datasecurity/task/update`, params)
  },
  // 添加一般识别规则时，判断规则是否关联信息项
  judgeRuleAndItem(params) {
    return $http.post($url + `/datasecurity/datasecurity/rule/check`, params)
  },
  // 校验cron语句
  checkCron(params) {
    return $http.post($url + `/datasecurity/datasecurity/task/cron`, params)
  },
  // 获取识别任务列表
  getTaskList(params) {
    return $http.post($url + `/datasecurity/datasecurity/task/get`, params)
  },
  // 根据任务id获取当前规则
  getTaskRuleList(id) {
    return $http.get($url + `/datasecurity/datasecurity/task/rule/${id}`)
  },
  // 获取识别任务详情
  getTaskDetail(id) {
    return $http.get($url + `/datasecurity/datasecurity/task/${id}`)
  },
  // 删除识别任务
  delTaskList(id) {
    return $http.delete($url + `/datasecurity/datasecurity/task/${id}`)
  },
  // 复制识别任务
  copyTask(params) {
    return $http.post($url + `/datasecurity/datasecurity/task/copy`, params)
  },
  // 停止，启动识别任务
  enabledTask(id, enabled) {
    return $http.get($url + `/datasecurity/datasecurity/task/${id}/${enabled}`)
  },
  // 跑任务时，记录日志
  taskLogApi(jobId, taskId) {
    return $http.put(
      $url + `/datasecurity/datasecurity/task/${jobId}/${taskId}/run`
    )
  },
  // 获取识别结果列表
  getTaskResult(params) {
    return $http.post($url + `/datasecurity/datasecurity/result/get`, params)
  },
  // 处理识别结果
  handleTaskResult(params) {
    return $http.post($url + `/datasecurity/datasecurity/result/handle`, params)
  },
  // 识别结果页-获取数据分类详情
  getCatalogDetail(id) {
    return $http.get($url + `/datasecurity/datasecurity/result/catalog/${id}`)
  },
  // 识别结果页-获取表详情
  getTableDetail(id) {
    return $http.get($url + `/datasecurity/datasecurity/result/table/${id}`)
  },
  /** ********************************   策略   ***************************************/
  // 获取管控策略
  getControl() {
    return $http.get($url + `/datasecurity/security/policy/control/`)
  },
  // 安全策略列表
  getControlList(params) {
    return $http.post($url + `/datasecurity/security/policy/list`, params)
  },
  // 获取数据分类
  getCatalogList(params) {
    return $http.get($url + `/datasecurity/catalogs/`)
  },
  // 安全等级
  getAuthLevel(params) {
    return $http.get($url + `/datasecurity/tags/auth`)
  },
  // 新建安全策略
  addPolicy(params) {
    return $http.post($url + `/datasecurity/security/policy/`, params)
  },
  // 删除安全策略
  delPolicy(id) {
    return $http.post($url + `/datasecurity/security/policy/delete`, id)
  },
  // /security/policy/rules/
  // 删除策略规则
  delRules(params) {
    return $http.post(
      $url + `/datasecurity/security/policy/rules/delete`,
      params
    )
  },
  // 策略规则列表
  rulesList(params) {
    return $http.post(
      $url + `/datasecurity/security/policy/rules/getSecurityPolicyRules`,
      params
    )
  },

  /* ***********  ***********  dashboard ***********  *********** */
  /* 数据资产分级概览 */
  getClassification() {
    return $http.get(
      `${$url}/datasecurity/datasecurity/dashboard/assetClassification`
    )
  },
  // 资产分类分级概览
  getDataAsset() {
    return $http.get(
      `${$url}/datasecurity/datasecurity/dashboard/assetClassification/summary`
    )
  },
  // 数据资产分级情况  按系统统计
  getSystemAsset() {
    return $http.get(
      `${$url}/datasecurity/datasecurity/dashboard/businessSystem/summary`
    )
  },
  // 数据资产分级情况  按部门统计  dashborad
  getbusinessAsset() {
    return $http.get(
      `${$url}/datasecurity/datasecurity/dashboard/businessUnit/summary`
    )
  },

  /// ////////////////////// 访控策略列表页 和 目录树 ///////////////////////////////////////
  // 获取访控策略列表
  getStrategyList(data) {
    return $http.post(
      $url +
        `/datasecurity/accessStrategy/get?strategyName=${encodeURIComponent(
          data.strategyName
        )}&catalogId=${data.catalogId}&currentPage=${data.pageNum}&pageSize=${
          data.pageSize
        }&sort=${data.sort}`
    )
  },
  // 获取访控策略目录树(策略，识别算法)
  getStrategyCatalog(type = 'ACCESS_CONTROL') {
    return $http.post(
      $url + `/datasecurity/accessStrategy/catalog/tree?type=${type}`
    )
  },
  // 删除判断验证
  judgeDelApi(id, type) {
    return $http.post(
      $url + `/datasecurity/accessStrategy/catalog/verify/${id}/${type}`
    )
  },
  // 删除访控策略目录节点
  deleteStrategyCatalog(id, type) {
    // ACCESS_CONTROL 访问策略目录
    // MASK_RULE 脱敏规则规则
    // DISCERN_ALGORITHM 识别算法
    return $http.post(
      $url + `/datasecurity/accessStrategy/catalog/delete/${id}/${type}`
    )
  },
  // 查看目录时，记录日志
  recordLogApi(params) {
    return $http.post(
      $url + `/datasecurity/datasecurity/sensitive/catalog/record/logs`,
      params
    )
  },
  // 新增访控策略目录节点
  addStrategyCatalog(data) {
    return $http.post($url + `/datasecurity/accessStrategy/catalog/add`, data)
  },
  // 策略目录树节点是否重名
  checkStrategyCatalogName(data) {
    return $http.post(
      $url + `/datasecurity/accessStrategy/catalog/checkName`,
      data
    )
  },
  // 编辑策略目录树节点
  modifyStrategyCatalog(data) {
    return $http.post(
      $url + `/datasecurity/accessStrategy/catalog/modify`,
      data
    )
  },

  // 删除访控策略(批量)
  deleteStrategyData(data) {
    return $http.post($url + `/datasecurity/accessStrategy/batch/delete`, data)
  },
  // 访问策略--复制策略
  copyStrategy(params) {
    return $http.post($url + `/datasecurity/accessStrategy/create/copy`, params)
  },
  // 获取访问策略 访问者 配置信息
  getStrategyVisitorDetails(data) {
    return $http.post(
      $url +
        `/datasecurity/accessStrategy/get/visitor/${
          data.strategyId
        }?visitorType=${data.visitorType}&query=${encodeURIComponent(
          data.keyword
        )}&currentPage=${data.currentPage}&pageSize=${data.pageSize}&sort=${
          data.sort
        }`
    )
  },

  getStrategyObjectDetails(data) {
    return $http.post(
      $url +
        `/datasecurity/accessStrategy/v2/get/object/${data.strategyId}?currentPage=${data.currentPage}&pageSize=${data.pageSize}&sort=${data.sort}`
    )
  },
  // 新增数据安全访问策略
  addStrategy(params) {
    return $http.post($url + `/datasecurity/accessStrategy/add`, params)
  },
  // 新增或者修改行级访问策略
  rowlevelPolicy(params) {
    return $http.post($url + `/datasecurity/accessStrategy/row/add`, params)
  },
  // 行级访问策略详情
  rowPolicyDetail(param) {
    return $http.get(
      `${$url}/datasecurity/accessStrategy/row/get/${param.id}/${param.scopeType}`
    )
  },
  // 获取数据安全访问策略详情
  getstrategyDetail(id) {
    return $http.post(`${$url}/datasecurity/accessStrategy/get/modify/${id}`)
  },
  // 根据指定的表id列表获取字段信息
  getFieldFromId(params) {
    return $http.post(`${$url}/datasecurity/entities/columns`, params)
  },
  // 获取数据安全访问策略访问者列表
  getVisitorList(param) {
    return $http.post(
      `${$url}/datasecurity/accessStrategy/get/all/visitor/${param.controlId}`,
      param.json
    )
  },
  // 获取数据安全访问策略访问数据列表 - 修改页
  getAccessDataList(param) {
    return $http.post(
      `${$url}/datasecurity/accessStrategy/get/${param.typeId}/${param.controlId}`,
      param.json
    )
  },
  // 访问策略 -- 根据表，视图id获取资产的安全等级和权威来源
  getAccessInfo(param) {
    return $http.post(
      `${$url}/datasecurity/accessStrategy/searchMetadata/detail`,
      param
    )
  },
  // 修改数据安全访问策略
  // /accessStrategy/modify
  modifyingPolicy(param) {
    return $http.post(`${$url}/datasecurity/accessStrategy/modify`, param)
  },
  // 根据指定的表id之外的表
  getExcludeTable(param) {
    return $http.post(`${$url}/datasecurity/entities/tables/exclude`, param)
  },
  /**
   * =================================  脱敏策略相关接口  =====================================
   */
  // 获取元数据中的相关数据（表/视图，字段）
  searchMetadataApi(params) {
    return $http.post($url + '/metadata/entities/searchMetadata', params)
  },
  // 获取元数据资产的IdList(只有表/视图调用该接口，字段不会调用该接口)
  metaIdListApi(params) {
    return $http.post(`${$url}/datasecurity/accessStrategy/table/list`, params)
  },
  // 脱敏策略搜索元数据,获取元数据的idList
  getMetaData(params) {
    return $http.post(
      `${$url}/datasecurity/accessStrategy/searchMetadata`,
      params
    )
  },
  // 策略根据资产idList，查询哪些资产不能再建策略（表，字段，行级策略）
  checkStrategyExistApi(params) {
    return $http.post(
      `${$url}/datasecurity/accessStrategy/existObjects `,
      params
    )
  },
  // 获取脱敏策略目录树
  getDesensitizeTree() {
    return $http.post(
      `${$url}/datasecurity/accessStrategy/catalog/tree/?type=MASK_RULE`
    )
  },
  // 获取脱敏策略规则
  getMaskingRules(params) {
    return $http.get(
      `${$url}/datasecurity/datamasking/page?search=${params.keyword}&current_page=${params.page}&page_size=${params.size}&ruleInfoCatalog=${params.ruleInfoCatalog}&order_by=${params.order_by}`
    )
  },
  // 脱敏规则管理 -- 测试接口
  getRuleTest(params) {
    return $http.post(`${$url}/datasecurity/datasecurity/rule/test`, params)
  },
  // 新增表级脱敏
  newTableMask(params) {
    return $http.put(`${$url}/datasecurity/accessStrategy/mask/table`, params)
  },
  // 修改表级脱敏
  modifyTableMask(params) {
    return $http.post(
      `${$url}/datasecurity/accessStrategy/mask/table/modify`,
      params
    )
  },
  // 根据资产id获取资产相关详情
  getAssetInfo(params) {
    return $http.get(
      `${$url}/datasecurity/accessStrategy/prop/${params.assetId}`
    )
  },
  // 获取表级脱敏策略详情
  getTableMaskDetail(params) {
    return $http.post(`${$url}/datasecurity/accessStrategy/mask/table`, params)
  },
  // 获取表级脱敏策略适用范围
  getTableScopedMaskDetail(params) {
    return $http.post(
      `${$url}/datasecurity/accessStrategy/mask/table/scope`,
      params
    )
  },
  // 新增字段脱敏
  newColumnMask(params) {
    return $http.put(`${$url}/datasecurity/accessStrategy/mask/column`, params)
  },
  // 修改字段脱敏
  modifyColumnMask(params) {
    return $http.post(
      `${$url}/datasecurity/accessStrategy/mask/column/modify`,
      params
    )
  },
  // 获取字段脱敏策略详情
  getColumnMaskDetail(params) {
    return $http.post(`${$url}/datasecurity/accessStrategy/mask/column`, params)
  },
  // 删除脱敏策略
  delDesensitizeStrategy(params) {
    return $http.delete(`${$url}/datasecurity/accessStrategy/mask`, params)
  },
  // 获取访问策略基本信息
  accessStrategyBaseInfo(id, bool = false) {
    if (bool) {
      return $http.post(
        `${$url}/datasecurity/accessStrategy/get/basic/${id}?log=true`
      )
    } else {
      return $http.post(`${$url}/datasecurity/accessStrategy/get/basic/${id}`)
    }
  },
  /**
   * =================================  脱敏规则管理  =====================================
   */
  // 新建脱敏规则
  newDesensitizeRule(params) {
    return $http.put(`${$url}/datasecurity/mask/rule/add`, params)
  },
  // 脱敏规则列表
  desensitizeRuleList(params) {
    return $http.post(`${$url}/datasecurity/mask/rule/list`, params)
  },
  // 修改脱敏规则
  modifyDesensitizeRule(params) {
    return $http.post(`${$url}/datasecurity/mask/rule/modify`, params)
  },
  // 删除脱敏规则
  delDesensitizeRule(data) {
    return $http.post(`${$url}/datasecurity/mask/rule/delete`, data)
  },
  // 获取识别任务列表
  getDiscernTasks(params) {
    return $http.post(
      `${$url}discern/scopes?search=${params.keyword}&current_page=${params.page}&page_size=${params.size}`
    )
  },
  // 数据脱敏规则---是否被引用，能否编辑或删除
  judgeCanDel(id) {
    return $http.get(`${$url}/datasecurity/mask/rule/op/${id}`)
  },
  // 当前用户可访问的数据范围
  getAccessData(params) {
    return $http.post(
      `${$url}/datasecurity/accessStrategy/get/user/table`,
      params
    )
  },
  /**
   * =================================  base服务接口  =====================================
   */
  // 获取新建识别规则的自定义属性
  customAttr(id) {
    return $http.post($url + `/metadata/udps/getUdpsOfType?typeId=${id}`)
  },
  // 获取标签属性
  tagListApi(id) {
    return $http.post($url + `/base/tags/tree`)
  },
  // 访问策略-- 获取数据源（关于安全网关的）
  gateWayFromre(params) {
    return $http.post($url + `/base/datasources/findDatasources`, params)
  },
  // 访问策略获取数据源
  getAssessFromre() {
    return $http.get(
      $url +
        '/datasecurity/accessStrategy/all/logic/model?includeLogicalEntity=false'
    )
  },
  getAssessFromreTrue() {
    return $http.get(
      $url +
        '/datasecurity/accessStrategy/all/logic/model?includeLogicalEntity=true'
    )
  },
  // 使用元数据接口，获取相关的业务系统和技术部门
  modelCategoriesWithUdpApi() {
    return $http.post($url + '/base/modelCategory/getModelCategories')
  },
  // base服务插件类型
  pluginListApi(params) {
    return $http.post(
      $url + `/base/plugins/getAllPlugins?pluginType=${params.pluginType}`
    )
  },
  /**
   * =================================  元数据相关服务描述  =====================================
   */
  // 获取数据源(不与用户权限挂钩)
  getFromre(data) {
    return $http.post($url + '/metadata/models/fromre/page', data)
  },
  // 获取所有数据源
  getAllFromre() {
    return $http.get($url + '/metadata/models/fromre/')
  },
  // 获取数据源树结构
  modelTreeAPI() {
    return $http.get(
      $url +
        '/metadata/models/modeltree?includeLogicalEntity=false&dataConnection=true'
    )
  },
  // 根据表格id获取表格下的数据项
  getColumns(id) {
    return $http.get(`${$url}/metadata/entities/${id}/columns`)
  },
  /**
   * =================================  job相关服务描述  =====================================
   */
  // 识别任务-- 判断是否在时间模板
  judgeTimeTemplate(id) {
    return $http.post($url + `/job/main/canExecuteToday?jobId=${id}`)
  },
  // 获取job时间模板
  dateTemplateApi() {
    return $http.post($url + '/job/dateTemplate/list')
  },
  // 运行识别任务
  runTask(params) {
    return $http.post(
      $url +
        `/job/main/startJob?jobId=${params.jobId}&executor=${params.executor}`
    )
  },
  // 当前任务历史状态
  historyTaskInfo(params) {
    return $http.post($url + `/job/main/query/jobResults/byCriteria`, params)
  },
  /**
   * =================================  user相关服务  =====================================
   */
  // 获取系统所有用户
  getAllUserPage(params) {
    return $http.post(`${$url}/user/org/groups/page`, params)
  },
  // 获取系统下所有用户组
  getGroups() {
    return $http.get(`/user/org/groups`)
  },
  // 查询系统下所有机构
  mechanism(params) {
    // withUserNumber 值为true或者false，如果是false就不会查询人数
    return $http.get(`/user/org/organization/tree`, { withUserNumber: true })
  },
}

export default api
