/**
 * 申请相关API服务
 */
export const applyService = {
  /**
   * 获取DOP配置
   */
  getConfig() {
    return this.$http({
      url: '/domain/apply/conf/info',
      method: 'get'
    })
  },

  /**
   * 获取批次列表
   * @param {Object} params - 查询参数
   */
  getBatchList(params) {
    return this.$http({
      url: '/domain/apply/page',
      method: 'post',
      data: params
    })
  },

  /**
   * 获取批次详情
   * @param {Number} batchId - 批次ID
   */
  getBatchDetail(batchId) {
    return this.$http({
      url: `/domain/apply/detail/${batchId}`,
      method: 'get'
    })
  },

  /**
   * 确认批次
   * @param {Object} data - 确认数据
   */
  confirmBatch(data) {
    return this.$http({
      url: '/domain/apply/confirm',
      method: 'post',
      data
    })
  },

  /**
   * 提交审批
   * @param {Object} data - 审批数据
   */
  submitApproval(data) {
    return this.$http({
      url: '/domain/apply/batch/flow/notice',
      method: 'post',
      data
    })
  },

  /**
   * 删除批次
   * @param {Object} data - 删除数据
   */
  deleteBatch(data) {
    return this.$http({
      url: '/domain/apply/delete',
      method: 'post',
      data
    })
  },

  /**
   * 导出批次信息
   * @param {Number} batchId - 批次ID
   */
  exportBatch(batchId) {
    return this.$http({
      url: `/domain/apply/export/${batchId}`,
      method: 'get',
      responseType: 'blob'
    })
  }
}

/**
 * 批次状态枚举
 */
export const BATCH_STATUS = {
  UNCONFIRMED: 'UNCONFIRMED',
  CONFIRMED: 'CONFIRMED',
  BIND: 'BIND',
  PASS: 'PASS',
  REJECT: 'REJECT'
}

/**
 * 批次状态标签配置
 */
export const BATCH_STATUS_CONFIG = {
  [BATCH_STATUS.UNCONFIRMED]: {
    label: '未确认',
    color: '#f56c6c',
    type: 'danger'
  },
  [BATCH_STATUS.CONFIRMED]: {
    label: '已确认',
    color: '#67c23a',
    type: 'success'
  },
  [BATCH_STATUS.BIND]: {
    label: '已绑定',
    color: '#e6a23c',
    type: 'warning'
  },
  [BATCH_STATUS.PASS]: {
    label: '通过',
    color: '#409eff',
    type: 'primary'
  },
  [BATCH_STATUS.REJECT]: {
    label: '未通过',
    color: '#909399',
    type: 'info'
  }
}

/**
 * 审核类型枚举
 */
export const ORDER_TYPE = {
  PUBLISH: '发布',
  UPDATE: '变更',
  ABOLISH: '废弃'
}

/**
 * 审核类型标签配置
 */
export const ORDER_TYPE_CONFIG = {
  [ORDER_TYPE.PUBLISH]: {
    label: '发布',
    color: '#67c23a',
    type: 'success'
  },
  [ORDER_TYPE.UPDATE]: {
    label: '变更',
    color: '#e6a23c',
    type: 'warning'
  },
  [ORDER_TYPE.ABOLISH]: {
    label: '废弃',
    color: '#f56c6c',
    type: 'danger'
  }
} 