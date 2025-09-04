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
      <!-- <job-history
        dataType="dataSource"
        v-if="showHistory"
      ></job-history> -->
    </el-dialog>
    <el-upload
      style="z-index: -9999; height: 0"
      :action="
        this.$meta_url + '/service/models/' + currentModelId + '/updateMetadata'
      "
      :show-file-list="false"
      :before-upload="showBegain"
      :on-success="handleUpdateMetadataSuccess"
      :headers="$headers"
      :on-error="handleUpdateMetadataError"
    >
      <el-button type="text" size="small" ref="refreshMeta"></el-button>
    </el-upload>
    <datablau-filter-row>
      <el-input
        size="small"
        :placeholder="$t('common.placeholder.normal')"
        v-model="keyword"
        style="width: 300px"
        clearable
        suffix-icon="el-icon-search"
      ></el-input>
      <!-- <el-button
        size="small"
        style="float:right;margin-right:20px;"
        type="primary"
        @click="addDs" ref="addButton">{{$version.dataSource.add}}</el-button> -->
      <!--<el-button size="small" class="green-btn addButton el-btn" @click="handleCreateVirDS">创建虚拟数据源</el-button>-->
      <el-tooltip
        content="仅显示本次添加数据源的记录, 浏览器关闭后清空"
        placement="bottom"
        v-if="hasHistory || $showSimpleJobHistory.dataSource"
        effect="light"
      >
        <i class="el-icon-info" style="float: right; margin: 10px 10px 0 0"></i>
      </el-tooltip>
      <el-button
        icon="fa fa-history"
        style="float: right; margin-right: 10px"
        v-if="hasHistory || $showSimpleJobHistory.dataSource"
        size="small"
        @click="showHistory = true"
      >
        任务记录
      </el-button>
    </datablau-filter-row>
    <div class="table-row">
      <el-table
        class="datablau-table"
        ref="dsTable"
        id="ds-selector"
        v-loading="loadingDS"
        :data="displayData"
        :key="dsDataKey"
        row-key="modelId"
        :expand-row-keys="expandRowKeys"
        height="100%"
        @selection-change="handleSelectionChange"
        @sort-change="handleSortChange"
        @row-click="handleRowClick"
      >
        <el-table-column
          type="selection"
          width="55"
          :selectable="itemSelectable"
        ></el-table-column>
        <el-table-column
          :label="$version.tableHeader.name"
          min-width="180"
          prop="definition"
          show-overflow-tooltip
          sortable="custom"
        ></el-table-column>
        <el-table-column
          :label="$version.tableHeader.type"
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
          :label="$version.tableHeader.system"
          show-overflow-tooltip
          sortable="custom"
        ></el-table-column>
        <el-table-column
          prop="owner"
          :label="$version.tableHeader.responsible"
          min-width="80"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          prop="creationTime"
          :label="$version.tableHeader.createTime"
          min-width="130"
          :formatter="$timeFormatter"
          show-overflow-tooltip
          sortable="custom"
        ></el-table-column>
        <!-- <el-table-column
          type="expand" :width="1" label="">
          <template slot-scope="scope">
            <div style="background:#fafafa;padding:20px 30px 10px 60px;line-height:2.5em;">
              <el-button
                size="small"
                v-if="!isRowFileData(scope.row)"
                @click="handleTest(scope.row,scope.$index)"
                :disabled="isFileItem(scope.row,scope.$index) || scope.row.modelId === 'fake'">
                {{scope.row.type.toUpperCase() === 'SMBSHAREFILE' ? '共享文件夹连接测试' : '数据源连接检测'}}
              </el-button>
              <span  :key="testBtnKey" v-if="!isRowFileData(scope.row)">
                <i v-if="scope.row.isSuccess" style="color:#67C23A;" class="el-icon-success test-result-icon"></i>
                <i v-else-if="scope.row.isError" style="color:#F56C6C" class="el-icon-error test-result-icon"></i>
                <i v-else class="el-icon-error" style="visibility:hidden;"></i>
              </span>

              <div v-if="scope.row.type.toUpperCase() !== 'SMBSHAREFILE'">
                <span
                  style="color:#a0a8b0;min-width:15em;margin-right:2em;display:inline-block;"
                  v-for="(value,key) in scope.row.connectionInfo.parameterMap" :key="key"
                  v-if="parameterMap.hasOwnProperty(key)"
                >
                  {{parameterMap[key] ? parameterMap[key]:key}}: {{value}}
                </span>
              </div>
              <div v-else>
                <span
                  style="color:#a0a8b0;min-width:15em;margin-right:2em;display:inline-block;"
                  v-for="(value,key) in scope.row.connectionInfo.parameterMap" :key="key"
                  v-if="parameterMapForFile.hasOwnProperty(key)"
                >
                  {{parameterMapForFile[key] ? parameterMapForFile[key]:key}}: {{value}}
                </span>
              </div>
            </div>
            <el-tag
              style="margin-right:10px;"
              disable-transitions size="small"
              :key="key"
              v-for="(value,key) in scope.row.connectionInfo.parameterMap">
              <b>{{key}} : </b> {{value}}</el-tag>
          </template>
        </el-table-column> -->
        <!--<el-table-column label="自动更新" :formatter="versionFormat" width="80">-->
        <!--</el-table-column>-->
        <!-- <el-table-column
          :label="$version.tableHeader.operation" width="130" header-align="right" align="right" fixed="right" v-if="showMore">
          <template slot-scope="scope">
            <div class="tool" v-if="scope.row.modelId !== 'fake'">
              <datablau-subscribe
                type-id="80010001"
                :object-name="scope.row.definition"
                :object-id="scope.row.modelId"
                display-type="icon"
              ></datablau-subscribe>
                <el-button
                  type="text"
                  size="small"
                  :title="$t('common.button.edit')"
                  class="btn-in-table"
                  @click="handleEdit(scope.$index, scope.row)">
                  <i class="icon-edit"></i>
                </el-button>
                <el-button
                  type="text"
                  size="small"
                  :title="$version.button.more"
                  class="btn-in-table"
                  @click="callOptionsMenu(scope.row,$event)"
                  :disabled="couldDoMore(scope.row)"
                >
                  <i class="el-icon-more"></i>
                </el-button>
            </div>
            <i v-else class="el-icon-loading"></i>
          </template>
        </el-table-column> -->
      </el-table>
    </div>
    <div class="footer-row">
      <!-- <el-button
         type="danger"
         size="small"
         class="el-icon-delete"
         @click="deleteRow"
         :disabled="deleteDisabled">
        {{$t('common.button.delete')}}</el-button> -->
      <el-pagination
        style="float: left"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page.sync="currentPage"
        :page-sizes="[20, 50, 100]"
        :page-size="pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </div>
  </div>
</template>

<script>
import js from './dataSourceTab.js'
export default js
</script>
<style lang="scss">
#data-source {
  top: 0px;
  #ds-selector table th .el-checkbox {
    display: none;
  }
  .footer-row {
    right: 156px;
  }
}
</style>
