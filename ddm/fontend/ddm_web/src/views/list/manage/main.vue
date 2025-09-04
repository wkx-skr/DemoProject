<template>
  <div class="user-wrapper">
    <datablau-dialog
        :visible.sync="showConfirmDialog"
        title="提示"
        :width="'400px'"
        height="200px"
        append-to-body
        @close="cancelUpdate"
    >
      <div class="content">
        <p style="margin-top: 15px;">
          <i
            class="el-icon-warning"
            :style="{
              color: '#f79b3f',
              display: 'inline-block',
              'margin-right': '9px',
              'font-size': '24px',
              'vertical-align': 'top',
              'line-height': '24px',
            }"
          ></i>
          <span style="color: #3a3e44; font-size: 16px; vertical-align: top;line-height: 24px;" >{{confirmType === 'update' ? '确定更改用户权限?' : '确定删除?'}}</span>
        </p>
        <div v-if="manageType !== 'model'" class="left-checkbox" style="display: inline-block; float: left;height: 32px;line-height: 32px;margin-right: 5px;padding-left: 32px; color: #3a3e44;">
          <span class="label" style="font-size: 14px;display: inline-block;margin-right: 2px;">应用范围：</span>
          <datablau-checkbox style="display: inline-block;margin-right: 20px;" v-model="applyToModel" checkbox-type="single">应用到模型</datablau-checkbox>
          <datablau-checkbox style="display: inline-block;" v-model="applyToChildren" checkbox-type="single">应用到子目录</datablau-checkbox>
        </div>
      </div>
      <div slot="footer">
        <!--<span class="footer"></span>-->
        <datablau-button type="cancel" @click="cancelUpdate"></datablau-button>
        <datablau-button  type="primary" @click="confirmUpdate">
          确定
        </datablau-button>
      </div>
    </datablau-dialog>
    <datablau-dialog
      :visible.sync="usersDialog"
      title="添加人员"
      :width="manageType !== 'model' ? '1000px':'900px'"
      height="500px"
      append-to-body
      :key="userKey"
      :blackTheme="sqlEdit"
      :table="true"
    >
      <div class="content" :class="{'content-black-theme': sqlEdit}" v-loading="dataLoading" v-if="usersDialog">
        <datablau-input
          style="display: inline-block;margin-right: 10px;"
          placeholder="搜索用户、姓名"
          :iconfont-state="true"
          v-model="usersQuery"
          @input="changeUsersQuery"
          :themeBlack="sqlEdit"
        ></datablau-input>
        <datablau-radio
        :themeBlack="sqlEdit"
          v-model="userType"
          style="display: inline-block;">
          <el-radio label="adminUsers">管理员</el-radio>
          <el-radio label="editorUsers">读写权限用户</el-radio>
          <el-radio label="viewerUsers">只读权限用户</el-radio>
        </datablau-radio>
        <datablau-table
          :data-selectable="true"
          :auto-hide-selection="false"
          :data="userShowData"
          :checkDisabledObj="checkDisabledObj"
          @selection-change="handleSelectionChange"
          :reserve-selection="true"
          row-key="userId"
          height="340px"
          :themeBlack="sqlEdit"
        >
          <el-table-column
            prop="username"
            label="用户名"
            min-width="150"
            show-overflow-tooltip>
          </el-table-column>
          <el-table-column
            prop="firstname"
            label="姓名"
            min-width="150"
            show-overflow-tooltip>
          </el-table-column>
          <el-table-column
            prop="email"
            label="Email"
            min-width="150"
          >
          </el-table-column>
        </datablau-table>
        <datablau-pagination
          style="margin-top: 15px;display: inline-block;text-align: left"
          @size-change="handleInnerSizeChange"
          @current-change="handleInnerCurrentChange"
          :page-sizes="[20, 50, 100]"
          :page-size="innerPageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :themeBlack="sqlEdit"
          :total="innerTotal">
        </datablau-pagination>
        <span class="footer">
          <div v-if="manageType !== 'model'" class="left-checkbox" style="display: inline-block; float: left;height: 32px;line-height: 32px;margin-right: 5px;">
            <datablau-checkbox style="display: inline-block;margin-right: 5px;" v-model="applyToModel" checkbox-type="single">应用到模型</datablau-checkbox>
            <datablau-checkbox style="display: inline-block;" v-model="applyToChildren" checkbox-type="single">应用到子目录</datablau-checkbox>
          </div>
          <datablau-button :themeBlack="sqlEdit" type="cancel" @click="usersDialog = false,usersQuery='',userKey++"></datablau-button>
          <datablau-button :themeBlack="sqlEdit" :disabled="!selectedUsers.length" type="primary" @click="addUsers">
            确定
          </datablau-button>
        </span>
      </div>
    </datablau-dialog>
    <h2 style="height:32px;padding-top:12px;" v-if="sqlEdit !== true">权限管理</h2>
    <datablau-input
      placeholder="搜索用户、姓名、Email"
      :iconfont-state="true"
      v-model="query"
      @input="searchUser"
     :themeBlack="sqlEdit"
      style="margin-right: 10px;margin-bottom: -10px;"
    ></datablau-input>
    <datablau-checkbox :themeBlack="sqlEdit" v-if="editable" v-model="filterUsers" style="display: inline-block" @change="changeFilterUsersType">
      <el-checkbox label="adminUsers">管理员</el-checkbox>
      <el-checkbox label="editorUsers">读写权限用户</el-checkbox>
      <el-checkbox label="viewerUsers">只读权限用户</el-checkbox>
    </datablau-checkbox>
    <datablau-button
      type="important"
      v-if="editable"
      style="float: right"
      class="iconfont icon-tianjia"
      :themeBlack="sqlEdit"
      @click="openSelectUsersDialog">
      添加用户
    </datablau-button>
    <span v-if="!editable" :style="sqlEdit? 'color:#bbb': ''">当前用户仅显示管理员</span>
    <div class="table-user-container">
      <datablau-form-submit>
        <div>
          <datablau-table
            v-if="ready"
            :data-selectable="editable"
            :data="tableShowData"
            :showColumnSelection="false"
            height="100%"
            :reserve-selection="true"
            row-key="userId"
            @selection-change="handleSelectionUsersChange"
            :themeBlack="sqlEdit"
          >
            <el-table-column
              prop="username"
              label="用户名"
              min-width="150"
              show-overflow-tooltip>
            </el-table-column>
            <el-table-column
              prop="firstname"
              label="姓名"
              min-width="150"
              show-overflow-tooltip>
            </el-table-column>
            <el-table-column
              prop="email"
              min-width="300"
              label="Email">
            </el-table-column>
            <el-table-column
              prop=""
              label="权限"
              width="200"
              show-overflow-tooltip>
              <template slot-scope="scope">
                <datablau-select
                  v-if="editable"
                  v-model="scope.row.type"
                  @change="changeUserType(...arguments, scope.row)"
                  :themeBlack="sqlEdit"
                >
                  <el-option
                    v-for="item in options"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  ></el-option>
                </datablau-select>
                <datablau-select
                  v-else
                  v-model="scope.row.type"
                  disabled
                  :themeBlack="sqlEdit"
                >
                  <el-option
                    v-for="item in options"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  ></el-option>
                </datablau-select>
              </template>
            </el-table-column>
            <el-table-column
              v-if="editable"
              label="操作"
              width="50"
              show-overflow-tooltip>
              <template slot-scope="scope">
                <datablau-button class="iconfont icon-delete" type="icon"
                                 @click="deleteUser(scope.row)"></datablau-button>
              </template>
            </el-table-column>
          </datablau-table>
        </div>
        <template slot="buttons">
          <div class="page-pignation" :class="{'black-theme': sqlEdit}">
            <div :style="selectedOutUsers.length ? 'visibility: visible': 'visibility: hidden'">
              当前选中{{ selectedOutUsers.length }}条信息，是否&nbsp;&nbsp;&nbsp;
              <datablau-button
                size="small"
                type="danger"
                class="el-icon-delete"
                @click="handleDeleteUsers"
                :disable="!selectedOutUsers.length"
                :themeBlack="sqlEdit"
              >
                删除
              </datablau-button>
            </div>
            <datablau-pagination
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
              :page-sizes="[20, 50, 100]"
              :page-size="pageSize"
              layout="total, sizes, prev, pager, next, jumper"
              :themeBlack="sqlEdit"
              :total="total">
            </datablau-pagination>
          </div>
        </template>
      </datablau-form-submit>
    </div>
  </div>
