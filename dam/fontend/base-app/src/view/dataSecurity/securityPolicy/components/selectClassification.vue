<template>
  <div>
    <datablau-dialog
      :title="'选择安全分类'"
      size="s"
      height="350px"
      width="600px"
      :visible.sync="fication"
      @close="close"
    >
      <!--     新版安全6.4添加树
       lazy
        :load="loadCallback"-->
      <datablau-tree
        v-loading="treeLoading"
        lazy
        :load="loadCallback"
        @node-click="handleNodeClick"
        node-key="id"
        :props="defaultProps"
        :data="treeData"
        :data-supervise="true"
        :data-img-function="dataIconFunction"
        ref="tree"
        empty-text="暂无目录信息"
      ></datablau-tree>
      <span slot="footer">
        <datablau-button type="secondary" @click="close">
          {{ $t('common.button.cancel') }}
        </datablau-button>
        <datablau-button type="important" @click="sure">
          {{ $t('common.button.ok') }}
        </datablau-button>
      </span>
    </datablau-dialog>
  </div>
</template>

<script>
import HTTP from '@/view/dataSecurity/util/api'
import folder from '@/assets/images/search/folder.svg'
export default {
  props: {
    fication: {
      type: Boolean,
      default: false,
    },
  },
  watch: {
    fication(val) {
      if (!val) return
      this.$refs.tree && this.$refs.tree.$refs.tree.setCurrentKey(null)
    },
  },
  data() {
    return {
      treeLoading: false,
      defaultProps: {
        children: 'children',
        label: 'name',
        isLeaf: 'leaf',
      },
      treeData: [],
      resolve: null,
      nodeData: {},
    }
  },
  methods: {
    dataIconFunction(data) {
      const url = `${window.setting.restApiPathName}/service/ddc/config/icon/${data.icon}`
      return data.icon ? url : folder
    },
    handleNodeClick(data) {
      this.nodeData = data
    },
    loadCallback(node, resolve) {
      this.resolve = resolve
      if (node.level === 0) {
        this.getClassifyTree(0)
      } else {
        this.getClassifyTree(node.data.id)
      }
    },
    getClassifyTree(id) {
      // 旧版安全分类接口
      // HTTP.getCatalogList()
      //   .then(res => {
      //     res.data.name = '所有目录'
      //     this.treeData = [res.data]
      //     this.treeLoading = false
      //   })
      //   .catch(e => {
      //     this.$showFailure(e)
      //     this.treeLoading = false
      //   })
      // 6.4安全的安全分类接口
      HTTP.getClassifyTree(id)
        .then(res => {
          let data = res.data
          let treeList = data.DataSecurityStructureVo.catalogVos || []
          let structureVos = data.DataSecurityStructureVo.detailVos
          treeList.forEach(item => {
            const newList = structureVos.filter(
              o => o.level === item.level && o.structureId === item.structureId
            )
            item.icon = newList[0].icon
          })
          if (id === 0) {
            this.treeData = treeList
          }
          this.resolve && this.resolve(treeList)
          this.treeLoading = false
        })
        .catch(e => {
          this.$showFailure(e)
          this.treeLoading = false
        })
    },
    close() {
      this.$emit('close')
    },
    sure() {
      this.$emit('sure', this.nodeData)
    },
  },
  mounted() {
    this.getClassifyTree(0)
  },
}
</script>

<style scoped lang="scss"></style>
