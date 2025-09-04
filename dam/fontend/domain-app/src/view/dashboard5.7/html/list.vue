<template>
  <div>
    <datablau-dialog
      title="H5组件清单"
      :visible.sync="visible"
      :close-on-click-modal="false"
      append-to-body
      width="800px"
    >
      <datablau-table :data="tableData" height="300px">
        <el-table-column label="名称" prop="name"></el-table-column>
        <el-table-column
          label="创建时间"
          prop="createTime"
          :formatter="this.$timeFormatter"
        ></el-table-column>
        <el-table-column label="操作" :width="120" align="center">
          <template slot-scope="scope">
            <datablau-button type="text" @click="edit(scope.row)">
              编辑
            </datablau-button>
            <datablau-button type="text" @click="remove(scope.$index)">
              {{ $t('common.button.delete') }}
            </datablau-button>
          </template>
        </el-table-column>
      </datablau-table>
      <span slot="footer">
        <datablau-button type="secondary" @click="visible = false">
          关闭窗口
        </datablau-button>
        <datablau-button @click="createComponent">创建组件</datablau-button>
      </span>
    </datablau-dialog>
    <datablau-dialog
      title="H5组件编辑器"
      :visible.sync="editorVisible"
      :close-on-click-modal="false"
      append-to-body
      width="1000px"
    >
      <editor
        v-if="editorVisible"
        :current-data="currentData"
        :list-data="tableData"
        @update-list="handleUpdateList"
        @close="handleCloseEditor"
      ></editor>
    </datablau-dialog>
  </div>
</template>

<script>
import Editor from './editor.vue'
const WidgetsName = 'dashboard-h5-list'
export default {
  components: {
    Editor,
  },
  data() {
    return {
      visible: false,
      tableData: [],
      editorVisible: false,
      currentData: null,
    }
  },
  mounted() {
    // this.getList()
  },
  methods: {
    show() {
      this.visible = true
      this.getList()
    },
    getList() {
      this.$http
        .post(this.$url + `/widget/getWidgetConfig?id=${WidgetsName}`)
        .then(res => {
          if (res.data.content) {
            this.tableData = JSON.parse(res.data.content)
          } else {
            this.tableData = []
            this.putList()
          }
        })
        .catch(e => {
          this.tableData = []
          this.putList()
        })
    },
    putList() {
      this.$http
        .post(this.$url + '/widget/saveWidgetConfig', {
          widgetId: WidgetsName,
          content: JSON.stringify(this.tableData),
        })
        .then(() => {
          this.getList()
        })
        .catch(e => {})
    },
    createComponent() {
      this.currentData = null
      this.editorVisible = true
    },
    edit(row) {
      this.currentData = row
      this.editorVisible = true
    },
    remove(index) {
      this.$confirm('确定要执行删除操作吗？')
        .then(() => {
          this.tableData.splice(index, 1)
          this.putList()
        })
        .catch(() => {
          this.$message.info('操作已取消')
        })
    },
    handleUpdateList({ id, name, createTime }) {
      if (this.currentData) {
        // edit
        this.tableData.forEach(item => {
          if (item.id === id) {
            item.name = name
          }
        })
      } else {
        // append
        this.tableData.push({
          id: id,
          createTime: createTime,
          name: name,
        })
      }
      this.putList()
    },
    handleCloseEditor() {
      this.editorVisible = false
    },
  },
}
</script>

<style scoped></style>
