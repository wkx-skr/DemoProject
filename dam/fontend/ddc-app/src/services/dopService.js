import HTTP from '@/http/main'

/**
 * 数字化运营平台API服务
 */
class DopService {
  /**
   * 获取批次信息
   * @param {string} batchId 批次ID
   */
  getBatchInfo(batchId) {
    return HTTP.get(`/domain/apply/info/${batchId}`)
  }

  /**
   * 获取批次详情
   * @param {string} batchId 批次ID
   */
  getBatchDetail(batchId) {
    return HTTP.get(`/domain/apply/detail/${batchId}`)
  }

  /**
   * 确认批次
   * @param {Array} batchIds 批次ID数组
   */
  confirmBatch(batchIds) {
    return HTTP.post('/domain/apply/confirm', { batchIds })
  }

  /**
   * 删除批次
   * @param {Array} batchIds 批次ID数组
   */
  deleteBatch(batchIds) {
    return HTTP.post('/domain/apply/delete', { batchIds })
  }

  /**
   * 审批通知
   * @param {Object} params 审批参数
   * @param {string} params.approvalId 审批ID
   * @param {string} params.batchId 批次ID
   * @param {number} params.approvalStatus 审批状态 (1:审核中，2:审核通过，3:审核未通过)
   * @param {string} params.feedBack 审批意见
   */
  approvalNotice(params) {
    return HTTP.post('/domain/apply/batch/flow/notice', params)
  }

  /**
   * 获取DOP配置
   */
  getDopConfig() {
    return HTTP.get('/domain/apply/conf/info')
  }

  /**
   * 获取批次列表
   * @param {Object} params 查询参数
   */
  getBatchList(params) {
    return HTTP.post('/domain/apply/page', params)
  }

  /**
   * 数据校验
   * @param {string} batchId 批次ID
   */
  validateBatch(batchId) {
    return HTTP.get(`/ds/DS-Core/apply/batch/validate/${batchId}`)
  }

  /**
   * 绑定审批关系
   * @param {Object} params 绑定参数
   * @param {string} params.approvalId 审批ID
   * @param {string} params.batchId 批次ID
   */
  bindApproval(params) {
    return HTTP.post('/ds/DS-Core/apply/batch/flow/bind', params)
  }

  /**
   * 获取Token信息
   * @param {Object} params Token参数
   * @param {string} params.username 用户名
   * @param {string} params.sign 签名
   */
  getAccessToken(params) {
    return HTTP.post('/ds/PC-Security/oauth/user/getAccessToken', params)
  }
}

export default new DopService() 