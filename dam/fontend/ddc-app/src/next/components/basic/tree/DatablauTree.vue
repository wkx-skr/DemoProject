<template>
  <div>
    <el-tree
      :test-name="testName"
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
      :empty-text="emptyText"
    ></el-tree>
  </div>
</template>

<script>
import DatablauTree from './DatablauTree.js'
export default DatablauTree
</script>

<style lang="scss">
@import '../color';
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
    top: 0;
    .el-checkbox__input {
      .el-checkbox__inner {
        border-color: $text-disabled;
      }
      &.is-checked,
      &.is-indeterminate {
        .el-checkbox__inner {
          border-color: $primary-color;
        }
      }
      &.is-disabled {
        .el-checkbox__inner {
          border-color: $text-disabled;
          background-color: $component-divide-color;
          &:after {
            border-color: $text-disabled;
          }
        }
      }
    }
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
  .el-tree-node__content:hover {
    .more {
      opacity: 1;
      background-color: inherit;
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
