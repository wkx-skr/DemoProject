<template>
  <div class="assurancePage">
    <datablau-dialog
      :title="editTitle"
      :visible.sync="dialogVisible"
      width="600px"
      height="330px"
      class="edit-tag-dialog"
      append-to-body
      :before-close="handleDialogClose"
    >
      <div class="dialog-container" v-if="dialogVisible">
        <!-- <div class="dialog-container"> -->
        <el-form
          class="page-form"
          :label-width="$i18n.locale === 'zh' ? '80px' : '120px'"
          :rules="rules"
          ref="ruleForm"
          :model="ruleForm"
        >
          <el-form-item
            :label="$t('quality.page.qualityAssurance.parentPath')"
            style="margin-top: 20px"
            v-if="parentMenuList.length !== 0"
          >
            <p>{{ parentMenuList.join('/') }}</p>
          </el-form-item>
          <el-form-item
            :label="$t('quality.page.qualityAssurance.directoryName')"
            prop="name"
            style="margin-top: 20px"
          >
            <datablau-input
              maxlength="20"
              v-model.trim="ruleForm.name"
              @keydown.native="nameKeydown"
            ></datablau-input>
          </el-form-item>
          <el-form-item
            :label="$t('quality.page.qualityAssurance.owner')"
            prop="owner"
            style="margin-top: 20px"
            v-if="isEdit === false"
          >
            <datablau-input
              maxlength="20"
              @focus="selectSubmitter()"
              v-model.trim="ruleForm.owner"
            ></datablau-input>
          </el-form-item>
        </el-form>
      </div>
      <span slot="footer" class="dialog-footer">
        <datablau-button type="secondary" @click="dialogVisible = false">
          {{ $t('common.button.cancel') }}
        </datablau-button>
        <datablau-button
          type="important"
          v-if="isEdit === false"
          @click="conEdi"
        >
          {{ $t('common.button.ok') }}
        </datablau-button>
        <datablau-button
          type="important"
          v-if="isEdit === true"
          @click="editCatalogueName"
        >
          {{ $t('common.button.ok') }}
        </datablau-button>
      </span>
    </datablau-dialog>
    <user-select
      :title="$t('quality.page.qualityAssurance.selectUserGroup')"
      :dialogVisible="dialogVisibleUser"
      :selectList="selectList"
      @close="close"
      height="552"
      @primary="primary"
      :defaultProps="{
        children: 'children',
        label: 'groupName',
        id: 'groupName',
      }"
    ></user-select>
    <div class="tree-area">
      <div class="en-tree-box">
        <datablau-input
          maxlength="100"
          style="
            width: 230px;
            margin: 10px;
            position: relative;
            top: -1px;
            display: inline-block;
          "
          :iconfont-state="true"
          v-model="keyword"
          clearable
          :placeholder="$t('quality.page.qualityAssurance.placeholderTree')"
        ></datablau-input>
        <el-tooltip
          class="item"
          effect="dark"
          :content="$t('quality.page.qualityAssurance.addDirectory')"
          placement="top"
        >
          <i
            class="iconfont icon-tianjia"
            style="
              padding-top: 10px;
              line-height: 34px;
              color: grey;
              cursor: pointer;
            "
            @click="addRulesCatalogue"
          ></i>
        </el-tooltip>
      </div>
      <div class="tree-box" style="text-align: center">
        <datablau-tree
          class="el-tree light-blue-tree grey-tree"
          style="position: relative"
          :show-checkbox="false"
          ref="mainTree"
          :data="treeData"
          :key="treeKey"
          :expand-on-click-node="false"
          default-expand-all
          :props="defaultProps"
          @node-click="handleNodeClick"
          :filter-node-method="filterNode"
          check-strictly
          node-key="id"
          :data-supervise="true"
          :data-icon-function="dataIconFunction"
          :data-options-function="dataOptionsFunction"
          setId="id"
          v-loading="!treeData"
        ></datablau-tree>
      </div>
      <!--      <div class="fieldEmpty" v-if="treeData && treeData.length === 0">-->
      <div class="fieldEmpty" v-if="treeDataNull">
        <datablau-icon
          :data-type="'no-result'"
          :icon-type="'svg'"
          :size="80"
          class="icon"
        ></datablau-icon>
        <p>{{ $t('quality.page.qualityAssurance.noDirectory') }}</p>
        <p>
          <datablau-button type="important" @click="addRulesCatalogue">
            {{ $t('quality.page.qualityAssurance.addDirectory') }}
          </datablau-button>
        </p>
      </div>
    </div>
    <div class="folder-line"></div>
    <div
      class="content-detail"
      :class="{ hideTab: !showTabs }"
      v-loading="loadingDetail"
    >
      <div v-if="initialization === false">
        <div class="model-item-page-title">
          <datablau-breadcrumb
            :node-data="nodeData"
            :couldClick="false"
            :showBack="false"
          ></datablau-breadcrumb>
        </div>
        <div class="content-header">
          <div class="cont-img">
            <i class="iconfont icon-file"></i>
          </div>
          <div class="cont-name">
            <datablau-tooltip
              effect="dark"
              :content="clickDataName"
              placement="top-start"
              :disabled="isShowTooltip"
            >
              <p @mouseover="onMouseOver(clickDataName)">
                <span :ref="clickDataName">
                  {{ clickDataName }}
                </span>
              </p>
            </datablau-tooltip>

            <i
              class="iconfont icon-bianji"
              @click="handleEditCatalogue(clickData)"
            ></i>
          </div>
          <div class="cont-owner">
            <span class="label">
              {{ $t('quality.page.qualityAssurance.owner') }}
            </span>
            <div class="right">
              <div class="abbreviation" v-if="formOwner.owner">
                {{ `${formOwner.owner}`.substr(0, 1) }}
              </div>
              <p>{{ formOwner.owner }}</p>
              <div class="switchIcon" @click="selectSubmitter2()">
                <div class="switchIconBox">
                  <i class="iconfont icon-switch"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- <div class="title">目录信息</div> -->
        <div>
          <datablau-tabs
            v-model="activeName"
            class="tabs-table"
            style="
              clear: both;
              position: absolute;
              left: 20px;
              right: 20px;
              top: 112px;
              bottom: 0;
            "
            @tab-click="activeNameChange"
          >
            <el-tab-pane
              :label="$t('quality.page.qualityAssurance.directorySettings')"
              name="catalogue"
              style="
                position: absolute;
                top: 34px;
                left: 0px;
                right: 0px;
                bottom: 0;
                overflow: auto;
              "
            >
              <div class="search-header">
                <datablau-select
                  v-model="modelGroupId"
                  clearable
                  filterable
                  style="
                    width: 230px;
                    position: relative;
                    display: inline-block;
                    margin-right: 8px;
                    margin-top: 8px;
                  "
                >
                  <el-option
                    v-for="item in groupIdsOptions"
                    :key="item.id"
                    :label="item.groupName"
                    :value="item.id"
                  ></el-option>
                </datablau-select>
                <datablau-button type="normal" @click="searchList">
                  {{ $t('common.button.query') }}
                </datablau-button>
                <datablau-button
                  type="important"
                  @click="addUserGroup"
                  style="float: right; margin-top: 10px"
                  class="iconfont icon-tianjia"
                >
                  {{ $t('quality.page.qualityAssurance.addJurisdictionGroup') }}
                </datablau-button>
              </div>
              <div
                style="
                  position: absolute;
                  top: 44px;
                  left: 0px;
                  right: 0px;
                  bottom: 60px;
                "
              >
                <datablau-table
                  :data="dataDisplay"
                  ref="multipleTable"
                  height="100%"
                  style="min-width: 800px"
                  @selection-change="handleSelectionChange"
                  :data-selectable="option.selectable"
                  :auto-hide-selection="option.autoHideSelectable"
                  :show-column-selection="option.showColumnSelection"
                  :column-selection="option.columnSelection"
                  :border="option.columnResizable"
                >
                  <el-table-column width="18">
                    <datablau-icon
                      :data-type="'qualityassurance'"
                      :size="18"
                      style="margin-top: 8px"
                    ></datablau-icon>
                  </el-table-column>
                  <el-table-column
                    show-overflow-tooltip
                    prop="title"
                    :label="
                      $t('quality.page.qualityAssurance.table.userGroupName')
                    "
                  >
                    <template slot-scope="scope">
                      <span>{{ scope.row.name }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column
                    prop="creator"
                    show-overflow-tooltip
                    :label="$t('quality.page.qualityAssurance.table.createdBy')"
                  ></el-table-column>
                  <el-table-column
                    :label="$t('quality.page.qualityAssurance.table.inherit')"
                  >
                    <template slot-scope="scope">
                      <span>
                        {{ scope.row.childrenInherit === true ? '是' : '否' }}
                      </span>
                    </template>
                  </el-table-column>
                  <el-table-column
                    prop="createTime"
                    :label="
                      $t('quality.page.qualityAssurance.table.creationTime')
                    "
                    :formatter="$timeFormatter"
                    width="150"
                  ></el-table-column>
                  <el-table-column
                    prop="lastModifier"
                    :label="
                      $t('quality.page.qualityAssurance.table.jurisdiction')
                    "
                    width="190"
                  >
                    <template slot-scope="scope">
                      <datablau-select
                        style="
                          display: inline-block;
                          width: 150px;
                          margin-bottom: 2px;
                        "
                        v-model="scope.row.accessAuth"
                        filterable
                        @change="updateAuth(scope.row)"
                      >
                        <el-option
                          v-for="it in accessAuthOsptions"
                          :key="it.value"
                          :label="it.label"
                          :value="it.value"
                        ></el-option>
                      </datablau-select>
                    </template>
                  </el-table-column>
                  <el-table-column
                    :label="$t('quality.page.qualityAssurance.table.operation')"
                    align="center"
                    width="120"
                  >
                    <template slot-scope="scope">
                      <datablau-button
                        :title="$t('common.button.delete')"
                        type="icon"
                        @click="handleDeleteClick(scope.row)"
                      >
                        <i class="iconfont icon-delete"></i>
                      </datablau-button>
                    </template>
                  </el-table-column>
                </datablau-table>
                <div
                  style="
                    width: 100%;
                    position: absolute;
                    bottom: -60px;
                    right: 0;
                    height: 50px;
                    background: #fff;
                    border-top: 1px solid #eee;
                  "
                >
                  <div
                    class="left-button"
                    v-show="multipleSelection.length > 0"
                  >
                    <span class="check-info"></span>
                    <span class="footer-row-info">
                      {{
                        $t('common.deleteMessage', {
                          selection: multipleSelection.length,
                        })
                      }}
                    </span>
                    <datablau-button
                      type="danger"
                      class="el-icon-delete"
                      @click="handleDeleteClick(multipleSelection, 'all')"
                    >
                      {{ $t('common.button.delete') }}
                    </datablau-button>
                  </div>
                  <!-- <datablau-pagination
                    style="margin-top: 10px; text-align: right"
                    @size-change="handleSizeChange"
                    @current-change="handleCurrentChange"
                    :current-page="currentPage"
                    :page-sizes="[20, 50, 100, 500]"
                    :page-size="pageSize"
                    :layout="'total, sizes, prev, pager, next, jumper'"
                    :total="totalItems"
                  ></datablau-pagination> -->
                </div>
              </div>
            </el-tab-pane>
            <el-tab-pane
              :label="$t('quality.page.qualityAssurance.inherit')"
              style="
                position: absolute;
                top: 34px;
                left: 0px;
                right: 0px;
                bottom: 0;
                overflow: auto;
              "
              name="inherit"
              v-if="parentIdNow !== 0"
            >
              <div class="search-header">
                <datablau-select
                  v-model="modelGroupIdInherit"
                  clearable
                  filterable
                  style="
                    width: 230px;
                    position: relative;
                    display: inline-block;
                    margin-right: 8px;
                    margin-top: 8px;
                  "
                >
                  <el-option
                    v-for="item in groupIdsOptions"
                    :key="item.id"
                    :label="item.groupName"
                    :value="item.id"
                  ></el-option>
                </datablau-select>
                <datablau-button type="normal" @click="searchList">
                  {{ $t('common.button.query') }}
                </datablau-button>
              </div>
              <div
                style="
                  position: absolute;
                  top: 44px;
                  left: 0px;
                  right: 0px;
                  bottom: 60px;
                "
              >
                <datablau-table
                  :data="dataDisplayInherit"
                  ref="multipleTable"
                  height="100%"
                  style="min-width: 800px"
                  :data-selectable="optioInherit.selectable"
                  :auto-hide-selection="optioInherit.autoHideSelectable"
                  :show-column-selection="optioInherit.showColumnSelection"
                  :column-selection="optioInherit.columnSelection"
                  :border="optioInherit.columnResizable"
                >
                  <el-table-column
                    show-overflow-tooltip
                    prop="title"
                    :label="
                      $t('quality.page.qualityAssurance.table.userGroupName')
                    "
                  >
                    <template slot-scope="scope">
                      <span>
                        {{ scope.row.name }}
                      </span>
                    </template>
                  </el-table-column>
                  <el-table-column
                    prop="creator"
                    show-overflow-tooltip
                    :label="$t('quality.page.qualityAssurance.table.createdBy')"
                  ></el-table-column>
                  <el-table-column
                    show-overflow-tooltip
                    :label="
                      $t('quality.page.qualityAssurance.table.inheritDirectory')
                    "
                  >
                    <template slot-scope="scope">
                      <span>
                        {{ searchTree(treeData, scope.row.inheritCategoryId) }}
                      </span>
                    </template>
                  </el-table-column>
                  <el-table-column
                    prop="createTime"
                    :label="
                      $t('quality.page.qualityAssurance.table.creationTime')
                    "
                    :formatter="$timeFormatter"
                    width="190"
                  ></el-table-column>
                  <el-table-column
                    prop="lastModifier"
                    :label="
                      $t('quality.page.qualityAssurance.table.jurisdiction')
                    "
                  >
                    <template slot-scope="scope">
                      <span
                        class="jurisdiction"
                        :class="{
                          editJurisdiction:
                            jurisdictionArr[scope.row.accessAuth] === '编辑',
                          seeJurisdiction:
                            jurisdictionArr[scope.row.accessAuth] === '查看',
                        }"
                      >
                        {{ jurisdictionArr[scope.row.accessAuth] }}权限
                      </span>
                    </template>
                  </el-table-column>
                </datablau-table>
                <!-- <div
                  style="
                    width: 100%;
                    position: absolute;
                    bottom: -60px;
                    right: 0;
                    height: 50px;
                    background: #fff;
                    border-top: 1px solid #eee;
                  "
                >
                  <datablau-pagination
                    style="margin-top: 10px; text-align: right"
                    @size-change="handleSizeChangeInherit"
                    @current-change="handleCurrentChangeInherit"
                    :current-page="currentPageInherit"
                    :page-sizes="[20, 50, 100, 500]"
                    :page-size="pageSizeInherit"
                    :layout="'total, sizes, prev, pager, next, jumper'"
                    :total="totalItemsInherit"
                  ></datablau-pagination>
                </div> -->
              </div>
            </el-tab-pane>
          </datablau-tabs>
        </div>
      </div>
      <div
        class="initialization"
        v-else
        style="
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        "
      >
        <datablau-null :type="'data'" style="width: 160px"></datablau-null>
      </div>
    </div>
  </div>
