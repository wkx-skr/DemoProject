<template>
  <div class="detailsCom">
    <div class="tile">
      <datablau-breadcrumb
        :node-data="nodeDatas"
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
            <!-- <datablau-button type="icon">
              <i class="iconfont icon-bianji"></i>
            </datablau-button> -->
          </p>
          <div>
            <!-- <span>引用安全策略：{{ baseInfo.securityStrategyName }}</span> -->
            <!-- <el-divider direction="vertical"></el-divider> -->
            <!-- <span v-if="baseInfo.actionList">
              数据访问动作：{{ baseInfo.actionList.join(',') }}
            </span> -->
            <!-- <el-divider direction="vertical"></el-divider> -->
            <span>
              权威来源：
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
          <p>访控策略类型</p>
          <span>{{ strategyTypeMap[strategyType] }}</span>
        </div>
        <div
          v-if="strategyType === 'ACCESS_STRATEGY'"
          class="status-item action"
        >
          <p>数据访问动作</p>
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
              baseInfo.allow ? '允许' : baseInfo.allow === false ? '拒绝' : ''
            }}
          </span>
        </div>
      </div>
      <datablau-detail-subtitle
        title="描述信息"
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
        <img src="static/kgimg/noresult.svg" alt="" />
        <span>{{ $t('assets.common.noInfo') }}</span>
      </p>
    </div>
    <datablau-tabs
      v-if="
        strategyType !== 'ACCESS_ROW_STRATEGY' &&
        strategyType !== 'ACCESS_DATAMASK_COLUMN'
      "
      v-model="activeName"
      @tab-click="handleInfoTabClick"
    >
      <el-tab-pane
        v-if="strategyType === 'ACCESS_STRATEGY'"
        label="访问数据"
        name="tableVisitConfig"
      ></el-tab-pane>

      <el-tab-pane
        v-if="strategyType === 'ACCESS_DATAMASK_TABLE'"
        label="脱敏规则"
        name="tableMaskConfig"
      ></el-tab-pane>

      <el-tab-pane
        v-if="
          strategyType === 'ACCESS_STRATEGY' ||
          strategyType === 'ACCESS_DATAMASK_TABLE'
        "
        label="访问者"
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
          <el-tab-pane label="用户" name="USER"></el-tab-pane>
          <el-tab-pane label="用户组" name="GROUP"></el-tab-pane>
          <el-tab-pane label="组织机构" name="ORGANIZATION"></el-tab-pane>
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
        <datablau-tabs v-model="visitorType" @tab-click="handleVisitorTabClick">
          <el-tab-pane label="用户" name="USER"></el-tab-pane>
          <el-tab-pane label="用户组" name="GROUP"></el-tab-pane>
          <el-tab-pane label="组织机构" name="ORGANIZATION"></el-tab-pane>
        </datablau-tabs>
        <datablau-input
          v-model="visitorKeyword"
          :iconfont-state="true"
          :placeholder="visitorPlaceholder"
          class="keyInput"
          clearable
          style="margin-top: 10px"
          @change="handleVisitorKeywordChange"
        ></datablau-input>
      </div>
      <datablau-form-submit
        class="table-row"
        :style="{
          top:
            activeName === 'visitorConfig'
              ? strategyType === 'ACCESS_STRATEGY'
                ? '10px'
                : '40px'
              : strategyType === 'ACCESS_ROW_STRATEGY' ||
                strategyType === 'ACCESS_DATAMASK_COLUMN'
              ? '73px'
              : 0,
          left: '-20px',
          right: '-20px',
          bottom:
            activeName === 'visitorConfig' && strategyType === 'ACCESS_STRATEGY'
              ? '20px'
              : 0,
        }"
      >
        <datablau-table v-show="false"></datablau-table>
        <template v-if="activeName === 'visitorConfig'">
          <template v-if="strategyType === 'ACCESS_STRATEGY'">
            <div class="con">
              <div class="lineBox">
                <datablau-button type="icon" @click="handleClick('showWhite')">
                  <i class="el-icon-arrow-down upDow" v-if="showWhite"></i>
                  <i class="el-icon-arrow-up" v-else></i>
                </datablau-button>
                <span>白名单</span>
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
                <datablau-button type="icon" @click="handleClick('showBlack')">
                  <i class="el-icon-arrow-down upDow" v-if="showBlack"></i>
                  <i class="el-icon-arrow-up" v-else></i>
                </datablau-button>
                <span>黑名单</span>
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
          </template>
          <template v-else>
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
              >
                <template slot-scope="scope">
                  <template v-if="item.prop === 'roles'">
                    {{ scope.row.roles ? scope.row.roles.join(',') : '' }}
                  </template>
                  <template v-else-if="item.prop === 'actionList'">
                    {{
                      scope.row.actionList ? scope.row.actionList.join(',') : ''
                    }}
                  </template>
                  <template v-else>
                    {{ scope.row[item.prop] }}
                  </template>
                </template>
              </el-table-column>
            </datablau-table>
          </template>
        </template>
        <datablau-table
          height="100%"
          v-loading="tableLoading"
          ref="deTable"
          :data="tableData"
          tooltip-effect="dark"
          v-if="activeName === 'tableVisitConfig'"
        >
          <!-- <el-table-column
              :prop="item.prop"
              :label="item.label"
              v-for="item in tableVisitColumns"
              :key="item.prop"
            ></el-table-column> -->
          <el-table-column prop="schemaName" label="Schema"></el-table-column>
          <el-table-column prop="tableName" label="表/视图"></el-table-column>
          <el-table-column prop="columnName" label="字段"></el-table-column>
        </datablau-table>
        <datablau-table
          height="100%"
          v-loading="tableLoading"
          ref="deTable"
          :data="tableData"
          tooltip-effect="dark"
          v-if="strategyType === 'ACCESS_ROW_STRATEGY'"
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
        <datablau-table
          height="100%"
          v-loading="tableLoading"
          ref="deTable"
          :data="tableData"
          tooltip-effect="dark"
          v-if="activeName === 'tableMaskConfig'"
        >
          <el-table-column
            :prop="item.prop"
            :label="item.label"
            v-for="item in tableMaskColumns"
            :key="item.prop"
          ></el-table-column>
        </datablau-table>
        <datablau-table
          height="100%"
          v-loading="tableLoading"
          ref="deTable"
          :data="tableData"
          tooltip-effect="dark"
          v-if="strategyType === 'ACCESS_DATAMASK_COLUMN'"
        >
          <el-table-column
            :prop="item.prop"
            :label="item.label"
            v-for="item in rowMaskColumns[visitorType]"
            :key="item.prop"
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
    </div>
  </div>
