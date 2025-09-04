<template>
  <div
    class="boxDiv"
    :style="{
      top: `${topH - 88}px`,
    }"
  >
    <div v-if="pageFrom !== 'history'">
      <div style="margin-left: -20px">
        <datablau-page-title
          :parent-name="$t('common.page.systemManage')"
          :name="$t('common.page.logsRecord')"
        ></datablau-page-title>
      </div>
      <div class="one">
        <datablau-input
          :iconfont-state="true"
          style="width: 250px; margin-right: 20px"
          clearable
          v-model="description"
          :placeholder="$t('assets.logs.keyPlaceholder')"
          @keydown.enter.native="search"
        ></datablau-input>
      </div>
      <div class="one">
        <span>{{ $t('assets.logs.object') }}</span>
        <datablau-select
          v-model="operationObjValue"
          clearable
          filterable
          style="width: 120px; display: inline-block; margin-right: 20px"
        >
          <el-option
            v-for="item in poperationName"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          ></el-option>
        </datablau-select>
      </div>
      <div class="one">
        <span>{{ $t('assets.logs.action') }}</span>
        <datablau-select
          v-model="operationValue"
          clearable
          filterable
          style="width: 120px; display: inline-block; margin-right: 20px"
        >
          <el-option
            v-for="item in poperationOption"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          ></el-option>
        </datablau-select>
      </div>
      <div class="one" style="margin-left: 10px">
        <datablau-dateRange
          :datapicker-title="`${$t('assets.logs.time')}`"
          v-model="dateTime1"
          :default-time="['00:00:00', '23:59:59']"
          :placeholder="`${$t('assets.logs.date')}`"
          ref="eventStartTime"
        ></datablau-dateRange>
      </div>
      <datablau-button type="normal" size="small" class="query" @click="search">
        {{ $t('common.button.query') }}
      </datablau-button>
    </div>
    <div style="min-width: 1030px" v-if="condition === 'condition'">
      <div class="one">
        <datablau-input
          :iconfont-state="true"
          style="width: 250px; margin-right: 20px"
          clearable
          v-model="description"
          :placeholder="$t('assets.logs.keyPlaceholder')"
        ></datablau-input>
      </div>
      <div class="one">
        <span>{{ $t('assets.logs.action') }}</span>
        <datablau-select
          v-model="operationValue"
          clearable
          filterable
          style="width: 120px; display: inline-block; margin-right: 20px"
        >
          <el-option
            v-for="item in poperationOption"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          ></el-option>
        </datablau-select>
      </div>
      <div class="one" style="margin-left: 10px">
        <datablau-dateRange
          :datapicker-title="`${$t('assets.logs.time')}`"
          v-model="dateTime1"
          :placeholder="`${$t('assets.logs.date')}`"
          :default-time="['00:00:00', '23:59:59']"
          ref="eventStartTime"
        ></datablau-dateRange>
      </div>
      <datablau-button type="normal" size="small" class="query" @click="search">
        {{ $t('common.button.query') }}
      </datablau-button>
    </div>
    <datablau-form-submit
      :style="{ 'margin-top': pageFrom === 'history' ? '0px' : '78px' }"
      :class="{ conditionBt: condition === 'condition' }"
    >
      <datablau-table
        ref="multipleTable"
        :data="tableData"
        tooltip-effect="dark"
        size="small"
        class="datablau-table log-mange-table"
        height="100%"
        width="100%"
        :show-column-selection="false"
        :header-cell-style="{
          color: '#494850',
          'font-size': '12px',
          'font-weight': 'bold',
        }"
        @selection-change="handleSelectionChange"
      >
        <template v-if="pageFrom !== 'history'">
          <el-table-column
            prop="systemModule"
            :label="item.label"
            show-overflow-tooltip
            v-for="(item, index) in column"
            :key="'col' + index"
          >
            <template slot-scope="scope">
              <span v-if="item.prop === 'operationDate'">
                {{ $timeFormatter(scope.row.operationDate) }}
              </span>
              <span v-else-if="item.prop === 'action'">
                {{ actionObj[scope.row.action] }}
              </span>
              <span v-else>{{ scope.row[item.prop] }}</span>
            </template>
          </el-table-column>
        </template>
        <template v-if="pageFrom === 'history'">
          <el-table-column
            prop="requestUrl"
            :label="item.label"
            show-overflow-tooltip
            v-for="(item, index) in columns"
            :key="'col' + index"
            :width="item.width || 'auto'"
          >
            <template slot-scope="scope">
              <span v-if="item.prop === 'operationDate'">
                {{ $timeFormatter(scope.row.operationDate) }}
              </span>
              <span v-else-if="item.prop === 'action'">
                {{ actionObj[scope.row.action] }}
              </span>
              <span v-else>{{ scope.row[item.prop] }}</span>
            </template>
          </el-table-column>
        </template>
      </datablau-table>
      <!-- 下面翻页的内容 -->
      <template slot="buttons">
        <div class="row-page-footer" v-show="!deleteDisabled">
          <span class="check-info"></span>
          <span class="footer-span">
            {{ $t('assets.logs.delTips', { num: selection.length }) }}
          </span>
          <datablau-button
            :type="'danger'"
            size="small"
            class="iconfont icon-delete footer-button"
          >
            {{ $t('common.button.delete') }}
          </datablau-button>
        </div>
        <datablau-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page.sync="currentPage"
          :page-sizes="[20, 50, 100, 200]"
          :page-size="manyEachPage"
          layout="total, sizes, prev, jumper, next"
          :total="total"
          class="page"
        ></datablau-pagination>
      </template>
    </datablau-form-submit>
  </div>
