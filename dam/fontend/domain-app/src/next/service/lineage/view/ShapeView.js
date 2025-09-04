import {
  GroupShape,
  StepShape,
  ColumnShape,
} from '@/next/service/lineage/types/Shape'
import { StepType } from '@/next/service/lineage/types/ShapeType.ts'
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
      <div v-else-if="!mini" class="shape-item" :title="schema + shapeData.label">{{ schema }}{{ shapeData.label }}</div>
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
  computed: {
    schema() {
      if (!this.shapeData.schema || this.shapeData.schema === '@@') {
        return ''
      } else if (
        [StepType.CURSOR, StepType.CURSOR_VAR].includes(this.shapeData.stepType)
      ) {
        return ''
      } else if (
        [StepType.CURSOR, StepType.CURSOR_VAR].includes(this.shapeData.stepType)
      ) {
        return ''
      } else {
        return this.shapeData.schema + '.'
      }
    },
  },
  methods: {
    handleTableClick() {
      if (!this.supportEdit) {
        return
      }
      if (this.isJoining) {
        this.$emit('finish-relation', this.shapeData)
      }
    },
    handleContextMenu(evt) {
      const writable = this.$route.query.writable === 'true'
      if (this.isJoining || !writable) {
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
    },
    handleDblClick(e) {
      if (this.supportEdit) {
        this.startRelation()
      } else {
        this.viewTable()
      }
    },
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
