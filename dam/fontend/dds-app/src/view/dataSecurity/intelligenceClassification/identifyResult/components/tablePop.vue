<template>
  <div class="table-pop-page">
    <div class="pop-head">
      <div class="icon">
        <datablau-icon
          :data-type="'logicaltable'"
          v-if="scopeDetail.logical && tableInfo.type === 80000004"
          :size="24"
        ></datablau-icon>
        <datablau-icon
          :data-type="'logicalcolumn'"
          v-else-if="scopeDetail.logical && tableInfo.type === 80000005"
          :size="24"
        ></datablau-icon>
        <datablau-icon
          v-else
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
            :label="$t('securityModule.columnName')"
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
            :label="$t('securityModule.enName')"
            prop="columnAlias"
            :min-width="100"
            show-overflow-tooltip
          ></el-table-column>
          <el-table-column
            :label="$t('intelligence.define')"
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
import API from '@/view/dataSecurity/util/api'
import isShowTooltip from '@/view/dataSecurity/components/isShowTooltip.vue'
import lineClamp from './lineClamp.vue'
import { dumpMetaDetail } from '@/view/dataSecurity/util/util'
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
    scopeDetail: {},
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
    toDetail(row) {
      // const baseUrl = location.origin + '/base-app/#/'
      // const result = false
      // if (!result) {
      //   this.$datablauMessage.warning('您没有相关模块权限')
      //   return
      // }
      const params = {
        name: 'dataCatalogForDDC',
        query: {
          objectId: row.objectId,
          blank: true,
          isAssets: true,
        },
      }
      dumpMetaDetail(this, params)
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
