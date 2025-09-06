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
import { ref, Ref, unref, watch } from 'vue'
import nodes from './tasks'
import getElementByJson from '@/components/form/get-elements-by-json'
import { useTaskNodeStore } from '@/store/project/task-node'
import { TASK_TYPES_MAP } from '../../constants/task-type'

import type {
  IFormItem,
  IJsonItem,
  INodeData,
  ITaskData,
  FormRules,
  EditWorkflowDefinition
} from './types'

export function useTask({
  data,
  projectCode,
  from,
  readonly,
  definition
}: {
  data: ITaskData
  projectCode: number
  from?: number
  readonly?: boolean
  definition?: EditWorkflowDefinition
}): {
  elementsRef: Ref<IFormItem[]>
  rulesRef: Ref<FormRules>
  model: INodeData
} {
  const taskStore = useTaskNodeStore()
  taskStore.setStepNum(0)
  taskStore.updateDefinition(unref(definition), data?.code)

  const jsonRef = ref([]) as Ref<IJsonItem[]>
  const elementsRef = ref([]) as Ref<IFormItem[]>
  const rulesRef = ref({})

  const params = {
    projectCode,
    from,
    readonly,
    data,
    jsonRef,
    updateElements: () => {
      getElements()
    }
  }
  const getElements = () => {
    const { rules, elements } = getElementByJson(jsonRef.value, models)
    elementsRef.value = elements
    rulesRef.value = rules
  }
  // @ts-ignore
  // const { model:any, json, jsonAry }
  let  models:any = {}
  let  jsons:any = []
  let  jsonArys:any = []
  /*if (data.taskType === 'SQL') {
    const { model, jsonAry, json } = nodes[data.taskType || 'SHELL'](params)
    models = model
    jsonArys = jsonAry
    jsons = json
  } else {*/
    const { model, json } = nodes[data.taskType || 'SHELL'](params)
    models = model
    jsons = json
  // }

  models.preTasks = taskStore.getPreTasks
  models.name = taskStore.getName
  models.taskExecuteType =
    TASK_TYPES_MAP[data.taskType || 'SHELL'].taskExecuteType || 'BATCH'

  watch(
    () => taskStore.getStepNum,
    () => {
      /*if(data.taskType === 'SQL') {
        jsons = jsonArys[taskStore.getStepNum]
      }*/
        jsonRef.value = jsons
        getElements()

    },
    {
      immediate: true
    }
  )

  return { elementsRef, rulesRef, model: models }
}
