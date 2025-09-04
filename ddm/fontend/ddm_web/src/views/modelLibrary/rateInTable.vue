<template>
  <div class="rate-in-table">
    <datablau-icon :dataType="noRate ? 'no-rate' : 'rate-star'" :size="16" class="rate-icon"></datablau-icon>
    <span class="rate-value">
      <span class="no-rate" v-if="noRate">暂无评分</span>
      <span class="rate-number" v-else>{{Number.parseFloat(rate).toFixed(1)}}</span>
    </span>
  </div>
</template>

<script>
export default {
  name: 'rateInTable',
  data () {
    return {
      // noRate: false
    }
  },
  props: {
    rate: {
      type: [Number, String],
      required: true
    }
  },
  components: {
  },
  computed: {
    noRate () {
      let rate = Number.parseInt(this.rate)
      return rate === 0
    }
  },
  mounted () {
    this.dataInit()
  },
  methods: {
    dataInit () {
      // let rate = Number.parseInt(this.rate)
      // this.noRate = rate === 0
    }
  },
  watch: {
  }
}
</script>

<style lang="scss" scoped>
.rate-in-table {
  display: inline-block;
  vertical-align: top;
  position: relative;
  .rate-icon {
    position: absolute;
    //border: 1px solid red;
    top: 3px;
  }
  .rate-value {
    display: inline-block;
    margin-left: 20px;
    //border: 1px solid red;
    //line-height: 23px;
    vertical-align: top;
    .no-rate {
      color: #999;
    }
  }
}
</style>
