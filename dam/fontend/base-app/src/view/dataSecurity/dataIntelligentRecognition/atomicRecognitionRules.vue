<template>
  <div class="atomic-recognition-rules-page">
    <datablau-dialog title="导入结果" size="s" :visible.sync="showTip">
      <div class="tip-content">
        <div class="item" v-if="showList.addList.length > 0">
          <div class="title">
            <i class="el-icon-success success-icon"></i>
            新增规则：{{ showList.addList.length }}条
            <div class="copy" v-copy="showList.addList.join('；')">复制</div>
          </div>
          <div class="list">
            <span v-for="(item, index) in showList.addList" :key="index">
              {{ showList.addList.length === index + 1 ? item : item + '，' }}
            </span>
          </div>
        </div>
        <div class="item" v-if="showList.updateList.length > 0">
          <div class="title">
            <i class="el-icon-success same-icon"></i>
            更新规则：{{ showList.updateList.length }}条
            <div class="copy" v-copy="showList.updateList.join('；')">复制</div>
          </div>
          <div class="list">
            <span v-for="(item, index) in showList.updateList" :key="index">
              {{
                showList.updateList.length === index + 1 ? item : item + '，'
              }}
            </span>
          </div>
        </div>
        <div class="item" v-if="showList.failList.length > 0">
          <div class="title">
            <i class="el-icon-success fail-icon"></i>
            失败规则：{{ showList.failList.length }}条
            <div class="copy" v-copy="showList.failList.join('；')">复制</div>
          </div>
          <div class="list">
            <span v-for="(item, index) in showList.failList" :key="index">
              {{ showList.failList.length === index + 1 ? item : item + '，' }}
            </span>
          </div>
        </div>
      </div>
    </datablau-dialog>
    <datablau-dialog
      title="添加目录"
      size="s"
      v-if="dialogVisible"
      :visible.sync="dialogVisible"
    >
      <el-form
        label-width="80px"
        :rules="rules"
        ref="ruleForm"
        :model="ruleForm"
      >
        <el-form-item label="目录名称" prop="name" style="margin-top: 10px">
          <datablau-input
            maxlength="50"
            style="width: 100%"
            v-model.trim="ruleForm.name"
            @keydown.native="nameKeydown"
          ></datablau-input>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <datablau-button type="secondary" @click="dialogVisible = false">
          取消
        </datablau-button>
        <datablau-button type="important" @click="sureName">
          确定
        </datablau-button>
      </span>
    </datablau-dialog>
    <div class="atomic-tree-box">
      <div class="tree-search-box">
        <datablau-input
          class="filter-input"
          v-model="treeKey"
          clearable
          :iconfont-state="true"
          placeholder="检索目录"
        ></datablau-input>
        <el-tooltip
          class="item"
          effect="dark"
          content="添加目录"
          placement="top"
        >
          <i class="iconfont icon-tianjia" @click="addCatalogue"></i>
        </el-tooltip>
      </div>
      <div
        class="tree-title"
        :class="{ 'tree-title-active': isSelect }"
        @click="selectRule"
      >
        <i class="iconfont icon-shuju"></i>
        <span>全部原子识别规则</span>
      </div>
      <div class="tree-line"></div>
      <div class="tree-content">
        <datablau-tree
          v-loading="treeLoading"
          class="el-tree"
          style="position: relative"
          :show-checkbox="false"
          ref="tree"
          :data="treeData"
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
        ></datablau-tree>
      </div>
    </div>
    <div class="resize-column-middle"></div>
    <div class="atomic-right-box">
      <datablau-list-search style="padding: 0 20px">
        <template slot="title">
          <div>原子识别规则</div>
        </template>
        <div>
          <datablau-input
            v-model="keyword"
            v-debounce="search"
            placeholder="请输入规则名称"
            :iconfont-state="true"
            clearable
          ></datablau-input>
        </div>
        <template slot="buttons">
          <datablau-button
            type="secondary"
            class="iconfont icon-export"
            @click="exportRule(true)"
          >
            导出全部
          </datablau-button>
          <el-upload
            style="display: inline-block; margin-left: 10px; margin-right: 10px"
            :action="$url + '/service/discern/upload'"
            :before-upload="handleBeforeUpload"
            :on-success="handleUploadSuccess"
            :on-error="handleUploadError"
            :show-file-list="false"
            accept=".xlsx"
            :headers="$headers"
          >
            <datablau-button
              type="secondary"
              class="icon-ic-quality-import button-icon"
            >
              导入规则
            </datablau-button>
          </el-upload>
          <datablau-button
            class="iconfont icon-tianjia"
            type="important"
            @click="showEdit"
          >
            新建规则
          </datablau-button>
        </template>
      </datablau-list-search>
      <div class="table-box">
        <datablau-form-submit>
          <datablau-table
            v-loading="tableLoading"
            :data="tableData"
            :data-selectable="true"
            @selection-change="tableSelectionChanged"
            ref="table"
            size="small"
            class="datablau-table table"
            style="width: 100%"
            height="100%"
          >
            <el-table-column
              :sortable="true"
              show-overflow-tooltip
              prop="ruleName"
              label="规则名称"
              min-width="150"
            ></el-table-column>
            <el-table-column
              :sortable="true"
              show-overflow-tooltip
              prop="functionName"
              label="引用函数"
              min-width="150"
            ></el-table-column>
            <el-table-column
              :sortable="true"
              show-overflow-tooltip
              prop="ruleDescription"
              label="规则描述"
              min-width="150"
            ></el-table-column>
            <el-table-column
              :sortable="true"
              show-overflow-tooltip
              prop="createTime"
              label="创建时间"
              min-width="150"
              :formatter="$timeFormatter"
            ></el-table-column>
            <el-table-column
              label="操作"
              fixed="right"
              align="center"
              width="150"
            >
              <template slot-scope="scope">
                <datablau-tooltip
                  effect="dark"
                  content="编辑"
                  placement="bottom"
                >
                  <datablau-button
                    type="text"
                    class="iconfont icon-bianji"
                    @click="editRule(scope.row)"
                  ></datablau-button>
                </datablau-tooltip>
                <datablau-tooltip
                  effect="dark"
                  content="删除"
                  placement="bottom"
                >
                  <datablau-button
                    class="iconfont icon-delete"
                    type="text"
                    @click="deleteRule(scope.row)"
                  ></datablau-button>
                </datablau-tooltip>
              </template>
            </el-table-column>
          </datablau-table>
          <template slot="buttons">
            <div class="bottom">
              <span v-show="selections.length > 0" class="footer-row-info">
                当前选中“{{ selections.length }}条”信息，是否
              </span>
              <datablau-button
                class="el-icon-delete"
                type="danger"
                v-show="selections.length > 0"
                @click="mulipleDeleRule"
              >
                删除
              </datablau-button>

              <datablau-button
                v-if="selections.length > 0"
                @click="exportRule(false)"
              >
                导出
              </datablau-button>
              <datablau-pagination
                style="float: right"
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
                :current-page.sync="page"
                :page-sizes="[20, 50, 100, 150]"
                :page-size.sync="size"
                layout="total, sizes, prev, pager, next, jumper"
                :total="total"
                class="page"
              ></datablau-pagination>
            </div>
          </template>
        </datablau-form-submit>
      </div>
    </div>
    <atomic-detail
      :treeData="treeData"
      :ruleId="ruleId"
      :isEdit="isEdit"
      :ruleInfoCatalog="ruleInfoCatalog"
      v-if="showDetail"
      @close="close"
    ></atomic-detail>
  </div>
