<template>
  <div class="step-three-page">
    <!-- 脱敏规则弹框 -->
    <desensitize-dia
      ref="desensitize"
      :nowRule="nowRule"
      :showRule="showRule"
      :clickRule="clickRule"
    ></desensitize-dia>
    <select-user
      :dialogVisible="showUserSelect"
      @close="closeUserSelect"
      :userType="activeName"
      :binList="tableData"
      :title="userDialogTitle"
      @primary="handleUserSelect"
    ></select-user>
    <!-- 选择字段 -->
    <table-and-column
      v-if="showTableDialog"
      :visible="showTableDialog"
      :clickTable="clickTable"
      :singleSelect="true"
      :type="'ACCESS_DATAMASK_COLUMN'"
    ></table-and-column>
    <template v-if="assetInfo.assetId">
      <asset-Info :assetInfo="assetInfo" :clickAsset="clickAsset"></asset-Info>
      <datablau-tabs
        v-model="activeName"
        @tab-click="handleTabClick"
        style="padding: 0 20px"
      >
        <el-tab-pane
          :label="$t('accessStrategy.user')"
          name="user"
        ></el-tab-pane>
        <el-tab-pane
          :label="$t('accessStrategy.userGroups')"
          name="group"
        ></el-tab-pane>
        <el-tab-pane
          :label="$t('accessStrategy.organization')"
          name="org"
        ></el-tab-pane>
      </datablau-tabs>
      <div class="content-box">
        <div class="pane-content">
          <div class="search">
            <datablau-input
              :iconfont-state="true"
              :placeholder="tabPlaceholder[activeName]"
              v-model="keyword"
              clearable
              @keyup.native.enter="searchFileName"
              @clear="searchFileName"
            ></datablau-input>
            <datablau-button
              type="normal"
              class="iconfont icon-tianjia"
              style="float: right"
              @click="addVisitors"
            >
              {{ userDialogTitle }}
            </datablau-button>
          </div>
        </div>
        <div class="table-box">
          <datablau-form-submit ref="formSubmit">
            <datablau-table
              height="100%"
              v-loading="loading"
              :loading="loading"
              :data="tableData"
              :data-selectable="true"
              :show-column-selection="false"
              @selection-change="handleSelectionChange"
            >
              <el-table-column
                v-for="item in column"
                :key="item.prop"
                :label="item.label"
                fixed="left"
                :prop="item.prop"
                :min-width="item.minWidth"
                show-overflow-tooltip
              >
                <template scope="{row}">
                  <template v-if="item.prop === 'rule'">
                    <div class="rule-box">
                      <el-tag
                        closable
                        @click="openRule(row)"
                        @close="handleClose(row)"
                        v-if="row.ruleMap && row.ruleMap.id"
                      >
                        <is-show-tooltip
                          :content="row.ruleMap.name"
                          :open-delay="200"
                          placement="top"
                        ></is-show-tooltip>
                      </el-tag>
                      <i
                        class="iconfont icon-tianjia"
                        @click="openRule(row)"
                        v-else
                      ></i>
                    </div>
                  </template>
                  <template v-else-if="item.prop === 'operation'">
                    <datablau-button
                      type="icon"
                      class="iconfont icon-delete"
                      @click="deleteVisitor(row)"
                    ></datablau-button>
                  </template>
                  <template v-else-if="item.prop === 'roles'">
                    {{ row[item.prop] && row[item.prop].join('，') }}
                  </template>
                  <template v-else>{{ row[item.prop] }}</template>
                </template>
              </el-table-column>
            </datablau-table>
            <template slot="buttons">
              <div>
                <template v-if="selectList.length > 0">
                  <span class="check-info"></span>
                  <span class="footer-row-info">
                    {{
                      $t('securityModule.selectNum', {
                        num: selectList.length,
                      })
                    }}
                  </span>
                  <datablau-button
                    type="danger"
                    class="el-icon-delete"
                    @click="delectAry"
                  >
                    {{ $t('securityModule.delete') }}
                  </datablau-button>
                </template>
                <template v-else>
                  <datablau-button type="normal" @click="prev">
                    {{ $t('accessStrategy.back') }}
                  </datablau-button>
                  <datablau-button
                    class="cut-apart-btn"
                    type="important"
                    @click="submit"
                  >
                    {{ $t('securityModule.sure') }}
                  </datablau-button>
                  <datablau-button type="secondary" @click="back">
                    {{ $t('securityModule.cancel') }}
                  </datablau-button>
                </template>
                <!-- <datablau-pagination
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
              :current-page.sync="pagination.pageNum"
              :page-sizes="[20, 50, 100, 200]"
              :page-size="pagination.pageSize"
              layout="total, sizes, prev, pager, next, jumper"
              :total="pagination.total"
              style="float: right"
            ></datablau-pagination> -->
              </div>
            </template>
          </datablau-form-submit>
        </div>
      </div>
    </template>
    <add-asset
      :clickAsset="clickAsset"
      :assetType="assetType"
      v-else
    ></add-asset>
  </div>
