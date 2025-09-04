<template>
  <div
    class="access-control-wrapper"
    :class="{
      'security-access-control-wrapper': activeName === 'accessControl',
    }"
    v-loading="loading"
  >
    <datablau-dialog
      :title="$t('meta.DS.tableDetail.visitControl.addOrg')"
      v-if="dialogVisibleOrganization"
      :visible.sync="dialogVisibleOrganization"
      size="s"
    >
      <div>
        {{ $t('meta.DS.tableDetail.visitControl.selectedOrg')
        }}{{ selection.fullName }}
      </div>
      <datablau-input
        style="margin-top: 10px; width: 320px"
        clearable
        :placeholder="$t('meta.DS.tableDetail.visitControl.fillOrgInfo')"
        v-model="nameKey"
        :iconfont-state="true"
      ></datablau-input>
      <datablau-tree
        :data="treeData"
        node-key="bm"
        ref="branchTree"
        class="grey-tree branchTree"
        :default-expanded-keys="defaultExpandList"
        :expand-on-click-node="false"
        :filter-node-method="filterNode"
        @node-click="nodeClick"
        v-loading="treeLoading"
        :props="defaultProps"
        :data-icon-function="dataIconFunction"
      ></datablau-tree>
      <div style="padding-bottom: 20px">
        <span style="display: inline-block; width: 80px">
          {{ $t('meta.DS.tableDetail.visitControl.accessLevel') }}
        </span>
        <datablau-select
          v-model="level"
          style="margin-top: 10px; display: inline-block; width: 320px"
        >
          <el-option
            v-for="item in levelOption"
            :label="item.name"
            :key="item.id"
            :value="item.id"
          ></el-option>
        </datablau-select>
      </div>
      <span slot="footer" class="dialog-footer">
        <datablau-button type="secondary" @click="closeAddOrg">
          {{ $t('common.button.cancel') }}
        </datablau-button>
        <datablau-button type="important" @click="addOrganization">
          {{ $t('common.button.ok') }}
        </datablau-button>
      </span>
    </datablau-dialog>

    <datablau-dialog
      :title="$t('meta.DS.tableDetail.visitControl.addUserGroup')"
      :visible.sync="dialogVisibleUserGroup"
      size="s"
    >
      <div class="dialog-form-content">
        <div class="form-item">
          <span>
            {{ $t('meta.DS.tableDetail.visitControl.userGroup') }}
          </span>
          <datablau-select
            style="width: 320px"
            v-model="userGroupSelected"
            filterable
            :placeholder="$t('meta.common.pleaseSelect')"
            :loading="groupLoading"
          >
            <el-option
              v-for="item in userGroup"
              :key="item.id"
              :label="item.groupName"
              :value="item.id"
            ></el-option>
          </datablau-select>
        </div>
        <div class="form-item">
          <span>
            {{ $t('meta.DS.tableDetail.visitControl.accessLevel') }}
          </span>
          <datablau-select v-model="level" style="width: 320px">
            <el-option
              v-for="item in levelOption"
              :label="item.name"
              :key="item.id"
              :value="item.id"
            ></el-option>
          </datablau-select>
        </div>
      </div>

      <span slot="footer" class="dialog-footer">
        <datablau-button type="secondary" @click="closeAddUG">
          {{ $t('common.button.cancel') }}
        </datablau-button>
        <datablau-button type="important" @click="addUserGroup">
          {{ $t('common.button.ok') }}
        </datablau-button>
      </span>
    </datablau-dialog>
    <datablau-dialog
      :title="$t('meta.DS.tableDetail.visitControl.addUser')"
      :visible.sync="dialogVisibleUsers"
      size="s"
    >
      <div class="dialog-form-content">
        <div class="form-item">
          <span>{{ $t('meta.DS.tableDetail.visitControl.user') }}</span>
          <datablau-select
            style="width: 320px"
            v-model="usersSelected"
            filterable
            :splaceholder="$t('meta.common.pleaseSelect')"
            :loading="userLoading"
            :filter-method="usersFilter"
          >
            <el-option
              filterable
              v-for="item in usersShow"
              :key="item.userId"
              :label="item.username + '(' + item.fullUserName + ')'"
              :value="item.username"
            ></el-option>
            <el-option
              disabled
              v-if="showSize < users.length"
              :value="-1"
              :key="-1"
              @click.native.stop="showMore"
            >
              <a style="display: block; text-align: center; color: #4386f5">
                {{ $t('common.button.more') }}
              </a>
            </el-option>
          </datablau-select>
        </div>
        <div class="form-item">
          <span>{{ $t('meta.DS.tableDetail.visitControl.accessLevel') }}</span>
          <datablau-select v-model="level" style="width: 320px">
            <el-option
              v-for="item in levelOption"
              :label="item.name"
              :key="item.id"
              :value="item.id"
            ></el-option>
          </datablau-select>
        </div>
      </div>

      <span slot="footer" class="dialog-footer">
        <datablau-button @click="closeUsers" type="secondary">
          {{ $t('common.button.cancel') }}
        </datablau-button>
        <datablau-button type="important" @click="addUsers">
          {{ $t('common.button.ok') }}
        </datablau-button>
      </span>
    </datablau-dialog>
    <datablau-subtab
      v-if="activeName === 'access' || activeName === 'accessControl'"
      :tabs="tabs"
      :show-name="'name'"
      @change="changeSubtab"
    ></datablau-subtab>
    <template v-if="radios === 'user'">
      <access-control-item
        key="1"
        ref="usersRef"
        v-if="Object.keys(levelIdToNameMap).length > 0"
        :inTableDetails="inTableDetails"
        :itemId="itemId"
        :itemType="itemType"
        :buttonStr="type"
        :dialogClick="openUsers"
        :isSecurity="isSecurity"
        type="USERNAME"
        :levelIdToNameMap="levelIdToNameMap"
      ></access-control-item>
    </template>
    <template v-if="radios === 'group'">
      <access-control-item
        key="2"
        ref="usersGroupRef"
        v-if="Object.keys(levelIdToNameMap).length > 0"
        :inTableDetails="inTableDetails"
        :itemId="itemId"
        :itemType="itemType"
        :buttonStr="type"
        :dialogClick="openUserGroup"
        :isSecurity="isSecurity"
        type="GROUP"
        :levelIdToNameMap="levelIdToNameMap"
      ></access-control-item>
    </template>
    <template v-if="radios === 'organization'">
      <access-control-item
        key="3"
        ref="organizationRef"
        v-if="Object.keys(levelIdToNameMap).length > 0"
        :inTableDetails="inTableDetails"
        :itemId="itemId"
        :itemType="itemType"
        :buttonStr="type"
        :dialogClick="openOrganization"
        type="ORGANIZATION"
        :levelIdToNameMap="levelIdToNameMap"
        :isSecurity="isSecurity"
      ></access-control-item>
    </template>
  </div>
