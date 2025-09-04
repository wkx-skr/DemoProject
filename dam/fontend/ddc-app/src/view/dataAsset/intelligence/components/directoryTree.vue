<!-- 目录树 -->

<template>
  <div
    class="list-box"
    :class="{ 'list-box-dec': isOverview }"
    v-loading="treeLoading"
  >
    <div class="tree-controller">
      <template v-if="structureList && structureList.length">
        <div
          class="structure-controller"
          :class="{ 'structure-controller-high': dropdownVisible }"
          style="width: 100%; padding: 0px 15px 0 10px"
        >
          <el-dropdown
            v-if="structureList.length"
            trigger="click"
            @command="changeStructure"
            style="line-height: 36px; max-width: calc(100% - 45px)"
            @visible-change="changeDropdownVisible"
            placement="bottom-end"
          >
            <span
              class="el-dropdown-link"
              style="display: flex; align-items: center"
            >
              <is-show-tooltip
                :content="currentStructure.name"
              ></is-show-tooltip>
              <!-- {{ currentStructureName }} -->
              <i
                class="el-icon--right"
                :class="{
                  'el-icon-arrow-down': !dropdownVisible,
                  'el-icon-arrow-up': dropdownVisible,
                }"
              ></i>
            </span>
            <el-dropdown-menu
              slot="dropdown"
              :class="{ 'dropdown-max': structureList.length > 20 }"
            >
              <div style="max-height: calc(100vh - 110px); overflow: auto">
                <el-dropdown-item
                  v-for="(structure, index) in structureList"
                  :key="structure.name"
                  :command="index"
                  style="overflow: hidden; max-width: 560px"
                >
                  <span style="float: left; max-width: 450px; height: 30px">
                    <is-show-tooltip
                      :content="structure.name"
                    ></is-show-tooltip>
                  </span>
                </el-dropdown-item>
              </div>
            </el-dropdown-menu>
          </el-dropdown>

          <datablau-tooltip
            v-else
            :content="$t('assets.directoryTree.structureDetails')"
            class="structure-operator tooltip-operator"
          >
            <i
              :class="['iconfont', isOverview ? 'icon-paixu' : 'icon-shezhi']"
              @click="$bus.$emit('changeStructure', currentStructureIndex)"
            ></i>
          </datablau-tooltip>
        </div>
      </template>
    </div>
    <div class="bottom-part lazy-tree-box">
      <datablau-select
        ref="loadSelect"
        class="filter-input"
        v-model="chooseResult"
        :iconfont-state="true"
        clearable
        filterable
        remote
        reserve-keyword
        :placeholder="$t('assets.directoryTree.searchPlaceholder')"
        :remote-method="searchCatalog"
        :loading="searchLoading"
        :noDataText="noDataText"
        popper-class="tree-search-popper"
        @change="handleChooseChange"
        @focus="handleChooseSelectFocus"
        @visible-change="visibleChange"
        :isIcon="'icon-search'"
      >
        <el-option
          v-for="item in searchResult"
          :key="item.id"
          :label="item.catalogNamePath"
          :value="item.id + '-' + item.catalogPath"
        ></el-option>
      </datablau-select>
    </div>
    <div
      class="root-name"
      :class="{ 'high-root-name': !currentNode.id }"
      v-if="isOverview"
      @click="clickRoot"
    >
      <!-- {{ currentStructureName }} -->
      <span
        class="iconfont icon-file"
        style="font-size: 16px; color: #409eff"
      ></span>
      <span style="margin-left: 6px; font-size: 12px">全部数据资产</span>
    </div>
    <div
      class="tree-content"
      v-if="currentStructure && currentStructure.id"
      :class="{ 'overview-tree-content': isOverview }"
    >
      <datablau-easy-tree
        class="el-tree light-blue-tree directory-tree"
        style="clear: both; position: relative"
        ref="directoryTree"
        lazy
        :load="loadCallback"
        @check="handleCheck"
        :key="currentStructure.id"
        :expand-on-click-node="false"
        :default-expand-all="false"
        :props="defaultProps"
        @node-click="handleNodeClick"
        :showOverflowTooltip="true"
        check-strictly
        node-key="id"
        :data-supervise="false"
        :filter-node-method="filterNode"
        :data-img-function="dataImgFunction"
        :default-expanded-keys="expandedKeys"
        :current-node-key="currentKey"
        :default-checked-keys="checkedKeys"
        :highlight-current="true"
        :use-default-sort="false"
        :empty-text="
          treeLoading ? '' : $t('assets.directoryTree.noCatalogInfo')
        "
        :itemSize="34"
        :highlightCurrent="true"
        height="100%"
        :showCheckbox="showCheckbox"
        :canCheckType="canCheckType"
      ></datablau-easy-tree>
    </div>
  </div>
