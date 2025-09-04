<template>
  <div class="settingTab">
    <div class="publicTypeBox alignItem">
      <datablau-detail-subtitle
        :title="$t('assets.permissionSettings.authority')"
        mt="0px"
        mb="0px"
      ></datablau-detail-subtitle>
      <!-- <datablau-radio
        v-model="currentNode.publicType"
        class="publicAcess"
        :radioTitle="$t('assets.permissionSettings.publicAccessTitle')"
        @input="changeRadio"
      >
        <el-radio label="NONE">
          {{ $t('assets.permissionSettings.noPublic') }}
        </el-radio>
        <el-radio label="SUB">
          {{ $t('assets.permissionSettings.includeChildren') }}
        </el-radio>
        <el-radio label="CURRENT">
          {{ $t('assets.permissionSettings.notIncludeChildren') }}
        </el-radio>
      </datablau-radio> -->
    </div>
    <div class="flex alignItem tabChange spaceBetween">
      <div class="left flex">
        <datablau-subtab
          :tabs="tabs"
          :show-name="'name'"
          @change="changeSubtab"
        ></datablau-subtab>
        <datablau-input
          v-model="names"
          :iconfont-state="true"
          :placeholder="placeholder"
          @input="namesINput"
          clearable
          class="logoName"
        ></datablau-input>
      </div>
      <datablau-button type="important" class="tianjia" @click="handleClick">
        {{ $t('assets.permissionSettings.addAuthority') }}
      </datablau-button>
    </div>
    <div
      class="tableList"
      :style="{
        top: `${165 + topH}px`,
      }"
      v-loading="loading"
    >
      <datablau-form-submit>
        <datablau-table
          ref="multipleTable"
          :data="tableData"
          tooltip-effect="dark"
          size="small"
          class="datablau-table log-mange-table"
          height="100%"
          width="100%"
          :show-column-selection="false"
        >
          <el-table-column
            prop="systemModule"
            :label="item.label"
            show-overflow-tooltip
            v-for="(item, index) in column"
            :key="'col' + index"
            :min-width="item.width || '100'"
          >
            <template slot-scope="scope">
              <span v-if="item.prop === 'authType'" class="authTypeSel">
                {{ authType[scope.row[item.prop]] }}
              </span>
              <span v-else-if="item.prop === 'roles'">
                {{ scope.row[item.prop] && scope.row[item.prop].join('，') }}
              </span>
              <span v-else-if="item.prop === 'username'">
                {{ scope.row[item.prop] }}
                <img
                  src="@/assets/images/dataAssets/created.svg"
                  class="created"
                  alt=""
                  v-if="scope.row.creator"
                />
              </span>
              <span v-else-if="item.prop === 'orgFullName'">
                {{ scope.row[item.prop] }}({{ scope.row.bm }})
              </span>
              <span v-else>{{ scope.row[item.prop] }}</span>
            </template>
          </el-table-column>
        </datablau-table>
        <!-- 下面翻页的内容 -->
        <template slot="buttons">
          <datablau-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page.sync="currentPage"
            :page-sizes="[20, 50, 100, 200]"
            :page-size="20"
            layout="total, sizes, prev, jumper, next"
            :total="total"
            class="page"
          ></datablau-pagination>
        </template>
      </datablau-form-submit>
    </div>
    <permissionSettingSelect
      v-if="dialogVisible"
      ref="permissionSelect"
      :title="title"
      :dialogVisible="dialogVisible"
      :selectList="selectList"
      :defaultProps="defaultProps"
      :binList="totalDat"
      :currentNode="currentNode"
      @close="close"
      @keyWord="keyWord"
      @inputClear="inputClear"
      @primary="primary"
      @lazyloading="getUser"
    ></permissionSettingSelect>
  </div>
</template>

