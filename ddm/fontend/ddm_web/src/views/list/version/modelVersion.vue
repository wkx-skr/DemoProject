<template>
  <div class="table-container-version" v-loading="loading">
    <push-to-git ref="pushToGit"></push-to-git>
    <datablau-tabs
        type="card"
        class="report-outer-tabs"
        v-model="currentTab"
        :class="{ hideTab: !showTabs }"
        @tab-remove="removeTab"
    >
      <el-tab-pane label="版本记录" name="version">
        <el-dialog
            width="800px"
            :title="$store.state.$v.dataEntity.ddlScript"
            :visible.sync="exportDDLVisible"
            v-if="exportDDLVisible"
            append-to-body
        >
          <export-ddl :model-id="modelId"></export-ddl>
        </el-dialog>
        <el-dialog
            width="800px"
            title="JPA Class"
            :visible.sync="exportJPAVisible"
            v-if="exportJPAVisible"
            append-to-body
        >
          <export-jpa :model-id="modelId"></export-jpa>
        </el-dialog>
        <datablau-dialog
            title="选择合并来源"
            :visible.sync="showMergeDialog"
            :append-to-body="true"
            width="640px"
            class="merge-branch-dia"
            :close-on-click-modal="false"
            @close="cancelMergeBranch"
        >
          <datablau-form
              style="width: 600px"
              ref="mergeForm"
              :model="mergeData"
              :rules="rules"
              label-width="100px"
              size="mini"
          >
            <el-form-item label="来源分支" required prop="branchId">
              <datablau-select
                  @change="changeBranchId"
                  v-model="mergeData.branchId"
                  filterable
                  placeholder="请选择名称"
              >
                <template v-for="item in branchIdToAllRelatedBranchList[id]">
                  <el-option
                      v-if="item.id !== id"
                      :key="item.id"
                      :label="item.name"
                      :value="item.id"
                  ></el-option>
                </template>
              </datablau-select>
            </el-form-item>
            <el-form-item
                style="display: inline-block"
                label="版本起始名称"
                required
                prop="startVer"
            >
              <datablau-select
                  style="width: 195px"
                  v-model="mergeData.startVer"
                  placeholder="请选择"
              >
                <el-option
                    v-for="item in branchVersions"
                    :key="item.id"
                    :label="item.name"
                    :value="item.id"
                ></el-option>
              </datablau-select>
            </el-form-item>
            <el-form-item
                style="display: inline-block"
                label="版本截止名称"
                required
                prop="endVer"
            >
              <datablau-select
                  style="width: 195px"
                  v-model="mergeData.endVer"
                  placeholder="请选择"
              >
                <el-option
                    v-for="item in branchVersions"
                    :disabled="item.id <= mergeData.startVer"
                    :key="item.id"
                    :label="item.name"
                    :value="item.id"
                ></el-option>
              </datablau-select>
            </el-form-item>
            <el-form-item label="迁入版本名称" required prop="mergeName">
              <datablau-input
                  v-model="mergeData.mergeName"
                  placeholder="请输入名称"
              ></datablau-input>
            </el-form-item>
            <el-form-item label="合并主题域布局" prop="includeDiagram">
              <datablau-checkbox
                  checkboxType="single"
                  v-model="mergeData.includeDiagram"
              ></datablau-checkbox>
            </el-form-item>
            <el-form-item label="合并描述" prop="des">
              <datablau-input
                  style="width: 500px"
                  type="textarea"
                  v-model="mergeData.des"
                  show-word-limit
                  :maxlength="200"
              ></datablau-input>
            </el-form-item>
          </datablau-form>
          <div slot="footer" class="merge-branch-footer">
