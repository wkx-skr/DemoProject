<template>
  <div class="list-box" v-loading="treeLoading">
    <datablau-dialog
      title="添加报表"
      v-if="reportDialogVisible"
      :visible.sync="reportDialogVisible"
      append-to-body
      :close-on-click-modal="false"
      custom-class="table-list-dialog"
      width="900px"
      :height="490"
    >
      <choose-report
        hasAccess
        :appTypes="[
          { label: '多维分析', text: '多维分析', value: 'Analysis' },
          {
            label: '报表',
            text: '报表',
            value: 'Report',
          },
          {
            label: '清单',
            text: '清单',
            value: 'List',
          },
        ]"
        @editReportForm="handleAddReport"
      ></choose-report>
    </datablau-dialog>
    <datablau-dialog
      title="添加文件资产"
      v-if="fileDialogVisible"
      :visible.sync="fileDialogVisible"
      append-to-body
      custom-class="eltable-list-dialog"
      :close-on-click-modal="false"
      width="900px"
      :height="570"
    >
      <choose-file-asset
        hasAccess
        @add2Catalog="add2Catalog"
      ></choose-file-asset>
    </datablau-dialog>
    <datablau-dialog
      title="添加元数据"
      :visible.sync="dialogVisibleData"
      v-if="dialogVisibleData"
      append-to-body
      :close-on-click-modal="false"
      width="800px"
      :height="520"
    >
      <searchbusinesscolumn
        :key="dialogVisibleData + currentParentId"
        search-view
        search-table
      ></searchbusinesscolumn>
    </datablau-dialog>

    <datablau-dialog
      :title="categoryDialogTitle"
      append-to-body
      :visible.sync="dialogVisible"
      @close="cancelCatalog"
      width="600px"
    >
      <el-form
        v-if="dialogVisible"
        :model="ruleForm"
        :rules="rules"
        ref="ruleForm"
        label-width="100px"
        class="demo-ruleForm category-dialog"
      >
        <el-form-item label="上级目录">
          <datablau-cascader
            size="medium"
            style="width: 300px"
            :options="categoryOptions"
            :props="optionProps"
            @change="categoryChange"
            v-model="ruleForm.parentId"
            :disabled="categoryDialogType !== 'add'"
            :class="{ seeCascader: categoryDialogType !== 'add' }"
            :show-all-levels="categoryDialogType === 'add' ? true : false"
            clearable
          ></datablau-cascader>
        </el-form-item>
        <el-form-item label="目录名称" prop="name">
          <datablau-input
            :placeholder="'请输入分类名称'"
            clearable
            v-model="ruleForm.name"
            style="width: 300px"
          ></datablau-input>
        </el-form-item>
        <el-form-item label="英文简称">
          <datablau-input
            :placeholder="'请输入英文简称'"
            clearable
            v-model="ruleForm.englishName"
            style="width: 300px"
          ></datablau-input>
        </el-form-item>
        <el-form-item label="描述">
          <el-input
            type="textarea"
            :autosize="{ minRows: 2, maxRows: 4 }"
            placeholder="请输入描述"
            style="width: 300px"
            v-model="ruleForm.comment"
          ></el-input>
        </el-form-item>
      </el-form>
      <!-- <el-input
        v-model="catalogName"
        ref="appendCatalogInput"
        size="mini"
        autofocus
        @keydown.native.enter="appendCatalog"
      ></el-input> -->
      <span
        slot="footer"
        class="dialog-footer"
        style="text-align: right; display: block"
        v-if="categoryDialogType === 'add'"
      >
        <datablau-button size="mini" type="secondary" @click="cancelCatalog">
          {{ $t('common.button.cancel') }}
        </datablau-button>
        <datablau-button size="mini" type="primary" @click="appendCatalog">
          确 定
        </datablau-button>
      </span>
      <span
        slot="footer"
        class="dialog-footer"
        v-else
        style="text-align: right; display: block"
      >
        <datablau-button
          size="mini"
          type="text"
          @click="empty"
          v-show="ruleForm.name"
        >
          清空
        </datablau-button>
        <datablau-button size="mini" @click="cancelCatalog">
          {{ $t('common.button.cancel') }}
        </datablau-button>
        <datablau-button
          size="mini"
          type="primary"
          @click="renameCatalog"
          :disabled="!ruleForm.name"
        >
          确 定
        </datablau-button>
      </span>
    </datablau-dialog>

    <datablau-dialog
      title="重命名"
      :visible.sync="dialogVisibleRename"
      append-to-body
      :close-on-click-modal="false"
      width="400px"
    >
      <el-input
        v-model="newName"
        size="mini"
        @keydown.native.enter="renameCatalog"
      ></el-input>
      <span slot="footer" class="dialog-footer">
        <datablau-button
          size="mini"
          type="text"
          @click="newName = ''"
          v-show="newName"
        >
          清空
        </datablau-button>
        <datablau-button
          size="mini"
          type="secondary"
          @click="dialogVisibleRename = false"
        >
          {{ $t('common.button.cancel') }}
        </datablau-button>
        <datablau-button
          size="mini"
          type="primary"
          @click="renameCatalog"
          :disabled="!newName"
        >
          确 定
        </datablau-button>
      </span>
    </datablau-dialog>

    <datablau-dialog
      title="移动到"
      :visible.sync="dialogVisibleMove"
      append-to-body
      :close-on-click-modal="false"
      width="400px"
    >
      <el-tree
        ref="tree3"
        class="light-blue-tree"
        :data="treeData"
        node-key="id"
        :props="defaultProps"
        @node-click="handleMoveToNodeClick"
        :expand-on-click-node="true"
        :default-expanded-keys="expandedKeys"
      ></el-tree>
      <span slot="footer" class="dialog-footer">
        <datablau-button type="secondary" @click="dialogVisibleMove = false">
          {{ $t('common.button.cancel') }}
        </datablau-button>
        <datablau-button type="primary" @click="moveCatalog">
          确 定
        </datablau-button>
      </span>
    </datablau-dialog>

    <!-- <datablau-dialog
      title="添加标准代码"
      v-if="codeDialogVisible"
      :visible.sync="codeDialogVisible"
      append-to-body
      :close-on-click-modal="false"
      width="900px"
    >
      <choose-code></choose-code>
    </datablau-dialog> -->
    <!-- <datablau-dialog
      title="添加数据服务API"
      v-if="apiDialogVisible"
      :visible.sync="apiDialogVisible"
      append-to-body
      :close-on-click-modal="false"
      width="900px"
    >
      <choose-api @addCatalogApi="addCatalogApi"></choose-api>
    </datablau-dialog> -->
    <div :class="!dataSecurity ? 'data-asset-div' : 'dataSecurity-box'">
      <div v-if="!dataSecurity" class="bottom-part">
        <span class="page-name">资产目录管理</span>
        <!-- <datablau-button type="text" size="mini" @click="currentId=0;dialogVisible = true;">新建一级目录</datablau-button> -->
        <span class="bottom-more" v-if="writable && stas !== 'false'">
          <i class="el-icon-more" @click="callbottomContent"></i>
        </span>
      </div>
      <datablau-input
        :class="!dataSecurity ? 'data-asset-input' : 'other-input'"
        class="filter-input"
        v-model="keyword"
        clearable
        :iconfont-state="true"
        placeholder="搜索目录名称"
      ></datablau-input>
      <el-tooltip
        v-if="dataSecurity"
        effect="dark"
        :content="showUnFold ? '收起' : '展开'"
        placement="top-start"
        class="search-right"
        popper-class="meta-top-tooltip"
      >
        <datablau-button
          class="iconfont top-btn"
          :class="showUnFold ? 'icon-shouqi' : 'icon-zhankai'"
          @click="expandOrCollapseTopLevel"
          type="text"
        ></datablau-button>
      </el-tooltip>
      <datablau-tree
        class="grey-tree"
        :class="!dataSecurity ? 'data-asset-tree' : 'other-tree'"
        ref="tree2"
        auto-expand-parent
        v-loading="loading"
        :data-supervise="!dataSecurity"
        :data-options-function="dataOptionsFunction"
        :data-icon-function="dataIconFunction"
        @node-click="handleNodeClick"
        @node-expand="handleNodeExpand"
        @node-collapse="handleNodeCollapse"
        node-key="id"
        :expand-on-click-node="false"
        :props="defaultProps"
        :default-expanded-keys="expandedKeys"
        :data="treeData"
        :filter-node-method="filterNode"
        draggable
        :allow-drag="allowDrag"
        :allow-drop="allowDrop"
        @node-drag-end="nodeDragEnd"
      ></datablau-tree>

      <el-upload
        style="display: none"
        ref="upload"
        :action="$url + '/service/catalogs/import'"
        :on-error="handleUploadFailure"
        :on-success="onUploadSuccessed"
        :accept="'.xlsx'"
        :headers="$headers"
        :before-upload="startImport"
      >
        <div id="uploadConTem">上传数据目录导入文件</div>
      </el-upload>
    </div>
  </div>
