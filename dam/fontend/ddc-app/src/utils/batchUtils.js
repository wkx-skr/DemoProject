/**
 * 批次相关工具函数
 */

/**
 * 格式化批次状态显示
 * @param {string} status - 状态值
 * @returns {string} 格式化后的状态文本
 */
export function formatBatchStatus(status) {
  const statusMap = {
    'UNCONFIRMED': '未确认',
    'CONFIRMED': '已确认',
    'BIND': '已绑定',
    'PASS': '通过',
    'REJECT': '未通过'
  }
  return statusMap[status] || status
}

/**
 * 格式化审核类型显示
 * @param {string} type - 审核类型
 * @returns {string} 格式化后的类型文本
 */
export function formatOrderType(type) {
  const typeMap = {
    '发布': '发布',
    '变更': '变更',
    '废弃': '废弃'
  }
  return typeMap[type] || type
}

/**
 * 获取状态对应的颜色
 * @param {string} status - 状态值
 * @returns {string} 颜色值
 */
export function getStatusColor(status) {
  const colorMap = {
    'UNCONFIRMED': '#f56c6c',
    'CONFIRMED': '#67c23a',
    'BIND': '#e6a23c',
    'PASS': '#409eff',
    'REJECT': '#909399'
  }
  return colorMap[status] || '#909399'
}

/**
 * 获取审核类型对应的颜色
 * @param {string} type - 审核类型
 * @returns {string} 颜色值
 */
export function getOrderTypeColor(type) {
  const colorMap = {
    '发布': '#67c23a',
    '变更': '#e6a23c',
    '废弃': '#f56c6c'
  }
  return colorMap[type] || '#909399'
}

/**
 * 验证批次数据
 * @param {Object} batchData - 批次数据
 * @returns {Object} 验证结果 { isValid: boolean, errors: Array }
 */
export function validateBatchData(batchData) {
  const errors = []
  
  if (!batchData.applyName) {
    errors.push('批次名称不能为空')
  }
  
  if (!batchData.applyType) {
    errors.push('批次类型不能为空')
  }
  
  if (!batchData.applyCreator) {
    errors.push('创建人不能为空')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * 格式化日期范围
 * @param {Array} dateRange - 日期范围数组
 * @returns {Object} 格式化后的开始和结束时间
 */
export function formatDateRange(dateRange) {
  if (!dateRange || dateRange.length !== 2) {
    return {
      startTime: '',
      endTime: ''
    }
  }
  
  return {
    startTime: new Date(dateRange[0]).toISOString(),
    endTime: new Date(dateRange[1]).toISOString()
  }
}

/**
 * 防抖函数
 * @param {Function} func - 要防抖的函数
 * @param {number} wait - 等待时间
 * @returns {Function} 防抖后的函数
 */
export function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

/**
 * 节流函数
 * @param {Function} func - 要节流的函数
 * @param {number} limit - 限制时间
 * @returns {Function} 节流后的函数
 */
export function throttle(func, limit) {
  let inThrottle
  return function() {
    const args = arguments
    const context = this
    if (!inThrottle) {
      func.apply(context, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

/**
 * 深拷贝对象
 * @param {*} obj - 要拷贝的对象
 * @returns {*} 拷贝后的对象
 */
export function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') return obj
  if (obj instanceof Date) return new Date(obj.getTime())
  if (obj instanceof Array) return obj.map(item => deepClone(item))
  if (typeof obj === 'object') {
    const clonedObj = {}
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key])
      }
    }
    return clonedObj
  }
}

/**
 * 生成唯一ID
 * @returns {string} 唯一ID
 */
export function generateUniqueId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

/**
 * 格式化文件大小
 * @param {number} bytes - 字节数
 * @returns {string} 格式化后的文件大小
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * 检查权限
 * @param {string} permission - 权限标识
 * @param {Object} auth - 权限对象
 * @returns {boolean} 是否有权限
 */
export function checkPermission(permission, auth) {
  return auth && auth[permission] === true
}

/**
 * 批量检查权限
 * @param {Array} permissions - 权限标识数组
 * @param {Object} auth - 权限对象
 * @returns {Object} 权限检查结果
 */
export function checkPermissions(permissions, auth) {
  const result = {}
  permissions.forEach(permission => {
    result[permission] = checkPermission(permission, auth)
  })
  return result
} 