</template>

<script>
import rules from './main.js'
export default rules
</script>

<style scoped="scoped" lang="scss">
@import './main.scss';
</style>
<style lang="scss">
@import '~@/next/components/basic/color.sass';
.tabs-table {
  .el-tabs__content {
    position: static;
  }
}
.el-message-box__status {
  top: 50% !important;
}
.edit-tag-dialog {
  .page-form {
    .el-form-item {
      margin-bottom: 16px;
    }
  }
}
.assurancePage {
  .datablau-select .el-select .el-input input {
    height: 34px !important;
  }
  .system-select {
    .el-input {
      width: 750px !important;
    }
    .el-input__inner {
      border-radius: 2px;
    }
    .el-input__inner:hover {
      border-color: $primary-color;
    }
    .el-tag.el-tag--info {
      background-color: $table-hover-color;
      border-color: $table-hover-color;
      color: $primary-color;
      padding-left: 10px;
      padding-right: 14px;
    }
    .el-tag.el-tag--info .el-tag__close {
      background: none;
      width: 20px;
      right: -14px;
      height: 24px;
      transform: scale(1);
      line-height: 22px;
      border-radius: 0;
      color: $primary-color;
    }
    .el-tag.el-tag--info .el-tag__close:hover {
      color: $primary-color;
      background: $table-click-color;
    }
  }
  .el-form-item {
    margin-bottom: 16px;
  }
  .el-tab-pane {
    padding: 0;
  }
}
</style>
<style lang="scss" scoped>
.assurancePage {
  .our-detail {
    background: #fff;
    position: absolute;
    width: 100%;
    z-index: 12;
    top: 0;
    bottom: 0;
    .model-item-page-title {
      position: absolute;
      top: 0;
      right: 0;
      left: 0;
      z-index: 9;
      height: 44px;
      margin: 0 20px;
      font-size: 16px;
      // line-height: 44px;
      background: var(--default-bgc);
      border-bottom: 1px solid #ddd;
      // border-bottom: 1px solid red;
      button {
        margin-top: 8px;
      }
      .item-title {
        font-size: 18px;
      }
      .bottom-line {
        position: absolute;
        right: 20px;
        bottom: 0;
        left: 20px;
        display: inline-block;
        border-bottom: 1px solid #ddd;
      }
    }
  }
  .content-detail {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 280px;
    background: #fff;
    padding: 0 20px;
    .title {
      height: 40px;
      line-height: 40px;
      vertical-align: middle;
      font-size: 16px;
      font-weight: 600;
    }
    .model-item-page-title {
      position: absolute;
      top: 0;
      right: 0;
      left: 0;
      z-index: 9;
      height: 40px;
      margin: 0 20px;
      font-size: 16px;
      // line-height: 40px;
      padding-top: 8px;
      background: var(--default-bgc);
      border-bottom: 1px solid var(--border-color-lighter);
      // border-bottom: 1px solid red;
      button {
        margin-top: 8px;
      }
      .item-title {
        font-size: 18px;
      }
      .bottom-line {
        position: absolute;
        right: 20px;
        bottom: 0;
        left: 20px;
        display: inline-block;
        border-bottom: 1px solid #ddd;
      }
    }
  }
  .jurisdiction {
    width: 68px;
    height: 22px;
    border-radius: 2px;
    display: inline-block;
    text-align: center;
    line-height: 22px;
    &.editJurisdiction {
      background: rgba(67, 193, 202, 0.1);
      color: #43c1ca;
    }
    &.seeJurisdiction {
      background: rgba(140, 92, 255, 0.1);
      color: #8c5dfe;
    }
  }
}
.auth-ul {
  .auth-li {
    display: inline-block;
    margin-right: 20px;
    span {
      display: inline-block;
      padding-right: 6px;
    }
  }
}
</style>
