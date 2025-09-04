<template>
  <div class="catalog-count-com" id="catalog-count-list">
    <div class="component-title">{{ $version.dashboard.systemAsset }}</div>
    <div class="list-container" v-loading="showLoading">
      <div
        @click="goToDataCatalog(item)"
        class="list-item"
        v-for="item in listData"
        :key="item.id"
      >
        <el-row :gutter="20" justify="space-around">
          <el-col :span="mediaStyleData.cloWithArr[0]">
            <div class="left-part">
              <div class="system-icon"></div>
              <div class="catalog-count">
                <datablau-tooltip
                  :content="getModelcatalogName(item.modelCategoryId)"
                  placement="bottom"
                  style="width: 100%"
                  :disabled="true"
                >
                  <div class="cata-name">
                    {{ getModelcatalogName(item.modelCategoryId) }}
                  </div>
                </datablau-tooltip>
                <div class="table-col-count">
                  <span class="count-icon data-source"></span>
                  <span class="count-title">
                    {{ $version.dataCatalog.tableDetail.dataSource }}
                  </span>
                  <span class="count-res" style="min-width: 32px">
                    {{ item.totalModel | getNumString }}
                  </span>
                  <span class="count-icon table"></span>
                  <span class="count-title">
                    {{ $version.dataCatalog.table }}:
                  </span>
                  <span class="count-res" style="min-width: 56px">
                    {{ item.totalTable | getNumString }}
                  </span>
                  <span class="count-icon column"></span>
                  <span class="count-title">
                    {{ $version.dataCatalog.column }}:
                  </span>
                  <span class="count-res">
                    {{ item.totalCol | getNumString }}
                  </span>
                </div>
              </div>
            </div>
          </el-col>
          <el-col :span="mediaStyleData.cloWithArr[1]">
            <div class="center-part">
              <div class="top-line">
                <span class="rate-icon alias-rate"></span>
                <span>{{ $version.dashboard.adequacy }}</span>
              </div>
              <div class="bottom-line">
                <div class="progress-container">
                  <el-progress
                    :text-inside="true"
                    :stroke-width="16"
                    :percentage="getAliasRate(item)"
                    color="#4386F5"
                    :text-color="textColor(getAliasRate(item))"
                    class="catalog-rate"
                    :class="{
                      toRight: getAliasRate(item) < 20,
                    }"
                  ></el-progress>
                </div>
              </div>
            </div>
          </el-col>
          <!-- <el-col
            :span="mediaStyleData.cloWithArr[1]"
            v-if="$featureMap.FE_DOMAIN"
          >
            <div class="right-part">
              <div class="top-line">
                <span class="rate-icon domain-rate"></span>
                <span>{{ $version.dashboard.standardCoverage }}</span>
              </div>
              <div class="bottom-line">
                <div class="progress-container">
                  <el-progress
                    :text-inside="true"
                    :stroke-width="16"
                    :percentage="getDomainRate(item)"
                    color="#4386F5"
                    :text-color="textColor(getDomainRate(item))"
                    :class="{
                      toRight: getDomainRate(item) < 20,
                    }"
                    class="catalog-rate"
                  ></el-progress>
                </div>
              </div>
            </div>
          </el-col> -->
          <!-- <el-col
            :span="mediaStyleData.cloWithArr[1]"
            v-if="
              $featureMap.FE_DOMAIN && $versionFeature['domain_Verification']
            "
          >
            <div class="right-part">
              <div class="top-line">
                <span class="rate-icon domain-rate"></span>
                <span>{{ $version.dashboard.verification }}</span>
              </div>
              <div class="bottom-line">
                <div class="progress-container">
                  <el-progress
                    :text-inside="true"
                    :stroke-width="16"
                    :percentage="getDomainMatch(item)"
                    color="#4386F5"
                    :text-color="textColor(getDomainMatch(item))"
                    :class="{
                      toRight: getDomainMatch(item) < 20,
                    }"
                    class="catalog-rate"
                  ></el-progress>
                </div>
              </div>
            </div>
          </el-col> -->
        </el-row>
      </div>
    </div>
  </div>
