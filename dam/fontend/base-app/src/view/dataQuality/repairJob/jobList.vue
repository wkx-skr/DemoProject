<template>
  <div
    class="tab-page"
    style="position: absolute; top: 0; bottom: 0; width: 100%; overflow: hidden"
    :class="{ rules: typeState === 'rules' }"
    v-if="showList"
  >
    <datablau-dialog
      :title="$t('quality.page.dataQualityRepairJob.selectTechnicalRules')"
      :visible.sync="chooseRulesDialogVisible"
      :width="$i18n.locale === 'zh' ? '1050px' : '1120px'"
      :height="520"
      append-to-body
    >
      <choose-quality-rules
        v-if="chooseRulesDialogVisible"
        :categoryId="category"
        @closeDialog="closeDialog"
        @qualityRulesSelected="qualityRulesSelected"
        :types="'redio'"
        :is-mutiple="true"
        :from="'repairJob'"
      ></choose-quality-rules>
    </datablau-dialog>
    <div
      class="filter-row"
      style="min-width: 1150px"
      :style="{ paddingLeft: typeState !== 'rules' ? '20px' : 0 }"
    >
      <div class="row-inner" style="padding-top: 1px">
        <el-radio-group v-model="isSelf" class="screen-switch-radio">
          <el-tooltip
            :content="$t('quality.page.dataQualityRepairJob.showSelf')"
            placement="top-start"
          >
            <el-radio-button
              :label="true"
              v-if="
                isMonitor
                  ? $auth['QUALITY_PROBLEM_MONITORING_VIEW_MY']
                  : isCheck
                  ? $auth['QUALITY_PROBLEM_CHECK_VIEW_MY']
                  : $auth['QUALITY_ISSUE_LIST_VIEW_MY']
              "
            >
              <i class="iconfont icon-ownsee"></i>
            </el-radio-button>
          </el-tooltip>
          <el-tooltip
            :content="$t('quality.page.dataQualityRepairJob.showGroup')"
            placement="top-start"
          >
            <el-radio-button
              :label="false"
              v-if="
                isMonitor
                  ? $auth['QUALITY_PROBLEM_MONITORING_VIEW_ALL']
                  : isCheck
                  ? $auth['QUALITY_PROBLEM_CHECK_VIEW_ALL']
                  : $auth['QUALITY_ISSUE_LIST_VIEW_ALL']
              "
            >
              <i class="iconfont icon-manysee"></i>
            </el-radio-button>
          </el-tooltip>
        </el-radio-group>
        <!--        <span v-if="isMonitor" style="margin-left: 20px">问题名称</span>-->
        <datablau-input
          v-if="isMonitor || isCheck"
          v-model="keyword"
          maxlength="100"
          :iconfont-state="true"
          :placeholder="$t('quality.page.dataQualityRepairJob.questionSearch')"
          clearable
          style="
            width: 220px;
            min-width: 150px;
            margin-left: 10px;
            display: inline-block;
          "
        ></datablau-input>
        <!-- <el-input
          v-if="isMonitor || isCheck"
          maxlength="100"
          style="width: 15vw; min-width: 150px; margin-left: 4px"
          size="small"
          suffix-icon="el-icon-search"
          placeholder="按问题名称搜索"
          v-model="keyword"
          clearable
        ></el-input> -->
        <!--        <span v-if="isMonitor" style="margin-left:20px;">机构名称</span>-->
        <!--        <el-cascader-->
        <!--          v-if="isMonitor"-->
        <!--          maxlength="100"-->
        <!--          style="width:240px;margin-left:4px;"-->
        <!--          size="small"-->
        <!--          v-model="currentOrganization"-->
        <!--          change-on-select-->
        <!--          clearable-->
        <!--          :options="organizations"-->
        <!--          @change="handleOrganizationChange"-->
        <!--          :props="{label: 'toFname', children: 'nodes', value: 'toId', checkStrictly: true}"-->
        <!--          placeholder="按机构名称搜索"-->
        <!--        ></el-cascader>-->
        <span v-if="isMonitor || isCheck" style="margin-left: 10px">
          {{ $t('quality.page.dataQualityRepairJob.org') }}
        </span>
        <datablau-input
          clearable
          style="
            width: 172px;
            min-width: 130px;
            margin-left: 10px;
            display: inline-block;
          "
          v-model="currentOrganizationName"
          v-if="isMonitor || isCheck"
          :placeholder="
            $t('quality.page.dataQualityRepairJob.organizationSearch')
          "
          @focus="selectBranch"
        ></datablau-input>
        <!--        <el-select style="width:240px;margin-left:4px;" v-if="isMonitor" size="small" @change="currentOrganizationChange"  v-model="currentOrganization" filterable clearable  placeholder="按机构名称搜索">-->
        <!--          <el-option-->
        <!--            v-for="item in allBranchList"-->
        <!--            :key="item.id"-->
        <!--            :label="item.name"-->
        <!--            :value="item.id">-->
        <!--          </el-option>-->
        <!--        </el-select>-->
        <!--        <br v-if="isMonitor">-->
        <datablau-input
          v-if="!isMonitor && !isCheck"
          maxlength="100"
          :iconfont-state="true"
          style="
            width: 240px;
            min-width: 150px;
            margin-left: 10px;
            display: inline-block;
          "
          :class="{ inputEn: $i18n.locale !== 'zh' }"
          :placeholder="$t('quality.page.dataQualityRepairJob.questionSearch')"
          v-model="keyword"
          clearable
        ></datablau-input>
        <span v-if="!isCheck" style="margin-left: 10px">
          {{ $t('quality.page.dataQualityRepairJob.verificationStatus') }}
        </span>
        <datablau-select
          style="
            width: 110px;
            margin-left: 10px;
            display: inline-block;
            vertical-align: top;
          "
          v-model="status"
          v-if="!isCheck"
          @change="handleStatusChange"
        >
          <el-option
            :label="
              $t('quality.page.dataQualityRepairJob.taskStatus.allStatus')
            "
            value=""
            key="all"
          ></el-option>
          <el-option
            :label="v"
            v-for="(v, k) in taskStatus"
            :key="k"
            :value="k"
          ></el-option>
        </datablau-select>
        <span v-if="isCheck" style="margin-left: 10px">
          {{ $t('quality.page.dataQualityRepairJob.verificationStatus') }}
        </span>
        <datablau-select
          style="
            width: 110px;
            margin-left: 10px;
            display: inline-block;
            vertical-align: top;
          "
          v-model="verifyStatus"
          :placeholder="
            $t('quality.page.dataQualityRepairJob.verificationStatus')
          "
          v-if="isCheck"
          @change="handleVerifyStatusChange"
          clearable
        >
          <el-option
            :label="v.label"
            v-for="(v, k) in checkStatus"
            :key="v.label"
            :value="v.value"
          ></el-option>
        </datablau-select>
        <span style="margin-left: 10px">登记方式</span>
        <datablau-select
          style="margin-left: 10px; display: inline-block"
          v-model="taskType"
          placeholder="请选择问题类型"
        >
          <el-option label="规则核验" value="0"></el-option>
          <el-option label="手工登记" value="1"></el-option>
          <el-option
            label="标准核验"
            value="2"
            v-show="typeState !== 'rules' && $versionFeature['domain_DataRule']"
          ></el-option>
        </datablau-select>

        <datablau-button
          type="text"
          @click="showTop = !showTop"
          style="display: inline-block"
          class="iconfont icon-filter"
        >
          {{
            showTop
              ? $t('quality.page.qualityRule.index.openScreen')
              : $t('quality.page.qualityRule.index.foldScreen')
          }}
        </datablau-button>
        <!--        <span v-if="isMonitor" style="margin-left:156px;">起始日期</span>-->

        <datablau-button
          style="margin-left: 10px; vertical-align: top"
          type="normal"
          @click="query()"
        >
          {{ $t('quality.page.dataQualityRepairJob.search') }}
        </datablau-button>
        <datablau-button
          style="margin-left: 10px; vertical-align: top"
          type="secondary"
          @click="reset"
        >
          {{ $t('common.button.reset') }}
        </datablau-button>
        <span
          style="float: right; margin-right: 20px; transform: translateY(-1px)"
          v-if="typeState !== 'rules'"
        >
          <datablau-button
            type="important"
            size="small"
            @click="addJob"
            v-show="!isMonitor && !isCheck"
            v-if="$auth['QUALITY_ISSUE_LIST_ADD']"
            class="iconfont icon-tianjia"
          >
            {{ $t('quality.page.dataQualityRepairJob.createProblem') }}
          </datablau-button>
          <datablau-button
            type="normal"
            @click="exportTable(true)"
            v-show="!isMonitor && !isCheck"
            v-if="$auth['QUALITY_ISSUE_DATA_EXPORT_QUERY']"
            class="iconfont icon-export"
          >
            {{ $t('quality.page.dataQualityRepairJob.exportAll') }}
          </datablau-button>
          <!-- <el-dropdown
            size="mini"
            style="margin-left: 10px; transform: translateY(-1px)"
          >
            <datablau-button
              type="important"
              v-show="!isMonitor && !isCheck"
              v-if="
                $auth['QUALITY_ISSUE_DATA_EXPORT_QUERY'] ||
                $auth['QUALITY_ISSUE_DATA_EXPORT_CHECK']
              "
            >
              导出
              <i class="el-icon-arrow-down el-icon--right"></i>
            </datablau-button>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item>
                <div
                  v-if="$auth['QUALITY_ISSUE_DATA_EXPORT_QUERY']"
                  @click="exportTable(true)"
                >
                  导出全部查询结果
                </div>
              </el-dropdown-item>
              <el-dropdown-item>
                <div
                  v-if="$auth['QUALITY_ISSUE_DATA_EXPORT_CHECK']"
                  @click="exportTable(false)"
                >
                  导出勾选
                </div>
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown> -->
        </span>
      </div>
      <div>
        <span style="margin-left: 10px">
          {{ $t('quality.page.dataQualityRepairJob.system') }}
        </span>
        <datablau-select
          v-model="category"
          filterable
          clearable
          @change="handleChangeCotegory"
          style="
            width: 120px;
            min-width: 120px;
            margin-left: 10px;
            display: inline-block;
            vertical-align: top;
          "
          :placeholder="$version.common.pleaseSelect + $version.quality.system"
        >
          <el-option
            :label="item.displayName"
            :key="item.categoryId"
            :value="item.categoryId"
            v-for="item in [
              {
                categoryId: '',
                displayName: $t('quality.page.dataQualityRepairJob.allSystems'),
              },
            ].concat($modelCategories)"
          ></el-option>
        </datablau-select>
        <!--技术规则-->
        <span style="margin-left: 10px">
          {{ $t('common.page.qualityRule') }}
        </span>
        <datablau-input
          clearable
          style="margin-left: 10px; display: inline-block; vertical-align: top"
          v-model="techRules"
          :placeholder="$t('quality.page.qualityRule.index.selRule')"
          @focus="chooseRulesDialogVisible = true"
          @clear="clearTechRules"
        ></datablau-input>
        <span style="margin-left: 10px">
          {{ $t('quality.page.dataQualityRepairJob.table.type') }}
        </span>
        <el-cascader
          clearable
          style="width: 130px; margin-left: 10px"
          :options="bigClassList"
          @active-item-change="handleActiveClassOptions"
          @change="handleChangeClassOptions"
          v-model="bigsmallValue"
          :props="{ checkStrictly: true }"
        ></el-cascader>
        <datablau-dateRange
          @change="handleChangeTime"
          style="margin-left: 10px; display: inline-block; vertical-align: top"
          v-model="value7"
          align="right"
          unlink-panels
          :pickerOptionsArray="[
            this.$t('el.dateRange.lastWeek'),
            this.$t('el.dateRange.lastMonth'),
            this.$t('el.dateRange.last3Months'),
          ]"
        ></datablau-dateRange>
      </div>
    </div>
    <datablau-form-submit
      style="margin-top: 36px; transition: margin-top 0.6s"
      :style="{ 'margin-top': showTop ? '74px' : '36px' }"
      :class="{ rulesTable: typeState === 'rules' }"
      id="repairJob"
    >
      <datablau-table
        :data="jobsDisplay"
        ref="multipleTable"
        height="100%"
        style="min-width: 1100px; height: 100%"
        :default-sort="{ prop: 'createOn', order: 'DESC' }"
        @selection-change="handleSelectionChange"
        @filter-change="handleFilterChange"
        @sort-change="handleSortChange"
        :data-selectable="option.selectable"
        :auto-hide-selection="option.autoHideSelectable"
        :show-column-selection="option.showColumnSelection"
        :has-access="option.hasAccess"
        :column-selection="option.columnSelection"
        :border="option.columnResizable"
        :component-case-name="componentCaseName"
        :allColumns="allColumns"
      >
        <template v-slot:icon="slot">
          <datablau-icon
            :data-type="'repairjob'"
            :size="18"
            style="margin-top: 8px"
          ></datablau-icon>
        </template>
        <template v-slot:status="slot">
          <datablau-status
            :desc="taskStatus[slot.scope.row.status]"
            :type="taskStatusType[slot.scope.row.status]"
          ></datablau-status>
        </template>
        <template v-slot:verifyStatus="slot">
          <datablau-status
            :desc="taskCheckStatusFormatter(slot.scope.row)"
            :type="verifyStatusType[slot.scope.row.verifyStatus]"
          ></datablau-status>
        </template>
        <template v-slot:problemClassify="slot">
          <span v-if="`${slot.scope.row.createManually}` === '1'">
            {{ $t('quality.page.dataQualityRepairJob.table.manual') }}
          </span>
          <span v-else-if="`${slot.scope.row.createManually}` === '2'">
            {{
              $t('quality.page.dataQualityRepairJob.table.domainVerification')
            }}
          </span>
          <span v-else>
            {{ $t('quality.page.dataQualityRepairJob.table.ruleVerification') }}
          </span>
        </template>
        <template v-slot:owner="slot">
          <span v-if="slot.scope.row.owner">
            {{ getPeopleName(slot.scope.row.owner) }}
          </span>
          <span v-else-if="slot.scope.row.candidates">
            {{ getPeopleName(slot.scope.row.candidates) }}
          </span>
          <span v-else>-</span>
        </template>
        <template v-slot:problemNum="slot">
          <span class="spanWidthBackground">
            {{ formatter.problemNum(slot.scope.row, 'problemNum') }}
          </span>
        </template>
        <template v-slot:resolvedNum="slot">
          <span class="spanWidthBackground">
            {{ formatter.fixedNum(slot.scope.row, 'resolvedNum') }}
          </span>
        </template>
        <template v-slot:unresolvedNum="slot">
          <span class="spanWidthBackground">
            {{ formatter.unFixedNum(slot.scope.row, 'unresolvedNum') }}
          </span>
        </template>
        <template v-slot:operation="slot">
          <datablau-button
            type="text"
            v-if="
              isMonitor
                ? $auth['QUALITY_PROBLEM_ISSUE_DATA']
                : isCheck
                ? $auth['QUALITY_PROBLEM_CHECK_ISSUE_DATA']
                : $auth['QUALITY_DETAILS_ON_THE_PROBLEM']
            "
            @click="handleRowClick(slot.scope.row)"
          >
            {{ $t('quality.page.dataQualityRepairJob.questionDetails') }}
          </datablau-button>
          <datablau-tooltip
            v-show="!isMonitor && !isCheck"
            v-if="$auth['QUALITY_ISSUE_DATA'] && typeState !== 'rules'"
            content="AGENT问题数据不支持查看"
            :disabled="slot.scope.row.datasourceType !== 'AGENT'"
            :open-delay="500"
          >
            <datablau-button
              type="text"
              :disabled="
                `${slot.scope.row.createManually}` === '1' ||
                slot.scope.row.datasourceType === 'AGENT'
              "
              @click="handleRowClickDirectOpenData(slot.scope.row)"
            >
              {{ $t('quality.page.dataQualityRepairJob.problemData') }}
            </datablau-button>
          </datablau-tooltip>
          <datablau-button
            type="text"
            v-if="$auth['QUALITY_PROBLEM_CHECK_REOPEN'] && isCheck"
            :disabled="
              slot.scope.row.verifyStatus === 'NOT_VERIFIED_YET' ||
              slot.scope.row.verifyStatus === 'VERIFIED_ALL_PASSED'
            "
            @click="reOpen(slot.scope.row.id)"
          >
            {{ $t('quality.page.dataQualityRepairJob.reopen') }}
          </datablau-button>
        </template>
        <!--        <el-table-column :width="isMonitor || isCheck ? '28' : '18'">
          <datablau-icon
            :data-type="'repairjob'"
            :size="18"
            style="margin-top: 8px"
          ></datablau-icon>
        </el-table-column>-->
        <!--        <el-table-column
          v-if="isMonitor || isCheck"
          :label="
            $t('quality.page.dataQualityRepairJob.table.businessDepartment')
          "
          prop="businessDepartment"
          :min-width="$i18n.locale === 'zh' ? 100 : 120"
          show-overflow-tooltip
        >
        </el-table-column>-->
        <!--        <el-table-column
          prop="name"
          :label="$t('quality.page.dataQualityRepairJob.table.name')"
          sortable="custom"
          :min-width="$i18n.locale === 'zh' ? 120 : 130"
          show-overflow-tooltip
        >
          <template slot-scope="scope">
            <span>{{ scope.row.name }}</span>
          </template>
        </el-table-column>-->
        <!--        <el-table-column
          prop="modelCategoryId"
          :formatter="$mappingCategory"
          sortable="custom"
          :min-width="120"
          show-overflow-tooltip
          :label="$t('quality.page.dataQualityRepairJob.table.system')"
        ></el-table-column>-->
        <!--        <el-table-column
          prop="verifyStatus"
          :label="$t('quality.page.dataQualityRepairJob.table.verifyStatus')"
          :formatter="taskCheckStatusFormatter"
          :width="$i18n.locale === 'zh' ? '80' : 160"
          v-if="isCheck"
        ></el-table-column>-->
        <!--        <el-table-column
          prop="status"
          :width="$i18n.locale === 'zh' ? '' : 140"
          :label="$t('quality.page.dataQualityRepairJob.table.status')"
          v-if="!isCheck"
        >
          <template slot-scope="scope">
            {{ taskStatus[scope.row.status] }}
          </template>
        </el-table-column>-->
        <!--        <el-table-column
          v-if="!isMonitor && !isCheck"
          :width="$i18n.locale === 'zh' ? '' : 150"
          :label="$t('quality.page.dataQualityRepairJob.table.problemClassify')"
        >
          <template slot-scope="scope">
            <span v-if="`${scope.row.createManually}` === '1'">
              {{ $t('quality.page.dataQualityRepairJob.table.manual') }}
            </span>
            <span v-else-if="`${scope.row.createManually}` === '2'">
              {{
                $t('quality.page.dataQualityRepairJob.table.domainVerification')
              }}
            </span>
            <span v-else>
              {{
                $t('quality.page.dataQualityRepairJob.table.ruleVerification')
              }}
            </span>
          </template>
        </el-table-column>-->
        <!--        <el-table-column
          prop="createOn"
          :formatter="$timeFormatter"
          sortable="custom"
          width="150"
          :label="$t('quality.page.dataQualityRepairJob.table.createOn')"
        ></el-table-column>-->
        <!--        <el-table-column
          prop="problemNum"
          :width="$i18n.locale === 'zh' ? '' : 110"
          :label="$t('quality.page.dataQualityRepairJob.table.problemNum')"
          :formatter="formatter.problemNum"
          align="center"
        ></el-table-column>-->
        <!--        <el-table-column
          v-if="!isCheck"
          prop="fixedNum"
          :label="$t('quality.page.dataQualityRepairJob.table.resolvedNum')"
          width="110"
          align="center"
          :formatter="formatter.fixedNum"
        ></el-table-column>-->
        <!--        <el-table-column
          v-if="!isCheck"
          prop="fixedNum"
          :label="$t('quality.page.dataQualityRepairJob.table.unresolvedNum')"
          width="120"
          align="center"
          :formatter="formatter.unFixedNum"
        ></el-table-column>-->
        <!--        <el-table-column
          v-if="!isMonitor && !isCheck"
          prop="owner"
          :label="$t('quality.page.dataQualityRepairJob.table.owner')"
          width="120"
          column-key="owner"
          show-overflow-tooltip
        >
          <template slot-scope="scope">
            <span v-if="scope.row.owner">
              {{ getPeopleName(scope.row.owner) }}
            </span>
            <span v-else-if="scope.row.candidates">
              {{ getPeopleName(scope.row.candidates) }}
            </span>
            <span v-else>-</span>
          </template>
        </el-table-column>-->
        <!--        <el-table-column
          :label="$t('quality.page.dataQualityRepairJob.table.operation')"
          align="center"
          :width="
            isMonitor && $i18n.locale === 'zh'
              ? 100
              : isMonitor && $i18n.locale === 'en'
              ? 140
              : !isMonitor && $i18n.locale === 'zh'
              ? 180
              : !isMonitor && $i18n.locale === 'en'
              ? 280
              : 180
          "
          fixed="right"
        >
          <template slot-scope="scope">
            <datablau-button
              type="text"
              v-if="
                isMonitor
                  ? $auth['QUALITY_PROBLEM_ISSUE_DATA']
                  : isCheck
                  ? $auth['QUALITY_PROBLEM_CHECK_ISSUE_DATA']
                  : $auth['QUALITY_DETAILS_ON_THE_PROBLEM']
              "
              @click="handleRowClick(scope.row)"
            >
              {{ $t('quality.page.dataQualityRepairJob.questionDetails') }}
            </datablau-button>
            <datablau-tooltip
              v-show="!isMonitor && !isCheck"
              v-if="$auth['QUALITY_ISSUE_DATA'] && typeState !== 'rules'"
              content="AGENT问题数据不支持查看"
              :disabled="scope.row.datasourceType !== 'AGENT'"
              :open-delay="500"
            >
              <datablau-button
                type="text"
                :disabled="
                  `${scope.row.createManually}` === '1' ||
                  `${scope.row.createManually}` === '2' ||
                  scope.row.datasourceType === 'AGENT'
                "
                @click="handleRowClickDirectOpenData(scope.row)"
              >
                {{ $t('quality.page.dataQualityRepairJob.problemData') }}
              </datablau-button>
            </datablau-tooltip>
            <datablau-button
              type="text"
              v-if="$auth['QUALITY_PROBLEM_CHECK_REOPEN'] && isCheck"
              :disabled="
                scope.row.verifyStatus === 'NOT_VERIFIED_YET' ||
                scope.row.verifyStatus === 'VERIFIED_ALL_PASSED'
              "
              @click="reOpen(scope.row.id)"
            >
              {{ $t('quality.page.dataQualityRepairJob.reopen') }}
            </datablau-button>
          </template>
        </el-table-column>-->
      </datablau-table>
      <template slot="buttons">
        <div
          class="left-button"
          v-show="
            multipleSelection.length > 0 &&
            $auth['QUALITY_ISSUE_DATA_EXPORT_CHECK']
          "
        >
          <span class="check-info"></span>
          <span class="footer-row-info">
            {{
              $t('common.deleteMessage', {
                selection: multipleSelection.length,
              })
            }}
          </span>
          <datablau-button
            type="important"
            v-show="!isMonitor && !isCheck && multipleSelection.length > 0"
            v-if="$auth['QUALITY_ISSUE_DATA_EXPORT_CHECK']"
            @click="exportTable(false)"
          >
            {{ $t('quality.page.dataQualityRepairJob.exportCheck') }}
          </datablau-button>
        </div>

        <datablau-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="tablePara.currentPage"
          :page-sizes="[20, 50, 100]"
          :page-size="tablePara.pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
        ></datablau-pagination>
      </template>
    </datablau-form-submit>
  </div>
