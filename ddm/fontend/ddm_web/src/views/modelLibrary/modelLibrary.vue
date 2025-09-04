<template>
  <div id="model-library">
    <datablau-dialog
      :visible.sync="groupVisible"
      title="模型检查策略"
      width="1000"
      height="600px"
      append-to-body
    >
      <div class="group-content" v-loading="groupLoading">
        <div class="group-table">
          <datablau-table :data="currentGroupList">
            <el-table-column prop="name" label="策略名称"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <datablau-button
                    @click="deleteGroup(scope)"
                    type="text"
                    size="mini"
                >{{ $t('common.button.delete') }}
                </datablau-button>
              </template>
            </el-table-column>
          </datablau-table>
        </div>
      </div>
      <span slot="footer" v-loading="groupLoading">
        <datablau-button
            style="float: left"
            type="important"
            @click="getRuleGroupList"
        >添加策略</datablau-button
        >
        <datablau-checkbox
            style="float: left; margin-left: 20px; transform: translateY(5px)"
            :checkboxType="'single'"
            v-model="groupOption"
        >
          应用到子目录
        </datablau-checkbox>
        <datablau-button
            style="float: left"
            type="important"
            @click="getParentGroupList"
            v-show="currentCategory && currentCategory.parentId !== null"
        >继承父目录策略</datablau-button
        >
        <datablau-button @click="groupVisible = false">取 消</datablau-button>
        <datablau-button type="primary" @click="updateCurrentCategoryGroupList">
          确 定
        </datablau-button>
      </span>
    </datablau-dialog>
    <datablau-dialog
        :visible.sync="showGroupList"
        title="添加检查策略"
        width="1000"
        height="600px"
        append-to-body
        v-loading="groupLoading"
        @close="closeGroupList"
    >
      <div class="content" v-if="showGroupList">
        <datablau-input
            v-model="keyword2"
            :iconfont-state="true"
            placeholder="请输入"
            @input="handleSearch"
            clearable
        ></datablau-input>
        <datablau-table
            @selection-change="handleAddGroupChange"
            :data="groupList"
            row-key="id"
            :reserve-selection="true"
            data-selectable
        >
          <el-table-column prop="name" label="策略名称"></el-table-column>
          <el-table-column prop="ruleNums" label="包含规则数">
          </el-table-column>
        </datablau-table>
      </div>
      <span slot="footer">
        <datablau-pagination
            style="float: left; display: inline-block"
            @size-change="handleSizeChange2"
            @current-change="handleCurrentChange2"
            :current-page="currentPage2"
            :page-sizes="[20, 50, 100, 200]"
            :page-size="pageSize2"
            :total="total2"
            :layout="'total, sizes, prev, pager, next, jumper'"
        ></datablau-pagination>
        <datablau-button @click="closeGroupList">取 消</datablau-button>
        <datablau-button type="primary" @click="addGroup">
          确 定
        </datablau-button>
      </span>
    </datablau-dialog>
    <datablau-upload
        style="display: none"
        :action="uploadUrl"
        :before-upload="showBegain"
        :on-error="onError"
        :on-success="onSuccess"
        :show-file-list="false"
        accept=".xlsx"
    >
      <el-button id="ban-upload-btn" v-if="!templateUploading" size="mini"
      ><i class="el-icon-upload"></i>
        {{ $store.state.$v.common.import }}
      </el-button>
      <el-button v-else size="mini" disabled>
        {{ $store.state.$v.common.importing }}
      </el-button>
    </datablau-upload>
    <datablau-dialog
        custom-class="modellibrary-edit"
        :title="categoryEditModel ? '编辑目录' : '新建子目录'"
        :visible.sync="showEditCategoryDialog"
        size="m"
    >
      <div v-loading="loadingEditModelCategory">
        <datablau-form
            size="small"
            label-width="78px"
            :model="categoryData"
            ref="form"
        >
          <el-form-item label="目录名称" :rules="{ required: true }">
            <datablau-input
                v-model="categoryData.name"
                class="input-detail"
            ></datablau-input>
          </el-form-item>
          <el-form-item label="英文简称">
            <datablau-input
                v-model="categoryData.alias"
                class="input-detail"
            ></datablau-input>
          </el-form-item>
          <el-form-item label="命名规则" v-show="categoryEditModel">
            <div style="display: flex;align-items: center;justify-content: space-between;">
                  <datablau-select
                        v-model="categoryData.entityTemplateId"
                        @change="entityTemplateIdChange"
                        style="width:320px"
                    >
                        <el-option
                        v-for="item in templateList"
                        :key="item.id"
                        :label="item.name"
                        :value="item.id"
                        ></el-option>
                    </datablau-select>
                    <datablau-button
                      type="text"
                      @click="goModelTemplate"
                      v-if="$auth.ROLE_TEMPLATE_MANAGE_DDM"
                    >
                    <i class="iconfont icon-tianjia" style="margin-right:4px"></i>创建规则</datablau-button>

                    <el-checkbox
                      class="small"
                      v-model="categoryData.forceCheckFlag"
                      :disabled="categoryData.entityTemplateId === null || !categoryData.entityTemplateId"
                    >设置强检查</el-checkbox>
                </div>
          </el-form-item>
          <el-form-item label="描述">
            <datablau-input
                v-model="categoryData.description"
                class="input-detail"
                type="textarea"
                maxlength="200"
                show-word-limit
            ></datablau-input>
          </el-form-item>
        </datablau-form>
      </div>
      <div slot="footer">
        <datablau-button
            type="secondary"
            @click="showEditCategoryDialog = false"
        >
          取消
        </datablau-button>
        <datablau-button
          type="primary"
          @click="saveEditCategory"
          :disabled="!categoryData.name"
        >
          确定
        </datablau-button>
      </div>
    </datablau-dialog>
    <datablau-dialog
      title="移动到目录"
      :visible.sync="showModeCategory"
      size="m"
    >
      <div style="height: 100%; min-height: 400px; overflow: auto">
        <db-tree
          node-key="id"
          :props="moveTreeDefaultProps"
          :data="treeData"
          :data-supervise="true"
          :data-icon-function="dataIconFunction"
          ref="tree2"
          :filter-node-method="filterNode"
          :expand-on-click-node="true"
          @node-click="chooseMoveCategoryNode"
          @locked-node-click="chooseLockedMoveCategoryNode"
          :data-locked-function="isMoveDisabled"
          :showLockedMessage="false"
        ></db-tree>
      </div>
      <div slot="footer">
        <datablau-button type="secondary" @click="showModeCategory = false">
          取消
        </datablau-button>
        <datablau-button
          type="primary"
          :disabled="!chosenMoveCategoryId"
          @click="handleMoveCategory"
        >
          确定
        </datablau-button>
      </div>
    </datablau-dialog>
    <datablau-dialog
      title="绑定到资产系统"
      :visible.sync="showChooseSystem"
      size="m"
      custom-class="bind-system-dialog"
      height="600"
    >
      <div
        style="
          height: 100%;
          min-height: 400px;
          overflow: hidden;
          position: relative;
        "
      >
        <div
          class="search-line"
          style="position: absolute; top: 0; left: 0; right: 0; height: 35px"
        >
          <datablau-input
            prefix-icon="el-icon-search"
            size="small"
            v-model="systemKeyword"
            :iconfont-state="true"
            :placeholder="$store.state.$v.common.placeholder"
            clearable
          ></datablau-input>
        </div>
        <div
          class="table-line"
          style="position: absolute; top: 35px; left: 0; right: 0; bottom: 0"
        >
          <datablau-table
            class="datablau-table-info"
            ref="selectSystemTable"
            v-loading="loadingSystems"
            :data="showSystemList"
            row-key="modelId"
            height="100%"
          >
            <el-table-column width="20">
              <template slot-scope="scope">
                <el-radio v-model="systemSelect" :label="scope.row.id">{{
                    ''
                  }}
                </el-radio>
              </template>
            </el-table-column>
            <el-table-column
                prop="name"
                min-width="150"
                label="系统名称"
                show-overflow-tooltip
            >
              <template slot-scope="scope">
                <i class="iconfont icon-xitong blue-system-icon"></i>
                <span>{{ scope.row.name }}</span>
              </template>
            </el-table-column>
            <el-table-column
                prop="alias"
                label="英文缩写"
                min-width="130"
                show-overflow-tooltip
            ></el-table-column>
            <el-table-column
                prop="itDepartment"
                label="IT部门"
                min-width="130"
                show-overflow-tooltip
            ></el-table-column>
          </datablau-table>
        </div>
      </div>
      <div slot="footer">
        <datablau-button type="secondary" @click="showChooseSystem = false">
          取消
        </datablau-button>
        <datablau-button
            type="primary"
            :disabled="systemSelect === ''"
            @click="bindSystem"
        >
          绑定
        </datablau-button>
      </div>
    </datablau-dialog>
    <el-dialog
        title="编辑模型信息"
        :visible.sync="showEditModelInfo"
        width="30%"
    >
      <el-form
          :model="currentModelInfo"
          ref="modelInfoForm"
          :rules="modelRules"
          label-width="80px"
          :inline="false"
          size="mini"
      >
        <el-form-item label="模型名称" prop="name">
          <el-input
              v-model="currentModelInfo.name"
              placeholder="输入模型名称"
              clearable
          ></el-input>
        </el-form-item>
        <el-form-item label="模型描述">
          <el-input
              v-model="currentModelInfo.description"
              type="textarea"
              placeholder="输入模型描述"
              clearable
          ></el-input>
        </el-form-item>
      </el-form>

      <span slot="footer">
        <el-button size="mini" @click="showEditModelInfo = false"
        >取消</el-button
        >
        <el-button size="mini" type="primary" @click="beforeSave"
        >确定</el-button
        >
      </span>
    </el-dialog>

    <div
        v-show="!$route.query.id && !showReviewReportId"
        class="tree-area model-library-tree"
        :class="{blackTheme: sqlEditor}"
        v-loading="!treeDataLoaded"
        :element-loading-background="needBind && 'rgba(0,0,0,0.6)'"
    >
      <datablau-input
        style="display: block"
        v-model="keyword"
        :themeBlack="sqlEditor"
        :placeholder="$store.state.$v.common.placeholder + '目录名称'"
        size="small"
        prefix-icon="el-icon-search"
      ></datablau-input>
      <div class="tree-box">
        <db-tree
            class="grey-tree has-cnt"
            ref="modelTree"
            :data="treeData"
            :props="defaultProps"
            :filter-node-method="filterNode"
            @node-click="handleNodeClick"
            :default-expand-all="false"
            :default-expanded-keys="defaultkey"
            :expand-on-click-node="false"
            :highlight-current="true"
            node-key="id"
            :data-supervise="dialogOpen !== true ? true : false"
            :data-options-function="getModelCategoryOption"
            :dataOptionsFunctionIsAsync="true"
            :data-icon-function="dataIconFunction"
            :label-formatter="treeLabelFormatter"
            :showOverflowTooltip="true"
            :right-info-formatter="treeRightInfoFormatter"
            :themeBlack="sqlEditor"
        ></db-tree>
      </div>
    </div>
    <div class="resize-column-middle model-library-middle"
    ></div>
    <div
        v-show="!$route.query.id && !showReviewReportId"
        v-loading="(!$route.query.id && contentLoading)"
        :element-loading-background="needBind && 'rgba(0,0,0,0.6)'"
        class="content-area model-library-content "
        :style="{marginTop: '0',borderBottom: sqlEditor ? '1px solid #4D4D4D' : 'none'}"
    >
      <div
          class="top-header-info-panel-wrapper"
          v-if="currentCategory.parentId"
          :class="{
            'show-more-btn': currentCategoryId !== 1 && isEditor && $store.state.lic.editor && dialogOpen !== true,
            'top-header-info-panel-wrapper-black':sqlEditor
          }"
      >
        <img :src="bg" class="bg"/>
        <div
            class="iconfont"
            :class="[
            bindSystemData && bindSystemData.name
              ? 'icon-filebinding'
              : 'icon-file',
          ]"
            style="
            height: 52px;
            color: #409eff;
            float: left;
            margin-right: 10px;
            font-size: 32px;
          "
        ></div>
        <div class="top-info-container">
          <div class="name-line">
            <!--目录名称-->
            <span
              class="category-name"
              :class="{
                'show-system-name': bindSystemData && bindSystemData.name,
                'show-system-name-unbind': bindSystemData && bindSystemData.name && bindPermission,
                'show-bing-label': !bindSystemData && bindPermission
              }"
            >
              <datablau-tooltip
                  :content="currentPath"
                  placement="bottom"
              >
                <span class="name-text">{{ currentPath }}</span>
              </datablau-tooltip>
            </span>

            <div
              class="bind-system-buttons" style="display: inline-block;"
              v-if="showBindInfo && (isEditor || bindSystemData && bindSystemData.name)"
            >
              <span
                  class="bind-system"
                  v-if="bindSystemData && bindSystemData.name"
              >
                <span class="bind-system-data">
                  <i
                      class="iconfont icon-binding"
                      style="cursor: default; font-size: 14px"
                  ></i
                  >
                  <datablau-tooltip
                      :content=" bindSystemData ? `${bindSystemData.name}(${bindSystemData.alias})` : ''"
                      style="display: inline-block;font-size: 0;"
                  >
                    <span class="bind-system-name-text">
                      {{
                        bindSystemData
                            ? `${bindSystemData.name}(${bindSystemData.alias})`
                            : ''
                      }}
                    </span>
                  </datablau-tooltip>

                </span>
                <datablau-button
                    type="text"
                    @click="handleBindClick(currentCategoryId)"
                    v-if="bindPermission"
                    style="vertical-align: top;"
                >
                  解绑
                </datablau-button>
              </span>
              <datablau-button
                  type="text"
                  @click="handleBindClick(currentCategoryId)"
                  v-if="!bindSystemData && bindPermission"
                  class="unbind-status"
              >
                <span class="bind-inner-text">
                  <i
                      class="iconfont icon-binding"
                      style="color: #409eff; font-size: 14px"
                  ></i>
                  {{ bindLabel }}
                </span>
              </datablau-button>
            </div>
          </div>

          <div class="auto-disc" style="width: 100%">
            <datablau-tooltip :content="currentCategory ? currentCategory.description : ' '" :disabled="!(currentCategory && currentCategory.description)"
            >
            <span class="category-description">描述：{{ currentCategory ? currentCategory.description : ' ' }}</span>
          </datablau-tooltip>
          </div>
        </div>
        <div class="add-model-box">
          <recycle-bin></recycle-bin>
          <el-dropdown
              style="margin-left: 8px"
              trigger="click"
              @command="manageCategory"
              v-if="false"
              v-show="
              currentCategoryId !== 1 &&
              isEditor &&
              $store.state.lic.editor &&
              dialogOpen !== true
            "
          >
            <datablau-button
                style="background: rgba(255, 255, 255, 0)"
                type="normal"
                size="small"
                class="el-dropdown-link"
            >
              <!-- <i class="iconfont icon-shezhi"></i> -->
              更多操作<i
                class="el-icon-arrow-down el-icon--right"
                style="color: #409eff; font-weight: 600"
            ></i>
            </datablau-button>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item command="create">新建子目录</el-dropdown-item>
              <el-dropdown-item command="edit">编辑目录</el-dropdown-item>
              <el-dropdown-item command="delete">删除目录</el-dropdown-item>
              <el-dropdown-item command="auditManage"
              >权限管理
              </el-dropdown-item
              >
              <el-dropdown-item command="move">移动目录</el-dropdown-item>
              <!-- <el-dropdown-item command="group">模型检查策略</el-dropdown-item> -->
              <el-dropdown-item command="bingSystem" v-if="false">{{
                  bindLabel
                }}
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </div>
      </div>

      <model-list
        ref="modelList"
        v-if="permissionsMap && getTagsOfModels"
        :currentCategory="currentCategory"
        :needBind="needBind"
        @handleRowClick="handleRowClick(...arguments, false)"
        @refreshModels="refreshModels"
        @openModelByQuery="openModelByQuery"
        @handleSelectionChange="handleSelectionChange"
        class="model-list-component"
        :showOperator="showOperator"
        :dialogOpen="dialogOpen"
        :permissionsMap="permissionsMap"
        :getTagsOfModels="getTagsOfModels"
        :sqlEditor="sqlEditor"
        :class="{'show-top-header': currentCategory.parentId}"
      ></model-list>
    </div>
    <model-detail
      class="full-area model-detail-component"
      :key="'model' + currentModel.id"
      v-if="currentModel"
      :current-model="currentModel"
      :current-path="currentPath"
      :model-path="modelPath"
      :is-editor="isEditor"
    ></model-detail>
    <div class="auth-manage-container" v-if="showAuthManageDialog">
      <div class="head-breadcrumb">
        <datablau-breadcrumb
          class="top-bread"
          :node-data="displayPath"
          :couldClick="false"
          @back="goBack"
        ></datablau-breadcrumb>
      </div>
      <div class="manage-container">
        <auth-manage
          manage-type="category"
          :categoryId="chosenCategoryId"
        ></auth-manage>
      </div>
    </div>
    <div class="report-review-container" v-if="showReviewReportId">
      <report-review
          :reviewReportId="reviewReportId"
          @goBack="showReviewReportId = false"
      ></report-review>
    </div>
  </div>
