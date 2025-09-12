<template>
  <div class="asset-catalog-dialog">
    <p>
      <span>数据资产目录：</span>
      <el-button type="text" @click="openAssetDialog" :disabled="disabled || loading">
        +选择
      </el-button>
    </p>
    <!-- 数据资产目录选择弹窗 -->
    <el-dialog
      title="选择数据资产目录"
      :visible.sync="showAssetDialog"
      width="80%"
      append-to-body
      destroy-on-close
      @close="closeAssetDialog"
      v-loading="loading"
    >
      <!-- 顶部已选项 -->
      <div
        style="
          height: 20%;
          overflow-y: auto;
          border-bottom: 1px solid #eee;
          padding-bottom: 8px;
        "
      >
        <el-tag
          v-for="item in selectedAssets"
          :key="item.id"
          closable
          @close="removeSelectedAsset(item)"
          style="margin: 4px"
        >
          {{ item.name }}
        </el-tag>
        <datablau-button
          type="primary"
          @click="clearAllAssets"
          v-if="selectedAssets.length"
        >
          全部清空
        </datablau-button>
      </div>
      <!-- 中间内容 -->
      <div style="display: flex; height: 60%; margin-top: 10px">
        <!-- 左侧树 -->
        <el-tree
          :data="assetTree"
          :props="{ label: 'name', children: 'children' }"
          node-key="id"
          highlight-current
          @node-click="handleTreeNodeClick"
          @check-change="handleTreeCheckChange"
          style="
            width: 20%;
            border-right: 1px solid #eee;
            padding-right: 10px;
            height: 500px;
            overflow-y: auto;
          "
        />
        <!-- 右侧表格 -->
        <el-table
          :data="assetTable"
          style="width: 80%; margin-left: 10px; height: 500px"
          @selection-change="handleTableSelectionChange"
          ref="assetTable"
          height="100%"
        >
          <el-table-column type="selection" width="50" />
          <el-table-column prop="englishName" label="逻辑数据实体英文名称" />
          <el-table-column prop="name" label="逻辑数据实体中文名称" />
          <!-- 其他列 -->
        </el-table>
      </div>
      <!-- 底部按钮 -->
      <span slot="footer" class="dialog-footer">
        <datablau-button @click="closeAssetDialog">取消</datablau-button>
        <datablau-button type="primary" @click="confirmAssetSelection">
          确定
        </datablau-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import api from '@/view/dataAsset/utils/api'

export default {
  name: 'AssetCatalogDialog',
  props: {
    // 允许配置参数
    catalogType: {
      type: String,
      default: '2',
    },
    // 允许父组件自定义localStorage的key
    storageKey: {
      type: String,
      default: 'selectedAssets',
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      loading: false,
      showAssetDialog: false,
      selectedAssets: [],
      assetTree: [],
      assetTable: [],
      assetTableSelection: [],
    }
  },
  watch: {
    selectedAssets: {
      handler(val) {
        localStorage.setItem(this.storageKey, JSON.stringify(val))
      },
      deep: true,
    },
  },
  mounted() {
    this.getManageTreeData()
  },
  methods: {
    openAssetDialog() {
      const local = localStorage.getItem(this.storageKey)
      if (local && local !== '[]') {
        this.selectedAssets = JSON.parse(local)
        // 同步表格勾选
        this.$nextTick(() => {
          this.selectedAssets.forEach(item => {
            this.assetTable.forEach(row => {
              if (item.id === row.id) {
                this.$refs.assetTable.toggleRowSelection(row, true)
              }
            })
          })
        })
      } else {
        this.getManageTreeData()
      }
      this.showAssetDialog = true
    },
    async getManageTreeData() {
      this.loading = true
      try {
        const res = await api.getManageTree('2')
        if (!res.data) return console.error(res)
        await this.handleTreeNodeClick(res.data[0], 'firstGet')
        this.assetTree = res.data
      } catch (error) {
        console.error('获取目录树失败:', error)
        this.$message.error('获取目录树失败')
      } finally {
        this.loading = false
      }
    },
    closeAssetDialog() {
      this.showAssetDialog = false
    },
    removeSelectedAsset(item) {
      this.selectedAssets = this.selectedAssets.filter(i => i.id !== item.id)
      this.$nextTick(() => {
        const row = this.assetTable.find(i => i.id === item.id)
        if (row && this.$refs.assetTable) {
          this.$refs.assetTable.toggleRowSelection(row, false)
        }
      })
    },
    clearAllAssets() {
      this.selectedAssets = []
      this.$refs.assetTable && this.$refs.assetTable.clearSelection()
      // 清空本地缓存
      localStorage.removeItem(this.storageKey)
    },
    async handleTreeNodeClick(node, isFirstGet) {
      if (isFirstGet !== 'firstGet') localStorage.setItem(this.storageKey, '')
      // 先查本地
      const local = localStorage.getItem(this.storageKey)
      if (local && local !== '[]') {
        this.selectedAssets = JSON.parse(local)
      } else {
        // 没有本地缓存才用接口返回
        this.loading = true
        try {
          const res = await this.$http.get(
            `/assets/catalog/${2}/${node.id}/findL4ByParentId`
          )
          if (!res.data) return console.error(res)
          this.selectedAssets = res.data
        } catch (error) {
          console.error('获取资产列表失败:', error)
          this.$message.error('获取资产列表失败')
        } finally {
          this.loading = false
        }
      }
      this.assetTable = this.selectedAssets
      this.$nextTick(() => {
        this.$refs.assetTable && this.$refs.assetTable.toggleAllSelection()
      })
    },
    // 可以实现树的勾选功能
    handleTreeCheckChange(data, checked, indeterminate) {},
    handleTableSelectionChange(selection) {
      this.assetTableSelection = selection
      this.selectedAssets = [...selection]
    },
    confirmAssetSelection() {
      this.selectedAssets = [...this.assetTableSelection]
      this.showAssetDialog = false
      // 确认选择时发送事件
      this.$emit('confirm', this.selectedAssets)
    },
  },
}
</script>