</template>

<script>
import directoryTree from './directoryTree.js'
export default directoryTree
</script>

<style scoped lang="scss">
@import '~@/next/components/basic/color.sass';
.tip-content {
  .title {
    line-height: 30px;
    color: #555555;
    font-weight: 600;
    i {
      font-size: 24px;
      vertical-align: middle;
      margin-right: 6px;
      &.success-icon {
        color: #66bf16;
      }
      &.same-icon {
        color: #e6ad00;
      }
      &.fail-icon {
        color: #ff4b53;
      }
    }
    .copy {
      float: right;
      padding: 0px 10px;
      color: #409eff;
      cursor: pointer;
      font-weight: normal;
      height: 30px;
      line-height: 30px;
    }
  }
  .list {
    margin-bottom: 6px;
    margin-top: 6px;
    height: 120px;
    padding: 8px 10px;
    box-sizing: border-box;
    background: #f5f5f5;
    color: #555555;
    overflow-y: auto;
    span {
      // margin-right: 10px;
    }
  }
}
.list-box {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  border: 1px solid var(--border-color-lighter);
  border-left: none;
  background-color: var(--default-bgc);
  &.list-box-dec {
    .tree-controller {
      /deep/ .datablau-select {
        // width: 100%;
      }
    }
    .bottom-part {
      // padding-top: 10px;
      /deep/ .datablau-tooltip {
        top: 10px;
      }
    }
    .root-name {
      height: 34px;
      line-height: 34px;
      padding: 0 10px;
      font-size: 14px;
      cursor: pointer;
      color: #555;
      &.high-root-name {
        background-color: transparentize($color: $primary-color, $amount: 0.9);
        color: $primary-color;
      }
    }
  }

  /deep/ .el-tree__empty-text {
    font-size: 12px;
  }
}
.bottom-part {
  padding: 4px 10px;
  // margin-right: 40px;
  line-height: 34px;
  box-sizing: border-box;
  .expand-collapse {
    height: 24px;
    width: 24px;
    line-height: 24px;
    text-align: center;
    font-size: 14px;
    cursor: pointer;
    color: #999;
    position: absolute;
    right: -32px;
    top: 8px;
  }
  position: relative;

  /deep/ .el-select .el-input__prefix {
    .icon-search {
      vertical-align: top;
    }
  }
  i.icon-shouqi,
  .icon-zhankai {
    height: 24px;
    width: 24px;
    line-height: 24px;
    text-align: center;
    font-size: 16px;
    cursor: pointer;
    color: #999;
    &:hover {
      color: #409eff;
    }
  }
  .page-name {
    color: $text-default;
    font-size: 12px;
    color: #555555;
    font-weight: 600;
  }
  .bottom-more {
    float: right;
    text-align: center;
    vertical-align: middle;
    margin-right: -4px;
    i {
      cursor: pointer;
      display: inline-block;
      width: 20px;
      line-height: 18px;
      color: #999;
      &.icon-lue {
        width: 24px;
        height: 24px;
        line-height: 24px;
        margin-left: 8px;
        font-size: 14px;
      }
      &:hover {
        color: #409eff;
        background-color: rgba(64, 158, 255, 0.1);
      }
    }
  }
}
.tree-controller {
  position: relative;
  width: 100%;
  margin-top: 10px;
  /deep/ .datablau-select {
    width: calc(100% - 34px);
    float: left;
  }

  .structure-controller {
    &.structure-controller-high {
      /deep/ .el-dropdown {
        color: #409eff;

        .el-icon--right {
          color: #409eff;
        }
      }
    }
    /deep/ .el-dropdown {
      &:hover {
        color: #409eff;

        .el-icon--right {
          color: #409eff;
        }
      }
    }
    /deep/ .text-tooltip {
      display: inline-block;
      // width: calc(100% - 32px);
      height: 36px;
    }
    /deep/ .el-dropdown {
      cursor: pointer;
      &:hover {
        .el-icon--right {
          color: #409eff;
        }
      }
    }
    /deep/.el-icon--right {
      transition: transform 0.3s ease-in-out, -webkit-transform 0.3s ease-in-out;
    }
  }

  .structure-operator {
    position: absolute;
    right: 10px;
    cursor: pointer;
    font-size: 16px;
    text-align: center;
    border-radius: 2px;
    margin-top: 5px;
    padding: 4px;
    &.tooltip-operator {
      margin-top: 0;
    }
    &:hover {
      background-color: var(--tree-current-bgc);
      transition: background-color 0.3s;
      color: #409eff;
      i {
        color: #409eff;
      }
    }
  }

  /deep/ .datablau-select .el-select .el-input input {
    border: none;

    background-color: rgb(245, 245, 245);
    font-size: 14px;
    color: #555;
  }
  /deep/ .el-select .el-input .el-select__caret {
    color: #999;
  }
}

