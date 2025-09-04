<template>
  <div class="userConfig">
    <datablau-tabs
      v-model="activeName"
      v-if="activeStep === 3"
      @tab-click="handleTabClick"
    >
      <el-tab-pane label="用户" name="user"></el-tab-pane>
      <el-tab-pane label="用户组" name="group"></el-tab-pane>
      <el-tab-pane label="组织机构" name="org"></el-tab-pane>
    </datablau-tabs>

    <div class="pane-content">
      <div class="search">
        <datablau-input
          :placeholder="tabPlaceholder[activeName]"
          v-model="keyword"
          :iconfont-state="true"
          clearable
          @keyup.native.enter="searchFileName"
          @clear="searchFileName"
        ></datablau-input>
        <datablau-button
          v-if="isEditable"
          type="normal"
          class="iconfont icon-tianjia"
          style="float: right"
          @click="addVisitors"
        >
          添加{{ getTypeName(activeName) }}
        </datablau-button>
      </div>
      <datablau-form-submit class="whiteFormSubmit">
        <datablau-table
          :data="tableData"
          height="100%"
          :data-selectable="isEditable"
          :show-column-selection="false"
          @selection-change="handleSelectionChange"
        >
          <el-table-column
            v-for="item in column"
            :key="item.prop"
            :label="item.label"
            :fixed="item.fixed ? item.fixed : false"
            :prop="item.prop"
            :min-width="item.width"
            :show-overflow-tooltip="!!item.width"
          >
            <template scope="{row}">
              <template v-if="item.prop === 'action'">
                <!-- <datablau-dropdown
                  v-if="isEditable"
                  class="btnAdd"
                  trigger="click"
                  :hide-on-click="false"
                >
                  <datablau-button
                    type="icon"
                    class="iconfont icon-tianjia"
                  ></datablau-button>
                  <el-dropdown-menu slot="dropdown">
                    <datablau-checkbox
                      v-model="row.action"
                      @change="actionChange(row)"
                    >
                      <el-dropdown-item v-for="k in options" :key="k.value">
                        <el-checkbox :label="k.label">
                          {{ k.label }}
                        </el-checkbox>
                      </el-dropdown-item>
                    </datablau-checkbox>
                  </el-dropdown-menu>
                </datablau-dropdown> -->
                <!-- :closable="isEditable" -->
                <!-- 暂时去掉编辑功能 -->
                <el-tag
                  class="tagAction"
                  v-for="tag in row.action.filter((item, i) => i < 3)"
                  :key="tag"
                  v-show="row.action && row.action.length"
                  :closable="false"
                  @close="handleClose(row, tag)"
                >
                  <is-show-tooltip
                    :content="tag"
                    :open-delay="200"
                    placement="top"
                  ></is-show-tooltip>
                </el-tag>
                <!-- <el-popover
                  placement="bottom"
                  popper-class="actionPop"
                  :title="`执行动作${row.action.length}条`"
                  width="380"
                  v-show="row.action && row.action.length > 1"
                  trigger="hover"
                >
                  <el-tag
                    class="tagAction"
                    style="margin-bottom: 5px"
                    v-for="tag in row.action"
                    :key="tag"
                    :closable="isEditable"
                    @close="handleClose(row, tag)"
                  >
                    <is-show-tooltip
                      :content="tag"
                      :open-delay="200"
                      placement="top"
                    ></is-show-tooltip>
                  </el-tag>
                  <span
                    v-show="row.action.length > 3"
                    slot="reference"
                    class="referenceSpan"
                  >
                    更多{{ row.action.length - 3 }}条
                  </span>
                </el-popover> -->
              </template>

              <template v-else-if="item.prop === 'operation'">
                <datablau-button
                  type="icon"
                  class="iconfont icon-delete"
                  @click="deleteSingle(row)"
                ></datablau-button>
              </template>
              <template v-else-if="item.prop === 'roles'">
                {{ row[item.prop] && row[item.prop].join('，') }}
              </template>
              <template v-else>{{ row[item.prop] }}</template>
            </template>
          </el-table-column>
        </datablau-table>

        <template slot="buttons" v-if="selectList.length > 0">
          <div>
            <template>
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
          </div>
        </template>
      </datablau-form-submit>
    </div>
    <select-user
      :isAccess="true"
      :dialogVisible="showUserSelectDialog"
      @close="closeUserSelectDialog"
      :userType="activeName"
      :binList="allDataLisr"
      :title="userDialogTitle"
      @primary="handleUserSelect"
    ></select-user>
  </div>
</template>

