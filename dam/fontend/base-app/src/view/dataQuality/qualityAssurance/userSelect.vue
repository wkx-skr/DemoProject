<template>
  <div>
    <datablau-dialog
      :visible.sync="dialogVisible"
      :title="title"
      width="720px"
      :height="height"
      :before-close="handleClose"
    >
      <div class="content">
        <div>
          <datablau-input
            v-model="nameInput"
            :iconfont-state="true"
            :placeholder="$t('quality.page.qualityAssurance.keywordSearch')"
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
                { mech: title !== '添加组织机构' },
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
              :props="defaultProps"
              :render-content="renderContent"
              :filter-node-method="filterNode"
              @check="checkedList"
            ></datablau-tree>
          </div>
        </div>
        <div class="tagiconBox">
          <span>{{ $t('quality.page.qualityAssurance.selected') }}</span>
          <ul>
            <li v-for="(item, index) in selectedPerson" :key="item.username">
              <div class="flex spaceBetween itemAlign">
                <span>{{ item.name }}</span>
                <div class="flex itemAlign">
                  <datablau-select
                    v-model="item.permission"
                    placeholder="请选择权限"
                    style="width: 120px; height: 24px"
                    :disabled="item.disabled"
                    popper-class="popperClass"
                    :popper-append-to-body="true"
                    @change="authTypeChang(item)"
                  >
                    <el-option
                      v-for="items in manageList"
                      :key="items.value"
                      :label="items.label"
                      :value="items.value"
                    ></el-option>
                  </datablau-select>
                  <div class="del">
                    <i
                      :class="[
                        'iconfont',
                        'icon-false',
                        { grey: item.disabled },
                      ]"
                      @click="delPerson(item, index)"
                    ></i>
                  </div>
                </div>
              </div>
            </li>
          </ul>
        </div>
        <div style="position: absolute; bottom: -12px">
          <span>{{ $t('quality.page.qualityAssurance.application') }}</span>
          <datablau-switch
            style="display: inline-block; margin-left: 6px"
            v-model="childrenInherit"
            @change="changeValue"
          ></datablau-switch>
        </div>
      </div>
      <span slot="footer">
        <datablau-button @click="handleClose">
          {{ $t('assets.permissionSettings.cancel') }}
        </datablau-button>
        <datablau-button
          type="primary"
          @click="primary"
          :disabled="selectedPerson.length === 0"
        >
          {{ $t('assets.permissionSettings.sure') }}
        </datablau-button>
      </span>
    </datablau-dialog>
  </div>
</template>

