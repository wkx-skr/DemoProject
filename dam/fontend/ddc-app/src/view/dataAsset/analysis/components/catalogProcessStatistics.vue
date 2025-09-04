<template>
  <div
    style="width: 100%; overflow: hidden; padding: 16px; background-color: #fff"
  >
    <div style="background: #fff" class="picBox" v-loading="loading">
      <!--    各个资产类型发布流程转化(catalogProcessStatistics)-->
      <div class="picTil" style="width: 100%">
        <is-show-tooltip
          :content="
            $t('assets.dashboard.statistics') +
            '（' +
            $t('assets.dashboard.weeklyCompare') +
            '）'
          "
          :open-delay="200"
          placement="top"
        >
          <template>
            <span style="color: #555; font-size: 14px; height: 26px">
              {{ $t('assets.dashboard.statistics') }}
            </span>
            <span style="color: #999; font-size: 12px; margin-left: 10px">
              {{ $t('assets.dashboard.weeklyCompare') }}
            </span>
          </template>
        </is-show-tooltip>
      </div>
      <template v-if="tableData">
        <div v-show="tableData.length !== 0" class="tableData">
          <div class="tableDataBox">
            <datablau-table
              :border="false"
              :data="tableData"
              style="width: 100%"
              table-layout="auto"
              height="250px"
            >
              <el-table-column class-name="table-item" width="35px" fixed>
                <template slot-scope="scope">
                  <div class="iconBox alignItem">
                    <div class="textBox">
                      <div :class="typeControl(scope.row.name)">
                        <img
                          src="@/assets/images/dataAssets/file.svg"
                          v-if="
                            scope.row.icon &&
                            scope.row.icon.indexOf('allfile') !== -1
                          "
                          alt=""
                          class="allfile"
                        />
                        <img
                          src="@/assets/images/search/view.svg"
                          v-else-if="
                            scope.row.icon &&
                            scope.row.icon.indexOf('view') !== -1
                          "
                          alt=""
                          class="allfile"
                        />
                        <img
                          src="@/assets/images/search/metamodel.png"
                          v-else-if="
                            scope.row.icon &&
                            scope.row.icon.indexOf('metamodel') !== -1
                          "
                          alt=""
                          class="allfile"
                        />
                        <i :class="scope.row.icon" v-else></i>
                      </div>
                    </div>
                  </div>
                </template>
              </el-table-column>
              <el-table-column
                prop="name"
                :label="$t('assets.dashboard.assetType')"
                class-name="table-item"
                :min-width="80"
                fixed
              ></el-table-column>
              <el-table-column
                prop="name"
                :label="$t('assets.dashboard.assetNum')"
                class-name="table-item asset-num"
                :min-width="150"
              >
                <template slot-scope="scope">
                  <span>{{ scope.row.assetsNums }}</span>
                  <span
                    :class="[
                      'line',
                      {
                        red: scope.row.increment > 0,
                        green: scope.row.increment < 0,
                      },
                    ]"
                  >
                    <i class="el-icon-top" v-if="scope.row.increment > 0"></i>
                    <i
                      class="el-icon-bottom"
                      v-if="scope.row.increment < 0"
                    ></i>
                    {{ scope.row.increment || '--' }}
                  </span>
                </template>
              </el-table-column>
              <el-table-column
                prop="name"
                :label="$t('assets.dashboard.registration')"
                class-name="table-item"
                :min-width="120"
              >
                <template slot-scope="scope">
                  <span>
                    {{ scope.row.registryRatio || '--' }}
                  </span>
                  <span
                    :class="[
                      'line',
                      {
                        red: parseFloat(scope.row.registryRatioIncrement) > 0,
                        green: parseFloat(scope.row.registryRatioIncrement) < 0,
                      },
                    ]"
                  >
                    <i
                      class="el-icon-top"
                      v-if="parseFloat(scope.row.registryRatioIncrement) > 0"
                    ></i>
                    <i
                      class="el-icon-bottom"
                      v-if="parseFloat(scope.row.registryRatioIncrement) < 0"
                    ></i>
                    {{ scope.row.registryRatioIncrement || '--' }}
                  </span>
                </template>
              </el-table-column>
              <el-table-column
                prop="name"
                :label="$t('assets.dashboard.postRate')"
                class-name="table-item"
                :min-width="120"
              >
                <template slot-scope="scope">
                  <span>
                    {{ scope.row.publishRatio || '--' }}
                  </span>
                  <span
                    :class="[
                      'line',
                      {
                        red: parseFloat(scope.row.publishRatioIncrement) > 0,
                        green: parseFloat(scope.row.publishRatioIncrement) < 0,
                      },
                    ]"
                  >
                    <i
                      class="el-icon-top"
                      v-if="parseFloat(scope.row.publishRatioIncrement) > 0"
                    ></i>
                    <i
                      class="el-icon-bottom"
                      v-if="parseFloat(scope.row.publishRatioIncrement) < 0"
                    ></i>
                    {{ scope.row.publishRatioIncrement || '--' }}
                  </span>
                </template>
              </el-table-column>
              <el-table-column
                prop="name"
                :label="$t('assets.dashboard.downlineRate')"
                class-name="table-item"
                :min-width="130"
              >
                <template slot-scope="scope">
                  <span>
                    {{ scope.row.offlineRatio || '--' }}
                  </span>
                  <span
                    :class="[
                      'line',
                      {
                        red: parseFloat(scope.row.offlineRatioIncrement) > 0,
                        green: parseFloat(scope.row.offlineRatioIncrement) < 0,
                      },
                    ]"
                  >
                    <i
                      class="el-icon-top"
                      v-if="parseFloat(scope.row.offlineRatioIncrement) > 0"
                    ></i>
                    <i
                      class="el-icon-bottom"
                      v-if="parseFloat(scope.row.offlineRatioIncrement) < 0"
                    ></i>
                    {{ scope.row.offlineRatioIncrement || '--' }}
                  </span>
                </template>
              </el-table-column>
            </datablau-table>
          </div>
        </div>

        <div class="nodata" v-show="!loading && tableData.length === 0">
          <div class="noresults">
            <div class="noresult-img">
              <img src="@/assets/images/search/no-result.svg" alt="" />
              <p>
                {{ $t('assets.dashboard.noData') }}
              </p>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
