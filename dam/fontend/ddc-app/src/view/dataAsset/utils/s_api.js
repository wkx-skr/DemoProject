import HTTP from '@/http/main.js'
import axios from 'axios'
import { param } from 'jquery'
import { isExportDeclaration } from 'typescript'
const $http = HTTP.$http
const $url = ''
const api = {
    /** ******************分类结构*****************/
  // 重置图片
  getDefault(id) {
    return $http.get($url + '/assets/config/recover/' + id)
  },
  // 图片上传
  upload(param) {
    return $http.post(
      $url + '/assets/config/upload',
      param
    )
  },
  // 修改图片
  reviseImage(params) {
    return $http.put(
      $url +
        `/assets/config/catalog/type/icon/${params.id}/${params.iconId}`
    )
  },

  /** ***************************  数据分级  ***************************************/
  // 获取分级信息
  getLevelData() {
    return $http.get($url + `/assets/discern/result/level/securitylist`)
  },
  // 修改安全等级
  updateLevel(params) {
    return $http.post(
      $url + `/datasecurity/datasecurity/level/addorupdate`,
      params
    )
  },

  /** ***************************  信息项  ***************************************/
  // 获取信息项目录
  getItemCatalog(id) {
    return $http.get(
      $url + `/datasecurity/datasecurity/sensitive/catalog/${id}`
    )
  },
  // 搜索信息项目录
  searchItemCatalog(keyword) {
    return $http.get(
      $url +
        `/datasecurity/datasecurity/sensitive/search/catalog?keywords=${keyword}`
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
  /** ***************************  协同分类分级  ***************************************/
  // 业务系统
  getBusinessSystemList() {
    return $http.get($url + `/assets/discern/result/searchitem/business`)
  },
  // 7.0采集数据源接口
  realAataSourceListApi(categoryId) {
    return $http.get($url + `/assets/metadata/${categoryId}/logic/`)
  },
  // 7.0逻辑数据源接口
  virDataSourceListApi(modelId) {
    return $http.get($url + `/assets/metadata/model/${modelId}`)
  },
  // 获取数据分类的树
  getClassifyTree(id) {
    return $http.get($url + `/datasecurity/datasecurity/catalog/classify/${id}`)
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
  // 识别结果页-确认或拒绝
  handleDiscernResult(params) {
    return $http.post($url + `/assets/discern/result/handle`, params)
  },
  changeAssetCatalog(params) {
    return $http.post(
      $url + `/assets/discern/result/modify/result/catalog`,
      params
    )
  },
  changeModifyTag(params) {
    return $http.post(
      $url + `/assets/discern/result/modify/result/tag`,
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
      $url + `/assets/discern/algorithm/export/selected`,
      data
    )
  },
  exportAllAlgorithm(params) {
    return $http.post(
      $url + `/assets/discern/algorithm/export`,
      params
    )
  },
  // 智能识别分类分级--识别规则导出全部
  exportRules(params) {
    return $http.post($url + `/assets/discern/rule/export`, params)
  },
  // 智能识别分类分级--导出所选规则
  exportSelectRules(params) {
    return $http.post(
      $url + `/assets/discern/rule/export/selected`,
      params
    )
  },
  // 获取识别规则列表
  getRuleList(params) {
    return $http.post($url + `/assets/discern/rule/get`, params)
  },
  // 获取识别规则列表(过滤掉没有绑定信息项的)
  getFilterRuleList(params) {
    return $http.post($url + `/assets/discern/rule/filter`, params)
  },
  // 获取识别规则详情
  getRuleDetail(id, bool = false) {
    if (bool) {
      // 记录日志
      return $http.get(
        $url + `/assets/discern/rule/get/${id}?log=true`
      )
    } else {
      return $http.get($url + `/assets/discern/rule/get/${id}`)
    }
  },
  // 新建识别规则
  newRule(params) {
    return $http.put($url + `/assets/discern/rule/add`, params)
  },
  // 修改识别规则
  modifyRule(params) {
    return $http.post($url + `/assets/discern/rule/update`, params)
  },
  // 编辑规则或算法时，判断是否有任务正在运行
  judgeTaskRun(params) {
    return $http.post(
      $url +
        `/assets/discern/rule/to/update?${params.type}=${params.id}`
    )
  },
  // 编辑规则时，判断是否被任务引用
  judgeRule(id) {
    return $http.get($url + `/assets/discern/rule/toUpdate/${id}`)
  },
  // 删除识别规则
  delRuleList(params) {
    return $http.post($url + `/assets/discern/rule/delete`, params)
  },
  // 测试识别规则
  testRule(params) {
    return $http.put($url + `/assets/discern/rule/test`, params)
  },
  // 获取识别算法列表
  getAlgorithmList(params) {
    return $http.post($url + `/assets/discern/algorithm/get`, params)
  },
  // 获取识别算法详情
  getAlgorithmDetail(id, bool = false) {
    if (bool) {
      return $http.get(
        $url + `/assets/discern/algorithm/get/${id}?log=true`
      )
    } else {
      return $http.get($url + `/assets/discern/algorithm/get/${id}`)
    }
  },
  // 新建识别算法
  newAlgorithm(params) {
    return $http.put($url + `/assets/discern/algorithm/add`, params)
  },
  // 修改识别算法
  modifyAlgorithm(params) {
    return $http.post(
      $url + `/assets/discern/algorithm/update`,
      params
    )
  },
  // 编辑算法时，判断是否被引用
  judgeAlgorithm(id) {
    return $http.get(
      $url + `/assets/discern/algorithm/toUpdate/${id}`
    )
  },
  // 删除识别算法
  delAlgorithm(params) {
    return $http.post(
      $url + `/assets/discern/algorithm/delete`,
      params
    )
  },
  // 测试算法
  testAlgorithm(params) {
    return $http.post(
      $url + `/assets/discern/algorithm/test`,
      params
    )
  },
  // 机器学习算法-牛刀小试
  machineSearch(keyword) {
    return $http.get(
      $url + `/assets/discern/ml/mlcalresult?seq=${keyword}`
    )
  },
  // 机器学习算法-机器学习服务探针，判断机器学习服务是否启动
  machineEnable() {
    return $http.get($url + `/assets/discern/ml/enable`)
  },
  // 机器学习算法-词汇量
  machineVocabulary() {
    return $http.get($url + `/assets/discern/ml/getwordnumber`)
  },
  // 添加识别任务
  newTask(params) {
    return $http.put($url + `/assets/discern/task/add`, params)
  },
  // 修改识别任务
  modifyTask(params) {
    return $http.post($url + `/assets/discern/task/update`, params)
  },
  // 校验cron语句
  checkCron(params) {
    return $http.post($url + `/assets/discern/task/cron`, params)
  },
  // 获取识别任务列表
  getTaskList(params) {
    return $http.post($url + `/assets/discern/task/get`, params)
  },
  // 根据任务id获取当前规则
  getTaskRuleList(id) {
    return $http.get($url + `/assets/discern/task/rule/${id}`)
  },
  // 获取识别任务详情
  getTaskDetail(id) {
    return $http.get($url + `/assets/discern/task/${id}`)
  },
  // 删除识别任务
  delTaskList(id) {
    return $http.delete($url + `/assets/discern/task/${id}`)
  },
  // 复制识别任务
  copyTask(params) {
    return $http.post($url + `/assets/discern/task/copy`, params)
  },
  // 停止，启动识别任务
  enabledTask(id, enabled) {
    return $http.get($url + `/assets/discern/task/${id}/${enabled}`)
  },
  // 跑任务时，记录日志
  taskLogApi(jobId, taskId) {
    return $http.put(
      $url + `/assets/discern/task/${jobId}/${taskId}/run`
    )
  },
  // 获取识别结果列表
  getTaskResult(params) {
    return $http.post($url + `/assets/discern/result/get`, params)
  },
  // 处理识别结果
  handleTaskResult(params) {
    return $http.post($url + `/assets/discern/result/handle`, params)
  },
  // 识别结果页-获取数据分类详情
  getCatalogDetail(id) {
    return $http.get($url + `/assets/discern/result/catalog/${id}`)
  },
  // 识别结果页-获取表详情
  getTableDetail(id) {
    return $http.get($url + `/assets/discern/result/table/${id}`)
  },
  /** ********************************   策略   ***************************************/
  // 获取数据分类
  getCatalogList(params) {
    return $http.get($url + `/datasecurity/catalogs/`)
  },
  /// ////////////////////// 访控策略列表页 和 目录树 ///////////////////////////////////////
  // 获取访控策略目录树(策略，识别算法)
  getStrategyCatalog(type = 'ACCESS_CONTROL') {
    return $http.post(
      $url + `/assets/discern/catalog/tree?type=${type}`
    )
  },
  // 删除判断验证
  judgeDelApi(id, type) {
    return $http.post(
      $url + `/assets/discern/catalog/verify/${id}/${type}`
    )
  },
  // 删除访控策略目录节点
  deleteStrategyCatalog(id, type) {
    // ACCESS_CONTROL 访问策略目录
    // MASK_RULE 脱敏规则规则
    // DISCERN_ALGORITHM 识别算法
    return $http.post($url + `/assets/discern/catalog/delete/${id}/${type}`)
  },
  // 新增访控策略目录节点
  addStrategyCatalog(data) {
    return $http.post($url + `/assets/discern/catalog/add`, data)
  },
  // 策略目录树节点是否重名
  checkStrategyCatalogName(data) {
    return $http.post(
      $url + `/assets/discern/catalog/checkName`,
      data
    )
  },
  // 编辑策略目录树节点
  modifyStrategyCatalog(data) {
    return $http.post($url + `/assets/discern/catalog/modify`, data)
  },
  /**
   * =================================  脱敏策略相关接口  =====================================
   */
  // 获取元数据中的相关数据（表/视图，字段）
  searchMetadataApi(params) {
    return $http.post($url + '/metadata/entities/searchMetadata', params)
  },
  // 策略根据资产idList，查询哪些资产不能再建策略（表，字段，行级策略）
  checkStrategyExistApi(params) {
    return $http.post(
      `${$url}/datasecurity/accessStrategy/existObjects `,
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
    return $http.get($url + '/assets/discern/task/all/logic/model')
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
    return $http.post($url + '/assets/metadata/models/fromre/page', data)
  },
  // 获取所有数据源
  getAllFromre() {
    return $http.get($url + '/metadata/models/fromre/')
  },
  // 获取数据源树结构
  modelTreeAPI() {
    return $http.get($url + '/metadata/models/modeltree')
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
