import topCount from '@/view/dataAplication/serviceOverview/topCount.vue'
import HTTP from '@/view/dataAplication/ddsHTTP'

const componentsArr = [
  'apiCount',
  'appCount',
  'apiCall',
  'apiCallMonth',
  'apiSuccessRate',
]
const getTopCount = HTTP.getTopData()

const exportMap = {}
componentsArr.forEach(com => {
  exportMap[com] = {
    name: com,
    components: {
      topCount,
    },
    template: `
      <top-count countType="${com}" :getDataPromise="getTopCount"></top-count>`,
    data() {
      return {
        getTopCount: getTopCount,
      }
    },
  }
})

export default exportMap
