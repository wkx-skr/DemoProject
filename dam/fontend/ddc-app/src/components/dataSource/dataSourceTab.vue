<template>
  <div id="data-source" class="tab-page tabPageAbs">
    <!--<el-dialog
      title="创建虚拟数据源"
      :visible.sync="dialogCrVdsVisible"
      :append-to-body="true"
    >
      <create-virds
        ref="createVirds"
        @handleCreated="handleCreated"
      ></create-virds>
    </el-dialog>-->
    <el-dialog
      title="任务记录"
      :visible.sync="showHistory"
      :append-to-body="true"
      width="1000px"
      class="edit-synonyms-dia"
    >
      <job-history dataType="dataSource" v-if="showHistory"></job-history>
    </el-dialog>
    <datablau-dialog
      :visible.sync="eventVisible"
      :title="$t('meta.dataSource.taskState')"
      size="m"
      append-to-body
    >
      <div class="content">
        <datablau-table
          :data="jobStaData"
          ref="jobStaTable"
          class="datablau-table table"
          height="440px"
          show-overflow-tooltip
          v-loading="loadingData"
          :show-column-selection="false"
          :data-selectable="false"
          :header-cell-style="{
            color: '#494850',
            'font-size': '12px',
            'font-weight': 'bold',
          }"
        >
          <el-table-column
            prop="timestamp"
            :label="$t('meta.dataSource.taskCreateTime')"
            width="160"
            show-overflow-tooltip
            :formatter="$timeFormatter"
          ></el-table-column>
          <el-table-column
            prop="status"
            :label="$t('meta.dataSource.status')"
            min-width="60"
            show-overflow-tooltip
            :formatter="formateJobSta"
          ></el-table-column>
          <el-table-column
            prop="message"
            :label="$t('meta.dataSource.msg')"
            min-width="200"
          ></el-table-column>
        </datablau-table>
      </div>
      <span slot="footer">
        <datablau-button @click="eventVisible = false">
          {{ $t('common.button.close') }}
        </datablau-button>
      </span>
    </datablau-dialog>
    <el-upload
      style="z-index: -9999; height: 0"
      :action="BASE_URL + 'models/' + currentModelId + '/updateMetadata'"
      :show-file-list="false"
      :before-upload="showBegain"
      :on-success="handleUpdateMetadataSuccess"
      :headers="$headers"
      :on-error="handleUpdateMetadataError"
    >
      <datablau-button
        type="text"
        size="small"
        ref="refreshMeta"
      ></datablau-button>
    </el-upload>
    <datablau-filter-row>
      <datablau-input
        :iconfont-state="true"
        :placeholder="$t('meta.dataSource.nameSys')"
        v-model="keyword"
        style="width: 300px; display: inline-block; margin-top: 2px"
        clearable
        test-name="datasource_keyword"
      ></datablau-input>
      <datablau-button
        style="float: right; margin-right: 20px; font-size: 12px"
        class="iconfont icon-tianjia"
        type="primary"
        @click="addDs"
        ref="addButton"
        test-name="add_datasource"
      >
        {{ $t('meta.dataSource.add') }}
      </datablau-button>
      <!--<datablau-button size="small" class="green-btn addButton el-btn" @click="handleCreateVirDS">创建虚拟数据源</datablau-button>-->
      <el-tooltip
        :content="$t('meta.dataSource.onlyThis')"
        placement="bottom"
        v-if="hasHistory || $showSimpleJobHistory.dataSource"
        effect="light"
      >
        <i class="el-icon-info" style="float: right; margin: 10px 10px 0 0"></i>
      </el-tooltip>
      <datablau-button
        icon="fa fa-history"
        style="float: right; margin-right: 10px"
        v-if="hasHistory || $showSimpleJobHistory.dataSource"
        size="small"
        @click="showHistory = true"
      >
        {{ $t('meta.dataSource.taskRecord') }}
      </datablau-button>
    </datablau-filter-row>
    <datablau-form-submit style="margin-top: 44px">
      <datablau-table
        class="datablau-table-info"
        ref="dsTable"
        :data="displayData"
        :key="dsDataKey"
        row-key="modelId"
        :expand-row-keys="expandRowKeys"
        height="100%"
        highlight-current-row
        @selection-change="handleSelectionChange"
        @sort-change="handleSortChange"
        @row-click="handleRowClick"
        :checkDisabledObj="checkDisabledObj"
        :data-selectable="option.selectable"
        :auto-hide-selection="option.autoHideSelectable"
        :show-column-selection="option.showColumnSelection"
        :column-selection="option.columnSelection"
        :border="option.columnResizable"
        test-name="datasource_table"
      >
        <!-- <el-table-column
          type="selection"
          width="55"
          :selectable="itemSelectable"
        ></el-table-column> -->
        <el-table-column type="expand" width="20" label="">
          <template slot-scope="scope">
            <div
              style="
                background: #fafafa;
                padding: 20px 30px 10px 60px;
                line-height: 2.5em;
              "
            >
              <datablau-button
                size="small"
                v-if="!isRowFileData(scope.row)"
                @click="handleTest(scope.row, scope.$index)"
                :disabled="
                  isFileItem(scope.row, scope.$index) ||
                  scope.row.modelId === 'fake'
                "
              >
                {{
                  scope.row.type.toUpperCase() === 'SMBSHAREFILE'
                    ? $t('meta.dataSource.fileCon')
                    : $t('meta.dataSource.dataSourceCon')
                }}
              </datablau-button>
              <span :key="testBtnKey" v-if="!isRowFileData(scope.row)">
                <i
                  v-if="scope.row.isSuccess"
                  style="color: #67c23a"
                  class="el-icon-success test-result-icon"
                ></i>
                <i
                  v-else-if="scope.row.isError"
                  style="color: #f56c6c"
                  class="el-icon-error test-result-icon"
                ></i>
                <i v-else class="el-icon-error" style="visibility: hidden"></i>
              </span>
              <div v-if="scope.row.type.toUpperCase() !== 'SMBSHAREFILE'">
                <span
                  style="
                    color: #a0a8b0;
                    min-width: 15em;
                    margin-right: 2em;
                    display: inline-block;
                  "
                  v-if="scope.row.connectionInfo.connUrl !== null"
                >
                  {{ $t('meta.dataSource.conString') }}：{{
                    scope.row.connectionInfo.connUrl
                  }}
                </span>
                <span
                  style="
                    color: #a0a8b0;
                    min-width: 15em;
                    margin-right: 2em;
                    display: inline-block;
                  "
                  v-for="(value, key) in scope.row.connectionInfo.parameterMap"
                  :key="key"
                  v-if="parameterMap.hasOwnProperty(key) && value !== ''"
                >
                  {{ parameterMap[key] ? parameterMap[key] : key }}: {{ value }}
                </span>
              </div>
              <div v-else>
                <span
                  style="
                    color: #a0a8b0;
                    min-width: 15em;
                    margin-right: 2em;
                    display: inline-block;
                  "
                  v-if="scope.row.connectionInfo.connUrl !== null"
                >
                  {{ $t('meta.dataSource.conString') }}：{{
                    scope.row.connectionInfo.connUrl
                  }}
                </span>
                <span
                  style="
                    color: #a0a8b0;
                    min-width: 15em;
                    margin-right: 2em;
                    display: inline-block;
                  "
                  v-for="(value, key) in scope.row.connectionInfo.parameterMap"
                  :key="key"
                  v-if="parameterMapForFile.hasOwnProperty(key) && value !== ''"
                >
                  {{
                    parameterMapForFile[key] ? parameterMapForFile[key] : key
                  }}: {{ value }}
                </span>
              </div>
            </div>
            <!--<el-tag
              style="margin-right:10px;"
              disable-transitions size="small"
              :key="key"
              v-for="(value,key) in scope.row.connectionInfo.parameterMap">
              <b>{{key}} : </b> {{value}}</el-tag>-->
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('meta.dataSource.name')"
          min-width="180"
          prop="definition"
          show-overflow-tooltip
          sortable="custom"
        ></el-table-column>
        <el-table-column
          :label="$t('meta.dataSource.type')"
          min-width="120"
          show-overflow-tooltip
        >
          <template slot-scope="scope">
            <database-type
              :key="scope.row.type"
              :value="scope.row.type"
              :size="24"
            ></database-type>
          </template>
        </el-table-column>
        <el-table-column
          prop="categoryName"
          min-width="150"
          :label="$t('meta.dataSource.system')"
          show-overflow-tooltip
          sortable="custom"
        ></el-table-column>
        <el-table-column
          prop="owner"
          :label="$t('meta.dataSource.owner')"
          min-width="80"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          prop="creationTime"
          :label="$t('meta.dataSource.createTime')"
          min-width="130"
          :formatter="$timeFormatter"
          show-overflow-tooltip
          sortable="custom"
        ></el-table-column>
        <!--<el-table-column label="自动更新" :formatter="versionFormat" width="80">-->
        <!--</el-table-column>-->
        <el-table-column
          :label="$t('meta.dataSource.operation')"
          width="180"
          header-align="center"
          align="center"
          fixed="right"
          v-if="showMore"
        >
          <template slot-scope="scope">
            <div class="tool" v-if="scope.row.modelId !== 'fake'">
              <datablau-subscribe
                type-id="80010001"
                :object-name="scope.row.definition"
                :object-id="scope.row.modelId"
                display-type="icon"
                class="btn-in-table-info"
              ></datablau-subscribe>
              <datablau-button
                type="icon"
                :title="$t('common.button.edit')"
                class="btn-in-table-info"
                @click="handleEdit(scope.$index, scope.row)"
              >
                <i class="iconfont icon-bianji"></i>
              </datablau-button>
              <datablau-button
                type="icon"
                :title="$t('common.button.more')"
                @click.stop="callOptionsMenu(scope.row, $event, scope.$index)"
                :disabled="couldDoMore(scope.row)"
                class="btn-in-table-info"
              >
                <i class="el-icon-more"></i>
              </datablau-button>
            </div>
            <datablau-progressed
              v-else
              style="width: 80%; margin-left: 10%"
              :percent="scope.row.percent"
            ></datablau-progressed>
          </template>
        </el-table-column>
      </datablau-table>
      <template slot="buttons">
        <div class="left-button" v-show="mutipleLength">
          <span class="check-info"></span>
          <span class="footer-row-info">
            {{
              $t('meta.DS.metaTable.exportTips', { exportNum: mutipleLength })
            }}
          </span>
          <datablau-button
            type="danger"
            size="small"
            class="el-icon-delete"
            @click="deleteRow"
          >
            {{ $t('common.button.delete') }}
          </datablau-button>
        </div>
        <datablau-pagination
          style="float: right; margin-right: 20px"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page.sync="currentPage"
          :page-sizes="[20, 50, 100]"
          :page-size="pageSize"
          layout="total, sizes, prev, jumper, next"
          :total="total"
        ></datablau-pagination>
      </template>
    </datablau-form-submit>
  </div>
</template>

<script>
import js from './dataSourceTab.js'

export default js
</script>
<style lang="scss" scoped>
$primary-color: #409eff;
.table-row {
  padding-left: 20px;
  padding-right: 20px;
  .datablau-table-info {
    height: 100%;
    .btn-in-table-info {
      margin-right: 8px;
    }
  }
}
::v-deep .el-progress__text {
  font-size: 12px !important;
}
.left-button {
  position: absolute;
  top: 50%;
  left: 20px;
  -webkit-transform: translateY(-50%);
  transform: translateY(-50%);
  .check-info {
    display: inline-block;
    width: 14px;
    height: 14px;
    margin-right: -13px;
    vertical-align: middle;
    background: $primary-color;
  }
  .footer-row-info {
    height: 50px;
    margin-right: 10px;
    &::before {
      margin-right: 5px;
      font-family: 'element-icons';
      font-size: 12px;
      font-weight: 200;
      line-height: 13px;
      color: white;
      vertical-align: middle;
      content: '\e6da';
    }
  }
}
</style>
