<template>
  <div
    class="relate-info"
    style="
      width: 1280px;
      margin-left: calc(50% - 640px);
      float: left;
      border-radius: 8px;
      min-height: calc(100% - 340px);
      box-shadow: 0px 2px 8px 0px rgba(118, 174, 231, 0.1);
    "
  >
    <el-dialog
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      width="740px"
      append-to-body
    >
      <div style="position: relative; top: -20px">{{ dialogProfile }}</div>
      <div id="profiling-chart" style="height: 350px"></div>
    </el-dialog>
    <el-row>
      <el-col :span="24">
        <datablau-tabs v-model="currentTab" @tab-click="handleTabClick">
          <el-tab-pane
            :label="$t('assets.marketplace.dataObject')"
            name="column"
          ></el-tab-pane>
          <el-tab-pane
            :label="$t('assets.marketplace.sampleData')"
            name="sampled"
          ></el-tab-pane>
          <!-- <el-tab-pane label="数据洞见" name="insight"></el-tab-pane> -->
        </datablau-tabs>
      </el-col>
    </el-row>
    <template v-if="currentTab === 'column'">
      <datablau-input
        class="column-input"
        v-model="columnKeyword"
        :iconfont-state="true"
        :placeholder="$t('assets.marketplace.placeholder')"
        style="margin-top: 10px"
        @keyup.enter.native="getColumnDataByKeyword"
      ></datablau-input>
      <div class="asstes-type">
        <div class="type data_object">
          <div class="circle"></div>
          <span style="padding-top: 2px">
            {{ $t('assets.marketplace.dataObject') }}：{{ this.totalColumn }}
          </span>
        </div>
      </div>
      <!-- <item-column
        @height-update="handleResize"
        :data="columnList"
        :heightValue="'442px'"
        :columnMapping="columnMapping"
        :databaseType="
          propArr.databaseType && propArr.databaseType.toUpperCase()
        "
        style="border-bottom: 1px solid #eee"
      ></item-column> -->
      <datablau-table
        key="columnTable"
        v-infinite-scroll="getColumnData"
        :infinite-scroll-disabled="
          columnLoading ||
          scrollDisabled ||
          columnList.length === pagination.total
        "
        infinite-scroll-distance="10"
        :row-class-name="getRowClassName"
        v-loading="columnLoading"
        :data="columnList"
        :border="false"
        style="margin-top: 10px"
      >
        <el-table-column label="" width="38px">
          <template slot-scope="scope">
            <span v-if="scope.row.isPK" class="pk">
              <i class="iconfont icon-pk" style="font-size: 14px"></i>
            </span>
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('assets.marketplace.nameText')"
          prop="name"
          min-width="140px"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          :label="$t('assets.marketplace.dataTypes')"
          prop="type"
          min-width="90px"
          show-overflow-tooltip
        >
          <template slot-scope="scope">
            <span
              class="data-type-icon iconfont"
              :class="[scope.row.type ? getDataTypeIcon(scope.row.type) : '']"
            ></span>
            <span class="data-type-text">
              {{ scope.row.type ? getDateTypeName(scope.row.type) : '--' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column
          v-if="$featureMap.FE_SECURITY"
          :label="$t('assets.marketplace.securityLevel')"
          prop="securityLevel"
          min-width="120px"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          :label="$t('assets.marketplace.codeDescription')"
          width="240px"
        >
          <template slot-scope="scope">
            <template v-if="scope.row.codeDesc.length">
              <el-popover
                popper-class="common-card-pop"
                placement="bottom"
                trigger="click"
                v-for="tag in scope.row.codeDesc"
                :key="tag.name"
              >
                <div class="card domain-card" v-loading="codeLoading">
                  <div class="card-head">
                    <i
                      class="iconfont"
                      :class="[
                        tag.type === 'dataStandard'
                          ? tag.categoryId == 1
                            ? 'icon-biaozhun'
                            : 'icon-zhibiao'
                          : 'icon-daima',
                      ]"
                      style="padding-right: 3px"
                    ></i>
                    <span
                      style="display: inline-block; width: calc(100% - 24px)"
                    >
                      <is-show-tooltip
                        :content="tag.chineseName || tag.name || '--'"
                      ></is-show-tooltip>
                    </span>
                  </div>
                  <div class="card-content" v-if="tag.type == 'dataStandard'">
                    <div class="item">
                      <span class="title">
                        {{ $t('assets.marketplace.domainCode') }}
                      </span>
                      <span class="value">
                        {{ tag.domainCode || '--' }}
                      </span>
                    </div>
                    <div class="item">
                      <span class="title">
                        {{ $t('assets.marketplace.englishName') }}
                      </span>
                      <span class="value">
                        {{ tag.englishName || '--' }}
                      </span>
                    </div>
                    <div class="item">
                      <span class="title">
                        {{ $t('assets.marketplace.businessDefinition') }}
                      </span>
                      <span class="value">
                        {{ tag.description || '--' }}
                      </span>
                    </div>
                    <div class="item">
                      <span class="title" style="vertical-align: top">
                        {{ $t('assets.marketplace.domainOrigin') }}
                      </span>
                      <span class="value">
                        {{ tag.source || '--' }}
                      </span>
                    </div>
                    <div class="item">
                      <span class="title">
                        {{ $t('assets.marketplace.businessDefineDepartment') }}
                      </span>
                      <span class="value">
                        {{ tag.descriptionDepartmentName || '--' }}
                      </span>
                    </div>
                    <div class="item">
                      <span class="title">
                        {{ $t('assets.marketplace.notNull') }}
                      </span>
                      <span class="value">{{ tag.notNull ? '是' : '否' }}</span>
                    </div>
                    <div class="item">
                      <span class="title">
                        {{ $t('assets.marketplace.informationType') }}
                      </span>
                      <span class="value">
                        {{ tag.dataType || '--' }}
                      </span>
                    </div>
                  </div>
                  <div class="card-content" v-if="tag.type == 'standardCode'">
                    <div class="item">
                      <span class="title">
                        {{ $t('assets.marketplace.codeNo') }}
                      </span>
                      <span class="value">
                        {{ tag.code || '--' }}
                      </span>
                    </div>
                    <div class="item">
                      <span class="title">
                        {{ $t('assets.marketplace.domainTheme') }}
                      </span>
                      <span class="value">
                        {{ tag.datasetName || '--' }}
                      </span>
                    </div>
                    <div class="item">
                      <span class="title">
                        {{ $t('assets.marketplace.remarkText') }}
                      </span>
                      <span class="value">
                        {{ tag.comment || '--' }}
                      </span>
                    </div>
                    <!-- fix bug 34642 【提测】【ddc7.0.2】数据超市-》数据表详情页，如果代码码值比较多，查看代码会非常慢(展示前20条value数据) -->
                    <datablau-table
                      v-infinite-scroll="getCodeValuesData"
                      :infinite-scroll-disabled="
                        codeValueLoading ||
                        displayCodeValues.length === allCodeValues.length
                      "
                      :data="(tag.values || []).slice(0, 20)"
                    >
                      <el-table-column
                        prop="order"
                        :label="$t('assets.marketplace.index')"
                        width="40"
                        show-overflow-tooltip
                      ></el-table-column>
                      <el-table-column
                        prop="value"
                        :label="$t('assets.marketplace.codeValue')"
                        width="100"
                        show-overflow-tooltip
                      ></el-table-column>
                      <el-table-column
                        prop="name"
                        :label="$t('assets.marketplace.codeChineseName')"
                        width="120"
                        show-overflow-tooltip
                      ></el-table-column>
                    </datablau-table>
                  </div>
                </div>
                <el-tag
                  slot="reference"
                  :class="[
                    tag.type === 'dataStandard'
                      ? tag.type + tag.categoryId
                      : tag.type,
                    tag.state && tag.state === 'X' ? 'X-style' : '',
                  ]"
                  style="
                    cursor: pointer;
                    width: 100px;
                    margin-right: 4px;
                    margin-top: 6px;
                  "
                >
                  <is-show-tooltip
                    :content="tag.chineseName || tag.name"
                  ></is-show-tooltip>
                </el-tag>
              </el-popover>
            </template>
            <span v-else>--</span>
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('assets.marketplace.notEmptyRatio')"
          min-width="135px"
          show-overflow-tooltip
          align="center"
        >
          <template slot-scope="scope">
            <profile-rate
              v-if="scope.row.profile && scope.row.profile.rowCount > 0"
              :data="scope.row.profile"
            ></profile-rate>
            <span v-else>--</span>
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('assets.marketplace.valueDistribution')"
          min-width="150px"
          align="center"
        >
          <template slot-scope="scope">
            <div style="padding-right: 10px">
              <profile-distribute
                v-if="scope.row.profile && scope.row.profile.rowCount > 0"
                :key="scope.row.assetEnName"
                :fullData="scope.row"
                :data="scope.row.profile"
                @pushDialog="handlePushDialog"
              ></profile-distribute>
              <span v-else>--</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('assets.marketplace.valueRange')"
          prop="range"
          min-width="220px"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          :label="$t('assets.marketplace.remarkText')"
          prop="remark"
          min-width="100px"
          show-overflow-tooltip
        ></el-table-column>
      </datablau-table>
      <div v-if="noMore" style="text-align: center">
        {{ $t('assets.marketplace.endTip') }}
      </div>
    </template>
    <template v-else-if="currentTab === 'sampled'">
      <div style="margin-top: 10px">
        <datablau-button
          class="iconfont icon-refresh refresh-btn"
          @click="refreshSampleData"
        >
          {{ $t('assets.marketplace.refreshData') }}
        </datablau-button>
        <span
          style="margin-left: 12px; color: #7c89a8"
          v-if="sampledData.updateTime"
        >
          {{ $t('assets.marketplace.updateTime') }}：{{
            sampledData.updateTime || '--'
          }}
        </span>
      </div>
      <!-- 离线库 不可采样 -->
      <div
        v-if="sampleError"
        class="noresult-img"
        style="
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
          min-height: 300px;
        "
      >
        <img
          src="../../../../../assets/images/dataAssets/portal/wrongResult.svg"
          alt=""
        />
        <div style="margin-top: 8px">
          <p style="padding-left: 0">{{ sampleErrorText }}</p>
        </div>
      </div>
      <datablau-table
        v-else
        key="sampledTable"
        :row-class-name="getRowClassName"
        v-loading="sampledLoading"
        :data="sampledData.list"
        :border="false"
        :show-column-selection="false"
        style="margin-top: 10px; height: 100%"
      >
        <el-table-column
          v-for="column in sampledData.headText"
          :key="column.prop"
          :label="column.label"
          :prop="column.prop"
          show-overflow-tooltip
        >
          <template slot="header">
            <is-show-tooltip
              :content="column.label"
              style="display: flex"
            ></is-show-tooltip>
            <is-show-tooltip
              :content="column.enLabel"
              style="display: flex"
            ></is-show-tooltip>
          </template>
        </el-table-column>
      </datablau-table>
    </template>
  </div>
