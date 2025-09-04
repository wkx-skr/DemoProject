import {Step, TableLine} from '../types/Data'
import GraphType from "@/next/service/lineage/types/GraphType";
import {Location, Position} from "@/next/service/lineage/types/Position";
import Configuration from "@/next/service/lineage/class/Configuration";
import _ from 'lodash';
import {VerticalAlign} from "@/next/service/lineage/types/Configuration.ts";
// @ts-ignore
const vThis = window.vueThis
interface GroupPositionRecorder {
  currentX: number,
  currentY: number,
  exploredX: number,
  exploredY: number,
  clusterY: number,
  width: number,
  height: number,
}

class PositionCalculator {
  constructor(tableLines: Array<TableLine>, steps: Map<string, Step>, showModelMessage: boolean, graphType: GraphType = GraphType.TABLE_ONLY) {
    if (showModelMessage) {
      this.TABLE_HEIGHT = Configuration.TABLE_FULL_HEIGHT;
    }
    this.graphType = graphType;
    this.steps = steps;
    this.tableLines = tableLines
      // 本方法为计算坐标，忽略指向本表的关系
      .filter(tableLine => tableLine.source != tableLine.target)
      // 需要忽略source或target不在steps中的线
      .filter(tableLine => steps.hasOwnProperty(tableLine.source) && steps.hasOwnProperty(tableLine.target));
  }

  /*
  配置
   */
  private readonly graphType: GraphType = GraphType.TABLE_ONLY;
  /*
  原始数据
   */
  private readonly tableLines: Array<TableLine> = [];
  private readonly steps: Map<string, Step> = new Map();
  private readonly TABLE_HEIGHT: number = Configuration.TABLE_HEIGHT;

  /*
  根据表级连线聚合成簇
   */
  private clusters: Array<Array<string>> = [];

  /*
  坐标，已探索坐标和当前坐标
   */
  private currentX: number = Configuration.PAGE_MARGIN_LEFT;
  private currentY: number = Configuration.PAGE_MARGIN_TOP;
  private exploredX: number = Configuration.PAGE_MARGIN_LEFT;
  private exploredY: number = Configuration.PAGE_MARGIN_TOP;
  private clusterY: number = Configuration.PAGE_MARGIN_TOP;

  /*
  组内的已探索坐标和当前坐标
   */
  private currentAndExploredPositionByGroup = new Map()
  /*
  簇的范围。暂时还用不到这个属性；为后续功能预留。
   */
  private readonly clustersScope: Map<number, Position> = new Map()

  /*
  坐标结果
   */
  private positions: Map<string, Position> = new Map();

  /*
  入口方法
   */
  public calculate(): Map<string, Position> {
    if ([GraphType.SCHEMA_AND_TABLE_AND_COLUMN, GraphType.SCHEMA_AND_TABLE, GraphType.CATEGORY_AND_TABLE_AND_COLUMN, GraphType.CATEGORY_AND_TABLE].includes(this.graphType)) {
      this.calculateClusterByGroup()
    } else {
      this.calculateCluster();
    }
    if ([GraphType.SCHEMA_AND_TABLE_AND_COLUMN, GraphType.SCHEMA_AND_TABLE, GraphType.CATEGORY_AND_TABLE_AND_COLUMN, GraphType.CATEGORY_AND_TABLE].includes(this.graphType)) {
      this.calculatePositionsByGroup();
    } else {
      this.calculatePositions();
    }
    // 尽量不要直接使用返回值
    return this.positions;
  }

  /*
  获取结果的方法
   */
  public getAllPositions(): Map<string, Position> {
    return this.positions;
  }

  public getExploredXY(): Location {
    return {
      x: this.exploredX,
      y: this.exploredY + Configuration.PAGE_MARGIN_TOP, // 最终的返回值需要增加下边距
    }
  }

