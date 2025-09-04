<template>
  <div class="boxDiv">
    <template v-if="listShow">
      <datablau-list-search style="padding: 0 20px">
        <template slot="title">
          <div>安全操作日志</div>
        </template>
        <div>
          <el-form :model="form" ref="form" class="logging-form">
            <el-form-item label="">
              <datablau-input
                :iconfont-state="true"
                style="width: 250px"
                clearable
                v-model="form.description"
                @keyup.native.enter="handleSearch"
                placeholder="搜索操作描述、操作人"
              ></datablau-input>
            </el-form-item>
            <el-form-item label="操作对象">
              <datablau-select
                v-model="form.operationObjValue"
                clearable
                filterable
                style="width: 120px"
              >
                <el-option
                  v-for="item in poperationName"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                ></el-option>
              </datablau-select>
            </el-form-item>
            <el-form-item label="操作动作">
              <datablau-select
                v-model="form.operationValue"
                clearable
                filterable
                style="width: 120px"
              >
                <el-option
                  v-for="item in poperationOption"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                ></el-option>
              </datablau-select>
            </el-form-item>
            <el-form-item label="">
              <datablau-dateRange
                datapicker-title="操作时间"
                v-model="form.dateTime"
                :default-time="['00:00:00', '23:59:59']"
                placeholder="选择日期"
                ref="eventStartTime"
              ></datablau-dateRange>
            </el-form-item>
            <datablau-button type="normal" @click="search">
              查询
            </datablau-button>
          </el-form>
        </div>
      </datablau-list-search>
      <datablau-form-submit style="top: 76px">
        <datablau-table
          ref="multipleTable"
          :data="tableData"
          tooltip-effect="dark"
          class="datablau-table"
          height="100%"
          width="100%"
          v-loading="loading"
          :loading="loading"
          :show-column-selection="false"
        >
          <el-table-column
            :min-width="100"
            label="系统模块"
            prop="module"
            show-overflow-tooltip
          ></el-table-column>
          <el-table-column
            :min-width="100"
            label="操作对象"
            prop="operationObject"
            show-overflow-tooltip
          ></el-table-column>
          <el-table-column :min-width="90" label="操作动作" prop="actionName">
            <!-- <template slot-scope="scope">
            {{ getName(scope.row.action) }}
          </template> -->
          </el-table-column>
          <el-table-column
            :min-width="250"
            label="操作描述"
            prop="description"
            show-overflow-tooltip
          ></el-table-column>
          <el-table-column
            :min-width="120"
            label="操作人"
            prop="operator"
            show-overflow-tooltip
          ></el-table-column>
          <el-table-column
            :min-width="120"
            label="IP地址"
            prop="ipAddress"
            show-overflow-tooltip
          ></el-table-column>
          <el-table-column
            width="150"
            label="操作时间"
            prop="operationDate"
            show-overflow-tooltip
          >
            <template slot-scope="scope">
              {{ $timeFormatter(scope.row.operationDate) }}
            </template>
          </el-table-column>
          <el-table-column
            :min-width="150"
            label="请求URL"
            prop="requestURL"
            show-overflow-tooltip
          ></el-table-column>
        </datablau-table>
        <!-- 下面翻页的内容 -->
        <template slot="buttons">
          <datablau-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page.sync="currentPage"
            :page-sizes="[20, 50, 100, 200]"
            :page-size="10"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total"
            class="page"
          ></datablau-pagination>
        </template>
      </datablau-form-submit>
    </template>
  </div>
</template>

