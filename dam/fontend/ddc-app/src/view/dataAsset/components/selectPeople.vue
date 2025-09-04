<template>
  <div>
    <datablau-dialog
      :visible.sync="dialogVisible"
      :title="title || $t('assets.settingCom.addPeople')"
      width="720px"
      height="515px"
      :before-close="handleClose"
      :modal-append-to-body="true"
    >
      <div class="content">
        <div>
          <datablau-input
            v-model="nameInput"
            :iconfont-state="true"
            :placeholder="$t('assets.settingCom.searchPeople')"
            clearable
            class="nameInput"
            @input="keyWord"
            @clear="inputClear"
          ></datablau-input>
          <ul v-show="flag" class="flagBox">
            <li
              @click="selectClick(item)"
              v-for="item in list"
              :key="item.id"
              class="people"
            >
              <i :class="item.icon"></i>
              <!--              <img :src="item.icon" alt="" />-->
              {{ item.name }}
            </li>
          </ul>
          <div v-show="!flag">
            <div class="menuTop">
              <span @click="backClick">
                <i class="el-icon-arrow-left"></i>
                {{ $t('assets.settingCom.return') }}
              </span>
              {{ selectListName }}
            </div>
            <div v-show="!search" style="position: relative; min-height: 300px">
              <div v-show="!onlyPeople">
                <datablau-checkbox
                  :label="$t('assets.settingCom.selectAll')"
                  class="checkbox"
                  :checkboxType="'single'"
                  v-model="checkbox"
                  @click.native.prevent.stop="setCheckbox('checkbox')"
                  v-show="
                    selectListName === $t('assets.settingCom.institutional')
                  "
                ></datablau-checkbox>
                <datablau-checkbox
                  :label="$t('assets.settingCom.selectAll')"
                  class="checkbox"
                  :checkboxType="'single'"
                  v-model="checkbox1"
                  @click.native.prevent.stop="setCheckbox('checkbox1')"
                  v-show="selectListName === $t('assets.settingCom.role')"
                ></datablau-checkbox>
                <datablau-checkbox
                  :label="$t('assets.settingCom.selectAll')"
                  class="checkbox"
                  :checkboxType="'single'"
                  @click.native.prevent.stop="setCheckbox('checkbox2')"
                  v-model="checkbox2"
                  v-show="selectListName === $t('assets.settingCom.user')"
                ></datablau-checkbox>
              </div>
              <div
                :class="{ onlyPeople: onlyPeople }"
                v-loading="loading"
                style="position: absolute; top: 0; bottom: 0; left: 0; right: 0"
              >
                <datablau-easy-tree
                  :class="[
                    'grey-tree',
                    'data-asset-tree',
                    'treeBox',
                    'datablau-tree',
                  ]"
                  ref="treeList"
                  auto-expand-parent
                  :data="menu"
                  :indent="10"
                  :check-strictly="true"
                  :default-expanded-keys="expandedKeys"
                  show-checkbox
                  node-key="nodeKey"
                  highlight-current
                  :load="loadNode"
                  lazy
                  :props="defaultProps"
                  :render-content="renderContent"
                  @check="checkedList"
                  :itemSize="34"
                  height="280px"
                  :emptyText="loading ? '' : '暂无数据'"
                ></datablau-easy-tree>
              </div>
            </div>
            <ul
              v-show="search"
              class="personnelList"
              v-loading="loading"
              v-selectLazyLoad="lazyloading"
            >
              <li
                v-for="item in personnelList"
                :key="item.id"
                @click.prevent="checkPersonnel(item)"
                style="margin-top: 4px"
              >
                <datablau-checkbox
                  class="checkbox"
                  v-model="checkboxPersonnel"
                  style="width: 120px; margin-top: 4px"
                >
                  <el-checkbox
                    :label="item.username"
                    :disabled="item.disabled"
                    :checked="item.disabled"
                    style="width: 110px"
                  >
                    <isShowTooltip
                      style="color: #555"
                      :content="item.fullUserName"
                    ></isShowTooltip>
                    <!-- {{ item.fullUserName }} -->
                  </el-checkbox>
                </datablau-checkbox>
                <div
                  class="emailAddress"
                  style="margin-left: 16px; float: right"
                >
                  <span style="display: inline-block; max-width: 110px">
                    <!-- {{ item.username }} -->
                    <isShowTooltip :content="item.username"></isShowTooltip>
                  </span>
                  <span style="display: inline-block; max-width: 100px">
                    <!-- {{ item.emailAddress }} -->
                    <isShowTooltip :content="item.emailAddress"></isShowTooltip>
                  </span>
                </div>
              </li>
            </ul>
          </div>
        </div>
        <div class="tagiconBox">
          <p>{{ $t('assets.settingCom.chosen') }}</p>

          <el-tag
            :key="(tag.fullName || tag.userName) + tag.id"
            v-for="tag in newTagList"
            :closable="true"
            :hit="false"
            :disable-transitions="false"
            :class="'tag' + tag.tagClassName"
            @close="tagClose(tag)"
          >
            <i :class="tag.tagClassName" v-show="tag.tagClassName"></i>
            <span class="tagBox">
              <isShowTooltip
                :content="
                  tag.fullUserName
                    ? `${tag.fullUserName} （${tag.username}）`
                    : tag.username || tag.fullName
                "
              >
                <span>
                  {{
                    tag.fullUserName
                      ? `${tag.fullUserName} （${tag.username}）`
                      : tag.username || tag.fullName
                  }}
                </span>
              </isShowTooltip>
            </span>
          </el-tag>
        </div>
      </div>
      <span slot="footer">
        <datablau-button @click="handleClose" type="secondary">
          {{ $t('assets.settingCom.cancel') }}
        </datablau-button>
        <datablau-button type="primary" @click="primary">
          {{ $t('assets.settingCom.sure') }}
        </datablau-button>
      </span>
    </datablau-dialog>
  </div>
