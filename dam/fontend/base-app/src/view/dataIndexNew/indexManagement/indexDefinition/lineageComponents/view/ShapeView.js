import { GroupShape, StepShape, ColumnShape } from '../types/Shape.ts'
import { StepType } from '../types/ShapeType.ts'

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
const relationMethods = {
  methods: {
    startRelation() {
      if (!this.supportEdit) {
        return
      }
      this.$emit('start-relation', this.shapeData)
      this.$datablauMessage({
        message: '请单击目标以完成操作',
        type: 'info',
      })
    },
    deleteRelation(relation) {
      this.$emit('delete-relation', relation)
    },
    sourceLabelFormatter(edge) {
      let label =
        this.shapesMap.get(edge.sourceStepId).schema +
        '.' +
        this.shapesMap.get(edge.sourceStepId).label
      if (edge.sourceStepId !== edge.source) {
        label += '.' + this.shapesMap.get(edge.source).label
      }
      return label
    },
    targetLabelFormatter(edge) {
      let label =
        this.shapesMap.get(edge.targetStepId).schema +
        '.' +
        this.shapesMap.get(edge.targetStepId).label
      if (edge.targetStepId !== edge.target) {
        label += '.' + this.shapesMap.get(edge.target).label
      }
      return label
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
      <div v-if="showModelMessage && !mini" class="shape-item">schema: {{ shapeData.schema }}</div>
      <div v-if="showModelMessage && !mini" class="shape-item" :title="shapeData.label">{{ shapeData.label }}</div>
      <div v-else-if="!mini" class="shape-item" :title="schema + shapeData.label">
        <img :src="imgSrc" alt="" width="12">
        {{ schema }}{{ shapeData.label }}</div>
      <i class="problem-count" v-if="!mini && shapeData.qualityNum" style="position: absolute;font-size: 12px;right: -3px;top: -13px;padding: 0 6px;height: 18px; text-align: center;background: #f2220a;border-radius: 9px 9px 9px 1px;border: 1px solid #b6dbff;min-width: 20px;color: #fff;line-height: 18px;vertical-align: bottom;font-style:normal;z-index: 8;display:none;">{{ shapeData.qualityNum }}</i>
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
      } else {
        return this.shapeData.schema + '.'
      }
    },
  },
  methods: {
    handleTableClick() {
      this.$emit('show-detail-tabs', this.shapeData)
      return
      if (!this.supportEdit) {
        return
      }
      if (this.isJoining) {
        this.$emit('finish-relation', this.shapeData)
      }
    },
    handleDblClick() {
      this.viewAsset()
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
          // this.$skip2({ name: 'table', query: { objectId: objectId } })
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
        ![StepType.INPUT, StepType.OUTPUT, StepType.PROCESS].includes(
          this.shapeData.stepType
        )
      ) {
        return // 暂时只有元数据支持
      }
      const options = [
        {
          icon: 'iconfont icon-see',
          label: '查看',
          callback: () => {
            this.viewAsset()
          },
          args: null,
        },
      ]
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
    // 原组件中的右键事件
    /* handleContextMenu1(evt) {
      return
      if (this.isJoining) {
        return
      }
      const options = [
        {
          icon: 'iconfont icon-see',
          label: '查看元数据',
          callback: () => {
            this.viewTable()
          },
          args: null,
        },
      ]
      if (this.supportEdit) {
        options.push({
          line: 'solid',
        })
        options.push({
          icon: 'el-icon-plus',
          label: '建立血缘关系',
          callback: () => {
            this.startRelation()
          },
          args: null,
        })
        {
          // 找出本字段的关系
          const relations = []
          const tableId = this.shapeData.id
          this.edges.forEach(edge => {
            if (edge.source === tableId && !edge.readyToDelete) {
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
            if (edge.target === tableId && !edge.readyToDelete) {
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
        if (this.shapeData.$user_custom) {
          options.push({
            line: 'solid',
          })
          options.push({
            icon: 'iconfont icon-delete',
            label: '删除元数据',
            callback: () => {
              this.deleteTable()
            },
            args: null,
          })
        } else {
          console.warn(
            '当前表是自动解析的，不允许删除，因此菜单中没有删除的选项'
          )
        }
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
          placement: 'right',
        })
      }
    }, */
    /* handleDblClick1(e) {
      return
      if (this.supportEdit) {
        this.startRelation()
      } else {
        this.viewTable()
      }
    }, */
    viewTable() {
      let objectId = null
      if (this.shapeData && this.shapeData.dataStructure) {
        // 表示表是尚未保存的
        objectId = this.shapeData.dataStructure.properties.$obj_id
      } else if (this.rawData && this.rawData.steps[this.shapeData.id]) {
        // 表示表是本次编辑之前已经存在的
        objectId = this.rawData.steps[this.shapeData.id].properties.$obj_id
      }
      if (objectId) {
        const pos = location.href.indexOf('#/')
        const baseUrl = location.href.slice(0, pos + 2)
        window.open(
          baseUrl + `main/meta?objectId=${objectId}&blank=true`,
          '_blank'
        )
      } else {
        throw new Error('跳转失败，原因是未找到元数据的$object_id')
      }
    },
    deleteTable() {
      this.$confirm(`确定要删除${this.schema + this.shapeData.label}吗？`, '', {
        type: 'warning',
      }).then(() => {
        this.$emit('remove-table', this.shapeData)
      })
    },
  },
  mixins: [dragMethods, relationMethods],
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
  mixins: [relationMethods],
}
export { GroupView, TableView, ColumnView }
