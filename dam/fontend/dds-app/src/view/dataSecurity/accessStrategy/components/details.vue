<template>
  <div class="detailsCom">
    <div class="tile">
      <datablau-breadcrumb
        :node-data="breadcrumbNodes"
        @back="cancel"
        :couldClick="false"
      ></datablau-breadcrumb>
    </div>
    <div class="conName">
      <div class="nameBox">
        <div class="iconbox">
          <span
            style="font-size: 48px; color: #409eff"
            class="iconfont icon-accesspolicy"
          ></span>
        </div>
        <div class="strategyName">
          <p>
            {{ baseInfo.accessStrategyName }}
          </p>
          <div style="height: 20px">
            <span>
              <span>{{ $t('securityModule.authoritySource') }}：</span>
              <span class="data-source-value">
                <is-show-tooltip
                  :content="baseInfo.source"
                  :open-delay="200"
                  placement="top"
                ></is-show-tooltip>
              </span>
            </span>
          </div>
        </div>
      </div>
      <div class="status-box" :class="[strategyType]">
        <div class="status-item type">
          <p>{{ $t('accessStrategy.accessType') }}</p>
          <span>{{ strategyTypeMap[strategyType] }}</span>
        </div>
        <div
          v-if="strategyType === 'ACCESS_STRATEGY'"
          class="status-item action"
        >
          <p>{{ $t('accessStrategy.dataAccessAction') }}</p>
          <span
            :class="{
              allow: baseInfo.allow,
              deny: baseInfo.allow === false,
            }"
          >
            <span
              style="
                float: left;
                display: inline-block;
                width: 6px;
                height: 6px;
                border-radius: 3px;
                margin-right: 8px;
                margin-top: 6px;
              "
              :style="{
                backgroundColor: baseInfo.allow
                  ? '#66bf16'
                  : baseInfo.allow === false
                  ? '#f2220a'
                  : '',
              }"
            ></span>
            {{
              baseInfo.allow
                ? $t('securityModule.allow')
                : baseInfo.allow === false
                ? $t('securityModule.refuse')
                : ''
            }}
          </span>
        </div>
      </div>
      <datablau-detail-subtitle
        :title="$t('securityModule.desInfo')"
        mt="16px"
        mb="0px"
      ></datablau-detail-subtitle>
      <div
        v-if="baseInfo.strategyDescribe"
        style="
          width: 1040px;
          overflow: auto;
          padding: 8px 0 8px 8px;
          background-color: #f5f5f5;
        "
      >
        <p style="max-height: 100px; overflow: auto">
          {{ baseInfo.strategyDescribe }}
        </p>
      </div>

      <p v-else class="noData">
        <img src="/static/kgimg/noresult.svg" alt="" />
        <span>{{ $t('assets.common.noInfo') }}</span>
      </p>
    </div>
    <datablau-tabs
      class="tabs-nav"
      v-if="
        strategyType !== 'ACCESS_ROW_STRATEGY' &&
        strategyType !== 'ACCESS_DATAMASK_COLUMN'
      "
      v-model="activeName"
      @tab-click="handleInfoTabClick"
    >
      <el-tab-pane
        v-if="strategyType === 'ACCESS_STRATEGY'"
        :label="$t('accessStrategy.accessData')"
        name="tableVisitConfig"
      ></el-tab-pane>

      <el-tab-pane
        v-if="strategyType === 'ACCESS_DATAMASK_TABLE'"
        :label="$t('securityModule.desensitizationRules')"
        name="tableMaskConfig"
      ></el-tab-pane>

      <el-tab-pane
        v-if="
          strategyType === 'ACCESS_STRATEGY' ||
          strategyType === 'ACCESS_DATAMASK_TABLE'
        "
        :label="$t('accessStrategy.visitor')"
        name="visitorConfig"
      ></el-tab-pane>
    </datablau-tabs>
    <div
      class="tabContent"
      :style="{
        top:
          strategyType === 'ACCESS_STRATEGY' ||
          strategyType === 'ACCESS_DATAMASK_TABLE'
            ? '220px'
            : '185px',
      }"
    >
      <div>
        <div
          class="user-tab"
          v-if="
            activeName === 'visitorConfig' && strategyType !== 'ACCESS_STRATEGY'
          "
        >
          <datablau-subtab
            :tabs="visitorTabs"
            :show-name="'name'"
            @change="handleVisitorTabClick"
          >
            <el-tab-pane
              :label="$t('accessStrategy.user')"
              name="USER"
            ></el-tab-pane>
            <el-tab-pane
              :label="$t('accessStrategy.userGroups')"
              name="GROUP"
            ></el-tab-pane>
            <el-tab-pane
              :label="$t('accessStrategy.organization')"
              name="ORGANIZATION"
            ></el-tab-pane>
          </datablau-subtab>
          <datablau-input
            v-model="visitorKeyword"
            :iconfont-state="true"
            :placeholder="visitorPlaceholder"
            class="keyInput"
            clearable
            @change="handleVisitorKeywordChange"
          ></datablau-input>
        </div>
        <div
          v-if="
            strategyType === 'ACCESS_ROW_STRATEGY' ||
            strategyType === 'ACCESS_DATAMASK_COLUMN'
          "
        >
          <datablau-tabs
            v-model="visitorType"
            @tab-click="handleVisitorTabClick"
          >
            <el-tab-pane
              :label="$t('accessStrategy.user')"
              name="USER"
            ></el-tab-pane>
            <el-tab-pane
              :label="$t('accessStrategy.userGroups')"
              name="GROUP"
            ></el-tab-pane>
            <el-tab-pane
              :label="$t('accessStrategy.organization')"
              name="ORGANIZATION"
            ></el-tab-pane>
          </datablau-tabs>
          <datablau-input
            v-model="visitorKeyword"
            :iconfont-state="true"
            :placeholder="visitorPlaceholder"
            class="keyInput"
            clearable
            style="margin: 10px 20px 0"
            @change="handleVisitorKeywordChange"
          ></datablau-input>
        </div>
        <!-- datablau-form-submit  一个datablau-form-submit组件放入多个datablau-table样式不支持 -->
        <template v-if="activeName === 'visitorConfig'">
          <template v-if="strategyType === 'ACCESS_STRATEGY'">
            <datablau-form-submit :style="{ top: '10px', bottom: '20px' }">
              <div class="con">
                <div class="lineBox">
                  <datablau-button
                    type="icon"
                    @click="handleClick('showWhite')"
                  >
                    <i class="el-icon-arrow-down upDow" v-if="showWhite"></i>
                    <i class="el-icon-arrow-up" v-else></i>
                  </datablau-button>
                  <span>{{ $t('accessStrategy.whiteList') }}</span>
                </div>
                <div class="whitelist" v-show="showWhite">
                  <userConfig
                    :isEditable="false"
                    :actionList="[]"
                    :isWhite="true"
                    :activeStep="3"
                    ref="whitelistUser"
                    @secondData="ary => secondData(ary, 'white')"
                  ></userConfig>
                </div>
                <div class="lineBox">
                  <datablau-button
                    type="icon"
                    @click="handleClick('showBlack')"
                  >
                    <i class="el-icon-arrow-down upDow" v-if="showBlack"></i>
                    <i class="el-icon-arrow-up" v-else></i>
                  </datablau-button>
                  <span>{{ $t('accessStrategy.blackList') }}</span>
                </div>
                <div class="whitelist" v-show="showBlack">
                  <userConfig
                    :isEditable="false"
                    :activeStep="3"
                    :actionList="[]"
                    :isWhite="false"
                    ref="blacklistUser"
                    @secondData="ary => secondData(ary, 'black')"
                  ></userConfig>
                </div>
              </div>
              <template slot="buttons">
                <datablau-pagination
                  v-if="
                    !(
                      activeName === 'visitorConfig' &&
                      strategyType === 'ACCESS_STRATEGY'
                    )
                  "
                  @size-change="handleSizeChange"
                  @current-change="handleCurrentChange"
                  :current-page="pagination.currentPage"
                  :page-sizes="[20, 50, 100, 200]"
                  :page-size="pagination.pageSize"
                  layout="total, sizes, prev, pager, next"
                  :pager-count="5"
                  class="page"
                  :total="pagination.total"
                ></datablau-pagination>
              </template>
            </datablau-form-submit>
          </template>
          <template v-else>
            <datablau-form-submit :style="{ top: '40px' }">
              <datablau-table
                height="100%"
                v-loading="tableLoading"
                ref="deTable"
                :data="tableData"
                tooltip-effect="dark"
              >
                <el-table-column
                  :prop="item.prop"
                  :label="item.label"
                  v-for="item in userConfigColumns[strategyType][visitorType]"
                  :key="item.prop"
                  show-overflow-tooltip
                >
                  <template slot-scope="scope">
                    <template v-if="item.prop === 'roles'">
                      {{ scope.row.roles ? scope.row.roles.join(',') : '' }}
                    </template>
                    <template v-else-if="item.prop === 'actionList'">
                      {{
                        scope.row.actionList
                          ? scope.row.actionList.join(',')
                          : ''
                      }}
                    </template>
                    <template v-else>
                      {{ scope.row[item.prop] }}
                    </template>
                  </template>
                </el-table-column>
              </datablau-table>
              <template slot="buttons">
                <datablau-pagination
                  v-if="
                    !(
                      activeName === 'visitorConfig' &&
                      strategyType === 'ACCESS_STRATEGY'
                    )
                  "
                  @size-change="handleSizeChange"
                  @current-change="handleCurrentChange"
                  :current-page="pagination.currentPage"
                  :page-sizes="[20, 50, 100, 200]"
                  :page-size="pagination.pageSize"
                  layout="total, sizes, prev, pager, next"
                  :pager-count="5"
                  class="page"
                  :total="pagination.total"
                ></datablau-pagination>
              </template>
            </datablau-form-submit>
          </template>
        </template>
        <template v-if="activeName === 'tableVisitConfig'">
          <datablau-form-submit>
            <!-- <datablau-table
              height="100%"
              v-loading="tableLoading"
              :loading="tableLoading"
              :data="tableData"
            >
              <el-table-column
                prop="schemaName"
                label="Schema"
              ></el-table-column>
              <el-table-column
                prop="tableName"
                label="表/视图"
              ></el-table-column>
              <el-table-column prop="columnName" label="字段"></el-table-column>
            </datablau-table> -->
            <datablau-table
              height="100%"
              v-loading="tableLoading"
              :loading="tableLoading"
              ref="table"
              :data="tableData"
            >
              <el-table-column
                label="Schema"
                prop="schemaName"
                :min-width="120"
                show-overflow-tooltip
              ></el-table-column>
              <el-table-column
                :label="$t('securityModule.tableView')"
                :min-width="120"
                show-overflow-tooltip
              >
                <template slot-scope="scope">
                  {{
                    scope.row.tableName +
                    (scope.row.tableCnName ? `(${scope.row.tableCnName})` : '')
                  }}
                </template>
              </el-table-column>
              <el-table-column
                :label="$t('securityModule.securityLevel')"
                prop="securityLevel"
                show-overflow-tooltip
                :min-width="100"
              ></el-table-column>
              <el-table-column
                :label="$t('securityModule.inSecurityClassify')"
                prop="catalogPath"
                show-overflow-tooltip
              >
                <!-- <template
                  slot-scope="scope"
                  v-if="
                    scope.row.catalogPath && scope.row.catalogPath.length !== 0
                  "
                >
                  <span>{{ scope.row.catalogPath[0] }}</span>
                  <el-popover
                    v-if="scope.row.catalogPath.length > 1"
                    placement="bottom"
                    title=""
                    width="240"
                    trigger="hover"
                    transition="fade-in-linear"
                    style="margin-left: 8px"
                  >
                    <p
                      v-html="scope.row.catalogPath.join('<br/>')"
                      style="font-size: 12px; color: #555"
                    ></p>
                    <span
                      slot="reference"
                      style="color: #409eff; cursor: pointer"
                    >
                      更多
                    </span>
                  </el-popover>
                </template> -->
              </el-table-column>
              <el-table-column
                :label="$t('securityModule.columnName')"
                prop="columnName"
                :min-width="150"
                show-overflow-tooltip
              >
                <template slot-scope="scope">
                  <div class="table-cell">
                    <i
                      class="iconfont icon-ziduan"
                      style="font-size: 20px; margin-right: 12px"
                    ></i>
                    <el-popover
                      popper-class="strategy-rule-card-popover"
                      placement="bottom"
                      title=""
                      width="480"
                      trigger="click"
                      transition="fade-in-linear"
                    >
                      <div
                        class="column-type"
                        slot="reference"
                        style="display: inline-block; cursor: pointer"
                      >
                        {{ $t('securityModule.gong') }}
                        <span>{{ scope.row.columns.length }}</span>
                        {{ $t('securityModule.numColumn') }}
                      </div>
                      <div class="strategy-column-info">
                        <div class="title">
                          {{ $t('securityModule.authoritySource') }}：
                          <div class="name-content">
                            <is-show-tooltip
                              :content="
                                scope.row.sourcePath + '/' + scope.row.tableName
                              "
                              :refName="'name'"
                            ></is-show-tooltip>
                          </div>
                        </div>
                        <div class="column-box">
                          <datablau-table
                            height="100%"
                            v-loading="tableLoading"
                            :loading="tableLoading"
                            ref="table"
                            :data="scope.row.columns"
                          >
                            <el-table-column
                              :label="$t('securityModule.columnName')"
                              prop="columnCnName"
                              :min-width="100"
                              show-overflow-tooltip
                            >
                              <template slot-scope="scope">
                                <table-cell
                                  :size="20"
                                  :mr="12"
                                  :icon="getAssetIcon(80000005)"
                                  :name="
                                    scope.row.columnName +
                                    (scope.row.columnCnName
                                      ? `(${scope.row.columnCnName})`
                                      : '')
                                  "
                                ></table-cell>
                              </template>
                            </el-table-column>
                            <el-table-column
                              :label="$t('securityModule.securityLevel')"
                              prop="securityLevel"
                              :min-width="120"
                              show-overflow-tooltip
                            ></el-table-column>
                            <el-table-column
                              :label="$t('securityModule.isItSensitive')"
                              prop="sensitive"
                              :width="110"
                            >
                              <template slot-scope="scope">
                                <span
                                  v-if="scope.row.sensitive"
                                  :class="[
                                    'sensitive-type',
                                    getSensitive(scope.row.sensitive),
                                  ]"
                                >
                                  <is-show-tooltip
                                    :content="scope.row.sensitive"
                                    :open-delay="200"
                                    placement="top"
                                  ></is-show-tooltip>
                                </span>
                              </template>
                            </el-table-column>
                          </datablau-table>
                        </div>
                      </div>
                    </el-popover>
                  </div>
                </template>
              </el-table-column>
            </datablau-table>

            <template slot="buttons">
              <datablau-pagination
                v-if="
                  !(
                    activeName === 'visitorConfig' &&
                    strategyType === 'ACCESS_STRATEGY'
                  )
                "
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
                :current-page="pagination.currentPage"
                :page-sizes="[20, 50, 100, 200]"
                :page-size="pagination.pageSize"
                layout="total, sizes, prev, pager, next"
                :pager-count="5"
                class="page"
                :total="pagination.total"
              ></datablau-pagination>
            </template>
          </datablau-form-submit>
        </template>
        <template v-if="strategyType === 'ACCESS_ROW_STRATEGY'">
          <datablau-form-submit :style="{ top: '73px' }">
            <datablau-table
              height="100%"
              v-loading="tableLoading"
              ref="deTable"
              :data="tableData"
              tooltip-effect="dark"
            >
              <el-table-column
                :prop="item.prop"
                :label="item.label"
                v-for="item in rowVisitColumns[visitorType]"
                :key="item.prop"
                min-width="120"
                show-overflow-tooltip
              >
                <template slot-scope="scope">
                  <template v-if="item.prop !== 'dto'">
                    <template v-if="item.prop === 'roles'">
                      {{ (scope.row.roles || []).join(',') }}
                    </template>
                    <template v-else>
                      {{ scope.row[item.prop] }}
                    </template>
                  </template>
                  <template v-else>
                    <span class="row-rule">
                      <is-show-tooltip
                        :content="formatRowRules(scope.row.dto)"
                        :open-delay="200"
                        placement="top"
                      ></is-show-tooltip>
                    </span>
                  </template>
                </template>
              </el-table-column>
            </datablau-table>
            <template slot="buttons">
              <datablau-pagination
                v-if="
                  !(
                    activeName === 'visitorConfig' &&
                    strategyType === 'ACCESS_STRATEGY'
                  )
                "
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
                :current-page="pagination.currentPage"
                :page-sizes="[20, 50, 100, 200]"
                :page-size="pagination.pageSize"
                layout="total, sizes, prev, pager, next"
                :pager-count="5"
                class="page"
                :total="pagination.total"
              ></datablau-pagination>
            </template>
          </datablau-form-submit>
        </template>
        <template v-if="activeName === 'tableMaskConfig'">
          <datablau-form-submit>
            <datablau-table
              height="100%"
              v-loading="tableLoading"
              ref="deTable"
              :data="tableData"
              tooltip-effect="dark"
            >
              <el-table-column
                :prop="item.prop"
                :label="item.label"
                v-for="item in tableMaskColumns"
                :key="item.prop"
              ></el-table-column>
            </datablau-table>
            <template slot="buttons">
              <datablau-pagination
                v-if="
                  !(
                    activeName === 'visitorConfig' &&
                    strategyType === 'ACCESS_STRATEGY'
                  )
                "
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
                :current-page="pagination.currentPage"
                :page-sizes="[20, 50, 100, 200]"
                :page-size="pagination.pageSize"
                layout="total, sizes, prev, pager, next"
                :pager-count="5"
                class="page"
                :total="pagination.total"
              ></datablau-pagination>
            </template>
          </datablau-form-submit>
        </template>
        <template v-if="strategyType === 'ACCESS_DATAMASK_COLUMN'">
          <datablau-form-submit :style="{ top: '73px' }">
            <datablau-table
              height="100%"
              v-loading="tableLoading"
              ref="deTable"
              :data="tableData"
              tooltip-effect="dark"
            >
              <el-table-column
                :prop="item.prop"
                :label="item.label"
                v-for="item in rowMaskColumns[visitorType]"
                :key="item.prop"
                show-overflow-tooltip
              >
                <template slot-scope="scope">
                  <template v-if="item.prop === 'maskRule'">
                    <span class="mask-rule">
                      <is-show-tooltip
                        :content="scope.row.maskRule"
                        :open-delay="200"
                        placement="top"
                      ></is-show-tooltip>
                    </span>
                  </template>
                  <template v-else-if="item.prop === 'roles'">
                    {{ (scope.row.roles || []).join(',') }}
                  </template>
                  <template v-else>
                    {{ scope.row[item.prop] }}
                  </template>
                </template>
              </el-table-column>
            </datablau-table>

            <template slot="buttons">
              <datablau-pagination
                v-if="
                  !(
                    activeName === 'visitorConfig' &&
                    strategyType === 'ACCESS_STRATEGY'
                  )
                "
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
                :current-page="pagination.currentPage"
                :page-sizes="[20, 50, 100, 200]"
                :page-size="pagination.pageSize"
                layout="total, sizes, prev, pager, next"
                :pager-count="5"
                class="page"
                :total="pagination.total"
              ></datablau-pagination>
            </template>
          </datablau-form-submit>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import api from '../../util/api'
