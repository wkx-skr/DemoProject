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

import { defineComponent, onMounted, toRefs, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute , useRouter } from 'vue-router'
import Card from '@/components/card'
import GanttChart from './components/gantt-chart'
import { useGantt } from './use-gantt'
import { NButton } from 'naive-ui'

const workflowRelation = defineComponent({
  name: 'workflow-relation',
  setup() {
    const { t, locale } = useI18n()
    const route = useRoute()
    const router = useRouter()

    const { variables, getGantt } = useGantt()

    const id = Number(route.params.id)
    const code = Number(route.params.projectCode)

    const handleResetDate = () => {
      variables.seriesData = []
      variables.taskList = []
      getGantt(id, code)
    }

    const onClose = () => {
      if (history.state.back !== '/login') {
        router.go(-1)
        return
      }
    }
    const style = {
      position: 'absolute',
      top: '10px',
      right: '10px'
    }
    onMounted(() => {
      getGantt(id, code)
    })

    watch(
      () => [locale.value],
      () => {
        handleResetDate()
      }
    )

    return { t, onClose, style, ...toRefs(variables) }
  },
  render() {
    const { t, onClose, style } = this
    return (
      <div>
      <Card title={t('project.workflow.gantt')}>
        {{
          default: () =>
            this.seriesData.length > 0 && (
              <GanttChart
                seriesData={this.seriesData}
                taskList={this.taskList}
              />
            )
        }}
      </Card>
        <NButton secondary round onClick={onClose} style={style}  class='btn-close'>{t('project.dag.close')}</NButton>
      </div>
    )
  }
})

export default workflowRelation
