<template>
  <div class="operate-report-container">
    <div class="head-wrapper">
      <div class="first-line">
        <h1 v-show="$isEng">{{OperationReport.report}}</h1>
        <h1 v-show="!$isEng">{{companyInfo.name}} {{OperationReport.report}}</h1>
        <div class="operate-panel">
          <el-button v-if="user.isAdmin" type="primary" size="mini" @click="openEdit" :class="$isEng ? 'buttonEng' : ''">{{OperationReport.edit}}</el-button>
          <el-button size="mini" @click="generate" :class="$isEng ? 'buttonEng' : ''">{{OperationReport.export}}</el-button>
        </div>
      </div>
      <p>{{OperationReport.reportDate}}：{{reportDay}}</p>
    </div>
    <div :class="$isEng ? 'title-wrapper engTitle' : 'title-wrapper'" v-if="licServerEmbedded">
      <ul class="clearfixed">
        <li>
          <h3>{{OperationReport.license}}</h3>
          <p>{{$toThousands(companyInfo.actualLicAmount)}}</p>
        </li>
        <li>
          <h3>{{OperationReport.contract}}</h3>
          <p>{{$toThousands(companyInfo.licAmount)}}</p>
        </li>
        <li>
          <h3>
            <span>{{OperationReport.usage}}</span>
            <datablau-button :tooltipContent="OperationReport.expression" class="iconfont icon-wenti" type="icon"></datablau-button>
          </h3>
          <b :class="mapClass[activeStatus]">{{ activeStatusJson[activeStatus] }}</b>
        </li>
        <li>
          <h3>
            <span>{{OperationReport.maximum}}</span>
            <datablau-button :tooltipContent="OperationReport.perDay" class="iconfont icon-wenti" type="icon"></datablau-button>
          </h3>
          <p>{{$toThousands(companyInfo.licStatMaxDau)}}</p>
          <i v-if="activeStatus === '饱和' && companyInfo.recommendedLicAmount && companyInfo.recommendedLicAmount !== 0" class="hint">{{OperationReport.recommended}}{{companyInfo.recommendedLicAmount}}</i>
        </li>
        <li class="last-child">
          <h3>
            <span>{{OperationReport.concurrency}}</span>
            <datablau-button :tooltipContent="OperationReport.concurrentUsage" class="iconfont icon-wenti" type="icon"></datablau-button>
          </h3>
          <p>{{$toThousands(companyInfo.licStatMaxPeakAmount)}}</p>
        </li>
        <em style="display: inline-block;" v-if="licStart > 0">{{OperationReport.authorization}}：{{companyInfo.licStartDate}}</em>
        <em style="display: inline-block;margin-left: 5px;" v-if="licEnd > 0">{{OperationReport.closingDate}}：<span :class="{yellow: licenseMessage}">{{companyInfo.licEndDate}}<el-tooltip v-if="licenseMessage !== ''" :content="licenseMessage" effect="light" placement="top"><i class="el-icon-warning"></i></el-tooltip></span></em>
      </ul>
    </div>
    <div :class="$isEng ? 'integration-wrapper engInteg' : 'integration-wrapper'">
      <ul class="clearfixed">
        <!-- <li>
          <h3>系统总数</h3>
          <p>{{integration.systemAmount}}</p>
        </li> -->
        <li>
          <div class="box">
            <h3>{{OperationReport.modelsTotal}}</h3>
            <p>{{$toThousands(integration.modelAmount)}}</p>
          </div>
        </li>
        <li>
          <div class="box">
            <h3>{{OperationReport.versionsTotal}}</h3>
            <p>{{$toThousands(integration.versionAmount)}}</p>
          </div>
        </li>
        <li>
          <div class="box">
            <h3>{{OperationReport.entitiesTotal}}</h3>
            <p>{{$toThousands(integration.entityAmount)}}</p>
          </div>
        </li>
        <li>
          <div class="box">
            <h3>{{OperationReport.dataTotal}}</h3>
            <p>{{$toThousands(integration.dataItemAmount)}}</p>
          </div>
        </li>
        <li>
          <div class="box">
            <h3>{{OperationReport.usersTotal}}</h3>
            <p>{{$toThousands(integration.userAmount)}}</p>
          </div>
        </li>
      </ul>
    </div>
    <div class="data-wrapper">
      <div class="usage-wrapper">
        <ul class="clearfixed">
          <li>
            <div class="header clearfixed">
              <p>{{OperationReport.dayReleaseReport}}</p>
              <el-date-picker
                size="mini"
                v-model="usageDay"
                type="daterange"
                unlink-panels
                :clearable="false"
                :start-placeholder="OperationReport.startDate"
                :end-placeholder="OperationReport.endDate"
                @change="drawUsageByDay"
                :picker-options="usageDateOption">
              </el-date-picker>
            </div>
            <div v-show="dayChartShow" class="chart" id="usage-by-day">
            </div>
            <div v-show="!dayChartShow" class="chart no-data"></div>
          </li>
          <li>
            <div class="header clearfixed">
              <p>{{OperationReport.monthlyReleaseReport}}</p>
              <el-date-picker
                size="mini"
                v-model="usageWeek"
                type="monthrange"
                :clearable="false"
                unlink-panels
                :start-placeholder="OperationReport.startDate"
                :end-placeholder="OperationReport.endDate"
                @change="drawUsageByWeek"
                :picker-options="usageWeekOption">
              </el-date-picker>
            </div>
            <div class="chart" id="usage-by-month" v-show="monthChartShow">

            </div>
            <div v-show="!monthChartShow" class="chart no-data"></div>
          </li>
        </ul>
      </div>
    </div>
    <div class="productivity-by-day-wrapper">
      <div class="header clearfixed">
        <p>{{OperationReport.queryByDay}}</p>
        <div>
          <a href="" @click="downloadProByDay">{{OperationReport.download}}</a>
          <el-date-picker
            size="mini"
            v-model="modelDay"
            type="daterange"
            :clearable="false"
            unlink-panels
            :start-placeholder="OperationReport.startDate"
            :end-placeholder="OperationReport.endDate"
            :picker-options="usageDateOption"
            @change="licenseDateChange">
          </el-date-picker>
        </div>
      </div>
      <div v-show="!this.license.showNoData" class="table-container">
        <el-table
          class="datablau-table-wrapper"
          :data="license.tableData"
          :default-sort = "{prop: 'dateStr', order: 'descending'}"
          :cell-class-name = "() => 'text-left'"
          :header-cell-class-name = "() => 'text-left'"
          sortable="custom"
          v-loading="license.loading"
          @sort-change="handleLicenseSortChange">
          <el-table-column
            prop="dateStr"
            :label="OperationReport.date"
            show-overflow-tooltip
            align="left"
            sortable="custom"
            min-width="100"
          >
          </el-table-column>
          <el-table-column
            :label="OperationReport.licensesNum"
            prop="dau"
            sortable="custom"
            align="right"
            :width="$isEng ? '300' : '250'"
          >
            <template slot="header">
              <div style="display: inline-block">
                <span>{{OperationReport.activeUsers}}</span>
                <datablau-button :tooltipContent="OperationReport.activeUsersOfModel" class="iconfont icon-wenti" type="icon"></datablau-button>
              </div>
            </template>
            <template slot-scope="scope">
              <span>{{ $toThousands(scope.row.dau) }}</span>
            </template>
          </el-table-column>
          <el-table-column
            :label="OperationReport.licensesNumMax"
            prop="licPeakAmount"
            sortable="custom"
            align="right"
            :width="$isEng ? '300' : '250'"
          >
            <template slot="header">
              <div style="display: inline-block">
                <span>{{OperationReport.maximumConcurrentLicenses}}</span>
                <datablau-button :tooltipContent="OperationReport.sameTime" class="iconfont icon-wenti" type="icon"></datablau-button>
              </div>
            </template>
            <template slot-scope="scope">
              <span>{{ $toThousands(scope.row.licPeakAmount) }}</span>
            </template>
          </el-table-column>
          <el-table-column
            :label="OperationReport.webActiveUsers"
            prop="webDau"
            sortable="custom"
            align="right"
            :width="$isEng ? '300' : '240'"
          >
            <template slot-scope="scope">
              <span>{{ $toThousands(scope.row.webDau) }}</span>
            </template>
          </el-table-column>
          <el-table-column
            :label="OperationReport.webMaximumConcurrentLicenses"
            prop="licWebPeakAmount"
            sortable="custom"
            align="right"
            :width="$isEng ? '300' : '220'"
          >
            <template slot-scope="scope">
              <span>{{ $toThousands(scope.row.licWebPeakAmount) }}</span>
            </template>
          </el-table-column>
          <el-table-column
            prop="changedItemAmount"
            :label="OperationReport.changeInformationItems"
            sortable="custom"
            align="right"
            :min-width="220"
          >
            <template slot-scope="scope">
              <span>{{ $toThousands(scope.row.changedItemAmount) }}</span>
            </template>
          </el-table-column>
