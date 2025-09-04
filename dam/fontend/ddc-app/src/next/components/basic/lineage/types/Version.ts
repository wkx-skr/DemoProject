import GraphType from "./GraphType";
import {Position} from "./Position";

interface VersionMessage {
  id?: number,
  title: string,
  time: number,
  graphType ?: GraphType,
  positionChanged?: boolean,
  metadataChanged?: boolean,
}
interface VersionContent {
  positions ?: Map<string, Position>,
  addedStep ?: Array<any>,
  removedStep ?: Array<any>,
  addedEdge ?: Array<any>,
  removedEdge ?: Array<any>
}

export {
  VersionMessage,
  VersionContent
}
