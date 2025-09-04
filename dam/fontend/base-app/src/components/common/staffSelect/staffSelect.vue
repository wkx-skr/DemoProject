<template>
  <div>
    <datablau-dialog
      :title="$t('component.staffSelect.staffSel')"
      :visible.sync="visibleSync"
      :close-on-click-modal="false"
      :pager-count="4"
      style="position: relative"
      :modal-append-to-body="true"
      :height="606"
      size="xl"
      @close="closeDialog"
    >
      <div class="staff-select-header">
        <datablau-input
          class="width query1"
          :placeholder="$t('component.staffSelect.queryByName')"
          clearable
          v-model="userKey"
        ></datablau-input>
        <!-- <datablau-select-weak
        class="width query2"
        clearable
        filterable
        allow-create
        @change="handleChange"
        :optionsData="roleKeyObject"
        v-model="roleKey"
      ></datablau-select-weak> -->
        <datablau-select
          size="small"
          filterable
          clearable
          v-model="roleKey"
          :placeholder="$t('component.staffSelect.queryBySysRole')"
          class="width query2"
        >
          <el-option
            v-for="item in roleKeyList"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          ></el-option>
        </datablau-select>
        <datablau-select
          filterable
          clearable
          v-model="groupKey"
          :placeholder="$t('component.staffSelect.queryByUserGroup')"
          class="width query3"
          v-if="useDam"
        >
          <el-option
            v-for="item in groupKeyList"
            :key="item.id"
            :label="item.groupName"
            :value="item.id"
          ></el-option>
        </datablau-select>
        <datablau-button class="query" type="normal" @click="query">
          {{ $t('common.button.query') }}
        </datablau-button>
        <datablau-button class="query" type="secondary" @click="resetQuery">
          {{ $t('common.button.reset') }}
        </datablau-button>
      </div>
      <div class="body left">
        <datablau-input
          clearable
          :placeholder="$t('component.staffSelect.queryByOrgNameAndCode')"
          v-model="orgKey"
          :iconfont-state="true"
          class="left-input"
        >
          <!-- <i slot="prefix" class="el-input__icon el-icon-search"></i> -->
        </datablau-input>
        <datablau-easy-tree
          :data="treeData"
          node-key="id"
          ref="branchTree"
          :default-expanded-keys="[1]"
          :expand-on-click-node="false"
          :filter-node-method="filterNode"
          @node-click="nodeClick"
          auto-expand-parent
          v-datablauLoading="treeLoading"
          :props="defaultProps"
          show-overflow-tooltip
          tooltip-placement="right"
          :data-icon-function="dataIconFunction"
          height="420px"
          :itemSize="34"
        >
          <!-- <span class="custom-tree-node" slot-scope="{ node, data }">
            <span style="font-size: 12px">
              {{
                (node.label.includes('/')
                  ? node.label.split('/')[1]
                  : node.label
                ).length > 9
                  ? (node.label.includes('/')
                      ? node.label.split('/')[1]
                      : node.label
                    ).substring(0, 9) + '...'
                  : node.label.includes('/')
                  ? node.label.split('/')[1]
                  : node.label
              }}
            </span>
          </span> -->
        </datablau-easy-tree>
      </div>
      <div class="tableStaff">
        <!-- :component-case-name="componentCaseName" -->
        <div
          style="
            position: absolute;
            overflow: auto;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
          "
        >
          <datablau-table
            v-loading="tableLoading"
            :data="tableData"
            :data-selectable="true"
            :rowSelectable="itemSelectable"
            ref="staffTable"
            @select="select"
            @select-all="selectAll"
            :border="false"
            id="staffSelectTable"
            height="100%"
            :reserve-selection="true"
            row-key="id"
          >
            <!-- <el-table-column type="selection"></el-table-column> -->
            <el-table-column
              :label="$t('component.staffSelect.loginName')"
              show-overflow-tooltip
              align="left"
              width="80"
            >
              <template slot-scope="scope">{{ scope.row.username }}</template>
            </el-table-column>
            <el-table-column
              :label="$t('component.staffSelect.name')"
              show-overflow-tooltip
              align="left"
            >
              <template slot-scope="scope">
                {{ scope.row.fullUserName }}
              </template>
            </el-table-column>
            <el-table-column
              :label="$t('component.staffSelect.org')"
              :width="$i18n.locale === 'zh' ? '' : 100"
              show-overflow-tooltip
              align="left"
              prop="orgFullName"
            ></el-table-column>
            <!--            <el-table-column label="系统角色" show-overflow-tooltip prop="tuNo" align="center"></el-table-column>-->
            <!--            <el-table-column label="所在用户组" show-overflow-tooltip width="150" align="center" prop="group"></el-table-column>-->
            <el-table-column
              :label="$t('component.staffSelect.sex')"
              width="60"
              align="center"
              prop="gender"
            ></el-table-column>
            <el-table-column
              :label="$t('component.staffSelect.duty')"
              show-overflow-tooltip
              align="left"
              prop="title"
            ></el-table-column>
            <el-table-column
              :label="$t('component.staffSelect.phone')"
              show-overflow-tooltip
              align="left"
              prop="phoneNumber"
              width="100"
            ></el-table-column>
            <el-table-column
              :label="$t('component.staffSelect.email')"
              show-overflow-tooltip
              prop="emailAddress"
              width="150"
              align="left"
            ></el-table-column>
            <!-- <el-table-column label="系统角色" align="center" show-overflow-tooltip>
              <template slot-scope="scoped">
                <span>{{(scoped.row.roles.filter(e => !e.toString().startsWith('@'))).toString()}}</span>
              </template>
            </el-table-column> -->
          </datablau-table>
        </div>
      </div>
      <div class="dialog-bottom">
        <datablau-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page.sync="currentPage"
          :page-sizes="[10, 20, 50, 100]"
          :page-size="pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          class="page"
        ></datablau-pagination>
        <datablau-button type="secondary" @click="handleCancel">
          {{ $t('common.button.cancel') }}
        </datablau-button>
        <datablau-button
          type="important"
          :disabled="!selection.length"
          @click="handleOk"
        >
          {{ $t('common.button.ok') }}
        </datablau-button>
      </div>
      <!-- <div style="height: 65vh"></div> -->
    </datablau-dialog>
  </div>
