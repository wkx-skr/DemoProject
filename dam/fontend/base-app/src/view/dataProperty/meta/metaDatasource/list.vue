<template>
  <div id="data-source" class="tab-page tabPageAbs base-app">
    <el-upload
      style="z-index: -9999; height: 0"
      :action="this.$meta_url + '/models/' + currentModelId + '/updateMetadata'"
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
        :placeholder="$t('meta.dataSource.nameSysRe')"
        v-model="keyword"
        style="width: 300px; display: inline-block; margin-top: 2px"
        clearable
        test-name="datasource_keyword"
      ></datablau-input>
      <!--      <datablau-button
        style="float: right; margin-right: 20px; font-size: 12px"
        class="iconfont icon-tianjia"
        type="primary"
        @click="reMetaData"
        ref="addButton"
        test-name="add_datasource"
      >
        添加数据源
      </datablau-button>-->
      <datablau-dropdown
        trigger="click"
        :hide-on-click="true"
        @command="handleReType"
        style="float: right; margin-right: 20px; font-size: 12px"
      >
        <datablau-button type="primary">
          {{ $t('meta.reManage.addRe') }}
          <i class="el-icon-arrow-down el-icon--right"></i>
        </datablau-button>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item command="datasource">
            {{ $t('meta.reManage.datasource') }}
          </el-dropdown-item>
          <!-- <el-dropdown-item
            command="report"
            v-if="$versionFeature.metadata_Report"
            metadata_File
          >
            {{ $t('meta.reManage.report') }}
          </el-dropdown-item>
          <el-dropdown-item command="file">
            {{ $t('meta.reManage.file') }}
          </el-dropdown-item>
          <el-dropdown-item
            command="shareFile"
            v-if="$versionFeature.metadata_File"
          >
            {{ $t('meta.reManage.shareFile') }}
          </el-dropdown-item> -->
          <el-dropdown-item command="metaModel">元模型</el-dropdown-item>
        </el-dropdown-menu>
      </datablau-dropdown>
      <!--      <el-tooltip
        :content="$t('meta.dataSource.onlyThis')"
        placement="bottom"
        v-if="hasHistory || $showSimpleJobHistory.dataSource"
        effect="light"
      >
        <i class="el-icon-info" style="float: right; margin: 10px 10px 0 0"></i>
      </el-tooltip>-->
      <!--      <datablau-button
        icon="fa fa-history"
        style="float: right; margin-right: 10px"
        v-if="hasHistory || $showSimpleJobHistory.dataSource"
        size="small"
        @click="showHistory = true"
      >
        {{ $t('meta.dataSource.taskRecord') }}
      </datablau-button>-->
    </datablau-filter-row>
    <datablau-form-submit style="margin-top: 44px">
      <datablau-table
        class="datablau-table-info"
        ref="dsTable"
        :data="displayData"
        :key="dsDataKey"
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
        row-key="modelId"
      >
        <el-table-column width="20"></el-table-column>
        <el-table-column
          v-if="appName === 'DDD'"
          :label="$t('meta.dataSource.name')"
          min-width="180"
          prop="definition"
          show-overflow-tooltip
          sortable="custom"
        >
          <template slot-scope="scope">
            <datablau-button type="text" @click.stop="goToMeta(scope.row)">
              {{ scope.row.definition }}
            </datablau-button>
          </template>
        </el-table-column>
        <el-table-column
          v-else
          :label="$t('meta.dataSource.name')"
          min-width="180"
          prop="definition"
          show-overflow-tooltip
          sortable="custom"
        >
          <template slot-scope="scope">
            <span
              type="text"
              :style="{
                'padding-left': scope.row.parentId ? '16px' : 0,
              }"
            >
              {{ scope.row.definition }}
            </span>
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('meta.dataSource.type')"
          min-width="120"
          show-overflow-tooltip
        >
          <template slot-scope="scope">
            <database-type
              :key="scope.row.type"
              :value="scope.row.type || ''"
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
          prop="createUser"
          :label="$t('meta.dataSource.creator')"
          min-width="80"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          prop="owner"
          :label="$t('meta.DS.treeSubOperation.owner')"
          min-width="80"
          show-overflow-tooltip
        >
          <template slot-scope="scope">
            <span>{{ scope.row.owner || '-' }}</span>
          </template>
        </el-table-column>
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
                v-if="scope.row.parentId === null"
                type-id="80010001"
                :object-name="scope.row.definition"
                :object-id="scope.row.modelId"
                display-type="icon"
                class="btn-in-table-info"
              ></datablau-subscribe>
              <datablau-button
                v-if="scope.row.parentId === null"
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
                v-if="
                  appName !== 'DDD' &&
                  (scope.row.parentId || scope.row.children.length === 0) &&
                  (scope.row.metaModelCode ||
                  scope.row.reverseOptions.biType ||
                  scope.row.reverseOptions.FilePath
                    ? true
                    : !!scope.row.schema || !!scope.row.database)
                "
              >
                <i class="el-icon-more"></i>
              </datablau-button>
              <datablau-button
                type="icon"
                :title="$t('common.button.more')"
                @click.stop="callOptionsMenu(scope.row, $event, scope.$index)"
                :disabled="couldDoMore(scope.row)"
                class="btn-in-table-info"
                v-if="appName === 'DDD' && seniorBind"
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
            :class="{ 'el-icon-delete': !loadingDS }"
            @click="deleteRow"
            :disabled="loadingDS"
          >
            <i class="el-icon-loading" v-if="loadingDS"></i>
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
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
        ></datablau-pagination>
      </template>
    </datablau-form-submit>
  </div>
</template>

<script>
import js from './list.js'

export default js
</script>
<style lang="scss" scoped>
$primary-color: #409eff;
#data-source.base-app {
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
}
</style>
