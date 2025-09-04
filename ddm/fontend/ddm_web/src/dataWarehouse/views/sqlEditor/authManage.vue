<template>
  <div class="user-wrapper">
    <datablau-dialog
        :visible.sync="usersDialog"
        title="添加人员"
        :width="manageType !== 'model' ? '1000px':'900px'"
        height="500px"
        append-to-body
        :key="userKey"
    >
      <div class="content" v-loading="dataLoading">
        <datablau-input
            style="display: inline-block;margin-right: 10px;"
            placeholder="搜索用户、姓名、Email"
            :iconfont-state="true"
            v-model="usersQuery"
            @input="changeUsersQuery"
        ></datablau-input>
        <datablau-checkbox v-model="userAuth" style="display: inline-block;">
          <el-checkbox label="SELECT">查看</el-checkbox>
          <el-checkbox label="CREATE">创建</el-checkbox>
          <el-checkbox label="UPDATE">修改</el-checkbox>
          <el-checkbox label="DELETE">删除</el-checkbox>
        </datablau-checkbox>
        <datablau-table
          :data-selectable="true"
          :auto-hide-selection="false"
          :data="userShowData"
          @selection-change="handleSelectionChange"
          :reserve-selection="true"
          row-key="userId"
          height="340px"
        >
          <el-table-column
            prop="username"
            label="用户名"
            width="150"
            show-overflow-tooltip>
          </el-table-column>
          <el-table-column
            prop="firstname"
            label="姓名"
            width="150"
            show-overflow-tooltip>
          </el-table-column>
          <el-table-column
            prop="email"
            label="Email">
          </el-table-column>
        </datablau-table>
        <datablau-pagination
          style="margin-top: 15px;display: inline-block;text-align: left"
          @size-change="handleInnerSizeChange"
          @current-change="handleInnerCurrentChange"
          :page-sizes="[20, 50, 100]"
          :page-size="innerPageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="innerTotal">
        </datablau-pagination>
        <span class="footer">
          <div v-if="false" class="left-checkbox" style="display: inline-block; float: left;">
            <datablau-checkbox v-model="applyToChildren" checkbox-type="single">应用到子目录</datablau-checkbox>
          </div>
          <datablau-button @click="usersDialog = false,usersQuery='',userKey++">取 消</datablau-button>
          <datablau-button :disabled="!selectedUsers.length" type="primary" @click="addUsers">
            确 定
          </datablau-button>
        </span>
      </div>
    </datablau-dialog>
    <h2 style="height:32px;padding-top:12px;">权限管理</h2>
    <datablau-input
      placeholder="搜索用户、姓名、Email"
      :iconfont-state="true"
      v-model="query"
      @input="searchUser"
      style="margin-right: 10px;margin-bottom: -10px;"
    ></datablau-input>
    <!--<datablau-checkbox v-if="editable && false" v-model="filterUsers" style="display: inline-block"-->
    <!--                   @change="changeFilterUsersType">-->
    <!--  <el-checkbox label="adminUsers">管理员</el-checkbox>-->
    <!--  <el-checkbox label="editorUsers">读写权限用户</el-checkbox>-->
    <!--  <el-checkbox label="viewerUsers">只读权限用户</el-checkbox>-->
    <!--</datablau-checkbox>-->
    <datablau-button
      type="important"
      v-if="editable"
      style="float: right"
      class="iconfont icon-tianjia"
      @click="openSelectUsersDialog">
      新增用户
    </datablau-button>
    <span v-if="!editable">当前用户仅显示管理员</span>
    <div class="table-user-container">
      <datablau-table
        v-if="ready"
        :data-selectable="editable"
        :data="tableShowData"
        height="100%"
        row-key="userId"
        @selection-change="handleSelectionUsersChange"
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
          min-width="400"
          show-overflow-tooltip>
          <template slot-scope="scope">
            <datablau-checkbox
              v-model="scope.row.authType" style="display: inline-block;"
              @change="changeUserType(...arguments, scope.row)"
            >
              <el-checkbox label="SELECT">查看</el-checkbox>
              <el-checkbox label="CREATE">创建</el-checkbox>
              <el-checkbox label="UPDATE">修改</el-checkbox>
              <el-checkbox label="DELETE">删除</el-checkbox>
            </datablau-checkbox>
            <!--<datablau-select-->
            <!--  v-if="editable"-->
            <!--  v-model="scope.row.type"-->
            <!--  @change="changeUserType(...arguments, scope.row)"-->
            <!--&gt;-->
            <!--  <el-option-->
            <!--    v-for="item in options"-->
            <!--    :key="item.value"-->
            <!--    :label="item.label"-->
            <!--    :value="item.value"-->
            <!--  ></el-option>-->
            <!--</datablau-select>-->
            <!--<datablau-select-->
            <!--  v-else-->
            <!--  v-model="scope.row.type"-->
            <!--  disabled-->
            <!--&gt;-->
            <!--  <el-option-->
            <!--    v-for="item in options"-->
            <!--    :key="item.value"-->
            <!--    :label="item.label"-->
            <!--    :value="item.value"-->
            <!--  ></el-option>-->
            <!--</datablau-select>-->
          </template>
        </el-table-column>
        <el-table-column
          v-if="editable"
          label="操作"
          width="50"
          show-overflow-tooltip>
          <template slot-scope="scope">
            <datablau-button class="iconfont icon-delete" type="icon" @click="deleteUser(scope.row)"></datablau-button>
          </template>
        </el-table-column>
      </datablau-table>
    </div>
    <div class="page-pignation">
      <div :style="selectedOutUsers.length ? 'visibility: visible': 'visibility: hidden'">
        当前选中{{ selectedOutUsers.length }}条信息，是否&nbsp;&nbsp;&nbsp;
        <datablau-button
          size="small"
          type="danger"
          class="el-icon-delete"
          @click="handleDeleteUsers"
          :disable="!selectedOutUsers.length"
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
        :total="total">
      </datablau-pagination>
    </div>
  </div>