.tree-content {
  width: 100%;
  height: calc(100% - 118px);
  position: absolute;
  top: 90px;
  bottom: 0;
  overflow-x: hidden;
  overflow-y: auto;
  &.overview-tree-content {
    top: 118px;
  }
}
.root-node {
  position: relative;
  padding: 0 15px;
  height: 34px;
  line-height: 34px;
  .structure-name {
    display: inline-block;
    max-width: calc(100% - 40px);
    line-height: normal;
    vertical-align: middle;
    /deep/ .el-tooltip {
      width: 100%;
      display: inline-block;
    }
  }
  &.root-node-click {
    cursor: pointer;
  }
  &.root-node-active {
    background: transparentize(#409eff, 0.9);
  }
  i.icon-lue {
    position: absolute;
    right: 7px;
    top: 5px;
    width: 24px;
    height: 24px;
    line-height: 24px;
    text-align: center;
    font-size: 14px;
    cursor: pointer;
    color: #999;
    &:hover {
      color: #409eff;
      background-color: rgba(64, 158, 255, 0.1);
      border-right: 2px;
      transition: all 0.2s ease-in-out;
    }
  }
  span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
.filter-input {
  width: 100%;
  &.other-input {
    padding-right: 40px;
  }
}
.dataSecurity-box {
  .search-right {
    position: absolute;
    right: 0px;
    top: 15px;
  }
}
.directory-tree {
  height: 100%;
  overflow: auto;
  /deep/ .el-tree__empty-block {
    min-height: 180px;
  }
  /deep/ .grey-tree.datablau-tree .el-icon-caret-right {
    margin-left: 0.1em;
  }
}
</style>
<style lang="scss" scoped>
.category-dialog {
  .el-input--medium .el-input__inner {
    height: 34px;
    line-height: 34px;
  }
  .el-form-item__content {
    line-height: 34px;
  }
  .el-form-item__label {
    line-height: 34px;
  }
  .el-form-item {
    margin-bottom: 16px;
  }
  .el-form-item__error {
    padding-top: 2px;
  }
}
#context-menu {
  position: absolute;
  z-index: 999;
  //box-shadow: 0 2px 12px 0 rgba(0,0,0,.1);
  .context-option {
    display: flex;
    align-items: center;
    width: 120px;
  }
}
.el-tag {
  height: 24px;
  line-height: 24px;
  border: none;
  margin: 2px 6px;
}
</style>
<style lang="scss">
.el-form.db-form .el-textarea,
.el-form.db-form .datablau-input[type='textarea'] {
  width: 500px;
}
.dialog-footer {
  text-align: right;
}
.deleteDialog .dialog-footer {
  text-align: right;
}
.tree-search-popper .el-select-dropdown__empty {
  font-size: 12px;
}
.dropdown-max {
  top: 85px !important;
  // max-width: 600px;
  // height: auto;
  // // bottom: 0 !important;
  // // display: flex;
  // // flex-flow: row wrap;
  left: 160px !important;
  // max-height: calc(100vh - 110px);
  // overflow: auto !important;
  // li {
  //   margin-right: 5px;
  //   white-space: nowrap;
  // }
  .popper__arrow {
    left: 35px !important;
  }
}
.el-dialog__wrapper .el-dialog.move-dialog {
  .grey-tree.datablau-tree .el-checkbox {
    top: 1px;
  }
  .el-dialog__body {
    // min-height: 280px;
    padding-top: 0;
    .datablau-dialog-content {
      margin-top: 10px;
      height: calc(100% - 10px);
    }
  }
}
</style>
