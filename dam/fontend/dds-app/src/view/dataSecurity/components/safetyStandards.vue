<template>
  <!-- 信息项 -->
  <div class="safety-standard-com">
    <!-- 删除结果提示 -->
    <datablau-dialog
      :title="$t('securityModule.tip')"
      size="s"
      :visible.sync="showTip"
      v-if="showTip"
    >
      <div class="tip-content">
        <div class="item">
          <template>
            <div class="title">
              <i class="el-icon-success success-icon"></i>
              {{
                $t('securityModule.successNum1', {
                  num: successNum,
                })
              }}
            </div>
            <div class="title">
              <i class="el-icon-error fail-icon"></i>
              {{
                $t('securityModule.failNum1', {
                  num: tipList.length,
                })
              }}
              <span class="span-error-tip">
                {{ $t('accessControl.delTip') }}
              </span>
              <div
                class="copy"
                v-copy="tipList.map(item => item.name).join('；')"
              >
                {{ $t('securityModule.copy') }}
              </div>
            </div>
            <div class="list">
              {{ tipList.map(item => item.name).join(',') }}
            </div>
          </template>
        </div>
      </div>
      <span slot="footer">
        <datablau-button type="secondary" @click="showTip = false">
          {{ $t('securityModule.close') }}
        </datablau-button>
      </span>
    </datablau-dialog>
    <div class="left-info-box" :style="{ right: getWidth + 'px' }">
      <div class="safety-search-box" ref="searchBox">
        <datablau-list-search :noMinWidth="true">
          <datablau-input
            style="width: 200px"
            iconfont-state
            clearable
            type="text"
            v-model="form.keyword"
            @keyup.native.enter="handleSearch"
            :placeholder="$t('accessControl.searchInfoItem')"
          ></datablau-input>
          <datablau-button type="normal" @click="searchInfo">
            {{ $t('securityModule.search') }}
          </datablau-button>
          <template slot="buttons" v-if="hasInfo && hasManageAuth && !isView">
            <datablau-button
              type="important"
              @click="addInfoItem"
              class="iconfont icon-tianjia"
            >
              {{ $t('accessControl.addInfoItem') }}
            </datablau-button>
          </template>
        </datablau-list-search>
      </div>
      <div class="table-box">
        <datablau-form-submit>
          <datablau-table
            v-loading="loading"
            :loading="loading"
            :data-selectable="false"
            :show-column-selection="false"
            height="100%"
            :default-sort="{ prop: 'createTime', order: form.sort }"
            ref="dsTable"
            :row-key="'refId'"
            @selection-change="handleSelectionChange"
            @sort-change="sortChange"
            :data="tableData"
            row-class-name="row-can-click"
            @row-click="toDetail"
          >
            <el-table-column
              :reserve-selection="true"
              v-if="hasManageAuth && !isView"
              type="selection"
              width="20"
              :selectable="row => !row.bind"
            ></el-table-column>
            <el-table-column width="28">
              <template slot-scope="scope">
                <datablau-icon
                  :data-type="'infoitems'"
                  :size="20"
                  :style="{
                    position: 'relative',
                    top: '3px',
                    left: hasManageAuth ? '-3px' : 0,
                  }"
                ></datablau-icon>
              </template>
            </el-table-column>
            <el-table-column
              :label="$t('accessControl.infoName')"
              prop="name"
              :min-width="minScreen ? 100 : 150"
              show-overflow-tooltip
            ></el-table-column>
            <el-table-column
              :min-width="minScreen ? 100 : 180"
              :label="$t('accessControl.infoCode')"
              prop="stdCode"
              show-overflow-tooltip
            ></el-table-column>
            <el-table-column
              :width="minScreen ? 120 : 180"
              :label="$t('securityModule.businessDefinition')"
              show-overflow-tooltip
              prop="businessDepartment"
            >
              <template slot-scope="scope">
                {{ scope.row.businessDepartment || '--' }}
              </template>
            </el-table-column>
            <el-table-column
              :label="$t('accessControl.infoItemCatalog')"
              prop="catalogPathName"
              show-overflow-tooltip
              :min-width="minScreen ? 150 : 250"
            ></el-table-column>
            <el-table-column
              :label="$t('securityModule.creationTime')"
              prop="createTime"
              sortable="custom"
              :min-width="140"
              :formatter="$timeFormatter"
              show-overflow-tooltip
            ></el-table-column>
            <el-table-column
              :label="$t('securityModule.operate')"
              :width="100"
              align="center"
              fixed="right"
              prop="operation"
            >
              <template slot-scope="scope">
                <datablau-button
                  v-if="$auth.DATA_SECURITY_AUTH_STANDARD"
                  type="icon"
                  :tooltip-content="$t('securityModule.view')"
                  class="iconfont icon-see"
                  @click="toDetail(scope.row)"
                ></datablau-button>
                <datablau-button
                  v-if="hasManageAuth && !isView"
                  type="icon"
                  :disabled="scope.row.bind"
                  :tooltip-content="
                    scope.row.bind
                      ? $t('accessControl.delInfoTip')
                      : $t('securityModule.delete')
                  "
                  class="iconfont icon-delete"
                  @click="remove(scope.row)"
                ></datablau-button>
              </template>
            </el-table-column>
          </datablau-table>
          <template slot="buttons">
            <div class="bottom">
              <template>
                <btn-tip :num="selections.length"></btn-tip>
                <datablau-button
                  v-if="selections.length > 0"
                  type="danger"
                  class="el-icon-delete"
                  @click="handleDelete"
                >
                  {{ $t('securityModule.delete') }}
                </datablau-button>
              </template>

              <datablau-pagination
                @current-change="handlePageChange"
                @size-change="handleSizeChange"
                :current-page.sync="form.page"
                :page-sizes="[20, 50, 100, 200]"
                :page-size="form.size"
                layout="total, sizes, prev, pager, next, jumper"
                :total="total"
                class="page"
              ></datablau-pagination>
            </div>
          </template>
        </datablau-form-submit>
      </div>
    </div>
  </div>
