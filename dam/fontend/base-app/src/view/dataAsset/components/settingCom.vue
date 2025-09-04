<template>
  <div>
    <div class="boderSetting" :style="{ width: width || '600px' }">
      <div class="tagTab" v-if="list.length !== 0" v-loading="loading">
        <el-tag
          v-if="!getCallback"
          :key="tag.permissionType + tag.id"
          v-for="tag in list"
          :closable="!tag.close"
          :hit="false"
          :class="tag.permissionType"
          :disable-transitions="false"
          @close="handleClose(tag)"
        >
          <i
            :class="'icon' + tag.permissionType"
            v-if="tag.permissionType"
            v-show="tag.permissionType !== 'userList'"
          ></i>
          {{ tag.tagName }}
        </el-tag>
        <el-tag
          v-if="getCallback"
          :key="tag.firstName + tag.id"
          v-for="tag in list"
          :closable="closable || !tag.userId"
          :hit="false"
          :disable-transitions="false"
          @close="handleClose(tag)"
        >
          {{ `${tag.firstName}（${tag.username}）` }}
        </el-tag>
      </div>
      <div :class="{ setTop: true, clore99: disabled }">
        <div @click="showDialog">
          <i class="iconfont icon-tianjia"></i>
          {{ $t('assets.permissionSettings.add') }}
        </div>
      </div>
    </div>
    <selectPeople
      :dialogVisible="dialogVisible"
      :allSelected="allSelected"
      :onlyPeople="getCallback"
      title="添加管理员"
      @close="dialogVisible = false"
      @primary="primary"
      @handleClose="handleClose"
    ></selectPeople>
  </div>
</template>

