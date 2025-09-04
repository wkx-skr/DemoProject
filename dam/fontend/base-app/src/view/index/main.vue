<template>
  <div>
    <el-dialog
      title="指标ID编码规则"
      width="400px"
      append-to-body
      :visible.sync="idRuleDialogVisible"
    >
      <id-rule v-if="idRuleDialogVisible" @close="abortEditIdRule"></id-rule>
      <span slot="footer" class="dialog-footer">
        <el-button size="small" @click="abortEditIdRule">关闭</el-button>
        <el-button type="primary" size="small" @click="editIdRule">

          {{ $t('common.button.ok') }}

        </el-button>
      </span>
    </el-dialog>
    <el-dialog
      title="目录名称"
      width="400px"
      append-to-body
      class="few-content"
      :visible.sync="addCategoryDialogVisible"
    >
      <el-input
        ref="addCategory"
        size="small"
        placeholder="请输入目录名称"
        autofocus
        v-model="categoryName"
        @keydown.native.enter="addCategory"
      ></el-input>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" size="small" @click="addCategory">

          {{ $t('common.button.ok') }}

        </el-button>
        <el-button size="small" @click="abortAddCategory">关闭</el-button>
      </div>
    </el-dialog>
    <el-dialog
      title="目录名称"
      width="400px"
      append-to-body
      class="few-content"
      :visible.sync="renameCategoryDialogVisible"
    >
      <el-input
        ref="renameCategory"
        size="small"
        placeholder="请输入目录名称"
        autofocus
        v-model="categoryName"
        @keydown.native.enter="renameCategory"
      ></el-input>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" size="small" @click="renameCategory">

          {{ $t('common.button.ok') }}

        </el-button>
        <el-button size="small" @click="abortRenameCategory">关闭</el-button>
      </span>
    </el-dialog>
    <el-popover
      ref="popover_context"
      placement="right-start"
      class="context-menu"
      :visible-arrow="false"
      width="0"
      title=""
      :offset="10"
      trigger="click"
      v-model="showPop"
    >
      <div class="context-menu-style">
        <div class="context-option" @click="addBaseCode">
          <i class="el-icon-circle-plus"></i>
          添加原子指标
        </div>
      </div>
      <div class="context-menu-style">
        <div class="context-option" @click="handleAddCategory">
          <i class="el-icon-plus"></i>
          添加子目录
        </div>
      </div>
      <div class="context-menu-style">
        <div class="context-option" @click="handleRenameCategory">
          <i class="el-icon-edit"></i>
          重命名
        </div>
      </div>
      <div class="context-menu-style">
        <div class="context-option" @click="removeCategory">
          <i class="el-icon-delete"></i>
          {{ $t('common.button.delete') }}
        </div>
      </div>
    </el-popover>
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
        <el-input
          size="small"
          suffix-icon="el-icon-search"
          placeholder="输入关键字过滤"
          v-model="keyword"
          class="rect-input"
        ></el-input>
      </div>
      <div class="tree-box">
        <button class="anchor" id="anchor" v-popover:popover_context></button>
        <button class="anchor" id="codeAnchor" v-popover:popover_code></button>
        <el-tree
          class="grey-tree"
          :show-checkbox="false"
          ref="mainTree"
          v-loading="!treeData"
          :data="treeData"
          :render-content="renderContent"
          :expand-on-click-node="false"
          :filter-node-method="filterNode"
          :default-expand-all="false"
          :default-expanded-keys="defaultExpandedKeys"
          :current-node-key="currentNodeKey"
          :props="defaultProps"
          @node-click="handleNodeClick"
          @node-expand="handleNodeExpand"
          @node-collapse="handleNodeCollapse"
          :check-strictly="false"
          :auto-expand-parent="true"
          node-key="id"
          draggable
          :allow-drag="allowDrag"
          :allow-drop="allowDrop"
          @node-drop="handleNodeDrop"
          @node-drag-start="handleNodeDrag"
        ></el-tree>
      </div>
      <div class="manage-box">
        <el-button icon="el-icon-refresh" size="mini" @click="getTreeData">
          刷新
        </el-button>
        <el-upload
          style="display: none; margin-left: 1em"
          v-if="hasAccess"
          :action="$url + '/service/me/upload'"
          :before-upload="handleBeforeUpload"
          :on-success="handleUploadSuccess"
          :on-error="onError"
          :show-file-list="false"
          :headers="$headers"
        >
          <el-button size="mini" icon="icon-ic-quality-import" ref="uploadBtn">
            &nbsp;导入
          </el-button>
        </el-upload>
        <el-dropdown trigger="click" @command="handleAdd" v-if="hasAccess">
          <span class="el-dropdown-link" style="margin-left: 0.5em">
            <el-button size="mini">
              <i class="fa fa-table"></i>
              模版
              <i class="el-icon-arrow-down el-icon--right"></i>
            </el-button>
          </span>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="download">
              <i class="fa fa-download"></i>
              下载模版
            </el-dropdown-item>
            <el-dropdown-item command="upload">
              <i class="fa fa-upload"></i>
              导入指标
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
        <el-dropdown trigger="click" @command="handleCommand" v-if="hasAccess">
          <span class="el-dropdown-link" style="margin-left: 0.5em">
            <el-button size="mini" icon="el-icon-setting">
              配置
              <i class="el-icon-arrow-down el-icon--right"></i>
            </el-button>
          </span>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="category">添加根目录</el-dropdown-item>
            <el-dropdown-item command="property">公共属性</el-dropdown-item>
            <el-dropdown-item command="monitor">观测对象</el-dropdown-item>
            <el-dropdown-item command="function">函数</el-dropdown-item>
            <el-dropdown-item command="idRule">指标ID编码规则</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
        <!--<span class="count">已选{{checkedListLength}}项</span>-->
      </div>
    </div>
    <div class="resize-column-middle" style="left: 300px; width: 8px"></div>
    <div class="content-area">
      <item-list
        v-show="mode === 'list'"
        ref="itemList"
        @row-click="handleIndexClick"
      ></item-list>
      <scan-detail
        v-if="mode === 'scan'"
        :detail="currentDetail"
        :type="currentType"
        :key="currentKey"
        :msgFromParent="msgFromParent"
        :baseCodeObj="baseCode"
      ></scan-detail>
      <index-detail
        v-if="mode === 'edit'"
        :list="treeData"
        :node="currentTreeNode"
        :detail="currentDetail"
        :type="currentType"
        :key="currentKey"
        :dims="dims"
        :times="times"
        :monitors="monitors"
        :functions="functions"
        :allProperties="allProperties"
        :msgFromParent="msgFromParent"
        :baseCodeObj="baseCode"
        :parentCodeObj="parentCode"
        :categoryId="parentId"
        @update="getTreeData"
      ></index-detail>
      <edit-time dimType="time" v-show="mode === 'time'"></edit-time>
      <edit-dim dimType="normal" v-show="mode === 'dim'"></edit-dim>
      <edit-monitor v-show="mode === 'monitor'"></edit-monitor>
      <select-property v-show="mode === 'property'"></select-property>
      <edit-function v-show="mode === 'function'"></edit-function>
    </div>
  </div>
</template>

<script>
import code from './main.js'
export default code
</script>

<style scoped lang="scss">
@import './main.scss';
</style>
