import {Shape, StepShape, ColumnShape, GroupShape} from "../types/Shape";
import {VersionContent} from "../types/Version";
// @ts-ignore
const vThis = window.vueThis
enum RecordType {
  MOVE,
  ADD_TABLE,
  REMOVE_TABLE,
  ADD_EDGE,
  REMOVE_EDGE,
}

interface RecordContent {
  recordMessage: string,
  recordType: RecordType,
}



interface MoveRecordContent extends RecordContent{
  recordContent: Array<Shape>
}
interface AddTableRecordContent extends RecordContent {
  recordContent: Array<Shape>
}


class Record {
  private static recordList: Array<RecordContent> = []
  private static currentIndex:number = -1

  public static createRecord(record: RecordContent): boolean {
    this.recordList.length = this.currentIndex + 1
    this.recordList.push(record)
    this.currentIndex = this.recordList.length - 1
    return true
  }

  public static undo(): RecordContent {
    if (!this.canUndo()) {
      throw new Error(`非法调用undo，内存中没有找到更早的record`)
    } else {
      let idx = this.currentIndex;
      this.currentIndex--;
      return this.recordList[idx];
    }
  }

  public static redo(): RecordContent {
    if (!this.canRedo()) {
      throw new Error(`非法调用redo，内存中没有找到更晚的record`)
    } else {
      let idx = this.currentIndex + 1;
      this.currentIndex++;
      return this.recordList[idx]
    }
  }

  public static canUndo(): boolean {
    return this.currentIndex >= 0;
  }

  public static canRedo(): boolean {
    return this.currentIndex < this.recordList.length - 1;
  }

  public static getRecords(): VersionContent | void {
    let addedStep: Array<Shape> = []
    this.recordList.filter(i => i.recordType == RecordType.ADD_TABLE).forEach(item => {
      addedStep = addedStep.concat((item as AddTableRecordContent).recordContent)
    })
    return {
      addedStep: addedStep
    }
  }

  public static clearRecords(): void {
    this.recordList.length = 0;
    this.currentIndex = -1;
  }
}
export {
  MoveRecordContent,
  AddTableRecordContent,
  RecordType,
  Record
}
