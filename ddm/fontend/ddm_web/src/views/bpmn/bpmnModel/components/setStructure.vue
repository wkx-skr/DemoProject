<template>
  <div >
   <!-- <datablau-dialog
      title="添加组织机构"
      :visible.sync="structureDetailModal"
      append-to-body
      width="400px"
      height="560px"
      custom-class="task-detail-dialog-wrapper"
    >-->
      <div class="structure">
        <datablau-input
          maxlength="100"
          style="width:100%;"
          v-model="keyword"
          clearable
          :iconfont-state="true"
          :placeholder="'请输入机构名称或编码'"
          class="list-input"
        ></datablau-input>
        <datablau-easy-tree
          ref="tree2"
          :data-supervise="true"
          :data-icon-function="dataIconFunction"
          @node-click="handleNodeClick"
          node-key="id"
          :props="defaultProps"
          :default-expanded-keys="defaultExpandedKeys"
          auto-expand-parent
          :data="wholeTreeData"
          :expand-on-click-node="false"
          :filter-node-method="filterNode"
          :allow-drag="allowDrag"
          v-loading="treeLoading"
          :itemSize="34"
        ></datablau-easy-tree>
      </div>
      <div class="footer">
        <datablau-button type="secondary" @click="closeStructure">
          {{ $t('common.button.cancel') }}
        </datablau-button>
        <datablau-button
          type="primary"
          @click="saveStructure"
          :disabled="structureDisabled"
        >
          {{ $t('common.button.ok') }}
        </datablau-button>
      </div>
<!--    </datablau-dialog>-->
  </div>
</template>

<script>
import HTTP from '@/resource/http.js'
import string from '@/resource/utils/string'
export default {
  data () {
    return {
      // 组织机构
      structureDetailModal: true,
      structureDisabled: true,
      keyword: '',
      treeLoading: false,
      // firstTimeout: true,
      defaultProps: {
        children: 'children',
        label: 'fullName',
        value: 'id'
      },
      defaultExpandedKeys: [],
      wholeTreeData: [],
      treeKey: 0,
      result: null
    }
  },
  watch: {
    keyword (val) {
      clearTimeout(this.firstTimeout) // 防抖
      this.firstTimeout = setTimeout(() => {
        this.$refs.tree2.filter(val)
      }, 800)
      /* clearTimeout(this.firstTimeout) // 防抖
      this.firstTimeout = setTimeout(() => {
        this.treeKey++
        this.treeLoading = true
        if (this.keyword) {
          this.$refs.tree2.filter(val)
          this.treeLoading = false
          /!* HTTP.getOrgTreeByKeyword(this.keyword).then(res => {
            this.treeLoading = false
            this.wholeTreeData = [res.data]
          }) *!/
        } else {
          this.treeLoading = false
        }
      }, 800) */
    }
  },
  methods: {
    allowDrag () {
      return true
    },
    // 添加组织机构
    closeStructure () {
      // this.structureDetailModal = false
      this.$emit('closeMode')
    },
    filterNode (value, data, node) {
      if (!value) {
        return true
      }
      let hasValue = false
      if (string.matchKeyword(node.data, value, 'bm', 'fullName')) {
        hasValue = true
      }
      return hasValue
    },
    saveStructure () {
      // this.result
      this.structureDetailModal = false
      this.$emit('result', this.result)
      this.$emit('closeMode')
    },
    dataIconFunction (data, node) {
      if (data.bm === '@ROOT') {
        if (node.expanded) {
          return 'iconfont icon-openfile'
        } else {
          return 'iconfont icon-file'
        }
      } else {
        // return 'iconfont icon-schema'
        return 'iconfont icon-bumen'
      }
    },
    handleNodeClick (item) {
      this.result = item
      this.structureDisabled = false
    },
    initTree (showId) {
      return new Promise(resolve => {
        this.treeLoading = true
        // this.$http
        //   .get(this.$url + '/service/org/organization/tree/')
        HTTP.refreshOrgTree()
          .then(res => {
            this.treeLoading = false
            console.log(res)
            this.wholeTreeData = [res]
            setTimeout(() => {
              this.$refs.tree2.filter(this.keyword)
            })
            this.defaultExpandedKeys = [res.id]
            resolve(res)
          })
          .catch(e => {
            this.treeLoading = false
            this.$showFailure(e)
          })
      })
    }
  },
  mounted () {
    this.initTree()
  }
}
</script>

<style scoped lang='scss'>
  .structure{
    /*height: 434px;*/
    border-bottom: 1px solid #ddd;
    position: absolute;
    bottom: 37px;
    top: 20px;
    left: 0px;
    right: 0px;
    padding: 0 20px;
  }
  .footer{
    position: absolute;
    bottom: -7px;

    right: 20px;
  }
</style>