</template>

<script>
import list from './businessList'
export default list
</script>

<style scoped lang="scss">
@import '~@/next/components/basic/color.sass';
.list-box {
  position: absolute;
  left: 0;
  width: 280px;
  top: 0;
  bottom: 0;
  border: 1px solid var(--border-color-lighter);
  border-left: none;
  background-color: var(--default-bgc);
}
.bottom-part {
  position: absolute;
  left: 0;
  top: 0px;
  right: 0;
  height: 40px;
  line-height: 40px;
  .page-name {
    font-size: 14px;
    font-weight: 400;
    color: $text-default;
    // line-height: 14px;
    margin-left: 20px;
  }
  .bottom-more {
    float: right;
    margin-right: 10px;
    text-align: center;
    vertical-align: middle;
    i {
      cursor: pointer;
      display: inline-block;
      width: 20px;
      line-height: 18px;
      &:hover {
        color: #409eff;
        background-color: rgba(64, 158, 255, 0.1);
      }
    }
  }
}
.data-asset-div {
  margin-top: 40px;
}
.filter-input {
  padding: 10px;
  padding-top: 0;
  width: 100%;
  &.data-asset-input {
    width: 100%;
  }
  &.other-input {
    padding-right: 40px;
  }
}
.dataSecurity-box {
  .other-input {
    padding-top: 10px;
  }
  .search-right {
    position: absolute;
    right: 0px;
    top: 15px;
  }
}
.grey-tree {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  overflow: auto;
  &.data-asset-tree {
    top: 84px;
  }
  &.other-tree {
    top: 54px;
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
</style>