</template>

<script>
import IsShowTooltip from '@/components/common/isShowTooltip/isShowTooltip.vue'
import HTTP from '../utils/api'
export default {
  /**
   * allSelected 已经绑定过的人员 包括管理权限和共享访问权限的
   * dialogVisible 弹窗显示 隐藏
   *
   * */
  props: {
    allSelected: {
      type: Array,
      default: () => [],
    },
    dialogVisible: {
      type: Boolean,
      default: false,
    },
    onlyPeople: {
      type: Boolean,
      default: false,
    },
    title: String,
  },
  components: { IsShowTooltip },
  data() {
    return {
      loading: false,
      flag: true,
      menu: [],
      selectListName: this.$t('assets.settingCom.results'),
      defaultProps: {
        children: 'children',
        label: 'fullName',
        isLeaf: 'isLeaf',
      },
      checkbox: false,
      checkbox1: false,
      checkbox2: false,
      treeCheck: [], // 默认选中的树节点
      nameInput: '',
      list: [
        {
          name: this.$t('assets.settingCom.institutional'),
          icon: 'department',
          id: 1,
        },
        {
          name: this.$t('assets.settingCom.role'),
          icon: 'role',
          id: 2,
        },
        {
          name: this.$t('assets.settingCom.user'),
          icon: 'group',
          id: 3,
        },
      ],
      newTagList: [],
      expandedKeys: [],
      ary: [],
      listName: [],
      search: true,
      personnelList: [],
      checkboxPersonnel: [],
      menuSelectAry: [],
      time: null,
      page: 1,
      nodeKeyList: [], // tree 节点数组
      keySelect: [],
    }
  },
  watch: {
    dialogVisible(val) {
      this.newTagList = []
      this.flag = true
      this.search = true
      this.checkbox = false
      this.checkbox1 = false
      this.checkbox2 = false
      this.personnelList = []
      this.nameInput = ''
      this.listName = []
      this.checkboxPersonnel = []
    },
    allSelected: {
      handler(val) {
        if (val) {
          this.ary = []
          this.allSelected.forEach(item => {
            this.ary.push(item.tagName + item.id)
          })
        }
      },
      immediate: true,
    },
    keySelectFlag: {
      handler(val) {
        let aryList = [...this.ary, ...this.listName]
        this.keySelect = this.nodeKeyList.filter(item =>
          aryList.some(v => item.indexOf(v) !== -1)
        )
        this.setChecked([...this.keySelect])
      },
      immediate: true,
      deep: true,
    },
  },
  computed: {
    keySelectFlag() {
      let { nodeKeyList, listName } = this
      return { nodeKeyList, listName }
    },
  },
  methods: {
    setCheckbox(val) {
      this[val] = !this[val]
      this.checkboxData(this[val])
    },
    checkboxData(val) {
      this.menuSelectAry = []
      this.getMenu(this.menu)
      if (val) {
        this.$refs.treeList &&
          this.$refs.treeList.setCheckedKeys(this.menuSelectAry)
        // 选中，，判断tag 的图标和颜色
        this.menu.forEach(item => {
          this.checkedList(item)
        })
      } else {
        this.newTagList = this.newTagList.filter((item, index) => {
          if (this.menuSelectAry.indexOf(item.fullName + item.id) === -1) {
            return item
          }
        })
        this.listName = this.newTagList.filter(item => item.fullName + item.id)
        this.setChecked([...this.keySelect])
      }
    },
    getMenu(obj) {
      obj.forEach(item => {
        this.menuSelectAry.push(item.fullName + item.id)
        if (item.children && item.children.length !== 0) {
          this.getMenu(item.children)
        }
      })
    },
    checkPersonnel(val) {
      this.listName.push(val.fullUserName + val.id)
      if (val.disabled) return
      val.fullName = val.fullUserName
      let flag = true
      try {
        this.newTagList.forEach((item, index) => {
          if (item.username === val.username) {
            this.newTagList.splice(index, 1)
            this.checkboxPersonnel.splice(
              this.checkboxPersonnel.indexOf(val.username),
              1
            )
            val.checked = false
            flag = false
            throw new Error(false)
          }
        })
      } catch (e) {}
      flag && this.newTagList.push(val)
      flag && this.checkboxPersonnel.push(val.username)
    },
    // 关键词搜索人员
    keyWord(val) {
      this.flag = false
      this.search = true
      this.selectListName = this.$t('assets.settingCom.results')
      this.loading = true
      this.page = 1
      val && this.getAllUserPage(val)
      !val && this.inputClear()
    },
    getAllUserPage(val) {
      let requestBody = {
        currentPage: this.page,
        pageSize: 20,
        username: val,
        fullUserName: val,
        enabled: true,
      }
      HTTP.getAllUserPage(requestBody)
        .then(res => {
          this.nodeGreyed(res.data.content)
          this.page === 1
            ? (this.personnelList = res.data.content)
            : this.personnelList.push(...res.data.content)
          // let aryList = [...this.allSelected, ...this.newTagList]
          let ary = this.personnelList.filter(item =>
            this.newTagList.some(v => {
              return v.username === item.username
            })
          )
          this.checkboxPersonnel.push(...ary.map(item => item.username))
          this.loading = false
        })
        .catch(e => {
          this.$showFailure(e)
          this.loading = false
        })
    },
    lazyloading() {
      this.page++
      this.getAllUserPage(this.nameInput)
    },
    // 树节点懒加载
    loadNode(node, resolve) {
      if (this.selectListName === this.$t('assets.settingCom.institutional')) {
        if (node.level == 0) {
          resolve(this.menu)
        } else {
          HTTP.getSubMechanism(node.level === 0 ? '' : node.data.bm, true).then(
            res => {
              console.log(res.data.length)
              this.nodeGreyed(res.data)
              resolve(res.data)
              this.loading = false
              node.level !== 0 && this.handleNodeClick(node.data)
            }
          )
        }
      } else {
        this.handleNodeClick(node.data)
        if (node.level === 0) {
          return resolve(this.menu)
        }
        if (node.level >= 1) return resolve(node.data.children)
      }
    },
    // 清空关键字搜索框
    inputClear() {
      this.flag = true
      this.search = false
      this.personnelList = []
      this.checkboxPersonnel = []
    },
    primary() {
      this.$emit('primary', this.newTagList)
    },
    setChecked(ary) {
      clearTimeout(this.time)
      this.time = setTimeout(() => {
        this.$refs.treeList && this.$refs.treeList.setCheckedKeys(ary)
      }, 0)
    },
    tagClose(val) {
      if (val.authType) {
        // 原有的管理人，点击删除时，直接删除
        this.$emit('handleClose', val)
        return
      }
      let name = val.fullUserName || val.username || val.fullName
      // let ary = []
      try {
        this.newTagList.forEach((item, index) => {
          let names = item.fullUserName || item.username || item.fullName
          if (names === name) {
            this.newTagList.splice(index, 1)
            this.listName.splice(this.listName.indexOf(names + item.id), 1)
            throw new Error(false)
          }
          // ary.push(names)
        })
      } catch (e) {}
      this.$refs.treeList &&
        this.$refs.treeList.setCheckedKeys([...this.ary, ...this.listName])
      this.checkboxPersonnel.length !== 0 &&
        this.checkboxPersonnel.splice(
          this.checkboxPersonnel.indexOf(val.username),
          1
        )
      // 判断全选按钮是否全选
      this.allCheck()
    },
    selectClick(item) {
      this.selectListName = item.name
      this.search = false
      this.loading = true
      this.setChecked([])
      if (item.name === this.$t('assets.settingCom.institutional')) {
        this.mechanism()
      } else if (item.name === this.$t('assets.settingCom.role')) {
        this.getRole()
      } else if (item.name === this.$t('assets.settingCom.user')) {
        this.getGroup()
      }
      this.flag = false
    },
    // 获取机构
    mechanism() {
      this.loading = true
      HTTP.getSubMechanism('', true).then(res => {
        this.nodeGreyed(res.data)
        this.menu = res.data
        this.loading = false
      })
      // HTTP.mechanism(true)
      //   .then(res => {
      //     res.data.pbsm = '机构'
      //     this.nodeGreyed([res.data])
      //     this.menu = [res.data]
      //     this.loading = false
      //     this.setChecked([...this.ary, ...this.keySelect])
      //   })
      //   .catch(e => {
      //     this.loading = false
      //     this.$showFailure(e)
      //   })
    },
    getRole() {
      HTTP.getRole()
        .then(res => {
          res.data.forEach(item => {
            item.children = []
            item.fullName = item.name
            this.loading = false
          })
          this.nodeGreyed(res.data)

          this.menu = res.data
          this.setChecked([...this.ary, ...this.keySelect])
        })
        .catch(e => {
          this.$showFailure(e)
          this.loading = false
        })
    },
    getGroup() {
      HTTP.getGroups()
        .then(res => {
          res.data.forEach(item => {
            item.children = []
            item.fullName = item.groupName
          })
          this.nodeGreyed(res.data)
          this.menu = res.data
          this.setChecked([...this.ary, ...this.keySelect])
          this.loading = false
        })
        .catch(e => {
          this.$showFailure(e)
          this.loading = false
        })
    },
    backClick() {
      this.flag = true
      this.nameInput = ''
    },
    mechanismAcquisition(data) {
      // const node = this.$refs.treeList.getNode({ nodeKey: data.nodeKey })
      // data.children = node
      //   ? _.cloneDeep(node.childNodes.map(child => child.data))
      //   : []
      HTTP.mechanismPeo({
        bm: data.bm,
      })
        .then(res => {
          if (res.data) {
            this.processing(res, data)
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    roleAcquisition(data) {
      if (data.id) {
        HTTP.getRolePeo({ id: data.id })
          .then(res => {
            this.processing(res, data)
          })
          .catch(e => {
            this.$showFailure(e)
          })
      }
    },
    groupAcquisition(data) {
      HTTP.getGroupsPeo({ id: data.id })
        .then(res => {
          this.processing(res, data)
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    processing(res, data) {
      let children = []
      if (data.children) {
        children = data.children
      } else {
        // console.log(this.$refs.treeList.getNode({ nodeKey: data.nodeKey }))
        children = this.$refs.treeList
          .getNode({ nodeKey: data.nodeKey })
          .childNodes.map(child => child.data)
      }
      let names = data.fullName || data.name
      if (res.data) {
        res.data.forEach(item => {
          item.fullName = item.fullUserName
          let som = children.some(items => {
            return items.fullName === item.fullName
          })
          if (!som) {
            if (
              this.selectListName === this.$t('assets.settingCom.institutional')
            ) {
              this.nodeGreyed(res.data, data)
              this.$refs.treeList.append(item, data)
            } else {
              data.children.push(...res.data)
              this.nodeGreyed(res.data, data)
            }
          }
        })
        this.expandedKeys = [names + data.id] // 有数据后自动展开
        // 树选中
        this.setChecked([...this.ary, ...this.listName])
      }
    },
    // 有节点已经被绑定则置灰
    nodeGreyed(ary, data) {
      let parentId = (data && (data.bm || data.id)) || ''
      ary.forEach(item => {
        item.isLeaf = true
        // !item.userNumber && (item.isLeaf = true)
        item.userNumber && (item.isLeaf = false)
        let names = item.fullUserName || item.fullName
        item.nodeKey = names + item.id + parentId
        this.nodeKeyList.push(item.nodeKey)
        this.nodeKeyList = [...new Set(this.nodeKeyList)]
        if (this.ary.indexOf(names + item.id) !== -1) {
          item.disabled = true
        } else {
          item.disabled = false
        }
        if (this.onlyPeople && !item.username) {
          item.disabled = true
        }
        if (item.children && item.children.length !== 0) {
          this.nodeGreyed(item.children, data)
        }
      })
    },
    //  节点点击
    handleNodeClick(data) {
      if ((data.disabled && !this.onlyPeople) || data.username) return
      if (this.selectListName === this.$t('assets.settingCom.institutional')) {
        this.mechanismAcquisition(data)
      } else if (this.selectListName === this.$t('assets.settingCom.role')) {
        this.roleAcquisition(data)
      } else if (this.selectListName === this.$t('assets.settingCom.user')) {
        this.groupAcquisition(data)
      }
    },
    renderContent(h, { node, data, store }) {
      const style = {
        flex: 'display: flex;justify-content:space-between;margin-left:-6px;position: relative;width:100%',
        alien: 'display: flex;align-items: center;margin-left:6px',
        position: 'position: absolute;right:20px;color:#999',
        border:
          'border-right: 1px solid #ddd;padding-right:10px;margin-right:10px;display: inline-block;max-width: 70px;overflow: hidden;text-overflow: ellipsis;white-space: nowrap;',
        email:
          'width: 90px;overflow: hidden;display: inline-block;vertical-align: top;white-space: nowrap;text-overflow: ellipsis;',
        fullName:
          'display: inline-block; max-width: 100px;overflow: hidden;text-overflow: ellipsis;white-space: nowrap',
      }
      return (
        <div style={style.flex}>
          <span style={style.alien}>
            <span style={style.fullName}>
              {data.fullName || data.fullUserName || data.name}
            </span>
            {data.userNumber !== undefined && (
              <span>
                （{data.userNumber}
                人）
              </span>
            )}
          </span>
          {data.fullUserName && (
            <div style={style.position}>
              <span className="conName" style={style.border}>
                <IsShowTooltip
                  content={data.username}
                  style="height: 28px; display: flex;align-items: center;"
                ></IsShowTooltip>
              </span>
              <span style={style.email}>
                <IsShowTooltip
                  content={data.emailAddress}
                  style="height: 28px; display: flex;align-items: center;"
                ></IsShowTooltip>
              </span>
            </div>
          )}
        </div>
      )
    },
    checkedList(obj, obj1) {
      let currentNode = this.$refs.treeList.getNode(obj)
      /**
       * pbm  pbsm(自定义)  表示按照机构选择
       * appName  表示按照角色选择
       * groupName  表示用户组
       * */

      // 判断类型
      this.addName(obj)
      /**
       * 1.currentNode.checked： false
       *  a.从父元素多选到其中一个子节点取消选中 -----
       *      通过  currentNode.parent.data  查看父元素是谁，，从newTagList中删除父，
       *      通过  currentNode.parent.childNodes  查看子节点中还有谁是选中状态，添加到newTagList
       *  b.节点选中--取消
       *      listName中查看有没有，有就是要删除，没有就操作a的步骤
       *  c.父元素 --- 从选中到取消，下面的子节点都删除
       * 2.currentNode.checked： true  正常添加到  newTagList
       *    如果选中的是人  父节点是否选中，选中的话，只留下父节点，删除子节点  递归-----   无法实现：如果父节点没有获取人，只有机构时，如果子机构都选中了，父机构也选中时，父机构下不属于子机构的所有人也将会被选中。eg: 按机构部门选择 - 北京数语科技（有不属于任何机构的人，和机构）
       *    如果是父节点   通过currentNode.childNodes 判断子节点在 newTagList  中有没有  有删除
       * */
      if (!currentNode.checked) {
        // b 情况
        if (this.listName.indexOf(obj.fullName + obj.id) !== -1) {
          this.newTagSplice(obj)
        } else if (currentNode.childNodes.length !== 0) {
          // c 情况
          currentNode.childNodes.map(item => {
            this.newTagSplice(item.data)
          })
        }
        // a 情况
        this.parentSplice(currentNode.parent)
      } else {
        this.addNewTag(obj)
        this.currentList(currentNode.childNodes)
      }
      // 判断全选按钮是否全选
      this.allCheck()
    },
    parentSplice(obj) {
      this.newTagSplice(obj.data)
      obj.childNodes.forEach(item => {
        if (item.checked) {
          this.addName(item.data)
          this.addNewTag(item.data)
        }
      })
      if (obj.parent && obj.level !== 1) {
        this.parentSplice(obj.parent)
      }
    },
    allCheck() {
      try {
        this.menu.forEach(item => {
          let node = this.$refs.treeList.getNode(item)
          if (!node.checked) {
            throw new Error(false)
          } else {
            if (
              this.selectListName === this.$t('assets.settingCom.institutional')
            ) {
              this.checkbox = true
            } else if (
              this.selectListName === this.$t('assets.settingCom.role')
            ) {
              this.checkbox1 = true
            } else if (
              this.selectListName === this.$t('assets.settingCom.user')
            ) {
              this.checkbox2 = true
            }
          }
        })
      } catch (e) {
        if (
          this.selectListName === this.$t('assets.settingCom.institutional')
        ) {
          this.checkbox = false
        } else if (this.selectListName === this.$t('assets.settingCom.role')) {
          this.checkbox1 = false
        } else if (this.selectListName === this.$t('assets.settingCom.user')) {
          this.checkbox2 = false
        }
      }
    },
    addName(obj) {
      let tagClassName = ''
      if (this.selectListName === this.$t('assets.settingCom.institutional')) {
        tagClassName = 'department'
      } else if (this.selectListName === this.$t('assets.settingCom.role')) {
        tagClassName = 'role'
      } else if (this.selectListName === this.$t('assets.settingCom.user')) {
        tagClassName = 'group'
      }
      if (obj.pbm || obj.pbsm || obj.appName || obj.groupName) {
        obj.tagClassName = tagClassName
      }
      return tagClassName
    },
    currentList(ary) {
      ary.forEach(items => {
        if (this.listName.indexOf(items.data.fullName + items.data.id) !== -1) {
          this.newTagSplice(items.data)
        }
        items.childNodes &&
          items.childNodes.length !== 0 &&
          this.currentList(items.childNodes)
      })
    },
    newTagSplice(obj) {
      this.newTagList.map((item, index) => {
        if (item.fullName === obj.fullName && obj.id == item.id) {
          this.newTagList.splice(index, 1)
          this.listName.splice(
            this.listName.indexOf(item.fullName + item.id),
            1
          )
          this.checkboxPersonnel.length !== 0 &&
            this.checkboxPersonnel.splice(
              this.checkboxPersonnel.indexOf(item.username),
              1
            )
        }
      })
    },
    addNewTag(obj) {
      if (obj.tagClassName && this.onlyPeople) {
        return
      }
      !obj.disabled && this.newTagList.push(obj)
      !obj.disabled && this.listName.push(obj.fullName + obj.id)
      this.newTagList = [
        ...new Set(this.newTagList.map(e => JSON.stringify(e))),
      ].map(e => JSON.parse(e))
      this.listName = [
        ...new Set(this.listName.map(e => JSON.stringify(e))),
      ].map(e => JSON.parse(e))
    },
    handleClose() {
      this.expandedKeys = []
      this.$emit('close')
    },
  },
  mounted() {},
}
</script>

<style scoped lang="scss">
/deep/.el-tag {
  margin-right: 10px;
  margin-bottom: 10px;
  color: #409eff;
  vertical-align: center;
  .tagBox {
    display: inline-block;
    max-width: 100px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  i {
    margin-right: 3px;
  }
}
/deep/ .el-tag .el-icon-close {
  top: -15px;
}
/*/deep/span.el-tree-node__expand-icon.is-leaf {*/
/*  visibility: visible;*/
/*}*/
/*/deep/.grey-tree.datablau-tree .el-tree-node__content:hover {*/
/*  .witBox {*/
/*    background: rgba(64, 158, 255, 0.1);*/
/*  }*/
/*}*/
.tagTab {
  padding-left: 10px;
  padding-top: 10px;
}
/deep/.datablau-dialog-content .content-inner {
  height: 100%;
}
.content {
  /*border: 1px solid #dddddd;*/
  height: 380px;
  border-radius: 2px;
  display: flex;
  position: relative;
  & > div:nth-child(1) {
    width: 400px;
    height: 380px;
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
    width: 280px;
    height: 380px;
    position: absolute;
    top: 0;
    bottom: 0;
    right: 0;
    padding: 16px 0 0 10px;
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
  /*position: absolute;*/
  /*right: 15px;*/
}
.checkbox {
  margin-left: 20px;
  line-height: 34px;
}
.treeBox {
  height: 280px;
  // overflow: scroll;
}
/*/deep/.el-tree-node .el-tree-node__content {*/
/*  padding-left: 28px !important;*/
/*}*/
/*/deep/.is-current .el-tree-node__content {*/
/*  padding-left: 10px !important;*/
/*}*/
/deep/.el-checkbox__inner {
  border: 1px solid #999;
}
/deep/.el-radio__inner {
  border: 1px solid #999;
}
.people i,
.tagiconBox i {
  display: inline-block;
  width: 16px;
  height: 14px;
}
.department {
  background: url('../../../assets/images/dataAssets/department.svg') no-repeat;
}
.role {
  background: url('../../../assets/images/dataAssets/role.svg') no-repeat;
  position: relative;
  top: 2px;
}
.group {
  background: url('../../../assets/images/dataAssets/group.svg') no-repeat;
}
/deep/.tagdepartment {
  background: rgba(177, 75, 120, 0.1);
  color: #b14b78;
}
/deep/.tagdepartment .el-icon-close::before {
  color: #b14b78;
}
/deep/.tagrole {
  background: rgba(64, 154, 95, 0.1);
  color: #409a5f;
}
/deep/.tagrole .el-icon-close::before {
  color: #409a5f;
}
/deep/.taggroup {
  background: rgba(210, 106, 87, 0.1);
  color: #d26a57;
}
/deep/.taggroup .el-icon-close::before {
  color: #d26a57;
}
.personnelList {
  height: 310px;
  overflow: scroll;
  li {
    display: flex;
    // justify-content: space-between;
    padding: 0 10px;
    line-height: 34px;
    margin-top: 8px;
    align-items: center;
    height: 34px;
    /deep/ .checkbox {
      margin-left: 0;
      .el-checkbox__label {
        max-width: 120px;
      }
    }
    &:after {
      display: none;
    }
    & div {
      color: #999;
      line-height: 16px;
      & > span:first-child {
        padding-right: 10px;
        border-right: 1px solid #ddd;
      }
      & > span:last-child {
        padding-left: 10px;
        width: 100px;
        overflow: hidden;
        display: inline-block;
        vertical-align: top;
        white-space: nowrap;
        text-overflow: ellipsis;
      }
    }
  }
}
/deep/ .el-tag.tagdepartment {
  .el-tag__close:hover {
    background: #fff;
  }
}
/deep/ .el-tag.tagrole {
  .el-tag__close:hover {
    background: #fff;
  }
}
/deep/ .el-tag.taggroup {
  .el-tag__close:hover {
    background: #fff;
  }
}
.onlyPeople {
  margin-top: 10px;
  height: 100%;
}
/deep/.el-checkbox__input.is-disabled .el-checkbox__inner {
  display: none;
}
/*/deep/.grey-tree.datablau-tree .el-checkbox.is-disabled {*/
/*  display: none;*/
/*}*/
/deep/ .el-checkbox__input.is-disabled.is-checked .el-checkbox__inner {
  display: inline-block;
  /* margin-right: 8px; */
}
/deep/.grey-tree.datablau-tree .el-checkbox {
  margin-right: 8px;
  top: 0;
}
/*/deep/.el-tree-node__content > .el-tree-node__expand-icon {*/
/*  padding-right: 0;*/
/*  padding-top: 0;*/
/*}*/
</style>
<style lang="scss">
.emailtipBox.el-tooltip__popper.is-light {
  border: 0 !important;
  box-shadow: 0 0 6px #ccc;
}
.emailtipBox {
  .popper__arrow {
    border: 0 !important;
    box-shadow: 0 0 6px #ccc;
  }
}
</style>
