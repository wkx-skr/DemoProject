<template>
  <div>
    <datablau-dialog
      :title="$t('component.branchSelect.title')"
      :visible.sync="$store.state.showBranchSelect"
      :close-on-click-modal="false"
      width="400px"
      height="560px"
      :isTree="true"
      :append-to-body="true"
      @close="handleCancel"
    >
      <datablau-input
        :iconfont-state="true"
        :placeholder="$t('component.branchSelect.placeholder')"
        v-model="nameKey"
        style="width: 100%"
        clearable
      ></datablau-input>
      <div class="tree-box" id="tree-box">
        <datablau-easy-tree
          v-if="!$store.state.branchIsCheckBox"
          :data="treeData"
          :lazy="$store.state.branchIsLazy && !nameKey"
          :load="nameKey ? null : lazyLoadMethod"
          node-key="bm"
          ref="branchTree"
          class="grey-tree branchTree"
          :default-expanded-keys="defaultExpandList"
          :expand-on-click-node="false"
          :filter-node-method="filterNode"
          @node-click="nodeClick"
          :props="defaultProps"
          :data-icon-function="dataIconFunction"
          show-overflow-tooltip
          tooltip-placement="top-start"
          :itemSize="34"
          height="400px"
        ></datablau-easy-tree>
        <datablau-tree
          v-if="$store.state.branchIsCheckBox"
          :data="treeData"
          node-key="bm"
          ref="branchTree"
          class="grey-tree branchTree"
          :default-expanded-keys="defaultExpandList"
          :expand-on-click-node="false"
          :filter-node-method="filterNode"
          @node-click="nodeClick"
          show-checkbox
          @check="handleCheckChange"
          v-loading="treeLoading"
          :props="defaultProps"
          :data-icon-function="dataIconFunction"
        >
          <span
            class="custom-tree-node"
            slot-scope="{ node, data }"
            style="position: relative"
          >
            <span v-if="!data.pbm">
              <span class="icon-i-folder">
                <span class="path1"></span>
                <span class="path2"></span>
              </span>
            </span>
            <span v-if="data.pbm">
              <span class="icon-i-user">
                <span class="path1"></span>
                <span class="path2"></span>
              </span>
            </span>
            <i
              v-if="isShowCheck(node.data)"
              class="el-icon-check"
              style="color: #6e9a3a"
            ></i>
            <span style="font-size: 12px">
              {{
                node.label.includes('/') ? node.label.split('/')[1] : node.label
              }}
            </span>
          </span>
        </datablau-tree>
      </div>

      <div slot="footer" class="dialog-footer" style="text-align: right">
        <datablau-button type="secondary" @click="handleCancel">
          {{ $t('common.button.cancel') }}
        </datablau-button>
        <datablau-button
          v-if="!$store.state.branchIsCheckBox"
          type="important"
          @click="handleOk"
          :disabled="JSON.stringify(selection) === '{}'"
        >
          {{ $t('common.button.ok') }}
        </datablau-button>
        <datablau-button
          v-if="$store.state.branchIsCheckBox"
          type="important"
          @click="handleOk"
          :disabled="!selection2.length"
        >
          {{ $t('common.button.ok') }}
        </datablau-button>
      </div>
    </datablau-dialog>
  </div>
</template>

<script>
import HTTP from '@/http/main'

export default {
  name: 'branchSelect',
  data() {
    return {
      nameKey: '',
      selection: {},
      selection2: [],
      treeData: [],
      defaultProps: {
        children: 'children',
        label: 'fullName',
        isLeaf: 'isLeaf',
      },
      defaultExpandList: [],
      treeLoading: false,
      timer: null,
      deleteArr: ['treeData'],
      rootNode: null,
      rootResolve: null,
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
    lazyLoadMethod(node, resolve) {
      if (node.level == 0) {
        this.rootNode = node
        this.rootResolve = resolve
        this.$http.post(`/user/org/organization/byBm?bm=@ROOT`).then(res => {
          resolve([{ ...res.data, isLeaf: false }])
        })
      } else {
        if (this.nameKey) {
          resolve(node.data.children)
        } else {
          this.$http
            .post(
              `/user/org/organization/getFirstLevelChildren?bm=${node.data.bm}`
            )
            .then(res => {
              resolve(
                res.data.map(item => ({
                  ...item,
                  isLeaf: !item.hasChildren,
                }))
              )
            })
        }
      }
    },
    dataIconFunction(data, node) {
      if (data.pbm) {
        return 'iconfont icon-bumen'
      } else {
        if (node.expanded) {
          return 'iconfont icon-openfile'
        } else {
          return 'iconfont icon-file'
        }
      }
    },
    initData() {
      this.treeLoading = true
      if (this.$store.state.branchIsLazy) {
        this.treeData = []
        this.defaultExpandList = ['@ROOT']
        this.treeLoading = false
      } else {
        HTTP.getOrgTree()
          .then(res => {
            this.treeLoading = false
            this.treeData = [res.data]
            this.defaultExpandList = res.data.children.map(e => e.pbm)
          })
          .catch(e => {
            this.treeLoading = false
            this.$showFailure(e)
          })
      }
    },
    filterNode(value, data) {
      if (!value) return true
      return (
        (data.fullName && data.fullName.indexOf(value) !== -1) ||
        (data.bm && data.bm.indexOf(value) !== -1)
      )
    },
    nodeClick(data) {
      if (this.$store.state.branchIsCheckBox) {
        if (
          this.selection2
            .map(e => JSON.stringify(e))
            .includes(JSON.stringify(data))
        ) {
          this.selection2.forEach((e, i) => {
            if (e.bm === data.bm) {
              this.selection2.splice(i, 1)
            }
          })
        } else {
          this.selection2.push(data)
        }
      } else {
        this.selection = data
      }
    },
    handleOk() {
      this.$store.commit(
        'changeBranchData',
        this.$store.state.branchIsCheckBox ? this.selection2 : this.selection
      )
      this.$utils.branchSelect.close()
    },
    handleCancel() {
      this.$utils.branchSelect.close(true)
    },
    handleCheckChange(data, data2) {
      this.selection2 = data2.checkedNodes
    },
    isShowCheck(data) {
      return this.selection2
        .map(e => JSON.stringify(e))
        .includes(JSON.stringify(data))
    },
  },
  watch: {
    nameKey(val) {
      if (this.$store.state.branchIsLazy) {
        clearTimeout(this.timer)
        this.timer = setTimeout(() => {
          if (val) {
            this.$http
              .post(`/user/org/organization/getTree/`, { keyword: val })
              .then(res => {
                this.treeData = [res.data]
              })
          } else {
            this.defaultExpandAll = false
            this.treeData = []
            this.lazyLoadMethod(this.rootNode, this.rootResolve)
          }
        }, 800)
      } else {
        clearTimeout(this.timer)
        this.timer = setTimeout(() => {
          console.log(val)
          this.$refs.branchTree.filter(val)
        }, 800)
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.branchTree {
  // margin-bottom: 20px;
  // margin-top: 5px;
  // max-height: 50vh;
  overflow-y: auto;
}
.tree-box {
  position: absolute;
  top: 46px;
  left: 0;
  right: 0;
  bottom: 0px;
  overflow-y: auto;
}

.is-block + .is-block {
  margin-left: 8px;
}
</style>
