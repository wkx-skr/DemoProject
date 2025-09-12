<template>
  <div style="height: 100%" id="ddd" class="domain-component-outer">
    <div class="tree-area" :class="{ user: !$auth['ROLE_DOMAIN_ADMIN'] }">
      <tree-catalogue
        ref="treeCatalog"
        @itemClick="handleItemClicked"
      ></tree-catalogue>
    </div>
    <div class="tree-area-margin-right"></div>
    <div class="content-area" v-show="contentStatus === 'folder'">
      <div class="folder-content-box abandon-domain-list">
        <datablau-list-search class="search-outer" style="padding: 10px">
          <el-form ref="searchForm" :inline="true" :model="searchFormData">
            <el-form-item prop="domainName" style="width: 200px">
              <datablau-input
                clearable
                maxlength="100"
                type="text"
                style="width: 200px"
                v-model="searchFormData.domainName"
                :placeholder="$t('domain.domain.searchName')"
              ></datablau-input>
            </el-form-item>
            <el-form-item prop="domainCode" style="width: 200px">
              <datablau-input
                type="text"
                clearable
                maxlength="100"
                size="mini"
                style="width: 200px;!important"
                v-model="searchFormData.domainCode"
                :placeholder="$t('domain.domain.searchDomainCode')"
              ></datablau-input>
            </el-form-item>
          </el-form>
          <template slot="buttons">
            <div style="margin-right: 20px">
              <datablau-button
                size="mini"
                type="normal"
                :disabled="tableLoading"
                @click="getList(1)"
              >
                {{ $t('domain.common.search') }}
              </datablau-button>
              <datablau-button
                size="mini"
                type="secondary"
                :disabled="tableLoading"
                @click="getList(1, true)"
              >
                {{ $t('domain.common.reset') }}
              </datablau-button>
            </div>
          </template>
        </datablau-list-search>
        <datablau-form-submit :style="{ top: '52px' }">
          <datablau-table
            class="datablau-table"
            height="100%"
            ref="domainTable"
            :data="tableData"
            v-loading="tableLoading"
            @sort-change="changeSort"
            @selection-change="tableSelectionChanged"
            :data-selectable="hasEditAuth && couldEdit"
          >
            <el-table-column width="25px">
              <div style="display: flex; align-items: center">
                <datablau-icon
                  style="flex-shrink: 0"
                  data-type="datastandard"
                  :isIcon="true"
                  :size="18"
                ></datablau-icon>
              </div>
            </el-table-column>
            <el-table-column
              min-width="120px"
              :label="$t('domain.domain.chineseName')"
              prop="chineseName"
              sortable="chineseName"
              show-overflow-tooltip
            >
              <template slot-scope="scope">
                <el-button type="text" @click="openScan(scope.row)">
                  {{ scope.row.chineseName }}
                </el-button>
              </template>
            </el-table-column>
            <el-table-column
              min-width="110px"
              sortable="domainCode"
              :label="$t('domain.domain.domainCode')"
              prop="domainCode"
              show-overflow-tooltip
            ></el-table-column>
            <el-table-column
              :label="$t('domain.common.standardTheme')"
              prop="path"
              :min-width="120"
              show-overflow-tooltip
            >
              <template slot-scope="scope">
                <i
                  class="iconfont icon-file"
                  style="font-size: 14px; color: #409eff"
                ></i>
                &nbsp;
                <!--{{ scope.row.path ? scope.row.path.join('/') : '' }}-->
                {{ (scope.row.path && scope.row.path[1]) || '' }}
              </template>
            </el-table-column>
            <el-table-column
              :label="$version.tableHeader.status"
              prop="state"
              sortable="state"
              :min-width="80"
              show-overflow-tooltip
            >
              <template slot-scope="scope">
                <span :style="`color:${getStatusColor(scope.row.state)}`">
                  <span
                    :style="`background-color:${getStatusColor(
                      scope.row.state
                    )}`"
                    class="circle"
                  ></span>
                  {{ statusFormatter(scope.row.state) }}
                </span>
              </template>
            </el-table-column>
            <el-table-column
              :label="'相似标准检查'"
              prop="checkState"
              :min-width="100"
              show-overflow-tooltip
            >
              <template slot-scope="scope">
                {{ checkStatusFormatter(scope.row.checkState) }}
              </template>
            </el-table-column>

            <!--<el-table-column-->
            <!--  :label="$version.tableHeader.owner"-->
            <!--  prop="submitter"-->
            <!--  sortable="submitter"-->
            <!--  :min-width="90"-->
            <!--  show-overflow-tooltip-->
            <!--&gt;</el-table-column>-->
            <el-table-column
              :label="$version.tableHeader.descriptionDepartment"
              prop="descriptionDepartmentName"
              :min-width="120"
              show-overflow-tooltip
            ></el-table-column>

            <el-table-column
              :label="$version.tableHeader.publishTime"
              width="140"
              column-key="publish"
              sortable="firstPublish"
              prop="firstPublish"
              :formatter="$timeNoSecondFormatter"
              show-overflow-tooltip
            ></el-table-column>
            <el-table-column
              :label="$version.tableHeader.lastModificationTime"
              width="140"
              column-key="last"
              prop="lastModification"
              sortable="lastModification"
              :formatter="$timeNoSecondFormatter"
              show-overflow-tooltip
            ></el-table-column>
            <el-table-column
              :label="$t('domain.common.operation')"
              align="left"
              header-align="center"
              :width="80"
              fixed="right"
            >
              <template slot-scope="scope">
                <datablau-button
                  style="margin: 0 3px"
                  type="icon"
                  @click="openScan(scope.row)"
                >
                  <datablau-tooltip
                    :content="$t('domain.common.check')"
                    placement="top"
                  >
                    <i class="iconfont icon-see"></i>
                  </datablau-tooltip>
                </datablau-button>
              </template>
            </el-table-column>
          </datablau-table>
          <template slot="buttons">
            <div class="left-btn" v-show="selection && selection.length > 0">
              <div style="display: inline-block">
                <datablau-button
                  class="iconfont icon-delete"
                  type="danger"
                  size="mini"
                  @click="toDelete"
                  :disabled="!disabledControl2()"
                  v-if="
                    $auth['DATA_STANDARD_DELETE'] || $auth['ROLE_DOMAIN_DELETE']
                  "
                  :tooltip-content="
                    disabledControl('D')
                      ? $t('domain.domain.deleteTooltip', {
                          type: '',
                        })
                      : ''
                  "
                >
                  {{ $t('common.button.delete') }}
                </datablau-button>
                <datablau-button
                  type="primary"
                  size="mini"
                  @click="toPublish"
                  :disabled="!disabledControl2()"
                  v-if="
                    $auth['DATA_STANDARD_RELEASE'] ||
                    $auth['ROLE_DOMAIN_PUBLISH']
                  "
                  :tooltip-content="
                    disabledControl('D')
                      ? $t('domain.domain.publishTooltip', {
                          type: '',
                        })
                      : ''
                  "
                >
                  {{ $t('domain.common.applyPublish') }}
                </datablau-button>
              </div>
            </div>
            <datablau-pagination
              class="pagination-component"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
              :current-page.sync="currentPage"
              :page-sizes="[20, 50, 100]"
              :page-size="pageSize"
              :pager-count="5"
              layout="total, sizes, prev, pager, next, jumper"
              :total="total"
            ></datablau-pagination>
          </template>
        </datablau-form-submit>
      </div>
    </div>
    <div
      class="detail-content-box"
      v-if="contentStatus === 'scan' || contentStatus === 'write'"
    >
      <div class="top-back-line">
        <datablau-breadcrumb
          style="height: auto; line-height: initial; display: inline-block"
          :node-data="nodeData"
          @back="goBack"
        ></datablau-breadcrumb>
      </div>
      <div class="content-box" style="left: 0; top: 44px">
        <scan
          v-if="contentStatus === 'scan' && nowDomain"
          :domainHasComment="domainHasComment"
          :udps="udps"
          :data="nowDomain"
          :categoryTypeId="parseInt(typeIds)"
          :typeIds="typeIds"
          :labelText="labelText"
          :useDam="true"
          :hideHeader="true"
          :show-update="false"
          @setPath="setPath"
          ref="scandetail"
        ></scan>
      </div>
    </div>
  </div>
</template>

<script>
import AbandonDomain from './AbandonDomain.js'
export default AbandonDomain
</script>

<style lang="scss" scoped>
@import './main.scss';
.abandon-domain-list {
  position: relative;
  height: 100%;
  width: 100%;

  .inline-search-item {
    display: inline-block;
  }

  .search-outer {
    padding: 10px 20px 0 20px;

    /deep/ .datablau-form-box .el-select.is-single {
      width: 100% !important;
    }
    /deep/ .datablau-form-box {
      // min-width: 1000px;
      display: flex;
    }
    /deep/ .datablau-form-box .list-buttons {
      // min-width: 1000px;
      display: flex;
      float: none;
      flex-shrink: 0;
    }
    /deep/ .datablau-form-box .list-search-box {
      // display: flex;
      // flex-wrap: wrap;
      //flex-grow: 1;
      overflow-x: auto;
      margin-right: 0;
      // min-width: 840px;
      overflow-y: hidden;
    }

    /deep/ .datablau-form-box .list-search-box .el-form {
      // flex-grow: 1;
      min-width: 0;
    }

    /deep/ .datablau-form-box .list-search-box .el-form .el-form-item {
      //border: 1px solid red;
      margin-right: 10px;

      .el-form-item__content {
        min-width: auto;
        .el-button-group {
          vertical-align: inherit;
        }
      }
    }

    .more-condition-btn {
      //border: 1px solid red;
      position: absolute;
      top: 18px;
      right: 350px;

      i {
        transform: rotate(180deg);
      }
    }

    .more-fun-btn {
      margin-left: 10px;
    }
  }

  /deep/ .list-title {
    display: none;
  }

  .search-form {
    padding: 10px 0 0 20px;

    &.el-form.el-form--inline /deep/ .el-form-item {
      margin-bottom: 4px;
    }
  }

  /deep/ .form-submit {
    top: 105px;
  }

  /deep/ .row-buttons {
    text-align: left;
  }

  .left-btn {
    position: absolute;
    left: 0;
    height: 100%;
    //width: 600px;
    padding-left: 20px;

    .footer-row-info {
      margin-right: 10px;
    }
  }

  .pagination-component {
    float: right;
    margin-right: 20px;
  }

  .hide-btn {
    visibility: hidden;
  }

  .not-subscribe {
    i.icon-dingyue {
      color: #999;
    }
  }
}
</style>
<style lang="scss">
.standardImport-upload {
  .el-upload-list__item {
    font-size: 12px;
  }
  .el-upload-list {
    display: inline-block;
    vertical-align: middle;
    padding-left: 4px;
  }
  .el-upload-list__item:first-child {
    margin-top: 0;
  }
  .el-upload__tip {
    display: none;
  }
}
</style>
