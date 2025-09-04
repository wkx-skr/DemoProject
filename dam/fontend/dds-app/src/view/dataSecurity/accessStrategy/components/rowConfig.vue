<template>
  <div>
    <template v-if="assetInfo.assetId">
      <datablau-form-submit ref="formSubmit" class="row-config-page">
        <asset-Info
          :assetInfo="assetInfo"
          :clickAsset="clickAsset"
        ></asset-Info>
        <div class="flex">
          <div class="top" v-if="activeStep === 2">
            <datablau-tabs v-model="activeName" @tab-click="handleTabClick">
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
            <div class="search">
              <datablau-input
                :iconfont-state="true"
                style="width: 240px"
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
                {{ $t('securityModule.add') }}{{ getTypeName(activeName) }}
              </datablau-button>
            </div>
          </div>
        </div>
        <div class="table-box">
          <datablau-form-submit>
            <datablau-table
              :data="tableData"
              class="table"
              v-loading="loading"
              height="100%"
              :data-selectable="true"
              :show-column-selection="false"
              @selection-change="handleSelectionChange"
            >
              <el-table-column
                v-for="item in column"
                :key="item.prop"
                :label="item.label"
                :fixed="item.fixed ? item.fixed : false"
                :prop="item.prop"
                :width="item.width"
                :show-overflow-tooltip="!item.width"
              >
                <template scope="{row}">
                  <template v-if="item.prop === 'action'">
                    <div class="row-box">
                      <datablau-button
                        type="icon"
                        class="iconfont icon-tianjia"
                        @click="filterAdd(row)"
                        v-if="!row.sql"
                      ></datablau-button>
                      <el-tag
                        class="reqTag"
                        style=""
                        v-else
                        closable
                        @click="filterAdd(row)"
                        @close="reqTagClose(row)"
                      >
                        <is-show-tooltip
                          :content="row.sql"
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
                    <span class="tooltip-box">
                      <is-show-tooltip
                        :content="row[item.prop] && row[item.prop].join('，')"
                        :refName="'user'"
                      >
                        <template>
                          {{ row[item.prop] && row[item.prop].join('，') }}
                        </template>
                      </is-show-tooltip>
                    </span>
                  </template>
                  <template v-else>{{ row[item.prop] }}</template>
                </template>
              </el-table-column>
            </datablau-table>
            <template slot="buttons">
              <div style="float: left">
                <template v-if="selectList.length > 0">
                  <span class="check-info"></span>
                  <span class="footer-row-info">
                    {{
                      $t('securityModule.selectNum', { num: selectList.length })
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
                    @click="save"
                  >
                    {{ $t('securityModule.sure') }}
                  </datablau-button>
                  <datablau-button type="secondary" @click="back">
                    {{ $t('securityModule.cancel') }}
                  </datablau-button>
                </template>
              </div>
            </template>
          </datablau-form-submit>
        </div>
      </datablau-form-submit>
    </template>
    <add-Asset
      :clickAsset="clickAsset"
      :assetType="assetType"
      v-else
    ></add-Asset>
    <select-user
      :dialogVisible="showUserSelectDialog"
      @close="closeUserSelectDialog"
      :userType="activeName"
      :binList="tableData"
      :title="userDialogTitle"
      @primary="handleUserSelect"
    ></select-user>
    <advancedFiltering
      :assetInfo="assetInfo"
      :dtoMap="dtoMap"
      :filteringDialog="filteringDialog"
      @sqlCompletion="sqlCompletion"
      @closeDialog="closeDialog"
    ></advancedFiltering>
    <add-table
      v-if="showTableDialog"
      :visible="showTableDialog"
      :clickTable="clickTable"
      :assetType="assetType"
      :type="'ACCESS_ROW_STRATEGY'"
    ></add-table>
  </div>
</template>

<script>
import addTable from './addTable.vue'
import AssetInfo from './assetInfo.vue'
import AddAsset from './addAssets.vue'
import SelectUser from './selectUsers.vue'
import advancedFiltering from '@/view/dataSecurity/accessStrategy/components/advancedFiltering'
import HTTP from '../../util/api'
import { getTypeName } from '@/view/dataSecurity/util/util.js'
import isShowTooltip from '@/view/dataSecurity/components/isShowTooltip.vue'
export default {
  components: {
    SelectUser,
    advancedFiltering,
    addTable,
    AssetInfo,
    AddAsset,
    isShowTooltip,
  },
  props: {
    initData: {
      type: Object,
      default: () => {},
    },
    clickChild: {
      type: Function,
    },
    isEdit: {
      type: Boolean,
      default: false,
    },
    assetInfo: {
      type: Object,
      default: () => {},
    },
    activeStep: {
      type: Number,
      default: 1,
    },
  },
  data() {
    return {
      dtoMap: {},
      getTypeName: getTypeName,
      assetType: 'TABLE',
      showTableDialog: false,
      currentPage: 1,
      pageSize: 20,
      total: 0,
      selectList: [],
      activeName: 'user',
      tabPlaceholder: {
        user: '',
        group: '',
        org: '',
      },
      keyword: '',
      tableData: null,
      showUserSelectDialog: false,
      userDialogTitle: '',
      secondData: {
        user: [],
        group: [],
        org: [],
      },
      oriData: [],
      column: [],
      filteringDialog: false,
      allDataLisr: [],
      inputList: [],
      addSql: null, // 当前点击的用户，用户组或组织机构
      loading: false,
      modified: {
        user: [],
        org: [],
        group: [],
      },
      isChangeTable: false,
    }
  },
  computed: {
    userColumn() {
      return [
        { label: this.$t('accessStrategy.loginName'), prop: 'username' },
        { label: this.$t('accessStrategy.fullname'), prop: 'fullUserName' },
        {
          label: this.$t('accessStrategy.norOrganization'),
          prop: 'orgFullName',
        },
        { label: this.$t('accessStrategy.position'), prop: 'title' },
        {
          label: this.$t('accessStrategy.systemRole'),
          prop: 'roles',
          width: '280',
        },
        { label: this.$t('accessStrategy.contactInfo'), prop: 'phoneNumber' },
        {
          label: this.$t('accessStrategy.rowData'),
          prop: 'action',
          width: '180',
          fixed: 'right',
        },
        {
          label: this.$t('securityModule.operate'),
          prop: 'operation',
          width: '80',
          fixed: 'right',
        },
      ]
    },
    groupColumn() {
      return [
        { label: this.$t('accessStrategy.groupName'), prop: 'groupName' },
        { label: this.$t('accessStrategy.rowData'), prop: 'action' },
        {
          label: this.$t('securityModule.operate'),
          prop: 'operation',
          width: '80',
        },
      ]
    },
    orgColumn() {
      return [
        { label: this.$t('accessStrategy.organizationName'), prop: 'fullName' },
        { label: this.$t('accessStrategy.rowData'), prop: 'action' },
        {
          label: this.$t('securityModule.operate'),
          prop: 'operation',
          width: '80',
        },
      ]
    },
  },
  mounted() {
    this.tabPlaceholder = {
      user: this.$t('accessStrategy.searchNames'),
      group: this.$t('accessStrategy.searchGroupName'),
      org: this.$t('accessStrategy.searchOrganizationName'),
    }
    this.$nextTick(() => {
      this.column = this[this.activeName + 'Column']
      if (this.isEdit) {
        this.getInitDetail()
      }
    })
  },
  methods: {
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
          this.isChangeTable = true
          this.secondData = {
            user: [],
            org: [],
            group: [],
          }
          Object.keys(this.oriData).forEach(item => {
            this.oriData[item].map(m => {
              this.dataDealWith(m)
            })
          })
          this.showTableDialog = false
          this.tableData = []
          this.clickChild('table', { data: options.data })
          break
        default:
          break
      }
    },
    editDir() {
      this.showTableDialog = true
    },
    getInitDetail() {
      const scopedList = [
        {
          name: 'user',
          type: 'PERSON',
        },
        {
          name: 'group',
          type: 'GROUP',
        },
        {
          name: 'org',
          type: 'ORGANIZATION',
        },
      ]
      scopedList.map(item => {
        this.getDetail(item)
      })
    },
    prev() {
      this.clickChild('step', { step: 1, prevStep: 2 })
    },
    setTip() {
      this.$datablauMessage({
        message: this.$t('accessStrategy.addUserTip'),
        type: 'warning',
      })
    },
    save() {
      let ary
      const typeList = ['user', 'group', 'org']
      const flag = typeList.some(item => this.secondData[item].length)
      const flag1 = typeList.some(item => this.modified[item].length)
      if (!flag) {
        this.setTip()
        return
      }
      if (this.isEdit) {
        if (flag1) {
          ary = this.modified
          Object.keys(this.secondData).map(item => {
            this.secondData[item].map(list => {
              const bool = ary[item].some(m => m.id === list.id)
              // 先删除，再添加的
              const bool1 = this.oriData[item].some(m => m.id === list.id)
              if (bool1) {
                const index1 = this.oriData[item].findIndex(
                  m => m.id === list.id
                )
                list.realId = this.oriData[item][index1].realId
              }
              if (bool) {
                const index = ary[item].findIndex(m => m.id === list.id)
                ary[item].splice(index, 1, list)
              } else {
                ary[item].push(list)
              }
            })
          })
        } else {
          // 没有修改
          ary = this.secondData
        }
      } else {
        ary = this.secondData
      }
      this.clickChild('save', { data: ary })
    },
    searchFileName() {
      let val = this.keyword
      this.pageSize = 20
      this.currentPage = 1
      this.tableData = this.allDataLisr.filter(
        item =>
          (item.username && item.username.indexOf(val) !== -1) ||
          (item.fullUserName && item.fullUserName.indexOf(val) !== -1) ||
          (item.groupName && item.groupName.indexOf(val) !== -1) ||
          (item.fullName && item.fullName.indexOf(val) !== -1)
      )
      this.inputList = this.tableData
    },
    handleSelectionChange(row) {
      this.selectList = row
    },
    delectAry() {
      this.$DatablauCofirm(
        this.$t('securityModule.multipleSureDelTip', {
          num: this.selectList.length,
        })
      )
        .then(() => {
          this.selectList.forEach(item => {
            this.dataDealWith(item)
          })
        })
        .catch(() => {})
    },
    handleTabClick(evt) {
      this.activeName = evt.name
      this.column = this[evt.name + 'Column']
      this.allDataLisr = this.secondData[evt.name]
      this.tableData = this.allDataLisr
    },
    // 添加访问控制用户
    addVisitors() {
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
      this.showUserSelectDialog = true
    },
    // 关闭用户选择弹窗
    closeUserSelectDialog() {
      this.showUserSelectDialog = false
    },
    // 用户选择弹窗 - 确定 回调
    handleUserSelect(data) {
      const name = this.activeName
      data.add.map(item => {
        this.allDataLisr.map(m => {
          if (m.id === item.id) {
            item = m
          } else {
            item = {
              ...item,
              groupsList: [],
              sql: '',
              fullUserName: item.name,
            }
          }
          if (this.activeName === 'org') {
            item.orgName = item.fullName
          }
        })
      })
      this.secondData[name] = data.add
      this.allDataLisr = this.secondData[name]
      this.tableData = this.allDataLisr
      this.closeUserSelectDialog()
    },
    // 删除访问者
    deleteVisitor(row) {
      this.$DatablauCofirm(this.$t('securityModule.sureDelTip'))
        .then(() => {
          this.dataDealWith(row)
        })
        .catch(() => {})
    },
    async dataDealWith(row) {
      if (this.isEdit) {
        let ary = _.cloneDeep(row)
        if (row.realId) {
          // 已有删除的
          // ary.id = ary.realId
          ary.delete = true
          this.handleModifyData(ary)
        } else {
          // 新增删除的
          const idName = await getTypeName(this.activeName, 1)
          const index = this.modified[this.activeName].findIndex(
            item => item[idName] === row[idName]
          )
          this.modified[this.activeName].splice(index, 1)
        }
      }
      this.secondData[this.activeName] = this.secondData[
        this.activeName
      ].filter(item => item.id != row.id)
      this.allDataLisr = this.secondData[this.activeName]
      this.tableData = this.allDataLisr
    },
    closeDialog() {
      this.filteringDialog = false
    },
    filterAdd(row) {
      this.filteringDialog = true
      this.dtoMap = row.groupsList ? row.groupsList : {}
      this.addSql = row
    },
    // 编辑行级访问时，处理修改数据
    async handleModifyData(row) {
      const idName = await getTypeName(this.activeName, 1)
      const flag = this.modified[this.activeName].some(
        item => item[idName] === row[idName]
      )
      if (flag) {
        const index = this.modified[this.activeName].findIndex(
          item => item[idName] === row[idName]
        )
        this.modified[this.activeName].splice(index, 1, row)
      } else {
        this.modified[this.activeName].push(row)
      }
    },
    sqlCompletion(obj) {
      let { sql, groupsList, groupFlag, limit } = obj
      this.addSql.sql = sql
      this.addSql.groupsList = {
        dtos: groupsList,
        connector: groupFlag,
        rowLimit: limit,
      }
      if (this.isEdit) {
        let ary = _.cloneDeep(this.addSql)
        this.handleModifyData(ary)
      }
      this.tableData.map(item => {
        if (item.id === this.addSql.id) {
          item = this.addSql
        }
      })
      this.tableData = _.cloneDeep(this.tableData)
      this.secondData[this.activeName] = this.tableData
    },
    reqTagClose(row) {
      row.sql = ''
      row.groupsList = null
      if (this.isEdit) {
        this.handleModifyData(row)
      }
    },
    getDetail(row) {
      let obj = {
        user: {
          type: 'PERSON',
          strategy: 'userStrategy',
          list: 'userDto',
          target: 'username',
        },
        group: {
          type: 'GROUP',
          strategy: 'groupStrategy',
          list: 'groupDto',
          target: 'id',
        },
        org: {
          type: 'ORGANIZATION',
          strategy: 'orgStrategy',
          list: 'organizationDto',
          target: 'bm',
        },
      }
      this.loading = true
      HTTP.rowPolicyDetail({
        id: this.$parent.accessControlId,
        scopeType: row.type,
      })
        .then(res => {
          let data = res.data.data
          let strategy = obj[row.name].strategy
          let list = obj[row.name].list
          let tableAry = []
          let target = obj[row.name].target
          data[strategy].forEach(item => {
            let userObj = {
              scopeType: obj[row.name].type,
              target: item[list][target],
              username: item[list].username || '',
              fullUserName: item[list].fullUserName,
              groupName: item[list].groupName,
              fullName: item[list].fullName,
              orgFullName: item[list].orgFullName,
              title: item[list].title,
              roles: item[list].roles,
              phoneNumber: item[list].phoneNumber,
              sql: this.sqlCombination(item.dto),
              dto: item.dto,
              groupsList: item.dto,
              id: item[list].id,
              bm: item[list].bm,
              realId: item.id,
            }
            tableAry.push(userObj)
          })
          this.secondData[row.name] = tableAry
          this.oriData[row.name] = tableAry
          if (row.name === this.activeName) {
            this.allDataLisr = this.secondData[row.name]
            this.tableData = this.allDataLisr
          }
          this.loading = false
        })
        .catch(e => {
          this.tableData = []
          this.$showFailure(e)
          this.loading = false
        })
    },
    sqlCombination(dto) {
      let sql = ``
      dto.dtos &&
        dto.dtos.forEach((item, i) => {
          let sqlItem = '('
          item.conditionDtos.length < 2 && (item.connector = '')
          item.conditionDtos.forEach((aryItem, index) => {
            let value = aryItem.connector
            if (aryItem.connector === 'like') {
              value = this.$t('accessStrategy.contain')
            } else if (aryItem.connector === 'not in') {
              value = this.$t('accessStrategy.notBelongTo')
            } else if (aryItem.connector === 'in') {
              value = this.$t('accessStrategy.belongTo')
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
          if (i != dto.dtos.length - 1) {
            sql += `${sqlItem} ${
              dto.connector == 'OR'
                ? this.$t('securityModule.or')
                : this.$t('securityModule.and')
            } `
          } else {
            sql += `${sqlItem} `
          }
        })
      dto.rowLimit &&
        (sql += `，${this.$t('accessStrategy.rowLimit', {
          limit: dto.rowLimit,
        })}`)
      return sql
    },
  },
}
</script>

<style scoped lang="scss">
.tooltip-box {
  height: 24px;
  // display: inline-block;
  /deep/ .text-tooltip {
    height: 24px;
    line-height: 24px;
    vertical-align: middle;
  }
}
.row-config-page {
  .flex {
    position: absolute;
    top: 64px;
    left: 0;
    right: 0;
    bottom: 0;
    .top {
      padding: 0 20px;
    }
  }
  .table-box {
    position: absolute;
    top: 144px;
    left: 0;
    right: 0;
    bottom: 0;
    padding: 0 20px;
  }
}
.pane-content {
  height: 400px;
  border: 1px solid #dddddd;
  margin-top: -40px;
  margin-left: 20px;
  margin-right: 20px;
  padding: 9px 8px;
  border-top: 0;
}
.whiteFormSubmit /deep/.row-buttons {
  margin-left: 20px;
  right: 20px;
  width: auto;
  background: none;
}
/deep/.datablau-checkbox2 .el-checkbox-group {
  max-height: 224px;
  overflow: scroll;
}
.btnAdd {
  display: inline-block;
  margin-right: 4px;
}
.row-box {
  width: 160px;
  height: 24px;
  line-height: 24px;
  vertical-align: middle;
  .reqTag {
    background: rgba(78, 133, 247, 0.1);
    color: #4e85f7;
    width: auto;
    max-width: 160px;
    overflow: hidden;
    cursor: pointer;
    position: relative;
    padding: 0px 8px;
    padding-right: 24px;
    &.el-tag {
      /deep/.el-tag__close {
        position: absolute;
        right: 4px;
        top: 4px;
      }
    }
  }
}

/deep/.el-tag .el-tag__close {
  color: #4e85f7;
  &:hover {
    background: rgba(78, 133, 247, 0.2);
    color: #4e85f7;
  }
}
.referenceSpan {
  cursor: pointer;
}
/deep/.el-popover__title {
  font-size: 12px;
  color: #555;
}
.search {
  margin-top: -25px;
}
</style>
