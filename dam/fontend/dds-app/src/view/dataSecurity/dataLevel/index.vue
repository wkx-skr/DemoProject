<template>
  <div class="tagPage">
    <div class="tree-area" ref="leftDom">
      <div class="tree-box lazy-tree-box" v-if="treeShow">
        <datablau-tree-header>
          <template slot="title">{{ $t('dataLevel.title') }}</template>
          <template slot="more">
            <datablau-tooltip
              :content="
                showUnFold
                  ? $t('securityModule.packUp')
                  : $t('securityModule.expand')
              "
              placement="bottom"
            >
              <i
                @click="expandOrCollapse"
                class="iconfont"
                :class="showUnFold ? 'icon-shouqi' : 'icon-zhankai'"
              ></i>
            </datablau-tooltip>
          </template>
          <template slot="search">
            <!-- <i
              v-show="showClose"
              class="el-icon-circle-close cursor-close"
              :class="{ 'show-cursor-close': showClose }"
              @click="clear"
            ></i> -->
            <datablau-select
              ref="loadSelect"
              class="filter-input"
              v-model="chooseResult"
              :iconfont-state="true"
              clearable
              filterable
              remote
              reserve-keyword
              :placeholder="$t('securityModule.search')"
              :remote-method="queryTags"
              :loading="searchLoading"
              popper-class="tree-search-popper"
              @change="handleChooseChange"
              @focus="focusSelect"
              @visible-change="visibleChange"
              :isIcon="'icon-search'"
            >
              <span
                class="iconfont icon-search"
                slot="prefix"
                style="line-height: 34px; color: #999"
              ></span>
              <el-option
                v-for="item in searchResult"
                :key="item.tagId"
                :label="item.parentName + '/' + item.name"
                :value="item.tagId"
              ></el-option>
            </datablau-select>
          </template>
        </datablau-tree-header>
        <div class="tree-content">
          <datablau-tree
            ref="securityTree"
            node-key="tagId"
            :data="treeData"
            :props="defaultProps"
            :highlight-current="true"
            :filter-node-method="filterNode"
            :data-supervise="true"
            :data-icon-function="dataIconFunction"
            :data-options-function="
              data =>
                dataOptionsFunction(data, $t('securityModule.securityLevel'))
            "
            :default-expanded-keys="defaultExpanded"
            :default-expand-all="true"
            :show-checkbox="false"
            :accordion="false"
            @check-change="handleCheckChange"
            @node-click="handleNodeClick"
            :use-default-sort="false"
            show-overflow-tooltip
          ></datablau-tree>
        </div>
      </div>
    </div>
    <div class="resize-column-middle" ref="resizeBar"></div>
    <div class="content-area" ref="rightDom">
      <template v-if="listShow">
        <div class="details" v-if="currentNode.tagId">
          <div class="datablau-breadcrumb-header">
            <div>
              <datablau-breadcrumb
                :node-data="breadcrumbData"
                :showBack="false"
                @nodeClick="breadcrumbNodeClick"
                @back="goBack"
              ></datablau-breadcrumb>
            </div>
          </div>
          <div style="margin-top: 8px; font-size: 16px; padding: 0 20px">
            <span
              class="iconfont"
              :class="{
                'icon-biaoqian':
                  currentNode.parentId !== 0 && currentNode.parentId !== -1,
                'icon-file': currentNode.parentId === -1,
                'icon-safetylevel':
                  currentNode.name === $t('securityModule.securityLevel'),
                'icon-scope': currentNode.name === $t('securityModule.reach'),
                'icon-importance':
                  currentNode.name === $t('securityModule.importance'),
                'icon-extent':
                  currentNode.name === $t('securityModule.impactLevel'),
                'icon-impactobject':
                  currentNode.name === $t('securityModule.affectedObjects'),
              }"
              style="font-size: 32px; color: #409eff; float: left"
            ></span>
            <div
              class="name"
              style="
                max-width: 480px;
                line-height: 32px;
                height: 32px;
                margin-left: 16px;
                display: inline-block;
              "
            >
              <is-show-tooltip
                style="height: 100%"
                :content="currentNode.name"
                :refName="'name'"
              ></is-show-tooltip>
            </div>
            <datablau-button
              style="vertical-align: top"
              v-if="
                currentNode.parentId !== 0 &&
                currentNode.parentId !== -1 &&
                $auth.DATA_SECURITY_LEVEL_MANAGE
              "
              @click="handleEdit"
              type="icon"
              low-key
              class="iconfont icon-bianji info-edit"
              :tooltip-content="$t('securityModule.edit')"
            ></datablau-button>
          </div>
          <div class="main">
            <div style="display: flex; flex-direction: column; height: 100%">
              <div style="flex-shrink: 0">
                <div style="padding: 0 20px">
                  <datablau-detail-subtitle
                    :title="$t('securityModule.des')"
                    mt="10px"
                    mb="10px"
                    class="title"
                  ></datablau-detail-subtitle>
                  <p class="content">
                    <template v-if="currentNode.description">
                      <span
                        style="word-wrap: break-word"
                        v-html="currentNode.description"
                      ></span>
                    </template>
                    <template v-else>
                      <img
                        src="/static/images/dataAssets/noresult.svg"
                        style="width: 42px"
                        alt=""
                      />
                      <span style="font-size: 12px; color: #999999">
                        {{ $t('securityModule.noData') }}
                      </span>
                    </template>
                  </p>
                </div>
              </div>
              <div style="flex-grow: 1">
                <div style="padding: 0 20px">
                  <datablau-detail-subtitle
                    :title="$t('dataLevel.dataAssets')"
                    mt="10px"
                    mb="10px"
                    class="title"
                  ></datablau-detail-subtitle>
                </div>
                <div class="table-content">
                  <div style="padding: 0 30px">
                    <datablau-input
                      :iconfont-state="true"
                      clearable
                      :placeholder="$t('dataLevel.searchName')"
                      v-model="assetKeyword"
                      @keyup.native.enter="searchData"
                      style="min-width: 300px"
                    ></datablau-input>
                  </div>
                  <div class="table-box">
                    <datablau-form-submit>
                      <datablau-table
                        height="100%"
                        v-loading="loading"
                        :data="assetsData"
                        :show-column-selection="false"
                        @sort-change="handleSortChange"
                        row-class-name="row-can-click"
                        @row-click="toCheckAssetDetails"
                      >
                        <el-table-column width="25px">
                          <template slot-scope="scope">
                            <datablau-icon
                              :data-type="'logicaltable'"
                              v-if="
                                scope.row.logical && scope.row.type === 80000004
                              "
                              :size="16"
                              style="margin-top: 8px"
                            ></datablau-icon>
                            <datablau-icon
                              :data-type="'logicalcolumn'"
                              v-else-if="
                                scope.row.logical && scope.row.type === 80000005
                              "
                              :size="16"
                              style="margin-top: 8px"
                            ></datablau-icon>
                            <datablau-icon
                              v-else
                              :data-type="assetsTypeIconMap[scope.row.type]"
                              :size="16"
                              style="margin-top: 8px"
                            ></datablau-icon>
                          </template>
                        </el-table-column>
                        <el-table-column
                          prop="objectName"
                          sortable="objectName"
                          :label="$t('dataLevel.assetsName')"
                        >
                          <template slot-scope="scope">
                            {{
                              scope.row.objectName +
                              (scope.row.objectNameAlias
                                ? `(${scope.row.objectNameAlias})`
                                : '')
                            }}
                          </template>
                        </el-table-column>
                        <el-table-column
                          prop="authStdName"
                          :label="$t('dataLevel.infoName')"
                        >
                          <template slot-scope="scope">
                            {{ scope.row.authStdName || '--' }}
                          </template>
                        </el-table-column>
                        <el-table-column
                          prop="catalogPath"
                          show-overflow-tooltip
                          :label="$t('securityModule.inSecurityClassify')"
                        >
                          <template slot-scope="scope">
                            {{
                              scope.row.catalogPath[0] === '/'
                                ? scope.row.catalogPath.slice(1)
                                : scope.row.catalogPath
                            }}
                          </template>
                        </el-table-column>
                        <el-table-column
                          prop="sourcePath"
                          show-overflow-tooltip
                          :label="$t('securityModule.authoritySource')"
                        ></el-table-column>
                        <el-table-column
                          :label="$t('securityModule.operate')"
                          :width="100"
                          align="right"
                          fixed="right"
                          prop="operation"
                        >
                          <template slot-scope="scope">
                            <datablau-button
                              type="icon"
                              :tooltip-content="$t('securityModule.view')"
                              class="iconfont icon-see"
                              @click="toCheckAssetDetails(scope.row)"
                            ></datablau-button>
                          </template>
                        </el-table-column>
                      </datablau-table>
                      <template slot="buttons">
                        <datablau-pagination
                          class="page"
                          @size-change="handleAssetsSizeChange"
                          @current-change="handleAssetsCurrentChange"
                          :current-page.sync="assetsPagination.pageNum"
                          :page-sizes="[20, 50, 100, 200]"
                          :page-size="assetsPagination.pageSize"
                          layout="total, sizes, prev, pager, next, jumper"
                          :total="assetsPagination.total"
                        ></datablau-pagination>
                      </template>
                    </datablau-form-submit>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>
    <datablau-dialog
      ref="tagDialog"
      :visible.sync="tagDialogVisible"
      :title="tagDialogTitle"
      width="650px"
      :height="320"
      append-to-body
      :close-on-click-modal="false"
      :before-close="handleCloseTagDialog"
      custom-class="tag-dialog"
    >
      <datablau-form
        ref="tagForm"
        :model="tagData"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item prop="name" :label="tagData.nameLabel">
          <datablau-input
            v-model="tagData.name"
            style="width: 500px"
            :placeholder="$t('securityModule.input')"
            :maxlength="100"
            show-word-limit
          ></datablau-input>
        </el-form-item>
        <el-form-item prop="color" :label="$t('dataLevel.attrColor')">
          <div
            style="
              display: flex;
              align-items: center;
              position: relative;
              line-height: 36px;
              padding-top: 4px;
            "
          >
            <div
              v-for="color in primaryTagColor"
              class="color-item"
              :key="color"
              :class="{ active: color === tagData.color }"
              :style="{
                cursor:
                  selectedColor.indexOf(color) === -1
                    ? 'pointer'
                    : 'not-allowed',
              }"
            >
              <span
                @click="setTagColor(color)"
                :style="{ backgroundColor: color }"
              ></span>
            </div>
            <datablau-button
              type="text"
              @click="showMoreColor"
              style="top: -1px"
            >
              {{
                moreColor
                  ? $t('securityModule.cancel')
                  : $t('securityModule.more')
              }}
            </datablau-button>
            <div
              v-if="moreColor"
              style="
                position: absolute;
                top: 32px;
                width: 264px;
                padding: 12px 10px;
                box-shadow: 0px 5px 8px 0px rgba(0, 0, 0, 0.07);
                background-color: #fff;
                z-index: 99;
                border: 1px solid #efefef;
              "
            >
              <div
                style="
                  font-size: 12px;
                  color: #555;
                  line-height: 17px;
                  font-weight: 500;
                  margin-left: 3px;
                  margin-bottom: 8px;
                "
              >
                {{ $t('dataLevel.recommend') }}
              </div>
              <div
                style="
                  display: flex;
                  align-items: center;
                  justify-content: flex-start;
                  flex-wrap: wrap;
                "
              >
                <span
                  v-for="color in allTagColor.slice(0, 10)"
                  class="color-item"
                  :key="color"
                  :class="{ active: color === tagData.color }"
                  :style="{
                    cursor:
                      selectedColor.indexOf(color) === -1
                        ? 'pointer'
                        : 'not-allowed',
                  }"
                >
                  <span
                    @click="setTagColor(color)"
                    :style="{ backgroundColor: color }"
                  ></span>
                </span>
                <div
                  style="
                    width: 100%;
                    height: 1px;
                    background-color: #ddd;
                    margin: 6px 0;
                  "
                ></div>
                <span
                  v-for="color in allTagColor.slice(10)"
                  class="color-item"
                  :key="color"
                  :class="{ active: color === tagData.color }"
                  :style="{
                    cursor:
                      selectedColor.indexOf(color) === -1
                        ? 'pointer'
                        : 'not-allowed',
                  }"
                >
                  <span
                    @click="setTagColor(color)"
                    :style="{ backgroundColor: color }"
                  ></span>
                </span>
              </div>
            </div>
          </div>
        </el-form-item>
        <el-form-item prop="description" :label="$t('securityModule.des')">
          <datablau-input
            v-model="tagData.description"
            type="textarea"
            clearable
            style="width: 500px; height: 80px"
            :placeholder="$t('securityModule.input')"
            :maxlength="1000"
            show-word-limit
            resize="none"
            :rows="3"
            class="tag-desc"
          ></datablau-input>
        </el-form-item>
      </datablau-form>
      <span slot="footer">
        <datablau-button type="secondary" @click="handleCloseTagDialog">
          {{ $t('securityModule.cancel') }}
        </datablau-button>
        <datablau-button type="primary" @click="submitData">
          {{ $t('securityModule.sure') }}
        </datablau-button>
      </span>
    </datablau-dialog>
  </div>
