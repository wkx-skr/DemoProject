<template>
  <div class="control-contents">
    <div class="control-content list-search-content">
      <datablau-select v-model="accessLevelId" style="display: inline-block">
        <el-option
          :label="$t('meta.DS.tableDetail.visitControl.allLevel')"
          :value="-1"
        ></el-option>
        <el-option
          :key="key"
          :label="val"
          :value="key"
          v-for="(val, key) of levelIdToNameMap"
        ></el-option>
      </datablau-select>
      <datablau-button
        style="margin-left: 20px; float: right"
        type="important"
        class="iconfont icon-tianjia"
        @click="dialogClick"
        :disabled="isSecurity && !$auth['MAIN_DATA_AUTH_ACCESS_CONTROL']"
      >
        {{ buttonStr }}
      </datablau-button>
    </div>
    <datablau-form-submit>
      <datablau-table
        v-loading="loading"
        :data="tableData"
        :empty-text="$t('meta.DS.tableDetail.noData')"
        class="access-control-table"
      >
        <el-table-column
          prop="visitorName"
          :label="$t('meta.DS.tableDetail.visitControl.visitor')"
          :min-width="100"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          prop="visitorTypeName"
          :label="$t('meta.DS.tableDetail.visitControl.type')"
          :min-width="100"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          prop="accessLevelId"
          :label="$t('meta.DS.tableDetail.visitControl.accessLevel')"
          :min-width="120"
        >
          <template slot-scope="scope">
            <datablau-select
              :disabled="isSecurity && !$auth['MAIN_DATA_AUTH_ACCESS_CONTROL']"
              style="width: 200px"
              class="mini-select"
              v-if="
                !scope.row.itemName ||
                scope.row.itemName === null ||
                itemType === 80010076
              "
              v-model="scope.row.accessLevelId"
              @focus="focus(scope.row)"
              @change="changAccessLevel(scope.row, ...arguments)"
              :placeholder="$t('meta.common.pleaseSelect')"
            >
              <el-option
                v-for="(item, id) of levelIdToNameMap"
                :key="id"
                :label="item"
                :value="parseInt(id)"
              ></el-option>
            </datablau-select>
            <span v-else>{{ levelIdToNameMap[scope.row.accessLevelId] }}</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="itemName"
          :label="$t('meta.DS.tableDetail.visitControl.path')"
          :min-width="150"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          :label="$t('meta.DS.tableDetail.visitControl.operation')"
          width="100"
          class="datablau-table table"
          align="center"
        >
          <template
            v-if="
              !scope.row.itemName ||
              scope.row.itemName === null ||
              itemType === 80010076
            "
            slot-scope="scope"
          >
            <datablau-button
              type="text"
              slot="reference"
              @click="handleRemove(scope)"
            >
              {{ $t('meta.DS.tableDetail.visitControl.remove') }}
            </datablau-button>
          </template>
        </el-table-column>
      </datablau-table>
      <template slot="buttons">
        <datablau-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page.sync="pageData.current"
          :page-size="pageData.size"
          :page-sizes="[20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="pageData.total"
        ></datablau-pagination>
      </template>
    </datablau-form-submit>
  </div>
</template>

