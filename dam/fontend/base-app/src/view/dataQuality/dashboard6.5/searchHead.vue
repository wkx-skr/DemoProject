<template>
  <!-- 搜索头部 -->
  <div class="box" v-resize="domResize">
    <el-form
      class="searchHead"
      :style="{
        width: scrollWidth,
      }"
      v-if="!downloadPdf"
    >
      <el-form-item
        :label="$t('quality.page.qualityDashboardNew.searchTab.reportingCycle')"
      >
        <div class="reportingPeriod">
          <el-date-picker
            class="searchHeadDate"
            v-model="form.cycleMonth"
            type="month"
            placeholder="选择月"
            :format="$i18n.locale === 'zh' ? 'yyyy 年 MM 月' : 'yyyy-MM'"
            size="small"
            value-format="yyyy-MM"
            style="width: 134px; display: inline-block"
            :clearable="false"
            :picker-options="pickerOptions"
            @change="changeCycleMonth"
          ></el-date-picker>

          <datablau-select
            v-model="form.cycleLatitude"
            :style="{ width: $i18n.locale === 'zh' ? '70px' : '110px' }"
            style="width: 70px; display: inline-block"
          >
            <el-option
              :label="$t('quality.page.qualityDashboardNew.searchTab.midMonth')"
              value="15"
            ></el-option>
            <el-option
              :label="$t('quality.page.qualityDashboardNew.searchTab.endMonth')"
              value="01"
              :disabled="isMonthEndDisabled"
            ></el-option>
          </datablau-select>
        </div>
      </el-form-item>
      <el-form-item
        :label="$t('quality.page.qualityDashboardNew.searchTab.system')"
      >
        <datablau-select
          ref="system"
          style="width: 200px"
          v-model="form.categoryId"
          size="small"
          :placeholder="
            $t('quality.page.qualityDashboardNew.searchTab.systemPlaceholder')
          "
          filterable
          clearable
          @change="getLabelCategories"
        >
          <el-option
            v-for="item in $modelCategories"
            :key="item.categoryId"
            :label="item.displayName"
            :value="item.categoryId"
          ></el-option>
        </datablau-select>
      </el-form-item>
      <el-form-item
        :label="$t('quality.page.qualityDashboardNew.searchTab.organization')"
      >
        <datablau-input
          :value="bmLabel"
          readonly
          :placeholder="
            $t(
              'quality.page.qualityDashboardNew.searchTab.organizationPlaceholder'
            )
          "
          @click.native="handleSelectBranch"
        ></datablau-input>
      </el-form-item>
      <el-form-item
        :label="$t('quality.page.qualityDashboardNew.searchTab.businessType')"
      >
        <datablau-select
          v-model="form.bizTypeSelectOption"
          :placeholder="$t('el.select.placeholder')"
          style="width: 144px"
          filterable
          clearable
          @change="getLabelbusinessType"
        >
          <el-option
            v-for="item in businessTypeList"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          ></el-option>
        </datablau-select>
      </el-form-item>
      <el-form-item
        :label="$t('quality.page.qualityDashboardNew.searchTab.importance')"
      >
        <datablau-select
          v-model="form.importance"
          :placeholder="$t('el.select.placeholder')"
          style="width: 144px"
          filterable
          clearable
          @change="getLabelImportance"
        >
          <el-option
            v-for="item in importanceList"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          ></el-option>
        </datablau-select>
      </el-form-item>
      <el-form-item
        :label="$t('quality.page.qualityDashboardNew.searchTab.overdue')"
      >
        <datablau-select
          class="width"
          v-model="form.hasOverDate"
          style="width: 100px"
        >
          <el-option
            :label="
              $t(
                'quality.page.qualityDashboardNew.searchTab.importanceOption.all'
              )
            "
            value=""
          ></el-option>
          <el-option
            :label="
              $t(
                'quality.page.qualityDashboardNew.searchTab.importanceOption.true'
              )
            "
            :value="true"
          ></el-option>
          <el-option
            :label="
              $t(
                'quality.page.qualityDashboardNew.searchTab.importanceOption.false'
              )
            "
            :value="false"
          ></el-option>
        </datablau-select>
      </el-form-item>
    </el-form>

    <div
      class="search-btn"
      :class="{ searchBtn2: scrollWidth2 > 1380 }"
      v-if="!downloadPdf"
    >
      <datablau-button type="normal" @click="search">
        {{ $t('common.button.query') }}
      </datablau-button>
      <datablau-button type="secondary" @click="reset">
        {{ $t('common.button.reset') }}
      </datablau-button>
    </div>
    <div v-if="downloadPdf">
      <el-form
        class="searchHead searchHead1"
        :style="{
          width: scrollWidth,
        }"
      >
        <el-form-item label="汇报周期：">
          <p class="pdf-value">
            {{ form.cycleMonth }}
            {{ form.cycleLatitude === '15' ? '月中' : '月底' }}
          </p>
        </el-form-item>
        <el-form-item label="系统：">
          <p class="pdf-value">{{ categoryIdLabel }}</p>
        </el-form-item>
        <el-form-item label="组织机构：">
          <p class="pdf-value">{{ bmLabel }}</p>
        </el-form-item>
        <el-form-item label="业务类型：">
          <p class="pdf-value">{{ businessTypeLabel }}</p>
        </el-form-item>
        <el-form-item label="重要程度：">
          <p class="pdf-value">{{ importanceLabel }}</p>
        </el-form-item>
        <el-form-item label="是否逾期：">
          <p class="pdf-value" v-if="form.hasOverDate === ''">全部状态</p>
          <p class="pdf-value" v-if="form.hasOverDate === true">是</p>
          <p class="pdf-value" v-if="form.hasOverDate === false">否</p>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>