<script>
import selectPeople from './selectPeople'
import HTTP from '../utils/api'
export default {
  components: { selectPeople },
  /**
   * list : 已选择的人员，机构等
   * type : 资产-权限设置-判断给只读，还是读写权限加人员
   * currentNode: 父目录
   * allSelected: 设置禁止选择的人员
   * width: 改变组件宽度
   * disabled : 设置组件禁止/允许添加人员
   * getCallback: 判断是否只选择人员
   * close: 设置可否有关闭X
   * */
  props: [
    'list',
    'type',
    'currentNode',
    'allSelected',
    'width',
    'disabled',
    'getCallback',
    'close',
  ],
  data() {
    return {
      dialogVisible: false,
      nameInput: '',
      flag: true,
      loading: false,
    }
  },
  computed: {
    closable() {
      if (this.disabled) {
        return false
      } else {
        return !this.close
      }
    },
  },
  methods: {
    showDialog() {
      !this.disabled && (this.dialogVisible = true)
    },
    handleClose(val) {
      if (this.getCallback) {
        this.$emit('handleClose', val)
        return
      }
      let personIdType = ''
      let id = ''
      if (val.permissionType === 'roleList') {
        // 角色
        personIdType = 'ROLE'
        id = val.id
      } else if (val.permissionType === 'groupList') {
        personIdType = 'GROUP'
        id = val.id
      } else if (val.permissionType === 'orgList') {
        personIdType = 'ORG'
        id = val.bm
      } else if (val.permissionType === 'userList') {
        personIdType = 'USER'
        id = val.username
      }
      let params = new FormData()
      params.append('catalogId', this.currentNode.id)
      params.append('id', id)
      params.append('personIdType', personIdType)
      params.append('type', this.type)
      //
      this.$DatablauCofirm(
        this.$t('assets.permissionSettings.confirmDelete'),
        this.$t('assets.permissionSettings.hint'),
        {
          type: 'info',
          cancelButtonText: this.$t('assets.permissionSettings.cancelButton'),
          confirmButtonText: this.$t('assets.permissionSettings.confirmButton'),
        }
      )
        .then(() => {
          this.loading = true
          HTTP.delPermission(params)
            .then(res => {
              this.$message.success(
                this.$t('assets.permissionSettings.delSuccess')
              )
              this.loading = false
              this.$emit('getSettings')
            })
            .catch(e => {
              this.$showFailure(e)
              this.loading = false
            })
        })
        .catch(() => {})
    },
    primary(val) {
      // console.log(val)
      if (this.getCallback) {
        this.dialogVisible = false
        this.$emit('primary', val)
        return
      }
      let orgCodes = []
      let roles = []
      let groups = []
      let users = []
      val.map(item => {
        if (item.tagClassName === 'department') {
          // 机构
          orgCodes.push(item.bm)
        } else if (item.tagClassName === 'role') {
          // 角色
          roles.push(item.id)
        } else if (item.tagClassName === 'group') {
          // 用户组
          groups.push(item.id)
        } else {
          users.push(item.username)
        }
      })
      let params = {
        authType: this.type,
        orgCodes,
        roles,
        groups,
        users,
      }
      HTTP.addNewPermission(params, this.currentNode.id)
        .then(res => {
          this.$message.success(
            this.$t('assets.permissionSettings.saveSuccess')
          )
          this.dialogVisible = false
          this.$emit('getSettings')
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
  },
  mounted() {},
}
</script>

<style scoped lang="scss">
.boderSetting {
  margin-top: 10px;
  /*border: 1px solid #dddddd;*/
  /*display: flex;*/
  /*overflow: auto;*/
  width: 600px;
  &:after {
    content: '';
    display: block;
    clear: both;
  }
  & > div {
    float: left;
  }
  .setTop {
    color: #409eff;
    line-height: 16px;
    display: flex;
    align-items: center;
    position: relative;
    top: 6px;
    padding: 10px;
    cursor: pointer;
    i {
      margin-right: 6px;
      position: relative;
      top: 1px;
    }
  }
  .clore99 {
    color: #999;
    cursor: not-allowed;
  }
}

/deep/.el-tag {
  margin-right: 10px;
  margin-bottom: 10px;
  color: #409eff;
}
.tagTab {
  padding-left: 10px;
  padding-top: 14px;
  /*border-top: 1px solid #dddddd;*/
}

.content {
  /*border: 1px solid #dddddd;*/
  height: 100%;
  border-radius: 2px;
  display: flex;
  & > div:nth-child(1) {
    width: 380px;
    border-right: 1px solid #ddd;
    position: relative;
    ul {
      margin-top: 10px;
    }
    li {
      position: relative;
      line-height: 34px;
      padding: 0 20px;
      color: #555;
      font-size: 12px;
      cursor: pointer;
      &:after {
        content: '\e6e0';
        font-family: 'element-icons';
        position: absolute;
        right: 20px;
      }
      &:hover {
        background: rgba(64, 158, 255, 0.1);
        border-radius: 2px;
      }
      i {
        margin-right: 5px;
      }
    }
  }
  & > div:nth-child(2) {
    width: 300px;
    padding: 16px 0 0 10px;
    p {
      color: #555;
      font-size: 12px;
      margin-bottom: 10px;
    }
  }
  .nameInput {
    width: 360px;
    margin: 10px 10px 0;
  }
}
.menuTop {
  margin-top: 10px;
  margin-left: 10px;
  margi-bottom: 20px;
  color: #777;
  span {
    font-size: 12px;
    padding-right: 6px;
    position: relative;
    margin-right: 6px;
    &:after {
      content: '';
      display: inline-block;
      width: 1px;
      height: 12px;
      background: #d8d8d8;
      position: absolute;
      right: 0;
      top: 3px;
    }
    &:hover {
      color: #409eff;
      cursor: pointer;
    }
  }
}
.flex {
  display: flex;
  justify-content: space-between;
}
/deep/ .grey-tree.datablau-tree .el-icon-caret-right {
  position: absolute;
  right: 15px;
}
/deep/.grey-tree.datablau-tree .el-checkbox {
  margin-left: 20px;
}
.checkbox {
  margin-left: 20px;
  line-height: 34px;
}
/deep/.orgList {
  background: rgba(177, 75, 120, 0.1);
  color: #b14b78;
}
/deep/.orgList .el-icon-close::before {
  color: #b14b78;
}
/deep/.roleList {
  background: rgba(64, 154, 95, 0.1);
  color: #409a5f;
}
/deep/.roleList .el-icon-close::before {
  color: #409a5f;
}
/deep/.groupList {
  background: rgba(210, 106, 87, 0.1);
  color: #d26a57;
}
/deep/.groupList .el-icon-close::before {
  color: #d26a57;
}
.tagTab i {
  display: inline-block;
  width: 16px;
  height: 14px;
}
.iconorgList {
  background: url('/static/images/dataAssets/department.svg') no-repeat;
}
.iconroleList {
  background: url('/static/images/dataAssets/role.svg') no-repeat;
}
.icongroupList {
  background: url('/static/images/dataAssets/group.svg') no-repeat;
}
</style>