import HTTP from '../../utils/api'
import { AssetsTypeEnum } from '@/view/dataAsset/utils/Enum'
import isShowTooltip from '@/components/common/isShowTooltip/isShowTooltip.vue'
export default {
  name: 'catalogProcessStatistics',
  components: { isShowTooltip },
  data() {
    return {
      tableData: null,
      list: [
        {
          name: this.$t('assets.generalSettings.object'),
          icon: 'iconfont icon-ziduan ziduan',
          assetsType: AssetsTypeEnum.DATA_OBJECT,
          assetsNums: '-',
          increment: '-',
          registryRatio: '-',
          registryRatioIncrement: '-',
          publishRatio: '-',
          publishRatioIncrement: '-',
          offlineRatio: '-',
          offlineRatioIncrement: '-',
        },
        {
          name: this.$t('assets.generalSettings.view'),
          icon: 'view',
          assetsType: AssetsTypeEnum.VIEW,
          assetsNums: '-',
          increment: '-',
          registryRatio: '-',
          registryRatioIncrement: '-',
          publishRatio: '-',
          publishRatioIncrement: '-',
          offlineRatio: '-',
          offlineRatioIncrement: '-',
        },
        {
          name: this.$t('assets.generalSettings.table'),
          icon: 'iconfont icon-biao biao',
          assetsType: AssetsTypeEnum.TABLE,
          assetsNums: '-',
          increment: '-',
          registryRatio: '-',
          registryRatioIncrement: '-',
          publishRatio: '-',
          publishRatioIncrement: '-',
          offlineRatio: '-',
          offlineRatioIncrement: '-',
        },
        {
          name: this.$t('assets.generalSettings.basicStandard'),
          icon: 'iconfont icon-biaozhun biaozhun',
          assetsType: AssetsTypeEnum.DATA_STANDARD,
          assetsNums: '-',
          increment: '-',
          registryRatio: '-',
          registryRatioIncrement: '-',
          publishRatio: '-',
          publishRatioIncrement: '-',
          offlineRatio: '-',
          offlineRatioIncrement: '-',
        },
        {
          name: this.$t('assets.generalSettings.standardCode'),
          icon: 'iconfont icon-daima biaozhun',
          assetsType: AssetsTypeEnum.DATA_STANDARD_CODE,
          assetsNums: '-',
          increment: '-',
          registryRatio: '-',
          registryRatioIncrement: '-',
          publishRatio: '-',
          publishRatioIncrement: '-',
          offlineRatio: '-',
          offlineRatioIncrement: '-',
        },
        {
          name: this.$t('assets.generalSettings.index'),
          icon: 'iconfont icon-zhibiao zhibiao',
          assetsType: AssetsTypeEnum.INDEX,
          assetsNums: '-',
          increment: '-',
          registryRatio: '-',
          registryRatioIncrement: '-',
          publishRatio: '-',
          publishRatioIncrement: '-',
          offlineRatio: '-',
          offlineRatioIncrement: '-',
        },
        this.$versionFeature.dataasset_CatalogType
          ? {
              name: this.$t('assets.generalSettings.report'),
              icon: 'iconfont icon-baobiao baobiao',
              assetsType: AssetsTypeEnum.REPORT,
              assetsNums: '-',
              increment: '-',
              registryRatio: '-',
              registryRatioIncrement: '-',
              publishRatio: '-',
              publishRatioIncrement: '-',
              offlineRatio: '-',
              offlineRatioIncrement: '-',
            }
          : null,

        this.$versionFeature.dataasset_CatalogType
          ? {
              name: this.$t('assets.generalSettings.file'),
              icon: 'allfile',
              assetsType: AssetsTypeEnum.FILE,
              assetsNums: '-',
              increment: '-',
              registryRatio: '-',
              registryRatioIncrement: '-',
              publishRatio: '-',
              publishRatioIncrement: '-',
              offlineRatio: '-',
              offlineRatioIncrement: '-',
            }
          : null,
        {
          name: '自定义对象',
          icon: 'metamodel',
          assetsType: AssetsTypeEnum.META_MODEL,
          assetsNums: '-',
          increment: '-',
          registryRatio: '-',
          registryRatioIncrement: '-',
          publishRatio: '-',
          publishRatioIncrement: '-',
          offlineRatio: '-',
          offlineRatioIncrement: '-',
        },
      ].filter(item => !!item),
      structureIdChange: this.$store.state.structureIdChange,
      loading: true,
    }
  },
  watch: {
    '$store.state.structureIdChange': {
      handler: function (val, oldVal) {
        val && this.transformation(val)
      },
    },
  },
  methods: {
    typeControl(val) {
      switch (val) {
        case this.$t('assets.generalSettings.table'):
          return 'dataSet'
        case this.$t('assets.generalSettings.view'):
          return 'view'
        case this.$t('assets.generalSettings.object'):
          return 'dataItem'
        case this.$t('assets.generalSettings.basicStandard'):
          return 'dataStandard'
        case this.$t('assets.generalSettings.standardCode'):
          return 'daima'
        case this.$t('assets.generalSettings.index'):
          return 'index'
        case this.$t('assets.generalSettings.report'):
          return 'report'
        case this.$t('assets.generalSettings.file'):
          return 'fileBox'
        case '自定义对象':
          return 'metamodel'
      }
    },
    getName(val) {
      switch (val) {
        case AssetsTypeEnum.DATA_OBJECT:
          return {
            name: this.$t('assets.generalSettings.object'),
            class: 'iconfont icon-ziduan ziduan',
          }
        case AssetsTypeEnum.TABLE:
          return {
            name: this.$t('assets.generalSettings.table'),
            class: 'iconfont icon-biao biao',
          }
        case AssetsTypeEnum.VIEW:
          return {
            name: this.$t('assets.generalSettings.view'),
            class: 'view',
          }
        case AssetsTypeEnum.DATA_STANDARD:
          return {
            name: this.$t('assets.generalSettings.basicStandard'),
            class: 'iconfont icon-biaozhun biaozhun',
          }
        case AssetsTypeEnum.DATA_STANDARD_CODE:
          return {
            name: this.$t('assets.generalSettings.standardCode'),
            class: 'iconfont icon-daima biaozhun',
          }
        case AssetsTypeEnum.INDEX:
          return {
            name: this.$t('assets.generalSettings.index'),
            class: 'iconfont icon-zhibiao zhibiao',
          }
        case AssetsTypeEnum.REPORT:
          return {
            name: this.$t('assets.generalSettings.report'),
            class: 'iconfont icon-baobiao baobiao',
          }
        case AssetsTypeEnum.FILE:
          return {
            name: this.$t('assets.generalSettings.file'),
            class: 'allfile',
          }
      }
    },
    transformation(id) {
      this.loading = true
      this.tableData = _.cloneDeep(this.list)
      id &&
        HTTP.transformation(id)
          .then(res => {
            res.data.data.forEach(item => {
              item.name = this.getName(item.assetsType).name
              item.icon = this.getName(item.assetsType).class
              let num = this.getIndex(item.assetsType)
              this.tableData.splice(num, 1, item)
            })
            this.loading = false
          })
          .catch(e => {
            this.$showFailure(e)
            this.loading = false
          })
    },
    getIndex(type) {
      let num = -1
      for (let i = 0; i < this.tableData.length; i++) {
        if (this.tableData[i].assetsType === type) {
          num = i
          break
        }
      }
      return num
    },
  },
  mounted() {
    if (this.$store.state.structureIdChange) {
      this.transformation(this.$store.state.structureIdChange)
    } else {
      this.loading = false
      this.tableData = []
    }
  },
}
</script>

