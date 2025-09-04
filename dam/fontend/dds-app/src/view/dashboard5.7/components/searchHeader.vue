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
      <el-form-item :label="$t('assetCount.cycle')">
        <div class="reportingPeriod">
          <el-date-picker
            class="searchHeadDate"
            v-model="form.cycleMonth"
            type="month"
            :placeholder="$t('assetCount.selectMonth')"
            :format="$t('assetCount.dateType')"
            size="small"
            value-format="yyyy-MM"
            style="width: 134px; display: inline-block"
          ></el-date-picker>

          <datablau-select
            v-model="form.cycleLatitude"
            style="width: 70px; display: inline-block"
          >
            <el-option
              :label="$t('assetCount.monthMid')"
              value="15"
            ></el-option>
            <el-option
              :label="$t('assetCount.monthEnd')"
              value="01"
            ></el-option>
          </datablau-select>
        </div>
      </el-form-item>
      <el-form-item :label="$t('assetCount.system')">
        <datablau-select
          ref="system"
          style="width: 200px"
          v-model="form.categoryId"
          size="small"
          :placeholder="$t('assetCount.selectSystem')"
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
      <el-form-item :label="$t('assetCount.org')">
        <datablau-select
          ref="system"
          style="width: 200px"
          v-model="form.orgBm"
          size="small"
          :placeholder="$t('assetCount.selectOrg')"
          filterable
          clearable
          @change="getLabelOrganization"
        >
          <el-option
            v-for="item in organizationTree"
            :key="item.bm"
            :label="item.fullName"
            :value="item.bm"
          ></el-option>
        </datablau-select>
      </el-form-item>
      <el-form-item :label="$t('assetCount.ruleSource')">
        <datablau-select
          v-model="form.bizTypeSelectOption"
          :placeholder="$t('assetCount.placeSelect')"
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
      <el-form-item :label="$t('assetCount.importance')">
        <datablau-select
          v-model="form.importance"
          :placeholder="$t('assetCount.placeSelect')"
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
      <el-form-item :label="$t('assetCount.isBeOverdue')">
        <datablau-select
          class="width"
          v-model="form.hasOverDate"
          style="width: 100px"
        >
          <el-option :label="$t('assetCount.allState')" value=""></el-option>
          <el-option :label="$t('assetCount.yes')" :value="true"></el-option>
          <el-option :label="$t('assetCount.no')" :value="false"></el-option>
        </datablau-select>
      </el-form-item>
    </el-form>

    <div
      class="search-btn"
      :class="{ searchBtn2: scrollWidth2 > 1380 }"
      v-if="!downloadPdf"
    >
      <datablau-button type="normal" @click="search">
        {{ $t('assetCount.query') }}
      </datablau-button>
      <datablau-button type="secondary" @click="reset">
        {{ $t('assetCount.reset') }}
      </datablau-button>
    </div>
    <div v-if="downloadPdf">
      <el-form
        class="searchHead searchHead1"
        :style="{
          width: scrollWidth,
        }"
      >
        <el-form-item :label="$t('assetCount.cycle') + '：'">
          <p class="pdf-value">
            {{ form.cycleMonth }}
            {{
              form.cycleLatitude === '15'
                ? $t('assetCount.monthMid')
                : $t('assetCount.monthEnd')
            }}
          </p>
        </el-form-item>
        <el-form-item :label="$t('assetCount.system') + '：'">
          <p class="pdf-value">{{ categoryIdLabel }}</p>
        </el-form-item>
        <el-form-item :label="$t('assetCount.org') + '：'">
          <p class="pdf-value">{{ bmLabel }}</p>
        </el-form-item>
        <el-form-item :label="$t('assetCount.ruleSource') + '：'">
          <p class="pdf-value">{{ businessTypeLabel }}</p>
        </el-form-item>
        <el-form-item :label="$t('assetCount.importance') + '：'">
          <p class="pdf-value">{{ importanceLabel }}</p>
        </el-form-item>
        <el-form-item :label="$t('assetCount.isBeOverdue') + '：'">
          <p class="pdf-value" v-if="form.hasOverDate === ''">
            {{ $t('assetCount.allState') }}
          </p>
          <p class="pdf-value" v-if="form.hasOverDate === true">
            {{ $t('assetCount.yes') }}
          </p>
          <p class="pdf-value" v-if="form.hasOverDate === false">
            {{ $t('assetCount.no') }}
          </p>
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
      businessTypeList: [],
      organizationTree: [],
      downloadPdf: false,
      categoryIdLabel: '',
      bmLabel: '',
      businessTypeLabel: '',
      importanceLabel: '',
    }
  },
  computed: {
    importanceList() {
      return [
        {
          label: this.$t('assetCount.importanceList.p1'),
          value: 1,
        },
        {
          label: this.$t('assetCount.importanceList.p2'),
          value: 2,
        },
        {
          label: this.$t('assetCount.importanceList.p3'),
          value: 3,
        },
        {
          label: this.$t('assetCount.notInput'),
          value: -1,
        },
      ]
    },
  },
  mounted() {
    this.getBigClassListAndBusinessTypeList()
    this.getCutDate()
    this.getOrganizationList()
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
    getLabelCategories(categoryId) {
      this.$modelCategories.find(item => {
        if (item.categoryId === categoryId) {
          this.categoryIdLabel = item.displayName
        }
      })
    },
    getLabelOrganization(bm) {
      this.organizationTree.find(item => {
        if (item.bm === bm) {
          this.bmLabel = item.fullName
        }
      })
    },
    getLabelbusinessType(value) {
      this.businessTypeList.find(item => {
        if (item.value === value) {
          this.businessTypeLabel = item.label
          console.log(this.businessTypeLabel)
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
          `${this.$url}/service/dashboard/quality/secondDashboard/getCutDate`
        )
        .then(res => {
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
          .post(`${this.$url}/service/dashboard/quality/secondDashboard`, list)
          .then(res => {
            setTimeout(() => {
              this.$bus.$emit('dashboardDataChange', res.data)
              this.$bus.$emit('dashboardLoading', false)
            }, 100)
          })
          .catch(e => {
            this.$bus.$emit('dashboardLoading', true)
            this.$showFailure(e)
          })
      }
    },
    getBigClassListAndBusinessTypeList() {
      return new Promise(resolve => {
        this.$http
          .post(`${this.$url}/service/select/option/query`, {
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
    getOrganizationList() {
      this.organizationTree = []
      this.$http
        .get(`/user/org/organization/tree/`)
        .then(res => {
          this.organizationTree = res.data.children
          let all = {
            bm: res.data.bm,
            fullName: '全部组织机构',
          }
          this.organizationTree.unshift(all)
        })
        .catch(e => {
          this.$showFailure(e)
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
