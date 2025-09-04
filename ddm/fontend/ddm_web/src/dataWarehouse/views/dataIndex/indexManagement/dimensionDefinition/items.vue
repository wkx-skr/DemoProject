<template>
  <div style="margin-right: 20px">
    <el-upload
      style="z-index: -9999; height: 0"
      :action="$uploadUrlFormatter(this.$domains + 'dimension/import')"
      :show-file-list="false"
      :on-success="onUploadSuccess"
      :headers="$headers"
      :on-error="onUploadError"
      accept=".xlsx"
    >
      <el-button type="text" size="small" ref="uploadBtn"></el-button>
    </el-upload>
    <datablau-dialog
      :title="$t('assets.common.extendAttr')"
      :visible.sync="showUdps"
      :close-on-click-modal="true"
      append-to-body
      size="xl"
    >
      <set-udp
        @closeSetUp="closeSetUp"
        :type-id="String(LDMTypes.DataDimension)"
      ></set-udp>
    </datablau-dialog>
    <datablau-list-search style="padding: 10px 0 0 0">
      <datablau-input
        v-model="keyword"
        iconfont-state
        style="display: inline-block; width: 252px"
        clearable
        :placeholder="$t('indicator.dimension.searchPlaceholder')"
        @keydown.enter.native="changePage"
        @clear="changePage"
      ></datablau-input>
      <datablau-button
        type="primary"
        @click="changePage"
        style="margin-left: 10px"
      >
        {{ $t('quality.page.ruleReport.query') }}
      </datablau-button>
      <template slot="buttons">
        <el-dropdown
          style="float: right; vertical-align: top; margin-left: 10px"
          @command="handleCommand"
          trigger="click"
        >
          <datablau-button type="secondary" class="">
            {{ $t('quality.page.ruleTemplate.moreOperation') }}
            <i class="el-icon-arrow-down el-icon--right"></i>
          </datablau-button>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item
              command="showUdpDialog"
              icon="iconfont icon-expand"
            >
              {{ $t('indicator.dimension.udp') }}
            </el-dropdown-item>
            <el-dropdown-item command="importIndex" icon="iconfont icon-import">
              {{ $t('quality.page.ruleTemplate.button.import') }}
            </el-dropdown-item>
            <el-dropdown-item command="exportIndex" icon="iconfont icon-export">
              {{ $t('quality.page.qualityRule.index.exportCurrent') }}
            </el-dropdown-item>
            <el-dropdown-item
              command="downloadTemplate"
              icon="iconfont icon-download"
            >
              {{ $t('system.systemSetting.downloadTemplate') }}
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
        <!--<datablau-button
            style="float: right;"
            icon="el-icon-editd"
            class="iconfont icon-expand"
            @click="showUdps = true"
          >
            扩展属性
          </datablau-button>-->
        <datablau-button
          type="important"
          class="iconfont icon-tianjia"
          style="float: right"
          @click="addDimension"
        >
          {{ $t('indicator.dimension.addDimension') }}
        </datablau-button>
      </template>
    </datablau-list-search>
    <div class="table-area" :class="{ show: showMoreFilters }">
      <datablau-table
        :data="tableData"
        height="100%"
        data-selectable
        @selection-change="handleSelectionChange"
        @sort-change="handleSortChange"
      >
        <el-table-column
          min-width="120"
          :label="$t('indicator.dimension.alias')"
          prop="dimensionName"
          sortable="custom"
          show-overflow-tooltip
        >
          <template slot-scope="scope">
            {{ scope.row.dimensionName }}
          </template>
        </el-table-column>
        <el-table-column
          min-width="120"
          :label="$t('indicator.dimension.name')"
          sortable="custom"
          prop="englishName"
          show-overflow-tooltip
        >
          <template slot-scope="scope">
            {{ scope.row.englishName }}
          </template>
        </el-table-column>
        <el-table-column
          min-width="140"
          :label="$t('meta.common.sourceType.dimLevel')"
          prop="hierarchy"
          show-overflow-tooltip
        >
          <template slot-scope="scope">
            {{ scope.row.hierarchy ? scope.row.hierarchyWay : '' }}
          </template>
        </el-table-column>
        <el-table-column
          min-width="120"
          :label="$t('indicator.dimension.state')"
          sortable="custom"
          prop="stauts"
          show-overflow-tooltip
        >
          <template slot-scope="scope">
            <span
              :style="`color:${getStatusColor(scope.row.stauts)}`"
              v-if="scope.row.stauts || scope.row.stauts == 0"
            >
              <span
                :style="`background-color:${getStatusColor(scope.row.stauts)}`"
                class="circle"
              ></span>
              {{ statusFormatter(scope.row.stauts) }}
            </span>
            <span v-else></span>
          </template>
        </el-table-column>
        <el-table-column
          min-width="120"
          :label="$t('system.systemSetting.dir')"
          prop="category"
          show-overflow-tooltip
        >
          <template slot-scope="scope">
            {{ scope.row.category }}
          </template>
        </el-table-column>
        <el-table-column
          min-width="120"
          :label="$t('indicator.dimension.updateDate')"
          prop="updateTime"
          sortable="custom"
          show-overflow-tooltip
        >
          <template slot-scope="scope">
            {{
              scope.row.updateTime
                ? $timeFormatter(scope.row.updateTime).slice(0, 10)
                : ''
            }}
          </template>
        </el-table-column>
        <el-table-column
          min-width="120"
          :label="$t('meta.DS.tableDetail.knowledgeGraph.edges.techLeader')"
          prop="technicalLeader"
          show-overflow-tooltip
        >
          <template slot-scope="scope">
            {{ scope.row.technicalLeader }}
          </template>
        </el-table-column>
        <el-table-column
          min-width="120"
          :label="$t('meta.DS.tableDetail.knowledgeGraph.edges.busiLeader')"
          prop="businessLeader"
          show-overflow-tooltip
        >
          <template slot-scope="scope">
            {{ scope.row.businessLeader }}
          </template>
        </el-table-column>
        <el-table-column
          min-width="140"
          :label="$t('indicator.demand.taskProps.managementLeader')"
          prop="managementLeader"
          show-overflow-tooltip
        >
          <template slot-scope="scope">
            {{ scope.row.managementLeader }}
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('quality.page.dataQualityRepairJob.documents.operation')"
          min-width="120"
          fixed="right"
          align="center"
        >
          <template slot-scope="scope">
            <datablau-button type="icon" @click="handleItemClick(scope.row)">
              <datablau-tooltip
                :content="$t('common.button.scan')"
                placement="bottom"
              >
                <i class="iconfont icon-see"></i>
              </datablau-tooltip>
            </datablau-button>
            <datablau-button type="icon" @click="EditClick(scope.row)">
              <datablau-tooltip
                :content="$t('common.button.edit')"
                placement="bottom"
              >
                <i class="iconfont icon-bianji"></i>
              </datablau-tooltip>
            </datablau-button>
            <datablau-button type="icon" @click="DeleteClick(scope.row)">
              <datablau-tooltip
                :content="$t('common.button.delete')"
                placement="bottom"
              >
                <i class="iconfont icon-delete"></i>
              </datablau-tooltip>
            </datablau-button>
          </template>
        </el-table-column>
      </datablau-table>
    </div>
    <div class="row-page-info">
      <span v-if="multipleLength" class="check-info"></span>
      <span v-if="multipleLength" class="footer-row-info">
        {{
          $t('common.deleteMessage', {
            selection: multipleLength,
          })
        }}
      </span>
      <!-- <datablau-button type="primary" v-show="multipleLength">
        <i class="iconfont icon-daochu"></i>
        导出
      </datablau-button> -->
      <datablau-button
        type="danger"
        v-show="multipleLength"
        @click="DeleteClick"
      >
        <i class="iconfont icon-shanchu"></i>
        {{ $t('common.button.delete') }}
      </datablau-button>
      <datablau-pagination
        style="padding-top: 10px; float: right"
        class="ddc-pagination"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="currentPage"
        :page-sizes="[20, 50, 100]"
        :page-size="pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="totalItems"
      ></datablau-pagination>
    </div>
  </div>
