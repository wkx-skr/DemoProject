<template>
  <div class="data-report-tab tab-page tab-page-ver2" style="top: 0">
    <datablau-dialog
      :title="$t('meta.DS.udp.udp')"
      :visible.sync="udpDialogVisible"
      :close-on-click-modal="true"
      append-to-body
      width="800px"
      :height="480"
    >
      <set-udp from="report" @closeSetUp="closeUdp"></set-udp>
    </datablau-dialog>
    <datablau-dialog
      :visible.sync="editDialogVisible"
      width="800px"
      height="500px"
      append-to-body
      v-if="editDialogVisible"
      :close-on-click-modal="false"
      :title="$t('meta.report.importTask')"
    >
      <import-task
        v-if="editDialogVisible"
        @close="close"
        @refresh="refreshTreeData"
        :postUrl="postUrl"
        @onError="onError"
        @downloadFile="downloadFile"
        @onSuccess="onSuccess"
        @handleBeforeUpload="handleBeforeUpload"
      ></import-task>
    </datablau-dialog>
    <!--    <datablau-filter-row v-if="false">
      <datablau-input
        v-if="!showTreeReport"
        :placeholder="$t('meta.report.placeholder')"
        v-model="keyword"
        :clearable="true"
        style="width: 300px"
      ></datablau-input>
      <el-tooltip
        effect="light"
        content="根据需求编号、报表编号、名称、类型、负责人、更新频率进行搜索"
        placement="right"
      >
        <i class="el-icon-info search-tooltip" v-if="!showTreeReport"></i>
      </el-tooltip>
      <div class="page-btn-group right-top">
        <div v-if="hasAccess" class="right-top data-demand">
          <el-button size="mini" icon="fa fa-download" @click="downloadFile">
            下载模板
          </el-button>
          <el-button
            size="mini"
            icon="fa fa-sitemap"
            @click="showTreeStyle"
            v-if="!showTreeReport"
          >
            树形显示
          </el-button>
          <el-button
            size="mini"
            icon="fa fa-list-alt"
            @click="showListStyle"
            v-else
          >
            列表显示
          </el-button>
          <el-button
            size="mini"
            class="margin20"
            icon="fa fa-cog"
            @click="showJobMange"
          >
            管理导入任务
          </el-button>
          <el-dropdown>
            <el-button
              size="mini"
              type="primary"
              icon="el-icon-plus"
              class="green-btn el-btn add-demand-btn"
            >
              添加报表
              <i class="el-icon-arrow-down el-icon&#45;&#45;right"></i>
            </el-button>
            <el-dropdown-menu slot="dropdown" class="add-demand-dropdown">
              <el-dropdown-item class="dropdown-item-style">
                <div @click="showAddReportFormManageTab">创建报表</div>
              </el-dropdown-item>
              <el-dropdown-item class="dropdown-item-style">
                <el-upload
                  class="inline-block"
                  :action="postUrl"
                  :before-upload="handleBeforeUpload"
                  :on-error="onError"
                  :on-success="onSuccess"
                  :show-file-list="false"
                  accept=".xlsx"
                  :headers="$headers"
                >
                  <div>导入报表信息</div>
                </el-upload>
              </el-dropdown-item>
              <el-dropdown-item class="dropdown-item-style">
                <div @click="showImportJobSet">连接报表服务器</div>
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </div>
      </div>
    </datablau-filter-row>-->
    <!--    <div class="table-row" v-show="!showTreeReport" ref="tableRow">
      <el-table
        class="el-table datablau-table"
        ref="reportTable"
        :data="tableDataShow"
        :height="tableHeight"
        @selection-change="handleSelectionChange"
        @sort-change="handleSortChange"
        @filter-change="colFilterHandler"
        v-if="showTable"
      >
        <el-table-column width="20"></el-table-column>
        <el-table-column
          type="selection"
          width="55"
          v-if="hasAccess"
        ></el-table-column>
        <el-table-column
          label="报表编号"
          prop="code"
          column-key="code"
          :min-width="70"
          sortable="custom"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          label="报表名称"
          prop="name"
          column-key="name"
          :min-width="100"
          sortable="custom"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          label="报表类型"
          prop="type"
          column-key="type"
          :width="90"
          show-overflow-tooltip
          :formatter="typeFommatter"
          :filters="appTypes"
        ></el-table-column>
        <el-table-column
          label="负责人"
          prop="owner"
          column-key="owner"
          :width="70"
          show-overflow-tooltip
          :filters="ownerFilterArr"
        ></el-table-column>
        <el-table-column
          label="提交日期"
          prop="createTime"
          column-key="createTime"
          :width="110"
          show-overflow-tooltip
          :formatter="$dateFormatter"
          sortable="custom"
        ></el-table-column>
        <el-table-column
          label="更新频率"
          prop="frequency"
          column-key="frequency"
          :width="90"
          :filters="frequencyFilterArr"
        ></el-table-column>
        &lt;!&ndash; <el-table-column label="报表描述" prop="description" :min-width="50"></el-table-column> &ndash;&gt;
        &lt;!&ndash; <el-table-column label="历史数据范围" prop="range" :min-width="50"></el-table-column> &ndash;&gt;
        <el-table-column
          label="操作"
          ref="check"
          header-align="right"
          align="right"
          fixed="right"
          :width="80"
        >
          <template slot-scope="scope">
            <el-button
              type="text"
              @click="editReportForm(scope.row)"
              size="small"
            >
              <span>查看</span>
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>-->
    <!--    <div class="footer-row" v-if="!showTreeReport">
      <el-button
        icon="el-icon-delete"
        v-if="hasAccess"
        type="danger"
        size="small"
        @click="deleteRow"
        :disabled="deleteDisabled"
      >
        删除
      </el-button>
      <el-button
        type="text"
        size="mini"
        style="margin-left: 2em"
        @click="setUdp"
      >
        业务属性
      </el-button>
      <el-pagination
        style="float: right"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page.sync="currentPage"
        :page-sizes="[20, 50, 100]"
        :page-size="pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="totalShow"
      ></el-pagination>
    </div>-->
    <div class="tree-content-box" v-if="showTreeReport">
      <tree-style-report
        ref="reportTree"
        :hasAccess="hasAccess"
        :postUrl="postUrl"
        :appTypes="appTypes"
        @showImportTask="showImportTask"
        @showReportDetail="showReportDetail"
        @downloadFile="downloadFile"
        @showAddReportFormManageTab="showAddReportFormManageTab"
        @showImportJobSet="showImportJobSet"
        @deleteRow="deleteRow"
        @editUdps="setUdp"
      ></tree-style-report>
    </div>
  </div>
