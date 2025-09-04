<template>
  <div id="model-library" v-loading.fullscreen.lock="wholeLoading">
    <datablau-dialog
      :visible.sync="editCategoryShow"
      :title="dialogTitle"
      size="xl"
      append-to-body
    >
      <div class="content seeDetail">
        <datablau-form :model="currentCategory" ref="demoForm" :rules="categoryRules" label-width="70px">
          <el-form-item label="上级目录" prop="parentName">
            <datablau-input
              v-model="currentCategory.parentName"
              show-word-limit
              readonly
              maxlength="40"
            ></datablau-input>
          </el-form-item>
          <el-form-item label="目录名称" prop="name">
            <datablau-input
              v-model="currentCategory.name"
              show-word-limit
              maxlength="40"
            ></datablau-input>
          </el-form-item>
          <el-form-item label="目录别名" prop="alias">
            <datablau-input
              v-model="currentCategory.alias"
              show-word-limit
              maxlength="40"
            ></datablau-input>
          </el-form-item>
          <el-form-item label="描述" prop="description">
            <datablau-input
              v-model="currentCategory.description"
              type="textarea"
            ></datablau-input>
          </el-form-item>

        </datablau-form>
      </div>
      <span slot="footer">
        <datablau-button type="primary" @click="handleEditSave">
          保存
        </datablau-button>
        <datablau-button type="secondary" @click="handleEditClose">
          关闭
        </datablau-button>
      </span>
    </datablau-dialog>
    <datablau-dialog
      :visible.sync="chooseModelDialog"
      title="选择模型"
      size="xl"
      append-to-body
    >
      <div class="model-tree-content" style="height: 500px; overflow: auto;">
        <el-input
          v-model="keywordModelSelect"
          :placeholder="$store.state.$v.common.placeholder"
          size="small"
          prefix-icon="el-icon-search"
        ></el-input>
        <div class="model-tree-box">
          <!--:render-content="renderContent"-->
          <!--v-loading="!treeDataLoaded"-->
          <datablau-tree
            ref="modelSelectTree"
            :data="modelTreeData"
            :props="modelTreeDefaultProps"
            :filter-node-method="filterModelTreeNode"
            :default-expand-all="false"
            :data-icon-function="modelTreeIconFunction"
            @node-click="handleModelNodeClick"
            :expand-on-click-node="true"
            node-key="id"
          ></datablau-tree>
        </div>
      </div>
      <span slot="footer">
        <datablau-button type="primary" @click="handleBindModel" :disabled="!couldSelect">
          确定
        </datablau-button>
        <datablau-button type="secondary" @click="chooseModelDialog = false">
          取消
        </datablau-button>
      </span>
    </datablau-dialog>
    <el-upload
      style="display:none;"
      :action="$uploadUrlFormatter(uploadUrl)"
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
    </el-upload>
    <div class="tree-area">
      <el-input
        v-model="keyword"
        :placeholder="$store.state.$v.common.placeholder"
        size="small"
        clearable
        prefix-icon="el-icon-search"
      ></el-input>
      <div class="tree-box">
        <datablau-tree
          ref="modelTree"
          :data="treeData"
          v-loading="!treeDataLoaded"
          :props="defaultProps"
          :use-default-sort="false"
          :filter-node-method="filterNode"
          @node-click="handleNodeClick"
          :default-expand-all="false"
          :default-expanded-keys="defaultkey"
          :data-icon-function="dataIconFunction"
          :expand-on-click-node="true"
          :data-supervise="true"
          :data-options-function="dataOptionsFunction"
          node-key="id"
        ></datablau-tree>
      </div>
    </div>
    <div class="resize-column-middle"
    ></div>
    <div v-loading="contentLoading" class="content-area">
      <div class="top-header-info-panel-wrapper">
        <b>{{ currentPath }}</b>
        <i class="el-icon-refresh" @click="refresh"></i>
        <el-input
          prefix-icon="el-icon-search"
          size="small"
          v-model="modelKeyword"
          :placeholder="$store.state.$v.common.placeholder"
          clearable
        ></el-input>
      </div>
      <div class="table-container">
        <el-table
          class="datablau-table"
          :data="tableData"
          row-class-name="row-can-click"
          @row-click="handleRowClick"
          @sort-change="handleSortChange"
          height="100%">
          <el-table-column width="24">
            <template>
              <i class="tree-icon model"></i>
            </template>
          </el-table-column>
          <el-table-column
            prop="name"
            :label="$store.state.$v.modelList.modelName"
            :min-width="130"
            show-overflow-tooltip
            sortable="custom"
          >
            <template slot-scope="scope">
              <b>{{ scope.row.name }}</b>
            </template>
          </el-table-column>
          <el-table-column
            :label="$store.state.$v.modelList.branch"
            prop="name"
          >
            <template slot-scope="scope">
              <span v-if="scope.row.branch">{{ scope.row.name }}</span>
              <span v-else>master</span>
            </template>
          </el-table-column>
          <el-table-column
            :label="$store.state.$v.modelList.modelStatus"
            header-align="center"
            align="center"
            :min-width="100"
            prop="phase"
            sortable="custom"
          >
            <template slot-scope="scope">
              <Status :type="scope.row.phase" :key="scope.row.id"></Status>
            </template>
          </el-table-column>
          <el-table-column
            prop="lastModifier"
            :label="$store.state.$v.modelList.owner"
            sortable="custom"
          ></el-table-column>
          <el-table-column
            :label="$store.state.$v.modelList.objectCount"
            :width="130"
            prop="objCount"
            sortable="custom"
          >
          </el-table-column>
          <el-table-column
            prop="lastModificationTimestamp"
            :formatter="dateFormatter"
            :min-width="140"
            sortable="custom"
            :label="$store.state.$v.modelList.lastModification"
          ></el-table-column>
          <el-table-column
            label="模型类型"
            :min-width="120"
            prop="modelType"
            sortable="custom"
          >
            <template slot-scope="scope">
              <Database-Type
                :key="scope.row.modelType"
                :value="scope.row.modelType"
                :size="24"
              ></Database-Type>
            </template>
          </el-table-column>
          <el-table-column
            prop="description"
            :label="$store.state.$v.modelList.description"
            :min-width="140"
            show-overflow-tooltip
          ></el-table-column>
          <el-table-column
            label="操作"
            :min-width="150"
          >
            <template slot-scope="scope">
              <div class="edit-model-btn" @click.stop="removeModel(scope)">
                <span>解绑</span>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div class="pagination-container">
        <el-pagination
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          :page-size="pageSize"
          :page-sizes="[20, 50, 100]"
          :current-page.sync="currentPage"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        ></el-pagination>
      </div>
    </div>
    <model-detail
      class="full-area"
      v-if="currentModel"
      :current-model="currentModel"
      :current-path="currentPath"
      :model-path="modelPath"
      :model-level="currentModelLevel"
    ></model-detail>
    <el-dialog
      title="编辑模型信息"
      :visible.sync="showEditModelInfo"
      width="30%"
    >
      <el-form :model="currentModelInfo" ref="modelInfoForm" :rules="modelRules" label-width="80px" :inline="false"
               size="mini">
        <el-form-item label="模型名称" prop="name">
          <el-input v-model="currentModelInfo.name" placeholder="输入模型名称" clearable></el-input>
        </el-form-item>
        <el-form-item label="模型描述">
          <el-input v-model="currentModelInfo.description" type="textarea" placeholder="输入模型描述" clearable></el-input>
        </el-form-item>
      </el-form>

      <span slot="footer">
        <el-button size="mini" @click="showEditModelInfo = false">取消</el-button>
        <el-button size="mini" type="primary" @click="beforeSave">确定</el-button>
      </span>
    </el-dialog>

    <el-dialog
      :close-on-click-modal='false'
      :visible.sync="showAddModel"
      width="1040px"
      custom-class="create-model-dialog"
      :modal-append-to-body="false"
      @close="cancelForm">
      <div class="dialog-head" slot="title">
        新建模型
      </div>
      <el-form style="position: relative;left: -25px;padding-top: 10px;" :model="addModelForm" ref="addModelForm"
               :rules="addModelFormRules" label-width="80px" :inline="false" size="normal">
        <el-form-item label="模型名称" prop="name" size="mini">
          <el-input maxlength="40" id="limit-paste" style="max-width:178px" v-model="addModelForm.name"></el-input>
        </el-form-item>
      </el-form>
      <div class="db-logo-container">
        <div class="disc">1、逻辑数据模型</div>
        <div v-for="item in logicalModel" :key='item' class="db-logo-box" @click="addModelForm.type = item">
          <img :src="`/static/image/DBlogos/${item}.png`">
          <div class="db-name">
            {{ item }}
          </div>
          <transition name="el-zoom-in-center">
            <div class="selected-db" v-show="item === addModelForm.type">
              <img src="/static/image/DBlogos/correct.svg">
            </div>
          </transition>
        </div>
      </div>
      <div class="db-logo-container">
        <div class="disc">2、分析型数据模型</div>
        <div v-for="item in sqlModels" :key='item' class="db-logo-box" @click="addModelForm.type = item">
          <img :src="item !== 'GaussDB/A' ? `/static/image/DBlogos/${item}.png` : '/static/image/DBlogos/GaussDBA.png'">
          <div class="db-name">
            {{ item }}
          </div>
          <transition name="el-zoom-in-center">
            <div class="selected-db" v-show="item === addModelForm.type">
              <img src="/static/image/DBlogos/correct.svg">
            </div>
          </transition>
        </div>
      </div>
      <div class="db-logo-container" style="padding-bottom: 20px;">
        <div class="disc">3、NoSQL数据模型</div>
        <div v-for="item in noSqlModels" :key='item' class="db-logo-box" @click="addModelForm.type = item">
          <img :src="`/static/image/DBlogos/${item}.png`">
          <div class="db-name">
            {{ item }}
          </div>
          <transition name="el-zoom-in-center">
            <div class="selected-db" v-show="item === addModelForm.type">
              <img src="/static/image/DBlogos/correct.svg">
            </div>
          </transition>
        </div>
      </div>
      <span slot="footer">
        <el-button style="width: 64px;height: 34px" @click="cancelForm" size='mini'>取消</el-button>
        <el-button :disabled="addModelForm.type === ''" style="width: 64px;height: 34px;padding: 7px 15px;"
                   type="primary" @click="submitForm('addModelForm')" size='mini'>确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import list from './modelLevel.js'

export default list
</script>

<style scoped lang="scss">
.table-container {
  top: 60px;
}

.content-area {
  overflow: hidden;
}

.top-title {
  margin-bottom: 10px;
  vertical-align: middle;
  white-space: nowrap;
  color: #20293B;
  font-size: 16px;

  .more-action {
    float: right;
  }
}

.tree-box {
  position: absolute;
  top: 65px;
  right: 0;
  padding-right: 2px;
  left: -12px;
  bottom: 20px;
  overflow: auto;
}

.form-label {
  margin-left: 1em;
  margin-right: .5em;
}

.bold {
  background: pink;
}

.add-model-box {
  margin-top: 10px;
}

.edit-model-btn {
  box-sizing: border-box;
  padding: 7px 10px;
  border: 1px solid #539FFD;
  font-size: 12px;
  line-height: 1;
  color: #539FFD;
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
</style>
<style lang="scss">
#model-library {
  .el-table th > .cell {
    height: 34px;
    line-height: 34px;
  }
}

.grey-tree .tree-item-outer {
  width: 100%;
}

.create-model-dialog {
  .dialog-head {
    font-size: 16px;
    font-weight: 500;
    color: #409EFF;
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
</style>
