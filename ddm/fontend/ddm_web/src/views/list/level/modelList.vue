<template>
  <div class="content-area">
    <datablau-dialog
      title="选择模型"
      :visible.sync="modelDialogVisible"
      size="xl"
      append-to-body
    >
      <div class="model-tree-box" style="height: 500px; overflow: auto">
        <datablau-tree
          ref="levelModelTree"
          :data="modelTreeData"
          :props="modelTreeDefaultProps"
          :filter-node-method="filterModelTreeNode"
          :default-expand-all="false"
          :data-icon-function="modelTreeIconFunction"
          @node-click="handleModelNodeClick"
          @node-expand="getSubNodes"
          node-key="id"
          :expand-on-click-node="true"
          v-loading="loadingTreeData"
        ></datablau-tree>
      </div>
      <div slot="footer" class="dialog-bottom">
        <datablau-button type="primary" @click="handleBindModel" :disabled="!couldSelect">
          确定
        </datablau-button>
        <datablau-button type="secondary" @click="modelDialogVisible = false">
          取消
        </datablau-button>
      </div>
    </datablau-dialog>
    <div class="top-header-info-panel-wrapper">
      <datablau-input
        size="small"
        prefix-icon="el-icon-search"
        v-model="keyword"
        clearable
        :placeholder="$v.tagMgr.placeholder_01"
      ></datablau-input>
      <datablau-button type="primary" size="small" style="float:right;" @click="addModel">添加模型
      </datablau-button>
    </div>
    <datablau-form-submit class="submit-container">
      <div>
        <div class="table-container">
          <datablau-table
            class="datablau-table"
            :data="tableData"
            row-class-name="row-can-click1"
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
            >
              <template slot-scope="scope">
                <Status :type="scope.row.phase" :key="scope.row.id"></Status>
              </template>
            </el-table-column>
            <el-table-column
              prop="lastModifier"
              :label="$store.state.$v.modelList.owner"
            ></el-table-column>
            <el-table-column
              :label="$store.state.$v.modelList.objectCount"
              :width="130"
              prop="objCount"
            >
            </el-table-column>
            <el-table-column
              prop="lastModificationTimestamp"
              :formatter="dateFormatter"
              :min-width="140"
              :label="$store.state.$v.modelList.lastModification"
            ></el-table-column>
            <el-table-column
              label="模型类型"
              :min-width="120"
              prop="modelType"
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
              :label="$v.tagMgr.operation"
              width="100"
            >
              <template slot-scope="scope">
                <!--<div class="edit-model-btn" @click.stop="removeModel(scope.row)">-->
                <!--  <span>解绑</span>-->
                <!--</div>-->
                <datablau-button
                  type="icon"
                  @click="removeModel(scope.row)"
                >
                  <i class="el-icon-delete"></i>
                  <!--<datablau-tooltip content="解绑" placement="top">-->
                  <!--  -->
                  <!--</datablau-tooltip>-->
                </datablau-button>
              </template>
            </el-table-column>
          </datablau-table>
        </div>
      </div>
      <template slot="buttons">
        <div class="pagination-container">
          <datablau-pagination
            layout="total, sizes, prev, pager, next, jumper"
            :total="total"
            :page-size="pageSize"
            :page-sizes="[20, 50, 100]"
            :current-page.sync="currentPage"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          ></datablau-pagination>
        </div>
      </template>
    </datablau-form-submit>

  </div>
</template>

<script>
import tag from './modelList.js'

export default tag
</script>

<style lang="scss" scoped>
.top-title {
  margin-top: 12px;
}

.content-area {
  left: 0;
}

.content-area .table-container {
  top: 15px;
  bottom: 50px;
  //border: 1px solid red;

  .el-icon-edit-outline {
    font-size: 16px;
    margin-right: 18px;
    cursor: pointer;
  }

  .el-icon-delete {
    font-size: 16px;
    cursor: pointer;
  }
}

.fa {
  font-size: 16px;
  color: #4386F5;
}

.top-header-info-panel-wrapper {
  position: absolute;
  left: 260px;
  right: 20px;
  top: 0;
  height: 40px;
}

.submit-container {
  top: 30px;
}
</style>