<!--            <datablau-button style="float: left" @click="signInDDM">手工合并</datablau-button>-->
            <datablau-button type="secondary" @click="cancelMergeBranch">{{
                $v.modelDetail.cancel
              }}
            </datablau-button>
            <datablau-button type="important" @click="confirmMergeBranch" :disabled="lock">{{
                $v.modelDetail.ok
              }}
            </datablau-button>
          </div>
        </datablau-dialog>
        <iframe :src="iframeSrc" style="display:none;"></iframe>
        <datablau-dialog
            title="分支合并结果"
            :visible.sync="showMergeResultDialog"
            :append-to-body="true"
            width="720px"
            height="500px"
            class="merge-branch-dia"
            :close-on-click-modal="false"
        >
          <div class="merge-result-wrapper">
            <div class="hint-wrapper clearfixed" :class="{'show-conflict-merge': showConflictMerge}">
              <i class="icon el-icon-warning"></i>
              <p style="font-size: 13px;">
                合并失败
              </p>
              <p style="margin-left: 22px;">
                来源分支起始版本中，对象的属性内容与当前分支属性内容存在冲突
              </p>
              <div style="margin-left: 22px;" class="operator">
                <span>你可</span>
                <datablau-button
                  style="padding: 0"
                  type="text"
                  @click="exportMergeResult"
                >
                  导出结果
                </datablau-button>
                <span>进行查看</span>
                <span v-if="showConflictMerge"><span>，或者尝试</span><datablau-button @click="signInDDM" style="padding: 0;" type="text">运行DDM CC</datablau-button><span>进行手动合并。</span></span>
                <div v-if="showConflictMerge" style="display: inline-block;">
                  <span>若您没有安装，请</span><datablau-button type="text" @click="downloadDDM" style="padding: 0;">下载DDM CC</datablau-button><span>后进行操作</span>
                </div>
              </div>
            </div>
            <div class="result-detail-wrapper">
              <div class="header">
                <div class="type">对象类型</div>
                <div class="name">对象名称</div>
                <div class="operate">操作</div>
              </div>
              <datablau-tree
                  :data="mergeFailureResult"
                  node-key="eid"
                  default-expand-all
                  :props="{
                  value: 'eid',
                  label: 'ename',
                  children: 'sub',
                }"
                  :expand-on-click-node="false"
                  :render-content="renderContent"
              >
                <span class="custom-tree-node" slot-scope="{ node, data }">
                  <span>{{ data.ename }}</span>
                </span>
              </datablau-tree>
            </div>
          </div>