</template>

<script>
import reportFormManageTab from './reportFormManageTab.js'

export default reportFormManageTab
</script>
<style lang="scss" scoped>
.data-report-tab {
  .margin20 {
    margin-right: 10px;
  }
  .inline-block {
    display: inline-block;
  }
  .add-demand-btn.green-btn.green-btn {
    height: 28px;
    padding: 0 1em;
  }
  .tree-content-box {
    position: absolute;
    top: 0px;
    left: 0;
    right: 0;
    bottom: 0;
  }
  .filter-row {
    .row-inner {
      min-height: 40px;
    }
  }
}
// 弹出框样式
.el-dialog__wrapper {
  /deep/ .el-dialog {
    position: relative;
    padding-top: 50px;
    padding-bottom: 20px;

    .el-dialog__header {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      box-sizing: border-box;
      height: 50px;
      padding: 20px 20px 0;
      box-sizing: border-box;
      border-bottom: 1px solid #ddd;
      margin-bottom: 10px;

      .el-dialog__headerbtn {
        top: 20px;

        i {
          font-size: 14px;
        }
      }

      .el-dialog__title {
        color: #555;
        font-weight: 500;
      }
    }

    .el-dialog__body {
      overflow: auto;
      margin-top: 10px;
      padding-bottom: 0;

      .form-item-footer {
        bottom: 20px;
        left: 0;
        width: 100%;
        text-align: right;
      }
    }

    .el-dialog__footer {
      padding-bottom: 0;
    }
  }
}
</style>
<style lang="scss">
.data-report-tab {
  .tree-content-box {
    position: absolute;
    top: 0px;
    left: 0;
    right: 0;
    bottom: 0;
    .outer-box {
      // border: 1px solid red;
      .tree-box {
        // border: 1px solid red;
        border-right: 1px solid #ebeef5;
        //top: -60px;
        background-color: #fff;
      }
      .right-box {
        border-left: none;
      }
    }
  }
}
</style>