<style scoped lang="scss">
.picBox {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  // overflow-x: scroll;

  .tableData {
    flex: 1;
    display: flex;
    flex-direction: column;
    height: 90%;
    // overflow-x: scroll;
    width: 100%;
  }
  .tableDataBox {
    width: 100%;
    // min-width: 500px;
    /deep/.el-table.datablau-table td.asset-num {
      text-align: center;
      white-space: nowrap;
      .cell {
        text-align: center;
        white-space: nowrap;
      }
    }
    .table-item {
      padding-top: 3px;
      padding-bottom: 3px;
      height: 17%;
      border-bottom: 1px solid #efefef;
      flex: 1;
      &:last-child {
        border: 0;
      }
      & > div {
        width: 88px;
        display: flex;
        align-items: center;
      }
      & > div:nth-child(1) {
        width: 98px;
        white-space: nowrap;
      }
      span {
        display: inline-block;
        min-width: 38px;
        white-space: nowrap;
      }
      span:nth-child(1) {
        text-align: right;
      }
      .line {
        text-align: left;
        margin-left: 10px;
        padding-left: 8px;
        position: relative;
        &::after {
          content: '';
          position: absolute;
          display: block;
          width: 1px;
          height: 10px;
          top: 8px;
          left: 0;
          border-left: 1px solid #ddd;
        }
        &.red {
          color: #ff3233;
        }
        &.green {
          color: #06ac62;
        }
      }
    }
  }
}
.picTil {
  color: #555;
  font-size: 14px;
  span {
    color: #999;
    font-size: 12px;
    margin-left: 10px;
  }
}

