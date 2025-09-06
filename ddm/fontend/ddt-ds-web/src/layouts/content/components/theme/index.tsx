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

import { defineComponent } from 'vue'
import { NButton } from 'naive-ui'
import { useI18n } from 'vue-i18n'
import { useThemeStore } from '@/store/theme/theme'
import styles from './index.module.scss'
import type { Router } from 'vue-router'
import { useRouter } from 'vue-router'

const Theme = defineComponent({
  name: 'Theme',
  setup() {
    const router: Router = useRouter()
    const { t } = useI18n()
    const themeStore = useThemeStore()

    const changeTheme = () => {
      themeStore.darkTheme = !themeStore.darkTheme
    }
    window.addEventListener('message', (e) => {
      // console.log('e.origin ', e.origin) //子页面URL，这里是http://b.index.com
      // console.log(e.source) // 子页面window对象，全等于iframe.contentWindow
      // console.log(e.data) //子页面发送的消息
      // <!-- 对消息来源origin做一下过滤，避免接收到非法域名的消息导致的xss攻击 -->
      if (
        e.origin.includes(location.host) ||
        location.host.includes('localhost')
      ) {
        const data = e.data

        if (e.data) {
          try {
            const data = JSON.parse(e.data)
            // console.log(data, 'data 2')
            const projectCode = router.currentRoute.value.params.projectCode
            data.parentBranch && themeStore.setBranch(data.parentBranch)

            // 外面拖拽创建sql任务
            if (data.creatSqlTask) {
              themeStore.setCreatSqlTask(data.creatSqlTask)
            } else {
              themeStore.setCreatSqlTask({})
              // 有拖拽任务时，ds页面不能跳转
              // 文件引用跳转
              if (data.pageType === 'workflowDefinition') {
                data.workflowCode &&
                  router.push({
                    name: 'workflow-definition-detail',
                    params: { code: data.workflowCode }
                  })
                data.createDefinition &&
                  router.push({
                    path: `/projects/${projectCode}/workflow/definitions/create`
                  })
                !data.workflowCode &&
                  !data.createDefinition &&
                  router.push({
                    path: `/projects/${projectCode}/workflow-definition`
                  })
              }
              // 工作流实例
              if (data.pageType !== 'workflowDefinition') {
                router.push({
                  path: `/projects/${projectCode}/workflow/instances`
                })
              }
              themeStore.setRefreshWork(data.refreshWork)
            }

            if (data.theme === 'dark' && !themeStore.darkTheme) {
              changeTheme()
            } else if (data.theme !== 'dark' && themeStore.darkTheme) {
              changeTheme()
            }
          } catch (e) {
            console.log(e)
          }
        }
      }
    })
    return { t, themeStore, changeTheme }
  },
  render() {
    return <div></div>
  }
})

export default Theme