<!--          <div slot="footer" class="merge-branch-footer">
            <datablau-button
                type="important"
                style="float: left"
                @click="exportMergeResult"
            >导出
            </datablau-button
            >
            <datablau-button
                type="secondary"
                @click="showMergeResultDialog = false"
            >关闭
            </datablau-button
            >
          </div>-->
        </datablau-dialog>
        <div class="title">
          <datablau-input
              style="width: 270px"
              :iconfont-state="true"
              v-model="keyword"
              placeholder="搜索版本号，描述，提交人"
              size="normal"
              clearable
              @input="search"
          ></datablau-input>
          <!-- {{$store.state.$v.modelDetail.version}} -->
          <datablau-tooltip
              style="float: right"
              v-show="branchIdToAllRelatedBranchList[id].length === 1 && $store.state.featureMap.ddm_AutoBranchMerging"
              content="模型有两个以上的分支时才能进行合并。"
              placement="bottom"
              effect="dark"
          >
            <datablau-button
                class="merge-btn"
                type="important"
                :disabled="branchIdToAllRelatedBranchList[id].length === 1"
                @click="showMergePanel"
            >分支合并
            </datablau-button
            >
          </datablau-tooltip>
          <datablau-button
              style="float: right"
              v-show="
              branchIdToAllRelatedBranchList[id].length > 1 &&
              $store.state.featureMap.ddm_AutoBranchMerging
            "
              class="merge-btn"
              type="important"
              :disabled="branchIdToAllRelatedBranchList[id].length === 1"
              @click="showMergePanel"
          >分支合并
          </datablau-button
          >
          <datablau-tooltip
              style="float: right"
              v-show="
              (multipleSelection.length > 1 ||
                multipleSelection.length === 0) &&
              $store.state.featureMap.ddm_JPAClass
            "
              content="生成JPA Class仅能选一个版本"
              placement="bottom"
              effect="dark"
          >
            <datablau-button
                style="float: right; margin-right: 10px"
                size="default"
                :disabled="
                multipleSelection.length > 1 || multipleSelection.length === 0
              "
                @click="getJpaOption(false)"
            >
              JPA Class
            </datablau-button>
          </datablau-tooltip>
          <datablau-button
              style="float: right; margin-right: 10px"
              size="default"
              v-show="
              multipleSelection.length === 1 &&
              $store.state.featureMap.ddm_JPAClass
            "
              @click="getJpaOption(false)"
          >
            JPA Class
          </datablau-button>
          <datablau-button
              style="float: right; margin-left: 0px; margin-right: 10px"
              size="default"
              @click="getScriptOption(false)"
              :tooltipContent="
              multipleSelection.length === 0
                ? '生成SQL脚本需要选一个或两个版本'
                : multipleSelection.length === 2 &&
                  hideAlterDbs.find(
                    (item) => item === currentModel.modelType.toLowerCase()
                  )
                ? '尚未支持生成该数据库 ALERT 脚本'
                : ''
            "
              :disabled="
              multipleSelection.length === 0 ||
              (multipleSelection.length === 2 &&
                hideAlterDbs.find(
                  (item) => item === currentModel.modelType.toLowerCase()
                ))
            "
          >
            SQL脚本
          </datablau-button>
        </div>
        <div id="top-table-box">
          <datablau-table
              ref="expanTable"
              :data="displayData"
              class="datablau-table"
              row-class-name="row-can-click"
              row-key="d"
              :height="tableHeight"
              @row-click="handleRowClick"
              @selection-change="handleSelectionChange"
          >
            <el-table-column type="expand" width="24">
              <template slot="header">
                <datablau-button
                  type="icon"
                  @click="autoToggleTableExpansion"
                  low-key
                  class="iconfont"
                  style="position: relative;left: -4px;"
                  :class="{
                    'icon-shouqi': !toggleTable,
                    'icon-zhankai': toggleTable,
                  }"
                >
                </datablau-button>
              </template>
              <template slot-scope="scope">
                <edit-log-list
                    :source="scope.row"
                    :modelId="modelId"
                    :minnVerMap="minnVerMap"
                    :key="scope.row.d"
                    :showCheckBox="true"
                ></edit-log-list>
              </template>
            </el-table-column>
            <!--<el-table-column width="30">-->
            <!--  <template slot="header">-->
            <!--    <datablau-button-->
            <!--        type="icon"-->
            <!--        @click="autoToggleTableExpansion"-->
            <!--        low-key-->
            <!--        class="iconfont"-->
            <!--        :class="{-->
            <!--        'icon-shouqi': !toggleTable,-->
            <!--        'icon-zhankai': toggleTable,-->
            <!--      }"-->
            <!--    >-->
            <!--    </datablau-button>-->
            <!--  </template>-->
            <!--</el-table-column>-->
            <el-table-column
                :selectable="canSelect"
                type="selection"
                width="14"
            >
            </el-table-column>
            <el-table-column
              sortable
              prop="name"
              :label="$store.state.$v.modelDetail.versionNum"
              min-width="130"
              show-overflow-tooltip
              class-name="version-no"
            >
              <template slot-scope="scope">
                <img
                  class="ver-img"
                  :src="verImg"
                  alt=""
                  style="margin-right: 8px"
                />
                {{ scope.row.name }}
              </template>
            </el-table-column>
            <el-table-column
              label="描述"
              show-overflow-tooltip
              min-width="130"
            >
              <template slot-scope="scope">
                <div
                  v-if="scope.row.id"
                  :data-id="scope.row.d"
                  v-html="nl2br(scope.row.description)"
                ></div>
                <!--<div v-else-if="!scope.row.isOpen">-->
                <!--  <el-button-->
                <!--      type="text"-->
                <!--      size="mini"-->
                <!--      @click="scanLog(scope.row)"-->
                <!--  >{{ $store.state.$v.modelDetail.viewRecord }}-->
                <!--  </el-button-->
                <!--  >-->
                <!--</div>-->
                <!--<div v-else>-->
                <!--  <edit-log-list :source="scope.row"></edit-log-list>-->
                <!--</div>-->
              </template>
            </el-table-column>
            <el-table-column
                prop="creator"
                width="160"
                :label="$store.state.$v.modelDetail.Submitter"
                show-overflow-tooltip
            >
              <template slot-scope="scope">
                <span>{{
                    scope.row.creator ? scope.row.creator : scope.row.user
                  }}</span>
              </template>
            </el-table-column>
            <el-table-column
                width="140"
                :label="$store.state.$v.modelDetail.commitTime"
                show-overflow-tooltip
                :formatter="$timeFormatter"
                prop="timestamp"
            >
            </el-table-column>
          </datablau-table>
        </div>
        <datablau-dialog
            append-to-body
            :title="'DDL' + $store.state.$v.dataEntity.setting"
            width="900px"
            height="665"
            :visible.sync="showSettingDialog"
            custom-class="setting"
        >
          <p style="margin-bottom: 16px" v-if="multipleSelection.length === 1">
            选中【{{ multipleSelection[0].name }}】
          </p>
          <p style="margin-bottom: 16px" v-if="multipleSelection.length === 2">
            选中【{{ multipleSelection[0].name }}】和【{{
              multipleSelection[1].name
            }}】
          </p>
          <ddl-setting
              ref="ddlSetting"
              v-if="option"
              :default-option="option"
              :options="options"
              @close="showSettingDialog = false"
              v-loading="createScriptLoading"
          ></ddl-setting>
          <span slot="footer">
            <div class="warn">
              <i
                  class="iconfont icon-tips"
                  style="margin-right: 4px; font-size: 14px"
              ></i
              >选择一个版本产生CREATE脚本，两个版本产生ALTER脚本
            </div>
            <datablau-button type="cancel" @click="showSettingDialog = false" :disabled="createScriptLoading">
            </datablau-button>
            <datablau-button
                type="normal"
                @click="saveOption"
                v-if="modelAdmin"
                :disabled="createScriptLoading"
            >
              保存配置
            </datablau-button>
            <datablau-button
                type="primary"
                @click="getScript"
                v-if="multipleSelection.length === 1"
                :disabled="createScriptLoading"
            >
              产生CREATE脚本
            </datablau-button>
            <datablau-button type="primary" @click="getScript" v-else :disabled="createScriptLoading">
              产生ALTER脚本
            </datablau-button>
          </span>
        </datablau-dialog>
        <datablau-dialog
            append-to-body
            :title="`JPA class ${$store.state.$v.dataEntity.setting}`"
            width="900px"
            height="665"
            :visible.sync="showJpaSettingDialog"
            custom-class="jpasetting setting"
        >
          <p style="margin-bottom: 16px" v-if="multipleSelection.length === 1">
            选中【{{ multipleSelection[0].name }}】
          </p>
          <jpa-setting
              ref="jpaSetting"
              v-if="option"
              :default-option="option"
              :options="options"
              @close="showJpaSettingDialog = false"
              v-loading="createScriptLoading"
          ></jpa-setting>
          <span slot="footer">
            <datablau-button
                style="float: left"
                @click="handleEditClick('jpaEntity')"
                v-if="modelAdmin"
            >{{ $store.state.$v.dataEntity.entityModel }}</datablau-button
            >
            <datablau-button
                style="float: left"
                @click="handleEditClick('jpaEntityKey')"
                v-if="modelAdmin"
            >{{ $store.state.$v.dataEntity.complexModel }}</datablau-button
            >
            <datablau-input
                style="float: left; margin-left: 10px"
                v-model="jpaPackageName"
                :placeholder="$store.state.$v.dataEntity.inputPakageName"
                size="small"
            >
            </datablau-input>
            <datablau-button
                type="cancel"
                @click="showJpaSettingDialog = false"
                :disabled="createScriptLoading"
            >
            </datablau-button>
            <datablau-button
                type="normal"
                @click="saveJpaOption"
                v-if="modelAdmin"
                :disabled="createScriptLoading"
            >
              保存配置
            </datablau-button>
            <datablau-button type="primary" @click="getJpa" :disabled="createScriptLoading">
              生成JPA class脚本
            </datablau-button>
          </span>
        </datablau-dialog>
      </el-tab-pane>
      <el-tab-pane
          v-for="item in editableTabs"
          :key="item.name"
          :label="item.title"
          :name="item.name"
          class="code-pane"
          closable
      >
        <div
            class="code-content"
            v-if="!item.isJpa && item.content && item.name === currentTab"
            :key="scriptKey"
        >
          <datablau-button
              type="secondary"
              style="right: 210px"
              size="small"
              class="float iconfont icon-publish"
              @click="pushToGit(item.content)"
              v-if="false"
          >
            导入至git
          </datablau-button>
          <datablau-button
              type="secondary"
              style="right: 133px"
              size="small"
              class="float iconfont icon-export"
              @click="downloadScript(item.content)"
          >
            {{ $store.state.$v.dataEntity.output }}
          </datablau-button>
          <datablau-button
              type="secondary"
              size="small"
              class="float el-icon-document-copy"
              @click="copyScript(item.content)"
          >
            {{ $store.state.$v.dataEntity.copy }}
          </datablau-button>
          <div class="sql-container" v-loading="loadingScript">
            <div class="sql-content">
              <pre><code :class="{'language-sql': item.content && item.content.length<50000}"><p :class="{'sql-padding': !(item.content && item.content.length<50000)}" v-text="item.content"></p></code></pre>
            </div>
          </div>
        </div>
        <div class="jpa-part" v-if="item.isJpa && item.name === currentTab">
          <p
              style="font-size: 12px; font-weight: 400; color: #999999"
              v-show="
              item.content.classList.length === 0 &&
              item.content.errClassList.length === 0
            "
          >
            没有内容可显示
          </p>
          <datablau-table
              v-show="
              item.content.classList.length > 0 &&
              item.content.errClassList.length === 0
            "
              ref="classList"
              :data="item.content.classList"
              :row-class-name="tableRowClassName"
              :row-key="getRowKey"
              :expand-row-keys="currentExpandKey"
              @row-click="handleClick"
              @expand-change="handleExpanChange"
              height="100%"
              class="datablau-table"
          >
            <el-table-column type="expand" width="24">
              <template slot-scope="props">
                <div class="java-container">
                  <datablau-button
                    type="secondary"
                    size="mini"
                    class="iconfont icon-export"
                    @click="downloadJpa(props.row.content, props.row.className)"
                  >
                    {{ $store.state.$v.dataEntity.output }}
                  </datablau-button
                  >
                  <datablau-button
                      type="secondary"
                      size="mini"
                      class="el-icon-document-copy"
                      @click="copyJpa(props.row.content, props.row.className)"
                  >
                    {{ $store.state.$v.dataEntity.copy }}
                  </datablau-button
                  >
                  <div class="java-content">
                    <pre><code class="language-java"><p v-text="props.row.content"></p></code></pre>
                  </div>
                </div>
              </template>
            </el-table-column>
            <el-table-column
                prop="className"
                label="className"
            ></el-table-column>
            <el-table-column
                prop="tableName"
                label="tableName"
            ></el-table-column>
          </datablau-table>
          <datablau-table
              v-show="item.content.errClassList.length > 0"
              :data="item.content.errClassList"
          >
            <el-table-column
                prop="tableName"
                label="tableName"
            ></el-table-column>
            <el-table-column
                prop="errorMsg"
                :label="$store.state.$v.errMsg"
            ></el-table-column>
          </datablau-table>
        </div>
      </el-tab-pane>
    </datablau-tabs>
    <div class="editor-page" v-if="isRenderEditorPage">
      <div class="button-box">
        <el-button @click="saveFesTemplate()" type="primary" size="mini"
        >{{ $store.state.$v.dataEntity.save }}
        </el-button>
        <el-button @click="handleResetEditor" type="primary" size="mini"
        >{{ $store.state.$v.dataEntity.resetModel }}
        </el-button>
        <!-- <el-button type="primary" size="mini">清空错误提示</el-button> -->
        <el-button
            type=""
            size="mini"
            @click="(isRenderEditorPage = false), (showJpaSettingDialog = true)"
        >{{ $store.state.$v.dataEntity.back }}
        </el-button
        >
        <p class="error-tips">{{ editorErrorMsg }}</p>
      </div>
      <div v-if="isRenderEditor" class="editor-box">
        <monaco-editor
            ref="JPAeditor"
            :codes="jpaEntityCodes"
            @onCodeChange="onJpaEntityCodeChange"
            :errors="jpaEntityErrors"
            language="java"
        ></monaco-editor>
      </div>
    </div>
  </div>
