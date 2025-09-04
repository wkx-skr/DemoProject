/**
 * 数字化运营平台消息处理工具
 */
class DopMessageHandler {
  constructor() {
    this.messageHandlers = new Map()
    this.setupMessageListener()
  }

  /**
   * 设置消息监听器
   */
  setupMessageListener() {
    window.addEventListener('message', (event) => {
      console.log('Received message from parent:', event.data)
      this.handleMessage(event.data)
    })
  }

  /**
   * 注册消息处理器
   * @param {string} type 消息类型
   * @param {Function} handler 处理函数
   */
  registerHandler(type, handler) {
    this.messageHandlers.set(type, handler)
  }

  /**
   * 处理接收到的消息
   * @param {Object} data 消息数据
   */
  handleMessage(data) {
    const { type } = data
    const handler = this.messageHandlers.get(type)
    
    if (handler) {
      handler(data)
    } else {
      console.warn(`No handler registered for message type: ${type}`)
    }
  }

  /**
   * 向父窗口发送消息
   * @param {Object} message 消息对象
   */
  sendMessage(message) {
    if (window.parent !== window) {
      window.parent.postMessage(message, '*')
    } else {
      console.warn('Not in iframe context, cannot send message to parent')
    }
  }

  /**
   * 发送确认消息
   * @param {string} batchId 批次ID
   * @param {string} batchName 批次名称
   */
  sendConfirmMessage(batchId, batchName) {
    this.sendMessage({
      type: 'confirm',
      batchId,
      batchName,
      timestamp: Date.now()
    })
  }

  /**
   * 发送审批结果消息
   * @param {string} batchId 批次ID
   * @param {number} approvalStatus 审批状态
   * @param {string} feedBack 审批意见
   */
  sendApprovalResultMessage(batchId, approvalStatus, feedBack) {
    this.sendMessage({
      type: 'approvalResult',
      batchId,
      approvalStatus,
      feedBack,
      timestamp: Date.now()
    })
  }

  /**
   * 发送查看详情消息
   * @param {string} batchId 批次ID
   * @param {string} batchName 批次名称
   */
  sendViewMessage(batchId, batchName) {
    this.sendMessage({
      type: 'view',
      batchId,
      batchName,
      timestamp: Date.now()
    })
  }

  /**
   * 发送刷新消息
   */
  sendRefreshMessage() {
    this.sendMessage({
      type: 'refresh',
      timestamp: Date.now()
    })
  }

  /**
   * 发送取消消息
   * @param {string} batchId 批次ID
   */
  sendCancelMessage(batchId) {
    this.sendMessage({
      type: 'cancel',
      batchId,
      timestamp: Date.now()
    })
  }

  /**
   * 发送导出消息
   * @param {string} batchId 批次ID
   * @param {Array} data 导出数据
   */
  sendExportMessage(batchId, data) {
    this.sendMessage({
      type: 'export',
      batchId,
      data,
      timestamp: Date.now()
    })
  }

  /**
   * 发送错误消息
   * @param {string} error 错误信息
   * @param {string} batchId 批次ID
   */
  sendErrorMessage(error, batchId = null) {
    this.sendMessage({
      type: 'error',
      error,
      batchId,
      timestamp: Date.now()
    })
  }

  /**
   * 检查是否在iframe中
   * @returns {boolean}
   */
  isInIframe() {
    return window.parent !== window
  }

  /**
   * 获取URL参数
   * @returns {Object}
   */
  getUrlParams() {
    const urlParams = new URLSearchParams(window.location.search)
    const params = {}
    
    for (const [key, value] of urlParams) {
      params[key] = value
    }
    
    return params
  }

  /**
   * 获取批次ID
   * @returns {string|null}
   */
  getBatchId() {
    return this.getUrlParams().batchId
  }

  /**
   * 获取是否审批节点
   * @returns {boolean}
   */
  isApproverNode() {
    return this.getUrlParams().isApproverNode === 'true'
  }

  /**
   * 获取Token
   * @returns {string|null}
   */
  getToken() {
    return this.getUrlParams().token
  }
}

// 创建单例实例
const dopMessageHandler = new DopMessageHandler()

export default dopMessageHandler 