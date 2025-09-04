import { GroupShape, StepShape, ColumnShape } from '../types/Shape'
import { StepType } from '../types/ShapeType.ts'
import metaModelIcon from '@/assets/images/search/metamodel.png'
import HTTP2 from '@/http/main.js'

import Drag from '../class/Drag'
const dragMethods = {
  methods: {
    handleMousedown(e) {
      Drag.handleDrag(e, this)
    },
    updatePosition(left, top) {
      this.shapeData.oldX = this.shapeData.x
      this.shapeData.oldY = this.shapeData.y
      this.shapeData.x = left
      this.shapeData.y = top
      this.$emit('update-position', {
        id: this.shapeData.id,
        left: left,
        top: top,
      })
    },
  },
}
const GroupView = {
  template: `
    <div
      class="group"
      @mousedown.stop="handleMousedown"
    >
      <div v-if="!mini" class="shape-item" :title="shapeLabel">{{ shapeLabel }}</div>
    </div>
  `,
  props: {
    shapeData: GroupShape,
    mini: Boolean,
  },
  mixins: [dragMethods],
  computed: {
    shapeLabel() {
      if (this.shapeData.label.endsWith('@@')) {
        return ''
      } else {
        let groupFullName = this.shapeData.label.slice(6)
        if (groupFullName.includes(':')) {
          return groupFullName.split(':')[1]
        } else {
          return groupFullName
        }
      }
    },
  },
}
const TableView = {
  template: `
    <div
      class="table"
      @click="handleTableClick"
      @mousedown="handleMousedown"
      @contextmenu.stop.prevent="handleContextMenu"
      @dblclick.stop.prevent="handleDblClick"
    >
    <img v-if="!mini && isFirstStep && hasPrevStep" alt="←"
         :src="stepTriangleSrc"
         style="position: absolute;left: 0;top: 0;bottom: 0;width: 7px;transform: rotateY(180deg);" />
    <img v-if="!mini && isLastStep && hasNextStep" alt="→"
         :src="stepTriangleSrc"
         style="position: absolute;right: 0;top: 0;bottom: 0;width: 7px;" />
    <div v-if="showModelMessage && !mini" class="shape-item">schema: {{ shapeData.schema }}</div>
    <div v-if="showModelMessage && !mini" class="shape-item" :title="shapeData.label">{{ shapeData.label }}</div>
    <div v-else-if="!mini" class="shape-item" :title="schema + shapeData.label">
      <img v-if="!isCurrentStep || $route.query.type === 'META_MODEL'" :src="imgSrc" alt="" width="12">
      {{ schema }}{{ shapeData.label }}
    </div>
    <i class="problem-count" v-if="!mini && shapeData.qualityNum"
       style="display:none;position: absolute;font-size: 12px;right: -3px;top: -13px;padding: 0 6px;height: 18px; text-align: center;background: #f2220a;border-radius: 9px 9px 9px 1px;border: 1px solid #b6dbff;min-width: 20px;color: #fff;line-height: 18px;vertical-align: bottom;font-style:normal;z-index: 8;">{{ shapeData.qualityNum }}</i>
    </div>
  `,
  props: {
    rawData: Object,
    shapeData: StepShape,
    isJoining: Boolean, // 是否正在进行链接操作，如果是
    showModelMessage: Boolean,
    mini: Boolean,
    supportEdit: Boolean,
    edges: {},
    shapesMap: {},
  },
  data() {
    let imgSrc
    switch (this.shapeData.stepType) {
      case StepType.METRICS:
        imgSrc = require('@/assets/images/search/index.svg')
        break
      case StepType.REPORT:
        imgSrc = require('@/assets/images/search/report.svg')
        break
      default:
        imgSrc = require('@/assets/images/search/table.svg')
        break
    }
    return {
      imgSrc: imgSrc,
      stepTriangleSrc: require('../asset/step_triangle.svg'),
      isDblclick: false,
    }
  },
  mounted() {
    let typeId = this.rawData?.steps[this.shapeData.id].properties.typeId || ''
    if (typeId && typeId !== '80000004') {
      HTTP2.getMetaModelIconNew(typeId)
        .then(res => {
          if (res.data && res.data.size > 0) {
            // 检查返回的blob是否有内容
            const blob = new Blob([res.data], { type: 'image/png' })
            const iconUrl = URL.createObjectURL(blob)
            this.imgSrc = iconUrl

            this.$once('hook:beforeDestroy', () => {
              URL.revokeObjectURL(iconUrl)
            })
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    }
  },
  computed: {
    schema() {
      if (this.shapeData.schema === '@@') {
        return ''
      } else if (
        [StepType.CURSOR, StepType.CURSOR_VAR, StepType.REPORT].includes(
          this.shapeData.stepType
        )
      ) {
        return ''
      } else if (!!!this.shapeData.schema) {
        return ''
      } else {
        return this.shapeData.schema + '.'
      }
    },
    isCurrentStep() {
      if (this.rawData) {
        const properties = this.rawData.steps[this.shapeData.id].properties
        return properties.$is_current
      }
    },
    isLastStep() {
      if (this.rawData) {
        const properties = this.rawData.steps[this.shapeData.id].properties
        return properties.$is_last
      }
    },
    hasNextStep() {
      if (this.rawData) {
        const properties = this.rawData.steps[this.shapeData.id].properties
        return properties.$has_next
      }
    },
    isFirstStep() {
      if (this.rawData) {
        const properties = this.rawData.steps[this.shapeData.id].properties
        return properties.$is_first
      }
    },
    hasPrevStep() {
      if (this.rawData) {
        const properties = this.rawData.steps[this.shapeData.id].properties
        return properties.$has_prev
      }
    },
  },
  methods: {
    handleTableClick() {
      let typeId = this.rawData?.steps[this.shapeData.id].properties.typeId || ''
      if (typeId) {
      } else {
        setTimeout(() => {
          if (this.isDblclick) {
          } else {
            this.$emit('show-detail-tabs', this.shapeData)
          }
        }, 300)
      }
    },
    handleDblClick() {
      // this.viewAsset()
      this.isDblclick = true
      setTimeout(() => {
        console.log('remove-is-dbl-click')
        this.isDblclick = false
      }, 1000)
      this.$emit('find-children-and-parents', this.shapeData)
    },
    viewAsset() {
      let objectId = ''
      if (
        [StepType.INPUT, StepType.OUTPUT, StepType.PROCESS].includes(
          this.shapeData.stepType
        )
      ) {
        if (this.rawData && this.rawData.steps[this.shapeData.id]) {
          objectId = this.rawData.steps[this.shapeData.id].id
          if (isNaN(objectId - 0)) {
            objectId = objectId.slice(4)
          }
        }
        if (objectId) {
          if (this.rawData.steps[this.shapeData.id].properties?.typeId) {
            this.$skip2({ name: 'dataCatalog', query: { objectId: objectId, type: 'META_MODEL' } })
          } else {
            this.$skip2({ name: 'dataCatalog', query: { objectId: objectId } })
          }
          // const pos = location.href.indexOf('#/')
          // const baseUrl = location.href.slice(0, pos + 2)
          // window.open(
          //   baseUrl + `main/meta?objectId=${objectId}&blank=true`,
          //   '_blank'
          // )
        } else {
          throw new Error('跳转失败，原因是未找到元数据的$object_id')
        }
      } else if (StepType.METRICS === this.shapeData.stepType) {
        let domainId = this.shapeData.id.slice(8)
        this.$skip2({ name: 'indexDefinition', query: { id: domainId } })
      } else {
        console.log(this.shapeData, StepType.METRICS, this.shapeData.stepType)
      }
    },
    // 元数据页面中的右键事件
    handleContextMenu(evt) {
      if (
        ![
          StepType.INPUT,
          StepType.OUTPUT,
          StepType.PROCESS,
          StepType.IS_CURRENT,
        ].includes(this.shapeData.stepType)
      ) {
        return // 暂时只有元数据支持
      }
      const options = []
      if (StepType.PROCESS === this.shapeData.stepType) {
        options.push({
          icon: 'iconfont icon-see',
          label: '查看',
          callback: () => {
            this.viewAsset()
          },
          args: null,
        })
      }
      if (this.isLastStep && this.hasNextStep) {
        options.push({
          icon: 'el-icon-right',
          label: '展开下一级',
          callback: () => {
            this.$emit('find-children', this.shapeData)
          },
          disabled: false,
          args: null,
        })
      } /* else {
        options.push({
          icon: 'iconfont icon-rightarrow',
          label: '没有下一级了',
          callback: () => {
            console.log('next')
          },
          disabled: true,
          args: null,
        })
      } */
      if (this.isFirstStep && this.hasPrevStep) {
        options.push({
          icon: 'el-icon-left',
          label: '展开上一级',
          callback: () => {
            this.$emit('find-parents', this.shapeData)
          },
          args: null,
        })
      } /* else {
        options.push({
          icon: 'iconfont icon-leftarrow',
          label: '没有上一级了',
          callback: () => {
            console.log('next')
          },
          disabled: true,
          args: null,
        })
      } */

      const { clientX: x, clientY: y } = evt
      if (options.length > 0) {
        let yOfResult = y
        let bottomMargin = 30 * options.length + 15
        if (window.innerHeight - y < bottomMargin) {
          yOfResult = window.innerHeight - bottomMargin
        }
        this.$bus.$emit('callContextMenu', {
          x: x,
          y: yOfResult,
          options: options,
          placement: 'right',
        })
      }
    },
  },
  mixins: [dragMethods],
}
const ColumnView = {
  template: `
    <div v-if="!mini"
      class="column shape-item"
      :title="shapeData.label"
      @click="handleColumnClick"
      @contextmenu.stop.prevent="handleContextMenu"
      @dblclick.stop.prevent="handleDblClick"
    >
      {{ shapeData.label }}
    </div>
  `,
  props: {
    shapeData: ColumnShape,
    mini: Boolean,
    isJoining: Boolean, // 是否正在进行链接操作，如果是
    supportEdit: Boolean,
    rawData: {},
    edges: {},
    shapesMap: {},
  },
  methods: {
    handleColumnClick() {
      if (!this.supportEdit) {
        return
      }
      if (this.isJoining) {
        this.$emit('finish-relation', this.shapeData)
      }
    },
    handleContextMenu(evt) {
      if (!this.supportEdit) {
        return
      }
      if (this.isJoining) {
        return
      }
      this.$el.click()
      const options = [
        {
          icon: 'el-icon-plus',
          label: '建立血缘关系',
          callback: () => {
            this.startRelation()
          },
          args: null,
        },
      ]
      {
        // 找出本字段的关系
        const relations = []
        const columnId = this.shapeData.id
        this.edges.forEach(edge => {
          if (edge.source === columnId && !edge.readyToDelete) {
            if (edge.$user_custom) {
              try {
                relations.push({
                  source: edge.source,
                  target: edge.target,
                  sourceStepId: edge.sourceStepId,
                  targetStepId: edge.targetStepId,
                  sourceLabel: '到 ',
                  targetLabel: this.targetLabelFormatter(edge),
                })
              } catch (e) {
                console.error('错误的关系匹配', edge)
              }
            } else {
              console.warn('当前关系是自动解析出的，因此不允许删除')
            }
          }
        })
        this.edges.forEach(edge => {
          if (edge.target === columnId && !edge.readyToDelete) {
            if (edge.$user_custom) {
              try {
                relations.push({
                  source: edge.source,
                  target: edge.target,
                  sourceStepId: edge.sourceStepId,
                  targetStepId: edge.targetStepId,
                  targetLabel: this.sourceLabelFormatter(edge),
                  sourceLabel: ' 来自 ',
                })
              } catch (e) {
                console.error('错误的关系匹配', edge)
              }
            } else {
              console.warn('当前关系是自动解析出的，因此不允许删除')
            }
          }
        })
        relations.forEach(relation => {
          options.push({
            icon: 'iconfont icon-delete',
            label: `删除${relation.sourceLabel}${relation.targetLabel}的血缘关系`,
            callback: () => {
              this.deleteRelation(relation)
            },
            args: null,
          })
        })
      }
      const { clientX: x, clientY: y } = evt
      if (options.length > 0) {
        let yOfResult = y
        let bottomMargin = 30 * options.length + 15
        if (window.innerHeight - y < bottomMargin) {
          yOfResult = window.innerHeight - bottomMargin
        }
        this.$bus.$emit('callContextMenu', {
          x: x,
          y: yOfResult,
          options: options,
          placement: x < 500 ? 'right' : 'left',
        })
      }
    },
    handleDblClick() {
      this.startRelation()
    },
  },
  mixins: [],
}
export { GroupView, TableView, ColumnView }