</template>

<script>
import jobList from './jobList.js'
export default jobList
</script>

<style lang="scss" scoped>
@import '~@/next/components/basic/color.sass';
.spanWidthBackground {
  display: inline-block;
  padding: 0 8px;
  background: #f5f5f5;
  border-radius: 12px;
}
.rules {
  // margin-left: -20px;
  // margin-right: -20px;
  .row-inner {
    min-width: auto;
  }
  .rulesTable {
    margin-left: -20px;
    margin-right: -20px;
  }
}
.filter-row {
  height: 120px;
}
.table-row {
  top: 34px;
  left: 20px;
  right: 20px;
  &.monitor {
    top: 90px;
  }
}
.row-inner {
  margin-top: 0px !important;
  // height: 120px !important;
  line-height: 0 !important;
  .label {
    display: inline-block;
    width: 76px;
    text-align: right;
  }
}
.left-button {
  position: absolute;
  top: 50%;
  -webkit-transform: translateY(-50%);
  transform: translateY(-50%);
  left: 20px;
  .check-info {
    width: 14px;
    height: 14px;
    display: inline-block;
    background: $primary-color;
    margin-right: -13px;
    vertical-align: middle;
  }
  .footer-row-info {
    height: 50px;
    margin-right: 10px;
    &:before {
      content: '\e6da';
      font-family: 'element-icons';
      font-size: 12px;
      font-weight: 200;
      margin-right: 5px;
      vertical-align: middle;
      line-height: 13px;
      color: white;
    }
  }
}
.inputEn {
  width: 220px !important;
}
.el-cascader {
  line-height: 32px;
  ::v-deep .el-input {
    height: 32px;
    line-height: 32px;
    .el-input__inner {
      height: 32px;
      line-height: 32px;
    }
  }
  ::v-deep .el-input__icon {
    line-height: 32px !important;
  }
}
</style>
