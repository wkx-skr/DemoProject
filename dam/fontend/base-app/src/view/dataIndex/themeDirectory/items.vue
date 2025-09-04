<template>
  <div style="margin-right: 20px">
    <div class="row-filter">
      <datablau-input
        v-model="keyword"
        iconfont-state
        style="display: inline-block; width: 252px"
        clearable
        :placeholder="$t('indicator.subject.placeholder')"
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
      <!-- <datablau-button
        @click="showFilterTag"
        class="iconfont icon-gengduoguolv"
        type="text"
      >
        {{ showMoreFilters ? '收起更多过滤' : '更多过滤' }}
      </datablau-button> -->
      <div v-if="showMoreFilters" style="margin-top: 10px">
        <!-- <span class="label">状态</span>
        <datablau-select
          clearable
          v-model="conditions.status"
          style="width: 100px; display: inline-block"
          @change="changePage"
        >
          <el-option
            v-for="item in stautsOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          ></el-option>
        </datablau-select> -->
        <!-- <span class="label">业务部门</span>
        <datablau-select
          v-model="conditions.type"
          style="width: 100px; display: inline-block"
          @change="handleConditionsChange"
        >
          <el-option key="all" label="全部" value=""></el-option>
        </datablau-select> -->
        <!-- <span class="label">筛选过滤</span>
        <datablau-select
          v-model="conditions.labels"
          style="width: 120px; display: inline-block"
          multiple
          collapse-tags
        >
          <el-option key="1" label="需求编码" value="需求编码"></el-option>
          <el-option key="2" label="需求名称" value="需求名称"></el-option>
          <el-option key="3" label="技术部门" value="技术部门"></el-option>
          <el-option key="4" label="需求状态" value="需求状态"></el-option>
          <el-option key="5" label="发布周期" value="发布周期"></el-option>
          <el-option key="6" label="需求类型" value="需求类型"></el-option>
        </datablau-select> -->
      </div>
      <div style="position: absolute; right: 0; top: 10px; right: 20px">
        <datablau-button
          type="important"
          class="iconfont icon-tianjia"
          style="float: right"
          @click="addTheme"
        >
          {{ $t('indicator.subject.newSubject') }}
        </datablau-button>
        <!-- <datablau-button
          style="float: right; margin-right: 10px"
          icon="el-icon-editd"
          class="iconfont icon-expand"
          @click="showUdps = true"
        >
          扩展属性
        </datablau-button> -->
        <el-upload
          :action="uploadUrl"
          style="float: right"
          :show-file-list="false"
          :before-upload="handleBeforeUpload"
          :on-success="handleUploadSuccess"
          :on-error="handleUploadFailure"
          accept=".xlsx"
          :headers="$headers"
        >
          <!-- <datablau-button
            class="iconfont icon-upload"
          >
            导入
          </datablau-button> -->
          <!-- <datablau-button
            disabled
            style="float: right; margin-right: 10px"
            class="iconfont icon-upload"
          >
            正在导入...
          </datablau-button> -->
        </el-upload>
        <!-- <datablau-button
          style="float: right; margin-right: 10px"
          class="iconfont icon-download"
          @click="updateExport"
        >
          导出
        </datablau-button> -->
      </div>
    </div>
    <div class="table-area" :class="{ show: showMoreFilters }">
      <datablau-table
        :data="tableData"
        height="100%"
        data-selectable
        @selection-change="handleSelectionChange"
        @sort-change="handleSortChange"
        :default-sort="{ prop: 'creatDate', order: 'descending' }"
      >
        <el-table-column
          min-width="160"
          :label="$t('indicator.subject.name')"
          prop="name"
          sortable="custom"
          show-overflow-tooltip
        >
          <template slot-scope="scope">
            {{ scope.row.name }}
          </template>
        </el-table-column>
        <el-table-column
          min-width="130"
          :label="$t('indicator.subject.category')"
          prop="system"
          show-overflow-tooltip
        >
          <template slot-scope="scope">
            {{ scope.row.system }}
          </template>
        </el-table-column>
        <el-table-column
          min-width="150"
          :label="$t('indicator.subject.table')"
          prop="tableName"
          show-overflow-tooltip
        >
          <template slot-scope="scope">
            {{ scope.row.tableName }}
          </template>
        </el-table-column>
        <el-table-column
          min-width="100"
          :label="$t('indicator.subject.indexNo')"
          prop="metricSize"
          show-overflow-tooltip
        >
          <template slot-scope="scope">
            {{ scope.row.metricSize }}
          </template>
        </el-table-column>
        <el-table-column
          min-width="130"
          :label="$t('indicator.subject.dimNo')"
          prop="dimensionSize"
          show-overflow-tooltip
        >
          <template slot-scope="scope">
            {{ scope.row.dimensionSize }}
          </template>
        </el-table-column>
        <el-table-column
          min-width="100"
          :label="$t('quality.page.ruleTemplate.creatorName')"
          prop="creatUser"
          show-overflow-tooltip
        >
          <template slot-scope="scope">
            {{ scope.row.creatUser }}
          </template>
        </el-table-column>
        <el-table-column
          min-width="120"
          :label="$t('quality.page.ruleTemplate.createTime')"
          prop="creatDate"
          sortable="custom"
          show-overflow-tooltip
        >
          <template slot-scope="scope">
            {{
              scope.row.creatDate
                ? $timeFormatter(scope.row.creatDate).slice(0, 10)
                : ''
            }}
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('system.user.operation')"
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
        :page-sizes="[20, 50, 100, 500]"
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
