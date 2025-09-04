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
    <datablau-dialog
      :title="dialogTitle"
      width="400px"
      :visible.sync="dialogVisible"
      append-to-body
    >
      <el-form label-width="6em" :rules="formRules">
        <el-form-item :label="$t('domain.dimension.dimensionCode')" prop="dialogId">
          <el-input
            size="small"
            :disabled="dialogType === 'rename'"
            v-model="dialogId"
            :placeholder="$t('domain.dimension.dimensionCodePlaceholder')"
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
        <datablau-button type="primary" size="small" @click="handleDialog">
          {{ $t('common.button.ok') }}
        </datablau-button>
        <datablau-button size="small" @click="abortHandleDialog">
          {{$t('domain.common.close')}}
        </datablau-button>
      </span>
    </datablau-dialog>
    <datablau-dialog
      :title="$t('domain.common.new') + $t('domain.common.spacing') + typeLabel"
      width="400px"
      :visible.sync="addCategoryDialogVisible"
      append-to-body
    >
      <el-form label-position="right" label-width="3em" :rules="formRules">
        <el-form-item :label="$t('domain.dimension.dimensionCode')" prop="categoryId">
          <el-input
            v-model="categoryId"
            size="small"
            :placeholder="$t('domain.dimension.dimensionCodePlaceholder')"
          ></el-input>
        </el-form-item>
        <el-form-item :label="$t('domain.dimension.name')">
          <el-input
            ref="addCategory"
            size="small"
            :placeholder="$t('domain.dimension.namePlaceholder')"
            autofocus
            v-model="categoryName"
            @keydown.native.enter="addCategory"
          ></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <datablau-button type="primary" size="small" @click="addCategory">
          {{ $t('common.button.ok') }}
        </datablau-button>
        <datablau-button size="small" @click="abortAddCategory">
          {{$t('domain.common.close')}}
        </datablau-button>
      </span>
    </datablau-dialog>
    <datablau-dialog
      :title="$t('domain.common.modify') + $t('domain.common.spacing') + typeLabel + $t('domain.common.spacing') + $t('domain.dimension.name')"
      width="400px"
      :visible.sync="renameCategoryDialogVisible"
      append-to-body
    >
      <el-input
        ref="renameCategory"
        size="small"
        :placeholder="$t('domain.dimension.categoryNamePlaceholder')"
        autofocus
        v-model="categoryName"
        @keydown.native.enter="renameCategory"
      ></el-input>
      <span slot="footer" class="dialog-footer">
        <datablau-button type="primary" size="small" @click="renameCategory">
          {{ $t('common.button.ok') }}
        </datablau-button>
        <datablau-button size="small" @click="abortRenameCategory">
          {{$t('domain.common.close')}}
        </datablau-button>
      </span>
    </datablau-dialog>
    <div class="tree-area">
      <div class="tree-search-box">
        <datablau-input
          style="width: 100%"
          suffix-icon="el-icon-search"
          :placeholder="$t('domain.common.search')"
          v-model="keyword"
        ></datablau-input>
      </div>
      <div class="tree-box">
        <button class="anchor" id="anchor" v-popover:popover_context></button>
        <button class="anchor" id="codeAnchor" v-popover:popover_code></button>
        <datablau-tree
          style="
            position: absolute;
            left: 0;
            right: 0;
            bottom: 0;
            top: 0;
            overflow: auto;
          "
          class="light-blue-tree grey-tree"
          ref="mainTree"
          :data="treeData"
          :key="treeKey"
          default-expand-all
          :props="defaultProps"
          :data-icon-function="treeIconFunction"
          :data-supervise="true"
          :data-options-function="dataOptionsFunction"
          @node-click="handleNodeClick"
          :filter-node-method="filterNode"
          node-key="catalogId"
          :show-overflow-tooltip="true"
        ></datablau-tree>
      </div>
      <div class="manage-box">
        <el-button
          v-if="hasAccess && $auth['DATA_STANDARD_DIM_CATALOG_IMPORT']"
          size="mini"
          @click="exportFromStandardCode"
        >
          {{ $t('domain.dimension.importFromDomainCode') }}
        </el-button>
      </div>
    </div>
    <div class="meta-resize-column-middle" style="left: 240px"></div>
    <div class="content-area">
      <div class="title-line" v-if="currentDim">
        <span class="title">
          {{ currentType !== 'MONITOR' ? currentDim.catalog : '' }}
        </span>
        <span style="margin-left: 2em">
          <span v-if="currentDim.catalogId">
            {{ $t('domain.dimension.dimensionCodeLabel') }}
          </span>
          {{ currentDim.catalogId }}
        </span>
        <datablau-button
          v-if="hasAccess && $auth['DATA_STANDARD_DIM_CATALOG_VALUE_ADD']"
          class="el-icon-add"
          style="float: right"
          type="primary"
          @click="callDialog('value', 'add', true)"
        >
          {{ currentType !== 'MONITOR' ? $t('domain.dimension.addValue') : $t('domain.dimension.addObservation') }}
        </datablau-button>
      </div>
      <datablau-table
        v-if="currentDim"
        :data="dims"
        :height="tableHeight"
        @sort-change="handleSortChange"
      >
        <el-table-column width="28">
          <datablau-icon
            :data-type="'dimension'"
            :size="18"
            style="margin-top: 8px"
          ></datablau-icon>
        </el-table-column>
        <el-table-column
          :label="$t('domain.dimension.dimensionCode')"
          :prop="
            typeLabel === $t('domain.dimension.observationObject')
              ? 'objectId'
              : 'dimCode'
          "
          show-overflow-tooltip
          sortable="custom"
        ></el-table-column>
        <el-table-column
          :label="
            typeLabel !== $t('domain.dimension.observationObject')
              ? typeLabel + $t('domain.common.spacing') + $t('domain.dimension.value')
              : typeLabel
          "
          :prop="
            typeLabel === $t('domain.dimension.observationObject')
              ? 'monitorObject'
              : 'value'
          "
          show-overflow-tooltip
          sortable="custom"
        ></el-table-column>
        <el-table-column
          :label="$t('domain.common.operation')"
          width="140"
          v-if="hasAccess"
          header-align="center"
          align="left"
        >
          <template slot-scope="scope">
            <datablau-button
              type="text"
              v-if="$auth['DATA_STANDARD_DIM_CATALOG_VALUE_RENAME']"
              @click="callDialog('value', 'rename', scope.row)"
            >
              {{ $t('domain.common.rename') }}
            </datablau-button>
            <datablau-button
              type="text"
              v-if="$auth['DATA_STANDARD_DIM_CATALOG_VALUE_DELETE']"
              @click="deleteDim(scope.row)"
            >
              {{ $t('common.button.delete') }}
            </datablau-button>
          </template>
        </el-table-column>
      </datablau-table>
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
