<template>
  <div id="dir-rule-management">
    <datablau-dialog
      :title="dialogTitle"
      v-if="dialogVisible"
      :visible.sync="dialogVisible"
    >
      <el-form
        label-width="80px"
        :rules="rules"
        ref="ruleForm"
        :model="ruleForm"
      >
        <el-form-item label="目录名称" prop="name">
          <datablau-input
            maxlength="50"
            style="width: 100%"
            v-model.trim="ruleForm.name"
            @keydown.native="nameKeydown"
          ></datablau-input>
        </el-form-item>
        <el-form-item label="目录描述" prop="description">
          <datablau-input
            type="textarea"
            clearable
            show-word-limit
            maxlength="200"
            size="small"
            class="item-desc"
            style="width: 100%"
            v-model="ruleForm.describe"
            placeholder="请输入描述"
          ></datablau-input>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <datablau-button type="secondary" @click="dialogVisible = false">
          {{ $t('common.button.cancel') }}
        </datablau-button>
        <datablau-button type="important" @click="sureName">
          {{ $t('common.button.ok') }}
        </datablau-button>
      </span>
    </datablau-dialog>
    <datablau-dialog
      :size="'m'"
      append-to-body
      :title="'导入脱敏规则'"
      :close-on-click-modal="false"
      :visible.sync="showUpload"
      v-if="showUpload"
      @close="handleCloseUploadDialog"
    >
      <template>
        <div class="uploadContent">
          <p class="uploadtip">仅支持上传单个文件，支持上传文件格式为：xlsx</p>
          <datablau-button
            style="float: right; margin-right: -25px; line-height: 32px"
            type="text"
            @click="exportRuleModule"
          >
            下载模板
          </datablau-button>
          <datablau-upload
            :action="$url + '/service/datamasking/upload'"
            :before-upload="beforeUpload"
            :on-error="handleUploadError"
            :before-remove="handleRemove"
            :on-change="handleChange"
            :show-file-list="true"
            accept=".xlsx"
            :headers="$headers"
            ref="ruleUpload"
            :isEdit="true"
            :auto-upload="false"
          >
            <slot>
              <datablau-button type="secondary">
                <i class="iconfont icon-upload" style="margin-right: 6px"></i>
                <span>上传文件</span>
              </datablau-button>
            </slot>
            <div slot="tip" class="el-upload__tip"></div>
          </datablau-upload>
        </div>
        <div slot="footer">
          <datablau-button type="secondary" @click="handleCloseUploadDialog">
            取消
          </datablau-button>
          <datablau-button
            :disabled="fileList.length === 0"
            type="primary"
            @click="sureImport"
          >
            确定
          </datablau-button>
        </div>
      </template>
    </datablau-dialog>
    <div class="rule-management-tree">
      <datablau-tree-header>
        <template slot="title">数据脱敏规则</template>
        <template slot="more">
          <el-tooltip
            class="item"
            effect="dark"
            content="新建目录"
            placement="top"
          >
            <i class="iconfont icon-tianjia" @click="addCatalogue"></i>
          </el-tooltip>
        </template>
        <template slot="search">
          <datablau-input
            class="filter-input"
            v-model="treeKey"
            clearable
            :iconfont-state="true"
            placeholder="搜索目录"
          ></datablau-input>
        </template>
      </datablau-tree-header>
      <!-- <div
        class="tree-title"
        :class="{ 'tree-title-active': isSelect }"
        @click="selectRule"
      >
        <i class="iconfont icon-file"></i>
        <span>全部目录</span>
      </div>
      <div class="tree-line"></div> -->
      <div class="tree-content">
        <datablau-tree
          v-loading="treeLoading"
          class="el-tree"
          style="position: relative"
          :show-checkbox="false"
          ref="ruleTree"
          :data="treeData"
          :expand-on-click-node="false"
          default-expand-all
          :props="defaultProps"
          @node-click="handleNodeClick"
          :filter-node-method="filterNode"
          check-strictly
          node-key="catalogId"
          :data-supervise="true"
          :data-icon-function="dataIconFunction"
          :data-options-function="dataOptionsFunction"
        ></datablau-tree>
      </div>
    </div>
    <div class="resize-column-middle"></div>
    <div class="rule-right-box">
      <div class="search-header-box">
        <datablau-list-search>
          <div>
            <datablau-input
              style="border-radius: 2px; display: inline-block"
              v-model="keyword"
              @keyup.native.enter="searchRuleList"
              placeholder="搜索规则名称"
              :iconfont-state="true"
              clearable
            ></datablau-input>
          </div>
          <template slot="buttons">
            <datablau-button
              class="iconfont icon-tianjia"
              type="important"
              @click="showEdit"
            >
              新建规则
            </datablau-button>
            <el-dropdown
              trigger="click"
              @command="moreHandle"
              class="more-fun-btn"
              style="margin-left: 10px"
            >
              <datablau-button type="secondary" icon="el-icon-plus">
                更多操作
                <i class="el-icon-arrow-down el-icon--right"></i>
              </datablau-button>
              <el-dropdown-menu class="more-drop-box" slot="dropdown">
                <el-dropdown-item icon="iconfont icon-import" command="import">
                  导入规则
                </el-dropdown-item>
                <el-dropdown-item icon="iconfont icon-export" command="export">
                  导出全部
                </el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </template>
        </datablau-list-search>
      </div>
      <div class="table-box">
        <datablau-form-submit>
          <datablau-table
            :data="tableData"
            @sort-change="sortChange"
            :default-sort="{ prop: 'createDate', order: sort }"
            v-loading="tableLoading"
            :loading="tableLoading"
            :show-column-selection="false"
            @selection-change="tableSelectionChanged"
            ref="table"
            size="small"
            class="datablau-table table"
            style="width: 100%"
            height="100%"
            :data-selectable="true"
          >
            <el-table-column
              show-overflow-tooltip
              prop="ruleName"
              label="规则名称"
              min-width="120"
            ></el-table-column>
            <el-table-column
              show-overflow-tooltip
              prop="catalogPath"
              label="目录"
              min-width="120"
            ></el-table-column>
            <el-table-column
              show-overflow-tooltip
              prop="dbType"
              label="支持数据库类型"
              min-width="120"
            >
              <template slot-scope="scope">
                <database-type
                  :key="scope.row.dbType"
                  :value="scope.row.dbType"
                  :size="24"
                ></database-type>
              </template>
            </el-table-column>
            <el-table-column
              prop="createTime"
              label="创建时间"
              min-width="120"
              sortable="custom"
              :formatter="timeFormatter"
            ></el-table-column>
            <el-table-column
              show-overflow-tooltip
              prop="ruleDesc"
              label="描述"
              min-width="280"
            ></el-table-column>
            <el-table-column
              label="操作"
              fixed="right"
              align="center"
              width="120"
            >
              <template slot-scope="scope">
                <datablau-button
                  :tooltip-content="'编辑'"
                  type="icon"
                  class="iconfont icon-bianji"
                  @click="editRule(scope.row)"
                ></datablau-button>
                <datablau-button
                  class="iconfont icon-delete"
                  :tooltip-content="'删除'"
                  type="icon"
                  @click="deleteRule(scope.row.ruleId)"
                ></datablau-button>
              </template>
            </el-table-column>
          </datablau-table>
          <template slot="buttons">
            <div class="bottom">
              <span v-if="selections.length > 0" class="check-info"></span>
              <span v-if="selections.length > 0" class="footer-row-info">
                当前选中“{{ selections.length }}条”信息，是否
              </span>
              <datablau-button
                type="danger"
                v-if="selections.length > 0"
                class="el-icon-delete"
                @click="mulipleDeleRule"
              >
                {{ $t('common.button.delete') }}
              </datablau-button>
              <datablau-button
                v-if="selections.length > 0"
                @click="exportRule(false)"
              >
                导出
              </datablau-button>
              <datablau-pagination
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
                :current-page.sync="currentPage"
                :page-sizes="[10, 20, 50, 100]"
                :page-size.sync="pageSize"
                layout="total, sizes, prev, pager, next, jumper"
                :total="total"
                class="page"
              ></datablau-pagination>
            </div>
          </template>
        </datablau-form-submit>
      </div>
    </div>

    <rule-edit
      v-if="renderEdit"
      :treeData="treeData"
      :ruleData="ruleData"
      :show="renderEdit"
      :isEdit="isEdit"
      :ruleInfoCatalogId="ruleInfoCatalogId"
      @close="close"
    ></rule-edit>
  </div>