<script>
import API from '@/view/gateway/utils/api'
export default {
  props: {
    condition: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      listShow: false,
      form: {
        description: '',
        operationObjValue: '',
        operationValue: '',
        dateTime: null,
      },
      module: '',
      tableData: [],
      loading: false,
      selection: [],
      currentPage: 1,
      manyEachPage: 20,
      total: 0,
      poperationName: [
        { label: '全部', value: null },
        {
          label: '安全概览',
          value: '安全概览',
        },
        {
          label: '信息项分类目录',
          value: '信息项分类目录',
        },
        {
          label: '分类信息项',
          value: '分类信息项',
        },
        {
          label: '数据分类目录',
          value: '数据分类目录',
        },
        {
          label: '数据资产',
          value: '数据资产',
        },
        {
          label: '数据分级目录',
          value: '数据分级目录',
        },
        {
          label: '法规条文',
          value: '法规条文',
        },
        {
          label: '评审与发布',
          value: '评审与发布',
        },
        {
          label: '识别规则目录',
          value: '识别规则目录',
        },
        {
          label: '识别规则',
          value: '识别规则',
        },
        {
          label: '识别任务目录',
          value: '识别任务目录',
        },
        {
          label: '识别任务',
          value: '识别任务',
        },
        {
          label: '识别结果确认',
          value: '识别结果确认',
        },
        {
          label: '待梳理--数据资产',
          value: '待梳理--数据资产',
        },
        {
          label: '待确认--数据资产',
          value: '待确认--数据资产',
        },
        {
          label: '已发布--数据资产',
          value: '已发布--数据资产',
        },
        {
          label: '暂不梳理--数据资产',
          value: '暂不梳理--数据资产',
        },
        {
          label: '访问策略目录',
          value: '访问策略目录',
        },
        {
          label: '访问策略',
          value: '访问策略',
        },
        {
          label: '脱敏规则目录',
          value: '脱敏规则目录',
        },
        {
          label: '脱敏规则',
          value: '脱敏规则',
        },
        {
          label: '同步数据资产目录空间',
          value: '同步数据资产目录空间',
        },
        {
          label: '层级管理',
          value: '层级管理',
        },
        {
          label: '信息项编码',
          value: '信息项编码',
        },
        {
          label: 'Ranger同步',
          value: 'Ranger同步',
        },
        {
          label: '算法目录',
          value: '算法目录',
        },
        {
          label: '算法',
          value: '算法',
        },
        {
          label: '血缘级联算法',
          value: '血缘级联算法',
        },
        {
          label: '机器学习算法',
          value: '机器学习算法',
        },
      ],
      poperationOption: [],
    }
  },
  watch: {
    'form.description'(val) {
      if (!val) {
        this.handleSearch()
      }
    },
  },
  created() {
    this.getType()
  },
  mounted() {
    this.getList()
  },
  methods: {
    handleSearch() {
      this.currentPage = 1
      this.getList()
    },
    search() {
      this.currentPage = 1
      this.getList()
    },
    getName(type) {
      const name = this.poperationOption.filter(m => m.value === type)[0].label
      return name
    },
    getType() {
      API.logAuditActionAPI().then(res => {
        const data = res.data
        this.poperationOption = []
        Object.keys(data).map(key => {
          let newMap = {}
          newMap.value = key
          newMap.label = data[key]
          this.poperationOption.push(newMap)
        })
        this.getList()
      })
    },
    getList() {
      this.loading = true
      const obj = {
        pageNum: this.currentPage,
        pageSize: this.manyEachPage,
        basicAction: this.form.operationValue || null,
        operationObject: this.form.operationObjValue || null, // 操作对象
        module: '数据安全',
        query: this.form.description || null,
        startTime: this.form.dateTime ? this.form.dateTime[0] : null,
        endTime: this.form.dateTime ? this.form.dateTime[1] : null,
      }
      API.logAuditListAPI(obj)
        .then(async res => {
          this.listShow = true
          this.loading = false
          for (let i = 0; i < res.data.messages.length; i++) {
            res.data.messages[i].actionName = await this.getName(
              res.data.messages[i].action
            )
          }
          this.tableData = res.data.messages || []
          let arr2 = this.tableData.map(e => e.operator)
          arr2 = [...new Set(arr2)]
          this.total = res.data.totalHits
        })
        .catch(e => {
          this.listShow = false
          this.loading = false
          this.$showFailure(e)
        })
    },
    handleSizeChange(val) {
      this.manyEachPage = val
      this.currentPage = 1
      this.getList()
    },
    handleCurrentChange(val) {
      this.currentPage = val
      this.getList()
    },
  },
}
</script>
<style lang="scss">
.el-tooltip__popper {
  display: -webkit-box;
  overflow: hidden;
  overflow-y: auto;
  text-overflow: ellipsis;
  -webkit-line-clamp: 10;
  -webkit-box-orient: vertical;
  max-height: 280px !important;
}
</style>
<style lang="scss" scoped>
$primary-color: #409eff;
.boxDiv {
  background-color: var(--default-bgc);
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  .width {
    width: 130px;
    margin-right: 20px;
    display: inline-block;
  }
  .logging-form {
    /deep/ .el-form-item {
      margin-bottom: 0;
      .el-form-item__content {
        min-width: auto !important;
      }
    }
  }
  .log-manage-picker {
    display: inline-block;
  }
  .iconfont {
    font-size: 12px;
  }
  .page {
    position: absolute;
    right: 20px;
  }
  .delete {
    position: absolute;
    bottom: 5px;
    left: 20px;
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
    line-height: 32px;
    height: 32px;
  }
  /deep/.datablau-datarange {
    line-height: 32px !important;
    span {
      margin-right: 6px;
    }
  }
}
</style>
