<template>
  <div class="rule-list-box">
    <!-- 识别规则导入结果 -->
    <datablau-dialog
      :title="$t('securityModule.resultTitle')"
      size="s"
      :visible.sync="showImportTip"
      v-if="showImportTip"
    >
      <div class="tip-content">
        <div class="item" v-for="item in ruleTipList" :key="item.id">
          <template v-if="item.data.length > 0 || item.total > 0">
            <template v-if="item.id === 'success' || item.id === 'error'">
              <div class="title">
                <i :class="['el-icon-success', item.icon]"></i>
                {{ item.title }}
              </div>
            </template>
            <template v-else>
              <div class="title">
                <i
                  class="el-icon-success success-icon"
                  v-if="item.type === 'success'"
                ></i>
                <i
                  class="el-icon-info same-icon"
                  v-else-if="item.type === 'same'"
                ></i>
                <i class="el-icon-error fail-icon" v-else></i>
                {{ item.title }}：{{ item.data.length
                }}{{ $t('securityModule.strip') }}
                <div class="copy" v-copy="item.data.join('；')">
                  {{ $t('securityModule.copy') }}
                </div>
              </div>
              <div class="list">
                {{ item.data.join(';') }}
                <!-- <span v-for="(o, index) in item.data" :key="index">
                {{ item.data.join(';') }}
              </span> -->
              </div>
            </template>
          </template>
        </div>
      </div>
    </datablau-dialog>
    <!-- 导入识别规则 -->
    <datablau-dialog
      :size="'m'"
      :title="$t('intelligence.importRules')"
      :close-on-click-modal="false"
      :visible.sync="uploadShow"
      v-if="uploadShow"
      height="250px"
    >
      <div class="uploadContent">
        <p class="uploadtip">{{ $t('intelligence.importTip') }}</p>
        <datablau-button
          style="float: right; margin-right: -25px; line-height: 32px"
          type="text"
          @click="modelDownload"
        >
          {{ $t('intelligence.exportTem') }}
        </datablau-button>
        <datablau-upload
          :action="'/assets/discern/rule/import'"
          :before-upload="beforeUpload"
          :on-error="handleUploadError"
          :before-remove="handleRemove"
          :on-change="handleChange"
          :show-file-list="true"
          accept=".xlsx"
          :headers="$headers"
          ref="calssifyUpload"
          :isEdit="true"
          :auto-upload="false"
          class="standardImport-upload"
        >
          <slot>
            <datablau-button type="secondary">
              <i class="iconfont icon-upload" style="margin-right: 6px"></i>
              <span>{{ $t('intelligence.uploadFile') }}</span>
            </datablau-button>
          </slot>
          <div slot="tip" class="el-upload__tip"></div>
        </datablau-upload>
      </div>
      <div slot="footer">
        <datablau-button
          :disabled="fileList.length === 0"
          type="primary"
          @click="uploadSure"
        >
          {{ $t('common.button.ok') }}
        </datablau-button>
        <datablau-button type="secondary" @click="uploadShow = false">
          {{ $t('securityModule.cancel') }}
        </datablau-button>
      </div>
    </datablau-dialog>
    <template v-if="listShow">
      <div class="breadcrumb-box" v-if="showNew">
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
      <new-discern
        v-if="showNew"
        :ruleType="ruleType"
        :nowCatalogName="nowCatalogName"
        :discernClick="discernClick"
        :editable="discernEditable"
        :discernId="activeDiscernId"
      ></new-discern>
      <template v-else>
        <div class="tree-box">
          <catalog-tree
            ref="catalogTree"
            :type="'DISCERN_RULE'"
            from="rule"
            :clickTree="clickTree"
            @importRule="importRules"
            @exportRule="exportRule"
          ></catalog-tree>
        </div>
        <div class="resize-column-middle"></div>
        <div class="right-box">
          <template
            v-if="$auth.IDENTIFY_RULE_MANAGE || $auth.IDENTIFY_RULE_VIEW"
          >
            <datablau-list-search style="padding: 10px 20px 0">
              <datablau-input
                :iconfont-state="true"
                clearable
                v-model="keyword"
                @keyup.native.enter="searchList"
                :placeholder="$t('intelligence.searchName')"
              ></datablau-input>
              <template slot="buttons">
                <el-dropdown @command="handleCommand">
                  <datablau-button
                    :disabled="!$auth.IDENTIFY_RULE_MANAGE"
                    type="important"
                    class="iconfont icon-tianjia"
                  >
                    {{ $t('securityModule.new') }}识别规则
                  </datablau-button>
                  <el-dropdown-menu
                    slot="dropdown"
                    v-if="$auth.IDENTIFY_RULE_MANAGE"
                  >
                    <el-dropdown-item
                      :command="ruleTypeEnum.GENERAL_RULE"
                      icon="iconfont icon-tianjia"
                    >
                      {{ $t('intelligence.generalRule') }}
                    </el-dropdown-item>
                    <el-dropdown-item
                      v-if="
                        hasMachine &&
                        $versionFeature.datasecurity_AIIdentification
                      "
                      icon="iconfont icon-tianjia"
                      :command="ruleTypeEnum.MACHINE_LEARNING"
                    >
                      {{ $t('intelligence.machineRule') }}
                    </el-dropdown-item>
                    <el-dropdown-item
                      icon="iconfont icon-tianjia"
                      :command="ruleTypeEnum.CONSANGUINITY_CASCADE"
                      v-if="
                        $versionFeature.datasecurity_LineageIdentification &&
                        $featureMap['FE_LINEAGE']
                      "
                    >
                      {{ $t('intelligence.consanguinityRule') }}
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </el-dropdown>
                <el-dropdown
                  trigger="click"
                  @command="moreHandle"
                  class="more-fun-btn"
                  style="margin-left: 10px"
                  v-if="
                    ($auth.IDENTIFY_RULE_IMPORT ||
                      $auth.IDENTIFY_RULE_EXPORT) &&
                    false
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
                      v-if="$auth.IDENTIFY_RULE_IMPORT"
                    >
                      {{ $t('securityModule.import') }}
                    </el-dropdown-item>
                    <el-dropdown-item
                      icon="iconfont icon-export"
                      command="export"
                      v-if="$auth.IDENTIFY_RULE_EXPORT"
                    >
                      {{ $t('securityModule.export') }}
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </el-dropdown>
              </template>
            </datablau-list-search>
            <div class="table-box">
              <datablau-form-submit>
                <datablau-table
                  v-loading="tableLoading"
                  :loading="tableLoading"
                  :data-selectable="
                    $auth.IDENTIFY_RULE_MANAGE || $auth.IDENTIFY_RULE_EXPORT
                  "
                  :show-column-selection="false"
                  height="100%"
                  ref="ruleTable"
                  :reserve-selection="true"
                  :row-key="'ruleId'"
                  @selection-change="handleRuleChange"
                  :data="ruleData"
                  :default-sort="{ prop: orderBy, order: sort }"
                  @sort-change="sortChange"
                  row-class-name="row-can-click"
                  @row-click="see"
                >
                  <el-table-column
                    :label="$t('securityModule.name')"
                    prop="ruleName"
                    :min-width="120"
                    show-overflow-tooltip
                  ></el-table-column>
                  <el-table-column
                    :label="$t('securityModule.type')"
                    prop="ruleType"
                    :min-width="100"
                    show-overflow-tooltip
                  >
                    <template slot-scope="scope">
                      <div
                        class="type-class"
                        :style="methodRuleType(scope.row.ruleType, 2)"
                      >
                        {{ methodRuleType(scope.row.ruleType, 1) }}
                      </div>
                    </template>
                  </el-table-column>
                  <el-table-column
                    :label="$t('securityModule.des')"
                    prop="ruleDescription"
                    :min-width="280"
                    show-overflow-tooltip
                  >
                    <template slot-scope="scope">
                      {{ scope.row.ruleDescription || '--' }}
                    </template>
                  </el-table-column>
                  <el-table-column
                    sortable="custom"
                    :label="$t('securityModule.creationTime')"
                    prop="createTime"
                    :min-width="140"
                    :formatter="$timeFormatter"
                    show-overflow-tooltip
                  ></el-table-column>
                  <el-table-column
                    :label="$t('securityModule.operate')"
                    :width="120"
                    align="center"
                    fixed="right"
                    prop="operation"
                  >
                    <template slot-scope="scope">
                      <datablau-button
                        :disabled="!$auth.IDENTIFY_RULE_VIEW"
                        type="icon"
                        :tooltip-content="$t('securityModule.view')"
                        class="iconfont icon-see"
                        @click="see(scope.row)"
                      ></datablau-button>
                      <datablau-button
                        type="icon"
                        :tooltip-content="
                          getEdit(scope.row)
                            ? $t('intelligence.taskTip')
                            : $t('securityModule.edit')
                        "
                        :disabled="
                          getEdit(scope.row) ||
                          !$auth.IDENTIFY_RULE_MANAGE ||
                          scope.row.isUsed
                        "
                        class="iconfont icon-bianji"
                        @click="edit(scope.row)"
                      ></datablau-button>
                      <datablau-button
                        :disabled="!$auth.IDENTIFY_RULE_MANAGE"
                        type="icon"
                        :tooltip-content="$t('securityModule.delete')"
                        class="iconfont icon-delete"
                        @click="del(scope.row)"
                      ></datablau-button>
                    </template>
                  </el-table-column>
                </datablau-table>
                <template slot="buttons">
                  <div class="bottom">
                    <template v-if="ruleSelections.length > 0">
                      <btn-tip :num="ruleSelections.length"></btn-tip>
                      <datablau-button
                        type="danger"
                        class="el-icon-delete"
                        @click="handleDelete"
                        :disabled="!$auth.IDENTIFY_RULE_MANAGE"
                      >
                        {{ $t('securityModule.delete') }}
                      </datablau-button>
                      <datablau-button
                        :disabled="!$auth.IDENTIFY_RULE_EXPORT"
                        @click="handlerExport"
                      >
                        {{ $t('securityModule.export') }}
                      </datablau-button>
                    </template>
                    <datablau-pagination
                      @current-change="handlePageChange"
                      @size-change="handleSizeChange"
                      :current-page.sync="form.page"
                      :page-sizes="[20, 50, 100, 200]"
                      :page-size="form.size"
                      layout="total, sizes, prev, pager, next, jumper"
                      :total="total"
                      class="page"
                    ></datablau-pagination>
                  </div>
                </template>
              </datablau-form-submit>
            </div>
          </template>
          <template v-else>
            <div style="padding: 10px 20px 0">您暂无权限</div>
          </template>
        </div>
      </template>
    </template>
  </div>
