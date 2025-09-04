<template>
  <div>
    <datablau-dialog
      :title="$t('common.dashboard.h5ComponentsList')"
      :visible.sync="visible"
      :close-on-click-modal="false"
      append-to-body
      width="800px"
    >
      <datablau-table :data="tableData" height="300px">
        <el-table-column
          :label="$t('common.dashboard.componentName')"
          prop="name"
        ></el-table-column>
        <el-table-column
          :label="$t('common.dashboard.createTime')"
          prop="createTime"
          :formatter="this.$timeFormatter"
        ></el-table-column>
        <el-table-column
          :label="$t('common.dashboard.operateLabel')"
          :width="120"
          align="center"
        >
          <template slot-scope="scope">
            <datablau-button type="text" @click="edit(scope.row)">
              {{ $t('common.dashboard.editLabel') }}
            </datablau-button>
            <datablau-button type="text" @click="remove(scope.$index)">
              {{ $t('common.button.delete') }}
            </datablau-button>
          </template>
        </el-table-column>
      </datablau-table>
      <span slot="footer">
        <datablau-button type="secondary" @click="visible = false">
          {{ $t('common.button.closeLabel') }}
        </datablau-button>
        <datablau-button @click="createComponent">
          {{ $t('common.button.createComponent') }}
        </datablau-button>
      </span>
    </datablau-dialog>
    <datablau-dialog
      :title="$t('common.dashboard.componentEditorLabel')"
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
        .post(this.$base_url + `/widget/getWidgetConfig?id=${WidgetsName}`)
        .then(res => {
          this.tableData = JSON.parse(res.data.content)
        })
        .catch(e => {
          this.tableData = []
          this.putList()
        })
    },
    putList() {
      this.$http
        .post(this.$base_url + `/widget/saveWidgetConfig`, {
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
      this.$confirm(this.$t('common.dashboard.removeConfirm'))
        .then(() => {
          this.tableData.splice(index, 1)
          this.putList()
        })
        .catch(() => {
          this.$message.info(this.$t('common.dashboard.cancelMessage'))
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
