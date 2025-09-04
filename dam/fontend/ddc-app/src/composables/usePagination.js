import { ref, computed } from 'vue'

/**
 * 分页组合式函数
 * @param {Object} options - 分页配置选项
 * @returns {Object} 分页相关的响应式数据和方法
 */
export function usePagination(options = {}) {
  const {
    currentPage = 1,
    pageSize = 20,
    total = 0,
    pageSizes = [10, 20, 50, 100]
  } = options
  
  // 分页状态
  const pagination = ref({
    currentPage,
    pageSize,
    total,
    pageSizes
  })
  
  // 计算总页数
  const totalPages = computed(() => {
    return Math.ceil(pagination.value.total / pagination.value.pageSize)
  })
  
  // 是否有上一页
  const hasPrev = computed(() => {
    return pagination.value.currentPage > 1
  })
  
  // 是否有下一页
  const hasNext = computed(() => {
    return pagination.value.currentPage < totalPages.value
  })
  
  // 页码变化
  const handleCurrentChange = (page) => {
    pagination.value.currentPage = page
  }
  
  // 每页条数变化
  const handleSizeChange = (size) => {
    pagination.value.pageSize = size
    pagination.value.currentPage = 1
  }
  
  // 更新总数
  const updateTotal = (total) => {
    pagination.value.total = total
  }
  
  // 重置分页
  const resetPagination = () => {
    pagination.value.currentPage = 1
  }
  
  // 跳转到第一页
  const goToFirst = () => {
    pagination.value.currentPage = 1
  }
  
  // 跳转到最后一页
  const goToLast = () => {
    pagination.value.currentPage = totalPages.value
  }
  
  // 跳转到上一页
  const goToPrev = () => {
    if (hasPrev.value) {
      pagination.value.currentPage--
    }
  }
  
  // 跳转到下一页
  const goToNext = () => {
    if (hasNext.value) {
      pagination.value.currentPage++
    }
  }
  
  return {
    pagination,
    totalPages,
    hasPrev,
    hasNext,
    handleCurrentChange,
    handleSizeChange,
    updateTotal,
    resetPagination,
    goToFirst,
    goToLast,
    goToPrev,
    goToNext
  }
} 