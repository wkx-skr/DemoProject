<template>
  <div class="white-list-wrapper" v-loading="loading">
    <datablau-dialog
      title="包含字段"
      :visible.sync="dialogVisible"
      v-if="dialogVisible"
      size="l"
    >
      <div>
        <datablau-table :data="columnTable">
          <el-table-column
            prop="physicalName"
            label="字段名"
            :min-width="100"
            show-overflow-tooltip
          >
            <template slot-scope="scope">
              <div
                style="line-height: 32px; display: inline-block"
                v-if="scope.row.type"
              >
                <span
                  v-html="iconHtmlFormat(dataTypeFormatter(scope.row))"
                ></span>
              </div>
              {{ scope.row.physicalName }}
            </template>
          </el-table-column>
          <el-table-column
            :min-width="150"
            prop="chineseName"
            label="中文名"
            show-overflow-tooltip
          >
            <template slot-scope="scope">
              <span>
                {{ scope.row.chineseName ? scope.row.chineseName : '-' }}
              </span>
            </template>
          </el-table-column>
          <el-table-column
            prop="assetsLevel.name"
            label="数据安全等级"
            width="120"
          >
            <template slot-scope="scope">
              <span>{{ getName(scope.row) }}</span>
            </template>
          </el-table-column>
        </datablau-table>
      </div>
      <span slot="footer">
        <datablau-button type="important" @click="dialogVisible = false">
          关 闭
        </datablau-button>
      </span>
    </datablau-dialog>
    <datablau-dialog
      title="数据权限申请流程结果"
      :visible.sync="showApplyDetails"
      width="960px"
    >
      <div class="dialog-outer">
        <apply-detail
          v-if="showApplyDetails"
          :applyDetailData="applyDetailData"
          my-done
        ></apply-detail>
      </div>
    </datablau-dialog>
    <div class="page-title-row">
      <span class="menu font-medium">白名单</span>
    </div>
    <div class="search-wrapper list-search-content">
      <datablau-input
        clearable
        placeholder="请输入资产名称"
        :iconfont-state="true"
        v-model="keyword"
      ></datablau-input>
      <el-checkbox-group
        v-model="itemType"
        @change="changeType"
        style="display: inline-block; margin-left: 20px"
      >
        <el-checkbox :label="LDMTypes.Entity">表</el-checkbox>
        <el-checkbox :label="LDMTypes.View">视图</el-checkbox>
      </el-checkbox-group>
      <!--<el-button style="padding: 0 2em;margin-left: 20px" type="primary" @click="resetFilter">重置</el-button>-->
      <!--<el-select size="small" style="margin-left: 20px;width: 150px;" v-model="code" @change="changAccessLevel" placeholder="请选择">
        <el-option label="安全等级" :value="-1"></el-option>
        <el-option
          v-for="item in levelOption"
          :key="item.id"
          :label="item.name"
          :value="item.code">
        </el-option>
      </el-select>-->
    </div>
    <datablau-form-submit>
      <datablau-table
        :show-column-selection="false"
        class="table-wrapper"
        :data="tableData"
        style="position: absolute"
      >
        <el-table-column width="50" label="序号">
          <template slot-scope="scope">
            {{ scope.$index + 1 + pageSize * (currentPage - 1) }}
          </template>
        </el-table-column>
        <el-table-column
          show-overflow-tooltip
          :min-width="120"
          prop="itemName"
          label="资产名称"
        >
          <template slot-scope="scope">
            <div
              @click="toDetail(scope.row)"
              style="color: #409eff; cursor: pointer"
            >
              {{ scope.row.itemName
              }}{{
                scope.row.item && scope.row.item.logicalName
                  ? '(' + scope.row.item.logicalName + ')'
                  : ''
              }}
            </div>
          </template>
        </el-table-column>
        <el-table-column show-overflow-tooltip width="200" label="数据源">
          <template slot-scope="scope">
            <span>
              {{
                scope.row.item &&
                scope.row.item.modelName +
                  ':' +
                  scope.row.item.modelCategoryName
              }}
            </span>
          </template>
        </el-table-column>
        <el-table-column :min-width="80" label="资产类型">
          <template slot-scope="scope">
            <div
              v-if="scope.row.itemType === 80000004"
              class="meta-data surface"
            >
              表
            </div>
            <div v-if="scope.row.itemType === 80500008" class="meta-data view">
              视图
            </div>
            <div
              v-if="scope.row.itemType === 82800003"
              class="meta-data domain"
            >
              指标
            </div>
            <div
              v-if="scope.row.itemType === 82800002"
              class="meta-data report"
            >
              报表
            </div>
          </template>
        </el-table-column>
        <el-table-column
          width="100"
          show-overflow-tooltip
          prop="assetsLevel.name"
          label="安全等级"
        ></el-table-column>
        <el-table-column
          :min-width="100"
          show-overflow-tooltip
          prop="userChineseName"
          label="申请人"
        >
          <template slot-scope="scope">
            <span>{{ scope.row.userChineseName }}</span>
          </template>
        </el-table-column>
        <el-table-column
          show-overflow-tooltip
          width="100"
          prop="orgFullName"
          label="部门"
        ></el-table-column>
        <el-table-column :min-width="80" label="相关字段">
          <template slot-scope="scope">
            <a
              style="cursor: pointer; color: #4386f5"
              @click="
                getColumns(
                  scope.row.itemId,
                  scope.row.itemType,
                  scope.row.columnCount,
                  scope.row.applyId
                )
              "
            >
              {{ scope.row.columnCount }}个
            </a>
          </template>
        </el-table-column>
        <el-table-column
          :min-width="100"
          show-overflow-tooltip
          label="生效时间"
        >
          <template slot-scope="scope">
            <span>{{ moment(scope.row.createTime).format('YYYY-MM-DD') }}</span>
          </template>
        </el-table-column>
        <el-table-column
          :min-width="100"
          show-overflow-tooltip
          label="失效时间"
        >
          <template slot-scope="scope">
            <span>
              {{
                scope.row.effectiveEndTime
                  ? moment(scope.row.effectiveEndTime).format('YYYY-MM-DD')
                  : '长期有效'
              }}
            </span>
          </template>
        </el-table-column>
        <el-table-column width="100" label="当前状态">
          <template slot-scope="scope">
            <span
              :style="{
                color:
                  scope.row.state === 'EFFECTIVE'
                    ? 'rgb(92, 183, 147)'
                    : '#999',
              }"
            >
              <i
                class="circle"
                :style="
                  scope.row.state === 'EFFECTIVE'
                    ? 'background: rgb(92, 183, 147)'
                    : ''
                "
              ></i>
              {{ scope.row.state === 'EFFECTIVE' ? '有效' : '失效' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column
          width="100"
          show-overflow-tooltip
          prop="approver"
          label="审批人"
        >
          <template slot-scope="scope">
            {{ scope.row.approver }}
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" :min-width="120">
          <template slot-scope="scope">
            <datablau-tooltip effect="dark" content="查看" placement="bottom">
              <datablau-button
                type="text"
                class="iconfont icon-see"
                style="line-height: 24px"
                @click="viewDetail(scope.row)"
              ></datablau-button>
            </datablau-tooltip>
            <datablau-tooltip effect="dark" content="移除" placement="bottom">
              <datablau-button
                type="text"
                class="iconfont icon-shixiao"
                style="line-height: 24px"
                @click="lose(scope)"
                :disabled="scope.row.state !== 'EFFECTIVE'"
              ></datablau-button>
            </datablau-tooltip>
          </template>
        </el-table-column>
      </datablau-table>
      <template slot="buttons">
        <datablau-pagination
          style="float: right"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page.sync="currentPage"
          :page-sizes="[20, 50, 100]"
          :page-size.sync="pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
        ></datablau-pagination>
      </template>
    </datablau-form-submit>
  </div>
</template>

<script>
import moment from 'moment'
import LDMTypes from '@constant/LDMTypes'
import applyDetail from '@/view/processControl/applyDetail.vue'
export default {
  components: {
    applyDetail,
  },
  data() {
    return {
      LDMTypes: LDMTypes,
      keyword: '',
      code: -1,
      itemType: [LDMTypes.Entity, LDMTypes.View],
      levelOption: [],
      total: 0,
      currentPage: 1,
      pageSize: 20,
      tableData: [],
      timer: null,
      moment,
      loading: true,
      columnTable: [],
      dialogVisible: false,
      removeImg: require('../../../assets/images/icon/remove.svg'),
      showApplyDetails: false,
      applyDetailData: {},
    }
  },
  mounted() {
    // this.getDataAuthLevel()
    this.getWhiteListApplyHistory()
  },
  methods: {
    getName(row) {
      let result = '-'
      if (row.assetsLevel) {
        result = row.assetsLevel.name ? row.assetsLevel.name : '-'
      }
      return result
    },
    toDetail(row) {
      const pos = location.href.indexOf('#/')
      const baseUrl = location.href.slice(0, pos + 2)
      if (row.itemType === 80000004) {
        window.open(baseUrl + `myItem?objectId=${row.itemId}&type=TABLE`)
      }
      if (row.itemType === 80500008) {
        window.open(baseUrl + `myItem?objectId=${row.itemId}&type=VIEW`)
      }
    },
    hide(index) {
      this.$refs['pop' + index].doClose()
    },
    viewDetail(data) {
      this.showApplyDetails = true
      this.applyDetailData = data
      this.applyDetailData.processType = '数据权限申请'
      this.applyDetailData.requestType = 3
    },
    lose(scope) {
      if (scope.row.state !== 'EFFECTIVE') {
        return
      }
      this.$DatablauCofirm(
        `是否确认白名单“${scope.row.itemName}”失效？`,
        '提示',
        {
          type: 'warning',
        }
      ).then(() => {
        this.$http
          .delete(
            this.$url + '/service/auth/whiteList/apply/' + scope.row.applyId
          )
          .then(res => {
            this.$message.success('操作成功！')
            scope.row.state = 'EXPIRE'
          })
          .catch(e => {
            this.$showFailure(e)
          })
      })
    },
    resetFilter() {
      this.itemType = [LDMTypes.Entity, LDMTypes.View]
      this.keyword = ''
    },
    dataTypeFormatter(row) {
      if (!row.type) {
        return ''
      }
      const type = row.type.toLowerCase()
      if (
        type.includes('int') ||
        type.includes('long') ||
        type.includes('number')
      ) {
        return 'number'
      } else if (type.includes('char') || type.includes('text')) {
        return 'string'
      } else if (type.includes('time') || type.includes('date')) {
        return 'time'
      } else {
        return row.type
      }
    },
    iconHtmlFormat(name) {
      let formatedName = ''
      let color = ''
      formatedName = name.slice(0, 3).toUpperCase()
      switch (name) {
        case 'time':
          formatedName = 'TIME'
          color = '#29a7ca'
          break
        case 'number':
          color = '#8c5dff'
          break
        case 'string':
          color = '#f7a789'
          break
        default:
          color = '#aaa'
          break
      }
      return `<span style="
    color: #fff;background:${color};width:34px;height:22px;line-height:22px;text-align:center;border-radius:3px;display:inline-block;margin-right: 5px;">${formatedName}</span>`
    },
    getColumns(id, type, num, applyId) {
      if (num == 0) {
        return
      }
      this.$http
        .post(this.$url + '/service/auth/whiteList/table', {
          itemId: id,
          itemType: type,
          applyId: applyId,
        })
        .then(res => {
          this.columnTable = res.data
          this.dialogVisible = true
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    changeType() {
      this.getWhiteListApplyHistory()
    },
    getDataAuthLevel() {
      this.$http
        .get(this.$url + '/service/auth/assets')
        .then(res => {
          this.levelOption = res.data
          this.levelOption.forEach(level => {
            this.levelIdToNameMap[level.id] = level.name
          })
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    changAccessLevel(assetsCode) {},
    getWhiteListApplyHistory() {
      if (this.timer) {
        clearTimeout(this.timer)
      }
      const param = {
        itemName: this.keyword,
        currentPage: this.currentPage,
        pageSize: this.pageSize,
      }
      if (
        !this.itemType ||
        (Array.isArray(this.itemType) && this.itemType.length === 0)
      ) {
        param.itemTypes = [LDMTypes.Entity, LDMTypes.View]
      } else {
        param.itemTypes = this.itemType
      }
      this.timer = setTimeout(() => {
        this.loading = true
        this.$http
          .post(this.$url + '/service/auth/whiteList/page', param)
          .then(res => {
            const data = res.data
            this.tableData = data.content
            this.tableData.forEach(item => {
              item.visible = false
            })
            this.currentPage = data.currentPage
            this.pageSize = data.pageSize
            this.total = data.totalItems
            this.timer = null
          })
          .catch(e => {
            this.$showFailure(e)
          })
          .finally(() => {
            this.loading = false
          })
      }, 500)
    },
    handleSizeChange() {
      this.getWhiteListApplyHistory()
    },
    handleCurrentChange() {
      this.getWhiteListApplyHistory()
    },
  },
  watch: {
    keyword() {
      this.currentPage = 1
      this.getWhiteListApplyHistory()
    },
  },
}
</script>

<style lang="scss" scoped>
.white-list-wrapper {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  top: 0;
  background: #fff;
  /deep/ .form-submit {
    top: 84px;
  }
  .search-wrapper {
    padding: 0 16px;
  }
  .table-wrapper {
    font-size: 12px;
    position: absolute;
    top: 0px;
    left: 0px;
    right: 0px;
    bottom: 50px;
    /deep/ .el-table {
      height: 100%;
      .el-table__body-wrapper {
        position: absolute;
        top: 41px;
        left: 0;
        right: 0;
        bottom: 0;
        overflow-y: auto;
      }
    }
  }
  .footer-row {
    border-top: 1px solid var(--border-color-lighter);
    box-shadow: 0 -5px 14px -8px rgba(0, 0, 0, 0.2);
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    padding: 0 20px;
    height: 50px;
    z-index: 9;
    background-color: #fff;
    /deep/ .datablau-pagination {
      padding-top: 8px;
    }
  }
}

.el-dialog .el-dialog__body {
  max-height: 500px;
  overflow: auto;
}
.remove-class {
  position: relative;
  // top: 0px;
  box-sizing: border-box;
  width: 20px;
  padding: 3px;
  height: auto;
  background: transparent;
  cursor: pointer;
  &:hover {
    background: #ecf5ff;
  }
  &.disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
}
.circle {
  display: inline-block;
  margin-right: 10px;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  position: relative;
  bottom: 1px;
  background: #999;
}
.el-table::before {
  display: none;
}
/deep/ .el-table--scrollable-x .el-table__body-wrapper {
  overflow: visible;
}
</style>