</template>

<script>
import HTTP from '@/resource/http.js'
import sort from '@/resource/utils/sort'
export default {
  data () {
    return {
      dataLoading: false,
      modelId: this.$route.query.id,
      tableData: [],
      tableShowData: [],
      query: '',
      usersQuery: '',
      usersDialog: false,
      current: 1,
      total: 0,
      pageSize: 20,
      innerCurrent: 1,
      innerTotal: 0,
      innerPageSize: 20,
      usersData: [],
      userShowData: [],
      userType: 'viewerUsers',
      checkDisabledObj: {
        userId: []
      },
      adminUsers: [],
      editorUsers: [],
      viewerUsers: [],
      filterUsers: ['adminUsers', 'editorUsers', 'viewerUsers'],
      userClass: ['adminUsers', 'editorUsers', 'viewerUsers'],
      selectedUsers: [],
      userKey: 0,
      options: [{
        label: '管理员',
        value: 'adminUsers'
      }, {
        label: '读写权限用户',
        value: 'editorUsers'
      }, {
        label: '只读权限用户',
        value: 'viewerUsers'
      }],
      showConfirmDialog: false,
      confirmType: 'update', // update, delete, deleteBatch
      newUserTypeValue: null,
      updateRow: null,
      applyToChildren: false,
      applyToModel: false,
      selectedOutUsers: [],
      editable: true,
      ready: false
    }
  },
  props: {
    manageType: {
      type: String,
      default: 'model' // category
    },
    categoryId: {
      type: [String, Number],
      default: ''
    },
    sqlEdit: {
      default: false
    },
    permissionModelId: {
      type: [String, Number],
      default: ''
    }
  },
  mounted () {
    this.getModelPermissionUsers()
    this.getAllUsers()
  },
  methods: {
    handleInnerSizeChange (size) {
      this.innerPageSize = size
      this.getInnerUserShowData()
    },
    handleInnerCurrentChange (current) {
      this.innerCurrent = current
      this.getInnerUserShowData()
    },
    getTableShowData () {
      let lq = this.query.toLowerCase()
      let tempData = this.tableData.filter(i => this.filterUsers.includes(i.type)).filter(item => ((item.username && (item.username.toLowerCase().indexOf(lq) !== -1)) || (item.firstname && (item.firstname.toLowerCase().indexOf(lq) !== -1)) || (item.email && (item.email.toLowerCase().indexOf(lq) !== -1))))
      this.total = tempData.length
      sort.sort(tempData, 'username')
      this.tableShowData = tempData.slice((this.current - 1) * this.pageSize, this.current * this.pageSize)
      this.ready = false
      this.$nextTick(() => {
        this.ready = true
      })
    },
    changeFilterUsersType () {
      this.current = 1
      this.getTableShowData()
    },
    handleSelectionUsersChange (val) {
      this.selectedOutUsers = val
    },
    handleSizeChange (size) {
      this.pageSize = size
      this.getTableShowData()
    },
    handleCurrentChange (current) {
      this.current = current
      this.getTableShowData()
    },
    searchUser () {
      this.current = 1
      this.getTableShowData()
    },
    changeUserType (val, row) {
      if (this.manageType === 'model') {
        this.$DatablauCofirm('确定更改用户权限?', '提示', {
          type: 'warning'
        }).then(() => {
          this.changeUserTypeConfirm(val, row)
        }).catch((e) => {
          console.log(e)
          row.type = row.typeBak
        })
      } else {
        // 修改权限，展示弹框
        this.newUserTypeValue = val
        this.confirmType = 'update'
        this.applyToModel = false
        this.applyToChildren = false
        this.updateRow = row
        this.showConfirmDialog = true
      }
    },
    deleteUser (row) {
      if (this.manageType === 'model') {
        this.$DatablauCofirm('确定删除?', '提示', {
          type: 'warning'
        }).then(() => {
          this.handleDeletePermission(row)
        }).catch((e) => {
          console.log(e)
        })
      } else {
        this.confirmType = 'delete'
        this.applyToModel = false
        this.applyToChildren = false
        this.updateRow = row
        this.showConfirmDialog = true
      }
    },
    handleDeleteUsers () {
      if (this.manageType === 'model') {
        this.$DatablauCofirm('确定删除?', '提示', {
          type: 'warning'
        }).then(() => {
          this.handleDeleteUsersBatch()
        }).catch((e) => {
          console.log(e)
        })
      } else {
        this.confirmType = 'deleteBatch'
        this.applyToModel = false
        this.applyToChildren = false
        // this.updateRow = row
        this.showConfirmDialog = true
      }
    },
    cancelUpdate () {
      if (this.confirmType === 'update') {
        this.updateRow.type = this.updateRow.typeBak
      }
      this.showConfirmDialog = false
    },
    confirmUpdate () {
      if (this.confirmType === 'update') {
        this.changeUserTypeConfirm(this.newUserTypeValue, this.updateRow)
      } else if (this.confirmType === 'delete') {
        this.handleDeletePermission(this.updateRow)
      } else {
        this.handleDeleteUsersBatch()
      }
    },
    changeUserTypeConfirm (val, row) {
      let userIndex = this[row.typeBak].findIndex(item => item.userId === row.userId)
      this[row.type] = this[row.type].concat(this[row.typeBak].splice(userIndex, 1))
      let editUserPromise
      let requestBody = {
        adminUsers: this.adminUsers,
        editorUsers: this.editorUsers,
        viewerUsers: this.viewerUsers
      }
      if (this.manageType === 'model') {
        editUserPromise = this.$http.put(this.$url + `/service/permissions/models/${this.permissionModelId === '' ? this.modelId : this.permissionModelId}/users`, requestBody)
      } else {
        editUserPromise = HTTP.updateCategoryPermission({
          categoryId: this.categoryId,
          applyToChildren: this.applyToChildren,
          applyToModel: this.applyToModel,
          requestBody
        })
      }
      editUserPromise
        .then(res => {
          this.userKey++
          this.$datablauMessage.success('修改成功')
          this.getModelPermissionUsers()
          this.showConfirmDialog = false
        }).catch(err => {
          this.getModelPermissionUsers()
          this.$showFailure(err)
        })
        // }).catch(() => {
        //   row.type = row.typeBak
        // })
    },
    handleDeletePermission (row) {
      this[row.type] = this[row.type].filter(item => item.userId !== row.userId)
      let deletePromise
      let requestBody = {
        adminUsers: this.adminUsers,
        editorUsers: this.editorUsers,
        viewerUsers: this.viewerUsers
      }
      if (this.manageType === 'model') {
        deletePromise = this.$http.put(this.$url + `/service/permissions/models/${this.permissionModelId === '' ? this.modelId : this.permissionModelId}/users`, requestBody)
      } else {
        deletePromise = HTTP.updateCategoryPermission({
          categoryId: this.categoryId,
          applyToChildren: this.applyToChildren,
          applyToModel: this.applyToModel,
          requestBody
        })
      }
      deletePromise
        .then(res => {
          this.userKey++
          this.$datablauMessage.success('删除成功')
          this.getModelPermissionUsers()
          this.showConfirmDialog = false
        }).catch(err => {
          this.getModelPermissionUsers()
          this.$showFailure(err)
        })
    },
    handleDeleteUsersBatch () {
      this.selectedOutUsers.forEach(user => {
        this[user.type] = this[user.type].filter(item => item.userId !== user.userId)
      })
      let deletePromise
      let requestBody = {
        adminUsers: this.adminUsers,
        editorUsers: this.editorUsers,
        viewerUsers: this.viewerUsers
      }
      if (this.manageType === 'model') {
        deletePromise = this.$http.put(this.$url + `/service/permissions/models/${this.permissionModelId === '' ? this.modelId : this.permissionModelId}/users`, requestBody)
      } else {
        deletePromise = HTTP.updateCategoryPermission({
          categoryId: this.categoryId,
          applyToChildren: this.applyToChildren,
          applyToModel: this.applyToModel,
          requestBody
        })
      }
      deletePromise
        .then(res => {
          this.userKey++
          this.$datablauMessage.success('删除成功')
          this.getModelPermissionUsers()
          this.showConfirmDialog = false
        }).catch(err => {
          this.getModelPermissionUsers()
          this.$showFailure(err)
        })
    },
    changeUsersQuery () {
      this.innerCurrent = 1
      this.getInnerUserShowData()
    },
    handleSelectionChange (val) {
      this.selectedUsers = val
    },
    addUsers () {
      if (!this.selectedUsers.length) {
        return
      }
      let addUserPromise
      let requestBody = {
        adminUsers: this.userType === 'adminUsers' ? this.adminUsers.concat(this.selectedUsers) : this.adminUsers.filter(i => !this.selectedUsers.map(u => u.userId).includes(i.userId)),
        editorUsers: this.userType === 'editorUsers' ? this.editorUsers.concat(this.selectedUsers) : this.editorUsers.filter(i => !this.selectedUsers.map(u => u.userId).includes(i.userId)),
        viewerUsers: this.userType === 'viewerUsers' ? this.viewerUsers.concat(this.selectedUsers) : this.viewerUsers.filter(i => !this.selectedUsers.map(u => u.userId).includes(i.userId))
        // [this.userType]: this[this.userType].concat(this.selectedUsers)
      }
      if (this.manageType === 'model') {
        addUserPromise = this.$http.put(this.$url + `/service/permissions/models/${this.permissionModelId === '' ? this.modelId : this.permissionModelId}/users`, requestBody)
      } else {
        addUserPromise = HTTP.updateCategoryPermission({
          categoryId: this.categoryId,
          applyToChildren: this.applyToChildren,
          applyToModel: this.applyToModel,
          requestBody
        })
      }
      addUserPromise
        .then(res => {
          this.userKey++
          this.$datablauMessage.success('添加成功')
          this.getModelPermissionUsers()
        }).catch(err => {
          this.$showFailure(err)
        })
        .finally(() => {
          this.selectedUsers = []
        })
      this.usersDialog = false
    },
    openSelectUsersDialog () {
      this.usersQuery = ''
      this.applyToChildren = false
      this.applyToModel = false
      this.usersDialog = true
      this.innerPageSize = 20
      this.innerCurrent = 1
      this.getInnerUserShowData()
    },
    getModelPermissionUsers () {
      let getUserPromise
      if (this.manageType === 'model') {
        getUserPromise = this.$http.get(this.$url + `/service/permissions/models/${this.permissionModelId === '' ? this.modelId : this.permissionModelId}/users`)
      } else {
        getUserPromise = HTTP.getCategoryPermission(this.categoryId)
      }
      getUserPromise
        .then(res => {
          let data = this.manageType === 'model' ? res.data : res
          this.adminUsers = data.adminUsers.map(i => ({ ...i, type: 'adminUsers', typeBak: 'adminUsers' }))
          if (this.$store.state.user.isAdmin || this.adminUsers.some(u => u.userId === this.$store.state.user.userId)) {
            this.editable = true
          } else {
            this.editable = false
            this.filterUsers = ['adminUsers']
          }
          this.ready = true
          this.editorUsers = data.editorUsers.map(i => ({ ...i, type: 'editorUsers', typeBak: 'editorUsers' }))
          this.viewerUsers = data.viewerUsers.map(i => ({ ...i, type: 'viewerUsers', typeBak: 'viewerUsers' }))
          this.tableData = [].concat(this.adminUsers, this.editorUsers, this.viewerUsers)
          this.current = 1
          this.getTableShowData()
          this.checkDisabledObj.userId = this.tableData.map(i => i.userId)
        }).catch(err => {
          this.$showFailure(err)
        })
    },
    getInnerUserShowData () {
      this.dataLoading = true
      let lq = this.usersQuery.toLowerCase()
      lq = _.trim(lq)
      HTTP.getUserList({
        currentPage: this.innerCurrent,
        pageSize: this.innerPageSize,
        username: lq,
        fullUserName: lq,
        enabled: true
      })
        .then(data => {
          this.innerTotal = data.totalItems
          this.userShowData = (data.content || []).map(item => {
            return {
              'username': item.username,
              'userId': item.id,
              'firstname': item.fullUserName,
              'email': item.emailAddress,
              'imported': false,
              'userType': '用户'
            }
          })
        })
        .catch(e => {
          this.$showFailure(e)
        })
        .finally(() => {
          this.dataLoading = false
        })
    },
    getAllUsers () {
      this.usersData = []
      this.innerCurrent = 1
      this.innerPageSize = 20
      this.getInnerUserShowData()
    }
  },
  watch: {
    permissionModelId () {
      this.getModelPermissionUsers()
    }
  }
}
</script>
<style scoped lang="scss">
  .footer {
    float: right;
    margin-top: 10px;
  }
  .table-user-container {
    position: absolute;
    top: 77px;
    left: 0;
    right: 0;
    bottom: 0;
  }
  .page-pignation {
    border-top: 1px solid #ddd;
    position: absolute;
    bottom: 0;
    right: 0;
    height: 50px;
    left: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    &.black-theme{
      border-top: none;
    }
  }
.user-wrapper {
  position: absolute;
  top: 0;
  left: 20px;
  bottom: 0px;
  right: 20px;
  h2 {
    font-size: 16px;
    margin: -4px 0 8px;
    color: #555;
    line-height: 1;
  }
}
</style>
<style lang="scss">
  .content-black-theme{
    .el-loading-mask{
      background-color: rgba(0, 0, 0, .5) !important;
      color: #bbb;
    }
  }
</style>
