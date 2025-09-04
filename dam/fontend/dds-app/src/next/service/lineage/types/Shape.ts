import {Position} from "@/next/service/lineage/types/Position.ts";
import {ShapeType, StepType } from "@/next/service/lineage/types/ShapeType.ts";

interface ShapeInterface extends Position {
  text: string;
  id: string;
}
interface StepShapeInterface extends Shape {
}
interface ColumnShapeInterface extends Shape {

}
class Shape implements ShapeInterface {
  width: number;
  height: number;
  x: number;
  y: number;
  text: string;
  id: string;
  public oldX ?: number;
  public oldY ?: number;
  public byUser?: boolean;
  constructor(id: string,width: number, height: number, x: number, y: number) {
    this.width = width
    this.height = height
    this.x = x
    this.y = y
    this.text = 'place text here'
    this.id = id;
  }
}
class GroupShape extends Shape {
  private readonly shapeType: ShapeType = ShapeType.GROUP;
  private label: string;
  constructor(
    id: string,
    width: number,
    height: number,
    x: number,
    y: number,
    label: string,
  ) {
    super(id, width, height, x, y);
    this.label = label;
  }
}
class StepShape extends Shape implements StepShapeInterface {
  private readonly shapeType: ShapeType = ShapeType.STEP;
  public stepType: StepType = StepType.PROCESS;
  private $user_custom: boolean | null | undefined = false;
  private label: string = 'table name';
  private schema: string | null | undefined = ''
  private groupId: string | number | null = null;
  constructor(
    id: string,
    stepType: StepType,
    $user_custom: boolean | null | undefined,
    width: number,
    height: number,
    x: number,
    y: number,
    label: string,
    schema: string | null | undefined,
  ) {
    super(id, width, height, x, y);
    this.stepType = stepType;
    this.$user_custom = $user_custom;
    this.label = label;
    this.schema = schema;
  }
  public setGroupId (groupId: string | number):void {
    this.groupId = groupId;
  }
}
class ColumnShape extends Shape implements ColumnShapeInterface {
  private readonly shapeType: ShapeType = ShapeType.COLUMN;
  private label: string = 'column name';
  private tId: string;
  private tX: number;
  private tY: number;
  constructor(
    tId: string,
    tX: number,
    tY: number,
    id: string,
    width: number,
    height: number,
    x: number,
    y: number,
    label: string
  ) {
    super(id, width, height, x, y);
    this.label = label;
    this.tId = tId;
    this.tX = tX;
    this.tY = tY;
  }
}
export {
  Shape,
  GroupShape,
  StepShape,
  ColumnShape
}