</template>

<script>
import IsShowTooltip from '@/view/dataProperty/meta/isShowTooltip.vue'
import api from '../../util/api'
import userConfig from '@/view/dataSecurity/accessStrategy/components/userConfig'
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
  },
  components: { IsShowTooltip, userConfig },
  provide() {
    return {
      accessControlId: this.id,
    }
  },
  data() {
    return {
      nodeDatas: ['访问策略管理', '查看策略'],
      activeName: '',
      visitorTabs: [
        { name: '用户', value: 'USER' },
        { name: '用户组', value: 'GROUP' },
        {
          name: '组织机构',
          value: 'ORGANIZATION',
        },
      ],
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
      userConfigColumns: {
        ACCESS_STRATEGY: {
          USER: [
            { prop: 'username', label: '登录名' },
            { prop: 'fullUserName', label: '姓名' },
            { prop: 'orgFullName', label: '所属机构' },
            { prop: 'title', label: '职位' },
            { prop: 'roles', label: '系统角色' },
            { prop: 'phoneNumber', label: '联系方式' },
            { prop: 'actionList', label: '数据执行动作' },
          ],
          GROUP: [
            { prop: 'groupName', label: '用户组名称' },
            { prop: 'actionList', label: '数据执行动作' },
          ],
          ORGANIZATION: [
            { prop: 'orgName', label: '组织名称' },
            { prop: 'actionList', label: '数据执行动作' },
          ],
        },
        ACCESS_DATAMASK_TABLE: {
          USER: [
            { prop: 'loginName', label: '登录名' },
            { prop: 'name', label: '姓名' },
            { prop: 'orgName', label: '所属机构' },
            { prop: 'position', label: '职位' },
            { prop: 'roles', label: '系统角色' },
            { prop: 'phoneNumber', label: '联系方式' },
          ],
          GROUP: [{ prop: 'groupName', label: '用户组名称' }],
          ORGANIZATION: [{ prop: 'orgName', label: '组织名称' }],
        },
      },
      tableVisitColumns: [
        { prop: 'schemaName', label: 'Schema' },
        { prop: 'tableName', label: '表/视图' },
        { prop: 'columnName', label: '字段' },
      ],
      rowVisitColumns: {
        USER: [
          { prop: 'username', label: '登录名' },
          { prop: 'fullUserName', label: '姓名' },
          { prop: 'orgFullName', label: '所属机构' },
          { prop: 'title', label: '职位' },
          { prop: 'roles', label: '系统角色' },
          { prop: 'phoneNumber', label: '联系方式' },
          { prop: 'dto', label: '行级数据' },
        ],
        GROUP: [
          { prop: 'groupName', label: '用户组名称' },
          { prop: 'dto', label: '行级数据' },
        ],
        ORGANIZATION: [
          { prop: 'fullName', label: '组织名称' },
          { prop: 'dto', label: '行级数据' },
        ],
      },
      tableMaskColumns: [
        { prop: 'name', label: '字段名称' },
        { prop: 'maskRule', label: '脱敏规则' },
      ],
      rowMaskColumns: {
        USER: [
          { prop: 'loginName', label: '登录名' },
          { prop: 'name', label: '姓名' },
          { prop: 'orgName', label: '所属机构' },
          { prop: 'position', label: '职位' },
          { prop: 'roles', label: '系统角色' },
          { prop: 'phoneNumber', label: '联系方式' },
          { prop: 'maskRule', label: '脱敏规则' },
        ],
        GROUP: [
          { prop: 'groupName', label: '用户组名称' },
          { prop: 'maskRule', label: '脱敏规则' },
        ],
        ORGANIZATION: [
          { prop: 'orgName', label: '机构名称' },
          { prop: 'maskRule', label: '脱敏规则' },
        ],
      },
      strategyTypeMap: {
        ACCESS_STRATEGY: '访问策略',
        ACCESS_ROW_STRATEGY: '行级访问策略',
        ACCESS_DATAMASK_COLUMN: '字段脱敏策略',
        ACCESS_DATAMASK_TABLE: '表脱敏策略',
      },
      tableData: null,
      allTableData: [],
      tableLoading: false,
      showWhite: true,
      showBlack: true,
      whiteList: [],
      blackList: [],
    }
  },
  created() {
    this.nodeDatas[1] = this.strategyTypeMap[this.strategyType]
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
            value = `包含`
          } else if (aryItem.connector === 'not in') {
            value = `不属于`
          } else if (aryItem.connector === 'in') {
            value = `属于`
          }
          sqlItem += `字段${aryItem.name}的值${value}'${aryItem.value}'`
          index != item.conditionDtos.length - 1 &&
            (sqlItem += `${item.connector == 'OR' ? '或' : '且'}`)
        })
        sqlItem += ')'
        if (i != dtos.length - 1) {
          sql += `${sqlItem} ${connector == 'OR' ? '或' : '且'} `
        } else {
          sql += `${sqlItem} `
        }
      })
      rowLimit && (sql += `，行数限制：${rowLimit}行`)
      return sql
    },
    async getStrategyBaseInfo() {
      const res = await api.getStrategyBaseDetails(this.id)
      if (res.data.status === 200) {
        this.baseInfo = {
          ...res.data.data.dto,
          source:
            // res.data.data.source,
            this.strategyType !== 'ACCESS_STRATEGY'
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
          this.$blauShowFailure(error)
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
        this.$blauShowFailure(error)
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
        this.$blauShowFailure(error)
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
        this.$blauShowFailure(error)
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
        this.$blauShowFailure(error)
      }
    },
    handleTabContentHeight() {
      const detailsDom = document.getElementsByClassName('detailsCom')[0]
      const tableDom = document.getElementsByClassName('tabContent')[0]
      const nameDom = document.getElementsByClassName('conName')[0]
      console.log(detailsDom.clientHeight, nameDom.clientHeight)
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
  computed: {
    visitorPlaceholder() {
      if (this.visitorType === 'USER')
        return this.strategyType === 'ACCESS_STRATEGY'
          ? '搜索登录名'
          : '搜索用户名、登录名'
      if (this.visitorType === 'GROUP') return '搜索用户组名'
      if (this.visitorType === 'ORGANIZATION') return '搜索机构名'
    },
  },
}
</script>

<style scoped lang="scss">
.tile {
  height: 40px;
  padding-top: 8px;
  border-bottom: 1px solid #e0e0e0;
}
.detailsCom {
  padding: 0 20px;
  width: 100%;
  height: 100%;
}
.conName {
  /deep/.db-detail-subtitle {
    width: 100%;
    overflow: hidden;
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
        width: 200px;
        margin-top: 2px;
        float: right;

        /deep/.el-tooltip {
          height: 20px;
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
      background: rgba(78, 133, 247, 0.1);
      border-radius: 2px;
      color: #4e85f7;
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
      background-color: rgba(41, 193, 175, 0.1);
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
.tabContent {
  margin-top: 0;
  position: absolute;
  bottom: 0;
  left: 20px;
  right: 20px;
  .row-rule {
    display: inline-block;
    max-width: 240px;
    background: rgba(78, 133, 247, 0.1);
    border-radius: 2px;
    padding: 4px 8px 0 8px;
    color: #4e85f7;
  }
  .mask-rule {
    display: inline-block;
    background: rgba(111, 84, 235, 0.1);
    border-radius: 2px;
    max-width: 200px;
    padding: 4px 8px 0 8px;
    color: #6f54eb;
  }
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
