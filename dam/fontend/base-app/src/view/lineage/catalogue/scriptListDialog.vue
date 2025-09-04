<template>
  <div class="dataSourceDialog">
    <datablau-dialog
      :visible.sync="scriptDialogVisible"
      :title="$t('meta.lineageManage.lineageCatalogue.selectScript')"
      width="1000px"
      :height="'500px'"
      :before-close="handleClose"
      append-to-body
    >
      <div class="content" style="height: 330px">
        <el-form inline>
          <el-form-item>
            <datablau-input
              style="border-radius: 2px; display: inline-block"
              v-model="keyword"
              :placeholder="
                $t('meta.lineageManage.scriptManage.fillScriptName')
              "
              :iconfont-state="true"
              clearable
            ></datablau-input>
          </el-form-item>
          <el-form-item class="btn">
            <datablau-button type="normal" @click="handleSearch">
              {{ $t('common.button.query') }}
            </datablau-button>
          </el-form-item>
        </el-form>
        <datablau-table
          :data="tableData"
          ref="multipleTable"
          @selection-change="handleSelectionChange"
          data-selectable
          height="100%"
        >
          <el-table-column
            prop="name"
            show-overflow-tooltip
            align="left"
            min-width="160"
            :label="$t('meta.lineageManage.scriptManage.scriptName')"
          ></el-table-column>
          <el-table-column
            prop="description"
            :label="$t('meta.lineageManage.scriptManage.description')"
            min-width="150"
            show-overflow-tooltip
            align="left"
          ></el-table-column>
          <el-table-column
            min-width="200"
            prop="lineageType"
            :label="$t('meta.lineageManage.scriptManage.lineageType')"
          ></el-table-column>
          <el-table-column
            prop="scriptTypeDesc"
            min-width="120"
            :label="$t('meta.lineageManage.scriptManage.langType')"
          ></el-table-column>
          <el-table-column
            prop="modifityTime"
            :label="$t('meta.lineageManage.scriptManage.modifityTime')"
            :formatter="$timeFormatter"
            width="190"
          ></el-table-column>
          <el-table-column
            prop="creator"
            min-width="100"
            :label="$t('meta.lineageManage.scriptManage.creator')"
          ></el-table-column>
          <el-table-column
            prop="createTime"
            :label="$t('meta.lineageManage.scriptManage.createTime')"
            :formatter="$timeFormatter"
            width="190"
          ></el-table-column>
        </datablau-table>
      </div>
      <span slot="footer">
        <datablau-pagination
          style="display:inline-block;float:left;"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="currentPage"
          :page-sizes="[20, 50, 100]"
          :page-size="pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
        ></datablau-pagination>
        <datablau-button @click="close">
          {{ $t('common.button.cancel') }}
        </datablau-button>
        <datablau-button type="primary" @click="addScript">
          {{ $t('common.button.ok') }}
        </datablau-button>
      </span>
    </datablau-dialog>
  </div>
</template>
<script>
import {
  getTableData,
  page,
  deleteScript,
  delScriptBatch,
  enabled,
} from '../scriptManage/server.js'
export default {
  components: {},
  data() {
    return {
      keyword: '',
      tableData: null,
      pageSize: 20,
      currentPage: 1,
      total: 0,
      selected: [],
      showUpload: true,
    }
  },
  props: ['scriptDialogVisible', 'folderId'],
  beforeMount() {},
  mounted() {},
  methods: {
    addScript() {
      let obj = []
      this.selected.forEach(element => {
        obj.push({
          // id: '',
          folderId: this.folderId,
          itemId: element.id,
          refType: 'SCRIPT',
        })
      })
      this.$http
        .post(
          this.$meta_url + '/service/lineage/folder/addOrUpdateFolderRefs',
          obj
        )
        .then(res => {
          this.$message.success(
            this.$t('meta.lineageManage.lineageCatalogue.successfullyScript')
          )
          this.$emit('closeScriptDialog')
          this.$emit('getTreeRef', 'fourth')
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    open() {
      this.keyword = ''
      this._getTableData()
    },
    close() {
      this.keyword = ''
      this.$emit('closeScriptDialog')
    },
    handleSearch() {
      this.currentPage = 1
      this._getTableData()
    },
    async _getTableData() {
      let param = {
        keyword: this.keyword,
        currentPage: this.currentPage,
        pageSize: this.pageSize,
        enabled: true,
      }
      try {
        let res = await page(param)
        if (Array.isArray(res.data.content) && res.data.content.length > 0) {
          let tempData = res.data.content.map(item => {
            return {
              scriptTypeDesc:
                item.scriptType === 'JAVASCRIPT'
                  ? 'javascript'
                  : this.$t('meta.lineageManage.scriptManage.regex'),
              ...item,
            }
          })
          this.tableData = tempData
          this.total = res.data.totalItems
        } else {
          this.tableData = []
          this.total = 0
        }
      } catch (e) {
        this.$showFailure(e)
      }
    },
    handleSelectionChange(val) {
      this.selected = val
    },
    handleSizeChange(size) {
      this.pageSize = size
      this.currentPage = 1
      this._getTableData()
    },
    handleCurrentChange(current) {
      this.currentPage = current
      this._getTableData()
    },
    handleClose() {
      this.$emit('closeScriptDialog')
    },
  },
  watch: {
    /* keyword(newVal) {
      const obj = {
        keyword: newVal,
        currentPage: 1,
        sortData: this.sortData,
        pageSize: this.pageSize,
      }
      this.currentPage = 1
      this.changeDSDisplay(obj)
    }, */
  },
}
</script>
<style scoped lang="scss">
.page {
  position: absolute;
  bottom: -50px;
  left: 20px;
}
// /deep/ .el-table {
//   height: 280px !important;
// }
</style>
<style lang="scss"></style>