import userConfig from '@/view/dataSecurity/accessStrategy/components/userConfig'
import { getAssetIcon, getSensitive } from '@/view/dataSecurity/util/util.js'
import TableCell from '@/view/dataSecurity/components/tableCell.vue'
import isShowTooltip from '@/view/dataSecurity/components/isShowTooltip.vue'
export default {
  name: 'StrategyDetails',
  props: {
    strategyType: {
      type: String,
      default: '',
    },
    id: {
      type: Number,
      default: 0,
    },
    breadcrumbNodes: {
      type: Array,
      default() {
        return []
      },
    },
  },
  components: { userConfig, TableCell, isShowTooltip },
  provide() {
    return {
      accessControlId: this.id,
    }
  },
  data() {
    return {
      getSensitive: getSensitive,
      getAssetIcon: getAssetIcon,
      activeName: '',
      visitorType: 'USER',
      visitorKeyword: '',
      loading: false,
      personnelList: [],
      pagination: {
        currentPage: 1,
        pageSize: 20,
        total: 0,
        sort: 'DESC',
      },
      baseInfo: {},
      userTableData: [],
      tableData: null,
      allTableData: [],
      tableLoading: false,
      showWhite: true,
      showBlack: true,
      whiteList: [],
      blackList: [],
    }
  },
  computed: {
    visitorPlaceholder() {
      if (this.visitorType === 'USER')
        return this.strategyType === 'ACCESS_STRATEGY'
          ? this.$t('accessStrategy.searchNames1')
          : this.$t('accessStrategy.searchNames2')
      if (this.visitorType === 'GROUP')
        return this.$t('accessStrategy.searchGroupName')
      if (this.visitorType === 'ORGANIZATION')
        return this.$t('accessStrategy.searchOrganizationName')
    },
    visitorTabs() {
      return [
        { name: this.$t('accessStrategy.user'), value: 'USER' },
        { name: this.$t('accessStrategy.userGroups'), value: 'GROUP' },
        {
          name: this.$t('accessStrategy.organization'),
          value: 'ORGANIZATION',
        },
      ]
    },
    userConfigColumns() {
      return {
        ACCESS_STRATEGY: {
          USER: [
            { prop: 'username', label: this.$t('accessStrategy.loginName') },
            { prop: 'fullUserName', label: this.$t('accessStrategy.fullname') },
            {
              prop: 'orgFullName',
              label: this.$t('accessStrategy.norOrganization'),
            },
            { prop: 'title', label: this.$t('accessStrategy.position') },
            { prop: 'roles', label: this.$t('accessStrategy.systemRole') },
            {
              prop: 'phoneNumber',
              label: this.$t('accessStrategy.contactInfo'),
            },
            {
              prop: 'actionList',
              label: this.$t('accessStrategy.dataExecutionAction'),
            },
          ],
          GROUP: [
            { prop: 'groupName', label: this.$t('accessStrategy.groupName') },
            {
              prop: 'actionList',
              label: this.$t('accessStrategy.dataExecutionAction'),
            },
          ],
          ORGANIZATION: [
            { prop: 'orgName', label: this.$t('accessStrategy.orgName') },
            {
              prop: 'actionList',
              label: this.$t('accessStrategy.dataExecutionAction'),
            },
          ],
        },
        ACCESS_DATAMASK_TABLE: {
          USER: [
            { prop: 'loginName', label: this.$t('accessStrategy.loginName') },
            { prop: 'name', label: this.$t('accessStrategy.fullname') },
            {
              prop: 'orgName',
              label: this.$t('accessStrategy.norOrganization'),
            },
            { prop: 'position', label: this.$t('accessStrategy.position') },
            { prop: 'roles', label: this.$t('accessStrategy.systemRole') },
            {
              prop: 'phoneNumber',
              label: this.$t('accessStrategy.contactInfo'),
            },
          ],
          GROUP: [
            { prop: 'groupName', label: this.$t('accessStrategy.groupName') },
          ],
          ORGANIZATION: [
            { prop: 'orgName', label: this.$t('accessStrategy.orgName') },
          ],
        },
      }
    },
    tableVisitColumns() {
      return [
        { prop: 'schemaName', label: 'Schema' },
        { prop: 'tableName', label: this.$t('securityModule.tableView') },
        { prop: 'columnName', label: this.$t('securityModule.columnName') },
      ]
    },
    rowVisitColumns() {
      return {
        USER: [
          { prop: 'username', label: this.$t('accessStrategy.loginName') },
          { prop: 'fullUserName', label: this.$t('accessStrategy.fullname') },
          {
            prop: 'orgFullName',
            label: this.$t('accessStrategy.norOrganization'),
          },
          { prop: 'title', label: this.$t('accessStrategy.position') },
          { prop: 'roles', label: this.$t('accessStrategy.systemRole') },
          { prop: 'phoneNumber', label: this.$t('accessStrategy.contactInfo') },
          { prop: 'dto', label: this.$t('accessStrategy.rowData') },
        ],
        GROUP: [
          { prop: 'groupName', label: this.$t('accessStrategy.groupName') },
          { prop: 'dto', label: this.$t('accessStrategy.rowData') },
        ],
        ORGANIZATION: [
          { prop: 'fullName', label: this.$t('accessStrategy.orgName') },
          { prop: 'dto', label: this.$t('accessStrategy.rowData') },
        ],
      }
    },
    tableMaskColumns() {
      return [
        { prop: 'name', label: this.$t('securityModule.columnName') },
        {
          prop: 'maskRule',
          label: this.$t('securityModule.desensitizationRules'),
        },
      ]
    },
    rowMaskColumns() {
      return {
        USER: [
          { prop: 'loginName', label: this.$t('accessStrategy.loginName') },
          { prop: 'name', label: this.$t('accessStrategy.fullname') },
          { prop: 'orgName', label: this.$t('accessStrategy.norOrganization') },
          { prop: 'position', label: this.$t('accessStrategy.position') },
          { prop: 'roles', label: this.$t('accessStrategy.systemRole') },
          { prop: 'phoneNumber', label: this.$t('accessStrategy.contactInfo') },
          {
            prop: 'maskRule',
            label: this.$t('securityModule.desensitizationRules'),
          },
        ],
        GROUP: [
          { prop: 'groupName', label: this.$t('accessStrategy.groupName') },
          {
            prop: 'maskRule',
            label: this.$t('securityModule.desensitizationRules'),
          },
        ],
        ORGANIZATION: [
          {
            prop: 'orgName',
            label: this.$t('accessStrategy.organizationName'),
          },
          {
            prop: 'maskRule',
            label: this.$t('securityModule.desensitizationRules'),
          },
        ],
      }
    },
    strategyTypeMap() {
      return {
        ACCESS_STRATEGY: this.$t('accessStrategy.accessPolicy'),
        ACCESS_ROW_STRATEGY: this.$t('accessStrategy.rowLevelAccessPolicy'),
        ACCESS_DATAMASK_COLUMN: this.$t(
          'accessStrategy.fieldDesensitizationStrategy'
        ),
        ACCESS_DATAMASK_TABLE: this.$t(
          'accessStrategy.tableDesensitizationStrategy'
        ),
      }
    },
  },
  async mounted() {
    this.visitorKeyword = ''
    const type = this.strategyType
    if (type === 'ACCESS_STRATEGY') {
      this.activeName = 'tableVisitConfig'
      this.visitorType = 'USER'
      await this.getAccessStrategyObjectInfo()
    }
    if (type === 'ACCESS_DATAMASK_TABLE') {
      this.activeName = 'tableMaskConfig'
      this.visitorType = ''
      await this.getTableMaskRuleInfo()
    }
    if (type === 'ACCESS_ROW_STRATEGY') {
      this.visitorType = 'USER'
      this.activeName = ''
      await this.getRowAccessStrategyInfo()
    }
    if (type === 'ACCESS_DATAMASK_COLUMN') {
      this.visitorType = 'USER'
      this.activeName = ''
      await this.getColumnMaskDetails()
    }
    await this.getStrategyBaseInfo()
    this.handleTabContentHeight()
  },
  methods: {
    handleClick(val) {
      this[val] = !this[val]
    },
    handleVisitorKeywordChange() {
      console.log(this.visitorKeyword)
      if (this.strategyType === 'ACCESS_STRATEGY') {
        this.getAccessStrategyVisitorInfo({
          currentPage: 1,
        })
      }
      if (this.strategyType === 'ACCESS_DATAMASK_TABLE') {
        this.getTableMaskVisitorInfo()
      }
      if (this.strategyType === 'ACCESS_DATAMASK_COLUMN') {
        this.getColumnMaskDetails()
      }
      if (this.strategyType === 'ACCESS_ROW_STRATEGY') {
        this.tableData = null
        this.getRowAccessStrategyInfo()
      }
    },
    formatRowRules(dto) {
      const { connector, dtos, rowLimit } = dto
      let sql = ``
      dtos.forEach((item, i) => {
        let sqlItem = '('
        item.conditionDtos.length < 2 && (item.connector = '')
        item.conditionDtos.forEach((aryItem, index) => {
          // let name = nameId[1]
          let value = aryItem.connector
          if (aryItem.connector === 'like') {
            value = this.$t('accessStrategy.contain')
          } else if (aryItem.connector === 'not in') {
            value = this.$t('accessStrategy.notBelongTo')
          } else if (aryItem.connector === 'in') {
            value = this.$t('accessStrategy.belongTo')
          } else if (aryItem.connector === 'is null') {
            value = this.$t('accessStrategy.empty')
          } else if (aryItem.connector === 'is not null') {
            value = this.$t('accessStrategy.notEmpty')
          }
          sqlItem += this.$t('accessStrategy.sqlTip', {
            name: aryItem.name,
            value: value,
            value1: aryItem.value,
          })
          index != item.conditionDtos.length - 1 &&
            (sqlItem += `${
              item.connector == 'OR'
                ? this.$t('securityModule.or')
                : this.$t('securityModule.and')
            }`)
        })
        sqlItem += ')'
        if (i != dtos.length - 1) {
          sql += `${sqlItem} ${
            connector == 'OR'
              ? this.$t('securityModule.or')
              : this.$t('securityModule.and')
          } `
        } else {
          sql += `${sqlItem} `
        }
      })
      rowLimit &&
        (sql += `，${this.$t('accessStrategy.rowLimit', {
          limit: rowLimit,
        })}`)
      return sql
    },
    async getStrategyBaseInfo() {
      const res = await api.accessStrategyBaseInfo(this.id, true)
      if (res.data.status === 200) {
        this.baseInfo = {
          ...res.data.data.dto,
          source:
            this.strategyType === 'ACCESS_DATAMASK_COLUMN'
              ? res.data.data.source + `/${res.data.data.physicalName}`
              : res.data.data.source,
        }
      }
    },
    // 访问策略 - 访问者配置
    getAccessStrategyVisitorInfo(defaultParams = {}) {
      const params = {
        strategyId: this.id,
        visitorType: this.visitorType,
        currentPage: this.pagination.currentPage,
        pageSize: this.pagination.pageSize,
        keyword: this.visitorKeyword,
        sort: this.pagination.sort || 'DESC',
        ...defaultParams,
      }
      this.tableLoading = true
      api
        .getStrategyVisitorDetails(params)
        .then(res => {
          // console.log('visitor', res)
          if (
            res.data.status === 200 &&
            this.visitorType === params.visitorType
          ) {
            this.tableData = res.data.data.content
            this.pagination = {
              currentPage: params.currentPage,
              pageSize: params.pageSize,
              total: res.data.data.totalItems,
              sort: params.sort,
            }
          }
          this.tableLoading = false
        })
        .catch(error => {
          this.tableLoading = false
          this.$showFailure(error)
        })
    },
    // 访问策略 - 访问数据配置
    async getAccessStrategyObjectInfo(defaultParams = {}) {
      const params = {
        strategyId: this.id,
        currentPage: this.pagination.currentPage,
        pageSize: this.pagination.pageSize,
        sort: this.pagination.sort,
        ...defaultParams,
      }
      this.tableLoading = true
      try {
        const res = await api.getStrategyObjectDetails(params)
        if (res.data.status === 200) {
          this.tableData = res.data.data.content
          this.pagination = {
            currentPage: params.currentPage,
            pageSize: params.pageSize,
            total: res.data.data.totalItems,
          }
        }
        this.tableLoading = false
      } catch (error) {
        this.tableLoading = false
        this.$showFailure(error)
      }
    },
    // 表脱敏策略 - 脱敏规则
    async getTableMaskRuleInfo(defaultParams = {}) {
      try {
        const res = await api.getTableMaskDetail({
          accessId: this.id,
        })

        if (res.data.status === 200) {
          const allTableData = res.data.data || []
          this.allTableData = allTableData
          this.tableData = allTableData.slice(0, 20)
          this.pagination = {
            currentPage: 1,
            pageSize: 20,
            total: allTableData.length,
          }
        }
      } catch (error) {
        this.tableLoading = false
        this.$showFailure(error)
      }
    },
    // 表脱敏 - 访问者配置
    getTableMaskVisitorInfo(defaultParams = {}) {
      const params = {
        accessId: this.id,
        scopeType: this.visitorType,
        currentPage: 1,
        pageSize: 20,
      }
      api
        .getTableScopedMaskDetail({
          ...params,
          scopeType: params.scopeType === 'USER' ? 'PERSON' : params.scopeType,
        })
        .then(res => {
          if (res.data.status === 200) {
            const allTableData = (
              res.data.data.scopeDetailDtoList || []
            ).filter(
              item =>
                (
                  item.loginName +
                  item.groupName +
                  item.orgName +
                  item.name
                ).indexOf(this.visitorKeyword) !== -1
            )
            const startIndex = params.pageSize * (params.currentPage - 1)
            this.allTableData = allTableData
            this.tableData = allTableData.slice(startIndex, params.pageSize)
            this.pagination = {
              currentPage: params.currentPage,
              pageSize: params.pageSize,
              total: allTableData.length,
            }
          }
        })
    },
    // 字段脱敏 - 脱敏规则
    async getColumnMaskDetails(defaultParams = {}) {
      const params = {
        accessId: this.id,
        scopeType: this.visitorType,
      }
      try {
        const res = await api.getColumnMaskDetail({
          ...params,
          scopeType: params.scopeType === 'USER' ? 'PERSON' : params.scopeType,
        })
        if (res.data.status === 200) {
          let nameKey = {
            USER: ['loginName', 'name'],
            GROUP: ['groupName', 'groupName'],
            ORGANIZATION: ['orgName', 'orgName'],
          }
          const allTableData = (res.data.data.detailDtoList || []).filter(
            item =>
              (
                item[nameKey[params.scopeType][0]] +
                item[nameKey[params.scopeType][1]]
              ).indexOf(this.visitorKeyword) !== -1
          )
          this.allTableData = allTableData
          this.tableData = allTableData.slice(0, 20)
          this.pagination = {
            currentPage: 1,
            pageSize: 20,
            total: allTableData.length,
          }
        }
      } catch (error) {
        this.tableLoading = false
        this.$showFailure(error)
      }
    },
    // 行级访问策略 详情
    async getRowAccessStrategyInfo(defaultParams = {}) {
      const params = {
        id: this.id,
        scopeType: this.visitorType,
      }
      try {
        const res = await api.rowPolicyDetail({
          ...params,
          scopeType: params.scopeType === 'USER' ? 'PERSON' : params.scopeType,
        })

        let scopeTypeMap = {
          USER: ['userStrategy', 'userDto', 'fullUserName', 'username'],
          GROUP: ['groupStrategy', 'groupDto', 'groupName', 'groupName'],
          ORGANIZATION: [
            'orgStrategy',
            'organizationDto',
            'fullName',
            'fullName',
          ],
        }
        const resData = res.data.data[scopeTypeMap[params.scopeType][0]] || []
        let allTableData = resData
          .map(item => ({
            ...item[scopeTypeMap[params.scopeType][1]],
            dto: item.dto,
          }))
          .filter(
            i =>
              (
                i[scopeTypeMap[params.scopeType][2]] +
                i[scopeTypeMap[params.scopeType][3]]
              ).indexOf(this.visitorKeyword) !== -1
          )
        this.allTableData = allTableData
        this.tableData = allTableData.slice(0, 20)
        this.pagination = {
          currentPage: 1,
          pageSize: 20,
          total: allTableData.length,
        }
      } catch (error) {
        this.tableLoading = false
        this.$showFailure(error)
      }
    },
    handleTabContentHeight() {
      const detailsDom = document.getElementsByClassName('detailsCom')[0]
      const tableDom = document.getElementsByClassName('tabContent')[0]
      const nameDom = document.getElementsByClassName('conName')[0]
      tableDom.style.top =
        (nameDom.clientHeight > 290 ? 290 : nameDom.clientHeight) +
        (this.strategyType === 'ACCESS_STRATEGY' ||
        this.strategyType === 'ACCESS_DATAMASK_TABLE'
          ? 80
          : 40) +
        'px'
      // tableDom.style.height =
      //   detailsDom.clientHeight -
      //   (nameDom.clientHeight > 200 ? 200 : nameDom.clientHeight) -
      //   40 -
      //   (this.strategyType === 'ACCESS_STRATEGY' ||
      //   this.strategyType === 'ACCESS_DATAMASK_TABLE'
      //     ? 60
      //     : 5) +
      //   'px'
    },
    cancel() {
      this.$emit('cancel')
    },
    handleInfoTabClick(node) {
      const name = node.name
      // 查询 访问数据配置，或者 访问者配置下的 用户 列表
      if (name === 'tableVisitConfig') {
        this.getAccessStrategyObjectInfo({
          currentPage: 1,
          sort: 'DESC',
        })
      }
      if (name === 'tableMaskConfig') {
        this.getTableMaskRuleInfo()
      }
      if (name === 'visitorConfig') {
        this.visitorType = 'USER'
        // if (this.strategyType === 'ACCESS_STRATEGY') {
        //   this.getAccessStrategyVisitorInfo({
        //     visitorType: 'USER',
        //     currentPage: 1,
        //     sort: 'DESC',
        //   })
        // }
        if (this.strategyType === 'ACCESS_DATAMASK_TABLE') {
          this.getTableMaskVisitorInfo({
            scopeType: 'USER',
          })
        }
      }
    },
    handleVisitorTabClick(node) {
      const visitorType = node.value || node.name
      this.visitorType = visitorType
      this.visitorKeyword = ''
      this.tableData = []
      if (this.strategyType === 'ACCESS_STRATEGY') {
        this.getAccessStrategyVisitorInfo({
          visitorType,
          currentPage: 1,
          sort: 'desc',
        })
      }
      if (this.strategyType === 'ACCESS_DATAMASK_TABLE') {
        this.getTableMaskVisitorInfo({
          scopeType: visitorType,
        })
      }
      if (this.strategyType === 'ACCESS_ROW_STRATEGY') {
        this.getRowAccessStrategyInfo({
          scopeType: visitorType,
        })
      }
      if (this.strategyType === 'ACCESS_DATAMASK_COLUMN') {
        this.getColumnMaskDetails({
          scopeType: visitorType,
        })
      }
    },
    refreshTableData(params) {
      // 表访问策略
      if (this.strategyType === 'ACCESS_STRATEGY') {
        if (this.activeName === 'tableVisitConfig') {
          this.getAccessStrategyObjectInfo(params)
        }
        if (this.activeName === 'visitorConfig') {
          this.getAccessStrategyVisitorInfo(params)
        }
      }
      // 表脱敏，字段脱敏，行级访问策略 前端分页
      if (
        this.strategyType === 'ACCESS_DATAMASK_TABLE' ||
        this.strategyType === 'ACCESS_DATAMASK_COLUMN' ||
        this.strategyType === 'ACCESS_ROW_STRATEGY'
      ) {
        // 前端分页
        const start =
          (this.pagination.currentPage - 1) * this.pagination.pageSize
        const end = start + this.pagination.pageSize
        this.tableData = this.allTableData.slice(start, end)
      }
    },
    handleSizeChange(size) {
      this.pagination.pageSize = size
      this.pagination.currentPage = 1
      // this.getShowData()
      this.refreshTableData({
        currentPage: 1,
        pageSize: size,
      })
    },
    handleCurrentChange(page) {
      this.pagination.currentPage = page
      this.refreshTableData({
        currentPage: page,
      })
    },
  },
}
</script>
<style lang="scss">
.strategy-rule-card-popover {
  height: 300px;
  .strategy-column-info {
    position: relative;
    height: 100%;
    .title {
      .name-content {
        display: inline-block;
        vertical-align: middle;
        width: calc(100% - 100px);
      }
    }
    .column-box {
      position: absolute;
      left: 0;
      right: 0;
      top: 24px;
      bottom: 0;
    }
  }
}
</style>
<style scoped lang="scss">
.detailsCom {
  width: 100%;
  height: 100%;
  .tile {
    margin: 0 20px;
    padding-top: 8px;
    height: 40px;
    border-bottom: 1px solid #e0e0e0;
  }
  .conName {
    padding: 0 20px;
    /deep/.db-detail-subtitle {
      width: 100%;
      overflow: hidden;
    }
  }
  .tabs-nav {
    padding: 0 20px;
  }
  .tabContent {
    margin-top: 0;
    position: absolute;
    bottom: 0;
    left: 0px;
    right: 0px;
    > div {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      /deep/ .datablau-tabs {
        padding: 0 20px;
      }
      .user-tab {
        padding: 0 20px;
      }
    }
    /deep/ .form-submit {
    }
    .row-rule {
      display: inline-block;
      max-width: 360px;
      background: rgba(78, 133, 247, 0.1);
      border-radius: 2px;
      height: 24px;
      line-height: 24px;
      padding: 0px 8px;
      color: #4e85f7;
      vertical-align: middle;
      // overflow: hidden; //超出隐藏
      // white-space: nowrap; //不折行
      // text-overflow: ellipsis; //溢出显示省略号
    }
    .mask-rule {
      display: inline-block;
      background: rgba(111, 84, 235, 0.1);
      border-radius: 2px;
      max-width: 200px;
      padding: 0 8px;
      height: 24px;
      line-height: 24px;
      color: #6f54eb;
      vertical-align: middle;
    }
  }
}