<script>
export default {
  name: 'searchHead',
  components: {},
  data() {
    return {
      scrollWidth: null,
      scrollWidth2: null,
      value: '',
      eventStartTime: '',
      form: {
        cycleMonth: null,
        cycleLatitude: '',
        bms: '',
        orgBm: '',
        importance: '',
        bizTypeSelectOption: '',
        categoryId: '',
        hasOverDate: '',
      },
      latitudeOptions: [],
      importanceList: [
        {
          label: this.$t('quality.page.qualityRule.detail.importanceList.p1'),
          value: 1,
        },
        {
          label: this.$t('quality.page.qualityRule.detail.importanceList.p2'),
          value: 2,
        },
        {
          label: this.$t('quality.page.qualityRule.detail.importanceList.p3'),
          value: 3,
        },
        {
          label: this.$t(
            'quality.page.qualityDashboardNew.searchTab.notFilled'
          ),
          value: -1,
        },
      ],
      businessTypeList: [],
      organizationTree: [],
      downloadPdf: false,
      categoryIdLabel: '',
      bmLabel: '',
      businessTypeLabel: '',
      importanceLabel: '',
      pickerOptions: {
        disabledDate(time) {
          const timeyear = time.getFullYear() // 获取时间选择器的年份
          let timemonth = time.getMonth() + 1 // 获取时间选择器的月份
          if (timemonth >= 1 && timemonth <= 9) {
            timemonth = '0' + timemonth
          }
          const elTimeData = timeyear.toString() + timemonth.toString()
          const date = new Date()
          let year = date.getFullYear()
          let month = date.getMonth() + 1
          if (month >= 1 && month <= 9) {
            month = '0' + month
          }
          const currentDate = year.toString() + month.toString()
          return elTimeData > currentDate
        },
      },
      currentDate: '',
      originType: '15',
    }
  },
  created() {
    this.getCurrentDate()
  },
  mounted() {
    this.getBigClassListAndBusinessTypeList()
    this.getCutDate()
    $(window).resize(this.getData)
    this.$bus.$on('downloadPdfStatus', data => {
      this.downloadPdf = data
    })
    this.$bus.$on('dashboardSearch', data => {
      this.getCutDate()
    })
  },
  beforeDestroy() {
    this.$bus.$off('dashboardDataChange')
    this.$bus.$off('dashboardSearch')
    this.$bus.$off('downloadPdfStatus')
    $(window).unbind('resize', this.getData)
  },
  methods: {
    getCurrentDate() {
      const date = new Date()
      let year = date.getFullYear()
      let month = date.getMonth() + 1
      if (month >= 1 && month <= 9) {
        month = '0' + month
      }
      const currentDate = year.toString() + month.toString()
      this.currentDate = currentDate
    },
    changeCycleMonth(val) {
      if (
        val.split('-').join('') >= this.currentDate &&
        this.originType === '15'
      ) {
        this.form.cycleLatitude = '15'
      }
    },
    getLabelCategories(categoryId) {
      this.$modelCategories.find(item => {
        if (item.categoryId === categoryId) {
          this.categoryIdLabel = item.displayName
        }
      })
    },
    handleSelectBranch() {
      this.$utils.branchSelect.open(false).then(res => {
        this.form.orgBm = res.bm
        this.bmLabel = res.fullName
      })
    },
    getLabelbusinessType(value) {
      this.businessTypeList.find(item => {
        if (item.value === value) {
          this.businessTypeLabel = item.label
        }
      })
    },
    getLabelImportance(value) {
      this.importanceList.find(item => {
        if (item.value === value) {
          this.importanceLabel = item.label
        }
      })
    },
    search() {
      this.getData()
    },
    reset() {
      this.form = {
        cycleMonth: null,
        cycleLatitude: '',
        bms: '',
        orgBm: '',
        importance: '',
        bizTypeSelectOption: '',
        categoryId: '',
        hasOverDate: '',
      }
      this.categoryIdLabel = ''
      this.bmLabel = ''
      this.businessTypeLabel = ''
      this.importanceLabel = ''
      this.getCutDate()
    },
    getLastMonth(m) {
      var date = new Date(m)
      var year = date.getFullYear() // 当前年：四位数字
      var month = date.getMonth() // 当前月：0-11

      if (month == 0) {
        // 如果是0，则说明是1月份，上一个月就是去年的12月
        year -= 1
        month = 12
      }

      month = month < 10 ? '0' + month : month // 月份格式化：月份小于10则追加个0

      let lastYearMonth = year + '-' + month

      return lastYearMonth
    },
    getNextMonth(m) {
      var arr = m.split('-')
      var year = arr[0] // 获取当前日期的年份
      var month = arr[1] // 获取当前日期的月份
      var day = arr[2] // 获取当前日期的日

      var year2 = year
      var month2 = parseInt(month) + 1
      if (month2 == 13) {
        // 12月的下月是下年的1月
        year2 = parseInt(year2) + 1
        month2 = 1
      }
      if (month2 < 10) {
        // 10月之前都需要补0
        month2 = '0' + month2
      }

      var nextMonth = year2 + '-' + month2
      return nextMonth
    },
    getCutDate() {
      this.$http
        .post(
          `${this.$quality_url}/dashboard/quality/secondDashboard/getCutDate`
        )
        .then(res => {
          this.originType = res.data.slice(8, 10)
          if (res.data.slice(8, 10) === '01') {
            this.form.cycleMonth = this.getLastMonth(res.data.slice(0, 7))
            this.form.cycleLatitude = res.data.slice(8, 10)
            this.getData()
          } else if (res.data.slice(8, 10) === '15') {
            this.form.cycleMonth = res.data.slice(0, 7)
            this.form.cycleLatitude = res.data.slice(8, 10)
            this.getData()
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    getData() {
      let cutDate
      if (this.form.cycleLatitude === '15') {
        cutDate = this.form.cycleMonth + '-' + this.form.cycleLatitude
      } else if (this.form.cycleLatitude === '01') {
        cutDate =
          this.getNextMonth(this.form.cycleMonth) +
          '-' +
          this.form.cycleLatitude
      }
      if (cutDate) {
        let list = {
          cutDate: cutDate,
          categoryId: this.form.categoryId,
          orgBm: this.form.orgBm,
          bizTypeSelectOption: this.form.bizTypeSelectOption,
          importance: this.form.importance,
          hasOverDate: this.form.hasOverDate,
        }
        this.$bus.$emit('dashboardLoading', true)
        this.$http
          .post(`${this.$quality_url}/dashboard/quality/secondDashboard`, list)
          .then(res => {
            setTimeout(() => {
              this.$bus.$emit('dashboardDataChange', res.data)
              this.$bus.$emit('dashboardLoading', false)
            }, 100)
          })
          .catch(e => {
            this.$bus.$emit('dashboardLoading', false)
            this.$showFailure(e)
          })
      }
    },
    getBigClassListAndBusinessTypeList() {
      return new Promise(resolve => {
        this.$http
          .post(`${this.$url}/select/option/get`, {
            category: 'TR',
            names: ['业务类型'],
          })
          .then(res => {
            const typeList = res.data.filter(e => e.optionName === '业务类型')
            typeList.forEach(e => {
              const typeObj = {
                label: e.optionValue,
                value: e.optionValue,
              }
              this.businessTypeList.push(typeObj)
            })
            resolve()
          })
          .catch(e => {
            this.$showFailure(e)
          })
      })
    },
    addBm() {
      this.$utils.branchSelect.open().then(res => {
        this.$set(this.form, 'bms', res.fullName)
        this.form.orgBm = res.bm
      })
    },
    domResize(data) {
      this.scrollWidth =
        data.width.slice(0, data.width.length - 2) -
        50 -
        $('.search-btn').width() +
        'px'
      this.scrollWidth2 =
        data.width.slice(0, data.width.length - 2) -
        50 -
        $('.search-btn').width()
    },
  },
  computed: {
    isMonthEndDisabled() {
      if (
        this.form.cycleMonth?.split('-').join('').toString() >=
          this.currentDate &&
        this.originType === '15'
      ) {
        return true
      }
    },
  },
  watch: {},
}
</script>
<style lang="scss">
.searchHead {
  //   width: 90%;
  height: 64px;
  //   height: 34px;
  padding-top: 15px;
  overflow-x: scroll;
  white-space: nowrap;
  .el-form-item {
    display: inline-block;
    margin-right: 20px;
    margin-bottom: 0px;
    .el-form-item__content {
      display: inline-block;
    }
    .el-form-item__label {
      padding-right: 6px;
    }
  }
  .searchHeadDate {
    .el-input--small .el-input__inner {
      border-radius: 2px;
    }
  }

  .reportingPeriod {
    .el-input--small .el-input__inner {
      border-radius: 2px 0 0 2px;
      border-right: none;
      &:hover {
        border-right: 1px solid #409eff;
      }
    }
    .datablau-select .el-select .el-input input {
      border-radius: 0 2px 2px 0;
      //   border-left: none;
    }
  }
}
</style>
<style scoped lang="scss">
.box {
  position: relative;
  background: var(--default-bgc);
  //   width: 100%;
  height: 64px;
  margin: 0 10px;
  margin-bottom: 8px;
  padding: 0 16px;
  display: flex;
  align-items: center;

  min-width: 1184px;
  .search-btn {
    position: absolute;
    right: 0;
    top: 0;
    right: 0;
    width: 170px;
    height: 64px;
    display: flex;
    align-items: center;
    box-shadow: 0 0 10px #eee;
    padding: 0 16px;
    background: #fff;
    &.searchBtn2 {
      box-shadow: none;
    }
  }
  .searchHead1 {
    display: flex;
  }
  .pdf-value {
    height: 32px;
    line-height: 32px;
    min-width: 80px;
  }
}
</style>