</template>

<script>
import atomicRecognitionRules from './atomicRecognitionRules'
export default atomicRecognitionRules
</script>

<style lang="scss" scoped>
@import '~@/next/components/basic/color.sass';
$primary-color: #409eff;
.atomic-tree-box {
  position: absolute;
  left: 0;
  width: 280px;
  top: 0;
  bottom: 0;
  border-left: none;
  background-color: var(--default-bgc);
  .tree-search-box {
    padding: 10px;
    height: 34px;
    line-height: 34px;
    box-sizing: content-box;
    position: relative;
    .filter-input {
      padding-right: 47px;
      width: 100%;
      position: relative;
      &:after {
        content: '';
        position: absolute;
        top: 9px;
        right: 30px;
        height: 16px;
        border-left: 1px solid $border-color;
      }
    }
    i {
      position: absolute;
      right: 10px;
      top: 19px;
      cursor: pointer;
    }
  }
  .tree-title {
    height: 34px;
    line-height: 34px;
    padding: 0 20px;
    box-sizing: content-box;
    cursor: pointer;
    &.tree-title-active {
      background: rgba(64, 158, 255, 0.1);
      span {
        color: #409eff;
      }
    }
    i {
      color: #409eff;
    }
    span {
      margin-left: 5px;
    }
  }
  .tree-line {
    height: 1px;
    margin: 10px;
    background: #efefef;
  }
  .tree-content {
    position: absolute;
    top: 108px;
    bottom: 10px;
    left: 0;
    overflow-y: auto;
    width: 100%;
  }
}
.resize-column-middle {
  left: 280px;
  z-index: 8;
}
.atomic-right-box {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 280px;
  border-left: 1px solid var(--border-color-lighter);
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
      padding: 0px 10px;
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
    span {
      // margin-right: 10px;
    }
  }
}
.atomic-recognition-rules-page {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
  background-color: var(--default-bgc);
  .table-box {
    position: absolute;
    top: 84px;
    left: 0;
    bottom: 0px;
    right: 0;
    padding: 0 20px;
  }
}
</style>