  /*
  计算出簇，之后的绘制均按簇分离
  */
  private calculateCluster(): void {
    const allStepIds = Object.keys(this.steps)

    // 计算被关联引用过的表的集合
    const stepIds = new Set()
    this.tableLines.forEach(t => {
      stepIds.add(t.source)
      stepIds.add(t.target)
    })
    const size = stepIds.size;

    let stepCluster: Array<Array<string>> = [];
    // 首次装载数据
    this.tableLines.forEach(tableLine => {
      stepCluster.push([tableLine.source, tableLine.target])
    })

    while (_.flatten(stepCluster).length > size) {
      let newStepCluster: Array<Array<string>> = []
      const idxUsed = new Set()
      for (let i = 0; i < stepCluster.length; i++) {
        if (idxUsed.has(i)) {
          continue;
        }
        idxUsed.add(i)
        const set = new Set(stepCluster[i])
        for (let j = i; j < stepCluster.length; j++) {
          const union = _.union(stepCluster[i], stepCluster[j])
          if (union.length < stepCluster[i].length + stepCluster[j].length) {
            idxUsed.add(j)
            union.forEach(item => {
              set.add(item)
            })
          }
        }
        newStepCluster.push([...set])
      }
      stepCluster = newStepCluster
    }
    // 无关联的表需要补充到簇中
    const orphanSteps = _.difference(allStepIds, [...stepIds])
    orphanSteps.forEach(steps => {
      stepCluster.push([steps])
    })

    // 对簇进行排序，节点数较多的前置
    stepCluster.sort((a, b) => {
      return b.length - a.length
    })
    this.clusters = stepCluster
  }

  /*
  按step获得schema或category
   */
  private getSchemaOrCategory(stepId): string {
    const step = this.steps[stepId]
    if (this.graphType == GraphType.SCHEMA_AND_TABLE || this.graphType == GraphType.SCHEMA_AND_TABLE_AND_COLUMN) {
      let schema = step.schema
      if (step.properties && step.properties.$model_id) {
        schema = step.properties.$model_id + ':' + schema
      }
      if (!step.schema) {
        return '未分组'
      }
      return schema;
    } else if ([GraphType.CATEGORY_AND_TABLE_AND_COLUMN, GraphType.CATEGORY_AND_TABLE].includes(this.graphType)) {
      let categoryId = step.properties.$model_category_id
      if (vThis.$modelCategoriesMap.hasOwnProperty(categoryId)) {
        return vThis.$modelCategoriesMap[categoryId]
      } else if (categoryId) {
        return String(categoryId);
      } else {
        return '未分组'
      }

    } else {
      throw new Error('Unhandled group')
    }
  }
  /*
 计算出考虑组后的簇，之后的绘制均按簇分离
 */
  private calculateClusterByGroup(): void {
    const allStepIds = Object.keys(this.steps)
    // 计算被关联引用过的表的集合
    const stepIds = new Set()
    this.tableLines.forEach(t => {
      stepIds.add(t.source)
      stepIds.add(t.target)
    })
    let stepCluster: Array<Array<string>> = []
    // 首次装载数据
    this.tableLines.forEach(tableLine => {
      let ids = [tableLine.source, tableLine.target]
      Object.values(this.steps).forEach(step => {
        if (![tableLine.source, tableLine.target].includes(step.id)) {
          if (this.getSchemaOrCategory(step.id) == this.getSchemaOrCategory(tableLine.source) || this.getSchemaOrCategory(step.id) == this.getSchemaOrCategory(tableLine.target)) {
            ids.push(step.id)
            stepIds.add(step.id)
          }
        }
      })
      stepCluster.push(ids)
    })
    const size = stepIds.size;
    while (_.flatten(stepCluster).length > size) {
      let newStepCluster: Array<Array<string>> = []
      const idxUsed = new Set()
      for (let i = 0; i < stepCluster.length; i++) {
        if (idxUsed.has(i)) {
          continue;
        }
        idxUsed.add(i)
        const set = new Set(stepCluster[i])
        for (let j = i; j < stepCluster.length; j++) {
          const union = _.union(stepCluster[i], stepCluster[j])
          if (union.length < stepCluster[i].length + stepCluster[j].length) {
            idxUsed.add(j)
            union.forEach(item => {
              set.add(item)
            })
          }
        }
        newStepCluster.push([...set])
      }
      stepCluster = newStepCluster
    }
    // 无关联的表需要补充到簇中
    const orphanSteps = _.difference(allStepIds, [...stepIds])
    const orphanStepsByGroup = new Map()
    orphanSteps.forEach(step => {
      const schema = this.getSchemaOrCategory(step)
      if (!orphanStepsByGroup.has(schema)) {
        orphanStepsByGroup.set(schema, [])
      }
      orphanStepsByGroup.get(schema).push(step)
    })
    orphanStepsByGroup.forEach(stepIds => {
      stepCluster.push(stepIds)
    })

    // 对簇进行排序，节点数较多的前置
    stepCluster.sort((a, b) => {
      return b.length - a.length
    })
    this.clusters = stepCluster
  }

