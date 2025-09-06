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

import { defineComponent, PropType, renderSlot, Ref, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { NModal, NCard, NButton, NSpace, NDivider } from 'naive-ui'
import ButtonLink from '@/components/button-link'
import styles from './index.module.scss'
import type { LinkOption } from '@/components/modal/types'
import { INodeData } from '@/views/projects/task/components/node/types'
import { useTaskNodeStore } from '@/store/project/task-node'
import { useThemeStore } from '@/store/theme/theme'
// getStepNum, setStepNum
const props = {
  show: {
    type: Boolean as PropType<boolean>,
    default: false
  },
  title: {
    type: String as PropType<string>,
    required: true
  },
  cancelText: {
    type: String as PropType<string>
  },
  cancelShow: {
    type: Boolean as PropType<boolean>,
    default: true
  },
  confirmText: {
    type: String as PropType<string>
  },
  confirmClassName: {
    type: String as PropType<string>,
    default: ''
  },
  cancelClassName: {
    type: String as PropType<string>,
    default: ''
  },
  confirmDisabled: {
    type: Boolean as PropType<boolean>,
    default: false
  },
  confirmLoading: {
    type: Boolean as PropType<boolean>,
    default: false
  },
  autoFocus: {
    type: Boolean as PropType<boolean>,
    default: true
  },
  headerLinks: {
    type: Object as PropType<Ref<Array<LinkOption>>>,
    default: [] as LinkOption[]
  },
  taskType: {
    type: String,
    default: ''
  },
  sqlModel: {
    default: {  } as INodeData
  }
}

// @ts-ignore
const Modal = defineComponent({
  name: 'Modal',
  props,
  emits: ['cancel', 'confirm','next', 'prev', 'jumpLink'],
  setup(props, ctx) {
    const { t } = useI18n()
    const themeStore = useThemeStore()
    const onCancel = () => {
      ctx.emit('cancel')
    }
    const store = useTaskNodeStore()
    const onConfirm = () => {
      ctx.emit('confirm')
    }
    const onNext = () => {
      ctx.emit('next')
      // store.setStepNum(store.getStepNum + 1)
    }
    const onPrev = () => {
      ctx.emit('prev')
      // store.setStepNum(store.getStepNum - 1)
    }
    return { t, onCancel, onConfirm, onNext, store, onPrev, themeStore }
  },
  render() {
    const { $slots, t, onCancel, onConfirm, confirmDisabled, confirmLoading, onNext, store, onPrev, themeStore } =
      this
    return (
      <NModal
        v-model={[this.show, 'show']}
        class={[styles.modalContainer, themeStore.darkTheme && styles.container]}
        mask-closable={false}
        auto-focus={this.autoFocus}
      >
        <NCard
          title={this.title}
          class={styles['modal-card']}
          contentStyle={{ overflowY: 'auto' }}
        >
          {{
            default: () => renderSlot($slots, 'default'),
            'header-extra': () => (
              <NSpace justify='end'>
                {/*{this.taskType === 'SQL' &&
                <span class={['iconfont icon-false', styles.closeBtn]} onClick={onCancel}></span>
                }*/}
                {this.headerLinks.value &&
                this.headerLinks.value
                  .filter((item: any) => item.show)
                  .map((item: any) => {
                    return (
                      <ButtonLink
                        onClick={item.action}
                        disabled={item.disabled}
                      >
                        {{
                          default: () => item.text,
                          icon: () => item.icon()
                        }}
                      </ButtonLink>
                    )
                  })}
              </NSpace>
            ),
            footer: () => (
              <NSpace justify='end' class={styles.space}>
                {this.cancelShow && (
                  <NButton
                    class={[this.cancelClassName, 'btn-cancel']}
                    size='small'
                    onClick={onCancel}
                  >
                    {this.cancelText || t('modal.cancel')}
                  </NButton>
                )}
                <NDivider vertical ></NDivider>
                {/* TODO: Add left and right slots later */}
                {renderSlot($slots, 'btn-middle')}
                {/*{this.taskType === 'SQL' && store.getStepNum!=0 && (
                  <NButton
                    class={[this.cancelClassName, 'btn-cancel']}
                    size='small'
                    onClick={onPrev}
                  >
                   上一步
                  </NButton>
                )}
                {this.taskType === 'SQL' && store.getStepNum!=2 && (
                  <span>
                    <NButton
                      class={[this.cancelClassName, 'btn-cancel']}
                      type='info'
                      size='small'
                      onClick={onNext}
                    >
                      下一步
                    </NButton>
                  </span>
                )}
                {this.taskType === 'SQL' && store.getStepNum ==2 &&
                <span>
                  <NDivider vertical ></NDivider>
                  <NButton
                    class={[this.confirmClassName, 'btn-submit']}
                    type='info'
                    size='small'
                    onClick={onConfirm}
                    disabled={confirmDisabled}
                    loading={confirmLoading}
                  >
                    {this.confirmText || t('modal.confirm')}
                  </NButton>
                </span>
                }*/}
                 <NButton
                  class={[this.confirmClassName, 'btn-submit']}
                  type='info'
                  size='small'
                  onClick={onConfirm}
                  disabled={confirmDisabled}
                  loading={confirmLoading}
                >
                  {this.confirmText || t('modal.confirm')}
                </NButton>
              </NSpace>
            )
          }}
        </NCard>
      </NModal>
    )
  }
})

export default Modal
