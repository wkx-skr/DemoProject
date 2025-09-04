<template>
  <div class="theme-detail-outer">
    <div class="theme-detail">
      <datablau-form-submit>
        <div>
          <div class="form-part">
            <el-form :inline="true">
              <el-form-item
                :label="`${$t('domain.common.theme')}:`"
                class="theme-filter-input"
              >
                <datablau-select size="mini" v-model="themeValue" filterable>
                  <el-option
                    v-for="item in themeArr"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  ></el-option>
                </datablau-select>
              </el-form-item>
              <el-form-item
                :label="`${$t('domain.common.domainName')}:`"
                class="theme-filter-input"
              >
                <datablau-input
                  maxlength="100"
                  type="text"
                  size="mini"
                  :placeholder="$t('domain.common.search') + $t('domain.common.domainName')"
                  v-model="standardValue"
                  clearable
                ></datablau-input>
              </el-form-item>

              <el-form-item
                :label="`${$t('domain.common.system')}:`"
                class="theme-filter-input"
              >
                <datablau-select size="mini" v-model="systemValue" filterable>
                  <el-option
                    v-for="item in systemArr"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  ></el-option>
                </datablau-select>
              </el-form-item>
              <el-form-item
                :label="`${$t('domain.common.domainPropCode')}:`"
                class="theme-filter-input"
              >
                <datablau-input
                  maxlength="100"
                  type="text"
                  size="mini"
                  :placeholder="$t('domain.common.search') + $t('domain.common.domainPropCode')"
                  v-model="domainCode"
                  clearable
                ></datablau-input>
              </el-form-item>
              <el-form-item>
                <datablau-button
                  :disabled="tableLoading || updateRefresh"
                  type="normal"
                  size="mini"
                  @click="showSearch"
                >
                  {{ $t('domain.common.search') }}
                </datablau-button>
                <datablau-button type="secondary" size="mini" @click="reset">
                  {{ $t('domain.common.reset') }}
                </datablau-button>
                <datablau-button
                  type="secondary"
                  :disabled="tableLoading || updateRefresh"
                  @click="handleRefresh()"
                >
                  {{ $t('domain.common.refresh') }}
                </datablau-button>
              </el-form-item>
              <datablau-button
                style="position: absolute; top: 0; right: 0"
                class="iconfont icon-export"
                type="primary"
                @click="handleExport(1)"
              >
                {{ $t('domain.common.export') }}
              </datablau-button>
            </el-form>
          </div>
          <div class="table-part" :style="{ top: topNum + 'px' }">
            <datablau-table
              class="datablau-table"
              :data="tableData"
              height="100%"
              v-loading="tableLoading || updateRefresh"
              :data-selectable="true"
              style="min-width: 800px"
              @selection-change="handleSelectionChange"
            >
              <el-table-column width="28">
                <datablau-icon
                  :data-type="'datastandard'"
                  :size="18"
                  style="margin-top: 8px"
                ></datablau-icon>
              </el-table-column>
              <el-table-column
                type="index"
                width="50"
                :label="$t('domain.common.orderIndex')"
              ></el-table-column>
              <el-table-column
                prop="theme"
                :label="$t('domain.common.themeName')"
                min-width="50"
              ></el-table-column>
              <el-table-column
                prop="categoryName"
                :label="$t('domain.common.systemName')"
                min-width="50"
              ></el-table-column>
              <el-table-column
                prop="domainName"
                :label="$t('domain.common.domainName')"
                min-width="50"
              ></el-table-column>
              <el-table-column
                prop="domainCode"
                :label="$t('domain.common.domainPropCode')"
                min-width="50"
              ></el-table-column>
              <el-table-column
                prop="refCount"
                :label="$t('domain.common.quoteCount')"
                width="$i18n.locale === 'en' ? 140 : 120"
                sortable
                align="center"
              ></el-table-column>
              <el-table-column
                :label="$t('domain.common.operation')"
                fixed="right"
                width="100"
                header-align="center"
                align="center"
                v-if="!$route.path.includes('dataCatalogDashboard')"
              >
                <template slot-scope="scope">
                  <datablau-button
                    @click="handleRowClick(scope.row)"
                    type="icon"
                    size="mini"
                    class="iconfont icon-see"
                    :tooltip-content="$t('domain.common.check')"
                  ></datablau-button>
                </template>
              </el-table-column>
            </datablau-table>
          </div>
        </div>
        <template slot="buttons">
          <div class="bottom-line">
            <div class="left-btn">
              <span
                class="footer-row-info"
                v-show="idArr.length && idArr.length > 0"
              >
                {{
                  $t('common.deleteMessage', {
                    selection: idArr.length,
                  })
                }}
              </span>
              <div
                class="bottom-btns-container"
                v-show="idArr.length && idArr.length"
              >
                <datablau-button
                  size="mini"
                  class="iconfont icon-export"
                  type="important"
                  @click="handleExport(2)"
                >
                  {{ $t('domain.common.exportSelected') }}
                </datablau-button>
              </div>
            </div>
            <datablau-pagination
              class="pagination-component"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
              :current-page.sync="currentPage"
              :page-sizes="[20, 50, 100]"
              :page-size="pageSize"
              layout="total, sizes, prev, pager, next, jumper"
              :total="total"
            ></datablau-pagination>
          </div>
        </template>
      </datablau-form-submit>
    </div>
  </div>
</template>