</template>

<script>
import index from './index.js'
export default index
</script>

<style lang="scss" scoped="scoped">
$grey-border: 1px solid #eaecf1;
$border-grey: 1px solid #eceff4;
$blue: #268bd3;
$tree-line-height: 44px;
$tree-box-width: 240px;
$border-test: 1px solid #aaa;
.tag-desc {
  /deep/ .el-textarea {
    .el-textarea__inner {
      height: 80px !important;
    }
  }
}
.tagPage {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  .tree-area {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    .tree-box {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 10px;
      .tree-content {
        position: absolute;
        top: 80px;
        bottom: 0;
        left: 0;
        right: 0;
        overflow: auto;
      }
    }
  }
  .resize-column-middle {
    position: absolute;
    top: 10px;
    bottom: 10px;
    left: $tree-box-width;
    width: 10px;
    background-color: transparent;
    cursor: e-resize !important;
    z-index: 1;
  }
  .content-area {
    left: 240px;
    .details {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      .main {
        position: absolute;
        top: 80px;
        left: 0;
        right: 0;
        bottom: 0;
        .table-content {
          height: calc(100% - 41px);
          position: relative;
          .table-box {
            position: absolute;
            top: 32px;
            left: 0px;
            right: 0px;
            bottom: 0;
            /deep/ .form-submit {
              .row-content {
                left: 10px;
                right: 10px;
              }
            }
          }
        }
        p {
          font-size: 12px;
          line-height: 24px;
          padding: 0 10px;
          max-height: 100px;
          overflow-y: auto;
        }
      }
      .info-edit {
        color: #409eff;
        margin-left: 10px;
        cursor: pointer;
      }
      /deep/ .ant-breadcrumb {
        line-height: 28px;
      }
    }
    /deep/.el-table__empty-text {
      margin-top: 17%;
    }
  }
}
.light-blue-tree /deep/ .el-tree-node.is-current > .el-tree-node__content {
  background-color: #ebf4ff;
}
.light-blue-tree /deep/ .el-tree-node__content:hover {
  background-color: #f8f9fc;
}
</style>
<style lang="scss">
.tag-desc {
  /deep/ .el-textarea .el-input__count {
    bottom: 5px;
    line-height: 20px;
  }
  /deep/ .datablau-input .el-textarea__inner {
    padding: 5px 10px;
  }
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
  .select-con {
    margin-left: 16px;
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
.tag-dialog {
  .color-item {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    border: 1px solid transparent;
    cursor: pointer;
    border-radius: 2px;
    &.active {
      border: 1px solid #ddd;
    }
    > span {
      display: inline-block;
      width: 16px;
      height: 16px;
      border-radius: 2px;
    }
  }
}
</style>
