<template>
  <div
    style="
      height: 40px;
      max-width: 128px;
      margin: 0 auto;
      cursor: pointer;
      text-align: center;
    "
    @click="pushDetail"
  ></div>
</template>

<script>
const [MaxHeight, MaxWidth] = [40, 128]
function changeQuote(str) {
  if (typeof str === 'string') {
    return str.replace(/"/g, "'")
  } else {
    return str
  }
}
export default {
  name: 'profileDistribute',
  props: ['data', 'fullData'],
  data() {
    return {
      dialogHtml: '',
      dialogGraphData: [],
    }
  },
  mounted() {
    const type = this.fullData.type
    if (
      type.toUpperCase().indexOf('CHAR') > -1 ||
      type.toUpperCase().indexOf('TEXT') > -1 ||
      type.toUpperCase().indexOf('STR') > -1
    ) {
      this.buildStringDistribution()
    } else if (
      type.toUpperCase().indexOf('INT') > -1 ||
      type.toUpperCase().indexOf('NUMBER') > -1
    ) {
      this.buildNumberDistribution()
    } else if (type.toUpperCase().indexOf('BIT') > -1) {
      this.buildStringDistribution()
    } else if (
      type.toUpperCase().indexOf('DATE') > -1 ||
      type.toUpperCase().indexOf('TIME') > -1
    ) {
      this.buildDateDistribution()
    } else {
      // judge by data
      if (this.data.profilingResult) {
        const sample = this.data.profilingResult.topSamples[0]
        if (typeof sample.minVal === 'number') {
          if (sample.minVal > 100000000000 && sample.minVal < 3000000000000) {
            this.buildDateDistribution()
          } else {
            this.buildNumberDistribution()
          }
        } else if (typeof sample.minVal === 'boolean') {
          this.buildStringDistribution()
        } else if (typeof sample.minVal === 'string') {
          this.buildStringDistribution()
        }
      }
    }
  },
  methods: {
    buildStringDistribution() {
      this.$el.style.background = '#F6F6F6'
      if (this.data.profilingResult) {
        const topSamples = this.data.profilingResult.topSamples
        if (topSamples && topSamples.length > 0) {
          let width = 3
          let max = topSamples[0].count
          topSamples.forEach(item => {
            if (item.count > max) {
              max = item.count
            }
          })
          if (topSamples.length > 16) {
            width = 3
          } else if (topSamples.length > 8) {
            width = 5
          } else if (topSamples.length > 4) {
            width = 10
          } else {
            width = 16
          }
          const rowCount = this.data.profilingResult.rowCount
          topSamples.forEach((item, index) => {
            this.buildPillar({
              width: width,
              height: Math.max((item.count / max) * MaxHeight, 1),
              label: `${changeQuote(item.minVal)},占比${(
                (item.count / rowCount) *
                100
              ).toFixed(2)}%`,
              rowCnt: item.count,
            })
          })
        }
      }
    },
    buildNumberDistribution() {
      this.$el.style.background = '#F6F6F6'
      if (this.data.profilingResult) {
        const topSamples = this.data.profilingResult.topSamples
        if (topSamples && topSamples.length > 0) {
          let width = 3
          let max = topSamples[0].count
          topSamples.forEach(item => {
            if (item.count > max) {
              max = item.count
            }
          })
          if (topSamples.length > 16) {
            width = 3
          } else if (topSamples.length > 8) {
            width = 5
          } else if (topSamples.length > 4) {
            width = 10
          } else {
            width = 16
          }
          const rowCount = this.data.profilingResult.rowCount
          topSamples.forEach((item, index) => {
            if (item.minVal === item.maxVal) {
              this.buildPillar({
                width: width,
                height: Math.max((item.count / max) * MaxHeight, 1),
                label: `${item.minVal},占比${(
                  (item.count / rowCount) *
                  100
                ).toFixed(2)}%`,
                rowCnt: item.count,
              })
            } else {
              this.buildPillar({
                width: width,
                height: Math.max((item.count / max) * MaxHeight, 1),
                label: `${item.minVal}到${item.maxVal},占比${(
                  (item.count / rowCount) *
                  100
                ).toFixed(2)}%`,
                rowCnt: item.count,
              })
            }
          })
        }
      }
    },
    buildDateDistribution() {
      this.$el.style.background = '#F6F6F6'
      if (this.data.profilingResult) {
        const topSamples = this.data.profilingResult.topSamples
        if (topSamples && topSamples.length > 0) {
          let width = 3
          let max = topSamples[0].count
          topSamples.forEach(item => {
            if (item.count > max) {
              max = item.count
            }
          })
          if (topSamples.length > 16) {
            width = 3
          } else if (topSamples.length > 8) {
            width = 5
          } else if (topSamples.length > 4) {
            width = 10
          } else {
            width = 16
          }
          const rowCount = this.data.profilingResult.rowCount
          topSamples.forEach((item, index) => {
            this.buildPillar({
              width: width,
              height: Math.max((item.count / max) * MaxHeight, 1),
              label: `${this.$timeFormatter(item.minVal)}${this.$t(
                'meta.DS.tableDetail.dataQuality.to'
              )}${this.$timeFormatter(item.maxVal)} ,${this.$t(
                'meta.DS.tableDetail.dataQuality.percent'
              )}${((item.count / rowCount) * 100).toFixed(2)}%`,
              rowCnt: item.count,
            })
          })
        }
      }
    },
    buildPillar({ width = 3, height = 50, label = '1', rowCnt } = {}) {
      $(this.$el).append(
        `<div style="width:${width}px;height:${height}px;" class="profile-pillar" title="${label}"></div>`
      )
      // this.dialogHtml += `<div style="width:${width*5}px;height:${height*5}px;" class="profile-pillar large" title="${label}"></div>`;
      {
        const name = label.split(',')[0].trim()
        const rate = Number.parseFloat(
          label.split(this.$t('meta.DS.tableDetail.dataQuality.percent'))[1]
        )
        this.dialogGraphData.push({
          name: name,
          rate: rate,
          rowCnt: rowCnt,
        })
      }
    },
    pushDetail() {
      this.$emit('pushDialog', {
        detail: this.fullData,
        graph: this.dialogGraphData,
      })
    },
  },
}
</script>

<style lang="scss">
.profile-pillar {
  background-color: #4eb6ac;
  margin-right: 1px;
  display: inline-block;
  &:hover {
    background-color: #87cefa;
  }
}
</style>