<script>
export default {
  props: ['themeName', 'systemName', 'standardName', 'domainCodeName'],
  data() {
    return {
      tableData: [],
      tableLoading: false,
      currentPage: 1,
      pageSize: 20,
      total: 0,
      themeArr: [
        {
          label: this.$t('domain.common.all'),
          value: '',
        },
      ],
      systemArr: [
        {
          label: this.$t('domain.common.all'),
          value: '',
        },
      ],
      searchData: [],
      themeValue: '',
      systemValue: '',
      standardValue: '',
      domainCode: '',
      allData: [],
      storeData: [],
      idArr: [],
      standDelete: ['tableData', 'allData'],
      timer: null,
      topNum: 44,
      updateRefresh: false,
    }
  },
  mounted() {
    this.$bus.$on('refreshEnd', () => {
      this.updateRefresh = false
      this.init()
    })
    this.themeValue = this.themeName
    this.systemValue = this.systemName
    this.standardValue = this.standardName
    this.domainCode = this.domainCodeName
    this.init().then(() => {
      this.getDropList()
    })
  },
  beforeDestroy() {
    this.$bus.$off('refreshEnd')
    this.standDelete.forEach(item => {
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
  },
  methods: {
    // domResize(data) {
    //   let height = Number.parseFloat(data.height)
    //   console.log(height)
    //   this.$nextTick(() => {
    //     this.topNum = height > 44 ? 88 : 44
    //   })
    // },
    handleRefresh() {
      // debounce
      this.tableLoading = true
      this.updateRefresh = true
      this.timer && clearTimeout(this.timer)
      this.timer = setTimeout(() => {
        this.$emit('handleStatisticsRefresh')
      }, 500)
    },
    getDropList() {
      this.$http
        .get(
          this.$meta_url + '/service/dashboard/domain/count/theme/detail/drop'
        )
        .then(res => {
          res.data.theme.forEach(e => {
            const obj1 = {
              label: e,
              value: e,
            }
            this.themeArr.push(obj1)
          })
          res.data.categoryName.forEach(e => {
            const obj2 = {
              label: e,
              value: e,
            }
            this.systemArr.push(obj2)
          })
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    init() {
      return new Promise(resolve => {
        this.tableLoading = true
        const obj = {
          theme: this.themeValue,
          categoryName: this.systemValue,
          domainName: this.standardValue,
          domainCode: this.domainCode,
          pageSize: this.pageSize,
          currentPage: this.currentPage,
        }
        this.$http
          .post(
            this.$meta_url + '/service/dashboard/domain/count/theme/detail',
            obj
          )
          .then(res => {
            this.tableData = res.data.content
            this.total = res.data.totalItems
            this.tableLoading = false
            resolve()
          })
          .catch(e => {
            this.$showFailure(e)
            this.tableLoading = false
          })
      })
    },
    showSearch() {
      this.currentPage = 1
      this.init()
    },
    reset() {
      this.themeValue = ''
      this.systemValue = ''
      this.standardValue = ''
      this.domainCode = ''
      this.currentPage = 1
      this.init()
    },
    handleSizeChange(val) {
      this.currentPage = 1
      this.pageSize = val
      this.init()
    },
    handleCurrentChange(val) {
      this.currentPage = val
      this.init()
    },
    handleSelectionChange(val) {
      if (val.length) {
        this.idArr = val.map(item => item.id)
      } else {
        this.idArr = []
      }
    },
    toBack() {
      if (this.type === 'system') {
        this.$emit('showSystem')
      } else if (this.type === 'forceCalculate') {
        this.$emit('showForceCalculate')
      } else {
        this.$emit('showTheme')
      }
      this.$emit('backSystem')
    },
    handleRowClick(row) {
      console.log(row)
      this.$emit('showImpactAnalysis', row)
    },
    handleExport(index) {
      if (index === 1) {
        const url = `${this.$meta_url}/service/dashboard/domain/count/theme/detail/export`
        const obj = {
          theme: this.themeValue,
          categoryName: this.systemValue,
          domainName: this.standardValue,
          domainCode: this.domainCode,
        }
        this.$downloadFilePost(
          url,
          obj,
          this.$t('domain.queryStandard.domainQuoteCount')
        )
      } else if (index === 2) {
        if (!this.idArr.length) {
          this.$message.info(this.$t('domain.common.pleaseCheckItems'))
          return
        }
        const url = `${this.$meta_url}/service/dashboard/domain/count/theme/detail/export`
        const ids = this.idArr
        this.$downloadFilePost(
          url,
          { countIds: ids },
          this.$t('domain.queryStandard.domainQuoteCount')
        )
      }
    },
  },
}
</script>
<style lang="scss" scoped>
@mixin absPos() {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.theme-detail-outer {
  @include absPos();
  top: 20px;

  .theme-detail {
    @include absPos();

    .bottom-line {
      .left-btn {
        display: inline-block;
        //padding-top: 5px;
        vertical-align: middle;
      }

      .bottom-btns-container {
        display: inline-block;
      }

      .pagination-component {
        float: right;
      }
    }
  }
}
</style>
<style lang="scss">
.part-title {
  font-size: 16px;
  margin: 10px 0;
}

.form-part {
  margin-left: 0;

  .el-form-item {
    margin-right: 20px;
  }
  .theme-filter-input {
    .el-form-item__content {
      width: 150px;
    }
  }
}
.table-part {
  border-top: 1px solid #e5e5e5;
  position: absolute;
  width: 100%;
  top: 44px;
  bottom: 0;
}
</style>