</template>

<script>
import ruleList from './ruleList.js'
export default ruleList
</script>
<style lang="scss">
@import '~@/next/components/basic/color.sass';
.el-dropdown-menu__item {
  line-height: 30px;
  color: #555;
  margin: 0 6px;
  &:hover {
    color: #409eff;
    i {
      color: #409eff;
    }
  }
  i {
    font-size: 14px;
    color: #999;
  }
}
</style>
<style scoped lang="scss">
@import '~@/next/components/basic/color.sass';
.type-class {
  display: inline-block;
  width: 88px;
  height: 22px;
  line-height: 22px;
  font-size: 12px;
  text-align: center;
  border-radius: 2px;
  margin: 0 auto;
}
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
  .autoCode {
    padding-top: 16px;
  }
}
.rule-list-box {
  position: absolute;
  top: 0px;
  bottom: 0;
  left: 0;
  right: 0;
  .breadcrumb-box {
    position: absolute;
    top: -48px;
    left: 0;
    right: 0;
    height: 40px;
    background: #fff;
    z-index: 9;
  }
  .tree-box {
    position: absolute;
    left: 0;
    width: 240px;
    bottom: 0;
    top: 0px;
    border-right: 1px solid var(--border-color-lighter);
    /deep/ .tree-header {
      .tree-name {
        font-size: 14px;
      }
    }
  }
  .resize-column-middle {
    left: 240px;
    top: 0;
    background-color: transparent;
    width: 10px;
    z-index: 8;
  }
  .right-box {
    position: absolute;
    left: 240px;
    right: 0;
    top: 0;
    bottom: 0;
    .table-box {
      position: absolute;
      top: 42px;
      left: 0;
      right: 0;
      bottom: 0;
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
}
</style>