</template>
<script>
import modelVersion from './modelVersion'
export default modelVersion
</script>

<style scoped lang="scss">
.sql-padding {
  padding: 10px 20px;
}
.java-container {
  padding: 10px 20px;
}
.jpa-part {
  position: absolute;
  top: 0;
  left: 20px;
  right: 20px;
  bottom: 20px;
}
.code-pane {
  .code-content {
    position: absolute;
    top: 10px;
    left: 20px;
    right: 20px;
    bottom: 20px;
    background: #f5f5f5;
    overflow: auto;

    /deep/ {
      .language-sql {
        background: #f5f5f5;
      }
    }
  }
}
#top-table-box {
  /deep/ .el-table__expand-icon:hover {
    color: #409eff;
  }

  position: absolute;
  top: 40px;
  bottom: 20px;
  left: 20px;
  right: 20px;

  /deep/ .el-checkbox__inner {
    border: 1px solid #999999;
  }

  /deep/ .el-checkbox__input.is-checked .el-checkbox__inner,
  .el-checkbox__input.is-indeterminate .el-checkbox__inner {
    border-color: #409eff;
  }
}

/deep/ .el-tab-pane {
  height: 100%;
  overflow: auto;
}

.editor-page {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #fff;
  z-index: 2100;

  .editor-box {
    box-sizing: border-box;
    height: 100%;
  }

  .button-box {
    box-sizing: border-box;
    padding-left: 50px;
    padding-top: 11px;
    height: 82px;
  }

  .error-tips {
    padding-top: 10px;
    height: 32px;
    color: red;
  }
}

