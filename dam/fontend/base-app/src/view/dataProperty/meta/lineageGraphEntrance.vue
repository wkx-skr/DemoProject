<template>
  <div
    class="container"
    :class="{ 'is-report': isReport }"
    @click="hideTableInfoDialog"
    v-loading="drawLoading"
  >
    <el-dialog
      :visible.sync="showDialog"
      top="66px"
      append-to-body
      custom-class="lineage-full-dialog"
      width="90%"
      :close-on-click-modal="false"
      :style="{
        left: appName !== 'DDD' ? '0px' : '200px',
      }"
    >
      <lineage-graph
        v-if="showDialog && loaded"
        :key="graphUpdateKey"
        :raw-data="rawData"
        :options="options"
        :object-id="objectId"
      ></lineage-graph>
    </el-dialog>
    <lineage-graph
      :style="{ top: isReport ? '30px' : '20px' }"
      v-if="loaded"
      :key="graphUpdateKey"
      :raw-data="rawData"
      :options="options"
      :object-id="objectId"
      @show-detail-tabs="showDetailTabs"
    ></lineage-graph>
    <div
      style="position: absolute; top: 0; left: 20px; right: 20px"
      :style="{ top: isReport ? '10px' : '0' }"
      :class="fromPage === 'mapData' ? 'mapData' : ''"
    >
      <focus-switch-button
        v-if="!lineageData"
        :label="$t('meta.DS.tableDetail.lineage.label1')"
        class="switch-like-check"
        :syncValue="showLineage && !showImpact"
        @change="
          () => {
            if (this.drawLoading) return
            this.showImpact = false
            this.showLineage = true
            this.getRawData()
          }
        "
      ></focus-switch-button>
      <focus-switch-button
        v-if="!lineageData && !isReport"
        :label="$t('meta.DS.tableDetail.lineage.impact')"
        class="switch-like-check"
        :syncValue="showImpact && !showLineage"
        @change="
          () => {
            if (this.drawLoading) return
            this.showImpact = true
            this.showLineage = false
            this.getRawData()
          }
        "
      ></focus-switch-button>
      <focus-switch-button
        v-if="!lineageData && !isReport"
        :label="$t('meta.DS.tableDetail.lineage.fullLink1')"
        class="switch-like-check"
        :syncValue="showImpact && showLineage"
        @change="
          () => {
            if (this.drawLoading) return
            this.showImpact = true
            this.showLineage = true
            this.getRawData()
          }
        "
      ></focus-switch-button>
      <el-checkbox
        v-model="options.showColumn"
        @change="updateGraph"
        :style="{ 'margin-left': '20px' }"
      >
        {{ $t('meta.DS.tableDetail.lineage.column') }}
      </el-checkbox>
      <el-checkbox
        v-if="!isReport"
        v-model="options.groupBySchema"
        @change="updateGraph('schema')"
      >
        {{ $t('meta.lineageManage.graph.groupBySchema') }}
      </el-checkbox>
      <el-checkbox
        v-if="!isReport"
        v-model="options.groupByModel"
        @change="updateGraph('model')"
      >
        {{ $t('meta.lineageManage.graph.groupByModel') }}
      </el-checkbox>
      <el-checkbox
        v-if="!isReport"
        v-model="options.groupByCategory"
        @change="updateGraph('category')"
      >
        {{ $t('meta.lineageManage.graph.groupBySystem') }}
      </el-checkbox>
      <span
        v-if="
          $versionFeature['metadata_QualityInfo'] &&
          !isReport &&
          $featureMap.FE_QUALITY
        "
        class="show-label"
        style="margin-left: 20px"
      >
        {{ $t('meta.DS.tableDetail.lineage.qualityRemind') }}
      </span>
      <el-switch
        v-if="
          $versionFeature['metadata_QualityInfo'] &&
          !isReport &&
          $featureMap.FE_QUALITY
        "
        v-model="options.showQuestionCount"
        active-text=""
        inactive-text=""
        @change="toggleQuestionCount"
      ></el-switch>
      <!--元数据血缘不需要-->
      <!--<el-checkbox v-model="options.showMiddleProcess" @change="updateGraph">
        {{ $t('meta.DS.tableDetail.lineage.showAllProcess') }}
      </el-checkbox>-->
      <div style="float: right">
        <datablau-button
          type="secondary"
          @click="exportExcel"
          v-if="!lineageData && !isReport"
          :disabled="!hasLineage"
          style=""
        >
          {{ $t('meta.DS.tableDetail.lineage.exportExcel') }}
        </datablau-button>
        <span
          class="full-screen-btn"
          @click="showFullScreenDialog"
          v-if="showFullScreenBtn"
        >
          <i class="iconfont icon-fangda1"></i>
        </span>
      </div>
    </div>
    <detail-tabs
      @hideDialog="showTableInfo = false"
      v-if="showTableInfo"
      ref="detailTabs"
      :object-id="infoTableId"
    ></detail-tabs>
  </div>