</template>

<script>
import api from '@/view/dataAsset/utils/api'
import * as echarts from 'echarts'
import ProfileDistribute from './profileDistribute.vue'
import ProfileRate from './profileRate.vue'
import isShowTooltip from '@/components/common/isShowTooltip/isShowTooltip.vue'
import $ from 'jquery'
export default {
  name: 'RelateInfo',
  props: {
    objectId: {
      type: String,
      default: '',
    },
  },
  components: { ProfileDistribute, ProfileRate, isShowTooltip },
  computed: {
    noMore() {
      return (
        this.pagination.pageNum * this.pagination.pageSize >=
          this.pagination.total &&
        this.pagination.total > 20 &&
        !this.columnLoading
      )
    },
  },
  mounted() {
    // this.getColumnData()
    // this.getSampledData()
  },
  data() {
    return {
      allCodeValues: [],
      displayCodeValues: [],
      codePagination: {
        pageSize: 20,
        currentPage: 1,
      },
      codeValueLoading: false,
      codeLoading: false,
      scroll: false,
      columnLoading: false,
      sampledLoading: true,
      currentTab: 'column',
      columnKeyword: '',
      columnList: [],
      typeMap: {
        date: this.$t('meta.DS.tableDetail.sampleData.date'),
        time: this.$t('meta.DS.tableDetail.sampleData.time'),
        text: this.$t('meta.DS.tableDetail.sampleData.text'),
        file: this.$t('meta.DS.tableDetail.sampleData.file'),
        int: this.$t('meta.DS.tableDetail.sampleData.int'),
        json: this.$t('meta.DS.tableDetail.sampleData.json'),
        complexData: this.$t('meta.DS.tableDetail.sampleData.complexData'),
        binary: this.$t('meta.DS.tableDetail.sampleData.binaryFile'),
        boolean: this.$t('meta.DS.tableDetail.sampleData.boolean'),
        timestamp: this.$t('meta.DS.tableDetail.sampleData.time'),
        integer: this.$t('meta.DS.tableDetail.sampleData.int'),
        bigint: this.$t('meta.DS.tableDetail.sampleData.int'),
        tinyint: this.$t('meta.DS.tableDetail.sampleData.int'),
        smallint: this.$t('meta.DS.tableDetail.sampleData.int'),
        mediumint: this.$t('meta.DS.tableDetail.sampleData.int'),
        char: this.$t('meta.DS.tableDetail.sampleData.text'),
        varchar: this.$t('meta.DS.tableDetail.sampleData.text'),
        tinytext: this.$t('meta.DS.tableDetail.sampleData.text'),
        longtext: this.$t('meta.DS.tableDetail.sampleData.text'),
        tinyblob: this.$t('meta.DS.tableDetail.sampleData.text'),
        blob: this.$t('meta.DS.tableDetail.sampleData.text'),
        longblob: this.$t('meta.DS.tableDetail.sampleData.text'),
        year: this.$t('meta.DS.tableDetail.sampleData.date'),
        datetime: this.$t('meta.DS.tableDetail.sampleData.time'),
      },
      sampledData: {
        headText: [],
        list: null,
        refreshTime: '2023-10-10 12:12',
      },
      pagination: {
        pageSize: 20,
        pageNum: 0,
        total: 0,
      },
      scrollDisabled: false,
      dialogVisible: false,
      dialogTitle: '',
      dialogProfile: '',
      domainDetails: {},
      totalColumn: 0,
      databaseType: '',
      sampleError: false,
      sampeErrorText: '',
    }
  },
  methods: {
    getCodeValuesData() {
      this.codeValueLoading = true
      console.log('get code values')
      this.codePagination.currentPage++
      this.displayCodeValues = this.allCodeValues.slice(
        0,
        this.codePagination.currentPage * 20
      )
      this.codeValueLoading = false
    },
    getDataTypeIcon(type) {
      type = type.toUpperCase()
      if (
        type.indexOf('GEOMETRY') !== -1 ||
        type.indexOf('POLYGON') !== -1 ||
        type.indexOf('LINESTRING') !== -1 ||
        type.indexOf('POINT') !== -1 ||
        type.indexOf('POLYGON') !== -1 ||
        type.indexOf('GEOMETRY') !== -1
      ) {
        return 'icon-complexdata'
      }
      if (
        type.indexOf('FLOAT') !== -1 ||
        type.indexOf('DOUBLE') !== -1 ||
        type.indexOf('NUM') !== -1 ||
        type.indexOf('NUMBER') !== -1 ||
        type.indexOf('NUMERIC') !== -1 ||
        type.indexOf('DECIMAL') !== -1 ||
        type.indexOf('INT') !== -1 ||
        type.indexOf('BIT') !== -1
      ) {
        return 'icon-int'
      }
      if (
        type.indexOf('TIME') !== -1 ||
        type.indexOf('DATE') !== -1 ||
        type.indexOf('YEAR') !== -1
      ) {
        return 'icon-date'
      }
      if (
        type.indexOf('VARBINARY') !== -1 ||
        type.indexOf('STR') !== -1 ||
        type.indexOf('CLOB') !== -1 ||
        type.indexOf('JSON') !== -1 ||
        type.indexOf('BLOB') !== -1 ||
        type.indexOf('TEXT') !== -1 ||
        type.indexOf('CHAR') !== -1
      ) {
        return 'icon-datafile'
      }
      if (type.indexOf('BINARY') !== -1) {
        return 'icon-file'
      }
    },
    getDateTypeName(originType) {
      const type = originType.toUpperCase()
      if (
        type.indexOf('GEOMETRY') !== -1 ||
        type.indexOf('POLYGON') !== -1 ||
        type.indexOf('LINESTRING') !== -1 ||
        type.indexOf('POINT') !== -1 ||
        type.indexOf('POLYGON') !== -1 ||
        type.indexOf('GEOMETRY') !== -1
      ) {
        return this.$t('assets.marketplace.geometryText')
      }
      if (
        type.indexOf('FLOAT') !== -1 ||
        type.indexOf('DOUBLE') !== -1 ||
        type.indexOf('NUM') !== -1 ||
        type.indexOf('NUMBER') !== -1 ||
        type.indexOf('NUMERIC') !== -1 ||
        type.indexOf('DECIMAL') !== -1 ||
        type.indexOf('INT') !== -1 ||
        type.indexOf('BIT') !== -1
      ) {
        return this.$t('assets.marketplace.numText')
      }
      if (
        type.indexOf('TIME') !== -1 ||
        type.indexOf('DATE') !== -1 ||
        type.indexOf('YEAR') !== -1
      ) {
        return this.$t('assets.marketplace.dateText')
      }
      if (
        type.indexOf('VARBINARY') !== -1 ||
        type.indexOf('STR') !== -1 ||
        type.indexOf('CLOB') !== -1 ||
        type.indexOf('JSON') !== -1 ||
        type.indexOf('BLOB') !== -1 ||
        type.indexOf('TEXT') !== -1 ||
        type.indexOf('CHAR') !== -1
      ) {
        return this.$t('assets.marketplace.text')
      }
      if (type.indexOf('BINARY') !== -1) {
        return this.$t('assets.marketplace.fileText')
      }
      return originType
    },
    handlePushDialog({ detail, graph }) {
      const { assetName, assetEnName, profile } = detail
      const handleProfile = profile => {
        let text = `${this.$t(
          'assets.marketplace.lastRunTime'
        )}：${this.$timeFormatter(profile.profileTimestamp)}，`
        if (profile.profilingResult) {
          const { rowCount, distinctValueCount, minValue, maxValue } =
            profile.profilingResult
          text = this.$t('meta.DS.tableDetail.dataQuality.dialogText', {
            rowCount: rowCount,
            distinctValueCount: distinctValueCount,
          })
          if (
            maxValue &&
            typeof maxValue === 'number' &&
            maxValue > 0.3e12 &&
            maxValue < 5.7e12
          ) {
            text += this.$t('meta.DS.tableDetail.dataQuality.dialogText1', {
              minValue: this.$timeFormatter(minValue),
              maxValue: this.$timeFormatter(maxValue),
            })
          } else if (maxValue && typeof maxValue === 'number') {
            text += this.$t('meta.DS.tableDetail.dataQuality.dialogText1', {
              minValue: minValue,
              maxValue: maxValue,
            })
          }
        }
        return text
      }
      const profilingProfile = handleProfile(profile)
      this.dialogProfile = profilingProfile
      this.dialogTitle = this.$t(
        'meta.DS.tableDetail.dataQuality.dialogTitle',
        { title: assetName }
      )
      if (assetEnName) {
        this.dialogTitle += '(' + assetEnName + ')'
      }
      this.dialogTitle += this.$t(
        'meta.DS.tableDetail.dataQuality.dialogTitleSuffix'
      )
      // this.dialogHtml = graph;
      this.dialogVisible = true
      setTimeout(() => {
        this.drawEChart(graph)
      })
    },
    drawEChart(graph) {
      const [nameArray, rateArray] = [[], []]
      const rowCntMap = new Map()
      graph.forEach(item => {
        nameArray.push(
          item.name.split(this.$t('meta.DS.tableDetail.dataQuality.to'))[0]
        )
        rateArray.push(item.rate)
        rowCntMap.set(
          item.name.split(this.$t('meta.DS.tableDetail.dataQuality.to'))[0],
          item.rowCnt
        )
      })
      const option = {
        color: ['#4eb6ac'],
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            // 坐标轴指示器，坐标轴触发有效
            type: 'shadow', // 默认为直线，可选为：'line' | 'shadow'
          },
          // formatter:'{b0}<br>共{rowCntMap.get(b0)}<br>占比{c0}%'
          formatter: param => {
            let { data, name, color } = param[0]
            const wholeName = name
            let formatName = ''
            if (name.length <= 30) {
              formatName = name
            }
            while (name.length > 30) {
              formatName += name.slice(0, 30) + '<br>'
              name = name.slice(30)
            }
            return `${formatName}<br><span style="background-color:${color};width:10px;height:10px;display:inline-block;border-radius:3px;margin-right:0.5em;"></span>${this.$t(
              'meta.DS.tableDetail.dataQuality.appear'
            )}${rowCntMap.get(wholeName)}${this.$t(
              'meta.DS.tableDetail.dataQuality.times'
            )}<br><span style="background-color:${color};width:10px;height:10px;display:inline-block;border-radius:3px;margin-right:0.5em;"></span>${this.$t(
              'meta.DS.tableDetail.dataQuality.percent'
            )}${data}%`
          },
        },
        grid: {
          top: '10px',
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true,
        },
        xAxis: [
          {
            type: 'category',
            data: nameArray,
            axisLabel: {
              rotate: 60,
              formatter: data => {
                if (data.length < 10) {
                  return data
                } else {
                  return data.slice(0, 10) + '...'
                }
              },
            },
          },
        ],
        yAxis: [
          {
            type: 'value',
            axisLabel: {
              formatter: '{value}%',
            },
          },
        ],
        series: [
          {
            name: this.$t('meta.DS.tableDetail.dataQuality.occupy'),
            type: 'bar',
            barWidth: '60%',
            data: rateArray,
          },
        ],
      }
      echarts.init($('#profiling-chart')[0]).setOption(option)
    },
    handleTabClick(tab) {
      console.log(tab.index)
      this.pagination = {
        pageNum: 0,
        pageSize: this.currentTab === 'column' ? 20 : 500,
        total: 0,
      }
      if (tab.index == 0) {
        this.getColumnData()
      }
      if (tab.index == 1) {
        if (this.databaseType === 'OFFLINEDUMP') {
          this.sampleError = true
          this.sampleErrorText = '暂无采样数据'
        } else {
          this.getSampledData()
        }
      }
    },
    getDomainDetails(domain) {
      const type = domain.type
      this.allCodeValues = []
      this.displayCodeValues = []
      if (type === 'standardCode') {
        this.codeLoading = true
        this.$http
          .post(`/domain/domains/code/getCode`, {
            code: domain.domainCode,
            categoryId: 1,
          })
          .then(res => {
            this.domainDetails = res.data
            this.allCodeValues = res.data.values
            this.displayCodeValues = res.data.values.slice(0, 20)
            this.codeLoading = false
          })
          .catch(error => {
            this.domainDetails = { values: [] }
            this.$blauShowFailure(error)
            this.codeLoading = false
          })
      } else {
      }
    },
    getColumnDataByKeyword() {
      this.pagination.pageNum = 0
      this.getColumnData()
    },
    getColumnData(defaultParams = {}) {
      if (this.columnLoading) return
      this.columnLoading = true
      this.pagination.pageNum++
      if (this.objectId) {
        if (
          this.pagination.pageNum === 1 ||
          (this.columnList !== null && this.columnList.length == 0)
        ) {
          this.columnList = null
        }
        api
          .getObjectColumns({
            objectId: parseInt(this.objectId),
            keyWord: this.columnKeyword,
            currentPage: this.pagination.pageNum,
            pageSize: 20,
          })
          .then(res => {
            if (res.status === 200) {
              api.getTableKey(this.objectId).then(keyRes => {
                const allKey = keyRes.data.data || []
                const primaryKey = allKey
                  .filter(item => item.type === 'PrimaryKey')
                  .map(key => key.objectId)
                const columnRes = (res.data.data.content || []).map(column => {
                  const {
                    standardCodes = [],
                    domains = [],
                    domainState,
                  } = column
                  column.profilingResult = column.profilingResult || {}
                  const { maxValue = '', minValue = '' } =
                    column.profilingResult
                  const codeDesc = (domains || []).map(item => ({
                    type: 'dataStandard',
                    ...item,
                  }))
                  // if (domainCode) {
                  //   codeDesc.push({
                  //     domainCode,
                  //     state: domainState,
                  //     type: 'standardCode',
                  //   })
                  // }

                  return {
                    ...column,
                    name:
                      (column.assetName
                        ? `${column.assetName}(${column.assetEnName})`
                        : column.assetEnName) || '--',
                    isPK: primaryKey.indexOf(column.objectId) !== -1,
                    type: column.dataType,
                    securityLevel: column.securityLevel || '--',
                    remark: column.definition || '--',
                    range:
                      minValue || maxValue ? `${minValue} ~ ${maxValue}` : '--',
                    profile: {
                      profileTimestamp: column.profileTimestamp,
                      profilingResult: column.profilingResult,
                      rowCount: column.profilingResult.rowCount,
                      nullRate: column.profilingResult.nullRate,
                    },
                    type: column.dataType,
                    codeDesc: (domains || [])
                      .map(item => ({
                        type: 'dataStandard',
                        ...item,
                      }))
                      .concat(
                        standardCodes.map(code => ({
                          ...code,
                          type: 'standardCode',
                        }))
                      ),
                  }
                })
                if (this.pagination.pageNum === 1) {
                  this.columnList = columnRes
                } else {
                  ;(columnRes || []).forEach(c => {
                    // console.log(c)
                    this.columnList.push(c)
                  })
                }
                const total = res.data.data.totalItems
                this.pagination.total = total
                if (!this.columnKeyword) {
                  this.totalColumn = total
                }
                this.scrollDisabled =
                  total == 0 ||
                  this.pagination.pageNum === Math.ceil(total / 20)
                this.columnLoading = false
              })
            } else {
              this.columnLoading = false
              this.$blauShowFailure(res)
            }
          })
          .catch(error => {
            this.$blauShowFailure(error)
          })
      }
    },
    refreshSampleData() {
      this.pagination.pageNum = 0
      this.getSampledData()
    },
    getSampledData() {
      this.pagination.pageNum++
      if (this.objectId) {
        if (this.sampledData.list && this.sampledData.list.length === 0) {
          this.sampledData.list = null
        }
        this.sampledLoading = true
        api
          .getObjectSamples({
            objectId: parseInt(this.objectId),
            currentPage: this.pagination.pageNum,
            pageSize: 500,
            reload: true,
          })
          .then(res => {
            this.sampleError = false
            if (res.status === 200) {
              const {
                chColumns = [],
                columns = [],
                content = [],
                hasAuth = [],
                type = [],
              } = res.data
              const contentRes = content.map(element => {
                const sample = {}
                element.forEach((e, index) => {
                  sample[columns[index]] = e || '--'
                })
                return sample
              })
              if (this.pagination.pageNum === 1) {
                this.sampledData.list = contentRes
              } else {
                this.sampledData.list = this.sampledData.list.concat(contentRes)
              }
              this.sampledData.headText = chColumns.map((c, i) => ({
                label: c || this.$t('assets.marketplace.noAlias'),
                enLabel: columns[i],
                prop: columns[i],
              }))
              this.pagination.total = res.data.total
              this.scrollDisabled =
                res.data.total === 0 ||
                this.pagination.pageNum === Math.ceil(res.data.total / 50)
              if (this.scrollDisabled && content.length > 10) {
                const middleKey = columns[Math.ceil(columns.length / 2)]
                const laseElement = {}
                laseElement[middleKey] = this.$t('assets.marketplace.endTip')
                if (columns && columns.length)
                  this.sampledData.list.push(laseElement)
              }
              this.sampledLoading = false
            } else {
              this.sampledLoading = false
              this.sampledData.list = []
              this.$blauShowFailure(res)
            }
          })
          .catch(error => {
            this.sampledData.list = []
            this.sampledLoading = false
            this.sampleError = true
            this.sampleErrorText = error.response.data.errorMessage.includes(
              '该数据源不可采样'
            )
              ? '采集管理中设置为不可采样'
              : '暂无采样数据'
            // this.$blauShowFailure(error)
          })
      }
      // setTimeout(() => {
      //   this.sampledLoading = false
      //   this.sampledData.list = [1, 2, 3, 4]
      // }, 2000)
    },
    drawNotEmptyEcharts(data, index, commonId) {
      const leftArr = ['17', '14', '10']
      const option = {
        silent: true,
        title: {
          text: data,
          top: '15',
          left: leftArr[String(data).length - 1],
          textStyle: {
            fontSize: 12,
            fontWeight: 500,
            color: '#3C64F0',
          },
        },
        series: [
          {
            name: 'Access From',
            type: 'pie',
            radius: ['50%', '70%'],
            avoidLabelOverlap: false,
            labelLine: {
              show: false,
            },
            label: { show: false },
            emphasis: { disabled: true },
            data: [
              {
                value: data,
                itemStyle: { color: '#3C64F0' },
              },
              {
                value: 100 - parseInt(data),
                itemStyle: { color: '#f5f5f5' },
              },
            ],
          },
        ],
      }
      this.$nextTick(() => {
        let chartId = commonId + index
        let notEmptyChart = echarts.init(document.getElementById(chartId))
        notEmptyChart.setOption(option)
        notEmptyChart.resize()
      })
    },
    drawDistributionEcharts(data, index, commonId) {
      let dataAxis = [
        '点',
        '击',
        '柱',
        '子',
        '或',
        '者',
        '两',
        '指',
        '在',
        '触',
        '屏',
        '上',
        '滑',
        '动',
        '能',
        '够',
        '自',
        '动',
        '缩',
        '放',
      ]
      data = [
        220, 182, 191, 234, 290, 330, 310, 123, 442, 321, 90, 149, 210, 122,
        133, 334, 198, 123, 125, 220,
      ]
      const option = {
        grid: { top: 8, bottom: 8 },
        silent: true,
        xAxis: {
          data: dataAxis,
          axisLabel: {
            show: false,
          },
          axisTick: {
            show: false,
          },
          axisLine: {
            show: false,
          },
        },
        yAxis: {
          show: false,
        },
        series: [
          {
            type: 'bar',
            showBackground: true,
            itemStyle: {
              color: '#3C64F0',
            },
            emphasis: { show: false },
            data: data,
          },
        ],
      }
      this.$nextTick(() => {
        let chartId = commonId + index
        let distributionChart = echarts.init(document.getElementById(chartId))
        distributionChart.setOption(option)
        distributionChart.resize()
      })
    },
    getRowClassName({ row, rowIndex }) {
      if (rowIndex === this.pagination.total) {
        return 'last-row'
      }
    },
  },
  watch: {
    objectId: {
      handler() {
        if (this.objectId) {
          console.log(this.objectId)
          this.$http
            .get(`/metadata/entities/${this.objectId}/summary/prop`)
            .then(res => {
              this.databaseType = res.data.databaseType
            })
          this.pagination = {
            pageNum: 0,
            pageSize: this.currentTab === 'column' ? 20 : 500,
            total: 0,
          }
          this.currentTab = 'column'
          this.getColumnData()
          // this.getProp()
        }
      },
      immediate: true,
    },
    columnList: {
      handler() {
        const dom = $('.asset-content')[0]
        this.scroll = dom.scrollHeight > dom.clientHeight
      },
    },
    sampledData: {
      handler() {
        const dom = $('.asset-content')[0]
        this.scroll = dom.scrollHeight > dom.clientHeight
      },
    },
  },
}
</script>