  // 有缺陷的处理方法
  private calculateCluster1(): void {
    const stepIds = Object.keys(this.steps)
    const stepMentioned = new Set()
    const stepCluster: Array<Array<string>> = []

    // 找出已计算出cluster的表的索引
    const findClusterIndex = (stepId: string): number => {
      let idx = -1;
      stepCluster.forEach((c, index) => {
        if (c.includes(stepId)) {
          idx = index;
        }
      })
      if (idx == -1) {
        throw new Error('cluster calculate error')
      }
      return idx;
    }
    const set = new Set();
    this.tableLines.forEach(t => {
      set.add(t.source)
      set.add(t.target)
    })
    const size = set.size;
    // 梳理有关系的表到簇中
    this.tableLines.forEach(tableLine => {
      // if (stepMentioned.has(tableLine.source) && stepMentioned.has(tableLine.target)) {
      //   // Nothing happened, just continue
      // } else if (stepMentioned.has(tableLine.source) && !stepMentioned.has(tableLine.target)) {
      //   let idx = findClusterIndex(tableLine.source);
      //   stepCluster[idx].push(tableLine.target);
      // } else if (!stepMentioned.has(tableLine.source) && stepMentioned.has(tableLine.target)) {
      //   let idx = findClusterIndex(tableLine.target);
      //   stepCluster[idx].push(tableLine.source);
      // } else {
      //   stepCluster.push([tableLine.source, tableLine.target])
      // }
      // stepMentioned.add(tableLine.source)
      // stepMentioned.add(tableLine.target)
      if (!stepMentioned.has(tableLine.source) && !stepMentioned.has(tableLine.target)) {
        const tables = new Set()
        tables.add(tableLine.source)
        tables.add(tableLine.target)
        this.tableLines.forEach(subLine => {
          if (subLine.source == tableLine.source || subLine.target == tableLine.target || subLine.target == tableLine.source || subLine.target == tableLine.target) {
            tables.add(tableLine.source)
            tables.add(tableLine.target)
          }
        })
        tables.forEach(t => {
          stepMentioned.add(t)
        })
        // @ts-ignore
        stepCluster.push([...tables])
      }
    })

    // 无关联的表需要补充到簇中
    const orphanSteps = _.difference(stepIds, [...stepMentioned])
    orphanSteps.forEach(steps => {
      stepCluster.push([steps])
    })

    // 对簇进行排序，节点数较多的前置
    stepCluster.sort((a, b) => {
      return b.length - a.length
    })

    this.clusters = stepCluster
  }

  private calculatePositionsByGroup(): void {
    this.clusters.forEach(cluster => {
      this.calculatePositionsByClusterByGroup(cluster)
    })
  }

  /*
   计算所有坐标
   */
  private calculatePositions(): void {
    this.clusters.forEach(cluster => {
      this.calculatePositionsByCluster(cluster)
    })
  }

  /*
  计算字段坐标
   */
  private calculatePositionsOfColumns(stepId: string, tablePosition: Position, groupInnerPositions?: Map<string, Position>): void {
    try {
      tablePosition.height += this.steps[stepId].columns.length * Configuration.COLUMN_HEIGHT + Configuration.COLUMN_MARGIN;
      this.steps[stepId].columns.sort((a, b) => {
        if (typeof a.order == 'number' && typeof b.order == 'number') {
          return a.order - b.order
        }
      })
      this.steps[stepId].columns.forEach((col, colIdx) => {
        let columnPosition = {
          width: Configuration.TABLE_WIDTH - Configuration.COLUMN_MARGIN * 2,
          height: Configuration.COLUMN_HEIGHT,
          x: tablePosition.x + Configuration.COLUMN_MARGIN,
          y: tablePosition.y + Configuration.COLUMN_HEIGHT * colIdx + this.TABLE_HEIGHT
        }
        if (groupInnerPositions) {
          groupInnerPositions.set(col.id, columnPosition)
        } else {
          this.positions.set(col.id, columnPosition);
        }

      })
    } catch (e) {
      console.error(`columns of ${stepId} not found again.`)
    }
  }