</template>

<script>
import SelectUser from '@/view/dataSecurity/accessStrategy/components/selectUsers.vue'
import DesensitizeDia from './desensitizeDia.vue'
import AssetInfo from '../assetInfo.vue'
import isShowTooltip from '@/view/dataSecurity/components/isShowTooltip.vue'
import AddAsset from '../addAssets.vue'
import tableAndColumn from '@/view/dataSecurity/components/tableAndColumn.vue'
export default {
  components: {
    SelectUser,
    DesensitizeDia,
    isShowTooltip,
    AssetInfo,
    AddAsset,
    tableAndColumn,
  },
  props: {
    clickChild: {
      type: Function,
    },
    isEdit: {
      type: Boolean,
      default: false,
    },
    assetInfo: {
      type: Object,
      default() {
        return {}
      },
    },
  },
  data() {
    return {
      sureDisabled: false,
      assetType: 'TABLE', // TABLE,COLUMN
      loading: false,
      showRule: false,
      showUserSelect: false,
      activeName: 'user',
      userDialogTitle: '',
      tabPlaceholder: {
        user: '',
        group: '',
        org: '',
      },
      allData: [],
      tableData: [],
      keyword: '',
      thirdData: {
        user: [],
        group: [],
        org: [],
      },
      column: [],
      selectList: [],
      pagination: {
        pageNum: 1,
        pageSize: 20,
        total: 0,
      },
      curUserName: '',
      curGroupId: '',
      curOrgBm: '',
      showTableDialog: false,
      nowRule: {},
      userColumn: [],
      groupColumn: [],
      orgColumn: [],
    }
  },
  mounted() {
    this.userColumn = [
      {
        label: this.$t('accessStrategy.loginName'),
        prop: 'username',
        minWidth: 100,
      },
      {
        label: this.$t('accessStrategy.fullname'),
        prop: 'fullUserName',
        minWidth: 100,
      },
      {
        label: this.$t('accessStrategy.norOrganization'),
        prop: 'orgFullName',
        minWidth: 100,
      },
      {
        label: this.$t('accessStrategy.position'),
        prop: 'title',
        minWidth: 100,
      },
      {
        label: this.$t('accessStrategy.systemRole'),
        prop: 'roles',
        minWidth: 100,
      },
      {
        label: this.$t('accessStrategy.contactInfo'),
        prop: 'phoneNumber',
        minWidth: 120,
      },
      {
        label: this.$t('securityModule.desensitizationRules'),
        prop: 'rule',
        minWidth: 250,
      },
      {
        label: this.$t('securityModule.operate'),
        prop: 'operation',
        minWidth: 100,
      },
    ]
    this.groupColumn = [
      {
        label: this.$t('accessStrategy.groupName'),
        prop: 'groupName',
        minWidth: 100,
      },
      {
        label: this.$t('securityModule.desensitizationRules'),
        prop: 'rule',
        minWidth: 250,
      },
      {
        label: this.$t('securityModule.operate'),
        prop: 'operation',
        minWidth: 100,
      },
    ]
    this.orgColumn = [
      {
        label: this.$t('accessStrategy.organizationName'),
        prop: 'fullName',
        minWidth: 100,
      },
      {
        label: this.$t('securityModule.desensitizationRules'),
        prop: 'rule',
        minWidth: 250,
      },
      {
        label: this.$t('securityModule.operate'),
        prop: 'operation',
        minWidth: 100,
      },
    ]
    this.userDialogTitle = this.$t('accessStrategy.addUser')
    this.tabPlaceholder = {
      user: this.$t('accessStrategy.searchNames'),
      group: this.$t('accessStrategy.searchGroupName'),
      org: this.$t('accessStrategy.searchOrganizationName'),
    }
    if (this.$parent.strategyType === 'ACCESS_DATAMASK_TABLE') {
      this.assetType = 'TABLE'
      this.userColumn = this.userColumn.filter(item => item.prop !== 'rule')
      this.groupColumn = this.groupColumn.filter(item => item.prop !== 'rule')
      this.orgColumn = this.orgColumn.filter(item => item.prop !== 'rule')
    } else {
      this.assetType = 'COLUMN'
    }
    this.initData()
  },
  watch: {
    thirdData: {
      handler(val) {
        this.allData = this.thirdData[this.activeName]
        this.tableData = this.allData
      },
      deep: true,
      immediate: true,
    },
    assetInfo: {
      handler(val) {
        // console.log(val)
      },
      deep: true,
      immediate: true,
    },
  },
  methods: {
    searchFileName() {
      let val = this.keyword
      this.tableData = this.allData.filter(
        item =>
          (item.username && item.username.indexOf(val) !== -1) ||
          (item.fullUserName && item.fullUserName.indexOf(val) !== -1) ||
          (item.groupName && item.groupName.indexOf(val) !== -1) ||
          (item.orgName && item.orgName.indexOf(val) !== -1)
      )
    },
    back() {
      this.clickChild('cancel')
    },
    clickAsset(name, options) {
      switch (name) {
        case 'assetInfo':
          this.showTableDialog = true
          break
        default:
          break
      }
    },
    clickTable(name, options) {
      switch (name) {
        case 'close':
          this.showTableDialog = false
          break
        case 'sureTable':
          // 字段
          this.showTableDialog = false
          // this.tableData = []
          const assetInfo = {
            assetId: options.data[0].objectId,
          }
          this.clickChild('asset', { data: assetInfo })
          break
        default:
          break
      }
    },
    handlerData() {},
    getType() {
      let name = ''
      switch (this.activeName) {
        case 'user':
          name = 'username'
          break
        case 'group':
          name = 'id'
          break
        case 'org':
          name = 'bm'
          break
        default:
          break
      }
      return name
    },
    handleClose(row) {
      this.allData.map(item => {
        switch (this.activeName) {
          case 'user':
            if (item.username === row.username) {
              item.ruleMap = {}
            }
            break
          case 'group':
            if (item.id === row.id) {
              item.ruleMap = {}
            }
            break
          case 'org':
            if (item.bm === row.bm) {
              item.ruleMap = {}
            }
            break
          default:
            break
        }
      })
      this.tableData = this.allData
    },
    initData() {
      this.column = this.userColumn
      this.allData = this.thirdData[this.activeName]
      this.tableData = this.allData
    },
    handleTabClick(evt) {
      this.activeName = evt.name
      this.column = this[evt.name + 'Column']
      this.allData = this.thirdData[evt.name]
      this.tableData = this.allData
      this.setBtnName()
    },
    setBtnName() {
      switch (this.activeName) {
        case 'user':
          this.userDialogTitle = this.$t('accessStrategy.addUser')
          break
        case 'group':
          this.userDialogTitle = this.$t('accessStrategy.addGroup')
          break
        case 'org':
          this.userDialogTitle = this.$t('accessStrategy.addOrganization')
          break
        default:
          break
      }
    },
    addVisitors() {
      this.setBtnName()
      this.showUserSelect = true
    },
    handleSelectionChange(row) {
      this.selectList = row
    },
    openRule(row) {
      switch (this.activeName) {
        case 'user':
          this.curUserName = row.username
          break
        case 'group':
          this.curGroupId = row.id
          break
        case 'org':
          this.curOrgBm = row.bm
          break
        default:
          break
      }
      this.nowRule = {
        ruleId: row.ruleId,
        ruleName: row.maskRule,
      }
      this.showRule = true
    },
    getList() {},
    handleSizeChange(val) {
      this.pagination.pageNum = 1
      this.pagination.pageSize = val
      this.getList()
    },
    handleCurrentChange(val) {
      this.pagination.pageNum = val
      this.getList()
    },
    async deleteVisitor(row) {
      const name = await this.getType()
      this.$DatablauCofirm(this.$t('securityModule.sureDelTip')).then(() => {
        this.thirdData[this.activeName] = this.thirdData[
          this.activeName
        ].filter(item => item[name] !== row[name])
      })
    },
    delectAry() {
      const len = this.thirdData[this.activeName].length
      this.$DatablauCofirm(
        this.$t('securityModule.multipleSureDelTip', {
          num: len,
        })
      ).then(() => {
        this.thirdData[this.activeName] = this.thirdData[
          this.activeName
        ].filter(item => !this.selectList.some(o => o.id === item.id))
      })
    },
    prev() {
      if (this.$parent.strategyType === 'ACCESS_DATAMASK_TABLE') {
        this.clickChild('step', { step: 2, prevStep: 3 })
      } else {
        this.clickChild('step', { step: 1, prevStep: 3 })
      }
    },
    async submit() {
      this.sureDisabled = true
      this.clickChild('save')
    },
    closeUserSelect() {
      this.showUserSelect = false
    },
    // 用户选择弹窗 - 确定 回调
    handleUserSelect(data) {
      data.add.map(item => {
        switch (this.activeName) {
          case 'user':
            break
          case 'group':
            break
          case 'org':
            item.orgName = item.fullName
            break
          default:
            break
        }
      })
      this.thirdData[this.activeName] = data.add || []
      this.allData = this.thirdData[this.activeName]
      this.tableData = this.allData
      this.closeUserSelect()
    },
    clickRule(name, option) {
      switch (name) {
        case 'close':
          this.showRule = false
          break
        case 'add':
          this.showRule = false
          this.thirdData[this.activeName].map(item => {
            switch (this.activeName) {
              case 'user':
                if (item.username === this.curUserName) {
                  item.ruleMap = option
                }
                break
              case 'group':
                if (item.id === this.curGroupId) {
                  item.ruleMap = option
                }
                break
              case 'org':
                if (item.bm === this.curOrgBm) {
                  item.ruleMap = option
                }
                break
              default:
                break
            }
          })
          break
        default:
          break
      }
      this.thirdData = _.cloneDeep(this.thirdData)
    },
  },
}
</script>

