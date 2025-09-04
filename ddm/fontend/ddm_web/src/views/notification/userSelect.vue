<template>
  <div>
    <datablau-dialog
        :visible.sync="usersDialog"
        title="添加人员"
        :width="'900px'"
        height="500px"
        append-to-body
        :key="userKey"
        :table="true"
    >
      <div class="content" v-loading="dataLoading">
        <!--<div-->
        <!--  class="top-all-line"-->
        <!--  style="height: 40px;padding-top: 4px;"-->
        <!--&gt;-->
        <!--  <datablau-switch-->
        <!--    v-model="sendToAll"-->
        <!--    active-text="发送给所有人"-->
        <!--    inactive-text=" "-->
        <!--  ></datablau-switch>-->
        <!--</div>-->
        <datablau-input
          style="display: inline-block;margin-right: 10px;"
          placeholder="搜索用户、姓名"
          :iconfont-state="true"
          v-model="usersQuery"
          clearable
          @input="changeUsersQuery"
        ></datablau-input>
        <datablau-table
          :data="userShowData"
          :data-selectable="!singleSelect"
          :singleSelect="singleSelect"
          :auto-hide-selection="!singleSelect"
          row-key="userId"
          :height="$store.state.user.isAdmin ? '340px' : '340px'"
          @selection-change="handleSelectionChange"
          :checkDisabledObj="checkDisabledObj"
          :reserveSelection="true"
          v-if="usersDialog"
          key="tableKey"
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
      </div>
      <div class="footer dialog-bottom">
        <datablau-pagination
          style="display: inline-block;float: left;"
          @size-change="handleInnerSizeChange"
          @current-change="handleInnerCurrentChange"
          :page-sizes="[20, 50, 100]"
          :page-size="innerPageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="innerTotal">
        </datablau-pagination>
        <div class="right-buttons">
          <datablau-button
            @click="usersDialog = false,usersQuery='',userKey++"
          >取消
          </datablau-button>
          <datablau-button
            :disabled="!sendToAll && ((!singleSelect && !selectedUsers.length) || (singleSelect && !selectedUsers))"
            type="primary" @click="addUsers"
          >
            确定
          </datablau-button>
        </div>

      </div>
    </datablau-dialog>
  </div>
</template>

<script>
import sort from '@/resource/utils/sort'
import HTTP from '@/resource/http'

export default {
  name: 'userSelect',
  data () {
    return {
      // getUsersPromise: null,
      usersDialog: false,
      userKey: 1,
      dataLoading: false,
      usersQuery: '',
      userShowData: null,
      innerCurrent: 1,
      innerTotal: 0,
      innerPageSize: 20,
      selectedUsers: [],
      checkDisabledObj: {
        username: [this.$store.state.user.name || '']
      },
      sendToAll: false,
      tableData: [],
      tableKey: 1,
      users: null // 废弃
    }
  },
  props: {
    singleSelect: {
      type: Boolean,
      default: false
    }
  },
  components: {},
  computed: {},
  mounted () {
    this.selectedUsers = this.singleSelect ? null : []
    this.dataInit()
  },
  methods: {
    dataInit () {
      this.getInnerUserShowData()
    },
    changeUsersQuery () {
      this.innerCurrent = 1
      this.getInnerUserShowData()
    },
    getInnerUserShowData () {
      // TODO 禁用当前用户
      // TODO admin 可以发送给全体用户
      this.getUsers()
        .then(data => {
          this.innerTotal = data.totalItems
          this.userShowData = (data.content || []).map(item => {
            return {
              'username': item.username,
              'userId': item.id,
              'firstname': item.fullUserName,
              'email': item.emailAddress,
              'imported': false,
              'userType': '用户',
              enabled: true
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
    handleSelectionChange (val) {
      this.selectedUsers = val
    },
    handleInnerSizeChange (size) {
      this.innerPageSize = size
      this.getInnerUserShowData()
    },
    handleInnerCurrentChange (current) {
      this.innerCurrent = current
      this.getInnerUserShowData()
    },
    addUsers () {
      if (this.sendToAll) {
        // 发送给所有人
        this.$emit('userSelected', [{
          firstname: '所有人',
          username: 'Anyone'
        }])
        this.usersDialog = false
        return
      }
      if (!this.singleSelect && !this.selectedUsers.length) {
        return
      }
      this.$emit('userSelected', this.selectedUsers)
      this.usersDialog = false
    },
    openSelectUsersDialog () {
      this.usersQuery = ''
      this.innerPageSize = 20
      this.innerCurrent = 1
      this.usersDialog = true
      this.getInnerUserShowData()
    },
    async getUsers () {
      this.dataLoading = true
      let lq = this.usersQuery.toLowerCase()
      lq = _.trim(lq)

      return HTTP.getUserList({
        currentPage: this.innerCurrent,
        pageSize: this.innerPageSize,
        username: lq,
        fullUserName: lq,
        enabled: true
      })
    }
  },
  watch: {
    sendToAll (newVal) {
      if (newVal) {
        this.checkDisabledObj = {
          enabled: [true, false]
        }
      } else {
        this.checkDisabledObj = {
          username: [this.$store.state.user.name || '']
        }
      }
      this.$emit('sendToAll', newVal)
    }

  }
}
</script>

<style lang="scss" scoped>

</style>
