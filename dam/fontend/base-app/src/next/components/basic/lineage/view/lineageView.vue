<template>
  <div
    :style="{
      transform: `scale(${viewScale})`,
      'transform-origin': '0% 0%',
      transition: !mini ? 'transform 0.4s' : '',
    }"
    @click="handleClickBackground"
    class="l-6dot2"
  >
    <div
      class="shape"
      v-for="(shape, idx) in shapes.filter(i => !i.readyToDelete)"
      :key="shape.id"
      @click.stop="handleShapeClick(shape)"
      @mouseover.stop="handleShapeMouseOver(shape)"
      @mouseleave.stop="handleShapeMouseOut(shape)"
      :class="{
        table: shape.shapeType === ShapeType.STEP,
        column: shape.shapeType === ShapeType.COLUMN,
        group: shape.shapeType === ShapeType.GROUP,
        'is-current':
          shape.shapeType === ShapeType.STEP &&
          shape.stepType === StepType.IS_CURRENT,
        'input-table':
          shape.shapeType === ShapeType.STEP &&
          shape.stepType === StepType.INPUT,
        'output-table':
          shape.shapeType === ShapeType.STEP &&
          shape.stepType === StepType.OUTPUT,
        'cursor-table':
          shape.shapeType === ShapeType.STEP &&
          shape.stepType === StepType.CURSOR,
        'cursor-var-table':
          shape.shapeType === ShapeType.STEP &&
          shape.stepType === StepType.CURSOR_VAR,
        'metrics-table':
          shape.shapeType === ShapeType.STEP &&
          shape.stepType === StepType.METRICS,
        'report-table':
          shape.shapeType === ShapeType.STEP &&
          shape.stepType === StepType.REPORT,
        highlight: highlightShapes.has(shape.id),
      }"
      :style="[
        {
          left: shape.x + 'px',
          top: shape.y + 'px',
          width: shape.width + 'px',
          height: shape.height + 'px',
        },
      ]"
    >
      <group-view
        v-if="shape.shapeType === ShapeType.GROUP"
        :shape-data="shape"
        @update-position="updatePosition"
        :mini="mini"
      ></group-view>
      <table-view
        :mini="mini"
        v-if="shape.shapeType === ShapeType.STEP"
        :raw-data="rawData"
        :edges="edges"
        :shapesMap="shapesMap"
        :showModelMessage="showModelMessage"
        :shape-data="shape"
        :support-edit="supportEdit"
        @start-relation="handleStartRelation"
        @finish-relation="handleFinishRelation"
        @delete-relation="handleDeleteRelation"
        @update-position="updatePosition"
        @remove-table="removeTable"
        @show-detail-tabs="showDetailTabs"
        :is-joining="isJoining"
        @onDblClick="onDblClick($event)"
        @find-children="findChildren"
        @find-parents="findParents"
        @find-children-and-parents="findChildrenAndParents"
      ></table-view>
      <column-view
        :mini="mini"
        v-else-if="shape.shapeType === ShapeType.COLUMN"
        :shape-data="shape"
        :raw-data="rawData"
        :edges="edges"
        :shapesMap="shapesMap"
        :support-edit="supportEdit"
        @start-relation="handleStartRelation"
        @finish-relation="handleFinishRelation"
        @delete-relation="handleDeleteRelation"
        :is-joining="isJoining"
      ></column-view>
      <!--      <div v-if="showModelMessage && shape.shapeType === ShapeType.STEP">-->
      <!--        schema: {{ shape.schema }}-->
      <!--      </div>-->
      <!--      {{ shape.label }}-->
    </div>
    <canvas
      ref="canvas"
      :key="canvasKey"
      @contextmenu.prevent
      @click="handleCanvasClick"
      :style="{ cursor: isPointerInCanvas ? 'pointer' : 'default' }"
    ></canvas>
  </div>
</template>

<script>
import Configuration from '../class/Configuration'
import { ShapeType, StepType } from '../types/ShapeType'
import { StepShape, ColumnShape, Shape } from '../types/Shape'
import { GroupView, TableView, ColumnView } from './ShapeView'
import EdgeView from './EdgeView'
import { Record, RecordType } from '../class/Record'
import Log from '../class/Log'
import Version from '../class/Version'
import GraphType from '../types/GraphType'