.code-content {
  position: relative;

  .float {
    position: absolute;
    top: 10px;
    right: 10px;
  }
}

.table-container-version /deep/ .el-tabs__content {
  padding: 0 20px;
  padding-bottom: 20px;
}

/deep/ .hideTab.datablau-tabs {
  .el-tabs__nav > .el-tabs__item:first-child {
    color: #555 !important;

    &::after {
      display: none !important;
    }
  }
}

/deep/ .report-outer-tabs.datablau-tabs > .el-tabs {
  position: absolute;
  top: -5px;
  left: 0;
  right: 0;
  bottom: 0;

  & > .el-tabs__header {
    .el-tabs__nav > .el-tabs__item {
      border-left: 1px solid #ddd !important;

      &:hover {
        border-color: #409eff !important;
      }

      &.is-active {
        border-color: #409eff !important;
      }

      &:first-child {
        padding-left: 20px;
        font-size: 16px;
        color: #555;
        line-height: 40px;
        border: none !important;
        vertical-align: baseline;
        margin-right: 1px;

        &:after {
          content: "/";
          margin-left: 5px;
          display: inline-block;
          color: #ddd;
        }

        &.is-active {
          color: #409eff;
        }

        &:hover {
          color: #409eff;
        }
      }

      & + .el-tabs__item {
        margin-left: 5px;
      }
    }
  }

  & > .el-tabs__content {
    position: absolute;
    top: 40px;
    left: 0;
    right: 0;
    bottom: 0;
    overflow: visible;
  }
}

