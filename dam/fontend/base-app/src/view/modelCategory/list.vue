<template>
  <div class="tab-page tab-page-ver2">
    <datablau-dialog
      :title="$t('meta.DS.tableDetail.businessProperty')"
      :visible.sync="udpDialogVisible"
      :close-on-click-modal="true"
      width="1000px"
    >
      <set-udp @closeSetUp="closeSetUp" from="modelCategory"></set-udp>
    </datablau-dialog>
    <div
      v-if="pageLocker"
      class="el-message-box__wrapper"
      style="background: #303133; z-index: 2009; opacity: 0.25"
    ></div>
    <datablau-filter-row>
      <div class="row-inner">
        <datablau-input
          clearable
          v-model="keyword"
          style="width: 300px"
          :iconfont-state="true"
          :placeholder="$t('meta.modelCategory.keywordPlaceholder')"
        ></datablau-input>
        <div class="page-btn-group right-top" style="top: 2px">
          <datablau-button
            @click="templateDownload"
            type="secondary"
            class="iconfont icon-download"
            v-if="writable"
          >
            {{ $t('common.button.template') }}
          </datablau-button>
          <el-upload
            style="display: inline-block; margin-left: 10px"
            :action="uploadUrl"
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
              v-if="writable"
            >
              {{ $t('common.button.import') }}
            </datablau-button>
          </el-upload>
          <datablau-button
            @click="exportTable"
            type="secondary"
            class="icon-ic-quality-export"
            style="margin-left: 10px"
            v-show="writable"
          >
            {{ $t('common.button.export') }}
          </datablau-button>
          <!-- <datablau-button class="el-icon-refresh" size="mini" @click="reload">
            {{ $version.button.refresh }}
          </datablau-button> -->
          <datablau-button
            @click="setUdp"
            class="iconfont icon-expand"
            type="secondary"
          >
            {{ $t('meta.DS.tableDetail.businessProperty') }}
          </datablau-button>
          <datablau-button
            class="iconfont icon-tianjia"
            @click="add"
            v-if="writable"
          >
            {{ $t('meta.modelCategory.add') }}
          </datablau-button>
        </div>
      </div>
    </datablau-filter-row>
    <datablau-form-submit style="margin-top: 44px">
      <datablau-table
        :data="categoriesDisplay"
        class="datablau-tableinfo"
        ref="multipleTable"
        height="100%"
        :key="tableKey"
        v-loading="pageLocker"
        @selection-change="handleSelectionChange"
        @sort-change="handleSortChange"
      >
        <!-- <el-table-column
          type="selection"
          v-if="writable && false"
        ></el-table-column>
        <el-table-column width="20" v-else></el-table-column> -->
        <el-table-column width="28">
          <datablau-icon
            :data-type="'modelCategory'"
            :size="18"
            style="margin-top: 8px; margin-left: 5px"
          ></datablau-icon>
        </el-table-column>
        <el-table-column
          :min-width="180"
          prop="categoryName"
          :label="$t('meta.modelCategory.categoryName')"
          sortable="custom"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          :min-width="150"
          prop="categoryAbbreviation"
          :label="$t('meta.modelCategory.categoryAbbreviation')"
          sortable="custom"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          :min-width="$i18n.local === 'zh' ? 120 : 140"
          prop="itDepartmentName"
          :label="$t('meta.modelCategory.itDepartment')"
          sortable="custom"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          :min-width="$i18n.local === 'zh' ? 120 : 170"
          prop="businessDepartmentName"
          :label="$t('meta.modelCategory.businessDepartment')"
          sortable="custom"
          show-overflow-tooltip
        >
          <template slot-scope="scope">
            {{ scope.row.businessDepartmentName }}
          </template>
        </el-table-column>

        <el-table-column
          :min-width="120"
          prop="zone"
          :label="$t('meta.modelCategory.zone')"
          sortable="custom"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          prop="importance"
          :label="$t('meta.modelCategory.importance')"
          :formatter="importanceFormatter"
          :min-width="120"
          sortable="custom"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          prop="dataSourceCount"
          :label="$t('meta.modelCategory.modelMount')"
          sortable="custom"
          show-overflow-tooltip
          :min-width="120"
        ></el-table-column>
        <!-- <el-table-column
          prop="status"
          :label="$version.modelCategory.systemStatus"
          sortable="custom"
          show-overflow-tooltip
        >
          <template slot-scope="scope">
            <span>{{ scope.row.status === '1' ? '在线' : '下线' }}</span>
          </template>
        </el-table-column> -->
        <el-table-column
          :label="$t('meta.modelCategory.operation')"
          align="center"
          :min-width="120"
          fixed="right"
        >
          <template slot-scope="scope">
            <datablau-button
              class="operation-text-btn"
              type="text"
              v-if="writable || scope.row.isSelf"
              @click="handleEdit(scope.$index, true)"
            >
              {{ $t('common.button.edit') }}
            </datablau-button>
            <datablau-button
              class="operation-text-btn"
              type="text"
              v-else
              @click="handleEdit(scope.$index)"
            >
              {{ $t('common.button.scan') }}
            </datablau-button>
            <datablau-button
              class="operation-text-btn"
              type="text"
              v-if="writable"
              @click="deleteSystem(scope, true)"
            >
              {{ $t('common.button.delete') }}
            </datablau-button>
          </template>
        </el-table-column>
      </datablau-table>
      <template slot="buttons">
        <datablau-pagination
          style="float: right"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="currentPage"
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
import list from './list'
export default list
</script>
<style lang="scss" scoped>
.footer-row {
  z-index: 5;
  height: 50px;
  bottom: 0;
  left: 0;
  right: 0;
  border-top: 1px solid var(--border-color-lighter);
  box-shadow: 0 -5px 14px -8px rgba(0, 0, 0, 0.2);
  padding-right: 20px;
  /deep/ .datablau-pagination {
    margin-top: 8px;
  }
}
.row-inner {
  padding-top: 2px;
}
.tab-page {
  .table-row {
    margin: 0 20px;
    top: 44px;

    /deep/ .el-table {
      &:before {
        background-color: transparent;
      }
    }
    .datablau-tableinfo {
      height: 100%;
    }
  }
}
</style>
