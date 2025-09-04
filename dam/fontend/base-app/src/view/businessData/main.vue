<template>
  <div>
    <el-popover
      ref="popover_code"
      placement="right-start"
      class="context-menu"
      :visible-arrow="false"
      width="0"
      title=""
      :offset="10"
      trigger="click"
      v-model="showCodePop"
    >
      <div class="context-menu-style">
        <div class="context-option" @click="changeModeToEdit">
          <i class="el-icon-edit"></i>
          编辑
        </div>
      </div>
      <div class="context-menu-style">
        <div class="context-option" @click="removeCode">
          <i class="el-icon-delete"></i>
          {{ $t('common.button.delete') }}
        </div>
      </div>
    </el-popover>
    <div class="tree-area">
      <div class="tree-search-box">
        <datablau-input
          style="width: 260px"
          placeholder="输入关键字过滤"
          v-model="keyword"
          :iconfont-state="true"
          clearable
          class="rect-input"
        ></datablau-input>
      </div>
      <div class="tree-box" style="margin-top: 10px">
        <button class="anchor" id="codeAnchor" v-popover:popover_code></button>
        <datablau-tree
          class="light-blue-tree"
          :show-checkbox="false"
          ref="mainTree"
          :data="treeData"
          :expand-on-click-node="true"
          default-expand-all
          :filter-node-method="filterNode"
          :default-expanded-keys="defaultExpandedKeys"
          :current-node-key="currentNodeKey"
          :props="defaultProps"
          :data-icon-function="dataIconFunction"
          :data-supervise="supervise"
          :data-options-function="dataOptionsFunction"
          @node-click="handleNodeClick"
          @node-expand="handleNodeExpand"
          @node-collapse="handleNodeCollapse"
          auto-expand-parent
          node-key="id"
        ></datablau-tree>
      </div>
      <div class="manage-box">
        <datablau-button
          class="el-icon-refresh"
          type="secondary"
          @click="getTreeData"
        >
          刷新
        </datablau-button>
        <el-upload
          style="display: none; margin-left: 1em"
          v-if="hasAccess"
          :action="$url + '/service/busiObjects/upload'"
          :on-success="handleUploadSuccess"
          :on-error="$showUploadFailure"
          :show-file-list="false"
          :headers="$headers"
        >
          <datablau-button
            type="secondary"
            icon="icon-ic-quality-import"
            ref="uploadBtn"
          >
            导入
          </datablau-button>
        </el-upload>
        <el-dropdown trigger="click" @command="handleAdd" v-if="hasAccess">
          <span class="el-dropdown-link" style="margin-left: 0.5em">
            <datablau-button
              class="fa fa-table"
              type="secondary"
              style="font-size: 12px"
            >
              模版
              <i class="el-icon-arrow-down el-icon--right"></i>
            </datablau-button>
          </span>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="download">
              <i class="iconfont icon-download"></i>
              下载模版
            </el-dropdown-item>
            <el-dropdown-item command="upload">
              <i class="iconfont icon-upload"></i>
              批量导入
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
        <datablau-button
          class="iconfont icon-tianjia"
          type="secondary"
          @click="add"
          style="margin-left: 0.5em; font-size: 12px"
        >
          业务流程
        </datablau-button>
        <!--<span class="count">已选{{checkedListLength}}项</span>-->
        <!--<span class="count">已选{{checkedListLength}}项</span>-->
      </div>
    </div>
    <div class="resize-column-middle" style="left: 280px; z-index: 2"></div>
    <div class="content-area">
      <div class="model-category-header" v-if="mode">
        <div>
          <datablau-breadcrumb
            @back="goBack"
            :node-data="nodeData"
            :couldClick="false"
          ></datablau-breadcrumb>
        </div>
      </div>
      <scan-detail
        v-if="mode === 'scan'"
        :detail="currentDetail"
        :key="currentKey"
      ></scan-detail>
      <index-detail
        v-if="mode === 'edit'"
        :isAdd="isAdd"
        :detail="currentDetail"
        :key="currentKey"
        @changeBreadcrumb="changeBreadcrumb"
      ></index-detail>
    </div>
  </div>
</template>

<script>
import code from './main.js'
export default code
</script>

<style scoped lang="scss">
@import './main.scss';
/deep/ .is-block {
  &:before {
    font-size: 16px;
    vertical-align: middle;
  }
}
.tree-area {
  width: 280px;
}
</style>
