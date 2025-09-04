<template>
  <div id="dir-rule-management">
    <!-- 删除结果提示 -->
    <datablau-dialog
      :title="$t('securityModule.tip')"
      size="s"
      :visible.sync="delTip"
      v-if="delTip"
    >
      <div class="tip-content">
        <div class="item" v-for="item in quoteList" :key="item.id">
          <div class="title">
            <i class="el-icon-error fail-icon"></i>
            {{ $t('maskingRule.delFailTip', { num: quoteList.length }) }}
            <span class="span-error-tip">{{ $t('maskingRule.delTip') }}</span>
            <!-- <div class="copy" v-copy="item.list.join('；')">复制</div> -->
          </div>
          <div class="list">
            {{ item.name }}
          </div>
        </div>
      </div>
      <span slot="footer">
        <datablau-button type="secondary" @click="delTip = false">
          {{ $t('securityModule.close') }}
        </datablau-button>
      </span>
    </datablau-dialog>
    <datablau-dialog
      width="480px"
      append-to-body
      :title="$t('maskingRule.importMaskRule')"
      :close-on-click-modal="false"
      :visible.sync="showUpload"
      v-if="showUpload"
      @close="handleCloseUploadDialog"
    >
      <template>
        <div class="uploadContent">
          <p class="uploadtip">{{ $t('maskingRule.importFileType') }}</p>
          <datablau-button
            style="float: right; margin-right: -25px; line-height: 32px"
            type="text"
            @click="exportRuleModule"
          >
            {{ $t('maskingRule.exportTem') }}
          </datablau-button>
          <datablau-upload
            :action="'/datasecurity/mask/rule/upload'"
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
                <span>{{ $t('maskingRule.importFile') }}</span>
              </datablau-button>
            </slot>
            <div slot="tip" class="el-upload__tip"></div>
          </datablau-upload>
        </div>
        <div slot="footer">
          <datablau-button type="secondary" @click="handleCloseUploadDialog">
            {{ $t('securityModule.cancel') }}
          </datablau-button>
          <datablau-button
            :disabled="fileList.length === 0"
            type="primary"
            @click="sureImport"
          >
            {{ $t('securityModule.sure') }}
          </datablau-button>
        </div>
      </template>
    </datablau-dialog>
    <div class="rule-management-tree">
      <catalog-tree
        ref="catalogTree"
        :type="'MASK_RULE'"
        :clickTree="clickTree"
      ></catalog-tree>
    </div>
    <div class="resize-column-middle"></div>
    <div class="rule-right-box">
      <template v-if="listShow">
        <div class="search-header-box">
          <datablau-list-search>
            <div>
              <datablau-input
                style="border-radius: 2px; display: inline-block"
                v-model="keyword"
                @keyup.native.enter="searchRuleList"
                :placeholder="$t('maskingRule.searchName')"
                :iconfont-state="true"
                clearable
              ></datablau-input>
            </div>
            <template
              slot="buttons"
              v-if="$auth.MAIN_DATA_AUTH_DESENSITIZATION_STATIC_RULE"
            >
              <datablau-button
                class="iconfont icon-tianjia"
                type="important"
                @click="showEdit"
              >
                {{ $t('securityModule.new') }}
              </datablau-button>
              <el-dropdown
                trigger="click"
                @command="moreHandle"
                class="more-fun-btn"
                style="margin-left: 10px"
                v-if="
                  $auth.MAIN_DATA_AUTH_DESENSITIZATION_STATIC_RULE_UPLOAD ||
                  $auth.MAIN_DATA_AUTH_DESENSITIZATION_STATIC_RULE_DOWNLOAD
                "
              >
                <datablau-button type="secondary" icon="el-icon-plus">
                  {{ $t('securityModule.more') }}
                  <i class="el-icon-arrow-down el-icon--right"></i>
                </datablau-button>
                <el-dropdown-menu class="more-drop-box" slot="dropdown">
                  <el-dropdown-item
                    icon="iconfont icon-import"
                    command="import"
                    v-if="
                      $auth.MAIN_DATA_AUTH_DESENSITIZATION_STATIC_RULE_UPLOAD
                    "
                  >
                    {{ $t('securityModule.import') }}
                  </el-dropdown-item>
                  <el-dropdown-item
                    icon="iconfont icon-export"
                    command="export"
                    v-if="
                      $auth.MAIN_DATA_AUTH_DESENSITIZATION_STATIC_RULE_DOWNLOAD
                    "
                  >
                    {{ $t('securityModule.export') }}
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
              :reserve-selection="true"
              :row-key="'ruleId'"
              class="datablau-table table"
              style="width: 100%"
              height="100%"
              :data-selectable="
                $auth.MAIN_DATA_AUTH_DESENSITIZATION_STATIC_RULE ||
                $auth.MAIN_DATA_AUTH_DESENSITIZATION_STATIC_RULE_DOWNLOAD
              "
            >
              <el-table-column
                show-overflow-tooltip
                prop="ruleName"
                :label="$t('securityModule.name')"
                min-width="150"
              ></el-table-column>
              <el-table-column
                show-overflow-tooltip
                prop="catalogPath"
                :label="$t('maskingRule.inCatalog')"
                min-width="120"
              ></el-table-column>
              <el-table-column
                show-overflow-tooltip
                prop="dbType"
                :label="$t('maskingRule.databaseType')"
                :width="130"
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
                :label="$t('securityModule.creationTime')"
                :width="140"
                sortable="custom"
                :formatter="timeFormatter"
              ></el-table-column>
              <el-table-column
                show-overflow-tooltip
                prop="ruleDesc"
                :label="$t('securityModule.des')"
                min-width="280"
              >
                <template slot-scope="scope">
                  {{ scope.row.ruleDesc || '--' }}
                </template>
              </el-table-column>
              <el-table-column
                :label="$t('securityModule.operate')"
                fixed="right"
                align="center"
                width="120"
                v-if="$auth.MAIN_DATA_AUTH_DESENSITIZATION_STATIC_RULE"
              >
                <template slot-scope="scope">
                  <datablau-button
                    :tooltip-content="$t('securityModule.view')"
                    type="icon"
                    class="iconfont icon-see"
                    @click="handleRule(scope.row, 'see')"
                  ></datablau-button>
                  <datablau-button
                    :tooltip-content="$t('securityModule.edit')"
                    type="icon"
                    class="iconfont icon-bianji"
                    @click="handleRule(scope.row, 'edit')"
                  ></datablau-button>
                  <datablau-button
                    class="iconfont icon-delete"
                    :tooltip-content="$t('securityModule.delete')"
                    type="icon"
                    @click="deleteRule(scope.row)"
                  ></datablau-button>
                </template>
              </el-table-column>
            </datablau-table>
            <template slot="buttons">
              <div class="bottom">
                <btn-tip :num="selections.length"></btn-tip>
                <datablau-button
                  type="danger"
                  v-if="
                    selections.length > 0 &&
                    $auth.MAIN_DATA_AUTH_DESENSITIZATION_STATIC_RULE
                  "
                  class="el-icon-delete"
                  @click="mulipleDeleRule"
                >
                  {{ $t('securityModule.delete') }}
                </datablau-button>
                <datablau-button
                  v-if="
                    selections.length > 0 &&
                    $auth.MAIN_DATA_AUTH_DESENSITIZATION_STATIC_RULE_DOWNLOAD
                  "
                  @click="exportRule(false)"
                >
                  {{ $t('securityModule.export') }}
                </datablau-button>
                <datablau-pagination
                  @size-change="handleSizeChange"
                  @current-change="handleCurrentChange"
                  :current-page.sync="currentPage"
                  :page-sizes="[20, 50, 100, 200]"
                  :page-size.sync="pageSize"
                  layout="total, sizes, prev, pager, next, jumper"
                  :total="total"
                  class="page"
                ></datablau-pagination>
              </div>
            </template>
          </datablau-form-submit>
        </div>
      </template>
    </div>
    <div class="breadcrumb-box" v-if="renderEdit">
      <div class="datablau-breadcrumb-header" style="padding: 8px 20px 0">
        <div>
          <datablau-breadcrumb
            :nodeData="breadcrumbNodes"
            :couldClick="false"
            @back="goBack"
          ></datablau-breadcrumb>
        </div>
      </div>
    </div>
    <rule-edit
      v-if="renderEdit"
      :treeData="treeData"
      :ruleData="ruleData"
      :show="renderEdit"
      :catalogMap="catalogMap"
      :isEdit="isEdit"
      :isView="isView"
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
.tip-content {
  .title {
    line-height: 30px;
    color: #555555;
    font-weight: 600;
    i {
      font-size: 24px;
      vertical-align: middle;
      margin-right: 6px;
      margin-left: 0;
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
      padding: 5px 10px;
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
    p {
      line-height: 24px;
    }
    span {
      // margin-right: 10px;
    }
  }
}
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
  /deep/ .upload-demo {
    height: 32px;
    .el-upload__tip {
      display: none;
    }
    .el-upload-list {
      display: inline-block;
      vertical-align: middle;
      margin-left: 4px;
      height: 24px;
      overflow: hidden;
      .el-upload-list__item {
        &:first-child {
          margin-top: 0;
        }
      }
    }
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
  background-color: var(--default-bgc);
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  .breadcrumb-box {
    position: absolute;
    top: 0px;
    left: 0;
    right: 0;
    height: 40px;
    background: #fff;
    z-index: 9;
  }
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

    .page {
      float: right;
    }
  }
}
</style>
