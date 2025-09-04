<template>
  <div @mousemove="onDrag($event)" class="tagPage">
    <datablau-dialog
      :title="editTitle"
      :visible.sync="dialogVisible"
      width="600px"
      class="edit-tag-dialog"
      append-to-body
    >
      <div class="dialog-container" v-if="dialogVisible">
        <!-- <div class="dialog-container"> -->
        <el-form
          :label-width="$i18n.locale === 'zh' ? '80px' : '160px'"
          class="edit-tag outer-dialog-form"
          :rules="rules"
          @submit.native.prevent
        >
          <el-form-item
            :label="$t('meta.tagManage.groupName')"
            v-if="addType === 'group'"
            style="margin-bottom: 2em"
          >
            <datablau-input
              class="tag_manage_form_content"
              size="mini"
              maxlength="20"
              v-model.trim="addGroupValue"
              :placeholder="$t('meta.tagManage.fillGroupName')"
              clearable
            ></datablau-input>
          </el-form-item>
          <el-form-item
            :label="$t('meta.tagManage.name')"
            v-if="addType !== 'group'"
            style="margin-bottom: 2em"
          >
            <datablau-input
              class="tag_manage_form_content"
              size="mini"
              v-model.trim="addStr"
              :placeholder="$t('meta.tagManage.fillName')"
              maxlength="20"
              clearable
              :disabled="isEdit"
            ></datablau-input>
          </el-form-item>
          <el-form-item
            :label="$t('meta.tagManage.desc')"
            v-if="addType !== 'group'"
          >
            <datablau-input
              class="tag_manage_form_content"
              type="textarea"
              v-model="addPro"
              :placeholder="$t('meta.tagManage.fillDesc')"
              clearable
              resize="none"
              maxlength="256"
              show-word-limit
            ></datablau-input>
          </el-form-item>
          <el-form-item
            :label="$t('meta.tagManage.relTag')"
            v-if="addType === 'tag'"
          >
            <el-select
              style="margin-right: 10px"
              :style="{
                width: $i18n.locale === 'zh' ? '82%' : '84%',
              }"
              size="mini"
              v-model="editassociatedTags"
              :placeholder="$t('meta.tagManage.selTag')"
              clearable
              multiple
              filterable
              :disabled="true"
              class="disabled-show-border"
            >
              <el-option
                v-for="item in tagMap"
                :label="item.name"
                :value="item.tagId"
                :key="item.tagId"
              ></el-option>
            </el-select>
            <datablau-button @click="handleChooseRelTag" size="mini">
              {{ $t('meta.tagManage.selTagBtn') }}
            </datablau-button>
          </el-form-item>
          <!--          <el-form-item
            :label="$t('meta.tagManage.relDir')"
            v-if="addType === 'tag'"
          >
            <datablau-cascader
              v-if="options"
              :options="options"
              :props="defaultCatalogsProps"
              v-model="relatedCatalogs"
              :change-on-select="true"
            ></datablau-cascader>
          </el-form-item>-->
          <!--          <el-form-item label="文本颜色" v-if="addType === 'tag' && false">
            <el-color-picker
              v-model="editColor"
              size="mini"
              class="color-input-item"
            ></el-color-picker>
          </el-form-item>
          <el-form-item label="背景颜色" v-if="addType === 'tag' && false">
            <el-color-picker
              v-model="editBackgroundColor"
              size="mini"
              class="color-input-item"
            ></el-color-picker>
          </el-form-item>-->
        </el-form>
        <div class="dialog-bottom">
          <datablau-button
            type="primary"
            @click="conEdi"
            :disabled="!canConfirm"
          >
            {{ $t('common.button.ok') }}
          </datablau-button>
        </div>
      </div>
    </datablau-dialog>
    <choose-tag
      ref="chooseTag"
      :tagTree="tagsTreeData"
      :tagMap="tagMap"
      @choosedTagChanged="choosedTagChanged"
      :oldChoosedIds="editassociatedTags"
      :disabledSiblings="[editTag.tagId]"
      :disabledChildren="currentParentId"
    ></choose-tag>
    <el-popover
      :visible-arrow="true"
      :offset="10"
      width="0"
      title=""
      ref="popover_add_class"
      placement="right-start"
      trigger="click"
    >
      <div class="context-menu-style">
        <div class="context-option" @click="addClassGroup">
          <i class="el-icon-plus"></i>
          {{ $t('meta.tagManage.addGroup') }}
        </div>
      </div>
    </el-popover>
    <el-popover
      class="option-popover"
      width="0"
      title=""
      :visible-arrow="true"
      v-model="showOptionPop"
      :offset="10"
      ref="popover_context"
      placement="right-start"
      trigger="click"
      v-if="
        $auth['TAGES_VIEW_ADD'] ||
        $auth['TAGES_VIEW_MODIFY'] ||
        $auth['TAGES_VIEW_DELETE']
      "
    >
      <div class="context-menu-style">
        <div
          class="context-option"
          @click="addClass"
          v-show="optionShowFolderGroup"
        >
          <i class="el-icon-plus"></i>
          {{ $t('meta.tagManage.addDir') }}
        </div>
        <div
          class="context-option"
          v-show="optionShowFolder"
          @click="addTag"
          v-if="$auth['TAGES_VIEW_ADD']"
        >
          <i class="el-icon-plus"></i>
          {{ $t('meta.tagManage.addTag') }}
        </div>
        <div
          class="context-option"
          v-show="!optionShowFolder"
          @click="handleMoveTag"
          v-if="false"
        >
          <i class="fa-space-shuttle fa"></i>
          {{ $t('meta.tagManage.removeTo') }}
        </div>
        <div
          class="context-option"
          @click="handleEditTag"
          v-if="$auth['TAGES_VIEW_MODIFY'] && !isDataRanking"
        >
          <i class="fa fa-edit"></i>
          {{ $t('common.button.edit') }}
        </div>
        <div
          class="context-option"
          @click="deleteSingleTag"
          v-if="
            $auth['TAGES_VIEW_DELETE'] &&
            ((editTag.group && !isDataRanking) || !editTag.group)
          "
        >
          <i class="el-icon-delete"></i>
          {{ $t('common.button.delete') }}
        </div>
      </div>
    </el-popover>
    <choose-catalog
      ref="chooseTree"
      :chooseTreeData="catalogTree"
      :diaTitle="'移动到'"
      @chooseNode="moveCatalog"
    ></choose-catalog>
    <div class="tree-area">
      <div class="tree-search-box">
        <datablau-input
          size="mini"
          v-model="keyword"
          :placeholder="$t('meta.tagManage.tree_placeholder')"
          clearable
          class="search-input"
          :iconfont-state="true"
          :class="{ 'no-right-margin': isDataRanking }"
          @keydown.native.enter="searchByKeyword"
        ></datablau-input>
        <el-tooltip
          class="item"
          effect="dark"
          :content="$t('meta.tagManage.addGroup')"
          placement="top"
        >
          <i
            class="iconfont icon-tianjia"
            style="padding-top: 10px; line-height: 34px"
            v-if="$auth['TAGES_VIEW_ADD'] && !isDataRanking"
            @click="addClassGroup"
          ></i>
        </el-tooltip>
        <!-- <i
          style="padding-top: 10px; line-height: 34px"
          class="el-icon-more"
          v-if="hasAccess && $auth['TAGES_VIEW_ADD'] && !isDataRanking"
          v-popover:popover_add_class
        ></i> -->
      </div>
      <div class="tree-box" style="overflow: auto; bottom: 50px; top: 55px">
        <button class="fix-pos-popover" v-popover:popover_context>
          show popover
        </button>
        <!-- :data-icon-function="dataIconFunction"
            :data-supervise="true"
           :data-options-function="dataOptionsFunction" -->
        <!-- :render-content="renderContent" -->
        <datablau-tree
          ref="tree"
          class="light-blue-tree grey-tree"
          node-key="tagId"
          v-loading="isTreeLoading"
          :data="tagsTreeData"
          :props="defaultProps"
          :filter-node-method="filterNode"
          :default-expanded-keys="defaultExpanded"
          :default-expand-all="isDataRanking"
          :expand-on-click-node="false"
          :show-checkbox="$auth['TAGES_VIEW_DELETE']"
          :accordion="false"
          :data-supervise="supervise"
          :data-icon-function="dataIconFunction"
          :data-options-function="dataOptionsFunction"
          @check-change="handleCheckChange"
          @node-click="handleNodeClick"
          @node-expand="updateTreeBoxScrollbar(300)"
          @node-collapse="updateTreeBoxScrollbar(200)"
          draggable
          :allow-drag="allowDrag"
          :allow-drop="allowDrop"
          @node-drag-end="nodeDragEnd"
        ></datablau-tree>
      </div>
      <div class="manage-box" v-if="$auth['TAGES_VIEW_DELETE']">
        <span>
          {{
            $t('meta.DS.metaTable.exportTips', { exportNum: checkedListLength })
          }}
        </span>
        <datablau-button
          size="mini"
          class="el-icon-delete"
          type="danger"
          :disabled="!enableBtn"
          @click="deleteTags"
          v-if="$auth['TAGES_VIEW_DELETE']"
        >
          {{ $t('common.button.delete') }}
        </datablau-button>
        <!-- <span>已选{{ checkedListLength }}项</span> -->
      </div>
    </div>
    <div class="tree-area-margin-right" @mousedown="handleDrag($event)"></div>
    <div class="content-area content-areaTag">
      <datablau-tabs
        v-model="currentTab"
        class="page-card-tabs"
        :key="details.tagId"
        @tab-click="handleTab"
      >
        <el-tab-pane :label="$t('meta.tagManage.basicInfo')" name="details">
          <div class="details">
            <div class="head">
              <datablau-tooltip
                class="item"
                effect="dark"
                :content="details.parentName + '/' + details.name"
                placement="bottom"
              >
                <h3 class="tag-name" v-if="details.name">
                  {{ details.parentName }}/{{ details.name }}
                </h3>
              </datablau-tooltip>
              <br />
              <datablau-tooltip
                class="item"
                v-if="details.description && details.description !== ''"
                effect="dark"
                :content="details.description"
                placement="bottom"
                style="width: 100%"
              >
                <p
                  style="
                    white-space: nowrap;
                    overflow: hidden;
                    ext-overflow: ellipsis;
                  "
                >
                  <span
                    class="infoLabel"
                    :class="{ en: $i18n.locale === 'en' }"
                  >
                    {{ $t('meta.tagManage.desc') }}:
                  </span>
                  <span
                    style="
                      width: calc(100% - 80px);
                      display: inline-block;
                      overflow: hidden;
                      vertical-align: bottom;
                      text-overflow: ellipsis;
                    "
                  >
                    {{ details.description }}
                  </span>
                </p>
              </datablau-tooltip>
              <p
                v-else
                style="
                  white-space: nowrap;
                  overflow: hidden;
                  ext-overflow: ellipsis;
                "
              >
                <span class="infoLabel" :class="{ en: $i18n.locale === 'en' }">
                  {{ $t('meta.tagManage.desc') }}:
                </span>
                <span>{{ details.description }}</span>
              </p>

              <p v-if="showQuoteTable">
                <span class="tags-container">
                  <span
                    class="infoLabel"
                    :class="{ en: $i18n.locale === 'en' }"
                  >
                    {{ $t('meta.tagManage.relTag') }}:
                  </span>
                  <tag-package
                    v-for="tagId in details.associatedTags"
                    :key="tagId"
                    :tagId="tagId"
                    :tagMap="tagMap"
                    class="tag-item"
                  ></tag-package>
                </span>
              </p>
              <!--          <p style="margin-top: 0.5em">
            <span class="infoLabel" :class="{ en: $i18n.locale === 'en' }">
              {{ $t('meta.tagManage.relDir') }}:
            </span>
            <el-cascader
              class="infoCascaderContent"
              v-if="options"
              disabled
              size="mini"
              :options="options"
              :props="defaultCatalogsProps"
              :value="findCatalogIds(details.catalogId)"
              :change-on-select="true"
            ></el-cascader>
          </p>-->
            </div>
            <div class="table-container" ref="tableBox" v-if="showQuoteTable">
              <p class="quo-table">
                <span>{{ $t('meta.tagManage.quoteInfo') }}</span>
                <!-- <span class="select-con">
                  <el-checkbox v-model="showTable" @change="getTagDetails">表</el-checkbox>
                  <el-checkbox v-model="showClo" @change="getTagDetails">字段</el-checkbox>
                </span> -->
                <span class="quote-count" v-if="false">
                  <span>
                    {{ $t('meta.tagManage.quoteTableNum', { num: quoTables }) }}
                  </span>
                  <span>
                    {{
                      $t('meta.tagManage.quoteColumnNum', { num: quoColumns })
                    }}
                  </span>
                </span>
              </p>
              <div class="table-box">
                <datablau-tab-with-table
                  class="tag-link-table"
                  ref="columnsTable"
                  :isDatablau="true"
                  :isCheckbox="$auth['TAGES_VIEW_MODIFY']"
                  :hideTopLine="true"
                  :totalShow="totalShow"
                  :columnDefs="columnDefs"
                  :getShowData="getShowData"
                  :hideBottomLine="false"
                  :tableOption="tableOption"
                  @datablauSelectionChanged="datablauSelectionChanged"
                >
                  <div v-if="$auth['TAGES_VIEW_MODIFY']" slot="footer">
                    <datablau-button
                      type="secondary"
                      class="green-btn tab-button"
                      @click="handleRemoveTagQuote"
                      :disabled="disableCommitButton"
                    >
                      {{ $t('meta.tagManage.cancelQuote') }}
                    </datablau-button>
                  </div>
                </datablau-tab-with-table>
              </div>
              <!-- <div class="coverMask" @wheel.stop.prevent>
                <i class="el-icon-loading"></i>
              </div> -->
            </div>
            <!--            <div class="bottom-line" v-if="hasAccess">
              <datablau-button size="small" class="green-btn tab-button" @click="handleRemoveTagQuote" :disabled="disableCommitButton">取消引用</datablau-button>
            </div>-->
          </div>
        </el-tab-pane>
        <!--        <el-tab-pane
          label="标签识别规则"
          name="multipleRule"
          v-if="details && details.tagId"
        >
          <multiple-tag-rule
            v-if="currentTab === 'multipleRule'"
            :tag-detail="details"
          ></multiple-tag-rule>
        </el-tab-pane>
        <el-tab-pane
          label="智能推荐规则"
          name="smart"
          v-if="details && details.tagId && $tagRcmdEnabled"
        >
          <smart-rule
            v-if="currentTab === 'smart'"
            :tag-detail="details"
          ></smart-rule>
        </el-tab-pane>-->
      </datablau-tabs>
    </div>
    <!-- <div class="page-btn-group right-top">
      <datablau-button @click="addClass" size="mini" icon="el-icon-edit