</template>

<script>
import API from '../util/api'
import { assetsTypeEnum } from '@/view/dataSecurity/util/attrEnum'
import { delObjMethod } from '@/view/dataSecurity/util/util.js'
export default {
  props: {
    hasManageAuth: Boolean,
    isView: {
      type: Boolean,
      default: false,
    },
    minScreen: {
      type: Boolean,
      default: false,
    },
    heightCatalog: {
      type: Object,
      default() {
        return {}
      },
    },
    highId: {
      type: [String, Number],
      default: '',
    },
    clickChild: {
      type: Function,
    },
    isOpen: {
      type: Boolean,
      default: true,
    },
  },
  computed: {
    getWidth() {
      let w = 360
      if (this.minScreen) {
        w = 70
      } else {
        w = 360
      }
      return w
    },
  },
  data() {
    return {
      loading: false,
      tableData: [],
      selections: [],
      form: {
        page: 1,
        size: 20,
        sort: '',
        keyword: '',
      },
      total: 0,
      showTip: false,
      tipList: [],
      successNum: 0,
      hasInfo: false,
    }
  },
  watch: {
    heightCatalog: {
      handler(val) {
        if (val) {
          const typeList = val.assetsType.split(',')
          this.hasInfo = typeList.includes(assetsTypeEnum.DATA_OBJECT)
        }
        if (this.highId) {
          this.form.page = 1
          this.clearTableList()
          this.getList()
        }
      },
      immediate: true,
      deep: true,
    },
    'form.keyword'(val) {
      if (!val) {
        this.handleSearch()
      }
    },
  },
  mounted() {},
  methods: {
    handleSearch() {
      this.form.page = 1
      this.getList()
    },
    clearTableList() {
      this.$nextTick(() => {
        this.$refs.dsTable.clearSelection()
      })
    },
    getName(row) {
      const result =
        row.name + (row.englishName ? '(' + row.englishName + ')' : '')
      return result
    },
    searchInfo() {
      this.form.page = 1
      this.getList()
    },
    addInfoItem() {
      this.clickChild('addStandard', {
        type: 'add',
        data: this.heightCatalog,
      })
    },
    delInfoItem(data) {
      delObjMethod(data.delParams)
        .then(() => {
          const params = {
            id: data.id, // 所在目录id
            data: data.idList,
          }
          API.cancelBindInfoItem(params)
            .then(res => {
              if (res.data.data && res.data.data.length > 0) {
                let message = ''
                this.$refs.dsTable.clearSelection()
                if (isSingle) {
                  message = this.$t('accessControl.delInfoTip')
                  this.$datablauMessage.error(message)
                } else {
                  this.showTip = true
                  this.tipList = res.data.data
                  this.successNum = data.idList.length - this.tipList.length
                }
              } else {
                this.$refs.dsTable.clearSelection()
                this.$datablauMessage.success(
                  this.$t('securityModule.delSuccess')
                )
              }
              this.form.page = 1
              this.getList()
            })
            .catch(e => {
              this.$showFailure(e)
            })
        })
        .catch(e => {
          console.log(e)
        })
    },
    getList() {
      let sort = ''
      let params = {
        nameLike: this.form.keyword,
        currentPage: this.form.page,
        pageSize: this.form.size,
        orderBy: 'createTime',
        seq: this.form.sort === 'ascending' ? 'ASC' : 'DESC',
      }
      this.loading = true
      API.getInfoItemDetail(this.highId, params)
        .then(res => {
          this.loading = false
          this.total = res.data.totalItems
          this.tableData = res.data.content || []
        })
        .catch(e => {
          this.loading = false
          this.total = 0
          this.tableData = []
          this.$showFailure(e)
        })
    },
    toDetail(options) {
      const pos = location.href.indexOf('#/')
      const baseUrl = location.href.slice(0, pos + 2)
      const url = `main/informationItems?id=${options.itemId}&blank=true`
      window.open(baseUrl + url)
    },
    remove(row) {
      const params = {
        id: row.securityCatalogId,
        idList: [row.refId],
        delParams: {
          this: this,
          objName: this.$t('accessControl.infoItemBrief'),
          type: 'single',
          name: row.name,
        },
      }
      this.delInfoItem(params)
    },
    handleDelete() {
      let idList = []
      let catalogIdList = []
      this.selections.map(item => {
        idList.push(item.refId)
        catalogIdList.push(item.securityCatalogId)
      })
      // 去掉不同目录不允许删除的逻辑
      // const newList = [...new Set(catalogIdList)]
      // if (newList.length > 1) {
      //   this.$datablauMessage({
      //     message: this.$t('accessControl.delInfoTip1'),
      //     type: 'info',
      //   })
      //   return
      // }
      const params = {
        id: this.selections[0].securityCatalogId,
        idList,
        delParams: {
          this: this,
          objName: this.$t('accessControl.infoItemBrief'),
          type: 'multiple',
          num: idList.length,
        },
      }
      this.delInfoItem(params)
    },
    handleSelectionChange(selection) {
      this.selections = selection
    },
    sortChange(data) {
      this.form.sort = data.order
      this.form.page = 1
      this.getList()
    },
    handlePageChange(val) {
      this.form.page = val
      this.getList()
    },
    handleSizeChange(val) {
      this.form.size = val
      this.form.page = 1
      this.getList()
    },
  },
}
</script>

