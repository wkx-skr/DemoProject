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
import { computed, h, ref, onMounted, toRaw, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  useCustomParams,
  useDeployMode,
  useDriverCores,
  useDriverMemory,
  useExecutorNumber,
  useExecutorMemory,
  useExecutorCores,
  useMainJar,
  useResources
} from '.'
import type { IJsonItem } from '../types'
import { NButton, NPopselect, NTree, TreeOption } from 'naive-ui'
import Editor from '@/components/monaco-editor/sqlIndex'
import {
  ddtService,
  getCreateScript,
  getMasterSql,
  getModels,
  getProjectId,
  getTreeFile
} from '@/service/modules/sql-file'
import { useRoute } from 'vue-router'
import { useThemeStore } from '@/store/theme/theme'
import { useTaskNodeStore } from '@/store/project/task-node'

export function useSpark(model: { [field: string]: any }): IJsonItem[] {
  const { t } = useI18n()
  const mainClassSpan = computed(() =>
    model.programType === 'PYTHON' || model.programType === 'SQL' ? 0 : 24
  )

  const mainArgsSpan = computed(() => (model.programType === 'SQL' ? 0 : 24))

  const rawScriptSpan = computed(() => (model.programType === 'SQL' ? 24 : 0))

  const showCluster = computed(() => model.programType !== 'SQL')

  let selectedKeys: any = []
  const expandKeys: any = []
  const fileName = ref('')
  const treeFileData = ref([])
  const route = useRoute()
  const projectCode = Number(route.params.projectCode)
  const themeStore = useThemeStore()
  const taskStore = useTaskNodeStore()
  let branch = ''
  const models = model
  const iconNameLIst = {
    1: 'hive',
    2: 'mysql',
    3: 'postgresql',
    4: 'oracle',
    5: 'starrocks',
    6: 'sqlserver',
    7: 'flinksql',
    8: 'flinkjar',
    9: 'java',
    10: 'python',
    11: 'gbase',
    12: 'transwarpInceptor',
    13: 'shell',
    14: 'default', // file
    15: 'migration',
    16: 'clickhouse',
    17: 'oceanbase',
    18: 'db2',
    19: 'flinkStream',
    30: 'spark',
    31: 'Kettle Transformation',
    32: 'Kettle Job'
  }
  const typeList = {
    '.sql': 'SQL',
    '.py': 'PYTHON',
    '.scala': 'SCALA',
    '.java': 'JAVA'
  }
  onMounted(() => {
    getTreeFiles()
  })
  watch(
    () => themeStore.getCreatSqlTask,
    async () => {
      if (themeStore.getCreatSqlTask) {
        const obj = themeStore.getCreatSqlTask
        // @ts-ignore
        if (obj.codeDetailId) {
          const idRes = await getProjectId(projectCode)
          // @ts-ignore
          const res = await getMasterSql(obj.codeDetailId, idRes.id)
          const taskParam = JSON.parse(res.data.taskParam) || {}
          // @ts-ignore
          model.programType = typeList[taskParam.extension]
          model.mainClass = taskParam.mainClass
          model.mainJar = taskParam.mainJar
          model.sql = res.data.content
          // @ts-ignore
          model.fileDetailId = obj.codeDetailId
          model.fileType = 'FILE'
        } else {
          // @ts-ignore
          const createRes = await getCreateScript(obj.id)
          model.sql = createRes.data.ddl || ''
          // @ts-ignore
          model.fileDetailId = obj.id
          model.fileType = 'MODEL'
        }
      }
    },
    { immediate: true }
  )
  // @ts-ignore
  const getDDL = async (obj) => {
    /* const res = await getOption()
    const option = res.data*/
    const createRes = await getCreateScript(obj.option.id)
    obj.model.rawScript = createRes.data.ddl || ''
    /*if (obj.option.startVersion.version === obj.option.endVersion.version) {
      const createRes = await getCreateScript(obj.option.id)
      script = createRes.data.create
    } else {
      const alterRes = await getAlterScript({
        modelId: obj.option.modelId,
        startVersionId: obj.option.startVersion.version,
        endVersion: obj.option.endVersion.version,
        data: {
          option
        }
      })
      script = alterRes.data.alter
    }*/
    // obj.model.sql = script
  }
  const getSql = async (obj: any) => {
    const res = await getMasterSql(
      obj.option.codeDetailId,
      obj.option.projectId
    )
    obj.model.rawScript = res.data.content
    // obj.option.params = res.data.params
    typeof res.udfs === 'string' && (res.udfs = JSON.parse(res.udfs))
    modelSetParam({ option: res.data, model: obj.model })
  }
  // 设置model的param 参数
  const modelSetParam = (json: any) => {
    const ary: any = []
    const obj: any = json.option
    /*  obj.properties &&
      Object.keys(obj.params).forEach((item: string) => {
        ary.push({
          prop: item,
          value:
            obj.params[item] instanceof Array
              ? obj.params[item].join(',')
              : obj.params[item],
          direct: 'IN',
          type: 'VARCHAR'
        })
      })*/
    json.model.localParams = obj.properties || []
    json.model.udfs = json.option.udfs
  }
  // 点击事件等
  const nodeProps = ({ option }: { option: TreeOption }, model: any) => {
    return {
      onClick() {
        // @ts-ignore
        option.type && (fileName.value = option.name)
        selectedKeys = []
        if (option.type === 1 && option.modelId) {
          getDDL({
            option,
            model
          })
          model.fileDetailId = option.id
          model.fileType = 'MODEL'
        } else if (option.type && option.codeDetailId) {
          // if (branch === 'master') {
          getSql({ option, model })
          model.fileDetailId = option.codeDetailId
          model.fileType = 'FILE'
          /* } else {
            // 分支
            let sql = codeDetail.value.find((item:any) => item.id === option.codeDetailId) || {content: '', params: ''}
            typeof sql.params === 'string' && (sql.params = JSON.parse(sql.params))
            model.sql = sql.content
            modelSetParam({ option: sql, model })
          }*/
        }
      }
    }
  }
  // 渲染树
  const treeRender = ({ option }: { option: TreeOption }) => {
    if (option.type === 0) {
      // 文件夹
      return h('div', [
        h('i', {
          class: 'iconfont icon-openfile'
        }),
        // @ts-ignore
        h('span', {}, option.name)
      ])
    } else if (option.type || option.type === 'sqlVer') {
      if (option.type === 1 && option.modelId) {
        return h('div', [
          h('span', {
            class: 'tree-icon model1'
          }),
          // @ts-ignore
          h('span', {}, option.name)
        ])
      }
      // 文件
      // @ts-ignore
      const v = iconNameLIst[option.type] || 'default'
      return h('div', [
        h('span', {
          class: `tree-icon ${v}`
        }),
        // @ts-ignore
        h('span', {}, option.name)
      ])
    } else {
      return h('div')
    }
  }

  const getTreeFiles = async () => {
    try {
      const idRes = await getProjectId(projectCode)
      let res = { data: {} }
      // branch = workflowBranch[models.code] || themeStore.getBranch

      res = await getTreeFile(idRes.id, themeStore.getBranch)

      const modelRes = await getModels(idRes.id)
      // const branchList = await getBranchList(idRes.id) // 获取分支
      // branchList.data.unshift('master')
      // const option = branchList.data.map((item: any) => {
      //   return { label: item.branch, value: item.branch }
      // })
      // @ts-ignore
      // tagLeaf(res.data)
      // res.data.suffix = getSuffix(res.data, option, idRes.id, modelRes)
      // @ts-ignore
      treeFileData.value = [modelRes, res.data]
      setKey([modelRes], 'MODEL')
      setKey([res.data], 'FILE')
    } catch (err: any) {
      ddtService.$showFailure(err)
    }
  }
  const setKey = (ary: any, val: string) => {
    ary &&
      ary.forEach((item: any) => {
        item.childList = item.childList?.length ? item.childList : null
        item.nodeKey = item.name + item.id + val

        const obj = toRaw(model)
        model.fileDetailId = model.fileDetailId || ''
        model.fileType = model.fileType || ''
        if (
          (obj.fileDetailId == item.codeDetailId && obj.fileType === val) ||
          (obj.fileDetailId == item.id && obj.fileType === val)
        ) {
          // @ts-ignore
          // expandKeys = ['NorthWind-ODS648']
          const list =
            val === 'MODEL' ? [treeFileData.value[0]] : [treeFileData.value[1]]
          getParentName(list, item.parentId)
          selectedKeys = [item.nodeKey]
          fileName.value = item.name
          const obj = themeStore.getCreatSqlTask
          // @ts-ignore
          model.name = model.name || obj.name || ''
        }
        if (item.childList && item.childList.length) {
          setKey(item.childList, val)
        }
      })
  }
  const getParentName = (ary: any, id: number) => {
    ary &&
      ary.forEach((item: any) => {
        if (item.id === id) {
          expandKeys.push(item.nodeKey)
          getParentName(treeFileData.value, item.parentId)
          return
        }
        if (item.childList && item.childList.length) {
          getParentName(item.childList, id)
        }
      })
  }
  const getSuffix = (res: any, option: any, id: number, modelRes: any) => {
    branch = res.branch
    return () =>
      h(
        h(
          NPopselect,
          {
            value: branch,
            trigger: 'click',
            options: option,
            scrollable: true,
            size: 'small',
            onChange: async (v: any) => {
              branch = v
              models.localParams = []
              models.sql = ''
              taskStore.setWorkflowBranch({ key: models.code, value: v })
              // if(v === 'master') {
              const res = await getTreeFile(id, themeStore.getBranch)
              // tagLeaf(res.data)
              res.data.suffix = getSuffix(res.data, option, id, modelRes)
              // @ts-ignore
              treeFileData.value = [modelRes, res.data]
            }
          },
          () =>
            h(
              NButton,
              {
                quaternary: true,
                size: 'tiny',
                type: 'info'
              },
              { default: () => branch }
            )
        )
      )
  }

  return [
    {
      type: 'select',
      field: 'programType',
      span: 12,
      name: t('project.node.program_type'),
      options: PROGRAM_TYPES,
      props: {
        'on-update:value': () => {
          model.mainJar = null
          model.mainClass = ''
        }
      }
    },
    {
      type: 'select',
      field: 'sparkVersion',
      span: 12,
      name: t('project.node.spark_version'),
      options: SPARK_VERSIONS
    },
    {
      type: 'input',
      field: 'mainClass',
      span: mainClassSpan,
      name: t('project.node.main_class'),
      props: {
        placeholder: t('project.node.main_class_tips')
      },
      validate: {
        trigger: ['input', 'blur'],
        required: model.programType !== 'PYTHON' && model.programType !== 'SQL',
        validator(validate: any, value: string) {
          if (
            model.programType !== 'PYTHON' &&
            !value &&
            model.programType !== 'SQL'
          ) {
            return new Error(t('project.node.main_class_tips'))
          }
        }
      }
    },
    useMainJar(model),
    /*{
      type: 'editor',
      field: 'rawScript',
      span: rawScriptSpan,
      name: t('project.node.script'),
      validate: {
        trigger: ['input', 'trigger'],
        required: true,
        message: t('project.node.script_tips')
      }
    },*/
    {
      type: 'custom',
      field: 'sql',
      span: rawScriptSpan,
      widget: () => {
        return h(
          'div',
          {
            style: 'width: 100%;'
          },
          [
            h(
              'div',
              {
                style:
                  'width:100%;display:flex;margin-bottom:10px;margin-top:-24px'
              },
              [
                h(
                  'div',
                  {
                    style: 'width:237px'
                  },
                  ''
                ),
                h(
                  'div',
                  {
                    style: 'width:50%;margin-top:20px'
                  },
                  `文件名：${fileName.value}`
                )
              ]
            ),
            h(
              'div',
              {
                style: 'width:100%;display:flex;'
              },
              [
                h(NTree, {
                  'expand-on-click': false,
                  'default-expand-all': false,
                  'selected-keys': selectedKeys,
                  'default-expanded-keys': expandKeys,
                  'block-line': true,
                  data: treeFileData.value,
                  'key-field': 'nodeKey',
                  'label-field': 'name',
                  'children-field': 'childList',
                  selectable: true,
                  'render-label': treeRender,
                  'node-props': (info: { option: any }) => {
                    return nodeProps(info, model)
                  },
                  //background:#333;
                  style:
                    'width: 30%;height:302px;overflow:auto;margin-right:14px'
                }),
                h(Editor, {
                  language: 'sql',
                  value: model.rawScript,
                  onUpdateValue: (value: string) =>
                    void (model.rawScript = value),
                  style: 'width: 80%;'
                })
              ]
            )
          ]
        )
      }
    },
    useDeployMode(24, ref(true), showCluster),
    {
      type: 'input',
      field: 'appName',
      name: t('project.node.app_name'),
      props: {
        placeholder: t('project.node.app_name_tips')
      }
    },
    useDriverCores(),
    useDriverMemory(),
    useExecutorNumber(),
    useExecutorMemory(),
    useExecutorCores(),
    {
      type: 'input',
      field: 'mainArgs',
      span: mainArgsSpan,
      name: t('project.node.main_arguments'),
      props: {
        type: 'textarea',
        placeholder: t('project.node.main_arguments_tips')
      }
    },
    {
      type: 'input',
      field: 'others',
      name: t('project.node.option_parameters'),
      props: {
        type: 'textarea',
        placeholder: t('project.node.option_parameters_tips')
      }
    },
    useResources(),
    ...useCustomParams({ model, field: 'localParams', isSimple: false })
  ]
}

export const PROGRAM_TYPES = [
  {
    label: 'JAVA',
    value: 'JAVA'
  },
  {
    label: 'SCALA',
    value: 'SCALA'
  },
  {
    label: 'PYTHON',
    value: 'PYTHON'
  },
  {
    label: 'SQL',
    value: 'SQL'
  }
]

export const SPARK_VERSIONS = [
  {
    label: 'SPARK2',
    value: 'SPARK2'
  },
  {
    label: 'SPARK1',
    value: 'SPARK1'
  }
]
