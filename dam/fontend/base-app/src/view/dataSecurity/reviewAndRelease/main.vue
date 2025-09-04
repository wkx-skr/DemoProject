<template>
  <div class="boxReview">
    <div class="tile">评审与发布</div>
    <datablau-form
      class="add-form"
      :inline="true"
      label-position="right"
      label-width="60px"
      :model="searchForm"
      ref="addForm"
    >
      <el-form-item prop="assetName">
        <datablau-input
          v-model="searchForm.assetName"
          clearable
          :iconfont-state="true"
          :placeholder="'搜索资产名称'"
          style="width: 240px"
        ></datablau-input>
      </el-form-item>
      <el-form-item :label="'业务系统'" prop="categoryId">
        <datablau-select
          v-model="searchForm.categoryId"
          clearable
          filterable
          @change="systemChange"
          style="width: 160px"
        >
          <el-option
            v-for="item in options"
            :key="item.categoryName + item.categoryId"
            :label="item.categoryName"
            :value="item.categoryId"
          ></el-option>
        </datablau-select>
      </el-form-item>
      <el-form-item :label="'数据源'" prop="datasourceId" label-width="50px">
        <datablau-select
          v-model="searchForm.datasourceId"
          clearable
          filterable
          @change="datasourceIdChange"
          style="width: 160px"
        >
          <el-option
            v-for="item in dataSourceList"
            :key="item.definition + item.modelId"
            :label="item.definition"
            :value="item.modelId"
          ></el-option>
        </datablau-select>
      </el-form-item>
      <el-form-item :label="'schema'" prop="schema" label-width="50px">
        <datablau-select
          v-model="searchForm.schema"
          clearable
          filterable
          style="width: 160px"
        >
          <el-option
            v-for="item in schemaList"
            :key="item"
            :label="item"
            :value="item"
          ></el-option>
        </datablau-select>
      </el-form-item>
      <div
        v-if="showTop || showFilter"
        :class="['filtersBox', { nextLine: showTop || !showFilter }]"
      >
        <el-form-item :label="'盘点模式'" prop="inventoryModel">
          <datablau-select
            v-model="searchForm.inventoryModel"
            clearable
            filterable
            style="width: 160px"
          >
            <el-option
              v-for="item in inventory"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            ></el-option>
          </datablau-select>
        </el-form-item>
        <el-form-item :label="'梳理时间'">
          <datablau-dateRange
            v-model="eventStartTime"
            :placeholder="'选择日期'"
            :default-time="['00:00:00', '23:59:59']"
            ref="eventStartTime"
          ></datablau-dateRange>
        </el-form-item>
      </div>
      <el-form-item>
        <datablau-button
          type="text"
          @click="showTop = !showTop"
          v-show="!showFilter"
          style="display: inline-block"
          class="iconfont icon-filter"
        >
          {{
            showTop
              ? $t('quality.page.qualityRule.index.openScreen')
              : $t('quality.page.qualityRule.index.foldScreen')
          }}
        </datablau-button>
        <datablau-button type="normal" @click="search">查询</datablau-button>
        <datablau-button type="secondary" class="white-btn" @click="revise">
          重置
        </datablau-button>
      </el-form-item>
    </datablau-form>
    <datablau-form-submit
      class="tableRow"
      id="techRuleTable"
      :style="{ 'margin-top': !showTop ? '82px' : '140px' }"
    >
      <!--      <div class="boxReview">-->
      <datablau-table
        height="100%"
        class="elTable"
        ref="deTable"
        v-loading="loading"
        :data-selectable="true"
        :show-column-selection="false"
        @sort-change="sortChange"
        :default-sort="{ prop: 'checkTime', order: '' }"
        :data="structureList"
        tooltip-effect="dark"
        @selection-change="handleSelectionChange"
      >
        <el-table-column width="28">
          <template slot-scope="scope">
            <i
              style="position: relative; margin-left: 5px; top: 2px"
              :class="['iconfont', 'icon-' + typeIconMap[scope.row.type]]"
            ></i>
          </template>
        </el-table-column>
        <el-table-column
          prop="assetName"
          label="数据资产名称"
          show-overflow-tooltip
        >
          <template slot-scope="scope">
            {{
              scope.row.alias
                ? scope.row.assetName + '(' + scope.row.alias + ')'
                : scope.row.assetName
            }}
          </template>
        </el-table-column>
        <el-table-column
          prop="inventoryModel"
          label="盘点模式"
          show-overflow-tooltip
        >
          <template scope="{row}">
            <span class="inventory" :class="row.inventoryModel.toLowerCase()">
              {{ inventoryModel[row.inventoryModel] }}
            </span>
          </template>
        </el-table-column>
        <el-table-column
          prop="categoryName"
          label="业务系统"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          prop="tableName"
          label="所在表"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          prop="schemaName"
          label="schema"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          prop="dataSourceName"
          label="数据源"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          prop="catalogPath"
          label="所在安全分类"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          prop="authStdName"
          label="所属信息项"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          prop="levelName"
          label="安全等级"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          prop="checkUserName"
          label="梳理人"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          prop="checkTime"
          label="梳理时间"
          sortable="custom"
          show-overflow-tooltip
        ></el-table-column>
      </datablau-table>
      <!--      </div>-->
      <template slot="buttons">
        <template v-if="selectList.length > 0">
          <span class="check-info"></span>
          <span class="footer-row-info">
            当前选中“{{ selectList.length }}条”数据，是否
          </span>
          <datablau-button type="important" @click="primary">
            评审通过
          </datablau-button>
          <datablau-button type="normal" class="white-btn" @click="cancelbtn">
            评审驳回
          </datablau-button>
        </template>
        <datablau-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="pageNo"
          :page-sizes="[20, 50, 100]"
          :page-size="pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          class="left-btn"
        ></datablau-pagination>
      </template>
    </datablau-form-submit>
    <datablau-dialog
      title="提示"
      size="s"
      :visible.sync="safetyShow"
      height="260"
    >
      <div class="title">
        <i class="el-icon-success success-icon"></i>
        成功消息：{{ successAssets.length }}条
      </div>
      <div class="title">
        <i class="el-icon-error fail-icon"></i>
        错误消息：{{ failList.length }}条
        <div class="copy" v-copy="failList.join('，')">复制</div>
      </div>
      <div class="list">
        {{ failList.join('，') }}，数据资产已被元数据更新删除，不能进行确认结果
      </div>
    </datablau-dialog>
  </div>
