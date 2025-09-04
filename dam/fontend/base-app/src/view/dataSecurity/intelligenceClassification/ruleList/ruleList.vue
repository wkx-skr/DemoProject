<template>
  <div class="rule-list-box">
    <!-- 识别规则导入结果 -->
    <datablau-dialog
      :title="$t('assets.upload.resultTitle')"
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
                {{ item.title }}：{{ item.data.length }}条
                <div class="copy" v-copy="item.data.join('；')">复制</div>
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
    <datablau-dialog
      :title="catalogTitle"
      size="s"
      v-if="catalogVisible"
      :visible.sync="catalogVisible"
    >
      <el-form
        label-width="80px"
        :rules="rules"
        ref="catalogForm"
        :model="catalogForm"
      >
        <el-form-item label="目录名称" prop="name" style="margin-top: 10px">
          <datablau-input
            maxlength="50"
            show-word-limit
            style="width: 100%"
            placeholder="请输入目录名称，避免使用#/\@$_%<>等特殊字符"
            v-model.trim="catalogForm.name"
            @keydown.native="getCatalogName"
          ></datablau-input>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <datablau-button type="secondary" @click="catalogVisible = false">
          取消
        </datablau-button>
        <datablau-button type="important" @click="sureName">
          确定
        </datablau-button>
      </span>
    </datablau-dialog>
    <!-- 导入识别规则 -->
    <datablau-dialog
      :size="'m'"
      :title="`导入识别规则`"
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
          :action="$url + '/service/datasecurity/rule/import'"
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
      :heightCatalog="heightCatalog"
      :discernClick="discernClick"
      :editable="discernEditable"
      :discernId="activeDiscernId"
      :itemInfo="itemInfo"
    ></new-discern>
    <template v-else>
      <div class="tree-box">
        <div class="tree-catalog">
          识别规则管理
          <i
            v-if="$auth.DATA_SECURITY_DISCERN_RULE_MANAGE"
            class="iconfont icon-lue"
            @click="callbottomContent"
          ></i>
        </div>
        <div class="tree-search-box">
          <datablau-input
            style="width: 100%"
            v-model="treeKey"
            :iconfont-state="true"
            clearable
            placeholder="搜索分类名称"
          ></datablau-input>
        </div>
        <div class="tree-content">
          <datablau-tree
            :default-expanded-keys="expandedList"
            @node-expand="handleNodeExpand"
            @node-collapse="handleNodeCollapse"
            :show-overflow-tooltip="true"
            @node-click="handleNodeClick"
            :node-key="nodeKey"
            :props="defaultProps"
            :data="treeData"
            :data-icon-function="dataIconFunction"
            :data-supervise="true"
            :data-options-function="dataOptionsFunction"
            :expand-on-click-node="false"
            :use-default-sort="false"
            ref="tree"
            :filter-node-method="filterNode"
          ></datablau-tree>
        </div>
      </div>
      <div class="resize-column-middle"></div>
      <div class="right-box">
        <template v-if="showTable">
          <datablau-list-search style="padding: 10px 20px 0">
            <datablau-input
              :iconfont-state="true"
              clearable
              v-model="keyword"
              @keyup.native.enter="searchList"
              :placeholder="'搜索规则名称、描述'"
            ></datablau-input>
            <!-- <datablau-button type="normal" @click="searchList">查询</datablau-button> -->
            <template
              slot="buttons"
              v-if="$auth.DATA_SECURITY_DISCERN_RULE_MANAGE"
            >
              <el-dropdown @command="handleCommand">
                <datablau-button
                  v-if="$auth.DATA_SECURITY_DISCERN_RULE_MANAGE"
                  type="important"
                  class="iconfont icon-tianjia"
                >
                  新建规则
                </datablau-button>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item
                    :command="ruleTypeEnum.GENERAL_RULE"
                    icon="iconfont icon-tianjia"
                  >
                    一般规则
                  </el-dropdown-item>
                  <el-dropdown-item
                    icon="iconfont icon-tianjia"
                    :command="ruleTypeEnum.CONSANGUINITY_CASCADE"
                  >
                    血缘级联规则
                  </el-dropdown-item>
                  <el-dropdown-item
                    v-if="hasMachine"
                    icon="iconfont icon-tianjia"
                    :command="ruleTypeEnum.MACHINE_LEARNING"
                  >
                    机器学习规则
                  </el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
            </template>
          </datablau-list-search>
          <div class="table-box">
            <datablau-form-submit>
              <datablau-table
                v-loading="tableLoading"
                :data-selectable="$auth.DATA_SECURITY_DISCERN_RULE_MANAGE"
                :show-column-selection="false"
                height="100%"
                ref="ruleTable"
                @selection-change="handleRuleChange"
                :data="ruleData"
                :default-sort="{ prop: orderBy, order: sort }"
                @sort-change="sortChange"
              >
                <el-table-column
                  :label="'规则名称'"
                  prop="ruleName"
                  :min-width="120"
                  show-overflow-tooltip
                ></el-table-column>
                <el-table-column
                  :label="'规则类型'"
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
                  :label="'描述'"
                  prop="ruleDescription"
                  :min-width="280"
                  show-overflow-tooltip
                ></el-table-column>
                <el-table-column
                  sortable="custom"
                  :label="'创建时间'"
                  prop="createTime"
                  :min-width="140"
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
                      v-if="$auth.DATA_SECURITY_DISCERN_RULE"
                      type="icon"
                      :tooltip-content="'查看'"
                      class="iconfont icon-see"
                      @click="see(scope.row)"
                    ></datablau-button>
                    <datablau-button
                      v-if="$auth.DATA_SECURITY_DISCERN_RULE_MANAGE"
                      type="icon"
                      :tooltip-content="'编辑'"
                      class="iconfont icon-bianji"
                      @click="edit(scope.row)"
                    ></datablau-button>
                    <datablau-button
                      v-if="$auth.DATA_SECURITY_DISCERN_RULE_MANAGE"
                      type="icon"
                      :tooltip-content="'删除'"
                      class="iconfont icon-delete"
                      @click="del(scope.row)"
                    ></datablau-button>
                  </template>
                </el-table-column>
              </datablau-table>
              <template slot="buttons">
                <div class="bottom">
                  <template v-if="ruleSelections.length > 0">
                    <span class="check-info"></span>
                    <span class="footer-row-info">
                      当前选中“{{ ruleSelections.length }}条”信息，是否
                    </span>
                    <datablau-button
                      type="danger"
                      class="el-icon-delete"
                      @click="handleDelete"
                    >
                      删除
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
      </div>
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
    .tree-catalog {
      height: 44px;
      line-height: 24px;
      padding: 10px;
      padding-right: 7px;
      font-size: 14px;
      font-weight: 600;
      i {
        width: 24px;
        height: 24px;
        line-height: 24px;
        text-align: center;
        float: right;
        cursor: pointer;
        border-radius: 2px;
        font-size: 14px;
        &:hover {
          background-color: var(--tree-current-bgc);
          transition: background-color 0.3s;
          color: #409eff;
        }
      }
    }
    .tree-search-box {
      padding: 0 10px 8px;
    }
    .tree-content {
      position: absolute;
      top: 84px;
      bottom: 0;
      left: 0;
      right: 0;
      overflow-y: auto;
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
      top: 54px;
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

      .check-info {
        width: 14px;
        height: 14px;
        display: inline-block;
        background: $primary-color;
        margin-right: -13px;
        vertical-align: middle;
      }

      .footer-row-info {
        height: 50px;
        margin-right: 10px;
        &:before {
          content: '\e6da';
          font-family: 'element-icons';
          font-size: 12px;
          font-weight: 200;
          margin-right: 5px;
          vertical-align: middle;
          line-height: 13px;
          color: white;
        }
      }
      .page {
        float: right;
      }
    }
  }
}
</style>