</template>
<script>
import datamaskingRule from './datamaskingRule'
export default datamaskingRule
</script>
<style lang="scss" scoped>
@import '~@/next/components/basic/color.sass';
$primary-color: #409eff;
.uploadContent {
  clear: both;
  border-radius: 4px;
  padding: 16px;
  .uploadtip {
    font-size: 12px;
    color: $text-message;
    padding-bottom: 16px;
    display: inline-block;
  }
  .autoCode {
    padding-top: 16px;
  }
}
.rule-management-tree {
  position: absolute;
  left: 0;
  width: 240px;
  top: 0;
  bottom: 0;
  border-left: none;
  background-color: var(--default-bgc);
  .tree-title {
    height: 32px;
    line-height: 32px;
    padding: 0 10px;
    margin-top: 4px;
    box-sizing: content-box;
    cursor: pointer;
    &:hover {
      background: rgba(64, 158, 255, 0.1);
      span {
        color: #409eff;
      }
    }
    &.tree-title-active {
      background: rgba(64, 158, 255, 0.1);
      span {
        color: #409eff;
      }
    }
    i {
      color: #409eff;
    }
    span {
      margin-left: 5px;
    }
  }
  .tree-line {
    height: 1px;
    margin: 4px 0;
    background: #efefef;
  }
  .tree-content {
    position: absolute;
    top: 81px;
    bottom: 10px;
    left: 0;
    overflow-y: auto;
    width: 100%;
  }
}
.resize-column-middle {
  left: 240px;
  z-index: 8;
}
.rule-right-box {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 240px;
  border-left: 1px solid var(--border-color-lighter);
  .search-header-box {
    padding: 0 20px;
    padding-top: 10px;
  }
}
#dir-rule-management {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
  background-color: var(--default-bgc);
  .search-wrapper {
    height: 34px;
    padding: 0 20px;
  }
  .table-box {
    position: absolute;
    top: 52px;
    left: 0;
    bottom: 0px;
    right: 0;
    padding: 0 20px;
    .edit {
      color: #7d8493;
      font-size: 19px;
      padding-left: 30px;
      padding-right: 20px;
    }
    .delete {
      color: #7d8493;
      font-size: 19px;
    }
  }
  .meta-data {
    border-radius: 2px;
    padding: 5px 10px;
    width: 82px;
    height: 22px;
    color: #719ff5;
    line-height: 10px;
    font-size: 12px;
    border: 1px solid #719ff5;
  }
  .entity-data {
    border-radius: 2px;
    padding: 5px 10px;
    width: 82px;
    height: 22px;
    color: #ba984a;
    text-align: center;
    line-height: 10px;
    font-size: 12px;
    border: 1px solid #ba984a;
  }
  .bottom {
    box-sizing: border-box;
    padding: 10px 20px 0;
    position: absolute;
    left: 0;
    bottom: 0;
    width: 100%;
    height: 50px;

    .check-info {
      width: 14px;
      height: 14px;
      display: inline-block;
      background: $primary-color;
      margin-right: -13px;
      vertical-align: middle;
    }

    .footer-row-info {
      height: 50px;
      margin-right: 10px;
      &:before {
        content: '\e6da';
        font-family: 'element-icons';
        font-size: 12px;
        font-weight: 200;
        margin-right: 5px;
        vertical-align: middle;
        line-height: 13px;
        color: white;
      }
    }
    .page {
      float: right;
    }
  }
}
</style>
