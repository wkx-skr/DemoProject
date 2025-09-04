interface Location {
  x: number;
  y: number;
}
interface Position extends Location {
  width: number;
  height: number;
  groupId ?: string | number | null | undefined; // 由于group和step是在position类中形成的，因此混入此处进行处理。
}
export { Location, Position };
