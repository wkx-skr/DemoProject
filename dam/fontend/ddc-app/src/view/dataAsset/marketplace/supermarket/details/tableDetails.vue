<template>
  <div class="table-details">
    <div class="content asset-content" v-show="!showLineage">
      <common-top
        ref="commonTop"
        @toLineage="toShowLineage"
        :objectId="objectId"
        :catalogId="catalogId"
        :assetId="assetId"
        :objectType="objectType"
      ></common-top>
      <relate-info
        :objectId="objectId"
        style="min-height: calc(100% - 305px)"
      ></relate-info>
      <!-- <div class="relate-info">
        <datablau-tabs v-model="currentTab" @tab-click="handleTabClick">
          <el-tab-pane label="数据项" name="column">
            <datablau-skeleton :loading="columnLoading" animated>
              <template slot="template">
                <datablau-skeleton-item
                  variant="h1"
                  style="width: 200px; height: 32px; margin-top: 10px"
                ></datablau-skeleton-item>
                <div>
                  <datablau-skeleton-item
                    variant="h1"
                    style="height: 40px; margin-top: 10px"
                  ></datablau-skeleton-item>
                  <datablau-skeleton-item
                    variant="h1"
                    style="height: 40px; margin-top: 10px"
                  ></datablau-skeleton-item>
                  <datablau-skeleton-item
                    variant="h1"
                    style="height: 40px; margin-top: 10px"
                  ></datablau-skeleton-item>
                  <datablau-skeleton-item
                    variant="h1"
                    style="height: 40px; margin-top: 10px"
                  ></datablau-skeleton-item>
                  <datablau-skeleton-item
                    variant="h1"
                    style="height: 40px; margin-top: 10px"
                  ></datablau-skeleton-item>
                  <datablau-skeleton-item
                    variant="h1"
                    style="height: 40px; margin-top: 10px"
                  ></datablau-skeleton-item>
                  <datablau-skeleton-item
                    variant="h1"
                    style="height: 40px; margin-top: 10px"
                  ></datablau-skeleton-item>
                </div>
              </template>
              <template>
                <datablau-input
                  class="column-input"
                  v-model="columnKeyword"
                  :iconfont-state="true"
                  placeholder="搜索"
                  style="margin-top: 10px"
                ></datablau-input>
                <datablau-table
                  v-if="columnList.length && !columnLoading"
                  :data="columnList"
                  :border="false"
                  style="margin-top: 10px"
                >
                  <el-table-column label="" min-width="28px">
                    <template slot-scope="scope">
                      <span v-if="scope.row.isPK">
                        <i
                          class="iconfont icon-score"
                          style="font-size: 22px"
                        ></i>
                      </span>
                    </template>
                  </el-table-column>
                  <el-table-column
                    label="名称"
                    prop="name"
                    min-width="160px"
                  ></el-table-column>
                  <el-table-column
                    label="数据类型"
                    prop="type"
                    min-width="96px"
                  >
                    <template slot-scope="scope">
                      <span
                        class="type-icon iconfont"
                        :class="[scope.row.type]"
                      ></span>
                      <span class="type-text">
                        {{ typeMap[scope.row.type] }}
                      </span>
                    </template>
                  </el-table-column>
                  <el-table-column
                    label="安全等级"
                    prop="securityLevel"
                    min-width="128px"
                  ></el-table-column>
                  <el-table-column label="代码项说明" min-width="240px">
                    <template slot-scope="scope">
                      <datablau-tag
                        v-for="tag in scope.row.codeDesc"
                        :key="tag.name"
                        :class="[tag.type]"
                      >
                        {{ tag.name }}
                      </datablau-tag>
                    </template>
                  </el-table-column>
                  <el-table-column label="非空占比" min-width="70px">
                    <template slot-scope="scope">
                      {{
                        drawNotEmptyEcharts(
                          scope.row.notEmpty,
                          scope.$index,
                          'notEmpty'
                        )
                      }}
                      <div
                        :id="`notEmpty${scope.$index}`"
                        class="not-empty-charts"
                      ></div>
                    </template>
                  </el-table-column>
                  <el-table-column label="值域分布" min-width="120px">
                    <template slot-scope="scope">
                      {{
                        drawDistributionEcharts(
                          scope.row.rangeDistribution,
                          scope.$index,
                          'distribution'
                        )
                      }}
                      <div
                        :id="`distribution${scope.$index}`"
                        class="distribution-charts"
                      ></div>
                    </template>
                  </el-table-column>
                  <el-table-column
                    label="值域"
                    prop="range"
                    min-width="240px"
                    show-overflow-tooltip
                  ></el-table-column>
                  <el-table-column
                    label="备注"
                    prop="remark"
                    min-width="200px"
                    show-overflow-tooltip
                  ></el-table-column>
                </datablau-table>
              </template>
            </datablau-skeleton>
          </el-tab-pane>
          <el-tab-pane label="采样数据" name="sampled">
            <datablau-skeleton :loading="sampledLoading" animated>
              <template slot="template">
                <datablau-skeleton-item
                  variant="text"
                  style="margin-top: 10px; height: 32px; width: 80px"
                ></datablau-skeleton-item>
                <datablau-skeleton-item
                  variant="text"
                  style="
                    margin-top: 10px;
                    height: 32px;
                    width: 150px;
                    margin-left: 16px;
                  "
                ></datablau-skeleton-item>
                <datablau-skeleton-item
                  variant="h1"
                  style="height: 40px; margin-top: 10px"
                ></datablau-skeleton-item>
                <datablau-skeleton-item
                  variant="h1"
                  style="height: 40px; margin-top: 10px"
                ></datablau-skeleton-item>
                <datablau-skeleton-item
                  variant="h1"
                  style="height: 40px; margin-top: 10px"
                ></datablau-skeleton-item>
                <datablau-skeleton-item
                  variant="h1"
                  style="height: 40px; margin-top: 10px"
                ></datablau-skeleton-item>
                <datablau-skeleton-item
                  variant="h1"
                  style="height: 40px; margin-top: 10px"
                ></datablau-skeleton-item>
                <datablau-skeleton-item
                  variant="h1"
                  style="height: 40px; margin-top: 10px"
                ></datablau-skeleton-item>
                <datablau-skeleton-item
                  variant="h1"
                  style="height: 40px; margin-top: 10px"
                ></datablau-skeleton-item>
              </template>
              <template>
                <div style="margin-top: 10px">
                  <datablau-button class="iconfont icon-refresh refresh-btn">
                    更新数据
                  </datablau-button>
                </div>
                <datablau-table
                  :data="sampledData.list"
                  :border="false"
                  style="margin-top: 10px"
                >
                  <el-table-column
                    v-for="column in sampledData.headText"
                    :key="column.prop"
                    :label="column.label"
                    :prop="column.prop"
                  ></el-table-column>
                </datablau-table>
              </template>
            </datablau-skeleton>
          </el-tab-pane>
          <el-tab-pane label="数据洞见" name="insight"></el-tab-pane>
        </datablau-tabs>
      </div> -->
    </div>
    <div
      v-if="showLineage"
      style="
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        width: 100%;
        height: 100%;
        overflow: scroll;
        background-color: #fff;
        z-index: 9999;
      "
    >
      <div
        class="head"
        style="height: 48px; display: flex; align-items: center; width: 100%"
      >
        <datablau-button
          type="text"
          class="iconfont icon-leftarrow"
          style="margin-left: 8px; color: #7c89a8"
          @click="goBack"
        >
          {{ $t('assets.marketplace.backText') }}
        </datablau-button>

        <span
          style="
            margin-left: 16px;
            font-size: 16px;
            font-weight: 500;
            width: calc(100% - 100px);
          "
        >
          {{
            objectType == 'table'
              ? $t('assets.marketplace.lineageAnalysis') + '：'
              : $t('assets.marketplace.lineageRelation') + '：'
          }}
          <span style="display: inline-block; max-width: calc(100% - 100px)">
            <is-show-tooltip
              :content="name"
              style="height: 24px; display: flex"
            ></is-show-tooltip>
          </span>
        </span>
      </div>
      <lineage
        v-if="objectType === 'table'"
        :style="{ top: '48px' }"
        :raw-data="rawData"
        :options="options"
        :object-id="objectId"
        :objectType="objectType.toUpperCase()"
      />
      <div v-else style="padding-left: 20px; padding-right: 20px">
        <lineage-relation :objectId="objectId" :lineageData="lineageData" />
      </div>
    </div>
    <el-backtop
      target=".table-details .content"
      :bottom="10"
      :right="10"
      style="position: fixed"
    >
      <div class="to-top">
        <i class="iconfont icon-uparrow"></i>
      </div>
    </el-backtop>
  </div>
