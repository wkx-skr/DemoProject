<template>
  <div class="graph-outer" @click="hideDialog">
    <datablau-dialog
      :visible.sync="showProblemDialog"
      append-to-body
      :title="$t('meta.DS.tableDetail.lineage.qualityProblem.problem')"
      width="1000px"
      top="135px"
      custom-class="lineage-quality-dialog"
      size="xl"
    >
      <div class="quality-dialog-container">
        <quality-problem
          :object-id="data.objectId"
          v-if="data && data.objectId"
        ></quality-problem>
      </div>
      <div slot="footer">
        <div class="table-info-footer">
          <datablau-button type="secondary" @click="closeProblemDialog">
            {{ $t('common.button.close') }}
          </datablau-button>
        </div>
      </div>
    </datablau-dialog>
    <div class="top-btn-line">
      <div class="left-btn-group">
        <focus-switch-button
          v-if="!map && !lineageData"
          :label="$t('meta.DS.tableDetail.lineage.label1')"
          class="switch-like-check"
          :syncValue="showLineage && !showImpact"
          @change="
            () => {
              if (this.drawLoading) return
              this.showImpact = false
              this.showLineage = true
              this.getData()
            }
          "
        ></focus-switch-button>
        <focus-switch-button
          v-if="!map && !lineageData && !isReport"
          :label="$t('meta.DS.tableDetail.lineage.impact')"
          class="switch-like-check"
          :syncValue="showImpact && !showLineage"
          @change="
            () => {
              if (this.drawLoading) return
              this.showImpact = true
              this.showLineage = false
              this.getData()
            }
          "
        ></focus-switch-button>
        <focus-switch-button
          v-if="!map && !lineageData && !isReport"
          :label="$t('meta.DS.tableDetail.lineage.fullLink1')"
          class="switch-like-check"
          :syncValue="showImpact && showLineage"
          @change="
            () => {
              if (this.drawLoading) return
              this.showImpact = true
              this.showLineage = true
              this.getData()
            }
          "
        ></focus-switch-button>

        <focus-switch-button
          v-if="lineageData && bound"
          :label="$t('meta.DS.tableDetail.lineage.unbind')"
          class="switch-like-check export-btn"
          @change="
            () => {
              this.unbindSp()
            }
          "
        ></focus-switch-button>
        <focus-switch-button
          v-if="lineageData && !bound"
          :label="$t('meta.DS.tableDetail.lineage.bind')"
          class="switch-like-check export-btn"
          @change="
            () => {
              this.bindLineage()
            }
          "
        ></focus-switch-button>
        <focus-switch-button
          v-if="lineageData"
          :syncValue="false"
          :label="$t('meta.DS.tableDetail.lineage.reAna')"
          style="margin-left: 10px"
          class="switch-like-check export-btn"
          @change="
            () => {
              this.analysize()
            }
          "
        ></focus-switch-button>
      </div>
      <div class="center-btn-group">
        <datablau-input
          :placeholder="$t('meta.DS.tableDetail.lineage.keywordSearch')"
          v-model="param.searchKeyword"
          :iconfont-state="true"
          class="search-input"
          clearable
          :disabled="drawLoading"
        ></datablau-input>
        <el-checkbox
          v-model="param.showModel"
          v-if="!map && !lineageData"
          :disabled="drawLoading"
          @change="
            () => {
              this.drawLoading = true
              // this.param.showModel = !this.param.showModel
              this.getData()
            }
          "
        >
          {{ $t('meta.DS.tableDetail.lineage.database') }}
        </el-checkbox>

        <el-checkbox
          v-model="param.showColumn"
          v-if="!map"
          :disabled="drawLoading"
          @change="
            para => {
              this.drawLoading = true
              // this.param.showColumn = !this.param.showColumn
              this.handleData(para)
            }
          "
        >
          {{ $t('meta.DS.tableDetail.lineage.column') }}
        </el-checkbox>
        <el-checkbox
          v-model="showFullProcess"
          v-show="lineageData"
          :disabled="drawLoading"
          @change="
            para => {
              // this.showFullProcess = !this.showFullProcess
              this.paintGraph(para)
            }
          "
        >
          {{ $t('meta.DS.tableDetail.lineage.showAllProcess') }}
        </el-checkbox>
        <span
          class="quality-show"
          v-if="data.type !== 'REPORT' && !isLogical"
          v-show="!lineageData"
        >
          <span class="show-label">
            {{ $t('meta.DS.tableDetail.lineage.qualityRemind') }}
          </span>
          <el-switch
            v-model="param.showQuestionCount"
            active-text=""
            inactive-text=""
            @change="toggleQuestionCount"
          ></el-switch>
        </span>

        <el-input-number
          v-model="param.scale"
          @change="resizeGraph"
          @blur="blurResize"
          :label="$t('meta.DS.tableDetail.lineage.scale')"
          class="scale-btn"
          :precision="0"
          :step="25"
          :max="950"
          :min="25"
          :key="scaleKey"
        ></el-input-number>
        <span
          class="full-screen-btn"
          @click="showFullScreenDialog"
          v-if="showFullScreenBtn"
        >
          <i class="iconfont icon-fangda1"></i>
        </span>
      </div>
      <div class="right-btn-group" v-if="!lineageData">
        <datablau-button
          type="secondary"
          @click="exportExcel"
          v-if="!lineageData && data.type !== 'REPORT' && data.type !== 'INDEX'"
          :disabled="!hasLineage || drawLoading"
        >
          {{ $t('meta.DS.tableDetail.lineage.exportExcel') }}
        </datablau-button>
        <datablau-button
          type="secondary"
          @click="handleShowProblem"
          v-if="isShowProblem"
        >
          <i class="iconfont icon-wenti"></i>
          {{ $t('meta.DS.tableDetail.lineage.qualityProblem.problem') }}
        </datablau-button>
        <datablau-button
          type="secondary"
          @click="generatePicture"
          v-if="!lineageData && !isIE"
          :disabled="drawLoading"
        >
          <i class="iconfont icon-download"></i>
          {{ $t('meta.DS.tableDetail.lineage.downloadImg') }}
        </datablau-button>
      </div>
    </div>
    <!--:class="{ 'hide-quality-count': !param.showQuestionCount }"-->
    <div class="consa-graphBg" v-clickOutside="clickOutside">
      <div class="lineage-export">
