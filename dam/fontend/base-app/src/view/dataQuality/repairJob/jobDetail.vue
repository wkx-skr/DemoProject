<template>
  <div class="repairJob-detail">
    <solution
      v-if="jobDetails.id"
      :key="jobDetailsKey"
      ref="solution"
      :is-monitor="isMonitor || isCheck || jobDetails.status === 'CLOSED'"
      :task="jobDetails"
      @refresh-solution="getSolutions"
    ></solution>
    <datablau-dialog
      :title="$t('quality.page.dataQualityRepairJob.addTechnicalRules')"
      :visible.sync="chooseRulesDialogVisible"
      :width="$i18n.locale === 'zh' ? '1050px' : '1120px'"
      :height="520"
      append-to-body
    >
      <choose-quality-rules
        v-if="chooseRulesDialogVisible"
        :categoryId="jobDetails.modelCategoryId"
        @closeDialog="closeDialog"
        @qualityRulesSelected="qualityRulesSelected"
        :types="'redio'"
      ></choose-quality-rules>
    </datablau-dialog>
    <el-dialog
      :title="selectUser.title"
      width="400px"
      :visible.sync="selectUser.visible"
      append-to-body
      :close-on-click-modal="false"
    >
      <el-form size="small">
        <el-form-item>
          <!-- <el-input clearable style="width:100%;" size="small" v-model="assigneeString" clearable @focus="selectProblemUser"></el-input> -->
          <!--          <el-select-->
          <!--            style="width:100%;"-->
          <!--            v-model="selectUser.assignee"-->
          <!--            filterable-->
          <!--            clearable-->
          <!--            multiple-->
          <!--            size="small"-->
          <!--          >-->
          <!--            <el-option-->
          <!--              v-for="ds in allUsers"-->
          <!--              :key="ds.username"-->
          <!--              :label="$userNameFormatter(ds)"-->
          <!--              :value="ds.username">-->
          <!--            </el-option>-->
          <!--          </el-select>-->
        </el-form-item>
        <el-form-item></el-form-item>
        <el-form-item>
          <el-button
            :disabled="selectUser.assignee.length === 0"
            type="primary"
            size="small"
            @click="selectUser.ok"
          >
            {{ $t('common.button.ok') }}
          </el-button>
          <el-button size="small" @click="selectUser.visible = false">
            {{ $t('common.button.close') }}
          </el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
    <datablau-form-submit>
      <div class="mode-edit quality-details" v-if="writable">
        <div class="rightBox">
          <div v-if="!isCreate && showProblemStatistic">
            <history ref="history" :task-id="details.id"></history>
          </div>
        </div>
        <div class="row-section" style="margin-bottom: 20px; padding-top: 22px">
          <div class="db-fieldMessage-title">
            <p class="message-title">
              {{ $t('quality.page.dataQualityRepairJob.basicProperties') }}
            </p>
          </div>
        </div>
        <el-form
          label-position="right"
          label-width="180px"
          size="small"
          ref="form"
          :rules="
            isMonitor || isCheck || jobDetails.status === 'CLOSED'
              ? {}
              : validateRules
          "
          :model="jobDetails"
        >
          <el-form-item
            :label="$t('quality.page.dataQualityRepairJob.table.code')"
            v-if="!isCreate"
          >
            <datablau-input
              clearable
              maxlength="100"
              style="width: 500px"
              :value="jobDetails.code"
              disabled
            ></datablau-input>
          </el-form-item>
          <el-form-item
            :label="
              $t('quality.page.dataQualityRepairJob.table.problemClassify')
            "
            v-if="!isCreate"
          >
            <datablau-select
              :value="jobDetails.createManually"
              disabled
              style="width: 500px"
            >
              <el-option
                :label="
                  $t('quality.page.dataQualityRepairJob.table.ruleVerification')
                "
                :value="0"
              ></el-option>
              <el-option
                :label="
                  $t(
                    'quality.page.dataQualityRepairJob.table.domainVerification'
                  )
                "
                :value="2"
              ></el-option>
              <el-option
                :label="$t('quality.page.dataQualityRepairJob.table.manual')"
                :value="1"
              ></el-option>
            </datablau-select>
          </el-form-item>
          <el-form-item
            :label="$t('quality.page.dataQualityRepairJob.table.name')"
            prop="name"
          >
            <datablau-input
              clearable
              :disabled="
                (!canSave && !isCreate) ||
                isMonitor ||
                isCheck ||
                jobDetails.status === 'CLOSED' ||
                jobDetails.status === 'CONFIRM' ||
                jobDetails.status === 'FIXED'
              "
              maxlength="30"
              v-model="jobDetails.name"
              style="width: 500px"
              :placeholder="$t('quality.page.dataQualityRepairJob.nameProblem')"
            ></datablau-input>
          </el-form-item>
          <el-form-item
            :label="$t('quality.page.dataQualityRepairJob.currentStatus')"
          >
            <process-state :status="jobDetails.status"></process-state>
          </el-form-item>
          <el-form-item
            prop="candidates"
            :label="$t('quality.page.dataQualityRepairJob.table.owner')"
            v-if="isCreate"
          >
            <!--          <el-input clearable readonly @click.native="selectUsers" :value="assigneeNames"></el-input>&lt;!&ndash;{{assignee.join(',')}}&ndash;&gt;-->
            <sqy-select
              @valueChange="valueChange"
              :width="'500px'"
            ></sqy-select>
            <!--          <el-button @click="selectUsers">选择负责人</el-button>-->
          </el-form-item>
          <el-form-item
            :label="$t('quality.page.dataQualityRepairJob.table.owner')"
            v-else-if="jobDetails.status !== 'NOT_START' || $isShort"
          >
            <!--          <el-input clearable maxlength="100" v-model="jobDetails.owner" disabled></el-input>-->
            {{ getPeopleName(jobDetails.owner) }}
          </el-form-item>
          <el-form-item
            v-else-if="jobDetails.candidates"
            :label="$t('quality.page.dataQualityRepairJob.table.owner')"
          >
            {{ getPeopleName(jobDetails.candidates.toString()) }}
          </el-form-item>
          <el-form-item
            :label="$t('quality.page.dataQualityRepairJob.table.description')"
          >
            <datablau-input
              clearable
              :disabled="
                (!$auth['ROLE_SUPERUSER'] && !canSave && !isCreate) ||
                isMonitor ||
                isCheck ||
                jobDetails.status === 'CLOSED'
              "
              maxlength="500"
              show-word-limit
              style="max-width: 800px; width: 66%; min-width: 150px"
              type="textarea"
              :autosize="{ minRows: 4, maxRows: 180 }"
              v-model="jobDetails.description"
              :placeholder="
                $t('quality.page.dataQualityRepairJob.descriptionProblem')
              "
            ></datablau-input>
          </el-form-item>
          <el-form-item
            :label="$t('quality.page.dataQualityRepairJob.table.enclosure')"
            v-if="`${jobDetails.createManually}` === '1'"
          >
            <documents
              :readonly="
                (!canSave && !isCreate) ||
                isMonitor ||
                isCheck ||
                `${jobDetails.createManually}` === '0' ||
                jobDetails.status === 'CLOSED'
              "
              :content="jobDetails"
              :key="documentKey"
            ></documents>
          </el-form-item>
          <el-form-item
            :label="$t('quality.page.dataQualityRepairJob.dataProblems')"
            v-if="
              !isCreate &&
              (`${jobDetails.createManually}` === '0' ||
                jobDetails.createManually === 2)
            "
          >
            <data-problem
              :is-monitor="
                isMonitor ||
                isCheck ||
                jobDetails.status === 'CLOSED' ||
                !(
                  jobDetails.status === 'ACCEPT' ||
                  jobDetails.status === 'CONFIRM'
                )
              "
              v-if="jobDetails.id && showProblemStatistic"
              :task-id="jobDetails.id"
              :task="details"
              :all-users="allUsers"
              @dispatch="handleDispatch"
              @dispatch-by-org="handleDispatchByOrg"
              @dispatch-by-user-id="handleDispatchByUserId"
            ></data-problem>
          </el-form-item>
          <div
            class="row-section"
            style="margin-top: 40px; margin-bottom: 20px"
          >
            <div class="db-fieldMessage-title">
              <p class="message-title">
                {{
                  $t('quality.page.dataQualityRepairJob.relevantInformation')
                }}
              </p>
            </div>
          </div>

          <el-form-item
            :label="$t('quality.page.dataQualityRepairJob.table.system')"
            prop="modelCategoryId"
          >
            <datablau-select
              style="width: 500px"
              v-model="jobDetails.modelCategoryId"
              @change="modelCategoryIdChange"
              filterable
              :placeholder="$t('el.select.placeholder')"
              clearable
              :disabled="
                isMonitor ||
                isCheck ||
                !!jobDetails.jobResultId ||
                jobDetails.status === 'CLOSED'
              "
            >
              <el-option
                v-for="item in $modelCategories"
                :key="item.categoryId"
                :label="
                  item.categoryName + '(' + item.categoryAbbreviation + ')'
                "
                :value="item.categoryId"
              ></el-option>
            </datablau-select>
          </el-form-item>
          <el-form-item
            v-if="!!jobDetails.jobResultId && modelIdName !== ''"
            :label="$t('quality.page.dataQualityRepairJob.dataSource')"
          >
            <p>{{ modelIdName }}</p>
          </el-form-item>
          <el-form-item
            v-if="!!jobDetails.jobResultId && tableName !== ''"
            :label="$t('quality.page.dataQualityRepairJob.tableName')"
          >
            <datablau-button
              type="text"
              @click="jumpToMeta(tableNameId)"
              v-if="tableName"
            >
              {{ tableName }}
            </datablau-button>
          </el-form-item>
          <el-form-item v-if="jobDetails.createManually == 2" label="数据源">
            <span style="margin-left: 10px">{{ taskDataObj.modelName }}</span>
          </el-form-item>
          <el-form-item v-if="jobDetails.createManually == 2" label="表">
            <datablau-button
              type="text"
              @click="jumpToMeta(taskDataObj.tableId)"
              v-if="taskDataObj.tableId"
            >
              {{ taskDataObj.tablePhysicalName }}
            </datablau-button>
          </el-form-item>
          <el-form-item v-if="jobDetails.createManually == 2" label="字段">
            <datablau-button
              type="text"
              @click="jumpToMeta(taskDataObj.columnId)"
              v-if="taskDataObj.columnId"
            >
              {{ taskDataObj.columnPhysicalName }}
            </datablau-button>
          </el-form-item>
          <el-form-item
            v-if="jobDetails.createManually == 2"
            :label="
              taskDataObj.dataRuleType === 'STANDARD_CODE'
                ? '标准代码'
                : '基础标准'
            "
          >
            <div
              v-if="taskDataObj.dataRuleType !== 'STANDARD_CODE'"
              style="display: inline-block"
            >
              <datablau-button
                type="text"
                @click="jumpToDomain(taskDataObj.domainId)"
                :disabled="!taskDataObj.domainName"
                v-if="taskDataObj.domainName"
              >
                {{ taskDataObj.domainName }}
              </datablau-button>
              <div v-if="!taskDataObj.domainName">
                {{ taskDataObj.domainId }}(已删除)
              </div>
            </div>
            <div
              v-if="taskDataObj.dataRuleType === 'STANDARD_CODE'"
              style="display: inline-block"
            >
              <datablau-button
                type="text"
                @click="jumpToDomainCode(taskDataObj.standardCode)"
                :disabled="!taskDataObj.standardName"
                v-if="taskDataObj.standardName"
              >
                {{ taskDataObj.standardName }}
              </datablau-button>
              <div v-if="!taskDataObj.standardName">
                {{ taskDataObj.standardCode }}(已删除)
              </div>
            </div>

            <span
              style="vertical-align: middle"
              v-if="taskDataObj.standardName || taskDataObj.domainName"
            >
              （数据规则名称：{{ taskDataObj.dataRuleName }}）
            </span>
          </el-form-item>
          <el-form-item
            v-if="jobDetails.createManually == 2"
            label="标准检核任务名称"
          >
            {{ details.jobName }}
          </el-form-item>
          <div
            v-if="`${jobDetails.createManually}` !== '2'"
            style="margin-bottom: 18px"
          >
            <el-form-item
              v-if="!!jobDetails.jobResultId"
              :label="$t('quality.page.dataQualityRepairJob.fromRule')"
              prop="ruleId"
            >
              <datablau-button
                type="text"
                @click="jumpTotechRuleName(jobDetails)"
              >
                {{ ruless }}
              </datablau-button>
            </el-form-item>
            <el-form-item
              v-else
              :label="$t('quality.page.dataQualityRepairJob.fromRule')"
              prop="ruleId"
            >
              <datablau-input
                v-model="ruless"
                :disabled="
                  jobDetails.modelCategoryId == '' ||
                  isMonitor ||
                  isCheck ||
                  !!jobDetails.jobResultId ||
                  jobDetails.status === 'CLOSED'
                "
                style="width: 500px"
                :placeholder="
                  $t('quality.page.dataQualityRepairJob.selectRule')
                "
                @focus="chooseRulesDialogVisible = true"
              ></datablau-input>
              <!-- <el-select v-model="jobDetails.ruleId"
                       filterable
                       clearable
                       :disabled="isMonitor || isCheck || !jobDetails.modelCategoryId || !!jobDetails.jobResultId || jobDetails.status === 'CLOSED'"
            >
              <el-option
                v-for="ds in rules"
                :key="ds.id"
                :label="ds.name"
                :value="ds.id">
              </el-option>
            </el-select> -->
            </el-form-item>
          </div>
          <el-form-item
            :label="$t('quality.page.dataQualityRepairJob.table.type')"
            v-if="!isCreate && `${jobDetails.createManually}` !== '2'"
          >
            <span v-if="levelTwoName">
              {{ levelOneName }}-{{ levelTwoName }}
            </span>
            <span v-else>{{ levelOneName }}</span>
          </el-form-item>
          <el-form-item
            :label="$t('quality.page.dataQualityRepairJob.dateProduction')"
            v-if="!isCreate"
          >
            <datablau-datePicker
              :disabled="true"
              v-model="jobDetails.createOn"
            ></datablau-datePicker>
          </el-form-item>
          <el-form-item
            v-if="!isCreate && solutions && solutions.length > 0"
            :label="$t('quality.page.dataQualityRepairJob.solution')"
          >
            <datablau-tooltip
              effect="dark"
              :content="solutions[0].name"
              placement="top-start"
            >
              <p
                style="
                  max-width: 500px;
                  white-space: nowrap;
                  overflow: hidden;
                  text-overflow: ellipsis;
                  display: inline-block;
                "
              >
                {{ solutions[0].name }}
              </p>
            </datablau-tooltip>
            <datablau-button
              style="vertical-align: top"
              type="text"
              @click="updateSolution(solutions[0])"
            >
              {{ $t('quality.page.dataQualityRepairJob.scanSolution') }}
            </datablau-button>
          </el-form-item>
          <el-form-item></el-form-item>
          <el-form-item>
            <el-dialog
              width="500px"
              :visible.sync="closeTaskDialogVisible"
              :title="$t('quality.page.dataQualityRepairJob.closeProblem')"
              append-to-body
            >
              <el-form
                :label-width="$i18n.locale === 'zh' ? '4em' : '70px'"
                label-position="right"
              >
                <el-form-item
                  :label="$t('quality.page.dataQualityRepairJob.comment')"
                  :required="true"
                >
                  <el-input
                    clearable
                    maxLength="100"
                    type="textarea"
                    :placeholder="
                      $t('quality.page.dataQualityRepairJob.closePlaceholder')
                    "
                    :autosize="{ minRows: 4 }"
                    v-model="closeComment"
                  ></el-input>
                </el-form-item>
                <el-form-item>
                  <datablau-button
                    type="primary"
                    :disabled="!closeComment"
                    @click="closeTask"
                  >
                    {{ $t('common.button.ok') }}
                  </datablau-button>
                  <datablau-button
                    type="secondary"
                    @click="closeTaskDialogVisible = false"
                  >
                    {{ $t('common.button.close') }}
                  </datablau-button>
                </el-form-item>
              </el-form>
            </el-dialog>
          </el-form-item>
        </el-form>
      </div>
      <div class="footer-button" slot="buttons" v-if="!isCheck">
        <div class="button-box" v-if="!$isShort">
          <datablau-button
            type="normal"
            size="small"
            @click="acceptTask"
            v-show="
              !isMonitor &&
              !isCheck &&
              !isCreate &&
              jobDetails.status === 'NOT_START'
            "
            style="margin-right: 4px"
          >
            {{ $t('quality.page.dataQualityRepairJob.receivingProblems') }}
          </datablau-button>
          <datablau-button
            type="normal"
            @click="handleReassignTask"
            v-show="
              !isMonitor &&
              !isCheck &&
              jobDetails.status === 'ACCEPT' &&
              jobDetails.owner &&
              jobDetails.owner.includes($user.username)
            "
          >
            {{ $t('quality.page.dataQualityRepairJob.referralQuestions') }}
          </datablau-button>
          <datablau-button
            type="normal"
            @click="confirmTask"
            v-show="
              !isMonitor &&
              !isCheck &&
              jobDetails.status === 'ACCEPT' &&
              jobDetails.owner &&
              jobDetails.owner.includes($user.username)
            "
          >
            {{ $t('quality.page.dataQualityRepairJob.confirmProblem') }}
          </datablau-button>
          <datablau-button
            type="normal"
            @click="createSolution"
            v-if="
              !isMonitor &&
              !isCheck &&
              jobDetails.status === 'CONFIRM' &&
              !jobDetails.solutionId &&
              jobDetails.owner &&
              (jobDetails.owner.includes($user.username) ||
                $auth['ROLE_SUPERUSER'] ||
                $auth['CUSTOM_COLUMN_MANAGEMENT'])
            "
          >
            {{ $t('quality.page.dataQualityRepairJob.writeSolutions') }}
          </datablau-button>
          <datablau-button
            type="normal"
            @click="fixTask"
            v-if="
              !isMonitor &&
              !isCheck &&
              jobDetails.status === 'CONFIRM' &&
              jobDetails.solutionId &&
              jobDetails.owner &&
              (jobDetails.owner.includes($user.username) ||
                $auth['ROLE_SUPERUSER'] ||
                $auth['CUSTOM_COLUMN_MANAGEMENT'])
            "
          >
            {{ $t('quality.page.dataQualityRepairJob.confirmFixed') }}
          </datablau-button>
          <datablau-button
            type="normal"
            v-show="
              !isMonitor &&
              !isCheck &&
              ((!isCreate && jobDetails.status === 'ACCEPT') ||
                jobDetails.status === 'FIXED') &&
              jobDetails.owner &&
              jobDetails.owner.includes($user.username)
            "
            @click="handleCloseTask"
          >
            {{ $t('quality.page.dataQualityRepairJob.closeProblem') }}
          </datablau-button>
          <datablau-button
            type="important"
            v-if="
              (!isMonitor &&
                !isCheck &&
                canSave &&
                jobDetails.status !== 'CLOSED') ||
              isCreate
            "
            size="small"
            @click="onSubmit"
            style="margin-right: 4px"
          >
            {{ $t('common.button.ok') }}
          </datablau-button>
          <datablau-button type="secondary" @click="removeTab">
            {{ $t('common.button.cancel') }}
          </datablau-button>
        </div>
        <div class="button-box" v-else>
          <datablau-button
            type="normal"
            @click="handleReassignTask"
            v-show="
              !isCreate &&
              !isMonitor &&
              !isCheck &&
              jobDetails.status === 'NOT_START' &&
              jobDetails.owner &&
              (jobDetails.owner.includes($user.username) ||
                $auth['ROLE_SUPERUSER'])
            "
          >
            {{ $t('quality.page.dataQualityRepairJob.referralQuestions') }}
          </datablau-button>
          <datablau-button
            type="normal"
            @click="createSolution"
            v-if="
              !isCreate &&
              !isMonitor &&
              !isCheck &&
              jobDetails.status !== 'CLOSED' &&
              jobDetails.owner &&
              (jobDetails.owner.includes($user.username) ||
                $auth['ROLE_SUPERUSER'])
            "
          >
            {{ $t('quality.page.dataQualityRepairJob.writeSolutions') }}
          </datablau-button>
          <datablau-button
            type="normal"
            @click="fixTask"
            v-if="
              !isCreate &&
              !isMonitor &&
              !isCheck &&
              jobDetails.status === 'NOT_START' &&
              jobDetails.owner &&
              (jobDetails.owner.includes($user.username) ||
                $auth['ROLE_SUPERUSER'])
            "
          >
            {{ $t('quality.page.dataQualityRepairJob.confirmFixed') }}
          </datablau-button>
          <datablau-button
            type="normal"
            v-show="
              !isCreate &&
              !isMonitor &&
              !isCheck &&
              jobDetails.status !== 'CLOSED' &&
              jobDetails.owner &&
              (jobDetails.owner.includes($user.username) ||
                $auth['ROLE_SUPERUSER'])
            "
            @click="handleCloseTask"
          >
            {{ $t('quality.page.dataQualityRepairJob.closeProblem') }}
          </datablau-button>
          <datablau-button
            type="important"
            v-if="
              (!isMonitor &&
                !isCheck &&
                canSave &&
                jobDetails.status !== 'CLOSED') ||
              isCreate
            "
            size="small"
            @click="onSubmit"
            style="margin-right: 4px"
          >
            {{ $t('common.button.ok') }}
          </datablau-button>
          <datablau-button type="secondary" @click="removeTab">
            {{ $t('common.button.cancel') }}
          </datablau-button>
        </div>
      </div>
    </datablau-form-submit>

    <div class="quality-details" v-if="!writable">
      <div class="row-title">
        <div class="title">{{ jobDetails.name }}</div>
        <el-button
          class="edit-btn"
          size="small"
          type="primary"
          v-if="jobDetails.writable"
          @click="writable = true"
        >
          {{ $t('common.button.edit') }}
        </el-button>
      </div>
      <div class="row-description"></div>
      <div class="row-section">
        <section-label :edit="false">
          {{ $t('quality.page.dataQualityRepairJob.essential') }}
        </section-label>
      </div>
      <div class="item">
        <div class="label">
          {{ $t('quality.page.dataQualityRepairJob.table.system') }}
        </div>
        <div class="value" v-if="jobDetails.modelCategoryId">
          {{
            $modelCategories.filter(
              item => item.categoryId === jobDetails.modelCategoryId
            )[0].displayName
          }}
        </div>
      </div>
      <div class="item">
        <div class="label">
          {{ $t('quality.page.dataQualityRepairJob.rulesName') }}
        </div>
        <div class="value" v-if="rules && rules.length > 0">
          {{ rules.filter(item => item.id === jobDetails.ruleId)[0].name }}
        </div>
      </div>
      <div class="item">
        <div class="label">
          {{ $t('quality.page.dataQualityRepairJob.jobDetailsStatus') }}
        </div>
        <div class="value">
          {{ taskStatus[jobDetails.status] }}
          <!--          <status :type="jobDetails.status"></status>-->
        </div>
      </div>
      <div class="item">
        <div class="label">
          {{ $t('quality.page.dataQualityRepairJob.questionsNum') }}
        </div>
        <div class="value">
          {{ jobDetails.problemNum ? jobDetails.problemNum : '-' }}
        </div>
      </div>
      <div class="item">
        <div class="label">
          {{ $t('quality.page.dataQualityRepairJob.fixedNum') }}
        </div>
        <div class="value">{{ jobDetails.fixedNum }}</div>
      </div>
      <div class="item">
        <div class="label">
          {{ $t('quality.page.dataQualityRepairJob.table.owner') }}
        </div>
        <div class="value">{{ jobDetails.owner }}</div>
      </div>
      <div class="item full-width">
        <div class="label">
          {{ $t('quality.page.dataQualityRepairJob.jobDescription') }}
        </div>
        <div class="value">{{ jobDetails.description }}</div>
      </div>
      <div
        class="item"
        v-if="details && details.ruleId && $user.username === details.owner"
      >
        <div class="label">
          {{ $t('quality.page.dataQualityRepairJob.operationResults') }}
        </div>
        <div class="value" style="position: relative; top: -3px">
          <el-button size="small" @click="showJobResult">
            {{ $t('common.button.scan') }}
          </el-button>
          <el-button size="small" @click="downloadJobResult">
            {{ $t('quality.page.dataQualityRepairJob.download') }}
          </el-button>
        </div>
      </div>
      <div class="row-section">
        <section-label :edit="false" style="margin-top: 20px">
          {{ $t('quality.page.dataQualityRepairJob.relationKnowledgebase') }}
        </section-label>
      </div>
      <div class="row-table">
        <el-table :data="knowledge" class="datablau-table inner">
          <el-table-column width="20"></el-table-column>
          <el-table-column width="26">
            <template slot-scope="scope">
              <span class="tree-icon knowledge"></span>
            </template>
          </el-table-column>
          <el-table-column
            :label="$t('quality.page.dataQualityRepairJob.documentName')"
          >
            <template slot-scope="scope">
              <el-button
                type="text"
                size="small"
                @click.prevent.stop="goPreview(scope.row)"
              >
                {{ scope.row.title }}
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </div>
</template>

<script>
import jobDetail from './jobDetail.js'
export default jobDetail
</script>

<style lang="scss" scoped>
.rule-row {
  outline: 1px solid #eee;
  position: absolute;
  left: 0;
  right: 0;
  top: 220px;
  height: 60px;
  line-height: 60px;
  .title {
    margin-left: 20px;
    font-size: 14px;
    font-weight: bold;
  }
  .green-btn {
    float: right;
    margin: 13px 20px 0 0;
  }
}
.rule-table-row {
  border-bottom: 1px solid #eee;
  position: absolute;
  bottom: 60px;
  left: 0;
  right: 0;
  top: 300px;
}

.repairJob-detail {
  .quality-details {
    padding-right: 20px;
    padding-left: 20px;
    margin-top: 40px;
  }
  .rightBox {
    position: fixed;
    top: 90px;
    right: 18px;
    bottom: 50px;
    width: 286px;
    padding-left: 6px;
    z-index: 9;
    background: #fff;
    overflow: auto;
  }
}
</style>
