import { ref, computed } from 'vue'

/**
 * 本地筛选组合式函数
 * @param {Array} data - 原始数据
 * @param {Object} filterForm - 筛选表单
 * @param {Object} sortData - 排序数据
 * @param {Object} pagination - 分页配置
 * @returns {Object} 筛选相关的响应式数据和方法
 */
export function useLocalFilter(data, filterForm, sortData, pagination) {
  // 筛选后的数据
  const filteredData = computed(() => {
    let result = [...data.value]
    
    // 应用筛选条件
    if (filterForm.value.cnName) {
      result = result.filter(item =>
        item.cnName &&
        item.cnName.toLowerCase().includes(filterForm.value.cnName.toLowerCase())
      )
    }
    
    if (filterForm.value.enName) {
      result = result.filter(item =>
        item.enName &&
        item.enName.toLowerCase().includes(filterForm.value.enName.toLowerCase())
      )
    }
    
    if (filterForm.value.dataType) {
      result = result.filter(item => item.dataType === filterForm.value.dataType)
    }
    
    if (filterForm.value.orderType) {
      result = result.filter(item => item.orderType === filterForm.value.orderType)
    }
    
    // 应用排序
    if (sortData.value.prop && sortData.value.order) {
      const { prop, order } = sortData.value
      const isAsc = order === 'ascending'
      
      result.sort((a, b) => {
        const valueA = a[prop]
        const valueB = b[prop]
        
        if (valueA === valueB) return 0
        if (valueA > valueB) return isAsc ? 1 : -1
        return isAsc ? -1 : 1
      })
    }
    
    return result
  })
  
  // 分页后的数据
  const paginatedData = computed(() => {
    const start = (pagination.value.currentPage - 1) * pagination.value.pageSize
    const end = start + pagination.value.pageSize
    return filteredData.value.slice(start, end)
  })
  
  // 总数
  const total = computed(() => filteredData.value.length)
  
  // 重置筛选
  const resetFilter = () => {
    filterForm.value = {
      cnName: '',
      enName: '',
      dataType: '',
      orderType: '',
    }
    pagination.value.currentPage = 1
  }
  
  // 应用筛选
  const applyFilter = (updatePage = true) => {
    if (updatePage) {
      pagination.value.currentPage = 1
    }
  }
  
  return {
    filteredData,
    paginatedData,
    total,
    resetFilter,
    applyFilter
  }
} 