<style scoped lang="scss">
@import '~@/next/components/basic/color.sass';
.tip-content {
  .title {
    line-height: 30px;
    color: #555555;
    font-weight: 600;
    .span-error-tip {
      color: #999;
      font-weight: 400;
    }
    i {
      font-size: 24px;
      vertical-align: middle;
      margin-right: 6px;
      margin-left: 0;
      &.success-icon {
        color: #66bf16;
      }
      &.same-icon {
        color: #e6ad00;
      }
      &.fail-icon {
        color: #ff4b53;
      }
    }
    .copy {
      float: right;
      padding: 0px 10px;
      color: #409eff;
      cursor: pointer;
      font-weight: normal;
      height: 30px;
      line-height: 30px;
    }
  }
  .list {
    margin-bottom: 6px;
    margin-top: 6px;
    height: 120px;
    padding: 8px 10px;
    box-sizing: border-box;
    background: #f5f5f5;
    color: #555555;
    overflow-y: auto;
    p {
      line-height: 24px;
    }
    span {
      // margin-right: 10px;
    }
  }
}
.safety-standard-com {
  .left-info-box {
    position: absolute;
    top: 10px;
    left: 0;
    right: 360px;
    bottom: 0;
    transition: all 0.3s;
    .safety-search-box {
      padding: 0 20px;
    }
    .table-box {
      position: absolute;
      top: 44px;
      left: 0;
      right: 0;
      bottom: 0;
    }
    .bottom {
      box-sizing: border-box;
      padding: 10px 20px 0;
      position: absolute;
      left: 0;
      bottom: 0;
      width: 100%;
      height: 50px;
      .page {
        float: right;
      }
    }
  }
}
</style>