export default {
  components: {
    GroupView,
    TableView,
    ColumnView,
  },
  props: {
    mini: Boolean,
    graphType: GraphType,
    rawData: Object,
    supportEdit: Boolean,
  },
  data() {
    return {
      ShapeType: ShapeType,
      StepType: StepType,
      shapes: [],
      shapesMap: new Map(),
      edges: [],
      edgesMap: new Map(),
      ctx: null,
      canvasKey: 0,
      showModelMessage: false,
      edgeView: null,
      mouseOverTimeout: null,
      mouseOutTimeout: null,
      highlightShapes: new Set(),
      lockHighlight: false,
      LineageGraph: null,
      viewScale: 1,
      isJoining: false, // 是否正在建立字段之间的血缘关系
      edgeSource: null, // 起始字段
      edgeTarget: null, // 结束字段
      isPointerInCanvas: false,
      catchCurrent: null,
    }
  },
  methods: {
    findChildren(args) {
      this.$emit('find-children', args)
    },
    findParents(args) {
      this.$emit('find-parents', args)
    },
    findChildrenAndParents(args) {
      this.$emit('find-children-and-parents', args)
    },
    showDetailTabs(details) {
      this.$emit('show-detail-tabs', details)
    },
    setLineageObj(lineage) {
      this.LineageGraph = lineage
    },
    addEdge() {
      const edge = {
        source: this.edgeSource.id,
        sourceStepId:
          this.edgeSource instanceof StepShape
            ? this.edgeSource.id
            : this.edgeSource.tId,
        target: this.edgeTarget.id,
        targetStepId:
          this.edgeTarget instanceof StepShape
            ? this.edgeTarget.id
            : this.edgeTarget.tId,
      }
      // 临时解决方案,根据byUser属性判断是否是用户添加的关系
      edge.byUser = true
      this.edges.push(edge)
      this.createRecord(
        RecordType.ADD_EDGE,
        `添加关系${this.edgeSource.id}到${this.edgeTarget.id}`,
        edge
      )
      this.setEdges()
    },
    getUUid(id) {
      let str = (1e11 + id).toString(35)
      let arr = str.split('')
      arr.reverse()
      return arr.join('')
    },
    updateInputAndOutputProperties() {
      const updateRawData = (stepId, isInput, isOutput) => {
        if (this.rawData.steps[stepId]) {
          const p = this.rawData.steps[stepId].properties
          if (!isInput && !isOutput) {
            delete p.$input_table
            delete p.$output_table
          }
          if (isInput) {
            p.$input_table = 'true'
          } else {
          }
          if (isOutput) {
            p.$output_table = 'true'
          } else {
          }
        } else {
          Log.importantLog(stepId + ' mismatch')
        }
      }
      const TEMP = -1
      this.shapes.forEach(shape => {
        if (shape instanceof StepShape) {
          if (shape.stepType !== StepType.PROCESS) {
            // shape.stepType = TEMP
            // updateRawData(shape.id, false, false)
          }
        }
      })
      this.edges.forEach(({ source, sourceStepId, target, targetStepId }) => {
        const targetStep = this.shapesMap.get(targetStepId)
        if (targetStep && targetStep.stepType !== StepType.PROCESS) {
          // targetStep.stepType = StepType.OUTPUT
          // updateRawData(targetStepId, false, true)
        }

        const sourceStep = this.shapesMap.get(sourceStepId)
        if (sourceStep && sourceStep.stepType !== StepType.PROCESS) {
          if (sourceStep.stepType !== StepType.OUTPUT) {
            // sourceStep.stepType = StepType.INPUT
            // updateRawData(sourceStepId, true, false)
          }
        }
      })
      this.shapes.forEach(shape => {
        if (shape instanceof StepShape) {
          if (shape.stepType === TEMP) {
            // shape.stepType = StepType.OUTPUT
            // updateRawData(shape.id, false, true)
          }
        }
      })
    },
    addTable({ table, columns, position }) {
      const recordContent = []
      let width = Configuration.TABLE_WIDTH
      let headerHeight = Configuration.TABLE_HEIGHT
      if (this.showModelMessage) {
        headerHeight = Configuration.TABLE_FULL_HEIGHT
      }
      let height = headerHeight
      height +=
        columns.length * Configuration.COLUMN_HEIGHT +
        Configuration.COLUMN_MARGIN
      const shape = new StepShape(
        String(this.getUUid(table.objectId)),
        StepType.OUTPUT,
        true,
        width,
        height,
        position.x,
        position.y,
        table.physicalName,
        table.schema,
        undefined
      )
      shape.dataStructure = {
        name: table.physicalName,
        schema: table.schema,
        alias: [],
        id: this.getUUid(table.objectId),
        properties: {
          $obj_id: String(table.objectId),
          $table_lineage: 'false',
          $dam_obj: 'true',
          $model_id: String(table.parentId),
          $model_category_id: String(table.modelCategoryId),
          $output_table: 'true',
          $user_custom: true,
        },
        columns: columns.map((col, index) => {
          return {
            stepId: this.getUUid(table.objectId),
            name: col.physicalName,
            id: this.getUUid(col.objectId),
            type: null,
            order: index,
            properties: {
              $obj_id: String(col.objectId),
            },
          }
        }),
      }

      // 更新canvas画布尺寸
      this.$refs.canvas.width < width + position.x + 20
        ? (this.$refs.canvas.width = width + position.x + 20)
        : this.$refs.canvas.width
      this.$refs.canvas.height < height + position.y + 20
        ? (this.$refs.canvas.height = height + position.y + 20)
        : this.$refs.canvas.height

      // 临时解决方案,根据byUser属性判断是否是用户添加的表
      shape.byUser = true

      recordContent.push(_.clone(shape))
      this.shapes.push(shape)
      this.shapesMap.set(shape.id, shape)
      columns.sort((a, b) => {
        return a.ordinal - b.ordinal
      })
      columns.forEach((column, idx) => {
        const shape = new ColumnShape(
          this.getUUid(table.objectId),
          position.x,
          position.y,
          this.getUUid(column.objectId),
          Configuration.TABLE_WIDTH - Configuration.COLUMN_MARGIN * 2,
          Configuration.COLUMN_HEIGHT,
          position.x + Configuration.COLUMN_MARGIN,
          position.y + Configuration.COLUMN_HEIGHT * idx + headerHeight,
          column.physicalName
        )
        // 临时解决方案,根据byUser属性判断是否是用户添加的表
        shape.byUser = true
        this.shapes.push(shape)
        this.shapesMap.set(shape.id, shape)
        recordContent.push(_.clone(shape))
      })
      Log.basicLog(
        `${table.objectId}已经添加到画布,坐标(${position.x},${position.y})`
      )
      this.createRecord(
        RecordType.ADD_TABLE,
        `添加表${table.objectId}到(${position.x},${position.y})`,
        recordContent
      )
    },
    removeTable(shape) {
      shape.readyToDelete = true
      const listOfShape = [shape.id]
      this.shapes.forEach(s => {
        if (s.tId === shape.id) {
          s.readyToDelete = true
          listOfShape.push(s.id)
        }
      })
      this.setEdges()
      this.createRecord(RecordType.REMOVE_TABLE, `删除表`, listOfShape)
    },
    updateRedoAndUndoStatus() {
      return
      const canUndo = Record.canUndo()
      const canRedo = Record.canRedo()
      this.$emit('update-can-undo', canUndo)
      this.$emit('update-can-redo', canRedo)
    },
    clearRecords() {
      return
      Log.importantLog(`血缘图重绘，Record已被清空`)
      Record.clearRecords()
      this.updateRedoAndUndoStatus()
    },
    createRecord(recordType, recordMessage, recordContent) {
      return
      Record.createRecord({
        recordMessage: recordMessage,
        recordType: recordType,
        recordContent: recordContent,
      })
      Log.basicLog(`本次操作已被记录到Record`)
      Log.basicLog(`=================================`)
      this.updateRedoAndUndoStatus()
    },
    undo() {
      Log.importantLog('Undo')
      const record = Record.undo()

      if (record.recordType === RecordType.MOVE) {
        record.recordContent.forEach(shape => {
          const currentShape = this.shapesMap.get(shape.id)
          currentShape.x = shape.oldX
          currentShape.y = shape.oldY
        })
      } else if (record.recordType === RecordType.ADD_TABLE) {
        this.shapes.length = this.shapes.length - record.recordContent.length
        record.recordContent.forEach(shape => {
          this.shapesMap.delete(shape.id)
        })
      } else if (record.recordType === RecordType.REMOVE_TABLE) {
        record.recordContent.forEach(shapeId => {
          this.shapesMap.get(shapeId).readyToDelete = false
        })
        this.setEdges()
      } else if (record.recordType === RecordType.ADD_EDGE) {
        this.edges.pop()
        this.setEdges()
      } else if (record.recordType === RecordType.REMOVE_EDGE) {
        this.edges[record.recordContent].readyToDelete = false
        this.setEdges()
      } else {
        throw new Error('unknown undo process')
      }
      this.updateRedoAndUndoStatus()
      this.setEdges()
      this.LineageGraph.setMiniViewStyle()
    },
    redo() {
      Log.importantLog('Redo')
      const record = Record.redo()
      if (record.recordType === RecordType.MOVE) {
        record.recordContent.forEach(shape => {
          const currentShape = this.shapesMap.get(shape.id)
          currentShape.x = shape.x
          currentShape.y = shape.y
        })
      } else if (record.recordType === RecordType.ADD_TABLE) {
        record.recordContent.forEach(shape => {
          const s = _.clone(shape)
          this.shapes.push(s)
          this.shapesMap.set(shape.id, s)
        })
      } else if (record.recordType === RecordType.ADD_EDGE) {
        this.edges.push(record.recordContent)
        this.setEdges()
      } else if (record.recordType === RecordType.REMOVE_TABLE) {
        record.recordContent.forEach(shapeId => {
          this.shapesMap.get(shapeId).readyToDelete = true
        })
        this.setEdges()
      } else if (record.recordType === RecordType.REMOVE_EDGE) {
        this.edges[record.recordContent].readyToDelete = true
        this.setEdges()
      } else {
        throw new Error('unknown redo process')
      }
      this.updateRedoAndUndoStatus()
      this.setEdges()
      this.LineageGraph.setMiniViewStyle()
    },
    updateLineageGraph(
      { addedStep, addedEdge, removedEdge, removedStep },
      callback
    ) {
      const steps = _.clone(this.rawData.steps)
      const lines = _.clone(this.rawData.lines)
      const filteredLines = []
      lines.forEach(line => {
        if (
          !removedEdge
            .map(i => this.getEdgeId(i))
            .includes(this.getEdgeId(line)) &&
          !removedStep.includes(line.target) &&
          !removedStep.includes(line.source)
        ) {
          filteredLines.push(line)
        }
      })
      addedEdge.forEach(item => {
        if (!item.properties) {
          item.properties = {}
        }
        item.properties.$user_custom = true

        filteredLines.push(item)
      })
      addedStep.forEach(step => {
        if (step.dataStructure) {
          steps[step.dataStructure.id] = step.dataStructure
        }
      })
      removedStep.forEach(stepId => {
        delete steps[stepId]
      })
      this.$http
        .post(
          this.$url +
            `/service/lineage/updateLinageContent?lineageId=${this.$route.query.id}`,
          {
            steps: steps,
            lines: filteredLines,
          }
        )
        .then(() => {
          if (callback) {
            callback()
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    save() {
      Log.importantLog('已保存Record到Version，Record列表被清空')
      const positions = new Map()
      this.shapesMap.forEach(shape => {
        positions.set(shape.id, {
          x: shape.x,
          y: shape.y,
          width: shape.width,
          height: shape.height,
        })
      })
      this.updateLineageGraph(
        {
          addedStep: this.shapes.filter(i => i.byUser),
          addedEdge: this.edges.filter(i => i.byUser),
          removedEdge: this.edges.filter(i => i.readyToDelete),
          removedStep: this.shapes.filter(i => i.readyToDelete).map(i => i.id),
        },
        () => {
          Version.createVersion({
            positions: positions,
          }).then(() => {
            this.$emit('get-version-list')
          })
          Record.clearRecords()
          this.clearRecords()
        }
      )
    },
    updatePosition({ id, left, top }) {
      const recordContent = []
      const updateColumnsPosition = step => {
        const stepId = step.id
        // 根据表更新字段的坐标
        this.shapes
          .filter(shape => {
            return shape.tId && shape.tId === stepId
          })
          .forEach((shape, idx) => {
            shape.oldX = shape.x
            shape.oldY = shape.y
            shape.x = step.x + Configuration.COLUMN_MARGIN
            shape.y =
              step.y +
              idx * Configuration.COLUMN_HEIGHT +
              (this.showModelMessage
                ? Configuration.TABLE_FULL_HEIGHT
                : Configuration.TABLE_HEIGHT)
            recordContent.push(_.clone(shape))
          })
      }
      const currentShape = this.shapesMap.get(id)
      recordContent.push(_.clone(currentShape))
      Log.basicLog(`移动表${id}到(${currentShape.x},${currentShape.y})`)
      Log.basicLog(`${id}的坐标已经更新完毕，开始更新其影响的元素的位置`)
      if (currentShape.shapeType === ShapeType.STEP) {
        updateColumnsPosition(currentShape)
        Log.basicLog(`----${id}的字段坐标已经更新完毕`)
        this.createRecord(
          RecordType.MOVE,
          `移动表${id}到(${currentShape.x},${currentShape.y})`,
          recordContent
        )
        if (currentShape.groupId) {
          const group = this.shapesMap.get(currentShape.groupId)
          const range = {
            x0: 100000,
            x1: 0,
            y0: 100000,
            y1: 0,
          }
          this.shapes.forEach(shape => {
            if (
              shape.shapeType === ShapeType.STEP &&
              shape.groupId === currentShape.groupId
            ) {
              if (shape.x < range.x0) {
                range.x0 = shape.x
              }
              if (shape.x + shape.width > range.x1) {
                range.x1 = shape.x + shape.width
              }
              if (shape.y < range.y0) {
                range.y0 = shape.y
              }
              if (shape.y + shape.height > range.y1) {
                range.y1 = shape.y + shape.height
              }
            }
          })
          group.oldX = group.x
          group.x = range.x0 - Configuration.GROUP_PADDING
          group.width = range.x1 - range.x0 + 2 * Configuration.GROUP_PADDING
          group.oldY = group.y
          group.y = range.y0 - Configuration.GROUP_TITLE_HEIGHT
          group.height =
            range.y1 -
            range.y0 +
            Configuration.GROUP_TITLE_HEIGHT +
            Configuration.GROUP_PADDING
        }
      } else if (currentShape.shapeType === ShapeType.GROUP) {
        this.shapes
          .filter(shape => {
            return (
              shape.shapeType === ShapeType.STEP &&
              shape.groupId === currentShape.id
            )
          })
          .forEach((shape, idx) => {
            shape.x += currentShape.x - currentShape.oldX
            shape.y += currentShape.y - currentShape.oldY
            updateColumnsPosition(shape)
          })
      }

      // 更新canvas画布尺寸
      const currentTable = this.shapesMap.get(id)
      this.$refs.canvas.width < currentTable.width + left + 20
        ? (this.$refs.canvas.width = currentTable.width + left + 20)
        : this.$refs.canvas.width
      this.$refs.canvas.height < currentTable.height + top
        ? (this.$refs.canvas.height = currentTable.height + top)
        : this.$refs.canvas.height
      this.setEdges()
      this.LineageGraph.setMiniViewStyle()
    },
    setShapes(shape) {
      const shapes = []
      this.shapesMap = shape
      shape.forEach(item => {
        shapes.push(item)
      })
      this.shapes = shapes
    },
    setPage(pageSize) {
      // this.canvasKey++
      this.$el.style.width = pageSize.x + 'px'
      this.$el.style.height = pageSize.y + 'px'
      this.$refs.canvas.width = pageSize.x + 20
      this.$refs.canvas.height = pageSize.y
    },
    setEdges(edges) {
      if (edges) {
        this.edges = edges
      } else {
        this.updateInputAndOutputProperties()
      }
      this.setEdgesPosition()
      const canvasDom = this.$refs.canvas
      this.ctx = canvasDom.getContext('2d')
      if (this.edgeView && this.edgeView.clearCanvas) {
        this.edgeView.clearCanvas()
      }
      this.edgeView = new EdgeView(this.ctx, this.edgesMap)
      this.edgeView.drawSimpleEdges()
      const self = this
      let timeout = true
      let lastInLine = false
      let lastCatch = null
      const OnTap = function (event) {
        const { catchCurrent, leaveAll } = self.edgeView.onTap(
          self.$refs.canvas,
          event
        )
        if (catchCurrent) {
          // self.removeAllHighlight()
          timeout = false
          setTimeout(() => {
            timeout = true
          }, 50)
          lastCatch = self.shapesMap.get(catchCurrent.split('-')[0])
          self.catchCurrent = catchCurrent
          if(lastCatch) {
            self.handleShapeMouseOver(lastCatch)
          } else {
            if(!self.mini && !self.lockHighlight) {
              self.edgeView.highlightEdges(null, (new Set()).add(catchCurrent))
            }
          }

          lastInLine = false
          self.isPointerInCanvas = true
        } else {
          lastInLine = true
        }
        if (leaveAll) {
          if (timeout && lastInLine && lastCatch) {
            self.handleShapeMouseOut(lastCatch)
            lastCatch = null
            self.catchCurrent = null
            self.isPointerInCanvas = false
          }
          if (timeout && lastInLine && !lastCatch) {
            lastCatch = null
            self.catchCurrent = null
            self.isPointerInCanvas = false
            if(!self.mini && !self.lockHighlight) {
              self.removeAllHighlight()
            }
          }
        } else {
        }
      }
      this.$refs.canvas.addEventListener('mousemove', OnTap, false)
    },
    getEdgeId(edge) {
      return edge.source + '-' + edge.target
    },
    setEdgesPosition() {
      const edgesMap = new Map()
      this.edges.forEach(edge => {
        const sourceStep = this.shapesMap.get(edge.source) || this.shapesMap.get('dam-'+edge.source)
        const targetStep = this.shapesMap.get(edge.target) || this.shapesMap.get('dam-'+edge.target)
        if (
          sourceStep &&
          targetStep &&
          !sourceStep.readyToDelete &&
          !targetStep.readyToDelete
        ) {
          const tableHeaderHeight = this.showModelMessage
            ? Configuration.TABLE_FULL_HEIGHT
            : Configuration.TABLE_HEIGHT
          edgesMap.set(this.getEdgeId(edge), {
            sourceX: sourceStep.x + sourceStep.width,
            sourceY:
              sourceStep instanceof StepShape
                ? sourceStep.y + tableHeaderHeight / 2
                : sourceStep.y + sourceStep.height / 2,
            targetX: targetStep.x,
            targetY:
              targetStep instanceof StepShape
                ? targetStep.y + tableHeaderHeight / 2
                : targetStep.y + targetStep.height / 2,
            sourceId: sourceStep.id,
            targetId: targetStep.id,
            sourceWidth: sourceStep.width,
            sourceHeight: sourceStep.height,
            readyToDelete: edge.readyToDelete,
            lineageFiles: edge.lineageFiles,
            etlSource: edge.etlSource,
          })
        }
      })
      this.edgesMap = edgesMap
    },
    handleShapeClick(shape) {
      if (this.mini) return
      if (shape instanceof ColumnShape || shape instanceof StepShape) {
        if (this.lockHighlight) {
          this.lockHighlight = false
          this.handleShapeMouseOut(shape)
          this.handleShapeMouseOver(shape)
        }
        this.lockHighlight = true
      }
      if (shape instanceof StepShape) {
        this.quitRelation()
      }
    },
    handleCanvasClick() {
      console.log('click-canvas', this.catchCurrent)
      if (!this.catchCurrent) {
        this.removeAllHighlight()
        this.$emit('remove-detail')
      } else {
        this.$emit('show-detail', {
          type: 'line',
          key: this.catchCurrent,
          shapesMap: this.shapesMap,
          edgesMap: this.edgesMap,
          rawData: this.rawData,
        })
      }
    },
    handleClickBackground() {
      this.quitRelation()
    },
    quitRelation() {
      if (this.isJoining) {
        this.isJoining = false
      }
    },
    handleStartRelation(shape) {
      // this.handleShapeClick(shape)
      this.edgeSource = shape
      this.isJoining = true
    },
    handleFinishRelation(shape) {
      this.edgeTarget = shape
      this.addEdge()
      this.isJoining = false
    },
    handleDeleteRelation(relation) {
      let idx = -1
      this.edges.forEach((edge, index) => {
        if (
          edge.source === relation.source &&
          edge.target === relation.target
        ) {
          idx = index
        }
      })
      if (idx === -1) {
        Log.importantLog('寻找关系失败，因此删除失败')
      } else {
        this.edges[idx].readyToDelete = true
        this.createRecord(RecordType.REMOVE_EDGE, `删除关系`, idx)
        this.setEdges()
      }
    },
    handleOuterClick(evt) {
      // 清除highlight
      if (evt.target.className && evt.target.className.includes('column')) {
      } else {
        if (evt.target.tagName !== 'CANVAS') {
          this.lockHighlight = false
          this.removeAllHighlight()
        } else {
          this.lockHighlight = this.catchCurrent
        }
      }
    },
    handleShapeMouseOver(shape) {
      if (this.mini) return
      if (this.lockHighlight) {
        return
      }
      if (shape instanceof ColumnShape) {
        clearTimeout(this.mouseOverTimeout)
        this.mouseOverTimeout = setTimeout(() => {
          const { shapes, edges } = this.calculateHighlightEdges(shape)
          this.edgeView.highlightEdges(shape.id, edges)
          this.highlightShapes = shapes
        }, Configuration.MOUSEOVER_DELAY)
      } else if (
        [
          GraphType.TABLE_ONLY,
          GraphType.SCHEMA_AND_TABLE,
          GraphType.CATEGORY_AND_TABLE,
          GraphType.MODEL_AND_TABLE,
        ].includes(this.graphType) &&
        shape instanceof StepShape
      ) {
        clearTimeout(this.mouseOverTimeout)
        this.mouseOverTimeout = setTimeout(() => {
          const { shapes, edges } = this.calculateHighlightEdges(shape)
          this.edgeView.highlightEdges(shape.id, edges)
          this.highlightShapes = shapes
        }, Configuration.MOUSEOVER_DELAY)
      }
    },
    removeAllHighlight() {
      clearTimeout(this.mouseOutTimeout)
      this.mouseOutTimeout = setTimeout(() => {
        this.edgeView.removeAllHighlight()
        this.highlightShapes = new Set()
      }, Configuration.MOUSEOVER_DELAY)
    },
    handleShapeMouseOut(shape) {
      if (this.mini) return
      if (this.lockHighlight) {
        return
      }
      if (shape instanceof ColumnShape || shape instanceof StepShape) {
        this.removeAllHighlight()
      }
    },
    calculateHighlightEdges(shape) {
      // 由shape出发，进行递归计算
      const edgesInfluenced = new Set()
      const shapesInfluenced = new Set()
      // 准备工作
      const forward = new Map()
      const backward = new Map()
      this.edges.forEach(item => {
        if (!forward.has(item.source)) {
          forward.set(item.source, new Set())
        }
        if (!backward.has(item.target)) {
          backward.set(item.target, new Set())
        }
        if (item.target !== item.source) {
          forward.get(item.source).add(item.target)
          backward.get(item.target).add(item.source)
        } else if (item.target === item.source && item.source === shape.id) {
          edgesInfluenced.add(
            this.getEdgeId({
              source: item.source,
              target: item.source,
            })
          )
        }
      })

      shapesInfluenced.add(shape.id)
      const findPrev = shapeId => {
        if (backward.has(shapeId)) {
          backward.get(shapeId).forEach(item => {
            edgesInfluenced.add(
              this.getEdgeId({
                source: item,
                target: shapeId,
              })
            )
            shapesInfluenced.add(item)
            findPrev(item)
          })
        }
      }
      const findNext = shapeId => {
        if (forward.has(shapeId)) {
          forward.get(shapeId).forEach(item => {
            edgesInfluenced.add(
              this.getEdgeId({
                source: shapeId,
                target: item,
              })
            )
            shapesInfluenced.add(item)
            findNext(item)
          })
        }
      }
      findPrev(shape.id)
      findNext(shape.id)
      return {
        shapes: shapesInfluenced,
        edges: edgesInfluenced,
      }
    },
    getMaxViewScale() {
      return this.viewScale
    },
    maxViewScale(scale) {
      this.viewScale = scale
    },
  },
}
</script>

<style scoped lang="scss">
@import '../asset/base';
</style>
<style lang="scss">
@import '../asset/overall';
</style>
