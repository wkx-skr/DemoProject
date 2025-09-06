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

import { reactive, watch } from 'vue'
import * as Fields from '../fields/index'
import type { IJsonItem, INodeData } from '../types'
import { ITaskData } from '../types'

export function useSql({
  projectCode,
  from = 0,
  readonly,
  data
}: {
  projectCode: number
  from?: number
  readonly?: boolean
  data?: ITaskData
}) {
  const model = reactive({
    name: '',
    taskType: 'SQL',
    flag: 'YES',
    description: '',
    timeoutFlag: false,
    localParams: [],
    environmentCode: null,
    failRetryInterval: 1,
    failRetryTimes: 0,
    workerGroup: 'default',
    delayTime: 0,
    timeout: 30,
    type: 'MYSQL',
    displayRows: 10,
    segmentSeparator: ';',
    sql: '',
    sqlType: '0',
    preStatements: [],
    postStatements: [],
    udfs: [],
    timeoutNotifyStrategy: ['WARN'],
    step: 0,
    taskPriority: 'MEDIUM',
    isNewest: false,
    fileDetailId: 0,
    fileType: ''
  } as INodeData)

  let jsonAry = [
    [ Fields.sqlUseName(from),
      ...Fields.sqlUseTaskDefinition({ projectCode, from, readonly, data, model }),
      Fields.sqlUseRunFlag(),
      Fields.sqlUseDescription(),
    ],[
      Fields.sqlUseTaskPriority(),
      Fields.sqlUseWorkerGroup(),
      Fields.sqlUseEnvironmentName(model, !model.id),
      ...Fields.sqlUseTaskGroup(model, projectCode),
      ...Fields.sqlUseFailed(),
      Fields.sqlUseDelayTime(model),
      ...Fields.sqlUseTimeoutAlarm(model),
    ],[
      ...Fields.sqlUseDatasource(model),
      ...Fields.sqlUseSqlType(model),
      ...Fields.sqlUseSql(model),
      Fields.sqlUsePreTasks()
    ]
  ]

  return {
    json: jsonAry.flat() as IJsonItem[],
    model,
    jsonAry
  }
}
