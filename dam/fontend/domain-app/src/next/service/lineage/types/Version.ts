import GraphType from "@/next/service/lineage/types/GraphType";
import {Position} from "@/next/service/lineage/types/Position";

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