</template>

<script>
export default {
  name: 'logManage',
  props: {
    pageFrom: {
      type: String,
      default: 'assets',
    },
    condition: {
      type: String,
      default: '',
    },
    currentNode: {
      type: Object,
      default: () => {},
    },
    topH: {
      type: Number,
      default: 88,
    },
  },
  data() {
    return {
      userNo: '',
      userName: '',
      module: '',
      dateTime1: null,
      dateTime2: null,
      tableData: null,
      loading: false,
      idArr: [],
      selection: [],
      currentPage: 1,
      manyEachPage: 20,
      total: 0,
      deleteDisabled: true,
      nameMapping: {},
      chName: '',
      deleteArr: ['tableData', 'nameMapping'],
      poperationName: [
        { label: this.$t('assets.logs.all'), value: null },
        {
          label: this.$t('assets.logs.assetCatalog'),
          value: this.$t('assets.logs.assetCatalog'),
        },
        {
          label: this.$t('assets.logs.dataAssets'),
          value: this.$t('assets.logs.dataAssets'),
        },
        {
          label: this.$t('assets.logs.directoryStructure'),
          value: this.$t('assets.logs.directoryStructure'),
        },
        {
          label: this.$t('assets.logs.directoryType'),
          value: this.$t('assets.logs.directoryType'),
        },
      ],
      operationObjValue: null,
      poperationOption: [
        {
          label: this.$t('assets.logs.operationOption.label_all'),
          value: null,
        },
        {
          label: this.$t('assets.logs.operationOption.label_new'),
          value: 'BASIC_ADD',
        },
        {
          label: this.$t('assets.logs.operationOption.label_delete'),
          value: 'BASIC_DELETE',
        },
        {
          label: this.$t('assets.logs.operationOption.label_see'),
          value: 'BASIC_SEARCH',
        },
        {
          label: this.$t('assets.logs.operationOption.label_modify'),
          value: 'BASIC_MODIFY',
        },
        {
          label: this.$t('assets.logs.operationOption.label_import'),
          value: 'BASIC_IMPORT',
        },
        {
          label: this.$t('assets.logs.operationOption.label_export'),
          value: 'BASIC_EXPORT',
        },
        {
          label: this.$t('assets.logs.operationOption.move'),
          value: 'BASIC_MOVE',
        },
        {
          label: this.$t('assets.logs.operationOption.general'),
          value: 'GENERAL_SETTING',
        },
        {
          label: this.$t('assets.logs.operationOption.register'),
          value: 'BASIC_REGISTER',
        },
      ],
      column: [
        {
          prop: 'module',
          label: this.$t('assets.logs.sysModule'),
          width: '100',
        },
        {
          prop: 'operationObject',
          label: this.$t('assets.logs.objectOperation'),
          width: '100',
        },
        {
          prop: 'action',
          label: this.$t('assets.logs.operation'),
          width: '100',
        },
        {
          prop: 'description',
          label: this.$t('assets.logs.description'),
          width: '250',
        },
        {
          prop: 'operator',
          label: this.$t('assets.logs.operator'),
          width: '60',
        },
        { prop: 'ipAddress', label: this.$t('assets.logs.ip'), width: '60' },
        {
          prop: 'operationDate',
          label: this.$t('assets.logs.createTime'),
          width: '180',
        },
        {
          prop: 'requestURL',
          label: this.$t('assets.logs.requestUrl'),
          width: '120',
        },
      ],
      columns: [
        {
          prop: 'operator',
          label: this.$t('assets.logs.operator'),
          width: '160',
        },
        {
          prop: 'action',
          label: this.$t('assets.logs.operation'),
          width: '160',
        },
        {
          prop: 'description',
          label: this.$t('assets.logs.description'),
        },
        {
          prop: 'operationDate',
          label: this.$t('assets.logs.createTime'),
          width: '220',
        },
      ],
      actionObj: {
        BASIC_ADD: this.$t('assets.logs.operationOption.label_new'),
        BASIC_DELETE: this.$t('assets.logs.operationOption.label_delete'),
        BASIC_SEARCH: this.$t('assets.logs.operationOption.label_see'),
        BASIC_MODIFY: this.$t('assets.logs.operationOption.label_modify'),
        BASIC_IMPORT: this.$t('assets.logs.operationOption.label_import'),
        BASIC_EXPORT: this.$t('assets.logs.operationOption.label_export'),
        BASIC_MOVE: this.$t('assets.logs.operationOption.move'),
        BASIC_RELEASE: this.$t('assets.logs.operationOption.release'),
        BASIC_OFFLINE: this.$t('assets.logs.operationOption.offline'),
        GENERAL_SETTING: this.$t('assets.logs.operationOption.general'),
        BASIC_REGISTER: this.$t('assets.logs.operationOption.register'),
        ADD_EXTENDED_ATTRIBUTE: this.$t(
          'assets.logs.operationOption.attribute'
        ),
        MODIFY_EXTENDED_ATTRIBUTE: this.$t(
          'assets.logs.operationOption.modifyAttribute'
        ),
        EXAMINE_OFFLINE: this.$t('assets.logs.operationOption.examineOffline'),
        EXAMINE_RELEASE: this.$t('assets.logs.operationOption.examineRelease'),
      },
      description: '',
      operationValue: '',
    }
  },
  mounted() {},
  watch: {
    currentNode: {
      handler(val) {
        this.initData()
      },
      deep: true,
      immediate: true,
    },
  },
  beforeDestroy() {
    setTimeout(() => {
      this.deleteArr.forEach(item => {
        if (typeof this[item] === 'object' && this[item]) {
          Object.keys(this[item]).forEach(o => {
            this[item][o] = null
          })
        }
        this[item] = null
      })
      if (window.CollectGarbage) {
        window.CollectGarbage()
      }
    }, 3000)
  },
  methods: {
    getPeopleName(list) {
      return list.map(e => this.nameMapping[e]).toString()
    },
    handleSelectionChange(val) {
      if (val.length) {
        this.deleteDisabled = false
        this.idArr = []
        const arr = []
        val.forEach(e => {
          this.idArr.push(e.id)
          arr.push(e)
        })
        this.selection = arr
      } else {
        this.idArr = []
        this.deleteDisabled = true
      }
    },
    search() {
      this.currentPage = 1
      this.initData()
    },
    initData() {
      this.loading = true
      this.pageFrom === 'assets'
        ? this.$t('assets.logs.dataAssets')
        : (this.currentNode && this.currentNode.name) ||
          this.description ||
          null
      const obj = {
        pageNum: this.currentPage || null,
        pageSize: this.manyEachPage || null,
        basicAction: this.operationValue || null,
        operationObject: this.operationObjValue || null,
        query: this.description || null,
        startTime: this.dateTime1 ? this.dateTime1[0] : null,
        endTime: this.dateTime1 ? this.dateTime1[1] : null,
        module: '数据资产-数据资产管理',
      }
      if (this.currentNode && this.pageFrom === 'history') {
        obj.operationObjectType = 'assetCatalog'
        obj.operationObjectId = this.currentNode.id
      }
      this.$http
        .post(`/audit/jdbc/record`, obj)
        .then(res => {
          this.loading = false
          this.tableData = res.data.messages || []
          let arr2 = this.tableData.map(e => e.operator)
          arr2 = [...new Set(arr2)]
          this.total = res.data.totalHits
          // this.getUserByIds(arr2)
        })
        .catch(e => {
          this.tableData = []
          this.loading = false
          this.$showFailure(e)
        })
    },
    handleSizeChange(val) {
      this.manyEachPage = val
      this.currentPage = 1
      this.initData()
    },
    handleCurrentChange(val) {
      this.currentPage = val
      this.initData()
    },
  },
}
</script>

