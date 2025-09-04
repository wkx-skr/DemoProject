<template>
  <div class="tagPage">
    <div class="tree-area" ref="leftDom">
      <div class="tree-box lazy-tree-box">
        <datablau-tree-header>
          <template slot="title">安全分级管理</template>
          <template slot="more">
            <datablau-tooltip
              :content="showUnFold ? '收起' : '展开'"
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
            <i
              v-show="showClose"
              class="el-icon-circle-close cursor-close"
              :class="{ 'show-cursor-close': showClose }"
              @click="clear"
            ></i>
            <datablau-select
              ref="loadSelect"
              class="filter-input"
              v-model="chooseResult"
              :iconfont-state="true"
              clearable
              filterable
              remote
              reserve-keyword
              :placeholder="$t('assets.catalogue.searchPlaceholder')"
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
              data => dataOptionsFunction(data, '安全等级')
            "
            :default-expanded-keys="defaultExpanded"
            :default-expand-all="true"
            :show-checkbox="false"
            :accordion="false"
            @check-change="handleCheckChange"
            @node-click="handleNodeClick"
            :use-default-sort="false"
            show-overflow-tooltip
          >
            <!-- :check-strictly="true" -->
          </datablau-tree>
        </div>
      </div>
    </div>
    <div class="resize-column-middle" ref="resizeBar"></div>
    <div class="content-area" ref="rightDom">
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
              'icon-safetylevel': currentNode.name === '安全等级',
              'icon-scope': currentNode.name === '影响范围',
              'icon-importance': currentNode.name === '重要程度',
              'icon-extent': currentNode.name === '影响程度',
              'icon-impactobject': currentNode.name === '影响对象',
            }"
            style="font-size: 32px; color: #409eff; float: left"
          ></span>
          <span style="line-height: 32px; margin-left: 16px">
            {{ currentNode.name }}
          </span>
          <i
            v-if="currentNode.parentId !== 0 && currentNode.parentId !== -1"
            class="iconfont icon-bianji info-edit"
            title="编辑"
            @click="handleEdit"
          ></i>
        </div>
        <div class="main">
          <div style="display: flex; flex-direction: column; height: 100%">
            <div style="flex-shrink: 0">
              <div style="padding: 0 20px">
                <datablau-detail-subtitle
                  title="描述"
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
                      暂无信息
                    </span>
                  </template>
                </p>
              </div>
            </div>
            <div style="flex-grow: 1">
              <div style="padding: 0 20px">
                <datablau-detail-subtitle
                  title="数据资产"
                  mt="10px"
                  mb="10px"
                  class="title"
                ></datablau-detail-subtitle>
              </div>
              <div class="table-content">
                <div style="padding: 0 30px">
                  <datablau-input
                    :iconfont-state="true"
                    placeholder="搜索数据资产名称、信息项名称"
                    v-model="assetKeyword"
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
                    >
                      <el-table-column width="25px">
                        <template slot-scope="scope">
                          <datablau-icon
                            :data-type="assetsTypeIconMap[scope.row.type]"
                            :size="16"
                            style="margin-top: 8px"
                          ></datablau-icon>
                        </template>
                      </el-table-column>
                      <el-table-column
                        prop="objectName"
                        sortable="objectName"
                        label="数据资产名称"
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
                        label="信息项名称"
                      ></el-table-column>
                      <el-table-column
                        prop="catalogPath"
                        show-overflow-tooltip
                        label="数据分类路径"
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
                        label="权威来源"
                      ></el-table-column>
                      <el-table-column
                        label="操作"
                        :width="100"
                        align="right"
                        fixed="right"
                        prop="operation"
                      >
                        <template slot-scope="scope">
                          <datablau-button
                            type="icon"
                            tooltip-content="查看"
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
                        :page-sizes="[10, 20, 50]"
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
    </div>
    <datablau-dialog
      ref="tagDialog"
      :visible.sync="tagDialogVisible"
      :title="tagDialogTitle"
      width="650px"
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
            style="width: 450px"
            :placeholder="'请输入' + tagData.namePlaceholder"
            :maxlength="30"
            show-word-limit
          ></datablau-input>
        </el-form-item>
        <el-form-item prop="description" label="描述">
          <datablau-input
            v-model="tagData.description"
            type="textarea"
            style="width: 450px"
            :placeholder="'请输入' + tagData.descLabel"
            :maxlength="500"
            show-word-limit
            :rows="5"
            class="tag-desc"
          ></datablau-input>
        </el-form-item>
      </datablau-form>
      <span slot="footer">
        <datablau-button type="secondary" @click="handleCloseTagDialog">
          取 消
        </datablau-button>
        <datablau-button type="primary" @click="submitData">
          确 定
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
.el-dialog__wrapper .tag-dialog.el-dialog .el-dialog__body {
  top: 65px;
}
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
</style>
