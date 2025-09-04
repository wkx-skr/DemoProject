import {
  GroupShape,
  StepShape,
  ColumnShape,
} from '@/next/service/lineage/types/Shape'
import Drag from '../class/Drag'
import { StepType } from '../types/ShapeType.ts'
const dragMethods = {
  methods: {
    handleMousedown(e) {
      // 暂时禁止拖拽
      // TODO 修改拖拽
      return
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
      let label = (this.shapesMap.get(edge.sourceStepId).schema ? this.shapesMap.get(edge.sourceStepId).schema + '.' : '')
        +
        this.shapesMap.get(edge.sourceStepId).label
      if (edge.sourceStepId !== edge.source) {
        label += '.' + this.shapesMap.get(edge.source).label
      }
      return label
    },
    targetLabelFormatter(edge) {
      let label =
        this.shapesMap.get(edge.targetStepId).schema +
        (this.shapesMap.get(edge.targetStepId).schema ? '.' : '')
        +
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
    <div v-else-if="!mini" class="shape-item" style="height: 24px;line-height: 24px;" :title="labelShow">
      <!--<img :src="imgSrc" alt="" width="12">-->
      <span :style="iconStyle"></span>
      {{ labelShow }}
    </div>
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
    let properties = this.shapeData.originData?.properties || {}
    let objectType = properties.objectType || ''
    switch (objectType) {
      case '主题':
      case 'Archy主题':
        imgSrc = require('@/assets/images/modelTree/diagram.png')
        break
      case '业务对象':
      case 'Archy业务对象':
      case 'Archy业务领域':
        imgSrc = require('@/assets/images/mxgraphEdit/Business.svg')
        break
      case '图表':
      case '实体':
      case '图形':
        imgSrc = require('@/assets/images/panedetail_icon/table.svg')
        break
      case '视图':
        imgSrc = require('@/assets/images/panedetail_icon/view.svg')
        break
      case '字段':
        imgSrc = require('@/assets/images/mxgraph/Column.png')
        break
      default:
        // '模型'
        imgSrc = require('@/assets/images/search/model.svg')
        break
    }
    return {
      imgSrc: imgSrc,
      iconStyle: {
        display: 'inline-block',
        width: '16px',
        height: '16px',
        margin: '4px 4px 0 0',
        verticalAlign: 'top',
        background: `center / contain no-repeat url("${imgSrc}")`
      }
    }
  },
  computed: {
    labelShow() {
      let result = this.shapeData.label
      let properties = this.shapeData.originData?.properties || {}
      if (properties.objectType === '图表') {
        result = `${properties.modelName}.${result}`
      }
      return result
    },
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
    showSkip() {
      let bool = false
      let properties = this.shapeData?.originData?.properties || {}
      let objectType = properties.objectType || ''
      switch (objectType) {
        case '图形':
        case 'Archy主题':
        case 'Archy业务对象':
        case 'Archy业务领域':
        case '':
          break
        case '图表':
        case '业务对象':
        case '实体':
        case '字段':
        case '视图':
        default:
          bool = true
      }
      return bool
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
      let properties = this.shapeData?.originData?.properties || {}
      let objectType = properties.objectType || ''
      let modelId = this.shapeData.originData?.properties?.$model_id
      let objectId = ''
      let baseUrl = `${location.origin}${location.pathname}`
      let url = ''
      switch (objectType) {
        // case '主题':
        case '图表': // 主题
          objectId = properties.$ddm_obj
          this.$skip2({
            modelId,
            type: 'diagram',
            objectId
          })
          break
        case '业务对象':
        case '实体':
        case '视图':
          objectId = properties.$ddm_obj;
          this.$skip2({
            modelId,
            type: 'table',
            objectId
          })
          break
        case '字段':
          objectId = properties.parentEntityId
          this.$skip2({
            modelId,
            type: 'table',
            objectId
          })
          break
        case '图形':
          break
        case 'Archy主题':
          // url = `${baseUrl}#/main/modelTheme/detail/${objectId}`
          // window.open(url, '_blank')
          break
        case 'Archy业务对象':
          // url = `${baseUrl}#/main/businessArea/ConceptualBusinessDomain/detail/${objectId}?showHistory=true`
          // window.open(url, '_blank')
          break
        case 'Archy业务领域':
        case '':
          // // 概念数据模型
          // url = `${baseUrl}#/main/businessArea/ConceptualBusinessDomain/detail/${objectId}?showHistory=true`
          // // 业务逻辑模型
          // url = `${baseUrl}#/main/businessArea/LogicalBusinessDomain/detail/${objectId}?showHistory=true`
          // window.open(url, '_blank')
          break
        default: // 模型
          objectId = this.shapeData.originData?.properties?.$model_id
          this.$skip2({type: 'model', objectId, modelId: objectId})
          break
      }
    },
    // 元数据页面中的右键事件
    handleContextMenu(evt) {
      if (!this.showSkip) {
        return
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
      // 暂时禁用右键
      options.length = 0
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
      return;
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