<!--          <el-table-column
            :min-width="$isEng ? '10' : '150'"
          ></el-table-column>-->
        </el-table>
      </div>
      <div v-show="!this.license.showNoData" class="pagination-wrapper">
        <el-pagination
          layout="total, sizes, prev, pager, next, jumper"
          :total="license.total"
          :page-size="license.pageSize"
          :page-sizes="[20, 50, 100]"
          :current-page.sync="license.currentPage"
          @size-change="licenseSizeChange"
          @current-change="licensePageChange"
        ></el-pagination>
      </div>
      <div v-show="this.license.showNoData" class="no-data"></div>
    </div>
    <div class="productivity-by-month-wrapper">
      <div class="header clearfixed">
        <p>{{OperationReport.queryByBonth}}</p>
        <div>
          <a href="" @click="downloadProByMonth">{{OperationReport.download}}</a>
          <el-date-picker
            size="mini"
            v-model="modelMonth"
            type="monthrange"
            :clearable="false"
            unlink-panels
            :start-placeholder="OperationReport.startDate"
            :end-placeholder="OperationReport.endDate"
            :picker-options="usageDateOption"
            @change="usersDateChange">
          </el-date-picker>
        </div>
      </div>
      <div v-show="!this.users.showNoData" class="table-container">
        <el-table
          class="datablau-table-wrapper"
          :data="users.tableData"
          :default-sort = "{prop: 'dateStr', order: 'descending'}"
          :cell-class-name = "() => 'text-left'"
          :header-cell-class-name = "() => 'text-left'"
          sortable="custom"
          v-loading="users.loading"
          @sort-change="handleUsersSortChange">
          <el-table-column
            prop="dateStr"
            :label="OperationReport.date"
            align="left"
            sortable="custom"
          >
          </el-table-column>
          <el-table-column
            :label="OperationReport.name"
            prop="fullUsername"
            sortable="custom"
            align="left"
          >
          </el-table-column>
          <el-table-column
            :label="OperationReport.serviceTime"
            prop="keeplive"
            sortable="custom"
            align="right"
            :width="$isEng ? '180' : '180'"
          >
            <template slot-scope="scope">
              <span>{{ toThousands((scope.row.keeplive/3600).toFixed(1)) }}</span>
            </template>
          </el-table-column>
          <el-table-column
            prop="changedItemAmount"
            :label="OperationReport.numberOfChange"
            sortable="custom"
            align="right"
            :min-width="$isEng ? '290' : '180'"
          >
            <template slot-scope="scope">
              <span>{{ $toThousands(scope.row.changedItemAmount) }}</span>
            </template>
          </el-table-column>
          <el-table-column
            min-width="150"
          ></el-table-column>
        </el-table>
      </div>
      <div v-show="!this.users.showNoData" class="pagination-wrapper">
        <el-pagination
          layout="total, sizes, prev, pager, next, jumper"
          :total="users.total"
          :page-size="users.pageSize"
          :page-sizes="[20, 50, 100]"
          :current-page.sync="users.currentPage"
          @size-change="usersSizeChange"
          @current-change="usersPageChange"
        ></el-pagination>
      </div>
      <div v-show="this.users.showNoData" class="no-data"></div>
    </div>

    <el-dialog :modal-append-to-body="false" class="company-info-edit-wrapper"
      :visible.sync="editVisible">
      <h2>{{OperationReport.edit}}</h2>
      <el-form label-position="right" label-width="161px" :model="formData">
        <el-form-item :label="OperationReport.enterpriseName" required>
          <el-input :placeholder="OperationReport.fillIn" size="small" v-model="formData.name"></el-input>
        </el-form-item>
        <!--<el-form-item label="许可证授权日期" required>
          <el-date-picker
            v-model="formData.licStartDate"
            :clearable="false"
            type="date"
            size="small"
            placeholder="选择日期">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="许可证截止日期" required>
          <el-date-picker
            v-model="formData.licEndDate"
            :clearable="false"
            type="date"
            size="small"
            :picker-options="licEndDateOption"
            placeholder="选择日期">
          </el-date-picker>
        </el-form-item> -->
        <el-form-item :label="OperationReport.licenseQuantity" required>
          <el-input size="small" type="number" :min="5" v-model="formData.licAmount"></el-input>
        </el-form-item>
      </el-form>
      <div class="footer">
        <el-button size="medium" type="primary" @click="editSave">{{OperationReport.save}}</el-button>
        <el-button size="medium"  @click="editCancel">{{OperationReport.cancel}}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import moment from 'moment'