<!--        :class="{ 'to-top': !$isDataAdmin }"-->
        <div
          id="consa-graph"
          class="graph-contain-model"
          v-show="!loading"
          :class="{ 'to-top': true }"
          @click.stop
        ></div>
      </div>
      <div id="graph-outline" v-show="!loading"></div>
    </div>
    <div>
      <screenshots ref="screenshots"></screenshots>
    </div>
    <detail-tabs
      @hideDialog="hideDialog"
      v-if="showTableInfo"
      :object-id="infoTableId"
    ></detail-tabs>
  </div>
</template>
<script>
import _ from 'lodash'
import DrawGraph from '../DrawGraph.js'
// import HTTP from '@/http/main'
import HTTP from '@/dataWarehouse/resource/http.js'
import focusSwitchButton from './focusSwitchButton.vue'
import screenshots from './screenshots'
import qualityProblem from './qualityProblem.vue'
import detailTabs from './detailTabs'
import imageUtils from '@/next/utils/imageUtils.js'
import LDMTypes from '@constant/DAMLDMTypes'
import { encodeHtml } from '@/next/utils/XssUtils'

const isIE = !!window.ActiveXObject || 'ActiveXObject' in window

export default {
  name: 'lineage',
  props: {
    data: Object,
    lineageData: Object,
    from: {
      type: String,
      default: 'default'
    },
    canRealFullscreen: Boolean,
    objectId: {},
    showFullScreenBtn: {
      type: Boolean,
      default: true
    },
    defaultParams: {
      type: Object
    },
    isLogical: {
      type: Boolean,
      default: false
    }
  },
  components: {
    focusSwitchButton,
    screenshots,
    qualityProblem,
    detailTabs
  },
  data () {
    return {
      showFullProcess: false,
      showLineage: true,
      showImpact: true,
      param: {
        showModel: false,
        showMiddleProcess: false,
        showColumn: false,
        meta: true,
        $this: this,
        $This: this,
        originType: '', // 根源节点(当前位置) 类型
        showQuestionCount: false,
        scale: 100,
        searchKeyword: ''
      },
      rawData: {},
      dialogVisible: false,
      loading: true,
      hasLineage: false,
      allRelations: true,
      graphPainter: null,
      map: false,
      fixed: false,
      bound: false,
      checkboxGroup: [],
      showProblemDialog: false,
      showTableInfo: false,
      infoTableId: '',
      iconMap: null,
      scaleKey: 1,
      drawLoading: false, // 渲染中, 禁止点击其他按钮
      isIE
    }
  },
  beforeMount () {
    if (this.defaultParams) {
      this.param = this.defaultParams
    }
  },
  mounted () {
    this.getIconMap()
  },
  beforeDestroy () {
    clearTimeout(this.timeout)
    this.destroyGraph()
  },
  watch: {
    fixed (newVal) {
      this.$emit('resetFullScreen', newVal)
      if (newVal) {
        $('.content-scrollbar-box').css({
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          zIndex: 9
        })
        $('.el-tabs__header').css({
          zIndex: 0
        })
      } else {
        $('.content-scrollbar-box').css({
          position: 'absolute',
          top: 105,
          left: 30,
          right: 20,
          bottom: 20
        })
      }
    },
    showFullProcess () {
      this.paintGraph()
    },
    'param.searchKeyword': {
      handler: function (newVal) {
        this.handlerSearchKeyword(_.trim(newVal))
      }
    }
  },
  methods: {
    // 将 icon 转成 base64
    getIconMap () {
      let iconMap = {}

      let iconArr = [
        {
          url: require('@/assets/images/lineage/system.svg'),
          ext: 'svg',
          type: 'system'
        },
        {
          url: require('@/assets/images/lineage/lineage-schema.svg'),
          ext: 'svg',
          type: 'schema'
        },
        {
          url: require('@/assets/images/lineage/lineage-database.svg'),
          ext: 'png',
          type: 'database'
        },
        {
          url: require('@/assets/images/search/table.svg'),
          ext: 'svg',
          type: 'table'
        },
        {
          url: require('@/assets/images/search/index.svg'),
          ext: 'svg',
          type: 'index'
        },
        {
          url: require('@/assets/images/lineage/lineage-index.svg'),
          ext: 'svg',
          type: 'index2'
        },
        {
          url: require('@/assets/images/lineage/lineage-report.svg'),
          ext: 'svg',
          type: 'report2'
        },
        {
          url: require('@/assets/images/search/report.svg'),
          ext: 'svg',
          type: 'report'
        },
        {
          url: require('@/assets/images/lineage/lineage-file.svg'),
          ext: 'svg',
          type: 'file'
        },
        {
          url: require('@/assets/images/lineage/lineage-location.svg'),
          ext: 'svg',
          type: 'location'
        },
        {
          url: require('@/assets/images/lineage/plus.svg'),
          ext: 'svg',
          type: 'plus'
        },
        {
          url: require('@/assets/images/lineage/minus.svg'),
          ext: 'svg',
          type: 'minus'
        }
      ]
      let getIconArr = []
      iconArr.forEach(item => {
        let getIcon = imageUtils.getUrlBase64(item.url, item.ext)
        getIconArr.push(getIcon)
        getIcon.then(res => {
          iconMap[item.type] = {
            url: item.url,
            base64Url: res,
            type: item.type
          }
        })
      })
      Promise.all(getIconArr)
        .then(res => {
          this.$nextTick(() => {
            this.iconMap = iconMap

            this.dataInit()
          })
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    dataInit () {
      const self = this
      if (this.from === 'map') {
        this.map = true
        $('.graph-outer').css('background-color', '#444')
      }
      if (this.data && this.data.objectId) {
      } else {
        this.param.isTable = true
      }
      this.timeout = setTimeout(() => {
        if (this.data) {
          this.getData()
        } else if (this.lineageData) {
          this.checkIfBound()
          this.rawData = JSON.parse(this.lineageData.lineage)
          this.handleData()
          this.loading = false
        }

        // 禁用缩放按钮的直接编辑功能
        // $('.scale-btn input').attr('readonly', 'readonly')
      }, 0)
    },
    bindLineage () {
      this.$http
        .post(this.$damUrl + `/service/entities/view/${this.objectId}/tables/bind`)
        .then(res => {
          // this.$bus.$emit('reloadTableInView')
          this.$message.success(this.$t('meta.DS.message.bindSucceed'))
          this.bound = true
        })
        .catch(e => {
          this.$showFailure(e)
        })
        .then(() => {})
    },
    unbindSp () {
      this.$http
        .post(this.$damUrl + '/service/lineage/unbind/sp', this.lineageData)
        .then(res => {
          this.$emit('after-unbind')
          this.$message.success(this.$t('meta.DS.message.unbindSucceed'))
          this.bound = false
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    checkIfBound () {
      this.$http
        .get(this.$damUrl + `/service/entities/view/${this.objectId}/tables/bound`)
        .then(res => {
          this.bound = res.data
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    analysize () {
      this.$http
        .post(
          this.$damUrl + `/service/entities/view/${this.objectId}/tables/analysis`
        )
        .then(res => {
          this.$message.success(this.$t('meta.DS.message.reAnalysised'))
          this.$bus.$emit('reloadTableInView')
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    getData () {
      this.param.searchKeyword = ''
      // this.param.scale = 100
      const self = this
      this.loading = true
      if (this.data && !this.data.objectId) {
        return
      }
      let type = 'TABLE'
      let getData = null
      if (this.data && this.data.type) {
        type = this.data.type
      }

      this.param.originType = type

      if (type === 'REPORT') {
        // 报表没有影响分析
        this.showImpact = false
        getData = HTTP.getReportLineage({ objectId: this.data.objectId })
      } else if (type === 'INDEX') {
        // this.showImpact = false
        getData = HTTP.getMetricLineage({ metricId: this.data.objectId })
      } else if (this.lineageData) {
        this.handleData()
      } else {
        let type = 'all'
        if (!this.showImpact && this.showLineage) {
          type = 'left'
        } else if (!this.showLineage && this.showImpact) {
          type = 'right'
        }
        const url = `${this.$damUrl}/service/lineage/object/${this.data.objectId}/type?type=${type}`

        getData = self.$http.get(url)
      }

      if (getData) {
        getData
          .then(res => {
            this.handleXss(res)
            self.rawData = res
            const lines = res.lines
            if (lines && Array.isArray(lines) && lines.length > 0) {
              this.hasLineage = true
            } else {
              this.hasLineage = false
            }
            //        this.param.showModel = true;
            self.handleData()
          })
          .catch(e => {
            this.loading = false
            this.$showFailure(e)
          })
      }
    },
    handleXss (obj) {
      try {
        Object.values(obj.steps).forEach(step => {
          step.name = encodeHtml(step.name)
        })
      } catch (e) {}
    },
    handleData () {
      this.drawLoading = true
      // this.param.scale = 100
      let data
      if (this.lineageData) {
        this.paintGraph()
        // data = JSON.parse(this.lineageData.lineage)
        this.drawLoading = false
      } else {
        data = this.rawData
        if (this.graphPainter) {
          this.graphPainter.destroy()
          this.graphPainter = null
        }
        $('#consa-graph').html('')
        this.loading = false
        if (!this.param.originType) {
          this.param.originType = 'TABLE'
        }
        this.graphPainter = new DrawGraph(
          $('#consa-graph')[0],
          data,
          this.param,
          $('#graph-outline')[0]
        )
        this.graphPainter.start((status, isFinished) => {
          if (isFinished) {
            this.drawLoading = false
          }
        })
      }
    },
    resetFixed () {
      this.fixed = !this.fixed
      if (this.canRealFullscreen) {
        if (this.fixed) {
          this.$fullScreen()
        } else {
          this.$exitFullScreen()
        }
      }
    },
    handleShowProblem () {
      this.showProblemDialog = true
    },
    exportExcel () {
      let type = 'all'
      if (!this.showImpact && this.showLineage) {
        type = 'left'
      } else if (!this.showLineage && this.showImpact) {
        type = 'right'
      }
      const url = `${this.$damUrl}/service/lineage/excel?objectId=${this.data.objectId}&type=${type}`
      this.$downloadFile(url)
      // this.$downloadFile(this.$damUrl + '/service/lineage/excel?objectId=' + this.data.objectId)
    },
    resizeGraph (scale = 100) {
      // console.log(scale, 'scale')
      this.param.scale = scale
      if (this.graphPainter && this.graphPainter.zoomGraph) {
        this.graphPainter.zoomGraph(scale)
      } else if (this.drawGraph && this.drawGraph.zoomGraph) {
        this.drawGraph.zoomGraph(scale)
      }
    },
    blurResize () {
      // console.log(this.param.scale, 'this.param.scale')
      this.scaleKey++
    },
    // handlerSearchKeyword: _.throttle(function (keyword) {
    //   console.log(this.drawGraph, 'this.drawGraph')
    //   if (this.drawGraph && this.drawGraph.searchStep) {
    //     this.drawGraph.searchStep(keyword)
    //   }
    // }, 500),
    handlerSearchKeyword (keyword) {
      if (this.graphPainter && this.graphPainter.searchStep) {
        this.graphPainter.searchStep(keyword)
      } else if (this.drawGraph && this.drawGraph.searchStep) {
        this.drawGraph.searchStep(keyword)
      }
    },

    toggleQuestionCount () {
      if (this.param.showQuestionCount) {
        $('.problem-count').css('display', 'inline-block')
      } else {
        $('.problem-count').css('display', 'none')
      }
    },
    paintGraph (para) {
      const data = _.cloneDeep(JSON.parse(this.lineageData.lineage))
      if (this.showFullProcess) {
        this.param.showMiddleProcess = true
      } else {
        this.prepareIgnoreParsedSteps(data)
      }
      if (!this.param.showMiddleProcess) {
        this.prepareIgnoreMiddleProcessData(data)
      }
      const steps = data.steps
      const lines = data.lines
      data.tLines = []
      const tLines = data.tLines
      const tLinesString = []
      lines.forEach(line => {
        if (!line.source && line.source === '0') {
          line.source = null
        }
        if (!line.target && line.target === '0') {
          line.target = null
        }
        const source = line.sourceStepId
        const target = line.targetStepId
        const str = source + target
        if (tLinesString.indexOf(str) === -1) {
          tLinesString.push(str)
          tLines.push({ source: source, target: target })
        }
      })

      if (this.drawGraph) {
        this.drawGraph.destroy()
      }
      setTimeout(() => {
        this.disableShowColumn = data.properties.$table_lineage === true
        if (this.drawGraph) {
          this.drawGraph.destroy()
        }
        this.drawGraph = null
        this.drawGraph = new DrawGraph($('#consa-graph')[0], data, this.param, $('#graph-outline')[0])
        this.setProgress(this.$t('meta.DS.tableDetail.lineage.drawGraphStart'))
        this.drawGraph.start((progress, finished) => {
          this.setProgress(progress)
          if (finished) {
            this.loading = false
          }
        })
      }, 50)
    },
    setProgress (progress) {
      $('#loading-progress').text(progress)
    },
    prepareIgnoreMiddleProcessData (data) {
      const { steps, lines } = data
      const [finalSteps, finalLines] = [{}, []]
      // find input and output steps.
      const inputOrOutputSteps = new Set()
      for (const stepsKey in steps) {
        if (steps.hasOwnProperty(stepsKey)) {
          const stepsValue = steps[stepsKey]
          if (
            stepsValue.properties.$input_table ||
              stepsValue.properties.$output_table
          ) {
            inputOrOutputSteps.add(stepsKey)
            finalSteps[stepsKey] = stepsValue
          }
        }
      }
      // build lines map.
      const linesMap = new Map()
      lines.forEach(line => {
        const sourceStepId = line.sourceStepId
        if (!linesMap.has(sourceStepId)) {
          linesMap.set(sourceStepId, [])
        }
        linesMap.get(sourceStepId).push(line)
      })
      // foreach input or output steps
      const toString = self => {
        return (
          self.sourceStepId +
            ':' +
            self.source +
            ';' +
            self.targetStepId +
            ':' +
            self.target
        )
      }
      inputOrOutputSteps.forEach(step => {
        const linesMarked = new Set()
        finalSteps[step] = steps[step]
        const findNext = (prevStep, prev, startStepId, paraStart) => {
          if (linesMap.has(prevStep)) {
            linesMap.get(prevStep).forEach(item => {
              if (!startStepId || prevStep === step) {
                // first step
                startStepId = item.sourceStepId
              } else {
              }
              const start = paraStart || item.source
              const itemString = toString(item)
              if (!linesMarked.has(itemString)) {
                if (!prev || prev === item.source) {
                  linesMarked.add(itemString)
                  if (inputOrOutputSteps.has(item.targetStepId)) {
                    finalLines.push({
                      source: start,
                      sourceStepId: startStepId,
                      target: item.target,
                      targetStepId: item.targetStepId
                    })
                  } else {
                    findNext(item.targetStepId, item.target, startStepId, start)
                  }
                }
              }
            })
          }
        }
        findNext(step)
      })
      data.lines = finalLines
      data.steps = finalSteps
    },
    prepareIgnoreParsedSteps (data) {
      const { steps, lines } = data
      const [finalSteps, finalLines] = [{}, []]
      // find input and output steps.
      const inputOrOutputSteps = new Set()
      const parsedSteps = new Set()
      // build source and target step set.
      lines.forEach(item => {
        inputOrOutputSteps.add(item.sourceStepId)
        inputOrOutputSteps.add(item.targetStepId)
      })

      for (const stepsKey in steps) {
        if (steps.hasOwnProperty(stepsKey)) {
          const stepsValue = steps[stepsKey]
          if (!stepsValue.properties.$parsed_step) {
            finalSteps[stepsKey] = stepsValue
          } else {
            parsedSteps.add(stepsKey)
          }
        }
      }
      // build lines map.
      const linesMap = new Map()
      lines.forEach(line => {
        const sourceStepId = line.sourceStepId
        if (!linesMap.has(sourceStepId)) {
          linesMap.set(sourceStepId, [])
        }
        linesMap.get(sourceStepId).push(line)
      })
      // foreach input or output steps
      const toString = self => {
        return (
          self.sourceStepId +
            ':' +
            self.source +
            ';' +
            self.targetStepId +
            ':' +
            self.target
        )
      }
      inputOrOutputSteps.forEach(step => {
        const linesMarked = new Set()
        const findNext = (prevStep, prev, startStepId, paraStart) => {
          if (linesMap.has(prevStep)) {
            linesMap.get(prevStep).forEach(item => {
              if (!startStepId || prevStep === step) {
                // first step
                startStepId = item.sourceStepId
              } else {
              }
              const start = paraStart || item.source
              const itemString = toString(item)
              if (!linesMarked.has(itemString)) {
                if (!prev || prev === item.source) {
                  // linesMarked.add(itemString);
                  if (!parsedSteps.has(item.targetStepId)) {
                    finalLines.push({
                      source: start,
                      sourceStepId: startStepId,
                      target: item.target,
                      targetStepId: item.targetStepId
                    })
                  } else {
                    findNext(item.targetStepId, item.target, startStepId, start)
                  }
                }
              }
            })
          }
        }
        findNext(step)
      })
      data.lines = finalLines
      data.steps = finalSteps
    },
    generatePicture () {
      if (this.$refs.screenshots && this.$refs.screenshots.generate) {
        this.$message.success(this.$t('meta.DS.message.beginCreateImg'))
        this.$refs.screenshots.generate(
          '.consa-graphBg .lineage-export',
          this.$t('meta.DS.tableDetail.lineage.lineageExportImg')
        )
      }
    },
    showFullScreenDialog () {
      this.$emit('showFullScreenDialog', this.param)
    },
    hideDialog () {
      setTimeout(() => {
        this.showTableInfo = false
      })
    },
    showTableInfoTabs (tableId) {
      this.infoTableId = tableId
      this.showTableInfo = true
    },
    closeProblemDialog () {
      this.showProblemDialog = false
    },
    destroyGraph () {
      if (this.graphPainter && this.graphPainter.destroy) {
        this.graphPainter.destroy()
      }
      if (this.drawGraph && this.drawGraph.destroy) {
        this.drawGraph.destroy()
      }
    },
    clickOutside () {
      if (this.graphPainter && this.graphPainter.hideMenu) {
        this.graphPainter.hideMenu()
      }
      if (this.drawGraph && this.drawGraph.hideMenu) {
        this.drawGraph.hideMenu()
      }
    }
  },
  computed: {
    isReport () {
      return !!(this.data && this.data.type && this.data.type === 'REPORT')
    },
    isShowProblem () {
      return (
        this.data &&
          this.data.type &&
          ![
            _.lowerCase(LDMTypes[LDMTypes.Report]),
            _.lowerCase(LDMTypes[LDMTypes.Index])
          ].includes(_.lowerCase(this.data.type))
      )
    }
  }
}
</script>
<style lang="scss" scoped>
  $btn-line-height: 54px;
  .graph-outer {
    padding: 0;
    height: auto;
    /*height:100%;*/
    //background:#FFF;
    background-color: var(--default-bgc);
    /*position:relative;*/
    overflow: visible;
    // border: 1px solid #E0E0E0;
    .split-border {
      display: inline-block;
      border-left: 2px solid #efefef;
      margin: 8px 10px 0;
      vertical-align: top;
      height: 14px;
    }

    .switch-like-check.export-btn {
      display: inline-block;
      vertical-align: top;
      border-color: #409eff;
      color: #409eff;

      &:hover {
        color: #409eff;
        background: #ecf5ff;
        border-color: #4386f5;
      }
    }

    .focus-btn-outer {
      // 消除换行空格
      font-size: 0px;
      display: inline-block;

      .switch-like-check {
        font-size: 12px;
      }
    }

    .top-btn-line {
      //border: 1px solid red;
      height: $btn-line-height;
      box-sizing: border-box;
      // padding-top: 10px;
      text-align: center;

      .left-btn-group {
        float: left;
      }

      .center-btn-group {
        display: inline-block;
        $number-input-height: 30px;
        //border: 1px solid red;
        //min-width: 1000px;

        .search-input {
          width: 240px;
          display: inline-block;
          margin-right: 50px;
        }

        .quality-show {
          .show-label {
            margin-right: 10px;
          }
        }

        .scale-btn {
          //box-sizing: border-box;
          display: inline-block;
          width: 102px;
          height: $number-input-height;
          border-radius: 15px;
          opacity: 0.99;
          border: 1px solid #dddddd;
          margin-left: 20px;

          /deep/ .el-input-number__decrease,
          /deep/ .el-input-number__increase {
            width: 30px;
            height: $number-input-height;
            line-height: 24px;
            background-color: transparent;
            border: none;
          }

          /deep/ .el-input {
            border: none;
            height: $number-input-height;
            line-height: $number-input-height;

            input {
              border: none;
              line-height: $number-input-height;
              height: $number-input-height;
              background-color: transparent;
              width: 100px;
              padding: 0 30px;
              color: #555;
              text-indent: -10px;
            }

            &::after {
              content: ' % ';
              position: absolute;
              right: 32px;
              top: 0;
              font-size: 12px;
              color: #555;
              cursor: default;
            }
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
      }

      .right-btn-group {
        float: right;
        margin-right: 20px;
      }
    }

    .consa-graphBg {
      position: absolute;
      left: 20px;
      top: $btn-line-height;
      right: 20px;
      bottom: 20px;
      background: #f7f7f7;
      overflow: auto;
      padding: 10px;
      //border: 1px solid red;
    }
  }

  .lineage-export {
    padding: 10px;
  }

  #consa-graph {
    position: relative;
    //position: absolute;
    //bottom: 20px;
    //top: 20px;
    //left: 20px;
    //right: 20px;
    overflow: auto;
    //border: 1px solid red;
    //height: 100%;
    //margin-top: 10px;

    &.to-top {
      top: 10px;
    }
  }
  #graph-outline {
    position: absolute;
    height: 200px;
    width: 300px;
    /*top: 100px;*/
    bottom: 10px;
    right: 10px;
    border: 1px solid gray;
    background: #efefef;
    opacity: 0.8;
  }
  #loading-box {
    width: 36px;
    height: 36px;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);

    i {
      font-size: 36px;
    }
  }
</style>

<style lang="scss">
  .switch-like-check .el-checkbox__input.is-disabled + span.el-checkbox__label {
    color: #fafafa;
  }

  .lineage-quality-dialog {
    //.el-dialog__header {
    //  border-bottom: 1px solid #dddddd;
    //}

    .quality-dialog-container {
      height: 55vh;
      overflow: auto;
      //height: 600px;
      //border: 1px solid red;
    }

    .el-dialog__footer {
      padding: 0;
      height: 64px;
      box-shadow: 0px -5px 14px -8px rgba(0, 0, 0, 0.2);
    }

    .table-info-footer {
      //padding: 10px 20px 0 0;
      //text-align: right;
      //border: 1px solid red;
    }
  }

  .svg-col {
    overflow: visible;
  }

  .hide-quality-count {
    .svg-col .problem-count {
      display: none;
      visibility: hidden;
    }
  }
</style>