</template>

<script>
import list from './modelLibrary.js'
export default list
</script>

<style scoped lang="scss">
@import "~@/next/components/basic/color.sass";
$leftWidth: 300px;
#model-library {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  z-index: 1;
  background: #fff;
  .tag {
    margin-top: 2.5px;
    max-width: 90px;
    text-overflow: ellipsis;
    overflow: hidden;
    word-break: break-all;
    white-space: nowrap;
  }

  /deep/
  .el-table--enable-row-hover
  .el-table__body
  tr:hover
  > td.el-table__cell {
    background: rgb(236, 245, 255);
  }

  .tag-box {
    .tag {
      margin-left: 0;
      margin-right: 6px;
    }
  }

  .low-key /deep/ span {
    position: relative;
    top: -3px;
  }
  .icon-tianjia::before {
    margin-right: 5px;
  }
  .pagination-container {
    border-top: 1px solid #ddd;
  }
  .obj-count {
    display: inline-block;
    padding: 0 11px;
    height: 22px;
    line-height: 22px;
    background: rgba(85, 85, 85, 0.1);
    border-radius: 11px;
    font-size: 12px;
  }
  .tree-area {
    padding: 10px;
    width: $leftWidth;
    overflow: hidden;
    &.blackTheme{
      border-color: #4D4D4D;
      border-bottom: 1px solid #4D4D4D;
    }
  }
  .content-area {
    padding-left: 0;
    padding-right: 0;
    padding-top: 0px;
    left: $leftWidth;

    .model-list-component {
      &.show-top-header {
        top: 70px;
      }
    }
  }
  .disc {
    margin-top: 10px;
    padding-left: 26px;
    width: 100%;
    height: 16px;
    font-size: 12px;
    color: #555;
  }
  .auto-disc {
    margin-top: 2px;
    padding-left: 2px;
    color: #555;
    //width: 85%;
    //min-height: 16px;
    font-size: 12px;
    /deep/ .datablau-tooltip {
      width: 100%;
    }
    .category-description {
      display: inline-block;
      width: 100%;
      word-break: break-all;
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap;
    }

  }

  .bg {
    position: absolute;
    top: 11px;
    right: 0;
  }

  .add-model-box {
    position: absolute;
    top: 19px;
    right: 22px;
    vertical-align: top;
    /deep/ .recycle-container .is-block {
      background-color: transparent;
    }
  }

  .model-library-middle {
    z-index: 3;
    left: $leftWidth - 5px;
  }
}

