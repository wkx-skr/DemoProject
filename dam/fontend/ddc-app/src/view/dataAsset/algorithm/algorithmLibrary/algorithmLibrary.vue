<template>
  <div class="algorithm-library-page">
    <!-- 删除结果提示 -->
    <datablau-dialog
      title="提示"
      size="s"
      :visible.sync="showTip"
      v-if="showTip"
    >
      <div class="tip-content">
        <div class="item" v-for="(item, index) in showMap.mapList" :key="index">
          <template>
            <div class="title" v-if="item.type === 'number'">
              <i class="el-icon-success success-icon"></i>
              {{ item.name }}：{{ item.num }}条
            </div>
            <template v-if="item.type === 'array' && item.list.length > 0">
              <div class="title">
                <i class="el-icon-error fail-icon"></i>
                {{ item.name }}：{{ item.list.length }}条
                <span class="span-error-tip">（{{ item.tip }}）</span>
                <div class="copy" v-copy="item.list.join('；')">复制</div>
              </div>
              <div class="list">
                {{ item.list.join(',') }}
              </div>
            </template>
          </template>
        </div>
      </div>
      <span slot="footer">
        <datablau-button type="secondary" @click="showTip = false">
          关闭
        </datablau-button>
      </span>
    </datablau-dialog>
    <!-- 导入算法 -->
    <datablau-dialog
      width="480px"
      append-to-body
      :title="`导入算法`"
      :close-on-click-modal="false"
      :visible.sync="uploadShow"
      v-if="uploadShow"
    >
      <div class="uploadContent">
        <p class="uploadtip">仅支持上传单个文件，支持上传文件格式为：xlsx</p>
        <datablau-button
          style="float: right; margin-right: -25px; line-height: 32px"
          type="text"
          @click="modelDownload"
        >
          下载模板
        </datablau-button>
        <datablau-upload
          :action="'/assets/discern/algorithm/import'"
          :before-upload="beforeUpload"
          :on-error="handleUploadError"
          :on-change="handleChange"
          :before-remove="handleRemove"
          :show-file-list="true"
          accept=".xlsx"
          :headers="$headers"
          ref="algorithmUpload"
          :isEdit="true"
          :auto-upload="false"
          class="standardImport-upload"
          :name="'file'"
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
        <datablau-button type="secondary" @click="uploadShow = false">
          取消
        </datablau-button>
        <datablau-button
          :disabled="fileList.length === 0"
          type="primary"
          @click="uploadSure"
        >
          确定
        </datablau-button>
      </div>
    </datablau-dialog>
    <div class="breadcrumb-box" v-if="newShow">
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
    <template v-if="newShow">
      <detail v-if="isView" :id="algorithmId"></detail>
      <new-algorithm
        v-else
        :isEdit="isEdit"
        :id="algorithmId"
        :currentNode="currentNode"
        :algorithmClick="algorithmClick"
      ></new-algorithm>
    </template>
    <template v-else>
      <div class="tree-box">
        <catalog-tree
          ref="catalogTree"
          from="algorithm"
          :type="'DISCERN_ALGORITHM'"
          :clickTree="clickTree"
        ></catalog-tree>
      </div>
      <div class="resize-column-middle"></div>
      <div class="right-box">
        <template v-if="listShow">
          <datablau-list-search style="padding: 10px 20px 0">
            <datablau-input
              :iconfont-state="true"
              clearable
              v-model="keyword"
              @keyup.native.enter="handleSearch"
              :placeholder="'搜索名称、描述'"
            ></datablau-input>
            <template slot="buttons">
              <datablau-button
                type="important"
                @click="addAlgorithm"
                :tooltip-content="catalogLen === 0 ? '请新建目录' : ''"
                :disabled="
                  catalogLen === 0 || !$auth.DATA_ASSET_DISCERN_ALGORITHM_MANAGE
                "
                class="iconfont icon-tianjia"
              >
                新建
              </datablau-button>
              <el-dropdown
                trigger="click"
                @command="moreHandle"
                class="more-fun-btn"
                style="margin-left: 10px"
                v-if="
                  $auth.DATA_ASSET_DISCERN_ALGORITHM_UPLOAD ||
                  $auth.DATA_ASSET_DISCERN_ALGORITHM_DOWNLOAD
                "
              >
                <datablau-button type="secondary" icon="el-icon-plus">
                  更多
                  <i class="el-icon-arrow-down el-icon--right"></i>
                </datablau-button>
                <el-dropdown-menu class="more-drop-box" slot="dropdown">
                  <el-dropdown-item
                    icon="iconfont icon-import"
                    command="import"
                    v-if="$auth.DATA_ASSET_DISCERN_ALGORITHM_UPLOAD"
                  >
                    导入
                  </el-dropdown-item>
                  <el-dropdown-item
                    icon="iconfont icon-export"
                    command="export"
                    v-if="$auth.DATA_ASSET_DISCERN_ALGORITHM_DOWNLOAD"
                  >
                    导出
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
                  $auth.DATA_ASSET_DISCERN_ALGORITHM_MANAGE ||
                  $auth.DATA_ASSET_DISCERN_ALGORITHM_DOWNLOAD
                "
                :show-column-selection="false"
                height="100%"
                ref="table"
                :reserve-selection="true"
                :row-key="'algorithmId'"
                @selection-change="handleTableChange"
                :data="tableData"
                :default-sort="{ prop: orderBy, order: sort }"
                @sort-change="sortChange"
                row-class-name="row-can-click"
                @row-click="handleView"
              >
                <el-table-column
                  :label="'名称'"
                  prop="algorithmName"
                  :min-width="120"
                  show-overflow-tooltip
                ></el-table-column>
                <el-table-column
                  :label="'识别算法类型'"
                  prop="type"
                  :min-width="120"
                  show-overflow-tooltip
                ></el-table-column>
                <el-table-column
                  :label="'算法库类型'"
                  prop="algorithmLibType"
                  :min-width="100"
                  show-overflow-tooltip
                >
                  <template slot-scope="scope">
                    <span>{{ getType(scope.row.algorithmLibType) }}</span>
                  </template>
                </el-table-column>
                <el-table-column
                  :label="'父级算法名称'"
                  prop="parentName"
                  :min-width="120"
                  show-overflow-tooltip
                >
                  <template slot-scope="scope">
                    {{ scope.row.parentName || '--' }}
                  </template>
                </el-table-column>
                <el-table-column
                  :label="'描述'"
                  prop="algorithmDescription"
                  :min-width="250"
                  show-overflow-tooltip
                >
                  <template slot-scope="scope">
                    {{ scope.row.algorithmDescription || '--' }}
                  </template>
                </el-table-column>
                <el-table-column
                  :label="'创建时间'"
                  sortable="custom"
                  prop="createTime"
                  :min-width="120"
                  :formatter="$timeFormatter"
                  show-overflow-tooltip
                ></el-table-column>
                <el-table-column
                  :label="'操作'"
                  :width="120"
                  align="center"
                  fixed="right"
                  prop="operation"
                >
                  <template slot-scope="scope">
                    <datablau-button
                      :disabled="!$auth.DATA_ASSET_DISCERN_ALGORITHM"
                      :tooltip-content="'查看'"
                      type="icon"
                      class="iconfont icon-see"
                      @click="handleView(scope.row)"
                    ></datablau-button>
                    <datablau-button
                      :disabled="!$auth.DATA_ASSET_DISCERN_ALGORITHM_MANAGE"
                      :tooltip-content="'编辑'"
                      type="icon"
                      class="iconfont icon-bianji"
                      @click="handleEdit(scope.row)"
                    ></datablau-button>
                    <datablau-button
                      :disabled="!$auth.DATA_ASSET_DISCERN_ALGORITHM_MANAGE"
                      :tooltip-content="'删除'"
                      type="icon"
                      class="iconfont icon-delete"
                      @click="handleDel(scope.row)"
                    ></datablau-button>
                  </template>
                </el-table-column>
              </datablau-table>
              <template slot="buttons">
                <div class="bottom">
                  <template v-if="selections.length > 0">
                    <btn-tip :num="selections.length"></btn-tip>
                    <datablau-button
                      type="danger"
                      class="el-icon-delete"
                      @click="handleDelete"
                      :disabled="!$auth.DATA_ASSET_DISCERN_ALGORITHM_MANAGE"
                    >
                      删除
                    </datablau-button>
                    <datablau-button
                      @click="exportAlgorithm(false)"
                      :disabled="!$auth.DATA_ASSET_DISCERN_ALGORITHM_DOWNLOAD"
                    >
                      导出
                    </datablau-button>
                  </template>
                  <datablau-pagination
                    @current-change="handlePageChange"
                    @size-change="handleSizeChange"
                    :current-page.sync="page"
                    :page-sizes="[20, 50, 100, 200]"
                    :page-size="size"
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
    </template>
  </div>
</template>

<script>
import algorithmLibrary from './algorithmLibrary.js'
export default algorithmLibrary
</script>

<style scoped lang="scss">
@import '~@/next/components/basic/color.sass';
.datablau-detail {
  /deep/ .detail-form {
    padding: 0;
  }
}
/deep/ .el-form {
  .el-form-item {
    &:last-child {
      margin-bottom: 0 !important;
    }
  }
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
.algorithm-library-page {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;

  .breadcrumb-box {
    position: absolute;
    top: -38px;
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
  }
  .table-box {
    position: absolute;
    top: 50px;
    left: 0;
    right: 0;
    bottom: 0;

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