  private calculatePositionsByClusterByGroup(stepIds: Array<string>): void {
    // 开始一个新簇时，x坐标归零; y坐标加上簇间距（如果不是第一个簇）
    this.currentX = Configuration.PAGE_MARGIN_LEFT;
    if (this.positions.size > 0) {
      this.currentY = this.exploredY + Configuration.GULP_Y_BETWEEN_CLUSTER;
    }

    // 处理首个表并非第一列的情况，预留20个空列，以防计算出错
    const groupInnerPositions = new Map()
    const groups = new Map()
    stepIds.forEach(item => {
      let schema = this.getSchemaOrCategory(item)
      if (!groups.has(schema)) {
        groups.set(schema, [])
        groupInnerPositions.set(schema, new Map())
      }
      groups.get(schema).push(item)
    })
    const calculateGroupInner = (stepIds, schema) => {
      const positionInner = {
        currentX: 0,
        currentY: 0,
        exploredX: 0,
        exploredY: 0,
        clusterY: 0,
        width: 0,
        height: 0,
      }
      const rows: Array<Array<string>> = new Array<Array<string>>(20)
      for (let i = 0; i < rows.length; i++) {
        rows[i] = []
      }
      // 找出已计算出表的列索引
      const findRowIndex = (stepId: string): number => {
        let idx = -1;
        rows.forEach((c, index) => {
          if (c.includes(stepId)) {
            idx = index;
          }
        })
        return idx;
      }

      // 找出无内部关系的表
      const restStepIds = new Set(_.clone(stepIds))
      // tableLines为本簇内的表关系
      const tableLines = this.tableLines.filter(line => {
        let inLine = stepIds.includes(line.source) && stepIds.includes(line.target)
        if (inLine) {
          restStepIds.delete(line.source)
          restStepIds.delete(line.target)
        }
        return inLine
      })

      // 将首个关联的源和目标表,然后遍历所有关系，树立出布局的列数组
      {
        const first = tableLines[0]
        if (first) {
          rows.push([first.source])
          rows.push([first.target])
          tableLines.shift()
        } else {
        }
        let i = 0;
        while (tableLines.length > 0 && i++ < 1000) {
          if (i > 999) {
            console.error('stack overflow')
          }
          let first = tableLines[0]
          if (stepIds.includes(first.source) || stepIds.includes(first.target)) {
            let sourceIdx = findRowIndex(first.source);
            let targetIdx = findRowIndex(first.target);
            if (sourceIdx < 0 && targetIdx < 0) {
              rows[20].push(first.source)
              rows[21].push(first.target)
              tableLines.shift()
            } else {
              if (sourceIdx > -1) {
                if (!rows[sourceIdx + 1]) {
                  rows[sourceIdx + 1] = []
                }
                if (!_.union(_.flatten(rows)).includes(first.target)) {
                  rows[sourceIdx + 1].push(first.target);
                }
              }
              if (targetIdx > -1) {
                if (!_.union(_.flatten(rows)).includes(first.source)) {
                  rows[targetIdx - 1].push(first.source);
                }
              }
              tableLines.shift()
            }
          }
        }
      }
      // 过滤掉前置的空数组
      const filteredRows = rows.filter(i => i.length > 0)
      // 计算最高的列
      let maxHeight = 0
      filteredRows.forEach(row => {
        let height = row.length * this.TABLE_HEIGHT + (row.length - 1) * Configuration.GULP_Y_BETWEEN_TABLE;
        // 把字段的高度加进入,以下段落代码无效
        /*if (this.graphType == GraphType.TABLE_AND_COLUMN) {
          row.forEach((step) => {
            try {
              height += this.steps[step].columns.length * Configuration.COLUMN_HEIGHT;
            } catch(e) {
              console.error(`columns of ${step} not found`)
            }
          })
        }*/
        if (height > maxHeight) {
          maxHeight = height
        }
      })
      // 对表进行排序
      filteredRows.forEach(row => {
        row.sort((a, b) => {
          return this.steps[a].name.localeCompare(this.steps[b].name)
        })
      })
      // 计算具体的坐标
      filteredRows.forEach((row, rowIndex) => {
        // 列内已经用掉的高度
        let heightUsed = 0;
        // 列的高度
        let rowHeight = row.length * this.TABLE_HEIGHT + (row.length - 1) * Configuration.GULP_Y_BETWEEN_TABLE;

        // 把字段的高度加进入
        if (this.graphType == GraphType.TABLE_AND_COLUMN) {
          row.forEach((step) => {
            try {
              rowHeight += this.steps[step].columns.length * Configuration.COLUMN_HEIGHT;
            } catch (e) {
              console.error(`columns of ${step} not found`)
            }
          })
        }
        row.forEach((step, idx) => {
          let position = {
            width: Configuration.TABLE_WIDTH,
            height: this.TABLE_HEIGHT,
            x: positionInner.currentX,
            y: positionInner.clusterY + /*(maxHeight - rowHeight) / 2 +*/ heightUsed,
          }
          if (this.graphType == GraphType.SCHEMA_AND_TABLE_AND_COLUMN || this.graphType == GraphType.CATEGORY_AND_TABLE_AND_COLUMN) {
            this.calculatePositionsOfColumns(step, position, groupInnerPositions.get(schema));
          }
          // 设置组内坐标
          groupInnerPositions.get(schema).set(step, position);
          let lastOfRow = idx == row.length - 1
          if (rowIndex == 0 && restStepIds.size > 0) {
            lastOfRow = false;
          }
          this.updateCurrentAndExploredPositionByGroup(
            schema,
            positionInner,
            position,
            rowIndex == filteredRows.length - 1 && idx == row.length - 1,
            lastOfRow
          );
          let height = position.height + Configuration.GULP_Y_BETWEEN_TABLE;
          heightUsed += height;
        })

        if (rowIndex == 0) {
          // 处理不在关系中的表
          const restStepIdsArray = [...restStepIds]
          restStepIdsArray.forEach((stepId, idx) => {
            if (idx == 0) {
              positionInner.currentY += Configuration.GULP_Y_BETWEEN_TABLE;
            }
            let position = {
              width: Configuration.TABLE_WIDTH,
              height: this.TABLE_HEIGHT,
              x: 0,
              y: positionInner.currentY,
            }
            // 如果不是第一个表，保留间距
            if (idx > 0) {
              position.y += Configuration.GULP_Y_BETWEEN_TABLE;
            }
            groupInnerPositions.get(schema).set(stepId, position);
            if (this.graphType == GraphType.SCHEMA_AND_TABLE_AND_COLUMN || this.graphType == GraphType.CATEGORY_AND_TABLE_AND_COLUMN) {
              // @ts-ignore
              this.calculatePositionsOfColumns(stepId, position, groupInnerPositions.get(schema));
            }
            this.updateCurrentAndExploredPositionByGroup(
              schema,
              positionInner,
              position,
              false,
              idx == restStepIdsArray.length - 1,
            );
          })
        }
      })

      // 处理无组间关系，且无组内关系的组
      if (filteredRows.length == 0) {
        const restStepIdsArray = [...restStepIds];
        restStepIdsArray.forEach((stepId, idx) => {
          let position = {
            width: Configuration.TABLE_WIDTH,
            height: this.TABLE_HEIGHT,
            x: 0,
            y: positionInner.currentY,
          }
          // 如果不是第一个表，保留间距
          if (idx > 0) {
            position.y += Configuration.GULP_Y_BETWEEN_TABLE;
          }
          groupInnerPositions.get(schema).set(stepId, position);
          if (this.graphType == GraphType.SCHEMA_AND_TABLE_AND_COLUMN  || this.graphType == GraphType.CATEGORY_AND_TABLE_AND_COLUMN) {
            // @ts-ignore
            this.calculatePositionsOfColumns(stepId, position, groupInnerPositions.get(schema));
          }
          this.updateCurrentAndExploredPositionByGroup(
            schema,
            positionInner,
            position,
            false,
            idx == restStepIdsArray.length - 1,
          );
        })
      }
    }
    groups.forEach((stepIds, schema) => {
      calculateGroupInner(stepIds, schema)
    })

    // 根据表关系梳理出组之间的关系
    const judgeGroupRelations = () => {
      const relations = new Set()
      const tableLines = this.tableLines.filter(line => {
        return stepIds.includes(line.source) && stepIds.includes(line.target)
      })
      tableLines.forEach(line => {
        let sourceGroup = this.getSchemaOrCategory(line.source)
        let targetGroup = this.getSchemaOrCategory(line.target)
        if (sourceGroup != targetGroup) {
          relations.add(sourceGroup + '||||' + targetGroup)
        }
      })
      return [...relations];
    }

    const drawGroups = (groupRelations) => {
      const groupLines = _.clone(groupRelations)
      const restGroups = _.clone(groups)
      const groupRows: Array<Array<string>> = new Array<Array<string>>(20)
      for (let i = 0; i < groupRows.length; i++) {
        groupRows[i] = []
      }
      // 找出已计算出组的列索引
      const findRowIndex = (groupName: string): number => {
        let idx = -1;
        groupRows.forEach((c, index) => {
          if (c.includes(groupName)) {
            idx = index;
          }
        })
        return idx;
      }
      const first = groupLines[0]

      const getSourceId = (line) => {
        return line.split('||||')[0]
      }
      const getTargetId = (line) => {
        return line.split('||||')[1]
      }

      if (first) {
        groupRows.push([getSourceId(first)])
        groupRows.push([getTargetId(first)])
        restGroups.delete(getSourceId(first))
        restGroups.delete(getTargetId(first))
      }
      let i = 0
      while (groupLines.length > 0 && i++ < 100) {
        let first = groupLines[0]
        if (groups.has(getSourceId(first)) || groups.has(getTargetId(first))) {
          let sourceIdx = findRowIndex(getSourceId(first));
          let targetIdx = findRowIndex(getTargetId(first));
          if (sourceIdx < 0 && targetIdx < 0) {
            let first = groupLines.shift()
            if (first) {
              groupLines.push(first)
            }
          } else {
            if (sourceIdx > -1) {
              if (!groupRows[sourceIdx + 1]) {
                groupRows[sourceIdx + 1] = []
              }
              if (!_.union(_.flatten(groupRows)).includes(getTargetId(first))) {
                groupRows[sourceIdx + 1].push(getTargetId(first));
                restGroups.delete(getTargetId(first))
              }
            }
            if (targetIdx > -1) {
              if (!_.union(_.flatten(groupRows)).includes(getSourceId(first))) {
                groupRows[targetIdx - 1].push(getSourceId(first));
                restGroups.delete(getSourceId(first));
              }
            }
            groupLines.shift()
          }
        }
      }
      // 过滤掉前置的空数组
      const filteredRows = groupRows.filter(i => i.length > 0)

      // 考虑不含外部关系的组
      restGroups.forEach((group, groupName) => {
        filteredRows.push([groupName])
      })

      // 计算最高的列
      let maxHeight = 0
      filteredRows.forEach(row => {
        let height = 0
        row.forEach(groupName => {
          height += this.currentAndExploredPositionByGroup.get(groupName).height
        })
        if (height > maxHeight) {
          maxHeight = height
        }
      })
      filteredRows.forEach((row, rowIndex) => {
        // 列内已经用掉的高度
        let heightUsed = 0;
        // 列的高度
        let rowHeight = 0
        row.forEach(groupName => {
          rowHeight += this.currentAndExploredPositionByGroup.get(groupName).height
        })
        // this.currentY = Configuration.PAGE_MARGIN_TOP;
        row.forEach((groupName, idx) => {
          let position = {
            width: this.currentAndExploredPositionByGroup.get(groupName).width,
            height: this.currentAndExploredPositionByGroup.get(groupName).height,
            x: this.currentX,
            y: this.currentY == Configuration.PAGE_MARGIN_TOP ?
              Configuration.PAGE_MARGIN_TOP + (Configuration.GROUP_VERTICAL_ALIGN == VerticalAlign.MIDDLE ? (maxHeight - rowHeight) / 2 : 0) :
              this.currentY,
          }

          this.positions.set('group-' + groupName, position)
          this.updateCurrentAndExploredPositionOfGroup(
            position,
            idx == row.length - 1,
            rowIndex == filteredRows.length - 1
          )
          let height = this.currentAndExploredPositionByGroup.get(groupName).height
          heightUsed += height;

          const positions = groupInnerPositions.get(groupName);
          positions.forEach((innerPosition, step) => {
            this.positions.set(step, {
              groupId: 'group-' + groupName,
              width: innerPosition.width,
              height: innerPosition.height,
              x: position.x + innerPosition.x + Configuration.GROUP_PADDING,
              y: position.y + innerPosition.y + Configuration.GROUP_TITLE_HEIGHT,
            })
          })
        })
      })
    }
    const groupRelations = judgeGroupRelations()
    drawGroups(groupRelations)
  }

