<template>
  <div class="tab-page">
    <div style="min-width: 1000px">
      <div>
        <span class="tab-page-header">
          {{ $t('system.job.taskType') }}
        </span>
        <datablau-select
          v-model="selectedTypes"
          class="job-tab-input"
          size="small"
          clearable
          filterable
        >
          <el-option
            v-for="item in typeArr"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          ></el-option>
        </datablau-select>
        <span class="tab-page-header">
          {{ $t('system.job.jobName') }}
        </span>
        <datablau-input
          :iconfont-state="true"
          class="job-tab-input"
          :placeholder="
            $t('common.placeholder.prefix') + $t('system.job.jobName')
          "
          v-model="keyword"
          clearable
        ></datablau-input>
        <span class="tab-page-header">{{ $t('system.job.isDisabled') }}</span>
        <datablau-select
          v-model="isDisabled"
          class="job-tab-input"
          size="small"
          clearable
          filterable
        >
          <el-option
            v-for="item in disableArr"
            :key="item.value"
            :label="$t('system.job.' + item.label)"
            :value="item.value"
          ></el-option>
        </datablau-select>
        <span class="tab-page-header">{{ $t('system.job.status') }}</span>
        <datablau-select
          v-model="status"
          class="job-tab-input"
          size="small"
          clearable
          filterable
        >
          <el-option
            v-for="item in stateArr"
            :key="item.value"
            :label="
              $t('quality.page.qualityExamineJob.statusList.' + item.value)
            "
            :value="item.value"
          ></el-option>
        </datablau-select>
        <div class="page-btn-group right-top">
          <datablau-button
            type="important"
            style=""
            size="mini"
            @click="goJobDetail({ id: 'add' })"
            v-if="!hideAddJob"
            class="iconfont icon-tianjia"
          >
            {{ $t('quality.page.qualityExamineJob.createTask') }}
          </datablau-button>
        </div>
      </div>
    </div>
    <datablau-form-submit style="min-width: 1000px; margin-top: 44px">
      <datablau-table
        :data="tableData"
        class="datablau-table table"
        @sort-change="handleSortChange"
        height="100%"
        :show-column-selection="false"
      >
        <el-table-column
          prop="name"
          :label="$t('system.job.jobName')"
          show-overflow-tooltip
          sortable="custom"
          min-width="200"
        ></el-table-column>
        <el-table-column
          prop="disabled"
          :label="$t('system.job.isDisabled')"
          :formatter="disableFormat"
          width="100"
        ></el-table-column>
        <!--  :formatter="$jobStatusFormatter" -->
        <el-table-column
          prop="status"
          :label="$t('system.job.status')"
          width="120"
        >
          <template slot-scope="scope">
            <div>
              <i
                class="status-style"
                :style="{ background: getJobColor(scope.row.status) }"
              ></i>
              <span :style="{ color: getJobColor(scope.row.status) }">
                {{ statusFormatter(scope.row.status) }}
              </span>
            </div>
          </template>
        </el-table-column>
        <el-table-column
          prop="creator"
          :label="$t('system.job.creator')"
          sortable="custom"
          min-width="100"
        ></el-table-column>
        <el-table-column
          prop="lastRunStartTime"
          :label="$t('system.job.lastRun')"
          :formatter="dateFormat"
          sortable="custom"
          min-width="170"
        ></el-table-column>
        <el-table-column
          prop="nextRunTime"
          :label="$t('system.job.nextRun')"
          :formatter="dateFormat"
          min-width="170"
        ></el-table-column>
        <el-table-column
          :label="$t('system.user.operation')"
          width="110"
          align="center"
          fixed="right"
        >
          <template slot-scope="scope">
            <datablau-button
              size="mini"
              @click="goJobDetail(scope.row)"
              type="text"
              style="display: inline-block; width: 45px"
            >
              <datablau-tooltip
                effect="dark"
                :content="$t('common.button.edit')"
                placement="bottom"
                style="margin-right: 6px"
              >
                <i class="iconfont icon-bianji"></i>
              </datablau-tooltip>
              <!-- 编辑 -->
            </datablau-button>
            <datablau-button
              size="mini"
              type="text"
              @click="deleteCoustomJob(scope.row)"
              v-if="couldDelete(scope.row)"
              style="display: inline-block; width: 45px; margin-left: 0"
            >
              <datablau-tooltip
                effect="dark"
                :content="$t('common.button.delete')"
                placement="bottom"
                style="margin-right: 6px"
              >
                <i class="iconfont icon-delete"></i>
              </datablau-tooltip>
              <!-- 删除 -->
            </datablau-button>
          </template>
        </el-table-column>
      </datablau-table>
      <!-- 下面翻页的内容 -->
      <template slot="buttons">
        <datablau-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page.sync="currentPage"
          :page-sizes="[10, 20, 50, 100]"
          :page-size="20"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          class="page"
        ></datablau-pagination>
      </template>
    </datablau-form-submit>
  </div>
</template>

<script>
import jobListTab from './jobListTab'
export default jobListTab
</script>
<style lang="scss" scoped></style>

<style scoped lang="scss">
$green: #66bf16;
$red: #f2220a;
$notRun: #e6ad00;
$disColor: #999999;
$textColor: #0084ff;
.tab-page {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  // .table-row {
  //   position: absolute;
  //   top: 60px;
  //   bottom: 50px;
  //   right: 20px;
  //   left: 20px;
  // border-top: 1px solid #e5e5e5;
  .table {
    height: 100%;
    .cell {
      div {
        width: 100%;
        .status-style {
          width: 6px;
          height: 6px;
          display: inline-block;
          transform: translateY(-2px);
          border-radius: 50%;
        }
        span {
          margin-left: 5px;
          font-size: 12px;
        }
      }
    }
  }
  // }
  .job-tab-input {
    width: 12vw;
    min-width: 120px;
    display: inline-block;
  }
  .tab-page-header {
    margin-left: 20px;
    margin-right: 6px;
  }
}
#job-list {
  position: absolute;
  // top:80px;
  bottom: 20px;
  right: 0;
  left: 0;
  overflow: hidden;
  .noData {
    padding: 100px;
    p {
      text-align: center;
      color: #aaa;
    }
  }
}
.page-part {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 50px;
  z-index: 10;
  // border-top: 1px solid var(--border-color-lighter);
  box-shadow: 0 -5px 14px -8px rgba(0, 0, 0, 0.2);
  border-top: 1px solid transparent;
  .page {
    position: absolute;
    right: 20px;
    bottom: 10px;
  }
}
</style>