/deep/ .el-table__header-wrapper .el-checkbox {
  display: none;
}

/deep/ .el-table__expand-icon:hover {
  color: #409eff;
}

/deep/ .el-table__row--level-0 + .el-table__row--level-1 {
  box-shadow: inset 0px 2px 6px 1px rgba(0, 0, 0, 0.04);
}

/deep/ .el-table__row--level-1 {
  .ver-img {
    visibility: hidden;
  }

  background: #f8f8f8;

  .el-table-column--selection .el-checkbox {
    display: none;
  }
}

/deep/ .el-table__row .el-table__expand-icon {
  margin-right: 0;
}

/deep/ {
  .el-tree-node__content {
    border-bottom: 1px solid #d3d3d3;
  }

  .content-detail {
    width: 100%;
    display: flex;
    padding-left: 15px;
    align-items: center;

    i {
      flex: 0 0 auto;
    }
  }

  .content-wrapper {
    flex: 1 1 auto;
    display: flex;

    .left {
      flex: 1 1 auto;
      padding: 0 5px;
    }

    .middle {
      border-left: 1px solid #d3d3d3;
      flex: 0 0 auto;
      width: 200px;
      padding: 0 5px;

      &.red-bg {
        background: rgb(255, 160, 122);
      }
    }

    .right {
      border-left: 1px solid #d3d3d3;
      flex: 0 0 auto;
      width: 100px;
      padding: 0 5px;
    }
  }
}