<script>
export default {
  props: {
    type: {
      type: String,
      required: true,
    },
    levelIdToNameMap: {
      type: Object,
      required: true,
    },
    dialogClick: {
      type: Function,
      required: true,
    },
    buttonStr: {
      required: true,
    },
    itemId: {
      required: true,
    },
    itemType: {
      required: true,
    },
    inTableDetails: {
      default: false,
      type: Boolean,
    },
    isSecurity: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      loading: false,
      searchQuery: '',
      tableData: [],
      pageData: {
        current: 1,
        size: 20,
        total: 0,
      },
      focusCanChange: true,
      accessLevelId: -1,
    }
  },
  mounted() {
    this.getTableData()
  },
  methods: {
    focus(row) {
      if (this.focusCanChange) {
        row.accessLevelIdBak = row.accessLevelId
      }
    },
    changAccessLevel(row, accessLevelId) {
      this.focusCanChange = false
      const h = this.$createElement
      this.$DatablauCofirm(
        this.$t('meta.DS.tableDetail.visitControl.modifyAccessLevelConfirm'),
        this.$t('meta.DS.tableDetail.visitControl.tips'),
        {
          confirmButtonText: this.$t('common.button.ok'),
          cancelButtonText: this.$t('common.button.cancel'),
          type: 'warning',
        }
      )
        .then(() => {
          this.$http
            .put(this.$url + '/service/auth/', {
              id: row.id,
              accessLevelId,
            })
            .then(res => {
              this.$message.success(this.$t('meta.DS.message.modifySucceed'))
            })
            .catch(e => {
              this.$showFailure(e)
            })
        })
        .catch(() => {
          row.accessLevelId = row.accessLevelIdBak
        })
        .finally(() => {
          this.focusCanChange = true
        })
    },
    handleSizeChange(size) {
      this.pageData.current = 1
      this.pageData.size = size
      this.getTableData()
    },
    handleCurrentChange(current) {
      this.pageData.current = current
      this.getTableData()
    },
    getTableData() {
      this.loading = true
      const params = {
        visitorType: this.type,
        itemId: this.itemId,
        itemType: this.itemType,
        currentPage: this.pageData.current,
        pageSize: this.pageData.size,
      }
      if (this.accessLevelId && this.accessLevelId !== -1) {
        params.accessLevelId = this.accessLevelId
      }
      this.$http
        .post(
          this.$url +
            (this.itemType == 80000004 ||
            this.itemType == 80500008 ||
            this.itemType == 82800002
              ? '/service/auth/table/page'
              : '/service/auth/page'),
          params
        )
        .then(res => {
          this.loading = false
          this.tableData = res.data.content
          this.pageData.total = res.data.totalItems
        })
        .catch(e => {
          this.tableData = []
          this.pageData.total = 0
          this.loading = false
          this.$showFailure(e)
        })
        .finally(() => {
          this.loading = false
        })
    },
    handleRemove(scope) {
      this.$DatablauCofirm(
        this.$t('meta.DS.tableDetail.visitControl.removeConfirm'),
        this.$t('meta.DS.tableDetail.visitControl.tips'),
        {
          type: 'warning',
          cancelButtonText: this.$t('common.button.cancel'),
          confirmButtonText: this.$t('common.button.ok'),
        }
      ).then(() => {
        this.$http
          .delete(this.$url + '/service/auth/' + scope.row.id)
          .then(res => {
            this.$blauShowSuccess(this.$t('meta.DS.message.removeSucceed'))
            this.getTableData()
          })
          .catch(e => {
            this.showFailure(e)
          })
      })
    },
    closePop(scope) {
      this.$refs['popover-' + this.type + scope.$index].doClose()
    },
    remove(scope) {
      this.$http
        .delete(this.$url + '/service/auth/' + scope.row.id)
        .then(res => {
          this.$message.success(this.$t('meta.DS.message.delSucceed'))
          this.getTableData()
          this.$refs['popover-' + this.type + scope.$index].doClose()
        })
        .catch(e => {
          this.showFailure(e)
        })
    },
  },
  watch: {
    accessLevelId(val) {
      this.getTableData()
    },
  },
}
</script>

<style scoped lang="scss">
.control-contents {
  position: absolute;
  top: 44px;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 0 20px;
  .control-content {
    text-align: right;
  }
  /deep/ .form-submit {
    top: 40px;
  }
  .access-control-table {
    position: absolute !important;
    top: 0px;
    left: 0;
    bottom: 0px;
    right: 0;
    height: auto;
    /deep/ .el-table {
      height: 100%;
      .el-table__body-wrapper {
        position: absolute;
        top: 41px;
        bottom: 0;
        left: 0px;
        right: 0px;
        overflow-y: auto;
      }
    }
  }
}
.pagination-panel {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 50px;
  text-align: right;
  border-top: 1px solid var(--border-color-lighter);
  box-shadow: 0 -5px 14px -8px rgba(0, 0, 0, 0.2);
  padding: 0 20px;
  background-color: #fff;
  /deep/ .el-pagination {
    display: inline-block;
    padding-top: 10px;
  }
}
</style>