</template>

<script>
import Lineage from '@/next/components/basic/lineage/main/lineageGraph.vue'
import CommonTop from './commonTop.vue'
import RelateInfo from './relateInfo.vue'
import api from '@/view/dataAsset/utils/api'
import isShowTooltip from '@/components/common/isShowTooltip/isShowTooltip.vue'
import LineageRelation from '../lineageRelation/index.vue'
export default {
  name: 'TableDetails',
  components: {
    CommonTop,
    Lineage,
    RelateInfo,
    isShowTooltip,
    LineageRelation,
  },
  data() {
    return {
      objectId: '',
      assetId: '',
      catalogId: '',
      lineageObjectId: null,
      showLineage: false,
      rawData: { lines: [] },
      lineageData: null,
      options: {
        showColumn: true,
        showMiddleProcess: true,
        showQuestionCount: false,
      },
    }
  },
  beforeMount() {},
  mounted() {
    // console.log(this.$route)
    this.objectId = this.$route.query.objectId
    this.assetId = this.$route.query.id
    this.catalogId = String(this.$route.query.catalogId)
    const type = this.$route.query.type
    if (type) {
      this.objectType = String(type)
    } else {
      const routeName = this.$route.name
      if (routeName === 'tableDetails') {
        this.objectType = 'table'
      }
      if (routeName === 'viewDetails') {
        this.objectType = 'view'
      }
    }
    // this.getColumnData()
  },
  methods: {
    toShowLineage(objectId) {
      if (this.objectType === 'view') {
        this.$http
          .get(`/metadata/entities/views/${objectId}/tables`)
          .then(res => {
            this.lineageData = res.data
            this.showLineage = true
          })
      } else {
        // console.log(objectId)
        this.lineageObjectId = objectId
        api
          .getObjectLineageData({
            objectId: this.$route.query.objectId,
            type: 'table',
          })
          .then(res => {
            console.log(res)
            this.rawData = res.data
            this.showLineage = true
          })
      }
    },
    goBack() {
      this.showLineage = false
    },
  },
  computed: {
    name() {
      return this.$refs.commonTop.baseInfo.name
    },
  },
}
</script>

