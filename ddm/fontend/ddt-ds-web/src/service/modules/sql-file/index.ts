/*
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { ddtAxios, ddtService, ddmAxios, dddAxios } from '@/service/ddtService'
/*export function getTreeFile (id: Number): any {
    return ddtAxios({
        url: `/service/code/tree/ds/${id}`,
        method: 'get'
    })
}*/
/*使用ddd的查找sql树*/
export function getTreeFile(id: Number, branch: string): any {
  return dddAxios({
    url: `/code/tree/${id}/${branch}`,
    method: 'post'
  })
}
export function getProjectId(code: Number): any {
  return ddtAxios({
    url: `/project/dscode/${code}`,
    method: 'get'
  })
}
export function getModels(id: Number): any {
  return ddtAxios({
    url: `/model/tree/${id}`,
    method: 'get'
  })
}
export function getOption(): any {
  return ddmAxios({
    url: '/models/script/option',
    method: 'get'
  })
}
// @ts-ignore
export function getCreateScript(id: Number): any {
  return dddAxios({
    // url: `/service/models/${para.modelId}/script?targetVerId=${para.startVersionId}&mode=CREATE`,
    // method: 'post',
    // data:para.data
    url: `/model/getDDL?id=${id}`,
    method: 'get'
  })
}
// @ts-ignore
export function getAlterScript(para): any {
  return ddmAxios({
    url: `/models/${para.modelId}/script?baseVerId=${para.startVersionId}&targetVerId=${para.endVersion}&mode=ALTER`,
    method: 'post',
    data: para.data
  })
}
// 获取master分支的sql语句
export function getMasterSql(id: number, projectId: number): any {
  return dddAxios({
    url: `/code/file/${id}?projectId=${projectId}`,
    method: 'get'
  })
}
// 获取分支信息
export function getBranchList(id: number): any {
  return dddAxios({
    url: `/code/getBranch?projectId=${id}`,
    method: 'get'
  })
}

export function changeDataTree(params: any): any {
  return dddAxios({
    url: `/code/tree/${params.id}`,
    method: 'get'
  })
}

export { ddtAxios, ddtService }