</template>

<script>
import HTTP from '@/resource/http.js'
import sort from '@/resource/utils/sort'

export default {
  name: 'authManage',
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
      // userType: 'viewerUsers',
      userAuth: [],
      // checkDisabledObj: {
      //   userId: []
      // },
      // adminUsers: [],
      // editorUsers: [],
      // viewerUsers: [],
      // filterUsers: ['adminUsers', 'editorUsers', 'viewerUsers'],
      // userClass: ['adminUsers', 'editorUsers', 'viewerUsers'],
      selectedUsers: [],
      userKey: 0,
      // options: [{
      //   label: '管理员',
      //   value: 'adminUsers'
      // }, {
      //   label: '读写权限用户',
      //   value: 'editorUsers'
      // }, {
      //   label: '只读权限用户',
      //   value: 'viewerUsers'
      // }],
      applyToChildren: false,
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
    }
  },
  mounted () {
    // this.getModelPermissionUsers()
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
      let tempData = this.tableData.filter(item => ((item.username && (item.username.toLowerCase().indexOf(lq) !== -1)) || (item.firstname && (item.firstname.toLowerCase().indexOf(lq) !== -1)) || (item.email && (item.email.toLowerCase().indexOf(lq) !== -1))))
      this.total = tempData.length
      sort.sort(tempData, 'username')
      this.tableShowData = tempData.slice((this.current - 1) * this.pageSize, this.current * this.pageSize)
      console.log(this.tableShowData, 'tableShowData')
    },
    changeFilterUsersType () {
      this.current = 1
      this.getTableShowData()
    },
    handleSelectionUsersChange (val) {
      this.selectedOutUsers = val
    },
    handleDeleteUsers () {
      this.$DatablauCofirm('确定删除?', '提示', {
        type: 'warning'
      }).then(() => {
        let delPromise = []
        this.selectedOutUsers.forEach(user => {
          let requestBody = {
            nodeId: this.categoryId,
            username: user.username,
            authType: user.authType
          }
          let del = this.$http.post(`${this.$dddUrl}/service/code/folder/auth/deleteAuth`, requestBody)
          delPromise.push(del)
        })
        return Promise.all(delPromise)
      }).then(res => {
        this.userKey++
        this.$datablauMessage.success('删除成功')
        this.getModelPermissionUsers()
      }).catch(err => {
        this.getModelPermissionUsers()
        this.$showFailure(err)
      })
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
      let requestBody = {
        nodeId: this.categoryId,
        username: row.username,
        authType: row.authType
      }
      this.$http.post(`${this.$dddUrl}/service/code/folder/auth/updateAuth`, requestBody)
        .then(res => {
          this.userKey++
          this.$datablauMessage.success('修改成功')
          this.getModelPermissionUsers()
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
      let requestBody = []
      this.selectedUsers.forEach(item => {
        requestBody.push({
          nodeId: this.categoryId,
          username: item.username,
          authType: this.userAuth
        })
      })
      // requestBody.concat(this.tableData)
      let promiseAll = requestBody.map(item => {
        return this.$http.post(`${this.$dddUrl}/service/code/folder/auth/createAuth`, item)
      })
      Promise.all(promiseAll)
        .then(res => {
          this.userKey++
          this.$datablauMessage.success('添加成功')
          this.getModelPermissionUsers()
        }).catch(err => {
          this.$showFailure(err)
        })
      this.usersDialog = false
    },
    openSelectUsersDialog () {
      this.applyToChildren = false
      this.usersDialog = true
      this.innerPageSize = 20
      this.innerCurrent = 1
      this.getInnerUserShowData()
    },
    deleteUser (row) {
      console.log(row, 'row')
      this.$DatablauCofirm('确定删除?', '提示', {
        type: 'warning'
      }).then(() => {
        let requestBody = {
          nodeId: this.categoryId,
          username: row.username,
          authType: row.authType
        }
        this.$http.post(`${this.$dddUrl}/service/code/folder/auth/deleteAuth`, requestBody)
          .then(res => {
            this.userKey++
            this.$datablauMessage.success('删除成功')
            this.getModelPermissionUsers()
          }).catch(err => {
            this.getModelPermissionUsers()
            this.$showFailure(err)
          })
      }).catch(() => {

      })
    },
    getModelPermissionUsers () {
      this.$http.post(`${this.$dddUrl}/service/code/folder/auth/findAuthByNode?nodeId=${this.categoryId}`)
        .then(res => {
          let data = res.data
          this.ready = true
          this.current = 1
          let userMap = {}
          this.usersData.forEach(item => {
            userMap[item.username] = item
          })
          data.forEach(user => {
            let userData = userMap[user.username] || {}
            user.userId = userData.userId
            user.email = userData.email
            user.firstname = userData.firstname
          })
          this.tableData = data
          this.getTableShowData()
          // this.checkDisabledObj.userId = this.tableData.map(i => i.userId)
        }).catch(err => {
          this.$showFailure(err)
        })
    },
    getInnerUserShowData () {
      let usersData = this.filterAddUser(this.usersData)
      this.userShowData = []
      console.log(this.userShowData, 'this.userShowData')
      let lq = this.usersQuery.toLowerCase()
      let tempData = usersData.filter(item => ((item.username && (item.username.toLowerCase().indexOf(lq) !== -1)) || (item.firstname && (item.firstname.toLowerCase().indexOf(lq) !== -1)) || (item.email && (item.email.toLowerCase().indexOf(lq) !== -1))))
      this.innerTotal = tempData.length
      sort.sort(tempData, 'username')
      this.userShowData = tempData.slice((this.innerCurrent - 1) * this.innerPageSize, this.innerCurrent * this.innerPageSize)
    },
    getAllUsers () {
      this.dataLoading = true
      this.$http.get(this.$url + '/service/permissions/users').then(res => {
        this.usersData = res.data
        console.log(this.usersData, 'this.usersData')
        this.innerCurrent = 1
        this.innerPageSize = 20
        this.getInnerUserShowData()
        this.dataLoading = false

        this.getModelPermissionUsers()
      }).catch(err => {
        this.$showFailure(err)
      })
    },
    //  隐藏已经添加的用户, 即外层列表中显示的用户
    filterAddUser (userList) {
      let filterUsers = {}
      this.tableData.forEach(item => {
        filterUsers[item.username] = true
      })
      return userList.filter(item => !filterUsers[item.username])
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
  bottom: 50px;
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