</template>

<script>
import DashboardMore from '@/view/dashboard5.5/commonDashboardComponent/dashboardMore.vue'
export default {
  data() {
    return {
      listData: [],
      showLoading: false,
      domainMatchType: {
        match: '完全映射',
        partMatch: '部分映射',
        notMatch: '无法映射',
      },
      mediaStyleData: {
        cloWithArr: [9, 5, 5, 5],
      },
      getData: this.$http.get(`${this.$meta_url}/service/entities/statistics`),
    }
  },
  components: {
    DashboardMore,
  },
  filters: {
    getNumString(val) {
      // val = 30004001;
      let result = ''
      if (!val && val !== 0) {
        return 'N/A'
      }
      do {
        let mo = val % 1000
        if (val > 1000) {
          if (mo < 10) {
            mo = '00' + mo
          } else if (mo < 100) {
            mo = '0' + mo
          }
        }
        result = mo + ',' + result
        val = parseInt(val / 1000)
      } while (val > 0)
      return result.slice(0, -1)
    },
  },
  created() {
    // 获取系统
    this.$getModelCategories()
  },
  mounted() {
    this.dataInit()
    const getColRate = para => {
      const totalCol = para.data.totalCol
      if (totalCol) {
        const result = parseInt((para.value / totalCol) * 100) + '%'
        return result || '0%'
      } else {
        return '0%'
      }
    }
    this.resetStyle()
    $(window).resize(this.resetStyle)
  },
  beforeDestroy() {
    $(window).unbind('resize', this.resetStyle)
  },
  methods: {
    textColor(percent) {
      if (percent < 20) {
        return '#555555'
      } else {
        return '#FFFFFF'
      }
    },
    dataInit() {
      this.showLoading = true
      this.getData
        .then(res => {
          const data = res.data
          data.sort((a, b) => {
            const totala = a.totalModel + a.totalCol + a.totalTable
            const totalb = b.totalModel + b.totalCol + b.totalTable
            return totalb - totala
          })
          this.listData = data
          this.showLoading = false
        })
        .catch(e => {
          this.showLoading = false
          this.$showFailure(e)
        })
    },
    getModelcatalogName(value) {
      const catalogname = this.$modelCategoriesMap[value]
      return catalogname || ''
    },
    getAliasRate(para) {
      // const totalCol = para.totalCol
      const part =
        para.colWithAlias +
        para.tableWithAlias +
        para.viewWithAlias +
        para.storeWithAlias +
        para.funWithAlias +
        para.packageWithAlias
      const total =
        para.totalTable +
        para.totalView +
        para.totalCol +
        para.totalStore +
        para.totalFun +
        para.totalPackage
      let result = 0
      if (total) {
        result = (part / total) * 100
      }
      result = result.toFixed(2)
      result = parseFloat(result)
      return result
    },
    getDomainRate(para) {
      const totalCol = para.totalCol
      let result = 0
      if (totalCol) {
        result = (para.colWithDomain / totalCol) * 100
      }
      result = result.toFixed(2)
      result = parseFloat(result)
      return result
    },
    getDomainMatch(para) {
      console.log(para, 'para')
      let result = 0
      const matchCount = para[this.domainMatchType.match]
      const total = para.colWithDomain
      const logicalColWithDomain = para.logicalColWithDomain
      if (matchCount && total) {
        result = matchCount / (total - logicalColWithDomain)
        if (isNaN(result)) {
          result = 0
        }
        result = result * 100
      }
      result = result.toFixed(2)
      result = parseFloat(result)
      return result
    },
    resetStyle() {
      const windowWidth = $(window).width()
      let mediaStyleData = {}
      if (windowWidth > 1680 && this.$i18n.locale === 'zh') {
        if (this.$versionFeature.domain_Verification) {
          mediaStyleData = {
            cloWithArr: [6, 6, 6, 6],
          }
        } else {
          mediaStyleData = {
            cloWithArr: [8, 8, 8],
          }
        }
      } else {
        if (this.$versionFeature.domain_Verification) {
          mediaStyleData = {
            cloWithArr: [9, 5, 5, 5],
          }
        } else {
          mediaStyleData = {
            cloWithArr: [10, 7, 7],
          }
        }
      }
      this.mediaStyleData = mediaStyleData
    },
    goToDataCatalog(system) {
      if (this.$auth.METADATA_VIEW) {
        let pageUrl = this.BaseUtils.RouterUtils.getFullUrl('dataCatalog', {
          modelCategory: system.modelCategoryId,
        })
        location.href = pageUrl
      } else {
        this.$message.error('您暂无访问权限')
      }
    },
  },
  watch: {},
}
</script>

