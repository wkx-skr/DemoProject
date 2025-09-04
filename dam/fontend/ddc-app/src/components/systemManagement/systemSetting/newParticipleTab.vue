<template>
  <div class="new-participle-tab">
    <datablau-dialog
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      :close-on-click-modal="false"
      append-to-body
      size="m"
    >
      <!-- <span class="fake-label">分词词库</span> -->
      <div class="new-participle-tooltip">
        <el-tooltip effect="dark" placement="left">
          <div slot="content">
            {{ $t('system.systemSetting.pplSplitTips') }}
            <br />
            {{ $t('system.systemSetting.price') }}
            <br />
            {{ $t('system.systemSetting.value') }}
          </div>
          <i class="iconfont icon-tips" style="margin-left: 0px"></i>
        </el-tooltip>

        <span class="fake-label">
          {{ $t('system.systemSetting.pplSplit') }}
        </span>
      </div>
      <datablau-form label-width="0px">
        <el-form-item>
          <datablau-input
            v-model="names"
            type="textarea"
            :placeholder="placeholder"
            :autosize="{ minRows: 8, maxRows: 10 }"
            style="width: 100%"
            class="new-participle-textarea"
          ></datablau-input>
        </el-form-item>
      </datablau-form>
      <div
        slot="footer"
        class="synonyms-dialog-footer"
        style="text-align: right"
      >
        <span style="position: absolute; left: 20px; color: #555; bottom: 28px">
          {{ $t('system.systemSetting.nameLen', { num: namesLength }) }}
        </span>
        <datablau-button style="" @click="closeDialog" type="secondary">
          {{ $t('common.button.cancel') }}
        </datablau-button>
        <datablau-button
          type="important"
          @click="submitDialog"
          :disabled="namesLength === 0"
        >
          {{ $t('common.button.ok') }}
        </datablau-button>
      </div>
    </datablau-dialog>
    <datablau-filter-row class="tab-header">
      <div class="row-inner">
        <datablau-input
          clearable
          v-model="keyword"
          class="tab-input"
          :iconfont-state="true"
          :placeholder="$t('system.systemSetting.pplPlaceholder')"
        ></datablau-input>
        <datablau-button
          type="important"
          @click="addItem"
          class="iconfont icon-tianjia tab-tianjia-btn"
        >
          {{ $t('system.systemSetting.addPpl') }}
        </datablau-button>
      </div>
    </datablau-filter-row>
    <datablau-form-submit style="margin-top: 54px">
      <datablau-table
        :data="dataDisplay"
        class="datablau-table"
        ref="multipleTable"
        height="100%"
        style="position: absolute; top: 0; left: 0; right: 0; bottom: 0"
        @selection-change="handleSelectionChange"
        data-selectable
      >
        <!--        <el-table-column type="selection" :width="50"></el-table-column>-->
        <el-table-column
          :label="$t('system.systemSetting.pplDir')"
          prop="dictContent"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          :label="$t('system.systemSetting.recentTime')"
          prop="updateTime"
          :formatter="$timeFormatter"
          :width="200"
        ></el-table-column>
        <el-table-column
          :label="$t('system.systemSetting.operator')"
          prop="operator"
          :width="150"
        ></el-table-column>
        <el-table-column
          :label="$t('system.systemSetting.operation')"
          fixed="right"
          :width="120"
          header-align="center"
          align="center"
        >
          <template slot-scope="scope">
            <datablau-button type="text" @click="edit(scope.row)">
              <datablau-tooltip
                effect="dark"
                :content="$t('common.button.edit')"
                placement="bottom"
                style="margin-right: 6px"
              >
                <i class="iconfont icon-bianji"></i>
              </datablau-tooltip>
              <!-- 编辑 -->
            </datablau-button>
            <datablau-button
              type="text"
              @click="preDeleteRows(scope.row.id)"
              class="new-table-delete"
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
        <div class="new-row-page-footer" v-show="!deleteRulesDisabled">
          <span class="check-info"></span>
          <span class="footer-span">
            {{
              $t('system.systemSetting.selLen', {
                num: multipleSelection.length,
              })
            }}
          </span>
          <datablau-button
            type="danger"
            size="small"
            class="iconfont icon-delete"
            @click="preDeleteRows(false)"
          >
            {{ $t('common.button.delete') }}
          </datablau-button>
        </div>
        <datablau-pagination
          class="row-pagination"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="currentPage"
          :page-sizes="[20, 50, 100]"
          :page-size="pageSize"
          layout="total, sizes, prev, jumper, next"
          :total="total"
        ></datablau-pagination>
      </template>
    </datablau-form-submit>
    <!-- <div  class="table-row tab-table">

    </div> -->
    <!-- <div class="footer-row"> -->
    <!-- <datablau-button
        icon="el-icon-delete"
        type="normal"
        @click="preDeleteRows(false)"
        :disabled="deleteRulesDisabled"
      >
        {{ $t('common.button.delete') }}
      </datablau-button> -->

    <!-- </div> -->
  </div>
