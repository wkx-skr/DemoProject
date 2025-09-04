<template>
  <div>
    <datablau-dialog
      :visible.sync="dialogVisible"
      :title="title"
      width="720px"
      :height="520"
      :before-close="handleClose"
    >
      <div class="content">
        <div>
          <datablau-input
            v-model="nameInput"
            :iconfont-state="true"
            :placeholder="$t('assets.permissionSettings.keywordPlaceholder')"
            clearable
            class="nameInput"
            @input="keyWord"
            @clear="inputClear"
          ></datablau-input>
          <div
            class="selectList"
            v-loading="loading"
            v-selectLazyLoad="lazyloading"
          >
            <datablau-tree
              :class="[
                'grey-tree',
                'data-asset-tree',
                'treeBox',
                { mech: title !== '添加机构' },
              ]"
              ref="treeList"
              auto-expand-parent
              default-expand-all
              :data="selectList"
              :check-strictly="true"
              :default-expanded-keys="expandedKeys"
              :indent="10"
              show-checkbox
              node-key="nodeKey"
              highlight-current
              :props="defaultProps[userType]"
              :render-content="renderContent"
              :filter-node-method="filterNode"
              @check="handleChecked"
            ></datablau-tree>
          </div>
        </div>
        <div class="tagiconBox">
          <span>已选择</span>
          <div style="margin-top: 5px">
            <datablau-tag
              v-for="(item, index) in selectedList"
              :key="item.username"
              :closable="!item.disabled"
              @close="delUser(item, index)"
            >
              {{ item.name }}
            </datablau-tag>
          </div>
        </div>
      </div>
      <span slot="footer">
        <datablau-button @click="handleClose">取消</datablau-button>
        <datablau-button type="primary" @click="primary">确定</datablau-button>
      </span>
    </datablau-dialog>
  </div>
</template>

