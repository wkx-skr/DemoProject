<template>
  <div class="my-userinfo">
    <datablau-dialog
      title="添加用户"
      :visible.sync="showApplyDetail"
      append-to-body
      width="750px"
    >
      <apply-info
        modeType="addUser"
        @cancelApply="cancelApply"
        @applySuccess="applySuccess"
        :applyDetail="detailData"
        v-if="showApplyDetail"
      ></apply-info>
    </datablau-dialog>
    <el-form
      class="st-page-form"
      id="standardListForm"
      label-position="right"
      label-width="100px"
      ref="searchForm"
      :inline="inlineInfo"
      :model="searchFormData"
      style="margin-top: 5px"
    >
      <el-form-item>
        <datablau-input
          placeholder="创建人"
          maxlength="50"
          style="width: 240px"
          :iconfont-state="true"
          class="select-style"
          filterable
          clearable
          size="mini"
          v-model="searchFormData.creator"
        ></datablau-input>
      </el-form-item>
      <el-form-item v-if="canAdd">
        <!-- <datablau-button size="mini" type="primary" @click="handleCurrentChange(1)">查询</datablau-button> -->
        <datablau-button
          class="iconfont icon-tianjia"
          size="mini"
          type="important"
          @click="showAdd"
        >
          新增用户
        </datablau-button>
      </el-form-item>
    </el-form>
    <div class="list-info">
      <datablau-table
        class="datablau-table"
        height="100%"
        ref="domainTable"
        :data="tableData"
        v-loading="tableLoading"
      >
        <el-table-column
          label="创建人"
          min-width="60"
          prop="userName"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          label="访问名称"
          prop="accessName"
          min-width="60"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          label="所属部门"
          prop="userDepartment"
          min-width="60"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          label="加入时间"
          prop="latelyTime"
          min-width="60"
          show-overflow-tooltip
        >
          <template slot-scope="scope">
            <span>
              {{ new Date(scope.row.beginDate).toLocaleDateString() }}
            </span>
          </template>
          >
        </el-table-column>
        <el-table-column label="操作" min-width="100" show-overflow-tooltip>
          <template slot-scope="scope">
            <datablau-button
              @click="removeItem(scope.row)"
              type="icon"
              :title="$t('common.button.delete')"
              class="iconfont icon-delete"
            ></datablau-button>
          </template>
        </el-table-column>
      </datablau-table>
    </div>
    <div class="bottom-info">
      <datablau-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page.sync="currentPage"
        :page-sizes="[20, 50, 100]"
        :page-size="pageSize"
        :pager-count="5"
        layout="total, sizes, prev, pager, next, jumper"
        :total="totalShow"
      ></datablau-pagination>
    </div>
  </div>
</template>

<script>
import HTTP from '../ddsHTTP.js'
import applyInfo from './applyInfo.vue'
export default {
  components: { applyInfo },
  props: ['detailData'],
  data() {
    return {
      tableData: [],
      tableLoading: false,
      showApplyDetail: false,
      inlineInfo: true,
      searchFormData: {
        creator: '',
      },
      canAdd: false,
      pageSize: 20,
      currentPage: 1,
      totalShow: 0,
      columnDefs: null,
      hideTopLine: false,
      hideDefaultFilter: true,
      defaultParaData: null,
      tableOption: {
        rowSelection: 'single',
      },
      allData: null,
    }
  },
  computed: {},
  beforeMount() {},
  mounted() {
    if (this.detailData.status === 1) {
      // 启用状态下才可以新增用户
      this.canAdd = true
    }
  },
  methods: {
    handleSizeChange(val) {
      this.pageSize = val
      this.handleCurrentChange(1)
    },
    handleCurrentChange(val) {
      this.currentPage = val
      this.getShowData()
    },
    showAdd() {
      this.showApplyDetail = true
    },
    cancelApply() {
      this.showApplyDetail = false
    },
    applySuccess() {
      this.showApplyDetail = false
      this.refreshData()
    },
    removeItem(data) {
      this.$confirm('是否确认移除？', '提示', {
        type: 'warning',
      })
        .then(() => {
          return new Promise((resolve, reject) => {
            const newPromise = HTTP.deleteManageUser(data.authId)
            newPromise
              .then(() => {
                this.$showSuccess('移除成功')
                this.refreshData()
              })
              .catch(e => {
                this.$showFailure(e)
              })
          })
        })
        .catch(() => {})
    },
    getShowData(para) {
      this.tableLoading = true
      return new Promise((resolve, reject) => {
        const obj = {
          authUser: this.searchFormData.creator,
          appId: this.detailData.id,
          currentPage: this.currentPage,
          pageSize: this.pageSize,
        }

        const newPromise = HTTP.getManageOwner(obj)
        newPromise
          .then(res => {
            this.tableLoading = false
            this.tableData = res.data.content
            this.totalShow = res.data.totalItems
            resolve(res.data.content)
          })
          .catch(e => {
            this.tableLoading = false
            reject(e)
          })
      })
    },
    refreshData() {
      this.getShowData()
    },
  },
  watch: {
    'searchFormData.creator': {
      handler() {
        this.handleCurrentChange(1)
      },
    },
    detailData: {
      handler(val) {
        this.getShowData()
        if (val.status === 1) {
          // 启用状态下才可以新增用户
          this.canAdd = true
        } else {
          this.canAdd = false
        }
      },
    },
  },
}
</script>

<style lang="scss" scoped>
.my-userinfo {
  position: absolute;
  top: 10px;
  right: 20px;
  bottom: 0;
  left: 20px;
  overflow: auto;

  .list-info {
    position: absolute;
    top: 58px;
    left: 0;
    right: 0;
    width: 100%;
    bottom: 50px;
  }

  .bottom-info {
    position: fixed;
    left: 157px;
    height: 50px;
    bottom: 0;
    width: 100%;
    border-top: 1px solid var(--border-color-lighter);
    box-shadow: 0 -5px 14px -8px rgba(0, 0, 0, 0.2);
    .datablau-pagination {
      float: right;
      margin-top: 9px;
      margin-right: 177px;
    }
  }
}
</style>
