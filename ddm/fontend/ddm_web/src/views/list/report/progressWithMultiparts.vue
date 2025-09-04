<template>
  <div class="progress-container" :class="{'show-last-per': showLastPer}" ref="container">
    <div class="item" v-for="(item, index) in readyData" :key="index" :class="item.eName">
      <el-tooltip effect="light" :content="item.name + '：' + value2percent(item.value) + '%'" placement="top-start" v-if="!(!showLastPer && index === readyData.length-1)">
        <div class="inner-box">
          <span class="per-value">{{value2percent(item.value)}}%</span>
        </div>
      </el-tooltip>
    </div>
  </div>
</template>

<script>
import $ from 'jquery'
export default {
  data () {
    return {
      readyData: [],
      defaultColorArray: ['#4278C9', '#EBF1FA', '#42C995', '#F46565', '#F5DC71', '#9571F5']
    }
  },
  props: {
    percentData: {
      type: Array,
      required: true
      // {
      //   name: '',
      //   value: ''
      // }
    },
    dataType: {
      // 传入数据是 总数还是 百分比
      tyep: String,
      default: 'percent' /** count */
    },
    totalCount: {
      tyep: [Number, String]
    },
    colorArray: {
      type: Array
    },
    showLastPer: {
      type: Boolean,
      default: false
    }
  },
  components: {

  },
  computed: {

  },
  mounted () {
    this.dataInit()
    // this.resetStyle();
    // if (this.showLastPer)
  },
  methods: {
    dataInit () {
      if (this.dataType === 'count') {
        let total = 0
        if (this.totalCount) {
          total = this.totalCount - 0
          if (isNaN(total)) {
            total = parseFloat(this.totalCount)
          }
        } else {
          this.percentData.forEach(item => {
            let num = item.value - 0
            if (isNaN(num)) {
              num = parseFloat(item.value)
            }
            total += num
          })
        }
        let arr = []
        this.percentData.forEach(item => {
          let obj = {
            value: item.value / total,
            name: item.name,
            eName: item.eName
          }
          if (total === 0) {
            obj.value = 0
          }
          arr.push(obj)
        })
        this.readyData = arr
      } else {
        this.readyData = this.percentData
      }
      this.resetStyle()
    },
    resetStyle () {
      let colorArray = []
      if (this.colorArray && this.colorArray.length > 0) {
        colorArray = this.colorArray
      } else {
        colorArray = this.defaultColorArray
      }
      this.readyData.forEach((item, index) => {
        let color = ''
        let colorIndex = index
        while (!colorArray[colorIndex] && colorIndex > 0) {
          colorIndex = colorIndex - colorArray.length
        }
        color = colorArray[colorIndex] || '#EBEEF5'
        const $container = $(this.$refs.container)
        let className = '.' + item.eName
        this.$nextTick(() => {
          const $targetDom = $container.find(className)
          if (this.dataType === 'percent') {
            $targetDom.css({
              width: item.value + '%',
              'background-color': color
            })
          } else {
            $targetDom.css({
              width: parseInt(item.value * 10000) / 100 + '%',
              'background-color': color
            })
          }

          this.$nextTick(() => {
            let width = $targetDom.innerWidth()
            if (width < 40) {
              $targetDom.addClass('color-transparent')
            }
          })
        })
      })
    },
    value2percent (value) {
      if (isNaN(value)) {
        value = 0
      }
      let minus = false
      if (value < 0) {
        value *= (-1)
        minus = true
      }
      let result = 0
      let times = 4
      result = value * 10000
      while (parseInt(result) === 0 && times < 6) {
        times++
        result = value * Math.pow(10, times)
      }
      result = parseInt(result) / Math.pow(10, times)
      if (minus) {
        result *= (-1)
      }
      if (this.dataType === 'count') {
        result *= 100
      }
      result = result.toFixed((times - 2))
      if (isNaN(result)) {
        result = 0
      }
      return result
    }
  },
  watch: {
    percentData: {
      handler: function () {
        this.dataInit()
      },
      deep: true
    }
  }
}
</script>

<style lang="scss" scpoed>
.progress-container {
  width: 100%;
  height: 20px;
  overflow: hidden;
  background-color: #EBEEF5;
  .item {
    display: inline-block;
    height: 100%;
    vertical-align: top;
    text-align: center;
    line-height: 20px;
    overflow: hidden;
    .inner-box {
      display: inline-block;
      width: 100%;
      height: 100%;
      color: #fff;
    }
    &.color-transparent {
      .inner-box {
        color: transparent;
        font-size: 0;
      }
    }
  }
  &.show-last-per {
    .item {
      .inner-box {
        display: none;
        .per-value {
          color: rgba(0,0,0,0)
        }
      }
      &:first-child {
        .inner-box {
          display: inline-block;
          .per-value {
            color: #fff;
          }
        }
      }
    }
  }
}

</style>
