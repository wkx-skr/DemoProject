<template>
  <!-- 信息项 -->
  <div class="safety-standard-com">
    <!-- 删除结果提示 -->
    <datablau-dialog
      title="提示"
      size="s"
      :visible.sync="showTip"
      v-if="showTip"
    >
      <div class="tip-content">
        <div class="item">
          <template>
            <div class="title">
              <i class="el-icon-success success-icon"></i>
              成功删除：{{ successNum }}条
            </div>
            <div class="title">
              <i class="el-icon-error fail-icon"></i>
              失败删除：{{ tipList.length }}条
              <span class="span-error-tip">
                （信息项有相关联的识别规则处于运行中，不允许删除）
              </span>
              <div
                class="copy"
                v-copy="tipList.map(item => item.name).join('；')"
              >
                复制
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
          关闭
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
            placeholder="搜索信息项名称"
          ></datablau-input>
          <datablau-button type="normal" @click="searchInfo()">
            查询
          </datablau-button>
          <template slot="buttons" v-if="hasInfo && hasManageAuth">
            <datablau-button
              type="important"
              @click="addInfoItem"
              class="iconfont icon-tianjia"
            >
              添加分类信息项
            </datablau-button>
          </template>
        </datablau-list-search>
      </div>
      <div class="table-box">
        <datablau-form-submit>
          <datablau-table
            :data-selectable="false"
            :show-column-selection="false"
            height="100%"
            :default-sort="{ prop: 'createTime', order: form.sort }"
            ref="dsTable"
            @selection-change="handleSelectionChange"
            @sort-change="sortChange"
            :data="tableData"
          >
            <el-table-column
              v-if="hasManageAuth"
              type="selection"
              width="20"
              :selectable="row => !row.bind"
            >
              <!-- <datablau-tooltip
                  effect="dark"
                  content="信息项有相关联的识别规则处于运行中，不允许删除"
                  placement="top"
                ></datablau-tooltip> -->
            </el-table-column>
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
              :label="'信息项名称'"
              prop="name"
              :min-width="minScreen ? 100 : 150"
              show-overflow-tooltip
            >
              <template slot-scope="scope">
                {{ getName(scope.row) }}
              </template>
            </el-table-column>
            <el-table-column
              :min-width="minScreen ? 100 : 180"
              :label="'信息项编码'"
              prop="stdCode"
              show-overflow-tooltip
            ></el-table-column>
            <el-table-column
              :width="minScreen ? 120 : 180"
              :label="'业务定义'"
              show-overflow-tooltip
              prop="businessDepartment"
            ></el-table-column>
            <el-table-column
              :label="'所在分类信息项目录'"
              prop="catalogPathName"
              show-overflow-tooltip
              :min-width="minScreen ? 150 : 250"
            ></el-table-column>
            <el-table-column
              :label="'创建时间'"
              prop="createTime"
              sortable="custom"
              :min-width="140"
              :formatter="$timeFormatter"
              show-overflow-tooltip
            ></el-table-column>
            <el-table-column
              :label="'操作'"
              :width="100"
              align="center"
              fixed="right"
              prop="operation"
            >
              <template slot-scope="scope">
                <datablau-button
                  type="icon"
                  :tooltip-content="'查看'"
                  class="iconfont icon-see"
                  @click="toDetail(scope.row)"
                ></datablau-button>
                <datablau-button
                  v-if="hasManageAuth"
                  type="icon"
                  :disabled="scope.row.bind"
                  :tooltip-content="
                    scope.row.bind
                      ? '信息项有相关联的识别规则处于运行中，不允许删除！'
                      : '删除'
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
                <span v-if="selections.length > 0" class="check-info"></span>
                <span v-if="selections.length > 0" class="footer-row-info">
                  当前选中“{{ selections.length }}条”信息，是否
                </span>
                <datablau-button
                  v-if="selections.length > 0"
                  type="danger"
                  class="el-icon-delete"
                  @click="handleDelete"
                >
                  删除
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
export default {
  props: {
    hasManageAuth: Boolean,
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
      tableData: null,
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
          this.hasInfo = typeList.some(item => item === 'INFO_OBJECT')
        }
        this.getList()
      },
      immediate: true,
    },
  },
  mounted() {},
  methods: {
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
    delInfoItem(isSingle = true, data) {
      let confirmTip = ''
      if (isSingle) {
        confirmTip = '确认要删除吗？'
      } else {
        confirmTip = `已选择“${data.idList.length}条”数据，确认要删除吗？`
      }
      this.$DatablauCofirm(confirmTip, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(() => {
          const params = {
            id: data.id, // 所在目录id
            data: data.idList,
          }
          API.cancelBindInfoItem(params)
            .then(res => {
              if (res.data.data && res.data.data.length > 0) {
                let message = ''
                if (isSingle) {
                  message = `信息项有相关联的识别规则处于运行中，不允许删除！`
                  this.$blauShowFailure(message)
                } else {
                  this.showTip = true
                  this.tipList = res.data.data
                  this.successNum = data.idList.length - this.tipList.length
                  // message = `信息项有相关联的识别规则处于运行中，不允许删除！关联信息项被识别规则引用的是：信息项名称“${res.data.data
                  //   .map(item => item.name)
                  //   .join(',')}”`
                }
              } else {
                this.$blauShowSuccess('删除成功')
              }
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
      // if (this.form.sort) {
      //   sort = this.form.sort === 'ascending' ? 'ASC' : 'DESC'
      //   params.orderBy = true
      //   params.seq = sort
      // } else {
      //   params.orderBy = false
      // }
      API.getInfoItemDetail(this.heightCatalog.id, params)
        .then(res => {
          this.total = res.data.totalItems
          this.tableData = res.data.content || []
        })
        .catch(e => {
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
      }
      this.delInfoItem(true, params)
    },
    handleDelete() {
      let idList = []
      let catalogIdList = []
      this.selections.map(item => {
        idList.push(item.refId)
        catalogIdList.push(item.securityCatalogId)
      })
      const newList = [...new Set(catalogIdList)]
      if (newList.length > 1) {
        this.$datablauMessage({
          message: '只能选择同一个目录下的信息项进行删除',
          type: 'info',
        })
        return
      }
      const params = {
        id: this.selections[0].securityCatalogId,
        idList,
      }
      this.delInfoItem(false, params)
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

      .check-info {
        width: 14px;
        height: 14px;
        display: inline-block;
        background: $primary-color;
        margin-right: -13px;
        vertical-align: middle;
      }

      .footer-row-info {
        height: 50px;
        margin-right: 10px;
        &:before {
          content: '\e6da';
          font-family: 'element-icons';
          font-size: 12px;
          font-weight: 200;
          margin-right: 5px;
          vertical-align: middle;
          line-height: 13px;
          color: white;
        }
      }
      .page {
        float: right;
      }
    }
  }
}
</style>