  /*
   计算每个簇内所有表的坐标
   */
  private calculatePositionsByCluster(stepIds: Array<string>): void {
    // 开始一个新簇时，x坐标归零; y坐标加上簇间距（如果不是第一个簇）
    this.currentX = Configuration.PAGE_MARGIN_LEFT;
    if (this.positions.size > 0) {
      this.currentY = this.exploredY + Configuration.GULP_Y_BETWEEN_CLUSTER;
    }

    // 处理无关联表的情况
    if (stepIds.length == 1) {
      let position = {
        width: Configuration.TABLE_WIDTH,
        height: this.TABLE_HEIGHT,
        x: this.currentX,
        y: this.currentY,
      }
      this.positions.set(stepIds[0], position);

      if (this.graphType == GraphType.TABLE_AND_COLUMN) {
        this.calculatePositionsOfColumns(stepIds[0], position);
      }

      this.updateCurrentAndExploredPosition(position, true, true);
    } else if (stepIds.length > 1) { // 处理有关联表时的情况
      // 处理首个表并非第一列的情况，预留20个空列，以防计算出错
      const rows: Array<Array<string>> = new Array<Array<string>>(20)
      // _.fill只适合基本类型，如此会导致fill进的都是同一个引用。。。。
      // _.fill(rows, [])
      for (let i = 0; i < rows.length; i++) {
        rows[i] = []
      }
      // 找出已计算出表的列索引
      const findRowIndex = (stepId: string): number => {
        let idx = -1;
        rows.forEach((c, index) => {
          if (c.includes(stepId)) {
            idx = index;
          }
        })
        return idx;
      }
      // tableLines为本簇内的表关系
      const tableLines = this.tableLines.filter(line => {
        return stepIds.includes(line.source) && stepIds.includes(line.target)
      })
      // 将首个关联的源和目标表,然后遍历所有关系，树立出布局的列数组
      {
        const first = tableLines[0]
        rows.push([first.source])
        rows.push([first.target])
        tableLines.shift()
        while (tableLines.length > 0) {
          let first = tableLines[0]
          if (stepIds.includes(first.source) || stepIds.includes(first.target)) {
            let sourceIdx = findRowIndex(first.source);
            let targetIdx = findRowIndex(first.target);
            if (sourceIdx < 0 && targetIdx < 0) {
              console.warn('no-way')
              let first = tableLines.shift()
              if (first) {
                tableLines.push(first)
              }
            } else {
              if (sourceIdx > -1) {
                if (!rows[sourceIdx + 1]) {
                  rows[sourceIdx + 1] = []
                }
                if (!_.union(_.flatten(rows)).includes(first.target)) {
                  rows[sourceIdx + 1].push(first.target);
                }
              }
              if (targetIdx > -1) {
                if (!_.union(_.flatten(rows)).includes(first.source)) {
                  rows[targetIdx - 1].push(first.source);
                }
              }
              tableLines.shift()
            }
          }
        }
      }
      // 过滤掉前置的空数组
      const filteredRows = rows.filter(i => i.length > 0)
      // 计算最高的列
      let maxHeight = 0
      filteredRows.forEach(row => {
        let height = row.length * this.TABLE_HEIGHT + (row.length - 1) * Configuration.GULP_Y_BETWEEN_TABLE;
        // 把字段的高度加进入
        if (this.graphType == GraphType.TABLE_AND_COLUMN) {
          row.forEach((step) => {
            try {
              height += this.steps[step].columns.length * Configuration.COLUMN_HEIGHT;
            } catch (e) {
              console.error(`columns of ${step} not found`)
            }
          })
        }
        if (height > maxHeight) {
          maxHeight = height
        }
      })
      // 对表进行排序
      filteredRows.forEach(row => {
        row.sort((a, b) => {
          return this.steps[a].name.localeCompare(this.steps[b].name)
        })
      })
      // 计算具体的坐标
      filteredRows.forEach((row, rowIndex) => {
        // 列内已经用掉的高度
        let heightUsed = 0;
        // 列的高度
        let rowHeight = row.length * this.TABLE_HEIGHT + (row.length - 1) * Configuration.GULP_Y_BETWEEN_TABLE;

        // 把字段的高度加进入
        if (this.graphType == GraphType.TABLE_AND_COLUMN) {
          row.forEach((step) => {
            try {
              rowHeight += this.steps[step].columns.length * Configuration.COLUMN_HEIGHT;
            } catch (e) {
              console.error(`columns of ${step} not found`)
            }
          })
        }

        row.forEach((step, idx) => {
          let position = {
            width: Configuration.TABLE_WIDTH,
            height: this.TABLE_HEIGHT,
            x: this.currentX,
            y: this.clusterY + (Configuration.TABLE_VERTICAL_ALIGN == VerticalAlign.MIDDLE ? (maxHeight - rowHeight) / 2 : 0) + heightUsed,
          }
          if (this.graphType == GraphType.TABLE_AND_COLUMN) {
            this.calculatePositionsOfColumns(step, position);
          }
          this.positions.set(step, position);
          this.updateCurrentAndExploredPosition(position, rowIndex == filteredRows.length - 1 && idx == row.length - 1, idx == row.length - 1);
          let height = position.height + Configuration.GULP_Y_BETWEEN_TABLE;
          heightUsed += height;
        })
      })
    }
  }

