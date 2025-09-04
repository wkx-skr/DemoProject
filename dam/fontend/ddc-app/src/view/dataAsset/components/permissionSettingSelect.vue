<template>
  <div>
    <datablau-dialog
      :visible.sync="dialogVisible"
      :title="title"
      width="720px"
      :height="490"
      :before-close="handleClose"
    >
      <div class="content">
        <div v-loading="loading">
          <datablau-input
            v-model="nameInput"
            :iconfont-state="true"
            :placeholder="$t('assets.permissionSettings.keywordPlaceholder')"
            clearable
            class="nameInput"
            @input="keyWord"
            @clear="inputClear"
          ></datablau-input>
          <div class="selectList" v-selectLazyLoad="lazyloading">
            <datablau-tree
              v-if="title === $t('assets.permissionSettings.addUser')"
              :class="['grey-tree', 'data-asset-tree', 'treeBox']"
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
            <datablau-easy-tree
              v-else-if="title === $t('assets.permissionSettings.addGroup')"
              :class="[
                'grey-tree',
                'datablau-tree',
                'data-asset-tree',
                'treeBox',
                { mech: title !== $t('assets.permissionSettings.addOrg') },
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
              :itemSize="34"
              height="305px"
            ></datablau-easy-tree>
            <datablau-easy-tree
              v-else
              :class="[
                'grey-tree',
                'datablau-tree',
                'data-asset-tree',
                'treeBox',
                { mech: title !== $t('assets.permissionSettings.addOrg') },
              ]"
              ref="treeList"
              auto-expand-parent
              :data="selectList"
              :lazy="title === $t('assets.permissionSettings.addOrg')"
              :load="loadNode"
              :check-strictly="true"
              :default-expanded-keys="expandedKeys"
              :indent="10"
              show-checkbox
              node-key="nodeKey"
              highlight-current
              :props="{ ...defaultProps, isLeaf: 'isLeaf' }"
              :render-content="renderContent"
              :filter-node-method="filterNode"
              @check="checkedList"
              :itemSize="34"
              height="305px"
            ></datablau-easy-tree>
          </div>
        </div>
        <div class="tagiconBox">
          <span>{{ $t('assets.permissionSettings.selected') }}</span>
          <ul>
            <li v-for="(item, index) in selectedPerson" :key="item.username">
              <div class="flex spaceBetween itemAlign">
                <span class="nameBox">
                  <is-show-tooltip
                    :content="item.name"
                    style="display: flex; align-items: center; height: 20px"
                  ></is-show-tooltip>
                </span>
                <div class="flex itemAlign closeInput">
                  <datablau-select
                    v-model="item.permission"
                    :placeholder="
                      $t('assets.permissionSettings.selectAuthority')
                    "
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
                    <datablau-button
                      type="icon"
                      low-key
                      :class="[
                        'iconfont',
                        'icon-false',
                        { grey: item.disabled },
                      ]"
                      @click="delPerson(item, index)"
                    ></datablau-button>
                    <!-- <i
                      :class="[
                        'iconfont',
                        'icon-false',
                        { grey: item.disabled },
                      ]"
                      @click="delPerson(item, index)"
                    ></i> -->
                  </div>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>
      <span slot="footer">
        <datablau-checkbox
          :checkboxType="'single'"
          v-model="extendSub"
          class="publicAcess"
        >
          {{ $t('assets.permissionSettings.extendSub') }}
        </datablau-checkbox>
        <datablau-button type="secondary" @click="handleClose">
          {{ $t('assets.permissionSettings.cancel') }}
        </datablau-button>
        <datablau-button type="primary" @click="primary">
          {{ $t('assets.permissionSettings.sure') }}
        </datablau-button>
      </span>
    </datablau-dialog>
  </div>
</template>

