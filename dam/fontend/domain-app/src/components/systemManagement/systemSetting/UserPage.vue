<template>
  <div class="tab-page">
    <datablau-dialog
      :visible.sync="dialogVisible"
      append-to-body
      :close-on-click-modal="false"
      :title="dialogTitle"
      size="m"
    >
      <edit-user-page
        :key="dialogVisible"
        :pre-data="preData"
        @save="handleSave"
        @close="handleClose"
      ></edit-user-page>
    </datablau-dialog>
    <div class="filter-row">
      <div class="row-inner">
        <datablau-input
          :iconfont-state="true"
          style="width: 240px"
          v-model="keyword"
          :placeholder="$t('system.systemSetting.placeholder')"
          clearable
        ></datablau-input>
      </div>
      <div class="page-btn-group right-top" style="margin-top: 10px">
        <datablau-button
          size="mini"
          type="important"
          @click="addPage"
          style="width: 98px"
          class="iconfont icon-tianjia tab-tianjia-btn"
        >
          {{ $t('system.systemSetting.add') }}
        </datablau-button>
      </div>
    </div>
    <datablau-form-submit style="margin-top: 54px">
      <datablau-table
        class="datablau-table"
        :show-column-selection="false"
        :data="tableData"
        height="100%"
      >
        <el-table-column label="#" width="100">
          <template slot-scope="scope">{{ scope.$index + 1 }}</template>
        </el-table-column>
        <el-table-column
          :label="$t('system.systemSetting.enName')"
          prop="enName"
        ></el-table-column>
        <el-table-column
          :label="$t('system.systemSetting.cnName')"
          prop="chName"
        ></el-table-column>
        <el-table-column
          :label="$t('system.systemSetting.dir')"
          :width="400"
          prop="menuLevel1"
          :formatter="menuLevel1Formatter"
        ></el-table-column>
        <el-table-column
          :label="$t('system.systemSetting.operation')"
          fixed="right"
          header-align="center"
          align="center"
          :width="110"
        >
          <template slot-scope="scope">
            <datablau-button
              type="text"
              size="small"
              @click="handleModify(scope.row)"
            >
              <datablau-tooltip
                effect="dark"
                :content="$t('common.button.modify')"
                placement="bottom"
                style="margin-right: 6px"
              >
                <i class="iconfont icon-revise"></i>
              </datablau-tooltip>
              <!-- 修改 -->
            </datablau-button>
            <datablau-button
              type="text"
              size="small"
              @click="handleDelete(scope.row)"
              style="margin-left: 0"
            >
              <datablau-tooltip
                effect="dark"
                :content="$t('common.button.delete')"
                placement="bottom"
                style="margin-right: 6px"
              >
                <i class="iconfont icon-delete"></i>
              </datablau-tooltip>
              <!-- 删除 -->
            </datablau-button>
          </template>
        </el-table-column>
      </datablau-table>
      <!-- 下面翻页的内容 -->
      <template slot="buttons">
        <datablau-pagination
          class="page"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="currentPage"
          :page-sizes="[20, 50, 100]"
          :page-size="pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
        ></datablau-pagination>
      </template>
    </datablau-form-submit>
    <!-- <div class="table-row">
    </div> -->
    <!-- <div class="footer-row"> -->
    <!--<el-button
        icon="el-icon-delete"
        type="danger"
        size="small"
        @click="preDeleteRows"
        :disabled="deleteRulesDisabled"
      >{{$t('common.button.delete')}}</el-button>-->

    <!-- </div> -->
  </div>
</template>

<script>
import UserPage from '@/next/class/UserPage'
import UserPageService from '@service/userPage/UserPageService'
import EditUserPage from '@/components/systemManagement/systemSetting/EditUserPage'
export default {
  data() {
    return {
      keyword: '',
      total: 0,
      pageSize: 20,
      currentPage: 1,
      fullData: null,
      dialogVisible: false,
      userPageService: null,
      currentEditIndex: -1,
      preData: null,
    }
  },
  components: {
    EditUserPage,
  },
  mounted() {
    this.initData()
  },
  methods: {
    initData() {
      const userPageService = new UserPageService(this)
      // userPageService.clearPages()
      this.userPageService = userPageService
      userPageService.getUserPages().then(response => {
        this.total = response.length
        this.fullData = response
      })
    },
    handleSizeChange() {},
    handleCurrentChange() {},
    preDeleteRows() {},
    addPage() {
      this.currentEditIndex = -1
      this.preData = null
      this.dialogVisible = true
    },
    handleClose() {
      this.dialogVisible = false
    },
    handleSave(dto) {
      if (this.currentEditIndex === -1) {
        const userPage = new UserPage(
          dto.enName,
          dto.chName,
          dto.menuLevel1,
          dto.pageType,
          dto.iframeSrc
        )
        this.userPageService.addUserPage(userPage)
        this.total++
      } else {
        this.userPageService.setUserPage(dto)
      }
      this.fullData = UserPageService.userPages
    },
    handleModify(dto) {
      this.currentEditIndex = 0
      this.preData = dto
      this.dialogVisible = true
    },
    handleDelete(dto) {
      this.$DatablauCofirm(
        this.$t('system.systemSetting.removeConfirm', { page: dto.chName }),
        this.$t('system.systemSetting.tips'),
        {
          type: 'warning',
          cancelButtonText: this.$t('common.button.cancel'),
          confirmButtonText: this.$t('common.button.ok'),
        }
      )
        .then(() => {
          this.userPageService.removeUserPage(dto.id)
          this.fullData = UserPageService.userPages
        })
        .catch(() => {})
    },
    menuLevel1Formatter(row) {
      if (Array.isArray(row.menuLevel1)) {
        return row.menuLevel1
          .map((e, i) =>
            i === 0
              ? this.$t('common.pageGroup.' + e)
              : this.$t('common.page.' + e)
          )
          .join('/')
      } else {
        return ''
      }
    },
  },
  computed: {
    deleteRulesDisabled() {
      return false
    },
    tableData() {
      if (Array.isArray(this.fullData)) {
        if (this.fullData.length) {
          return this.fullData
            .slice(
              (this.currentPage - 1) * this.pageSize,
              this.currentPage * this.pageSize
            )
            .filter(item => {
              return this.$MatchKeyword(item, this.keyword, 'chName', 'enName')
            })
        } else {
          return []
        }
      } else {
        return null
      }
    },
    dialogTitle() {
      if (this.preData) {
        return this.$t('system.systemSetting.editCustomPage')
      } else {
        return this.$t('system.systemSetting.createPage')
      }
    },
  },
}
</script>

<style scoped lang="scss">
.filter-row .row-inner {
  margin-top: 10px;
  height: 34px;
  line-height: 34px;
}
.filter-row {
  // height: 50px;
}
.table-row {
  position: absolute;
  top: 54px;
  bottom: 50px;
  left: 20px;
  right: 20px;
  margin-top: 0;
  border-bottom: none;
}
.footer-row {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 50px;
  // border-top: 1px solid var(--border-color-lighter);
  box-shadow: 0 -5px 14px -8px rgba(0, 0, 0, 0.2);
  .page {
    position: absolute;
    right: 20px;
    bottom: 10px;
  }
}
/deep/ .el-form-item__label {
  line-height: 34px;
  height: 34px;
}
</style>