  /*
  处理当前坐标和已探索坐标
   */
  private updateCurrentAndExploredPosition(position: Position, lastOfCluster: boolean = false, lastOfRow: boolean = false): void {
    if (lastOfRow) {
      this.currentX = position.x + position.width + Configuration.GULP_X_BETWEEN_TABLE;
    }
    this.currentY = position.y + position.height;
    if (this.currentX > this.exploredX) {
      this.exploredX = this.currentX;
    }
    if (this.currentY > this.exploredY) {
      this.exploredY = this.currentY;
    }
    if (lastOfCluster) {
      // 如果是簇中的最后一张表，则更新下个簇的起始坐标
      this.clusterY = this.exploredY + Configuration.GULP_Y_BETWEEN_CLUSTER;
    }
  }

  /*
 处理组的当前坐标和已探索坐标
  */
  private updateCurrentAndExploredPositionOfGroup(
    position: Position,
    lastOfRow: boolean = false,
    lastOfCluster: boolean = false
  ): void {
    if (position.x + position.width + Configuration.GULP_X_BETWEEN_GROUP > this.exploredX) {
      this.exploredX = position.x + position.width + Configuration.GULP_X_BETWEEN_GROUP
    }
    this.currentY = position.y + position.height + Configuration.GULP_Y_BETWEEN_GROUP;
    if (this.exploredY < this.currentY) {
      this.exploredY = this.currentY;
    }
    if (lastOfRow) {
      // 如果是列中的最后一个组，则更新下个列的起始横坐标
      this.currentX = this.exploredX;
      this.currentY = position.y;
    }
    if (lastOfRow && lastOfCluster) {
      this.currentY = this.exploredY;
    }
  }