<script>
import HTTP from '../../util/api.js'
export default {
  props: {
    binList: {
      type: Array,
      default: () => [],
    },
    dialogVisible: {
      type: Boolean,
      default: false,
    },
    title: {
      type: String,
      default: '添加用户',
    },
    currentNode: {
      type: Object,
    },
    userType: {
      type: String,
      default: 'user',
    },
  },
  watch: {
    dialogVisible(val) {
      this.nameInput = ''
      this.checkBoxValue = []
      this.delPermision = []
      this.selectedList = []
      this.page = 1
      this.$refs.treeList && this.$refs.treeList.setCheckedKeys([])
      this.loading = true
      if (val) {
        switch (this.userType) {
          case 'user':
            this.getUser({
              page: 1,
            })
            break
          case 'group':
            this.getGroup()
            break
          case 'org':
            this.getMechanism()
            break
          default:
            break
        }
      }
    },
    selectList(val) {
      this.setDefault()
      this.setNode(val)
    },
  },
  computed: {
    nodeKeyList() {
      return this.selectedList.map(item => item.nodeKey)
    },
  },
  data() {
    return {
      nameInput: '',
      checkBoxValue: [],
      selectedList: [],
      expandedKeys: [],
      loading: false,
      firstTimeout: null,
      manageList: [
        {
          label: this.$t('assets.permissionSettings.manage'),
          value: 'MANAGER',
        },
        { label: this.$t('assets.permissionSettings.edit'), value: 'EDIT' },
        { label: this.$t('assets.permissionSettings.visit'), value: 'READ' },
      ],
      delPermision: [],
      checkedKeys: [],
      page: 1,
      selectList: [],
      defaultProps: {
        user: {
          children: 'children',
          label: 'username',
          id: 'username',
        },
        group: {
          children: 'children',
          label: 'groupName',
          id: 'id',
        },
        org: {
          children: 'children',
          label: 'fullName',
          id: 'bm',
        },
      },
    }
  },
  mounted() {},
  methods: {
    setDefault() {
      let ary = []
      const defaultProps = this.defaultProps[this.userType]
      this.binList.forEach(item => {
        this.addNode({ data: item }, 'setDis')
        ary.push(item[defaultProps.label] + item[defaultProps.id])
      })
      this.selectedList.forEach(item => {
        let k = item[defaultProps.label] + item[defaultProps.id]
        ary.indexOf(k) == -1 && ary.push(k)
      })
      this.$nextTick(() => {
        this.$refs.treeList && this.$refs.treeList.setCheckedKeys(ary)
        this.checkedKeys =
          this.$refs.treeList && this.$refs.treeList.getCheckedKeys()

        this.checkedKeys.length !== 0 && this.setDisabled(this.selectList)

        this.checkedKeys.length !== 0 &&
          this.setDisabled(this.selectList, 'username')
      })
    },
    // 获取用户组
    getGroup() {
      HTTP.getGroups()
        .then(res => {
          this.loading = false
          this.selectList = res.data
        })
        .catch(e => {
          this.loading = false
          this.$showFailure(e)
        })
    },
    // 获取用户
    getUser(obj) {
      if (obj && obj.page === 1) this.selectList = []
      let requestBody = {
        currentPage: obj.page,
        pageSize: 11,
        username: obj.keywords,
        fullUserName: obj.keywords,
        enabled: true,
      }
      HTTP.getAllUserPage(requestBody)
        .then(res => {
          this.loading = false
          let ary = []
          let data = res.data.content
          for (let k in data) {
            ary.push(data[k])
          }
          obj.page === 1
            ? (this.selectList = ary)
            : this.selectList.push(...ary)
        })
        .catch(e => {
          this.loading = false
          this.$showFailure(e)
        })
    },
    // 获取机构
    getMechanism() {
      HTTP.mechanism()
        .then(res => {
          this.loading = false
          this.selectList = [res.data]
        })
        .catch(e => {
          this.loading = false
          this.$showFailure(e)
        })
    },
    lazyloading() {
      this.page++
      this.title === this.$t('assets.permissionSettings.addUser') &&
        this.getUser({ page: this.page, keywords: '' })
    },
    setDisabled(ary, username) {
      if (username) {
        ary.forEach(item => {
          const defaultProps = this.defaultProps[this.userType]
          let key = item[defaultProps.label] + item[defaultProps.id]
          if (item.children) {
            this.setDisabled(item.children, username)
          }
        })
      } else {
        ary.forEach(item => {
          item.disabled = false
          if (item.children) {
            this.setDisabled(item.children, username)
          }
        })
      }
    },
    // 为每个数据节点设置 nodeKey
    setNode(ary) {
      const defaultProps = this.defaultProps[this.userType]
      ary.forEach(item => {
        item.nodeKey = item[defaultProps.label] + item[defaultProps.id]
        if (item.children && item.children.length !== 0) {
          this.setNode(item.children)
        }
      })
    },
    handleClose() {
      this.$emit('close')
    },
    getUserType() {
      let id = ''
      switch (this.userType) {
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
    // 确定
    primary() {
      this.$emit('primary', {
        add: this.selectedList,
        del: this.delPermision,
      })
    },
    // 关键字搜
    keyWord(val) {
      clearTimeout(this.firstTimeout) // 防抖
      this.firstTimeout = setTimeout(() => {
        if (this.title === this.$t('assets.permissionSettings.addUser')) {
          this.getUser({ page: 1, keywords: val })
          return
        }
        this.$refs.treeList.filter(val)
      }, 200)
    },
    inputClear() {
      this.keyWord('')
      this.page = 1
    },
    filterNode(value, data, node) {
      this.$refs.treeList &&
        this.$refs.treeList.setCheckedKeys([...this.nodeKeyList])
      if (!value) return true
      if (data.groupName) return data.groupName.indexOf(value) !== -1
      if (data.username)
        return (
          data.username.indexOf(value) !== -1 ||
          data.fullUserName.indexOf(value) !== -1
        )
      return (
        (data.fullName && data.fullName.indexOf(value) !== -1) ||
        (data.bm && data.bm.indexOf(value) !== -1)
      )
    },
    async delUser(item, index) {
      const name = await this.getUserType()
      if (item.disabled) return
      const row = this.selectedList.filter(m => m[name] === item[name])[0]
      if (row.visitorId) {
        row.delete = true
      }
      this.selectedList = this.selectedList.filter(m => m[name] !== row[name])
      this.$refs.treeList &&
        this.$refs.treeList.setCheckedKeys([...this.nodeKeyList])
      row.actionList && this.delPermision.push(row)
    },
    handleChecked(obj, obj1) {
      let currentNode = this.$refs.treeList.getNode(obj)
      this.checkedKeys =
        this.$refs.treeList && this.$refs.treeList.getCheckedKeys()
      if (!currentNode.checked) {
        this.delectNode(currentNode) // 先删除自己
      } else {
        // 添加，
        this.addNode(currentNode)
      }
    },
    delectNode(currentNode) {
      const currentData = currentNode.data
      if (currentData.disabled) return
      const selected = this.selectedList
      const defaultProps = this.defaultProps[this.userType]
      for (let i = 0; i < selected.length; i++) {
        const curSelected = selected[i]
        if (
          curSelected.nodeKey ===
          currentData[defaultProps.label] + currentData[defaultProps.id]
        ) {
          currentData.actionList && this.delPermision.push(item)
          // if (currentData.actionList) {
          //   currentData.delete = true
          // } else {
          //   this.selectedList.splice(i, 1)
          // }
          this.delUser(currentData)
          break
        }
      }
    },
    addNode(currentNode, setDis) {
      const defaultProps = this.defaultProps[this.userType]
      const { data } = currentNode
      let obj = {
        name: data[defaultProps.label],
        id: data[defaultProps.id],
        nodeKey: data[defaultProps.label] + data[defaultProps.id],
      }
      obj[defaultProps.id] = data[defaultProps.id]
      let findObj = this.selectedList.find(item => item.nodeKey === obj.nodeKey)
      !findObj && this.selectedList.push({ ...obj, ...data })
    },
    renderContent(h, { node, data, store }) {
      const style = {
        flex: 'display: flex;justify-content:space-between;',
        alien: 'display: flex;align-items: center;',
        position: 'position: absolute;right:20px;color:#999',
        email:
          'width: 200px;overflow: hidden;display: inline-block;vertical-align: top;white-space: nowrap;text-overflow: ellipsis;',
        fullName: 'display: inline-block;',
      }
      return (
        <div style={style.flex}>
          <span style={style.alien}>
            <span style={style.email}>
              {data.fullName || data.fullUserName || data.groupName}
              {data.fullUserName && (
                <span className="conName">（{data.username}）</span>
              )}
            </span>
          </span>
        </div>
      )
    },
  },
}
</script>

<style scoped lang="scss">
.flex {
  /*display: flex;*/
  /*overflow: visible;*/
  & > div {
    display: inline-block;
  }
  .closeInput {
    float: right;
    line-height: 24px;
  }
  .nameBox {
    margin-top: 2px;
  }
}
.itemAlign {
  align-items: center;
}
.spaceBetween {
  /*justify-content: space-between;*/
}
.content {
  /*border: 1px solid #dddddd;*/
  height: 380px;
  border-radius: 2px;
  /*display: flex;*/
  /*overflow: auto;*/
  position: relative;
  & > div {
    float: left;
  }
  & > div:nth-child(1) {
    width: 320px;
    height: 400px;
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    border: 1px solid #dddddd;
    /*border-right: 0;*/
    /*position: relative;*/
    ul.flagBox {
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
    width: 360px;
    height: 400px;
    position: absolute;
    top: 0;
    bottom: 0;
    right: 0;
    padding: 8px 3px 0 10px;
    overflow: scroll;
    border: 1px solid #dddddd;
    border-left: 0;
    p {
      color: #555;
      font-size: 12px;
      margin-bottom: 10px;
    }
  }
  .nameInput {
    width: 299px;
    margin: 10px 10px 0;
  }
}
.selectList {
  height: 353px;
  overflow: scroll;
  /deep/.el-checkbox__input {
    margin-left: 10px;
  }
  .mech /deep/.el-checkbox__input {
    margin-left: 30px;
  }

  /deep/.el-checkbox-group {
    width: 100%;
  }
}
.usersCon {
  padding-right: 20px;
  & > span:nth-child(2) {
    color: #999999;
    font-size: 12px;
  }
}
.tagiconBox {
  padding-left: 10px;
  /deep/ .datablau-select .el-select .el-input {
    height: 24px;
  }
  /deep/ .datablau-select .el-select .el-input input {
    height: 24px;
  }
  /deep/ .datablau-select .el-select .el-input span i {
    line-height: 24px;
  }
  ul {
    margin-top: 8px;
    height: 353px;
    overflow: scroll;
  }
  li {
    margin-bottom: 12px;
    i {
      color: #409eff;
      cursor: pointer;
      /*font-size: 20px;*/
    }
    .grey {
      color: #999;
      cursor: not-allowed;
    }
    span {
      display: inline-block;
      padding: 5px 10px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      border-radius: 2px;
      background: rgba(64, 158, 255, 0.1);
      color: #409eff;
      line-height: 1;
      font-size: 12px;
      margin-right: 10px;
    }
  }
}
.mech /deep/.grey-tree.datablau-tree .el-icon-caret-right {
  position: absolute;
  right: 15px;
}
/deep/.grey-tree.datablau-tree .el-checkbox {
  margin-left: -10px;
  top: 0;
}
.del {
  width: 16px;
  margin-left: 14px;
}
.publicAcess {
  float: left;
}
</style>
<style></style>
