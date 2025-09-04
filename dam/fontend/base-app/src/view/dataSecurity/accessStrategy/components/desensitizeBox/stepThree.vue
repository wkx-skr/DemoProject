<template>
  <div class="step-three-page">
    <!-- 脱敏规则弹框 -->
    <desensitize-dia
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
    <!-- 选择表、视图、字段 -->
    <add-table
      v-if="showTableDialog"
      :visible="showTableDialog"
      :clickTable="clickTable"
      :assetId="assetInfo.assetId"
      :assetType="assetType"
    ></add-table>
    <template v-if="assetInfo.assetId">
      <asset-Info :assetInfo="assetInfo" :clickAsset="clickAsset"></asset-Info>
      <datablau-tabs
        v-model="activeName"
        @tab-click="handleTabClick"
        style="padding: 0 20px"
      >
        <el-tab-pane label="用户" name="user"></el-tab-pane>
        <el-tab-pane label="用户组" name="group"></el-tab-pane>
        <el-tab-pane label="组织机构" name="org"></el-tab-pane>
      </datablau-tabs>
      <div class="content-box">
        <div class="pane-content">
          <div class="search">
            <datablau-input
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
                      <i
                        class="iconfont icon-tianjia"
                        @click="openRule(row)"
                        v-if="!row.ruleMap || !row.ruleMap.id"
                      ></i>
                      <el-tag
                        closable
                        @close="handleClose(row)"
                        v-if="row.ruleMap && row.ruleMap.id"
                      >
                        <is-show-tooltip
                          :content="row.ruleMap.name"
                          :open-delay="200"
                          placement="top"
                        ></is-show-tooltip>
                      </el-tag>
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
                    当前选中“{{ selectList.length }}条”信息，是否
                  </span>
                  <datablau-button
                    type="danger"
                    class="el-icon-delete"
                    @click="delectAry"
                  >
                    删除
                  </datablau-button>
                </template>
                <template v-else>
                  <datablau-button type="normal" @click="prev">
                    上一步
                  </datablau-button>
                  <datablau-button
                    class="cut-apart-btn"
                    type="important"
                    @click="submit"
                  >
                    确定
                  </datablau-button>
                  <datablau-button type="secondary" @click="back">
                    取消
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
import isShowTooltip from '@/view/dataProperty/meta/isShowTooltip.vue'
import addTable from '../addTable.vue'
import AddAsset from '../addAssets.vue'
export default {
  components: {
    SelectUser,
    DesensitizeDia,
    isShowTooltip,
    AssetInfo,
    addTable,
    AddAsset,
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
      assetType: 'TABLE', // TABLE,COLUMN
      loading: false,
      showRule: false,
      showUserSelect: false,
      activeName: 'user',
      userDialogTitle: '添加用户',
      tabPlaceholder: {
        user: '搜索登录名、姓名',
        group: '搜索用户组名称',
        org: '搜索机构名称',
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
      userColumn: [
        { label: '登录名', prop: 'username', minWidth: 100 },
        { label: '姓名', prop: 'fullUserName', minWidth: 100 },
        { label: '所属机构', prop: 'orgFullName', minWidth: 100 },
        { label: '职位', prop: 'title', minWidth: 100 },
        { label: '系统角色', prop: 'roles', minWidth: 100 },
        { label: '联系方式', prop: 'phoneNumber', minWidth: 120 },
        { label: '脱敏规则', prop: 'rule', minWidth: 250 },
        { label: '操作', prop: 'operation', minWidth: 100 },
      ],
      groupColumn: [
        { label: '用户组名称', prop: 'groupName', minWidth: 100 },
        { label: '脱敏规则', prop: 'rule', minWidth: 250 },
        { label: '操作', prop: 'operation', minWidth: 100 },
      ],
      orgColumn: [
        { label: '机构名称', prop: 'fullName', minWidth: 100 },
        { label: '脱敏规则', prop: 'rule', minWidth: 250 },
        { label: '操作', prop: 'operation', minWidth: 100 },
      ],
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
    }
  },
  mounted() {
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
          this.showTableDialog = false
          this.clickChild('asset', options)
          break
        default:
          break
      }
    },
    handlerData() {},
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
          this.userDialogTitle = '添加用户'
          break
        case 'group':
          this.userDialogTitle = '添加用户组'
          break
        case 'org':
          this.userDialogTitle = '添加机构'
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
    deleteVisitor(row) {
      this.$DatablauCofirm(`确认要删除吗？`).then(() => {
        this.thirdData[this.activeName] = this.thirdData[
          this.activeName
        ].filter(item => item.id !== row.id)
      })
    },
    delectAry() {
      const len = this.thirdData[this.activeName].length
      this.$DatablauCofirm(`已选择“${len}条”数据，确认要删除吗？`).then(() => {
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
  top: 80px;
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