.tree-icon.model {
  position: absolute;
  left: 33px;
  top: 50%;
  transform: translateY(-36%);
}
.name-box {
  margin-left: 20px;
}
.content-area {
  overflow: hidden;

  .top-header-info-panel-wrapper {
    padding: 0 20px;
    padding-top: 16px;
    height: 70px;
    background: #f6f8ff;
    position: relative;
    &.top-header-info-panel-wrapper-black{
      background: rgba(24, 127, 255, 0.10);
      .category-name .name-text{
        color: #bbbbbb;
      }
      .auto-disc{
        color: #bbbbbb !important;
      }
    }
    .top-info-container {
      display: inline-block;
      position: absolute;
      left: 65px;
      right: 135px;
      top: 0;
      bottom: 0;
      padding-top: 8px;
    }
    &.show-more-btn {
      .top-info-container  {
        right: 230px;
      }
    }

    .category-name {
      // 四种情况:
      // 1.没有编辑权限, 没有名字, 2. 没有编辑权限, 有名字, 3. 有权限, 没名字, 4. 都有
      position: relative;
      display: inline-block;
      font-size: 16px;
      line-height: 24px;
      //font-weight: bold;
      //position: absolute;
      //left: 0;
      //right: 400px;
      //top: 20px;
      //font-weight: 500;
      max-width: 500px;
      //width: 100%;
      /deep/ .datablau-tooltip {
        display: inline-block;
        width: 100%;
      }
      .name-text {
        display: inline-block;
        width: 100%;
        color: #555555;
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
      }
    }
    .bind-system-buttons {
      //position: absolute;
      //top: 9px;
      font-size: 12px;
      display: inline-block;
      padding: 0px 7px;
      border-radius: 2px;
      line-height: 24px;
      vertical-align: top;
      transition: background 0.3s ease-in-out;

      // &:hover {
      //   background-color: #efefef;
      // }

      .bind-system {
        display: inline-block;

        // &:hover {
        //   background-color: #efefef;
        // }
      }

      .unbind-status {
        display: inline-block;
        height: auto;

        .bind-inner-text {
          display: inline-block;
        }

        //i {
        //  color: $primary-color;
        //}

        &:hover {
          //background-color: #ebf5ff;
        }
      }
    }

    .bind-system-data {
      //border: 1px solid red;
      //color: $primary-color;
      display: inline-block;

      .bind-system-name-text {
        display: inline-block;
        max-width: 100px;
        text-overflow: ellipsis;
        overflow: hidden;
        word-break: break-all;
        white-space: nowrap;
        font-size: 12px;
      }

      .iconfont {
        padding-right: 4px;
        display: inline-block;
        vertical-align: top;
        margin-top: 6px;
      }
    }
  }

  .description-line {
    display: inline-block;
    color: #777;
    //border: 1px solid red;
    min-width: 200px;
    max-width: 80%;
    height: 36px;
    line-height: 36px;

    /* 单行省略 */
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

}
.top-title {
  margin-bottom: 10px;
  vertical-align: middle;
  white-space: nowrap;
  color: #20293b;
  font-size: 16px;

  .more-action {
    float: right;
  }
}
.tree-box {
  position: absolute;
  top: 52px;
  right: 0;
  padding-right: 2px;
  left: -12px;
  bottom: 20px;
  overflow: auto;

  /deep/ .tree-item-outer {
    flex: 1;
  }
}
.form-label {
  margin-left: 1em;
  margin-right: 0.5em;
}
.bold {
  background: pink;
}
.edit-model-btn {
  box-sizing: border-box;
  padding: 7px 10px;
  border: 1px solid #539ffd;
  font-size: 12px;
  line-height: 1;
  color: #539ffd;
  display: inline-block;
  border-radius: 2px;
  white-space: nowrap;

  img {
    width: 12px;
    margin-right: 8px;
  }

  span {
    vertical-align: top;
  }
}

.auth-manage-container {
  //border: 1px solid red;
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  right: 0;
  z-index: 3;
  background-color: #fff;

  .head-breadcrumb {
    position: absolute;
    left: 0;
    top: 0;
    right: 0;
    height: 40px;
    padding: 8px 0 0 20px;
  }

  .manage-container {
    position: absolute;
    left: 0;
    bottom: 0;
    right: 0;
    top: 40px;
  }
}

.report-review-container {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  right: 0;
  z-index: 3;
  background-color: #fff;
}

.full-area.model-detail-component {
  z-index: 5;
}
</style>
<style lang="scss">
.modellibrary-edit .el-form.db-form .datablau-input {
  width: 100%;
}
@import "~@/next/components/basic/color.sass";
#model-library {
  .el-table th > .cell {
    height: 34px;
    line-height: 34px;
  }

  .el-table__fixed-right {
    z-index: 1;
  }
}