.nameBox {
  overflow: hidden;
  float: left;
  margin-top: 16px;
  .iconbox {
    width: 48px;
    height: 48px;
    // background: rgba(64, 158, 255, 0.1);
    float: left;
  }
  .strategyName {
    font-size: 16px;
    margin-left: 16px;
    float: left;
    line-height: 1;
    height: 48px;
    i {
      color: #409eff;
      cursor: pointer;
    }
    & > div {
      margin-top: 9px;

      & > span {
        font-size: 14px;
        // margin-right: 24px;
      }
      .priority {
        &::before {
          content: '';
          display: inline-block;
          width: 8px;
          height: 8px;
          border-radius: 2px;
          background: #f2220a;
          margin-right: 4px;
          position: relative;
          top: -2px;
        }
      }
      .data-source-value {
        max-width: 640px;
        height: 20px;
        line-height: 20px;
        vertical-align: middle;

        /deep/.el-tooltip {
          height: 20px;
          line-height: 20px;
          vertical-align: top;
        }
      }
    }
    & > p {
      padding-top: 3px;
    }
  }
}
.status-box {
  float: right;
  height: 48px;
  margin-top: 16px;
  .status-item {
    display: inline-block;
    padding: 0 16px;
    border-left: 1px solid #dcdfe6;
    & > p {
      font-size: 12px;
      font-weight: 400;
      color: #555;
    }
    &.type > span {
      display: inline-block;
      padding: 1.5px 6px;
      border-radius: 2px;
      color: #6f54eb;
      background-color: transparentize($color: #6f54eb, $amount: 0.9);
      // zoom: 0.8;
      transform: scale(0.8);
      transform-origin: left;
      line-height: 20px;
    }
    &.action > span {
      display: inline-block;
      padding: 1.5px 6px;
      font-size: 12px;
      background: #fff;
      transform: scale(0.9);
      transform-origin: left;
    }
    &.action > span.allow {
      color: #66bf16;
    }
    &.action > span.deny {
      color: #f2220a;
    }
  }
  &.ACCESS_STRATEGY {
    .status-item.type > span {
      color: #29c1af;
      background-color: transparentize($color: #29c1af, $amount: 0.9);
    }
  }
  &.ACCESS_ROW_STRATEGY {
    .status-item.type > span {
      color: #4e85f7;
      background-color: transparentize($color: #4e85f7, $amount: 0.9);
    }
  }
}
.noData {
  color: #999;
  padding-left: 12px;
  height: 40px;
  line-height: 40px;
  // margin-bottom: 8px;
  img {
    margin-right: 12px;
    width: 31px;
  }
}
/deep/.el-tab-pane {
  padding: 0;
}

.user-tab {
  overflow: hidden;
  margin-bottom: 8px;
  & > div {
    float: left;
  }
  .keyInput {
    margin-left: 20px;
  }
}

.con {
  padding: 0;
  .lineBox {
    position: relative;
    font-size: 14px;
    font-weight: 600;
    color: #555;
    &:after {
      content: '';
      height: 1px;
      background: #efefef;
      position: absolute;
      top: 12px;
      left: 75px;
      right: 0px;
    }
    span {
      display: inline-block;
    }
  }
  .is-block.icon {
    color: #999;
  }
  .drop {
    display: inline-block;
    width: 16px;
    height: 16px;
    background: rgba(64, 158, 255, 0.1);
    border-radius: 15px;
    margin-right: 4px;
    position: relative;
    top: 3px;
  }
  .whitelist {
    padding-bottom: 32px;
  }
}
</style>
