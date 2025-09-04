import {Line, Step, TableLine} from '../types/Data'
import {ColumnShape, GroupShape, Shape, StepShape} from '../types/Shape'
import {Location, Position} from "../types/Position";
import PositionCalculator from "./PositionCalculator";
import GraphType from "../types/GraphType";
import {ShapeType, StepType} from "../types/ShapeType";
import Configuration from "./Configuration";
import {VerticalAlign} from "../types/Configuration";
import Version from "./Version";
import {VersionContent} from "../types/Version";
import _ from "lodash";
import LDMTypes from "@/next/constant/LDMTypes";


class LineageGraph {
  /*
  配置信息
   */
  private param: any;

  /*
  绘图模式
   */
  private graphType: GraphType = GraphType.TABLE_ONLY;
  /*
  表头是否显示模型和schema信息
   */
  private showModelMessage: boolean = false;
  /*
  是否根据schema分组
   */
  private groupBySchema: boolean = false;
  /*
    是否根据category分组
     */
  private groupByCategory: boolean = false;
  /*
  是否根据model分组
   */
  private groupByModel: boolean = false;
  /*
  是否根据schema分组,再根据Category分组
   */
  private groupBySchemaByCategory: boolean = false;

  /*
  所有实体之间的关系连线，包括字段到字段，表到字段，字段到表，表到表等多种情况
  */
  private readonly lines: Array<Line> = [];

  /*
  所有实体之间的关系连线，归并到表
   */
  private readonly tLines: Array<TableLine> = [];

  /*
  所有表级实体
  */
  private readonly steps: Map<string, Step>;

  /*
  坐标，计算或直接得到的
   */
  private positions: Map<string, Position> = new Map();

  /*
  坐标计算器
   */
  private positionCalculator: PositionCalculator | null = null;


  /*
  有版本信息时，使用版本中的position，只有不显示加工过程，仅使用于显示字段且未分组的情形
   */
  private usePositionFromVersion: boolean = false;

  private versionContent: VersionContent | null = null;
  /*
  实体集
   */
  private shapes: Map<string, Shape> = new Map();

  /*
  画布范围
   */
  private exploredXY: Location | null = null;
  /*
  画布DOM
  */
  private readonly container;

  public constructor({data, container, param}) {
    this.lines = _.clone(data.lines)
    this.steps = _.clone(data.steps)
    this.tLines = _.clone(data.tLines)
    this.container = container
    this.param = param;
    this.start()
  }

  /*
  测试入口
  1.先计算坐标(如果没有已保存的坐标)
  2.绘制
  */
  public start(): void {
    this.handleParams();
    this.getVersionContent().then(versionContent => {
      this.versionContent = versionContent;

      // 读取用户新增的表
      // if (versionContent != null && versionContent.addedStep) {
      //   const addedSteps: Array<any> = []
      //   versionContent.addedStep.forEach(item => {
      //     if (item.shapeType == ShapeType.STEP) {
      //       addedSteps.push({
      //         id: item.id,
      //         name: item.label,
      //         schema: item.schema,
      //         columns: [],
      //         properties: {
      //           $input_table: item.stepType == StepType.INPUT,
      //           $output_table: item.stepType == StepType.OUTPUT
      //         },
      //         byUser: true
      //       })
      //     } else if (item.shapeType == ShapeType.COLUMN) {
      //       const step = addedSteps[addedSteps.length - 1]
      //       step.columns.push({
      //         stepId: step.id,
      //         id: item.id,
      //         name: item.label,
      //         byUser: true
      //       })
      //     }
      //   })
      //   addedSteps.forEach(step => {
      //     this.steps[step.id] = step
      //   })
      // }

      // 读取用户新增的关系
      // if (versionContent != null && versionContent.addedEdge) {
      //   versionContent.addedEdge.forEach(edge => {
      //     this.lines.push(edge)
      //     if (!this.tLines.some(tLine => {
      //       return tLine.source == edge.sourceStepId && tLine.target == edge.targetStepId
      //     })) {
      //       this.tLines.push({
      //         source: edge.sourceStepId,
      //         target: edge.targetStepId
      //       })
      //     }
      //   })
      // }

      // 读取用户自定义的坐标（有改动即存完整坐标）
      if (versionContent != null && this.usePositionFromVersion) {
        this.usePosition();
      } else {
        this.calculatePosition();
      }

      this.shapes.clear();
      this.drawGroups();
      this.drawSteps();
      this.createView();
      this.createMiniView();
    })
  }