.flex {
  display: flex;
  justify-content: space-between;
}
.tableTop {
  background: #f5f5f5;
  font-size: 12px;
  margin-top: 3px;
  line-height: 30px;
  padding-left: 38px;
  padding-right: 22px;
  height: 30px;
  & > div {
    white-space: nowrap;
  }
}
.con {
  padding-left: 36px;
  flex: 1;
  /*display: flex;*/

  /*overflow: scroll;*/
  /*flex-direction: column;*/
}
.alignItem {
  display: flex;
  align-items: center;
}
.iconBox {
  margin-left: 1px;
  .textBox {
    width: 80px;
    position: static;
    left: 0;
    /deep/ & > div {
      margin-right: 10px;
      width: 26px;
      height: 26px;
      border-radius: 26px;
      text-align: center;
      line-height: 26px;
      display: inline-block;
    }
  }
}
.dataSet {
  background: rgba(50, 149, 248, 0.1);
  i {
    color: #3295f8;
  }
}
.dataItem {
  background: rgba(196, 74, 209, 0.1);
  i {
    color: #c44ad1;
  }
}
.dataStandard {
  background: rgba(56, 180, 139, 0.1);
  i {
    color: #38b48b;
  }
}

.daima {
  background: rgba(157, 91, 139, 0.1);
}

.index {
  background: rgba(209, 175, 62, 0.1);

  i {
    color: #d1af3e;
  }
}

.metamodel {
  background: rgba(209, 175, 62, 0.1);

  i {
    color: #d1af3e;
  }
}

.report {
  background: rgba(0, 136, 153, 0.1);

  i {
    color: #008899;
  }
}

.fileBox {
  img {
    position: relative;
    top: -1px;
  }
  background: rgba(50, 149, 248, 0.1);
}
.view {
  img {
    position: relative;
    top: -1px;
  }
  background: rgba(75, 92, 196, 0.1);
}
.nodata {
  display: flex;
  align-items: center;
  width: 100%;
  height: 100%;
}
.noresults {
  margin: 20px auto 0;
  text-align: center;
  .noresult-img {
    flex-direction: column;
  }
  p {
    display: block;
  }
}
.allfile {
  width: 16px;
}
</style>
