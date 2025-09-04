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
              <el-tab-pane label="用户" name="user"></el-tab-pane>
              <el-tab-pane label="用户组" name="group"></el-tab-pane>
              <el-tab-pane label="组织机构" name="org"></el-tab-pane>
            </datablau-tabs>
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
                添加{{ getTypeName(activeName) }}
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
                fixed="left"
                :prop="item.prop"
                :width="item.width"
                :show-overflow-tooltip="!item.width"
              >
                <template scope="{row}">
                  <template v-if="item.prop === 'action'">
                    <datablau-button
                      type="icon"
                      class="iconfont icon-tianjia"
                      @click="filterAdd(row)"
                      v-if="!row.sql"
                    ></datablau-button>
                    <el-tag
                      class="reqTag"
                      v-else
                      closable
                      @close="reqTagClose(row)"
                    >
                      <el-tooltip
                        effect="dark"
                        :content="row.sql"
                        placement="top-start"
                        v-if="row.sql.length > 30"
                      >
                        <span>
                          {{
                            row.sql.length > 30
                              ? row.sql.substr(0, 30) + '…'
                              : row.sql
                          }}
                        </span>
                      </el-tooltip>
                      <span v-else>{{ row.sql }}</span>
                    </el-tag>
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
              <div style="float: left">
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
                <datablau-button type="normal" @click="prev">
                  上一步
                </datablau-button>
                <datablau-button
                  class="cut-apart-btn"
                  type="important"
                  @click="save"
                >
                  确定
                </datablau-button>
                <datablau-button type="secondary" @click="back">
                  取消
                </datablau-button>
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
      :filteringDialog="filteringDialog"
      @sqlCompletion="sqlCompletion"
      @closeDialog="closeDialog"
    ></advancedFiltering>
    <add-table
      v-if="showTableDialog"
      :visible="showTableDialog"
      :clickTable="clickTable"
      :assetType="assetType"
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
export default {
  components: { SelectUser, advancedFiltering, addTable, AssetInfo, AddAsset },
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
      getTypeName: getTypeName,
      assetType: 'TABLE',
      showTableDialog: false,
      currentPage: 1,
      pageSize: 20,
      total: 0,
      selectList: [],
      activeName: 'user',
      tabPlaceholder: {
        user: '搜索登录名、姓名',
        group: '搜索用户组名称',
        org: '搜索机构名称',
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
      column: [],
      userColumn: [
        { label: '登录名', prop: 'username' },
        { label: '姓名', prop: 'fullUserName' },
        { label: '所属机构', prop: 'orgFullName' },
        { label: '职位', prop: 'title' },
        { label: '系统角色', prop: 'roles' },
        { label: '联系方式', prop: 'phoneNumber' },
        { label: '行级数据', prop: 'action', width: '300' },
        { label: '操作', prop: 'operation' },
      ],
      groupColumn: [
        { label: '用户组名称', prop: 'groupName' },
        { label: '行级数据', prop: 'action' },
        { label: '操作', prop: 'operation' },
      ],
      orgColumn: [
        { label: '机构名称', prop: 'fullName' },
        { label: '行级数据', prop: 'action' },
        { label: '操作', prop: 'operation' },
      ],
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
    }
  },
  mounted() {
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
          this.showTableDialog = false
          this.tableData = this.allDataLisr
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
        message: '请添加生效用户',
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
        `已选择“${this.selectList.length}条”数据，确认要删除吗？`,
        '提示',
        {
          type: 'warning',
          cancelButtonText: this.$t('common.button.cancel'),
          confirmButtonText: this.$t('common.button.ok'),
        }
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
      console.log(this.tableData)
    },
    // 添加访问控制用户
    addVisitors() {
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
      this.$DatablauCofirm('确认删除吗?', '提示', {
        type: 'warning',
        cancelButtonText: this.$t('common.button.cancel'),
        confirmButtonText: this.$t('common.button.ok'),
      })
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
      console.log(this.tableData)
    },
    closeDialog() {
      this.filteringDialog = false
    },
    filterAdd(row) {
      this.filteringDialog = true
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
      console.log(this.modified)
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
          if (i != dto.dtos.length - 1) {
            sql += `${sqlItem} ${dto.connector == 'OR' ? '或' : '且'} `
          } else {
            sql += `${sqlItem} `
          }
        })
      dto.rowLimit && (sql += `，行数限制：${dto.rowLimit}行`)
      return sql
    },
  },
}
</script>

<style scoped lang="scss">
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
.reqTag {
  background: rgba(78, 133, 247, 0.1);
  color: #4e85f7;
  margin-right: 5px;
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