.result-detail-wrapper {
  position: absolute;
  top: 85px;
  left: 20px;
  right: 20px;
  bottom: 20px;
  min-height: 320px;
  margin-top: 10px;
  border: 1px solid rgb(211, 211, 211);
  max-height: 400px;
  overflow: auto;

  .header {
    display: flex;
    background: #f5f5f5;

    .type {
      padding: 0 5px;
      flex: 1 1 auto;
    }

    .name {
      padding: 0 5px;
      width: 200px;
      flex: 0 0 auto;
      border-left: 1px solid rgb(211, 211, 211);
    }

    .operate {
      padding: 0 5px;
      width: 100px;
      flex: 0 0 auto;
      border-left: 1px solid rgb(211, 211, 211);
    }
  }
}

.hint-wrapper {
  line-height: 16px;
  padding: 8px 8px;
  background: rgba(124,137,168,0.080);
  border-radius: 4px;
  vertical-align: middle;
  color: #354F7B;
  .icon {
    display: inline-block;
    color: #7C89A8;
    font-size: 18px;
    margin-right: 5px;
    position: relative;
    top: 2px;
  }

  p {
    display: inline-block;
    font-size: 12px;
    width: 631px;
    font-weight: bold;
  }
  .operator {
    & > span {
      display: inline-block;
      vertical-align: middle;
    }
    & > div {
      display: inline-block;
      vertical-align: middle;
    }
    & > .is-block.text {
      top: 0
    }
  }
}

.title {
  margin-bottom: 10px;
  font-size: 14px;
  height: 32px;
  // margin-top: 50px;
  // margin-bottom: 10px;
  // font-weight:bold;
  // padding-bottom:18px;
  // margin-bottom:1.5em;
  // border-bottom:1px solid #dddddd;
  .desc {
    float: right;
    line-height: 32px;
    color: #777;
    font-size: 12px;
    font-weight: 400;
  }
}
.man-list {
  padding: 10px 0;

  li {
    margin-left: 0em;
    line-height: 1.5em;
  }
}
.table-container-version {
  // height: 100%;
  position: absolute;
  top: 0px;
  left: 0px;
  right: 0px;
  bottom: 0px;
  /*overflow:auto;*/
}
</style>
<style lang="scss">
@import "./modelVersion";
.setting {
  .el-dialog__footer {
    box-shadow: 0px -2px 4px 0px rgba(0, 0, 0, 0.1);
  }
  .warn {
    line-height: 32px;
    float: left;
    font-size: 12px;
    font-weight: 400;
    color: #ff7519;
  }
}
</style>
