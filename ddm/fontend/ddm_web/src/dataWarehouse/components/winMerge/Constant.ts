import ContentType from './ContentType'

interface LineContent {
  type: ContentType,
  content: string,
  added?: boolean
}
enum ConflictType {
  Remove,
  Add,
  Change,
  CurrentRemove,
  CurrentAdd,
  CurrentChange
}
class Conflict {
  public start: number
  public end: number
  private type: ConflictType
  public constructor () {
    this.start = -1
    this.end = -1
  }

  // @deprecated
  public toggleCurrent (isCurrent: boolean) {
    if (isCurrent) {
      if (this.type === ConflictType.Add) {
        this.type = ConflictType.CurrentAdd
      }
      if (this.type === ConflictType.Change) {
        this.type = ConflictType.CurrentChange
      }
      if (this.type === ConflictType.Remove) {
        this.type = ConflictType.CurrentRemove
      }
    } else {
      if (this.type === ConflictType.CurrentAdd) {
        this.type = ConflictType.Add
      }
      if (this.type === ConflictType.CurrentChange) {
        this.type = ConflictType.Change
      }
      if (this.type === ConflictType.CurrentRemove) {
        this.type = ConflictType.Remove
      }
    }
  }
}
enum MoveValueMethod {
  LeftToRight,
  RightToLeft,
  LeftAllToRight,
  RightAllToLeft
}
export { LineContent, Conflict, MoveValueMethod }