<style scoped lang="scss">
@import '~@/next/components/basic/color.sass';
.step-three-page {
  position: absolute;
  top: 72px;
  left: 0;
  right: 0;
  bottom: 0;
  .content-box {
    position: absolute;
    top: 108px;
    left: 0;
    right: 0;
    bottom: 0;
    .pane-content {
      padding: 0 20px;
    }
    .table-box {
      position: absolute;
      top: 42px;
      left: 0;
      right: 0;
      bottom: 0;
      padding: 0 20px;
    }
  }
}
.rule-box {
  width: 232px;
  i.iconfont {
    vertical-align: middle;
    display: inline-block;
    line-height: 24px;
    font-size: 16px;
    color: $primary-color;
    cursor: pointer;
    margin-right: 4px;
  }
  /deep/ .el-tag {
    vertical-align: middle;
    width: auto;
    max-width: 232px;
    box-sizing: border-box;
    display: inline-block;
    height: 24px;
    line-height: 24px;
    padding: 0px 8px;
    padding-right: 24px;
    background: transparentize($color: #6f54eb, $amount: 0.9);
    color: #6f54eb;
    border-radius: 2px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    position: relative;
    cursor: pointer;
    i {
      position: absolute;
      right: 4px;
      top: 4px;
      color: #6f54eb;
      background: transparentize($color: #6f54eb, $amount: 0.8);
      &:hover {
        color: #fff;
        background: #6f54eb;
      }
    }
  }
}
</style>