  public getGraphType(): GraphType {
    return this.graphType;
  }

  private handleParams(): void {
    // 根据groupBySchema和showColumn属性设置graphType
    let graphType = GraphType.TABLE_ONLY;
    if (this.param.verticalAlign == VerticalAlign.TOP) {
      Configuration.GROUP_VERTICAL_ALIGN = VerticalAlign.TOP;
      Configuration.TABLE_VERTICAL_ALIGN = VerticalAlign.TOP;
    } else if (this.param.verticalAlign == VerticalAlign.MIDDLE) {
      Configuration.GROUP_VERTICAL_ALIGN = VerticalAlign.MIDDLE;
      Configuration.TABLE_VERTICAL_ALIGN = VerticalAlign.MIDDLE;
    }
    if (this.param.groupBySchema) {
      graphType = GraphType.SCHEMA_AND_TABLE;
    }
    if (this.param.groupByCategory) {
      graphType = GraphType.CATEGORY_AND_TABLE;
    }
    if (this.param.groupByModel) {
      graphType = GraphType.MODEL_AND_TABLE;
    }
    if (this.param.groupBySchemaByCategory) {
      graphType = GraphType.CATEGORY_AND_SCHEMA_AND_TABLE;
    }
    if (this.param.showColumn) {
      graphType = GraphType.TABLE_AND_COLUMN
      if (this.param.groupBySchema) {
        graphType = GraphType.SCHEMA_AND_TABLE_AND_COLUMN;
      }
      if (this.param.groupByCategory) {
        graphType = GraphType.CATEGORY_AND_TABLE_AND_COLUMN;
      }
      if (this.param.groupByModel) {
        graphType = GraphType.MODEL_AND_TABLE_AND_COLUMN;
      }
      if (this.param.groupBySchemaByCategory) {
        graphType = GraphType.CATEGORY_AND_SCHEMA_AND_TABLE_AND_COLUMN;
      }
    }
    this.graphType = graphType

    if (this.param.showModel) {
      this.showModelMessage = true
    }
    if (this.param.groupBySchema) {
      this.groupBySchema = true
    }

    if (this.param.groupByCategory) {
      this.groupByCategory = true
    }
    if (this.param.groupByModel) {
      this.groupByModel = true
    }

    if (this.param.groupBySchemaByCategory) {
      this.groupBySchemaByCategory = true
    }

    this.usePositionFromVersion = !this.param.showMiddleProcess && this.param.showColumn && !this.param.groupBySchema && !this.param.groupByCategory && !this.param.groupByModel;
  }

  private async getVersionContent() {
    return new Promise<VersionContent | null>(resolve => {
      if (Version.currentVersion > 0) {
        Version.getVersion().then(data => {
          resolve(data)
        })
      } else {
        resolve(null);
      }
    })
  }

  /*
  如果没有坐标，则计算坐标
  坐标计算考虑以下情况：
    1.表
    2.表+字段
    3.模型+schema+表
    4.模型+schema+表+字段
    5.模型+表
    6.模型+表+字段
    7. group(tag) + 表
    8. group(tag) + 表 + 字段
   */
  private calculatePosition(): void {
    this.positions.clear()
    this.positionCalculator = new PositionCalculator(this.tLines, this.steps, this.showModelMessage, this.graphType);
    this.positionCalculator.calculate();
    this.positions = this.positionCalculator.getAllPositions();
    this.exploredXY = this.positionCalculator.getExploredXY();
  }

  private usePosition(): void {
    this.positions.clear()
    if (this.versionContent && this.versionContent.positions) {
      let exploredX = Configuration.PAGE_MARGIN_LEFT
      let exploredY = Configuration.PAGE_MARGIN_TOP
      this.versionContent.positions.forEach(item => {
        this.positions.set(item[0], item[1])
        if (item[1].x + item[1].width > exploredX) {
          exploredX = item[1].x + item[1].width
        }
        if (item[1].y + item[1].height > exploredY) {
          exploredY = item[1].y + item[1].height
        }
      })
      this.exploredXY = {
        x: exploredX,
        y: exploredY,
      }
    } else {
      throw new Error('未读取到位置信息')
    }
  }


