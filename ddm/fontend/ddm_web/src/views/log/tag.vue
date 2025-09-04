<template>
  <div class="content-area">
    <div class="top-header-info-panel-wrapper"><b>{{OperationLog.operationHistory}}</b><i class="el-icon-refresh" @click="refresh"></i></div>
    <div class="top-title">
      <!--<span class="label">名称</span>-->
      <datablau-input
          clearable
          style="width:150px"
          type="text"
          size="small"
          placeholder="搜索模型、目录"
          v-model="modelName"
          :iconfont-state="true"
      ></datablau-input>
      <span class="label">{{ OperationLog.user }}</span>
      <datablau-input
          clearable style="width:100px" type="text" size="small" v-model="userName" placeholder="请输入"
      ></datablau-input>

      <span class="label">{{ OperationLog.dataChannel }}</span>
      <datablau-select
          size="small" style="width: 100px;display:inline-block;" v-model="dataSource" clearable
          placeholder="请输入"
      >
        <el-option
            v-for="item in dataSourceArr"
            :value="item.name"
            :label="item.label"
            :key="item.name"
        ></el-option>
      </datablau-select>
      <span class="label">{{ OperationLog.operationTime }}</span>
      <el-date-picker
          size="small"
          style="width:250px;"
          v-model="date"
          type="daterange"
          align="right"
          unlink-panels
          :range-separator="OperationLog.to"
          :start-placeholder="OperationLog.startDate"
          :end-placeholder="OperationLog.endDate"
          :clearable="false"
          :picker-options="pickerOptions">
      </el-date-picker>
      <div class="search-button">
        <datablau-button type="normal" size="small" @click="search()">{{ OperationLog.query }}</datablau-button>
        <datablau-button type="normal" size="small" @click="reset()">{{ OperationLog.reset }}</datablau-button>
      </div>
      <div class="top-button">

        <datablau-dropdown
            trigger="click"
            @command="handleDownload"
            style="display: inline-block;margin-left: 10px;margin-top: -2px;"
        >
          <datablau-button type="primary" class="iconfont icon-download" size="small">
            下载日志
            <i class="el-icon-arrow-down el-icon--right"></i>
          </datablau-button>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="operation">下载操作日志</el-dropdown-item>
            <el-dropdown-item command="backLog">下载后台日志</el-dropdown-item>
          </el-dropdown-menu>
        </datablau-dropdown>
      </div>
    </div>
    <div class="table-container">
      <datablau-table
        class="datablau-table"
        :data="tableData"
        row-class-name="row-can-click1"
        height="100%"
        @selection-change="handleSelectionChange"
        @sort-change="handleSortChange"
      >
        <!-- <el-table-column
          type="selection"
          width="55">
        </el-table-column> -->
        <el-table-column
          prop="operator"
          :label="OperationLog.user"
          show-overflow-tooltip
          width="150px"
        >
          <template slot-scope="scope">
            <div>
              <datablau-list-icon :dataType="'icon-userlogo'"></datablau-list-icon>
              {{scope.row.operator}}
            </div>
          </template>
        </el-table-column>
        <el-table-column
          prop="callFrom"
          :label="OperationLog.dataChannel"
          show-overflow-tooltip
          width="150px"
        >
        </el-table-column>
        <el-table-column
          prop="modelName"
          label="模型名称"
          min-width="100px"
          :show-overflow-tooltip="true"
        >
          <template slot-scope="scope">
            <!--"width: 140px;white-space: nowrap;text-align: left;ext-overflow: ellipsis;overflow: hidden-->
            <span style="color: #409EFF;cursor: pointer;" v-if="scope.row.modelName" type="text" size="mini" @click="handleClickTab(scope.row)">{{scope.row.modelName}}</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="categoryName"
          label="模型目录"
          show-overflow-tooltip
          min-width="100px"
        >
        </el-table-column>
        <el-table-column
          prop="type"
          :label="OperationLog.userOperation"
          min-width="200px"
        >
          <template slot-scope="scope">
            <span v-if="scope.row.type !== 'UPDATE_CATEGORY_PERMISSION' && scope.row.type !== 'UPDATE_MODEL_PERMISSION'">{{formatterResult(scope.row)}}</span>
            <el-popover
              trigger="hover"
              v-else
              width="300"
              placement="right"
              popper-class="log-tooltip"
            >
              <div>
                <p class="log-item" :key="item.value.join(',') + index" v-for="(item, index) in formatterResultTooltip(scope.row)">
                  <span class="label">{{item.label}}：</span><span class="value">{{item.value.join('，')}}</span> <br>
                </p>
              </div>
              <span style="display:inline-block;" slot="reference">
                {{ formatterResult(scope.row) }}
              </span>
            </el-popover>
          </template>
        </el-table-column>
        <el-table-column
          prop="timestamp"
          :label="OperationLog.operationTime"
          :formatter="$timeFormatter"
          show-overflow-tooltip
          sortable="coutom"
          width="140"
        >
        </el-table-column>
        <!-- <el-table-column
          label="操作"
          :width="100"
        >
          <template slot-scope="scope">
            <el-button type="text" @click="downloadLog(scope.row)">下载</el-button>
            <el-button type="text" @click="deleteLog(scope.row)">删除</el-button>
          </template>
        </el-table-column> -->
      </datablau-table>
    </div>
    <div :class="$isEng ? 'pagination-container engPagination' : 'pagination-container'">
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
    <span style="position:absolute;left: 30px;bottom: 8px;">
      <!--<el-button size="small" type="primary" @click="downloadLogs">{{OperationLog.download}}</el-button>-->
      <!-- <el-button size="small" :disabled="!hasSelection" @click="deleteLogs">批量删除</el-button> -->
    </span>
  </div>
</template>

<script>
import tag from './tag.js'
export default tag
</script>

<style scoped lang="scss">
.content-area {
  left: 0;

  .top-header-info-panel-wrapper {
    position: absolute;
    height: 40px;
    padding: 0;
    top: 0px;
    line-height: 40px;
  }

  .table-container {
    top: 75px;
    bottom: 50px;
  }

}

.top-title {
  position: relative;
  margin-top: 20px;
}

  .top-title .label {
    font-size: 12px;
    margin-right: 10px;
    margin-left: 20px;
  }

  .search-button {
    display: inline-block;
    margin-left: 10px;
  }

  .top-button {
    position: absolute;
    right: 0;
    top: 0;
  }

  /*/deep/ .el-pagination__total {*/
  /*  margin-left: 108px;*/
  /*}*/

  .user-icon {
    display: inline-block;
    margin-right: 8px;
    width: 11px;
    height: 13px;
    background: url('../common/navIcon/user.svg');
    background-size: contain;
    vertical-align: middle;
  }
  /deep/ .el-date-editor .el-range-separator {
    width: auto;
  }
  /deep/ .engPagination{
    left: 33px;
  }
</style>

<style lang="scss">
.log-tooltip {
  //border: 1px solid red;
  .log-item {
    position: relative;
    .label {
      float: left;
      position: absolute;
    }
    .value {
      //padding-left: 6em;
      margin-left: 95px;
      display: inline-block;
    }
  }
}
</style>