<style lang="scss" scoped>
$primary-color: #409eff;
.boxDiv {
  width: 100%;
  background-color: var(--default-bgc);
  position: absolute;
  top: 0;
  bottom: 0;
  overflow: auto;
  padding: 0 20px;
  .width {
    width: 130px;
    margin-right: 20px;
    display: inline-block;
  }
  .one {
    display: inline-block;
    // margin-top: 10px;
    margin-bottom: 10px;
    span {
      margin-right: 6px;
    }
  }
  .log-manage-picker {
    display: inline-block;
  }
  .query {
    margin-left: 10px;
  }
  .iconfont {
    font-size: 12px;
  }
  .page {
    /*display: inline-block;*/
    /*float: right;*/
    /*margin-right: 20px;*/
    /*margin-top: 18px;*/
    position: absolute;
    //bottom: 5px;
    right: 20px;
  }
  .delete {
    position: absolute;
    bottom: 5px;
    left: 20px;
  }
  .log-mange-table {
    height: 100%;
  }
  // 设置下面翻页的样式
  .row-page-footer {
    position: absolute;
    top: 50%;
    -webkit-transform: translateY(-50%);
    transform: translateY(-50%);
    left: 20px;
    margin: 0 !important;
    .check-info {
      width: 14px;
      height: 14px;
      display: inline-block;
      background: $primary-color;
      margin-right: -13px;
      vertical-align: middle;
    }

    .footer-span {
      color: rgba(85, 85, 85, 1);
      margin-right: 10px;
      &:before {
        content: '\e6da';
        font-family: 'element-icons';
        font-size: 12px;
        font-weight: 200;
        margin-right: 5px;
        vertical-align: middle;
        line-height: 14px;
        color: white;
      }
    }

    .footer-button {
      height: 30px;
      line-height: 30px;
    }
  }
  /deep/ .el-input--mini .el-input__inner,
  .el-form-item__label {
    line-height: 34px;
    height: 34px;
  }
  /deep/.datablau-datarange span {
    margin-right: 6px;
  }
  /*/deep/ .row-content {*/
  /*  background: #fff;*/
  /*}*/
}
.conditionBt {
  top: 40px;
}
</style>