<script>
import HTTP from '@/http/main'
export default {
  props: {
    allSelected: {
      type: Array,
      default: () => [],
    },
    selectList: {
      type: Array,
      default: () => [],
    },
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
    height: {
      type: String,
      default: '',
    },
    defaultProps: {
      type: Object,
    },
    currentNode: {
      type: Object,
    },
  },
  watch: {
    dialogVisible(val) {
      this.nameInput = ''
      this.checkBoxValue = []
      this.delPremision = []
      this.selectedPerson = []
      this.page = 1
      this.$refs.treeList && this.$refs.treeList.setCheckedKeys([])
      this.loading = true
      this.childrenInherit = true
    },
    selectList(val) {
      this.setNode(val)
      this.loading = false
    },
    flag(val) {
      if (
        val.dialogVisible &&
        val.binList.length !== 0 &&
        val.selectList.length !== 0
      ) {
        let ary = []
        val.binList.forEach(item => {
          this.addNode({ data: item }, 'setDis')
          ary.push(item[this.defaultProps.label] + item[this.defaultProps.id])
        })
        this.$nextTick(() => {
          this.$refs.treeList && this.$refs.treeList.setCheckedKeys(ary)
          this.checkedKeys =
            this.$refs.treeList && this.$refs.treeList.getCheckedKeys()
          this.$user.username == this.currentNode.creator &&
            this.checkedKeys.length !== 0 &&
            this.setDisabled(val.selectList)
          this.$user.username !== this.currentNode.creator &&
            this.checkedKeys.length !== 0 &&
            this.setDisabled(val.selectList, 'username')
        })
        // 设置不是创建人登录不能删除修改
      }
    },
  },
  computed: {
    nodeKeyList() {
      let ary = []
      this.selectedPerson.forEach(item => ary.push(item.nodeKey))
      return ary
    },
    flag() {
      let { binList, dialogVisible, selectList } = this
      return { binList, dialogVisible, selectList }
    },
  },
  data() {
    return {
      nameInput: '',
      checkBoxValue: [],
      selectedPerson: [],
      expandedKeys: [],
      loading: false,
      firstTimeout: null,
      manageList: [
        { value: 'WRITE', label: this.$t('common.button.edit') },
        { value: 'READ', label: this.$t('common.button.scan') },
      ],
      delPremision: [],
      checkedKeys: [],
      page: 1,
      childrenInherit: true,
    }
  },
  methods: {
    changeValue(value) {
      this.childrenInherit = value
    },
    lazyloading() {
      this.page++
      this.title === '添加用户' &&
        this.$emit('lazyloading', { page: this.page, keywords: '' })
    },
    setDisabled(ary, username) {
      if (username) {
        ary.forEach(item => {
          let key = item[this.defaultProps.label] + item[this.defaultProps.id]
          if (this.checkedKeys.indexOf(key) !== -1) {
            item.disabled = true
          } else {
            item.disabled = false
          }
          if (item.children) {
            this.setDisabled(item.children, username)
          }
        })
      } else {
        ary.forEach(item => {
          let key = item[this.defaultProps.label]
          if ([this.currentNode.creator].indexOf(key) !== -1) {
            item.disabled = true
          } else {
            item.disabled = false
          }
          if (item.children) {
            this.setDisabled(item.children, username)
          }
        })
      }
    },
    setNode(ary) {
      ary.forEach(item => {
        item.nodeKey =
          item[this.defaultProps.label] + item[this.defaultProps.id]
        if (item.children && item.children.length !== 0) {
          this.setNode(item.children)
        }
      })
    },
    handleClose() {
      this.$emit('close')
    },
    primary() {
      this.$emit('primary', {
        add: this.selectedPerson,
        del: this.delPremision,
        childrenInherit: this.childrenInherit,
      })
    },
    // 关键字搜
    keyWord(val) {
      clearTimeout(this.firstTimeout) // 防抖
      this.firstTimeout = setTimeout(() => {
        if (this.title === '添加用户') {
          this.$emit('lazyloading', { page: 1, keywords: val })
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
    delPerson(item, index) {
      if (item.disabled) return
      this.selectedPerson.splice(index, 1)
      this.$refs.treeList &&
        this.$refs.treeList.setCheckedKeys([...this.nodeKeyList])
      item.authId && this.delPremision.push(item.authId)
    },
    checkedList(obj, obj1) {
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
      if (currentNode.data.disabled) return
      this.selectedPerson.forEach((item, index) => {
        if (
          item.nodeKey ===
          currentNode.data[this.defaultProps.label] +
            currentNode.data[this.defaultProps.id]
        ) {
          this.selectedPerson.splice(index, 1)
          item.authId && this.delPremision.push(item.authId)
        }
      })
    },
    addNode(currentNode, setDis) {
      let obj = {
        name:
          currentNode.data.fullUserName ||
          currentNode.data[this.defaultProps.label],
        id:
          currentNode.data.username ||
          currentNode.data.bm ||
          currentNode.data.id,
        permission: currentNode.data.authType || 'READ',
        nodeKey:
          currentNode.data[this.defaultProps.label] +
          currentNode.data[this.defaultProps.id],
        authId: currentNode.data.authId,
      }
      obj[this.defaultProps.label] = currentNode.data[this.defaultProps.label]
      setDis &&
        (obj.disabled =
          currentNode.data.username === this.currentNode.creator ||
          this.$user.username !== this.currentNode.creator)
      let findObj = this.selectedPerson.find(
        item => item.nodeKey === obj.nodeKey
      )
      !findObj && this.selectedPerson.push(obj)
    },
    authTypeChang(item) {
      item.authId && (item.change = true)
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
  mounted() {},
}
</script>

<style scoped lang="scss">
.flex {
  display: flex;
}
.itemAlign {
  align-items: center;
}
.spaceBetween {
  justify-content: space-between;
}
.content {
  /*border: 1px solid #dddddd;*/
  height: 420px;
  border-radius: 2px;
  display: flex;
  position: relative;
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
      display: block;
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
</style>
<style></style>
