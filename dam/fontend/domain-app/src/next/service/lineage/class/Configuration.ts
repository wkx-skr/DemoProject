import {VerticalAlign} from "@/next/service/lineage/types/Configuration.ts";

class Configuration {
  /*
  纵向集中方式，顶部对齐或垂直居中
   */
  static GROUP_VERTICAL_ALIGN: VerticalAlign = VerticalAlign.TOP;
  static TABLE_VERTICAL_ALIGN: VerticalAlign = VerticalAlign.TOP;
  /*
  页面边距PAGE_MARGIN_TOP
   */
  static readonly PAGE_MARGIN_TOP: number = 20;
  static readonly PAGE_MARGIN_LEFT: number = 20;

  /*
  组
   */
  static readonly GROUP_TITLE_HEIGHT: number = 50;
  static readonly GROUP_PADDING: number = 15;
  static readonly GULP_Y_BETWEEN_GROUP: number = 50;
  static readonly GULP_X_BETWEEN_GROUP: number = 200;

  /*
  簇和表之间的间距
   */
  static readonly GULP_Y_BETWEEN_CLUSTER: number = 50;
  static readonly GULP_Y_BETWEEN_TABLE: number = 20;
  static readonly GULP_X_BETWEEN_TABLE: number = 150;

  /*
  表内部
   */
  static readonly TABLE_HEIGHT: number = 24;
  static readonly TABLE_FULL_HEIGHT: number = 48;
  static readonly TABLE_WIDTH: number = 180;
  // 可以借用TABLE_HEIGHT
  // static readonly TITLE_BASIC_HEIGHT: number = 24;
  // static readonly TITLE_FULL_HEIGHT: number = 48;
  static readonly COLUMN_HEIGHT: number = 24;

  // 左右和下的边距
  static readonly COLUMN_MARGIN: number = 1;

  // 悬浮响应延时,单位ms
  static readonly MOUSEOVER_DELAY: number = 1;

  // 鸟瞰图尺寸
  static readonly MINIVIEW_HEIGHT: number = 200;
  static readonly MINIVIEW_WIDTH: number = 300;

}
export default Configuration
