<template>
  <div id="interface" class="interface-tab tab-page tab-page-ver2">
    <datablau-filter-row>
      <datablau-input
        style="width: 300px; display: inline-block"
        :placeholder="$t('meta.interface.queryPlaceholder')"
        :iconfont-state="true"
        v-model="keyword"
        :clearable="true"
      ></datablau-input>
      <datablau-tooltip
        :content="$t('meta.interface.queryDesc')"
        placement="right"
      >
        <i class="iconfont icon-tips"></i>
      </datablau-tooltip>
      <div class="page-btn-group right-top">
        <div v-if="hasAccess" class="right-top interface">
          <datablau-button
            type="secondary"
            class="iconfont icon-download"
            @click="downloadMouldFile"
          >
            {{ $t('meta.interface.downloadTemp') }}
          </datablau-button>
          <el-upload
            class="inline-block"
            :action="postUrl"
            :before-upload="handleBeforeUpload"
            :on-error="onUploadError"
            :on-success="onUploadSuccess"
            :show-file-list="false"
            accept=".xlsx"
            :headers="$headers"
          >
            <datablau-button
              type="secondary"
              style="margin-left: 10px; margin-right: 10px"
              class="icon-ic-quality-import button-icon"
            >
              {{ $t('meta.interface.import') }}
            </datablau-button>
          </el-upload>
          <datablau-button
            class="iconfont icon-tianjia"
            @click="showtab({ id: 'add' })"
          >
            {{ $t('meta.interface.add') }}
          </datablau-button>

          <!-- <datablau-button size="mini" class="margin20" icon="el-icon-download" @click="downloadInterfaceFile">导出调用</datablau-button> -->
          <!-- <datablau-dropdown
            style="margin-left: 10px; display: inline-block"
            trigger="click"
          >
            <datablau-button
              type="secondary"
              class="el-icon-plus"
              style="font-size: 12px"
            >
              {{ $t('meta.interface.add') }}
              <i class="el-icon-arrow-down el-icon--right"></i>
            </datablau-button>
            <el-dropdown-menu slot="dropdown" class="add-demand-dropdown">
              <el-dropdown-item class="dropdown-item-style">
                <div @click="showtab({ id: 'add' })">
                  {{ $t('meta.interface.cerate') }}
                </div>
              </el-dropdown-item>
              <el-dropdown-item class="dropdown-item-style">
                <el-upload
                  class="inline-block"
                  :action="postUrl"
                  :before-upload="handleBeforeUpload"
                  :on-error="onUploadError"
                  :on-success="onUploadSuccess"
                  :show-file-list="false"
                  accept=".xlsx"
                  :headers="$headers"
                >
                  <div>{{ $t('meta.interface.import') }}</div>
                </el-upload>
              </el-dropdown-item>
            </el-dropdown-menu>
          </datablau-dropdown> -->
        </div>
      </div>
    </datablau-filter-row>
    <datablau-form-submit style="margin-top: 44px">
      <datablau-table
        :data="tableData"
        class="datablau-table-info"
        height="100%"
        show-overflow-tooltip
        @selection-change="handleSelectionChange"
        @filter-change="filterHandler"
        v-loading="isLoading"
        ref="interfactTable"
        @sort-change="handleSortChange"
        :data-selectable="hasAccess"
        :auto-hide-selection="option.autoHideSelectable"
        :column-selection="option.columnSelection"
      >
        <!-- <el-table-column
          type="selection"
          width="55"
          v-if="hasAccess"
        ></el-table-column>
        <el-table-column width="20" v-else></el-table-column> -->
        <el-table-column width="20">
          <datablau-icon
            :data-type="'modelCategory'"
            :size="18"
            style="margin-top: 8px; margin-left: 3px"
          ></datablau-icon>
        </el-table-column>
        <el-table-column
          :label="$t('meta.interface.callerSystem')"
          prop="callerModelCategoryId"
          column-key="srcModelCategoryIds"
          show-overflow-tooltip
          :formatter="formatterCategory"
          :min-width="150"
          :filters="srcCateArr"
        ></el-table-column>
        <el-table-column
          :label="$t('meta.interface.calleeSystem')"
          prop="calleeModelCategoryId"
          column-key="dstModelCategoryIds"
          show-overflow-tooltip
          :formatter="formatterCategory"
          :min-width="150"
          :filters="dstCateArr"
        ></el-table-column>
        <el-table-column
          :label="$t('meta.interface.dataSource')"
          prop="calleeModelName"
          :min-width="150"
          sortable="custom"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          :label="$t('meta.interface.resource')"
          prop="resourceName"
          :min-width="150"
          sortable="custom"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          :label="$t('meta.interface.callType1')"
          prop="callType"
          :formatter="callTypeFormat"
          sortable="custom"
          :min-width="100"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          :label="$t('meta.interface.featureDesc')"
          prop="description"
          :min-width="150"
          show-overflow-tooltip
        >
          <template slot-scope="scope">
            <span v-if="scope.row.description">
              {{scope.row.description.slice(0, 500)}}<span v-if="scope.row.description.length > 500">...</span>
            </span>
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('meta.interface.filter')"
          prop="filer"
          column-key="filers"
          sortable="custom"
          :min-width="100"
          show-overflow-tooltip
          :filters="filersArr"
        ></el-table-column>
        <el-table-column
          :label="$t('meta.interface.importer')"
          prop="importer"
          column-key="importers"
          sortable="custom"
          :min-width="100"
          show-overflow-tooltip
          :filters="importersArr"
        ></el-table-column>
        <el-table-column
          :label="$t('meta.interface.operation')"
          ref="check"
          header-align="center"
          align="center"
          fixed="right"
          v-if="hasAccess"
          :min-width="100"
        >
          <template slot-scope="scope">
            <span>
              <datablau-button
                type="text"
                @click="editInterface(scope.row)"
                size="small"
              >
                {{ $t('common.button.edit') }}
              </datablau-button>
            </span>
          </template>
        </el-table-column>
      </datablau-table>
      <template slot="buttons">
        <div class="left-button" v-show="selectionLen">
          <span class="check-info"></span>
          <span class="footer-row-info">
            {{ $t('common.deleteMessage', { selection: selectionLen }) }}
          </span>
          <datablau-button
            v-show="selectionLen && hasAccess"
            type="danger"
            @click="deleteRow"
            :disabled="deleteDisabled"
            class="el-icon-delete"
          >
            <!-- <i class="el-icon-delete"></i> -->
            {{ $t('common.button.delete') }}
          </datablau-button>
        </div>
        <datablau-pagination
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
import code from './interfaceTab.js'
export default code
</script>
<style lang="scss" scoped>
$primary-color: #409eff;
$border-color: #dddddd;

/deep/ .el-dropdown {
  &:hover {
    .el-icon--right {
      &:before {
        color: #409eff;
      }
    }
  }
  .el-icon--right {
    &:before {
      color: #555;
    }
  }
}
.tab-page.interface-tab {
  top: 2px;
  .filter-row {
    .row-inner {
    }
    i {
      display: inline-block;
      font-size: 16px;
      margin-left: 10px;
      color: #aaa;
    }
  }
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
  .table-row {
    margin: 0 20px;
    top: 44px;
    /deep/ .el-table {
      &:before {
        background-color: transparent;
      }
    }
    .datablau-table-info {
      // border-bottom: 1px solid $border-color;
    }
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