import echarts from 'echarts'
import html2pdf from 'html2pdf.js'
import $ from 'jquery'
import { mapState } from 'vuex'
moment.locale('en')
export default {
  data () {
    return {
      usageDay: [new Date(new Date().getTime() - 7 * 24 * 3600 * 1000), new Date(new Date().getTime() - 24 * 3600 * 1000)],
      usageWeek: [new Date(new Date().getTime() - 56 * 24 * 3600 * 1000), new Date()],
      modelDay: [new Date(new Date().getTime() - 28 * 24 * 3600 * 1000), new Date(new Date().getTime() - 24 * 3600 * 1000)],
      modelMonth: [new Date(new Date().getTime() - 2 * 30 * 24 * 3600 * 1000), new Date()],
      dayChartShow: true,
      monthChartShow: false,
      integration: {},
      companyInfo: {},
      reportDay: this.$isEng ? moment().format('YYYY-MM-DD') : moment().format('YYYY年MM月DD日'),
      usageByDayEchart: {},
      usageByWeekEchart: {},
      license: {
        tableData: [],
        total: 0,
        pageSize: 20,
        currentPage: 1,
        orderBy: 'date',
        order: 'desc',
        loading: false,
        showNoData: false
      },
      users: {
        tableData: [],
        total: 0,
        pageSize: 20,
        currentPage: 1,
        orderBy: 'date',
        order: 'desc',
        loading: true,
        showNoData: false
      },
      editVisible: false,
      formData: {
        name: ''
      },
      formDataBak: {

      },
      mapClass: {
        '一般': 'normal',
        '活跃': 'active',
        '非常活跃': 'very-active',
        '饱和': 'full',
        'NA': 'loading'
      },
      activeStatusJson: {
        '一般': this.$v.OperationReport.commonly,
        '活跃': this.$v.OperationReport.active,
        '非常活跃': this.$v.OperationReport.veryActive,
        '饱和': this.$v.OperationReport.saturated,
        'NA': 'NA'
      },
      licenseMessage: '',
      OperationReport: this.$v.OperationReport
    }
  },
  computed: {
    ...mapState(['user', 'licServerEmbedded']),
    activeStatus () {
      const status = this.companyInfo.licStatMaxDau / this.companyInfo.actualLicAmount
      if (status === 0) {
        return '一般'
      } else if (status <= 0.3) {
        return '活跃'
      } else if (status <= 0.7) {
        return '非常活跃'
      } else if (status > 0.7) {
        return '饱和'
      } else {
        return 'NA'
      }
    },
    licStart () {
      return moment(this.companyInfo.licStartDate).valueOf()
    },
    licEnd () {
      return moment(this.companyInfo.licEndDate).valueOf()
    },
    usageDateOption () {
      return {
        disabledDate: (time) => {
          return time.getTime() > Date.now() - 24 * 3600000
        }
      }
    },
    usageWeekOption () {
      return {
        disabledDate: (time) => {
          return time.getTime() > Date.now()
        }
      }
    },
    licEndDateOption () {
      return {
        disabledDate: (time) => {
          return time.getTime() < moment(this.formData.licStartDate).valueOf()
        }
      }
    }
  },
  mounted () {
    this.$nextTick(() => {
      // $('.operate-report-container').width($('.el-main').width())
      $('.usage-wrapper .chart').width($('.usage-wrapper li').width())
      this.usageByDayEchart = echarts.init(document.getElementById('usage-by-day'))
      this.usageByWeekEchart = echarts.init(document.getElementById('usage-by-month'))
      this.drawUsageByDay()
      this.drawUsageByWeek()
    })
    window.onresize = () => {
      // $('.operate-report-container').width($('.el-main').width())
      $('.usage-wrapper .chart').width($('.usage-wrapper li').width())
      this.usageByDayEchart.resize()
      this.usageByWeekEchart.resize()
    }
    this.getIntegration()
    this.getCompanyInfo()
    this.getLicenseTableData()
    this.getUsersTableData()
  },
  watch: {
    'formData.licAmount' (newVal, oldVal) {
      if (parseInt(newVal) !== newVal) {
        this.formData.licAmount = parseInt(newVal)
      }
    }
  },
  methods: {
    renderHeaderSend (h, { column, $index }) {
      return [
        h('span', {
          style: {
            display: 'inline-block', verticalAlign: 'baseline'
          }
        }, this.OperationReport.activeUsers),
        h('el-tooltip', {
          props: {
            effect: 'light',
            content: this.OperationReport.activeUsersOfModel,
            placement: 'top'
          },
          style: {
            marginLeft: '2px',
            display: 'inline-block',
            verticalAlign: 'text-bottom'
          }
        }, [
          h('i', {
            class: 'svg-tip'
          })
        ]
        )
      ]
    },
    renderHeaderSameTime (h, { column, $index }) {
      return [
        h('span', {
          style: {
            display: 'inline-block',
            verticalAlign: 'baseline'
          }
        }, this.OperationReport.maximumConcurrentLicenses),
        h('el-tooltip', {
          props: {
            effect: 'light',
            content: this.OperationReport.sameTime,
            placement: 'top'
          },
          style: {
            marginLeft: '2px',
            display: 'inline-block',
            verticalAlign: 'text-bottom'
          }
        }, [
          h('i', {
            class: 'svg-tip'
          })
        ]
        )
      ]
    },
    toThousands (num) {
      let number = num.toString()
      let cn = number.substring(0, number.indexOf('.')).replace(/\B(?=(?:\d{3})+$)/g, ',')
      cn += number.substring(number.indexOf('.'))
      return cn
    },
    editSave () {
      if (!this.formData.name) {
        this.$message.warning(this.OperationReport.nameEmpty)
        return
      }
      // if (this.formData.licStartDate === null || this.formData.licEndDate === null) {
      //   this.$message.warning('日期不能为空')
      //   return
      // }
      if (this.formData.licAmount === '' || this.formData.licAmount === null || parseInt(this.formData.licAmount) !== this.formData.licAmount) {
        this.$message.warning(this.OperationReport.cannotBlank)
        return
      }
      // if (moment(this.formData.licStartDate).valueOf() > moment(this.formData.licEndDate)) {
      //   this.$message.warning('许可证授权日期不能大于许可证截止日期')
      //   return
      // }
      if (this.formData.licAmount < 5) {
        this.$message.warning(this.OperationReport.cannotBeLess)
        return
      }
      this.$http({
        url: `${this.$url}/service/company/info`,
        method: 'put',
        params: {
          name: this.formData.name,
          // licStartDate: moment(this.formData.licStartDate).format('YYYY-MM-DD'),
          // licEndDate: moment(this.formData.licEndDate).format('YYYY-MM-DD'),
          licAmount: this.formData.licAmount
        }
      }).then(res => {
        this.companyInfo = Object.assign(this.companyInfo, res.data)
        this.formData = { ...res.data }
        this.formDataBak = { ...res.data }

        this.$message.success(this.OperationReport.successfully)
        this.editVisible = false
      }).catch(err => {
        this.$showFailure(err)
      })
    },
    editCancel () {
      this.editVisible = false
    },
    openEdit () {
      this.formData = { ...this.formDataBak }
      this.editVisible = true
    },
    downloadProByDay (e) {
      e.preventDefault()
      let url = `${this.$url}/service/stat/license/excel/days?startDate=${moment(this.modelDay[0]).format('YYYY-MM-DD')}&endDate=${moment(this.modelDay[1]).format('YYYY-MM-DD')}`
      this.$downloadFile(url)
    },
    downloadProByMonth (e) {
      e.preventDefault()
      let url = `${this.$url}/service/stat/users/excel/months?startYear=${moment(this.modelMonth[0]).format('YYYY')}&startMonth=${moment(this.modelMonth[0]).format('MM')}&endYear=${moment(this.modelMonth[1]).format('YYYY')}&endMonth=${moment(this.modelMonth[1]).format('MM')}`
      this.$downloadFile(url)
    },
    generate () {
      $('.operate-report-container').width($('.operate-report-container').width() + 40)
      let opt = {
        margin: 10,
        filename: `${this.OperationReport.operationReport}${this.reportDay}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          dpi: 92,
          scale: 2,
          backgroundColor: '#6f6f6',
          width: $('.operate-report-container').width()
        }
      }
      // $('.operate-report-container').width($('.el-main').width())
      $('.operate-panel').hide()
      $('.el-input__suffix').addClass('arrowUp')// 保存页面时修改分页箭头位置
      $('.engTitle .last-child').css('width', '20%') // 修改英文版保存页面时元素宽度改变（只在保存成pdf有问题）
      document.documentElement.scrollTop = 0
      document.documentElement.scrollLeft = 0
      html2pdf().set(opt).from($('.operate-report-container').css('padding', '20px')[0]).save()
      setTimeout(() => {
        $('.operate-report-container').css('padding', '0')
        $('.operate-report-container').width('auto')
        $('.operate-panel').show()
        $('.el-input__suffix').removeClass('arrowUp') // 恢复分页箭头位置
      })
    },
    handleLicenseSortChange ({ column, prop, order }) {
      this.license.currentPage = 1
      this.license.order = order === 'descending' ? 'desc' : 'asc'
      this.license.orderBy = prop === 'dateStr' ? 'date' : prop
      this.getLicenseTableData()
    },
    handleUsersSortChange ({ column, prop, order }) {
      this.users.currentPage = 1
      this.users.order = order === 'descending' ? 'desc' : 'asc'
      this.users.orderBy = prop === 'dateStr' ? 'date' : prop
      this.getUsersTableData()
    },
    usersSizeChange (size) {
      this.users.pageSize = size
      this.getUsersTableData()
    },
    usersPageChange (page) {
      this.users.currentPage = page
      this.getUsersTableData()
    },
    usersDateChange () {
      this.users.currentPage = 1
      this.getUsersTableData()
    },
    getUsersTableData () {
      this.users.loading = true
      const params = {
        startYear: moment(this.modelMonth[0]).format('YYYY'),
        startMonth: moment(this.modelMonth[0]).month() + 1,
        endYear: moment(this.modelMonth[1]).format('YYYY'),
        endMonth: moment(this.modelMonth[1]).month() + 1,
        orderBy: this.users.orderBy,
        order: this.users.order,
        currentPage: this.users.currentPage,
        pageSize: this.users.pageSize
      }
      this.$http({
        method: 'get',
        url: `${this.$url}/service/stat/users/months`,
        params
      }).then(res => {
        const data = res.data
        this.users.tableData = data.list
        if (data.list.length === 0) {
          this.users.showNoData = true
        } else {
          this.users.showNoData = false
        }
        this.users.total = data.page.totalItem
        this.users.currentPage = data.page.currentPage
      }).catch(err => {
        this.$showFailure(err)
      }).finally(() => {
        this.users.loading = false
      })
    },
    licenseSizeChange (size) {
      this.license.pageSize = size
      this.license.currentPage = 1
      this.getLicenseTableData()
    },
    licensePageChange (page) {
      this.license.currentPage = page
      this.getLicenseTableData()
    },
    licenseDateChange () {
      this.license.currentPage = 1
      this.getLicenseTableData()
    },
    getLicenseTableData () {
      this.license.loading = true
      const params = {
        startDate: moment(this.modelDay[0]).format('YYYY-MM-DD'),
        endDate: moment(this.modelDay[1]).format('YYYY-MM-DD'),
        orderBy: this.license.orderBy,
        order: this.license.order,
        currentPage: this.license.currentPage,
        pageSize: this.license.pageSize
      }
      this.$http({
        method: 'get',
        url: `${this.$url}/service/stat/license/days`,
        params
      }).then(res => {
        const data = res.data
        this.license.tableData = data.list
        if (data.list.length === 0) {
          this.license.showNoData = true
        } else {
          this.license.showNoData = false
        }
        this.license.total = data.page.totalItem
        this.license.currentPage = data.page.currentPage
      }).catch(err => {
        this.$showFailure(err)
      }).finally(() => {
        this.license.loading = false
      })
    },
    getIntegration () {
      this.$http.get(`${this.$url}/service/stat/integration`).then(res => {
        this.integration = res.data
      }).catch(err => {
        this.$showFailure(err)
      })
    },
    getCompanyInfo () {
      this.$http.get(`${this.$url}/service/company/info`).then(res => {
        this.companyInfo = res.data
        this.formData = { ...res.data }
        this.formDataBak = { ...res.data }
        if (this.licEnd > 0 && this.licServerEmbedded) {
          let time = moment(this.companyInfo.licEndDate).valueOf()
          let nowTime = Date.now()
          if (time < nowTime) {
            this.licenseMessage = this.OperationReport.expired
            this.$notify({
              title: this.OperationReport.warning,
              message: this.OperationReport.expired,
              type: 'warning'
            })
          } else if (time < nowTime + 30 * 24 * 3600000) {
            this.licenseMessage = this.$isEng ? `The license remains valid for ${Math.ceil((time - nowTime) / (24 * 3600000))} days/day.` : `许可证还剩${Math.ceil((time - nowTime) / (24 * 3600000))}天`
            this.$notify({
              title: this.OperationReport.warning,
              message: this.licenseMessage,
              type: 'warning'
            })
          }
        }
      }).catch(err => {
        this.$showFailure(err)
      })
    },
    drawUsageByDay () {
      const params = {
        startDate: moment(this.usageDay[0]).format('YYYY-MM-DD'),
        endDate: moment(this.usageDay[1]).format('YYYY-MM-DD'),
        orderBy: 'date',
        order: 'asc',
        currentPage: 1,
        pageSize: 100000
      }
      this.$http({
        method: 'get',
        url: `${this.$url}/service/stat/license/days`,
        params
      }).then(res => {
        const data = res.data
        if (data.list.length === 0) {
          this.dayChartShow = false
        } else {
          this.dayChartShow = true
        }
        this.usageByDayEchart.innerHTML = ''
        const option = {
          xAxis: {
            type: 'category',
            boundaryGap: true,
            data: data.list.map(item => item.dateStr),
            axisLine: {
              lineStyle: {
                color: '#7D8493'
              }
            }
          },
          yAxis: {
            type: 'value',
            axisLine: {
              lineStyle: {
                color: '#7D8493'
              }
            }
          },
          tooltip: {
            trigger: 'axis',
            formatter (params) {
              return params.map(item => (`date:${item.name},value:${item.value}`)).join(',')
            }
          },
          legend: {
            data: ['客户端', 'web端']
          },
          series: [{
            data: data.list.map(item => item.dau),
            name: '客户端',
            type: 'line',
            // areaStyle: {
            //   color: {
            //     type: 'linear',
            //     x: 0,
            //     y: 0,
            //     x2: 0,
            //     y2: 1,
            //     colorStops: [{
            //       offset: 0, color: '#C6DEFF'
            //     }, {
            //       offset: 1, color: '#fff'
            //     }],
            //     global: false
            //   }
            // },
            itemStyle: {
              normal: {
                color: '#4386F5',
                lineStyle: {
                  color: '#4386F5'
                }
              }
            }
          },

          {
            data: data.list.map(item => item.webDau),
            type: 'line',
            name: 'web端',
            // areaStyle: {
            //   color: {
            //     type: 'linear',
            //     x: 0,
            //     y: 0,
            //     x2: 0,
            //     y2: 1,
            //     colorStops: [{
            //       offset: 0, color: '#C6DEFF'
            //     }, {
            //       offset: 1, color: '#fff'
            //     }],
            //     global: false
            //   }
            // },
            itemStyle: {
              normal: {
                color: 'rgb(112,182,3)',
                lineStyle: {
                  color: 'rgb(112,182,3)'
                }
              }
            }
          }
          ]
        }
        if (data.list.length > 4) {
          option.xAxis.axisLabel = {
            rotate: 40
          }
          option.grid = {
            left: '10%',
            width: '89%',
            bottom: '70px'
          }
        } else {
          option.xAxis.axisLabel = {
            interval: 0,
            rotate: 0
          }
          option.grid = {
            left: '10%',
            width: '89%',
            bottom: '70px'
          }
        }
        this.usageByDayEchart.setOption(option)
      }).catch(err => {
        this.$showFailure(err)
      })
    },
    drawUsageByWeek () {
      const params = {
        startYear: moment(this.usageWeek[0]).format('YYYY'),
        startWeek: moment(this.usageWeek[0]).week(),
        endYear: moment(this.usageWeek[1]).format('YYYY'),
        endWeek: moment(this.usageWeek[1]).endOf('month').week(),
        currentPage: 1,
        pageSize: 10000
      }
      this.$http({
        method: 'get',
        url: `${this.$url}/service/stat/license/weeks`,
        params
      }).then(res => {
        const data = res.data
        if (data.list.length === 0) {
          this.monthChartShow = false
        } else {
          this.monthChartShow = true
        }
        this.usageByWeekEchart.innerHTML = ''
        let dateStrItem = this.$isEng ? data.list.map(item => item.dateStr.replace(/^([0-9]*)年\s*第([0-9]*)周$/, 'Week $2 of $1')) : data.list.map(item => item.dateStr)
        const option = {
          xAxis: {
            type: 'category',
            boundaryGap: true,
            data: dateStrItem,
            axisLine: {
              lineStyle: {
                color: '#7D8493'
              }
            }
          },
          yAxis: {
            type: 'value',
            axisLine: {
              lineStyle: {
                color: '#7D8493'
              }
            }
          },
          tooltip: {
            trigger: 'axis',
            formatter (params) {
              return params.map(item => (`date:${item.name},value:${item.value}`)).join(',')
            }
          },
          legend: {
            data: ['客户端', 'web端']
          },
          series: [
            {
              data: data.list.map(item => item.wau),
              type: 'bar',
              name: '客户端',
              itemStyle: {
                normal: {
                  color: '#4386F5'
                  // color: new echarts.graphic.LinearGradient(
                  //   0, 0, 0, 1,
                  //   [
                  //     { offset: 0, color: '#AFECFD' },
                  //     { offset: 1, color: '#4386F5' }
                  //   ]
                  // )
                }
              }
            },
            {
              data: data.list.map(item => item.webWau),
              type: 'bar',
              name: 'web端',
              itemStyle: {
                normal: {
                  color: 'rgb(112,182,3)'
                }
              }
            }
          ]
        }
        if (data.list.length > 4) {
          option.xAxis.axisLabel = {
            rotate: 40
          }
          option.grid = {
            left: '10%',
            width: '89%',
            bottom: '70px'
          }
        } else {
          option.xAxis.axisLabel = {
            interval: 0,
            rotate: 0
          }
          option.grid = {
            left: '10%',
            width: '89%',
            bottom: '70px'
          }
        }
        this.usageByWeekEchart.setOption(option)
      }).catch(err => {
        this.$showFailure(err)
      })
    }
  }
}
</script>

<style lang="scss" scoped>
  $blue: #4386f5;
  $grey: #20293B;
  .clearfixed::after {
    content: '';
    display: table;
    clear: both;
  }
  .operate-report-container {
    /deep/ .svg-tip {
      display: inline-block;
      background-image: url(./tips.svg);
      background-size: contain;
      width: 16px;
      height: 16px;
      vertical-align: middle;
    }
    box-sizing: border-box;
    padding: 6px 0px;
    background: #f7f7f7;
    .head-wrapper {
      text-align: center;
      .first-line {
        position: relative;
        h1 {
          font-size: 24px;
          line-height: 34px;
          color: $blue;
          font-weight: normal;
        }
        .operate-panel {
          position: absolute;
          top: 0;
          right: 0;
          .el-button {
            width: 80px;
            height: 34px;
          }
          .buttonEng{
            width: 95px;
          }
        }
      }
      p {
        margin: 12px 0;
        font-size: 12px;
        line-height: 17px;
        color: #7D8493;
      }
    }
    .title-wrapper {
      padding: 24px 20px;
      background: #fff;
      border-radius: 10px;
      box-shadow: 0 0 10px #E3E3E3;
      & > ul {
        li {
          box-sizing: border-box;
          width: 22%;
          display: inline-block;
        }
        li.first-child {
          padding-right: 50px;
          width: 25%;
        }
        li.last-child {
          width: 12%;
        }
        .company-name {
          margin-bottom: 17px;
          font-size: 20px;
          line-height: 1;
          color: $grey;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
          font-weight: normal;
        }
        em {
          display: block;
          font-size: 12px;
          color: #888F9D;
          line-height: 1;
          font-style: normal;
          margin-top: 10px;
          &> span.yellow {
            i {
              margin-left: 5px;
            }
            color: #E6A23C;
          }
        }
        h3 {
          display: table;
          font-size: 14px;
          line-height: 1;
          color: $grey;
          font-weight: normal;
          .svg-tip {
            display: inline-block;
            background-image: url(./tips.svg);
            background-size: contain;
            width: 16px;
            height: 16px;
            vertical-align: middle;
          }
          span {
            margin-right: 4px;
            vertical-align: middle;
          }
        }
        p {
          margin-top: 10px;
          font-size: 24px;
          line-height: 1;
          font-weight: bold;
        }
        b {
          display: table;
          margin-top: 11px;
          color: #3EC5E6;
          font-size: 18px;
          line-height: 25px;
          &.normal {
            color: #888F9D;
            &::before {
              background: #888F9D;
            }
          }
          &.active {
            color: #F47853;
            &::before {
              background: #F47853;
            }
          }
          &.very-active {
            color: #DD214C;
            &::before {
               background: #DD214C;
            }
          }
          &.full {
            color: #AA253E;
            &::before {
              background: #AA253E;
            }
          }
          &::before {
            display: inline-block;
            content: '';
            width: 8px;
            height: 8px;
            margin-right: 8px;
            border-radius: 50%;
            background: #3EC5E6;
            vertical-align: middle;
          }
        }
        i.hint {
          display: inline-block;
          margin-top: 10px;
          font-style: normal;
          font-size: 12px;
          line-height: 16px;
          padding: 5px 15px 8px;
          border-radius: 12px;
          background: #EDF4FF;
          color: $blue;
        }
        i.el-tooltip {
          cursor: pointer;
        }
      }
      table {
        width:100%;
        text-align: center;
        border: 1px solid #000;
        border-collapse: collapse;
        td {
          padding: 20px;
          border-right: 1px solid #000;
        }
      }

    }
    .engTitle{
      padding: 29px 20px;
      min-height: 140px;
      &>ul{
         li{
           width: 20%;
           padding-right: 10px;
           &:last-child{
             width: 20%;
           }
           h3{
              height: 40px;
              font-size: 16px;
              color: #555;
            }
            p{
              margin-top: 4px;
              font-size: 30px;
              color: #555;
            }
            b{
              margin-top: 4px;
              font-size: 30px;
              color: #999999 ;
              &::before{
                content: "";
                background: #999999;
              }
            }
         }
      }
    }
    .integration-wrapper {
      margin-top: 20px;
      ul {
        margin-right: -16px;
      }
      li {
        box-sizing: border-box;
        float: left;
        width: 20%;
        height: 100px;
        text-align: center;
        .box {
          margin-right: 16px;
          padding: 21px 0 15px;
          border-radius: 10px;
          background: #fff;
          box-shadow: 0 0 10px #E3E3E3;
        }
        h3 {
          font-size: 13px;
          color: #7D8493;
          line-height: 1;
          font-weight: normal;
        }
        p {
          margin-top: 10px;
          font-size: 30px;
          line-height: 41px;
          color: #232E43;
          font-weight: bold;
        }
      }
    }
    .engInteg>ul{
      li{
        height: 140px;
        .box{
          padding: 29px 20px;
          height: 100%;
        }
        h3{
          color: #999;
          font-size: 16px;
          height: 40px;
        }
        p{
          color: #555;
          margin-top: 0;
          height: 30px;
          line-height: 30px;
        }
      }
    }
    .data-wrapper {
      margin-top: 20px;
      padding: 10px 40px 10px 20px;
      background: #fff;
      border-radius: 10px;
      box-shadow: 0 0 10px #E3E3E3;
    }
    .usage-wrapper {
        margin-top: 14px;
        overflow-x: hidden;
        & > ul {
          margin-right: -40px;
        }
        & > ul > li {
          box-sizing: border-box;
          float: left;
          width: 50%;
          padding-right: 40px;
        }
        .header {
          & > div {
            float: right;
          }
          p {
            float: left;
            color: $blue;
            line-height: 21px;
            font-size: 15px;
            &::before {
              margin-right: 7px;
              content: '';
              display: inline-block;
              width: 4px;
              height: 21px;
              border-radius: 2px;
              background: #4386F5;
              vertical-align: middle;
            }
          }
          .el-date-editor {
            width: 190px;
          }
          /deep/ .el-range__close-icon {
            display: none;
          }
          /deep/ .el-range-separator {
            padding: 0;
          }
        }
        .chart {
          width: 500px;
          height: 400px;
        }
        .chart.no-data {
          background: url('./no_result.svg') no-repeat center center;
          background-size: 80px;
        }
    }
    .productivity-by-day-wrapper, .productivity-by-month-wrapper {
      padding: 20px;
      margin-top: 20px;
      border-radius: 10px;
      background: #fff;
      box-shadow: 0 0 10px #E3E3E3;
      .no-data {
        height: 400px;
        background: url('./no_result.svg') no-repeat center center;
        background-size: 80px;
      }
      .header {
        font-size: 15px;
        & > div {
          float: right;
        }
        p {
          float: left;
          color: $blue;
          line-height: 21px;
          font-size: 15px;
          &::before {
            margin-right: 7px;
            content: '';
            display: inline-block;
            width: 4px;
            height: 21px;
            border-radius: 2px;
            background: $blue;
            vertical-align: middle;
          }
        }
        a {
          margin-right: 20px;
          font-size: 12px;
          line-height: 1;
          color: $blue;
        }
        .el-date-editor--daterange, .el-date-editor--monthrange {
          width: 190px;
        }
        /deep/ .el-range-separator {
          padding: 0;
        }
        /deep/ .el-range__close-icon {
          display: none;
        }
      }
    }
    .table-container {
      margin-top: 5px;
      /deep/ .text-left {
        color: $grey;
      }
    }
    .pagination-wrapper {
      height:50px;
      text-align:right;
      font-size: 12px;
      line-height: 16px;
      color: #20293B;
      /deep/ .arrowUp{
        display: none;
      }
      /deep/ {
        .el-pagination__sizes {
          margin: 0 -6px 0 0;
        }
        .el-pagination .btn-prev {
          padding-left: 0;
        }
        .el-pagination__jump {
          margin-left: 0;
        }
        .el-pagination {
          padding: 11px 5px;
        }
        .el-pagination__total {
          float: left;
          color: #575757;
        }
        .el-pagination .el-select .el-input .el-input__inner {
          padding-right: 10px;
          border: none;
        }
        .el-select .el-input .el-select__caret {
          color: #20293B;
          font-weight: bold;
        }
        .el-pagination button:disabled {
          color: #AFB4BF;
        }
        .el-pager li {
          color: #7D8493;
        }
        .el-pager li.active {
          width: 30px;
          height: 30px;
          background: #F6F6F6;
          color: #20293B;
          border-radius: 2px;
        }
        .el-pagination__editor.el-input .el-input__inner {
          font-size: 12px;
          font-weight: bold;
          line-height: 16px;
          color: #20293B;
          width: 30px;
          height: 30px;
          background: #FFFFFF;
          border: 1px solid #E5E5E5;
          border-radius: 2px;
        }
      }
    }
    .company-info-edit-wrapper {
      /deep/ {
        .el-dialog {
          width: 460px;
        }
        .el-dialog__header {
          display: none;
        }

        .el-dialog__body {
          padding: 24px 40px 20px;
          h2 {
            font-weight: normal;
            color: #3A3E44;
            font-size: 16px;
            line-height: 1;
          }
          .el-form {
            margin-top: 30px;
          }
          .el-date-editor.el-input {
            width: 100%;
          }
          .el-button {
            width: 60px;
            height: 34px;
            padding: 0;
          }
        }
      }
    }
    .datablau-table-wrapper {
      font-size: 12px;
    }
  }
</style>