<style lang="scss">
$itemHieght: 80px;
.catalog-count-com {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  background-color: var(--white-grey-bgc);
  overflow: auto;
  .component-title {
    font-size: 14px;
    font-weight: bold;
    padding: 18px 0 0 20px;
  }
  .list-container {
    box-sizing: border-box;
    padding: 20px 0;
    min-width: 950px;
    .list-item {
      border-bottom: 1px solid var(--border-color-lighter);
      height: $itemHieght;
      padding: 0 20px;
      transition: all 0.3s;
      &:hover {
        cursor: pointer;
        background-color: var(--main-content-bgc);
      }
      .left-part {
        position: relative;
        height: $itemHieght;
        vertical-align: top;
        .system-icon {
          position: absolute;
          top: 50%;
          left: 0;
          transform: translateY(-50%);
          background-color: #4386f5;
          // border-radius: 50%;
          border-radius: 10px;
          width: 40px;
          height: 40px;
          text-align: center;
          color: #fff;
          // border: 1px solid #ccc;
          background: #4386f5 url('~@/assets/images/system_icon.png') no-repeat
            center;
        }
        .catalog-count {
          position: absolute;
          top: 50%;
          left: 65px;
          transform: translateY(-50%);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          display: inline-block;
          box-sizing: border-box;
          width: calc(100% - 65px);
          .cata-name {
            padding-bottom: 10px;
            display: inline-block;
            width: 100%;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
          .table-col-count {
            // vertical-align: top;
            width: 100%;
            height: 20px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            // border: 1px solid red;
            .count-icon {
              // border: 1px solid #aaa;
              display: inline-block;
              width: 16px;
              height: 16px;
              // border-radius: 50%;
              vertical-align: bottom;
              // entity.png
              &.data-source {
                background: url('~@/assets/images/system_count_list.png')
                  no-repeat center/contain;
              }
              &.table {
                background: url('~@/assets/images/system_entity.png') no-repeat
                  center/contain;
              }
              &.column {
                background: url('~@/assets/images/system_column.png') no-repeat
                  center/contain;
              }
            }
            .count-title {
              display: inline-block;
              padding-left: 2px;
              padding-right: 4px;
              vertical-align: bottom;
            }
            .count-res {
              display: inline-block;
              vertical-align: bottom;
              // margin-right: 16px;
              min-width: 40px;
            }
          }
        }
      }
      .center-part,
      .right-part {
        .top-line {
          padding-top: 20px;
          margin-bottom: 10px;
          .rate-icon {
            display: inline-block;
            background-color: #aaa;
            width: 16px;
            height: 16px;
            &.alias-rate {
              background: url('~@/assets/images/col_with_alias_rate.png')
                no-repeat center;
            }
            &.domain-rate {
              background: url('~@/assets/images/modelTree/domain.png') no-repeat
                center;
            }
          }
          span {
            vertical-align: bottom;
          }
        }
        .bottom-line {
          .progress-container {
            width: 80%;
            .el-progress-bar__outer {
              height: 16px;
              border-radius: 4px;
              background-color: #efefef;
              .el-progress-bar__inner {
                border-radius: 4px;
              }
            }
          }
        }
      }
    }
  }
}
</style>
<style lang="scss">
#catalog-count-list.catalog-count-com {
  .toRight .el-progress-bar__innerText {
    position: absolute;
    left: 100%;
    top: 2px;
  }
  .catalog-rate {
    .el-progress-bar__outer {
    }
  }
}
</style>
