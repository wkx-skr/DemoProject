<template>
  <div class="datacatelog-outer">
    <div id="container" class="clear-fix datacatalog-dashboard">
      <div class="top-area">
        <el-row :gutter="10" type="flex" justify="space-between">
          <el-col>
            <div
              @click="goPreview('modelCategory')"
              class="grid-content card bg-purple"
              ref="card"
            >
              <div class="cardTop">
                <div class="card-icon">
                  <div class="cardIcon">
                    <i class="icon-business"></i>
                  </div>
                </div>
                <div class="center">
                  <div class="title">
                    {{ $t('common.page.modelCategory') }}
                  </div>
                  <div class="number">
                    {{ dashboardData.modelCategoryCnt | lineageData }}
                  </div>
                </div>
              </div>
              <div class="data">
                <p>
                  {{ $version.dashboard.accessRate }}：
                  <span class="cardData">
                    {{ dashboardData.usedPecent | lineageDataPer }}
                  </span>
                </p>
                <p>
                  {{ $version.dashboard.dataJobs }}：
                  <span class="cardData">
                    {{ dashboardData.lineageCnt | lineageData }}
                  </span>
                </p>
              </div>
            </div>
          </el-col>
          <el-col v-if="topShowItemMap['FE_META']">
            <div
              @click="goPreview('dataSource')"
              class="grid-content card bg-purple"
            >
              <div class="cardTop">
                <div class="card-icon">
                  <div class="cardIcon" style="background-color: #f9785c">
                    <i class="icon-dataSource"></i>
                  </div>
                </div>
                <div class="center">
                  <div class="title">{{ $version.dashboard.dataSource }}</div>
                  <div class="number">
                    {{ dashboardData.modelCnt | lineageData }}
                  </div>
                </div>
              </div>
              <div class="data">
                <p>
                  {{ $version.dataCatalog.table }}：
                  <span class="cardData">
                    {{ dashboardData.tableCnt | lineageData }}
                  </span>
                </p>
                <p>
                  {{ $version.dataCatalog.column }}：
                  <span class="cardData">
                    {{ dashboardData.columnCnt | lineageData }}
                  </span>
                </p>
              </div>
            </div>
          </el-col>
          <el-col v-if="topShowItemMap['FE_MEASURE']">
            <div
              @click="goPreview('reportFormManage')"
              class="grid-content card bg-purple"
            >
              <div class="cardTop">
                <div class="card-icon">
                  <div class="cardIcon" style="background-color: #956bfe">
                    <i class="icon-total"></i>
                  </div>
                </div>
                <div class="center">
                  <div class="title">{{ $version.dashboard.report }}</div>
                  <div class="number">
                    {{ dashboardData.dataReportCnt | lineageData }}
                  </div>
                </div>
              </div>
              <div class="data">
                <p>
                  {{ $t('common.page.glossary') }}：
                  <span class="cardData">
                    {{ dashboardData.namingStandardCnt | lineageData }}
                  </span>
                </p>
                <p>
                  {{ $t('common.page.index') }}：
                  <span class="cardData">
                    {{ dashboardData.meCodeCnt | lineageData }}
                  </span>
                </p>
              </div>
            </div>
          </el-col>
          <el-col v-if="topShowItemMap['tag_count']">
            <div class="grid-content card bg-purple">
              <div class="cardTop">
                <div class="card-icon">
                  <div class="cardIcon" style="background-color: #956bfe">
                    <i class="icon-total"></i>
                  </div>
                </div>
                <div class="center">
                  <div class="title">标签</div>
                  <div class="number">{{ tagCount | lineageData }}</div>
                </div>
              </div>
              <div class="data">
                <p>
                  命名词典：
                  <span class="cardData">
                    {{ dashboardData.namingStandardCnt | lineageData }}
                  </span>
                </p>
                <p>
                  指标体系：
                  <span class="cardData">
                    {{ dashboardData.meCodeCnt | lineageData }}
                  </span>
                </p>
              </div>
            </div>
          </el-col>
          <el-col v-if="topShowItemMap['ddm']">
            <div class="grid-content card bg-purple">
              <div class="cardTop">
                <div class="card-icon">
                  <div class="cardIcon" style="background-color: #2faef3">
                    <i class="icon-model"></i>
                  </div>
                </div>
                <div class="center">
                  <div class="title">数据模型</div>
                  <div class="number">
                    {{ dashboardData.ddmMainModelCnt | lineageData }}
                  </div>
                </div>
              </div>
              <div class="data">
                <p>
                  版本：
                  <span class="cardData">
                    {{ dashboardData.ddmModelCnt | lineageData }}
                  </span>
                </p>
                <p>
                  主题：
                  <span class="cardData">
                    {{ dashboardData.ddmDiagramCnt | lineageData }}
                  </span>
                </p>
              </div>
            </div>
          </el-col>
          <el-col v-if="topShowItemMap['FE_DOMAIN']">
            <div
              @click="goPreview('dataStandard')"
              class="grid-content card bg-purple"
            >
              <div class="cardTop">
                <div class="card-icon">
                  <div class="cardIcon" style="background-color: #2faef3">
                    <i class="icon-model"></i>
                  </div>
                </div>
                <div class="center">
                  <div class="title">{{ $version.dashboard.domain }}</div>
                  <div class="number">
                    {{ dashboardData.domainCnt | lineageData }}
                  </div>
                </div>
              </div>
              <div class="data">
                <p>
                  {{ $t('common.page.code') }}：
                  <span class="cardData">
                    {{ dashboardData.domainCodeCnt | lineageData }}
                  </span>
                </p>
                <p>
                  {{ $version.dashboard.quote }}：
                  <span class="cardData">
                    {{ dashboardData.domainAssignmentCnt | lineageData }}
                  </span>
                </p>
              </div>
            </div>
          </el-col>
          <el-col v-if="topShowItemMap['FE_QUALITY']">
            <div
              @click="goPreview('dataQualityRules')"
              class="grid-content card bg-purple"
            >
              <div class="cardTop">
                <div class="card-icon">
                  <div class="cardIcon" style="background-color: #54d086">
                    <i class="icon-standard"></i>
                  </div>
                </div>
                <div class="center">
                  <div class="title">{{ $version.dashboard.rule }}</div>
                  <div class="number">
                    {{
                      (Number.parseInt(dashboardData.buRuleCnt) +
                        Number.parseInt(dashboardData.techRuleCnt))
                        | lineageData
                    }}
                  </div>
                </div>
              </div>
              <div class="data">
                <p>
                  {{ $version.dashboard.buRule }}：
                  <span class="cardData">
                    {{ dashboardData.buRuleCnt | lineageData }}
                  </span>
                </p>
                <p>
                  {{ $version.dashboard.teRule }}：
                  <span class="cardData">
                    {{ dashboardData.techRuleCnt | lineageData }}
                  </span>
                </p>
              </div>
            </div>
          </el-col>
        </el-row>
        <el-row class="bottom-row" v-show="false"></el-row>
        <el-row
          class="catalog-table-container"
          v-if="!iframeUrl && showType === 'default'"
        >
          <catalog-count-list :getData="getCatalogCount"></catalog-count-list>
        </el-row>
        <el-row class="catalog-table-container" v-else-if="iframeUrl">
          <iframe
            :src="iframeUrl"
            frameborder="0"
            width="100%"
            height="100%"
          ></iframe>
        </el-row>
      </div>
    </div>
  </div>
</template>
<script>
import dataCatalogDashboard from './dataCatalogDashboard.js'
export default dataCatalogDashboard
</script>
<style scoped lang="scss">
@import './dataCatalogDashboard.scss';
</style>
<style lang="scss">
#tagUsageStatistic_graph_container,
#queryStatistics_graph_container {
  position: relative;
  width: 100%;
  height: 500px;
}

.tag-selector {
  position: absolute;
  right: 10px;
  top: 5px;
}
</style>
