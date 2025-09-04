<template>
  <div>
    <!-- <el-dialog
      width="500px"
      title="选择标准代码"
      :visible.sync="standardCodeDialogVisible"
      v-if="standardCodeDialogVisible"
      append-to-body
    >
      <div class="tree-box" style="height: 400px; overflow: auto">
        <el-input
          size="mini"
          v-model="codeKeyword"
          placeholder="输入关键字进行搜索"
          clearable
          suffix-icon="el-icon-search"
        ></el-input>
        <el-tree
          ref="tree"
          :data="codeTreeData"
          :props="codeDefaultProps"
          :filter-node-method="codeFilterNode"
          :render-content="codeRenderContent"
          @node-click="codeHandleNodeClick"
          class="light-blue-tree"
        ></el-tree>
      </div>
      <el-button
        :disabled="!selectBtnEnable || codeUploading"
        @click="codeSelected"
        size="small"
        type="primary"
        style="margin-top: 10px"
      >
        <span v-if="!codeUploading">确定</span>
        <span v-else>导入中...</span>
      </el-button>
    </el-dialog> -->
    <code-select></code-select>
    <el-dialog
      :title="dialogTitle"
      width="400px"
      :visible.sync="dialogVisible"
      append-to-body
    >
      <el-form label-width="6em" :rules="formRules">
        <el-form-item label="编码" prop="dialogId">
          <el-input
            size="small"
            :disabled="dialogType === 'rename'"
            v-model="dialogId"
            placeholder="如果为空，将自动生成1"
          ></el-input>
        </el-form-item>
        <el-form-item :label="typeLabel" :required="true">
          <el-input
            ref="dialogInput"
            size="small"
            :placeholder="dialogPlaceholder"
            autofocus
            v-model="dialogName"
            @keydown.native.enter="handleDialog"
          ></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" size="small" @click="handleDialog">

          {{ $t('common.button.ok') }}

        </el-button>
        <el-button size="small" @click="abortHandleDialog">关闭</el-button>
      </span>
    </el-dialog>
    <el-dialog
      :title="'新增' + typeLabel"
      width="400px"
      :visible.sync="addCategoryDialogVisible"
      append-to-body
    >
      <el-form label-position="right" label-width="3em" :rules="formRules">
        <el-form-item label="编码" prop="categoryId">
          <el-input
            v-model="categoryId"
            size="small"
            placeholder="如果为空，将自动生成"
          ></el-input>
        </el-form-item>
        <el-form-item label="名称">
          <el-input
            ref="addCategory"
            size="small"
            placeholder="请输入名称"
            autofocus
            v-model="categoryName"
            @keydown.native.enter="addCategory"
          ></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" size="small" @click="addCategory">

          {{ $t('common.button.ok') }}

        </el-button>
        <el-button size="small" @click="abortAddCategory">关闭</el-button>
      </span>
    </el-dialog>
    <el-dialog
      :title="'修改' + typeLabel + '名称'"
      width="400px"
      :visible.sync="renameCategoryDialogVisible"
      append-to-body
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
      <div
        class="context-menu-style"
        v-if="$auth['DATA_STANDARD_DIM_CATALOG_ADD']"
      >
        <div class="context-option" @click="handleAddCategory">
          <i class="el-icon-circle-plus"></i>
          <span :key="typeLabel">添加{{ typeLabel }}</span>
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
      <div
        class="context-menu-style"
        v-if="$auth['DATA_STANDARD_DIM_CATALOG_VALUE_ADD']"
      >
        <div class="context-option" @click="callDialog('value', 'add')">
          <i class="el-icon-circle-plus"></i>
          添加值
        </div>
      </div>
      <div
        class="context-menu-style"
        v-if="$auth['DATA_STANDARD_DIM_CATALOG_RENAME']"
      >
        <div class="context-option" @click="handleRenameCategory">
          <i class="el-icon-edit"></i>
          重命名
        </div>
      </div>
      <div
        class="context-menu-style"
        v-if="$auth['DATA_STANDARD_DIM_CATALOG_DELETE']"
      >
        <div class="context-option" @click="deleteDims">
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
          class="light-blue-tree grey-tree"
          :show-checkbox="false"
          ref="mainTree"
          :data="treeData"
          :key="treeKey"
          :render-content="renderContent"
          :expand-on-click-node="false"
          default-expand-all
          :props="defaultProps"
          @node-click="handleNodeClick"
          :filter-node-method="filterNode"
          check-strictly
          node-key="catalogId"
        ></el-tree>
      </div>
      <div class="manage-box">
        <el-button icon="el-icon-refresh" size="mini" @click="refresh">
          刷新
        </el-button>
        <el-button
          v-if="hasAccess && $auth['DATA_STANDARD_DIM_CATALOG_IMPORT']"
          size="mini"
          @click="exportFromStandardCode"
        >
          由标准代码导入
        </el-button>
      </div>
    </div>
    <div class="content-area">
      <div class="title-line" v-if="currentDim">
        <span class="title">
          <span style="color: #555; font-size: 20px">{{ typeLabel }}</span>
          {{ currentType !== 'MONITOR' ? ' /' + currentDim.catalog : '' }}
        </span>
        <span style="margin-left: 2em">
          <span v-if="currentDim.catalogId">编码：</span>
          {{ currentDim.catalogId }}
        </span>
        <el-button
          v-if="hasAccess && $auth['DATA_STANDARD_DIM_CATALOG_VALUE_ADD']"
          size="small"
          class="el-icon-add"
          style="float: right"
          type="primary"
          @click="callDialog('value', 'add')"
        >
          {{ currentType !== 'MONITOR' ? '添加值' : '添加观测对象' }}
        </el-button>
      </div>
      <el-table
        v-if="currentDim"
        :data="dims"
        class="datablau-table"
        :height="tableHeight"
        v-loading="tableLoading"
        @sort-change="handleSortChange"
      >
        <el-table-column
          label="编码"
          :prop="typeLabel === '观测对象' ? 'objectId' : 'dimCode'"
          show-overflow-tooltip
          sortable="custom"
        ></el-table-column>
        <el-table-column
          :label="typeLabel !== '观测对象' ? typeLabel + '值' : typeLabel"
          :prop="typeLabel === '观测对象' ? 'monitorObject' : 'value'"
          show-overflow-tooltip
          sortable="custom"
        ></el-table-column>
        <el-table-column label="操作" width="160" v-if="hasAccess">
          <template slot-scope="scope">
            <el-button
              type="text"
              v-if="$auth['DATA_STANDARD_DIM_CATALOG_VALUE_RENAME']"
              @click="callDialog('value', 'rename', scope.row)"
            >
              重命名
            </el-button>
            <el-button
              type="text"
              v-if="$auth['DATA_STANDARD_DIM_CATALOG_VALUE_DELETE']"
              @click="deleteDim(scope.row)"
            >
              {{ $t('common.button.delete') }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script>
import main from './main.js'
export default main
</script>

<style scoped lang="scss">
@import './main.scss';
</style>
<style lang="scss">
.el-popover {
  min-width: 150px;
}
</style>