  /*
  处理组内坐标和已探索坐标
   */
  private updateCurrentAndExploredPositionByGroup(schema: string, positionInner: GroupPositionRecorder, position: any, lastOfCluster: boolean = false, lastOfRow: boolean = false): void {
    if (lastOfRow) {
      positionInner.currentX = position.x + position.width + Configuration.GULP_X_BETWEEN_TABLE;
    }
    positionInner.currentY = position.y + position.height;
    if (positionInner.currentX > positionInner.exploredX) {
      positionInner.exploredX = positionInner.currentX;
    }
    if (positionInner.currentY > positionInner.exploredY) {
      positionInner.exploredY = positionInner.currentY;
    }
    if (lastOfCluster) {
      // 如果是簇中的最后一张表，则更新下个簇的起始坐标
      positionInner.clusterY = positionInner.exploredY + Configuration.GULP_Y_BETWEEN_CLUSTER;
    }
    let currentX = position.x + position.width;
    if (currentX > positionInner.width) {
      positionInner.width = currentX + Configuration.GROUP_PADDING * 2;
    }
    positionInner.height = positionInner.exploredY + Configuration.GROUP_TITLE_HEIGHT + +Configuration.GROUP_PADDING;
    this.currentAndExploredPositionByGroup.set(schema, positionInner)
  }

  /*
   待开发编辑功能时，再启用本方法。需要取消相关属性的readonly属性
   */
  public setTableLines(tableLines: Array<TableLine>): void {
    // this.tableLines = tableLines;
  }
}

export default PositionCalculator
