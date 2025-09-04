<template>
  <div class="boxDiv">
    <div style="min-width: 1030px; margin-top: 10px">
      <div style="margin-left: -20px">
        <!-- <datablau-page-title>系统日志</datablau-page-title> -->
        <datablau-page-title
          :parent-name="$t('common.page.systemManage')"
          :name="$t('common.page.logManage')"
        ></datablau-page-title>
      </div>
      <!--      <div class="one">-->
      <!--        <span>员工编号</span>-->
      <!--        <el-input clearable maxlength="100" class="width" clearable v-model="userNo" placeholder="请输入员工编号" size="small"></el-input>-->
      <!--      </div>-->
      <div class="one">
        <datablau-input
          maxlength="100"
          style="width: 200px; margin-right: 20px"
          clearable
          v-model="description"
          :placeholder="$t('system.log.keyPlaceholder')"
          @keydown.enter.native="search"
        ></datablau-input>
      </div>
      <div class="one">
        <span>{{ $t('system.log.username') }}</span>
        <datablau-input
          maxlength="100"
          class="width"
          style="width: 160px"
          clearable
          v-model="chName"
          :placeholder="$t('system.log.fillUsername')"
          @keydown.enter.native="search"
        ></datablau-input>
      </div>
      <div class="one">
        <span>{{ $t('system.log.action') }}</span>
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
      <div class="one">
        <!--<span>起始时间</span>-->
        <span>{{ $t('system.log.timeSel') }}</span>
        <datablau-datePicker
          :dateTime="dateTime1"
          v-model="dateTime1"
          :datePickerType="'datetime'"
          :placeholder="$t('system.log.startTime')"
          class="log-manage-picker"
        ></datablau-datePicker>
      </div>
      <div class="one" style="margin-left: 10px">
        <!--<span>截止时间</span>-->
        <datablau-datePicker
          :dateTime="dateTime2"
          v-model="dateTime2"
          :datePickerType="'datetime'"
          :placeholder="$t('system.log.endTime')"
          class="log-manage-picker"
        ></datablau-datePicker>
      </div>
      <datablau-button type="normal" size="small" class="query" @click="search">
        {{ $t('system.log.query') }}
      </datablau-button>
    </div>
    <datablau-form-submit style="margin-top: 48px">
      <datablau-table
        ref="multipleTable"
        :data="tableData"
        tooltip-effect="dark"
        size="small"
        class="datablau-table log-mange-table"
        height="100%"
        :show-column-selection="false"
        :data-selectable="true"
        v-loading="loading"
        :header-cell-style="{
          color: '#494850',
          'font-size': '12px',
          'font-weight': 'bold',
        }"
        @selection-change="handleSelectionChange"
      >
        <!-- <el-table-column type="selection"></el-table-column> -->
        <!-- <el-table-column
          type="index"
          label="序号"
          width="100"
        ></el-table-column> -->
        <el-table-column
          prop="systemModule"
          :label="$t('system.log.sysModule')"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          prop="operation"
          :label="$t('system.log.operation')"
          width="100"
          show-overflow-tooltip
        >
          <template slot-scope="scope">
            {{ $t('system.log.operationOption.label_' + scope.row.operation) }}
          </template>
        </el-table-column>
        <el-table-column
          prop="description"
          :label="$t('system.log.description')"
          show-overflow-tooltip
          min-width="100"
        ></el-table-column>
        <el-table-column
          prop="operator"
          :label="$t('system.log.operator')"
          show-overflow-tooltip
          min-width="60"
        ></el-table-column>
        <el-table-column
          prop="createTime"
          :label="$t('system.log.createTime')"
          :formatter="$timeFormatter"
          show-overflow-tooltip
          width="180"
        ></el-table-column>

        <!-- <el-table-column
          prop="requestIp"
          label="IP地址"
          show-overflow-tooltip>
        </el-table-column> -->
        <el-table-column
          prop="requestUrl"
          :label="$t('system.log.requestUrl')"
          show-overflow-tooltip
          min-width="120"
        ></el-table-column>
      </datablau-table>
      <!-- 下面翻页的内容 -->
      <template slot="buttons">
        <div class="row-page-footer" v-show="!deleteDisabled">
          <span class="check-info"></span>
          <span class="footer-span">
            {{ $t('system.log.delTips', { num: selection.length }) }}
          </span>
          <datablau-button
            :type="'danger'"
            size="small"
            class="iconfont icon-delete footer-button"
            @click="deleteThis"
          >
            {{ $t('common.button.delete') }}
          </datablau-button>
        </div>
        <datablau-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page.sync="currentPage"
          :page-sizes="[20, 50, 100]"
          :page-size="10"
          layout="total, sizes, prev, jumper, next"
          :total="total"
          class="page"
        ></datablau-pagination>
      </template>
    </datablau-form-submit>
    <!-- <div class="log-mange-table">


      </div> -->
    <!-- <div class="log-mange-bottom">
      <div class="row-page-footer" v-show="!deleteDisabled">
        <span class="check-info"></span>
        <span class="footer-span">
          当前选中的"{{ selection.length }}条"信息，是否
        </span>
        <datablau-button
          :type="'danger'"
          size="small"
          class="iconfont icon-delete footer-button"
          @click="deleteThis"
        >
          删除
        </datablau-button>
      </div> -->
    <!-- <datablau-button
          :type="deleteDisabled ? '' : 'danger'"
          size="small"
          class="iconfont icon-delete delete"
          @click="deleteThis"
          :disabled="deleteDisabled"
        >
          删除
        </datablau-button> -->
    <!-- <datablau-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page.sync="currentPage"
        :page-sizes="[20, 50, 100]"
        :page-size="10"
        layout="total, sizes, prev, jumper, next"
        :total="total"
        class="page"
      ></datablau-pagination>
    </div> -->
  </div>