</template>

<script>
import moment from 'moment'
import accessControlItem from './accessControlItem'
import PinyinMatch from 'pinyin-match'
export default {
  props: {
    itemId: {
      required: true,
    },
    itemType: {
      required: true,
    },
    itemName: {
      default: '',
      type: String,
    },
    type: {
      default() {
        return this.$t('meta.DS.tableDetail.visitControl.addTableControl')
      },
      type: String,
    },
    inTableDetails: {
      default: false,
      type: Boolean,
    },
    activeName: {
      default: '',
      type: String,
    },
    isSecurity: {
      type: Boolean,
      default: false,
    },
  },
  components: {
    accessControlItem,
  },
  data() {
    return {
      tabs: [
        {
          name: this.$t('meta.DS.tableDetail.visitControl.user'),
          lable: 'user',
        },
        {
          name: this.$t('meta.DS.tableDetail.visitControl.userGroup'),
          lable: 'group',
        },
        {
          name: this.$t('meta.DS.tableDetail.visitControl.org'),
          lable: 'organization',
        },
      ],
      dialogVisibleOrganization: false,
      dialogVisibleUserGroup: false,
      dialogVisibleUsers: false,
      userGroupSelected: null,
      usersSelected: null,
      userGroup: [],
      users: [],
      level: '',
      levelOption: [],
      loading: false,
      levelIdToNameMap: {},
      showPopover: false,
      whiteListData: [],
      radios: 'user',

      nameKey: '',
      selection: {},
      selection2: [],
      treeData: [],
      defaultProps: {
        children: 'children',
        label: 'fullName',
      },
      defaultExpandList: [],
      treeLoading: false,
      timer: null,
      deleteArr: ['treeData'],
      columnObjectId: null,
      showSize: 20,
      usersShow: [],
      allUsers: [],
      userLoading: false,
      groupLoading: false,
    }
  },
  mounted() {
    this.initData()
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
    }, 3000)
  },
  methods: {
    changeSubtab(val) {
      this.radios = val.lable
    },
    dataIconFunction(data, node) {
      if (data.pbm) {
        return 'iconfont icon-schema'
      } else {
        if (node.expanded) {
          return 'iconfont icon-openfile'
        } else {
          return 'iconfont icon-file'
        }
      }
    },
    showMore() {
      this.showSize += 20
      this.usersFilter()
    },
    usersFilter(query) {
      if (query !== '' && query) {
        this.usersShow = this.users.filter(user =>
          PinyinMatch.match(user.fullUserName + user.username, query)
        )
      } else {
        this.usersShow = this.users.slice(0, this.showSize)
      }
    },
    openUsers() {
      this.getUserList()
      this.usersSelected = ''
      this.level = ''
      this.dialogVisibleUsers = true
    },
    getUserList() {
      this.userLoading = true
      this.$http
        .get('/user/usermanagement/users')
        .then(res => {
          this.userLoading = false
          this.users = []
          for (const key in res.data) {
            this.users.push(res.data[key])
          }
          this.usersShow = this.users.slice(0, this.showSize)
        })
        .catch(e => {
          this.userLoading = false
          this.$showFailure(e)
        })
    },
    addUsers() {
      if (!this.usersSelected) {
        this.$message.error(this.$t('meta.DS.message.selUser'))
        return
      }
      if (this.level === '') {
        this.$message.error(this.$t('meta.DS.message.selAccessLevel'))
        return
      }
      this.$http
        .post(`${this.$url}/service/auth/`, {
          visitor: this.usersSelected,
          visitorType: 'USERNAME',
          accessLevelId: this.level,
          itemId: this.itemId,
          itemType: this.itemType,
          itemName: this.itemName,
        })
        .then(res => {
          this.$message.success(this.$t('meta.DS.message.createSucceed'))
          this.$refs.usersRef.getTableData()
          this.dialogVisibleUsers = false
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    closeUsers() {
      this.dialogVisibleUsers = false
    },
    addUserGroup() {
      if (!this.userGroupSelected) {
        this.$message.error(this.$t('meta.DS.message.selUserGroup'))
        return
      }
      if (this.level === '') {
        this.$message.error(this.$t('meta.DS.message.selAccessLevel'))
        return
      }
      this.$http
        .post(`${this.$url}/service/auth/`, {
          visitor: this.userGroupSelected,
          visitorType: 'GROUP',
          accessLevelId: this.level,
          itemId: this.itemId,
          itemType: this.itemType,
          itemName: this.itemName,
        })
        .then(res => {
          this.$message.success(this.$t('meta.DS.message.createSucceed'))
          this.$refs.usersGroupRef.getTableData()
          this.dialogVisibleUserGroup = false
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    closeAddUG() {
      this.dialogVisibleUserGroup = false
    },
    openUserGroup() {
      this.getGroupList()
      this.userGroupSelected = ''
      this.level = ''
      this.dialogVisibleUserGroup = true
    },
    getGroupList() {
      this.groupLoading = true
      this.$http
        .get('/user/org/groups')
        .then(res => {
          this.groupLoading = false
          this.userGroup = res.data
        })
        .catch(e => {
          this.groupLoading = false
          this.$showFailure(e)
        })
    },
    closeAddOrg() {
      this.dialogVisibleOrganization = false
    },
    openOrganization() {
      this.getOrganizationList()
      this.selection = {}
      this.level = ''
      this.dialogVisibleOrganization = true
    },
    addOrganization() {
      if (!this.selection.bm) {
        this.$message.error(this.$t('meta.DS.message.selOrg'))
        return
      }
      if (this.level === '') {
        this.$message.error(this.$t('meta.DS.message.selAccessLevel'))
        return
      }
      this.$http
        .post(`${this.$url}/service/auth/`, {
          visitor: this.selection.bm,
          visitorType: 'ORGANIZATION',
          accessLevelId: this.level,
          itemId: this.itemId,
          itemType: this.itemType,
          itemName: this.itemName,
        })
        .then(res => {
          this.$message.success(this.$t('meta.DS.message.createSucceed'))
          this.$refs.organizationRef.getTableData()
          this.dialogVisibleOrganization = false
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    getOrganizationList() {
      this.treeLoading = true
      this.$http
        .get(`/user/org/organization/tree/`)
        .then(res => {
          this.treeLoading = false
          this.treeData = [res.data]
          this.defaultExpandList = res.data.children.map(e => e.pbm)
        })
        .catch(e => {
          this.treeLoading = false
          this.$showFailure(e)
        })
    },
    initData() {
      this.$http
        .get(this.$url + '/service/auth/access')
        .then(res => {
          this.levelOption = res.data
          this.levelOption.forEach(level => {
            this.levelIdToNameMap[level.id] = level.name
          })
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    filterNode(value, data) {
      if (!value) return true
      return (
        (data.fullName && data.fullName.indexOf(value) !== -1) ||
        (data.bm && data.bm.indexOf(value) !== -1)
      )
    },
    nodeClick(data) {
      this.selection = data
    },
  },
  watch: {
    nameKey(val) {
      clearTimeout(this.timer)
      this.timer = setTimeout(() => {
        this.$refs.branchTree.filter(val)
      }, 800)
    },
    activeName(val) {
      if (val !== 'access') {
        this.radios = 'user'
      }
    },
  },
}
</script>

<style lang="scss" scoped>
/deep/ .datablau-subtab {
  margin-top: 10px;
}
.dialog-form-content {
  .form-item {
    span {
      text-align: right;
      width: 80px;
    }
  }
}
.access-control-wrapper {
  // position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  h2 {
    font-size: 15px;
  }
  &.security-access-control-wrapper {
    /deep/ .datablau-subtab {
      margin-top: 0px;
    }
    /deep/ .control-contents {
      top: 0;
    }
  }
}
.btn-wrapper {
  float: right;
  .el-button + .el-button {
    margin-left: 10px;
  }
}
.pagination-panel {
  margin-top: 10px;
  text-align: right;
}
.el-select-dropdown__item.is-disabled {
  cursor: pointer;
}
</style>
<style>
.popover-access-control-panel {
  padding: 15px;
}
.access-control-wrapper .el-tabs__content {
  position: static !important;
  top: unset !important;
  left: unset !important;
  right: unset !important;
  bottom: unset !important;
}
</style>