<script>
import SelectUser from './selectUsers.vue'
import { executeAction } from '../../util/attrEnum'
import HTTP from '../../util/api'
import { getTypeName } from '@/view/dataSecurity/util/util.js'
import isShowTooltip from '@/view/dataProperty/meta/isShowTooltip.vue'
export default {
  name: 'SecondStep',
  props: {
    isWhite: {
      type: Boolean,
    },
    actionList: {
      type: Array,
      default: () => [],
    },
    activeStep: {
      type: Number,
      default: 1,
    },
    isEditable: {
      type: Boolean,
      default: true,
    },
  },
  inject: ['accessControlId'],
  components: { SelectUser, isShowTooltip },
  data() {
    return {
      getTypeName: getTypeName,
      action: [],
      activeName: 'user',
      secondData: {
        user: [],
        group: [],
        org: [],
      },
      tabPlaceholder: {
        user: '搜索登录名、姓名',
        group: '搜索用户组名称',
        org: '搜索机构名称',
      },
      keyword: '',
      tableData: [],
      pagination: {
        currentPage: 1,
        pageSize: 20,
        total: 0,
      },
      showUserSelectDialog: false,
      userDialogTitle: '',
      selectList: [],
      column: [],
      options: executeAction,
      userColumn: [
        { label: '登录名', prop: 'username' },
        { label: '姓名', prop: 'fullUserName' },
        { label: '所属机构', prop: 'orgFullName' },
        { label: '职位', prop: 'title' },
        { label: '系统角色', prop: 'roles', width: '180px' },
        { label: '联系方式', prop: 'phoneNumber' },
        {
          label: '数据执行动作',
          prop: 'action',
          width: '450px',
          fixed: 'right',
        },
        { label: '操作', prop: 'operation', fixed: 'right' },
      ],
      groupColumn: [
        { label: '用户组名称', prop: 'groupName' },
        { label: '数据执行动作', prop: 'action', fixed: 'right' },
        { label: '操作', prop: 'operation', fixed: 'right' },
      ],
      orgColumn: [
        { label: '机构名称', prop: 'fullName' },
        { label: '数据执行动作', prop: 'action', fixed: 'right' },
        { label: '操作', prop: 'operation', fixed: 'right' },
      ],
      allDataLisr: [],
      modifyUserList: {
        user: [],
        group: [],
        org: [],
      },
      oriUserList: {},
    }
  },
  methods: {
    async handleTabClick(evt) {
      this.activeName = evt.name
      this.column = this[evt.name + 'Column']
      await this.handleData()
      this.allDataLisr = this.secondData[this.activeName]
      this.tableData = this.allDataLisr
    },
    delectAry() {
      this.$DatablauCofirm(
        `已选择“${this.selectList.length}条”数据，确认要删除吗？`
      ).then(() => {
        this.selectList.forEach(item => {
          this.deleteVisitor(item)
        })
      })
    },
    getUserType() {
      let id = ''
      switch (this.activeName) {
        case 'user':
          id = 'username'
          break
        case 'group':
          id = 'id'
          break
        case 'org':
          id = 'bm'
          break
        default:
          break
      }
      return id
    },
    // 删除访问者
    deleteSingle(item) {
      this.$DatablauCofirm(`确认要删除吗？`).then(() => {
        this.deleteVisitor(item)
      })
    },
    async deleteVisitor(row) {
      const name = await this.getUserType()
      this.secondData[this.activeName] = this.secondData[
        this.activeName
      ].filter(item => item[name] != row[name])
      this.allDataLisr = this.secondData[this.activeName]
      this.tableData = this.allDataLisr
      // 修改的删除
      if (this.accessControlId) {
        // 删除时，先清除重复的数据（修改执行动作时加入的）
        this.modifyUserList[this.activeName] = this.modifyUserList[
          this.activeName
        ].filter(m => m[name] !== row[name])
        if (row.visitorId) {
          row.delete = true
          this.modifyUserList[this.activeName].push(row)
        }
      }
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
    async handleUserSelect(data) {
      const name = await this.getUserType()
      let delList = []
      // 去掉先删除又添加的用户
      data.del.map(item => {
        const hasUser = data.add.some(m => m[name] === item[name])
        if (hasUser) {
        } else {
          delList.push(item)
        }
      })
      data.del = delList
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
        item.action = item.action || [...this.actionList]
        item.actionList = this.actionList
      })
      this.secondData[this.activeName] = data.add || []
      this.allDataLisr = this.secondData[this.activeName]
      this.tableData = this.allDataLisr
      // 修改时新增的人员
      if (this.accessControlId) {
        let ary = []
        Object.keys(data).forEach(key => {
          console.log(key)
          // this.oriUserList
          data[key].forEach(item => {
            ary.push({
              ...item,
            })
          })
        })
        this.modifyUserList[this.activeName].push(...ary)
      }
      this.closeUserSelectDialog()
    },
    searchFileName() {
      let val = this.keyword
      this.pagination.pageSize = 20
      this.pagination.currentPage = 1
      this.tableData = this.allDataLisr.filter(
        item =>
          (item.username && item.username.indexOf(val) !== -1) ||
          (item.fullUserName && item.fullUserName.indexOf(val) !== -1) ||
          (item.groupName && item.groupName.indexOf(val) !== -1) ||
          (item.orgName && item.orgName.indexOf(val) !== -1)
      )
    },
    handleSelectionChange(row) {
      this.selectList = row
    },
    updateAction(row) {
      let list = [
        ...this.modifyUserList.user,
        ...this.modifyUserList.org,
        ...this.modifyUserList.group,
      ]
      let len = list.filter(item => item.id == row.id).length
      if (len) {
        this.modifyUserList[this.activeName].map(item => {
          if (item.id === row.id) {
            item.action = row.action
          }
        })
      } else {
        row.modify = true
        this.modifyUserList[this.activeName].push(row)
      }
      this.tableData = _.cloneDeep(this.tableData)
    },
    actionChange(row) {
      this.updateAction(row)
    },
    handleClose(row, val) {
      row.action = row.action.filter(item => item != val)
      this.updateAction(row)
    },
    handleData() {
      this.secondData[this.activeName].map(item => {
        if (this.activeName === 'org') {
          item.fullName = item.orgName
        }
      })
    },
    personnelDataProcessing(item) {
      let json = new FormData()
      json.append('isWhite', this.isWhite)
      json.append('visitorType', item.name)
      HTTP.getVisitorList({
        controlId: this.accessControlId,
        json,
      })
        .then(async res => {
          res.data.data.map(m => {
            m.action = m.actionList
            switch (item.type) {
              case 'user':
                m.username = m.visitorId
                break
              case 'group':
                m.ori_id = _.cloneDeep(m.id)
                m.id = parseFloat(m.visitorId)
                m.username = m.visitorId
                break
              case 'org':
                m.bm = m.visitorId
                break
              default:
                break
            }
          })
          this.oriUserList[item.type] = res.data.data || []
          this.secondData[item.type] = _.cloneDeep(this.oriUserList[item.type])
          await this.handleData()
          if (item.type === this.activeName) {
            this.allDataLisr = this.secondData[this.activeName]
            this.tableData = this.allDataLisr
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
  },
  mounted() {
    this.$nextTick(_ => {
      if (!this.isEditable) {
        this.userColumn = this.userColumn.slice(0, -1)
        this.groupColumn = this.groupColumn.slice(0, -1)
        this.orgColumn = this.orgColumn.slice(0, -1)
      }
      this.column = this.userColumn
      if (this.accessControlId) {
        const typeList = [
          {
            name: 'USER',
            type: 'user',
          },
          {
            name: 'GROUP',
            type: 'group',
          },
          {
            name: 'ORGANIZATION',
            type: 'org',
          },
        ]
        typeList.map(item => {
          this.personnelDataProcessing(item)
        })
      }
    })
  },
}
</script>

<style lang="scss" scoped>
.userConfig {
  margin-left: 24px;
  /deep/ .datablau-tabs {
    .el-tabs__content {
      height: 0px;
    }
  }
  .pane-content {
    height: 400px;
    border: 1px solid #dddddd;
    border-top: 0;
    padding-top: 10px;
    position: relative;
    .search {
      padding: 0 20px;
    }
    .whiteFormSubmit {
      top: 42px;
    }
  }
}

/deep/.datablau-checkbox2 .el-checkbox-group {
  max-height: 224px;
  overflow: scroll;
}
.btnAdd {
  display: inline-block;
  margin-right: 4px;
}
.tagAction {
  width: 100px;
  background: #f5f5f5;
  color: #555;
  margin-right: 5px;
  border: 1px solid #ddd;
  line-height: 22px;
  vertical-align: middle;
  padding-right: 20px;
  position: relative;
  /deep/ .text-tooltip {
    height: 24px;
    line-height: 24px;
  }
  &.el-tag {
    /deep/.el-tag__close {
      position: absolute;
      right: 4px;
      top: 4px;
    }
  }
}
.el-tag /deep/.el-tag__close {
  color: #999;
  &:hover {
    background: #ddd;
    color: #999;
  }
}
.referenceSpan {
  cursor: pointer;
  &:hover {
    color: #409eff;
  }
}
/deep/.el-popover__title {
  font-size: 12px;
  color: #555;
}
</style>
<style>
.el-popover.actionPop {
  padding-left: 16px;
  text-align: left;
}
.el-popover.actionPop .el-popover__title {
  font-size: 14px;
  color: #555;
}
</style>
