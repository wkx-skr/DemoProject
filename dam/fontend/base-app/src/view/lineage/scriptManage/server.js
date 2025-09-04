import service from './service'
const $http = vueThis.$http
const url = vueThis.$meta_url

export async function getTableData() {
  let res = await $http.post(url + service.findScript)
  return res
}
export async function page(param) {
  let res = await $http.post(url + service.page, param)
  return res
}
export async function testByContent(param) {
  let res = await $http.post(url + service.testByContent, param)
  return res
}
export async function createScript(param) {
  let res = await $http.post(url + service.createScript, param)
  return res
}
export async function updateScript(param) {
  let res = await $http.post(url + service.updateScript, param)
  return res
}

export async function getLineageType() {
  let res = await $http.post(url + service.getLineageType)
  return res
}

export async function deleteScript(id) {
  let res = await $http.post(url + service.deleteScript + '?id=' + id)
  return res
}
export async function delScriptBatch(param) {
  let res = await $http.post(url + service.delScriptBatch, param)
  return res
}
export async function enabled(id) {
  let res = await $http.post(url + service.enabled + '?id=' + id)
  return res
}