</template>
<script>
import items from './items'
export default items
</script>
<style lang="scss" scoped>
@import '~@/next/components/basic/color.sass';
.row-filter {
  margin-top: 10px;
  vertical-align: middle;
  .label {
    margin: 0 10px 0 20px;
    &:first-of-type {
      margin-left: 0;
    }
  }
  &.full {
    .label:first-of-type {
      margin-left: 20px;
    }
  }
}
.table-area {
  position: absolute;
  bottom: 50px;
  left: 20px;
  right: 20px;
  top: 50px;
  transition: top 0.5s ease-in-out;
  &.show {
    top: 100px;
  }
  .db-table {
    height: 100%;
  }
}
.row-page-info {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 30px;
  height: 50px;
  padding-left: 26px;
  margin-right: -20px;
  padding-right: 40px;
  margin-left: -30px;
  overflow-x: visible;
  overflow-y: hidden;
  line-height: 50px;
  border-top: 1px solid var(--border-color-lighter);
  box-shadow: 0 -5px 14px -8px rgba(0, 0, 0, 0.2);
  .check-info {
    display: inline-block;
    width: 14px;
    height: 14px;
    vertical-align: middle;
    background: $primary-color;
  }
  .footer-row-info {
    margin-right: 10px;
    &::before {
      margin-right: 5px;
      margin-left: -13px;
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
.circle {
  position: relative;
  bottom: 1px;
  display: inline-block;
  margin-right: 7px;
  background-color: #5cb793;
  border-radius: 3.5px;
  width: 7px;
  height: 7px;
}
</style>