</template>

<script>
import HTTP from '../util/api'
export default {
  data() {
    return {
      pageNo: 1,
      pageSize: 20,
      total: 0,
      searchForm: {},
      structureList: [], // 表单数据
      loading: false,
      selectList: [], // 选中的表单
      options: [], // 下拉
      dataSourceList: [], // 数据源下拉
      schemaList: [], // schema下拉
      eventStartTime: [],
      inventoryModel: {
        MANUAL_INVENTORY: '人工盘点',
        DATA_IDENTIFICATION: '数据识别',
        BATCH_IMPORT: '批量导入',
      },
      inventory: [
        { value: 'MANUAL_INVENTORY', label: '人工盘点' },
        { value: 'DATA_IDENTIFICATION', label: '数据识别' },
        { value: 'BATCH_IMPORT', label: '批量导入' },
      ],
      typeIconMap: {
        80000004: 'biao',
        80500008: 'shitu',
        80000005: 'ziduan',
      },
      // tableHeight: 0,
      showTop: false,
      showFilter: true,
      sort: false,
      safetyShow: false,
      failList: [],
      successAssets: [],
    }
  },
  watch: {
    showTop(val) {
      document.getElementById('techRuleTable').style.marginTop = val
        ? '140px'
        : '95px'
    },
  },

  created() {},
  mounted() {
    this.getBusinessSystemList()
    this.getPublishassetsList()
    this.resize()
    window.addEventListener('resize', this.resize)
  },
  destroyed() {
    window.removeEventListener('resize', this.resize)
  },
  methods: {
    resize() {
      let width = $('.tableRow')[0].offsetWidth
      if (width <= 1700) {
        this.showFilter = false
      } else {
        this.showFilter = true
      }
      // this.tableWidth = $('.tableRow')[0].offsetWidth
    },
    // 业务系统接口
    getBusinessSystemList() {
      HTTP.getBusinessSystemList()
        .then(res => {
          this.options = res.data.data
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    // 业务系统下拉change
    systemChange(id) {
      // 获取数据源 下拉
      if (!id) {
        this.searchForm.schema = ''
        this.searchForm.datasourceId = ''
        this.dataSourceList = []
        this.schemaList = []
        return
      }
      this.getDataSourceList(id)
    },
    datasourceIdChange(id) {
      // schema 下拉
      if (!id) {
        this.searchForm.schema = ''
        this.schemaList = []
        return
      }
      this.getSchemaList(id)
    },
    // 数据源
    getDataSourceList(id) {
      HTTP.getDataSourceList(id)
        .then(res => {
          this.dataSourceList = res.data.data
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    // schema
    getSchemaList(id) {
      HTTP.getSchemaList(id)
        .then(res => {
          this.schemaList = res.data.data
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    sortChange(data) {
      // if (!data.order) return
      this.sort = data.order === 'ascending' ? true : !data.order ? null : false
      // this.form.page = 1
      this.getPublishassetsList()
    },
    // 获取评审列表
    getPublishassetsList() {
      this.loading = true
      let json = {
        pageNo: this.pageNo,
        pageSize: this.pageSize,
        startTime: (this.eventStartTime && this.eventStartTime[0]) || '',
        endTime: (this.eventStartTime && this.eventStartTime[1]) || '',
        orderByTime: this.sort,
      }
      !this.searchForm.inventoryModel && delete this.searchForm.inventoryModel
      HTTP.getPublishassetsList({ ...json, ...this.searchForm })
        .then(res => {
          this.structureList = res.data.data.content
          this.total = res.data.data.totalItems
          this.loading = false
        })
        .catch(e => {
          this.loading = false
          this.$showFailure(e)
        })
    },
    //  评审通过
    primary() {
      this.judgesssets(1)
    },
    //  驳回
    cancelbtn() {
      this.judgesssets(-1)
    },
    // judgesssets
    judgesssets(approval) {
      let text
      approval === 1 ? (text = '评审通过') : (text = '评审驳回')
      let json = new FormData()
      let ids = this.selectList.map(item => {
        return item.id
      })
      json.append('approval', approval)
      json.append('ids ', ids)
      HTTP.judgesssets(json)
        .then(res => {
          this.pageNo = 1
          if (res.data.status === 500) {
            this.failList = res.data.data.failAssets
            this.successAssets = res.data.data.successAssets
            this.safetyShow = true
            this.getPublishassetsList()
            return
          }
          this.$blauShowSuccess(text)
          this.getPublishassetsList()
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    handleSizeChange(val) {
      this.pageSize = val
      this.getPublishassetsList()
    },
    handleCurrentChange(val) {
      this.pageNo = val
      this.getPublishassetsList()
    },
    // 查询
    search() {
      this.getPublishassetsList()
    },
    // 重置
    revise() {
      this.eventStartTime = []
      this.dataSourceList = []
      this.schemaList = []
      this.searchForm = {}
      this.pageNo = 1
      this.getPublishassetsList()
    },
    //  表单选中
    handleSelectionChange(row) {
      this.selectList = row
    },
  },
}
</script>

<style scoped lang="scss">
@import '~@/next/components/basic/color.sass';
.tableRow {
  margin-top: 95px;
  background: #fff;
  padding: 0 20px;
  transition: margin-top 0.6s;
}
.reviewAndBox {
  padding: 0 20px;
}
.boxReview {
  padding: 0 20px;
  background: #fff;
  height: 100%;
}
.left-btn {
  float: right;
}
/deep/ {
  .row-content > div {
    height: 100%;
  }
}
.tile {
  font-size: 16px;
  vertical-align: middle;
  font-weight: 600;
  height: 44px;
  /*padding-top: 8px;*/
  line-height: 44px;
  color: #555;
}
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
.filtersBox {
  display: inline-block;
}
.nextLine {
  margin-top: 43px;
  position: absolute;
  /* top: 50px; */
  left: 21px;
}
.inventory {
  display: inline-block;
  width: 68px;
  height: 22px;
  border-radius: 2px;
  text-align: center;
  line-height: 22px;
}
.manual_inventory {
  background: rgba(64, 158, 255, 0.1);
  color: #409eff;
}
.data_identification {
  background: rgba(140, 92, 255, 0.1);
  color: #8c5cff;
}
.batch_import {
  background: rgba(67, 193, 202, 0.1);
  color: #43c1ca;
}
.title {
  line-height: 30px;
  color: #555;
  font-weight: 600;
  i {
    color: #ff4b53;
    font-size: 24px;
    vertical-align: middle;
    margin-right: 6px;
    margin-left: 0;
  }
  .success-icon {
    color: #66bf16;
  }
  .copy {
    float: right;
    padding: 5px 10px;
    color: #409eff;
    cursor: pointer;
    font-weight: 400;
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
  color: #555;
  overflow-y: auto;
}
</style>