<script>
import IsShowTooltip from '@/components/common/isShowTooltip/isShowTooltip.vue'
import api from '../utils/api'
export default {
  components: { IsShowTooltip },
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
      this.extendSub = false
    },
    selectList(val) {
      this.setNode(val)
      this.loading = false
    },
    selectedPerson() {
      this.setNode(this.selectList)
    },
    flag: {
      handler(val) {
        if (val.dialogVisible && val.binList.length !== 0) {
          let ary = []
          val.binList.forEach(item => {
            this.addNode({ data: item }, 'setDis')
            ary.push(item[this.defaultProps.label] + item[this.defaultProps.id])
          })
          this.$nextTick(() => {
            this.checkedKeys = ary
            ary.length !== 0 && this.setDisabled(val.selectList)
          })
          // 设置不是创建人登录不能删除修改
        }
      },
      immediate: true,
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
        {
          label: this.$t('assets.permissionSettings.manage'),
          value: 'MANAGER',
        },
        { label: this.$t('assets.permissionSettings.edit'), value: 'EDIT' },
        { label: this.$t('assets.permissionSettings.visit'), value: 'READ' },
      ],
      delPremision: [],
      checkedKeys: [],
      page: 1,
      extendSub: false,
    }
  },
  methods: {
    // 树节点懒加载
    loadNode(node, resolve) {
      api
        .getSubMechanism(node.level === 0 ? '' : node.data.bm, true)
        .then(res => {
          const data = res.data
          data.forEach(item => {
            item.id = item.bm
            item.nodeKey =
              item[this.defaultProps.label] + item[this.defaultProps.id]
            item.isLeaf = !item.hasChildren
          })
          this.setNode(data)
          resolve(data)
        })
    },
    lazyloading() {
      if (!this.loading) {
        this.loading = true
        this.page++
        this.title === this.$t('assets.permissionSettings.addUser') &&
          this.$emit('lazyloading', { page: this.page, keywords: '' })
      }
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
          if ([this.$user.username].indexOf(key) !== -1) {
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
      this.$refs.treeList && this.$refs.treeList.setCheckedKeys([])
      let CheckedKeys = []
      this.selectedPerson.forEach(item => {
        let k = item.nodeKey
        if (
          CheckedKeys.indexOf(k) == -1 &&
          !this.delPremision.find(item => item.nodeKey === k)
        ) {
          CheckedKeys.push(k)
        }
      })
      this.$nextTick(() => {
        this.$refs.treeList && this.$refs.treeList.setCheckedKeys(CheckedKeys)
      })
    },
    handleClose() {
      this.$emit('close')
    },
    primary() {
      this.$emit('primary', {
        add: this.selectedPerson,
        del: this.delPremision,
        extendSub: this.extendSub,
      })
    },
    // 关键字搜
    keyWord(val) {
      clearTimeout(this.firstTimeout) // 防抖
      this.firstTimeout = setTimeout(() => {
        if (this.title === this.$t('assets.permissionSettings.addUser')) {
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
      item.authId && this.delPremision.push(item)
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
          item.authId && this.delPremision.push(item)
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
      let findObj = this.selectedPerson.find(
        item => item.nodeKey === obj.nodeKey
      )
      // 如果是目录树重新渲染时
      if (setDis) {
        obj.disabled = obj.username === this.$user.username
        findObj =
          this.selectedPerson.find(item => item.nodeKey === obj.nodeKey) ||
          this.delPremision.find(item => item.nodeKey === obj.nodeKey)
      }

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
          'width: 200px;overflow: hidden;display: flex;vertical-align: top;white-space: nowrap;text-overflow: ellipsis;',
        fullName: 'display: inline-block;',
      }
      return (
        <div style={style.flex}>
          <span style={style.alien}>
            <span style={style.email}>
              <IsShowTooltip
                content={data.fullName || data.fullUserName || data.groupName}
                style={style.alien}
              >
                {data.fullName || data.fullUserName || data.groupName}
                {data.fullUserName && (
                  <span className="conName">（{data.username}）</span>
                )}
              </IsShowTooltip>
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
    max-width: calc(100% - 170px);
  }
}
.itemAlign {
  align-items: center;
  /deep/ .datablau-select {
    margin-right: 8px;
  }
  .del {
    margin-left: 0;
  }
}
.spaceBetween {
  justify-content: space-between;
}
.content {
  /*border: 1px solid #dddddd;*/
  height: 365px;
  border-radius: 2px;
  // display: flex;
  /*overflow: auto;*/
  position: relative;
  & > div {
    float: left;
  }
  & > div:nth-child(1) {
    width: 320px;
    height: 365px;
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
    height: 365px;
    position: absolute;
    top: 0;
    bottom: 0;
    right: 0;
    left: 320px;
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
  height: 315px;
  margin-top: 5px;
  overflow: scroll;
  /deep/.el-checkbox__input {
    margin-left: 0;
    margin-top: 0;
  }
  .mech /deep/.el-checkbox__input {
    margin-left: -20px;
  }

  /deep/.el-checkbox-group {
    width: 100%;
  }
  /deep/.grey-tree .el-tree-node__content {
    line-height: 24px;
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
    line-height: 24px;
  }
  /deep/ .datablau-select .el-select .el-input input {
    height: 24px;
    line-height: 24px;
  }
  /deep/ .datablau-select .el-select .el-input span i {
    line-height: 24px;
  }
  ul {
    margin-top: 8px;
    height: 320px;
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
      padding: 2px 10px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      border-radius: 2px;
      background: rgba(64, 158, 255, 0.1);
      color: #409eff;
      line-height: 18px;
      font-size: 12px;
      margin-right: 10px;
    }
  }
}
.mech /deep/.grey-tree.datablau-tree .el-icon-caret-right {
  position: absolute;
  right: 15px;
}
// /deep/.grey-tree.datablau-tree .el-checkbox {
//   margin-left: -10px;
// }
.del {
  width: 24px;
}
.publicAcess {
  float: left;
  margin-top: 5px;
}
</style>
<style></style>
