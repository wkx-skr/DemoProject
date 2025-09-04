<template>
  <div class="box">
    <div class="detail-cnt" v-for="item in detais" :key="item.label">
      <!-- <div class="label">重点问题</div>
      <div class="num">{{data.allQualityImportantCount}}</div>-->
      <div class="label">{{ item.label }}</div>
      <div class="num">{{ item.value }}</div>
    </div>
  </div>
</template>
<script>
import HTTP from '../ddsHTTP.js'
export default {
  components: {},
  props: {},
  data() {
    return {
      detais: [],
      textInfo: [
        '累计发布接口数量',
        '授权应用组',
        '累计接口调用次数',
        '近一个月接口调用次数',
        '接口调用成功率',
      ],
    }
  },
  mounted() {
    this.getData()
  },
  methods: {
    getData() {
      HTTP.getTopData()
        .then(res => {
          const data = res.data
          this.detais = []
          Object.keys(data).forEach((item, index) => {
            const obj = {}
            obj.label = this.textInfo[index]
            obj.value = data[item]
            this.detais.push(obj)
          })
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
  },
}
</script>

<style scoped lang="scss">
.box {
  width: 100%;
  color: white;
  display: flex;
  justify-content: space-between;
}

.detail-cnt {
  width: 15%;
  height: 60px;
  background-color: #2ec7c9;
  .label {
    text-align: center;
    /* padding-left: 50%; */
    font-weight: bold;
  }
  .num {
    padding-top: 10px;
    padding-left: 50%;
    font-size: 18px;
    font-weight: bold;
  }
}
</style>
