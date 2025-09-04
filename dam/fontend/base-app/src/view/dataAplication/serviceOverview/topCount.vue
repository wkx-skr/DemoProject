<template>
  <div class="com-container">
    <div class="top-count-item" v-if="showData">
      <div class="left-vertical">
        <span class="item-label" :title="showData.label">
          {{ showData.label }}
        </span>
      </div>
      <div class="right-vertical">
        <span class="count-number" v-if="showData.type !== 'apiSuccessRate'">
          {{ showData.data | numberFormatter }}
          <span class="unit-box">{{ showData.data | getUint }}</span>
        </span>
        <div class="success-rate-box" v-else>
          <el-progress
            type="circle"
            :percentage="showData.data"
            :width="70"
            :color="successRateColor"
          ></el-progress>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import HTTP from '@/http/main'

export default {
  name: 'topCount',
  data() {
    return {
      dataList: [
        {
          label: '累计发布接口数量',
          type: 'apiCount',
          data: '',
          countName: 'apiReleaseNumber',
        },
        {
          label: '授权应用组',
          type: 'appCount',
          data: '',
          countName: 'authAppNumber',
        },
        {
          label: '累计接口调用次数',
          type: 'apiCall',
          data: '',
          countName: 'apiCallNumber',
        },
        {
          label: '近一个月接口调用次数',
          type: 'apiCallMonth',
          data: '',
          countName: 'apiCallNumberByMonth',
        },
        {
          label: '接口调用成功率',
          type: 'apiSuccessRate',
          data: '',
          countName: 'callSuccessRateNumber',
        },
      ],
      showData: null,
      successRateStatus: '',
      successRateColor: '',
    }
  },
  props: {
    countType: {
      // apiCount appCount apiCall apiCallMonth apiSuccessRate
      type: String,
      default: 'apiCount',
    },
    getDataPromise: {
      type: Promise,
      default() {
        return HTTP.getTopData()
      },
    },
  },
  components: {},
  computed: {},
  mounted() {
    this.dataInit()
  },
  methods: {
    dataInit() {
      this.getDataPromise
        .then(res => {
          const data = res.data
          // data.callSuccessRateNumber = '95%'
          data.callSuccessRateNumber = parseInt(data.callSuccessRateNumber || 0)
          if (data.callSuccessRateNumber > 80) {
            // this.successRateStatus = 'success'
            this.successRateColor = '#66D9BA'
          } else if (
            data.callSuccessRateNumber > 60 &&
            data.callSuccessRateNumber <= 80
          ) {
            // this.successRateStatus = 'exception'
            this.successRateColor = '#e6a23c'
          } else if (data.callSuccessRateNumber <= 60) {
            // this.successRateStatus = 'exception'
            this.successRateColor = '#ff4949'
          }
          this.dataList.forEach(item => {
            item.data = data[item.countName]
            // item.data = 23013056
            if (item.type === this.countType) {
              this.showData = item
            }
          })
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
  },
  watch: {},
  filters: {
    numberFormatter(val) {
      // val = 3000400164
      const missK = val >= 100000
      const missM = val >= 1000000
      let result = ''
      if (!val && val !== 0) {
        return '0'
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
      // 超过 M 才忽略最后
      if (missM) {
        return result.slice(0, -5)
      } else if (missK) {
        return result.slice(0, -1)
      } else {
        return result.slice(0, -1)
      }
      // if (window.lang === 'English') {
      //   return result.slice(0, -1)
      // } else {
      //   return result.slice(0, -1) + ' 个'
      // }
    },
    getUint(val) {
      const missK = val >= 100000
      const missM = val >= 1000000
      if (missM) {
        return 'k'
      } else if (missK) {
        return ''
      } else {
        return ''
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.com-container {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  overflow: auto;
}

.top-count-item {
  //border: 1px solid red;
  position: relative;
  width: 100%;
  height: 100%;
  background-color: #fff;
  box-shadow: 0px 0px 10px rgba(201, 228, 229, 0.14);
  border-radius: 4px;
  //border: 1px solid red;
  // min-width: 260px;

  .left-vertical {
    position: absolute;
    padding-left: 16px;
    color: #7d8493;
    width: 50%;
    font-size: 14px;
    top: 50%;
    transform: translateY(-50%);

    .item-label {
      //border: 1px solid red;
      display: inline-block;
      width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  .right-vertical {
    position: absolute;
    top: 50%;
    right: 0;
    padding-right: 20px;
    transform: translateY(-50%);

    .count-number {
      font-size: 34px;
      line-height: 28px;
      color: #232e43;

      .unit-box {
        font-size: 16px;
        line-height: 16px;
      }
    }

    .success-rate-box {
      width: 70px;
      height: 70px;
      //border: 1px solid red;
    }
  }
}
</style>