.grey-tree .tree-item-outer {
  width: 100%;
}

.create-model-dialog {
  .dialog-head {
    font-size: 16px;
    font-weight: 500;
    color: #409eff;
    line-height: 50px;
  }

  .el-dialog__header {
    padding: 0;
    padding-left: 20px;
    height: 50px;
    border-bottom: 1px solid #ddd;
    position: relative;
  }
  .el-dialog__headerbtn {
    top: 14px;
    right: 16px;
    font-size: 14px;
  }
  .el-dialog__body {
    padding-right: 0;
    padding-bottom: 0;
    height: 505px;
    background-color: #f7f7f7;
    overflow-y: auto;
  }
  .el-dialog__footer {
    height: 64px;
  }
  .db-logo-container {
    .disc {
      margin-top: 20px;
      font-size: 12px;
      font-family: PingFangSC-Medium, PingFang SC;
      font-weight: 500;
      color: #555555;
    }
    .db-logo-box {
      position: relative;
      display: inline-block;
      margin-top: 10px;
      margin-right: 18px;
      width: 150px;
      height: 86px;
      cursor: pointer;
      img {
        display: block;
        margin: 0 auto;
      }
      background-color: #fff;
      .db-name {
        font-size: 12px;
        text-align: center;
        line-height: 26px;
      }
    }
    .selected-db {
      position: absolute;
      top: 0;
      left: 0;
      width: 150px;
      height: 86px;
      background-color: rgba(85, 85, 85, 0.7);

      img {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
      }
    }
  }
}

.iconfont.icon-xitong.blue-system-icon {
  color: $primary-color;
  margin-right: 4px;
}

.bind-system-dialog {
  .content-inner {
    height: 100%;
  }
}
</style>