</template>
<script>
import focusSwitchButton from '@/view/dataProperty/meta/focusSwitchButton.vue'
import LineageGraph from '@/next/components/basic/lineage/main/lineageGraph.vue'
import { encodeHtml } from '@/next/utils/XssUtils'
import HTTP from '@/http/main'
import {
  ShapeType,
  StepType,
} from '@/next/components/basic/lineage/types/ShapeType'
import detailTabs from '@/view/dataProperty/meta/lineage/detailTabs.vue'
export default {
  components: {
    LineageGraph,
    focusSwitchButton,
    detailTabs,
  },
  data() {
    return {
      rawData: null,
      loaded: false,
      showDialog: false,
      /*
       * 元数据影响分析、血缘分析等
       */
      showLineage: true,
      showImpact: true,
      /*
        End
       */
      drawLoading: false,
      graphUpdateKey: 0,
      options: {
        showColumn: true,
        showMiddleProcess: true,
        showQuestionCount: false,
      },
      hasLineage: false,
      appName: HTTP.$appName,
      showTableInfo: false,
      infoTableId: null,
    }
  },
  props: {
    objectId: {
      required: true,
      type: [Number, String],
    },
    fromPage: {
      type: String,
    },
    lineageData: {
      required: false,
    },
    showFullScreenBtn: {
      default: true,
    },
    isReport: {
      default: false,
      type: Boolean,
    },
  },
  mounted() {
    this.getRawData()
  },
  methods: {
    focusSelf() {
      this.options.showQuestionCount = true
      this.toggleQuestionCount()
      this.infoTableId = this.objectId
      this.showTableInfo = true
      setTimeout(() => {
        this.$refs.detailTabs.secondTab()
      })
    },
    showDetailTabs(details) {
      if (this.isReport) {
        return
      }
      if (details.stepType == StepType.METRICS) {
        return
      }
      if (details.shapeType === ShapeType.STEP) {
        let objectId = details.id
        if (isNaN(objectId - 0)) {
          objectId = objectId.slice(4)
        }
        this.infoTableId = objectId
        this.showTableInfo = true
      }
    },
    getRawData() {
      if (this.lineageData) {
        this.rawData = JSON.parse(this.lineageData.lineage)
        this.hasLineage =
          this.rawData &&
          this.rawData.lines &&
          Array.isArray(this.rawData.lines) &&
          this.rawData.lines.length > 0
        this.loaded = true
        this.drawLoading = false
        this.updateGraph()
        return
      }
      this.drawLoading = true
      let getData
      if (this.isReport) {
        this.showImpact = false
        getData = HTTP.getReportLineage({ objectId: this.objectId })
      } else {
        let type = 'all'
        if (!this.showImpact && this.showLineage) {
          type = 'left'
        } else if (!this.showLineage && this.showImpact) {
          type = 'right'
        }
        const url = `${this.$meta_url}/lineage/object/${this.objectId}/type?type=${type}`
        getData = this.$http.get(url)
      }
      getData.then(res => {
        this.handleXss(res.data)
        // test code
        // res.data.steps['dam-1000102'].properties.qualityNum = 89
        // res.data.steps['dam-3100114'].properties.qualityNum = 3109
        this.rawData = res.data
        this.hasLineage =
          res.data &&
          res.data.lines &&
          Array.isArray(res.data.lines) &&
          res.data.lines.length > 0
        this.loaded = true
        this.drawLoading = false
        this.updateGraph()
      })
    },
    exportExcel() {
      let type = 'all'
      if (!this.showImpact && this.showLineage) {
        type = 'left'
      } else if (!this.showLineage && this.showImpact) {
        type = 'right'
      }
      const url = `${this.$meta_url}/lineage/excel?objectId=${this.objectId}&type=${type}`
      this.$downloadFile(url)
    },
    handleXss(obj) {
      try {
        Object.values(obj.steps).forEach(step => {
          step.name = encodeHtml(step.name)
        })
      } catch (e) {}
    },
    updateGraph(type) {
      if (type === 'schema') {
        this.options.groupByModel = false
        this.options.groupByCategory = false
      }
      if (type === 'model') {
        this.options.groupBySchema = false
        this.options.groupByCategory = false
      }
      if (type === 'category') {
        this.options.groupByModel = false
        this.options.groupBySchema = false
      }
      this.graphUpdateKey++
    },
    showFullScreenDialog() {
      this.showDialog = true
    },
    hideDialog() {
      this.showDialog = false
    },
    hideTableInfoDialog() {
      setTimeout(() => {
        this.showTableInfo = false
      })
    },
    toggleQuestionCount() {
      if (this.options.showQuestionCount) {
        $('.problem-count').css('display', 'block')
        setTimeout(() => {
          $('.problem-count').css('display', 'block')
        }, 100)
      } else {
        $('.problem-count').css('display', 'none')
      }
    },
  },
}
</script>
<style lang="scss" scoped>
.container {
  position: absolute;
  top: 11px;
  left: 0;
  right: 0;
  bottom: 0;
  &.is-report {
    top: 0;
  }
}
.full-screen-btn {
  display: inline-block;
  width: 30px;
  height: 30px;
  opacity: 0.99;
  border: 1px solid #dddddd;
  border-radius: 50%;
  text-align: center;
  cursor: pointer;
  margin-left: 20px;

  i {
    line-height: 30px;
  }
}
</style>
<style lang="scss">
.mapData {
  min-width: 970px;
}
</style>
