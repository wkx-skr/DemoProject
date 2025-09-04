<template>
  <div class="table-pop-page">
    <div class="pop-head">
      <div class="icon">
        <datablau-icon
          :data-type="getType(tableInfo.type)"
          :size="24"
        ></datablau-icon>
      </div>
      <div class="right-part">
        <div class="name">
          {{
            tableInfo.tableName +
            (tableInfo.tableAlias ? `(${tableInfo.tableAlias})` : '')
          }}
        </div>
        <div class="describe">
          <lineClamp :row="2" :value="tableInfo.tableDesc"></lineClamp>
        </div>
      </div>
    </div>
    <div class="table-box" :style="{ height: 5 * 40 + 'px' }">
      <datablau-form-submit>
        <datablau-table
          :data="columnList"
          height="100%"
          :show-column-selection="false"
        >
          <el-table-column
            :label="'字段名称'"
            prop="columnName"
            :min-width="100"
            show-overflow-tooltip
          >
            <template slot-scope="scope">
              <span @click="toDetail(scope.row)" class="column-name">
                {{ scope.row.columnName }}
              </span>
            </template>
          </el-table-column>
          <el-table-column
            :label="'英文名'"
            prop="columnAlias"
            :min-width="100"
            show-overflow-tooltip
          ></el-table-column>
          <el-table-column
            :label="'定义'"
            prop="columnDesc"
            :min-width="180"
            show-overflow-tooltip
          ></el-table-column>
        </datablau-table>
      </datablau-form-submit>
    </div>
  </div>
</template>

<script>
import isShowTooltip from '@/view/dataProperty/meta/isShowTooltip.vue'
import lineClamp from './lineClamp.vue'
export default {
  components: {
    isShowTooltip,
    lineClamp,
  },
  data() {
    return {
      loading: false,
      tableInfo: {},
      columnList: [],
    }
  },
  props: {
    columnObj: {
      type: Object,
      default() {
        return {}
      },
    },
  },
  watch: {
    columnObj: {
      handler(val) {
        if (val.table && val.table.length > 0) {
          this.columnList = this.columnObj.column
          this.tableInfo = this.columnObj.table[0]
        }
      },
      immediate: true,
      deep: true,
    },
  },
  mounted() {},
  methods: {
    getType(type) {
      let name = ''
      switch (parseFloat(type)) {
        case 80000004:
          name = 'table'
          break
        case 80500008:
          name = 'view'
          break
        default:
          break
      }
      return name
    },
    getName(row) {
      const result =
        row.columnName + (row.columnAlias ? '(' + row.columnAlias + ')' : '')
      return result
    },
    hasDataSetAuth(isView = false) {
      if (isView) {
        if (this.$auth.METADATA_VIEW) {
          return true
        } else {
          return false
        }
      } else {
        if (
          this.$auth.EXPORT_METADATA ||
          this.$auth.UPDATA_METADATA ||
          // _this.$auth.METADATA_VIEW ||
          this.$auth.METADATA_EDIT ||
          this.$auth.METADATA_EDIT_CURRENT_SYSTEM ||
          this.$auth.EDIT_DATA_SOURCE
        ) {
          return true
        } else {
          return false
        }
      }
    },
    toDetail(row) {
      const pos = location.href.indexOf('#/')
      const baseUrl = location.href.slice(0, pos + 2)
      const result = this.hasDataSetAuth(true)
      if (!result) {
        this.$blauShowSuccess('您没有相关模块权限', 'warning')
        return
      }
      const url = `main/meta?objectId=${row.objectId}&blank=true&isAssets=true`
      window.open(baseUrl + url)
    },
  },
}
</script>

<style scoped lang="scss">
.column-name {
  color: #409eff;
  cursor: pointer;
}
.table-pop-page {
  .pop-head {
    &:after {
      content: '';
      clear: both;
      display: block;
    }
    padding-bottom: 8px;
    border-bottom: 1px solid #ddd;
    .icon {
      width: 24px;
      height: 24px;
      float: left;
    }
    .right-part {
      float: left;
      width: 354px;
      margin-left: 8px;
      .name {
        font-size: 14px;
        color: #555;
        font-weight: 500;
        line-height: 24px;
      }
      .describe {
        font-size: 12px;
        color: #777;
        line-height: 20px;
        // overflow: hidden;
        // -webkit-box-orient: vertical;
        // -webkit-line-clamp: 2;
      }
    }
  }
  .table-box {
    min-height: 160px;
    max-height: 240px;
    height: auto;
    position: relative;
    /deep/ .form-submit {
      .row-content {
        > div {
          left: 0 !important;
          right: 0 !important;
        }
      }
    }
    /deep/ .el-table {
      .el-table__body {
        .el-table__row {
          height: 32px;
          line-height: 32px;
          td {
            height: 32px;
            line-height: 32px;
          }
        }
      }
    }
  }
}
</style>
