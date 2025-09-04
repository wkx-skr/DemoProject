<template>
  <div>
    <datablau-dialog
      :title="$t('component.branchSelect.title')"
      :visible.sync="$store.state.showBranchSelect"
      v-if="$store.state.showBranchSelect"
      :close-on-click-modal="false"
      width="400px"
      height="600px"
      :append-to-body="true"
      @close="handleCancel"
    >
<!--      <datablau-input
        :iconfont-state="true"
        :placeholder="$t('component.branchSelect.placeholder')"
        v-model="nameKey"
        style="width: 100%"
        clearable
      ></datablau-input>-->
      <datablau-easy-tree
        v-if="!$store.state.branchIsCheckBox"
        :data="treeData"
        node-key="bm"
        ref="branchTree"
        class="grey-tree branchTree datablau-tree"
        :default-expanded-keys="defaultExpandList"
        :expand-on-click-node="false"
        @node-click="nodeClick"
        :props="defaultProps"
        :data-icon-function="dataIconFunction"
        show-overflow-tooltip
        tooltip-placement="top-start"
        height="415px"
        style="height: 415px"
        :itemSize="34"
        v-loading="treeLoading"
        :lazy="!nameKey"
        :key="treeKey"
        :load="loadNode"
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
import HTTP from '@/resource/http.js'
export default {
  name: 'branchSelect',
  data () {
    return {
      nameKey: '',
      selection: {},
      selection2: [],
      treeData: [],
      defaultProps: {
        children: 'children',
        label: 'fullName',
        isLeaf: function (data) {
          return !data.hasChildren
        }
      },
      defaultExpandList: [],
      treeLoading: false,
      timer: null,
      deleteArr: ['treeData'],
      treeKey: 0
    }
  },
  methods: {
    filterNode () {

    },
    dataIconFunction (data, node) {
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
    initData () {},
    loadNode (node, resolve) {
      if (node.level === 0) {
        HTTP.getOrgDetailByBm().then(res => {
          this.defaultExpandList = [res.data.bm]
          return resolve([res.data])
        })
      } else {
        HTTP.getOrgTreeByLevel(node.data.bm).then(res => {
          return resolve(res.data)
        })
      }
    },
    nodeClick (data) {
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
    handleOk () {
      this.$store.commit(
        'changeBranchData',
        this.$store.state.branchIsCheckBox ? this.selection2 : this.selection
      )
      this.$utils.branchSelect.close()
    },
    handleCancel () {
      this.$utils.branchSelect.close(true)
    },
    handleCheckChange (data, data2) {
      this.selection2 = data2.checkedNodes
    },
    isShowCheck (data) {
      return this.selection2
        .map(e => JSON.stringify(e))
        .includes(JSON.stringify(data))
    }
  },
  watch: {
    nameKey (val) {
      clearTimeout(this.timer)
      this.timer = setTimeout(() => {
        this.treeKey++
        this.treeLoading = true
        if (this.nameKey) {
          HTTP.getOrgTreeByKeyword(this.nameKey).then(res => {
            this.treeLoading = false
            this.treeData = [res.data]
          })
        } else {
          this.treeLoading = false
        }
      }, 800)
    }
  }
}
</script>

<style lang="scss" scoped>
.branchTree {
  margin-bottom: 20px;
  margin-top: 5px;
  // max-height: 50vh;
  overflow-y: auto;
}

.is-block + .is-block {
  margin-left: 8px;
}
</style>