</template>

<script>
export default {
  name: 'logManage',
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
      poperationOption: [
        {
          label: this.$t('system.log.operationOption.label_全部'),
          value: '',
        },
        {
          label: this.$t('system.log.operationOption.label_登录'),
          value: this.$t('system.log.operationOption.登录'),
        },
        {
          label: this.$t('system.log.operationOption.label_登出'),
          value: this.$t('system.log.operationOption.登出'),
        },
        {
          label: this.$t('system.log.operationOption.label_查询'),
          value: this.$t('system.log.operationOption.查询'),
        },
        {
          label: this.$t('system.log.operationOption.label_增加'),
          value: this.$t('system.log.operationOption.增加'),
        },
        {
          label: this.$t('system.log.operationOption.label_删除'),
          value: this.$t('system.log.operationOption.删除'),
        },
        {
          label: this.$t('system.log.operationOption.label_修改'),
          value: this.$t('system.log.operationOption.修改'),
        },
        {
          label: this.$t('system.log.operationOption.label_导入'),
          value: this.$t('system.log.operationOption.导入'),
        },
        {
          label: this.$t('system.log.operationOption.label_导出'),
          value: this.$t('system.log.operationOption.导出'),
        },
      ],
      description: '',
      operationValue: '',
    }
  },
  mounted() {
    this.initData()
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
    // getUserByIds (idList) {
    //   if (!idList) {
    //     return
    //   }
    //   return new Promise(resolve => {
    //     this.$http.post(`${this.$url}/service/oplog/ids?isTuAcct=true`, idList).then(res => {
    //       const obj = {}
    //       res.data.forEach(e => {
    //         obj[e.tuAcct] = e.tuCname
    //       })
    //       this.nameMapping = obj
    //     }).catch(e => {
    //       this.$showFailure(e)
    //     })
    //   })
    // },
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
      const obj = {
        currentPage: this.currentPage,
        pageSize: this.manyEachPage,
        // userNo: this.userNo,
        userName: this.chName,
        module: this.module,
        operation: this.operationValue,
        description: this.description,
        // chName: this.chName,
        startTime: this.dateTime1 ? this.dateTime1.getTime() : null,
        endTime: this.dateTime2 ? this.dateTime2.getTime() : null,
      }
      this.$http
        .post(`${this.$url}/service/oplog/operation`, obj)
        .then(res => {
          this.loading = false
          this.tableData = res.data.content
          let arr2 = this.tableData.map(e => e.operator)
          arr2 = [...new Set(arr2)]
          this.total = res.data.totalItems
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
    deleteThis() {
      this.$DatablauCofirm(
        this.$t('system.log.runConfirm'),
        this.$t('system.log.tips'),
        {
          confirmButtonText: this.$t('common.button.ok'),
          cancelButtonText: this.$t('common.button.cancel'),
          type: 'warning',
        }
      ).then(() => {
        const option = this.idArr
        this.$http
          .delete(`${this.$url}/service/oplog/operation`, { data: option })
          .then(res => {
            this.$message({
              message: this.$t('system.log.delSucceed'),
              type: 'success',
            })
            this.initData()
          })
          .catch(e => {
            this.$showFailure(e)
          })
      })
    },
    checkTime() {
      if (
        this.dateTime1 &&
        this.dateTime2 &&
        typeof this.dateTime1 === 'object' &&
        typeof this.dateTime2 === 'object' &&
        this.dateTime2.getTime() < this.dateTime1.getTime()
      ) {
        this.$message.warning(this.$t('system.log.timeLimit'))
        this.dateTime2 = null
      }
    },
  },
  watch: {
    dateTime1() {
      this.checkTime()
    },
    dateTime2() {
      this.checkTime()
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
}
</style>
