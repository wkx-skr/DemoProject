<template>
  <div class="table-pop-page">
    <div class="pop-head">
      <div class="icon">
        <datablau-icon :data-type="'table'" :size="24"></datablau-icon>
      </div>
      <div class="right-part">
        <div class="name">{{ tableInfo.tableName }}</div>
        <div class="describe">
          <lineClamp :row="2" :value="tableInfo.tableDesc"></lineClamp>
        </div>
      </div>
    </div>
    <div class="table-box" :style="{ height: 5 * 40 + 'px' }">
      <datablau-form-submit>
        <datablau-table :data="columnList" height="100%">
          <el-table-column
            :label="'字段名称'"
            prop="name"
            :min-width="120"
            show-overflow-tooltip
          >
            <template slot-scope="scope">
              <span>{{ getName(scope.row) }}</span>
            </template>
          </el-table-column>
          <el-table-column
            :label="'定义'"
            prop="columnDesc"
            :min-width="200"
            show-overflow-tooltip
          ></el-table-column>
        </datablau-table>
      </datablau-form-submit>
    </div>
  </div>
</template>

<script>
import API from '@/view/dataSecurity/util/api'
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
    columnData: {
      type: Array,
      default() {
        return []
      },
    },
  },
  watch: {
    columnData: {
      handler(val) {
        this.tableInfo = this.columnData[0]
        this.columnList = val.slice(1)
      },
      immediate: true,
      deep: true,
    },
  },
  mounted() {},
  methods: {
    getName(row) {
      const result =
        row.columnName + (row.columnAlias ? '(' + row.columnAlias + ')' : '')
      return result
    },
  },
}
</script>

<style scoped lang="scss">
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
  }
}
</style>