" class="creat">创建分类</datablau-button>
      <datablau-button @click="addTag" size="mini" icon="el-icon-edit
" class="creat">添加标签</datablau-button>
    </div> -->
  </div>
</template>

<script>
import tagManage from './tagManage.js'
export default tagManage
</script>

<style lang="scss" scoped="scoped">
@import './tagManage.scss';
.tagPage {
  .tree-area-margin-right {
    left: 276px;
    z-index: 2;
  }
}
/deep/ .el-form .el-form-item .tag_manage_form_content {
  width: 100%;
}
.page-card-tabs {
  margin-top: 10px;
  /deep/ .el-tabs {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    .el-tabs__header {
      background-color: #fff;
      padding: 0 20px;
      .el-tabs__active-bar {
        display: none;
      }
    }
    .el-tabs__content {
      position: absolute;
      top: 41px;
      right: 0;
      bottom: 0;
      left: 0;
      border: 1px solid var(--border-color-lighter);
      border-top: none;
      border-left: none;
      .details {
        .head {
          .infoLabel {
            width: 72px;
            &.en {
              width: 162px;
            }
            display: inline-block;
            text-align: right;
            margin-right: 16px;
          }
          .infoCascaderContent {
            width: 600px;
            .el-input.is-disabled .el-input__inner {
              cursor: not-allowed !important;
              background-color: #f5f5f5;
            }
          }
        }
      }
    }
  }
}
</style>
<style lang="scss">
.el-tooltip__popper {
  max-width: 60% !important;
}
.context-menu-tree {
  .tree-item {
    position: relative;
    flex: 1;
    display: flex;
    align-items: center;
  }
}
.content-area {
  &.content-areaTag {
    left: 280px !important;
  }
  .select-con {
    margin-left: 16px;
  }
}
.tagPage {
  .edit-tag-dialog {
    .dialog-container {
      max-width: 600px;
      // border: 1px solid red;
      .el-input {
        // border: 1px solid red;
        width: 80%;
      }
      input,
      textarea {
        width: 100%;
      }
      .el-select {
        width: 80%;
      }
      .el-form-item__content {
        .color-input-item {
          top: 6px;
        }
        .disabled-show-border {
          .el-input {
            border: 1px solid #dcdfe6;
            border-radius: 4px;
          }
          .el-select__tags-text {
            line-height: 24px;
          }
        }
      }
      .el-form-item__error {
        margin-top: -9px;
      }
    }
  }
  .manage-box {
    height: 50px;
    border-top: 1px solid var(--border-color-lighter);
    box-shadow: 0px -5px 14px -8px rgba(0, 0, 0, 0.2);
  }
}
//for tree node option.
.tree-item-outer {
  flex: 1;
  align-items: center;
  justify-content: space-between;
  display: block !important;
}
.tree-item-outer .more {
  display: none;
  position: absolute;
  right: 0;
  padding: 0 8px 0 12px;
  z-index: 2;
  background: inherit;
  float: right;
  line-height: 34px;
}
</style>
