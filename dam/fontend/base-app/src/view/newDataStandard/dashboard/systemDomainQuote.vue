<template>
  <div class="dashboard-item" :class="{ 'en-page': $i18n.locale !== 'zh' }">
    <title-line :title-text="$t('domain.dashboard.importDomainCountBySystem')">
      <div class="system-selector-container">
        <datablau-select
          size="mini"
          v-model="systemValue"
          @change="changeSystem"
          filterable
          :placeholder="$t('domain.common.chooseSystem')"
          clearable
          class="system-selector"
        >
          <el-option
            v-for="item in this.systemsArr"
            :key="item"
            :value="item"
            :label="item"
          ></el-option>
        </datablau-select>
      </div>
    </title-line>
    <div class="bottom-container" v-loading="loading">
      <div class="left-list">
        <el-carousel
          height="93%"
          :autoplay="false"
          arrow="never"
          :loop="false"
          trigger="click"
          indicator-position="outside"
        >
          <el-carousel-item
            v-for="(item, index) in pageData"
            :key="`${index}_page`"
          >
            <div class="table-outer">
              <ul class="list-outer">
                <li class="count-list-item" v-for="(count, index) in item">
                  <div class="list-item-outer" @click="handleClick(count)">
                    <span class="index-container">
                      <span class="item-index">{{ count.index }}</span>
                    </span>
                    <span class="system-name" :title="count.system">
                      {{ count.system }}
                    </span>
                    <div class="progress-container">
                      <el-tooltip effect="light">
                        <div slot="content" class="system-count-tooltip">
                          {{ $t('domain.dashboard.totalFieldCount') }}：{{
                            count.totalCol
                          }}
                          <br />
                          {{
                            $t('domain.dashboard.importDomainFieldCount')
                          }}：{{ count.colWithDomain }}
                          <br />
                          {{ $t('domain.dashboard.standardPairingRate') }}：{{
                            value2percent(count.coverPercent)
                          }}%
                        </div>
                        <div class="progress-outer">
                          <div class="progress-bar">
                            <el-progress
                              :percentage="count.coverPercent || 0"
                              :show-text="false"
                            ></el-progress>
                          </div>
                          <span class="border-line"></span>
                          <span class="right-text">
                            <div class="cover-percent">
                              <span>
                                {{ value2percent(count.coverPercent) }} %
                                <!--{{ 99.99 }} %-->
                              </span>
                            </div>
                          </span>
                        </div>
                      </el-tooltip>
                    </div>
                    <span
                      class="count-number"
                      :title="`${$t(
                        'domain.dashboard.systemImportDomainCount'
                      )}：${count.usedComma}`"
                    >
                      {{ count.usedComma }}
                    </span>
                  </div>
                </li>
              </ul>
            </div>
          </el-carousel-item>
        </el-carousel>
      </div>
      <div class="right-detail">
        <div class="top-system-name">{{ currentSystemData.systme }}</div>
        <div class="top-echarts">
          <div class="echarts-outer" ref="echartsContainer"></div>
        </div>
        <div class="bottom-count">
          <div class="count-item used-count">
            <span class="count-label">
              <span class="label-icon used-label-icon"></span>
              {{ $t('domain.dashboard.fieldWithDomainCount') }}
            </span>
            <span class="count-percent">
              {{ value2percent(currentSystemData.percent) }}%
            </span>
            <span class="count-num">{{ currentSystemData.usedSuffix }}</span>
          </div>
          <div class="count-item unused-count">
            <span class="count-label">
              <span class="label-icon unused-label-icon"></span>
              {{ $t('domain.dashboard.fieldWithoutDomainCount') }}
            </span>
            <span class="count-percent">
              {{ value2percent(100 - currentSystemData.percent) }}%
            </span>
            <span class="count-num">{{ currentSystemData.unusedSuffix }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import titleLine from './titleLine'
import HTTP from '@/http/main'
import nUtils from '@/utils/Number.js'

export default {
  name: 'systemDomainQuote',
  data() {
    return {
      loading: false,
      echartsInstance: null,
      getCount: null,
      allData: null,
      systemValue: this.$t('domain.common.allSystem'),
      systemsArr: [],
      allDomainCount: 0,
      listData: [],
      pageData: [],
      dataMap: {},
      currentSystemData: {},
      coverList: null,
      allCount: null,
      // pageList: [],
    }
  },
  components: {
    titleLine,
  },
  computed: {},
  mounted() {
    this.dataInit()
  },
  methods: {
    dataInit() {
      this.loading = true
      const getCount = HTTP.dashboardDomainCount()
      if (!this.getCount) {
        this.getCount = getCount
      }
      let getCover = HTTP.getSystemCoveredRate()

      Promise.all([getCount, getCover])
        .then(res => {
          // console.log(res, 'res')
          let [count, cover] = res
          const allData = count.data
          this.allData = allData
          this.coverList = cover.data
          this.getListData(allData)
          this.drawEcharts(this.getEchartsOptions(allData))
        })
        .catch(e => {
          this.$showFailure(e)
        })
        .finally(() => {
          this.loading = false
        })
    },
    getListData(count) {
      let listData = []
      let pageData = [] // default 10 / page
      let systemsArr = Object.keys(count.themeDtoMap).filter(
        item => item !== 'all_domain_count'
      )
      this.allDomainCount = count.allDomainCount
      let coverSystemMap = {}
      if (this.coverList && Array.isArray(this.coverList)) {
        this.coverList.forEach(item => {
          item.colWithDomain = item.colWithDomain || 0
          item.totalCol = item.totalCol || 0
          let categoryName = (
            this.$modelCategoriesDetailsMap[item.modelCategoryId] || {}
          ).categoryName
          coverSystemMap[categoryName] = item
        })
      }
      let totalCols = 0
      let totalColsWithDomain = 0
      // console.log(systemsArr, 'systemsArr')
      // console.log(coverSystemMap, 'coverSystemMap')
      systemsArr.forEach(item => {
        let data = count.themeDtoMap[item]
        let coverData = coverSystemMap[item]
        let coverPercent = 0
        let colWithDomain = 0
        let totalCol = 0
        if (coverData) {
          coverPercent = (coverData.colWithDomain * 100) / coverData.totalCol
          totalCols += coverData.totalCol || 0
          totalColsWithDomain += coverData.colWithDomain || 0
          colWithDomain = coverData.colWithDomain
          totalCol = coverData.totalCol

          // console.log(coverData.totalCol, 'coverData.totalCol')
        }
        let categoryCount = {
          // all: 0,
          used: 0,
          system: item,
          percent: 0,
          coverPercent: coverPercent,
          colWithDomain: colWithDomain,
          totalCol: totalCol,
        }
        _.merge(categoryCount, coverData)
        data.forEach(themeData => {
          categoryCount.used += themeData.used
        })

        // categoryCount.used = parseInt(
        //   categoryCount.used * Math.random() * 10000
        // )
        categoryCount.usedComma = nUtils.insertComma(categoryCount.used)
        // console.log(categoryCount, 'categoryCount')
        listData.push(categoryCount)
      })
      listData.sort((a, b) => b.coverPercent - a.coverPercent)
      this.allCount = {
        totalCols,
        totalColsWithDomain,
      }
      let maxUsed = 0
      if (listData.length > 0) {
        maxUsed = listData[0].used
      }

      let dataMap = {}
      listData.forEach((item, index) => {
        item.index = index + 1
        if (maxUsed) {
          item.percent = (item.used / maxUsed) * 100
        }
        dataMap[item.system] = item
      })
      this.dataMap = dataMap
      let pageSize = parseInt(listData.length / 3)
      if (pageSize < 10) {
        pageSize = 10
      }
      pageData.push(listData.slice(0, pageSize))
      pageData.push(listData.slice(pageSize, pageSize * 2))
      pageData.push(listData.slice(pageSize * 2, pageSize * 4))
      pageData = pageData.filter(item => item.length > 0)

      this.pageData = pageData
      this.systemsArr = systemsArr
      this.listData = listData
    },
    getEchartsOptions(count, system) {
      const allSystem = this.$t('domain.common.allSystem')
      if (!_.trim(system)) {
        system = allSystem
      }
      this.systemsArr = Object.keys(count.themeDtoMap).filter(
        item => item !== 'all_domain_count'
      )
      this.systemsArr.unshift(allSystem)

      let used = 0
      let unused = 0
      // console.log(this.allCount.totalCols, 'this.allCount.totalCols')
      if (system === allSystem) {
        used = this.allCount.totalColsWithDomain
        unused = this.allCount.totalCols - this.allCount.totalColsWithDomain
      } else {
        let currentData = this.dataMap[system] || {}
        used = currentData.colWithDomain
        unused = currentData.totalCol - currentData.colWithDomain
      }
      let data = {
        system,
        used,
        unused,
        usedComma: nUtils.insertComma(used),
        usedSuffix: nUtils.numberSuffixFormatter(used),
        unusedComma: nUtils.insertComma(unused),
        unusedSuffix: nUtils.numberSuffixFormatter(unused),
        percent: (used * 100) / (unused + used),
      }
      this.currentSystemData = data
      let result = {}
      result = {
        title: {
          text: system,
          left: 'center',
          top: 'center',
        },
        tooltip: {
          trigger: 'item',
        },
        series: [
          {
            type: 'pie',
            data: [
              {
                value: data.used,
                name: this.$t('domain.dashboard.fieldWithDomain'),
                itemStyle: {
                  color: '#23D597',
                },
              },
              {
                value: data.unused,
                name: this.$t('domain.dashboard.fieldWithoutDomain'),
                itemStyle: {
                  color: '#409EFF',
                },
              },
            ],
            radius: ['60%', '70%'],
          },
        ],
      }
      return result
    },
    drawEcharts(options) {
      if (!this.$refs.echartsContainer) return
      if (!this.echartsInstance) {
        this.echartsInstance = echarts.init(this.$refs.echartsContainer)
      }
      this.echartsInstance.setOption(options)
    },
    changeSystem(system) {
      this.drawEcharts(this.getEchartsOptions(this.allData, system))
    },
    handleClick(count) {
      this.systemValue = count.system
      this.changeSystem(count.system)
    },
    value2percent(value) {
      return nUtils.value2percent(value)
    },
  },
  beforeDestroy() {
    this.echartsInstance && this.echartsInstance.dispose()
  },
  watch: {},
}
</script>

<style lang="scss" scoped>
@mixin absPos {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

$text-width: 100px;

.dashboard-item {
  background-color: #fff;
  position: relative;
  overflow: auto;

  .bottom-container {
    @include absPos();
    top: 47px;
    min-height: 380px;
    min-width: 704px;
    overflow-x: hidden;

    .left-list {
      //border: 1px solid red;
      @include absPos();
      right: 350px;
      top: 5px;
      //width: 65%;

      .el-carousel {
        height: 100%;
        //border: 1px solid green;
      }

      .table-outer {
        overflow: auto;
        @include absPos();

        .list-outer {
          //border: 1px solid red;

          .count-list-item {
            height: 44px;
            //border: 1px solid red;
            vertical-align: middle;
            margin: 0 6px 0 20px;

            .list-item-outer {
              position: relative;
              height: 100%;
              cursor: pointer;
              border-bottom: 1px solid #eeeeee;
            }

            .index-container {
              //border: 1px solid green;
              position: relative;
              display: inline-block;
              vertical-align: middle;
              height: 100%;
              width: 20px;
              margin: 0 10px 0 0;

              .item-index {
                position: absolute;
                top: 50%;
                transform: translateY(-50%);
                display: inline-block;
                width: 20px;
                height: 20px;
                border-radius: 50%;
                background: #efefef;
                color: #555555;
                text-align: center;
                vertical-align: middle;
              }
            }

            $name-width: 190px;

            .system-name {
              display: inline-block;
              vertical-align: middle;
              width: $name-width;
              //width: 15%;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
              margin-right: 10px;
              color: #444444;
            }

            .progress-container {
              position: absolute;
              left: $name-width;
              right: 70px;
              top: 0;
              bottom: 0;
              //border: 1px solid red;
            }

            .progress-outer {
              position: relative;
              top: 50%;
              transform: translateY(-50%);
              display: inline-block;
              vertical-align: middle;
              width: 100%;
              height: 22px;
              background: #f5f5f5;
              border-radius: 11px;
              //border: 1px solid red;

              .progress-bar {
                position: absolute;
                left: 8px;
                top: 50%;
                right: $text-width;
                transform: translateY(-50%);
                //border: 1px solid red;
              }

              .border-line {
                position: absolute;
                right: $text-width - 20px;
                top: 0;
                display: inline-block;
                width: 1px;
                height: 22px;
                background: #dddddd;
              }

              .right-text {
                position: absolute;
                right: 0;
                left: auto;
                width: $text-width - 30px;

                .cover-percent {
                  display: inline-block;
                  width: 55px;
                  font-size: 14px;
                  color: #555;
                  text-align: right;
                  float: left;
                  //border: 1px solid red;
                  margin-right: 10px;
                  font-weight: bold;
                }

                .domain-count-label {
                  color: #444444;
                }
              }
            }

            .count-number {
              //border: 1px solid red;
              position: absolute;
              right: 20px;
              top: 0;
              width: 50px;
              left: auto;
              text-align: right;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
              font-size: 14px;
              color: #555;
              line-height: 38px;

              .count-sub {
                font-weight: normal;
              }
            }
          }
        }
      }
    }

    .right-detail {
      //border: 1px solid red;
      @include absPos();
      left: auto;
      width: 350px;

      .top-echarts {
        //border: 1px solid red;
        @include absPos();
        bottom: 130px;

        .echarts-outer {
          @include absPos();
          //border: 1px solid red;
        }

        .bottom-count {
          @include absPos();
          height: 130px;
          top: auto;
        }
      }

      .bottom-count {
        //border: 1px solid red;
        @include absPos();
        height: 130px;
        top: auto;
        //border: 1px solid red;
        text-align: center;
        font-size: 0;
        color: #555;
        display: flex;
        flex-direction: column;
        align-items: center;

        .count-item {
          font-size: 12px;
          display: inline-block;
          width: 260px;
          height: 34px;
          background: #f5f5f5;
          border-radius: 17px;
          margin-bottom: 10px;
          line-height: 34px;
          text-align: left;
          //display: flex;
          //align-items: center;
          //justify-content: space-around;
          //vertical-align: middle;

          .label-icon {
            display: inline-block;
            width: 6px;
            height: 6px;
            background: #23d597;
            border-radius: 50%;
            margin: 0 10px 0 16px;

            &.unused-label-icon {
              background: #409eff;
            }
          }

          .count-label {
            //display: inline-block;
            flex-shrink: 0;
            width: 25%;
            margin-right: 25px;
          }

          .count-percent {
            display: inline-block;
            text-align: right;
            width: 40px;
            // margin-right: 40px;
            //border: 1px solid red;
          }

          .count-num {
            display: inline-block;
            text-align: right;
            width: 65px;
            //border: 1px solid red;
          }

          &.used-count {
            margin-top: 25px;
          }
        }
      }
    }
  }

  &.en-page {
    .bottom-container {
      .right-detail {
        //width: 400px;
        .bottom-count {
          .count-item {
            width: 320px;
          }
        }
      }
    }
  }
}
</style>
