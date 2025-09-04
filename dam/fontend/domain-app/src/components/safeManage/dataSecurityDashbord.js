import everyFolderCount from './everyFolderCount'
import everySystemCount from './everySystemCount'
import folderCountEchart from './folderCountEchart'
import systemCountEchart from './systemCountEchart'
import normal from './normal'
import HTTP from '@/http/main.js'
import Vue from 'vue'

let muluData = HTTP.$http.get(HTTP.$url + '/service/catalogs/root')
let getPieData = HTTP.$http.get(`${HTTP.$url}/service/tags/securityPie`)
let getESystemData = HTTP.$http.get(`${HTTP.$url}/service/tags/securityBar`)
let getFolderData = HTTP.$http.get(`${HTTP.$url}/service/tags/dataType/bar`)
let getFolderPieData = HTTP.$http.get(`${HTTP.$url}/service/tags/dataType/pie`)
let getAllTages = HTTP.$http.get(`${HTTP.$url}/service/tags/`)

let classifyObj = {
  title: '数据安全分类',
  name: '数据分类',
  value: null,
  id: -1,
}
let departmentObj = {
  title: '涉及业务部门',
  name: '组织部门',
  value: null,
  id: -1,
}
let systemObj = {
  title: '涉及安全数据的业务系统',
  name: '业务系统',
  value: null,
  id: -1,
}
let l5 = {
  title: '数据等级统计',
  name: '',
  value: null,
}
let l4 = {
  title: '数据等级统计',
  name: '',
  value: null,
}
let l1 = {
  title: '数据等级统计',
  name: '',
  value: null,
}
let colorMap = [
  '#5679F4',
  '#51A1FF',
  '#24D6E9',
  '#F8B95D',
  '#FF7575',
  '#F4568F',
  '#BB5AFF',
  '#5B47FF',
  '#CCCCCC',
]
let componentsRelatedObj = {
  systemCountEchart: [
    { name: 'getData', value: getPieData },
    { name: 'getAllTages', value: getAllTages },
    { name: 'colorMap', value: colorMap },
  ],
  securityLevel5: [{ name: 'obj', value: l5 }],
  securityLevel4: [{ name: 'obj', value: l4 }],
  securityLevel1: [{ name: 'obj', value: l1 }],
  systemObj: [{ name: 'obj', value: systemObj }],
  folderCountEchart: [
    { name: 'getData', value: getFolderPieData },
    { name: 'colorMap', value: colorMap },
    { name: 'muluData', value: muluData },
  ],
  everyFolderCount: [
    { name: 'getData', value: getFolderData },
    { name: 'getAllTages', value: getAllTages },
    { name: 'muluData', value: muluData },
    { name: 'safeTagCatalogName', value: '数据安全等级' },
    { name: 'colorMap', value: colorMap },
  ],
  classifyObj: [{ name: 'obj', value: classifyObj }],
  departmentObj: [{ name: 'obj', value: departmentObj }],
  everySystemCount: [
    { name: 'getData', value: getESystemData },
    { name: 'getAllTages', value: getAllTages },
    { name: 'muluData', value: muluData },
    { name: 'safeTagCatalogName', value: '数据安全等级' },
    { name: 'colorMap', value: colorMap },
  ],
}

let componentNameObj = {
  systemCountEchart: 'system-count-echart',
  securityLevel5: 'normal',
  securityLevel4: 'normal',
  securityLevel1: 'normal',
  systemObj: 'normal',
  folderCountEchart: 'folder-count-echart',
  everyFolderCount: 'every-folder-count',
  classifyObj: 'normal',
  departmentObj: 'normal',
  everySystemCount: 'every-system-count',
}

HTTP.$http
  .get(HTTP.$url + '/service/tags/dataAuth/collect/count')
  .then(res => {
    Object.assign(l1, res.data.tag[0])
    Object.assign(l4, res.data.tag[3])
    Object.assign(l5, res.data.tag[4])
    Object.assign(systemObj, {
      value: res.data.systemCount,
    })
  })
  .catch(e => {
    Vue.prototype.$showFailure(e)
  })
HTTP.$http
  .get(HTTP.$url + '/service/tags/dataAuth/dataType/count')
  .then(res => {
    classifyObj.value = res.data
  })
  .catch(e => {
    Vue.prototype.$showFailure(e)
  })
HTTP.$http
  .get(HTTP.$url + '/service/tags/dataAuth/department/count')
  .then(res => {
    departmentObj.value = res.data
  })
  .catch(e => {
    Vue.prototype.$showFailure(e)
  })

let exportList = []
let index = 0
for (let key in componentsRelatedObj) {
  exportList.push({
    name: key + index++,
    components: {
      systemCountEchart,
      everyFolderCount,
      folderCountEchart,
      everySystemCount,
      normal,
    },
    render(h) {
      let props = {}
      componentsRelatedObj[key].forEach(item => {
        props[item.name] = item.value
      })
      if (componentsRelatedObj[key].every(item => item.value)) {
        return h(componentNameObj[key], {
          props,
        })
      } else {
        return ''
      }
    },
    data() {
      return {
        ...componentsRelatedObj[key].map(item => item.value),
      }
    },
  })
}

export default exportList
