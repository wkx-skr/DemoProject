<template>
  <div>
    <el-tree
      ref="tree"
      v-bind="$attrs"
      class="grey-tree datablau-tree"
      v-loading="vLoading"
      :expand-on-click-node="expandOnClickNode"
      :render-content="renderContentGenerator"
      @node-contextmenu="handleContextMenu"
      @node-click="handleNodeClick"
      @check-change="emitElementEvent('check-change', arguments)"
      @check="emitElementEvent('check', arguments)"
      @current-change="emitElementEvent('current-change', arguments)"
      @node-expand="emitElementEvent('node-expand', arguments)"
      @node-collapse="emitElementEvent('node-collapse', arguments)"
      @node-drag-start="emitElementEvent('node-drag-start', arguments)"
      @node-drag-enter="emitElementEvent('node-drag-enter', arguments)"
      @node-drag-leave="emitElementEvent('node-drag-leave', arguments)"
      @node-drag-over="emitElementEvent('node-drag-over', arguments)"
      @node-drag-end="emitElementEvent('node-drag-end', arguments)"
      @node-drop="emitElementEvent('node-drop', arguments)"
      :node-key="nodeKey"
    ></el-tree>
  </div>
</template>

<script>
import DatablauTree from './DatablauTree.js'

export default DatablauTree
</script>

<style lang="scss">
@import '~@/next/components/basic/color.sass';

.grey-tree.datablau-tree {
  color: $text-default;

  .el-tree-node__label {
    font-size: 12px;
  }

  .el-tree-node.is-current > .el-tree-node__content {
    background-color: $table-hover-color;
    font-weight: normal;
    color: $primary-color;

    .more {
      opacity: 1;
      background-color: inherit;
    }

    .right-info.auto-hidden {
      display: none;
    }
  }

  .el-tree-node__content {
    transition: all 0.2s ease-in-out;
  }

  .el-tree-node__content:hover {
    background-color: $table-hover-color;

    .label-with-more {
      right: 35px !important;
    }
  }

  .el-icon-caret-right {
    margin-left: 0.9em;
  }

  // 弱化树形图的展开图标
  .el-icon-caret-right:before {
    /*font-weight: normal;*/
    color: $text-disabled;
    font-size: 12px;
    content: '\e6e0';
    font-family: 'element-icons';
  }

  .el-icon-caret-right:not(.is-leaf):hover:before {
    color: $primary-color;
  }

  .el-checkbox {
    position: relative;
    //top: -2px;
  }

  .more {
    /*display: none;*/
    color: $text-disabled;
    background-color: inherit;
    width: 24px;
    height: 24px;
    text-align: center;
    vertical-align: middle;
    line-height: 24px;
    opacity: 0;
    border-right: 2px;
    transition: all 0.2s ease-in-out;
  }

  .right-info {
    width: 27px;
    text-align: right;
    //border: 1px solid red;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    vertical-align: top;
    line-height: 34px;
    position: absolute;
    right: 4px;
  }

  .el-tree-node__content:hover {
    .more {
      opacity: 1;
      background-color: inherit;
    }

    .right-info.auto-hidden {
      display: none;
    }

    .more:hover {
      color: $primary-color;
      background-color: $table-hover-color;
    }
  }

  .el-tree-node.is-current > .el-tree-node__content {
    &:hover .more:hover {
      color: $primary-color;
      background-color: $table-hover-color;
    }
  }

  .drag-hint {
    width: 6px;
    height: 10px;
    display: inline-block;
    position: absolute;
    border: 2px dashed $text-disabled;
    left: 0;
  }

  &.el-tree.is-dragging.is-drop-not-allow .el-tree-node__content {
    cursor: pointer !important;
  }

  .iconfont {
    font-size: 14px;
    color: $primary-color;
  }

  .iconfontdomain {
    font-size: 14px;
    color: #38b48b;
  }
}
</style>