<script>
import HTTP from '../utils/api.js'
import permissionSettingSelect from './permissionSettingSelect'
export default {
  components: { permissionSettingSelect },
  props: {
    currentNode: {
      type: Object,
      default: () => {},
    },
    topH: {
      type: Number,
      default: 0,
    },
  },
  data() {
    return {
      loading: false,
      checked: false, // 公开访问
      manageList: [
        {
          label: this.$t('assets.permissionSettings.manage'),
          value: 'MANAGER',
        },
        { label: this.$t('assets.permissionSettings.edit'), value: 'EDIT' },
        { label: this.$t('assets.permissionSettings.visit'), value: 'READ' },
      ],
      tabs: [
        { name: this.$t('assets.permissionSettings.byUser'), value: 'user' },
        { name: this.$t('assets.permissionSettings.byGroup'), value: 'group' },
        {
          name: this.$t('assets.permissionSettings.byOrg'),
          value: 'organization',
        },
      ],
      names: '',
      tableData: [{}], // 权限用户列表
      column: [],
      total: 0,
      totalDat: [],
      currentPage: 1,
      pageSize: 20,
      placeholder: this.$t('assets.permissionSettings.searchPlaceholder'),
      user: [
        // 用户按钮
        {
          prop: 'username',
          label: this.$t('assets.permissionSettings.loginName'),
        },
        {
          prop: 'fullUserName',
          label: this.$t('assets.permissionSettings.name'),
        },
        {
          prop: 'orgFullName',
          label: this.$t('assets.permissionSettings.org'),
        },
        {
          prop: 'title',
          label: this.$t('assets.permissionSettings.job'),
        },
        {
          prop: 'roles',
          label: this.$t('assets.permissionSettings.sysRole'),
          width: '150px',
        },
        {
          prop: 'emailAddress',
          label: this.$t('assets.permissionSettings.email'),
        },
        {
          prop: 'authType',
          label: this.$t('assets.permissionSettings.auth'),
        },
      ],
      group: [
        {
          prop: 'groupName',
          label: this.$t('assets.permissionSettings.groupName'),
        },
        {
          prop: 'authType',
          label: this.$t('assets.permissionSettings.auth'),
        },
      ],
      organization: [
        {
          prop: 'fullName',
          label: this.$t('assets.permissionSettings.orgName'),
        },
        {
          prop: 'authType',
          label: this.$t('assets.permissionSettings.auth'),
        },
      ],
      dialogVisible: false, // 弹窗
      title: this.$t('assets.permissionSettings.addUser'),
      selectList: [],
      authType: {
        MANAGER: this.$t('assets.permissionSettings.manage'),
        EDIT: this.$t('assets.permissionSettings.edit'),
        READ: this.$t('assets.permissionSettings.visit'),
      },
      defaultProps: {
        children: 'children',
        label: 'username',
      },
      inputList: [],
    }
  },
  methods: {
    // 单选取消选中
    changeRadio(val) {
      this.currentNode.publicType = val
      this.directoryPublic(this.currentNode.publicType)
    },
    // tab切换
    changeSubtab(val, idx) {
      this.column = this[val.value]
      this.tableData = [{}]
      this.names = ''
      if (val.value === 'user') {
        this.title = this.$t('assets.permissionSettings.addUser')
        this.getPremision('PERSON')
        this.placeholder = this.$t(
          'assets.permissionSettings.searchPlaceholder'
        )
      } else if (val.value === 'group') {
        this.title = this.$t('assets.permissionSettings.addGroup')
        this.placeholder = this.$t('assets.permissionSettings.groupPlaceholder')
        this.getPremision('GROUP')
      } else {
        this.title = this.$t('assets.permissionSettings.addOrg')
        this.placeholder = this.$t('assets.permissionSettings.orgPlaceholder')
        this.getPremision('ORGANIZATION')
      }
    },
    //  添加权限用户按钮
    handleClick() {
      this.dialogVisible = true
      if (this.title === this.$t('assets.permissionSettings.addUser')) {
        this.getUser({ page: 1, keywords: '' })
        this.defaultProps = {
          children: 'children',
          label: 'username',
          id: 'username',
        }
      } else if (this.title === this.$t('assets.permissionSettings.addGroup')) {
        this.getGroup()
        this.defaultProps = {
          children: 'children',
          label: 'groupName',
          id: 'groupName',
        }
      } else if (this.title === this.$t('assets.permissionSettings.addOrg')) {
        // this.getMechanism()
        this.selectList = []
        this.defaultProps = {
          children: 'children',
          label: 'fullName',
          id: 'bm',
        }
      }
    },
    // 获取用户组
    getGroup() {
      HTTP.getGroups()
        .then(res => {
          this.selectList = res.data
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    // 获取用户
    getUser(obj) {
      if (obj.page === 1) this.selectList = []
      let requestBody = {
        currentPage: obj.page,
        pageSize: 11,
        username: obj.keywords,
        fullUserName: obj.keywords,
        enabled: true,
      }
      HTTP.getAllUserPage(requestBody)
        .then(res => {
          let ary = []
          let data = res.data.content
          for (let k in data) {
            ary.push(data[k])
          }
          obj.page === 1
            ? (this.selectList = ary)
            : this.selectList.push(...ary)
          this.$refs.permissionSelect.loading = false
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    // 获取机构
    getMechanism() {
      HTTP.mechanism()
        .then(res => {
          this.selectList = [res.data]
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    keyWord(val) {
      !val && this.handleClick()
      if (this.title === this.$t('assets.permissionSettings.addUser')) {
        val &&
          HTTP.getPersonnel({ keyword: encodeURI(val) })
            .then(res => {
              this.selectList = res.data
            })
            .catch(e => {
              this.$showFailure(e)
            })
      }
    },
    inputClear() {
      this.handleClick()
    },
    handleSizeChange(val) {
      this.pageSize = val
      this.currentPage = 1
      this.spliceData(0, val)
    },
    handleCurrentChange(val) {
      this.currentPage = val
      this.spliceData((val - 1) * this.pageSize, val * this.pageSize)
    },
    close() {
      this.dialogVisible = false
    },
    primary(selectedPerson) {
      this.dialogVisible = false
      let params = {
        id: this.currentNode.id,
        mandateType:
          this.title === this.$t('assets.permissionSettings.addUser')
            ? 'PERSON'
            : this.title === this.$t('assets.permissionSettings.addGroup')
            ? 'GROUP'
            : 'ORGANIZATION',
        mandateObjDtos: [],
        extendSub: selectedPerson.extendSub,
      }
      let str =
        this.title === this.$t('assets.permissionSettings.addUser')
          ? 'username'
          : this.title === this.$t('assets.permissionSettings.addGroup')
          ? 'groupId'
          : 'bm'
      selectedPerson.del.forEach(item => {
        let obj = {}
        obj.authType = item.permission
        obj.name = item.name
        obj[str] = item.id
        item.authId && (obj.relId = item.authId)
        obj.delete = true
        params.mandateObjDtos.push(obj)
      })
      selectedPerson.add.forEach(item => {
        let obj = {}
        obj.authType = item.permission
        obj.name = item.name
        obj[str] = item.id
        item.authId && (obj.relId = item.authId)
        params.mandateObjDtos.push(obj)
      })
      this.loading = true
      HTTP.addNewPermissions(params)
        .then(res => {
          this.getPremision(
            this.title === this.$t('assets.permissionSettings.addUser')
              ? 'PERSON'
              : this.title === this.$t('assets.permissionSettings.addGroup')
              ? 'GROUP'
              : 'ORGANIZATION'
          )
          this.loading = false
        })
        .catch(e => {
          this.loading = false
          this.$showFailure(e)
        })
    },
    getPremision(type) {
      this.loading = true
      HTTP.getPermission({
        id: this.currentNode.id,
        type: type,
      })
        .then(res => {
          this.totalDat =
            res.data.groupAuthDtos ||
            res.data.organizationAuthDtos ||
            res.data.userAuthDtos ||
            []
          let indexNum = 0
          this.totalDat.forEach((item, index) => {
            if (item.username && item.username === this.currentNode.creator) {
              item.delet = true
              item.creator = true
              indexNum = index
            }
            if (this.$user.username !== this.currentNode.creator) {
              item.delet = true
            }
          })
          // 创建者排序再第一个
          let create = this.totalDat.splice(indexNum, 1)
          this.totalDat.splice(0, 0, ...create)
          this.loading = false
          this.total = this.totalDat.length
          this.spliceData(0, this.pageSize)
        })
        .catch(e => {
          this.loading = false
          this.$showFailure(e)
        })
    },
    spliceData(star, size) {
      if (this.names) {
        this.tableData = this.inputList.splice(star, size)
        this.inputList.splice(star, 0, ...this.tableData)
        return
      }
      this.tableData = this.totalDat.splice(star, size)
      this.totalDat.splice(star, 0, ...this.tableData)
    },
    namesINput(val) {
      this.pageSize = 20
      this.currentPage = 1
      this.tableData = this.totalDat.filter(
        item =>
          (item.username && item.username.indexOf(val) !== -1) ||
          (item.fullUserName && item.fullUserName.indexOf(val) !== -1) ||
          (item.groupName && item.groupName.indexOf(val) !== -1) ||
          (item.fullName && item.fullName.indexOf(val) !== -1)
      )
      this.inputList = _.cloneDeep(this.tableData)
      val && (this.total = this.tableData.length)
      !val && (this.total = this.totalDat.length)
      this.spliceData(0, this.pageSize)
    },
    // 删除权限
    delPremision(item) {
      if (item.delet) return
      this.$DatablauCofirm(
        this.$t('assets.generalSettings.confirmDelete'),
        this.$t('assets.generalSettings.hint'),
        {
          cancelButtonText: this.$t('assets.generalSettings.cancelButton'),
          confirmButtonText: this.$t('assets.generalSettings.confirmButton'),
        }
      )
        .then(() => {
          HTTP.delPremision(item.authId)
            .then(res => {
              // this.$message.success('删除成功')
              this.getPremision(
                this.title === this.$t('assets.permissionSettings.addUser')
                  ? 'PERSON'
                  : this.title === this.$t('assets.permissionSettings.addGroup')
                  ? 'GROUP'
                  : 'ORGANIZATION'
              )
            })
            .catch(e => {
              this.$showFailure(e)
            })
        })
        .catch()
    },
    delPremisionEmit(id) {
      HTTP.delPremision(id)
        .then(res => {})
        .catch(e => {
          this.$showFailure(e)
        })
    },
    // 表格中权限修改
    authTypeChang(row) {
      this.updatePremision(row.authId, row.authType)
    },
    // 修改权限
    updatePremision(id, authType, flag) {
      HTTP.updatePremision({ id, authType })
        .then(res => {
          !flag &&
            this.$message.success(
              this.$t('assets.permissionSettings.modifySucceed')
            )
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    directoryPublic(val) {
      HTTP.directoryPublic({ id: this.currentNode.id, publicType: val })
        .then(res => {
          if (res.status === 200) {
            this.$blauShowSuccess(
              this.$t('assets.permissionSettings.publicSettingSuccess')
            )
            this.$bus.$emit('refreshCurrentNode')
          } else {
            this.$baluShowFailure(
              this.$t('assets.permissionSettings.publicSettingFailed')
            )
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
  },
  mounted() {
    this.column = this.user
    this.getPremision('PERSON')
  },
  watch: {
    currentNode: {
      handler(val) {},
      deep: true,
      immediate: true,
    },
  },
}
</script>

<style scoped lang="scss">
.flex {
  overflow: hidden;
  & > div {
    float: left;
  }
  .tianjia {
    float: right;
  }
}
.alignItem {
  align-items: center;
}
.publicAcess {
  margin-left: 20px;
}
.tabChange {
  margin-top: 15px;
}
.logoName {
  margin-left: 16px;
}
.blue {
  color: #409eff;
}
.spaceBetween {
  justify-content: space-between;
}
.addPermission {
  margin-right: 8px;
  position: relative;
  top: 1px;
  font-size: 14px;
}
.tableList {
  position: absolute;
  top: 251px;
  bottom: 0;
  left: 0;
  right: 0;
}
.iconfont {
  cursor: pointer;
}
.grey {
  color: #999;
  cursor: not-allowed;
}
.authTypeSel {
  /deep/ .datablau-select .el-select .el-input {
    height: 30px;
  }
  /deep/ .datablau-select .el-select .el-input input {
    height: 30px;
  }
  /deep/ .datablau-select .el-select .el-input span i {
    line-height: 30px;
  }
}
.created {
  width: 14px;
  height: 14px;
  margin-left: 5px;
}
/deep/.el-radio:focus:not(.is-focus):not(:active):not(.is-disabled)
  .el-radio__inner {
  box-shadow: none;
}
.settingTab {
  margin-top: 10px;
  padding: 0 16px;
}
.publicTypeBox {
  & > div {
    float: left;
    line-height: 21px;
  }
  &:after {
    content: '';
    display: block;
    clear: both;
  }
}
</style>