<style lang="scss" scoped>
.table-details {
  width: 100%;
  height: 100%;
  background-color: #f7f8fb;
  .content {
    width: 100%;
    height: 100%;
    overflow: scroll;
    .breadcrumb {
      width: 100%;
      height: 40px;
    }
    .relate-info {
      width: 100%;
      // height: 518px;
      margin-top: 16px;
      background-color: #fff;
      padding: 8px 16px 16px 16px;

      /deep/.datablau-input .el-input--prefix .el-input__inner {
        border-radius: 8px;
      }

      /deep/.db-table .el-table.datablau-table.datablau-table-5dot9 th {
        background-color: #f7f8fb;
        height: 32px;
        border: none;
      }
      /deep/.db-table .el-table__header-wrapper {
        border: none;
      }
      /deep/.el-table thead tr {
        border: none;
      }
      /deep/.el-tab-pane {
        padding: 0;
      }
      .not-empty-charts,
      .distribution-charts {
        height: 48px;
      }
      .refresh-btn {
        border: none;
        background-color: rgba(60, 100, 240, 0.1);
        color: #3c64f0;
        height: 32px;
        border-radius: 4px;
      }
    }
  }
}
.to-top {
  height: 40px;
  width: 40px;
  border-radius: 20px;
  background-color: #fff;
  box-shadow: 0px 4px 20px 0px rgba(67, 102, 225, 0.2);
  text-align: center;
  line-height: 40px;
  color: #3c64f0;
}
</style>
