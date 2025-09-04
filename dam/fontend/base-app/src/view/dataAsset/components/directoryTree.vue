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
          style="width: 100%; padding: 0px 15px 0 10px"
        >
          <el-dropdown
            v-if="structureOptions.length"
            trigger="click"
            @command="changeStructure"
            style="line-height: 32px"
            @visible-change="changeDropdownVisible"
            placement="bottom-end"
          >
            <span class="el-dropdown-link">
              {{ currentStructureName }}
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
              :class="{ 'dropdown-max': structureOptions.length > 20 }"
            >
              <div style="max-height: calc(100vh - 110px); overflow: auto">
                <el-dropdown-item
                  v-for="(structure, index) in structureOptions"
                  :key="structure.name"
                  :command="index"
                  style="overflow: hidden"
                >
                  <span style="float: left">{{ structure.name }}</span>
                  <span
                    :style="{
                      float: 'right',
                      color: '#8492a6',
                      fontSize: '13px',
                      visibility: structure.hasPermission
                        ? 'hidden'
                        : 'visible',
                      marginLeft: '15px',
                    }"
                  >
                    <el-tooltip placement="top">
                      <div slot="content">
                        {{ $t('assets.assetList.noCatalogPower') }}
                      </div>
                      <i class="el-icon-lock"></i>
                    </el-tooltip>
                  </span>
                </el-dropdown-item>
              </div>
            </el-dropdown-menu>
          </el-dropdown>
          <i
            v-if="editable && isStructureManager"
            class="iconfont icon-lue structure-operator"
            @click="callbottomContent"
          ></i>
          <template v-else-if="isOverview"></template>
          <datablau-tooltip
            v-else
            :content="$t('assets.catalogue.structureDetails')"
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
      <i
        v-show="showClose"
        class="el-icon-circle-close cursor-close"
        :class="{ 'show-cursor-close': showClose }"
        @click="clear"
      ></i>
      <el-select
        ref="loadSelect"
        class="filter-input"
        v-model="chooseResult"
        :iconfont-state="true"
        clearable
        filterable
        remote
        reserve-keyword
        :placeholder="$t('assets.catalogue.searchPlaceholder')"
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
          :value="item.id"
        ></el-option>
      </el-select>
      <datablau-tooltip
        :content="
          showUnFold
            ? $t('assets.directoryStructure.putAway')
            : $t('assets.directoryStructure.expand')
        "
        placement="bottom"
        class="expand-collapse"
      >
        <i
          @click="expandOrCollapse"
          class="iconfont"
          :class="showUnFold ? 'icon-shouqi' : 'icon-zhankai'"
        ></i>
      </datablau-tooltip>
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
      <span style="margin-left: 6px; font-size: 12px">所有目录</span>
    </div>
    <div class="tree-content" :class="{ 'overview-tree-content': isOverview }">
      <datablau-tree
        class="el-tree light-blue-tree directory-tree"
        style="clear: both; position: relative"
        :show-checkbox="false"
        ref="directoryTree"
        lazy
        :load="loadCallback"
        :key="curStructureId"
        :expand-on-click-node="false"
        :default-expand-all="false"
        :props="defaultProps"
        @node-click="handleNodeClick"
        :showOverflowTooltip="true"
        check-strictly
        :draggable="pageId === 0"
        node-key="id"
        :allow-drop="allowNodeDrop"
        :data-supervise="editable"
        :filter-node-method="filterNode"
        :data-img-function="dataImgFunction"
        :data-options-function="dataOptionsFunction"
        :dataLockedFunction="dataLockedFunction"
        :dataLockedTip="dataLockedTip"
        :LockedClick="isOverview && publicShow"
        :highlight-current="true"
        :use-default-sort="false"
        @node-drop="moveSameLevelNode"
        :empty-text="$t('assets.assetList.noCatalogInfo')"
      ></datablau-tree>
    </div>
    <datablau-dialog
      :title="$t('assets.common.deleteTip')"
      width="400px"
      custom-class="deleteDialog"
      style="min-height: 0"
      :visible.sync="deleteDialogVisible"
    >
      <div style="font-size: 16px; color: #606266">
        <i
          class="el-icon-warning"
          style="margin-right: 5px; font-size: 18px; color: #e6a23c"
        ></i>
        {{ $t('assets.catalogue.deleteTip') }}
      </div>
      <div slot="footer" class="dialog-footer">
        <datablau-button @click="deleteDialogVisible = false">
          {{ $t('common.button.cancel') }}
        </datablau-button>
        <datablau-button type="primary" @click="deleteDir">
          {{ $t('common.button.ok') }}
        </datablau-button>
      </div>
    </datablau-dialog>
    <datablau-dialog
      :title="$t('assets.common.moveTip')"
      :visible.sync="moveDialogVisible"
      append-to-body
      :close-on-click-modal="false"
      width="400px"
    >
      <datablau-tree
        ref="moveTree"
        class="light-blue-tree"
        :data="currentMoveData"
        show-checkbox
        node-key="id"
        :props="defaultProps"
        @node-click="selectTargetDir"
        check-on-click-node
        @check="selectTargetDir"
        :default-expand-all="true"
        :data-img-function="dataImgFunction"
      ></datablau-tree>
      <span slot="footer" class="dialog-footer">
        <datablau-button type="secondary" @click="moveDialogVisible = false">
          {{ $t('common.button.cancel') }}
        </datablau-button>
        <datablau-button type="primary" @click="moveDir">
          {{ $t('common.button.ok') }}
        </datablau-button>
      </span>
    </datablau-dialog>
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
  margin-right: 40px;
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
</style>
