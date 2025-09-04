<template>
  <datablau-dialog
    :visible.sync="visible"
    width="400px"
    height="560px"
    :before-close="closeDialog"
    :title="$t('assets.taskManage.selectTargetCatalog')"
  >
    <div class="list-box" v-loading="treeLoading">
      <div class="bottom-part lazy-tree-box">
        <datablau-input
          v-model="dirKeyword"
          :placeholder="$t('assets.directoryTree.searchPlaceholder')"
          style="width: 100%"
        ></datablau-input>
      </div>
      <div class="tree-content" style="overflow: auto">
        <datablau-easy-tree
          class="el-tree light-blue-tree directory-tree"
          style="clear: both; position: relative"
          :show-checkbox="false"
          :data="treeData"
          ref="directoryTree"
          :expand-on-click-node="false"
          :props="defaultProps"
          :showOverflowTooltip="true"
          @node-click="handleNodeClick"
          :filter-node-method="filterMethod"
          node-key="id"
          :highlight-current="true"
          :use-default-sort="false"
          :empty-text="
            treeLoading ? '' : $t('assets.directoryTree.noCatalogInfo')
          "
          :itemSize="34"
          :highlightCurrent="true"
          height="100%"
        ></datablau-easy-tree>
      </div>
    </div>
    <div slot="footer">
      <datablau-button type="secondary" @click="closeDialog">
        {{ $t('common.button.cancel') }}
      </datablau-button>
      <datablau-button type="primary" @click="confirm" :disabled="!currentNode">
        {{ $t('common.button.ok') }}
      </datablau-button>
    </div>
  </datablau-dialog>
</template>

<script>
import IsShowTooltip from '@/components/common/isShowTooltip/isShowTooltip.vue'
export default {
  name: 'BIDirectoryTree',
  props: {
    selected: {
      type: Array,
      default() {
        return []
      },
    },
    visible: {
      type: Boolean,
      default: false,
    },
    treeData: {
      type: Array,
      default: () => [],
    },
  },
  components: { IsShowTooltip },
  data() {
    return {
      showDialog: true,
      treeLoading: false,
      loading: false,
      dirKeyword: '',
      defaultProps: {
        children: 'subs',
        label: 'name',
      },
      searchLoading: false,
      noDataText: '',
      showClose: false,
      currentNode: null,
    }
  },
  watch: {
    selected: {
      handler() {
        this.currentNode = this.selected
      },
      immediate: true,
    },
    dirKeyword: {
      handler() {
        this.$refs.directoryTree.filter(this.dirKeyword)
      },
    },
  },
  async mounted() {},
  methods: {
    filterMethod(value, data) {
      if (!value) return true
      return data.name.indexOf(value) !== -1
    },
    closeDialog() {
      this.$emit('close')
    },
    confirm() {
      // console.log(this.selectedNodes)
      this.$emit('confirm', this.currentNode)
    },
    handleNodeClick(data) {
      this.currentNode = data
    },
  },
  beforeDestroy() {
    clearTimeout(this.searchTimer)
  },
}
</script>

<style lang="scss" scoped></style>