  private drawGroups(): void {
    if ([GraphType.SCHEMA_AND_TABLE, GraphType.SCHEMA_AND_TABLE_AND_COLUMN, GraphType.CATEGORY_AND_TABLE, GraphType.CATEGORY_AND_TABLE_AND_COLUMN, GraphType.MODEL_AND_TABLE, GraphType.MODEL_AND_TABLE_AND_COLUMN].includes(this.graphType)) {
      this.positions.forEach((position, key) => {
        if (key.startsWith('group-')) {
          let shape = new GroupShape(key, position.width, position.height, position.x, position.y, key);
          this.shapes.set(key, shape);
        }
      })
    }
  }

  /*
  绘制所有表
  */
  private drawSteps(): void {
    let stepsArray = Object.values(this.steps)
    stepsArray.forEach(step => {
      this.drawStep(step)
    })
  }

  /*
  绘制单张表的静态方法
  */
  private drawStep(step: Step) {
    let position = this.positions.get(step.id);
    if (position == null) {
      // throw new Error('position not found');
      return;
    }
    let stepType: StepType = StepType.PROCESS
    if (step.properties.$is_current) {
      stepType = StepType.IS_CURRENT
    }
    if (step.properties.$cursor === 'true') {
      stepType = StepType.CURSOR
    }
    if (step.properties.$cursor_var === 'true') {
      stepType = StepType.CURSOR_VAR
    }
    if (step.properties.typeId === String(LDMTypes.Index)) {
      stepType = StepType.METRICS
    }
    if (step.properties.typeId === String(LDMTypes.Report)) {
      stepType = StepType.REPORT
    }
    let $user_custom : boolean | null = null
    if (step.properties.$user_custom === 'true') {
      $user_custom = true
    }
    let shape = new StepShape(
      step.id,
      stepType,
      $user_custom,
      position.width,
      position.height,
      position.x,
      position.y,
      step.name,
      step.schema,
      step?.properties.qualityNum,
    );
    shape.byUser = step.byUser

    // 如果有分组信息，则填充分组信息到shape信息中
    if (position.groupId) {
      shape.setGroupId(position.groupId);
    }

    this.shapes.set(step.id, shape);

    if ([
      GraphType.TABLE_AND_COLUMN,
      GraphType.SCHEMA_AND_TABLE_AND_COLUMN,
      GraphType.CATEGORY_AND_TABLE_AND_COLUMN,
      GraphType.MODEL_AND_TABLE_AND_COLUMN
    ].includes(this.graphType)) {
      step.columns && step.columns.forEach(col => {
        let columnPosition = this.positions.get(col.id);
        if (position == null) {
          throw new Error('table position not found');
        }
        if (columnPosition == null) {
          throw new Error('column position not found');
        }
        let columnShape = new ColumnShape(
          step.id,
          position.x,
          position.y,
          col.id,
          columnPosition.width,
          columnPosition.height,
          columnPosition.x,
          columnPosition.y,
          col.name
        )
        columnShape.byUser = step.byUser
        this.shapes.set(col.id, columnShape);
      })
    }
  }

  /*
  在dom中添加shape 原生写法，如非常关注性能，可以考虑使用
   */
  private insertStepShapeByVanillaScript(shape: StepShape) {
    let a = document.createElement('div')
    a.innerHTML = 'demo'
    a.className = 'lg lg-shape'
    a.style.height = shape.height + 'px'
    a.style.width = shape.height + 'px'
    a.style.top = shape.y + 'px'
    a.style.left = shape.x + 'px'
    this.container.appendChild(a)
  }