</template>
<script>
export default {
  data() {
    return {
      keyword: '',
      keywordTimeout: null,
      dataLoading: false,
      dataDisplay: null,
      pageSize: 20,
      total: 0,
      currentPage: 1,
      dialogVisible: false,
      placeholder: this.$t('system.systemSetting.pplSplitPlaceholder'),
      names: '',
      id: null,
      multipleSelection: [],
    }
  },
  methods: {
    getikdictList() {
      this.dataLoading = true
      this.$http
        .get(
          this.$url +
            `/service/ikdict/page/${this.currentPage - 1}/${
              this.pageSize
            }?keyword=${this.keyword}`
        )
        .then(res => {
          this.dataDisplay = res.data.content
          this.total = res.data.totalItems
        })
        .catch(e => {
          this.$showFailure(e)
        })
        .then(() => {
          this.dataLoading = false
        })
    },
    addItem() {
      this.id = null
      this.names = ''
      this.dialogVisible = true
    },
    handleSelectionChange(val) {
      this.multipleSelection = val
    },
    handleSizeChange(size) {
      this.pageSize = size
      this.currentPage = 1
      this.getikdictList()
    },
    handleCurrentChange(current) {
      this.currentPage = current
      this.getikdictList()
    },
    preDeleteRows(id) {
      const ids = id ? [id] : this.multipleSelection.map(i => i.id)
      this.$DatablauCofirm(
        this.$t('system.systemSetting.dePplConfirm'),
        this.$t('system.systemSetting.tips'),
        {
          type: 'warning',
          cancelButtonText: this.$t('common.button.cancel'),
          confirmButtonText: this.$t('common.button.ok'),
        }
      )
        .then(() => {
          this.$http
            .post(this.$url + `/service/ikdict/delete/item`, ids)
            .then(() => {
              if (
                this.currentPage > 1 &&
                (this.currentPage - 1) * this.pageSize ===
                  this.total - ids.length
              ) {
                this.currentPage--
              }
              this.getikdictList()
            })
            .catch(e => {
              this.$showFailure(e)
            })
        })
        .catch(() => {
          this.$message.info(this.$t('system.systemSetting.operationCancelled'))
        })
    },
    submitDialog() {
      this.$http
        .post(this.$url + `/service/ikdict/update/item`, {
          dictContent: this.names
            .replace(/\n/g, ',')
            .split(',')
            .filter(i => i)
            .join(','),
          id: this.id,
        })
        .then(res => {
          this.getikdictList()
        })
        .catch(e => {
          this.$showFailure(e)
        })
        .then(() => {
          this.closeDialog()
        })
    },
    closeDialog() {
      this.dialogVisible = false
    },
    edit({ id, dictContent }) {
      this.id = id
      this.names = dictContent.replace(/,/g, '\n')
      this.dialogVisible = true
    },
  },
  computed: {
    deleteRulesDisabled() {
      return !this.multipleSelection || this.multipleSelection.length === 0
    },
    dialogTitle() {
      if (this.id) {
        return this.$t('system.systemSetting.editPpl')
      } else {
        return this.$t('system.systemSetting.addPpl')
      }
    },
    namesLength() {
      if (!this.names) {
        return 0
      } else {
        return this.names
          .replace(/\n/g, ',')
          .split(',')
          .filter(i => i).length
      }
    },
  },
  watch: {
    keyword() {
      this.dataLoading = true
      clearTimeout(this.keywordTimeout)
      this.keywordTimeout = setTimeout(() => {
        this.currentPage = 1
        this.getikdictList()
      }, 1000)
    },
  },
}
</script>
<style lang="scss" scoped>
$primary-color: #409eff;
.new-participle-tab {
  .tab-header {
    position: absolute;
    top: 10px;
    left: 0;
    right: 0;
    margin-bottom: 10px;
    .tab-input {
      width: 250px;
      display: inline-block;
    }
    .tab-tianjia-btn {
      position: absolute;
      right: 20px;
    }
  }
  .tab-table {
    position: absolute;
    margin-top: 0;
    top: 54px;
    left: 20px;
    right: 20px;
    bottom: 50px;
  }
}
// .fake-label {
//   font-size: 12px;
//   &::before {
//     content: '*';
//     color: #f56c6c;
//     margin-right: 4px;
//   }
// }
.new-row-page-footer {
  position: absolute;
  top: 50%;
  -webkit-transform: translateY(-50%);
  transform: translateY(-50%);
  left: 20px;
  margin: 0 !important;

  .check-info {
    display: inline-block;
    width: 14px;
    height: 14px;
    margin-right: -13px;
    vertical-align: middle;
    background: $primary-color;
  }

  .footer-span {
    margin-right: 10px;
    color: rgba(85, 85, 85, 1);

    &::before {
      margin-right: 5px;
      font-family: 'element-icons';
      font-size: 12px;
      font-weight: 200;
      line-height: 14px;
      color: white;
      vertical-align: middle;
      content: '\e6da';
    }
  }
}
.new-participle-textarea {
  /deep/ .el-textarea__inner {
    height: 160px !important;
  }
}
.new-participle-tooltip {
  margin-bottom: 5px;
  .fake-label {
    font-size: 12px;
    margin-left: 5px;
    height: 12px;
    color: #555;
  }
}
/deep/ .new-table-delete,
.is-block.text + .is-block.text,
.is-block.icon + .is-block.icon {
  margin-left: 0px !important;
}
</style>