</template>

<script>
import ComponentCaseName from '@constant/ComponentCaseName'
import HTTP from '@/http/main'
export default {
  name: 'staffSelect',
  data() {
    return {
      componentCaseName: ComponentCaseName.StaffSelect,
      userKey: '',
      roleKeyList: [],
      roleKeyObject: {
        data: [],
        key: 'id',
        value: 'id',
        label: 'name',
      },
      roleKey: null,
      groupKeyList: [],
      groupKey: null,
      tableData: [],
      selection: [],
      treeData: [],
      defaultProps: {
        children: 'children',
        label: 'fullName',
        value: 'id',
      },
      pageSize: 10,
      currentPage: 1,
      total: 0,
      orgId: '',
      orgKey: '',
      timer: null,
      treeLoading: false,
      tableLoading: true,
      defaultExpandList: [],
      oldSelectionAll: [],
      toBm: '',
      // disabledList: [],
      deleteArr: [
        'roleKeyList',
        'groupKeyList',
        'tableData',
        'treeData',
        'defaultExpandList',
      ],
      visibleSync: false,
    }
  },
  mounted() {
    // this.initData()
    this.visibleSync = this.$store.state.showStaffSelect
    this.getBranchList()
    this.getRolesList()
    this.getGroupList()
    if (this.$store.state.staffIsOne) {
      setTimeout(() => {
        $('#staffSelectTable table th .el-checkbox').remove()
        // this.$refs.staffTable.toggleAllSelection(false)
      }, 10)
    }
  },
  computed: {
    useDam() {
      return this.$damEnabled
    },
  },
  beforeDestroy() {
    setTimeout(() => {
      this.deleteArr.forEach(item => {
        if (typeof this[item] === 'object' && this[item]) {
          Object.keys(this[item]).forEach(o => {
            this[item][o] = null
          })
        }
        this[item] = null
      })
      if (window.CollectGarbage) {
        window.CollectGarbage()
      }
    })
  },
  methods: {
    closeDialog() {
      this.visibleSync = false
      setTimeout(() => {
        this.$utils.staffSelect.close()
        this.$store.commit('changeStaffData', null)
      })
    },
    dataIconFunction(data, node) {
      if (data.pbm) {
        return 'iconfont icon-bumen'
      } else {
        if (node.expanded) {
          return 'iconfont icon-openfile'
        } else {
          return 'iconfont icon-file'
        }
      }
    },
    resetQuery() {
      this.userKey = ''
      this.roleKey = null
      this.groupKey = null
      this.orgKey = ''
      this.initData()
    },
    initData() {
      this.tableLoading = true
      const obj = {
        orgBm: this.toBm,
        currentPage: this.currentPage,
        pageSize: this.pageSize,
        roleId: this.roleKey,
        username: this.userKey,
        groupId: this.groupKey,
        filterUserIds: this.$store.state.userSelectFilterIds,
        enabled: this.$store.state.showDisabledUser ? null : true,
      }
      if (this.$store.state.showStaffSelectType === 1) {
        HTTP.getGroupsPage(obj)
          .then(res => {
            this.tableLoading = false
            this.tableData = res.data.content
            this.total = res.data.totalItems
            if (
              !this.$store.state.staffIsOne &&
              this.$store.state.checkedStaffData[0]
            ) {
              // 实现翻页选
              const arr = this.$store.state.checkedStaffData
              const indexArr = []
              this.tableData.forEach((e, i) => {
                arr.forEach(e2 => {
                  if (e2 === e.username) {
                    indexArr.push(this.tableData[i])
                  }
                })
              })
              this.toggleSelection(indexArr)
            }
          })
          .catch(e => {
            this.tableLoading = false
            this.$showFailure(e)
          })
      } else {
        this.$http
          .post(
            `${this.$quality_url}/quality/usersWithHasAuth/getPage?taskId=${this.$store.state.taskId}`,
            obj
          )
          .then(res => {
            this.tableLoading = false
            this.tableData = res.data.content
            this.total = res.data.totalItems
            if (this.$store.state.checkedStaffData[0]) {
              // 实现翻页选
              const arr = this.$store.state.checkedStaffData
              const indexArr = []
              this.tableData.forEach((e, i) => {
                arr.forEach(e2 => {
                  if (e2 === e.username) {
                    indexArr.push(this.tableData[i])
                  }
                })
              })
              this.toggleSelection(indexArr)
            }
          })
          .catch(e => {
            this.tableLoading = false
            this.$showFailure(e)
          })
      }
    },
    getBranchList() {
      this.treeLoading = true
      HTTP.getOrgTree()
        .then(res => {
          this.toBm = res.data.bm
          this.initData()
          this.treeLoading = false
          this.treeData.push(res.data)
          this.$nextTick(() => {
            this.$refs.branchTree.setCurrentKey(res.data.id)
          })
        })
        .catch(e => {
          this.treeLoading = false
          this.tableLoading = false
          this.$showFailure(e)
        })
    },
    getRolesList() {
      HTTP.getGroupsListPage()
        .then(res => {
          this.roleKeyList = res.data
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    getGroupList() {
      // TODO
      // 未使用 dam, 隐藏 根据用户组过滤用户
      if (!this.useDam) return
      this.$http
        .get(`/user/org/groups`)
        .then(res => {
          this.groupKeyList = res.data
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    handleSizeChange(val) {
      this.pageSize = val
      this.currentPage = 1
      this.initData()
    },
    handleCurrentChange(val) {
      this.currentPage = val
      this.initData()
    },
    toggleSelection(rows) {
      if (rows) {
        setTimeout(() => {
          rows.forEach(row => {
            this.$refs.staffTable.toggleRowSelection(row)
          })
        })
      }
    },
    handleOk() {
      if (this.$store.state.staffIsOne) {
        this.$store.commit('changeStaffData', [
          this.selection[this.selection.length - 1],
        ])
      } else {
        this.$store.commit('changeStaffData', this.selection)
      }
      this.$utils.staffSelect.close()
    },
    handleCancel() {
      this.closeDialog()
    },
    select(selection, row) {
      if (selection.includes(row)) {
        // 勾选
        let has = false
        this.selection.forEach(e => {
          if (e.username === row.username) {
            has = true
          }
        })
        if (!has) {
          this.selection.push(row)
        }
      } else {
        // 去勾选
        this.selection.forEach((e, i) => {
          if (e.username === row.username) {
            this.selection.splice(i, 1)
          }
        })
      }
      if (this.$store.state.staffIsOne) {
        if (selection.length > 1) {
          const del_row = selection.shift()
          this.$refs.staffTable.toggleRowSelection(del_row, false)
          this.selection.splice(0, 1)
        }
      }
      if (this.selection.length > 0) {
        this.$store.commit(
          'changeCheckedStaffData',
          this.selection.map(e => e.username)
        )
      } else {
        this.$store.commit('changeCheckedStaffData', [])
      }
    },
    selectAll(selection) {
      if (selection.length) {
        // 勾选
        this.oldSelectionAll = JSON.parse(JSON.stringify(selection))
        selection.forEach(e1 => {
          let has = false
          this.selection.forEach(e => {
            if (e.username === e1.username) {
              has = true
            }
          })
          if (!has) {
            this.selection.push(e1)
          }
        })
      } else {
        // 去勾选
        this.oldSelectionAll.forEach(e1 => {
          this.selection.forEach((e, i) => {
            if (e.username === e1.username) {
              this.selection.splice(i, 1)
            }
          })
        })
      }
      if (this.$store.state.staffIsOne) {
        if (selection.length > 1) {
          const del_row = selection.shift()
          this.$refs.staffTable.toggleRowSelection(del_row, false)
          this.selection.splice(0, 1)
        }
      }
      if (this.selection.length > 0) {
        this.$store.commit(
          'changeCheckedStaffData',
          this.selection.map(e => e.username)
        )
      } else {
        this.$store.commit('changeCheckedStaffData', [])
      }
    },
    query() {
      this.currentPage = 1
      this.initData()
    },
    filterNode(value, data) {
      if (!value) return true
      return (
        (data.fullName && data.fullName.indexOf(value) !== -1) ||
        (data.bm && data.bm.indexOf(value) !== -1)
      )
    },
    nodeClick(data) {
      this.toBm = data.bm
      this.query()
    },
    itemSelectable(row) {
      return !(this.$store.state.userSelectDisabledList || []).includes(row.id)
    },
  },
  watch: {
    orgKey(val) {
      clearTimeout(this.timer)
      this.timer = setTimeout(() => {
        this.$refs.branchTree.filter(val)
      }, 800)
    },
    roleKey(val) {},
  },
}
</script>
<!--<style lang="scss">-->
// 全局样式统一写在index.scss，不要写在组件内
<!--  .el-table&#45;&#45;scrollable-x .el-table__body-wrapper{-->
<!--    width: 100%;-->
<!--    position: absolute;-->
<!--    top: 40px;-->
<!--    bottom: 0;-->
<!--    overflow-y: auto;-->
<!--  }-->
<!--</style>-->
<style lang="scss" scoped>
/deep/ .el-tree-node__content {
  // padding-left: 0 !important;
  .el-icon-caret-right {
    // margin-left: 0.2em !important;
  }
}
.width {
  width: 175px;
}
.staff-select-header {
  position: absolute;
  left: 240px;
  right: 20px;
  top: 21px;
  display: flex;
}
.query1 {
  // position: absolute;
  // top: 10px;
  left: 20px;
}
.query2 {
  // position: absolute;
  // top: 10px;
  // left: 240px;
  margin-left: 10px;
  margin-right: 10px;
}
.query3 {
  // position: absolute;
  // top: 10px;
  // left: 50%;
}
.query {
  // width: 8%;
  // position: absolute;
  // top: 10px;
  // left: 85%;
  margin-left: 10px;
}
.body {
  display: inline-block;
  position: absolute;
  top: 54px;
  left: 20px;
  bottom: 50px;
  font-size: 12px;

  .branchTree {
    width: 100%;
    position: absolute;
    top: 54px;
    bottom: 20px;
    overflow-y: auto;
  }

  &.left {
    top: 10px;
  }
}
.left {
  width: 200px;
  border: 1px solid #dcdfe6;
}
.left-input {
  width: 180px;
  margin: 10px;
  /deep/ .el-input__inner {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}
.right {
  width: 78%;
}
.page {
  position: absolute;
  bottom: 0px;
  left: 20px;
}

.bottomButton {
  position: absolute;
  bottom: 20px;
  right: 20px;
}
.tableStaff {
  width: 700px;
  position: absolute;
  top: 64px;
  right: 20px;
  left: 240px;
  bottom: 50px;
  // overflow-y: auto;
  border-bottom: 1px solid #dddddd;

  // .table {
  //   width: 100%;
  //   position: absolute;
  //   top: 0;
  //   bottom: 0;
  //   overflow-y: auto;
  // }
}
.el-table--border::after,
.el-table--group::after,
.el-table::before {
  background-color: #fff;
}
</style>