<style lang="scss">
.el-tag {
  &.dataStandard1 {
    background: rgba($color: #38b48b, $alpha: 0.1);
    color: #38b48b;
    &.X-style {
      span {
        text-decoration: line-through;
      }
    }
  }
  &.dataStandard2 {
    background: rgba($color: #c6b57f, $alpha: 0.1);
    color: #c6b57f;
    &.X-style {
      span {
        text-decoration: line-through;
      }
    }
  }
  &.standardCode {
    background: rgba($color: #9d5b8b, $alpha: 0.1);
    color: #9d5b8b;
    &.X-style {
      span {
        text-decoration: line-through;
      }
    }
  }
}

.common-card-pop.el-popper {
  background-color: transparent;
  padding: 0;
  border: none;
  padding: 0;
}
.distribution-charts {
  width: 100%;
}
.pk {
  width: 22px;
  height: 22px;
  background: rgba(255, 201, 11, 0.15);
  border: 1px solid #ffc90b;
  border-radius: 6px;
  color: #ffc90b;
  display: flex;
  align-items: center;
  justify-content: center;
}
.asstes-type {
  float: right;
  height: 20px;
  margin-top: 10px;
  .type {
    float: left;
    position: relative;
    padding-left: 18px;
    margin-right: 16px;
    &:last-child {
      margin-right: 0;
    }

    &.data_object {
      .circle {
        background: #b44c97;
        border: 4px solid #f3e2ee;
      }
    }
    .circle {
      width: 6px;
      height: 6px;
      position: absolute;
      top: 3px;
      left: 0;
      background: #0095d9;
      border-radius: 50%;
      box-sizing: content-box;
      border: 4px solid #d6eef8;
    }
  }
}
/deep/.el-table .last-row {
  color: #7c89a8;
  div {
    padding-top: 15px;
  }
}
.data-type-icon {
  float: left;
  margin-top: 3px;
}
.data-type-text {
  float: left;
  margin-left: 4px;
}
.card.domain-card {
  width: 340px;
  background-color: #fff;
  border-radius: 8px;
  z-index: 99;
  color: #354f7b;
  .card-head {
    height: 56px;
    padding-left: 16px;
    padding-right: 16px;
    display: flex;
    align-items: center;
    background: url(../../../../../assets/images/dataAssets/portal/cardHead.png);
    background-size: cover;
    // border: 1px dotted #ddd;
    i {
      color: #3c64f0;
      background-color: #fff;
      padding: 6px;
      border-radius: 4px;
      font-size: 20px;
    }

    span {
      font-size: 16px;
      margin-left: 8px;
      font-weight: 600;
    }
  }
  .card-content {
    max-height: 240px;
    overflow: auto;
    padding: 8px 16px;
    color: #354f7b;
    line-height: 1.5;

    .item {
      line-height: 32px;
      font-size: 13px;
      .title {
        vertical-align: top;
        display: inline-block;
        width: 80px;
        color: #7c89a8;
      }
      .value {
        display: inline-block;
        width: calc(100% - 90px);
        margin-left: 10px;
        color: #354f7b;
      }
    }
    .el-table.datablau-table.datablau-table-5dot9 th .cell,
    .el-table.datablau-table.datablau-table-5dot9.el-table--border th .cell {
      color: #354f7b;
    }
    .el-table .cell.el-tooltip {
      color: #354f7b;
    }
  }
}
</style>

<style lang="scss" scoped>
.relate-info {
  /deep/.datablau-tabs .el-tabs .el-tabs__nav-wrap .el-tabs__item:hover {
    color: #3c64f0;
  }
  /deep/.datablau-tabs .el-tabs .el-tabs__nav-wrap .el-tabs__item.is-active {
    color: #3c64f0;
  }
  /deep/.el-tabs__active-bar {
    background-color: #3c64f0;
  }
}
</style>