  /*
  绘制视图
   */
  private createView(): void {
    const self = this.param.$This
    const view = self.$refs.view
    view.setLineageObj(this)
    view.setPage(this.exploredXY)
    view.setShapes(this.shapes)
    view.showModelMessage = this.showModelMessage
    if ([GraphType.TABLE_ONLY, GraphType.SCHEMA_AND_TABLE, GraphType.CATEGORY_AND_TABLE, GraphType.MODEL_AND_TABLE].includes(this.graphType)) {
      view.setEdges(this.tLines);
    } else if ([GraphType.TABLE_AND_COLUMN, GraphType.SCHEMA_AND_TABLE_AND_COLUMN, GraphType.CATEGORY_AND_TABLE_AND_COLUMN, GraphType.MODEL_AND_TABLE_AND_COLUMN].includes(this.graphType)) {
      view.setEdges(this.lines);
    }
  }

  // 绘制 miniView
  private createMiniView(): void {
    const vm = this.param.$This
    const miniView = vm.$refs.miniView
    const m_view = miniView.$refs.view
    miniView.setLineageObj(this)
    m_view.setPage(this.exploredXY)
    m_view.setShapes(this.shapes)
    m_view.showModelMessage = this.showModelMessage
    this.resetPosition()
    this.setMiniViewStyle()
  }

  public setMiniViewStyle(): void {
    this.commonSize(1, 1)
  }

  public viewMove(x, y): void {
    const vm = this.param.$This
    const view = $('#consa-graph')
    vm.$nextTick(() => {
      view.scrollTop(y)
      view.scrollLeft(x)
    })
  }

  public setMaskMove(x, y): void {
    const vm = this.param.$This
    const miniView = vm.$refs.miniView
    miniView.setMaskMove(x, y)
  }

  private resetPosition(): void {
    const vm = this.param.$This
    const view = $('#consa-graph')
    const miniView = vm.$refs.miniView
    const mask = miniView.$refs.mask
    this.maxViewScale(1)
    vm.$nextTick(() => {
      mask.style.left = 0
      mask.style.top = 0
      view.scrollTop(0)
      view.scrollLeft(0)
    })
  }

  // 获取当前缩放比例
  public getMaxViewScale(): number {
    const vm = this.param.$This
    const view = vm.$refs.view
    return view.getMaxViewScale()
  }

  public maxViewScale(scale): void {
    const vm = this.param.$This
    const view = vm.$refs.view
    view.maxViewScale(scale)
  }

  public commonSize(scales, type): void {
    const vm = this.param.$This
    const view = vm.$refs.view
    const miniView = vm.$refs.miniView
    const canvas = view.$refs.canvas
    vm.$nextTick(() => {
      const canvasWidth = canvas.width * scales
      const canvasHeight = canvas.height * scales
      const saleW = Configuration.MINIVIEW_WIDTH / canvasWidth
      const saleH = Configuration.MINIVIEW_HEIGHT / canvasHeight
      const scale = saleH < saleW ? saleH : saleW
      const mWidth = canvasWidth * scale
      const mHeight = canvasHeight * scale
      //box
      const VBoxW = $("#consa-graph").width() || 0
      const VBoxH = $("#consa-graph").height() || 0
      const mWrapWidth = miniView.$el.clientWidth
      const mWrapHeight = miniView.$el.clientHeight
      let maskW = 0
      let maskH = 0
      if (canvasWidth > VBoxW) {
        maskW = VBoxW / canvasWidth * mWidth
      } else {
        maskW = mWrapWidth
      }
      if (canvasHeight > VBoxH) {
        maskH = VBoxH / canvasHeight * mHeight
      } else {
        maskH = mWrapHeight
      }
      if (type === 1) {
        // 初始
        const styleObj = {
          scale: scale,
          scale1: scale,
          miniViewW: Configuration.MINIVIEW_WIDTH,
          miniViewH: Configuration.MINIVIEW_HEIGHT,
          maskW: maskW,
          maskH: maskH,
          mWidth: mWidth,
          mHeight: mHeight
        }
        miniView.setStyle(styleObj)
      } else if (type === 2) {
        // 缩放
        const styleObj = {
          scale1: scale,
          scaleWidth: saleW,
          scaleHeight: saleH,
          maskW: maskW,
          maskH: maskH,
        }
        miniView.setMaskScale(styleObj)
      }
    })
  }

  // 缩放后mask尺寸&位置
  public minMaskScale(scales: number): void {
    this.commonSize(scales, 2)
  }
}

export default LineageGraph;
